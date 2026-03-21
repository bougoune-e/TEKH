"""
Moteur de pricing TEKH+ — aligné sur src/core/api/pricing.ts (charte métier).
VRT = PRT × C_marque × C_age × C_etat_écran × C_batterie × C_marche × C_securite × C_châssis (+ bonus optionnel).
"""
import os
import re
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

COEFF_MARQUE = {
    "apple": 0.90,
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
}

COEFF_MARCHE = 0.90
COEFF_SECURITE = 0.85
VRT_FLOOR_RATIO = 0.05
DOWNGRADE_ABSORPTION_CAP_FCFA = 15_000

# Écran (Dealbox) — 3 états
COEFF_ECRAN = {"parfait": 0.95, "raye": 0.75, "casse": 0.22}

COEFF_BATTERIE = {
    "gte90": 1.00,
    "gte80_89": 0.92,
    "gte70_79": 0.80,
    "gte60_69": 0.68,
    "lt60": 0.50,
    "unknown": 0.50,
    # legacy
    "good": 0.92,
    "low": 0.80,
    "replace": 0.68,
}

CLASS_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5}


def get_brand_coeff(brand, model_name=None):
    b = (brand or "").lower().strip()
    m = (model_name or "").lower().strip()

    if b == "samsung":
        if re.search(r"\b(s|z)\d+", m) or re.search(r"\bgalaxy\s*(s|z)", m):
            return 0.90
        if re.search(r"\ba(5|7)\d+\b", m) or re.search(r"\bgalaxy\s*a(5|7)\d+", m):
            return 0.84
        return 0.84

    return COEFF_MARQUE.get(b, 0.55)


def get_coeff_age(release_year: int) -> float:
    import datetime

    age = datetime.datetime.now().year - release_year
    if age < 1:
        return 0.95
    if age < 2:
        return 0.85
    if age < 3:
        return 0.75
    if age < 4:
        return 0.62
    return 0.40


def get_variant_details(variant_id):
    """Récupère les détails d'une variante et de son modèle."""
    response = (
        supabase.table("variants")
        .select("base_market_price_usd, model_id, models(name, brand, equivalence_class, release_year)")
        .eq("id", variant_id)
        .single()
        .execute()
    )
    return response.data


def calculer_vrt(
    prt_usd,
    brand,
    model_name,
    release_year,
    ecran="parfait",
    chassis="intact",
    batterie="gte80_89",
    usd_to_fcfa=600,
):
    """
    ecran: parfait | raye | casse
    chassis: intact | abime
    batterie: gte90 | gte80_89 | ...
    """
    prt_fcfa = prt_usd * usd_to_fcfa

    c_marque = get_brand_coeff(brand, model_name)
    c_age = get_coeff_age(release_year)
    c_etat = COEFF_ECRAN.get((ecran or "parfait").lower(), 0.95)
    c_bat = COEFF_BATTERIE.get((batterie or "unknown").lower(), 0.50)

    vrt = prt_fcfa * c_marque * c_age * c_etat * c_bat * COEFF_MARCHE * COEFF_SECURITE
    if (chassis or "").lower() == "abime":
        vrt *= 0.85

    if vrt < (prt_fcfa * VRT_FLOOR_RATIO):
        return 0
    return round(vrt)


def soulte_downgrade_policy(vrt_client_fcfa: float, prt_cible_fcfa: float) -> dict:
    """Politique soulte négative & TekhPoints (pas de cash)."""
    excess = vrt_client_fcfa - prt_cible_fcfa
    if excess <= 0:
        return {"tekh_points": 0, "absorbed": False}
    if excess <= DOWNGRADE_ABSORPTION_CAP_FCFA:
        return {"tekh_points": 0, "absorbed": True}
    return {"tekh_points": round(excess), "absorbed": False}


def calculer_soulte_v1(
    id_variant_client,
    id_variant_cible,
    ecran_client="parfait",
    chassis_client="intact",
    batterie_client="gte80_89",
):
    """
    Soulte = PRT_cible - VRT_client.
    Blocages : VRT=0, classe F, écart de classe > 2.
    """
    client_data = get_variant_details(id_variant_client)
    cible_data = get_variant_details(id_variant_cible)

    if not client_data or not cible_data:
        return {"error": "L'un des modèles n'est pas présent dans la base de données."}

    prt_client_usd = client_data["base_market_price_usd"]
    brand_client = client_data["models"]["brand"]
    year_client = client_data["models"]["release_year"]
    model_client = client_data["models"].get("name")
    class_client = client_data["models"].get("equivalence_class", "C")

    prt_cible_usd = cible_data["base_market_price_usd"]
    prt_cible_fcfa = prt_cible_usd * 600
    class_cible = cible_data["models"].get("equivalence_class", "C")

    vrt_fcfa = calculer_vrt(
        prt_client_usd,
        brand_client,
        model_client,
        year_client,
        ecran_client,
        chassis_client,
        batterie_client,
    )
    if vrt_fcfa <= 0:
        return {
            "error": "Reprise refusée : VRT inférieure au plancher minimal (5% du PRT).",
            "blocked": True,
        }

    if class_client == "F":
        return {
            "error": "Échange bloqué : aucun échange autorisé pour un appareil de classe F.",
            "blocked": True,
        }

    if class_client in CLASS_ORDER and class_cible in CLASS_ORDER:
        if abs(CLASS_ORDER[class_client] - CLASS_ORDER[class_cible]) > 2:
            return {
                "error": "Échange bloqué : l'écart de classe dépasse 2 niveaux.",
                "blocked": True,
            }

    soulte_fcfa = prt_cible_fcfa - vrt_fcfa
    pol = soulte_downgrade_policy(vrt_fcfa, prt_cible_fcfa)

    return {
        "prt_target_fcfa": prt_cible_fcfa,
        "vrt_client_fcfa": vrt_fcfa,
        "total_soulte_fcfa": soulte_fcfa,
        "total_soulte_usd": round(soulte_fcfa / 600, 2),
        "tekh_points_if_downgrade": pol["tekh_points"],
        "downgrade_absorbed": pol["absorbed"],
        "status": "OK",
    }


if __name__ == "__main__":
    print("Moteur de Pricing TEKH+ (charte métier) prêt.")
