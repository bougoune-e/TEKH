require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_FILE = 'tab_cleaned.csv';
const JSON_FILE = 'data.json';
const SCRAPER_URL = 'http://localhost:3000/api';

const brandMapping = {
    'xiaomi poco': 'Xiaomi',
    'xiaomi redmi': 'Xiaomi',
    'google pixel': 'Google',
    'red magic': 'ZTE'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function calculateTekhClass(brand, year) {
    if (!year) return 'C';
    const b = (brand || "").toLowerCase();
    const isApple = b === 'apple';
    if (year >= 2024 || (isApple && year >= 2023)) return 'A';
    if ((year >= 2021 && year <= 2023) || (isApple && year >= 2019 && year <= 2022)) return 'B';
    return 'C';
}

async function getMissingSpecs(brand, model) {
    try {
        const { search } = require("./src/services/search");
        const results = await search(`${brand} ${model}`);
        if (results && results.length > 0) {
            const deviceId = results[0].id;
            const deviceUrl = `https://www.gsmarena.com/${deviceId}.php`;
            console.log(`[Scraper] Pausing 3s to avoid rate-limit...`);
            await sleep(3000);
            console.log(`[Scraper] Fetching live specs for ${brand} ${model} -> ${deviceUrl}`);
            const response = await axios.post(`${SCRAPER_URL}/scrapping-device-structure-data`, {
                data: { deviceUrl }
            });
            return {
                specs: response.data.data,
                slug: deviceId
            };
        }
    } catch (err) {
        console.error(`[Scraper] Error fetching specs for ${brand} ${model}:`, err.message);
    }
    return null;
}

async function run() {
    console.log("Starting Database Overhaul...");

    // 0. Connectivity Test
    const { data: testData, error: testErr } = await supabase.from('brands').select('id').limit(1);
    if (testErr) {
        console.error("Supabase Connectivity Test Failed!");
        console.error("Error:", testErr);
        if (testErr.message.includes("Could not find the table")) {
            console.error("\n[IMPORTANT] It seems you haven't run the SQL schema in schema_v2.sql yet.");
            console.error("Please run the SQL in your Supabase dashboard first.");
        }
        return;
    }
    console.log("Supabase Connection: OK");

    // 1. Load Local JSON
    let phoneData = [];
    if (fs.existsSync(JSON_FILE)) {
        phoneData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
        console.log(`Loaded ${phoneData.length} records from local JSON.`);
    }

    const csvData = [];
    await new Promise((resolve) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => csvData.push(row))
            .on('end', resolve);
    });
    console.log(`Loaded ${csvData.length} rows from CSV.`);

    // Group by Brand -> Model -> Variant
    const catalog = {};

    for (const row of csvData) {
        const rawBrand = (row.marques || "").trim();
        const rawModel = (row.modele_exact || "").trim();
        const brandName = brandMapping[rawBrand.toLowerCase()] || rawBrand;

        if (!catalog[brandName]) catalog[brandName] = {};
        if (!catalog[brandName][rawModel]) {
            catalog[brandName][rawModel] = {
                variants: [],
                specs: null,
                slug: null,
                year: parseInt(row.annee_sortie) || null
            };
        }

        catalog[brandName][rawModel].variants.push({
            ram: parseInt(row.ram_gb) || null,
            storage: parseInt(row.stockages_gb) || 0,
            price: parseInt(row.prix_neuf_en_fcfa) || 0
        });
    }

    for (const brandName in catalog) {
        // A. Upsert Brand
        const { data: bData, error: bErr } = await supabase
            .from('brands')
            .upsert({ name: brandName }, { onConflict: 'name' })
            .select()
            .single();

        if (bErr) {
            console.error(`Error upserting brand ${brandName}:`, bErr);
            continue;
        }

        const brandId = bData.id;
        console.log(`\n[Brand] ${brandName} (${brandId})`);

        for (const modelName in catalog[brandName]) {
            const m = catalog[brandName][modelName];

            // B. Find Specs
            let match = phoneData.find(p =>
                p && p.phone_brand && p.phone_model &&
                p.phone_brand.toLowerCase() === brandName.toLowerCase() &&
                p.phone_model.toLowerCase().includes(modelName.toLowerCase())
            );

            if (match) {
                m.specs = match.specs;
                m.slug = match.phone_model.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const launch = match.specs && match.specs.Launch;
                if (launch) {
                    const status = launch.Status || "";
                    const announced = launch.Announced || "";
                    const matchYear = (status + announced).match(/20\d{2}/);
                    if (matchYear) m.year = parseInt(matchYear[0]);
                }
            } else {
                console.log(`[?] Missing specs for ${brandName} ${modelName}. Attempting live scrape...`);
                const liveMatch = await getMissingSpecs(brandName, modelName);
                if (liveMatch) {
                    m.specs = liveMatch.specs;
                    m.slug = liveMatch.slug;
                    // Extract year from live specs if available
                    if (liveMatch.specs.launch && liveMatch.specs.launch.announced) {
                        const yr = liveMatch.specs.launch.announced.match(/20\d{2}/);
                        if (yr) m.year = parseInt(yr[0]);
                    }
                }
            }

            // C. Upsert Model
            const tekhClass = calculateTekhClass(brandName, m.year);
            const { data: mData, error: mErr } = await supabase
                .from('models')
                .upsert({
                    brand_id: brandId,
                    name: modelName,
                    release_year: m.year,
                    equivalence_class: tekhClass,
                    gsmarena_slug: m.slug || `${brandName}_${modelName}`.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                    specifications: m.specs || {}
                }, { onConflict: 'gsmarena_slug' })
                .select()
                .single();

            if (mErr) {
                console.error(`Error upserting model ${modelName}:`, mErr.message);
                continue;
            }

            const modelId = mData.id;
            console.log(`  [Model] ${modelName} -> Class ${tekhClass} (${m.year})`);

            // D. Upsert Variants
            for (const v of m.variants) {
                const { error: vErr } = await supabase
                    .from('variants')
                    .upsert({
                        model_id: modelId,
                        ram_gb: v.ram,
                        storage_gb: v.storage,
                        base_price_fcfa: v.price
                    }, { onConflict: 'model_id,ram_gb,storage_gb' });

                if (vErr) {
                    console.error(`    Error upserting variant ${v.ram}/${v.storage}:`, vErr.message);
                }
            }
        }
    }

    console.log("\nMajor Import Completed!");
}

run();
