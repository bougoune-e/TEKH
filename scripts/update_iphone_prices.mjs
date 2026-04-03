#!/usr/bin/env node
/**
 * Updates iPhone prices in prix-a-remplir.csv based on real market data.
 * Also removes duplicate entries (keeps one version per model/storage).
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(__dirname, "..", "prix-a-remplir.csv");

// ═══════════════════════════════════════════════════
// PRIX RÉELS - marché Afrique de l'Ouest (FCFA)
// ═══════════════════════════════════════════════════
const PRICE_MAP = {
    // ─── iPhone 11 ───
    "iphone 11|64gb": 115000,
    "iphone 11|128gb": 125000,
    "iphone 11|256gb": 140000,

    // ─── iPhone 11 Pro ───
    "iphone 11 pro|64gb": 150000,
    "iphone 11 pro|128gb": 160000,
    "iphone 11 pro|256gb": 175000,
    "iphone 11 pro|512gb": 190000,

    // ─── iPhone 11 Pro Max ───
    "iphone 11 pro max|64gb": 175000,
    "iphone 11 pro max|128gb": 185000,
    "iphone 11 pro max|256gb": 200000,
    "iphone 11 pro max|512gb": 215000,

    // ─── iPhone 12 Mini ───
    "iphone 12 mini|64gb": 120000,
    "iphone 12 mini|128gb": 130000,
    "iphone 12 mini|256gb": 145000,

    // ─── iPhone 12 ───
    "iphone 12|64gb": 140000,
    "iphone 12|128gb": 150000,
    "iphone 12|256gb": 165000,

    // ─── iPhone 12 Pro ───
    "iphone 12 pro|128gb": 180000,
    "iphone 12 pro|256gb": 195000,
    "iphone 12 pro|512gb": 215000,

    // ─── iPhone 12 Pro Max ───
    "iphone 12 pro max|128gb": 210000,
    "iphone 12 pro max|256gb": 225000,
    "iphone 12 pro max|512gb": 245000,

    // ─── iPhone 13 Mini ───
    "iphone 13 mini|128gb": 155000,
    "iphone 13 mini|256gb": 170000,
    "iphone 13 mini|512gb": 190000,

    // ─── iPhone 13 ───
    "iphone 13|128gb": 175000,
    "iphone 13|256gb": 195000,
    "iphone 13|512gb": 215000,

    // ─── iPhone 13 Pro ───
    "iphone 13 pro|128gb": 210000,
    "iphone 13 pro|256gb": 230000,
    "iphone 13 pro|512gb": 250000,
    "iphone 13 pro|1024gb": 275000,

    // ─── iPhone 13 Pro Max ───
    "iphone 13 pro max|128gb": 245000,
    "iphone 13 pro max|256gb": 265000,
    "iphone 13 pro max|512gb": 285000,
    "iphone 13 pro max|1024gb": 310000,

    // ─── iPhone 14 ───
    "iphone 14|128gb": 210000,
    "iphone 14|256gb": 230000,
    "iphone 14|512gb": 250000,

    // ─── iPhone 14 Plus ───
    "iphone 14 plus|128gb": 230000,
    "iphone 14 plus|256gb": 250000,
    "iphone 14 plus|512gb": 270000,

    // ─── iPhone 14 Pro ───
    "iphone 14 pro|128gb": 255000,
    "iphone 14 pro|256gb": 275000,
    "iphone 14 pro|512gb": 295000,
    "iphone 14 pro|1024gb": 325000,

    // ─── iPhone 14 Pro Max ───
    "iphone 14 pro max|128gb": 280000,
    "iphone 14 pro max|256gb": 310000,
    "iphone 14 pro max|512gb": 340000,
    "iphone 14 pro max|1024gb": 370000,

    // ─── iPhone 15 (+35k over iPhone 14 equivalents) ───
    "iphone 15|128gb": 245000,
    "iphone 15|256gb": 265000,
    "iphone 15|512gb": 285000,

    // ─── iPhone 15 Plus ───
    "iphone 15 plus|128gb": 265000,
    "iphone 15 plus|256gb": 285000,
    "iphone 15 plus|512gb": 305000,

    // ─── iPhone 15 Pro ───
    "iphone 15 pro|128gb": 295000,
    "iphone 15 pro|256gb": 315000,
    "iphone 15 pro|512gb": 340000,
    "iphone 15 pro|1024gb": 370000,

    // ─── iPhone 15 Pro Max ───
    "iphone 15 pro max|256gb": 350000,
    "iphone 15 pro max|512gb": 380000,
    "iphone 15 pro max|1024gb": 410000,
};

const csv = readFileSync(CSV_PATH, "utf-8");
const lines = csv.split("\n");
const header = lines[0];

// Parse CSV rows
function parseLine(line) {
    const parts = [];
    let inQuotes = false;
    let field = "";
    for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; field += ch; }
        else if (ch === "," && !inQuotes) { parts.push(field); field = ""; }
        else { field += ch; }
    }
    parts.push(field);
    return parts;
}

// Track which model+storage combos we've already seen (for dedup)
const seenKeys = new Set();
const output = [header];
let updated = 0;
let removed = 0;

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseLine(line);
    if (parts.length < 7) { output.push(line); continue; }

    const [id, marque, modeleRaw, variante, annee, prtRaw, facteur] = parts;
    const modele = modeleRaw.replace(/"/g, "").trim();
    const storage = variante.trim();

    // Only process Apple
    if (marque.trim() !== "Apple") {
        output.push(line);
        continue;
    }

    // Create dedup key (case-insensitive)
    const dedupKey = `${modele.toLowerCase()}|${storage.toLowerCase()}`;

    // Check if we already have this model+storage
    if (seenKeys.has(dedupKey)) {
        removed++;
        continue; // Skip duplicate
    }
    seenKeys.add(dedupKey);

    // Normalize model name for price lookup
    const lookupKey = `${modele.toLowerCase()}|${storage.toLowerCase()}`;

    if (PRICE_MAP[lookupKey] !== undefined) {
        const newPrice = PRICE_MAP[lookupKey];
        // Rebuild line with updated price, normalize model name casing, set facteur to 1
        const normalizedModele = modele
            .replace(/^IPhone/i, "iPhone")
            .replace(/^Iphone/i, "iPhone");
        output.push(`${id},${marque},"${normalizedModele}",${storage},${annee},${newPrice},1`);
        updated++;
    } else {
        // Normalize model name even if price not in our map
        const normalizedModele = modele
            .replace(/^IPhone/i, "iPhone")
            .replace(/^Iphone/i, "iPhone");
        output.push(`${id},${marque},"${normalizedModele}",${storage},${annee},${prtRaw},${facteur}`);
    }
}

writeFileSync(CSV_PATH, output.join("\n") + "\n", "utf-8");
console.log(`✅ ${updated} prix mis à jour`);
console.log(`🗑️  ${removed} doublons supprimés`);
console.log(`📄 Total lignes: ${output.length}`);
