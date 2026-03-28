
import pandas as pd
import os

file_path = 'REKAP HASIL TES.xlsx'

if not os.path.exists(file_path):
    print(f"Error: File '{file_path}' not found.")
    exit(1)

try:
    xls = pd.ExcelFile(file_path)
    print("Sheet Names:", xls.sheet_names)
    
    for sheet_name in xls.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5)
        print(df.to_string())
except Exception as e:
    print(f"Error reading excel: {e}")
