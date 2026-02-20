require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SCRAPER_URL = 'http://localhost:3000/api';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getMissingSpecs(brand, model) {
    try {
        const { search } = require("./src/services/search");
        const results = await search(`${brand} ${model}`);
        if (results && results.length > 0) {
            const deviceId = results[0].id;
            const deviceUrl = `https://www.gsmarena.com/${deviceId}.php`;

            // Random delay between 5-8 seconds to be stealthy
            const delay = 5000 + Math.random() * 3000;
            console.log(`[Scraper] Pausing ${Math.round(delay / 1000)}s for ${brand} ${model}...`);
            await sleep(delay);

            const response = await axios.post(`${SCRAPER_URL}/scrapping-device-structure-data`, {
                data: { deviceUrl }
            });
            return {
                specs: response.data.data,
                slug: deviceId
            };
        }
    } catch (err) {
        if (err.response && err.response.status === 429) {
            console.error(`[Scraper] RATE LIMITED (429) for ${brand} ${model}. Need longer pause.`);
            return { error: '429' };
        }
        console.error(`[Scraper] Error for ${brand} ${model}:`, err.message);
    }
    return null;
}

async function run() {
    console.log("--- FINAL SYNC: Filling Missing Specifications ---");

    const { data: missingModels, error } = await supabase
        .from('models')
        .select('*, brands(name)')
        .eq('specifications', '{}');

    if (error) {
        console.error("Error fetching missing models:", error);
        return;
    }

    console.log(`Found ${missingModels.length} models missing specifications.`);

    let successCount = 0;
    for (let i = 0; i < missingModels.length; i++) {
        const m = missingModels[i];
        const brandName = m.brands.name;
        const modelName = m.name;

        console.log(`[${i + 1}/${missingModels.length}] Processing ${brandName} ${modelName}...`);

        const result = await getMissingSpecs(brandName, modelName);

        if (result && result.specs) {
            let year = m.release_year;
            if (result.specs.launch && result.specs.launch.announced) {
                const yr = result.specs.launch.announced.match(/20\d{2}/);
                if (yr) year = parseInt(yr[0]);
            }

            const { error: updErr } = await supabase
                .from('models')
                .update({
                    specifications: result.specs,
                    gsmarena_slug: result.slug,
                    release_year: year
                })
                .eq('id', m.id);

            if (updErr) {
                console.error(`  Error updating ${modelName}:`, updErr.message);
            } else {
                console.log(`  [OK] Updated ${modelName}`);
                successCount++;
            }
        } else if (result && result.error === '429') {
            console.log("  [!] Rate limit reached. Stopping for 30 seconds...");
            await sleep(30000); // 30s cooldon
            i--; // Retry this one
        } else {
            console.log(`  [!] Could not find specs for ${brandName} ${modelName}`);
        }
    }

    console.log(`\nFinal Sync Finished. Total updated: ${successCount}`);
}

run();
