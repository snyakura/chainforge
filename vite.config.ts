import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Directs TanStack Start's bundled server entry to the correct path
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  // This block ensures Lovable's editor stays happy, while Vercel builds successfully
  vite: {
    plugins: process.env.VERCEL 
      ? [
          nitro({
            preset: "vercel",
          }),
        ]
      : [],
  },
});