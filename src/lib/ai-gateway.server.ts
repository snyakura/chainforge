import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createLovableAiGatewayProvider(apiKey: string) {
  // Use the native Google AI SDK wrapper
  return createGoogleGenerativeAI({
    apiKey: apiKey,
  });
}