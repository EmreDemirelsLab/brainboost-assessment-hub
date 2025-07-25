#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DİKKAT Excel Sekmesi - Test Verisi Eşleştirme Analizi
Excel'de istenen veriler ile dikkat.html testinden alınacak veriler
"""

import pandas as pd
import json

def analyze_dikkat_excel_requirements():
    """Excel DİKKAT sekmesinde istenen verileri analiz et"""
    
    print("="*80)
    print("📊 DİKKAT SEKMESİ - EXCEL VERİ GEREKSİNİMLERİ ANALİZİ")
    print("="*80)
    
    # Excel dosyasını oku
    df = pd.read_excel("FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx", sheet_name="DİKKAT")
    
    print("\n🔍 EXCEL'DE İSTENEN VERİLER:")
    print("-" * 50)
    
    # Sütun analizi
    columns = df.columns.tolist()
    for i, col in enumerate(columns):
        print(f"{i+1}. {col}")
    
    print("\n📋 EXCEL VERİ YAPISI ANALİZİ:")
    print("-" * 50)
    
    # Her sütundaki benzersiz değerleri analiz et
    excel_requirements = {}
    
    for col in columns:
        unique_values = df[col].dropna().unique()
        excel_requirements[col] = {
            'unique_count': len(unique_values),
            'sample_values': unique_values[:5].tolist() if len(unique_values) > 0 else [],
            'data_type': str(df[col].dtype),
            'null_count': df[col].isnull().sum()
        }
        
        print(f"\n🔸 {col}:")
        print(f"   Benzersiz değer sayısı: {len(unique_values)}")
        print(f"   Veri tipi: {df[col].dtype}")
        print(f"   Boş değer sayısı: {df[col].isnull().sum()}")
        if len(unique_values) > 0:
            print(f"   Örnek değerler: {unique_values[:3].tolist()}")
    
    return excel_requirements

def map_dikkat_test_to_excel():
    """dikkat.html testinden alınacak veriler ile Excel gereksinimleri eşleştir"""
    
    print("\n" + "="*80)
    print("🎯 DİKKAT.HTML TESTİNDEN ALINACAK VERİLER")
    print("="*80)
    
    # dikkat.html testinden alınabilecek veriler (JavaScript analizi temel alınarak)
    test_data_available = {
        "SORU NO": {
            "description": "Soru numarası (1-50)",
            "source": "testState.mainIndex + 1",
            "data_type": "integer",
            "example": "1, 2, 3, ..., 50"
        },
        
        "BÖLÜM BİLGİSİ": {
            "description": "Hangi bölümde olduğu (1., 2., 3. BÖLÜM)",
            "source": "getCurrentSection(questionIndex)",
            "data_type": "string",
            "example": "1. BÖLÜM, 2. BÖLÜM, 3. BÖLÜM"
        },
        
        "HARF-SAYI KODU": {
            "description": "Soru türü kodu (s/h/s_h)",
            "source": "getQuestionType(questionIndex)",
            "data_type": "string",
            "example": "s (sayı), h (harf), s/h (karma)"
        },
        
        "DOĞRU CEVAP": {
            "description": "Sorunun doğru cevabı",
            "source": "TEST_DATA.mainQuestions[index].target",
            "data_type": "string",
            "example": "5, t, 3, u, 1"
        },
        
        "VERİLEN CEVAP": {
            "description": "Kullanıcının verdiği cevap",
            "source": "answerData.selected",
            "data_type": "string",
            "example": "5, t, 2, u, 1"
        },
        
        "DOĞRU/YANLIŞ": {
            "description": "Cevabın doğru olup olmadığı",
            "source": "answerData.isCorrect",
            "data_type": "boolean",
            "example": "True, False"
        },
        
        "TEPKİ SÜRESİ": {
            "description": "Soruya yanıt verme süresi (ms)",
            "source": "answerData.reactionTime",
            "data_type": "integer",
            "example": "1250, 2340, 890"
        },
        
        "SORU BAŞLAMA ZAMANI": {
            "description": "Sorunun gösterilme zamanı",
            "source": "testState.questionStartTime",
            "data_type": "timestamp",
            "example": "2024-07-25T02:30:15.123Z"
        },
        
        "CEVAP VERME ZAMANI": {
            "description": "Cevabın verilme zamanı",
            "source": "Date.now()",
            "data_type": "timestamp",
            "example": "2024-07-25T02:30:16.373Z"
        },
        
        "BÖLÜM BAŞLAMA ZAMANI": {
            "description": "Bölümün başlama zamanı",
            "source": "testState.sectionStartTimes[sectionKey]",
            "data_type": "timestamp",
            "example": "2024-07-25T02:30:00.000Z"
        },
        
        "BÖLÜM BİTİŞ ZAMANI": {
            "description": "Bölümün bitiş zamanı",
            "source": "testState.sectionEndTimes[sectionKey]",
            "data_type": "timestamp",
            "example": "2024-07-25T02:31:30.000Z"
        },
        
        "BÖLÜM SÜRESİ": {
            "description": "Bölümün toplam süresi (ms)",
            "source": "endTime - startTime",
            "data_type": "integer",
            "example": "90000 (90 saniye)"
        },
        
        "TOPLAM TEST SÜRESİ": {
            "description": "Tüm testin süresi (ms)",
            "source": "Date.now() - testState.mainStartTime",
            "data_type": "integer",
            "example": "180000 (3 dakika)"
        },
        
        "YANLIŞ SEÇİLEN SEÇENEK": {
            "description": "Yanlış cevap verildiğinde seçilen seçenek",
            "source": "testState.wrongSelections[].selectedWrong",
            "data_type": "string",
            "example": "2, k, 7"
        },
        
        "TÜR BAZLI DOĞRU SAYISI": {
            "description": "Soru türüne göre doğru sayısı",
            "source": "testState.questionTypeMistakes[type].correct",
            "data_type": "integer",
            "example": "s: 20, h: 18, s/h: 3"
        },
        
        "TÜR BAZLI YANLIŞ SAYISI": {
            "description": "Soru türüne göre yanlış sayısı",
            "source": "testState.questionTypeMistakes[type].wrong",
            "data_type": "integer",
            "example": "s: 5, h: 3, s/h: 1"
        },
        
        "BÖLÜM BAZLI DOĞRU SAYISI": {
            "description": "Bölüm bazında doğru cevap sayısı",
            "source": "getSectionStats(sectionKey).correctAnswers",
            "data_type": "integer",
            "example": "1.BÖLÜM: 10, 2.BÖLÜM: 14, 3.BÖLÜM: 16"
        },
        
        "BÖLÜM BAZLI YANLIŞ SAYISI": {
            "description": "Bölüm bazında yanlış cevap sayısı",
            "source": "getSectionStats(sectionKey).wrongAnswers",
            "data_type": "integer",
            "example": "1.BÖLÜM: 3, 2.BÖLÜM: 3, 3.BÖLÜM: 4"
        },
        
        "ORTALAMA TEPKİ SÜRESİ": {
            "description": "Tüm soruların ortalama tepki süresi",
            "source": "reactionTimes.reduce((a,b) => a+b) / reactionTimes.length",
            "data_type": "float",
            "example": "1450.5"
        },
        
        "HIZ PUANI": {
            "description": "Hız skoru (Max Süre - Kendi Süresi) / Max Süre * 100",
            "source": "((maxTime - actualTime) / maxTime) * 100",
            "data_type": "float",
            "example": "75.5"
        },
        
        "DOĞRULUK PUANI": {
            "description": "Doğru sayısı / Toplam soru * 100",
            "source": "(correctCount / totalCount) * 100",
            "data_type": "float",
            "example": "84.0"
        },
        
        "TEST DURUMU": {
            "description": "Test tamamlandı mı, yarıda mı kaldı",
            "source": "testState.incompleteAtQuestion || 'completed'",
            "data_type": "string",
            "example": "completed, incomplete_at_25"
        }
    }
    
    print("\n📊 MEVCUT VERİLER (dikkat.html testinden alınabilir):")
    print("-" * 60)
    
    for i, (key, info) in enumerate(test_data_available.items(), 1):
        print(f"\n{i:2d}. {key}")
        print(f"    📝 Açıklama: {info['description']}")
        print(f"    🔧 Kaynak: {info['source']}")
        print(f"    📊 Veri Tipi: {info['data_type']}")
        print(f"    💡 Örnek: {info['example']}")
    
    return test_data_available

def create_excel_mapping():
    """Excel sütunları ile test verileri arasında eşleştirme yap"""
    
    print("\n" + "="*80)
    print("🔗 EXCEL SÜTUNLARI ↔ TEST VERİLERİ EŞLEŞTİRMESİ")
    print("="*80)
    
    # Excel sütunları (gerçek analiz sonucu)
    excel_columns = [
        "SORU NO",
        "1. BÖLÜM", 
        "HARF-SAYI KODU",
        "Unnamed: 3",
        "Burası bize Seçici Dikkat-Kısa Süreli Görsel Hafıza-Sürdürülebilir Dikkat ve Bölünmüş Dikkat Puanı getiriyor",
        "Unnamed: 5",
        "Unnamed: 6", 
        "Unnamed: 7"
    ]
    
    # Eşleştirme önerileri
    mapping_suggestions = {
        "SORU NO": {
            "test_source": "testState.mainIndex + 1",
            "description": "1-50 arası soru numarası",
            "status": "✅ Direkt eşleştirme mümkün"
        },
        
        "1. BÖLÜM": {
            "test_source": "TEST_DATA.mainQuestions[index].question.join('-')",
            "description": "Sorunun seçenekleri (örn: '5-6-2-1-5-8')",
            "status": "✅ Direkt eşleştirme mümkün"
        },
        
        "HARF-SAYI KODU": {
            "test_source": "getQuestionType(questionIndex)",
            "description": "s/h/s_h soru türü kodu",
            "status": "✅ Direkt eşleştirme mümkün"
        },
        
        "Unnamed: 3": {
            "test_source": "Boş sütun - kullanılmıyor",
            "description": "Excel'de boş sütun",
            "status": "⚠️ Kullanılmıyor"
        },
        
        "Burası bize Seçici Dikkat-Kısa Süreli Görsel Hafıza-Sürdürülebilir Dikkat ve Bölünmüş Dikkat Puanı getiriyor": {
            "test_source": "Çoklu veri kaynağı gerekli",
            "description": "Ham veri, doğru/yanlış sayıları, tepki süreleri, bölüm analizleri",
            "status": "🔄 Kompleks eşleştirme - çoklu veri"
        },
        
        "Unnamed: 5": {
            "test_source": "Hesaplanacak değerler",
            "description": "İşlem hızı, tepki süreleri, bölüm süreleri",
            "status": "🧮 Hesaplama gerekli"
        },
        
        "Unnamed: 6": {
            "test_source": "Hesaplanacak skorlar",
            "description": "Hız puanları, doğruluk oranları",
            "status": "🧮 Hesaplama gerekli"
        },
        
        "Unnamed: 7": {
            "test_source": "Genel skorlar",
            "description": "Toplam puanlar, genel değerlendirme",
            "status": "🧮 Hesaplama gerekli"
        }
    }
    
    print("\n📋 EŞLEŞTİRME TABLOSU:")
    print("-" * 70)
    
    for excel_col in excel_columns:
        if excel_col in mapping_suggestions:
            mapping = mapping_suggestions[excel_col]
            print(f"\n🔸 EXCEL SÜTUNU: {excel_col}")
            print(f"   🎯 Test Kaynağı: {mapping['test_source']}")
            print(f"   📝 Açıklama: {mapping['description']}")
            print(f"   📊 Durum: {mapping['status']}")
        else:
            print(f"\n🔸 EXCEL SÜTUNU: {excel_col}")
            print(f"   ❓ Eşleştirme belirlenmedi")
    
    return mapping_suggestions

def generate_implementation_plan():
    """Uygulama planı oluştur"""
    
    print("\n" + "="*80)
    print("📋 UYGULAMA PLANI - DİKKAT TESTİ VERİ TOPLAMA")
    print("="*80)
    
    implementation_plan = {
        "phase_1": {
            "title": "Temel Veri Toplama",
            "tasks": [
                "SORU NO: testState.mainIndex + 1",
                "HARF-SAYI KODU: getQuestionType(questionIndex)",
                "DOĞRU CEVAP: TEST_DATA.mainQuestions[index].target",
                "VERİLEN CEVAP: answerData.selected",
                "DOĞRU/YANLIŞ: answerData.isCorrect",
                "TEPKİ SÜRESİ: answerData.reactionTime"
            ]
        },
        
        "phase_2": {
            "title": "Bölüm Bazlı Veriler",
            "tasks": [
                "BÖLÜM BİLGİSİ: getCurrentSection(questionIndex)",
                "BÖLÜM BAŞLAMA ZAMANI: testState.sectionStartTimes[sectionKey]",
                "BÖLÜM BİTİŞ ZAMANI: testState.sectionEndTimes[sectionKey]",
                "BÖLÜM SÜRESİ: endTime - startTime",
                "BÖLÜM BAZLI DOĞRU/YANLIŞ SAYILARI"
            ]
        },
        
        "phase_3": {
            "title": "Hesaplanacak Skorlar",
            "tasks": [
                "HIZ PUANI: ((maxTime - actualTime) / maxTime) * 100",
                "DOĞRULUK PUANI: (correctCount / totalCount) * 100",
                "ORTALAMA TEPKİ SÜRESİ: reactionTimes ortalaması",
                "TÜR BAZLI ANALİZLER: s/h/s_h türleri için ayrı hesaplar"
            ]
        },
        
        "phase_4": {
            "title": "Excel Formatına Uyarlama",
            "tasks": [
                "Sütun başlıklarını Excel formatına uyarla",
                "Boş sütunları (Unnamed) uygun verilerle doldur",
                "Uzun sütun adlarını kısalt",
                "Veri tiplerini Excel uyumlu hale getir"
            ]
        }
    }
    
    for phase_key, phase_info in implementation_plan.items():
        print(f"\n🚀 {phase_info['title'].upper()}")
        print("-" * 50)
        for i, task in enumerate(phase_info['tasks'], 1):
            print(f"   {i}. {task}")
    
    return implementation_plan

def main():
    """Ana fonksiyon"""
    
    # Excel gereksinimlerini analiz et
    excel_reqs = analyze_dikkat_excel_requirements()
    
    # Test verilerini analiz et
    test_data = map_dikkat_test_to_excel()
    
    # Eşleştirme yap
    mapping = create_excel_mapping()
    
    # Uygulama planı oluştur
    plan = generate_implementation_plan()
    
    # Sonuç raporu
    print("\n" + "="*80)
    print("✅ ANALİZ TAMAMLANDI")
    print("="*80)
    
    print("\n📊 ÖZET:")
    print(f"   • Excel'de {len(excel_reqs)} sütun var")
    print(f"   • Test'ten {len(test_data)} farklı veri alınabilir")
    print(f"   • {len([m for m in mapping.values() if 'Direkt eşleştirme' in m['status']])} direkt eşleştirme")
    print(f"   • {len([m for m in mapping.values() if 'Hesaplama' in m['status']])} hesaplama gerektiren alan")
    print(f"   • {len(plan)} aşamalı uygulama planı hazır")
    
    print("\n💡 ÖNERİ:")
    print("   Excel'deki 'Unnamed' sütunları daha anlamlı isimlerle değiştirilmeli")
    print("   Test sonuçları JSON formatında detaylı şekilde kaydedilmeli")
    print("   Excel formatına çevrim için ayrı bir fonksiyon yazılmalı")

if __name__ == "__main__":
    main() 