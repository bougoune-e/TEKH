require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkProject(url, key, name) {
    console.log(`\n--- Checking ${name}: ${url} ---`);
    const supabase = createClient(url, key);

    // Try to insert a dummy config row to see if table exists
    console.log(`\nAttempting to insert into 'config'...`);
    try {
        const { data: insData, error: insErr } = await supabase
            .from('config')
            .upsert({ id: 1, usd_to_fcfa: 600, service_fee_fcfa: 5000 })
            .select();

        if (insErr) {
            console.log(`[X] Upsert into 'config' failed: ${insErr.status} ${insErr.message} (${insErr.code})`);
        } else {
            console.log(`[OK] Upsert into 'config' succeeded!`);
        }
    } catch (err) {
        console.log(`[ERR] Upsert into 'config' exception: ${err.message}`);
    }

    const tables = ['models', 'variants', 'config', 'produits_certifies', 'tekh_grading'];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`[X] Table '${table}': ${error.status} ${error.message} (${error.code})`);
            } else {
                console.log(`[OK] Table '${table}': ${count} rows`);
            }
        } catch (err) {
            console.log(`[ERR] Table '${table}': ${err.message}`);
        }
    }
}

async function run() {
    const url1 = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key1 = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (url1 && key1) {
        await checkProject(url1, key1, "Current (.env)");
    }
}

run();
