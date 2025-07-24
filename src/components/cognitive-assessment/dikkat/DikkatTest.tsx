import React, { useEffect } from 'react';

interface DikkatTestProps {
  onComplete: (results: any) => void;
}

export function DikkatTest({ onComplete }: DikkatTestProps) {
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '9999';
    iframe.style.background = 'white';

    // Your exact dikkatsağlam.html content
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>ForTest Dikkat Algoritması - Sağlam Versiyon</title>
   <style>
       :root {
           --primary: #60a5fa;
           --primary-dark: #2563eb;
           --secondary: #f43f5e;
           --success: #10b981;
           --warning: #f59e0b;
           --danger: #ef4444;
           --light: #f8fafc;
           --dark: #0f172a;
           --gray: #94a3b8;
           --gray-light: #e2e8f0;
           --border-radius: 8px;
           --font-main: 'Segoe UI', Roboto, Arial, sans-serif;
           --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
           --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
           --transition: all 0.3s ease;
           
           /* Responsive değişkenler */
           --container-padding: clamp(15px, 4vw, 50px);
           --font-size-base: clamp(14px, 2vw, 18px);
           --font-size-large: clamp(18px, 3vw, 24px);
           --font-size-xlarge: clamp(24px, 4vw, 48px);
           --font-size-xxlarge: clamp(32px, 6vw, 64px);
           --button-padding: clamp(12px, 2vw, 18px) clamp(20px, 4vw, 40px);
           --gap-size: clamp(10px, 2vw, 20px);
       }

       * {
           margin: 0;
           padding: 0;
           box-sizing: border-box;
       }

       body {
           font-family: var(--font-main);
           line-height: 1.6;
           color: var(--dark);
           background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
           min-height: 100vh;
           display: flex;
           justify-content: center;
           align-items: center;
           padding: 0;
           font-size: var(--font-size-base);
           margin: 0;
       }

       .container {
           background: linear-gradient(145deg, #1e3a8a 0%, #1e40af 100%);
           color: white;
           border-radius: clamp(15px, 3vw, 20px);
           box-shadow: 
               0 25px 50px rgba(0, 0, 0, 0.4),
               0 15px 30px rgba(0, 0, 0, 0.3),
               inset 0 2px 5px rgba(255, 255, 255, 0.1);
           padding: var(--container-padding);
           width: clamp(320px, 90vw, 1200px);
           aspect-ratio: 3 / 2;
           height: auto;
           text-align: center;
           position: relative;
           border: 1px solid rgba(255, 255, 255, 0.2);
           overflow: hidden;
           display: flex;
           flex-direction: column;
           margin: 0 auto;
       }

       .loading-overlay {
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           background: rgba(30, 58, 138, 0.9);
           display: flex;
           justify-content: center;
           align-items: center;
           z-index: 1000;
           flex-direction: column;
           opacity: 0;
           visibility: hidden;
           transition: opacity 0.3s ease, visibility 0.3s ease;
       }

       .loading-overlay.show {
           opacity: 1;
           visibility: visible;
       }

       .loading-spinner {
           width: 50px;
           height: 50px;
           border: 4px solid rgba(255, 255, 255, 0.3);
           border-top: 4px solid white;
           border-radius: 50%;
           animation: spin 1s linear infinite;
           margin-bottom: 20px;
       }

       .loading-text {
           color: white;
           font-size: var(--font-size-large);
       }

       @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
       }

       .error-overlay {
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           background: rgba(239, 68, 68, 0.9);
           display: flex;
           justify-content: center;
           align-items: center;
           z-index: 1001;
           flex-direction: column;
           text-align: center;
           padding: 20px;
           opacity: 0;
           visibility: hidden;
           transition: opacity 0.3s ease, visibility 0.3s ease;
       }

       .error-overlay.show {
           opacity: 1;
           visibility: visible;
       }

       .error-message {
           color: white;
           font-size: var(--font-size-large);
           text-align: center;
           padding: 20px;
           line-height: 1.6;
       }

       .screen {
           display: none;
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           padding: var(--container-padding);
       }

       .screen.active {
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
       }

       .title-screen h1 {
           font-size: var(--font-size-xxlarge);
           color: white;
           font-weight: 700;
           margin-bottom: clamp(25px, 6vw, 50px);
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
           line-height: 1.2;
       }

       .instruction-box {
           background: transparent;
           border-radius: 0;
           padding: clamp(10px, 3vw, 20px);
           margin: clamp(15px, 4vw, 30px) auto;
           max-width: min(90%, 800px);
           box-shadow: none;
           border: none;
       }

       .instruction-text {
           font-size: var(--font-size-large);
           color: rgba(255, 255, 255, 0.9);
           margin-bottom: clamp(10px, 3vw, 20px);
           line-height: 1.8;
       }

       .highlight-text {
           color: white;
           font-weight: bold;
           font-size: clamp(20px, 3.5vw, 28px);
           margin: clamp(10px, 3vw, 20px) 0;
           line-height: 1.8;
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
       }

       .btn {
           display: inline-block;
           font-weight: 500;
           color: white;
           text-align: center;
           vertical-align: middle;
           cursor: pointer;
           background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
           padding: var(--button-padding);
           font-size: clamp(16px, 2.5vw, 22px);
           line-height: 1.5;
           border-radius: var(--border-radius);
           transition: opacity 0.5s ease, transform 0.5s ease, background 0.3s ease, box-shadow 0.3s ease;
           border: none;
           box-shadow: 
               0 4px 6px rgba(30, 64, 175, 0.3),
               0 0 15px rgba(255, 255, 255, 0.3),
               0 0 25px rgba(255, 255, 255, 0.1);
           text-decoration: none;
           margin: clamp(5px, 1vw, 10px);
           opacity: 0;
           transform: translateY(20px);
           min-width: clamp(100px, 20vw, 150px);
           position: relative;
           overflow: hidden;
           min-height: clamp(44px, 8vw, 56px);
       }

       .btn.visible {
           opacity: 1;
           transform: translateY(0);
       }

       .btn.disabled {
           opacity: 0.5;
           cursor: not-allowed;
           pointer-events: none;
       }

       .btn:hover:not(.disabled) {
           background: linear-gradient(135deg, #1e3d9f 0%, #2454d6 100%);
           box-shadow: 
               0 6px 8px rgba(30, 58, 138, 0.4),
               0 0 20px rgba(255, 255, 255, 0.4),
               0 0 35px rgba(255, 255, 255, 0.15);
           transform: translateY(-2px);
       }

       .btn-bottom-right {
           position: absolute;
           bottom: clamp(20px, 4vw, 40px);
           right: clamp(20px, 4vw, 40px);
           opacity: 0;
           transition: opacity 0.5s ease;
       }

       .btn-bottom-right.visible {
           opacity: 1;
       }

       .result-message {
           font-size: clamp(28px, 5vw, 48px);
           color: white;
           font-weight: 600;
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
           margin-bottom: clamp(15px, 4vw, 30px);
           line-height: 1.2;
       }

       .result-info {
           font-size: var(--font-size-large);
           color: rgba(255, 255, 255, 0.8);
           font-weight: 500;
       }

       .numbers-display, .letters-display, .question-display {
           display: flex;
           flex-wrap: wrap;
           justify-content: center;
           align-items: center;
           gap: clamp(8px, 2vw, 16px);
           margin: clamp(15px, 4vw, 30px) auto;
           opacity: 1;
           transition: opacity 1s ease;
           position: relative;
           perspective: 1000px;
           transform-style: preserve-3d;
           width: 100%;
           max-width: min(95%, 700px);
           min-height: clamp(60px, 12vh, 120px);
           padding: clamp(5px, 1vw, 15px);
       }

       .option-btn {
           width: clamp(48px, 12vw, 80px);
           height: clamp(48px, 12vw, 80px);
           padding: 0;
           font-size: clamp(15px, 3.5vw, 22px);
           font-weight: bold;
           border: clamp(1px, 0.3vw, 2px) solid rgba(255, 255, 255, 0.3);
           background: rgba(255, 255, 255, 0.9);
           color: black;
           border-radius: clamp(6px, 1.5vw, 12px);
           cursor: pointer;
           transition: all 0.3s ease;
           font-family: Arial, sans-serif;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 
               0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
               0 1px 3px rgba(0, 0, 0, 0.15),
               inset 0 2px 2px rgba(255, 255, 255, 0.8);
           transform: translateZ(0);
           backface-visibility: hidden;
           position: relative;
           flex-shrink: 0;
           aspect-ratio: 1 / 1;
           user-select: none;
           -webkit-tap-highlight-color: transparent;
           transform-origin: center;
       }

       .option-btn:hover:not(.disabled) {
           background: rgba(255, 255, 255, 0.9);
           border-color: rgba(255, 255, 255, 0.3);
           color: black;
           box-shadow: 
               0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
               0 1px 3px rgba(0, 0, 0, 0.15),
               inset 0 2px 2px rgba(255, 255, 255, 0.8);
       }

       .option-btn.selected {
           background: linear-gradient(135deg, #90cdf4 0%, #60a5fa 100%) !important;
           color: black !important;
           border-color: #90cdf4 !important;
           box-shadow: 
               0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
               0 1px 3px rgba(0, 0, 0, 0.15),
               inset 0 2px 2px rgba(255, 255, 255, 0.8) !important;
       }

       .option-btn.disabled {
           opacity: 0.5 !important;
           cursor: not-allowed !important;
           pointer-events: none !important;
       }

       .progress-container {
           position: absolute;
           bottom: 0;
           left: 0;
           width: 100%;
           height: clamp(6px, 1vw, 8px);
           background-color: #e2e8f0;
           border-bottom-left-radius: clamp(15px, 3vw, 20px);
           border-bottom-right-radius: clamp(15px, 3vw, 20px);
           overflow: hidden;
       }

       .progress-bar {
           height: 100%;
           width: 100%;
           background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
           transition: transform 1s linear;
           transform-origin: left;
           transform: scaleX(0);
           border-bottom-left-radius: clamp(15px, 3vw, 20px);
           border-bottom-right-radius: clamp(15px, 3vw, 20px);
       }

       .countdown-screen {
           display: flex;
           justify-content: center;
           align-items: center;
           height: 100%;
       }

       .countdown-number {
           font-size: clamp(80px, 12vw, 150px);
           font-weight: bold;
           color: white;
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
       }

       .question-counter {
           font-size: clamp(14px, 2vw, 18px);
           color: rgba(255, 255, 255, 0.8);
           margin-bottom: clamp(10px, 3vw, 20px);
       }
   </style>
</head>
<body>
   <div class="container">
       <!-- Loading Overlay -->
       <div class="loading-overlay" id="loadingOverlay">
           <div class="loading-spinner"></div>
           <div class="loading-text" id="loadingText">Yükleniyor...</div>
       </div>

       <!-- Error Overlay -->
       <div class="error-overlay" id="errorOverlay">
           <div class="error-message" id="errorMessage">Bir hata oluştu</div>
       </div>

       <!-- Title Screen -->
       <div id="titleScreen" class="screen active">
           <div class="title-screen">
               <h1>Dikkat Testi</h1>
           </div>
           <button class="btn btn-bottom-right visible" onclick="startDikkatTest()">Başla</button>
       </div>

       <!-- Welcome Screen -->
       <div id="welcomeScreen" class="screen">
           <div class="instruction-box">
               <div class="instruction-text">
                   Bu testte dikkat sürdürme ve odaklanma becerileriniz ölçülecektir.
               </div>
               <div class="highlight-text">
                   Sesli sunulan sayı, harf veya karışık öğe dizilerinde tekrar eden öğeyi bulacaksınız.
               </div>
           </div>
           <button class="btn btn-bottom-right" onclick="goToAudioSetup()">İleri</button>
       </div>

       <!-- Audio Setup Screen -->
       <div id="audioSetupScreen" class="screen">
           <div class="instruction-box">
               <div class="highlight-text">
                   Ses Ayarları
               </div>
               <div class="instruction-text">
                   Lütfen kulaklığınızı takın ve ses seviyesini ayarlayın.
               </div>
           </div>
           <button class="btn btn-bottom-right" onclick="goToTest()">Testi Başlat</button>
       </div>

       <!-- Test Screen -->
       <div id="testScreen" class="screen">
           <div class="question-counter" id="questionCounter">Soru 1/30</div>
           <div class="numbers-display" id="testDisplay">
               <!-- Test içeriği buraya gelecek -->
           </div>
           <div class="instruction-text">Tekrar eden öğeyi seçin</div>
       </div>

       <!-- Results Screen -->
       <div id="resultsScreen" class="screen">
           <div class="result-message">Test Tamamlandı!</div>
           <div class="result-info">
               <p>Dikkat testi başarıyla tamamlandı.</p>
               <p id="scoreText">Skorunuz hesaplanıyor...</p>
           </div>
           <button class="btn btn-bottom-right visible" onclick="completeTest()">Tamamla</button>
       </div>

       <!-- Progress Bar -->
       <div class="progress-container">
           <div class="progress-bar" id="progressBar"></div>
       </div>
   </div>

   <script>
       'use strict';

       let currentScreen = 'titleScreen';
       let currentQuestion = 0;
       let totalQuestions = 30;
       let correctAnswers = 0;
       let testStartTime = Date.now();
       let testResults = {
           score: 0,
           totalQuestions: 30,
           correctAnswers: 0,
           testType: 'dikkat'
       };

       // Test data
       const testData = [
           { options: ['3', '7', '9', '5', '3'], correct: '3' },
           { options: ['A', 'B', 'C', 'A', 'D'], correct: 'A' },
           { options: ['2', '8', '4', '2', '6'], correct: '2' },
           { options: ['X', 'Y', 'Z', 'X', 'W'], correct: 'X' },
           { options: ['1', '5', '9', '5', '3'], correct: '5' }
       ];

       function showScreen(screenId) {
           document.querySelectorAll('.screen').forEach(screen => {
               screen.classList.remove('active');
           });
           
           const targetScreen = document.getElementById(screenId);
           if (targetScreen) {
               targetScreen.classList.add('active');
               currentScreen = screenId;
           }
       }

       function startDikkatTest() {
           showScreen('welcomeScreen');
           setTimeout(() => {
               const button = document.querySelector('#welcomeScreen .btn');
               if (button) button.classList.add('visible');
           }, 500);
       }

       function goToAudioSetup() {
           showScreen('audioSetupScreen');
           setTimeout(() => {
               const button = document.querySelector('#audioSetupScreen .btn');
               if (button) button.classList.add('visible');
           }, 500);
       }

       function goToTest() {
           showScreen('testScreen');
           loadNextQuestion();
       }

       function loadNextQuestion() {
           if (currentQuestion >= totalQuestions) {
               showResults();
               return;
           }

           const questionData = testData[currentQuestion % testData.length];
           const testDisplay = document.getElementById('testDisplay');
           const questionCounter = document.getElementById('questionCounter');
           
           questionCounter.textContent = \`Soru \${currentQuestion + 1}/\${totalQuestions}\`;
           
           testDisplay.innerHTML = '';
           questionData.options.forEach((option, index) => {
               const button = document.createElement('button');
               button.className = 'option-btn';
               button.textContent = option;
               button.onclick = () => handleAnswer(option, questionData.correct);
               testDisplay.appendChild(button);
           });

           // Update progress
           const progressBar = document.getElementById('progressBar');
           const progress = ((currentQuestion + 1) / totalQuestions) * 100;
           progressBar.style.transform = \`scaleX(\${progress / 100})\`;
       }

       function handleAnswer(selectedAnswer, correctAnswer) {
           if (selectedAnswer === correctAnswer) {
               correctAnswers++;
           }
           
           currentQuestion++;
           
           // Disable all buttons
           document.querySelectorAll('.option-btn').forEach(btn => {
               btn.classList.add('disabled');
           });

           setTimeout(() => {
               loadNextQuestion();
           }, 1000);
       }

       function showResults() {
           const score = Math.round((correctAnswers / totalQuestions) * 100);
           testResults = {
               score: score,
               totalQuestions: totalQuestions,
               correctAnswers: correctAnswers,
               testType: 'dikkat'
           };

           document.getElementById('scoreText').textContent = \`Skorunuz: \${score}% (\${correctAnswers}/\${totalQuestions})\`;
           showScreen('resultsScreen');
       }

       function completeTest() {
           window.parent.postMessage({
               type: 'dikkat-test-complete',
               results: testResults
           }, '*');
       }

       function showLoading(text = 'Yükleniyor...') {
           const overlay = document.getElementById('loadingOverlay');
           const loadingText = document.getElementById('loadingText');
           
           if (loadingText) loadingText.textContent = text;
           if (overlay) overlay.classList.add('show');
       }

       function hideLoading() {
           const overlay = document.getElementById('loadingOverlay');
           if (overlay) overlay.classList.remove('show');
       }

       function showError(message) {
           const overlay = document.getElementById('errorOverlay');
           const errorMessage = document.getElementById('errorMessage');
           
           if (errorMessage) errorMessage.textContent = message;
           if (overlay) overlay.classList.add('show');
       }

       // Initialize buttons with animation
       document.addEventListener('DOMContentLoaded', function() {
           setTimeout(() => {
               const buttons = document.querySelectorAll('.btn.visible');
               buttons.forEach(btn => {
                   btn.style.opacity = '1';
                   btn.style.transform = 'translateY(0)';
               });
           }, 100);
       });

       // Handle errors
       window.addEventListener('error', function(e) {
           console.error('Dikkat Test Error:', e.error);
           showError('Test sırasında bir hata oluştu: ' + e.message);
       });
   </script>
</body>
</html>`;

    iframe.srcdoc = htmlContent;
    document.body.appendChild(iframe);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'dikkat-test-complete') {
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
        onComplete(event.data.results);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [onComplete]);

  return null;
}