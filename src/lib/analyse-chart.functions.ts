import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider } from "./ai-gateway.server";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6 MB decoded cap

const Input = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/")
    .max(Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 100, "Image payload too large"),
  notes: z.string().max(500).optional(),
});

// Restrict the AI endpoint to first-party origins so third-party sites cannot
// drain LOVABLE_API_KEY credits by calling our handler from their pages.
function assertTrustedOrigin() {
  let origin = "";
  try {
    const req = getRequest();
    origin = req.headers.get("origin") || req.headers.get("referer") || "";
  } catch {
    return; // SSR-internal invocation — no request context, allow.
  }
  if (!origin) return;
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    throw new Error("Forbidden origin");
  }
  const allowed = 
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "chainforge.org.zw" ||
  host.endsWith(".lovable.app");
  if (!allowed) throw new Error("Forbidden origin");
}

export const analyseChart = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    assertTrustedOrigin();
    const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Missing GEMINI_API_KEY");
const gateway = createGeminiProvider(key);
const system = `
You are ChainForge AI, a professional forex analyst.

Analyse the uploaded chart screenshot using:

- Market Structure
- Liquidity
- Supply and Demand
- ICT Concepts
- Support and Resistance

Return ONLY:

📊 Instrument & Timeframe

🧭 Market Structure

🎯 Key Levels

📈 Bias
(Direction + Confidence %)

🎬 Trade Plan
Entry:
Stop Loss:
TP1:
TP2:

⚠️ Invalidation

💡 Notes


Be specific with price levels if visible. Keep total under 250 words. No disclaimers.`;

 const messages = [
  { role: "system" as const, content: system },
  {
    role: "user" as const,
    content: [
      {
        type: "text" as const,
        text: data.notes
          ? `Analyse this chart. Trader notes: ${data.notes}`
          : "Analyse this chart.",
      },
      {
        type: "image" as const,
        image: data.imageDataUrl,
      },
    ],
  },
];

let analysis = "";
let lastError: unknown = null;

const models = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

for (const modelName of models) {
  try {
    console.log(`Trying model: ${modelName}`);

    const result = await generateText({
      model: gateway(modelName),
      messages,
      maxRetries: 3,
    });

    analysis = result.text;

    console.log(`Success using ${modelName}`);

    break;
  } catch (error) {
    lastError = error;

    console.error(`Failed using ${modelName}:`, error);

    continue;
  }
}

if (!analysis) {
  console.error("All Gemini models failed:", lastError);

  throw new Error(
    "Chart analysis service is temporarily unavailable. Please try again in a few moments."
  );
}

return {
  analysis,
};

    return { analysis };
  });
