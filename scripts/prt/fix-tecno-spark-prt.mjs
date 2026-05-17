/**
 * fix-tecno-spark-prt.mjs
 *
 * Corrige les PRT des Tecno Spark 10 → 30C :
 * - Stockage de base (le plus petit) : PRT ≤ 54 000 FCFA
 * - Chaque palier de stockage supérieur : PRT_base + 7 000 × rang
 *
 * Scope : Tecno Spark dont le numéro est entre 10 et 30 (inclus 30C, 30 Pro…)
 */
import { loadRepoEnv, REPO_ROOT } from "./load-env.mjs";
loadRepoEnv();

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { join } from "path";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Env manquant"); process.exit(1); }
const supabase = createClient(url, key);

const BASE_CAP = 54000;  // PRT max pour le stockage de base
const STEP = 7000;   // Incrément par palier de stockage supérieur

// ── Fetch all Tecno Spark phones ──────────────────────────────────────────────
const { data: all, error } = await supabase
    .from("smartphones")
    .select("id, modele, variante, prt_fcfa, classe_tekh")
    .eq("marque", "Tecno")
    .ilike("modele", "%spark%");

if (error) { console.error(error.message); process.exit(1); }
console.log(`📱 Tecno Spark trouvés: ${all.length}`);

// ── Filtrer Spark 10 → 30 (et variantes 30C, 30 Pro, etc.) ───────────────────
// Exclure Spark 40+, Slim, Go, etc. (< 10 aussi)
const inScope = all.filter(p => {
    // Extraire le numéro principal (ex: "Tecno Spark 30C 5G" → 30)
    const match = (p.modele || "").match(/spark\s+(\d+)/i);
    if (!match) return false;
    const num = parseInt(match[1]);
    return num >= 10 && num <= 30;
});

console.log(`🎯 Dans le scope (Spark 10→30): ${inScope.length} enregistrement(s)`);

// Afficher avant correction
console.log("\n📋 AVANT correction:");
console.log("=".repeat(75));
for (const r of inScope.sort((a, b) => a.modele.localeCompare(b.modele) || a.variante.localeCompare(b.variante))) {
    const prt = (r.prt_fcfa || 0).toLocaleString("fr-FR");
    const flag = (r.prt_fcfa || 0) > BASE_CAP ? "⚠️" : "✅";
    console.log(`${flag} ${r.modele.padEnd(33)} | ${(r.variante || "?").padEnd(7)} | ${prt.padStart(10)} FCFA`);
}

// ── Grouper par modèle normalisé ──────────────────────────────────────────────
const groups = {};
for (const p of inScope) {
    const key = p.modele.trim().toLowerCase();
    if (!groups[key]) groups[key] = { name: p.modele, rows: [] };
    groups[key].rows.push(p);
}

// ── Calculer les nouveaux prix ────────────────────────────────────────────────
const updates = [];
for (const [, group] of Object.entries(groups)) {
    // Trier les variantes par stockage croissant
    group.rows.sort((a, b) => {
        const sa = parseInt((a.variante || "0").replace(/\D/g, "")) || 0;
        const sb = parseInt((b.variante || "0").replace(/\D/g, "")) || 0;
        return sa - sb;
    });

    // Base = MIN(prt_actuel_du_plus_petit_stockage, BASE_CAP)
    const baseRow = group.rows[0];
    const basePrt = Math.min(baseRow.prt_fcfa || BASE_CAP, BASE_CAP);

    for (let i = 0; i < group.rows.length; i++) {
        const row = group.rows[i];
        const newPrt = basePrt + i * STEP;
        if (newPrt !== row.prt_fcfa) {
            updates.push({
                id: row.id,
                modele: row.modele,
                variante: row.variante,
                old_prt: row.prt_fcfa,
                new_prt: newPrt,
            });
        }
    }
}

// ── Afficher les changements prévus ──────────────────────────────────────────
console.log(`\n✏️  CHANGEMENTS PRÉVUS: ${updates.length}`);
console.log("=".repeat(75));
for (const u of updates) {
    const old = (u.old_prt || 0).toLocaleString("fr-FR");
    const nw = u.new_prt.toLocaleString("fr-FR");
    console.log(`  ${u.modele.padEnd(33)} | ${(u.variante || "?").padEnd(7)} | ${old.padStart(10)} → ${nw.padStart(10)} FCFA`);
}

if (updates.length === 0) {
    console.log("✅ Aucune mise à jour nécessaire.");
    process.exit(0);
}

// ── Appliquer les mises à jour ────────────────────────────────────────────────
console.log("\n⏳ Application des mises à jour...");
const now = new Date().toISOString();
let ok = 0, err = 0;

for (const u of updates) {
    const { error: updErr } = await supabase
        .from("smartphones")
        .update({ prt_fcfa: u.new_prt, prt_updated_at: now })
        .eq("id", u.id);

    if (updErr) {
        console.error(`  ❌ ${u.modele} ${u.variante}: ${updErr.message}`);
        err++;
    } else {
        process.stdout.write(`\r  ✅ ${ok + 1}/${updates.length} mis à jour...`);
        ok++;
    }
}

console.log(`\n\n✅ Terminé! ${ok} mis à jour, ${err} erreur(s).`);

// ── Rapport ────────────────────────────────────────────────────────────────────
const lines = [
    "╔══════════════════════════════════════════════════════════════════╗",
    "║     FIX PRT — Tecno Spark 10→30C — TEKH+                        ║",
    "╚══════════════════════════════════════════════════════════════════╝",
    `Date     : ${new Date().toLocaleString("fr-FR")}`,
    `Règle    : base ≤ ${BASE_CAP.toLocaleString("fr-FR")} FCFA | +${STEP.toLocaleString("fr-FR")} FCFA/palier stockage`,
    `Scope    : Tecno Spark 10 → 30C (${inScope.length} variantes)`,
    `Modifiés : ${ok} / ${updates.length}`,
    "",
    "Détail des corrections:",
    "-".repeat(75),
];
for (const u of updates) {
    const old = (u.old_prt || 0).toLocaleString("fr-FR");
    const nw = u.new_prt.toLocaleString("fr-FR");
    lines.push(`  ${u.modele.padEnd(33)} | ${(u.variante || "?").padEnd(7)} | ${old.padStart(10)} → ${nw.padStart(10)} FCFA`);
}

const outPath = join(REPO_ROOT, "fix_tecno_spark_prt_report.txt");
writeFileSync(outPath, lines.join("\n"), "utf-8");
console.log(`\n📄 Rapport: ${outPath}`);
