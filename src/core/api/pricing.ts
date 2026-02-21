/**
 * CHARTE OFFICIELLE DE PRICING TEHK+ (v1.0)
 * Logic for calculating Trade-in Value (VRT) and Swap Gap.
 */

export interface Diagnostics {
    ecran_casse: boolean;
    batterie_faible: boolean;
    face_id_hs: boolean;
    camera_hs: boolean;
    etat_moyen: boolean;
    // UI mapping
    screenState?: "intact" | "cracked" | "burned" | "dead";
    batteryState?: "good" | "low" | "replace";
    biometricsState?: "ok" | "nok" | "na";
    cameraState?: "ok" | "degraded" | "nok";
    aestheticState?: "very_good" | "visible" | "damaged";
}

export const MINIMUM_TRADE_FEE = 10000;

/**
 * A. Coefficient MARQUE (C_marque)
 */
const COEFFICIENTS_MARQUE: Record<string, number> = {
    "apple": 0.90,
    "iphone": 0.90,
    "samsung": 0.85,
    "huawei": 0.80,
    "honor": 0.78,
    "motorola": 0.75,
    "tecno": 0.70,
    "infinix": 0.68,
    "itel": 0.60,
    "others": 0.65
};

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
    if (age >= 3 && age < 4) return 0.65;
    return 0.50; // > 4 ans
}

/**
 * C. Coefficient ÉTAT PHYSIQUE (C_état)
 */
function getCoefficientEtat(diag: Diagnostics): number {
    // Priority: Critical (Screen/Biometrics)
    if (diag.screenState === "dead" || diag.screenState === "burned" || diag.screenState === "cracked") return 0.25; // Critique
    if (diag.biometricsState === "nok") return 0.25; // Critique

    // Physical state
    if (diag.aestheticState === "damaged") return 0.45; // Mauvais
    if (diag.aestheticState === "visible") return 0.70; // Moyen
    if (diag.cameraState === "degraded" || diag.cameraState === "nok") return 0.70; // Moyen (simplified)
    if (diag.batteryState === "low" || diag.batteryState === "replace") return 0.75; // Custom between Moyen/Bon

    if (diag.aestheticState === "very_good") return 0.95; // Excellent

    return 0.85; // Bon (Default)
}

/**
 * MAIN: VRT = PRT * (C_marque * C_age * C_etat * C_marche * C_securite)
 */
export function calculerEstimation(
    prt: number,
    brand: string,
    releaseYear: number | null,
    diag: Diagnostics
): number {
    if (!prt || prt <= 0) return 0;

    const b = brand.toLowerCase();
    const cMarque = COEFFICIENTS_MARQUE[b] || COEFFICIENTS_MARQUE["others"];
    const cAge = getCoefficientAge(releaseYear);
    const cEtat = getCoefficientEtat(diag);
    const cMarche = 0.90;
    const cSecurite = 0.85;

    const vrt = prt * (cMarque * cAge * cEtat * cMarche * cSecurite);

    return Math.round(vrt);
}

/**
 * SOULTE = PRT_cible - VRT_utilisateur
 */
export function getSwapGap(vrtUtilisateur: number, prtCible: number, classUtilisateur: string, classCible: string) {
    // Garde-fou 1: Downgrade Critique
    if (vrtUtilisateur > 1.4 * prtCible) {
        return {
            gap: 0,
            blocked: true,
            reason: "Échange bloqué : La valeur de votre téléphone est trop élevée par rapport au modèle ciblé (Downgrade critique)."
        };
    }

    // Garde-fou 2: Cohérence de Gamme
    if (classUtilisateur === 'F' && classCible === 'A') {
        return {
            gap: 0,
            blocked: true,
            reason: "Échange non autorisé entre un appareil d'entrée de gamme (Classe F) et un appareil premium (Classe A)."
        };
    }

    const theoreticalGap = prtCible - vrtUtilisateur;

    // Règle: Le downgrade mm est conditionnée à l'ajout d'une somme minimale
    const finalGap = theoreticalGap > 0
        ? theoreticalGap + (MINIMUM_TRADE_FEE)
        : MINIMUM_TRADE_FEE;

    return {
        gap: finalGap,
        blocked: false,
        formatted: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(finalGap)
    };
}
