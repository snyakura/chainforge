import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are ChainForge AI, an elite multi-timeframe market analyst. Analyse the uploaded trading chart screenshot and return a concise, structured breakdown with these sections, each prefixed by its emoji header on its own line:

📊 Instrument & Timeframe
🧭 Market Structure
🎯 Key Levels (support / resistance / liquidity)
📈 Bias (bullish / bearish / neutral + confidence 0-100)
🎬 Trade Plan (entry, stop loss, take profit 1, take profit 2)
⚠️ Invalidation
💡 Notes

Be specific with price levels if visible. Keep total under 250 words. No disclaimers.`;

   const { text } = await generateText({
      // Call the gateway provider natively
      model: gateway("gemini-2.5-flash"),
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: data.notes
                ? `Analyse this chart. Trader notes: ${data.notes}`
                : "Analyse this chart.",
            },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });

    return { analysis: text };
  });
