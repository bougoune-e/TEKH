/**
 * audit_prix.cjs
 * Queries Supabase DB for all smartphones and identifies:
 * 1. Models where prt_fcfa IS NULL (no price in DB)
 * 2. Cross-references with the CSV reference file to suggest prices
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://zkdmdohothspysricfmw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZG1kb2hvdGhzcHlzcmljZm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjM0MzcsImV4cCI6MjA4NDU5OTQzN30.ACpMAVW7HnqfeYiDqvBAj9ssRev2GaT1s3PDurMu7Fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Parse CSV reference file
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.replace(/\r/g, '').trim()).filter(Boolean);

    // Find header row
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

// Build a lookup map from CSV: marque_lower|modele_lower|stockage -> prix
function buildCsvLookup(csvRows) {
    const lookup = new Map();
    for (const r of csvRows) {
        const key = `${r.marque.toLowerCase().trim()}|${r.modele.toLowerCase().trim()}|${r.stockage}`;
        if (!lookup.has(key)) {
            lookup.set(key, r.prix);
        }
    }
    return lookup;
}

// Try to find a price estimate from CSV for a given db entry
function findCsvPrice(csvLookup, marque, modele, stockageGb) {
    const m = marque?.toLowerCase().trim() || '';
    const mo = modele?.toLowerCase().trim() || '';

    // Try exact match
    const key = `${m}|${mo}|${stockageGb}`;
    if (csvLookup.has(key)) return csvLookup.get(key);

    // Try without brand prefix in model
    for (const [k, v] of csvLookup.entries()) {
        const parts = k.split('|');
        if (parts.length < 3) continue;
        const csvModel = parts[1];
        const csvStorage = parseInt(parts[2]);

        // Model fuzzy: csvModel contains the db model or vice versa
        if (csvStorage === stockageGb && (csvModel.includes(mo) || mo.includes(csvModel))) {
            return v;
        }
    }

    return null;
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
    console.log(`  Total records: ${allPhones.length}`);

    // Separate those with and without price
    const withPrice = allPhones.filter(p => p.prt_fcfa !== null && p.prt_fcfa > 0);
    const withoutPrice = allPhones.filter(p => !p.prt_fcfa || p.prt_fcfa === 0);

    console.log(`  With price: ${withPrice.length}`);
    console.log(`  WITHOUT price (to audit): ${withoutPrice.length}`);

    // Load CSV
    const csvPath = path.join(__dirname, '..', 'tableau de reference algorithmique - Sheet1 (2).csv');
    const csvRows = parseCSV(csvPath);
    const csvLookup = buildCsvLookup(csvRows);
    console.log(`  CSV rows loaded: ${csvRows.length}`);

    // Group missing by brand
    const byBrand = {};
    for (const phone of withoutPrice) {
        const brand = phone.marque || 'Unknown';
        if (!byBrand[brand]) byBrand[brand] = [];

        const storage = phone.variante ? parseInt(phone.variante.replace(/\D/g, '')) : null;
        const csvPrice = storage ? findCsvPrice(csvLookup, phone.marque, phone.modele, storage) : null;

        byBrand[brand].push({
            modele: phone.modele,
            variante: phone.variante,
            classe: phone.classe_tekh,
            annee: phone.annee_sortie,
            csvPrice,
        });
    }

    // Build report
    const lines = [];
    lines.push(`AUDIT SECTION PRIX — Modèles sans prix dans la DB\n`);
    lines.push(`Date: ${new Date().toISOString()}`);
    lines.push(`Total sans prix: ${withoutPrice.length} / ${allPhones.length} enregistrements\n`);
    lines.push('='.repeat(80));

    let totalSansEstimation = 0;
    let totalAvecEstimation = 0;

    const brandsSorted = Object.keys(byBrand).sort();
    for (const brand of brandsSorted) {
        const phones = byBrand[brand];
        lines.push(`\n📱 ${brand.toUpperCase()} (${phones.length} manquants)`);
        lines.push('-'.repeat(60));

        for (const p of phones) {
            const est = p.csvPrice ? `→ Estimation CSV: ${p.csvPrice.toLocaleString('fr-FR')} FCFA` : '→ Pas de référence CSV';
            const info = [p.modele, p.variante, p.classe ? `Classe ${p.classe}` : ''].filter(Boolean).join(' | ');
            lines.push(`  • ${info}  ${est}`);
            if (p.csvPrice) totalAvecEstimation++; else totalSansEstimation++;
        }
    }

    lines.push('\n' + '='.repeat(80));
    lines.push(`\nRésumé:`);
    lines.push(`  • Modèles sans prix ET avec estimation CSV : ${totalAvecEstimation}`);
    lines.push(`  • Modèles sans prix ET sans estimation CSV  : ${totalSansEstimation}`);

    const report = lines.join('\n');
    const outPath = path.join(__dirname, '..', 'audit_prix_report.txt');
    fs.writeFileSync(outPath, report, 'utf-8');
    console.log(`\nReport written to: ${outPath}`);
    console.log(report);
}

main().catch(console.error);
