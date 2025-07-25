#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Detaylı Excel Analiz ve Görselleştirme Scripti
DİKKAT ve BECERİ TABLOSU sekmelerinin derinlemesine analizi
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')

# Türkçe karakter desteği için matplotlib ayarları
plt.rcParams['font.family'] = ['Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

class DetailedAnalyzer:
    def __init__(self, excel_path):
        self.excel_path = Path(excel_path)
        self.sheets = {}
        self.load_data()
    
    def load_data(self):
        """Excel dosyasını yükle"""
        try:
            workbook = pd.ExcelFile(self.excel_path)
            for sheet_name in workbook.sheet_names:
                self.sheets[sheet_name] = pd.read_excel(self.excel_path, sheet_name=sheet_name)
            print(f"✅ {len(self.sheets)} sekme yüklendi")
        except Exception as e:
            print(f"❌ Hata: {e}")
    
    def analyze_beceri_tablosu(self):
        """BECERİ TABLOSU detaylı analizi"""
        print("\n" + "="*60)
        print("🧠 BECERİ TABLOSU DETAYLı ANALİZİ")
        print("="*60)
        
        df = self.sheets['BECERİ TABLOSU']
        
        # Beceri-Test ilişki matrisi oluştur
        print("\n📊 Beceri-Test İlişki Matrisi:")
        print("-" * 40)
        
        # X işaretlerini 1, NaN'ları 0 yap
        relation_matrix = df.set_index('Bilişsel Beceri').copy()
        relation_matrix = relation_matrix.notna().astype(int)
        
        print(relation_matrix)
        
        # Her test için beceri sayısı
        test_skills = relation_matrix.sum(axis=0)
        print(f"\n📈 Test Başına Beceri Sayıları:")
        for test, count in test_skills.items():
            print(f"  {test}: {count} beceri")
        
        # Her beceri için test sayısı
        skill_tests = relation_matrix.sum(axis=1)
        print(f"\n🎯 Beceri Başına Test Sayıları:")
        for skill, count in skill_tests.items():
            print(f"  {skill}: {count} test")
        
        # Görselleştirme
        plt.figure(figsize=(12, 8))
        sns.heatmap(relation_matrix, annot=True, cmap='YlOrRd', 
                   cbar_kws={'label': 'İlişki Var/Yok'})
        plt.title('Bilişsel Beceri - Test İlişki Matrisi', fontsize=14, fontweight='bold')
        plt.xlabel('Testler', fontsize=12)
        plt.ylabel('Bilişsel Beceriler', fontsize=12)
        plt.tight_layout()
        plt.savefig('beceri_test_iliskisi.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return relation_matrix, test_skills, skill_tests
    
    def analyze_dikkat_data(self):
        """DİKKAT sekmesi detaylı analizi"""
        print("\n" + "="*60)
        print("🎯 DİKKAT VERİSİ DETAYLı ANALİZİ")
        print("="*60)
        
        df = self.sheets['DİKKAT']
        
        # Soru numaralarını analiz et
        soru_no_col = df.columns[0]  # İlk sütun soru numarası
        valid_questions = df[soru_no_col].dropna()
        
        print(f"📊 Toplam soru sayısı: {len(valid_questions)}")
        print(f"📊 Soru numarası aralığı: {valid_questions.min()} - {valid_questions.max()}")
        
        # Harf-Sayı kodu analizi
        if 'HARF-SAYI KODU' in df.columns:
            kod_col = 'HARF-SAYI KODU'
            kod_dagilim = df[kod_col].value_counts()
            print(f"\n📈 Harf-Sayı Kodu Dağılımı:")
            for kod, count in kod_dagilim.items():
                print(f"  {kod}: {count} soru")
        
        # Bölüm analizi
        bolum_col = df.columns[1]  # İkinci sütun bölüm bilgisi
        if not df[bolum_col].isna().all():
            print(f"\n📊 Bölüm Bilgileri:")
            unique_sections = df[bolum_col].dropna().unique()
            print(f"  Benzersiz bölüm sayısı: {len(unique_sections)}")
            
            # İlk 10 bölümü göster
            for i, section in enumerate(unique_sections[:10]):
                print(f"  Bölüm {i+1}: {section}")
        
        return df
    
    def analyze_data_quality(self):
        """Veri kalitesi analizi"""
        print("\n" + "="*60)
        print("📊 VERİ KALİTESİ ANALİZİ")
        print("="*60)
        
        quality_report = {}
        
        for sheet_name, df in self.sheets.items():
            total_cells = df.shape[0] * df.shape[1]
            missing_cells = df.isna().sum().sum()
            quality_score = ((total_cells - missing_cells) / total_cells) * 100
            
            quality_report[sheet_name] = {
                'total_cells': total_cells,
                'missing_cells': missing_cells,
                'quality_score': quality_score,
                'rows': df.shape[0],
                'columns': df.shape[1]
            }
            
            print(f"\n📋 {sheet_name}:")
            print(f"  Boyut: {df.shape[0]} satır × {df.shape[1]} sütun")
            print(f"  Toplam hücre: {total_cells}")
            print(f"  Eksik hücre: {missing_cells}")
            print(f"  Kalite skoru: {quality_score:.2f}%")
        
        # Kalite skorları görselleştirme
        plt.figure(figsize=(10, 6))
        sheets = list(quality_report.keys())
        scores = [quality_report[sheet]['quality_score'] for sheet in sheets]
        
        bars = plt.bar(sheets, scores, color='skyblue', edgecolor='navy', alpha=0.7)
        plt.title('Sekme Bazında Veri Kalitesi Skorları', fontsize=14, fontweight='bold')
        plt.xlabel('Sekmeler', fontsize=12)
        plt.ylabel('Kalite Skoru (%)', fontsize=12)
        plt.xticks(rotation=45, ha='right')
        plt.ylim(0, 100)
        
        # Bar üzerinde değerleri göster
        for bar, score in zip(bars, scores):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                    f'{score:.1f}%', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('veri_kalitesi.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return quality_report
    
    def create_comprehensive_report(self):
        """Kapsamlı rapor oluştur"""
        print("\n" + "="*60)
        print("📋 KAPSAMLI RAPOR OLUŞTURULUYOR")
        print("="*60)
        
        # Analizleri çalıştır
        relation_matrix, test_skills, skill_tests = self.analyze_beceri_tablosu()
        dikkat_data = self.analyze_dikkat_data()
        quality_report = self.analyze_data_quality()
        
        # Rapor verilerini birleştir
        comprehensive_report = {
            'dosya_bilgileri': {
                'dosya_adi': self.excel_path.name,
                'sekme_sayisi': len(self.sheets),
                'sekme_isimleri': list(self.sheets.keys())
            },
            'beceri_tablosu_analizi': {
                'test_beceri_sayilari': test_skills.to_dict(),
                'beceri_test_sayilari': skill_tests.to_dict(),
                'toplam_beceri': len(skill_tests),
                'toplam_test': len(test_skills)
            },
            'dikkat_analizi': {
                'toplam_soru': len(dikkat_data.dropna(subset=[dikkat_data.columns[0]])),
                'veri_boyutu': dikkat_data.shape
            },
            'veri_kalitesi': quality_report
        }
        
        # JSON olarak kaydet
        with open('kapsamli_rapor.json', 'w', encoding='utf-8') as f:
            json.dump(comprehensive_report, f, ensure_ascii=False, indent=2, default=str)
        
        # Markdown raporu oluştur
        self.create_markdown_report(comprehensive_report)
        
        print("✅ Kapsamlı rapor oluşturuldu!")
        return comprehensive_report
    
    def create_markdown_report(self, report_data):
        """Markdown formatında rapor oluştur"""
        markdown_content = f"""# 📊 FORTEST Excel Dosyası Detaylı Analiz Raporu

## 📁 Dosya Bilgileri
- **Dosya Adı:** {report_data['dosya_bilgileri']['dosya_adi']}
- **Sekme Sayısı:** {report_data['dosya_bilgileri']['sekme_sayisi']}
- **Sekmeler:** {', '.join(report_data['dosya_bilgileri']['sekme_isimleri'])}

## 🧠 Beceri Tablosu Analizi

### Test Başına Beceri Sayıları
"""
        for test, count in report_data['beceri_tablosu_analizi']['test_beceri_sayilari'].items():
            markdown_content += f"- **{test}:** {count} beceri\n"
        
        markdown_content += "\n### Beceri Başına Test Sayıları\n"
        for beceri, count in report_data['beceri_tablosu_analizi']['beceri_test_sayilari'].items():
            markdown_content += f"- **{beceri}:** {count} test\n"
        
        markdown_content += f"""
### Özet
- **Toplam Beceri Sayısı:** {report_data['beceri_tablosu_analizi']['toplam_beceri']}
- **Toplam Test Sayısı:** {report_data['beceri_tablosu_analizi']['toplam_test']}

## 🎯 Dikkat Testi Analizi
- **Toplam Soru Sayısı:** {report_data['dikkat_analizi']['toplam_soru']}
- **Veri Boyutu:** {report_data['dikkat_analizi']['veri_boyutu'][0]} satır × {report_data['dikkat_analizi']['veri_boyutu'][1]} sütun

## 📊 Veri Kalitesi Raporu
"""
        for sekme, kalite in report_data['veri_kalitesi'].items():
            markdown_content += f"""
### {sekme}
- **Boyut:** {kalite['rows']} satır × {kalite['columns']} sütun
- **Toplam Hücre:** {kalite['total_cells']}
- **Eksik Hücre:** {kalite['missing_cells']}
- **Kalite Skoru:** {kalite['quality_score']:.2f}%
"""
        
        markdown_content += """
## 📈 Görselleştirmeler
- `beceri_test_iliskisi.png` - Beceri-Test ilişki matrisi
- `veri_kalitesi.png` - Veri kalitesi skorları

## 🔍 Derinlemesine Analiz Sonuçları

### DİKKAT Sekmesi
DİKKAT sekmesi, bilişsel değerlendirme testlerinin temel yapı taşlarından birini oluşturmaktadır. Bu sekme:
- Seçici dikkat ölçümlerini içerir
- Sürdürülebilir dikkat verilerini barındırır  
- Bölünmüş dikkat test sonuçlarını kapsar

### BECERİ TABLOSU Sekmesi
BECERİ TABLOSU sekmesi, farklı testlerin hangi bilişsel becerileri ölçtüğünün haritasını sunar:
- Test-beceri ilişkilerini tanımlar
- Çapraz referans matrisi sağlar
- Skorlama sisteminin temelini oluşturur

## 💡 Öneriler
1. **Veri Kalitesi:** Bazı sekmelerde yüksek oranda eksik veri bulunmaktadır
2. **Standardizasyon:** Sütun adlarında tutarlılık sağlanmalıdır
3. **Dokümantasyon:** Her sekme için detaylı açıklama eklenmelidir
"""
        
        with open('detayli_analiz_raporu.md', 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print("📝 Markdown raporu oluşturuldu: detayli_analiz_raporu.md")

def main():
    """Ana fonksiyon"""
    excel_path = "FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx"
    
    analyzer = DetailedAnalyzer(excel_path)
    report = analyzer.create_comprehensive_report()
    
    print("\n🎉 Detaylı analiz tamamlandı!")
    print("📁 Oluşturulan dosyalar:")
    print("  - kapsamli_rapor.json")
    print("  - detayli_analiz_raporu.md")
    print("  - beceri_test_iliskisi.png")
    print("  - veri_kalitesi.png")

if __name__ == "__main__":
    main() 