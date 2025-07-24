#!/usr/bin/env python3
import os
import shutil
import re

def rename_pattern_files(base_path):
    """
    ÖRÜNTÜLER klasöründeki dosyaları standart formata getir:
    - SORU_*.png -> soru.png
    - soru_*.png -> soru.png  
    - N_*.png -> N.png (N=1,2,3,4,5)
    - N-DOĞRU_*.png -> N.png (doğru cevap bilgisini ayrıca kaydet)
    """
    
    correct_answers = {}
    renamed_count = 0
    
    for root, dirs, files in os.walk(base_path):
        if not files:
            continue
            
        # Klasör yolunu al
        relative_path = os.path.relpath(root, base_path)
        
        # PNG dosyalarını işle
        png_files = [f for f in files if f.lower().endswith('.png')]
        
        for filename in png_files:
            old_path = os.path.join(root, filename)
            new_name = None
            
            # SORU dosyaları
            if filename.upper().startswith('SORU'):
                new_name = 'soru.png'
                
            # Sayı ile başlayan dosyalar (1-5)
            elif filename[0].isdigit():
                number = filename[0]
                
                # Doğru cevap kontrolü
                if 'DOĞRU' in filename.upper() or 'doğru' in filename:
                    # Doğru cevabı kaydet
                    correct_answers[relative_path] = int(number) - 1  # 0-indexed
                    
                new_name = f'{number}.png'
            
            # Dosyayı yeniden adlandır
            if new_name and new_name != filename:
                new_path = os.path.join(root, new_name)
                
                # Eğer hedef dosya zaten varsa, üzerine yaz
                if os.path.exists(new_path):
                    os.remove(new_path)
                    
                os.rename(old_path, new_path)
                print(f"Yeniden adlandırıldı: {filename} -> {new_name} ({relative_path})")
                renamed_count += 1
    
    # Doğru cevapları yazdır
    print(f"\n\nToplam {renamed_count} dosya yeniden adlandırıldı.")
    print("\nDoğru cevaplar:")
    for path, answer in sorted(correct_answers.items()):
        print(f"  {path}: {answer + 1}. seçenek (index: {answer})")
    
    return correct_answers

def create_answers_js(correct_answers):
    """Doğru cevapları JavaScript dosyası olarak kaydet"""
    
    js_content = "// Otomatik oluşturulmuş doğru cevaplar\nconst correctAnswersMap = {\n"
    
    for path, answer in sorted(correct_answers.items()):
        # Yolu JavaScript için uygun hale getir
        js_path = path.replace('\\', '/')
        js_content += f"    '{js_path}': {answer},\n"
    
    js_content += "};\n"
    
    with open('correct_answers.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\nDoğru cevaplar 'correct_answers.js' dosyasına kaydedildi.")

if __name__ == "__main__":
    # ÖRÜNTÜLER klasörünü bul
    oruntüler_path = "./ÖRÜNTÜLER "
    
    if os.path.exists(oruntüler_path):
        print(f"'{oruntüler_path}' klasörü işleniyor...\n")
        correct_answers = rename_pattern_files(oruntüler_path)
        
        # Doğru cevapları JavaScript dosyası olarak kaydet
        if correct_answers:
            create_answers_js(correct_answers)
    else:
        print(f"HATA: '{oruntüler_path}' klasörü bulunamadı!")
        print("Lütfen scripti doğru dizinde çalıştırdığınızdan emin olun.") 