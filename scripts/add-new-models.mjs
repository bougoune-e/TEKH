import { createClient } from "@supabase/supabase-js";
const c = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const entries = [
  { marque:"OnePlus",      modele:"OnePlus 15 5G",           variante:"512GB",      prt_fcfa:735000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { marque:"OnePlus",      modele:"OnePlus 15R",              variante:"512GB",      prt_fcfa:630000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"OnePlus",      modele:"OnePlus 13",               variante:"256GB",      prt_fcfa:580000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"OnePlus",      modele:"OnePlus 13",               variante:"512GB",      prt_fcfa:660000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { marque:"Google Pixel", modele:"Google Pixel 10 Pro",      variante:"256GB",      prt_fcfa:695000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { marque:"Google Pixel", modele:"Google Pixel 10 Pro",      variante:"512GB",      prt_fcfa:695000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { marque:"Google Pixel", modele:"Google Pixel 10",          variante:"128GB",      prt_fcfa:405000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"Google Pixel", modele:"Google Pixel 10",          variante:"256GB",      prt_fcfa:460000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"Motorola",     modele:"Motorola Edge 60 Ultra",   variante:"512GB",      prt_fcfa:590000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"Motorola",     modele:"Motorola Edge 60 Fusion",  variante:"256GB 8Go",  prt_fcfa:280000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2026 },
  { marque:"Motorola",     modele:"Motorola Edge 60 Fusion",  variante:"256GB 12Go", prt_fcfa:320000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"Motorola",     modele:"Moto G (2026)",            variante:"128GB",      prt_fcfa:145000, classe_tekh:"A", specs:{ram:4},  annee_sortie:2026 },
  { marque:"Infinix",      modele:"Infinix Zero 50 Ultra",    variante:"512GB",      prt_fcfa:350000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { marque:"Infinix",      modele:"Infinix Note 50 Pro",      variante:"256GB",      prt_fcfa:165000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2026 },
  { marque:"Infinix",      modele:"Infinix Hot 60 Pro Plus",  variante:"256GB",      prt_fcfa:250000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { marque:"Infinix",      modele:"Infinix Smart 10",         variante:"64GB",       prt_fcfa:55000,  classe_tekh:"A", specs:{ram:3},  annee_sortie:2026 },
  { marque:"Infinix",      modele:"Infinix Smart 10",         variante:"128GB",      prt_fcfa:75000,  classe_tekh:"A", specs:{ram:4},  annee_sortie:2026 },
];

const { error } = await c.from("smartphones").insert(entries);
if (error) { console.error("Erreur:", error.message); process.exit(1); }
console.log(`✓ ${entries.length} modèles insérés.`);
