#!/usr/bin/env node
/**
 * Recalcule tous les PRT depuis eBay et les **enregistre en base** (cache persistant).
 *
 * L’app lit uniquement `smartphones.prt_fcfa` / `prix_ebay_eur` — **aucun appel eBay** à chaque requête utilisateur.
 *
 * 1) Remet `facteur_afrique` à 1 et **efface** `prt_fcfa`, `prix_ebay_eur`, `prt_updated_at` (les anciens prix ne sont **pas** conservés).
 * 2) Pour chaque ligne : appel eBay ; si OK → enregistre médiane × 655,957 FCFA ; sinon → la ligne reste **sans prix** (null).
 *
 * Usage : npm run prt:resync-all-ebay
 * Requiert : EBAY_*, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DELAY_MS = Number(process.env.PRT_SYNC_DELAY_MS) || 500;
const FACTEUR = 1;
const CLEAR_CHUNK = 200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildSearchQuery(row) {
  const v = row.variante ? ` ${row.variante}` : "";
  return `${row.marque} ${row.modele}${v}`.trim();
}

async function fetchAllSmartphones(supabase) {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const { data, error } = await supabase
      .from("smartphones")
      .select("id, marque, modele, variante, facteur_afrique")
      .order("marque")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function clearPricesBatch(supabase, rows) {
  for (let i = 0; i < rows.length; i += CLEAR_CHUNK) {
    const ids = rows.slice(i, i + CLEAR_CHUNK).map((r) => r.id);
    const { error } = await supabase
      .from("smartphones")
      .update({
        facteur_afrique: FACTEUR,
        prt_fcfa: null,
        prix_ebay_eur: null,
        prt_updated_at: null,
      })
      .in("id", ids);
    if (error) throw new Error(`[clear] ${error.message}`);
  }
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const rows = await fetchAllSmartphones(supabase);
  console.log(`[resync-all-ebay] ${rows.length} ligne(s) dans smartphones (référence catalogue).`);

  console.log(
    "[resync-all-ebay] Effacement des anciens PRT en base — remplacement définitif par les valeurs eBay suivantes…"
  );
  await clearPricesBatch(supabase, rows);

  let ok = 0;
  let noData = 0;
  let fail = 0;

  for (const row of rows) {
    const q = buildSearchQuery(row);

    try {
      const result = await fetchPrtForModel(q, FACTEUR);
      if (result.prtFcfa != null && result.sampleSize > 0) {
        const { error: upErr } = await supabase
          .from("smartphones")
          .update({
            prt_fcfa: result.prtFcfa,
            prix_ebay_eur: result.medianEur,
            facteur_afrique: FACTEUR,
            prt_updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        if (upErr) {
          console.error(`[fail] ${q}:`, upErr.message);
          fail++;
        } else {
          console.log(`[ok] ${q} → ${result.prtFcfa} FCFA (médiane ${result.medianEur} €)`);
          ok++;
        }
      } else {
        console.warn(`[sans-donnée-ebay] ${q} — PRT laissé vide (l’app utilisera d’autres sources si prévues).`);
        noData++;
      }
    } catch (e) {
      console.error(`[fail] ${q}:`, e?.message || e);
      fail++;
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `[resync-all-ebay] terminé — prix_ebay_enregistrés=${ok} sans_médiane_ebay=${noData} erreurs=${fail}`
  );
  console.log(
    "Les PRT sont stockés en base : l’API eBay n’est plus sollicitée par l’app, seulement par ce script ou prt:sync-prices."
  );
  console.log("Pensez à lancer : npm run prt:assign-classes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
