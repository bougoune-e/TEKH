#!/usr/bin/env node
/**
 * Importe seeds/smartphones.json dans public.smartphones (upsert).
 * Requiert la migration 20250321120000_smartphones_tekh_points.sql appliquée.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const path = join(REPO_ROOT, "seeds/smartphones.json");
  const raw = readFileSync(path, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error("seeds/smartphones.json doit être un tableau non vide.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const batch = rows.map((r) => ({
    marque: String(r.marque).trim(),
    modele: String(r.modele).trim(),
    variante: r.variante != null && String(r.variante).trim() !== "" ? String(r.variante).trim() : "",
    annee_sortie: r.annee_sortie != null ? Number(r.annee_sortie) : null,
    statut: r.statut || "disponible",
    specs: r.specs && typeof r.specs === "object" ? r.specs : {},
    facteur_afrique: r.facteur_afrique != null ? Number(r.facteur_afrique) : 1,
    classe_tekh: r.classe_tekh || null,
    prt_fcfa: r.prt_fcfa != null ? Number(r.prt_fcfa) : null,
    prix_ebay_eur: r.prix_ebay_eur != null ? Number(r.prix_ebay_eur) : null,
  }));

  const CHUNK = 150;
  for (let i = 0; i < batch.length; i += CHUNK) {
    const slice = batch.slice(i, i + CHUNK);
    const { error } = await supabase.from("smartphones").upsert(slice, {
      onConflict: "marque,modele,variante",
    });
    if (error) {
      console.error("[seed] erreur upsert:", error.message);
      process.exit(1);
    }
    console.log(`[seed] ${Math.min(i + CHUNK, batch.length)}/${batch.length}…`);
  }

  console.log(`[seed] ${batch.length} ligne(s) importées (upsert par lots).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
