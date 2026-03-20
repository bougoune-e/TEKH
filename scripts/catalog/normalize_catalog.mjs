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
      } else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function esc(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function toNum(v) {
  const n = Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : null;
}

if (!fs.existsSync(FILE)) {
  console.error(`Fichier introuvable: ${FILE}`);
  process.exit(1);
}

const lines = fs.readFileSync(FILE, 'utf8').split(/\r?\n/).filter(Boolean);
const headers = parseCsvLine(lines[0]);
const rows = lines.slice(1).map((line) => {
  const vals = parseCsvLine(line);
  const obj = {};
  headers.forEach((h, i) => obj[h] = (vals[i] ?? '').trim());
  return obj;
});

let fixedYear = 0;
const byKey = new Map();

for (const row of rows) {
  const y = toNum(row.annee_sortie);
  if (y && y > CURRENT_YEAR + 1) {
    row.annee_sortie = String(CURRENT_YEAR);
    fixedYear++;
  }

  const brand = (row.marques || '').toLowerCase();
  const model = (row.modele_exact || '').toLowerCase();
  const storage = row.stockages_gb || '0';
  const ram = row.ram_gb || '0';
  const key = `${brand}|${model}|${storage}|${ram}`;

  const prev = byKey.get(key);
  if (!prev) {
    byKey.set(key, row);
    continue;
  }

  const prevPrice = toNum(prev.prix_neuf_en_fcfa) || 0;
  const thisPrice = toNum(row.prix_neuf_en_fcfa) || 0;
  if (thisPrice > prevPrice) byKey.set(key, row);
}

const dedupRows = Array.from(byKey.values());
const out = [headers.join(',')].concat(dedupRows.map((r) => headers.map((h) => esc(r[h])).join(','))).join('\n') + '\n';
fs.writeFileSync(FILE, out, 'utf8');

console.log('[catalog:normalize] done');
console.log(`rows_before=${rows.length}`);
console.log(`rows_after=${dedupRows.length}`);
console.log(`fixed_future_year=${fixedYear}`);
