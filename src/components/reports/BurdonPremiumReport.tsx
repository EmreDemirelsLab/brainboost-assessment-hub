import React, { useEffect, useRef } from 'react';
import { BurdonTestResult } from '@/pages/Reports';

interface BurdonPremiumReportProps {
  testData: BurdonTestResult;
  onPrintReady?: () => void;
}

export function BurdonPremiumReport({ testData, onPrintReady }: BurdonPremiumReportProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (testData && contentRef.current) {
      loadTestResults(testData);
      setTimeout(() => {
        onPrintReady?.();
      }, 1000);
    }
  }, [testData, onPrintReady]);

  const formatShortDate = (timestamp: string | number) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(timestamp));
  };

  const formatLongDate = (timestamp: string | number) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updatePerformanceGauge = (percentage: number) => {
    const gauge = document.getElementById('performance-gauge-fill');
    if (gauge) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (percentage / 100) * circumference;
      setTimeout(() => {
        (gauge as any).style.strokeDashoffset = offset;
      }, 500);
    }
  };

  const updatePerformanceRating = (ratio: number) => {
    const ratingElement = document.getElementById('performance-rating');
    if (ratingElement) {
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
  };

  const loadTestResults = (testData: BurdonTestResult) => {
    // Update header stats
    const testDateEl = document.getElementById('test-date-short');
    if (testDateEl) testDateEl.textContent = formatShortDate(testData.test_start_time);
    
    const durationEl = document.getElementById('test-duration-short');
    if (durationEl) durationEl.textContent = formatDuration(testData.test_elapsed_time_seconds);
    
    const sectionsEl = document.getElementById('sections-completed');
    const completedSections = testData.test_auto_completed ? 2 : 3;
    if (sectionsEl) sectionsEl.textContent = `${completedSections}/3`;
    
    const completionEl = document.getElementById('completion-status');
    if (completionEl) completionEl.textContent = testData.test_auto_completed ? 'Otomatik' : 'Manuel';

    // Update performance metrics
    const ratio = Math.round(testData.attention_ratio * 100);
    const scoreEl = document.getElementById('overall-score');
    if (scoreEl) scoreEl.textContent = ratio + '%';
    
    updatePerformanceGauge(ratio);
    updatePerformanceRating(ratio);

    // Update metric cards
    const correctEl = document.getElementById('correct-count');
    if (correctEl) correctEl.textContent = testData.total_correct.toString();
    
    const missedEl = document.getElementById('missed-count');
    if (missedEl) missedEl.textContent = testData.total_missed.toString();
    
    const wrongEl = document.getElementById('wrong-count');
    if (wrongEl) wrongEl.textContent = testData.total_wrong.toString();
    
    const totalEl = document.getElementById('total-points');
    if (totalEl) totalEl.textContent = testData.total_score.toString();

    // Update sections data
    updateDetailedTable(testData);
    updateDonutChart(testData);
    performAutomaticEvaluations(testData);

    // Update footer
    const reportDateEl = document.getElementById('report-date');
    if (reportDateEl) reportDateEl.textContent = `Rapor Tarihi: ${formatLongDate(Date.now())}`;
  };

  const updateDetailedTable = (testData: BurdonTestResult) => {
    const sections = [
      { 
        correct: testData.section1_correct, 
        missed: testData.section1_missed, 
        wrong: testData.section1_wrong, 
        score: testData.section1_score 
      },
      { 
        correct: testData.section2_correct, 
        missed: testData.section2_missed, 
        wrong: testData.section2_wrong, 
        score: testData.section2_score 
      },
      { 
        correct: testData.section3_correct, 
        missed: testData.section3_missed, 
        wrong: testData.section3_wrong, 
        score: testData.section3_score 
      }
    ];

    sections.forEach((section, index) => {
      const sectionNum = index + 1;
      
      const correctEl = document.getElementById(`section${sectionNum}-correct-table`);
      if (correctEl) correctEl.textContent = section.correct.toString();
      
      const missedEl = document.getElementById(`section${sectionNum}-missed-table`);
      if (missedEl) missedEl.textContent = section.missed.toString();
      
      const wrongEl = document.getElementById(`section${sectionNum}-wrong-table`);
      if (wrongEl) wrongEl.textContent = section.wrong.toString();
      
      const scoreEl = document.getElementById(`section${sectionNum}-score-table`);
      if (scoreEl) scoreEl.textContent = section.score.toString();
      
      const ratioEl = document.getElementById(`section${sectionNum}-ratio-table`);
      if (ratioEl) {
        const total = section.correct + section.missed + section.wrong;
        ratioEl.textContent = total > 0 ? (section.score / total).toFixed(3) : '0.000';
      }
      
      const evaluationEl = document.getElementById(`section${sectionNum}-evaluation`);
      if (evaluationEl) {
        if (section.score >= 40) {
          evaluationEl.textContent = 'Çok İyi';
          evaluationEl.className = 'table-score high';
        } else if (section.score >= 25) {
          evaluationEl.textContent = 'İyi';
          evaluationEl.className = 'table-score high';
        } else if (section.score >= 15) {
          evaluationEl.textContent = 'Normal';
          evaluationEl.className = 'table-score medium';
        } else {
          evaluationEl.textContent = 'Düşük';
          evaluationEl.className = 'table-score low';
        }
      }
    });
  };

  const updateDonutChart = (testData: BurdonTestResult) => {
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
        (circle as any).style.strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
        (circle as any).style.strokeDashoffset = -accumulatedOffset;
        
        setTimeout(() => {
          (circle as any).style.opacity = '1';
        }, 300 * index);
      }

      accumulatedOffset += segmentLength;
    });

    // Update center and legend values
    const totalEl = document.getElementById('pie-total-items');
    if (totalEl) totalEl.textContent = total.toString();
    
    const successRatio = Math.round((testData.total_correct / total) * 100);
    const percentEl = document.getElementById('overall-percentage');
    if (percentEl) percentEl.textContent = successRatio + '%';

    // Update legend
    const correctCountEl = document.getElementById('correct-count-legend');
    if (correctCountEl) correctCountEl.textContent = testData.total_correct.toString();
    
    const correctPercentEl = document.getElementById('correct-percent-legend');
    if (correctPercentEl) correctPercentEl.textContent = Math.round((testData.total_correct / total) * 100) + '%';
    
    const missedCountEl = document.getElementById('missed-count-legend');
    if (missedCountEl) missedCountEl.textContent = testData.total_missed.toString();
    
    const missedPercentEl = document.getElementById('missed-percent-legend');
    if (missedPercentEl) missedPercentEl.textContent = Math.round((testData.total_missed / total) * 100) + '%';
    
    const wrongCountEl = document.getElementById('wrong-count-legend');
    if (wrongCountEl) wrongCountEl.textContent = testData.total_wrong.toString();
    
    const wrongPercentEl = document.getElementById('wrong-percent-legend');
    if (wrongPercentEl) wrongPercentEl.textContent = Math.round((testData.total_wrong / total) * 100) + '%';
  };

  const performAutomaticEvaluations = (testData: BurdonTestResult) => {
    const totalE = testData.total_missed;
    const sections = {
      section1: {
        correct: testData.section1_correct,
        missed: testData.section1_missed,
        wrong: testData.section1_wrong,
        score: testData.section1_score
      },
      section2: {
        correct: testData.section2_correct,
        missed: testData.section2_missed,
        wrong: testData.section2_wrong,
        score: testData.section2_score
      },
      section3: {
        correct: testData.section3_correct,
        missed: testData.section3_missed,
        wrong: testData.section3_wrong,
        score: testData.section3_score
      }
    };
    
    // Seçici dikkat değerlendirmesi
    const selectiveEval = evaluateSelectiveAttention(totalE);
    const selectiveTextEl = document.getElementById('selective-attention-text');
    const selectiveCardEl = document.getElementById('selective-attention-card');
    if (selectiveTextEl) selectiveTextEl.textContent = selectiveEval.text;
    if (selectiveCardEl) selectiveCardEl.className = `insight-card ${selectiveEval.type}`;
    
    // Sürdürülebilir dikkat değerlendirmesi
    const sustainedEval = evaluateSustainedAttention(sections);
    const sustainedTextEl = document.getElementById('sustained-attention-text');
    const sustainedCardEl = document.getElementById('sustained-attention-card');
    if (sustainedTextEl) sustainedTextEl.textContent = sustainedEval.text;
    if (sustainedCardEl) sustainedCardEl.className = `insight-card ${sustainedEval.type}`;
    
    // Dikkat salınımı değerlendirmesi
    const fluctuationEval = evaluateAttentionFluctuation(sections);
    const fluctuationTextEl = document.getElementById('attention-fluctuation-text');
    const fluctuationCardEl = document.getElementById('attention-fluctuation-card');
    if (fluctuationTextEl) fluctuationTextEl.textContent = fluctuationEval.text;
    if (fluctuationCardEl) fluctuationCardEl.className = `insight-card ${fluctuationEval.type}`;
    
    // Genel değerlendirme
    const totalScore = testData.total_score;
    const overallEval = generateOverallEvaluation(sections, totalScore);
    const recommendationsTextEl = document.getElementById('recommendations-text');
    const recommendationsCardEl = document.getElementById('recommendations-card');
    if (recommendationsTextEl) recommendationsTextEl.textContent = overallEval.text;
    if (recommendationsCardEl) recommendationsCardEl.className = `insight-card ${overallEval.type}`;
  };

  // Evaluation functions
  const evaluateSelectiveAttention = (totalE: number) => {
    if (totalE <= 12) {
      return { 
        status: 'normal', 
        text: `Toplam eksik (E) puanı: ${totalE}. Bu değer normal aralığında olup seçici dikkat becerileri yeterli düzeydedir.`, 
        type: 'positive' 
      };
    } else if (totalE >= 13 && totalE <= 24) {
      return { 
        status: 'caution', 
        text: `Toplam eksik (E) puanı: ${totalE}. Bu durum kontrol edilmesi gerektiğini göstermektedir.`, 
        type: 'neutral' 
      };
    } else {
      return { 
        status: 'deficit', 
        text: `Toplam eksik (E) puanı: ${totalE}. Bu değer seçici dikkat eksikliği olabileceğini göstermektedir.`, 
        type: 'negative' 
      };
    }
  };

  const evaluateSustainedAttention = (sections: any) => {
    const eProgression = [sections.section1.missed, sections.section2.missed, sections.section3.missed];
    const yProgression = [sections.section1.wrong, sections.section2.wrong, sections.section3.wrong];
    
    const eIncreasing = eProgression[0] < eProgression[1] && eProgression[1] < eProgression[2];
    const yIncreasing = yProgression[0] < yProgression[1] && yProgression[1] < yProgression[2];
    const yGenerallyIncreasing = yProgression.filter((val, i) => i > 0 && val > yProgression[i-1]).length >= 1;
    
    if (eIncreasing && yIncreasing) {
      return { 
        status: 'problem', 
        text: 'Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar artmıştır. Bu durum sürdürülebilir dikkat problemi olduğunu göstermektedir.', 
        type: 'negative' 
      };
    } else if (yGenerallyIncreasing) {
      return { 
        status: 'focus-problem', 
        text: 'Y puanı test ilerledikçe artmaktadır. Bu durum odak problemi olabileceğini göstermektedir.', 
        type: 'negative' 
      };
    } else {
      return { 
        status: 'good', 
        text: 'Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar azalmıştır. Bu durum sürdürülebilir dikkat kapasitesinin iyi olduğunu göstermektedir.', 
        type: 'positive' 
      };
    }
  };

  const evaluateAttentionFluctuation = (sections: any) => {
    if ((sections.section1.missed + sections.section1.wrong) > (sections.section2.missed + sections.section2.wrong) && 
        (sections.section1.missed + sections.section1.wrong) > (sections.section3.missed + sections.section3.wrong)) {
      return { 
        status: 'start-difficulty', 
        text: '1. bölümde başlangıç performansı sonraki bölümlere göre daha düşüktür. Bu durum test başında odaklanma sürecini yansıtmaktadır.', 
        type: 'neutral' 
      };
    } else {
      return { 
        status: 'stable', 
        text: 'Test boyunca dikkat performansı stabil kalmıştır. Başlangıçtan itibaren iyi odaklanma gösterilmiştir.', 
        type: 'positive' 
      };
    }
  };

  const generateOverallEvaluation = (sections: any, totalScore: number) => {
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
    
    return { 
      text: overallText, 
      type: selectiveEval.type === 'positive' && sustainedEval.type === 'positive' ? 'positive' : 'neutral' 
    };
  };

  return (
    <div ref={contentRef} className="premium-report-container">
      <style dangerouslySetInnerHTML={{
        __html: `
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

        .premium-report-container {
            font-family: 'Inter', system-ui, sans-serif;
            line-height: 1.7;
            color: var(--neutral-800);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            font-size: 14px;
            letter-spacing: -0.025em;
            min-height: 100vh;
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

        /* === PIE CHARTS === */
        .charts-section {
            background: white;
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--neutral-200);
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
            justify-content: space-between;
            align-items: center;
            gap: 24px;
        }

        .footer-logo {
            font-weight: 700;
            color: var(--primary);
        }

        /* === UTILITIES === */
        .text-center { text-align: center; }
        .no-print { }
        `
      }} />
      
      <div className="container">
        {/* Premium Header */}
        <header className="header page-break-avoid">
          <div className="header-content">
            <div className="header-top">
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div className="title-container">
                  <h1 className="header-title">
                    <span className="title-accent">Burdon Testi</span>
                    <span className="title-main">Değerlendirme Raporu</span>
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="header-stat">
                <div className="header-stat-value" id="test-date-short">15 Ara</div>
                <div className="header-stat-label">Test Tarihi</div>
              </div>
              <div className="header-stat">
                <div className="header-stat-value" id="test-duration-short">4:33</div>
                <div className="header-stat-label">Gerçekleşen Süre</div>
              </div>
              <div className="header-stat">
                <div className="header-stat-value" id="sections-completed">2/3</div>
                <div className="header-stat-label">Tamamlanan Bölge</div>
              </div>
              <div className="header-stat">
                <div className="header-stat-value" id="completion-status">Otomatik</div>
                <div className="header-stat-label">Sonlanma</div>
              </div>
            </div>
          </div>
        </header>

        {/* Performance Hero Section */}
        <section className="performance-hero page-break-avoid">
          <h2 className="performance-title">Genel Dikkat Performansı</h2>
          
          <div className="performance-gauge-container">
            <svg className="performance-gauge" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                  <stop offset="50%" style={{ stopColor: '#06b6d4' }} />
                  <stop offset="100%" style={{ stopColor: '#f59e0b' }} />
                </linearGradient>
              </defs>
              <circle className="gauge-track" cx="100" cy="100" r="90" />
              <circle id="performance-gauge-fill" className="gauge-fill" cx="100" cy="100" r="90" />
            </svg>
            
            <div className="performance-score">
              <div className="performance-score-value" id="overall-score">83%</div>
              <div className="performance-score-label">Dikkat Skoru</div>
            </div>
          </div>
          
          <div className="performance-level good" id="performance-rating">İYİ PERFORMANS</div>
        </section>

        {/* Metrics Grid */}
        <section className="metrics-grid page-break-avoid">
          <div className="metric-card success">
            <div className="metric-icon">✓</div>
            <div className="metric-value" id="correct-count">128</div>
            <div className="metric-label">Doğru İşaretleme</div>
          </div>
          
          <div className="metric-card warning">
            <div className="metric-icon">○</div>
            <div className="metric-value" id="missed-count">18</div>
            <div className="metric-label">Kaçırılan Hedef</div>
          </div>
          
          <div className="metric-card danger">
            <div className="metric-icon">✗</div>
            <div className="metric-value" id="wrong-count">9</div>
            <div className="metric-label">Yanlış İşaretleme</div>
          </div>
          
          <div className="metric-card primary">
            <div className="metric-icon">★</div>
            <div className="metric-value" id="total-points">101</div>
            <div className="metric-label">Toplam Puan</div>
          </div>
        </section>

        {/* Section Analysis */}
        <section className="section-analysis page-break">
          <h2 className="section-title">Bölüm Bazında Analiz</h2>

          {/* Detailed Data Table */}
          <table className="data-table">
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
                <td><span className="table-score medium" id="section1-evaluation">Normal</span></td>
              </tr>
              <tr>
                <td><strong>Bölüm 2</strong></td>
                <td id="section2-correct-table">42</td>
                <td id="section2-missed-table">6</td>
                <td id="section2-wrong-table">3</td>
                <td id="section2-score-table">33</td>
                <td id="section2-ratio-table">0.277</td>
                <td><span className="table-score high" id="section2-evaluation">İyi</span></td>
              </tr>
              <tr>
                <td><strong>Bölüm 3</strong></td>
                <td id="section3-correct-table">48</td>
                <td id="section3-missed-table">2</td>
                <td id="section3-wrong-table">1</td>
                <td id="section3-score-table">45</td>
                <td id="section3-ratio-table">0.378</td>
                <td><span className="table-score high" id="section3-evaluation">Çok İyi</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Performance Pie Chart */}
        <section className="charts-section page-break-avoid">
          <h2 className="section-title">Test Sonuçları Dağılımı</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
            {/* Modern Donut Chart */}
            <div style={{ position: 'relative', width: '280px', height: '280px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="var(--neutral-200)" strokeWidth="20" />
                
                {/* Donut segments */}
                <circle 
                  id="donut-correct" 
                  cx="100" 
                  cy="100" 
                  r="70" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                  strokeDasharray="0 440" 
                  className="donut-segment"
                />
                <circle 
                  id="donut-missed" 
                  cx="100" 
                  cy="100" 
                  r="70" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                  strokeDasharray="0 440" 
                  className="donut-segment"
                />
                <circle 
                  id="donut-wrong" 
                  cx="100" 
                  cy="100" 
                  r="70" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                  strokeDasharray="0 440" 
                  className="donut-segment"
                />
              </svg>
              
              {/* Center content */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center' 
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  color: 'var(--primary)', 
                  lineHeight: 1 
                }} id="pie-total-items">155</div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: 'var(--neutral-600)', 
                  marginTop: '4px' 
                }}>Toplam İşlem</div>
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 700, 
                  color: 'var(--primary)', 
                  marginTop: '8px' 
                }} id="overall-percentage">83%</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--neutral-500)' 
                }}>Başarı Oranı</div>
              </div>
            </div>
            
            {/* Modern Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
              <div className="modern-legend-item" style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', 
                borderLeft: '4px solid #22c55e' 
              }}>
                <div className="legend-icon" style={{ background: '#22c55e' }}>✓</div>
                <div className="legend-content">
                  <div className="legend-title">Doğru İşaretleme</div>
                  <div className="legend-stats">
                    <span className="legend-count" id="correct-count-legend">128</span>
                    <span className="legend-percent" id="correct-percent-legend">83%</span>
                  </div>
                </div>
              </div>
              
              <div className="modern-legend-item" style={{ 
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))', 
                borderLeft: '4px solid #f97316' 
              }}>
                <div className="legend-icon" style={{ background: '#f97316' }}>○</div>
                <div className="legend-content">
                  <div className="legend-title">Kaçırılan Hedef</div>
                  <div className="legend-stats">
                    <span className="legend-count" id="missed-count-legend">18</span>
                    <span className="legend-percent" id="missed-percent-legend">12%</span>
                  </div>
                </div>
              </div>
              
              <div className="modern-legend-item" style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', 
                borderLeft: '4px solid #ef4444' 
              }}>
                <div className="legend-icon" style={{ background: '#ef4444' }}>✗</div>
                <div className="legend-content">
                  <div className="legend-title">Yanlış İşaretleme</div>
                  <div className="legend-stats">
                    <span className="legend-count" id="wrong-count-legend">9</span>
                    <span className="legend-percent" id="wrong-percent-legend">6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights & Recommendations */}
        <section className="insights-section page-break">
          <h2 className="section-title">Analiz ve Öneriler</h2>
          
          <div className="insights-grid">
            <div className="insight-card positive" id="selective-attention-card">
              <div className="insight-header">
                <div className="insight-icon">🎯</div>
                <div className="insight-title">Seçici Dikkat</div>
              </div>
              <div className="insight-text" id="selective-attention-text">
                Toplam eksik (E) puanı: 18. Bu değer normal aralığında olup seçici dikkat becerileri yeterli düzeydedir.
              </div>
            </div>
            
            <div className="insight-card positive" id="sustained-attention-card">
              <div className="insight-header">
                <div className="insight-icon">📈</div>
                <div className="insight-title">Sürdürülebilir Dikkat</div>
              </div>
              <div className="insight-text" id="sustained-attention-text">
                Bölümler arası trend: 1→2→3 bölümlerinde eksik ve yanlış puanlar azalmıştır. Bu durum sürdürülebilir dikkat kapasitesinin iyi olduğunu göstermektedir.
              </div>
            </div>
            
            <div className="insight-card neutral" id="attention-fluctuation-card">
              <div className="insight-header">
                <div className="insight-icon">📊</div>
                <div className="insight-title">Dikkat Salınımı</div>
              </div>
              <div className="insight-text" id="attention-fluctuation-text">
                1. bölümde başlangıç performansı sonraki bölümlere göre daha düşüktür. Bu durum test başında odaklanma sürecini yansıtmaktadır.
              </div>
            </div>
            
            <div className="insight-card positive" id="recommendations-card">
              <div className="insight-header">
                <div className="insight-icon">💡</div>
                <div className="insight-title">Genel Değerlendirme</div>
              </div>
              <div className="insight-text" id="recommendations-text">
                Genel dikkat performansınız iyi düzeydedir. Test ilerledikçe performansınızın artması dikkat sürdürme becerinizin güçlü olduğunu göstermektedir.
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">Burdon Dikkat Testi</div>
            <div id="report-date">Rapor Tarihi: 15 Aralık 2024, 16:45</div>
          </div>
        </footer>
      </div>
    </div>
  );
} 