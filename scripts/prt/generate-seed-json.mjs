#!/usr/bin/env node
/**
 * Génère seeds/smartphones.json (50 entrées) — à exécuter si besoin.
 * npm run prt:generate-seed
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

const base = [
  ["Tecno", "Spark 30 Pro", "256GB"],
  ["Tecno", "Camon 30 Premier", "512GB"],
  ["Infinix", "Zero 40", "256GB"],
  ["Infinix", "Note 40 Pro", "128GB"],
  ["Samsung", "Galaxy A55", "128GB"],
  ["Samsung", "Galaxy S24", "256GB"],
  ["Samsung", "Galaxy Z Flip5", "256GB"],
  ["Samsung", "Galaxy A35", "128GB"],
  ["Apple", "iPhone 16", "128GB"],
  ["Apple", "iPhone 15 Pro", "256GB"],
  ["Apple", "iPhone 14", "128GB"],
  ["Google", "Pixel 9", "128GB"],
  ["Google", "Pixel 8a", "128GB"],
  ["Xiaomi", "14T Pro", "512GB"],
  ["Redmi", "Note 14 Pro", "256GB"],
  ["Poco", "X7 Pro", "256GB"],
  ["Honor", "Magic6 Pro", "512GB"],
  ["OnePlus", "12", "256GB"],
  ["Oppo", "Reno12", "256GB"],
  ["Vivo", "V40", "256GB"],
  ["Motorola", "Edge 50 Pro", "256GB"],
  ["Realme", "GT 6", "256GB"],
  ["Nokia", "X30", "128GB"],
  ["Huawei", "Pura 70", "256GB"],
  ["Tecno", "Pova 6 Pro", "256GB"],
  ["Infinix", "Hot 50 Pro", "128GB"],
  ["Samsung", "Galaxy A25", "128GB"],
  ["Samsung", "Galaxy S23 FE", "256GB"],
  ["Tecno", "Phantom X2 Pro", "256GB"],
  ["Infinix", "GT 20 Pro", "256GB"],
  ["Xiaomi", "Redmi 13", "128GB"],
  ["Poco", "M6 Pro", "256GB"],
  ["Honor", "200 Pro", "512GB"],
  ["OnePlus", "Nord 4", "256GB"],
  ["Oppo", "A3 Pro", "256GB"],
  ["Vivo", "Y200", "128GB"],
  ["Motorola", "G84", "256GB"],
  ["Realme", "12 Pro+", "256GB"],
  ["Tecno", "Pop 9", "128GB"],
  ["Infinix", "Smart 9", "64GB"],
  ["Samsung", "Galaxy M55", "256GB"],
  ["Tecno", "Spark 20", "128GB"],
  ["Infinix", "Hot 40i", "128GB"],
  ["Samsung", "Galaxy A15", "128GB"],
  ["Samsung", "Galaxy A05s", "128GB"],
  ["Samsung", "Galaxy S24 Ultra", "512GB"],
  ["Apple", "iPhone 16 Pro Max", "256GB"],
  ["Google", "Pixel 9 Pro XL", "256GB"],
  ["Xiaomi", "14 Ultra", "512GB"],
  ["Honor", "Magic V2", "512GB"],
];

if (base.length !== 50) {
  console.error("La liste de base doit contenir exactement 50 entrées, actuellement:", base.length);
  process.exit(1);
}

const rows = base.map(([marque, modele, variante], i) => ({
  marque,
  modele,
  variante,
  annee_sortie: 2025 + (i % 2),
  statut: "disponible",
  specs: {
    reseau: "5G",
    "5g": true,
    stockage_gb: parseInt(String(variante).replace(/\D/g, ""), 10) || 128,
  },
}));

mkdirSync(join(root, "seeds"), { recursive: true });
writeFileSync(join(root, "seeds/smartphones.json"), JSON.stringify(rows, null, 2));
console.log(`[generate-seed] ${rows.length} lignes → seeds/smartphones.json`);
