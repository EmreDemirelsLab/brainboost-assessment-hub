
import { BurdonTestResult } from "@/pages/Reports";

interface BurdonPDFTemplateProps {
  result: BurdonTestResult;
}

export function generateBurdonHTMLReport(result: BurdonTestResult): string {
  const testDate = new Date(result.created_at).toLocaleDateString('tr-TR');
  const startTime = new Date(result.test_start_time).toLocaleTimeString('tr-TR');
  const endTime = new Date(result.test_end_time).toLocaleTimeString('tr-TR');
  
  // Calculate test duration in minutes and seconds
  const durationMinutes = Math.floor(result.test_elapsed_time_seconds / 60);
  const durationSeconds = result.test_elapsed_time_seconds % 60;
  
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burdon Dikkat Testi Raporu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            font-size: 12px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header .subtitle {
            color: #666;
            font-size: 16px;
            font-weight: 500;
        }

        .test-info {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 5px solid #2563eb;
        }

        .test-info h2 {
            color: #2563eb;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 15px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .info-label {
            font-weight: 600;
            color: #475569;
        }

        .info-value {
            font-weight: 500;
            color: #1e293b;
        }

        .results-section {
            margin-bottom: 25px;
        }

        .section-title {
            background: #2563eb;
            color: white;
            padding: 12px 20px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
        }

        .results-content {
            background: white;
            border: 2px solid #2563eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 20px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-gap: 20px;
            margin-bottom: 20px;
        }

        .metric-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .metric-card.correct {
            border-color: #10b981;
            background: #ecfdf5;
        }

        .metric-card.missed {
            border-color: #f59e0b;
            background: #fffbeb;
        }

        .metric-card.wrong {
            border-color: #ef4444;
            background: #fef2f2;
        }

        .metric-card.score {
            border-color: #2563eb;
            background: #eff6ff;
        }

        .metric-number {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .metric-card.correct .metric-number {
            color: #10b981;
        }

        .metric-card.missed .metric-number {
            color: #f59e0b;
        }

        .metric-card.wrong .metric-number {
            color: #ef4444;
        }

        .metric-card.score .metric-number {
            color: #2563eb;
        }

        .metric-label {
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sections-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .sections-table thead {
            background: #2563eb;
            color: white;
        }

        .sections-table th,
        .sections-table td {
            padding: 12px 15px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }

        .sections-table th {
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .sections-table td {
            font-weight: 500;
        }

        .sections-table tbody tr:hover {
            background: #f8fafc;
        }

        .sections-table tbody tr:last-child td {
            border-bottom: none;
        }

        .attention-ratio {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #2563eb;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }

        .attention-ratio h3 {
            color: #2563eb;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .ratio-value {
            font-size: 32px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .ratio-description {
            color: #475569;
            font-size: 14px;
            font-weight: 500;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 11px;
        }

        .timestamp {
            margin-top: 10px;
            font-weight: 500;
        }

        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .container {
                padding: 15px;
            }
            
            .metric-card,
            .test-info,
            .attention-ratio {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BURDON DİKKAT TESTİ</h1>
            <div class="subtitle">Profesyonel Değerlendirme Raporu</div>
        </div>

        <div class="test-info">
            <h2>📋 Test Bilgileri</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">👤 Öğrenci Adı:</span>
                    <span class="info-value">${result.student_name || 'Bilinmeyen'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">👨‍🏫 Test Yapan:</span>
                    <span class="info-value">${result.conducted_by_name || 'Bilinmeyen'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📅 Test Tarihi:</span>
                    <span class="info-value">${testDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🕐 Başlangıç:</span>
                    <span class="info-value">${startTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🕑 Bitiş:</span>
                    <span class="info-value">${endTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">⏱️ Test Süresi:</span>
                    <span class="info-value">${durationMinutes}d ${durationSeconds}s</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🤖 Otomatik Tamamlandı:</span>
                    <span class="info-value">${result.test_auto_completed ? 'Evet' : 'Hayır'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🎯 Hedef Karakterler:</span>
                    <span class="info-value">a, b, d, g</span>
                </div>
            </div>
        </div>

        <div class="results-section">
            <h2 class="section-title">📊 GENEL SONUÇLAR</h2>
            <div class="results-content">
                <div class="metrics-grid">
                    <div class="metric-card correct">
                        <div class="metric-number">${result.total_correct}</div>
                        <div class="metric-label">Doğru</div>
                    </div>
                    <div class="metric-card missed">
                        <div class="metric-number">${result.total_missed}</div>
                        <div class="metric-label">Kaçırılan</div>
                    </div>
                    <div class="metric-card wrong">
                        <div class="metric-number">${result.total_wrong}</div>
                        <div class="metric-label">Yanlış</div>
                    </div>
                    <div class="metric-card score">
                        <div class="metric-number">${result.total_score}</div>
                        <div class="metric-label">Toplam Puan</div>
                    </div>
                </div>

                <div class="attention-ratio">
                    <h3>🎯 Dikkat Oranı</h3>
                    <div class="ratio-value">${(result.attention_ratio * 100).toFixed(2)}%</div>
                    <div class="ratio-description">Genel dikkat performansı göstergesi</div>
                </div>
            </div>
        </div>

        <div class="results-section">
            <h2 class="section-title">📈 BÖLÜM DETAYLARI</h2>
            <div class="results-content">
                <table class="sections-table">
                    <thead>
                        <tr>
                            <th>Bölüm</th>
                            <th>✅ Doğru</th>
                            <th>⚠️ Kaçırılan</th>
                            <th>❌ Yanlış</th>
                            <th>🏆 Puan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Bölüm 1</strong></td>
                            <td>${result.section1_correct}</td>
                            <td>${result.section1_missed}</td>
                            <td>${result.section1_wrong}</td>
                            <td>${result.section1_score}</td>
                        </tr>
                        <tr>
                            <td><strong>Bölüm 2</strong></td>
                            <td>${result.section2_correct}</td>
                            <td>${result.section2_missed}</td>
                            <td>${result.section2_wrong}</td>
                            <td>${result.section2_score}</td>
                        </tr>
                        <tr>
                            <td><strong>Bölüm 3</strong></td>
                            <td>${result.section3_correct}</td>
                            <td>${result.section3_missed}</td>
                            <td>${result.section3_wrong}</td>
                            <td>${result.section3_score}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p><strong>ForBrain Gelişim ve Takip Sistemi</strong></p>
            <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
            <div class="timestamp">Rapor Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</div>
        </div>
    </div>
</body>
</html>`;
}
