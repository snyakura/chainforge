import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // This explicitly instructs Lovable's Nitro bundle engine to adapt to Vercel
  vite: {
    nitro: {
      preset: "vercel"
    }
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
