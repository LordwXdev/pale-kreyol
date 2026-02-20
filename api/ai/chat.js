// api/ai/chat.js — Vercel Serverless Function (Node.js runtime)
// Uses fetch directly instead of openai SDK — fully edge/serverless compatible

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify Firebase token
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!verifyRes.ok) return res.status(401).json({ error: "Unauthorized" });
    const verifyData = await verifyRes.json();
    if (!verifyData.users?.[0]) return res.status(401).json({ error: "Unauthorized" });
  } catch {
    return res.status(401).json({ error: "Token verification failed" });
  }

  const { messages, scenario, userLevel = 1 } = req.body;

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

  // Stream from OpenAI using fetch
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.json();
    return res.status(500).json({ error: err.error?.message || "OpenAI error" });
  }

  // Stream SSE back to client
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const reader = openaiRes.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.replace("data: ", "");
        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          break;
        }
        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content || "";
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    res.end();
  }
}