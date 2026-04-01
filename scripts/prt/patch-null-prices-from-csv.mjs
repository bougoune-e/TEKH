/**
 * patch-null-prices-from-csv.mjs
 *
 * Met à jour les smartphones en base ayant prt_fcfa = null mais dont
 * le prix figure dans le CSV de référence (Tecno, Infinix, Vivo…).
 * Applique le facteur 0.4 sans condition de seuil (entrée de gamme Afrique).
 */
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";
loadRepoEnv();

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const supabase = createClient(url, key);

const FACTEUR = 0.4;

// ── Brand normalization (same as import script) ──────────────────────────────
const BRAND_MAP = {
  "apple": "Apple", "samsung": "Samsung", "xiaomi": "Xiaomi",
  "xiaomi poco": "Poco", "xiaomi redmi": "Xiaomi", "tecno": "Tecno",
  "infinix": "Infinix", "google pixel": "Google", "google": "Google",
  "huawei": "Huawei", "honor": "Honor", "oppo": "Oppo", "realme": "Realme",
  "vivo": "Vivo", "one plus": "OnePlus", "oneplus": "OnePlus",
  "motorola": "Motorola", "lg": "LG", "asus": "Asus", "lenovo": "Lenovo",
  "red magic": "Red Magic", "zte": "ZTE", "poco": "Poco", "sony": "Sony", "itel": "Itel",
};
function normalizeBrand(raw) {
  const lower = raw.trim().toLowerCase();
  if (BRAND_MAP[lower]) return BRAND_MAP[lower];
  for (const [k, v] of Object.entries(BRAND_MAP)) if (lower.startsWith(k)) return v;
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
}
function normalizeModel(raw) {
  return raw.trim().replace(/\b\w/g, c => c.toUpperCase());
}
function makeKey(brand, model, storage) {
  return `${(brand || "").toLowerCase()}|${(model || "").toLowerCase()}|${storage || ""}`;
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
const csvPath = join(REPO_ROOT, "tableau de reference algorithmique - Sheet1 (2).csv");
const lines = readFileSync(csvPath, "utf-8").split("\n").map(l => l.replace(/\r$/, ""));

const csvPriceMap = new Map(); // key → prt_fcfa
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].trim().split(",");
  if (parts.length < 4) continue;
  const rawBrand = parts[0]?.trim();
  const rawModel = parts[1]?.trim();
  const rawStorage = parts[2]?.trim();
  const rawPrice = parts[3]?.trim().replace(/[^\d]/g, "");
  if (!rawModel || !rawPrice) continue;

  const price = parseInt(rawPrice);
  if (!price) continue;

  const brand = normalizeBrand(rawBrand || "");
  const model = normalizeModel(rawModel);
  const storage = parseInt(rawStorage) || null;
  const key = makeKey(brand, model, storage ? String(storage) : "");
  const prt = Math.round(price * FACTEUR);
  csvPriceMap.set(key, prt);
}
console.log(`CSV price map: ${csvPriceMap.size} entries`);

// ── Fetch null-price phones from DB ──────────────────────────────────────────
const all = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from("smartphones")
    .select("id, marque, modele, variante")
    .is("prt_fcfa", null)
    .range(from, from + 999);
  if (error) { console.error(error.message); break; }
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < 1000) break;
  from += 1000;
}
console.log(`Null-price phones in DB: ${all.length}`);

// ── Match and prepare updates ─────────────────────────────────────────────────
const updates = [];
let notFound = 0;
for (const row of all) {
  const storage = (row.variante || "").replace(/\D/g, "");
  const key = makeKey(row.marque, row.modele, storage);
  const prt = csvPriceMap.get(key);
  if (prt) {
    updates.push({ id: row.id, prt_fcfa: prt, facteur_afrique: FACTEUR, prt_updated_at: new Date().toISOString() });
  } else {
    notFound++;
  }
}
console.log(`\nMatched: ${updates.length} | Not found in CSV: ${notFound}`);
if (updates.length === 0) { console.log("Nothing to update."); process.exit(0); }

// Breakdown by brand
const byBrand = {};
for (const u of updates) {
  const row = all.find(r => r.id === u.id);
  byBrand[row.marque] = (byBrand[row.marque] || 0) + 1;
}
console.log("\nBy brand:");
for (const [b, n] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) console.log(`  ${b}: ${n}`);

// ── Update in batches ─────────────────────────────────────────────────────────
const BATCH = 50;
let ok = 0, err = 0;
for (let i = 0; i < updates.length; i += BATCH) {
  const batch = updates.slice(i, i + BATCH);
  // Update each row individually (update only touches specified columns, no not-null risk)
  const errors = await Promise.all(batch.map(u =>
    supabase.from("smartphones").update({
      prt_fcfa: u.prt_fcfa,
      facteur_afrique: u.facteur_afrique,
      prt_updated_at: u.prt_updated_at,
    }).eq("id", u.id)
  ));
  const { error } = errors.find(r => r.error) ?? { error: null };
  if (error) { console.error(`Batch error: ${error.message}`); err += batch.length; }
  else { ok += batch.length; process.stdout.write(`\rUpdated ${ok}/${updates.length}...`); }
}

console.log(`\n\n✅ Done! Updated ${ok} phones. Errors: ${err}.`);

// Remaining nulls
const { count } = await supabase
  .from("smartphones").select("id", { count: "exact", head: true }).is("prt_fcfa", null);
console.log(`Remaining null-price phones in DB: ${count}`);
