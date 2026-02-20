// api/ai/chat.js — Vercel Edge Function (streaming AI tutor)
import OpenAI from "openai";

export const config = { runtime: "edge" };

async function verifyToken(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;

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