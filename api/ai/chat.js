// ============================================================
// api/ai/chat.js  — Vercel Edge Function (streaming AI tutor)
// ============================================================
import OpenAI from "openai";

export const config = { runtime: "edge" };

// Firebase Admin verification inline (edge-compatible)
async function verifyToken(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;

  // Verify with Firebase REST API (edge-compatible, no Admin SDK needed)
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.users?.[0] || null;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const firebaseUser = await verifyToken(req);
  if (!firebaseUser) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { messages, scenario, userLevel = 1 } = await req.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are "Manman Kreyol", a warm and encouraging Haitian Creole (Kreyòl ayisyen) language tutor.
The student is level ${userLevel} (${userLevel <= 3 ? "beginner" : userLevel <= 7 ? "intermediate" : "advanced"}).

RULES:
1. Respond primarily in Haitian Creole with English help when needed
2. Gently correct mistakes using: "✓ Ou ta ka di: [correct form]" (You could say:)  
3. Keep responses short and conversational (2-4 sentences)
4. Be warm — use "Trè byen!" (Very good!) or "Bon travay!" (Good work!)
5. If student writes in English, show them the Creole translation
6. NEVER be discouraging

SCENARIO: ${scenario || "General Haitian Creole conversation practice"}`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
    max_tokens: 400,
    temperature: 0.7,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}


// ============================================================
// api/stripe/create-checkout.js
// ============================================================
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Verify Firebase token
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) }
  );
  if (!verifyRes.ok) return res.status(401).json({ error: "Unauthorized" });
  const { users } = await verifyRes.json();
  const firebaseUser = users?.[0];
  if (!firebaseUser) return res.status(401).json({ error: "Unauthorized" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { priceId, successUrl, cancelUrl } = req.body;

  const VALID_PRICES = [
    process.env.STRIPE_MONTHLY_PRICE_ID,
    process.env.STRIPE_YEARLY_PRICE_ID,
  ].filter(Boolean);

  if (!VALID_PRICES.includes(priceId)) {
    return res.status(400).json({ error: "Invalid price ID" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { uid: firebaseUser.localId },
      customer_email: firebaseUser.email,
      success_url: successUrl || `${req.headers.origin}`,
      cancel_url: cancelUrl || `${req.headers.origin}`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// ============================================================
// api/stripe/webhook.js  — Updates Firestore after payment
// ============================================================
import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const db = getFirestore();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    if (uid) {
      await db.collection("users").doc(uid).update({
        "subscription.status": "active",
        "subscription.plan": "premium",
        "subscription.stripeCustomerId": session.customer,
        "subscription.updatedAt": new Date(),
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const uid = sub.metadata?.uid;
    if (uid) {
      await db.collection("users").doc(uid).update({
        "subscription.status": "cancelled",
        "subscription.updatedAt": new Date(),
      });
    }
  }

  res.json({ received: true });
}


// ============================================================
// UPDATED package.json
// Run: npm install react-router-dom openai stripe firebase-admin
// (react-router-dom not needed since you use currentView state)
// Just run:  npm install openai stripe firebase-admin
// ============================================================
/*
Add these to your existing dependencies:
  "openai": "^4.52.0",
  "stripe": "^16.2.0",
  "firebase-admin": "^12.3.0"

Run:
  npm install openai stripe firebase-admin
*/


// ============================================================
// vercel.json  — put this in your project ROOT
// ============================================================
/*
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/ai/chat.js": { "maxDuration": 30 },
    "api/stripe/webhook.js": { "maxDuration": 10 },
    "api/stripe/create-checkout.js": { "maxDuration": 10 }
  }
}
*/


// ============================================================
// .env  — ADD these to your existing .env file
// (Keep all your existing VITE_FIREBASE_* vars)
// ============================================================
/*
# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (server-side only — no VITE_ prefix)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Stripe (client-side — with VITE_ prefix)
VITE_STRIPE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_YEARLY_PRICE_ID=price_...

# Firebase Admin (server-side only — for webhook)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
*/
