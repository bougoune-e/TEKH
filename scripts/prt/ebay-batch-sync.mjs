#!/usr/bin/env node
/**
 * TEKH+ — eBay PRT Batch Scraper (safe mode)
 * 
 * Fetches eBay median used prices for smartphones WITHOUT a price (prt_fcfa IS NULL).
 * Designed to avoid eBay rate limits:
 *   - 15-minute delay between each request (configurable via DELAY_MINUTES env var)
 *   - Processes max 150 models per run (configurable via BATCH_SIZE env var)
 *   - Skips models that already have a price
 *   - Saves progress: can be re-run safely to continue where it left off
 *
 * Usage: node scripts/prt/ebay-batch-sync.mjs
 * Env:   EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: DELAY_MINUTES=15, BATCH_SIZE=150
 */
import { createClient } from "@supabase/supabase-js";
import { loadRepoEnv } from "./load-env.mjs";
import { fetchPrtForModel, EUR_TO_FCFA } from "../../tekh_backend/backend/lib/ebay.mjs";

loadRepoEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DELAY_MINUTES = Number(process.env.DELAY_MINUTES) || 1;
const DELAY_MS = DELAY_MINUTES * 60 * 1000;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 300;
const FACTEUR = Number(process.env.FACTEUR_AFRIQUE) || 1.15;
// SKIP_TRIED=1 → exclut les modèles déjà tentés (prt_updated_at IS NOT NULL mais prt_fcfa IS NULL)
const SKIP_TRIED = process.env.SKIP_TRIED === "1";

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function formatDuration(ms) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m${secs}s`;
}

function buildSearchQuery(row) {
    const v = row.variante ? ` ${row.variante}` : "";
    return `${row.marque} ${row.modele}${v}`.trim();
}

async function fetchUnpricedSmartphones(supabase) {
    const pageSize = 1000;
    let from = 0;
    const all = [];
    for (; ;) {
        let query = supabase
            .from("smartphones")
            .select("id, marque, modele, variante, facteur_afrique")
            .is("prt_fcfa", null);
        // SKIP_TRIED=1 → skip models already attempted (prt_updated_at set but no price found)
        if (SKIP_TRIED) query = query.is("prt_updated_at", null);
        const { data, error } = await query
            .order("marque")
            .order("modele")
            .range(from, from + pageSize - 1);
        if (error) throw new Error(error.message);
        if (!data?.length) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
    }
    return all;
}

async function main() {
    if (!SUPABASE_URL || !SERVICE_KEY) {
        console.error("❌ Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
        process.exit(1);
    }

    if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET) {
        console.error("❌ Définissez EBAY_CLIENT_ID et EBAY_CLIENT_SECRET.");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const allUnpriced = await fetchUnpricedSmartphones(supabase);

    console.log(`\n🔍 ${allUnpriced.length} smartphone(s) sans prix dans la base.`);

    if (allUnpriced.length === 0) {
        console.log("✅ Tous les modèles ont déjà un prix. Rien à faire.");
        return;
    }

    const batch = allUnpriced.slice(0, BATCH_SIZE);
    const remaining = allUnpriced.length - batch.length;

    console.log(`📦 Traitement du batch: ${batch.length} modèle(s) (${remaining} restants après ce batch)`);
    console.log(`⏱️  Délai entre requêtes: ${DELAY_MINUTES} minute(s)`);
    const totalEstimate = batch.length * DELAY_MS;
    console.log(`⏳ Durée estimée: ${formatDuration(totalEstimate)}`);
    console.log(`   Facteur Afrique: ${FACTEUR}`);
    console.log(`   EUR → FCFA: ${EUR_TO_FCFA}\n`);

    let ok = 0;
    let noData = 0;
    let fail = 0;
    const startTime = Date.now();

    for (let i = 0; i < batch.length; i++) {
        const row = batch[i];
        const q = buildSearchQuery(row);
        const progress = `[${i + 1}/${batch.length}]`;

        try {
            console.log(`${progress} 🔎 ${q}...`);
            const result = await fetchPrtForModel(q, FACTEUR);

            if (result.prtFcfa != null && result.sampleSize > 0) {
                const { error: upErr } = await supabase
                    .from("smartphones")
                    .update({
                        prt_fcfa: result.prtFcfa,
                        prix_ebay_eur: result.medianEur,
                        facteur_afrique: FACTEUR,
                        prt_updated_at: new Date().toISOString(),
                    })
                    .eq("id", row.id);

                if (upErr) {
                    console.error(`  ❌ DB update failed: ${upErr.message}`);
                    fail++;
                } else {
                    console.log(`  ✅ ${result.prtFcfa.toLocaleString("fr-FR")} FCFA (médiane: ${result.medianEur?.toFixed(2)} €, échantillon: ${result.sampleSize}, marché: ${result.marketplaceUsed})`);
                    ok++;
                }
            } else {
                console.log(`  ⚠️  Aucune donnée eBay — PRT laissé null (marqué comme tenté)`);
                // Mark as attempted so SKIP_TRIED=1 can skip it next run
                await supabase.from("smartphones")
                    .update({ prt_updated_at: new Date().toISOString() })
                    .eq("id", row.id);
                noData++;
            }
        } catch (e) {
            const msg = e?.message || String(e);
            console.error(`  ❌ Erreur: ${msg}`);
            fail++;

            // If rate limited, wait double time
            if (msg.includes("429") || msg.includes("rate") || msg.includes("Too Many")) {
                console.log(`  🛑 Rate limit détecté! Pause de ${DELAY_MINUTES * 2} minutes...`);
                await sleep(DELAY_MS * 2);
                continue;
            }
        }

        // Wait between requests (skip wait for last item)
        if (i < batch.length - 1) {
            const elapsed = Date.now() - startTime;
            const eta = ((batch.length - i - 1) * DELAY_MS);
            console.log(`  ⏳ Prochaine requête dans ${DELAY_MINUTES}min... (ETA restant: ${formatDuration(eta)})\n`);
            await sleep(DELAY_MS);
        }
    }

    // Final stats
    const totalTime = Date.now() - startTime;
    const { count: totalPriced } = await supabase
        .from("smartphones")
        .select("*", { count: "exact", head: true })
        .not("prt_fcfa", "is", null)
        .gt("prt_fcfa", 0);
    const { count: totalAll } = await supabase
        .from("smartphones")
        .select("*", { count: "exact", head: true });
    const stillUnpriced = totalAll - totalPriced;

    console.log(`\n${"═".repeat(50)}`);
    console.log(`✅ Batch terminé en ${formatDuration(totalTime)}`);
    console.log(`   Prix trouvés: ${ok}`);
    console.log(`   Sans donnée eBay: ${noData}`);
    console.log(`   Erreurs: ${fail}`);
    console.log(`${"═".repeat(50)}`);
    console.log(`📊 Base de données:`);
    console.log(`   Total: ${totalAll} | Avec prix: ${totalPriced} | Sans prix: ${stillUnpriced}`);
    if (stillUnpriced > 0) {
        console.log(`\n💡 Relancez ce script pour traiter les ${stillUnpriced} modèles restants.`);
    } else {
        console.log(`\n🎉 Tous les modèles ont un prix!`);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
