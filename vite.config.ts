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
        // Forme objet explicite (noms de packages) — fonctionne sur Node ET Bun/Render.
        // La forme fonction (id.includes) est ignorée par Bun et produit un seul chunk 970 kB.
        //
        // Règles :
        // - React + React Router DOIVENT rester ensemble : Router appelle createContext()
        //   à l'initialisation du module, React doit donc déjà être défini.
        // - Supabase et Sentry sont lourds (~170 kB + ~266 kB) et pas nécessaires
        //   au premier rendu → on les isole.
        // - Radix UI et Lucide restent dans le chunk principal pour éviter les erreurs
        //   forwardRef/context déjà rencontrées en session précédente.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-router"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-sentry": ["@sentry/react"],
        },
      },
    },
  },
}));
