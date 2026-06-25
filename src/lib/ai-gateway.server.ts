import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Creates the native Google Gemini provider instance
export function createGeminiProvider(apiKey?: string) {
  return createGoogleGenerativeAI({
    // If apiKey isn't passed, it will automatically fall back to process.env.GOOGLE_GENERATIVE_AI_API_KEY
    apiKey: apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}