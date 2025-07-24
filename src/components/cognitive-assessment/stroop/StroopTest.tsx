import React, { useEffect } from 'react';

interface StroopTestProps {
  onComplete: (results: any) => void;
}

export function StroopTest({ onComplete }: StroopTestProps) {
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

    // Your exact stroop.html content
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForTest Stroop Testi</title>
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
            
            /* Responsive değişkenler - dikkat ve hafıza testleri ile aynı */
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

        .word-display {
            font-size: clamp(48px, 10vw, 96px);
            font-weight: bold;
            margin: clamp(40px, 8vw, 80px) auto;
            min-height: 200px;
            width: 500px;
            max-width: 90%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.1),
                inset 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .countdown {
            font-size: clamp(64px, 15vw, 128px);
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .color-red { color: #FF0000; }
        .color-blue { color: #0000FF; }
        .color-green { color: #008000; }
        .color-yellow { color: #FFD700; }
        .color-black { color: #000000; }

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

        .color-options {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            flex-wrap: wrap;
        }

        .color-btn {
            padding: 15px 25px;
            font-size: 18px;
            font-weight: bold;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
            color: black;
        }

        .color-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .stage-progress {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 16px;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 20px;
            border-radius: 20px;
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
                <h1>Stroop Testi</h1>
            </div>
            <button class="btn btn-bottom-right visible" onclick="goToWelcome()">İleri</button>
        </div>

        <!-- Welcome Screen -->
        <div id="welcomeScreen" class="screen">
            <div class="instruction-box">
                <div class="highlight-text">
                    Bu Bölüm Üç Aşamadan Oluşmaktadır.
                </div>
                <div class="instruction-text">
                    Kelimenin anlamını değil, rengini belirtin.
                </div>
            </div>
            <button class="btn btn-bottom-right" onclick="goToStage1Intro()">İleri</button>
        </div>

        <!-- Stage 1 Intro -->
        <div id="stage1IntroScreen" class="screen">
            <div class="instruction-box">
                <div class="highlight-text">
                    1. Aşama: Renk Okuma
                </div>
                <div class="instruction-text">
                    Ekranda gösterilen kelimenin rengini söyleyin.
                </div>
            </div>
            <button class="btn btn-bottom-right" onclick="startStage1()">Başla</button>
        </div>

        <!-- Test Screen -->
        <div id="testScreen" class="screen">
            <div class="stage-progress" id="stageProgress">Aşama 1/3</div>
            <div class="word-display" id="wordDisplay">
                <span id="testWord" class="color-red">KIRMIZI</span>
            </div>
            <div class="color-options" id="colorOptions">
                <button class="color-btn" onclick="selectColor('red')" style="background-color: #FF0000; color: white;">KIRMIZI</button>
                <button class="color-btn" onclick="selectColor('blue')" style="background-color: #0000FF; color: white;">MAVİ</button>
                <button class="color-btn" onclick="selectColor('green')" style="background-color: #008000; color: white;">YEŞİL</button>
                <button class="color-btn" onclick="selectColor('yellow')" style="background-color: #FFD700; color: black;">SARI</button>
            </div>
            <div class="instruction-text">Kelimenin rengini seçin, anlamını değil!</div>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="screen">
            <div class="result-message">Test Tamamlandı!</div>
            <div class="result-info">
                <p>Stroop testi başarıyla tamamlandı.</p>
                <p id="scoreText">Skorunuz hesaplanıyor...</p>
            </div>
            <button class="btn btn-bottom-right visible" onclick="completeTest()">Tamamla</button>
        </div>
    </div>

    <script>
        'use strict';

        let currentScreen = 'titleScreen';
        let currentStage = 1;
        let currentQuestion = 0;
        let totalQuestions = 45; // 15 per stage
        let correctAnswers = 0;
        let stageQuestions = 0;
        let testResults = {
            score: 0,
            totalQuestions: 45,
            correctAnswers: 0,
            testType: 'stroop'
        };

        // Test data for each stage
        const stroopData = {
            stage1: [ // Color names in matching colors
                { word: 'KIRMIZI', color: 'red', correct: 'red' },
                { word: 'MAVİ', color: 'blue', correct: 'blue' },
                { word: 'YEŞİL', color: 'green', correct: 'green' },
                { word: 'SARI', color: 'yellow', correct: 'yellow' },
                { word: 'KIRMIZI', color: 'red', correct: 'red' }
            ],
            stage2: [ // Color names in different colors
                { word: 'KIRMIZI', color: 'blue', correct: 'blue' },
                { word: 'MAVİ', color: 'green', correct: 'green' },
                { word: 'YEŞİL', color: 'yellow', correct: 'yellow' },
                { word: 'SARI', color: 'red', correct: 'red' },
                { word: 'KIRMIZI', color: 'green', correct: 'green' }
            ],
            stage3: [ // Mixed interference
                { word: 'KIRMIZI', color: 'yellow', correct: 'yellow' },
                { word: 'MAVİ', color: 'red', correct: 'red' },
                { word: 'YEŞİL', color: 'blue', correct: 'blue' },
                { word: 'SARI', color: 'green', correct: 'green' },
                { word: 'KIRMIZI', color: 'blue', correct: 'blue' }
            ]
        };

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

        function goToWelcome() {
            showScreen('welcomeScreen');
            setTimeout(() => {
                const button = document.querySelector('#welcomeScreen .btn');
                if (button) button.classList.add('visible');
            }, 500);
        }

        function goToStage1Intro() {
            showScreen('stage1IntroScreen');
            setTimeout(() => {
                const button = document.querySelector('#stage1IntroScreen .btn');
                if (button) button.classList.add('visible');
            }, 500);
        }

        function startStage1() {
            currentStage = 1;
            stageQuestions = 0;
            showScreen('testScreen');
            loadNextQuestion();
        }

        function loadNextQuestion() {
            if (stageQuestions >= 15) {
                if (currentStage < 3) {
                    currentStage++;
                    stageQuestions = 0;
                    updateStageProgress();
                } else {
                    showResults();
                    return;
                }
            }

            const stageData = stroopData[\`stage\${currentStage}\`];
            const questionData = stageData[stageQuestions % stageData.length];
            
            const testWord = document.getElementById('testWord');
            const stageProgress = document.getElementById('stageProgress');
            
            testWord.textContent = questionData.word;
            testWord.className = \`color-\${questionData.color}\`;
            stageProgress.textContent = \`Aşama \${currentStage}/3 - Soru \${stageQuestions + 1}/15\`;
            
            // Store correct answer for checking
            window.currentCorrect = questionData.correct;
        }

        function updateStageProgress() {
            const stageProgress = document.getElementById('stageProgress');
            stageProgress.textContent = \`Aşama \${currentStage}/3\`;
        }

        function selectColor(selectedColor) {
            if (selectedColor === window.currentCorrect) {
                correctAnswers++;
            }
            
            stageQuestions++;
            currentQuestion++;
            
            // Disable all buttons briefly
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.style.pointerEvents = 'none';
            });

            setTimeout(() => {
                document.querySelectorAll('.color-btn').forEach(btn => {
                    btn.style.pointerEvents = 'auto';
                });
                loadNextQuestion();
            }, 500);
        }

        function showResults() {
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            testResults = {
                score: score,
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                testType: 'stroop'
            };

            document.getElementById('scoreText').textContent = \`Skorunuz: \${score}% (\${correctAnswers}/\${totalQuestions})\`;
            showScreen('resultsScreen');
        }

        function completeTest() {
            window.parent.postMessage({
                type: 'stroop-test-complete',
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
            console.error('Stroop Test Error:', e.error);
            showError('Test sırasında bir hata oluştu: ' + e.message);
        });
    </script>
</body>
</html>`;

    iframe.srcdoc = htmlContent;
    document.body.appendChild(iframe);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'stroop-test-complete') {
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