import pandas as pd
import re

# Expert Pricing Rules (Juste Milieu)
INCREMENTS = {
    "64to128": 7500,
    "128to256": 12500,
    "256to512": 30000,
    "512to1T": 60000
}

def get_storage_val(s):
    s = str(s).lower().replace("go", "").replace("gb", "").replace("to", "tb").replace(" ", "")
    if s == "1tb" or s == "1t": return 1024
    if s == "512": return 512
    if s == "256": return 256
    if s == "128": return 128
    if s == "64": return 64
    if s == "32": return 32
    if s == "16": return 16
    if s == "8": return 8
    if s == "4": return 4
    return 0

def calculate_prt(base_price, base_storage, target_storage):
    if not base_price or base_price == "": return None
    b_val = get_storage_val(base_storage)
    t_val = get_storage_val(target_storage)
    if b_val == t_val: return int(base_price)
    price = int(base_price)
    if t_val > b_val:
        if b_val <= 64 and t_val >= 128: price += INCREMENTS["64to128"]; b_val = 128
        if b_val <= 128 and t_val >= 256: price += INCREMENTS["128to256"]; b_val = 256
        if b_val <= 256 and t_val >= 512: price += INCREMENTS["256to512"]; b_val = 512
        if b_val <= 512 and t_val >= 1024: price += INCREMENTS["512to1T"]; b_val = 1024
    else:
        if b_val >= 1024 and t_val <= 512: price -= INCREMENTS["512to1T"]; b_val = 512
        if b_val >= 512 and t_val <= 256: price -= INCREMENTS["256to512"]; b_val = 256
        if b_val >= 256 and t_val <= 128: price -= INCREMENTS["128to256"]; b_val = 128
        if b_val >= 128 and t_val <= 64: price -= INCREMENTS["64to128"]; b_val = 64
    return max(0, price)

def get_classe_tekh(gamme, model, year):
    gamme = str(gamme).lower()
    model = str(model).lower()
    if "razr" in gamme or "razr" in model: return "A"
    if "thinkphone" in gamme or "thinkphone" in model: return "A"
    if "edge" in gamme or "edge" in model:
        if year >= 2023: return "A"
        if year >= 2021: return "B"
        return "C"
    if "moto g" in gamme or "moto g" in model:
        if year >= 2025: return "B"
        if year >= 2024: return "B"
        if year >= 2023: return "C"
        if year >= 2021: return "D"
        return "E"
    if "moto e" in gamme or "moto e" in model:
        if year >= 2022: return "E"
        return "F"
    return "F"

baseline = {
    # All batches consolidated 1-9
    "Razr 60 (Razr 2025)": (215000, "256"), "Razr 60 Ultra (Razr+ 2025)": (240000, "512"),
    "Razr 5G (2020/2021)": (155000, "256"), "Motorola Razr (2020)": (120000, "256"),
    "Edge 60": (165000, "256"), "Edge 60 Neo": (135000, "128"), "Edge 60 Pro": (220000, "256"),
    "Edge 60 Stylus": (155000, "256"), "Edge 70": (230000, "256"), "Edge 50": (162000, "256"),
    "Edge S / Moto G100": (102000, "128"), "ThinkPhone 25": (250000, "256"),
    "Moto G 5G (2026)": (107000, "128"), "Moto G Play (2026)": (77000, "64"), "Moto G Power (2026)": (125000, "128"),
    "Moto G (2025)": (95000, "64"), "Moto G Power (2025)": (125000, "128"), "Moto G Stylus 5G (2025)": (145000, "128"),
    "Moto G06": (85000, "128"), "Moto G06 Power": (95000, "128"), "Moto G96": (160000, "128"),
    "Moto G (2024)": (80000, "128"), "Moto G Play (2024)": (70000, "64"), "Moto G Power (2024)": (110000, "128"),
    "Moto G Stylus 5G (2024)": (130000, "128"), "Moto G04": (65000, "64"), "Moto G04s": (70000, "64"),
    "Moto G05": (75000, "64"), "Moto G15": (85000, "128"), "Moto G15 Power": (105000, "128"),
    "Moto G24": (85000, "128"), "Moto G24 Power": (95000, "128"), "Moto G35": (110000, "128"),
    "Moto G45": (125000, "128"), "Moto G55": (140000, "128"), "Moto G64": (150000, "128"),
    "Moto G75": (175000, "128"), "Moto G (2023)": (75000, "64"), "Moto G Play (2023)": (55000, "32"),
    "Moto G Power 5G (2023)": (90000, "128"), "Moto G Stylus 5G (2023)": (115000, "128"),
    "Moto G34": (80000, "128"), "Moto G53": (95000, "128"), "Moto G73": (120000, "256"), "Moto G (2022)": (60000, "64"),
    "Moto G Play (2022)": (55000, "32"), "Moto G Power (2022)": (65000, "64"), "Moto G Stylus (2022)": (75000, "128"),
    "Moto G Stylus 5G (2022)": (85000, "128"), "Moto G22": (55000, "64"), "Moto G42": (65000, "64"),
    "Moto G52": (75000, "128"), "Moto G62 5G": (80000, "64"), "Moto G71s": (95000, "128"),
    "Moto G72": (90000, "128"), "Moto G82 5G": (100000, "128"), "Moto G Play (2021)": (35000, "32"),
    "Moto G Power (2021)": (50000, "64"), "Moto G Stylus (2021)": (55000, "128"), "Moto G Stylus 5G (2021)": (65000, "128"),
    "Moto E14": (45000, "64"), "Moto E15": (55000, "64"), "Moto S50": (195000, "256"), "Moto X50 Ultra": (380000, "512"),
    "Moto E22": (40000, "64"), "Moto E32": (45000, "64"), "Moto E32s": (50000, "64"), "Moto G20": (45000, "64"),
    "Moto G30": (50000, "64"), "Moto G31": (55000, "64"), "Moto G40 Fusion": (75000, "128"), "Moto G50": (55000, "64"),
    "Moto G60": (80000, "128"), "Moto G60s": (75000, "128"), "Moto G71 5G": (85000, "128"), "Moto E30": (35000, "32"),
    "Moto G Fast": (35000, "32"), "Moto G Pro": (60000, "128"), "Moto G Power (2020)": (45000, "64"),
    "Moto G Play (2020)": (30000, "32"), "Moto G Stylus (2020)": (55000, "128"), "Moto G8 Plus": (45000, "64"),
    "Moto G8 Power": (45000, "64"), "Moto G9 Play": (45000, "64"), "Moto G9 Plus": (60000, "128"),
    "Moto G9 Power": (55000, "128"), "Moto One 5G Ace": (55000, "64"), "Moto E7": (30000, "32"),
    "Moto E7 Plus": (40000, "64"), "Moto E6s": (35000, "64"), "Moto E6i": (25000, "32"), "Moto G7 Plus": (35000, "64"),
    "Moto G7 Power": (35000, "64"), "Moto G7 Play": (25000, "32"), "Moto G8 (indien)": (35000, "64"),
    "Moto E40": (45000, "64"), "Moto Z4": (45000, "64"), "Moto One Action": (45000, "128"),
    "Moto One Vision": (50000, "128"), "Moto One Zoom": (60000, "128"), "Moto One Power": (40000, "64"),
    "Moto One Macro": (35000, "64"), "Moto One Hyper": (55000, "128"), "Moto E6 Plus": (25000, "32"),
    "Moto E6 Play": (25000, "32"), "Moto E5 Play Go": (15000, "16"), "Moto G6 Plus": (30000, "64"), "Moto G6 Play": (20000, "16"),
    "Moto G7 (1ère gén.)": (30000, "64"), "Moto Z3": (35000, "64"), "Moto Z3 Play": (30000, "64"),
    "Moto E5 Plus": (25000, "32"), "Moto X4": (30000, "64"), "Moto G5 Plus": (20000, "32"),
    "Moto G5s": (20000, "32"), "Moto G5s Plus": (20000, "32"), "Moto Z2 Force": (30000, "64"),
    "Moto Z2 Play": (25000, "64"), "Moto E4 Plus": (15000, "16"), "Moto C Plus": (15000, "16"), "Moto G4 Plus": (15000, "32")
}

ref_prices = {
    "Razr 50 (Razr 2024)": (217879, "256"), "Razr 50 Ultra (Razr+ 2024)": (226305, "256"),
    "Razr 40 (Razr 2023)": (66000, "256"), "Razr 40 Ultra (Razr+ 2023)": (92000, "256"),
    "Edge (2025)": (68000, "256"), "Edge 60 Fusion": (86000, "256"), "Edge (2024)": (68000, "256"),
    "Edge 50 Fusion": (56000, "128"), "Edge 50 Neo": (64000, "256"), "Edge 50 Pro": (167269, "256"),
    "Edge 50 Ultra": (231405, "256"), "Edge (2023)": (68000, "256"), "Edge 40": (72000, "256"),
    "Edge 40 Neo": (60000, "256"), "Edge 40 Pro (Edge+ 2023 US)": (84000, "256"),
    "Edge (2022)": (60000, "128"), "Edge 30": (48000, "128"), "Edge 30 Fusion": (56000, "128"),
    "Edge 30 Neo": (52000, "128"), "Edge 30 Pro": (80000, "128"), "Edge 30 Ultra": (64000, "128"),
    "Edge+ (2022)": (60000, "128"), "Edge (2021)": (60000, "128"), "Edge 20": (36000, "128"),
    "Edge 20 Fusion": (32000, "128"), "Edge 20 Lite": (52000, "128"), "Edge 20 Pro": (56000, "128"),
    "Edge (2020)": (60000, "128"), "Edge+ (2020)": (68000, "256"), "ThinkPhone (2023)": (220983, "128"),
    "Moto G85": (125332, "256"), "Moto G14": (32000, "128"), "Moto G23": (32000, "64"),
    "Moto G54": (133520, "128"), "Moto G84": (113809, "256"), "Moto G13": (30000, "128"),
    "Moto G32": (34000, "64"), "Moto E13": (14000, "64"), "Moto E20": (16000, "32")
}

final_baseline = {**ref_prices, **baseline}

xl = pd.ExcelFile('/home/kizerbo/TEKH/Motorola_Smartphones_Catalogue.xlsx')
df_cat = xl.parse("Catalogue complet", skiprows=3)
df_cat.columns = ["Année", "Gamme", "Modèle", "RAM", "Stockage", "Réseau", "Extra"][:len(df_cat.columns)]
df_cat = df_cat[df_cat["Année"].apply(lambda x: str(x).isdigit() if pd.notnull(x) else False)]
df_cat["Année"] = df_cat["Année"].astype(int)

sql_statements = [
    "-- Motorola Catalogue Import",
    "-- Database: Supabase - Table: smartphones",
    "BEGIN;",
    "DELETE FROM smartphones WHERE marque = 'Motorola'; -- Nettoyage pour éviter les doublons"
]

for _, row in df_cat.iterrows():
    year = row["Année"]
    gamme = str(row["Gamme"]).strip()
    model = str(row["Modèle"]).strip()
    ram = str(row["RAM"]).strip()
    storage_orig = str(row["Stockage"]).strip()
    reseau = str(row["Réseau"]).strip()
    
    variants = [v.strip() for v in storage_orig.replace("Go", "").replace("GB", "").replace("To", "TB").split("/")]
    
    match = None
    for b_model in final_baseline:
        if b_model.lower() == model.lower(): match = final_baseline[b_model]; break
    if not match:
        for b_model in final_baseline:
            if b_model.lower() in model.lower() or model.lower() in b_model.lower(): match = final_baseline[b_model]; break
            
    if not match: continue

    classe = get_classe_tekh(gamme, model, year)
    
    for v in variants:
        if not v: continue
        prt = calculate_prt(match[0], match[1], v)
        if prt is None or prt == 0: continue
        
        # Professional formatting: variante column = Storage ONLY (matching app query format)
        storage_disp = v if "TB" in v.upper() else v + "GB"
        
        # Extract technical specs for JSONB column
        try:
            ram_num = int(re.search(r'(\d+)', ram).group(1)) if ram else None
        except:
            ram_num = None
            
        try:
            storage_num = get_storage_val(v)
        except:
            storage_num = None
            
        is_5g = "5G" in reseau.upper()
        
        import json
        specs = {
            "ram_gb": ram_num,
            "stockage_gb": storage_num,
            "5g": is_5g,
            "reseau": reseau if reseau else ("5G" if is_5g else "4G")
        }
        specs_json = json.dumps(specs).replace("'", "''")
        
        # SQL Injection protection (simple escapes)
        model_esc = model.replace("'", "''")
        var_esc = storage_disp.replace("'", "''")
        
        sql = f"INSERT INTO smartphones (marque, modele, variante, annee_sortie, classe_tekh, specs, prt_fcfa, facteur_afrique) " \
              f"VALUES ('Motorola', '{model_esc}', '{var_esc}', {year}, '{classe}', '{specs_json}', {prt}, 1.0) " \
              f"ON CONFLICT (marque, modele, variante) DO UPDATE SET prt_fcfa = EXCLUDED.prt_fcfa, classe_tekh = EXCLUDED.classe_tekh, specs = EXCLUDED.specs;"
        sql_statements.append(sql)

sql_statements.append("COMMIT;")

with open('/home/kizerbo/TEKH/import_motorola.sql', 'w') as f:
    f.write("\n".join(sql_statements))

print(f"Succès : import_motorola.sql généré avec {len(sql_statements)-3} insertions.")
