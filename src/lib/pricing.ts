export interface Diagnostics {
    ecran_casse: boolean;
    batterie_faible: boolean;
    face_id_hs: boolean;
    camera_hs: boolean;
    etat_moyen: boolean;
}

export const MINIMUM_TRADE_FEE = 10000; // Frais de service TEKH+

/**
 * Calcule l'estimation de rachat selon les règles strictes :
 * 1. Prix Pivot = prixBase * 0.75
 * 2. Si écran cassé -> 30% du Pivot, arrêt.
 * 3. Sinon, application des malus cumulatifs.
 * 4. Plancher à 5000 FCFA.
 */
export function calculerEstimation(prixBase: number, diagnostics: Diagnostics): number {
    if (!prixBase || prixBase <= 0) return 0;

    // 1. Prix Pivot
    const prixPivot = Math.round(prixBase * 0.75);

    // 2. Priorité Écran
    if (diagnostics.ecran_casse) {
        const est = Math.round(prixPivot * 0.30);
        return Math.max(est, 5000);
    }

    let estimation = prixPivot;

    // 3. Malus cumulatifs
    // "Si diagnostics.batterie_faible : -20 000."
    if (diagnostics.batterie_faible) {
        estimation -= 20000;
    }

    // "Si diagnostics.face_id_hs : -40% du montant actuel."
    if (diagnostics.face_id_hs) {
        estimation = estimation * 0.60;
    }

    // "Si diagnostics.camera_hs : -20% du montant actuel."
    if (diagnostics.camera_hs) {
        estimation = estimation * 0.80;
    }

    // "Si diagnostics.etat_moyen : -15% du montant actuel."
    if (diagnostics.etat_moyen) {
        estimation = estimation * 0.85;
    }

    // 4. Sécurité (Plancher)
    // "Assure-toi que le prix final ne descend jamais en dessous de 5 000 FCFA"
    return Math.max(Math.round(estimation), 5000);
}

// Alias requested by prompt
export const calculerValeurRachat = calculerEstimation;

// Legacy / Utility functions

/**
 * @deprecated Use calculerEstimation instead
 */
export const calculateEstimate = (specs: any, basePrice: number) => {
    // Adapter for backward compatibility if needed during migration, 
    // strictly mapping old specs to new diagnostics
    const diagnostics: Diagnostics = {
        ecran_casse: specs.screenState && specs.screenState !== 'intact',
        batterie_faible: specs.batteryState === 'low' || specs.batteryState === 'replace',
        face_id_hs: specs.biometricsState === 'nok',
        camera_hs: specs.cameraState === 'nok' || specs.cameraState === 'degraded',
        etat_moyen: specs.aestheticState === 'visible' || specs.aestheticState === 'damaged'
    };
    return calculerEstimation(basePrice, diagnostics);
};

export function getSwapGap(userDeviceValue: number, targetDealPrice: number) {
    const theoreticalGap = targetDealPrice - userDeviceValue;

    // Si c'est un downgrade (gap < 0), on force quand même le frais minimal
    // Si c'est un upgrade, c'est le gap + le frais minimal (ou inclus dans la marge)
    // Selon le souhait du client : "le downgrade mm est conditionnee a lajout dune somme minimale"

    const finalGap = theoreticalGap > 0
        ? theoreticalGap + (MINIMUM_TRADE_FEE * 0.5) // Petit surplus sur upgrade pour la marge
        : MINIMUM_TRADE_FEE; // Pour les downgrades, on paye au moins le frais fixe

    return {
        gap: finalGap,
        isPositive: true, // Dans ce modèle B2C, l'utilisateur paye toujours quelque chose pour le service/garantie
        formatted: finalGap.toLocaleString() + " FCFA"
    };
}
