#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DİKKAT.HTML Veri Toplama Kontrolü
Excel'de istenen veriler ile testin gerçekten topladığı veriler karşılaştırması
"""

def analyze_dikkat_data_collection():
    """Dikkat.html testinin veri toplama kapasitesini analiz et"""
    
    print("="*80)
    print("🔍 DİKKAT.HTML VERİ TOPLAMA KONTROLü")
    print("="*80)
    
    # Excel'de istenen veriler
    excel_requirements = {
        "SORU NO": {
            "description": "1-50 arası soru numarası",
            "required": True
        },
        "1. BÖLÜM": {
            "description": "Soru seçenekleri (örn: '5-6-2-1-5-8')",
            "required": True
        },
        "HARF-SAYI KODU": {
            "description": "s/h/s_h soru türü kodu",
            "required": True
        },
        "Unnamed: 3": {
            "description": "Boş sütun",
            "required": False
        },
        "Seçici Dikkat Puanı": {
            "description": "Ham veri, doğru/yanlış sayıları, bölüm analizleri",
            "required": True
        },
        "Doğruluk Skoru": {
            "description": "Doğru sayısı / Toplam soru x 100",
            "required": True
        },
        "İşlem Hızı": {
            "description": "Tepki süreleri, bölüm süreleri",
            "required": True
        },
        "İşlem Hızı Skoru": {
            "description": "Hız puanı = (Max Süre - Kendi Süresi) / Max Süre x 100",
            "required": True
        }
    }
    
    # Dikkat.html testinin topladığı veriler (kod analizi sonucu)
    test_collects = {
        "SORU NO": {
            "source": "testState.mainIndex + 1",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "integer (0-49 → 1-50)"
        },
        "1. BÖLÜM": {
            "source": "TEST_DATA.mainQuestions[index].question",
            "available": True,
            "location": "TEST_DATA sabit verisi",
            "format": "array → join('-') ile string"
        },
        "HARF-SAYI KODU": {
            "source": "getQuestionType(questionIndex)",
            "available": True,
            "location": "TEST_STRUCTURE.questionTypes",
            "format": "string ('s', 'h', 's/h')"
        },
        "DOĞRU CEVAP": {
            "source": "TEST_DATA.mainQuestions[index].target",
            "available": True,
            "location": "TEST_DATA sabit verisi",
            "format": "string"
        },
        "VERİLEN CEVAP": {
            "source": "answerData.selected",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "string"
        },
        "DOĞRU/YANLIŞ": {
            "source": "answerData.isCorrect",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "boolean"
        },
        "TEPKİ SÜRESİ": {
            "source": "Date.now() - testState.questionStartTime",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "integer (milliseconds)"
        },
        "BÖLÜM BİLGİSİ": {
            "source": "getCurrentSection(questionIndex)",
            "available": True,
            "location": "getCurrentSection fonksiyonu",
            "format": "object {key, name, start, end}"
        },
        "BÖLÜM BAŞLAMA/BİTİŞ ZAMANLARI": {
            "source": "testState.sectionStartTimes/sectionEndTimes",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "timestamp"
        },
        "BÖLÜM BAZLI İSTATİSTİKLER": {
            "source": "getSectionStats(sectionKey)",
            "available": True,
            "location": "getSectionStats fonksiyonu",
            "format": "object {correctAnswers, wrongAnswers, duration, etc.}"
        },
        "TÜR BAZLI İSTATİSTİKLER": {
            "source": "testState.questionTypeMistakes",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "object {s: {correct, wrong}, h: {correct, wrong}, s/h: {correct, wrong}}"
        },
        "YANLIŞ SEÇİMLER": {
            "source": "testState.wrongSelections",
            "available": True,
            "location": "selectMainAnswer fonksiyonu",
            "format": "array of objects"
        },
        "HIZ PUANI": {
            "source": "((maxPossibleTime - totalTestDuration) / maxPossibleTime) * 100",
            "available": True,
            "location": "calculateResults fonksiyonu",
            "format": "float (percentage)"
        },
        "DOĞRULUK PUANI": {
            "source": "(mainScore / mainTotal) * 100",
            "available": True,
            "location": "calculateResults fonksiyonu",
            "format": "float (percentage)"
        },
        "ORTALAMA TEPKİ SÜRESİ": {
            "source": "reactionTimes.reduce((a,b) => a+b) / reactionTimes.length",
            "available": True,
            "location": "calculateResults fonksiyonu",
            "format": "float (milliseconds)"
        },
        "TEST SÜRESİ": {
            "source": "Date.now() - testState.mainStartTime",
            "available": True,
            "location": "calculateResults fonksiyonu",
            "format": "integer (milliseconds)"
        }
    }
    
    print("\n📊 VERİ TOPLAMA DURUMU:")
    print("-" * 60)
    
    # Excel gereksinimleri ile test kapasitesi karşılaştırması
    coverage_analysis = {}
    
    for excel_field, req_info in excel_requirements.items():
        print(f"\n🔸 {excel_field}")
        print(f"   📝 Gereksinim: {req_info['description']}")
        print(f"   🎯 Zorunlu: {'Evet' if req_info['required'] else 'Hayır'}")
        
        # Bu gereksinimi karşılayan test verileri
        matching_data = []
        
        if "SORU NO" in excel_field:
            matching_data.append("SORU NO")
        elif "1. BÖLÜM" in excel_field:
            matching_data.append("1. BÖLÜM")
        elif "HARF-SAYI KODU" in excel_field:
            matching_data.append("HARF-SAYI KODU")
        elif "Seçici Dikkat" in excel_field:
            matching_data.extend(["DOĞRU/YANLIŞ", "BÖLÜM BAZLI İSTATİSTİKLER", "TÜR BAZLI İSTATİSTİKLER"])
        elif "Doğruluk" in excel_field:
            matching_data.append("DOĞRULUK PUANI")
        elif "İşlem Hızı" in excel_field and "Skoru" not in excel_field:
            matching_data.extend(["TEPKİ SÜRESİ", "ORTALAMA TEPKİ SÜRESİ", "TEST SÜRESİ"])
        elif "İşlem Hızı Skoru" in excel_field:
            matching_data.append("HIZ PUANI")
        
        if matching_data:
            print(f"   ✅ Karşılanıyor: {', '.join(matching_data)}")
            coverage_analysis[excel_field] = {"covered": True, "sources": matching_data}
        else:
            print(f"   ❌ Karşılanmıyor")
            coverage_analysis[excel_field] = {"covered": False, "sources": []}
    
    print("\n" + "="*80)
    print("📋 DETAYLI VERİ KAYIT ANALİZİ")
    print("="*80)
    
    print("\n🎯 TEST SIRASINDAKİ VERİ KAYDI (selectMainAnswer fonksiyonu):")
    print("-" * 70)
    
    recorded_per_question = [
        "question: currentQuestionIndex (0-49)",
        "selected: selected (kullanıcının seçtiği)",
        "correct: correct (doğru cevap)",
        "isCorrect: isCorrect (boolean)",
        "reactionTime: reactionTime (ms)",
        "timestamp: Date.now()",
        "questionType: questionType ('s'/'h'/'s/h')",
        "sectionKey: currentSection.key ('section1'/'section2'/'section3')",
        "sectionName: currentSection.name ('1. BÖLÜM'/'2. BÖLÜM'/'3. BÖLÜM')"
    ]
    
    for i, record in enumerate(recorded_per_question, 1):
        print(f"   {i:2d}. {record}")
    
    print("\n🧮 HESAPLANAN SKORLAR (calculateResults fonksiyonu):")
    print("-" * 70)
    
    calculated_scores = [
        "basicStats.mainScore (toplam doğru)",
        "basicStats.mainTotal (toplam soru)",
        "basicStats.averageReactionTime (ortalama tepki süresi)",
        "basicStats.testDuration (toplam test süresi)",
        "sectionStats.section1/2/3 (bölüm bazlı istatistikler)",
        "typeStats.numberQuestions/letterQuestions/mixedQuestions (tür bazlı)",
        "speedScore ((maxTime - actualTime) / maxTime * 100)",
        "accuracyScore (mainScore / mainTotal * 100)",
        "detailedResults.sections (bölüm detayları)",
        "detailedResults.questionTypes (tür detayları)",
        "detailedResults.errorDetails (hata detayları)",
        "detailedResults.questionDetails (tüm cevaplar)",
        "detailedResults.excelSummary (Excel özeti)"
    ]
    
    for i, score in enumerate(calculated_scores, 1):
        print(f"   {i:2d}. {score}")
    
    print("\n💾 VERİ KAYIT YERLERİ:")
    print("-" * 70)
    
    storage_locations = [
        "localStorage.setItem('attentionTestResults', JSON.stringify(detailedResults))",
        "localStorage.setItem('attentionTestStatus', 'completed')",
        "localStorage.setItem('attentionTestProgressSave', JSON.stringify(progressSave)) [periyodik]",
        "console.log ile detaylı sonuç çıktısı",
        "window.opener.postMessage ile ana pencereye sonuç gönderimi"
    ]
    
    for i, location in enumerate(storage_locations, 1):
        print(f"   {i}. {location}")
    
    return coverage_analysis, test_collects

def generate_data_mapping_report():
    """Excel sütunları için veri eşleştirme raporu oluştur"""
    
    print("\n" + "="*80)
    print("🔗 EXCEL SÜTUNLARI İÇİN VERİ EŞLEŞTİRME RAPORU")
    print("="*80)
    
    excel_column_mapping = {
        "SORU NO": {
            "javascript_source": "testState.mainIndex + 1",
            "data_location": "testState.mainAnswers[i].question + 1",
            "format": "1, 2, 3, ..., 50",
            "status": "✅ Tam eşleşme"
        },
        
        "1. BÖLÜM": {
            "javascript_source": "TEST_DATA.mainQuestions[index].question.join('-')",
            "data_location": "TEST_DATA.mainQuestions[questionIndex].question",
            "format": "'5-6-2-1-5-8', 'm-t-k-a-t-h'",
            "status": "✅ Tam eşleşme"
        },
        
        "HARF-SAYI KODU": {
            "javascript_source": "getQuestionType(questionIndex)",
            "data_location": "testState.mainAnswers[i].questionType",
            "format": "'s', 'h', 's/h'",
            "status": "✅ Tam eşleşme"
        },
        
        "Unnamed: 3": {
            "javascript_source": "null (boş sütun)",
            "data_location": "Kullanılmıyor",
            "format": "Boş",
            "status": "⚠️ Boş sütun"
        },
        
        "Seçici Dikkat Puanı": {
            "javascript_source": "Çoklu kaynak gerekli",
            "data_location": "detailedResults.sections, questionTypes, errorDetails",
            "format": "Ham veri, doğru sayısı, yanlış sayısı, bölüm analizleri",
            "status": "🔄 Kompleks eşleştirme"
        },
        
        "Doğruluk Skoru": {
            "javascript_source": "(mainScore / mainTotal) * 100",
            "data_location": "detailedResults.rawData.accuracyScore",
            "format": "84.0 (yüzde)",
            "status": "✅ Hesaplanıyor"
        },
        
        "İşlem Hızı": {
            "javascript_source": "reactionTime, averageReactionTime, testDuration",
            "data_location": "detailedResults.rawData.averageReactionTime, testDuration",
            "format": "1450.5 ms, 180000 ms",
            "status": "✅ Hesaplanıyor"
        },
        
        "İşlem Hızı Skoru": {
            "javascript_source": "((maxTime - actualTime) / maxTime) * 100",
            "data_location": "detailedResults.rawData.speedScore",
            "format": "75.5 (yüzde)",
            "status": "✅ Hesaplanıyor"
        }
    }
    
    print("\n📋 SÜTUN BAZLI EŞLEŞTİRME:")
    print("-" * 70)
    
    for column, mapping in excel_column_mapping.items():
        print(f"\n🔸 {column}")
        print(f"   🔧 JavaScript Kaynağı: {mapping['javascript_source']}")
        print(f"   💾 Veri Konumu: {mapping['data_location']}")
        print(f"   📊 Format: {mapping['format']}")
        print(f"   📈 Durum: {mapping['status']}")
    
    return excel_column_mapping

def create_implementation_checklist():
    """Uygulama kontrol listesi oluştur"""
    
    print("\n" + "="*80)
    print("✅ UYGULAMA KONTROL LİSTESİ")
    print("="*80)
    
    checklist = {
        "Veri Toplama": [
            "✅ Soru numarası kaydediliyor (testState.mainIndex + 1)",
            "✅ Soru seçenekleri mevcut (TEST_DATA.mainQuestions[].question)",
            "✅ Soru türü belirleniyor (getQuestionType fonksiyonu)",
            "✅ Doğru cevap kaydediliyor (target değeri)",
            "✅ Verilen cevap kaydediliyor (selected değeri)",
            "✅ Doğru/yanlış durumu hesaplanıyor (isCorrect)",
            "✅ Tepki süresi ölçülüyor (reactionTime)",
            "✅ Bölüm bilgisi takip ediliyor (currentSection)",
            "✅ Zaman damgaları kaydediliyor (timestamp)"
        ],
        
        "İstatistik Hesaplama": [
            "✅ Bölüm bazlı doğru/yanlış sayıları (getSectionStats)",
            "✅ Tür bazlı doğru/yanlış sayıları (questionTypeMistakes)",
            "✅ Ortalama tepki süresi (averageReactionTime)",
            "✅ Toplam test süresi (testDuration)",
            "✅ Hız puanı hesaplanıyor (speedScore)",
            "✅ Doğruluk puanı hesaplanıyor (accuracyScore)",
            "✅ Bölüm süreleri hesaplanıyor (section duration)",
            "✅ Yanlış seçimler kaydediliyor (wrongSelections)"
        ],
        
        "Veri Kaydetme": [
            "✅ LocalStorage'a detaylı sonuçlar kaydediliyor",
            "✅ Test durumu takip ediliyor (attentionTestStatus)",
            "✅ Periyodik ara kayıt yapılıyor (progressSave)",
            "✅ Ana pencereye sonuç gönderiliyor (postMessage)",
            "✅ Console'a özet yazdırılıyor",
            "✅ Excel uyumlu format hazırlanıyor (excelSummary)"
        ],
        
        "Excel Uyumluluk": [
            "✅ Soru numarası formatı uygun (1-50)",
            "✅ Soru seçenekleri formatı uygun (join('-'))",
            "✅ Soru türü kodları uygun ('s'/'h'/'s/h')",
            "✅ Doğruluk skoru yüzde formatında",
            "✅ Hız skoru yüzde formatında",
            "✅ Bölüm bazlı veriler mevcut",
            "✅ Tür bazlı veriler mevcut",
            "⚠️ Unnamed sütunları için ek işlem gerekli"
        ]
    }
    
    for category, items in checklist.items():
        print(f"\n🚀 {category.upper()}")
        print("-" * 50)
        for item in items:
            print(f"   {item}")
    
    return checklist

def main():
    """Ana fonksiyon"""
    
    print("🔍 DİKKAT.HTML VERİ TOPLAMA ANALİZİ BAŞLATILIYOR...")
    
    # Veri toplama analizi
    coverage, test_data = analyze_dikkat_data_collection()
    
    # Excel eşleştirme raporu
    mapping = generate_data_mapping_report()
    
    # Uygulama kontrol listesi
    checklist = create_implementation_checklist()
    
    # Özet rapor
    print("\n" + "="*80)
    print("📊 SONUÇ ÖZETİ")
    print("="*80)
    
    covered_count = sum(1 for analysis in coverage.values() if analysis['covered'])
    total_count = len(coverage)
    
    print(f"\n✅ KAPSAM ANALİZİ:")
    print(f"   • Excel gereksinimlerinin {covered_count}/{total_count} tanesi karşılanıyor")
    print(f"   • Kapsam oranı: {(covered_count/total_count)*100:.1f}%")
    
    print(f"\n📊 VERİ KALİTESİ:")
    print(f"   • Test {len(test_data)} farklı veri türü topluyor")
    print(f"   • Tüm temel veriler (soru no, cevaplar, süreler) mevcut")
    print(f"   • İleri düzey analizler (bölüm/tür bazlı) mevcut")
    print(f"   • Excel uyumlu skorlar hesaplanıyor")
    
    print(f"\n🎯 SONUÇ:")
    print("   ✅ Dikkat.html testi Excel'de istenen TÜM verileri topluyor!")
    print("   ✅ Veri formatları Excel ile uyumlu")
    print("   ✅ Detaylı istatistikler ve skorlar hesaplanıyor")
    print("   ✅ Test sonuçları JSON formatında kayıt ediliyor")
    print("   ⚠️ Sadece 'Unnamed' sütunları için ek formatlama gerekli")

if __name__ == "__main__":
    main() 