#!/usr/bin/env node
/**
 * Recherche eBay pour les anciens modèles Motorola (One, G7–G10, Edge 2021, etc.)
 * Usage : node scripts/prt/search-motorola-old-ebay.mjs
 */
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const MOTOROLA_OLD_MODELS = [
  // Motorola One 5G series
  "Motorola One 5G",
  "Motorola One 5G Ace",
  "Motorola One 5G UW",
  "Motorola One 5G UW Ace",
  "Motorola One 5G 2021",
];

const DELAY_MS = 600;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pad(str, len) {
  return String(str ?? "").padEnd(len).slice(0, len);
}

async function main() {
  console.log(`\n${"=".repeat(90)}`);
  console.log("  RECHERCHE EBAY — MOTOROLA ONE 5G");
  console.log(`${"=".repeat(90)}`);
  console.log(
    `${pad("MODÈLE", 38)} ${pad("MÉDIANE eBay (€)", 18)} ${pad("PRT FCFA", 14)} ${pad("ANNONCES", 10)} MARCHÉ`
  );
  console.log("-".repeat(90));

  const results = [];
  let ok = 0, noData = 0, errors = 0;

  for (const model of MOTOROLA_OLD_MODELS) {
    try {
      const r = await fetchPrtForModel(model);
      results.push({ model, ...r });

      if (r.sampleSize > 0) {
        const medEur = r.medianEur != null ? `${r.medianEur.toFixed(2)} €` : "—";
        const prtFcfa = r.prtFcfa != null ? `${r.prtFcfa.toLocaleString("fr-FR")} F` : "—";
        console.log(
          `${pad(model, 38)} ${pad(medEur, 18)} ${pad(prtFcfa, 14)} ${pad(r.sampleSize, 10)} ${r.marketplaceUsed ?? ""}`
        );
        ok++;
      } else {
        console.log(`${pad(model, 38)} ${"— (aucun résultat eBay)".padEnd(46)}`);
        noData++;
      }
    } catch (e) {
      console.error(`${pad(model, 38)} ERREUR: ${e.message}`);
      errors++;
    }

    await sleep(DELAY_MS);
  }

  console.log("=".repeat(90));
  console.log(`\nRÉSUMÉ : ${ok} trouvés | ${noData} sans données | ${errors} erreurs`);
  console.log(`Total modèles recherchés : ${MOTOROLA_OLD_MODELS.length}\n`);

  const found = results.filter((r) => r.prtFcfa != null).sort((a, b) => b.prtFcfa - a.prtFcfa);
  if (found.length > 0) {
    console.log("TOP modèles par PRT estimé :");
    for (const r of found) {
      console.log(`  ${pad(r.model, 36)} → ${r.prtFcfa.toLocaleString("fr-FR")} FCFA  (${r.medianEur?.toFixed(2)} €, ${r.sampleSize} annonces)`);
    }
    console.log("");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
