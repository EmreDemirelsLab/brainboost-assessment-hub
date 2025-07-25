import pandas as pd
import numpy as np

def analyze_puzzle_excel():
    """
    GÖRSEL İŞLEME sekmesini detaylı analiz et
    """
    print("🧩 PUZZLE EXCEL ANALİZİ BAŞLADI")
    print("=" * 60)
    
    try:
        # Excel dosyasını oku
        file_path = "FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx"
        
        # GÖRSEL İŞLEME sekmesini oku
        df = pd.read_excel(file_path, sheet_name='GÖRSEL İŞLEME', header=None)
        
        print(f"📊 Excel boyutu: {df.shape}")
        print(f"📋 Sütunlar: {list(df.columns)}")
        
        # İlk 15 satırı detaylı incele
        print("\n📄 İLK 15 SATIR DETAYLI ANALİZ:")
        print("-" * 50)
        
        for i in range(min(15, len(df))):
            row = df.iloc[i]
            print(f"\nSATIR {i}:")
            for j, value in enumerate(row):
                if pd.notna(value) and str(value).strip():
                    print(f"  Sütun {j}: '{value}'")
        
        # Dolu hücreleri analiz et
        print("\n🔍 DOLU HÜCRELER ANALİZİ:")
        print("-" * 50)
        
        for col in df.columns:
            non_empty = df[col].dropna()
            non_empty = non_empty[non_empty.astype(str).str.strip() != '']
            if len(non_empty) > 0:
                print(f"\nSütun {col}: {len(non_empty)} dolu hücre")
                unique_values = non_empty.unique()[:10]  # İlk 10 unique değer
                for val in unique_values:
                    print(f"  - '{val}'")
        
        # Test türlerini belirle
        print("\n🎯 TEST TÜRLERİ ANALİZİ:")
        print("-" * 50)
        
        # Kodlanacak sütununu bul (test isimleri)
        test_names = []
        for col in df.columns:
            values = df[col].dropna()
            for val in values:
                val_str = str(val).lower()
                if any(word in val_str for word in ['parça', 'puzzle', 'dörtparça', 'altıparça', 'dokuzparça', 'onaltıparça']):
                    test_names.append(val)
        
        print(f"Bulunan test isimleri: {len(test_names)}")
        for i, name in enumerate(test_names, 1):
            print(f"  {i}. {name}")
        
        # Veri kategorilerini analiz et
        print("\n📈 VERİ KATEGORİLERİ:")
        print("-" * 50)
        
        data_categories = []
        for col in df.columns:
            values = df[col].dropna()
            for val in values:
                val_str = str(val).lower()
                if any(word in val_str for word in ['doğru', 'yanlış', 'süre', 'hız', 'skor', 'tepki']):
                    if val not in data_categories:
                        data_categories.append(val)
        
        for i, category in enumerate(data_categories, 1):
            print(f"  {i}. {category}")
        
        # Parça sayılarını analiz et
        print("\n🔢 PARÇA SAYILARI ANALİZİ:")
        print("-" * 50)
        
        piece_counts = {}
        for col in df.columns:
            values = df[col].dropna()
            for val in values:
                val_str = str(val)
                if 'parça üzerinden' in val_str:
                    print(f"  - {val}")
                    # Sayıyı çıkar
                    import re
                    numbers = re.findall(r'(\d+)\s*parça', val_str)
                    if numbers:
                        piece_counts[val] = int(numbers[0])
        
        print(f"\nBulunan parça sayıları: {piece_counts}")
        
        # Toplam parça hesapla
        total_pieces = sum(piece_counts.values())
        print(f"Toplam parça sayısı: {total_pieces}")
        
        # Formül tiplerini analiz et
        print("\n📐 FORMÜL TİPLERİ:")
        print("-" * 50)
        
        formulas = []
        for col in df.columns:
            values = df[col].dropna()
            for val in values:
                val_str = str(val)
                if any(symbol in val_str for symbol in ['/', 'x', '%', '100', '+']):
                    if len(val_str) > 10:  # Uzun formüller
                        formulas.append(val_str)
        
        for i, formula in enumerate(set(formulas), 1):
            print(f"  {i}. {formula}")
        
        return {
            'shape': df.shape,
            'test_names': test_names,
            'data_categories': data_categories,
            'piece_counts': piece_counts,
            'total_pieces': total_pieces,
            'formulas': list(set(formulas))
        }
        
    except Exception as e:
        print(f"❌ HATA: {e}")
        return None

if __name__ == "__main__":
    result = analyze_puzzle_excel()
    if result:
        print("\n✅ ANALİZ TAMAMLANDI")
        print(f"Test sayısı: {len(result['test_names'])}")
        print(f"Toplam parça: {result['total_pieces']}")
    else:
        print("❌ ANALİZ BAŞARISIZ") 