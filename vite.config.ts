import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8083,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    chunkSizeWarningLimit: 600,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Stable Core: React, Router, and UI foundations MUST stay together
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/framer-motion")
          ) {
            return "vendor-core";
          }
          // Supabase — core but can be separate
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // Recharts — heavyweight, only on specific pages
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          // Sentry — non-critical for rendering
          if (id.includes("node_modules/@sentry")) {
            return "sentry";
          }
          // Note: Features like 'admin' are now left to Vite's default strategy
          // to avoid circular/init-order issues with React context.
        },
      },
    },
  },
}));
