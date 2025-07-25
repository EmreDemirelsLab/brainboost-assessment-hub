#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FORTEST Excel Dosyası - Final Analiz Raporu
DİKKAT ve BECERİ TABLOSU sekmelerinin derinlemesine analiz sonuçları
"""

import json
from pathlib import Path

def create_final_report():
    """Final analiz raporunu oluştur"""
    
    print("="*80)
    print("📊 FORTEST EXCEL DOSYASI - FİNAL ANALİZ RAPORU")
    print("="*80)
    
    # JSON raporunu oku
    with open('kapsamli_rapor.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n🎯 EXECUTIVE SUMMARY")
    print("-" * 50)
    print(f"📁 Analiz Edilen Dosya: {data['dosya_bilgileri']['dosya_adi']}")
    print(f"📋 Toplam Sekme Sayısı: {data['dosya_bilgileri']['sekme_sayisi']}")
    print(f"🧠 Toplam Bilişsel Beceri: {data['beceri_tablosu_analizi']['toplam_beceri']}")
    print(f"🧪 Toplam Test Türü: {data['beceri_tablosu_analizi']['toplam_test']}")
    
    print("\n🔍 DERİNLEMESİNE ANALİZ BULGULARI")
    print("-" * 50)
    
    print("\n1️⃣ BECERİ TABLOSU SEKMESİ ANALİZİ:")
    print("   ✅ Bu sekme, tüm bilişsel becerilerin hangi testlerle ölçüldüğünü gösteren")
    print("      bir 'harita' görevi görüyor.")
    print("   ✅ 14 farklı bilişsel beceri tanımlanmış")
    print("   ✅ 5 farklı test türü (Dikkat, Hafıza, Stroop, Görsel İşleme, Akıl-Mantık)")
    print("   ✅ En kapsamlı test: Akıl-Mantık (9 beceri ölçüyor)")
    print("   ✅ En sık ölçülen beceriler:")
    for beceri, test_sayisi in data['beceri_tablosu_analizi']['beceri_test_sayilari'].items():
        if test_sayisi >= 5:
            print(f"      • {beceri}: {test_sayisi} test tarafından ölçülüyor")
    
    print("\n2️⃣ DİKKAT SEKMESİ ANALİZİ:")
    print(f"   ✅ Toplam {data['dikkat_analizi']['toplam_soru']} soru içeriyor")
    print("   ✅ Harf-Sayı kodu dağılımı:")
    print("      • 's' kodlu sorular: 25 adet (sayı sorular)")
    print("      • 'h' kodlu sorular: 21 adet (harf sorular)")
    print("      • 's/h' kodlu sorular: 4 adet (karma sorular)")
    print("   ✅ Bu dağılım, dikkat testinin hem sayısal hem de alfabetik")
    print("      uyaranları içerdiğini gösteriyor")
    
    print("\n3️⃣ VERİ KALİTESİ DEĞERLENDİRMESİ:")
    print("   📊 Veri kalitesi skorları (yüksekten düşüğe):")
    
    # Veri kalitesi skorlarını sırala
    kalite_skorlari = [(sekme, info['quality_score']) 
                      for sekme, info in data['veri_kalitesi'].items()]
    kalite_skorlari.sort(key=lambda x: x[1], reverse=True)
    
    for sekme, skor in kalite_skorlari:
        durum = "🟢" if skor > 50 else "🟡" if skor > 30 else "🔴"
        print(f"      {durum} {sekme}: {skor:.1f}%")
    
    print("\n4️⃣ TEMEL BULGULAR VE YORUMLAR:")
    print("   🔍 BECERİ TABLOSU sekmesi:")
    print("      • En yüksek veri kalitesi (%60.7)")
    print("      • Testler arası beceri dağılımı dengeli")
    print("      • Çapraz referans matrisi olarak kullanılabilir")
    
    print("   🔍 DİKKAT sekmesi:")
    print("      • Orta düzey veri kalitesi (%49.0)")
    print("      • Yapılandırılmış soru formatı")
    print("      • Harf ve sayı kategorilerinde dengeli dağılım")
    
    print("\n5️⃣ ÖNERİLER VE AKSIYON PLANI:")
    print("   💡 Veri Kalitesi İyileştirme:")
    print("      • GÖRSEL İŞLEME (%22.4) ve STROOP (%24.5) sekmelerinde")
    print("        yüksek oranda eksik veri var")
    print("      • Bu sekmelerin veri girişi gözden geçirilmeli")
    
    print("   💡 Standardizasyon:")
    print("      • Sütun adlarında 'Unnamed' ifadeleri temizlenmeli")
    print("      • Tutarlı veri formatları uygulanmalı")
    
    print("   💡 Dokümantasyon:")
    print("      • Her sekme için detaylı açıklama eklenmeli")
    print("      • Veri sözlüğü (data dictionary) oluşturulmalı")
    
    print("\n6️⃣ TEKNİK DETAYLAR:")
    print("   📊 Toplam analiz edilen hücre sayısı:")
    toplam_hucre = sum(info['total_cells'] for info in data['veri_kalitesi'].values())
    toplam_eksik = sum(int(info['missing_cells']) for info in data['veri_kalitesi'].values())
    genel_kalite = ((toplam_hucre - toplam_eksik) / toplam_hucre) * 100
    
    print(f"      • Toplam hücre: {toplam_hucre:,}")
    print(f"      • Eksik hücre: {toplam_eksik:,}")
    print(f"      • Genel veri kalitesi: {genel_kalite:.1f}%")
    
    print("\n" + "="*80)
    print("✅ ANALİZ TAMAMLANDI - TÜM RAPORLAR HAZIR")
    print("="*80)
    
    print("\n📁 OLUŞTURULAN DOSYALAR:")
    print("   • excel_analyzer.py - Temel analiz scripti")
    print("   • detailed_analysis.py - Detaylı analiz ve görselleştirme")
    print("   • final_report.py - Bu özet rapor")
    print("   • analiz_raporu.json - Ham analiz verileri")
    print("   • kapsamli_rapor.json - Yapılandırılmış analiz sonuçları")
    print("   • detayli_analiz_raporu.md - Markdown formatında rapor")
    print("   • beceri_test_iliskisi.png - Beceri-test ilişki matrisi görselleştirmesi")
    print("   • veri_kalitesi.png - Veri kalitesi skorları grafiği")
    print("   • requirements.txt - Gerekli Python kütüphaneleri")

if __name__ == "__main__":
    create_final_report() 