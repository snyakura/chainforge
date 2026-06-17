// Standalone, Vercel-native TanStack Start config.
//
// Replaces @lovable.dev/vite-tanstack-config, which defaulted to the Cloudflare
// Workers Nitro preset inside its sandbox and SKIPPED Nitro entirely on a normal
// (Vercel) build — producing a plain dist/ output that Vercel can't serve (404).
//
// Here we always run Nitro with the `vercel` preset on build, emitting the
// Build Output API directory (.vercel/output) that Vercel deploys with zero config.
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  // Inject VITE_* env vars as import.meta.env.* (parity with the previous config).
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    // Match the build's CSS pipeline in dev so Lightning CSS transforms are honest.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    // Sandbox/dev preview expects host "::" on port 8080.
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
        // Use src/server.ts (our SSR error wrapper) as the server entry.
        server: { entry: "server" },
      }),
      // Nitro is build-only; target Vercel's Build Output API.
      ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
      viteReact(),
    ],
  };
});
