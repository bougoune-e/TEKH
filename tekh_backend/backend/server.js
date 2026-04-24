import express from "express";
import fs from "fs";
import csv from "csv-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";
import Anthropic from "@anthropic-ai/sdk";
import { supabase, TABLE_PRODUCTS } from "./supabase.js";

// ── Vérification JWT Supabase via HTTP direct (compatible clés ECC P-256 et Legacy HS256)
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function getSupabaseUser(jwt) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !jwt) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
      },
    });
    if (!res.ok) {
      console.error("[AUTH] Supabase auth/v1/user →", res.status, await res.text().catch(() => ""));
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[AUTH] fetch error:", e.message);
    return null;
  }
}

// ── Web Push VAPID setup ──────────────────────────────────────
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:tekhswap@gmail.com";
const ADMIN_EMAILS = (process.env.VITE_ADMIN_EMAILS || "tekhswap@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase());

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  console.log("[PUSH] VAPID configuré.");
} else {
  console.warn("[PUSH] VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY manquant — push désactivé.");
}

const app = express();
const PORT = process.env.PORT || 8083;

// Resolve filesystem paths in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diagnostic logs for Railway
console.log(`[DIAG] process.env.PORT: ${process.env.PORT}`);
console.log(`[DIAG] process.env.RAILWAY_STATIC_URL: ${process.env.RAILWAY_STATIC_URL}`);
console.log(`[DIAG] All Env Keys: ${Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('RAILWAY')).join(', ')}`);

// Heartbeat to confirm process stays alive
setInterval(() => {
  console.log(`[HEARTBEAT] ${new Date().toISOString()} - Up and running on port ${PORT}`);
}, 30000);

// Tableau qui contiendra les données du CSV (JSON)
let produits = [];
let csvLoaded = false;
const CURRENT_YEAR = new Date().getFullYear();

// Middlewares
const DEFAULT_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "http://localhost:5173",
  "https://tekh-1.onrender.com",
  "https://tekh.onrender.com",
  "https://tekh-backend.onrender.com",
  "https://tekh-backend-production.up.railway.app",
  "https://tekh.up.railway.app",
  "https://tekhplus.com",
  "https://www.tekhplus.com"
];

const ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(s => s.trim())
  : DEFAULT_ORIGINS;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ORIGINS.indexOf(origin) !== -1 || ORIGINS.includes("*")) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(null, true); // Allow all for now
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-client-info",
    "apikey",
    "X-Requested-With"
  ],
  credentials: true,
  maxAge: 86400 // Cache preflight response for 24 hours
};

// Preflight OPTIONS explicite — requis pour Railway/proxies
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: "12mb" }));

// Logging simple des requêtes
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Lire le fichier CSV AU DÉMARRAGE
function loadCsv() {
  produits = [];
  csvLoaded = false;
  const csvPath = path.resolve(__dirname, "..", "..", "data", "catalog", "tab_cleaned.csv");
  console.log("Chargement du CSV depuis:", csvPath);
  fs.createReadStream(csvPath)
    .on("error", (err) => {
      console.error("Erreur lecture CSV:", err);
    })
    .pipe(csv())
    .on("data", (row) => {
      const normalized = { ...row };
      // Normalisation minimale pour éviter les anomalies de données (ex: année 2064).
      const yearKey = Object.prototype.hasOwnProperty.call(normalized, "annee_sortie") ? "annee_sortie" : "Annee Sortie";
      const ramKey = Object.prototype.hasOwnProperty.call(normalized, "ram_gb") ? "ram_gb" : "RAM (GB)";
      const storageKey = Object.prototype.hasOwnProperty.call(normalized, "stockages_gb") ? "stockages_gb" : "Stockages (GB)";

      const year = Number(normalized[yearKey]);
      if (Number.isFinite(year) && year > CURRENT_YEAR + 1) {
        normalized[yearKey] = String(CURRENT_YEAR);
      }

      const ram = Number(normalized[ramKey]);
      if (!Number.isFinite(ram) || ram <= 0) {
        normalized[ramKey] = "";
      }

      const storage = Number(normalized[storageKey]);
      if (!Number.isFinite(storage) || storage <= 0) {
        normalized[storageKey] = "";
      }

      produits.push(normalized);
    })
    .on("end", () => {
      csvLoaded = true;
      console.log("CSV chargé:", produits.length, "produits");
    });
}

loadCsv();

async function importCsvOnce() {
  if (!supabase) {
    console.warn("[API] Supabase non configuré: import CSV ignoré");
    return;
  }
  try {
    // Try primary table first
    console.log(`[API] Tentative de connexion à la table: ${TABLE_PRODUCTS}`);
    let { count, error: countErr } = await supabase
      .from(TABLE_PRODUCTS)
      .select("id", { count: "exact", head: true });

    let activeTable = TABLE_PRODUCTS;

    // Fallback logic if primary table missing
    if (countErr && countErr.code === 'PGRST205' && TABLE_PRODUCTS !== 'produits') {
      console.warn(`[API] Table ${TABLE_PRODUCTS} introuvable (PGRST205). Repli sur 'produits'.`);
      const fallback = await supabase
        .from('produits')
        .select("id", { count: "exact", head: true });

      if (!fallback.error) {
        activeTable = 'produits';
        count = fallback.count;
        countErr = null;
      }
    }

    if (countErr) {
      console.error("[API] Erreur comptage Supabase:", countErr);
      return;
    }

    if ((count || 0) > 0) {
      console.log(`[API] Table ${activeTable} déjà peuplée (${count}). Import initial ignoré.`);
      return;
    }

    if (!csvLoaded) {
      console.log("[API] CSV pas encore chargé, attente avant import...");
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (produits.length === 0) {
      console.warn("[API] Aucun produit en mémoire à importer.");
      return;
    }

    // Insertion en lot (avec repli si table absente : PGRST205)
    console.log(`[API] Importation de ${produits.length} produits dans ${activeTable}...`);
    let { error: insErr } = await supabase.from(activeTable).insert(produits);
    if (insErr && insErr.code === "PGRST205" && activeTable !== "produits") {
      console.warn(`[API] Table ${activeTable} introuvable à l'insert. Repli sur 'produits'.`);
      activeTable = "produits";
      insErr = (await supabase.from("produits").insert(produits)).error;
    }
    if (insErr) {
      console.error("[API] Erreur import CSV -> Supabase:", insErr);
      return;
    }
    console.log(`[API] CSV importé avec succès dans ${activeTable}`);
  } catch (e) {
    console.error("[API] Exception fatale importCsvOnce:", e);
  }
}

importCsvOnce();

// Route test
app.get("/", (req, res) => {
  res.send(`API OK - Version 1.1 - Port: ${PORT}`);
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    port: PORT,
    env_port: process.env.PORT || "not set",
    csv: csvLoaded,
    supabase: !!supabase,
    products_count: produits.length
  });
});

// Route produits
app.get("/produits", async (req, res) => {
  console.log(`[API] Request to /produits from ${req.headers.origin || 'unknown'}`);
  if (!csvLoaded) return res.status(503).json({ error: "Chargement des données en cours" });

  if (supabase) {
    try {
      // Logic for table fallback here too
      let result = await supabase.from(TABLE_PRODUCTS).select("*");
      if (result.error && result.error.code === 'PGRST205' && TABLE_PRODUCTS !== 'produits') {
        result = await supabase.from('produits').select("*");
      }

      if (!result.error && result.data) return res.json(result.data);
      if (result.error) console.warn("[API] Supabase error, falling back to local CSV:", result.error.message);
    } catch (e) {
      console.warn("[API] /produits exception: fallback CSV");
    }
  }

  return res.json(produits);
});

// Alias pour le simulateur
app.get("/api/products", (_req, res) => {
  if (!csvLoaded) return res.status(503).json({ error: "Chargement des données en cours" });
  return res.json(produits);
});

// ──────────────────────────────────────────────────────────────
// CLAUDE HAIKU VISION – Analyse d'images (état écran) pour TEKH+
// ──────────────────────────────────────────────────────────────
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

if (anthropic) {
  console.log("[API] Claude Haiku Vision configuré.");
} else {
  console.warn("[API] ANTHROPIC_API_KEY manquant — analyse Vision désactivée.");
}

app.post("/api/vision/analyze-image", async (req, res) => {
  if (!anthropic) {
    return res.status(503).json({
      error: "Service d'analyse d'images non configuré (ANTHROPIC_API_KEY manquant).",
      code: "VISION_NOT_CONFIGURED",
    });
  }
  const { imageBase64, imageUrl } = req.body || {};
  if (!imageBase64 && !imageUrl) {
    return res.status(400).json({
      error: "Fournissez imageBase64 (chaîne base64) ou imageUrl (URL publique).",
    });
  }

  try {
    const imageSource = imageUrl
      ? { type: "url", url: imageUrl }
      : { type: "base64", media_type: "image/jpeg", data: imageBase64 };

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: imageSource },
            {
              type: "text",
              text: `Analyse l'état de l'écran de ce smartphone. Réponds UNIQUEMENT en JSON valide, sans texte autour, avec ce format exact :
{"labels":[{"description":"<observation courte>","score":<0.0-1.0>},...],"suggestedCondition":"<bon|moyen|mauvais|hs>","message":"<phrase courte en français décrivant l'état visible>"}
- labels : 2 à 4 observations visuelles (ex: "Écran fissuré", "Tache noire", "Écran intact", etc.)
- suggestedCondition : une seule valeur parmi bon / moyen / mauvais / hs
- message : phrase courte décrivant l'état de l'écran`,
            },
          ],
        },
      ],
    });

    const raw = response.content[0]?.text || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Réponse Claude non parseable");
    const result = JSON.parse(jsonMatch[0]);
    return res.json(result);
  } catch (err) {
    console.error("[API] Claude Vision error:", err);
    return res.status(500).json({
      error: err.message || "Erreur lors de l'analyse de l'image.",
      code: "VISION_ERROR",
    });
  }
});

// Route produit par id
app.get("/produits/:id", async (req, res) => {
  const { id } = req.params;
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_PRODUCTS)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
  }
  const item = produits.find((p) => String(p.id) === String(id));
  if (!item) return res.status(404).json({ error: "Produit introuvable" });
  return res.json(item);
});

// Mise à jour du stock
app.patch("/produits/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body || {};
  if (typeof stock === "undefined") return res.status(400).json({ error: "Champ 'stock' requis" });
  if (supabase) {
    const { error } = await supabase
      .from(TABLE_PRODUCTS)
      .update({ stock })
      .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  const idx = produits.findIndex((p) => String(p.id) === String(id));
  if (idx < 0) return res.status(404).json({ error: "Produit introuvable" });
  produits[idx].stock = stock;
  return res.json({ success: true });
});

// ──────────────────────────────────────────────────────────────
// WEB PUSH — Helpers admin (service role = pas de RLS)
// ──────────────────────────────────────────────────────────────

/** Liste des abonnés push avec profil — admin only */
app.get("/api/push/subscribers", async (req, res) => {
  const jwt = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!jwt || !supabase) return res.status(401).json({ error: "Non autorisé" });
  const user = await getSupabaseUser(jwt);
  if (!user) return res.status(401).json({ error: "Token invalide" });
  if (!ADMIN_EMAILS.includes((user.email || "").toLowerCase()))
    return res.status(403).json({ error: "Admins uniquement" });

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, created_at, user_id, user_agent, endpoint")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  // Récupère les profils Supabase pour les user_id non-null
  const userIds = [...new Set((subs || []).map(s => s.user_id).filter(Boolean))];
  let profiles = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    profiles = data || [];
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const result = (subs || []).map(s => ({
    id: s.id,
    created_at: s.created_at,
    user_agent: s.user_agent,
    endpoint_short: s.endpoint?.slice(0, 50) + "...",
    profile: s.user_id ? (profileMap[s.user_id] || { id: s.user_id }) : null,
  }));

  return res.json({ count: result.length, subscribers: result });
});

/** Nombre d'abonnés — service role bypass RLS, JWT admin requis */
app.get("/api/push/count", async (req, res) => {
  const jwt = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!jwt || !supabase) return res.status(401).json({ error: "Non autorisé" });
  const user = await getSupabaseUser(jwt);
  if (!user) return res.status(401).json({ error: "Token invalide" });
  const email = (user.email || "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) return res.status(403).json({ error: "Admins uniquement" });
  const { count, error } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ count: count ?? 0 });
});

// ──────────────────────────────────────────────────────────────
// WEB PUSH — Envoi de notifications aux abonnés (admin only)
// ──────────────────────────────────────────────────────────────
app.post("/api/push/send", async (req, res) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return res.status(503).json({ error: "Push non configuré (VAPID keys manquantes)." });
  }

  // Vérifier le JWT Supabase
  const jwt = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!jwt) return res.status(401).json({ error: "Non autorisé" });

  if (!supabase) return res.status(503).json({ error: "Supabase non configuré" });

  const user = await getSupabaseUser(jwt);
  if (!user) return res.status(401).json({ error: "Token invalide" });

  const email = (user.email || "").toLowerCase();
  const role = (user.app_metadata?.role || user.user_metadata?.role || "").toLowerCase();
  if (role !== "admin" && !ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: "Accès réservé aux admins" });
  }

  const { title, body, url, tag, dealId, image } = req.body || {};
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "title et body sont requis" });
  }

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription");
  if (subsErr) return res.status(500).json({ error: subsErr.message });

  const payload = JSON.stringify({
    title: title.trim(),
    body: body.trim(),
    url: url || "/deals",
    tag: tag || "tekh-push",
    dealId: dealId || null,
    image: image || null,
  });

  let sent = 0, failed = 0;
  const invalid = [];

  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
      sent++;
    } catch (e) {
      failed++;
      console.error(`[PUSH] Échec envoi → endpoint: ${sub.endpoint?.slice(0, 60)}... | status: ${e.statusCode} | message: ${e.message}`);
      if (e.statusCode === 410 || e.statusCode === 404) invalid.push(sub.endpoint);
    }
  }

  if (invalid.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", invalid);
  }

  await supabase.from("notification_campaigns").insert({
    title: title.trim(),
    body: body.trim(),
    url: url || "/deals",
    tag: tag || "tekh-push",
    sent_count: sent,
    failed_count: failed,
    total_subs: (subs || []).length,
    sent_by: user.email,
    image_url: image || null,
  }).then(() => { }).catch(() => { });

  console.log(`[PUSH] Envoyé: ${sent}/${(subs || []).length}, échecs: ${failed}`);
  return res.json({ sent, failed, total: (subs || []).length });
});

// ──────────────────────────────────────────────────────────────
// FRONTEND STATIC FILES (VITE BUILD) + SPA FALLBACK
// ──────────────────────────────────────────────────────────────
// In production, serve the built React app from /dist so that
// routes like /simulateur or /deals are handled client-side.
const CLIENT_DIST = path.resolve(__dirname, "..", "..", "dist");
console.log("[STATIC] Serving frontend from:", CLIENT_DIST);

app.use(express.static(CLIENT_DIST));

// SPA fallback: for any non-API GET request, send index.html
app.get("*", (req, res, next) => {
  // Let explicitly defined API routes behave as usual
  if (req.path.startsWith("/produits") || req.path.startsWith("/api")) {
    return next();
  }

  // Only handle HTML navigations
  if (req.method === "GET" && req.accepts("html")) {
    return res.sendFile(path.join(CLIENT_DIST, "index.html"));
  }

  return next();
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[API] Serveur démarré sur :`);
  console.log(` - Port public (Railway) : ${PORT}`);
  console.log(` - Interface : 0.0.0.0`);
  console.log(` - Date : ${new Date().toLocaleString()}`);
});

server.on("error", (err) => {
  console.error("Erreur serveur:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
