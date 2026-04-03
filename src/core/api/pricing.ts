/**
 * TEKH+ — Moteur de pricing (source de vérité métier)
 * VRT = PRT × C_marque × C_age × C_etat × C_batterie × C_marche × C_securite + Bonus
 * Puis × C_châssis (0.85 si abîmé). Plancher : VRT < 5% du PRT → reprise refusée (0).
 */

export const VRT_FLOOR_RATIO = 0.05;
export const C_MARCHE = 0.85;
export const C_SECURITE = 0.85;
/** Soulte négative absorbée par TEKH+ sans conversion en points (FCFA) */
export const DOWNGRADE_ABSORPTION_CAP_FCFA = 15_000;
export const TEKHPOINT_MAX_RATIO_PER_TX = 0.3;
export const TEKHPOINT_EXPIRY_MONTHS = 6;

/** États écran (Dealbox — 3 options UI) */
export type EcranTekh = "parfait" | "raye" | "casse";
export type ChassisTekh = "intact" | "abime";
/** Santé batterie (bornes inclusives côté UI) */
export type BatterieTekh = "gte90" | "gte80_89" | "gte70_79" | "gte60_69" | "lt60" | "unknown";

export interface TekhBonusInput {
  boiteEtAccessoiresComplets?: boolean;
  compatible5g?: boolean;
  debloqueTousOperateurs?: boolean;
  factureAchatOriginale?: boolean;
}

/**
 * Diagnostics alignés charte + champs legacy (screenState, batteryState, etc.)
 * pour compatibilité ascendante.
 */
export interface Diagnostics {
  ecran?: EcranTekh;
  chassis?: ChassisTekh;
  batterie?: BatterieTekh;
  bonus?: TekhBonusInput;

  /** @deprecated Utiliser ecran */
  screenState?: "intact" | "cracked" | "scratched" | "burned" | "dead" | string;
  /** @deprecated Non utilisé dans la formule VRT officielle */
  batteryState?: "good" | "low" | "replace" | string;
  biometricsState?: string;
  cameraState?: string;
  /** @deprecated Remplacé par chassis */
  aestheticState?: "very_good" | "visible" | "damaged" | string;

  ecran_casse?: boolean;
  batterie_faible?: boolean;
  face_id_hs?: boolean;
  camera_hs?: boolean;
  etat_moyen?: boolean;
}

function normalizeEcran(diag: Diagnostics): EcranTekh {
  if (diag.ecran) return diag.ecran;
  const s = (diag.screenState || "").toLowerCase();
  if (s === "intact" || s === "parfait" || s === "ecran_parfait") return "parfait";
  if (s === "scratched" || s === "raye" || s === "ecran_raye") return "raye";
  return "casse"; // cracked, burned, dead, casse
}

function normalizeChassis(diag: Diagnostics): ChassisTekh {
  if (diag.chassis) return diag.chassis;
  const a = (diag.aestheticState || "").toLowerCase();
  if (a === "very_good" || a === "intact" || a === "chassis_intact") return "intact";
  return "abime";
}

function normalizeBatterie(diag: Diagnostics): BatterieTekh {
  if (diag.batterie) return diag.batterie;
  const b = (diag.batteryState || "").toLowerCase();
  if (b === "gte90") return "gte90";
  /** Ancien simulateur : good ≈ 80–89 % */
  if (b === "good") return "gte80_89";
  if (b === "low") return "gte70_79";
  if (b === "replace") return "gte60_69";
  if (b === "gte80_89") return "gte80_89";
  if (b === "gte70_79") return "gte70_79";
  if (b === "gte60_69") return "gte60_69";
  if (b === "lt60") return "lt60";
  return "unknown";
}

/** C_etat — uniquement l'écran (coefficients charte) */
function getCoefficientEtatEcran(ecran: EcranTekh): number {
  switch (ecran) {
    case "parfait":
      return 0.95;
    case "raye":
      return 0.75;
    case "casse":
      return 0.22;
    default:
      return 0.85;
  }
}

/** C_batterie — charte Section 4 */
function getCoefficientBatterie(b: BatterieTekh): number {
  switch (b) {
    case "gte90":
      return 1.0;
    case "gte80_89":
      return 0.92;
    case "gte70_79":
      return 0.8;
    case "gte60_69":
      return 0.68;
    case "lt60":
    case "unknown":
    default:
      return 0.5;
  }
}

/** Bonus additifs, plafonné à +7,5 % du VRT avant bonus */
function applyBonus(vrtBeforeBonus: number, bonus?: TekhBonusInput): number {
  if (!bonus) return Math.round(vrtBeforeBonus);
  let p = 0;
  if (bonus.boiteEtAccessoiresComplets) p += 0.03;
  if (bonus.compatible5g) p += 0.02;
  if (bonus.debloqueTousOperateurs) p += 0.015;
  if (bonus.factureAchatOriginale) p += 0.01;
  p = Math.min(0.075, p);
  return Math.round(vrtBeforeBonus * (1 + p));
}

/**
 * A. Coefficient MARQUE (C_marque) — Section 4
 */
const COEFFICIENTS_MARQUE: Record<string, number> = {
  apple: 0.9,
  iphone: 0.9,
  google: 0.86,
  pixel: 0.86,
  oneplus: 0.82,
  sony: 0.8,
  xperia: 0.8,
  honor: 0.78,
  nothing: 0.76,
  xiaomi: 0.76,
  motorola: 0.75,
  oppo: 0.74,
  huawei: 0.72,
  vivo: 0.72,
  poco: 0.7,
  tecno: 0.7,
  redmi: 0.68,
  infinix: 0.68,
  realme: 0.67,
  nokia: 0.65,
  hmd: 0.65,
  wiko: 0.58,
  itel: 0.55,
  blackview: 0.52,
  ulefone: 0.52,
  oukitel: 0.52,
  autres: 0.55,
  others: 0.55,
};

function getCoefficientMarque(brand: string, model?: string): number {
  const b = brand.toLowerCase();
  const m = (model || "").toLowerCase();

  if (b === "samsung") {
    if (/\b(s|z)\d+/i.test(m) || /\bgalaxy\s*(s|z)\b/i.test(m)) return 0.9;
    if (/\ba(5|7)\d+\b/i.test(m) || /\bgalaxy\s*a(5|7)\d+\b/i.test(m)) return 0.84;
    return 0.84;
  }

  return COEFFICIENTS_MARQUE[b] ?? COEFFICIENTS_MARQUE.autres;
}

function getCoefficientAge(releaseYear: number | null): number {
  if (!releaseYear) return 0.4;
  const currentYear = new Date().getFullYear();
  const age = currentYear - releaseYear;

  if (age < 1) return 0.95;
  if (age < 2) return 0.85;
  if (age < 3) return 0.75;
  if (age < 4) return 0.62;
  return 0.4;
}

/**
 * VRT = PRT × Π coeffs × C_châssis puis bonus (additif plafonné).
 */
export function calculerEstimation(
  prt: number,
  brand: string,
  releaseYear: number | null,
  diag: Diagnostics,
  model?: string
): number {
  if (!prt || prt <= 0) return 0;

  const ecran = normalizeEcran(diag);
  const chassis = normalizeChassis(diag);
  const batterie = normalizeBatterie(diag);

  // NOTE: C_marque and C_age are intentionally NOT applied here.
  // The PRT already reflects the current market price which encodes
  // brand reputation and age depreciation. Applying them again would
  // cause double-depreciation (audit April 2026).
  const cEtat = getCoefficientEtatEcran(ecran);
  const cBatt = getCoefficientBatterie(batterie);

  let vrt = prt * (cEtat * cBatt * C_MARCHE * C_SECURITE);

  if (chassis === "abime") vrt *= 0.85;

  vrt = applyBonus(vrt, diag.bonus);

  if (vrt < prt * VRT_FLOOR_RATIO) return 0;
  return Math.round(vrt);
}

export interface SwapGapResult {
  /** Soulte = PRT_cible − VRT_utilisateur */
  gap: number;
  blocked: boolean;
  reason?: string;
  /** Montant à payer par l’utilisateur (upgrade), jamais de cash sortant */
  amountToPay: number;
  /** Crédit TekhPoints (1 pt = 1 FCFA), reliquat downgrade */
  tekhPointsCredited: number;
  /** True si soulte négative ≤ 15 000 FCFA absorbée */
  downgradeAbsorbed: boolean;
  formatted: string;
  /** gap > 0 → utilisateur paie la différence */
  isUpgrade: boolean;
}

/**
 * SOULTE = PRT_cible − VRT_utilisateur
 * Downgrade : excédent ≤ 15 000 FCFA absorbé ; au-delà → TekhPoints = max(0, excédent − 15 000).
 */
export function getSwapGap(
  vrtUtilisateur: number,
  prtCible: number,
  classUtilisateur = "B",
  classCible = "B"
): SwapGapResult {
  const cu = (classUtilisateur || "").toUpperCase();
  const cc = (classCible || "").toUpperCase();
  const classIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  if (vrtUtilisateur <= 0) {
    return {
      gap: 0,
      blocked: true,
      reason: "Reprise refusée : VRT inférieure au plancher minimal (5 % du PRT).",
      amountToPay: 0,
      tekhPointsCredited: 0,
      downgradeAbsorbed: false,
      formatted: fmt(0),
      isUpgrade: false,
    };
  }

  if (cu === "F") {
    return {
      gap: 0,
      blocked: true,
      reason: "Échange bloqué : aucun échange autorisé pour un appareil de classe F.",
      amountToPay: 0,
      tekhPointsCredited: 0,
      downgradeAbsorbed: false,
      formatted: fmt(0),
      isUpgrade: false,
    };
  }

  if (classIndex[cu] !== undefined && classIndex[cc] !== undefined && Math.abs(classIndex[cu] - classIndex[cc]) > 2) {
    return {
      gap: 0,
      blocked: true,
      reason: "Échange non autorisé : l'écart de classe dépasse 2 niveaux.",
      amountToPay: 0,
      tekhPointsCredited: 0,
      downgradeAbsorbed: false,
      formatted: fmt(0),
      isUpgrade: false,
    };
  }

  const gap = prtCible - vrtUtilisateur;
  const excédentUtilisateur = vrtUtilisateur - prtCible;

  if (gap >= 0) {
    return {
      gap,
      blocked: false,
      amountToPay: gap,
      tekhPointsCredited: 0,
      downgradeAbsorbed: false,
      formatted: fmt(gap),
      isUpgrade: true,
    };
  }

  if (excédentUtilisateur <= DOWNGRADE_ABSORPTION_CAP_FCFA) {
    return {
      gap,
      blocked: false,
      amountToPay: 0,
      tekhPointsCredited: 0,
      downgradeAbsorbed: true,
      formatted: "0 FCFA (différence absorbée par TEKH+)",
      isUpgrade: false,
    };
  }

  const tekhPointsCredited = Math.round(excédentUtilisateur);

  return {
    gap,
    blocked: false,
    amountToPay: 0,
    tekhPointsCredited,
    downgradeAbsorbed: false,
    formatted: `${tekhPointsCredited.toLocaleString("fr-FR")} TekhPoints`,
    isUpgrade: false,
  };
}
