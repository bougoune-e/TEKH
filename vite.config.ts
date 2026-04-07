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
          // React core — must share a single instance across all chunks
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-core";
          }
          // Router
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          // Recharts — heavyweight, rarely changes
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // Sentry — monitoring, not needed on first paint
          if (id.includes("node_modules/@sentry")) {
            return "sentry";
          }
          // Radix UI / shadcn components
          if (id.includes("node_modules/@radix-ui")) {
            return "ui";
          }
          // Lucide icons
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // Admin pages — only loaded by /admin routes
          if (id.includes("src/features/admin")) {
            return "admin";
          }
        },
      },
    },
  },
}));
