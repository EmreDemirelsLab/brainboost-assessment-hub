import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BurdonTestResult {
  id: string;
  student_id: string;
  section1_correct: number;
  section1_wrong: number;
  section1_missed: number;
  section2_correct: number;
  section2_wrong: number;
  section2_missed: number;
  section3_correct: number;
  section3_wrong: number;
  section3_missed: number;
  total_correct: number;
  total_wrong: number;
  total_missed: number;
  performance_percentage: number;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  birth_date: string;
  gender: 'male' | 'female';
  trainer_name?: string;
}

interface BurdonReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  testResult: BurdonTestResult;
}

const BurdonReportModal: React.FC<BurdonReportModalProps> = ({
  isOpen,
  onClose,
  student,
  testResult
}) => {
  const [gaugeAnimated, setGaugeAnimated] = useState(false);

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = Math.floor((diffDays % 365) % 30);
    return `${years} Yıl ${months} Ay ${days} Gün`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Generate dynamic comment based on performance
  const generateComment = (percentage: number) => {
    if (percentage >= 85) {
      return "Dikkatini görev süresince etkili şekilde sürdürebilmiş, odaklanma becerisini işlevsel biçimde kullanabilmiştir.";
    } else if (percentage >= 70) {
      return "Dikkatini büyük oranda sürdürebilmiştir. Dikkat ve odaklanma becerileri güçlendirilerek daha da geliştirilebilir.";
    } else if (percentage >= 50) {
      return "Dikkatini genel olarak sürdürebilmiştir. Dikkat ve odaklanma süresini destekleyici egzersizlerle çalıştırılır.";
    } else if (percentage >= 35) {
      return "Dikkatini sürdürmekte zaman zaman zorlanabildiği görülmektedir. Dikkat ve odaklanma becerileri yapılandırılmış uygulamalarla geliştirilebilir.";
    } else if (percentage >= 20) {
      return "Dikkatini sürdürmekte güçlük yaşayabildiği gözlenmektedir. Dikkat ve odaklanma becerilerinin gelişimi için aşamalı, hedefe yönelik ve yapılandırılmış çalışmalar önerilmektedir.";
    } else {
      return "Dikkatini yönlendirmekte zorlandığı görülmektedir. Yapılandırılmış bilişsel destek programları ile dikkat ve odaklanma becerileri geliştirilebilir.";
    }
  };

  // Calculate section performance percentages
  const calculateSectionPercentage = (correct: number, wrong: number, missed: number) => {
    const total = correct + wrong + missed;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const section1Percentage = calculateSectionPercentage(
    testResult.section1_correct, 
    testResult.section1_wrong, 
    testResult.section1_missed
  );
  
  const section2Percentage = calculateSectionPercentage(
    testResult.section2_correct, 
    testResult.section2_wrong, 
    testResult.section2_missed
  );
  
  const section3Percentage = calculateSectionPercentage(
    testResult.section3_correct, 
    testResult.section3_wrong, 
    testResult.section3_missed
  );

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

  // Handle print - Open new window with clean template
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Burdon Dikkat Testi Raporu</title>
        <style>
          ${styles}
          
          body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .burdon-report-modal {
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
          
          .modal-header,
          .modal-close,
          .export-btn {
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
              padding: 20mm !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            .page:last-child {
              page-break-after: avoid;
            }
            
            .header,
            .info-grid,
            .gauge-container,
            .section,
            .notes,
            .table-container,
            .chart-container,
            .interpretation,
            .brain-training {
              page-break-inside: avoid;
              background: white !important;
            }
            
            .info-item {
              background: #F8F9FA !important;
              page-break-inside: avoid;
            }
            
            .data-table {
              page-break-inside: avoid;
            }
            
            .bar-chart {
              page-break-inside: avoid;
            }
            
            .cognitive-grid {
              page-break-inside: avoid;
            }
            
            .notes {
              background: #FEF3C7 !important;
              page-break-inside: avoid;
            }
            
            .interpretation {
              background: #F0F9FF !important;
              page-break-inside: avoid;
            }
            
            .training-box {
              background: #F0FDF4 !important;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="burdon-report-modal">
          <div class="modal-content">
            <div class="modal-body">
              <!-- First Page -->
              <div class="page">
                <div class="header">
                  <h1 class="title">Burdon Dikkat Testi Raporu</h1>
                </div>

                <div class="info-grid">
                  <div class="info-item"><div class="info-label">Ad Soyad</div><div class="info-value">${student.full_name}</div></div>
                  <div class="info-item"><div class="info-label">Yaş</div><div class="info-value">${calculateAge(student.birth_date)}</div></div>
                  <div class="info-item"><div class="info-label">Değerlendirme Tarihi</div><div class="info-value">${formatDate(testResult.created_at)}</div></div>
                  <div class="info-item"><div class="info-label">Cinsiyet</div><div class="info-value">${student.gender === 'male' ? 'Erkek' : 'Kadın'}</div></div>
                  <div class="info-item"><div class="info-label">Doğum Tarihi</div><div class="info-value">${formatDate(student.birth_date)}</div></div>
                  <div class="info-item"><div class="info-label">Uygulayan</div><div class="info-value">${student.trainer_name || 'Belirtilmedi'}</div></div>
                </div>

                <div class="gauge-container">
                  <div class="gauge">
                    <div class="gauge-bg">
                      <div class="gauge-inner"></div>
                      <div class="gauge-needle" style="--needle-rotation: ${-90 + (testResult.performance_percentage / 100) * 180}deg"></div>
                      <div class="gauge-center"></div>
                      <div class="gauge-percentage">${testResult.performance_percentage}%</div>
                    </div>
                    <div class="gauge-labels">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>
                  <div class="gauge-title">Genel Dikkat Performans Yüzdesi</div>
                </div>

                <div class="section">
                  <h2 class="section-title">Burdon Dikkat Testinin Amacı</h2>
                  <div class="section-content">
                    Burdon Dikkat Testi, bireyin dikkatini bir görev üzerinde ne kadar süreyle ve ne kadar doğru sürdürebilğidini ölçmek amacıyla kullanılır. Bu testte yapılan doğru ve hatalı işaretlemeler, odaklanma kalitesi ve dikkati sürdürebilme becerisi hakkında bilgi verir.
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">Hedeflenen Kullanım Alanları</h2>
                  <div class="usage-areas">
                    <div class="usage-item">Okuma-yazma becerisi kazanmış bireylerde dikkat ve odaklanma becerilerini değerlendirmek</div>
                    <div class="usage-item">Seçici dikkat, dikkat süresi ve görsel dikkatin sürekliliğini ölçmek</div>
                    <div class="usage-item">Bilişsel beceri geliştirme programlarında uygulama öncesi ve sonrası dikkat performansındaki değişimi izlemek</div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">Ölçülen Bilişsel Alanlar</h2>
                  <div class="cognitive-areas">
                    <div class="cognitive-grid">
                      <div class="cognitive-item">
                        <div class="cognitive-label">Seçici Dikkat:</div>
                        <div class="cognitive-desc">Hedefe veya göreve odaklanma, uyaranları yok sayma</div>
                      </div>
                      <div class="cognitive-item">
                        <div class="cognitive-label">Sürdürülebilir Dikkat:</div>
                        <div class="cognitive-desc">Dikkati belirli bir süre aynı hedef üzerinde dağılmadan devam ettirebilme</div>
                      </div>
                      <div class="cognitive-item">
                        <div class="cognitive-label">Odaklanma:</div>
                        <div class="cognitive-desc">Görsel olarak dikkat dağıtıcı birçok uyaran arasında yalnızca hedefe yönelme ve bu odakta kalabilme</div>
                      </div>
                      <div class="cognitive-item">
                        <div class="cognitive-label">Psikomotor Hızı (İşlem Hızı):</div>
                        <div class="cognitive-desc">Bilgiyi hızlıca algılayıp doğru şekilde tepki verebilme hızı</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="notes">
                  <h3 class="notes-title">Önemli Notlar</h3>
                  <ul class="notes-list">
                    <li class="notes-item">Rapor bireyin dikkat ve odaklanma becerilerindeki güçlü ve desteklenmesi gereken yönleri belirlemek içindir. Tanı koymak için değildir.</li>
                    <li class="notes-item">Test sonuçları sadece test anındaki durumu yansıtır. Uyku, stres, heyecan gibi değişkenler bireyin performansını etkileyebilir.</li>
                  </ul>
                </div>

                <div class="logo">
                  <img src="/assets/images/logo.png" alt="ForTest Logo" class="logo-img" />
                </div>
              </div>

              <!-- Second Page -->  
              <div class="page">
                <div class="header">
                  <h1 class="title">Burdon Dikkat Testi Raporu</h1>
                </div>

                <div class="table-container">
                  <h2 class="section-title">Ham Puan Veri Tablosu</h2>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Doğru İşaretleme</th>
                        <th>Yanlış İşaretleme</th>
                        <th>Boş Bırakılan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Başta</strong></td>
                        <td>${testResult.section1_correct}</td>
                        <td>${testResult.section1_wrong}</td>
                        <td>${testResult.section1_missed}</td>
                      </tr>
                      <tr>
                        <td><strong>Ortada</strong></td>
                        <td>${testResult.section2_correct}</td>
                        <td>${testResult.section2_wrong}</td>
                        <td>${testResult.section2_missed}</td>
                      </tr>
                      <tr>
                        <td><strong>Sonda</strong></td>
                        <td>${testResult.section3_correct}</td>
                        <td>${testResult.section3_wrong}</td>
                        <td>${testResult.section3_missed}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="chart-container">
                  <div class="bar-chart">
                    <div class="y-axis">
                      <span>100</span>
                      <span>80</span>
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>0</span>
                    </div>
                    <div class="chart-grid">
                      <div class="grid-line grid-20"></div>
                      <div class="grid-line grid-40"></div>
                      <div class="grid-line grid-60"></div>
                      <div class="grid-line grid-80"></div>
                      <div class="grid-line grid-100"></div>
                    </div>
                    <div class="bar" style="height: ${(section1Percentage / 100) * 240}px">
                      <div class="bar-value">%${section1Percentage}</div>
                      <div class="bar-label">Başta</div>
                    </div>
                    <div class="bar" style="height: ${(section2Percentage / 100) * 240}px">
                      <div class="bar-value">%${section2Percentage}</div>
                      <div class="bar-label">Ortada</div>
                    </div>
                    <div class="bar" style="height: ${(section3Percentage / 100) * 240}px">
                      <div class="bar-value">%${section3Percentage}</div>
                      <div class="bar-label">Sonda</div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">Yorum</h2>
                  <div class="interpretation">
                    <div class="section-content">
                      ${generateComment(testResult.performance_percentage)}
                    </div>
                  </div>
                </div>

                <div class="brain-training">
                  <h2 class="section-title">Beyin Antrenörü Gözlem ve Görüşleri</h2>
                  <div class="training-box">
                    Bu bölüm beyin antrenörü tarafından doldurulacaktır.
                  </div>
                </div>

                <div class="logo">
                  <img src="/assets/images/logo.png" alt="ForTest Logo" class="logo-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Print dialog'ı otomatik açar
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (!isOpen) return null;

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .burdon-report-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
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

    .modal-header {
      position: sticky;
      top: 0;
      background: white;
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: between;
      align-items: center;
      z-index: 100;
    }

    .modal-close {
      position: absolute;
      top: 15px;
      right: 20px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      z-index: 101;
    }

    .modal-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      position: relative;
      background: 
        radial-gradient(circle at 15% 25%, rgba(139, 79, 179, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(255, 140, 66, 0.06) 0%, transparent 35%),
        radial-gradient(circle at 50% 50%, rgba(139, 79, 179, 0.04) 0%, transparent 60%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4FB3' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
        linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
      padding: 30px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
    }

    .title {
      font-size: 36px;
      font-weight: bold;
      color: #8B4FB3;
      margin-bottom: 30px;
      position: relative;
      padding-bottom: 15px;
    }

    .title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #8B4FB3, transparent);
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 25px;
    }

    .info-item {
      text-align: left;
      background: #F8F9FA;
      padding: 8px 10px;
      border-radius: 4px;
      border-left: 3px solid #FF8C42;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }

    .info-item:hover {
      box-shadow: 0 4px 12px rgba(255, 140, 66, 0.15);
      transform: translateY(-2px);
    }

    .info-label {
      font-size: 14px;
      font-weight: 600;
      color: #FF8C42;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }

    .gauge-container {
      text-align: center;
      margin: 25px 0;
      padding: 15px;
    }

    .gauge {
      width: 280px;
      height: 140px;
      margin: 0 auto 20px;
      position: relative;
    }

    .gauge-bg {
      width: 280px;
      height: 140px;
      border-radius: 140px 140px 0 0;
      position: relative;
      background: conic-gradient(
        from 180deg at 50% 100%,
        #FFF3E0 0deg,
        #FFE0B2 30deg,
        #FFCC80 60deg,
        #FFB74D 90deg,
        #FFA726 120deg,
        #FF9800 150deg,
        #F57C00 180deg
      );
      box-shadow: 
        0 4px 20px rgba(245, 124, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.3);
    }

    .gauge-inner {
      width: 80px;
      height: 40px;
      background: #ffffff;
      border-radius: 40px 40px 0 0;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.1);
      z-index: 20;
    }

    .gauge-needle {
      width: 4px;
      height: 105px;
      background: linear-gradient(to top, #2c3e50, #34495e, #5d6d7e);
      position: absolute;
      bottom: 0;
      left: 50%;
      transform-origin: bottom center;
      transform: translateX(-50%) rotate(-90deg);
      transition: transform 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border-radius: 2px 2px 0 0;
      box-shadow: 
        0 0 15px rgba(255, 255, 255, 0.6),
        0 0 30px rgba(255, 255, 255, 0.3),
        0 2px 8px rgba(44, 62, 80, 0.4),
        0 1px 3px rgba(0, 0, 0, 0.2);
      z-index: 30;
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
    }

    .gauge-needle.animated {
      transform: translateX(-50%) rotate(var(--needle-rotation));
    }

    .gauge-needle::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid #2c3e50;
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .gauge-center {
      width: 16px;
      height: 16px;
      background: radial-gradient(circle, #ffffff, #ecf0f1);
      border: 3px solid #2c3e50;
      border-radius: 50%;
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 
        0 4px 12px rgba(44, 62, 80, 0.3),
        inset 0 1px 3px rgba(255, 255, 255, 0.5);
      z-index: 35;
    }

    .gauge-center::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background: #8B4FB3;
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(139, 79, 179, 0.4);
    }

    .gauge-percentage {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-shadow: 
        0 0 20px rgba(255, 255, 255, 0.8),
        0 0 40px rgba(255, 255, 255, 0.6),
        0 2px 8px rgba(44, 62, 80, 0.3);
      z-index: 25;
      letter-spacing: 1px;
      filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.4));
    }

    .gauge-labels {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 10;
    }

    .gauge-labels span {
      position: absolute;
      color: #8B4FB3;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .gauge-labels span:first-child {
      left: -30px;
      bottom: 0px;
    }

    .gauge-labels span:last-child {
      right: -40px;
      bottom: 0px;
    }

    .gauge-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-top: 20px;
      text-align: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .section {
      margin: 20px 0;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #8B4FB3;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #8B4FB3;
      border-radius: 2px;
    }

    .section-content {
      font-size: 15px;
      color: #333;
      line-height: 1.6;
    }

    .usage-areas {
      margin: 15px 0;
    }

    .usage-item {
      margin: 8px 0;
      padding-left: 15px;
      font-size: 15px;
      line-height: 1.6;
      position: relative;
    }

    .usage-item::before {
      content: "•";
      color: #8B4FB3;
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .cognitive-areas {
      margin: 20px 0;
    }

    .cognitive-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .cognitive-item {
      background: white;
      padding: 12px 15px;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .cognitive-item:hover {
      border-color: #8B4FB3;
      box-shadow: 0 4px 12px rgba(139, 79, 179, 0.1);
      transform: translateY(-2px);
    }

    .cognitive-label {
      font-weight: 700;
      color: #8B4FB3;
      margin-bottom: 5px;
      font-size: 15px;
    }

    .cognitive-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .notes {
      background: #FEF3C7;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #F59E0B;
      margin: 20px 0;
    }

    .notes-title {
      font-size: 18px;
      font-weight: 700;
      color: #8B4FB3;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notes-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #8B4FB3;
      border-radius: 2px;
    }

    .notes-list {
      list-style: none;
      padding: 0;
    }

    .notes-item {
      margin: 8px 0;
      padding-left: 18px;
      position: relative;
      font-size: 15px;
      color: #333;
      line-height: 1.5;
    }

    .notes-item::before {
      content: '⚠️';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 14px;
    }

    .logo {
      text-align: center;
      margin-top: 25px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo-img {
      height: 30px;
      max-width: 150px;
      object-fit: contain;
    }

    .table-container {
      margin: 40px 0;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    .data-table th,
    .data-table td {
      border: 2px solid #8B4FB3;
      padding: 15px;
      text-align: center;
      font-size: 16px;
    }

    .data-table th {
      background-color: #E6D7F0;
      font-weight: bold;
      color: #8B4FB3;
    }

    .data-table td {
      background-color: #F8F4FC;
      color: #333;
    }

    .chart-container {
      text-align: center;
      margin: 40px 0;
    }

    .bar-chart {
      display: flex;
      justify-content: space-around;
      align-items: end;
      height: 300px;
      margin: 40px 0;
      border-bottom: 2px solid #ddd;
      position: relative;
    }

    .bar {
      width: 80px;
      background-color: #FF8C42;
      border-radius: 4px 4px 0 0;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: end;
      align-items: center;
      transition: height 1s ease-in-out;
    }

    .bar-value {
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }

    .bar-label {
      position: absolute;
      bottom: -30px;
      font-weight: bold;
      color: #333;
      font-size: 16px;
    }

    .chart-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .grid-line {
      width: 100%;
      height: 1px;
      background: #ddd;
      position: absolute;
      border-style: dotted;
      border-width: 1px 0 0 0;
      border-color: #999;
    }

    .grid-20 { bottom: 20%; }
    .grid-40 { bottom: 40%; }
    .grid-60 { bottom: 60%; }
    .grid-80 { bottom: 80%; }
    .grid-100 { bottom: 100%; }

    .y-axis {
      position: absolute;
      left: -30px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
    }

    .interpretation {
      background: #F0F9FF;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #0EA5E9;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(14, 165, 233, 0.1);
    }

    .brain-training {
      margin: 25px 0;
    }

    .training-box {
      background: #F0FDF4;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #22C55E;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9CA3AF;
      font-style: italic;
      text-align: center;
    }

    .export-btn {
      background: linear-gradient(135deg, #8B4FB3, #A855F7);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 79, 179, 0.3);
      transition: all 0.3s ease;
      font-size: 14px;
      margin: 10px;
    }

    .export-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(139, 79, 179, 0.4);
    }

    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      
      body * {
        visibility: hidden;
      }
      
      .page,
      .page * {
        visibility: visible;
      }
      
      .burdon-report-modal {
        position: static !important;
        background: none !important;
        box-shadow: none !important;
      }
      
      .modal-content {
        position: static !important;
        width: 100% !important;
        height: auto !important;
        background: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      
      .modal-body {
        padding: 0 !important;
        margin: 0 !important;
      }
      
      .modal-header,
      .modal-close,
      .export-btn {
        display: none !important;
      }
      
      .page {
        position: static !important;
        width: 210mm !important;
        min-height: 297mm !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 20mm !important;
        background: white !important;
        box-shadow: none !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
      }
      
      .page:last-child {
        page-break-after: avoid !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="burdon-report-modal">
        <div className="modal-content">
          <div className="modal-header">
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={24} />
            </button>
            <button 
              className="export-btn" 
              onClick={handlePrint}
            >
              📄 PDF Olarak İndir
            </button>
          </div>
          
          <div className="modal-body">
            {/* First Page */}
            <div className="page">
              <div className="header">
                <h1 className="title">Burdon Dikkat Testi Raporu</h1>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Ad Soyad</div>
                  <div className="info-value">{student.full_name}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Yaş</div>
                  <div className="info-value">{calculateAge(student.birth_date)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Değerlendirme Tarihi</div>
                  <div className="info-value">{formatDate(testResult.created_at)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Cinsiyet</div>
                  <div className="info-value">{student.gender === 'male' ? 'Erkek' : 'Kadın'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Doğum Tarihi</div>
                  <div className="info-value">{formatDate(student.birth_date)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Uygulayan</div>
                  <div className="info-value">{student.trainer_name || 'Belirtilmedi'}</div>
                </div>
              </div>

              <div className="gauge-container">
                <div className="gauge">
                  <div className="gauge-bg">
                    <div className="gauge-inner"></div>
                    <div 
                      className={`gauge-needle ${gaugeAnimated ? 'animated' : ''}`}
                      style={{
                        '--needle-rotation': `${-90 + (testResult.performance_percentage / 100) * 180}deg`
                      } as React.CSSProperties}
                    ></div>
                    <div className="gauge-center"></div>
                    <div className="gauge-percentage">{testResult.performance_percentage}%</div>
                  </div>
                  <div className="gauge-labels">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
                <div className="gauge-title">Genel Dikkat Performans Yüzdesi</div>
              </div>

              <div className="section">
                <h2 className="section-title">Burdon Dikkat Testinin Amacı</h2>
                <div className="section-content">
                  Burdon Dikkat Testi, bireyin dikkatini bir görev üzerinde ne kadar süreyle ve ne kadar doğru sürdürebilğidini ölçmek amacıyla kullanılır. Bu testte yapılan doğru ve hatalı işaretlemeler, odaklanma kalitesi ve dikkati sürdürebilme becerisi hakkında bilgi verir.
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Hedeflenen Kullanım Alanları</h2>
                <div className="usage-areas">
                  <div className="usage-item">Okuma-yazma becerisi kazanmış bireylerde dikkat ve odaklanma becerilerini değerlendirmek</div>
                  <div className="usage-item">Seçici dikkat, dikkat süresi ve görsel dikkatin sürekliliğini ölçmek</div>
                  <div className="usage-item">Bilişsel beceri geliştirme programlarında uygulama öncesi ve sonrası dikkat performansındaki değişimi izlemek</div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Ölçülen Bilişsel Alanlar</h2>
                <div className="cognitive-areas">
                  <div className="cognitive-grid">
                    <div className="cognitive-item">
                      <div className="cognitive-label">Seçici Dikkat:</div>
                      <div className="cognitive-desc">Hedefe veya göreve odaklanma, uyaranları yok sayma</div>
                    </div>
                    <div className="cognitive-item">
                      <div className="cognitive-label">Sürdürülebilir Dikkat:</div>
                      <div className="cognitive-desc">Dikkati belirli bir süre aynı hedef üzerinde dağılmadan devam ettirebilme</div>
                    </div>
                    <div className="cognitive-item">
                      <div className="cognitive-label">Odaklanma:</div>
                      <div className="cognitive-desc">Görsel olarak dikkat dağıtıcı birçok uyaran arasında yalnızca hedefe yönelme ve bu odakta kalabilme</div>
                    </div>
                    <div className="cognitive-item">
                      <div className="cognitive-label">Psikomotor Hızı (İşlem Hızı):</div>
                      <div className="cognitive-desc">Bilgiyi hızlıca algılayıp doğru şekilde tepki verebilme hızı</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="notes">
                <h3 className="notes-title">Önemli Notlar</h3>
                <ul className="notes-list">
                  <li className="notes-item">Rapor bireyin dikkat ve odaklanma becerilerindeki güçlü ve desteklenmesi gereken yönleri belirlemek içindir. Tanı koymak için değildir.</li>
                  <li className="notes-item">Test sonuçları sadece test anındaki durumu yansıtır. Uyku, stres, heyecan gibi değişkenler bireyin performansını etkileyebilir.</li>
                </ul>
              </div>

              <div className="logo">
                <img src="/assets/images/logo.png" alt="ForTest Logo" className="logo-img" />
              </div>
            </div>

            {/* Second Page */}
            <div className="page">
              <div className="header">
                <h1 className="title">Burdon Dikkat Testi Raporu</h1>
              </div>

              <div className="table-container">
                <h2 className="section-title">Ham Puan Veri Tablosu</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Doğru İşaretleme</th>
                      <th>Yanlış İşaretleme</th>
                      <th>Boş Bırakılan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Başta</strong></td>
                      <td>{testResult.section1_correct}</td>
                      <td>{testResult.section1_wrong}</td>
                      <td>{testResult.section1_missed}</td>
                    </tr>
                    <tr>
                      <td><strong>Ortada</strong></td>
                      <td>{testResult.section2_correct}</td>
                      <td>{testResult.section2_wrong}</td>
                      <td>{testResult.section2_missed}</td>
                    </tr>
                    <tr>
                      <td><strong>Sonda</strong></td>
                      <td>{testResult.section3_correct}</td>
                      <td>{testResult.section3_wrong}</td>
                      <td>{testResult.section3_missed}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="chart-container">
                <div className="bar-chart">
                  <div className="y-axis">
                    <span>100</span>
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>
                  <div className="chart-grid">
                    <div className="grid-line grid-20"></div>
                    <div className="grid-line grid-40"></div>
                    <div className="grid-line grid-60"></div>
                    <div className="grid-line grid-80"></div>
                    <div className="grid-line grid-100"></div>
                  </div>
                  <div 
                    className="bar" 
                    style={{ height: `${(section1Percentage / 100) * 240}px` }}
                  >
                    <div className="bar-value">%{section1Percentage}</div>
                    <div className="bar-label">Başta</div>
                  </div>
                  <div 
                    className="bar" 
                    style={{ height: `${(section2Percentage / 100) * 240}px` }}
                  >
                    <div className="bar-value">%{section2Percentage}</div>
                    <div className="bar-label">Ortada</div>
                  </div>
                  <div 
                    className="bar" 
                    style={{ height: `${(section3Percentage / 100) * 240}px` }}
                  >
                    <div className="bar-value">%{section3Percentage}</div>
                    <div className="bar-label">Sonda</div>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">Yorum</h2>
                <div className="interpretation">
                  <div className="section-content">
                    {generateComment(testResult.performance_percentage)}
                  </div>
                </div>
              </div>

              <div className="brain-training">
                <h2 className="section-title">Beyin Antrenörü Gözlem ve Görüşleri</h2>
                <div className="training-box">
                  Bu bölüm beyin antrenörü tarafından doldurulacaktır.
                </div>
              </div>

              <div className="logo">
                <img src="/assets/images/logo.png" alt="ForTest Logo" className="logo-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurdonReportModal;