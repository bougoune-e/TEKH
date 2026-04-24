import { createClient } from "@supabase/supabase-js";
const c = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1. Supprimer le Google Pixel original (2016, 25 000 FCFA)
const { error: del1 } = await c.from("smartphones")
  .delete()
  .eq("marque", "Google Pixel")
  .eq("modele", "Google Pixel");
if (del1) { console.error("Delete Pixel original:", del1.message); process.exit(1); }
console.log("✓ Google Pixel original supprimé");

// 2. Supprimer toutes les lignes Pixel 10 existantes
const pixel10Models = [
  "Google Pixel 10",
  "Google Pixel 10 Pro",
  "Google Pixel 10 Pro XL",
  "Google Pixel 10 Pro Fold",
  "Google Pixel 10a",
];
for (const modele of pixel10Models) {
  const { error } = await c.from("smartphones").delete().eq("marque", "Google Pixel").eq("modele", modele);
  if (error) { console.error(`Delete ${modele}:`, error.message); process.exit(1); }
}
console.log("✓ Anciennes lignes Pixel 10 supprimées");

// 3. Insérer le lineup Pixel 10 complet
const rows = [
  // ── Pixel 10 ──────────────────────────────
  { modele:"Google Pixel 10",        variante:"128GB",  prt_fcfa:540000,   classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { modele:"Google Pixel 10",        variante:"256GB",  prt_fcfa:580000,   classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  // ── Pixel 10 Pro ──────────────────────────
  { modele:"Google Pixel 10 Pro",    variante:"128GB",  prt_fcfa:695000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro",    variante:"256GB",  prt_fcfa:740000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro",    variante:"512GB",  prt_fcfa:790000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro",    variante:"1TB",    prt_fcfa:850000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  // ── Pixel 10 Pro XL ───────────────────────
  { modele:"Google Pixel 10 Pro XL", variante:"256GB",  prt_fcfa:850000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro XL", variante:"512GB",  prt_fcfa:910000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro XL", variante:"1TB",    prt_fcfa:970000,   classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  // ── Pixel 10 Pro Fold ─────────────────────
  { modele:"Google Pixel 10 Pro Fold",variante:"256GB", prt_fcfa:1200000,  classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro Fold",variante:"512GB", prt_fcfa:1300000,  classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro Fold",variante:"1TB",   prt_fcfa:1400000,  classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  // ── Pixel 10a ─────────────────────────────
  { modele:"Google Pixel 10a",       variante:"128GB",  prt_fcfa:570000,   classe_tekh:"A", specs:{ram:8},  annee_sortie:2026 },
  { modele:"Google Pixel 10a",       variante:"256GB",  prt_fcfa:610000,   classe_tekh:"A", specs:{ram:8},  annee_sortie:2026 },
].map(r => ({ ...r, marque: "Google Pixel" }));

const { error: insErr } = await c.from("smartphones").insert(rows);
if (insErr) { console.error("Insert error:", insErr.message); process.exit(1); }
console.log(`✓ ${rows.length} lignes Pixel 10 insérées`);

// 4. Résumé
console.log("\nRécap Pixel 10 inséré:");
rows.forEach(r => console.log(`  ${r.modele} ${r.variante} → ${r.prt_fcfa.toLocaleString()} FCFA`));
