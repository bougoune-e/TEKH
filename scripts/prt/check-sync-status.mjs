import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkProgress() {
    const { count: pricedCount } = await supabase
        .from('smartphones')
        .select('*', { count: 'exact', head: true })
        .not('prt_fcfa', 'is', null);

    const { count: unpricedCount } = await supabase
        .from('smartphones')
        .select('*', { count: 'exact', head: true })
        .is('prt_fcfa', null);

    console.log(`Models with price: ${pricedCount}`);
    console.log(`Models without price: ${unpricedCount}`);
    console.log(`Progress: ${Math.round((pricedCount / (pricedCount + unpricedCount)) * 100)}%`);
}

checkProgress();
