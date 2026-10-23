import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Standalone preview (npm run build:preview): App + API in one page, see preview/src/main.tsx. The server's node:
// modules are swapped for browser versions; preview/bundle.ts then folds JS, CSS and WASM into one HTML file.
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: "preview",
  base: "./",
  resolve: {
    alias: {
      "node:sqlite": here("preview/src/sqlite.ts"),
      "node:crypto": here("preview/src/crypto.ts"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    // The WASM goes into the bundle as a data: URL, so the page needs no other file.
    assetsInlineLimit: 10_000_000,
    rolldownOptions: {
      input: "preview/src/main.tsx",
      output: { entryFileNames: "preview.js", assetFileNames: "preview[extname]", inlineDynamicImports: true },
    },
  },
  plugins: [react()],
});
