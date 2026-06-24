import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // This tells the underlying bundler to output standard serverless function specs
    build: {
      ssr: true
    }
  },
  tanstackStart: {
    server: {
      entry: "src/server.ts", // Points explicitly to your server entry point wrapper
    },
  },
});
