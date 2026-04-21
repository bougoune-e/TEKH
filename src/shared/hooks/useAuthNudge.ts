/**
 * useAuthNudge — Nudge progressif vers la connexion.
 *
 * Gère un cooldown de 72h entre deux nudges pour ne jamais être intrusif.
 * Expose `triggerNudge(context)` à utiliser dans n'importe quel composant
 * quand une action protégée est tentée par un utilisateur non connecté.
 */
import { useCallback } from "react";
import { useAuthSheet } from "@/features/auth/AuthSheet";

const STORAGE_KEY = "tekh:nudge_last_shown";
const IS_DEV = import.meta.env.DEV;
const COOLDOWN_MS = IS_DEV ? 5000 : 72 * 60 * 60 * 1000; // 5s en dev, 72h en prod

export type NudgeContext =
    | "save_estimation"  // Résultat estimateur — sauvegarder
    | "contact_seller"   // Marketplace — voir les coordonnées
    | "add_to_cart"      // Panier
    | "view_history"     // Historique & TekhPoints
    | "timed_browse";    // Après X minutes de navigation

const NUDGE_MESSAGES: Record<NudgeContext, string> = {
    save_estimation:
        "💡 Sauvegarde ton estimation et retrouve-la à tout moment depuis ton profil.",
    contact_seller:
        "🔒 Crée un compte gratuit pour voir les coordonnées du vendeur et contacter directement.",
    add_to_cart:
        "🛒 Connecte-toi pour finaliser ta sélection et accéder à ton historique d'achats.",
    view_history:
        "📋 Retrouve ton historique d'évaluations et tes TekhPoints en te connectant.",
    timed_browse:
        "👋 Rejoins la communauté TEKH+ pour débloquer toutes les fonctionnalités gratuitement.",
};

function getLastShown(): number {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? Number(raw) : 0;
    } catch {
        return 0;
    }
}

function setLastShown() {
    try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch { }
}

export function useAuthNudge() {
    const { showAuth } = useAuthSheet();

    const triggerNudge = useCallback(
        (context: NudgeContext, force = false) => {
            const elapsed = Date.now() - getLastShown();
            // On bypass le cooldown si `force` est true (action explicite utilisateur)
            if (!force && elapsed < COOLDOWN_MS) {
                console.log(`[AuthNudge] Cooldown actif (${Math.round((COOLDOWN_MS - elapsed) / 1000)}s restants).`);
                return;
            }

            console.log(`[AuthNudge] Affichage du nudge: ${context}`);
            setLastShown();
            showAuth(NUDGE_MESSAGES[context]);
        },
        [showAuth]
    );

    return { triggerNudge };
}
