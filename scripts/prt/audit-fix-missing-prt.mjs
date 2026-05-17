/**
 * audit-fix-missing-prt.mjs
 *
 * 1. Audite tous les modèles sans prt_fcfa (null ou 0) dans la DB
 * 2. Vérifie si 'iphone xs max 64GB' existe dans la DB
 * 3. Insère/met à jour l'iPhone XS Max 64GB avec prt_fcfa = 50000 FCFA
 * 4. Génère un rapport complet
 */
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";
loadRepoEnv();

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { join } from "path";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}
const supabase = createClient(url, key);

// ── Données correctes pour l'iPhone XS Max 64GB ─────────────────────────────
// Prix de référence terrain confirmé par le user
const IPHONE_XS_MAX_64_PRT = 50000;

function normalize(s) {
    return (s || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// ── Fetch ALL smartphones ────────────────────────────────────────────────────
async function fetchAll() {
    let all = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabase
            .from("smartphones")
            .select("id, marque, modele, variante, prt_fcfa, classe_tekh, annee_sortie")
            .range(from, from + 999);
        if (error) { console.error("Supabase error:", error.message); break; }
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    return all;
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("⏳ Fetching all smartphones from Supabase...");
const allPhones = await fetchAll();
console.log(`✅ Total records: ${allPhones.length}`);

// ── 1. Audit: modèles avec prt_fcfa null ou 0 ───────────────────────────────
const noPrt = allPhones.filter(p => !p.prt_fcfa || p.prt_fcfa === 0);
console.log(`\n📊 Modèles sans PRT (null ou 0): ${noPrt.length}`);

// ── 2. Chercher l'iPhone XS Max 64GB ────────────────────────────────────────
const xsMaxRows = allPhones.filter(p => {
    const m = normalize(p.modele);
    const v = normalize(p.variante || "");
    const b = normalize(p.marque);
    return b.includes("apple") && m.includes("xs max") && (v.includes("64") || v === "64gb");
});

console.log(`\n🔍 iPhone XS Max 64GB dans DB: ${xsMaxRows.length} résultat(s)`);
if (xsMaxRows.length > 0) {
    for (const r of xsMaxRows) {
        console.log(`  → ID=${r.id} | marque=${r.marque} | modele=${r.modele} | variante=${r.variante} | prt_fcfa=${r.prt_fcfa}`);
    }
}

// ── 3. Vérifier aussi si le modèle XS Max existe en d'autres variantes ───────
const xsMaxAll = allPhones.filter(p => {
    const m = normalize(p.modele);
    const b = normalize(p.marque);
    return b.includes("apple") && m.includes("xs max");
});
console.log(`\n📱 Toutes variantes 'iPhone XS Max' en DB: ${xsMaxAll.length}`);
for (const r of xsMaxAll) {
    console.log(`  → ID=${r.id} | variante=${r.variante} | prt_fcfa=${r.prt_fcfa} | classe=${r.classe_tekh}`);
}

// ── 4. Fix: Insérer ou mettre à jour iPhone XS Max 64GB ─────────────────────
const now = new Date().toISOString();
let fixResult = null;

if (xsMaxRows.length === 0) {
    // Pas de 64GB: on doit l'insérer
    // Utiliser les données d'une variante existante du XS Max comme référence
    const refRow = xsMaxAll[0];
    if (!refRow) {
        console.error("❌ Aucune variante du iPhone XS Max trouvée en DB! Insertion manuelle nécessaire.");
    } else {
        console.log(`\n➕ Insertion de l'iPhone XS Max 64GB avec prt_fcfa=${IPHONE_XS_MAX_64_PRT}...`);
        const newRow = {
            marque: refRow.marque,       // "Apple"
            modele: refRow.modele,       // "Iphone Xs Max" ou similaire
            variante: "64GB",
            prt_fcfa: IPHONE_XS_MAX_64_PRT,
            classe_tekh: refRow.classe_tekh,
            annee_sortie: refRow.annee_sortie || 2018,
            facteur_afrique: 1.0,
            prt_updated_at: now,
        };

        console.log("  Données à insérer:", JSON.stringify(newRow, null, 2));
        const { data: inserted, error: insertErr } = await supabase
            .from("smartphones")
            .insert(newRow)
            .select();

        if (insertErr) {
            console.error("❌ Erreur d'insertion:", insertErr.message);
            fixResult = { action: "insert", success: false, error: insertErr.message };
        } else {
            console.log("✅ iPhone XS Max 64GB inséré avec succès:", inserted);
            fixResult = { action: "insert", success: true, data: inserted };
        }
    }
} else {
    // Existe(nt) déjà: vérifier si le prix est correct
    const needsUpdate = xsMaxRows.filter(r => !r.prt_fcfa || r.prt_fcfa === 0 || r.prt_fcfa !== IPHONE_XS_MAX_64_PRT);
    if (needsUpdate.length === 0) {
        console.log(`\n✅ L'iPhone XS Max 64GB a déjà un PRT correct (${xsMaxRows[0].prt_fcfa} FCFA). Aucune mise à jour nécessaire.`);
        fixResult = { action: "none", reason: "Prix déjà correct" };
    } else {
        console.log(`\n✏️ Mise à jour du prix iPhone XS Max 64GB → ${IPHONE_XS_MAX_64_PRT} FCFA...`);
        for (const row of needsUpdate) {
            const { error: updErr } = await supabase
                .from("smartphones")
                .update({ prt_fcfa: IPHONE_XS_MAX_64_PRT, prt_updated_at: now })
                .eq("id", row.id);
            if (updErr) {
                console.error(`❌ Erreur update ID=${row.id}:`, updErr.message);
            } else {
                console.log(`✅ ID=${row.id} mis à jour: prt_fcfa=${IPHONE_XS_MAX_64_PRT}`);
            }
        }
        fixResult = { action: "update", count: needsUpdate.length };
    }
}

// ── 5. Rapport final ─────────────────────────────────────────────────────────
const report = [];
report.push("╔══════════════════════════════════════════════════════════════════╗");
report.push("║     AUDIT PRT MANQUANTS + FIX iPhone XS Max 64GB — TEKH+        ║");
report.push("╚══════════════════════════════════════════════════════════════════╝");
report.push(`Date : ${new Date().toLocaleString("fr-FR")}`);
report.push(`DB   : ${allPhones.length} enregistrements au total\n`);

report.push("━".repeat(70));
report.push(`1. MODÈLES SANS PRT (prt_fcfa null ou 0) : ${noPrt.length}`);
report.push("━".repeat(70));
if (noPrt.length === 0) {
    report.push("  ✅ Tous les enregistrements ont un prt_fcfa > 0.");
} else {
    const byBrand = {};
    for (const p of noPrt) {
        const b = p.marque || "Inconnu";
        if (!byBrand[b]) byBrand[b] = [];
        byBrand[b].push(p);
    }
    for (const [brand, phones] of Object.entries(byBrand).sort()) {
        report.push(`\n  📱 ${brand} (${phones.length} sans PRT)`);
        report.push("  " + "-".repeat(65));
        for (const p of phones) {
            report.push(`    • ${p.modele} | ${p.variante || "?"} | prt_fcfa=${p.prt_fcfa ?? "NULL"}`);
        }
    }
}

report.push("\n" + "━".repeat(70));
report.push("2. BILAN iPhone XS Max 64GB");
report.push("━".repeat(70));
report.push(`  Variantes XS Max trouvées (toutes): ${xsMaxAll.length}`);
report.push(`  Variante 64GB spécifique: ${xsMaxRows.length > 0 ? xsMaxRows.length + " trouvée(s)" : "ABSENTE"}`);
if (fixResult) {
    if (fixResult.action === "insert") {
        report.push(`  Action: INSERTION ${fixResult.success ? "✅ RÉUSSIE" : "❌ ÉCHOUÉE — " + fixResult.error}`);
        report.push(`  prt_fcfa fixé à: ${IPHONE_XS_MAX_64_PRT} FCFA`);
    } else if (fixResult.action === "update") {
        report.push(`  Action: MISE À JOUR de ${fixResult.count} enregistrement(s) ✅`);
        report.push(`  prt_fcfa fixé à: ${IPHONE_XS_MAX_64_PRT} FCFA`);
    } else if (fixResult.action === "none") {
        report.push(`  Action: AUCUNE — ${fixResult.reason}`);
    }
}

const fullReport = report.join("\n");
const outPath = join(REPO_ROOT, "audit_prt_fix_report.txt");
writeFileSync(outPath, fullReport, "utf-8");
console.log(`\n📄 Rapport sauvegardé : ${outPath}`);
console.log("\n" + fullReport);
