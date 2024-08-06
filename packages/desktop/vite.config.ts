import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactClickToComponent } from "vite-plugin-react-click-to-component";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    reactClickToComponent(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "aurodev",
      project: "cardgamesmanager",
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1430,
        }
      : undefined,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    target: "esnext",
    sourcemap: true,
  },
}));
