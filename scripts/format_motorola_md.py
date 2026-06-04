import pandas as pd

file_path = '/home/kizerbo/TEKH/Motorola_Smartphones_Catalogue.xlsx'
xl = pd.ExcelFile(file_path)

output_md = "# Motorola Smartphones Catalogue\n\n"

for sheet_name in xl.sheet_names:
    df = xl.parse(sheet_name)
    output_md += f"## {sheet_name}\n\n"
    output_md += df.to_markdown(index=False) + "\n\n"

with open('/home/kizerbo/TEKH/motorola_catalogue.md', 'w') as f:
    f.write(output_md)
