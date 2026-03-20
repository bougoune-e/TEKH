import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const FILE = path.join(ROOT, 'data', 'catalog', 'tab_cleaned.csv');
const CURRENT_YEAR = new Date().getFullYear();

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function toNum(value) {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : null;
}

if (!fs.existsSync(FILE)) {
  console.error(`[catalog:validate] Fichier introuvable: ${FILE}`);
  process.exit(1);
}

const raw = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter(Boolean);
const headers = parseCsvLine(raw[0]);
const rows = raw.slice(1).map((line) => {
  const vals = parseCsvLine(line);
  const obj = {};
  headers.forEach((h, idx) => {
    obj[h] = (vals[idx] ?? '').trim();
  });
  return obj;
});

const issues = {
  missingBrandOrModel: 0,
  invalidStorage: 0,
  invalidPrice: 0,
  invalidYear: 0,
  suspiciousFutureYear: 0,
  missingRam: 0,
};

const years = [];
const duplicateKey = new Map();

for (const r of rows) {
  const brand = r.marques || '';
  const model = r.modele_exact || '';
  const storage = toNum(r.stockages_gb);
  const ram = toNum(r.ram_gb);
  const price = toNum(r.prix_neuf_en_fcfa);
  const year = toNum(r.annee_sortie);

  if (!brand || !model) issues.missingBrandOrModel++;
  if (!storage || storage <= 0) issues.invalidStorage++;
  if (!price || price <= 0) issues.invalidPrice++;
  if (!year || year < 2000) issues.invalidYear++;
  if (year && year > CURRENT_YEAR + 1) issues.suspiciousFutureYear++;
  if (!ram || ram <= 0) issues.missingRam++;

  if (year) years.push(year);

  const key = `${brand.toLowerCase()}|${model.toLowerCase()}|${storage ?? 'na'}|${ram ?? 'na'}`;
  duplicateKey.set(key, (duplicateKey.get(key) || 0) + 1);
}

const duplicateCount = Array.from(duplicateKey.values()).filter((n) => n > 1).reduce((a, b) => a + (b - 1), 0);
const year2025 = years.filter((y) => y === 2025).length;
const year2026 = years.filter((y) => y === 2026).length;

console.log('=== Catalog Validation Report ===');
console.log(`file: ${FILE}`);
console.log(`rows: ${rows.length}`);
console.log(`year_min: ${years.length ? Math.min(...years) : 'n/a'}`);
console.log(`year_max: ${years.length ? Math.max(...years) : 'n/a'}`);
console.log(`entries_2025: ${year2025}`);
console.log(`entries_2026: ${year2026}`);
console.log(`duplicates: ${duplicateCount}`);
console.log('--- issues ---');
for (const [k, v] of Object.entries(issues)) {
  console.log(`${k}: ${v}`);
}

const critical = issues.missingBrandOrModel + issues.invalidStorage + issues.invalidPrice + issues.invalidYear;
if (critical > 0) {
  console.error(`[catalog:validate] ECHEC: ${critical} anomalies critiques.`);
  process.exit(2);
}

if (issues.suspiciousFutureYear > 0) {
  console.warn(`[catalog:validate] AVERTISSEMENT: ${issues.suspiciousFutureYear} années suspectes (> current+1).`);
}

console.log('[catalog:validate] OK');
