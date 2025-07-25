#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel Dosyası Analiz Scripti
FORTEST-RAPORLAMA-VERİ TABANI Excel dosyasındaki DİKKAT ve BECERİ TABLOSU sekmelerini analiz eder
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class ExcelAnalyzer:
    def __init__(self, excel_path):
        """
        Excel dosyasını yükler ve analiz için hazırlar
        
        Args:
            excel_path (str): Excel dosyasının yolu
        """
        self.excel_path = Path(excel_path)
        self.workbook = None
        self.sheets = {}
        self.analysis_results = {}
        
    def load_excel(self):
        """Excel dosyasını yükler ve tüm sekmeleri okur"""
        try:
            # Excel dosyasının tüm sekmelerini oku
            self.workbook = pd.ExcelFile(self.excel_path)
            print(f"📊 Excel dosyası yüklendi: {self.excel_path.name}")
            print(f"📋 Bulunan sekmeler: {self.workbook.sheet_names}")
            
            # Her sekmeyi DataFrame olarak yükle
            for sheet_name in self.workbook.sheet_names:
                try:
                    self.sheets[sheet_name] = pd.read_excel(self.excel_path, sheet_name=sheet_name)
                    print(f"✅ {sheet_name} sekmesi yüklendi: {self.sheets[sheet_name].shape}")
                except Exception as e:
                    print(f"❌ {sheet_name} sekmesi yüklenirken hata: {e}")
                    
            return True
        except Exception as e:
            print(f"❌ Excel dosyası yüklenirken hata: {e}")
            return False
    
    def analyze_dikkat_sheet(self):
        """DİKKAT sekmesini analiz eder"""
        print("\n" + "="*50)
        print("🎯 DİKKAT SEKMESİ ANALİZİ")
        print("="*50)
        
        # DİKKAT sekmesini bul (büyük/küçük harf duyarsız)
        dikkat_sheet = None
        for sheet_name in self.sheets.keys():
            if 'dikkat' in sheet_name.lower() or 'attention' in sheet_name.lower() or sheet_name == 'DİKKAT':
                dikkat_sheet = self.sheets[sheet_name]
                print(f"📊 Analiz edilen sekme: {sheet_name}")
                break
        
        if dikkat_sheet is None:
            print("❌ DİKKAT sekmesi bulunamadı!")
            return None
            
        # Temel bilgiler
        print(f"📏 Veri boyutu: {dikkat_sheet.shape}")
        print(f"📋 Sütunlar: {list(dikkat_sheet.columns)}")
        
        # İlk birkaç satırı göster
        print("\n📄 İlk 5 satır:")
        print(dikkat_sheet.head())
        
        # Boş değerleri kontrol et
        print(f"\n🔍 Boş değerler:")
        missing_data = dikkat_sheet.isnull().sum()
        for col, count in missing_data.items():
            if count > 0:
                print(f"  {col}: {count} boş değer")
        
        # Veri tiplerini göster
        print(f"\n📊 Veri tipleri:")
        for col, dtype in dikkat_sheet.dtypes.items():
            print(f"  {col}: {dtype}")
        
        # Sayısal sütunlar için temel istatistikler
        numeric_cols = dikkat_sheet.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            print(f"\n📈 Sayısal sütunlar için temel istatistikler:")
            print(dikkat_sheet[numeric_cols].describe())
        
        self.analysis_results['dikkat'] = {
            'shape': dikkat_sheet.shape,
            'columns': list(dikkat_sheet.columns),
            'missing_values': missing_data.to_dict(),
            'data_types': dikkat_sheet.dtypes.to_dict(),
            'numeric_stats': dikkat_sheet[numeric_cols].describe().to_dict() if len(numeric_cols) > 0 else {}
        }
        
        return dikkat_sheet
    
    def analyze_beceri_tablosu_sheet(self):
        """BECERİ TABLOSU sekmesini analiz eder"""
        print("\n" + "="*50)
        print("🧠 BECERİ TABLOSU SEKMESİ ANALİZİ")
        print("="*50)
        
        # BECERİ TABLOSU sekmesini bul
        beceri_sheet = None
        for sheet_name in self.sheets.keys():
            if 'beceri' in sheet_name.lower() or 'skill' in sheet_name.lower() or 'tablo' in sheet_name.lower():
                beceri_sheet = self.sheets[sheet_name]
                print(f"📊 Analiz edilen sekme: {sheet_name}")
                break
        
        if beceri_sheet is None:
            print("❌ BECERİ TABLOSU sekmesi bulunamadı!")
            return None
            
        # Temel bilgiler
        print(f"📏 Veri boyutu: {beceri_sheet.shape}")
        print(f"📋 Sütunlar: {list(beceri_sheet.columns)}")
        
        # İlk birkaç satırı göster
        print("\n📄 İlk 5 satır:")
        print(beceri_sheet.head())
        
        # Boş değerleri kontrol et
        print(f"\n🔍 Boş değerler:")
        missing_data = beceri_sheet.isnull().sum()
        for col, count in missing_data.items():
            if count > 0:
                print(f"  {col}: {count} boş değer")
        
        # Veri tiplerini göster
        print(f"\n📊 Veri tipleri:")
        for col, dtype in beceri_sheet.dtypes.items():
            print(f"  {col}: {dtype}")
        
        # Sayısal sütunlar için temel istatistikler
        numeric_cols = beceri_sheet.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            print(f"\n📈 Sayısal sütunlar için temel istatistikler:")
            print(beceri_sheet[numeric_cols].describe())
        
        self.analysis_results['beceri_tablosu'] = {
            'shape': beceri_sheet.shape,
            'columns': list(beceri_sheet.columns),
            'missing_values': missing_data.to_dict(),
            'data_types': beceri_sheet.dtypes.to_dict(),
            'numeric_stats': beceri_sheet[numeric_cols].describe().to_dict() if len(numeric_cols) > 0 else {}
        }
        
        return beceri_sheet
    
    def deep_analysis(self):
        """Derinlemesine analiz yapar"""
        print("\n" + "="*60)
        print("🔬 DERİNLEMESİNE ANALİZ")
        print("="*60)
        
        # Her sekme için detaylı analiz
        for sheet_name, df in self.sheets.items():
            print(f"\n📊 {sheet_name} sekmesi detaylı analizi:")
            print("-" * 40)
            
            # Veri kalitesi analizi
            total_cells = df.shape[0] * df.shape[1]
            missing_cells = df.isnull().sum().sum()
            data_quality = ((total_cells - missing_cells) / total_cells) * 100
            print(f"📈 Veri kalitesi: {data_quality:.2f}%")
            
            # Benzersiz değer analizi
            print(f"🔢 Benzersiz değer sayıları:")
            for col in df.columns:
                unique_count = df[col].nunique()
                total_count = len(df[col])
                uniqueness = (unique_count / total_count) * 100 if total_count > 0 else 0
                print(f"  {col}: {unique_count}/{total_count} ({uniqueness:.1f}%)")
            
            # Kategorik sütunlar için değer dağılımı
            categorical_cols = df.select_dtypes(include=['object']).columns
            for col in categorical_cols[:3]:  # İlk 3 kategorik sütun
                print(f"\n📊 {col} sütunu değer dağılımı:")
                value_counts = df[col].value_counts().head(10)
                for value, count in value_counts.items():
                    print(f"  {value}: {count}")
    
    def generate_report(self):
        """Analiz raporu oluşturur"""
        print("\n" + "="*60)
        print("📋 ANALİZ RAPORU")
        print("="*60)
        
        report = {
            'file_info': {
                'path': str(self.excel_path),
                'sheets_count': len(self.sheets),
                'sheet_names': list(self.sheets.keys())
            },
            'analysis_results': self.analysis_results
        }
        
        # Raporu dosyaya kaydet
        import json
        report_path = Path('analiz_raporu.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"💾 Detaylı rapor kaydedildi: {report_path}")
        
        return report
    
    def run_full_analysis(self):
        """Tam analizi çalıştırır"""
        print("🚀 Excel Dosyası Analizi Başlatılıyor...")
        
        if not self.load_excel():
            return False
        
        # Dikkat sekmesi analizi
        self.analyze_dikkat_sheet()
        
        # Beceri tablosu sekmesi analizi
        self.analyze_beceri_tablosu_sheet()
        
        # Derinlemesine analiz
        self.deep_analysis()
        
        # Rapor oluştur
        report = self.generate_report()
        
        print("\n✅ Analiz tamamlandı!")
        return report

def main():
    """Ana fonksiyon"""
    excel_path = "FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx"
    
    analyzer = ExcelAnalyzer(excel_path)
    result = analyzer.run_full_analysis()
    
    if result:
        print("\n🎉 Analiz başarıyla tamamlandı!")
        print("📁 Sonuçlar 'Rapor' klasöründe kaydedildi.")
    else:
        print("\n❌ Analiz sırasında hata oluştu!")

if __name__ == "__main__":
    main() 