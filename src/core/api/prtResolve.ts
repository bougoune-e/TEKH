/**
 * PRT — logique de cache & fraîcheur (charte : refresh ~30 jours).
 * La résolution complète (DB locale → eBay async → jamais d’erreur bloquante utilisateur)
 * sera branchée sur la table `smartphones` + Edge Function ou route backend.
 */

/** Aligné sur `tekh_backend/backend/lib/ebay.mjs` (Facteur Afrique appliqué à la médiane EUR). */
export const DEFAULT_FACTEUR_AFRIQUE = 0.9;

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
