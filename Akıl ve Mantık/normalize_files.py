#!/usr/bin/env python3
import os
import shutil

def normalize_files(base_path):
    """DOGRU etiketli dosyaları normal dosya haline getir"""
    
    normalized_count = 0
    
    for root, dirs, files in os.walk(base_path):
        # DOGRU etiketli dosyaları bul
        dogru_files = [f for f in files if '-DOGRU.png' in f]
        
        for dogru_file in dogru_files:
            # Sayıyı çıkar (örn: "2-DOGRU.png" -> "2")
            number = dogru_file.split('-DOGRU.png')[0]
            normal_file = f"{number}.png"
            
            dogru_path = os.path.join(root, dogru_file)
            normal_path = os.path.join(root, normal_file)
            
            # Normal dosya yoksa, DOGRU dosyasını kopyala
            if not os.path.exists(normal_path):
                shutil.copy2(dogru_path, normal_path)
                print(f"Oluşturuldu: {normal_file} <- {dogru_file} ({os.path.relpath(root, base_path)})")
                normalized_count += 1
    
    print(f"\nToplam {normalized_count} dosya normalize edildi.")
    print("\nArtık tüm seçenekler normal dosya olarak mevcut.")
    print("DOGRU etiketleri sadece sistemin doğru cevabı bilmesi için kullanılacak.")

if __name__ == "__main__":
    oruntüler_path = "./ÖRÜNTÜLER "
    
    if os.path.exists(oruntüler_path):
        print("Dosyaları normalize ediyorum...\n")
        normalize_files(oruntüler_path)
    else:
        print(f"HATA: '{oruntüler_path}' klasörü bulunamadı!") 