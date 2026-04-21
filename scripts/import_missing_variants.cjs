/**
 * import_missing_variants.cjs
 * Imports variants present in the CSV reference but missing from Supabase.
 * Uses service role key to bypass RLS.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseRead = createClient(SUPABASE_URL, ANON_KEY);
const supabaseWrite = createClient(SUPABASE_URL, SERVICE_KEY);

function normalize(s) {
    return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Capitalize first letter of each word
function titleCase(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Map CSV brand names to canonical DB brand names
const BRAND_MAP = {
    'apple': 'Apple',
    'asus': 'Asus',
    'google pixel': 'Google Pixel',
    'honor': 'Honor',
    'huawei': 'Huawei',
    'infinix': 'Infinix',
    'lg': 'LG',
    'lenovo': 'Lenovo',
    'motorola': 'Motorola',
    'motorola ': 'Motorola',
    'one plus': 'One Plus',
    'oppo': 'Oppo',
    'realme': 'Realme',
    'red magic': 'Red Magic',
    'red magic ': 'Red Magic',
    'samsung': 'Samsung',
    'tecno': 'Tecno',
    'vivo': 'Vivo',
    'xiaomi': 'Xiaomi',
    'xiaomi ': 'Xiaomi',
    'xiaomi poco': 'Xiaomi Poco',
    'xiaomi redmi': 'Xiaomi Redmi',
    'xiaomi redmi ': 'Xiaomi Redmi',
    'zte': 'ZTE',
};

// Brands that have legitimate sub-brands in our DB — trust CSV for these
const SUBBRAND_PARENTS = new Set(['xiaomi redmi', 'xiaomi poco', 'xiaomi redmi ']);

// Infer brand from model name when brand is missing or incoherent
function inferBrandFromModel(model) {
    const m = model.toLowerCase();
    if (m.startsWith('iphone') || m.startsWith('ipad')) return 'Apple';
    if (m.startsWith('asus') || m.includes('rog phone')) return 'Asus';
    if (m.startsWith('galaxy') || m.startsWith('samsung')) return 'Samsung';
    if (m.startsWith('pixel') || m.startsWith('google pixel')) return 'Google Pixel';
    if (m.startsWith('redmi')) return 'Xiaomi Redmi';
    if (m.startsWith('poco')) return 'Xiaomi Poco';
    if (m.startsWith('xiaomi')) return 'Xiaomi';
    if (m.startsWith('oneplus')) return 'One Plus';
    if (m.startsWith('huawei')) return 'Huawei';
    if (m.startsWith('oppo')) return 'Oppo';
    if (m.startsWith('vivo')) return 'Vivo';
    if (m.startsWith('infinix')) return 'Infinix';
    if (m.startsWith('tecno') || m.startsWith('camon') || m.startsWith('spark') || m.startsWith('phantom') || m.startsWith('pova') || m.startsWith('pop')) return 'Tecno';
    if (m.startsWith('realme') || m.startsWith('gt')) return 'Realme';
    if (m.startsWith('honor')) return 'Honor';
    if (m.startsWith('motorola') || m.startsWith('moto ') || m.startsWith('edge') || m.startsWith('razr')) return 'Motorola';
    if (m.startsWith('lg ')) return 'LG';
    if (m.startsWith('zte')) return 'ZTE';
    if (m.startsWith('red magic')) return 'Red Magic';
    if (m.startsWith('lenovo')) return 'Lenovo';
    return null;
}

function canonicalBrand(raw, model) {
    const key = (raw || '').toLowerCase().trimEnd();
    // Empty brand — infer from model
    if (!raw || !raw.trim()) {
        return inferBrandFromModel(model) || 'Unknown';
    }
    // Trust legitimate sub-brands as-is (Xiaomi Redmi, Xiaomi Poco)
    if (SUBBRAND_PARENTS.has(key)) {
        return BRAND_MAP[key] || titleCase(raw.trim());
    }
    if (BRAND_MAP[key]) {
        const mapped = BRAND_MAP[key];
        // Sanity check: does the model belong to this brand?
        const inferredFromModel = inferBrandFromModel(model);
        if (inferredFromModel && inferredFromModel !== mapped) {
            // CSV has wrong brand for this model — trust the model name
            console.warn(`  ⚠️  Brand mismatch: CSV says "${raw}" but model "${model}" suggests "${inferredFromModel}". Using inferred.`);
            return inferredFromModel;
        }
        return mapped;
    }
    // Fallback: titlecase
    return titleCase(raw.trim());
}

// Derive a DB-style model name from CSV (keep casing as-is, just trim)
function canonicalModel(csvModel) {
    return csvModel.trim();
}

// Guess category from classe_tekh
function guessCategory(classe) {
    if (!classe) return 'midrange';
    if (classe === 'A') return 'flagship';
    if (classe === 'B') return 'flagship';
    if (classe === 'C') return 'midrange';
    if (classe === 'D') return 'midrange';
    if (classe === 'E') return 'budget';
    if (classe === 'F') return 'budget';
    return 'midrange';
}

// Parse CSV reference file
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.replace(/\r/g, '').trim()).filter(Boolean);
    const headerIdx = lines.findIndex(l => l.includes('Marques') && l.includes('Modèle'));
    if (headerIdx === -1) return [];
    const rows = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length < 4) continue;
        const marque = parts[0].trim();
        const modele = parts[1].trim();
        const stockage = parseInt(parts[2].trim()) || 0;
        const prix = parseInt(parts[3].trim()) || 0;
        const classe = parts[4]?.trim() || '';
        const ram = parseInt(parts[5]?.trim()) || 0;
        const annee = parseInt(parts[6]?.trim()) || 0;
        if (modele && prix > 0) {
            rows.push({ marque, modele, stockage, prix, classe, ram, annee });
        }
    }
    return rows;
}

async function fetchAllSmartphones() {
    let all = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabaseRead
            .from('smartphones')
            .select('marque, modele, variante')
            .range(from, from + 999);
        if (error || !data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        from += 1000;
    }
    return all;
}

async function main() {
    const DRY_RUN = process.argv.includes('--dry-run');
    console.log(DRY_RUN ? '🔍 DRY RUN — no actual inserts' : '🚀 LIVE RUN — inserting into Supabase');

    console.log('\n1. Fetching existing DB records...');
    const existing = await fetchAllSmartphones();
    console.log(`   ${existing.length} records found`);

    // Build set of existing keys: "norm_marque|norm_modele|storage_num"
    const existingKeys = new Set();
    for (const r of existing) {
        const storage = r.variante ? parseInt(r.variante.replace(/\D/g, '')) || 0 : 0;
        const key = `${normalize(r.marque)}|${normalize(r.modele)}|${storage}`;
        existingKeys.add(key);
    }

    console.log('\n2. Parsing CSV reference file...');
    const csvPath = path.join(__dirname, '..', 'tableau de reference algorithmique - Sheet1 (2).csv');
    const csvRows = parseCSV(csvPath);
    console.log(`   ${csvRows.length} CSV rows`);

    // Deduplicate CSV rows — keep highest price per key (most conservative estimate)
    const csvBest = new Map();
    for (const r of csvRows) {
        const dbBrand = canonicalBrand(r.marque, r.modele);
        const dbModel = canonicalModel(r.modele);
        const key = `${normalize(dbBrand)}|${normalize(dbModel)}|${r.stockage}`;
        if (!csvBest.has(key) || r.prix > csvBest.get(key).prix) {
            csvBest.set(key, { ...r, dbBrand, dbModel });
        }
    }

    // Find variants not in DB
    const toInsert = [];
    for (const [key, r] of csvBest.entries()) {
        if (!existingKeys.has(key)) {
            toInsert.push(r);
        }
    }

    console.log(`\n3. Variants to insert: ${toInsert.length}`);

    if (toInsert.length === 0) {
        console.log('   ✅ Nothing to insert!');
        return;
    }

    // Preview first 5
    console.log('\n   First 5 to insert:');
    toInsert.slice(0, 5).forEach(r => {
        console.log(`   • ${r.dbBrand} | ${r.dbModel} | ${r.stockage}GB → ${r.prix.toLocaleString('fr-FR')} FCFA`);
    });

    if (DRY_RUN) {
        console.log(`\n   DRY RUN complete. ${toInsert.length} rows would be inserted.`);
        fs.writeFileSync(
            path.join(__dirname, '..', 'import_preview.json'),
            JSON.stringify(toInsert.map(r => ({
                marque: r.dbBrand,
                modele: r.dbModel,
                variante: `${r.stockage}GB`,
                prt_fcfa: r.prix,
                classe_tekh: r.classe || null,
                annee_sortie: r.annee || null,
                ram: r.ram || null,
            })), null, 2)
        );
        console.log('   Preview saved to import_preview.json');
        return;
    }

    // Build insert records
    const records = toInsert.map(r => ({
        marque: r.dbBrand,
        modele: r.dbModel,
        variante: `${r.stockage}GB`,
        prt_fcfa: r.prix,
        classe_tekh: r.classe || null,
        annee_sortie: r.annee > 2000 && r.annee < 2030 ? r.annee : null,
        statut: 'disponible',
        specs: {
            stockage_gb: r.stockage,
            ram_gb: r.ram || undefined,
            categorie: guessCategory(r.classe),
        },
        prt_updated_at: new Date().toISOString(),
    }));

    // Insert in batches of 50
    const BATCH = 50;
    let inserted = 0;
    let errors = 0;

    console.log(`\n4. Inserting ${records.length} records in batches of ${BATCH}...`);

    for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH);
        const { error } = await supabaseWrite
            .from('smartphones')
            .insert(batch);

        if (error) {
            console.error(`   ❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
            errors += batch.length;
        } else {
            inserted += batch.length;
            process.stdout.write(`   ✅ Batch ${Math.floor(i / BATCH) + 1}: ${inserted}/${records.length} inserted\r`);
        }
    }

    console.log(`\n\n✅ Import complete!`);
    console.log(`   Inserted : ${inserted}`);
    console.log(`   Errors   : ${errors}`);
}

main().catch(console.error);
