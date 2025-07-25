import pandas as pd
import numpy as np

def analyze_hafiza_detailed():
    print("🔍 HAFIZA SEKMESİ DETAYLI VERİ GEREKSİNİMLERİ ANALİZİ")
    print("=" * 60)
    
    try:
        # Excel dosyasını oku
        file_path = 'FORTEST-RAPORLAMA-VERİ TABANI-09.07.25-V3.xlsx'
        df = pd.read_excel(file_path, sheet_name='HAFIZA')
        
        print("📊 HAM VERİLER:")
        print("-" * 40)
        
        # Tüm verileri göster
        for index, row in df.iterrows():
            print(f"Satır {index + 1}:")
            for col in df.columns:
                value = row[col]
                if pd.notna(value):
                    print(f"  {col}: {value}")
            print()
            
            # İlk 15 satırı göster, sonra önemli olanları
            if index > 15 and index % 5 != 0:
                continue
                
        print("\n" + "="*60)
        print("🎯 VERİ REQSİNİMLERİ DETAYLI ANALİZ:")
        print("="*60)
        
        # Önemli satırları analiz et
        requirements = []
        
        for index, row in df.iterrows():
            soru_no = row['SORU NO'] if pd.notna(row['SORU NO']) else None
            set_info = row['1. SET'] if pd.notna(row['1. SET']) else None
            beceri_turu = row['BECERİ TÜRÜ'] if pd.notna(row['BECERİ TÜRÜ']) else None
            
            # 5. sütun - Ham Veri açıklamaları
            col5 = row.iloc[4] if pd.notna(row.iloc[4]) else None
            # 6. sütun - Doğruluk Skoru
            col6 = row.iloc[5] if pd.notna(row.iloc[5]) else None
            # 7. sütun - İşlem Hızı
            col7 = row.iloc[6] if pd.notna(row.iloc[6]) else None
            # 8. sütun - İşlem Hızı Skoru
            col8 = row.iloc[7] if pd.notna(row.iloc[7]) else None
            
            if any([soru_no, set_info, beceri_turu, col5, col6, col7, col8]):
                requirements.append({
                    'row': index + 1,
                    'soru_no': soru_no,
                    'set_info': set_info,
                    'beceri_turu': beceri_turu,
                    'ham_veri': col5,
                    'dogruluk_skoru': col6,
                    'islem_hizi': col7,
                    'islem_hizi_skoru': col8
                })
        
        # Önemli gereksinimleri kategorize et
        print("📋 TESPİT EDİLEN VERİ GEREKSİNİMLERİ:")
        print("-" * 50)
        
        # Ham veri gereksinimleri
        ham_veri_reqs = []
        dogruluk_reqs = []
        hiz_reqs = []
        
        for req in requirements:
            if req['ham_veri'] and 'doğru sayısı' in str(req['ham_veri']).lower():
                ham_veri_reqs.append(req)
            elif req['dogruluk_skoru'] and 'doğru sayısı' in str(req['dogruluk_skoru']).lower():
                dogruluk_reqs.append(req)
            elif req['islem_hizi'] and ('saniye' in str(req['islem_hizi']).lower() or 'süre' in str(req['islem_hizi']).lower()):
                hiz_reqs.append(req)
        
        print(f"🎯 HAM VERİ GEREKSİNİMLERİ ({len(ham_veri_reqs)} adet):")
        for req in ham_veri_reqs:
            print(f"  • Satır {req['row']}: {req['ham_veri']}")
            if req['soru_no']: print(f"    ↳ Soru No: {req['soru_no']}")
            if req['beceri_turu']: print(f"    ↳ Beceri: {req['beceri_turu']}")
        
        print(f"\n📊 DOĞRULUK SKORU GEREKSİNİMLERİ ({len(dogruluk_reqs)} adet):")
        for req in dogruluk_reqs:
            print(f"  • Satır {req['row']}: {req['dogruluk_skoru']}")
        
        print(f"\n⚡ İŞLEM HIZI GEREKSİNİMLERİ ({len(hiz_reqs)} adet):")
        for req in hiz_reqs:
            print(f"  • Satır {req['row']}: {req['islem_hizi']}")
        
        return requirements
        
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        return None

if __name__ == "__main__":
    analyze_hafiza_detailed() 