#!/usr/bin/env node
/**
 * Syncs ALL prices from prix-a-remplir.csv to Supabase.
 * Unlike other scripts, this will OVERWRITE existing prices if they differ.
 */
import { readFileSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv, REPO_ROOT } from "./prt/load-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadRepoEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CSV_PATH = resolve(REPO_ROOT, "prix-a-remplir.csv");

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
    process.exit(1);
}

if (!existsSync(CSV_PATH)) {
    console.error("❌ Fichier introuvable :", CSV_PATH);
    process.exit(1);
}

function parseCsv(content) {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(",");
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = [];
        let inQuotes = false;
        let field = "";
        for (const ch of lines[i]) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === "," && !inQuotes) { parts.push(field.trim()); field = ""; }
            else { field += ch; }
        }
        parts.push(field.trim());
        if (parts.length >= 6) {
            data.push({
                marque: parts[1],
                modele: parts[2],
                variante: parts[3],
                prt_fcfa: parseInt(parts[5]),
                facteur_afrique: parseFloat(parts[6]) || 1
            });
        }
    }
    return data;
}

async function main() {
    const csvData = parseCsv(readFileSync(CSV_PATH, "utf8"));
    console.log(`📊 Lu ${csvData.length} entrées dans le CSV.`);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process in small batches to avoid timeouts
    const BATCH_SIZE = 50;
    for (let i = 0; i < csvData.length; i += BATCH_SIZE) {
        const batch = csvData.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (row) => {
            // Find matching row in DB by marque, modele, and variante
            // We use ILIKE for robustness but exact match preferred
            const { data: matches, error: fetchError } = await supabase
                .from("smartphones")
                .select("id, prt_fcfa")
                .ilike("marque", row.marque.trim())
                .ilike("modele", row.modele.trim())
                .ilike("variante", row.variante.trim());

            if (fetchError) {
                console.error(`❌ Erreur fetch ${row.modele}:`, fetchError.message);
                errors++;
                return;
            }

            if (!matches || matches.length === 0) {
                skipped++;
                return;
            }

            for (const match of matches) {
                if (match.prt_fcfa === row.prt_fcfa) continue; // No change needed

                const { error: updateError } = await supabase
                    .from("smartphones")
                    .update({
                        prt_fcfa: row.prt_fcfa,
                        facteur_afrique: row.facteur_afrique,
                        prt_updated_at: new Date().toISOString()
                    })
                    .eq("id", match.id);

                if (updateError) {
                    console.error(`❌ Erreur update ${row.modele} (ID: ${match.id}):`, updateError.message);
                    errors++;
                } else {
                    updated++;
                }
            }
        }));

        process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, csvData.length)}/${csvData.length}...`);
    }

    console.log(`\n\n✅ Sync terminée !`);
    console.log(`✨ Mis à jour : ${updated}`);
    console.log(`⏭️  Ignorés (pas en base ou inchangés) : ${skipped}`);
    console.log(`❌ Erreurs : ${errors}`);
}

main().catch(console.error);
