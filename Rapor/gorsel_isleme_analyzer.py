#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GÖRSEL İŞLEME Sekmesi Okuma Scripti
Excel dosyasındaki GÖRSEL İŞLEME sekmesini okur ve analiz eder
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def analyze_gorsel_isleme_sheet():
    """GÖRSEL İŞLEME sekmesini analiz eder"""
    print("🧩 GÖRSEL İŞLEME SEKMESİ ANALİZİ")
    print("="*60)
    
    # Excel dosyasını yükle
    excel_path = "FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx"
    
    try:
        # Tüm sekmeleri listele
        workbook = pd.ExcelFile(excel_path)
        print(f"📋 Bulunan sekmeler: {workbook.sheet_names}")
        
        # GÖRSEL İŞLEME sekmesini bul
        gorsel_isleme_sheet = None
        gorsel_isleme_sheet_name = None
        for sheet_name in workbook.sheet_names:
            if 'görsel' in sheet_name.lower() or 'isleme' in sheet_name.lower() or 'işleme' in sheet_name.lower():
                gorsel_isleme_sheet = pd.read_excel(excel_path, sheet_name=sheet_name)
                gorsel_isleme_sheet_name = sheet_name
                print(f"✅ GÖRSEL İŞLEME sekmesi bulundu: {sheet_name}")
                break
        
        if gorsel_isleme_sheet is None:
            # Tüm sekmeleri kontrol et ve puzzle ile ilgili olanları ara
            print("❌ GÖRSEL İŞLEME sekmesi bulunamadı! Tüm sekmeleri kontrol ediliyor...")
            for sheet_name in workbook.sheet_names:
                sheet_data = pd.read_excel(excel_path, sheet_name=sheet_name)
                print(f"\n📊 {sheet_name} sekmesi:")
                print(f"  Boyut: {sheet_data.shape}")
                print(f"  Sütunlar: {list(sheet_data.columns)}")
                if not sheet_data.empty:
                    print(f"  İlk birkaç satır:")
                    print(sheet_data.head(3))
                    print()
            return None
            
        # GÖRSEL İŞLEME sekmesi analizi
        print(f"\n📊 GÖRSEL İŞLEME Sekmesi ({gorsel_isleme_sheet_name}) Detaylı Analizi:")
        print(f"📏 Veri boyutu: {gorsel_isleme_sheet.shape}")
        print(f"📋 Sütunlar: {list(gorsel_isleme_sheet.columns)}")
        
        # Tüm veriyi göster
        print(f"\n📄 GÖRSEL İŞLEME sekmesi içeriği:")
        print(gorsel_isleme_sheet.to_string())
        
        # Boş olmayan hücreleri analiz et
        print(f"\n🔍 Dolu hücreler analizi:")
        for col in gorsel_isleme_sheet.columns:
            non_null_count = gorsel_isleme_sheet[col].notna().sum()
            if non_null_count > 0:
                print(f"  {col}: {non_null_count} dolu hücre")
                non_null_values = gorsel_isleme_sheet[col].dropna()
                if len(non_null_values) > 0:
                    print(f"    Değerler: {non_null_values.tolist()}")
        
        # Veri tiplerini göster
        print(f"\n📊 Veri tipleri:")
        for col, dtype in gorsel_isleme_sheet.dtypes.items():
            print(f"  {col}: {dtype}")
            
        return gorsel_isleme_sheet
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        return None

if __name__ == "__main__":
    analyze_gorsel_isleme_sheet() 