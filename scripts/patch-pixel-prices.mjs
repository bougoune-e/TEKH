import { createClient } from "@supabase/supabase-js";

const client = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: rows, error } = await client
  .from("smartphones")
  .select("id, marque, modele, variante, prt_fcfa")
  .ilike("marque", "%pixel%");

if (error) { console.error(error); process.exit(1); }

const targets = rows.filter(r => {
  const m = r.modele.toLowerCase();
  return /pixel [234]([a ]|$)/.test(m);
});

console.log(`${targets.length} rows à mettre à jour\n`);

let updated = 0;
for (const row of targets) {
  if (!row.prt_fcfa) continue;
  const newPrt = Math.round(row.prt_fcfa / 2) - 12000;
  const { error: e } = await client
    .from("smartphones")
    .update({ prt_fcfa: newPrt })
    .eq("id", row.id);
  if (e) { console.error(`ERREUR ${row.modele}:`, e); continue; }
  console.log(`✓ ${row.modele} ${row.variante}: ${row.prt_fcfa} → ${newPrt}`);
  updated++;
}
console.log(`\n${updated} lignes mises à jour.`);
