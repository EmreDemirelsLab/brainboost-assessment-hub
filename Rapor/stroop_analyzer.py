#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
STROOP Sekmesi Analiz Scripti
Excel dosyasındaki STROOP sekmesini analiz eder
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def analyze_stroop_sheet():
    """STROOP sekmesini analiz eder"""
    print("🌈 STROOP SEKMESİ ANALİZİ")
    print("="*50)
    
    # Excel dosyasını yükle
    excel_path = "FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx"
    
    try:
        # Tüm sekmeleri listele
        workbook = pd.ExcelFile(excel_path)
        print(f"📋 Bulunan sekmeler: {workbook.sheet_names}")
        
        # STROOP sekmesini bul
        stroop_sheet = None
        stroop_sheet_name = None
        for sheet_name in workbook.sheet_names:
            if 'stroop' in sheet_name.lower():
                stroop_sheet = pd.read_excel(excel_path, sheet_name=sheet_name)
                stroop_sheet_name = sheet_name
                print(f"✅ STROOP sekmesi bulundu: {sheet_name}")
                break
        
        if stroop_sheet is None:
            print("❌ STROOP sekmesi bulunamadı!")
            # Diğer sekmeleri de kontrol et
            for sheet_name in workbook.sheet_names:
                sheet_data = pd.read_excel(excel_path, sheet_name=sheet_name)
                print(f"\n📊 {sheet_name} sekmesi:")
                print(f"  Boyut: {sheet_data.shape}")
                print(f"  Sütunlar: {list(sheet_data.columns)}")
                if not sheet_data.empty:
                    print(f"  İlk birkaç satır:")
                    print(sheet_data.head(3))
            return None
            
        # STROOP sekmesi analizi
        print(f"\n📊 STROOP Sekmesi Detaylı Analizi:")
        print(f"📏 Veri boyutu: {stroop_sheet.shape}")
        print(f"📋 Sütunlar: {list(stroop_sheet.columns)}")
        
        # Tüm veriyi göster
        print(f"\n📄 STROOP sekmesi içeriği:")
        print(stroop_sheet.to_string())
        
        # Boş olmayan hücreleri analiz et
        print(f"\n🔍 Dolu hücreler analizi:")
        for col in stroop_sheet.columns:
            non_null_count = stroop_sheet[col].notna().sum()
            if non_null_count > 0:
                print(f"  {col}: {non_null_count} dolu hücre")
                non_null_values = stroop_sheet[col].dropna()
                if len(non_null_values) > 0:
                    print(f"    Değerler: {non_null_values.tolist()}")
        
        # Veri tiplerini göster
        print(f"\n📊 Veri tipleri:")
        for col, dtype in stroop_sheet.dtypes.items():
            print(f"  {col}: {dtype}")
            
        return stroop_sheet
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        return None

if __name__ == "__main__":
    analyze_stroop_sheet() 