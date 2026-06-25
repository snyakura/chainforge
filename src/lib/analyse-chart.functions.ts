import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider } from "./ai-gateway.server"; // Import your new provider

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6 MB decoded cap

const Input = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/")
    .max(Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 100, "Image payload too large"),
  notes: z.string().max(500).optional(),
});

function assertTrustedOrigin() {
  let origin = "";
  try {
    const req = getRequest();
    origin = req.headers.get("origin") || req.headers.get("referer") || "";
  } catch {
    return; 
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

    // Call our provider constructor (reads variable automatically)
    const google = createGeminiProvider();
    
    const systemPrompt = `You are ChainForge AI, a professional forex analyst.
Analyse the uploaded chart screenshot using Market Structure, Liquidity, Supply and Demand, ICT Concepts, and Support/Resistance.

Return ONLY:
📊 Instrument & Timeframe
🧭 Market Structure
🎯 Key Levels
📈 Bias (Direction + Confidence %)
🎬 Trade Plan (Entry, Stop Loss, TP1, TP2)
⚠️ Invalidation
💡 Notes

Be specific with price levels if visible. Keep total under 250 words. No disclaimers.`;

    // Convert the data URL string into a native URL object for the AI SDK
    const imageUrl = new URL(data.imageDataUrl);

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: `${systemPrompt}\n\nAnalyse this chart. ${
              data.notes ? `Trader notes: ${data.notes}` : ""
            }`,
          },
          {
            type: "image" as const,
            image: imageUrl, 
          },
        ],
      },
    ];

    try {
      // Direct call to Gemini 2.5 Flash - extremely fast, great vision capabilities, and super cheap
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        messages,
      });

      return {
        analysis: result.text,
      };

    } catch (error) {
      console.error("Gemini Native API Call Failed:", error);
      throw new Error(
        `AI Analysis failed. ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });