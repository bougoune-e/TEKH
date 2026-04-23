import { createClient } from "@supabase/supabase-js";

const c = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1. Pixel 4a 5G price
const { error: e1 } = await c.from("smartphones")
  .update({ prt_fcfa: 52000 })
  .ilike("modele", "%pixel 4a (5g)%");
console.log("Pixel 4a 5G prix:", e1?.message ?? "✓ 52 000 FCFA");

// 2. Redmi → merge dans Xiaomi (avec préfixe "Redmi" dans le modèle)
const { data: redmiRows } = await c.from("smartphones").select("id,modele").eq("marque","Redmi");
console.log(`\nRedmi rows: ${redmiRows?.length}`);
for (const r of redmiRows ?? []) {
  const newModele = r.modele.toLowerCase().startsWith("redmi") ? r.modele : `Redmi ${r.modele}`;
  await c.from("smartphones").update({ marque: "Xiaomi", modele: newModele }).eq("id", r.id);
  console.log(`  ✓ Redmi → Xiaomi: ${newModele}`);
}

// 3. Poco → merge dans Xiaomi
const { data: pocoRows } = await c.from("smartphones").select("id,modele").eq("marque","Poco");
console.log(`\nPoco rows: ${pocoRows?.length}`);
for (const r of pocoRows ?? []) {
  const newModele = r.modele.toLowerCase().startsWith("poco") ? r.modele : `Poco ${r.modele}`;
  await c.from("smartphones").update({ marque: "Xiaomi", modele: newModele }).eq("id", r.id);
  console.log(`  ✓ Poco → Xiaomi: ${newModele}`);
}

// 4. Google → Google Pixel (cohérence avec CSV)
const { data: googleRows } = await c.from("smartphones").select("id,modele").eq("marque","Google");
console.log(`\nGoogle rows: ${googleRows?.length}`);
for (const r of googleRows ?? []) {
  await c.from("smartphones").update({ marque: "Google Pixel" }).eq("id", r.id);
  console.log(`  ✓ Google → Google Pixel: ${r.modele}`);
}

console.log("\nDone.");
