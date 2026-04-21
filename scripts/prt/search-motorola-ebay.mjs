#!/usr/bin/env node
/**
 * Recherche eBay pour tous les modèles Motorola du catalogue TEKH.
 * Affiche : modèle, prix médian eBay (€), PRT FCFA estimé, nb annonces.
 *
 * Usage : node scripts/prt/search-motorola-ebay.mjs
 */
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const MOTOROLA_MODELS = [
  "Motorola Edge 2020",
  "Motorola Edge 2022",
  "Motorola Edge Plus 2020",
  "Motorola Edge Plus 2022",
  "Motorola Edge 20",
  "Motorola Edge 20 Fusion",
  "Motorola Edge 20 Lite",
  "Motorola Edge 20 Pro",
  "Motorola Edge 30",
  "Motorola Edge 30 Neo",
  "Motorola Edge 30 Fusion",
  "Motorola Edge 30 Pro",
  "Motorola Edge 30 Ultra",
  "Motorola Edge 40",
  "Motorola Edge 40 Neo",
  "Motorola Edge 40 Fusion",
  "Motorola Edge 40 Pro",
  "Motorola Edge 50",
  "Motorola Edge 50 Neo",
  "Motorola Edge 50 Fusion",
  "Motorola Edge 50 Pro",
  "Motorola Edge 50 Ultra",
  "Motorola Edge 60 Fusion",
  "Motorola Edge 60 Pro",
  "Motorola Edge 60 Ultra",
  "Motorola Moto E13",
  "Motorola Moto E20",
  "Motorola Moto E22",
  "Motorola Moto E22s",
  "Motorola Moto E40",
  "Motorola Moto G13",
  "Motorola Moto G14",
  "Motorola Moto G23",
  "Motorola Moto G32",
  "Motorola Moto G34 5G",
  "Motorola Moto G53 5G",
  "Motorola Moto G54 5G",
  "Motorola Moto G73 5G",
  "Motorola Moto G84 5G",
  "Motorola Razr 40",
  "Motorola Razr 40 Ultra",
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
  console.log("  RECHERCHE EBAY — MODÈLES MOTOROLA DU CATALOGUE TEKH");
  console.log(`${"=".repeat(90)}`);
  console.log(
    `${pad("MODÈLE", 38)} ${pad("MÉDIANE eBay (€)", 18)} ${pad("PRT FCFA", 14)} ${pad("ANNONCES", 10)} MARCHÉ`
  );
  console.log("-".repeat(90));

  const results = [];
  let ok = 0, noData = 0, errors = 0;

  for (const model of MOTOROLA_MODELS) {
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
  console.log(`Total modèles Motorola recherchés : ${MOTOROLA_MODELS.length}\n`);

  // Tableau trié par PRT décroissant
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
