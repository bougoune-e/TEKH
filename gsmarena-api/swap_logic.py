import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# CHARTE OFFICIELLE DE PRICING TEHK+ (v1.0)

COEFF_MARQUE = {
    "apple": 0.90,
    "samsung": 0.85,
    "huawei": 0.80,
    "honor": 0.78,
    "motorola": 0.75,
    "tecno": 0.70,
    "infinix": 0.68,
    "itel": 0.60
}

COEFF_AGE = {
    "0-1": 0.95,
    "1-2": 0.85,
    "2-3": 0.75,
    "3-4": 0.65,
    "4+": 0.50
}

COEFF_ETAT = {
    "Excellent": 0.95,
    "Bon": 0.85,
    "Moyen": 0.70,
    "Mauvais": 0.45,
    "Critique": 0.25
}

COEFF_MARCHE = 0.90
COEFF_SECURITE = 0.85

def get_variant_details(variant_id):
    """Récupère les détails d'une variante et de son modèle."""
    response = supabase.table("variants")\
        .select("base_market_price_usd, model_id, models(brand, equivalence_class, release_year)")\
        .eq("id", variant_id)\
        .single()\
        .execute()
    return response.data

def calculer_vrt(prt_usd, brand, release_year, etat, usd_to_fcfa=600):
    """Calcule la Valeur de Reprise Tehk+ (VRT)."""
    prt_fcfa = prt_usd * usd_to_fcfa
    
    # C_marque
    c_marque = COEFF_MARQUE.get(brand.lower(), 0.65)
    
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
    
    # Calcul final
    vrt = prt_fcfa * c_marque * c_age * c_etat * COEFF_MARCHE * COEFF_SECURITE
    return round(vrt)

def calculer_soulte_v1(id_variant_client, id_variant_cible, etat_client):
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
    class_client = client_data['models'].get('equivalence_class', 'C')
    
    prt_cible_usd = cible_data['base_market_price_usd']
    prt_cible_fcfa = prt_cible_usd * 600
    class_cible = cible_data['models'].get('equivalence_class', 'C')
    
    # Calcul VRT
    vrt_fcfa = calculer_vrt(prt_client_usd, brand_client, year_client, etat_client)
    
    # Vérification COHÉRENCE (Classe F -> A)
    if class_client == 'F' and class_cible == 'A':
        return {"error": "Échange bloqué : Impossible de passer directement de la Classe F à la Classe A.", "blocked": True}
        
    # Vérification DOWNGRADE (VRT > 1.4 * PRT_cible)
    if vrt_fcfa > (1.4 * prt_cible_fcfa):
        return {"error": "Échange bloqué : Valeur de reprise trop élevée par rapport à la cible (Trésorerie).", "blocked": True}
        
    soulte_fcfa = max(0, prt_cible_fcfa - vrt_fcfa)
    
    return {
        "prt_target_fcfa": prt_cible_fcfa,
        "vrt_client_fcfa": vrt_fcfa,
        "total_soulte_fcfa": soulte_fcfa,
        "total_soulte_usd": round(soulte_fcfa / 600, 2),
        "status": "OK"
    }

if __name__ == "__main__":
    print("Moteur de Pricing TEHK+ v1.0 prêt.")
