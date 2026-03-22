/**
 * PRT — cache **persistant** en base (`smartphones.prt_fcfa`, `prix_ebay_eur`).
 * L’app lit uniquement Supabase : **aucun appel eBay** à chaque requête utilisateur.
 * Les scripts `prt:sync-prices` / `prt:resync-all-ebay` alimentent ce cache (charte : refresh ~30 j.).
 */

/** Aligné sur `tekh_backend/backend/lib/ebay.mjs` (1 = médiane eBay convertie en FCFA). */
export const DEFAULT_FACTEUR_AFRIQUE = 1;

export const PRT_CACHE_TTL_DAYS = 30;

export type SmartphonePrtRow = {
  id: string;
  marque: string;
  modele: string;
  variante: string;
  prt_fcfa: number | null;
  prt_updated_at: string | null;
  facteur_afrique?: number | null;
};

/** True si le PRT en base peut être servi comme donnée « fraîche ». */
export function isPrtFresh(
  prtUpdatedAt: string | null,
  days: number = PRT_CACHE_TTL_DAYS
): boolean {
  if (!prtUpdatedAt) return false;
  const t = new Date(prtUpdatedAt).getTime();
  return Date.now() - t < days * 86400000;
}
