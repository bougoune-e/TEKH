import pandas as pd
import re
import os

# Helper to normalize model names for matching
def normalize_name(name):
    if not name: return ""
    # Remove "Motorola", "Moto", years in brackets, and extra spaces
    n = str(name).lower()
    n = n.replace("motorola", "").replace("moto", "")
    n = re.sub(r'\(.*?\)', '', n)
    n = re.sub(r'\W+', '', n)
    return n.strip()

# Helper to normalize storage
def normalize_storage(s):
    if not s: return ""
    s = str(s).lower().replace("go", "").replace("gb", "").replace("to", "tb").replace(" ", "")
    # Handle ranges like "64 / 128" - take the first one or we might need to handle all
    if "/" in s:
        return s.split("/")[0].strip()
    return s.strip()

# Load the catalogue we want to fill
catalogue_path = '/home/kizerbo/TEKH/motorola_tekh_ready.md'
# We need to parse the markdown table back to a dataframe
# Or just re-run the logic to get the dataframe since we have the script
# Let's re-run the core logic to get the DF

# Re-run extraction logic from reclassify_motorola.py
file_path_excel = '/home/kizerbo/TEKH/Motorola_Smartphones_Catalogue.xlsx'
xl = pd.ExcelFile(file_path_excel)
df_cat = xl.parse("Catalogue complet", skiprows=3) # Based on earlier view, header is around here
# Re-normalize col names for safety
df_cat.columns = ["Année", "Gamme", "Modèle", "RAM", "Stockage", "Réseau", "Extra"][:len(df_cat.columns)]
df_cat = df_cat[df_cat["Année"].apply(lambda x: str(x).isdigit() if pd.notnull(x) else False)]
df_cat["Année"] = df_cat["Année"].astype(int)

# Load reference files
ref_algo_path = '/home/kizerbo/TEKH/tableau de reference algorithmique - Sheet1 (2).csv'
ref_prix_path = '/home/kizerbo/TEKH/prix-a-remplir.csv'

prices_map = {} # (normalized_model, normalized_storage) -> price

# Parse ref_algo
# Format: Marques,Modèle Exact,Stockages (GB),Prix neuf en FCFA,...
try:
    df_algo = pd.read_csv(ref_algo_path, skiprows=5)
    for _, row in df_algo.iterrows():
        if "motorola" in str(row["Marques"]).lower():
            m = normalize_name(row["Modèle Exact"])
            s = normalize_storage(row["Stockages (GB)"])
            p = row["Prix neuf en FCFA"]
            if pd.notnull(p):
                prices_map[(m, s)] = int(float(str(p).replace(" ", "")))
except Exception as e:
    print(f"Error parsing ref_algo: {e}")

# Parse ref_prix
# Format: id,marque,modele,variante,annee_sortie,prt_fcfa,facteur_afrique
try:
    df_prix = pd.read_csv(ref_prix_path)
    for _, row in df_prix.iterrows():
        if "motorola" in str(row["marque"]).lower():
            m = normalize_name(row["modele"])
            s = normalize_storage(row["variante"])
            p = row["prt_fcfa"]
            if pd.notnull(p):
                prices_map[(m, s)] = int(float(str(p).replace(" ", "")))
except Exception as e:
    print(f"Error parsing ref_prix: {e}")

def get_price(row):
    m = normalize_name(row["Modèle"])
    s = normalize_storage(row["Stockage"])
    
    # Try exact match
    if (m, s) in prices_map:
        return prices_map[(m, s)]
    
    # Try model match without storage if storage is a range
    # Or try each part of the range
    if "/" in str(row["Stockage"]):
        parts = str(row["Stockage"]).split("/")
        for p in parts:
            if (m, normalize_storage(p)) in prices_map:
                return prices_map[(m, normalize_storage(p))]
                
    return ""

df_cat["PRT"] = df_cat.apply(get_price, axis=1)

# Assign Classes (Re-apply logic for consistency)
def assign_classe(row):
    gamme = str(row["Gamme"]).lower()
    year = int(row["Année"])
    if "razr" in gamme: return "A" if year >= 2023 else ("B" if year == 2022 else "C")
    if "edge" in gamme: return "A" if year >= 2024 else ("B" if year == 2023 else "C")
    if "thinkphone" in gamme: return "A"
    if "moto g" in gamme: return "B" if year >= 2024 else ("C" if year == 2023 else "D")
    if "moto e" in gamme: return "E" if year >= 2023 else "F"
    return "D" if year >= 2022 else "F"

df_cat["Classe"] = df_cat.apply(assign_classe, axis=1)

# Sort order
gamme_order = {"razr": 1, "edge": 2, "thinkphone": 3, "moto g": 4, "moto e": 5}
df_cat["GammeRank"] = df_cat["Gamme"].apply(lambda x: next((v for k, v in gamme_order.items() if k in str(x).lower()), 10))
df_cat = df_cat.sort_values(by=["GammeRank", "Année", "Modèle"], ascending=[True, False, True])

# Final columns
df_final = df_cat[["Année", "Gamme", "Modèle", "RAM", "Stockage", "Classe", "PRT"]]

# Split into tables by series for better display
output_md = "# Catalogue Motorola avec PRT (TEKH+)\n\n"
output_md += "Certains prix ont été récupérés depuis les fichiers de référence. Les champs vides sont à compléter.\n\n"

for g_name in ["Razr", "Edge", "ThinkPhone", "Moto G", "Moto E", "Autres"]:
    if g_name == "Autres":
        sub_df = df_final[~df_final["Gamme"].str.lower().str.contains("razr|edge|thinkphone|moto g|moto e", na=False)]
    else:
        sub_df = df_final[df_final["Gamme"].str.lower().str.contains(g_name.lower(), na=False)]
    
    if not sub_df.empty:
        output_md += f"## Gamme {g_name}\n\n"
        output_md += sub_df.to_markdown(index=False) + "\n\n"

with open('/home/kizerbo/TEKH/motorola_prt_filled.md', 'w') as f:
    f.write(output_md)

print("Succès : motorola_prt_filled.md généré.")
