import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateText } from "ai";
import { z } from "zod";
import { createOpenRouterProvider } from "./ai-gateway.server";

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
    const key = process.env.OPENROUTER_API_KEY;

if (!key) {
  throw new Error("Missing OPENROUTER_API_KEY");
}

const gateway = createOpenRouterProvider(key);
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
  {
    role: "user" as const,
    content: [
      {
        type: "text" as const,
        text: `${system}\n\nAnalyse this chart. ${
          data.notes ? `Trader notes: ${data.notes}` : ""
        }`,
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
  "qwen/qwen2.5-vl-72b-instruct:free",
  "qwen/qwen2.5-vl-32b-instruct",
  "google/gemini-1.5-flash",
];



for (const modelName of models) {
  try {
    console.log(`Trying ${modelName}`);

    const result = await generateText({
      model: gateway(modelName),
      messages,
      maxRetries: 2,
    });

    analysis = result.text;

    console.log(`Success with ${modelName}`);

    break;
  } catch (error) {
    lastError = error;

    console.error(`Failed ${modelName}`, error);
  }
}

if (!analysis) {
  throw new Error(
    `All AI models failed. ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}

return {
  analysis,
};
  });
