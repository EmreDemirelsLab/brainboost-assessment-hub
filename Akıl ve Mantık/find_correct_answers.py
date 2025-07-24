#!/usr/bin/env python3
import os
import json

def find_correct_answers(base_path):
    """ÖRÜNTÜLER klasöründeki doğru cevapları bul"""
    
    correct_answers = {}
    
    # Önceki rename işleminden kalan bilgileri topla
    # DOĞRU etiketli dosyalar artık normal isimde ama hangi sayı olduğunu bulmalıyız
    
    # Manuel olarak bildiğimiz doğru cevaplar (rename scriptinden)
    known_correct = {
        # Örnek Uygulamalar
        '1-ÖRNEK UYGULAMA/ÖRNEK UYGULAMA-1': 2,  # 3-DOĞRU
        '1-ÖRNEK UYGULAMA/ÖRNEK UYGULAMA-2': 3,  # 4-DOĞRU
        '1-ÖRNEK UYGULAMA/ÖRNEK UYGULAMA-3': 1,  # 2-DOĞRU
        '1-ÖRNEK UYGULAMA/ÖRNEK UYGULAMA-4': 1,  # 2-DOĞRU
        
        # Dörtlü Yatay
        '2-DÖRTLÜ YATAY/1': 1,  # 2-DOĞRU
        '2-DÖRTLÜ YATAY/2': 4,  # 5-DOĞRU
        '2-DÖRTLÜ YATAY/3': 3,  # 4-DOĞRU
        '2-DÖRTLÜ YATAY/4': 4,  # 5-doğru
        '2-DÖRTLÜ YATAY/5': 3,  # 4-DOĞRU
        '2-DÖRTLÜ YATAY/6': 1,  # 2-DOĞRU
        
        # Dörtlü Kare Format
        '3-DÖRTLÜ KARE FORMAT/1': 3,  # 4-DOĞRU
        '3-DÖRTLÜ KARE FORMAT/2': 2,  # 3-DOĞRU
        '3-DÖRTLÜ KARE FORMAT/3': 3,  # 4-DOĞRU
        '3-DÖRTLÜ KARE FORMAT/4': 1,  # 2-DOĞRU
        '3-DÖRTLÜ KARE FORMAT/5': 2,  # 3-DOĞRU
        '3-DÖRTLÜ KARE FORMAT/6': 3,  # 4-DOĞRU
    }
    
    # Yolları düzelt ve yazdır
    print("Doğru Cevaplar:\n")
    for path, answer in known_correct.items():
        full_path = os.path.join('ÖRÜNTÜLER ', path)
        if os.path.exists(full_path):
            print(f"{path}: {answer + 1}. seçenek (index: {answer})")
            
            # Doğru dosyayı işaretle
            correct_file = os.path.join(full_path, f"{answer + 1}.png")
            marked_file = os.path.join(full_path, f"{answer + 1}-DOGRU.png")
            
            if os.path.exists(correct_file) and not os.path.exists(marked_file):
                os.rename(correct_file, marked_file)
                print(f"  ✓ {answer + 1}.png -> {answer + 1}-DOGRU.png")
    
    return known_correct

def update_html_correct_answers():
    """HTML dosyasındaki doğru cevapları güncelle"""
    
    updates = [
        # Örnek Uygulamalar
        ('correctAnswer: 2 // 3-DOĞRU', 'correctAnswer: 2 // 3-DOĞRU'),  # Değişmez
        ('correctAnswer: 3 // 4-DOĞRU', 'correctAnswer: 3 // 4-DOĞRU'),  # Değişmez
        ('correctAnswer: 1 // 2-DOĞRU', 'correctAnswer: 1 // 2-DOĞRU'),  # Değişmez
        
        # Ana test - Dörtlü Yatay
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/1\', correctAnswer: 1, section: 1 },', 
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/1\', correctAnswer: 1, section: 1 }, // 2-DOĞRU'),
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/2\', correctAnswer: 4, section: 1 },',
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/2\', correctAnswer: 4, section: 1 }, // 5-DOĞRU'),
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/3\', correctAnswer: 3, section: 1 },',
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/3\', correctAnswer: 3, section: 1 }, // 4-DOĞRU'),
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/4\', correctAnswer: 4, section: 1 },',
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/4\', correctAnswer: 4, section: 1 }, // 5-DOĞRU'),
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/5\', correctAnswer: 3, section: 1 },',
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/5\', correctAnswer: 3, section: 1 }, // 4-DOĞRU'),
        ('{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/6\', correctAnswer: 1, section: 1 },',
         '{ folder: \'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/6\', correctAnswer: 1, section: 1 }, // 2-DOĞRU'),
    ]
    
    print("\n\nHTML'deki doğru cevap güncellemeleri:")
    for old, new in updates:
        print(f"  {old} -> {new}")

if __name__ == "__main__":
    print("Doğru cevapları işaretliyorum...\n")
    
    # Doğru cevapları bul ve dosyaları işaretle
    correct_answers = find_correct_answers(".")
    
    # HTML güncelleme önerilerini göster
    update_html_correct_answers()
    
    print("\n\nİşlem tamamlandı!") 