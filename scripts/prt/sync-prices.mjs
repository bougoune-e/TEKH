#!/usr/bin/env node
/**
 * Met à jour prt_fcfa / prix_ebay_eur via eBay Browse API pour les lignes
 * dont prt_updated_at est NULL ou > PRT_MAX_AGE_DAYS (défaut 30).
 * Usage : depuis la racine TEKH — npm run prt:sync-prices
 */
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DELAY_MS = Number(process.env.PRT_SYNC_DELAY_MS) || 500;
const MAX_AGE_DAYS = Number(process.env.PRT_MAX_AGE_DAYS) || 30;
const LIMIT = Number(process.env.PRT_SYNC_LIMIT) || 200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function needsRefresh(row) {
  if (!row.prt_updated_at) return true;
  const t = new Date(row.prt_updated_at).getTime();
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400_000;
  return t < cutoff;
}

function buildSearchQuery(row) {
  const v = row.variante ? ` ${row.variante}` : "";
  return `${row.marque} ${row.modele}${v}`.trim();
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (clé service, scripts serveur).");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: rows, error } = await supabase
    .from("smartphones")
    .select("id, marque, modele, variante, facteur_afrique, prt_updated_at")
    .order("prt_updated_at", { ascending: true, nullsFirst: true })
    .limit(LIMIT);

  if (error) {
    console.error("[sync-prices] lecture DB:", error.message);
    process.exit(1);
  }

  const todo = (rows || []).filter(needsRefresh);
  console.log(`[sync-prices] ${todo.length} ligne(s) à rafraîchir (sur ${rows?.length || 0} lues).`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const row of todo) {
    const q = buildSearchQuery(row);
    const facteur = row.facteur_afrique != null ? Number(row.facteur_afrique) : 0.9;

    try {
      const result = await fetchPrtForModel(q, facteur);
      if (result.prtFcfa == null || result.sampleSize === 0) {
        console.warn(`[skip] Pas assez de données eBay pour « ${q} » (échantillon=${result.sampleSize})`);
        skip++;
        await sleep(DELAY_MS);
        continue;
      }

      const { error: upErr } = await supabase
        .from("smartphones")
        .update({
          prt_fcfa: result.prtFcfa,
          prix_ebay_eur: result.medianEur,
          prt_updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (upErr) {
        console.error(`[fail] ${q}:`, upErr.message);
        fail++;
      } else {
        console.log(`[ok] ${q} → PRT ${result.prtFcfa} FCFA (médiane ${result.medianEur} €, n=${result.sampleSize})`);
        ok++;
      }
    } catch (e) {
      console.error(`[fail] ${q}:`, e?.message || e);
      fail++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`[sync-prices] terminé — ok=${ok} skip=${skip} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
