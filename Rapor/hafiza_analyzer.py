import pandas as pd
import numpy as np

def analyze_hafiza_sheet():
    print("🔍 HAFIZA SEKMESİ DETAYLI ANALİZ")
    print("=" * 50)
    
    try:
        # Excel dosyasını oku
        file_path = 'FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx'
        
        # HAFIZA sekmesini oku
        df = pd.read_excel(file_path, sheet_name='HAFIZA')
        
        print(f"📊 Toplam satır sayısı: {len(df)}")
        print(f"📊 Toplam sütun sayısı: {len(df.columns)}")
        print()
        
        print("📋 SÜTUN LİSTESİ:")
        print("-" * 30)
        for i, col in enumerate(df.columns, 1):
            print(f"{i:2d}. {col}")
        print()
        
        print("📝 SÜTUN DETAYLI ANALİZ:")
        print("-" * 40)
        for i, col in enumerate(df.columns, 1):
            # İlk birkaç boş olmayan değeri göster
            non_null_values = df[col].dropna()
            if len(non_null_values) > 0:
                sample_values = non_null_values.head(3).tolist()
                print(f"{i:2d}. {col}")
                print(f"    🔸 Boş olmayan değer sayısı: {len(non_null_values)}")
                print(f"    🔸 Örnek değerler: {sample_values}")
                
                # Veri tipi kontrolü
                if non_null_values.dtype == 'object':
                    unique_count = len(non_null_values.unique())
                    print(f"    🔸 Benzersiz değer sayısı: {unique_count}")
                else:
                    print(f"    🔸 Veri tipi: {non_null_values.dtype}")
                print()
            else:
                print(f"{i:2d}. {col}")
                print(f"    ❌ Tamamen boş sütun")
                print()
        
        print("🎯 VERİ GEREKSİNİMLERİ ÖZET:")
        print("-" * 35)
        
        # Önemli sütunları tespit et
        important_columns = []
        for col in df.columns:
            non_null_count = df[col].dropna().shape[0]
            if non_null_count > 0:
                important_columns.append({
                    'column': col,
                    'non_null_count': non_null_count,
                    'sample_values': df[col].dropna().head(3).tolist()
                })
        
        print(f"✅ Dolu sütun sayısı: {len(important_columns)}")
        print(f"❌ Boş sütun sayısı: {len(df.columns) - len(important_columns)}")
        
        return important_columns, df
        
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        return None, None

if __name__ == "__main__":
    analyze_hafiza_sheet() 