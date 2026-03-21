#!/usr/bin/env node
/**
 * Assigne classe_tekh (A–F) selon PRT et année (charte TEKH+ — module référentiel).
 * À lancer après sync-prices : npm run prt:assign-classes
 */
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv } from "./load-env.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * @param {number|null} prt
 * @param {number|null} year
 * @param {Record<string, unknown>} specs
 */
export function computeClasseTekh(prt, year, specs = {}) {
  const reseau = String(specs.reseau || specs.network || "").toLowerCase();
  if (reseau === "3g" || specs.only3g === true) return "F";

  const y = year != null ? Number(year) : null;
  const p = prt != null ? Number(prt) : null;

  if (p == null || !Number.isFinite(p)) return null;

  if (p > 400_000 && y != null && y >= 2024) return "A";
  if (p >= 200_000 && p <= 400_000 && y != null && y >= 2023) return "B";
  if (p >= 100_000 && p <= 200_000 && y != null && y >= 2022) return "C";
  if (p >= 50_000 && p <= 100_000) return "D";
  if (p < 50_000 || (y != null && y <= 2020)) return "E";

  return "E";
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: rows, error } = await supabase.from("smartphones").select("id, prt_fcfa, annee_sortie, specs");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let n = 0;
  for (const row of rows || []) {
    const cls = computeClasseTekh(row.prt_fcfa, row.annee_sortie, row.specs || {});
    if (cls == null) continue;

    const { error: upErr } = await supabase.from("smartphones").update({ classe_tekh: cls }).eq("id", row.id);
    if (upErr) console.error(row.id, upErr.message);
    else n++;
  }

  console.log(`[assign-classes] ${n} ligne(s) mises à jour.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
