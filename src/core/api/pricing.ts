/**
 * CHARTE OFFICIELLE DE PRICING TEKH+ (v2.1)
 * Logic for calculating Trade-in Value (VRT) and Swap Gap.
 */

export interface Diagnostics {
    ecran_casse: boolean;
    batterie_faible: boolean;
    face_id_hs: boolean;
    camera_hs: boolean;
    etat_moyen: boolean;
    // UI mapping
    screenState?: "intact" | "cracked" | "scratched" | "burned" | "dead";
    batteryState?: "good" | "low" | "replace";
    biometricsState?: "ok" | "nok" | "na";
    cameraState?: "ok" | "degraded" | "nok";
    aestheticState?: "very_good" | "visible" | "damaged";
}

export const VRT_FLOOR_RATIO = 0.05;

/**
 * A. Coefficient MARQUE (C_marque)
 */
const COEFFICIENTS_MARQUE: Record<string, number> = {
    "apple": 0.90,
    "iphone": 0.90,
    // Samsung has two tiers in v2.1 and is handled in getCoefficientMarque().
    "samsung": 0.84,
    "google": 0.86,
    "pixel": 0.86,
    "oneplus": 0.82,
    "sony": 0.80,
    "xperia": 0.80,
    "honor": 0.78,
    "nothing": 0.76,
    "xiaomi": 0.76,
    "motorola": 0.75,
    "oppo": 0.74,
    "huawei": 0.72,
    "vivo": 0.72,
    "poco": 0.70,
    "tecno": 0.70,
    "redmi": 0.68,
    "infinix": 0.68,
    "realme": 0.67,
    "nokia": 0.65,
    "hmd": 0.65,
    "wiko": 0.58,
    "itel": 0.55,
    "blackview": 0.52,
    "ulefone": 0.52,
    "oukitel": 0.52,
    "others": 0.55
};

function getCoefficientMarque(brand: string, model?: string): number {
    const b = brand.toLowerCase();
    const m = (model || "").toLowerCase();

    if (b === "samsung") {
        // v2.1 split: S/Z series -> 0.90 ; A5x/A7x -> 0.84 ; otherwise conservative tier.
        if (/\b(s|z)\d+/i.test(m) || /\bgalaxy\s*(s|z)\b/i.test(m)) return 0.90;
        if (/\ba(5|7)\d+\b/i.test(m) || /\bgalaxy\s*a(5|7)\d+\b/i.test(m)) return 0.84;
        return 0.84;
    }

    return COEFFICIENTS_MARQUE[b] || COEFFICIENTS_MARQUE["others"];
}

/**
 * B. Coefficient ANCIENNETÉ (C_age)
 */
function getCoefficientAge(releaseYear: number | null): number {
    if (!releaseYear) return 0.50; // Case unknown/very old
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    if (age < 1) return 0.95;
    if (age >= 1 && age < 2) return 0.85;
    if (age >= 2 && age < 3) return 0.75;
    if (age >= 3 && age < 4) return 0.62;
    return 0.40; // > 4 ans
}

/**
 * C. Coefficient ÉTAT PHYSIQUE (C_état)
 */
function getCoefficientEtat(diag: Diagnostics): number {
    // Priority: Critical (Screen/Biometrics)
    if (diag.screenState === "dead" || diag.screenState === "burned" || diag.screenState === "cracked") return 0.22; // Critique
    if (diag.screenState === "scratched") return 0.50; // Rayé (dégradé)
    if (diag.biometricsState === "nok") return 0.22; // Critique

    // Physical state
    if (diag.aestheticState === "damaged") return 0.45; // Mauvais
    if (diag.aestheticState === "visible") return 0.70; // Moyen
    if (diag.cameraState === "degraded" || diag.cameraState === "nok") return 0.70; // Correct

    if (diag.aestheticState === "very_good") return 0.95; // Excellent

    return 0.85; // Bon (Default)
}

/**
 * D. Coefficient Batterie (C_batterie)
 * Mapping UI simplified:
 * - good    -> 0.92 (80-89%)
 * - low     -> 0.80 (70-79%)
 * - replace -> 0.68 (60-69%)
 * - unknown -> 0.80 (conservative)
 */
function getCoefficientBatterie(diag: Diagnostics): number {
    if (diag.batteryState === "good") return 0.92;
    if (diag.batteryState === "low") return 0.80;
    if (diag.batteryState === "replace") return 0.68;
    return 0.80;
}

/**
 * MAIN: VRT = PRT * (C_marque * C_age * C_etat * C_marche * C_securite)
 */
export function calculerEstimation(
    prt: number,
    brand: string,
    releaseYear: number | null,
    diag: Diagnostics,
    model?: string
): number {
    if (!prt || prt <= 0) return 0;

    const cMarque = getCoefficientMarque(brand, model);
    const cAge = getCoefficientAge(releaseYear);
    const cEtat = getCoefficientEtat(diag);
    const cBatterie = getCoefficientBatterie(diag);
    const cMarche = 0.90;
    const cSecurite = 0.85;

    const vrt = prt * (cMarque * cAge * cEtat * cBatterie * cMarche * cSecurite);
    if (vrt < prt * VRT_FLOOR_RATIO) return 0;

    return Math.round(vrt);
}

/**
 * SOULTE = PRT_cible - VRT_utilisateur
 */
export function getSwapGap(vrtUtilisateur: number, prtCible: number, classUtilisateur: string, classCible: string) {
    const cu = (classUtilisateur || "").toUpperCase();
    const cc = (classCible || "").toUpperCase();
    const classIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

    if (vrtUtilisateur <= 0) {
        return {
            gap: 0,
            blocked: true,
            reason: "Reprise refusée : VRT inférieure au plancher minimal (5% du PRT).",
        };
    }

    // Blocage absolu v2.1 : appareil classe F
    if (cu === "F") {
        return {
            gap: 0,
            blocked: true,
            reason: "Échange bloqué : aucun échange autorisé pour un appareil de classe F.",
        };
    }

    // Garde-fou 1: Downgrade Critique
    if (vrtUtilisateur > 1.4 * prtCible) {
        return {
            gap: 0,
            blocked: true,
            reason: "Échange bloqué : La valeur de votre téléphone est trop élevée par rapport au modèle ciblé (Downgrade critique)."
        };
    }

    // Garde-fou 2: Cohérence de Gamme (écart max 2 niveaux)
    if (classIndex[cu] !== undefined && classIndex[cc] !== undefined && Math.abs(classIndex[cu] - classIndex[cc]) > 2) {
        return {
            gap: 0,
            blocked: true,
            reason: "Échange non autorisé : l'écart de classe dépasse 2 niveaux."
        };
    }

    const finalGap = prtCible - vrtUtilisateur;

    return {
        gap: finalGap,
        blocked: false,
        formatted: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(finalGap)
    };
}
