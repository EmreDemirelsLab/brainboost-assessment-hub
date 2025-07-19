import { BurdonTestResult } from "@/pages/Reports";

interface BurdonPDFTemplateProps {
  result: BurdonTestResult;
}

export function generateBurdonHTMLReport(result: BurdonTestResult): string {
  const testDate = new Date(result.created_at).toLocaleDateString('tr-TR');
  const startTime = new Date(result.test_start_time).toLocaleTimeString('tr-TR');
  const endTime = new Date(result.test_end_time).toLocaleTimeString('tr-TR');
  const durationMinutes = Math.floor(result.test_elapsed_time_seconds / 60);
  const durationSeconds = result.test_elapsed_time_seconds % 60;

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Burdon Dikkat Testi - Rapor</title>
        <style>
            @page { margin: 15mm; size: A4; }
            @media print {
                body { margin: 0; font-size: 10pt; }
                .no-print { display: none !important; }
            }
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin: 30px 0;
            }
            .metric-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border-left: 4px solid #667eea;
            }
            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }
            .metric-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #495057;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            th {
                background: #f8f9fa;
                font-weight: 600;
            }
            .print-button {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BURDON DİKKAT TESTİ</h1>
                <h2>Analiz Raporu</h2>
            </div>

            <div class="section">
                <div class="section-title">Test Bilgileri</div>
                <p><strong>Öğrenci:</strong> ${result.student_name || 'Bilinmeyen'}</p>
                <p><strong>Test Yapan:</strong> ${result.conducted_by_name || 'Bilinmeyen'}</p>
                <p><strong>Test Tarihi:</strong> ${testDate}</p>
                <p><strong>Başlangıç:</strong> ${startTime}</p>
                <p><strong>Bitiş:</strong> ${endTime}</p>
                <p><strong>Süre:</strong> ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}</p>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${result.total_correct}</div>
                    <div class="metric-label">Doğru Cevaplar</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.total_wrong}</div>
                    <div class="metric-label">Yanlış Cevaplar</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.total_missed}</div>
                    <div class="metric-label">Kaçırılan</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${result.total_score}</div>
                    <div class="metric-label">Toplam Puan</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Bölümsel Analiz</div>
                <table>
                    <thead>
                        <tr>
                            <th>Bölüm</th>
                            <th>Doğru</th>
                            <th>Yanlış</th>
                            <th>Kaçırılan</th>
                            <th>Puan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Bölüm 1</td>
                            <td>${result.section1_correct}</td>
                            <td>${result.section1_wrong}</td>
                            <td>${result.section1_missed}</td>
                            <td>${result.section1_score}</td>
                        </tr>
                        <tr>
                            <td>Bölüm 2</td>
                            <td>${result.section2_correct}</td>
                            <td>${result.section2_wrong}</td>
                            <td>${result.section2_missed}</td>
                            <td>${result.section2_score}</td>
                        </tr>
                        <tr>
                            <td>Bölüm 3</td>
                            <td>${result.section3_correct}</td>
                            <td>${result.section3_wrong}</td>
                            <td>${result.section3_missed}</td>
                            <td>${result.section3_score}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">Dikkat Oranı</div>
                <div style="font-size: 32px; font-weight: bold; color: #007bff; text-align: center;">
                    ${(result.attention_ratio * 100).toFixed(2)}%
                </div>
                <p style="text-align: center; margin-top: 10px;">
                    Bu oran, öğrencinin testteki genel dikkat performansını gösterir.
                </p>
            </div>

            ${result.notes ? `
            <div class="section">
                <div class="section-title">Notlar</div>
                <p>${result.notes}</p>
            </div>
            ` : ''}

            <button class="print-button no-print" onclick="window.print()">
                PDF Olarak Kaydet / Yazdır
            </button>
        </div>
    </body>
    </html>
  `;
}