#!/usr/bin/env node
/**
 * Complète `smartphones.prt_fcfa` lorsqu'il est NULL à partir de tekh_backend/backend/tab.csv.bak
 * (colonnes : marques, modele_exact, stockages_gb, prix_neuf_en_fcfa).
 *
 * Usage : TAB_CSV_PATH=tekh_backend/backend/tab.csv.bak npm run prt:fill-from-tab-csv
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CSV_PATH = process.env.TAB_CSV_PATH
  ? join(REPO_ROOT, process.env.TAB_CSV_PATH)
  : join(REPO_ROOT, "tekh_backend/backend/tab.csv.bak");

function parseCsvLine(line) {
  const parts = line.split(",");
  if (parts.length < 5) return null;
  return {
    marque: parts[0].trim(),
    modele: parts[1].trim(),
    stockage: Number(parts[2].trim()),
    prix_fcfa: Number(parts[3].trim()),
  };
}

async function fetchAllNeedingPrice(supabase) {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const { data, error } = await supabase
      .from("smartphones")
      .select("id, marque, modele, variante, prt_fcfa")
      .is("prt_fcfa", null)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function key(m, mo, variante) {
  return `${m.toLowerCase()}|${mo.toLowerCase()}|${String(variante).toLowerCase()}`;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
    process.exit(1);
  }
  if (!existsSync(CSV_PATH)) {
    console.error("Fichier introuvable :", CSV_PATH);
    process.exit(1);
  }

  const raw = readFileSync(CSV_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines[0].toLowerCase();
  if (!header.includes("marques") || !header.includes("prix")) {
    console.error("CSV : en-tête attendu marques,modele_exact,stockages_gb,prix_neuf_en_fcfa,...");
    process.exit(1);
  }

  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (!row || !Number.isFinite(row.prix_fcfa) || row.prix_fcfa <= 0) continue;
    const variante = `${row.stockage}GB`;
    map.set(key(row.marque, row.modele, variante), row.prix_fcfa);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const rows = await fetchAllNeedingPrice(supabase);
  console.log(`[fill-prt-from-tab] ${rows.length} ligne(s) sans PRT en base ; ${map.size} entrées dans le CSV.`);

  let ok = 0;
  for (const r of rows) {
    const variante = String(r.variante || "").trim();
    const k = key(r.marque, r.modele, variante);
    const prix = map.get(k);
    if (prix == null) continue;
    const { error } = await supabase
      .from("smartphones")
      .update({ prt_fcfa: Math.round(prix), prt_updated_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) console.error(r.id, error.message);
    else ok++;
  }
  console.log(`[fill-prt-from-tab] ${ok} ligne(s) complétées depuis le CSV.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
