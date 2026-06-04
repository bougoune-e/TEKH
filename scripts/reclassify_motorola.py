import pandas as pd
import re

# Load the Excel file
file_path = '/home/kizerbo/TEKH/Motorola_Smartphones_Catalogue.xlsx'
xl = pd.ExcelFile(file_path)

# Extraction (we focus on the complete catalogue but we need to normalize it)
df = xl.parse("Catalogue complet")

# The catalogue has header rows like "── 2026 ──", we need to clean it
# The actual data starts after the first few rows or we can filter rows where "Année" is present
# Let's find the header row
header_row_idx = 0
for i, row in df.iterrows():
    if "Année" in str(row.iloc[0]):
        header_row_idx = i
        break

# Re-read with correct header
df = xl.parse("Catalogue complet", skiprows=header_row_idx + 1)
# Set columns based on the original Excel structure
# Year, Gamme, Modèle, RAM (Go), Stockage interne, Réseau
df.columns = ["Année", "Gamme", "Modèle", "RAM", "Stockage", "Réseau"]

# Clean the data (remove Year separator rows)
df = df[df["Année"].apply(lambda x: str(x).isdigit() if pd.notnull(x) else False)]
df["Année"] = df["Année"].astype(int)

def assign_classe(row):
    gamme = str(row["Gamme"]).lower()
    year = int(row["Année"])
    
    if "razr" in gamme:
        if year >= 2023: return "A"
        if year == 2022: return "B"
        if year == 2021: return "C"
        return "D"
    
    if "edge" in gamme:
        if year >= 2024: return "A"
        if year == 2023: return "B"
        if year == 2022: return "C"
        if year == 2021: return "D"
        return "E"
    
    if "thinkphone" in gamme:
        return "A"
    
    if "moto g" in gamme:
        if year >= 2024: return "B"
        if year == 2023: return "C"
        if year == 2022: return "D"
        if year == 2021: return "D"
        if year == 2020: return "E"
        return "F"
    
    if "moto e" in gamme:
        if year >= 2023: return "E"
        return "F"
    
    # Defaults
    if year >= 2024: return "C"
    if year >= 2022: return "D"
    if year >= 2020: return "E"
    return "F"

df["Classe"] = df.apply(assign_classe, axis=1)

# Sort order: Razr > Edge > ThinkPhone > Moto G > Moto E > Others
gamme_order = {
    "razr": 1,
    "edge": 2,
    "thinkphone": 3,
    "moto g": 4,
    "moto e": 5
}

def get_gamme_rank(gamme):
    g = str(gamme).lower()
    for k, v in gamme_order.items():
        if k in g: return v
    return 10

df["GammeRank"] = df["Gamme"].apply(get_gamme_rank)

# Sort: GammeRank (ASC), Year (DESC), Model (ASC)
df = df.sort_values(by=["GammeRank", "Année", "Modèle"], ascending=[True, False, True])

# Drop internal rank
df = df.drop(columns=["GammeRank"])

# Add PRT column
df["PRT (à remplir)"] = ""

# Keep only relevant columns for the final table
output_columns = ["Année", "Gamme", "Modèle", "RAM", "Stockage", "Classe", "PRT (à remplir)"]
df_final = df[output_columns]

# Generate Markdown
output_md = "# Catalogue Motorola Reclassé (TEKH+)\n\n"
output_md += "Ce catalogue est ordonné par Gamme (Premium -> Entrée de gamme) puis par Année décroissante.\n"
output_md += "Les classes TEKH+ (A-F) ont été assignées selon les critères de récence et de positionnement.\n\n"
output_md += df_final.to_markdown(index=False)

with open('/home/kizerbo/TEKH/motorola_tekh_ready.md', 'w') as f:
    f.write(output_md)

print("Succès : motorola_tekh_ready.md généré.")
