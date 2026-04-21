#!/usr/bin/env node
/**
 * Patch direct Supabase : met à jour prt_fcfa pour Samsung Galaxy S9 / S9+
 * à partir des valeurs officielles TEKH.
 *
 * Usage : node scripts/prt/patch-samsung-s9-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv } from "./load-env.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
  process.exit(1);
}

const PATCHES = [
  { modele: "Samsung galaxy s9",        variante: "64GB",  prt: 48000 },
  { modele: "Samsung galaxy s9",        variante: "128GB", prt: 60000 },
  { modele: "Samsung galaxy s9",        variante: "256GB", prt: 83000 },
  { modele: "Samsung galaxy s9 active", variante: "64GB",  prt: 77500 },
  { modele: "Samsung galaxy s9+",       variante: "64GB",  prt: 63000 },
  { modele: "Samsung galaxy s9+",       variante: "128GB", prt: 76000 },
  { modele: "Samsung galaxy s9+",       variante: "256GB", prt: 89000 },
];

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  console.log("\n=== PATCH SUPABASE — Samsung S9 / S9+ ===\n");

  // Lire d'abord toutes les lignes correspondantes pour voir l'état actuel
  const { data: rows, error: fetchErr } = await supabase
    .from("smartphones")
    .select("id, marque, modele, variante, prt_fcfa")
    .ilike("modele", "Samsung galaxy s9%");

  if (fetchErr) {
    console.error("Erreur lecture Supabase :", fetchErr.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.warn("Aucune ligne trouvée pour 'Samsung galaxy s9%' en base.");
    console.log("Vérifiez le nom exact du modèle dans Supabase.");
    process.exit(0);
  }

  console.log(`${rows.length} ligne(s) trouvée(s) en base :\n`);
  for (const r of rows) {
    console.log(`  [${r.id}] ${r.modele} | ${r.variante} | PRT actuel : ${r.prt_fcfa ?? "NULL"} FCFA`);
  }

  console.log("\n--- Application des patches ---\n");

  let ok = 0, skip = 0, notFound = 0;

  for (const patch of PATCHES) {
    // Chercher la ligne correspondante (insensible à la casse)
    const match = rows.find(
      (r) =>
        r.modele?.toLowerCase() === patch.modele.toLowerCase() &&
        r.variante?.toLowerCase() === patch.variante.toLowerCase()
    );

    if (!match) {
      console.warn(`  NOT FOUND : ${patch.modele} ${patch.variante}`);
      notFound++;
      continue;
    }

    if (match.prt_fcfa === patch.prt) {
      console.log(`  SKIP (déjà OK) : ${patch.modele} ${patch.variante} → ${patch.prt} FCFA`);
      skip++;
      continue;
    }

    const { error: updErr } = await supabase
      .from("smartphones")
      .update({ prt_fcfa: patch.prt, prt_updated_at: new Date().toISOString() })
      .eq("id", match.id);

    if (updErr) {
      console.error(`  ERREUR : ${patch.modele} ${patch.variante} — ${updErr.message}`);
    } else {
      console.log(`  OK : ${patch.modele} ${patch.variante} → ${match.prt_fcfa ?? "NULL"} → ${patch.prt} FCFA`);
      ok++;
    }
  }

  console.log(`\n=== RÉSUMÉ : ${ok} mis à jour | ${skip} inchangés | ${notFound} non trouvés ===\n`);

  if (notFound > 0) {
    console.log("Modèles non trouvés — noms exacts dans Supabase :");
    for (const r of rows) {
      console.log(`  modele="${r.modele}" variante="${r.variante}"`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
