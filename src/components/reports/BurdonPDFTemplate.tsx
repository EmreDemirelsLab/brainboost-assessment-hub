
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
    <title>Burdon Dikkat Testi - Premium Analiz Raporu</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        /* === PDF OPTIMIZATION === */
        @page {
            margin: 15mm;
            size: A4;
        }

        @media print {
            body { 
                margin: 0; 
                font-size: 10pt; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            .page-break-avoid { page-break-inside: avoid; }
        }

        /* === VARIABLES === */
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #e0e7ff;
            --secondary: #06b6d4;
            --accent: #f59e0b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --neutral-50: #fafafa;
            --neutral-100: #f5f5f5;
            --neutral-200: #e5e5e5;
            --neutral-300: #d4d4d4;
            --neutral-400: #a3a3a3;
            --neutral-500: #737373;
            --neutral-600: #525252;
            --neutral-700: #404040;
            --neutral-800: #262626;
            --neutral-900: #171717;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* === BASE STYLES === */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            line-height: 1.7;
            color: var(--neutral-800);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            font-size: 14px;
            letter-spacing: -0.025em;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 24px;
            background: white;
            min-height: 100vh;
        }

        /* === HEADER SECTION === */
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%);
            margin: -24px -24px 48px -24px;
            padding: 48px 48px 60px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
            opacity: 0.1;
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
        }

        .title-container {
            display: inline-block;
            background: white;
            border: 1px solid rgba(99, 102, 241, 0.15);
            border-radius: 20px;
            padding: 28px 48px;
            margin: 0 auto 24px;
            box-shadow: 
                0 10px 25px -5px rgba(0, 0, 0, 0.15),
                0 20px 40px -10px rgba(99, 102, 241, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transition: all 0.4s ease;
            cursor: pointer;
        }

        .title-container:hover {
            background: #ffffff;
            border-color: rgba(99, 102, 241, 0.25);
            box-shadow: 
                0 15px 35px -5px rgba(0, 0, 0, 0.2),
                0 25px 50px -10px rgba(99, 102, 241, 0.15),
                0 8px 16px -4px rgba(0, 0, 0, 0.1);
            transform: translateY(-3px);
        }

        .header-title {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .title-accent {
            font-size: 1.6rem;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            position: relative;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .title-accent::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 0%, 
                #6366f1 15%, 
                #8b5cf6 85%, 
                transparent 100%);
            border-radius: 50px;
            opacity: 0.8;
            filter: blur(0.5px);
        }

        .title-accent::before {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 5%, 
                rgba(99, 102, 241, 0.6) 25%, 
                rgba(139, 92, 246, 0.8) 75%, 
                transparent 95%);
            border-radius: 50px;
            clip-path: polygon(
                0% 50%, 
                15% 20%, 
                25% 80%, 
                40% 30%, 
                55% 70%, 
                70% 25%, 
                85% 75%, 
                100% 50%
            );
        }

        .title-main {
            font-size: 2.8rem;
            font-weight: 400;
            color: #1e293b;
            letter-spacing: -0.01em;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            line-height: 1.1;
            background: linear-gradient(135deg, #1e293b, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            font-weight: 300;
        }

        .header-logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            backdrop-filter: blur(10px);
        }

        .header-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-top: 32px;
        }

        .header-stat {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-stat-value {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .header-stat-label {
            font-size: 0.85rem;
            opacity: 0.8;
            font-weight: 400;
        }

        /* === PERFORMANCE HERO === */
        .performance-hero {
            background: white;
            border-radius: 24px;
            padding: 48px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--neutral-200);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .performance-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
        }

        .performance-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--neutral-700);
            margin-bottom: 32px;
        }

        .performance-gauge-container {
            position: relative;
            width: 280px;
            height: 280px;
            margin: 0 auto 32px;
        }

        .performance-gauge {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .gauge-track {
            fill: none;
            stroke: var(--neutral-200);
            stroke-width: 20;
        }

        .gauge-fill {
            fill: none;
            stroke: url(#gradient);
            stroke-width: 20;
            stroke-linecap: round;
            stroke-dasharray: 628;
            stroke-dashoffset: 628;
            transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .performance-score {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .performance-score-value {
            font-size: 3.5rem;
            font-weight: 800;
            color: var(--primary);
            line-height: 1;
            margin-bottom: 8px;
        }

        .performance-score-label {
            font-size: 1rem;
            color: var(--neutral-600);
            font-weight: 500;
        }

        .performance-level {
            font-size: 1.3rem;
            font-weight: 700;
            margin-top: 16px;
            padding: 12px 24px;
            border-radius: 50px;
            display: inline-block;
        }

        .performance-level.excellent {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .performance-level.good {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
        }

        .performance-level.average {
            background: linear-gradient(135deg, var(--warning), #d97706);
            color: white;
        }

        .performance-level.poor {
            background: linear-gradient(135deg, var(--danger), #dc2626);
            color: white;
        }

        /* === METRICS GRID === */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
        }

        .metric-card {
            background: white;
            border-radius: 20px;
            padding: 32px 24px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--neutral-200);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary);
        }

        .metric-card.success::before { background: var(--success); }
        .metric-card.warning::before { background: var(--warning); }
        .metric-card.danger::before { background: var(--danger); }

        .metric-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 16px;
            background: var(--primary-light);
            color: var(--primary);
        }

        .metric-card.success .metric-icon {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .metric-card.warning .metric-icon {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .metric-card.danger .metric-icon {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 8px;
            color: var(--neutral-800);
        }

        .metric-label {
            font-size: 0.95rem;
            color: var(--neutral-600);
            font-weight: 500;
        }

        /* === SECTION ANALYSIS === */
        .section-analysis {
            background: white;
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--neutral-200);
        }

        .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--neutral-800);
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 32px;
            background: linear-gradient(to bottom, var(--primary), var(--secondary));
            border-radius: 2px;
        }

        .chart-container {
            margin-bottom: 40px;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .chart-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--neutral-700);
        }

        .chart-legend {
            display: flex;
            gap: 20px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .bar-chart {
            display: flex;
            align-items: end;
            height: 240px;
            gap: 32px;
            padding: 0 20px;
            border-bottom: 2px solid var(--neutral-200);
            position: relative;
        }

        .bar-group {
            flex: 1;
            display: flex;
            align-items: end;
            gap: 8px;
            height: 100%;
        }

        .bar {
            flex: 1;
            min-height: 16px;
            border-radius: 8px 8px 0 0;
            position: relative;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bar.correct { background: linear-gradient(to top, var(--success), #34d399); }
        .bar.missed { background: linear-gradient(to top, var(--warning), #fbbf24); }
        .bar.wrong { background: linear-gradient(to top, var(--danger), #fb7185); }

        .bar-value {
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--neutral-700);
        }

        .bar-label {
            text-align: center;
            margin-top: 16px;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--neutral-600);
        }

        /* === DATA TABLE === */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 32px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: var(--shadow-md);
        }

        .data-table thead {
            background: linear-gradient(135deg, var(--neutral-800), var(--neutral-700));
            color: white;
        }

        .data-table th {
            padding: 20px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9rem;
            letter-spacing: 0.05em;
        }

        .data-table td {
            padding: 20px 16px;
            border-bottom: 1px solid var(--neutral-200);
            font-size: 0.95rem;
        }

        .data-table tbody tr {
            transition: background-color 0.2s ease;
        }

        .data-table tbody tr:hover {
            background-color: var(--neutral-50);
        }

        .data-table tbody tr:nth-child(even) {
            background-color: var(--neutral-50);
        }

        .data-table tbody tr:last-child td {
            border-bottom: none;
        }

        .table-score {
            font-weight: 700;
            padding: 8px 16px;
            border-radius: 20px;
            text-align: center;
        }

        .table-score.high {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .table-score.medium {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .table-score.low {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }

        /* === INSIGHTS SECTION === */
        .insights-section {
            background: linear-gradient(135deg, var(--neutral-50) 0%, white 100%);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            border: 1px solid var(--neutral-200);
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
        }

        .insight-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: var(--shadow-md);
            border-left: 4px solid var(--primary);
        }

        .insight-card.positive {
            border-left-color: var(--success);
        }

        .insight-card.neutral {
            border-left-color: var(--warning);
        }

        .insight-card.negative {
            border-left-color: var(--danger);
        }

        .insight-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .insight-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            background: var(--primary-light);
            color: var(--primary);
        }

        .insight-card.positive .insight-icon {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .insight-card.neutral .insight-icon {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .insight-card.negative .insight-icon {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }

        .insight-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--neutral-800);
        }

        .insight-text {
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(--neutral-600);
        }

        /* === FOOTER === */
        .footer {
            margin-top: 60px;
            padding-top: 32px;
            border-top: 1px solid var(--neutral-200);
            text-align: center;
            color: var(--neutral-500);
            font-size: 0.9rem;
        }

        .footer-content {
            display: flex;
            justify-content: between;
            align-items: center;
            gap: 24px;
        }

        .footer-logo {
            font-weight: 700;
            color: var(--primary);
        }

        /* === PIE CHARTS === */
        .charts-section {
            background: white;
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--neutral-200);
        }



        .pie-chart-container {
            text-align: center;
            background: var(--neutral-50);
            border-radius: 20px;
            padding: 32px 24px;
            border: 1px solid var(--neutral-200);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .pie-chart-container:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }

        .pie-chart-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--neutral-800);
            margin-bottom: 24px;
        }

        .pie-chart {
            width: 220px;
            height: 220px;
            margin: 0 auto 24px;
            position: relative;
        }

        .pie-chart svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        .pie-slice {
            stroke-width: 2;
            stroke: white;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            opacity: 0;
            transform: scale(0.8);
            transform-origin: center;
        }

        .pie-slice.animate {
            opacity: 1;
            transform: scale(1);
        }

        .pie-slice:hover {
            filter: brightness(1.1) drop-shadow(0 6px 12px rgba(0,0,0,0.15));
            stroke-width: 3;
            transform: scale(1.02);
        }

        .pie-chart-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }

        .pie-center-value {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            line-height: 1;
        }

        .pie-center-label {
            font-size: 0.9rem;
            color: var(--neutral-600);
            margin-top: 4px;
        }

        .pie-legend {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .pie-legend-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            background: white;
            border-radius: 8px;
            transition: background-color 0.3s ease;
        }

        .pie-legend-item:hover {
            background: var(--primary-light);
        }

        .pie-legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            margin-right: 12px;
        }

        .pie-legend-label {
            flex: 1;
            text-align: left;
            font-size: 0.95rem;
            font-weight: 500;
        }

        .pie-legend-value {
            font-weight: 700;
            font-size: 0.9rem;
            color: var(--neutral-700);
        }

        .pie-legend-percentage {
            font-size: 0.85rem;
            color: var(--neutral-500);
            margin-left: 8px;
        }

        /* === MODERN LEGEND === */
        .modern-legend-item {
            display: flex;
            align-items: center;
            padding: 20px;
            border-radius: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .modern-legend-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .legend-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 1.1rem;
            margin-right: 16px;
            box-shadow: var(--shadow-sm);
        }

        .legend-content {
            flex: 1;
        }

        .legend-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--neutral-700);
            margin-bottom: 4px;
        }

        .legend-stats {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .legend-count {
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--neutral-800);
        }

        .legend-percent {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--neutral-600);
            background: rgba(0, 0, 0, 0.05);
            padding: 4px 8px;
            border-radius: 8px;
        }

        /* === DONUT CHART === */
        .donut-segment {
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            opacity: 0;
        }

        .donut-segment:hover {
            stroke-width: 24;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }



        /* === UTILITIES === */
        .export-btn {
            position: fixed;
            top: 24px;
            right: 24px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-xl);
        }

        .text-center { text-align: center; }
        .no-print { }
    </style>
</head>
<body>
    <button class="export-btn no-print" onclick="window.print()">📑 PDF Olarak İndir</button>
    
    <div class="container">
        <!-- Premium Header -->
        <header class="header page-break-avoid">
            <div class="header-content">
                <div class="header-top">
                    <div style="text-align: center; width: 100%;">
                        <div class="title-container">
                            <h1 class="header-title">
                                <span class="title-accent">Burdon Testi</span>
                                <span class="title-main">Değerlendirme Raporu</span>
                            </h1>
                        </div>
                    </div>
                </div>
                
                <div class="header-stats">
                    <div class="header-stat">
                        <div class="header-stat-value" id="test-date-short">15 Ara</div>
                        <div class="header-stat-label">Test Tarihi</div>
                    </div>
                    <div class="header-stat">
                        <div class="header-stat-value" id="test-duration-short">4:33</div>
                        <div class="header-stat-label">Gerçekleşen Süre</div>
                    </div>
                    <div class="header-stat">
                        <div class="header-stat-value" id="sections-completed">2/3</div>
                        <div class="header-stat-label">Tamamlanan Bölge</div>
                    </div>
                    <div class="header-stat">
                        <div class="header-stat-value" id="completion-status">Otomatik</div>
                        <div class="header-stat-label">Sonlanma</div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Performance Hero Section -->
        <section class="performance-hero page-break-avoid">
            <h2 class="performance-title">Genel Dikkat Performansı</h2>
            
            <div class="performance-gauge-container">
                <svg class="performance-gauge" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1"/>
                            <stop offset="50%" style="stop-color:#06b6d4"/>
                            <stop offset="100%" style="stop-color:#f59e0b"/>
                        </linearGradient>
                    </defs>
                    <circle class="gauge-track" cx="100" cy="100" r="90"/>
                    <circle id="performance-gauge-fill" class="gauge-fill" cx="100" cy="100" r="90"/>
                </svg>
                
                <div class="performance-score">
                    <div class="performance-score-value" id="overall-score">83%</div>
                    <div class="performance-score-label">Dikkat Skoru</div>
                </div>
            </div>
            
            <div class="performance-level good" id="performance-rating">İYİ PERFORMANS</div>
        </section>

        <!-- Metrics Grid -->
        <section class="metrics-grid page-break-avoid">
            <div class="metric-card success">
                <div class="metric-icon">✓</div>
                <div class="metric-value" id="correct-count">128</div>
                <div class="metric-label">Doğru İşaretleme</div>
            </div>
            
            <div class="metric-card warning">
                <div class="metric-icon">○</div>
                <div class="metric-value" id="missed-count">18</div>
                <div class="metric-label">Kaçırılan Hedef</div>
            </div>
            
            <div class="metric-card danger">
                <div class="metric-icon">✗</div>
                <div class="metric-value" id="wrong-count">9</div>
                <div class="metric-label">Yanlış İşaretleme</div>
            </div>
            
            <div class="metric-card primary">
                <div class="metric-icon">★</div>
                <div class="metric-value" id="total-points">101</div>
                <div class="metric-label">Toplam Puan</div>
            </div>
        </section>

        <!-- Section Analysis -->
        <section class="section-analysis page-break">
            <h2 class="section-title">Bölüm Bazında Analiz</h2>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h3 class="chart-title">Performans Karşılaştırması</h3>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: var(--success);"></div>
                            <span>Doğru</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: var(--warning);"></div>
                            <span>Kaçırılan</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: var(--danger);"></div>
                            <span>Yanlış</span>
                        </div>
                    </div>
                </div>
                
                <div class="bar-chart">
                    <div class="bar-group">
                        <div class="bar correct" style="height: 70%;" data-section="1" data-type="correct">
                            <div class="bar-value">15</div>
                        </div>
                        <div class="bar missed" style="height: 30%;" data-section="1" data-type="missed">
                            <div class="bar-value">4</div>
                        </div>
                        <div class="bar wrong" style="height: 20%;" data-section="1" data-type="wrong">
                            <div class="bar-value">2</div>
                        </div>
                        <div class="bar-label">Bölüm 1</div>
                    </div>
                    
                    <div class="bar-group">
                        <div class="bar correct" style="height: 85%;" data-section="2" data-type="correct">
                            <div class="bar-value">18</div>
                        </div>
                        <div class="bar missed" style="height: 25%;" data-section="2" data-type="missed">
                            <div class="bar-value">3</div>
                        </div>
                        <div class="bar wrong" style="height: 15%;" data-section="2" data-type="wrong">
                            <div class="bar-value">1</div>
                        </div>
                        <div class="bar-label">Bölüm 2</div>
                    </div>
                    
                    <div class="bar-group">
                        <div class="bar correct" style="height: 55%;" data-section="3" data-type="correct">
                            <div class="bar-value">12</div>
                        </div>
                        <div class="bar missed" style="height: 45%;" data-section="3" data-type="missed">
                            <div class="bar-value">5</div>
                        </div>
                        <div class="bar wrong" style="height: 35%;" data-section="3" data-type="wrong">
                            <div class="bar-value">4</div>
                        </div>
                        <div class="bar-label">Bölüm 3</div>
                    </div>
                </div>
            </div>

            <!-- Detailed Data Table -->
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Bölüm</th>
                        <th>Doğru (D)</th>
                        <th>Eksik (E)</th>
                        <th>Yanlış (Y)</th>
                        <th>Skor (D - (E+Y))</th>
                        <th>Oran</th>
                        <th>Değerlendirme</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Bölüm 1</strong></td>
                        <td id="section1-correct-table">38</td>
                        <td id="section1-missed-table">10</td>
                        <td id="section1-wrong-table">5</td>
                        <td id="section1-score-table">23</td>
                        <td id="section1-ratio-table">0.193</td>
                        <td><span class="table-score medium" id="section1-evaluation">Normal</span></td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 2</strong></td>
                        <td id="section2-correct-table">42</td>
                        <td id="section2-missed-table">6</td>
                        <td id="section2-wrong-table">3</td>
                        <td id="section2-score-table">33</td>
                        <td id="section2-ratio-table">0.277</td>
                        <td><span class="table-score high" id="section2-evaluation">İyi</span></td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 3</strong></td>
                        <td id="section3-correct-table">48</td>
                        <td id="section3-missed-table">2</td>
                        <td id="section3-wrong-table">1</td>
                        <td id="section3-score-table">45</td>
                        <td id="section3-ratio-table">0.378</td>
                        <td><span class="table-score high" id="section3-evaluation">Çok İyi</span></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Performance Pie Chart -->
        <section class="charts-section page-break-avoid">
            <h2 class="section-title">Test Sonuçları Dağılımı</h2>
            
            <div style="display: flex; justify-content: center; gap: 40px; align-items: center;">
                <!-- Modern Donut Chart -->
                <div style="position: relative; width: 280px; height: 280px;">
                    <svg viewBox="0 0 200 200" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                        <!-- Background circle -->
                        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--neutral-200)" stroke-width="20"/>
                        
                        <!-- Donut segments -->
                        <circle id="donut-correct" cx="100" cy="100" r="70" fill="none" 
                                stroke="#22c55e" stroke-width="20" stroke-linecap="round"
                                stroke-dasharray="0 440" class="donut-segment"/>
                        <circle id="donut-missed" cx="100" cy="100" r="70" fill="none" 
                                stroke="#f97316" stroke-width="20" stroke-linecap="round"
                                stroke-dasharray="0 440" class="donut-segment"/>
                        <circle id="donut-wrong" cx="100" cy="100" r="70" fill="none" 
                                stroke="#ef4444" stroke-width="20" stroke-linecap="round"
                                stroke-dasharray="0 440" class="donut-segment"/>
                    </svg>
                    
                    <!-- Center content -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary); line-height: 1;" id="pie-total-items">155</div>
                        <div style="font-size: 1rem; color: var(--neutral-600); margin-top: 4px;">Toplam İşlem</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary); margin-top: 8px;" id="overall-percentage">83%</div>
                        <div style="font-size: 0.9rem; color: var(--neutral-500);">Başarı Oranı</div>
                    </div>
                </div>
                
                <!-- Modern Legend -->
                <div style="display: flex; flex-direction: column; gap: 16px; min-width: 250px;">
                                            <div class="modern-legend-item" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border-left: 4px solid #22c55e;">
                            <div class="legend-icon" style="background: #22c55e;">✓</div>
                            <div class="legend-content">
                                <div class="legend-title">Doğru İşaretleme</div>
                                <div class="legend-stats">
                                    <span class="legend-count" id="correct-count-legend">128</span>
                                    <span class="legend-percent" id="correct-percent-legend">83%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modern-legend-item" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05)); border-left: 4px solid #f97316;">
                            <div class="legend-icon" style="background: #f97316;">○</div>
                            <div class="legend-content">
                                <div class="legend-title">Kaçırılan Hedef</div>
                                <div class="legend-stats">
                                    <span class="legend-count" id="missed-count-legend">18</span>
                                    <span class="legend-percent" id="missed-percent-legend">12%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modern-legend-item" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-left: 4px solid #ef4444;">
                            <div class="legend-icon" style="background: #ef4444;">✗</div>
                            <div class="legend-content">
                                <div class="legend-title">Yanlış İşaretleme</div>
                                <div class="legend-stats">
                                    <span class="legend-count" id="wrong-count-legend">9</span>
                                    <span class="legend-percent" id="wrong-percent-legend">6%</span>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </section>

        <!-- Insights & Recommendations -->
        <section class="insights-section page-break">
            <h2 class="section-title">Analiz ve Öneriler</h2>
            
            <div class="insights-grid">
                <div class="insight-card positive" id="selective-attention-card">
                    <div class="insight-header">
                        <div class="insight-icon">🎯</div>
                        <div class="insight-title">Seçici Dikkat</div>
                    </div>
                    <div class="insight-text" id="selective-attention-text">
                        Toplam eksik (E) puanı: 18. Bu değer normal aralığında olup seçici dikkat becerileri yeterli düzeydedir.
                    </div>
                </div>
                
                <div class="insight-card positive" id="sustained-attention-card">
                    <div class="insight-header">
                        <div class="insight-icon">📈</div>
                        <div class="insight-title">Sürdürülebilir Dikkat</div>
                    </div>
                    <div class="insight-text" id="sustained-attention-text">
                        Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar azalmıştır. Bu durum sürdürülebilir dikkat kapasitesinin iyi olduğunu göstermektedir.
                    </div>
                </div>
                
                <div class="insight-card neutral" id="attention-fluctuation-card">
                    <div class="insight-header">
                        <div class="insight-icon">📊</div>
                        <div class="insight-title">Dikkat Salınımı</div>
                    </div>
                    <div class="insight-text" id="attention-fluctuation-text">
                        1. bölümde başlangıç performansı sonraki bölümlere göre daha düşüktür. Bu durum test başında odaklanma sürecini yansıtmaktadır.
                    </div>
                </div>
                
                <div class="insight-card positive" id="recommendations-card">
                    <div class="insight-header">
                        <div class="insight-icon">💡</div>
                        <div class="insight-title">Genel Değerlendirme</div>
                    </div>
                    <div class="insight-text" id="recommendations-text">
                        Genel dikkat performansınız iyi düzeydedir. Test ilerledikçe performansınızın artması dikkat sürdürme becerinizin güçlü olduğunu göstermektedir.
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-logo">Burdon Dikkat Testi</div>
                <div id="report-date">Rapor Tarihi: 15 Aralık 2024, 16:45</div>
            </div>
        </footer>
    </div>

    <script>
        // Premium Report JavaScript
        function loadTestResults(testData) {
            // Update header stats
            document.getElementById('test-date-short').textContent = formatShortDate(testData.test_start_time);
            document.getElementById('test-duration-short').textContent = formatDuration(testData.test_elapsed_time_seconds);
            document.getElementById('sections-completed').textContent = `${testData.completedSections}/3`;
            document.getElementById('completion-rate').textContent = testData.test_auto_completed ? '⏱️' : '100%';

            // Update performance metrics
            const ratio = Math.round(testData.attention_ratio * 100);
            document.getElementById('overall-score').textContent = ratio + '%';
            updatePerformanceGauge(ratio);
            updatePerformanceRating(ratio);

            // Update metric cards
            document.getElementById('correct-count').textContent = testData.total_correct;
            document.getElementById('missed-count').textContent = testData.total_missed;
            document.getElementById('wrong-count').textContent = testData.total_wrong;
            document.getElementById('total-points').textContent = testData.total_score;

            // Update chart and table with section data
            updateSectionAnalysis(testData.sections_results);

            // Update footer
            document.getElementById('report-date').textContent = 
                `Rapor Tarihi: ${formatLongDate(Date.now())}`;
        }

        function formatShortDate(timestamp) {
            return new Intl.DateTimeFormat('tr-TR', {
                day: 'numeric',
                month: 'short'
            }).format(new Date(timestamp));
        }

        function formatLongDate(timestamp) {
            return new Intl.DateTimeFormat('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(timestamp));
        }

        function formatDuration(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function updatePerformanceGauge(percentage) {
            const gauge = document.getElementById('performance-gauge-fill');
            const circumference = 2 * Math.PI * 90; // radius = 90
            const offset = circumference - (percentage / 100) * circumference;
            
            setTimeout(() => {
                gauge.style.strokeDashoffset = offset;
            }, 500);
        }

        function updatePerformanceRating(ratio) {
            const ratingElement = document.getElementById('performance-rating');
            if (ratio >= 85) {
                ratingElement.textContent = 'ÇOK İYİ PERFORMANS';
                ratingElement.className = 'performance-level excellent';
            } else if (ratio >= 70) {
                ratingElement.textContent = 'İYİ PERFORMANS';
                ratingElement.className = 'performance-level good';
            } else if (ratio >= 50) {
                ratingElement.textContent = 'NORMAL PERFORMANS';
                ratingElement.className = 'performance-level average';
            } else if (ratio >= 35) {
                ratingElement.textContent = 'ORTA PERFORMANS';
                ratingElement.className = 'performance-level average';
            } else if (ratio >= 21) {
                ratingElement.textContent = 'DÜŞÜK PERFORMANS';
                ratingElement.className = 'performance-level poor';
            } else {
                ratingElement.textContent = 'ÇOK DÜŞÜK PERFORMANS';
                ratingElement.className = 'performance-level poor';
            }
        }

        function updateSectionAnalysis(sectionsData) {
            // Update bar chart heights and values based on actual data
            Object.keys(sectionsData).forEach((sectionKey, index) => {
                const section = sectionsData[sectionKey];
                const sectionNum = index + 1;
                
                // Find max values for scaling
                const maxCorrect = Math.max(...Object.values(sectionsData).map(s => s.correct));
                const maxMissed = Math.max(...Object.values(sectionsData).map(s => s.missed));
                const maxWrong = Math.max(...Object.values(sectionsData).map(s => s.wrong));
                
                // Update bars
                const correctBar = document.querySelector(`[data-section="${sectionNum}"][data-type="correct"]`);
                const missedBar = document.querySelector(`[data-section="${sectionNum}"][data-type="missed"]`);
                const wrongBar = document.querySelector(`[data-section="${sectionNum}"][data-type="wrong"]`);
                
                if (correctBar) {
                    correctBar.style.height = (section.correct / maxCorrect * 100) + '%';
                    correctBar.querySelector('.bar-value').textContent = section.correct;
                }
                if (missedBar) {
                    missedBar.style.height = (section.missed / maxMissed * 100) + '%';
                    missedBar.querySelector('.bar-value').textContent = section.missed;
                }
                if (wrongBar) {
                    wrongBar.style.height = (section.wrong / maxWrong * 100) + '%';
                    wrongBar.querySelector('.bar-value').textContent = section.wrong;
                }
            });
        }

        // === OTOMATIK DEĞERLENDİRME SİSTEMİ ===
        function evaluateSelectiveAttention(totalE) {
            if (totalE <= 12) {
                return { status: 'normal', text: `Toplam eksik (E) puanı: ${totalE}. Bu değer normal aralığında olup seçici dikkat becerileri yeterli düzeydedir.`, type: 'positive' };
            } else if (totalE >= 13 && totalE <= 24) {
                return { status: 'caution', text: `Toplam eksik (E) puanı: ${totalE}. Bu durum kontrol edilmesi gerektiğini göstermektedir.`, type: 'neutral' };
            } else {
                return { status: 'deficit', text: `Toplam eksik (E) puanı: ${totalE}. Bu değer seçici dikkat eksikliği olabileceğini göstermektedir.`, type: 'negative' };
            }
        }

        function evaluateSustainedAttention(sections) {
            const section1 = sections.section1;
            const section2 = sections.section2;
            const section3 = sections.section3;
            
            const eProgression = [section1.missed, section2.missed, section3.missed];
            const yProgression = [section1.wrong, section2.wrong, section3.wrong];
            
            // E ve Y puanlarının artıp artmadığını kontrol et
            const eIncreasing = eProgression[0] < eProgression[1] && eProgression[1] < eProgression[2];
            const yIncreasing = yProgression[0] < yProgression[1] && yProgression[1] < yProgression[2];
            const yGenerallyIncreasing = yProgression.filter((val, i) => i > 0 && val > yProgression[i-1]).length >= 1;
            
            if (eIncreasing && yIncreasing) {
                return { status: 'problem', text: 'Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar artmıştır. Bu durum sürdürülebilir dikkat problemi olduğunu göstermektedir.', type: 'negative' };
            } else if (yGenerallyIncreasing) {
                return { status: 'focus-problem', text: 'Y puanı test ilerledikçe artmaktadır. Bu durum odak problemi olabileceğini göstermektedir.', type: 'negative' };
            } else {
                return { status: 'good', text: 'Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar azalmıştır. Bu durum sürdürülebilir dikkat kapasitesinin iyi olduğunu göstermektedir.', type: 'positive' };
            }
        }

        function evaluateAttentionFluctuation(sections) {
            const section1 = sections.section1;
            const section2 = sections.section2;
            const section3 = sections.section3;
            
            // 1. bölümde yüksek E ve Y, sonra düşüyorsa
            if ((section1.missed + section1.wrong) > (section2.missed + section2.wrong) && 
                (section1.missed + section1.wrong) > (section3.missed + section3.wrong)) {
                return { status: 'start-difficulty', text: '1. bölümde başlangıç performansı sonraki bölümlere göre daha düşüktür. Bu durum test başında odaklanma sürecini yansıtmaktadır.', type: 'neutral' };
            } else {
                return { status: 'stable', text: 'Test boyunca dikkat performansı stabil kalmıştır. Başlangıçtan itibaren iyi odaklanma gösterilmiştir.', type: 'positive' };
            }
        }

        function generateOverallEvaluation(sections, totalScore) {
            const totalE = sections.section1.missed + sections.section2.missed + sections.section3.missed;
            const selectiveEval = evaluateSelectiveAttention(totalE);
            const sustainedEval = evaluateSustainedAttention(sections);
            
            let overallText = '';
            if (selectiveEval.type === 'positive' && sustainedEval.type === 'positive') {
                overallText = 'Genel dikkat performansınız iyi düzeydedir. Test ilerledikçe performansınızın artması dikkat sürdürme becerinizin güçlü olduğunu göstermektedir.';
            } else if (selectiveEval.type === 'negative' || sustainedEval.type === 'negative') {
                overallText = 'Dikkat performansında bazı zorluklar gözlenmektedir. Profesyonel değerlendirme ve dikkat egzersizleri önerilir.';
            } else {
                overallText = 'Dikkat performansınız genel olarak ortalama düzeydedir. Kısa egzersizler ve düzenli molalarla performans artırılabilir.';
            }
            
            return { text: overallText, type: selectiveEval.type === 'positive' && sustainedEval.type === 'positive' ? 'positive' : 'neutral' };
        }

        // === PIE CHART FUNCTIONS ===
        function createPieChart(data, containerId) {
            const total = data.reduce((sum, item) => sum + item.value, 0);
            let currentAngle = 0;
            const radius = 80;
            const centerX = 100;
            const centerY = 100;

            data.forEach((item, index) => {
                const percentage = item.value / total;
                const angle = percentage * 2 * Math.PI;
                
                const x1 = centerX + radius * Math.cos(currentAngle);
                const y1 = centerY + radius * Math.sin(currentAngle);
                const x2 = centerX + radius * Math.cos(currentAngle + angle);
                const y2 = centerY + radius * Math.sin(currentAngle + angle);

                const largeArcFlag = angle > Math.PI ? 1 : 0;

                const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');

                const circle = document.getElementById(containerId + '-' + item.id);
                if (circle) {
                    circle.setAttribute('d', pathData);
                    circle.style.strokeDasharray = `${percentage * 628} 628`;
                    circle.style.strokeDashoffset = currentAngle * 100;
                    
                    // Add animation
                    setTimeout(() => {
                        circle.style.strokeDashoffset = '0';
                    }, 500 + (index * 200));
                }

                currentAngle += angle;
            });
        }

        function updateDonutChart() {
            const overallData = [
                { id: 'correct', value: 128, color: '#22c55e' }, // 38+42+48
                { id: 'missed', value: 18, color: '#f97316' },   // 10+6+2
                { id: 'wrong', value: 9, color: '#ef4444' }      // 5+3+1
            ];

            const total = overallData.reduce((sum, item) => sum + item.value, 0);
            const circumference = 2 * Math.PI * 70; // radius = 70
            let accumulatedOffset = 0;

            overallData.forEach((item, index) => {
                const percentage = item.value / total;
                const segmentLength = percentage * circumference;
                
                const circle = document.getElementById(`donut-${item.id}`);
                if (circle) {
                    // Set stroke-dasharray: segment length, gap to next
                    circle.style.strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
                    circle.style.strokeDashoffset = -accumulatedOffset;
                    
                    // Add staggered animation
                    setTimeout(() => {
                        circle.style.opacity = '1';
                    }, 300 * index);
                }

                accumulatedOffset += segmentLength;
            });

            // Update center values
            document.getElementById('pie-total-items').textContent = total;
            
            // Calculate success ratio (correct / total possible targets)
            const successRatio = Math.round((overallData[0].value / total) * 100);
            document.getElementById('overall-percentage').textContent = successRatio + '%';

            // Update legend values
            document.getElementById('correct-count-legend').textContent = overallData[0].value;
            document.getElementById('correct-percent-legend').textContent = Math.round((overallData[0].value / total) * 100) + '%';
            
            document.getElementById('missed-count-legend').textContent = overallData[1].value;
            document.getElementById('missed-percent-legend').textContent = Math.round((overallData[1].value / total) * 100) + '%';
            
            document.getElementById('wrong-count-legend').textContent = overallData[2].value;
            document.getElementById('wrong-percent-legend').textContent = Math.round((overallData[2].value / total) * 100) + '%';
        }



        function addChartInteractivity() {
            // Add hover effects to donut segments
            document.querySelectorAll('.donut-segment').forEach(segment => {
                segment.addEventListener('mouseenter', function() {
                    this.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1)';
                    this.style.strokeWidth = '24';
                });

                segment.addEventListener('mouseleave', function() {
                    this.style.filter = 'none';
                    this.style.strokeWidth = '20';
                });
            });

            // Add click events for modern legend items
            document.querySelectorAll('.modern-legend-item').forEach((item, index) => {
                item.addEventListener('click', function() {
                    this.style.transform = 'translateY(-4px) scale(1.02)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
            });
        }

        function loadChartData(testData) {
            if (testData) {
                // Update donut chart with real data
                const total = testData.total_correct + testData.total_missed + testData.total_wrong;
                const overallData = [
                    { id: 'correct', value: testData.total_correct, color: '#22c55e' },
                    { id: 'missed', value: testData.total_missed, color: '#f97316' },
                    { id: 'wrong', value: testData.total_wrong, color: '#ef4444' }
                ];

                const circumference = 2 * Math.PI * 70;
                let accumulatedOffset = 0;

                overallData.forEach((item, index) => {
                    const percentage = item.value / total;
                    const segmentLength = percentage * circumference;
                    
                    const circle = document.getElementById(`donut-${item.id}`);
                    if (circle) {
                        circle.style.strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
                        circle.style.strokeDashoffset = -accumulatedOffset;
                        
                        setTimeout(() => {
                            circle.style.opacity = '1';
                        }, 300 * index);
                    }

                    accumulatedOffset += segmentLength;
                });

                // Update center and legend values
                document.getElementById('pie-total-items').textContent = total;
                
                const successRatio = Math.round((testData.total_correct / total) * 100);
                document.getElementById('overall-percentage').textContent = successRatio + '%';

                document.getElementById('correct-count-legend').textContent = testData.total_correct;
                document.getElementById('correct-percent-legend').textContent = Math.round((testData.total_correct / total) * 100) + '%';
                
                document.getElementById('missed-count-legend').textContent = testData.total_missed;
                document.getElementById('missed-percent-legend').textContent = Math.round((testData.total_missed / total) * 100) + '%';
                
                document.getElementById('wrong-count-legend').textContent = testData.total_wrong;
                document.getElementById('wrong-percent-legend').textContent = Math.round((testData.total_wrong / total) * 100) + '%';
            } else {
                // Initialize with default data
                updateDonutChart();
            }
            
            addChartInteractivity();
        }

        // Initialize animations on load
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                // Sample test data based on the provided table
                const sampleData = {
                    test_start_time: Date.now() - 273000, // 273 seconds ago
                    test_end_time: Date.now(),
                    test_elapsed_time_seconds: 273,
                    test_auto_completed: true,
                    completedSections: 2,
                    total_correct: 128, // 38+42+48
                    total_missed: 18,   // 10+6+2
                    total_wrong: 9,     // 5+3+1
                    total_score: 101,   // 23+33+45
                    attention_ratio: 0.83, // Average ratio
                    sections_results: {
                        section1: { correct: 38, missed: 10, wrong: 5, score: 23 },
                        section2: { correct: 42, missed: 6, wrong: 3, score: 33 },
                        section3: { correct: 48, missed: 2, wrong: 1, score: 45 }
                    }
                };

                loadTestResults(sampleData); // Load with sample data
            }, 1000);
        });

        // Enhanced loadTestResults function
        function loadTestResults(testData) {
            // Update header stats
            document.getElementById('test-date-short').textContent = formatShortDate(testData.test_start_time);
            document.getElementById('test-duration-short').textContent = formatDuration(testData.test_elapsed_time_seconds);
            document.getElementById('sections-completed').textContent = `${testData.completedSections}/3`;
            document.getElementById('completion-status').textContent = testData.test_auto_completed ? 'Otomatik' : 'Manuel';

            // Update performance metrics
            const ratio = Math.round(testData.attention_ratio * 100);
            document.getElementById('overall-score').textContent = ratio + '%';
            updatePerformanceGauge(ratio);
            updatePerformanceRating(ratio);

            // Update metric cards
            document.getElementById('correct-count').textContent = testData.total_correct;
            document.getElementById('missed-count').textContent = testData.total_missed;
            document.getElementById('wrong-count').textContent = testData.total_wrong;
            document.getElementById('total-points').textContent = testData.total_score;

            // Update detailed table
            updateDetailedTable(testData.sections_results);

            // Update chart and table with section data
            updateSectionAnalysis(testData.sections_results);
            
            // Update charts with real data
            loadChartData(testData);

            // Perform automatic evaluations
            performAutomaticEvaluations(testData.sections_results);

            // Update footer
            document.getElementById('report-date').textContent = 
                `Rapor Tarihi: ${formatLongDate(Date.now())}`;
        }

        function updateDetailedTable(sectionsData) {
            Object.keys(sectionsData).forEach((sectionKey, index) => {
                const section = sectionsData[sectionKey];
                const sectionNum = index + 1;
                
                document.getElementById(`section${sectionNum}-correct-table`).textContent = section.correct;
                document.getElementById(`section${sectionNum}-missed-table`).textContent = section.missed;
                document.getElementById(`section${sectionNum}-wrong-table`).textContent = section.wrong;
                document.getElementById(`section${sectionNum}-score-table`).textContent = section.score;
                document.getElementById(`section${sectionNum}-ratio-table`).textContent = (section.score / (section.correct + section.missed + section.wrong)).toFixed(3);
                
                // Evaluation based on score
                const evaluation = document.getElementById(`section${sectionNum}-evaluation`);
                if (section.score >= 40) {
                    evaluation.textContent = 'Çok İyi';
                    evaluation.className = 'table-score high';
                } else if (section.score >= 25) {
                    evaluation.textContent = 'İyi';
                    evaluation.className = 'table-score high';
                } else if (section.score >= 15) {
                    evaluation.textContent = 'Normal';
                    evaluation.className = 'table-score medium';
                } else {
                    evaluation.textContent = 'Düşük';
                    evaluation.className = 'table-score low';
                }
            });
        }

        function performAutomaticEvaluations(sectionsData) {
            const totalE = sectionsData.section1.missed + sectionsData.section2.missed + sectionsData.section3.missed;
            
            // Seçici dikkat değerlendirmesi
            const selectiveEval = evaluateSelectiveAttention(totalE);
            document.getElementById('selective-attention-text').textContent = selectiveEval.text;
            document.getElementById('selective-attention-card').className = `insight-card ${selectiveEval.type}`;
            
            // Sürdürülebilir dikkat değerlendirmesi
            const sustainedEval = evaluateSustainedAttention(sectionsData);
            document.getElementById('sustained-attention-text').textContent = sustainedEval.text;
            document.getElementById('sustained-attention-card').className = `insight-card ${sustainedEval.type}`;
            
            // Dikkat salınımı değerlendirmesi
            const fluctuationEval = evaluateAttentionFluctuation(sectionsData);
            document.getElementById('attention-fluctuation-text').textContent = fluctuationEval.text;
            document.getElementById('attention-fluctuation-card').className = `insight-card ${fluctuationEval.type}`;
            
            // Genel değerlendirme
            const totalScore = sectionsData.section1.score + sectionsData.section2.score + sectionsData.section3.score;
            const overallEval = generateOverallEvaluation(sectionsData, totalScore);
            document.getElementById('recommendations-text').textContent = overallEval.text;
            document.getElementById('recommendations-card').className = `insight-card ${overallEval.type}`;
        }

        // Example usage:
        // loadTestResults(yourTestDataObject);
    </script>
</body>
</html> `;
}
