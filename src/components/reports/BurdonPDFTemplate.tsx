
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
    <title>Burdon Dikkat Testi - Analiz Raporu</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @page { margin: 15mm; size: A4; }
        @media print { 
            body { font-size: 10pt; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #334155;
            background: #f8fafc;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 24px;
            background: white;
            min-height: 100vh;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #6366f1, #06b6d4);
            margin: -24px -24px 32px -24px;
            padding: 40px;
            color: white;
            text-align: center;
        }

        .title-box {
            background: white;
            color: #1e293b;
            padding: 20px 32px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: inline-block;
            margin-bottom: 24px;
        }

        .title-main {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .title-sub {
            font-size: 1.2rem;
            font-weight: 500;
            color: #6366f1;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 24px;
        }

        .stat-item {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 16px;
            border-radius: 12px;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Performance Section */
        .performance-section {
            background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8));
            border-radius: 24px;
            padding: 48px;
            margin-bottom: 32px;
            box-shadow: 
                0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .performance-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #6366f1, #06b6d4, #f59e0b);
        }

        .performance-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 32px;
        }

        .performance-gauge-container {
            position: relative;
            width: 240px;
            height: 240px;
            margin: 0 auto 32px;
        }

        .performance-gauge {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .gauge-track {
            fill: none;
            stroke: #e2e8f0;
            stroke-width: 16;
        }

        .gauge-fill {
            fill: none;
            stroke: url(#performanceGradient);
            stroke-width: 16;
            stroke-linecap: round;
            stroke-dasharray: 565;
            stroke-dashoffset: 565;
            transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
            filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
        }

        .performance-score-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .performance-score {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
            line-height: 1;
        }

        .performance-score-label {
            font-size: 1rem;
            color: #64748b;
            font-weight: 500;
            margin-top: 8px;
        }

        .performance-level {
            font-size: 1.3rem;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 50px;
            display: inline-block;
            margin-top: 20px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .performance-level::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.6s ease;
        }

        .performance-level:hover::before {
            left: 100%;
        }

        .performance-level.excellent {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .performance-level.good {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .performance-level.average {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }

        .performance-level.poor {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #6366f1;
        }

        .metric-card.success { border-left-color: #10b981; }
        .metric-card.warning { border-left-color: #f59e0b; }
        .metric-card.danger { border-left-color: #ef4444; }

        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
        }

        .metric-label {
            color: #64748b;
            font-weight: 500;
            margin-top: 8px;
        }

        /* Chart Section */
        .chart-section {
            background: white;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 24px;
        }

        .chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
        }

        .donut-chart {
            position: relative;
            width: 200px;
            height: 200px;
        }

        .donut-chart svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .donut-segment {
            stroke-width: 20;
            fill: none;
            transition: all 0.3s ease;
        }

        .chart-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .center-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #6366f1;
        }

        .center-label {
            font-size: 0.9rem;
            color: #64748b;
        }

        .legend {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }

        .legend-text {
            flex: 1;
            font-weight: 500;
        }

        .legend-value {
            font-weight: 600;
            color: #1e293b;
        }

        /* Table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .data-table th {
            background: #1e293b;
            color: white;
            padding: 16px 12px;
            font-weight: 600;
            text-align: left;
        }

        .data-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        .data-table tr:nth-child(even) {
            background: #f8fafc;
        }

        .score-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .score-high { background: #dcfce7; color: #16a34a; }
        .score-medium { background: #fef3c7; color: #d97706; }
        .score-low { background: #fee2e2; color: #dc2626; }

        /* Insights */
        .insights-section {
            background: white;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .insight-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #6366f1;
        }

        .insight-card.positive { border-left-color: #10b981; }
        .insight-card.warning { border-left-color: #f59e0b; }
        .insight-card.negative { border-left-color: #ef4444; }

        .insight-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }

        .insight-text {
            color: #475569;
            line-height: 1.6;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            margin-top: 32px;
        }

        /* Export Button */
        .export-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <button class="export-btn no-print" onclick="window.print()">📑 PDF İndir</button>
    
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="title-box">
                <h1 class="title-main">Burdon Testi</h1>
                <p class="title-sub">Değerlendirme Raporu</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value" id="test-date">15 Ara</div>
                    <div class="stat-label">Test Tarihi</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="test-duration">4:33</div>
                    <div class="stat-label">Süre</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="sections-completed">3/3</div>
                    <div class="stat-label">Bölüm</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="completion-status">Tam</div>
                    <div class="stat-label">Tamamlama</div>
                </div>
            </div>
        </header>

        <!-- Performance -->
        <section class="performance-section">
            <h2 class="performance-title">Genel Dikkat Performansı</h2>
            
            <div class="performance-gauge-container">
                <svg class="performance-gauge" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1"/>
                            <stop offset="50%" style="stop-color:#06b6d4"/>
                            <stop offset="100%" style="stop-color:#f59e0b"/>
                        </linearGradient>
                    </defs>
                    <circle class="gauge-track" cx="100" cy="100" r="90"/>
                    <circle id="performance-gauge-fill" class="gauge-fill" cx="100" cy="100" r="90"/>
                </svg>
                
                <div class="performance-score-container">
                    <div class="performance-score" id="overall-score">83%</div>
                    <div class="performance-score-label">Dikkat Skoru</div>
                </div>
            </div>
            
            <div class="performance-level good" id="performance-rating">İyi Performans</div>
        </section>

        <!-- Metrics -->
        <section class="metrics-grid">
            <div class="metric-card success">
                <div class="metric-value" id="correct-count">128</div>
                <div class="metric-label">Doğru İşaretleme</div>
            </div>
            <div class="metric-card warning">
                <div class="metric-value" id="missed-count">18</div>
                <div class="metric-label">Kaçırılan Hedef</div>
            </div>
            <div class="metric-card danger">
                <div class="metric-value" id="wrong-count">9</div>
                <div class="metric-label">Yanlış İşaretleme</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="total-points">101</div>
                <div class="metric-label">Toplam Puan</div>
            </div>
        </section>

        <!-- Chart -->
        <section class="chart-section">
            <h2 class="section-title">Test Sonuçları Dağılımı</h2>
            
            <div class="chart-container">
                <div class="donut-chart">
                    <svg viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="70" fill="none" stroke="#e2e8f0" stroke-width="20"/>
                        <circle id="donut-correct" cx="100" cy="100" r="70" fill="none" 
                                stroke="#10b981" stroke-width="20" class="donut-segment"/>
                        <circle id="donut-missed" cx="100" cy="100" r="70" fill="none" 
                                stroke="#f59e0b" stroke-width="20" class="donut-segment"/>
                        <circle id="donut-wrong" cx="100" cy="100" r="70" fill="none" 
                                stroke="#ef4444" stroke-width="20" class="donut-segment"/>
                    </svg>
                    
                    <div class="chart-center">
                        <div class="center-value" id="total-items">155</div>
                        <div class="center-label">Toplam</div>
                    </div>
                </div>
                
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #10b981;"></div>
                        <span class="legend-text">Doğru</span>
                        <span class="legend-value" id="correct-legend">128 (83%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #f59e0b;"></div>
                        <span class="legend-text">Kaçırılan</span>
                        <span class="legend-value" id="missed-legend">18 (12%)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ef4444;"></div>
                        <span class="legend-text">Yanlış</span>
                        <span class="legend-value" id="wrong-legend">9 (6%)</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Data Table -->
        <section class="chart-section">
            <h2 class="section-title">Bölüm Detayları</h2>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Bölüm</th>
                        <th>Doğru</th>
                        <th>Eksik</th>
                        <th>Yanlış</th>
                        <th>Skor</th>
                        <th>Değerlendirme</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Bölüm 1</strong></td>
                        <td id="s1-correct">38</td>
                        <td id="s1-missed">10</td>
                        <td id="s1-wrong">5</td>
                        <td id="s1-score">23</td>
                        <td><span class="score-badge score-medium" id="s1-eval">Normal</span></td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 2</strong></td>
                        <td id="s2-correct">42</td>
                        <td id="s2-missed">6</td>
                        <td id="s2-wrong">3</td>
                        <td id="s2-score">33</td>
                        <td><span class="score-badge score-high" id="s2-eval">İyi</span></td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 3</strong></td>
                        <td id="s3-correct">48</td>
                        <td id="s3-missed">2</td>
                        <td id="s3-wrong">1</td>
                        <td id="s3-score">45</td>
                        <td><span class="score-badge score-high" id="s3-eval">Çok İyi</span></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Insights -->
        <section class="insights-section">
            <h2 class="section-title">Analiz ve Öneriler</h2>
            
            <div class="insights-grid">
                <div class="insight-card positive">
                    <div class="insight-title">🎯 Seçici Dikkat</div>
                    <div class="insight-text" id="selective-text">
                        Toplam eksik puanı normal aralığında. Seçici dikkat becerileri yeterli düzeyde.
                    </div>
                </div>
                
                <div class="insight-card positive">
                    <div class="insight-title">📈 Sürdürülebilir Dikkat</div>
                    <div class="insight-text" id="sustained-text">
                        Test ilerledikçe performans artmış. Dikkat sürdürme becerisi güçlü.
                    </div>
                </div>
                
                <div class="insight-card warning">
                    <div class="insight-title">📊 Dikkat Salınımı</div>
                    <div class="insight-text" id="fluctuation-text">
                        İlk bölümde adaptasyon süreci gözlenmiş, sonrasında performans stabil.
                    </div>
                </div>
                
                <div class="insight-card positive">
                    <div class="insight-title">💡 Genel Değerlendirme</div>
                    <div class="insight-text" id="overall-text">
                        Dikkat performansı iyi düzeyde. Test sürdürme becerisi güçlü.
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div>
                <strong>Burdon Dikkat Testi</strong> - 
                <span id="report-date">Rapor Tarihi: 15 Aralık 2024</span>
            </div>
        </footer>
    </div>

    <script>
        // Load test results
        function loadTestResults(testData) {
            // Update header
            document.getElementById('test-date').textContent = formatDate(testData.test_start_time);
            document.getElementById('test-duration').textContent = formatDuration(testData.test_elapsed_time_seconds);
            document.getElementById('sections-completed').textContent = `${testData.completedSections}/3`;
            
            // Update performance
            const ratio = Math.round(testData.attention_ratio * 100);
            document.getElementById('overall-score').textContent = ratio + '%';
            updatePerformanceGauge(ratio);
            updatePerformanceRating(ratio);

            // Update metrics
            document.getElementById('correct-count').textContent = testData.total_correct;
            document.getElementById('missed-count').textContent = testData.total_missed;
            document.getElementById('wrong-count').textContent = testData.total_wrong;
            document.getElementById('total-points').textContent = testData.total_score;

            // Update chart
            updateChart(testData);
            
            // Update table
            updateTable(testData.sections_results);
        }

        function formatDate(timestamp) {
            return new Intl.DateTimeFormat('tr-TR', {
                day: 'numeric',
                month: 'short'
            }).format(new Date(timestamp));
        }

        function formatDuration(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }

        function updatePerformanceGauge(percentage) {
            const gauge = document.getElementById('performance-gauge-fill');
            const circumference = 2 * Math.PI * 90; // radius = 90
            const offset = circumference - (percentage / 100) * circumference;
            
            setTimeout(() => {
                gauge.style.strokeDashoffset = offset;
            }, 800);
        }

        function updatePerformanceRating(ratio) {
            const rating = document.getElementById('performance-rating');
            if (ratio >= 85) {
                rating.textContent = 'ÇOK İYİ PERFORMANS';
                rating.className = 'performance-level excellent';
            } else if (ratio >= 70) {
                rating.textContent = 'İYİ PERFORMANS';
                rating.className = 'performance-level good';
            } else if (ratio >= 50) {
                rating.textContent = 'ORTA PERFORMANS';
                rating.className = 'performance-level average';
            } else {
                rating.textContent = 'DÜŞÜK PERFORMANS';
                rating.className = 'performance-level poor';
            }
        }

        function updateChart(testData) {
            const total = testData.total_correct + testData.total_missed + testData.total_wrong;
            document.getElementById('total-items').textContent = total;
            
            const correctPercent = Math.round((testData.total_correct / total) * 100);
            const missedPercent = Math.round((testData.total_missed / total) * 100);
            const wrongPercent = Math.round((testData.total_wrong / total) * 100);
            
            document.getElementById('correct-legend').textContent = `${testData.total_correct} (${correctPercent}%)`;
            document.getElementById('missed-legend').textContent = `${testData.total_missed} (${missedPercent}%)`;
            document.getElementById('wrong-legend').textContent = `${testData.total_wrong} (${wrongPercent}%)`;

            // Update donut chart
            const circumference = 2 * Math.PI * 70;
            let offset = 0;

            const correctArc = (testData.total_correct / total) * circumference;
            const missedArc = (testData.total_missed / total) * circumference;
            const wrongArc = (testData.total_wrong / total) * circumference;

            document.getElementById('donut-correct').style.strokeDasharray = `${correctArc} ${circumference}`;
            document.getElementById('donut-correct').style.strokeDashoffset = -offset;
            offset += correctArc;

            document.getElementById('donut-missed').style.strokeDasharray = `${missedArc} ${circumference}`;
            document.getElementById('donut-missed').style.strokeDashoffset = -offset;
            offset += missedArc;

            document.getElementById('donut-wrong').style.strokeDasharray = `${wrongArc} ${circumference}`;
            document.getElementById('donut-wrong').style.strokeDashoffset = -offset;
        }

        function updateTable(sections) {
            Object.keys(sections).forEach((key, index) => {
                const section = sections[key];
                const num = index + 1;
                
                document.getElementById(`s${num}-correct`).textContent = section.correct;
                document.getElementById(`s${num}-missed`).textContent = section.missed;
                document.getElementById(`s${num}-wrong`).textContent = section.wrong;
                document.getElementById(`s${num}-score`).textContent = section.score;
                
                const evalElement = document.getElementById(`s${num}-eval`);
                if (section.score >= 40) {
                    evalElement.textContent = 'Çok İyi';
                    evalElement.className = 'score-badge score-high';
                } else if (section.score >= 25) {
                    evalElement.textContent = 'İyi';
                    evalElement.className = 'score-badge score-high';
                } else {
                    evalElement.textContent = 'Normal';
                    evalElement.className = 'score-badge score-medium';
                }
            });
        }

        // Initialize with sample data
        document.addEventListener('DOMContentLoaded', function() {
            const sampleData = {
                test_start_time: Date.now() - 273000,
                test_elapsed_time_seconds: 273,
                completedSections: 3,
                total_correct: 128,
                total_missed: 18,
                total_wrong: 9,
                total_score: 101,
                attention_ratio: 0.83,
                sections_results: {
                    section1: { correct: 38, missed: 10, wrong: 5, score: 23 },
                    section2: { correct: 42, missed: 6, wrong: 3, score: 33 },
                    section3: { correct: 48, missed: 2, wrong: 1, score: 45 }
                }
            };
            
            loadTestResults(sampleData);
        });
    </script>
</body>
</html> `;
}
