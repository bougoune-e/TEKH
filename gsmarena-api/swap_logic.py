import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# CHARTE OFFICIELLE DE PRICING TEKH+ (v2.1)

COEFF_MARQUE = {
    "apple": 0.90,
    # Samsung is handled with model split in get_brand_coeff()
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
    "oukitel": 0.52
}

COEFF_AGE = {
    "0-1": 0.95,
    "1-2": 0.85,
    "2-3": 0.75,
    "3-4": 0.62,
    "4+": 0.40
}

COEFF_ETAT = {
    "Excellent": 0.95,
    "Bon": 0.85,
    "Moyen": 0.70,
    "Correct": 0.70,
    "Mauvais": 0.45,
    "Critique": 0.22
}

COEFF_MARCHE = 0.90
COEFF_SECURITE = 0.85
VRT_FLOOR_RATIO = 0.05

COEFF_BATTERIE = {
    "good": 0.92,      # 80-89%
    "low": 0.80,       # 70-79%
    "replace": 0.68,   # 60-69%
}

CLASS_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5}

def get_variant_details(variant_id):
    """Récupère les détails d'une variante et de son modèle."""
    response = supabase.table("variants")\
        .select("base_market_price_usd, model_id, models(name, brand, equivalence_class, release_year)")\
        .eq("id", variant_id)\
        .single()\
        .execute()
    return response.data

def get_brand_coeff(brand, model_name=None):
    b = (brand or "").lower().strip()
    m = (model_name or "").lower().strip()

    if b == "samsung":
        # v2.1 split Samsung: S/Z premium vs A5x/A7x mid-premium
        if re.search(r'\\b(s|z)\\d+', m) or re.search(r'\\bgalaxy\\s*(s|z)', m):
            return 0.90
        if re.search(r'\\ba(5|7)\\d+\\b', m) or re.search(r'\\bgalaxy\\s*a(5|7)\\d+', m):
            return 0.84
        return 0.84

    return COEFF_MARQUE.get(b, 0.55)

def calculer_vrt(prt_usd, brand, model_name, release_year, etat, battery_state="low", usd_to_fcfa=600):
    """Calcule la Valeur de Reprise Tehk+ (VRT)."""
    prt_fcfa = prt_usd * usd_to_fcfa
    
    # C_marque
    c_marque = get_brand_coeff(brand, model_name)
    
    # C_age
    import datetime
    current_year = datetime.datetime.now().year
    years_since = current_year - release_year
    if years_since < 1: c_age = COEFF_AGE["0-1"]
    elif years_since <= 2: c_age = COEFF_AGE["1-2"]
    elif years_since <= 3: c_age = COEFF_AGE["2-3"]
    elif years_since <= 4: c_age = COEFF_AGE["3-4"]
    else: c_age = COEFF_AGE["4+"]
    
    # C_etat
    c_etat = COEFF_ETAT.get(etat, 0.70)
    c_batterie = COEFF_BATTERIE.get((battery_state or "").lower(), 0.80)
    
    # Calcul final
    vrt = prt_fcfa * c_marque * c_age * c_etat * c_batterie * COEFF_MARCHE * COEFF_SECURITE
    if vrt < (prt_fcfa * VRT_FLOOR_RATIO):
        return 0
    return round(vrt)

def calculer_soulte_v1(id_variant_client, id_variant_cible, etat_client, battery_state="low"):
    """
    Nouveau moteur de pricing v1.0.
    Soulte = PRT_cible - VRT_client
    """
    client_data = get_variant_details(id_variant_client)
    cible_data = get_variant_details(id_variant_cible)
    
    if not client_data or not cible_data:
        return {"error": "L'un des modèles n'est pas présent dans la base de données."}
        
    prt_client_usd = client_data['base_market_price_usd']
    brand_client = client_data['models']['brand']
    year_client = client_data['models']['release_year']
    model_client = client_data['models'].get('name')
    class_client = client_data['models'].get('equivalence_class', 'C')
    
    prt_cible_usd = cible_data['base_market_price_usd']
    prt_cible_fcfa = prt_cible_usd * 600
    class_cible = cible_data['models'].get('equivalence_class', 'C')
    
    # Calcul VRT
    vrt_fcfa = calculer_vrt(prt_client_usd, brand_client, model_client, year_client, etat_client, battery_state)
    if vrt_fcfa <= 0:
        return {"error": "Reprise refusée : VRT inférieure au plancher minimal (5% du PRT).", "blocked": True}
    
    # Vérification CLASSE F (blocage absolu)
    if class_client == 'F':
        return {"error": "Échange bloqué : aucun échange autorisé pour un appareil de classe F.", "blocked": True}

    # Vérification COHÉRENCE (écart de classe > 2 niveaux)
    if class_client in CLASS_ORDER and class_cible in CLASS_ORDER:
        if abs(CLASS_ORDER[class_client] - CLASS_ORDER[class_cible]) > 2:
            return {"error": "Échange bloqué : l'écart de classe dépasse 2 niveaux.", "blocked": True}
        
    # Vérification DOWNGRADE (VRT > 1.4 * PRT_cible)
    if vrt_fcfa > (1.4 * prt_cible_fcfa):
        return {"error": "Échange bloqué : Valeur de reprise trop élevée par rapport à la cible (Trésorerie).", "blocked": True}
        
    soulte_fcfa = prt_cible_fcfa - vrt_fcfa
    
    return {
        "prt_target_fcfa": prt_cible_fcfa,
        "vrt_client_fcfa": vrt_fcfa,
        "total_soulte_fcfa": soulte_fcfa,
        "total_soulte_usd": round(soulte_fcfa / 600, 2),
        "status": "OK"
    }

if __name__ == "__main__":
    print("Moteur de Pricing TEKH+ v2.1 prêt.")
