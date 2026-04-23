import { createClient } from "@supabase/supabase-js";

const client = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const corrections = {
  "google pixel 2_128": 38000,
  "google pixel 2_64": 26000,
  "google pixel 2 xl_128": 52000,
  "google pixel 2 xl_64": 45000,
  "google pixel 3_128": 48000,
  "google pixel 3_64": 35000,
  "google pixel 3 xl_128": 63000,
  "google pixel 3 xl_64": 52000,
  "google pixel 3a_64": 42000,
  "google pixel 3a xl_64": 57000,
  "google pixel 4_128": 65000,
  "google pixel 4_64": 45000,
  "google pixel 4 xl_128": 75000,
  "google pixel 4 xl_64": 66000,
  "google pixel 4a_128": 46000,
  "google pixel 4a (5g)_128": 48000,
};

const { data: rows, error } = await client
  .from("smartphones")
  .select("id, modele, variante, prt_fcfa")
  .ilike("modele", "%pixel%");

if (error) { console.error(error); process.exit(1); }

let updated = 0;
for (const row of rows) {
  const storage = (row.variante || "").replace(/GB.*/i, "").trim();
  const key = `${row.modele.toLowerCase()}_${storage}`;
  if (!(key in corrections)) continue;
  const newPrt = corrections[key];
  const { error: e } = await client.from("smartphones").update({ prt_fcfa: newPrt }).eq("id", row.id);
  if (e) { console.error(`ERREUR ${row.modele}:`, e); continue; }
  console.log(`✓ ${row.modele} ${row.variante}: ${row.prt_fcfa} → ${newPrt}`);
  updated++;
}
console.log(`\n${updated} lignes mises à jour.`);
