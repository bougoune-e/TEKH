import pandas as pd
import json

file_path = '/home/kizerbo/TEKH/Motorola_Smartphones_Catalogue.xlsx'
xl = pd.ExcelFile(file_path)

data = {}
for sheet_name in xl.sheet_names:
    df = xl.parse(sheet_name)
    # Replace NaN with None for JSON compatibility
    df = df.where(pd.notnull(df), None)
    data[sheet_name] = df.to_dict(orient='records')

print(json.dumps(data, indent=2))
