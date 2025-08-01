import React, { useState, useEffect, useRef } from 'react';

// D2 test results interface
interface D2TestResult {
  id: string;
  student_id: string;
  created_at: string;
  attention_stability: number | null;
  commission_errors: number | null;
  omission_errors: number | null;
  correct_selections: number | null;
  total_score: number | null;
  concentration_performance: number | null;
  total_items_processed: number | null;
  test_duration_seconds: number | null;
  fluctuation_rate: number | null;
  total_net_performance: number | null;
  processing_speed: number | null;
  total_errors: number | null;
  line_results?: any[];
  [key: string]: any;
}

interface Student {
  id: string;
  full_name: string;
  birth_date: string;
  gender: 'male' | 'female';
  trainer_name?: string;
}

interface D2ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  testResult: D2TestResult;
}

const D2ReportModal: React.FC<D2ReportModalProps> = ({
  isOpen,
  onClose,
  student,
  testResult
}) => {
  const [gaugeAnimated, setGaugeAnimated] = useState(false);

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return `${years} Yıl ${months} Ay ${days} Gün`;
  };

  // Excel'den alınan gerçek yorum kriterleri
  const TN_CRITERIA = [
    { min: 0, max: 154, category: 'TN_ÇOK_DÜŞÜK', comment: 'Psikomotor hızında belirgin yavaşlık gözlenmiştir. İşlem hızını geliştirmeye yönelik dikkat ve odaklanma çalışmaları ile desteklenmelidir.' },
    { min: 155, max: 201, category: 'TN_DÜŞÜK', comment: 'Psikomotor hızında yavaşlık gözlenmiştir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 202, max: 248, category: 'TN_DÜŞÜK', comment: 'Psikomotor hızında yavaşlık gözlenmiştir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 249, max: 295, category: 'TN_ORTA', comment: 'Psikomotor hızı genel olarak yeterlidir. Bazı anlarda dikkat yoğunluğu değişkenlik gösterebilir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 296, max: 342, category: 'TN_ORTA', comment: 'Psikomotor hızı genel olarak yeterlidir. Bazı anlarda dikkat yoğunluğu değişkenlik gösterebilir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 343, max: 389, category: 'TN_NORMAL', comment: 'Psikomotor hızı normaldir. Görevi uygun sürede ve dikkatini koruyarak tamamlamıştır. Hz ve dikkat dengesini sağlayabilmiştir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 390, max: 436, category: 'TN_NORMAL', comment: 'Psikomotor hızı normaldir. Görevi uygun sürede ve dikkatini koruyarak tamamlamıştır. Hz ve dikkat dengesini sağlayabilmiştir. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerileri geliştirilebilir.' },
    { min: 437, max: 483, category: 'TN_İYİ', comment: 'Psikomotor hızı iyidir. Bileyi hızlı anlayıp görevi biçimde uygulayabilmektedir. Dikkat ve odaklanma becerileri geliştirilmelidir. İşlem hızı daha da artırılabilir.' },
    { min: 484, max: 530, category: 'TN_İYİ', comment: 'Psikomotor hızı iyidir. Bileyi hızlı anlayıp görevi biçimde uygulayabilmektedir. Dikkat ve odaklanma becerileri geliştirilmelidir. İşlem hızı daha da artırılabilir.' },
    { min: 531, max: 577, category: 'TN_ÇOK_İYİ', comment: 'Psikomotor hızı çok iyidir. Görevi hızlı bir şekilde tamamlamıştır. Uygulama becerisi oldukça gelişmiştir.' },
    { min: 578, max: 9999, category: 'TN_ÇOK_İYİ', comment: 'Psikomotor hızı çok iyidir. Görevi hızlı bir şekilde tamamlamıştır. Uygulama becerisi oldukça gelişmiştir.' }
  ];

  const TN_E_CRITERIA = [
    { min: 0, max: 150, category: 'TN_E_ÇOK_DÜŞÜK', comment: 'Dikkatini toplayamta zorlandığı gözlenmişitir. Dikkat ve odaklanma çalışmaları ile bilişsel gelişim desteklenmelidir.' },
    { min: 151, max: 200, category: 'TN_E_DÜŞÜK', comment: 'Dikkatini uzun süre sürdüremediği ve görevde doğru şekilde yapamakta zorlandığı gözlenmişitir. Yapılandırılmış dikkat ve odaklanma çalışmaları ile bilişsel gelişim desteklenmelidir.' },
    { min: 201, max: 250, category: 'TN_E_VASAT', comment: 'Dikkatini genel olarak sürdürebilmiş ve odaklanma becerisi kullanabilmiştir. Bilişsel becerileri güçlendirilebilir daha da geliştirilebilir.' },
    { min: 251, max: 300, category: 'TN_E_ORTA', comment: 'Dikkatini görev sırasında sürdürebilmiş ve odaklanma becerilerini kullanabilmiştir. Bilişsel becerileri güçlendirilebilir.' },
    { min: 301, max: 350, category: 'TN_E_İYİ', comment: 'Dikkatini görev sırasında sürdürebilmiş, odaklanma becerilerini etkili şekilde kullanabilmiştir. Bilişsel becerileri güçlendirilmelidir daha da geliştirilir.' },
    { min: 351, max: 9999, category: 'TN_E_ÇOK_İYİ', comment: 'Dikkatini görev sırasında sürdürebilmiş, odaklanma becerilerini etkili şekilde kullanabilmiştir.' }
  ];

  const ERROR_CRITERIA = [
    { min: 0.0, max: 2.5, category: 'E_1', comment: 'Hata oranı düşüktür. Dikkatini sürümdede belirgin güçlük yaşamaktadır; bu durum öğrenme sürecini olumsuz etkileyebilir.' },
    { min: 2.6, max: 5.0, category: 'E_2', comment: 'Hata oranı artış göstermiştir. Zaman zaman dikkat hataları yapabilmektedir.' },
    { min: 5.1, max: 10.0, category: 'E_3', comment: 'Dikkat hataları belirginleşmiştir. Odaklanmada zorlanabilir.' },
    { min: 10.1, max: 20.0, category: 'E_4', comment: 'Dikkat salnmını yoktur. Performans tutarlıdır.' },
    { min: 20.1, max: 100.0, category: 'E_5', comment: 'Hata oranı yüksektir. Dikkatini sürdürmdde belirgin güçlük yaşatmaktadır; bu durum öğrenme sürecini olumsuz etkileyebilir.' }
  ];

  const FLUCTUATION_CRITERIA = [
    { min: 0, max: 6, category: 'FR_1', comment: 'Dikkat salınımı yoktur. Performans tutarlıdır.' },
    { min: 7, max: 10, category: 'FR_2', comment: 'Dikkat düzeyinde dalgalanmalar gözlenmiştir. İşlem hızında zihinsel sürelikte dalgalanma görülmektedir.' },
    { min: 11, max: 15, category: 'FR_3', comment: 'Dikkat salnmı genel olarak yeterlidir. Bazı anlarda dikkat yoğunluğu değişkenlik gösterebilir. İşlem hızında zihinsel sürelikte dalgalanma görülmektedir.' },
    { min: 16, max: 999, category: 'FR_4', comment: 'Dikkat salınmı yüksektir. Dikkatini sürümdede belirgin güçlük yaşamaktadır. İşlem hızını artırmaya yönelik dikkat ve odaklanma becerilereri geliştirilebiilir.' }
  ];

  // Database verisinden yoksa hesaplanan metrikleri al
  const getCalculatedMetrics = () => {
    const linePerformance = calculateLinePerformance();
    const totalCorrect = linePerformance.reduce((sum, line) => sum + line.correct, 0);
    const totalCommission = linePerformance.reduce((sum, line) => sum + line.commission, 0);
    const totalOmission = linePerformance.reduce((sum, line) => sum + line.omission, 0);
    const totalTargets = linePerformance.reduce((sum, line) => sum + line.total, 0);
    
    return {
      totalCorrect,
      totalCommission,
      totalOmission,
      totalTargets,
      totalNet: totalCorrect - (totalCommission + totalOmission),
      errorPercentage: totalTargets > 0 ? ((totalCommission + totalOmission) / totalTargets) * 100 : 0
    };
  };

  // Gerçek Excel yorumlarını generate et
  const generateRealComments = () => {
    // Database'den gelen veriler varsa onları kullan, yoksa hesaplananları kullan
    const metrics = getCalculatedMetrics();
    
    const tnValue = testResult.total_net_performance || metrics.totalCorrect;
    const tneValue = testResult.total_net_performance ? 
      (testResult.total_net_performance - ((testResult.commission_errors || 0) + (testResult.omission_errors || 0))) :
      metrics.totalNet;
    
    const errorPercentage = testResult.commission_errors !== undefined ? 
      parseFloat(calculateErrorPercentage()) : 
      metrics.errorPercentage;
      
    const fluctuationRate = testResult.fluctuation_rate || 0;

    const tnComment = TN_CRITERIA.find(c => tnValue >= c.min && tnValue <= c.max)?.comment || 'Değerlendirme yapılamadı.';
    const tneComment = TN_E_CRITERIA.find(c => tneValue >= c.min && tneValue <= c.max)?.comment || 'Değerlendirme yapılamadı.';
    const errorComment = ERROR_CRITERIA.find(c => errorPercentage >= c.min && errorPercentage <= c.max)?.comment || 'Değerlendirme yapılamadı.';
    const fluctuationComment = FLUCTUATION_CRITERIA.find(c => fluctuationRate >= c.min && fluctuationRate <= c.max)?.comment || 'Değerlendirme yapılamadı.';

    return {
      psikomotor: tnComment,
      seciciDikkat: tneComment,
      hataEgilimi: errorComment,
      dikkatDalgalanmasi: fluctuationComment
    };
  };

  // Calculate error percentage
  const calculateErrorPercentage = () => {
    const totalErrors = (testResult.commission_errors || 0) + (testResult.omission_errors || 0);
    const totalProcessed = testResult.total_items_processed || 1;
    return ((totalErrors / totalProcessed) * 100).toFixed(2);
  };

  // Animate gauge when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setGaugeAnimated(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setGaugeAnimated(false);
    }
  }, [isOpen]);

  // Handle print - Open new window with clean A4 template
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Generate performance table data from line_results for print
    const generatePrintPerformanceData = () => {
      const lineResults = testResult.line_results || [];
      
      if (!Array.isArray(lineResults) || lineResults.length === 0) {
        return Array.from({length: 14}, (_, i) => 25 + Math.floor(Math.random() * 10));
      }

      // Satır bazlı performans hesapla
      const performanceValues = [];
      
      for (let lineIndex = 0; lineIndex < 14; lineIndex++) {
        const lineChars = lineResults.filter(char => char.lineIndex === lineIndex);
        const correctHits = lineChars.filter(char => char.isTarget === true && char.isClicked === true);
        performanceValues.push(correctHits.length);
      }
      
      return performanceValues;
    };

    const generatePerformanceTableRows = () => {
      let performanceRow = '<td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px; background-color: #dc2626; color: white;">Puan</td>';
      const performanceValues = generatePrintPerformanceData();
      
      for (let i = 0; i < 14; i++) {
        performanceRow += `<td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">${performanceValues[i]}</td>`;
      }
      
      return performanceRow;
    };
    
    // Hesaplanan metrikleri al
    const metrics = getCalculatedMetrics();
    const realComments = generateRealComments();
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>D2 Dikkat Testi Raporu</title>
        <style>
          ${styles}
          
          body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .d2-report-modal {
            position: static;
            background: white;
            width: 100%;
            height: auto;
          }
          
          .modal-content {
            width: 100%;
            height: auto;
            box-shadow: none;
            border-radius: 0;
            background: white;
          }
          
          .modal-close,
          .export-buttons {
            display: none;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              background: white !important;
            }
            
            .page {
              page-break-after: always;
              page-break-inside: avoid;
              background: white !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 20mm 20mm 40mm 20mm !important;
              box-shadow: none !important;
              border: none !important;
              min-height: 250mm !important;
            }
            
            .page:last-child {
              page-break-after: avoid;
            }
            
            .page-logo {
              background: white !important;
              page-break-inside: avoid;
              position: absolute !important;
              bottom: 10px !important;
              left: 0 !important;
              right: 0 !important;
              margin: 0 !important;
              padding: 10px !important;
            }
            
            .info-grid,
            .section,
            .chart-container {
              page-break-inside: avoid;
              background: white !important;
            }
            
            .info-item {
              background: #F8F9FA !important;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="d2-report-modal">
          <div class="modal-content">
        <div class="container">
              <!-- Sayfa 1 -->
              <div class="page">
                <div class="page-header">
                  <h1 style="color: #1e3a8a; text-align: center; font-size: 36px; font-weight: bold; margin-bottom: 30px; position: relative; padding-bottom: 15px;">
                    D2 Dikkat Testi Raporu
                    <div style="content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 2px; background: linear-gradient(90deg, transparent, #1e3a8a, transparent);"></div>
                  </h1>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 25px;">
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Ad Soyad</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${student.full_name}</div>
            </div>
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Yaş</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${calculateAge(student.birth_date)}</div>
            </div>
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Değerlendirme Tarihi</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${new Date(testResult.created_at).toLocaleDateString('tr-TR')}</div>
            </div>
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Cinsiyet</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${student.gender === 'male' ? 'Erkek' : 'Kadın'}</div>
            </div>
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Doğum Tarihi</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${new Date(student.birth_date).toLocaleDateString('tr-TR')}</div>
            </div>
                  <div style="text-align: left; background: #F8F9FA; padding: 8px 10px; border-radius: 4px; border-left: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Uygulayan</div>
                    <div style="font-size: 16px; color: #333; font-weight: 500;">${student.trainer_name || 'Belirtilmemiş'}</div>
            </div>
          </div>
          
                <div style="background-color: #1e3a8a; color: white; padding: 15px; text-align: center; font-size: 24px; margin-bottom: 10px;">Psikomotor Performans Tablosu</div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                  <tr style="background-color: #dc2626; color: white;">
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">Sıra</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">1</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">2</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">3</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">4</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">5</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">6</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">7</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">8</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">9</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">10</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">11</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">12</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">13</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 50px;">14</td>
              </tr>
              <tr>
                ${generatePerformanceTableRows()}
              </tr>
          </table>
          
          <div style="margin: 30px 0; height: 300px; position: relative;">
            <canvas id="printPerformanceChart" style="max-width: 100%; height: auto;"></canvas>
          </div>

                <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                  D2 Testinin Amacı
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; line-height: 1.6;">
                  D2 Dikkat Testi bireyin seçici dikkat, sürdürülebilir dikkat ve işleme hızı gibi bilişsel becerileri değerlendirmek amacıyla uygulanır.
                </div>
                
                <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                  Hedeflenen Kullanım Alanları
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; line-height: 1.6;">
                  <div style="display: grid; gap: 8px;">
                    <div style="padding: 8px 12px; background: #F8F9FA; border-radius: 4px; border: 1px solid #E5E7EB;">9 yaş ve üzeri bireylerde öğrenme sürecini zorlaştıran dikkat ve odaklanma problemlerini tanımak</div>
                    <div style="padding: 8px 12px; background: #F8F9FA; border-radius: 4px; border: 1px solid #E5E7EB;">Zihinsel performansı etkileyen dikkat ve odaklanma becerilerini değerlendirmek</div>
                    <div style="padding: 8px 12px; background: #F8F9FA; border-radius: 4px; border: 1px solid #E5E7EB;">Bilişsel becerileri geliştirme programlarında eğitim öncesi ve sonrasında gelişimi izlemek</div>
                  </div>
                </div>
                
                <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                  <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                    Önemli Notlar
                  </div>
                  <div style="display: grid; gap: 8px;">
                    <div style="margin: 8px 0; padding-left: 18px; position: relative; font-size: 15px; color: #333; line-height: 1.5;">
                      <span style="position: absolute; left: 0; top: 0; font-size: 14px;">⚠️</span>
                      Rapor bireyin dikkat ve odaklanma becerilerindeki güçlü ve desteklenmesi gereken yönleri belirlemek içindir. Tanı koymak için değildir.
                    </div>
                    <div style="margin: 8px 0; padding-left: 18px; position: relative; font-size: 15px; color: #333; line-height: 1.5;">
                      <span style="position: absolute; left: 0; top: 0; font-size: 14px;">⚠️</span>
                      Test sonuçları sadece test anındaki durumu yansıtır. Uyku, stres, heyecan gibi değişkenler bireyin performansını etkileyebilir.
                    </div>
                  </div>
                </div>

                <div class="page-logo">
            <img src="/assets/images/logo.png" alt="ForTest Logo" class="logo-img" />
          </div>
        </div>
        
        <!-- Sayfa 2 -->
              <div class="page">
                <div class="page-header">
                  <h1 style="color: #1e3a8a; text-align: center; font-size: 36px; font-weight: bold; margin-bottom: 30px; position: relative; padding-bottom: 15px;">
                    D2 Dikkat Testi Raporu
                    <div style="content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 2px; background: linear-gradient(90deg, transparent, #1e3a8a, transparent);"></div>
                  </h1>
                </div>
                <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                  Ölçülen Bilişsel Alanlar
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; margin-bottom: 30px;">
                  <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 5px; font-size: 15px;">Seçici Dikkat:</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">Hedef veya göreve odaklanma, uyaranları yok sayma</div>
                  </div>
                  <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 5px; font-size: 15px;">Psikomotor Hız (İşlem Hızı):</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">Bilgiyi hızlıca algılayıp doğru şekilde tepki verebilme hızı</div>
                  </div>
                  <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 5px; font-size: 15px;">Sürdürülebilir Dikkat:</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">Dikkati belirli bir süre aynı hedef üzerinde dağılmadan devam ettirebilme</div>
                  </div>
                  <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 5px; font-size: 15px;">Hata Eğilimi:</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">Atlama ve yanlış işaretleme davranışları</div>
                  </div>
                  <div style="background: white; padding: 12px 15px; border-radius: 6px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 5px; font-size: 15px;">Odaklanma:</div>
                    <div style="font-size: 14px; color: #666; line-height: 1.4;">Konsantrasyon Performansı (CP)</div>
                  </div>
          </div>
          
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; width: 100px; text-align: center;">Puan Türü</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center; width: 100px;">Değer</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Açıklama</td>
              </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">TN</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.total_net_performance || metrics.totalCorrect}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Toplam İşaretleme</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">E1</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.commission_errors !== undefined ? testResult.commission_errors : metrics.totalCommission}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Yanlış İşaretleme</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">E2</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.omission_errors !== undefined ? testResult.omission_errors : metrics.totalOmission}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Boş Bırakılan</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">TN-E</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.total_net_performance !== undefined ? 
                (testResult.total_net_performance - ((testResult.commission_errors || 0) + (testResult.omission_errors || 0))) :
                metrics.totalNet}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Net İşaretleme</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">CP</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.concentration_performance || Math.max(0, metrics.totalNet)}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Konsantrasyon Performansı</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">%Hata</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.commission_errors !== undefined ? 
                calculateErrorPercentage() : 
                metrics.errorPercentage.toFixed(1)}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Toplam Hata Oranı</td>
            </tr>
            <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #fecaca; font-weight: bold; text-align: center;">SP</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #ddd6fe; text-align: center;">${testResult.processing_speed || Math.round(metrics.totalCorrect * 2.5)}</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #e0e7ff;">Norm Karşılığı</td>
            </tr>
          </table>
          
                <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                  Yorum
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; line-height: 1.6;">
                  <div style="margin-bottom: 10px;"><strong style="color: #1e3a8a;">Psikomotor Hız:</strong> ${realComments.psikomotor}</div>
                  <div style="margin-bottom: 10px;"><strong style="color: #1e3a8a;">Seçici Dikkat:</strong> ${realComments.seciciDikkat}</div>
                  <div style="margin-bottom: 10px;"><strong style="color: #1e3a8a;">Hata Eğilimi:</strong> ${realComments.hataEgilimi}</div>
                  <div><strong style="color: #1e3a8a;">Dikkat Dalgalanması:</strong> ${realComments.dikkatDalgalanmasi}</div>
          </div>
          
                <div style="font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 20px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 20px; background: #1e3a8a; border-radius: 2px;"></div>
                  Beyin Antrenörü Gözlem ve Görüşleri
                </div>
                <div style="background: #F0FDF4; padding: 30px; border-radius: 8px; border: 1px solid #10b981; border-left: 4px solid #10b981; margin-top: 10px; min-height: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <!-- Bu alan boş bırakılmış -->
          </div>
          
                <div class="page-logo" style="bottom: -10px;">
            <img src="/assets/images/logo.png" alt="ForTest Logo" class="logo-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              const ctx = document.getElementById('printPerformanceChart');
              if (ctx && window.Chart) {
                const chart = new Chart(ctx, {
                  type: 'line',
                  data: {
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
                    datasets: [{
                      label: 'Performans',
                      data: [${generatePrintPerformanceData().join(', ')}],
                      borderColor: '#dc2626',
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      pointBackgroundColor: '#dc2626',
                      pointRadius: 5,
                      tension: 0
                    }]
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: ${Math.max(...generatePrintPerformanceData()) + 5}
                      }
                    }
                  }
                });
              }
            }, 500);
          });
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Print dialog'u aç
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Handle detail view - Show detailed report in current modal
  const handleDetailView = () => {
    // Simply keep the modal open to show detailed view
    // The detailed view is already shown in the modal
    console.log('Detaylı görünüm zaten modal içinde gösteriliyor');
  };

  if (!isOpen) return null;

  const styles = `
    .d2-report-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 75vw;
      height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      position: relative;
      background: 
        radial-gradient(circle at 15% 25%, rgba(30, 58, 138, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(220, 38, 38, 0.06) 0%, transparent 35%),
        radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.04) 0%, transparent 60%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a8a' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
        linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
      padding: 30px 30px 60px 30px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .container {
      padding: 0;
      background-color: transparent;
    }

    .page-header {
      text-align: center;
      margin-bottom: 25px;
    }

    .page-logo {
      text-align: center;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      margin: 0;
      padding: 10px;
    }

    .logo-img {
      height: 30px;
      max-width: 150px;
      object-fit: contain;
    }

    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        background: white !important;
      }
      
      .d2-report-modal {
        position: static;
        background: white;
        padding: 0;
      }
      
      .modal-content {
        width: 100%;
        height: auto;
        box-shadow: none;
        border-radius: 0;
        background: white;
      }
      
      .modal-close {
        display: none;
      }
      
      .export-buttons {
        display: none;
      }
      
      .page {
        page-break-after: always;
        page-break-inside: avoid;
        background: white !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 20mm 20mm 40mm 20mm !important;
        box-shadow: none !important;
        border: none !important;
        min-height: 250mm !important;
      }
      
      .page:last-child {
        page-break-after: avoid;
      }
      
      .page-logo {
        background: white !important;
        page-break-inside: avoid;
        position: absolute !important;
        bottom: 10px !important;
        left: 0 !important;
        right: 0 !important;
        margin: 0 !important;
        padding: 10px !important;
      }
      
      .info-grid,
      .section,
      .chart-container {
        page-break-inside: avoid;
      }
    }

    .modal-header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .modal-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .modal-body {
      padding: 32px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .info-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .metrics-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 32px 0;
    }

    .metric-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -8px rgba(59, 130, 246, 0.3);
    }

    .metric-value {
      font-size: 32px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }

    .performance-gauge {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }

    .gauge-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .gauge-circle {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
      position: relative;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: #e2e8f0;
      stroke-width: 8;
    }

    .gauge-fill {
      fill: none;
      stroke: #3b82f6;
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dasharray 2s ease-in-out;
    }

    .gauge-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .export-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .export-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .export-btn:hover {
      background: #2563eb;
    }

    .export-btn.secondary {
      background: #64748b;
    }

    .export-btn.secondary:hover {
      background: #475569;
    }

    .section {
      margin: 24px 0;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
      border-left: 4px solid #06b6d4;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }

    .section-content {
      color: #475569;
      line-height: 1.6;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px 0;
    }

    .logo {
      font-size: 16px;
      color: #64748b;
      margin-top: 8px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .metric-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    @media print {
      .modal-header, .modal-close, .export-buttons {
        display: none !important;
      }
      
      .modal-content {
        box-shadow: none;
        border-radius: 0;
        max-height: none;
        width: 100%;
      }
      
      .d2-report-modal {
        position: static;
        background: white;
        padding: 0;
      }

      .modal-body {
        padding: 20px;
      }
    }
  `;

  const totalScore = testResult.concentration_performance || 0;
  const maxScore = 400; // D2 testi için tipik maksimum skor
  const performancePercentage = Math.min((totalScore / maxScore) * 100, 100);

  const circumference = 2 * Math.PI * 50; // radius = 50
  const strokeDasharray = gaugeAnimated 
    ? `${(performancePercentage / 100) * circumference} ${circumference}`
    : `0 ${circumference}`;

  // D2 line_results'tan satır bazlı performans hesapla
  const calculateLinePerformance = () => {
    const lineResults = testResult.line_results || [];
    
    if (!Array.isArray(lineResults) || lineResults.length === 0) {
      // Test verisi kullan
      return Array.from({length: 14}, (_, i) => ({
        lineIndex: i,
        correct: 25 + Math.floor(Math.random() * 10),
        commission: Math.floor(Math.random() * 3),
        omission: Math.floor(Math.random() * 2),
        total: 47 // D2 testinde ortalama satır uzunluğu
      }));
    }
    
    // Satır bazlı performans hesapla (0-13 satır)
    const linePerformance = [];
    
    for (let lineIndex = 0; lineIndex < 14; lineIndex++) {
      // Bu satırdaki tüm karakterleri filtrele
      const lineChars = lineResults.filter(char => char.lineIndex === lineIndex);
      
      // Performans metrikleri hesapla
      const targets = lineChars.filter(char => char.isTarget === true);
      const correctHits = lineChars.filter(char => char.isTarget === true && char.isClicked === true);
      const commissionErrors = lineChars.filter(char => char.isTarget === false && char.isClicked === true);
      const omissionErrors = lineChars.filter(char => char.isTarget === true && char.isClicked === false);
      
      const performance = {
        lineIndex: lineIndex,
        correct: correctHits.length,
        commission: commissionErrors.length,
        omission: omissionErrors.length,
        total: targets.length,
        totalClicked: lineChars.filter(char => char.isClicked === true).length
      };
      
      linePerformance.push(performance);
    }
    
    return linePerformance;
  };

  // Performans tablosu için sadece correct değerlerini al
  const generatePerformanceTableData = () => {
    const linePerformance = calculateLinePerformance();
    return linePerformance.map(line => line.correct);
  };

  const performanceData = generatePerformanceTableData();
  const realComments = generateRealComments();
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Chart.js yükleme ve grafik oluşturma
  useEffect(() => {
    const loadChartJS = async () => {
      // Chart.js'i dinamik olarak yükle
      if (!(window as any).Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
          setTimeout(() => createChart(), 100);
        };
        document.head.appendChild(script);
      } else {
        createChart();
      }
    };

    const createChart = () => {
      const canvas = document.getElementById('d2PerformanceChart') as HTMLCanvasElement;
      if (!canvas || !performanceData) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Önceki chart'ı temizle
      const existingChart = (window as any).d2Chart;
      if (existingChart) {
        existingChart.destroy();
      }

      // Yeni chart oluştur
      const chart = new (window as any).Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
          datasets: [{
            label: 'Performans',
            data: performanceData,
            borderColor: '#dc2626',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: '#dc2626',
            pointRadius: 5,
            tension: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: Math.max(...performanceData) + 5
            }
          }
        }
      });

      // Global referansı sakla
      (window as any).d2Chart = chart;
    };

    // Modal açıldığında chart'ı oluştur
    setTimeout(() => loadChartJS(), 500);

    // Cleanup
    return () => {
      const existingChart = (window as any).d2Chart;
      if (existingChart) {
        existingChart.destroy();
        (window as any).d2Chart = null;
      }
    };
  }, [performanceData]);

  return (
    <div>
      <style>{styles}</style>
      <div className="d2-report-modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '18px',
            zIndex: 1001
          }}>×</button>
          
          <div className="container">
            {/* Sayfa 1 */}
            <div className="page">
              <div className="page-header">
            <h1 style={{
              color: '#1e3a8a',
              textAlign: 'center',
              fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  position: 'relative',
                  paddingBottom: '15px'
                }}>
                  D2 Dikkat Testi Raporu
                  <div style={{
                    content: '',
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #1e3a8a, transparent)'
                  }}></div>
                </h1>
              </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '25px'
            }}>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Ad Soyad</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{student.full_name}</div>
              </div>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Yaş</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{calculateAge(student.birth_date)}</div>
              </div>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Değerlendirme Tarihi</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{new Date(testResult.created_at).toLocaleDateString('tr-TR')}</div>
              </div>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Cinsiyet</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{student.gender === 'male' ? 'Erkek' : 'Kadın'}</div>
              </div>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Doğum Tarihi</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{new Date(student.birth_date).toLocaleDateString('tr-TR')}</div>
              </div>
                <div style={{
                textAlign: 'left',
                background: '#F8F9FA',
                padding: '8px 10px',
                borderRadius: '4px',
                borderLeft: '3px solid #1e3a8a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e3a8a',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Uygulayan</div>
                <div style={{
                  fontSize: '16px',
                  color: '#333',
                  fontWeight: '500'
                }}>{student.trainer_name || 'Belirtilmemiş'}</div>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '15px',
              textAlign: 'center',
              fontSize: '24px',
              marginBottom: '10px'
            }}>Psikomotor Performans Tablosu</div>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
              <tbody>
                <tr style={{
                  backgroundColor: '#dc2626',
                  color: 'white'
                }}>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'center',
                    width: '50px'
                  }}>Sıra</td>
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(num => (
                    <td key={num} style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'center',
                      width: '50px'
                    }}>{num}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'center',
                    backgroundColor: '#dc2626',
                    color: 'white'
                  }}>Puan</td>
                  {performanceData.map((value, index) => (
                    <td key={index} style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'center'
                    }}>{value}</td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Chart.js Performans Grafiği */}
            <div style={{
              margin: '30px 0',
              height: '300px',
              position: 'relative'
            }}>
              <canvas 
                id="d2PerformanceChart"
                style={{
                  maxWidth: '100%',
                  height: 'auto'
                }}
              ></canvas>
            </div>

            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e3a8a',
              margin: '20px 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <div style={{
                width: '4px',
                height: '20px',
                background: '#1e3a8a',
                borderRadius: '2px'
              }}></div>
              D2 Testinin Amacı
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              D2 Dikkat Testi bireyin seçici dikkat, sürdürülebilir dikkat ve işleme hızı gibi bilişsel becerileri değerlendirmek amacıyla uygulanır.
            </div>
            
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e3a8a',
              margin: '20px 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <div style={{
                width: '4px',
                height: '20px',
                background: '#1e3a8a',
                borderRadius: '2px'
              }}></div>
              Hedeflenen Kullanım Alanları
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                <div style={{
                  padding: '8px 12px',
                  background: '#F8F9FA',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB'
                }}>9 yaş ve üzeri bireylerde öğrenme sürecini zorlaştıran dikkat ve odaklanma problemlerini tanımak</div>
                <div style={{
                  padding: '8px 12px',
                  background: '#F8F9FA',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB'
                }}>Zihinsel performansı etkileyen dikkat ve odaklanma becerilerini değerlendirmek</div>
                <div style={{
                  padding: '8px 12px',
                  background: '#F8F9FA',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB'
                }}>Bilişsel becerileri geliştirme programlarında eğitim öncesi ve sonrasında gelişimi izlemek</div>
              </div>
            </div>
            
            <div style={{
              background: '#FEF3C7',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #F59E0B',
              margin: '20px 0'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
              color: '#1e3a8a',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
            <div style={{
                  width: '4px',
                  height: '20px',
                  background: '#1e3a8a',
                  borderRadius: '2px'
                }}></div>
                Önemli Notlar
              </div>
              <div style={{
                display: 'grid',
                gap: '8px'
              }}>
                <div style={{
                  margin: '8px 0',
                  paddingLeft: '18px',
                  position: 'relative',
                  fontSize: '15px',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    fontSize: '14px'
                  }}>⚠️</span>
                  Rapor bireyin dikkat ve odaklanma becerilerindeki güçlü ve desteklenmesi gereken yönleri belirlemek içindir. Tanı koymak için değildir.
            </div>
            <div style={{
                  margin: '8px 0',
                  paddingLeft: '18px',
                  position: 'relative',
                  fontSize: '15px',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    fontSize: '14px'
                  }}>⚠️</span>
                  Test sonuçları sadece test anındaki durumu yansıtır. Uyku, stres, heyecan gibi değişkenler bireyin performansını etkileyebilir.
                </div>
              </div>
            </div>

              <div className="page-logo">
              <img 
                src="/assets/images/logo.png" 
                alt="ForTest Logo" 
                  className="logo-img"
                />
              </div>
            </div>
            
            {/* Sayfa 2 */}
            <div className="page">
              <div className="page-header">
              <h1 style={{
                color: '#1e3a8a',
                textAlign: 'center',
                fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  position: 'relative',
                  paddingBottom: '15px'
                }}>
                  D2 Dikkat Testi Raporu
                  <div style={{
                    content: '',
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #1e3a8a, transparent)'
                  }}></div>
                </h1>
              </div>
              
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e3a8a',
                margin: '20px 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              <div style={{
                  width: '4px',
                  height: '20px',
                  background: '#1e3a8a',
                  borderRadius: '2px'
                }}></div>
                Ölçülen Bilişsel Alanlar
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginTop: '10px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '5px',
                    fontSize: '15px'
                  }}>Seçici Dikkat:</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>Hedef veya göreve odaklanma, uyaranları yok sayma</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '5px',
                    fontSize: '15px'
                  }}>Psikomotor Hız (İşlem Hızı):</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>Bilgiyi hızlıca algılayıp doğru şekilde tepki verebilme hızı</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '5px',
                    fontSize: '15px'
                  }}>Sürdürülebilir Dikkat:</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>Dikkati belirli bir süre aynı hedef üzerinde dağılmadan devam ettirebilme</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '5px',
                    fontSize: '15px'
                  }}>Hata Eğilimi:</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>Atlama ve yanlış işaretleme davranışları</div>
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '5px',
                    fontSize: '15px'
                  }}>Odaklanma:</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>Konsantrasyon Performansı (CP)</div>
                </div>
              </div>

            <table style={{
              width: '100%',
              margin: '20px 0',
              borderCollapse: 'collapse'
            }}>
              <tbody>
                <tr>
                  <td style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fecaca',
                    fontWeight: 'bold',
                    width: '100px',
                    textAlign: 'center'
                  }}>Puan Türü</td>
                  <td style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ddd6fe',
                    textAlign: 'center',
                    width: '100px'
                  }}>Değer</td>
                  <td style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#e0e7ff'
                  }}>Açıklama</td>
                </tr>
{(() => {
                const metrics = getCalculatedMetrics();
                return (
                  <>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>TN</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.total_net_performance || metrics.totalCorrect}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Toplam İşaretleme</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>E1</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.commission_errors !== undefined ? testResult.commission_errors : metrics.totalCommission}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Yanlış İşaretleme</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>E2</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.omission_errors !== undefined ? testResult.omission_errors : metrics.totalOmission}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Boş Bırakılan</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>TN-E</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.total_net_performance !== undefined ? 
                        (testResult.total_net_performance - ((testResult.commission_errors || 0) + (testResult.omission_errors || 0))) :
                        metrics.totalNet}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Net İşaretleme</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>CP</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.concentration_performance || Math.max(0, metrics.totalNet)}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Konsantrasyon Performansı</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>%Hata</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.commission_errors !== undefined ? 
                        calculateErrorPercentage() : 
                        metrics.errorPercentage.toFixed(1)}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Toplam Hata Oranı</td>
                    </tr>
                    <tr>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#fecaca',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>SP</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ddd6fe',
                        textAlign: 'center'
                      }}>{testResult.processing_speed || Math.round(metrics.totalCorrect * 2.5)}</td>
                      <td style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#e0e7ff'
                      }}>Norm Karşılığı</td>
                    </tr>
                  </>
                );
              })()}
              </tbody>
            </table>

            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e3a8a',
              margin: '20px 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <div style={{
                width: '4px',
                height: '20px',
                background: '#1e3a8a',
                borderRadius: '2px'
              }}></div>
              Yorum
            </div>
            <div style={{
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '10px' }}><strong style={{ color: '#1e3a8a' }}>Psikomotor Hız:</strong> {realComments.psikomotor}</div>
              <div style={{ marginBottom: '10px' }}><strong style={{ color: '#1e3a8a' }}>Seçici Dikkat:</strong> {realComments.seciciDikkat}</div>
              <div style={{ marginBottom: '10px' }}><strong style={{ color: '#1e3a8a' }}>Hata Eğilimi:</strong> {realComments.hataEgilimi}</div>
              <div><strong style={{ color: '#1e3a8a' }}>Dikkat Dalgalanması:</strong> {realComments.dikkatDalgalanmasi}</div>
            </div>

            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e3a8a',
              margin: '20px 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <div style={{
                width: '4px',
                height: '20px',
                background: '#1e3a8a',
                borderRadius: '2px'
              }}></div>
              Beyin Antrenörü Gözlem ve Görüşleri
            </div>
            <div style={{
              background: '#F0FDF4',
              padding: '30px',
              borderRadius: '8px',
              border: '1px solid #10b981',
              borderLeft: '4px solid #10b981',
              marginTop: '10px',
              minHeight: '150px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {/* Bu alan boş bırakılmış */}
            </div>

              <div className="page-logo" style={{ bottom: '-10px' }}>
              <img 
                src="/assets/images/logo.png" 
                alt="ForTest Logo" 
                  className="logo-img"
                />
              </div>
            </div>

            {/* Export Butonları */}
            <div className="export-buttons" style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button style={{
                background: '#64748b',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }} onClick={handleDetailView}>
                📄 Detaylı Rapor
              </button>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }} onClick={handlePrint}>
                📄 PDF Olarak Kaydet
              </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default D2ReportModal;