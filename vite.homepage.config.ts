import { app } from "@tauri-apps/api";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  root: "./homepage",
  plugins: [react()],
  build: {
    outDir: "./dist/homepage",
    emptyOutDir: true,
    rollupOptions: {
      external: ["/src/Root.tsx"],
      input: {
        app: "homepage/index.html",
      },
      output: {
        entryFileNames: "index.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
}));
