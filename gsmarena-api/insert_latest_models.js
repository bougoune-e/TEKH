/**
 * TEKH+ — Insert latest 2025-2026 smartphone models into Supabase `smartphones` table.
 * Avoids duplicates via upsert on (marque, modele, variante).
 * Run: node gsmarena-api/insert_latest_models.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://zkdmdohothspysricfmw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZG1kb2hvdGhzcHlzcmljZm13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyMzQzNywiZXhwIjoyMDg0NTk5NDM3fQ.bSe7NlK0lyIWu71IXUZ18wK7OT59dGATGiN3Xy379D8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Brand grouping for reference:
 * - Xiaomi parent: Redmi, Poco
 * - Transsion parent: Tecno, Infinix, Itel
 * - Sony (standalone)
 * - Vivo (standalone, includes iQOO sub-brand)
 */

// category: F=flagship, M=midrange, B=budget
const MODELS = [
    // ═══════════════ APPLE ═══════════════
    // 2025
    { marque: "Apple", modele: "iPhone 17 Pro Max", annee: 2026, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Apple", modele: "iPhone 17 Pro", annee: 2026, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Apple", modele: "iPhone 17", annee: 2026, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Apple", modele: "iPhone 17 Air", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Apple", modele: "iPhone 16e", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Apple", modele: "iPhone 16 Pro Max", annee: 2025, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Apple", modele: "iPhone 16 Pro", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB", "1TB"] },
    { marque: "Apple", modele: "iPhone 16 Plus", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Apple", modele: "iPhone 16", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Apple", modele: "iPhone SE (2022)", annee: 2022, cat: "M", variants: ["64GB", "128GB", "256GB"] },

    // ═══════════════ SAMSUNG ═══════════════
    // 2026
    { marque: "Samsung", modele: "Galaxy S26 Ultra", annee: 2026, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Samsung", modele: "Galaxy S26+", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Samsung", modele: "Galaxy S26", annee: 2026, cat: "F", variants: ["128GB", "256GB"] },
    // 2025
    { marque: "Samsung", modele: "Galaxy S25 Ultra", annee: 2025, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Samsung", modele: "Galaxy S25+", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Samsung", modele: "Galaxy S25", annee: 2025, cat: "F", variants: ["128GB", "256GB"] },
    { marque: "Samsung", modele: "Galaxy S25 Edge", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Samsung", modele: "Galaxy S25 FE", annee: 2025, cat: "F", variants: ["128GB", "256GB"] },
    { marque: "Samsung", modele: "Galaxy Z Fold7", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Samsung", modele: "Galaxy Z Flip7", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Samsung", modele: "Galaxy A56", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Samsung", modele: "Galaxy A36", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Samsung", modele: "Galaxy A26", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Samsung", modele: "Galaxy A16", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },
    { marque: "Samsung", modele: "Galaxy M36", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },

    // ═══════════════ TECNO (Transsion) ═══════════════
    // 2026
    { marque: "Tecno", modele: "Camon 50 Ultra 5G", annee: 2026, cat: "F", variants: ["256GB"] },
    { marque: "Tecno", modele: "Camon 50 Pro 5G", annee: 2026, cat: "M", variants: ["256GB"] },
    { marque: "Tecno", modele: "Camon 50", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Pova Curve 2 5G", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Spark 50 5G", annee: 2026, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Spark Go 3", annee: 2026, cat: "B", variants: ["64GB", "128GB"] },
    { marque: "Tecno", modele: "Phantom V Fold 2 5G", annee: 2026, cat: "F", variants: ["512GB"] },
    { marque: "Tecno", modele: "Phantom V Flip 2 5G", annee: 2026, cat: "F", variants: ["256GB"] },
    { marque: "Tecno", modele: "Pop X", annee: 2026, cat: "B", variants: ["64GB", "128GB"] },
    // 2025
    { marque: "Tecno", modele: "Pova Slim 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Pova Curve 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Pova 7 Pro 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Pova 7 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Camon 40 Premier 5G", annee: 2025, cat: "F", variants: ["256GB"] },
    { marque: "Tecno", modele: "Spark Slim", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Spark 40 Pro+", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Tecno", modele: "Spark 40 Pro", annee: 2025, cat: "M", variants: ["128GB"] },
    { marque: "Tecno", modele: "Spark 40", annee: 2025, cat: "B", variants: ["128GB"] },
    { marque: "Tecno", modele: "Spark 40C", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },
    { marque: "Tecno", modele: "Spark Go 5G", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ INFINIX (Transsion) ═══════════════
    // 2026
    { marque: "Infinix", modele: "GT 30 Pro", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Infinix", modele: "GT 30", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Infinix", modele: "Note 50s 5G+", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Infinix", modele: "Note 60 Ultra", annee: 2026, cat: "F", variants: ["256GB"] },
    { marque: "Infinix", modele: "Note 50X", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    // 2025
    { marque: "Infinix", modele: "Zero 40 5G", annee: 2025, cat: "F", variants: ["256GB"] },
    { marque: "Infinix", modele: "Hot 50 Pro+", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Infinix", modele: "Hot 50 Pro", annee: 2025, cat: "M", variants: ["128GB"] },
    { marque: "Infinix", modele: "Hot 60", annee: 2025, cat: "B", variants: ["128GB"] },
    { marque: "Infinix", modele: "Hot 60i 5G", annee: 2025, cat: "B", variants: ["128GB"] },
    { marque: "Infinix", modele: "Smart 9", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ ITEL (Transsion) ═══════════════
    { marque: "Itel", modele: "P55 5G", annee: 2025, cat: "B", variants: ["128GB"] },
    { marque: "Itel", modele: "P55+", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Itel", modele: "P55", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },
    { marque: "Itel", modele: "S24", annee: 2025, cat: "B", variants: ["128GB"] },
    { marque: "Itel", modele: "S25", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Itel", modele: "A70", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ REDMI (Xiaomi sub-brand) ═══════════════
    // 2026
    { marque: "Redmi", modele: "Note 15 Pro 5G", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Redmi", modele: "Note 15", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Redmi", modele: "Note 14 SE", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    // 2025
    { marque: "Redmi", modele: "Note 14 Pro+ 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Redmi", modele: "Note 14 Pro", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Redmi", modele: "Note 14", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Redmi", modele: "15C", annee: 2025, cat: "B", variants: ["64GB", "128GB", "256GB"] },
    { marque: "Redmi", modele: "15", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },
    { marque: "Redmi", modele: "14C", annee: 2025, cat: "B", variants: ["64GB", "128GB", "256GB"] },
    { marque: "Redmi", modele: "A3", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ POCO (Xiaomi sub-brand) ═══════════════
    // 2026
    { marque: "Poco", modele: "X8 Pro Max 5G", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Poco", modele: "X8 Pro 5G", annee: 2026, cat: "M", variants: ["256GB"] },
    { marque: "Poco", modele: "C85x", annee: 2026, cat: "B", variants: ["64GB", "128GB"] },
    // 2025
    { marque: "Poco", modele: "X7 Pro 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Poco", modele: "X7", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Poco", modele: "M7 Pro 5G", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Poco", modele: "F6 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Poco", modele: "F6", annee: 2025, cat: "M", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Poco", modele: "C75", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ REALME ═══════════════
    { marque: "Realme", modele: "GT 7 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Realme", modele: "GT 6", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Realme", modele: "13 Pro+", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Realme", modele: "13 Pro", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Realme", modele: "Narzo 70 Pro", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Realme", modele: "C67", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },
    { marque: "Realme", modele: "C55", annee: 2025, cat: "B", variants: ["64GB", "128GB"] },

    // ═══════════════ OPPO ═══════════════
    { marque: "Oppo", modele: "Find X8 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Oppo", modele: "Find X8", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Oppo", modele: "Reno 12 Pro", annee: 2025, cat: "M", variants: ["256GB"] },
    { marque: "Oppo", modele: "Reno 12", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Oppo", modele: "A3 Pro", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Oppo", modele: "A2", annee: 2025, cat: "B", variants: ["128GB", "256GB"] },

    // ═══════════════ ONEPLUS ═══════════════
    { marque: "OnePlus", modele: "13", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "OnePlus", modele: "13R", annee: 2025, cat: "F", variants: ["128GB", "256GB"] },
    { marque: "OnePlus", modele: "12", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "OnePlus", modele: "Nord 4", annee: 2025, cat: "M", variants: ["128GB", "256GB", "512GB"] },
    { marque: "OnePlus", modele: "Nord CE4", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "OnePlus", modele: "Open", annee: 2025, cat: "F", variants: ["512GB"] },

    // ═══════════════ GOOGLE ═══════════════
    { marque: "Google", modele: "Pixel 9 Pro XL", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB", "1TB"] },
    { marque: "Google", modele: "Pixel 9 Pro", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Google", modele: "Pixel 9", annee: 2025, cat: "F", variants: ["128GB", "256GB"] },
    { marque: "Google", modele: "Pixel 9a", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },

    // ═══════════════ HONOR ═══════════════
    { marque: "Honor", modele: "Magic7 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Honor", modele: "Magic6 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Honor", modele: "Magic V3", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Honor", modele: "200 Pro", annee: 2025, cat: "M", variants: ["256GB", "512GB"] },
    { marque: "Honor", modele: "200", annee: 2025, cat: "M", variants: ["256GB"] },
    { marque: "Honor", modele: "X9b", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },

    // ═══════════════ HUAWEI ═══════════════
    { marque: "Huawei", modele: "Pura 70 Ultra", annee: 2025, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Huawei", modele: "Pura 70 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Huawei", modele: "Mate 60 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB", "1TB"] },
    { marque: "Huawei", modele: "Nova 12 Ultra", annee: 2025, cat: "M", variants: ["256GB", "512GB"] },
    { marque: "Huawei", modele: "Nova 12", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },

    // ═══════════════ NOTHING ═══════════════
    { marque: "Nothing", modele: "Phone (3)", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Nothing", modele: "Phone (2a) Plus", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Nothing", modele: "Phone (2a)", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },

    // ═══════════════ MOTOROLA ═══════════════
    { marque: "Motorola", modele: "Edge 50 Ultra", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Motorola", modele: "Edge 50 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Motorola", modele: "Razr 50 Ultra", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Motorola", modele: "Razr 50", annee: 2025, cat: "F", variants: ["256GB"] },
    { marque: "Motorola", modele: "Moto G85", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Motorola", modele: "Moto G54", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Motorola", modele: "ThinkPhone", annee: 2025, cat: "F", variants: ["256GB"] },

    // ═══════════════ SONY ═══════════════
    { marque: "Sony", modele: "Xperia 1 VII", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Sony", modele: "Xperia 1 VI", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Sony", modele: "Xperia 10 VII", annee: 2025, cat: "M", variants: ["128GB"] },
    { marque: "Sony", modele: "Xperia 5 VI", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Sony", modele: "Xperia Pro 2", annee: 2025, cat: "F", variants: ["512GB"] },
    // 2026
    { marque: "Sony", modele: "Xperia Edge 5G", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },

    // ═══════════════ VIVO ═══════════════
    // 2026
    { marque: "Vivo", modele: "X300 Ultra", annee: 2026, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Vivo", modele: "X300 FE", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "V70 FE", annee: 2026, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "T5x", annee: 2026, cat: "B", variants: ["128GB"] },
    // 2025
    { marque: "Vivo", modele: "X200 Pro", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Vivo", modele: "X200", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Vivo", modele: "X Fold 5", annee: 2025, cat: "F", variants: ["256GB", "512GB"] },
    { marque: "Vivo", modele: "V60", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "V40", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "Y300 Pro", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "T4 Ultra", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
    { marque: "Vivo", modele: "iQOO Neo 10", annee: 2025, cat: "F", variants: ["128GB", "256GB", "512GB"] },
    { marque: "Vivo", modele: "iQOO Z10 Turbo", annee: 2025, cat: "M", variants: ["128GB", "256GB"] },
];

function calculateTekhClass(brand, year, cat) {
    const isApple = brand.toLowerCase() === 'apple';
    if (!year) return 'C';
    if (year >= 2025 || (isApple && year >= 2024)) return 'A';
    if ((year >= 2022 && year <= 2024) || (isApple && year >= 2020 && year <= 2023)) return 'B';
    return 'C';
}

function parseStorageGb(variant) {
    const m = variant.match(/(\d+)\s*(GB|TB)/i);
    if (!m) return null;
    const val = parseInt(m[1], 10);
    return m[2].toUpperCase() === 'TB' ? val * 1024 : val;
}

async function run() {
    console.log(`\n🚀 Inserting latest 2025-2026 smartphone models...`);
    console.log(`   ${MODELS.length} model definitions across 17 brands\n`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const model of MODELS) {
        for (const variant of model.variants) {
            const storageGb = parseStorageGb(variant);
            const classeTekh = calculateTekhClass(model.marque, model.annee, model.cat);

            const row = {
                marque: model.marque,
                modele: model.modele,
                variante: variant,
                annee_sortie: model.annee,
                classe_tekh: classeTekh,
                specs: {
                    stockage_gb: storageGb,
                    categorie: model.cat === 'F' ? 'flagship' : model.cat === 'M' ? 'midrange' : 'budget',
                },
                prt_fcfa: null, // Will be filled by pricing engine later
                facteur_afrique: 1.15,
            };

            // Check if already exists
            const { data: existing } = await supabase
                .from('smartphones')
                .select('id')
                .ilike('marque', model.marque)
                .ilike('modele', model.modele)
                .ilike('variante', variant)
                .maybeSingle();

            if (existing) {
                skipped++;
                continue;
            }

            const { error } = await supabase.from('smartphones').insert(row);

            if (error) {
                console.error(`  [!] ${model.marque} ${model.modele} ${variant}: ${error.message}`);
                errors++;
            } else {
                inserted++;
            }
        }
        process.stdout.write(`  [${model.marque}] ${model.modele} ✓\n`);
    }

    // Final count
    const { count } = await supabase.from('smartphones').select('*', { count: 'exact', head: true });
    const { data: brandsData } = await supabase.from('smartphones').select('marque');
    const uniqueBrands = [...new Set(brandsData.map(r => r.marque))].sort();

    console.log(`\n✅ Import complete!`);
    console.log(`   Inserted: ${inserted} | Skipped (duplicates): ${skipped} | Errors: ${errors}`);
    console.log(`   Total rows in DB: ${count}`);
    console.log(`   Brands (${uniqueBrands.length}): ${uniqueBrands.join(', ')}`);
}

run().catch(console.error);
