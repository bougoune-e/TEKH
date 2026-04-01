/**
 * import-missing-from-csv.mjs
 * 
 * Reads the CSV reference file, compares with existing Supabase `smartphones` table,
 * and inserts missing models with prices adjusted by Africa factor (0.4) for prices
 * between 150,000 and 1,500,000 FCFA.
 */
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";
loadRepoEnv();

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) { console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon"}`);
const supabase = createClient(url, key);

const FACTEUR_AFRIQUE = 0.4;
const PRICE_MIN = 150_000;
const PRICE_MAX = 1_500_000;

// ────── Brand normalization map ──────
const BRAND_MAP = {
    "apple": "Apple",
    "samsung": "Samsung",
    "xiaomi": "Xiaomi",
    "xiaomi ": "Xiaomi",
    "xiaomi poco": "Poco",
    "xiaomi redmi": "Xiaomi",
    "xiaomi redmi ": "Xiaomi",
    "tecno": "Tecno",
    "infinix": "Infinix",
    "google pixel": "Google",
    "google": "Google",
    "huawei": "Huawei",
    "honor": "Honor",
    "oppo": "Oppo",
    "realme": "Realme",
    "vivo": "Vivo",
    "one plus": "OnePlus",
    "oneplus": "OnePlus",
    "motorola": "Motorola",
    "motorola ": "Motorola",
    "lg": "LG",
    "asus": "Asus",
    "lenovo": "Lenovo",
    "red magic": "Red Magic",
    "red magic ": "Red Magic",
    "zte": "ZTE",
    "poco": "Poco",
    "sony": "Sony",
    "itel": "Itel",
};

function normalizeBrand(raw) {
    if (!raw) return null;
    const lower = raw.trim().toLowerCase();
    // Try exact match first, then progressive prefix match
    if (BRAND_MAP[lower]) return BRAND_MAP[lower];
    for (const [key, val] of Object.entries(BRAND_MAP)) {
        if (lower === key || lower.startsWith(key)) return val;
    }
    // Fallback: capitalize first letter
    return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
}

function normalizeModel(rawBrand, rawModel) {
    if (!rawModel) return null;
    let model = rawModel.trim();
    // Remove brand prefix from model name if present
    const brandLower = rawBrand?.trim().toLowerCase() || "";
    const modelLower = model.toLowerCase();

    // For brands like "Xiaomi Redmi", the model might start with "redmi note 10"
    // For "Samsung", the model might start with "Samsung galaxy a01"
    // We want to keep the model as-is but normalize casing

    // Capitalize first letter of each word
    model = model.replace(/\b\w/g, c => c.toUpperCase());

    return model;
}

function parseCSV(content) {
    const lines = content.split("\n").map(l => l.replace(/\r$/, ""));
    const header = lines[0].split(",");
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        if (parts.length < 5) continue;

        const rawBrand = parts[0]?.trim();
        const rawModel = parts[1]?.trim();
        const rawStorage = parts[2]?.trim();
        const rawPrice = parts[3]?.trim().replace(/[^\d]/g, ''); // Remove non-digit chars like spaces
        const rawClasse = parts[4]?.trim();
        const rawRam = parts[5]?.trim().replace(/[^\d]/g, '');
        const rawYear = parts[6]?.trim();

        if (!rawModel) continue;

        const brand = normalizeBrand(rawBrand || "");
        if (!brand) continue;

        const storage = parseInt(rawStorage) || null;
        const price = parseInt(rawPrice) || null;
        const ram = parseInt(rawRam) || null;
        const year = parseInt(rawYear) || null;
        const classe = rawClasse || null;

        rows.push({
            brand,
            model: normalizeModel(rawBrand, rawModel),
            storage,
            price,
            classe,
            ram,
            year,
        });
    }

    return rows;
}

function computePRT(price) {
    if (!price) return null;
    if (price >= PRICE_MIN && price <= PRICE_MAX) {
        return Math.round(price * FACTEUR_AFRIQUE);
    }
    // For prices outside the range, still apply factor but flag it
    return Math.round(price * FACTEUR_AFRIQUE);
}

async function getExistingPhones() {
    console.log("Fetching existing phones from Supabase...");
    const all = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from("smartphones")
            .select("marque, modele, variante")
            .range(from, from + batchSize - 1);

        if (error) { console.error("Error fetching:", error.message); break; }
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < batchSize) break;
        from += batchSize;
    }

    console.log(`Found ${all.length} existing phones in DB.`);
    return all;
}

function makeKey(brand, model, storage) {
    return `${(brand || "").toLowerCase()}|${(model || "").toLowerCase()}|${storage || ""}`;
}

async function main() {
    // 1. Read CSV
    const csvPath = join(REPO_ROOT, "tableau de reference algorithmique - Sheet1 (2).csv");
    const content = readFileSync(csvPath, "utf-8");
    const csvRows = parseCSV(content);
    console.log(`Parsed ${csvRows.length} rows from CSV.`);

    // 2. Get existing phones
    const existing = await getExistingPhones();
    const existingKeys = new Set();
    for (const row of existing) {
        existingKeys.add(makeKey(row.marque, row.modele,
            (row.variante || "").replace(/\D/g, '')));
    }

    // 3. Find missing phones
    const missing = [];
    const seen = new Set();

    for (const row of csvRows) {
        const storageStr = row.storage ? String(row.storage) : "";
        const key = makeKey(row.brand, row.model, storageStr);

        // Skip if already exists in DB or already seen in CSV (dedup)
        if (existingKeys.has(key)) continue;
        if (seen.has(key)) continue;
        seen.add(key);

        const prt = computePRT(row.price);

        missing.push({
            id: randomUUID(),
            marque: row.brand,
            modele: row.model,
            variante: row.storage ? `${row.storage}GB` : null,
            annee_sortie: row.year,
            classe_tekh: row.classe,
            prt_fcfa: prt,
            facteur_afrique: FACTEUR_AFRIQUE,
            specs: {
                stockage_gb: row.storage,
                ram_gb: row.ram,
            },
            prt_updated_at: new Date().toISOString(),
        });
    }

    console.log(`\nFound ${missing.length} missing phones to insert.`);

    if (missing.length === 0) {
        console.log("Nothing to insert. All phones from CSV already exist in DB.");
        return;
    }

    // Print summary by brand
    const byBrand = {};
    for (const m of missing) {
        byBrand[m.marque] = (byBrand[m.marque] || 0) + 1;
    }
    console.log("\nMissing by brand:");
    for (const [brand, count] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${brand}: ${count}`);
    }

    // 4. Insert in batches
    const BATCH_SIZE = 50;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("smartphones").upsert(batch, {
            onConflict: "id",
            ignoreDuplicates: false,
        });

        if (error) {
            console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
            errorCount += batch.length;
        } else {
            insertedCount += batch.length;
            process.stdout.write(`\rInserted ${insertedCount}/${missing.length}...`);
        }
    }

    console.log(`\n\n✅ Done! Inserted ${insertedCount} phones. Errors: ${errorCount}.`);

    // 5. Verify total count
    const { count } = await supabase
        .from("smartphones")
        .select("id", { count: "exact", head: true });
    console.log(`Total phones in DB now: ${count}`);

    // 6. Show sample of inserted data
    console.log("\nSample of inserted phones:");
    for (const m of missing.slice(0, 10)) {
        console.log(`  ${m.marque} | ${m.modele} | ${m.variante} | PRT: ${m.prt_fcfa} FCFA | Classe: ${m.classe_tekh} | Année: ${m.annee_sortie}`);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
