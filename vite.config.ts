import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { PLUGIN_CONTRACT_VERSION, type PluginManifest } from "./shared/plugin.ts";

/** manifest.json for food: which hashed files make up this build (food: docs/plugins.md). */
function pluginManifest(): Plugin {
  return {
    name: "plugin-manifest",
    apply: "build",
    // After all other plugins wrote their files, so the CSS is there too.
    writeBundle(options, bundle) {
      const files = Object.values(bundle);
      const entry = files.find((file) => file.type === "chunk" && file.isEntry);
      if (!entry) throw new Error("Kein Einstiegsmodul im Build");
      const manifest: PluginManifest = {
        contractVersion: PLUGIN_CONTRACT_VERSION,
        entry: entry.fileName,
        css: files.filter((file) => file.type === "asset" && file.fileName.endsWith(".css")).map((file) => file.fileName),
      };
      writeFileSync(join(options.dir!, "manifest.json"), JSON.stringify(manifest, null, 2));
    },
  };
}

export default defineConfig({
  root: "web",
  // food serves the build under /plugin-assets/sauerteig/, so every file is loaded relative to the entry.
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Not an HTML app: one ES module whose exports (mount, contractVersion) food calls.
    rolldownOptions: {
      input: "web/src/remote.tsx",
      preserveEntrySignatures: "exports-only",
    },
  },
  // npm run dev (API on 3100) + npm run dev:web, then http://localhost:5174/dev.html. Like food, without its proxy.
  server: {
    port: 5174,
    proxy: {
      "/api/plugins/sauerteig": {
        target: "http://localhost:3100",
        rewrite: (path) => path.replace(/^\/api\/plugins\/sauerteig/, "/api"),
      },
    },
  },
  plugins: [react(), pluginManifest()],
});
