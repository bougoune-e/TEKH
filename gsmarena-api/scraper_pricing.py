import os
import time
import re
import random
import requests
import pandas as pd
import statistics
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Configurations
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Erreur: SUPABASE_URL ou SUPABASE_KEY manquant dans le .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

CSV_FILE = "tab_cleaned.csv"
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
]

# Taux de conversion
EUR_TO_FCFA = 655.95
USD_TO_FCFA = 600.0
# Pour stocker en USD (base frontend 600) : Prix_USD = Price_FCFA / 600

CURRENT_YEAR = datetime.now().year

def get_supabase_models():
    """Récupère tous les modèles depuis Supabase pour le mapping id."""
    response = supabase.table("models").select("id, brand, name, release_year").execute()
    return response.data

def scrape_backmarket(brand, model, storage):
    """Scrape le prix le plus bas sur Back Market France pour l'état Correct (Stallone)."""
    query = f"{brand} {model} {storage} Go".replace(" ", "+")
    url = f"https://www.backmarket.fr/fr-fr/search?q={query}&grade=12"
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    }
    
    try:
        print(f"Scraping Back Market: {brand} {model} {storage}Go...")
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            # Classes demandées: .body-2-bold ou .e-price
            price_element = soup.select_one('[data-test="price"]')
            if not price_element:
                price_element = soup.select_one('[data-qa="product-card-price"]')
            if not price_element:
                price_element = soup.select_one('span.body-2-bold')
            if not price_element:
                price_element = soup.select_one('.e-price')
                
            if price_element:
                price_text = price_element.get_text()
                price_match = re.search(r"(\d+[\d\s,.]*)", price_text)
                if price_match:
                    p_val = price_match.group(1).replace(",", ".").replace(" ", "").replace("\xa0", "")
                    price_eur = float(p_val)
                    return price_eur
        elif response.status_code == 403:
            print(f"[!] Back Market bloque (403). Tentative de rotation...")
            time.sleep(2)
        
    except Exception as e:
        print(f"[-] Erreur Back Market: {str(e)}")
        
    return None

def get_lome_market_price(model_name):
    """Scrape les prix sur CoinAfrique Togo et retourne la médiane des 5 premiers."""
    query = model_name.replace(" ", "+")
    url = f"https://tg.coinafrique.com/search?category=22&keyword={query}"
    
    headers = {
        "User-Agent": random.choice(USER_AGENTS)
    }
    
    try:
        print(f"Scraping CoinAfrique: {model_name}...")
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            # Sur CoinAfrique, les prix sont dans p.ad__card-price
            price_elements = soup.select('p.ad__card-price')
            if not price_elements:
                price_elements = soup.select('.ad-card-price')
            prices_fcfa = []
            
            for el in price_elements[:5]: # Top 5
                price_text = el.get_text()
                price_match = re.search(r"(\d+[\d\s.]*)", price_text)
                if price_match:
                    p_val = price_match.group(1).replace(" ", "").replace(".", "")
                    try:
                        prices_fcfa.append(float(p_val))
                    except:
                        continue
            
            # Fallback: search for numbers followed by CFA in text
            if not prices_fcfa:
                text = soup.get_text()
                # Pattern for prices like 100 000 CFA or 100.000 CFA
                pattern = r"(\d+[\d\s.]*)\s*CFA"
                matches = re.finditer(pattern, text)
                for match in matches:
                    val_str = match.group(1).replace(" ", "").replace(".", "")
                    try:
                        val = float(val_str)
                        if val > 1000: # Filter out too small prices
                            prices_fcfa.append(val)
                    except:
                        continue
            
            if prices_fcfa:
                median_price_fcfa = statistics.median(prices_fcfa[:5])
                return median_price_fcfa / USD_TO_FCFA
                
    except Exception as e:
        print(f"[-] Erreur CoinAfrique: {str(e)}")
        
    return None

def update_pricing():
    print("Démarrage de la mise à jour des prix (SOURCE UNIQUE: SCRAPING)...")
    models = get_supabase_models()
    model_map = {m['name'].lower(): m for m in models}
    df = pd.read_csv(CSV_FILE)
    
    processed_count = 0
    variants_to_process = df.drop_duplicates(subset=['marques', 'modele_exact', 'stockages_gb'])
    
    for _, row in variants_to_process.head(3).iterrows():
        brand = row['marques']
        model_name = row['modele_exact']
        storage = row['stockages_gb']
        ram = row.get('ram_gb', 0)
        
        possible_names = [f"{brand} {model_name}".lower(), model_name.lower()]
        target_model = None
        for name in possible_names:
            if name in model_map:
                target_model = model_map[name]
                break
        
        if not target_model:
            continue
            
        # 1. Back Market
        price_bm_eur = scrape_backmarket(brand, model_name, storage)
        price_bm_usd = (price_bm_eur * EUR_TO_FCFA / USD_TO_FCFA) if price_bm_eur else None
        
        # 2. CoinAfrique
        price_ca_usd = get_lome_market_price(f"{brand} {model_name}")
        
        if price_bm_usd is None and price_ca_usd is None:
            print(f"[SKIP] Impossible de trouver un prix pour {brand} {model_name}")
            continue
            
        # Case 1: Both found
        if price_bm_usd and price_ca_usd:
            final_price_usd = max(price_bm_usd * 1.25, price_ca_usd)
            source = "BM+CA"
        # Case 2: Only Back Market
        elif price_bm_usd:
            final_price_usd = price_bm_usd * 1.25
            source = "BackMarket*1.25"
        # Case 3: Only CoinAfrique
        elif price_ca_usd:
            final_price_usd = price_ca_usd
            source = "CoinAfrique"
        # Case 4: None found - we DON'T update or use a very safe fallback if absolutely needed
        # But user said ONLY scraped prices. So we skip if no scrape.
        else:
            print(f"[SKIP] Aucun prix trouvé ({brand} {model_name})")
            continue
            
        variant_data = {
            "model_id": target_model['id'],
            "storage_gb": int(storage),
            "ram_gb": int(ram) if not pd.isna(ram) else 0,
            "base_market_price_usd": round(final_price_usd, 2)
        }
        
        print(f"[OK] {brand} {model_name} ({storage}Go) -> ${variant_data['base_market_price_usd']} via {source}")
        
        # Upsert dans Supabase
        existing = supabase.table("variants")\
            .select("id")\
            .eq("model_id", target_model['id'])\
            .eq("storage_gb", int(storage))\
            .execute()
            
        if existing.data:
            supabase.table("variants").update(variant_data).eq("id", existing.data[0]['id']).execute()
        else:
            supabase.table("variants").insert(variant_data).execute()
            
        processed_count += 1
        time.sleep(1.5) # Un peu plus de délai pour éviter les blocks
        
    print(f"\nMise à jour terminée. {processed_count} variantes traitées.")

if __name__ == "__main__":
    update_pricing()
