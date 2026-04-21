/**
 * audit_prix_v2.cjs
 * Compares CSV reference models vs Supabase DB:
 * 1. Models in CSV but NOT in DB (completely absent)
 * 2. Models in DB but NOT in CSV  
 * 3. Variants (model+storage) in CSV but missing in DB
 * 4. Models in DB with prt_fcfa = 0 or NULL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://zkdmdohothspysricfmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZG1kb2hvdGhzcHlzcmljZm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjM0MzcsImV4cCI6MjA4NDU5OTQzN30.ACpMAVW7HnqfeYiDqvBAj9ssRev2GaT1s3PDurMu7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function normalize(s) {
    return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
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
    const PAGE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('smartphones')
            .select('id, marque, modele, variante, prt_fcfa, classe_tekh, annee_sortie')
            .range(from, from + PAGE - 1);

        if (error) { console.error('Supabase error:', error); break; }
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < PAGE) break;
        from += PAGE;
    }
    return all;
}

async function main() {
    console.log('Fetching all smartphones from Supabase...');
    const allPhones = await fetchAllSmartphones();
    console.log(`  DB records: ${allPhones.length}`);

    // Load CSV
    const csvPath = path.join(__dirname, '..', 'tableau de reference algorithmique - Sheet1 (2).csv');
    const csvRows = parseCSV(csvPath);
    console.log(`  CSV rows: ${csvRows.length}`);

    // Build DB lookup: set of "modele_normalized" per brand
    const dbByBrand = {};
    const dbVariantKeys = new Set();
    for (const p of allPhones) {
        const brand = normalize(p.marque || '');
        const modele = normalize(p.modele || '');
        const storage = p.variante ? parseInt(p.variante.replace(/\D/g, '')) || 0 : 0;

        if (!dbByBrand[brand]) dbByBrand[brand] = new Set();
        dbByBrand[brand].add(modele);
        dbVariantKeys.add(`${brand}|${modele}|${storage}`);
    }

    // Build CSV lookup: unique model+storage combos
    const csvModelSet = new Set();
    const csvVariantKey = new Set();
    const csvByModelKey = {}; // normalized "brand|model" -> csv row(s)

    for (const r of csvRows) {
        const brand = normalize(r.marque || '');
        const modele = normalize(r.modele || '');
        const storage = r.stockage;

        csvModelSet.add(`${brand}|${modele}`);
        csvVariantKey.add(`${brand}|${modele}|${storage}`);

        const mk = `${brand}|${modele}|${storage}`;
        if (!csvByModelKey[mk]) csvByModelKey[mk] = [];
        csvByModelKey[mk].push(r);
    }

    // Find CSV variants NOT in DB
    const missingInDB = [];
    for (const key of csvVariantKey) {
        if (!dbVariantKeys.has(key)) {
            const [brand, modele, storage] = key.split('|');
            const csvData = csvByModelKey[key] || [];
            const repr = csvData[0];
            missingInDB.push({
                brand,
                modele,
                storage: parseInt(storage),
                csvPrice: repr ? repr.prix : 0,
                csvClasse: repr ? repr.classe : '',
                csvRam: repr ? repr.ram : 0,
                csvAnnee: repr ? repr.annee : 0,
            });
        }
    }

    // Find DB records with no price or price = 0
    const dbZeroPrice = allPhones.filter(p => !p.prt_fcfa || p.prt_fcfa === 0);

    // Build report
    const report = [];
    report.push('╔══════════════════════════════════════════════════════════════════╗');
    report.push('║     AUDIT COMPLET SECTION PRIX — TEKH+                          ║');
    report.push('╚══════════════════════════════════════════════════════════════════╝');
    report.push(`Date : ${new Date().toLocaleString('fr-FR')}`);
    report.push(`DB   : ${allPhones.length} enregistrements au total`);
    report.push(`CSV  : ${csvRows.length} lignes de référence\n`);

    // ── SECTION 1: DB records with price = 0 or null ──
    report.push('━'.repeat(70));
    report.push(`1. ENREGISTREMENTS DB AVEC PRIX NUL/ZÉRO : ${dbZeroPrice.length}`);
    report.push('━'.repeat(70));
    if (dbZeroPrice.length === 0) {
        report.push('  ✅ Tous les enregistrements DB ont un prix non nul.');
    } else {
        for (const p of dbZeroPrice) {
            report.push(`  • ${p.marque} | ${p.modele} | ${p.variante} — prt_fcfa=${p.prt_fcfa}`);
        }
    }

    // ── SECTION 2: CSV variants missing from DB ──
    report.push('');
    report.push('━'.repeat(70));
    report.push(`2. VARIANTES PRÉSENTES DANS CSV MAIS ABSENTES DE LA DB : ${missingInDB.length}`);
    report.push('━'.repeat(70));

    // Group by brand
    const missingByBrand = {};
    for (const m of missingInDB) {
        if (!missingByBrand[m.brand]) missingByBrand[m.brand] = [];
        missingByBrand[m.brand].push(m);
    }

    const brandsSorted = Object.keys(missingByBrand).sort();
    for (const brand of brandsSorted) {
        const items = missingByBrand[brand];
        // sort by model, then storage
        items.sort((a, b) => a.modele.localeCompare(b.modele) || a.storage - b.storage);

        report.push(`\n  📱 ${brand.toUpperCase()} (${items.length} variantes manquantes)`);
        report.push('  ' + '-'.repeat(65));

        for (const item of items) {
            const price = item.csvPrice > 0 ? `${item.csvPrice.toLocaleString('fr-FR')} FCFA` : 'N/A';
            const info = [
                `${item.modele}`,
                `${item.storage}GB`,
                item.csvClasse ? `Classe ${item.csvClasse}` : '',
                item.csvRam ? `${item.csvRam}GB RAM` : '',
                item.csvAnnee ? `(${item.csvAnnee})` : '',
            ].filter(Boolean).join(' | ');
            report.push(`    • ${info}`);
            report.push(`      → Prix CSV : ${price}`);
        }
    }

    // ── SECTION 3: Summary ──
    report.push('');
    report.push('━'.repeat(70));
    report.push('3. RÉSUMÉ PAR MARQUE — Variantes CSV manquantes dans la DB');
    report.push('━'.repeat(70));
    report.push(`${'Marque'.padEnd(25)} ${'Nb variantes manquantes'.padEnd(25)}`);
    report.push('-'.repeat(55));
    for (const brand of brandsSorted) {
        report.push(`${brand.padEnd(25)} ${String(missingByBrand[brand].length).padEnd(25)}`);
    }
    report.push(`\n  Total variantes manquantes : ${missingInDB.length}`);

    const fullReport = report.join('\n');
    const outPath = path.join(__dirname, '..', 'audit_prix_report_v2.txt');
    fs.writeFileSync(outPath, fullReport, 'utf-8');
    console.log(`\nReport saved to: ${outPath}`);
    console.log(fullReport);
}

main().catch(console.error);
