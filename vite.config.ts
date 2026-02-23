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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
    // Relax the warning threshold a bit and improve vendor chunking
    chunkSizeWarningLimit: 1024, // in kB
    // Désactive le polyfill de modulePreload pour éviter certains bugs
    // de chargement sur des bundles minifiés (ex: erreurs 'Cannot access S before initialization')
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        // React + Recharts dans le même chunk pour éviter "Cannot access 'S' before initialization"
        manualChunks: {
          vendor: ["react", "react-dom", "recharts"],
        },
      },
    },
  },
}));
