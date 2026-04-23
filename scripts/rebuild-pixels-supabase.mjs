import { createClient } from "@supabase/supabase-js";
const c = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1. Supprimer TOUT ce qui est Google Pixel dans Supabase
const { error: delErr } = await c.from("smartphones").delete().eq("marque", "Google Pixel");
if (delErr) { console.error("Delete error:", delErr.message); process.exit(1); }
console.log("✓ Toutes les lignes Google Pixel supprimées");

// 2. Données canoniques propres
const rows = [
  // ── 2016 ──────────────────────────────────────────────
  { modele:"Google Pixel",         variante:"128GB",  prt_fcfa:25000,  classe_tekh:"F", specs:{ram:4},  annee_sortie:2016 },
  { modele:"Google Pixel XL",      variante:"128GB",  prt_fcfa:16000,  classe_tekh:"F", specs:{ram:4},  annee_sortie:2016 },
  // ── 2017 ──────────────────────────────────────────────
  { modele:"Google Pixel 2",       variante:"64GB",   prt_fcfa:26000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2017 },
  { modele:"Google Pixel 2",       variante:"128GB",  prt_fcfa:38000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2017 },
  { modele:"Google Pixel 2 XL",    variante:"64GB",   prt_fcfa:45000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2017 },
  { modele:"Google Pixel 2 XL",    variante:"128GB",  prt_fcfa:52000,  classe_tekh:"E", specs:{ram:6},  annee_sortie:2017 },
  // ── 2018 ──────────────────────────────────────────────
  { modele:"Google Pixel 3",       variante:"64GB",   prt_fcfa:35000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2018 },
  { modele:"Google Pixel 3",       variante:"128GB",  prt_fcfa:48000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2018 },
  { modele:"Google Pixel 3 XL",    variante:"64GB",   prt_fcfa:52000,  classe_tekh:"E", specs:{ram:4},  annee_sortie:2018 },
  { modele:"Google Pixel 3 XL",    variante:"128GB",  prt_fcfa:63000,  classe_tekh:"E", specs:{ram:6},  annee_sortie:2018 },
  { modele:"Google Pixel 3a",      variante:"64GB",   prt_fcfa:42000,  classe_tekh:"E", specs:{ram:6},  annee_sortie:2018 },
  { modele:"Google Pixel 3a XL",   variante:"64GB",   prt_fcfa:57000,  classe_tekh:"E", specs:{ram:6},  annee_sortie:2018 },
  // ── 2019 ──────────────────────────────────────────────
  { modele:"Google Pixel 4",       variante:"64GB",   prt_fcfa:45000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  { modele:"Google Pixel 4",       variante:"128GB",  prt_fcfa:65000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  { modele:"Google Pixel 4 XL",    variante:"64GB",   prt_fcfa:66000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  { modele:"Google Pixel 4 XL",    variante:"128GB",  prt_fcfa:75000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  { modele:"Google Pixel 4a",      variante:"128GB",  prt_fcfa:46000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  { modele:"Google Pixel 4a (5G)", variante:"128GB",  prt_fcfa:52000,  classe_tekh:"D", specs:{ram:6},  annee_sortie:2019 },
  // ── 2020 ──────────────────────────────────────────────
  { modele:"Google Pixel 5",       variante:"128GB",  prt_fcfa:130000, classe_tekh:"D", specs:{ram:8},  annee_sortie:2020 },
  { modele:"Google Pixel 5a (5G)", variante:"128GB",  prt_fcfa:95000,  classe_tekh:"C", specs:{ram:6},  annee_sortie:2020 },
  // ── 2021 ──────────────────────────────────────────────
  { modele:"Google Pixel 6",       variante:"128GB",  prt_fcfa:140000, classe_tekh:"C", specs:{ram:12}, annee_sortie:2021 },
  { modele:"Google Pixel 6",       variante:"256GB",  prt_fcfa:110000, classe_tekh:"C", specs:{ram:6},  annee_sortie:2021 },
  { modele:"Google Pixel 6 Pro",   variante:"128GB",  prt_fcfa:115000, classe_tekh:"C", specs:{ram:6},  annee_sortie:2021 },
  { modele:"Google Pixel 6 Pro",   variante:"256GB",  prt_fcfa:160000, classe_tekh:"C", specs:{ram:12}, annee_sortie:2021 },
  { modele:"Google Pixel 6 Pro",   variante:"512GB",  prt_fcfa:185000, classe_tekh:"C", specs:{ram:12}, annee_sortie:2021 },
  { modele:"Google Pixel 6a",      variante:"128GB",  prt_fcfa:105000, classe_tekh:"C", specs:{ram:8},  annee_sortie:2021 },
  // ── 2022 ──────────────────────────────────────────────
  { modele:"Google Pixel 7",       variante:"128GB",  prt_fcfa:145000, classe_tekh:"B", specs:{ram:12}, annee_sortie:2022 },
  { modele:"Google Pixel 7",       variante:"256GB",  prt_fcfa:125000, classe_tekh:"B", specs:{ram:8},  annee_sortie:2022 },
  { modele:"Google Pixel 7 Pro",   variante:"128GB",  prt_fcfa:140000, classe_tekh:"B", specs:{ram:8},  annee_sortie:2022 },
  { modele:"Google Pixel 7 Pro",   variante:"256GB",  prt_fcfa:165000, classe_tekh:"B", specs:{ram:12}, annee_sortie:2022 },
  { modele:"Google Pixel 7 Pro",   variante:"512GB",  prt_fcfa:185000, classe_tekh:"B", specs:{ram:12}, annee_sortie:2022 },
  { modele:"Google Pixel 7a",      variante:"128GB",  prt_fcfa:200000, classe_tekh:"B", specs:{ram:8},  annee_sortie:2022 },
  // ── 2023 ──────────────────────────────────────────────
  { modele:"Google Pixel 8",       variante:"128GB",  prt_fcfa:300000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2023 },
  { modele:"Google Pixel 8",       variante:"256GB",  prt_fcfa:230000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2023 },
  { modele:"Google Pixel 8 Pro",   variante:"128GB",  prt_fcfa:220000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2023 },
  { modele:"Google Pixel 8 Pro",   variante:"256GB",  prt_fcfa:350000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2023 },
  { modele:"Google Pixel 8 Pro",   variante:"512GB",  prt_fcfa:400000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2023 },
  { modele:"Google Pixel 8 Pro",   variante:"1024GB", prt_fcfa:450000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2023 },
  { modele:"Google Pixel 8a",      variante:"128GB",  prt_fcfa:185000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2023 },
  { modele:"Google Pixel 8a",      variante:"256GB",  prt_fcfa:260000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2023 },
  // ── 2024 ──────────────────────────────────────────────
  { modele:"Google Pixel 9",       variante:"128GB",  prt_fcfa:267000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2024 },
  { modele:"Google Pixel 9",       variante:"256GB",  prt_fcfa:278000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro",   variante:"256GB",  prt_fcfa:420000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro",   variante:"512GB",  prt_fcfa:480000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro",   variante:"1024GB", prt_fcfa:515000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro XL",variante:"128GB",  prt_fcfa:378000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro XL",variante:"256GB",  prt_fcfa:350000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro XL",variante:"512GB",  prt_fcfa:382000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro XL",variante:"1024GB", prt_fcfa:417000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro Fold",variante:"128GB",prt_fcfa:220000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro Fold",variante:"512GB",prt_fcfa:300000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9 Pro Fold",variante:"1024GB",prt_fcfa:320000,classe_tekh:"A", specs:{ram:16}, annee_sortie:2024 },
  { modele:"Google Pixel 9a",      variante:"128GB",  prt_fcfa:265000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2024 },
  { modele:"Google Pixel 9a",      variante:"256GB",  prt_fcfa:325000, classe_tekh:"A", specs:{ram:8},  annee_sortie:2024 },
  // ── 2026 ──────────────────────────────────────────────
  { modele:"Google Pixel 10",      variante:"128GB",  prt_fcfa:405000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { modele:"Google Pixel 10",      variante:"256GB",  prt_fcfa:460000, classe_tekh:"A", specs:{ram:12}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro",  variante:"256GB",  prt_fcfa:695000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
  { modele:"Google Pixel 10 Pro",  variante:"512GB",  prt_fcfa:695000, classe_tekh:"A", specs:{ram:16}, annee_sortie:2026 },
].map(r => ({ ...r, marque: "Google Pixel" }));

const { error: insErr } = await c.from("smartphones").insert(rows);
if (insErr) { console.error("Insert error:", insErr.message); process.exit(1); }
console.log(`✓ ${rows.length} lignes Google Pixel réinsérées proprement`);
