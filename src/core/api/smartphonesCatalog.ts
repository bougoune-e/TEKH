/**
 * Référentiel `smartphones` (Supabase) — PRT prioritaire pour le simulateur.
 */
import { supabase as realClient } from "./supabaseClient";
import { isPrtFresh } from "./prtResolve";

export type SmartphoneRow = {
  id: string;
  marque: string;
  modele: string;
  variante: string;
  annee_sortie: number | null;
  classe_tekh: string | null;
  specs: Record<string, unknown> | null;
  prt_fcfa: number | null;
  prt_updated_at: string | null;
  facteur_afrique: number | null;
};

function parseStorageGbFromVariante(variante: string): number | null {
  const m = String(variante || "").match(/(\d+)\s*(GB|Go|gb|go)/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

/** Lignes pour une marque + modèle (trim, correspondance insensible à la casse côté SQL). */
export async function fetchSmartphonesForBrandModel(brand: string, model: string): Promise<SmartphoneRow[]> {
  if (!realClient) return [];
  const b = brand.trim();
  const m = model.trim();
  const { data, error } = await realClient
    .from("smartphones")
    .select("id, marque, modele, variante, annee_sortie, classe_tekh, specs, prt_fcfa, prt_updated_at, facteur_afrique")
    .ilike("marque", b)
    .ilike("modele", m);

  if (error) {
    if (import.meta.env.DEV) console.warn("[smartphonesCatalog]", error.message);
    return [];
  }
  return (data || []) as SmartphoneRow[];
}

/** Modèles distincts présents dans `smartphones` pour une marque. */
export async function fetchDistinctModelsFromSmartphones(brand: string): Promise<string[]> {
  if (!realClient) return [];
  const { data, error } = await realClient
    .from("smartphones")
    .select("modele")
    .ilike("marque", brand.trim());

  if (error || !data?.length) return [];
  const set = new Set<string>();
  for (const row of data) {
    if (row.modele) set.add(String(row.modele).trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

/**
 * Choisit la ligne correspondant au stockage (Go) : variante "128GB", specs.stockage_gb, ou ligne unique sans variante.
 */
export function pickSmartphoneForStorage(rows: SmartphoneRow[], storageGb: number): SmartphoneRow | null {
  if (rows.length === 0) return null;
  const want = `${storageGb}gb`;
  const byVar = rows.find((r) => {
    const v = (r.variante || "").toLowerCase().replace(/\s/g, "");
    return v === want || v === `${storageGb}go`;
  });
  if (byVar) return byVar;

  const bySpec = rows.find((r) => {
    const s = r.specs as Record<string, unknown> | null;
    if (!s) return false;
    const g = Number(s.stockage_gb ?? s.storage_gb ?? s["Stockages (GB)"]);
    return Number.isFinite(g) && g === storageGb;
  });
  if (bySpec) return bySpec;

  if (rows.length === 1) {
    const only = rows[0];
    if (!only.variante || only.variante.trim() === "") return only;
    const parsed = parseStorageGbFromVariante(only.variante);
    if (parsed === storageGb) return only;
  }

  return rows.find((r) => parseStorageGbFromVariante(r.variante || "") === storageGb) || null;
}

export function smartphoneRowToPrtMeta(row: SmartphoneRow) {
  const stale = row.prt_updated_at ? !isPrtFresh(row.prt_updated_at) : true;
  return {
    prt_stale: stale,
    prt_updated_at: row.prt_updated_at,
    prt_source: "smartphones" as const,
  };
}
