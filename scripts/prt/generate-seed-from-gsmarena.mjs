#!/usr/bin/env node
/**
 * Génère seeds/smartphones.json à partir de gsmarena-api/data.json
 * (liste type référence ~1520 smartphones, hors montres / tablettes évidentes).
 *
 * Variables :
 *   SEED_MAX_ROWS=1520   — nombre max de modèles (défaut 1520)
 *   SEED_GSMARENA_PATH    — chemin JSON (défaut gsmarena-api/data.json à la racine repo)
 *
 * npm run prt:generate-seed-gsmarena
 */
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

const MAX_ROWS = Math.max(1, Number(process.env.SEED_MAX_ROWS) || 1520);
const DATA_PATH = process.env.SEED_GSMARENA_PATH
  ? join(root, process.env.SEED_GSMARENA_PATH)
  : join(root, "gsmarena-api/data.json");

function formatMarque(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Ex. "128GB 8GB RAM" → "128GB" */
function extractVariante(specs) {
  const internal = specs?.Memory?.Internal;
  if (typeof internal !== "string") return "";
  const m = internal.match(/(\d+)\s*GB/i);
  if (m) return `${parseInt(m[1], 10)}GB`;
  return "";
}

function extractYear(specs) {
  const ann = specs?.Launch?.Announced;
  if (typeof ann !== "string") return null;
  const y = ann.match(/(\d{4})/);
  return y ? parseInt(y[1], 10) : null;
}

function extractStockageGb(specs) {
  const internal = specs?.Memory?.Internal;
  if (typeof internal !== "string") return 128;
  const m = internal.match(/(\d+)\s*GB/i);
  return m ? parseInt(m[1], 10) : 128;
}

function isLikelySmartphone(e) {
  const m = (e.phone_model || "").toLowerCase();
  if (
    /smart watch|smartwatch|watch\b|band \d|earbuds|buds\b|headphone|tablet\b|pad\b|tv\b|glass\b|bracelet/.test(
      m
    )
  ) {
    return false;
  }
  const sizeStr = e.specs?.Display?.Size || "";
  const inch = parseFloat(String(sizeStr).match(/(\d+\.?\d*)\s*inches/)?.[1] || "0");
  if (inch > 0 && inch < 5) return false;
  return true;
}

function buildSpecs(e) {
  const net = e.specs?.Network || {};
  const speed = String(net.Speed || "");
  const is5g = /5G/i.test(JSON.stringify(net)) || /5g/i.test(speed);
  return {
    reseau: is5g ? "5G" : "4G",
    "5g": is5g,
    stockage_gb: extractStockageGb(e.specs),
  };
}

function main() {
  const raw = readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error("[generate-seed-gsmarena] data.json doit être un tableau.");
    process.exit(1);
  }

  const seen = new Set();
  const rows = [];

  for (const e of data) {
    if (!isLikelySmartphone(e)) continue;
    const marque = formatMarque(e.phone_brand);
    const modele = String(e.phone_model || "").trim();
    const variante = extractVariante(e.specs);
    if (!marque || !modele) continue;

    const key = `${marque}|${modele}|${variante}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      marque,
      modele,
      variante,
      annee_sortie: extractYear(e.specs),
      statut: "disponible",
      specs: buildSpecs(e),
      facteur_afrique: 1,
    });

    if (rows.length >= MAX_ROWS) break;
  }

  mkdirSync(join(root, "seeds"), { recursive: true });
  const outPath = join(root, "seeds/smartphones.json");
  writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(
    `[generate-seed-gsmarena] ${rows.length} ligne(s) (max ${MAX_ROWS}) → ${outPath} (source: ${DATA_PATH})`
  );
}

main();
