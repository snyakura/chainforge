import { createGateway } from "ai";

// Uses the Vercel AI Gateway (connected to this project). Reads AI_GATEWAY_API_KEY
// from the environment automatically; pass a plain model string like
// "google/gemini-3-flash" to the returned provider.
export function createVercelAiGatewayProvider() {
  return createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
}
