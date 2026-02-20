require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erreur: SUPABASE_URL ou SUPABASE_KEY manquant dans le fichier .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_FILE = 'tab_cleaned.csv';
const JSON_FILE = 'data.json';
const TABLE_NAME = 'models';

/**
 * Algorithme de Classement Tekh+
 */
function calculateTekhClass(brand, year) {
    if (!year) return 'C';
    const isApple = brand && brand.toLowerCase() === 'apple';
    if (year >= 2024 || (isApple && year >= 2023)) return 'A';
    if ((year >= 2021 && year <= 2023) || (isApple && year >= 2019 && year <= 2022)) return 'B';
    return 'C';
}

/**
 * Extrait l'année de sortie depuis les specs du JSON
 */
function extractReleaseYear(deviceData) {
    const launch = deviceData.specs && deviceData.specs.Launch;
    if (!launch) return null;
    const status = launch.Status || "";
    const announced = launch.Announced || "";
    const match = (status + announced).match(/20\d{2}/);
    return match ? parseInt(match[0], 10) : null;
}

async function importCatalog() {
    console.log(`Chargement de ${JSON_FILE}...`);
    let phoneData = [];
    try {
        const rawJson = fs.readFileSync(JSON_FILE, 'utf8');
        phoneData = JSON.parse(rawJson);
        console.log(`${phoneData.length} records chargés depuis le JSON.`);
    } catch (err) {
        console.error(`Erreur lors de la lecture du fichier JSON: ${err.message}`);
        process.exit(1);
    }

    const uniqueModels = new Map(); // key: "brand|model", value: {brand, model}
    console.log(`Lecture de ${CSV_FILE}...`);
    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                if (row.marques && row.modele_exact) {
                    const key = `${row.marques.trim()}|${row.modele_exact.trim()}`;
                    if (!uniqueModels.has(key)) {
                        uniqueModels.set(key, {
                            brand: row.marques.trim(),
                            model: row.modele_exact.trim()
                        });
                    }
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`${uniqueModels.size} modèles uniques à importer. Début du traitement...`);

    let count = 0;
    for (const [key, item] of uniqueModels) {
        count++;
        const { brand, model } = item;

        const cModel = model.toLowerCase();
        const cBrand = brand.toLowerCase();
        const fullCSV = `${brand} ${model}`.toLowerCase();

        // Recherche dans le JSON avec une logique plus souple
        let match = phoneData.find(p => {
            const pModel = (p.phone_model || "").toLowerCase();
            const pBrand = (p.phone_brand || "").toLowerCase();

            // 1. Match exact du modèle
            if (pModel === cModel) return true;

            // 2. Match exact du full name (Brand + Model du CSV)
            if (pModel === fullCSV) return true;

            // 3. Si le modèle du JSON contient le modèle du CSV
            // ET qu'il y a un rapport de marque (soit la marque matchée, soit présente dans le nom)
            if (pModel.includes(cModel)) {
                if (pBrand.includes(cBrand) || cBrand.includes(pBrand) || pModel.includes(cBrand)) {
                    return true;
                }
            }

            return false;
        });

        if (!match) {
            console.log(`[-] [${count}/${uniqueModels.size}] Non trouvé : ${brand} ${model}`);
            continue;
        }

        const releaseYear = extractReleaseYear(match);
        const tekhClass = calculateTekhClass(match.phone_brand, releaseYear);

        const modelData = {
            brand: match.phone_brand,
            name: match.phone_model,
            release_year: releaseYear,
            image_url: null,
            equivalence_class: tekhClass,
            gsmarena_slug: match.phone_model.toLowerCase().replace(/[^a-z0-9]/g, '_')
        };

        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert(modelData, { onConflict: 'gsmarena_slug' });

        if (error) {
            console.error(`[!] [${count}/${uniqueModels.size}] Erreur Supabase pour ${brand} ${model}:`, error.message);
        } else {
            console.log(`[OK] [${count}/${uniqueModels.size}] ${brand} ${model} -> ${tekhClass} (${releaseYear})`);
        }
    }

    console.log('\nImportation terminée.');
}

importCatalog();
