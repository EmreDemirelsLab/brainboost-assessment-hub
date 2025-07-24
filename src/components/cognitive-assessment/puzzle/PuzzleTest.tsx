import React, { useEffect } from 'react';

interface PuzzleTestProps {
  onComplete: (results: any) => void;
}

export function PuzzleTest({ onComplete }: PuzzleTestProps) {
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

    // Your exact puzzle.html content
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bütünsel Puzzle Testi</title>
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
            
            /* Responsive değişkenler - hafıza ve dikkat testleri ile aynı */
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
        
        .puzzle-section {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: var(--container-padding);
        }

        .puzzle-section.active {
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

        .btn-next {
            position: absolute;
            bottom: clamp(20px, 4vw, 40px);
            right: clamp(20px, 4vw, 40px);
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        .btn-next.visible {
            opacity: 1;
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

        .puzzle-display {
            width: 100%;
            max-width: 800px;
            height: 400px;
            background: white;
            border-radius: 15px;
            margin: 20px auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .puzzle-image {
            width: 90%;
            height: 70%;
            background: #f0f0f0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 18px;
            margin-bottom: 20px;
        }

        .puzzle-options {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .puzzle-option {
            width: 80px;
            height: 80px;
            background: #e0e0e0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid transparent;
            font-weight: bold;
            color: #333;
        }

        .puzzle-option:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .puzzle-option.selected {
            border-color: #60a5fa;
            background: #dbeafe;
        }

        .question-counter {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 16px;
            background: rgba(0, 0, 0, 0.3);
            padding: 8px 16px;
            border-radius: 20px;
        }

        .progress-bar-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-bottom-left-radius: clamp(15px, 3vw, 20px);
            border-bottom-right-radius: clamp(15px, 3vw, 20px);
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
            width: 0%;
            transition: width 0.5s ease;
            border-bottom-left-radius: clamp(15px, 3vw, 20px);
            border-bottom-right-radius: clamp(15px, 3vw, 20px);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Progress Bar -->
        <div class="progress-bar-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>

        <!-- Question Counter -->
        <div class="question-counter" id="questionCounter" style="display: none;">Soru 1/12</div>

        <!-- Title Screen -->
        <div id="titleScreen" class="puzzle-section active">
            <div class="title-screen">
                <h1>Puzzle Testi</h1>
            </div>
            <button class="btn btn-next visible" onclick="startPuzzleTest()">Başla</button>
        </div>

        <!-- Welcome Screen -->
        <div id="welcomeScreen" class="puzzle-section">
            <div class="instruction-box">
                <div class="instruction-text">
                    Bu testte görsel-uzamsal işlem becerileriniz ölçülecektir.
                </div>
                <div class="highlight-text">
                    Eksik olan puzzle parçasını bulun ve tıklayın.
                </div>
            </div>
            <button class="btn btn-next" onclick="goToDemo()">İleri</button>
        </div>

        <!-- Demo Screen -->
        <div id="demoScreen" class="puzzle-section">
            <div class="instruction-box">
                <div class="highlight-text">
                    Demo
                </div>
                <div class="instruction-text">
                    Aşağıdaki örnekte eksik parçayı bulun.
                </div>
            </div>
            <div class="puzzle-display">
                <div class="puzzle-image">
                    Demo Puzzle - Eksik Parça
                </div>
                <div class="puzzle-options">
                    <div class="puzzle-option" onclick="selectDemoOption(this, true)">A</div>
                    <div class="puzzle-option" onclick="selectDemoOption(this, false)">B</div>
                    <div class="puzzle-option" onclick="selectDemoOption(this, false)">C</div>
                    <div class="puzzle-option" onclick="selectDemoOption(this, false)">D</div>
                </div>
            </div>
            <button class="btn btn-next" onclick="goToTest()">Testi Başlat</button>
        </div>

        <!-- Test Screen -->
        <div id="testScreen" class="puzzle-section">
            <div class="puzzle-display">
                <div class="puzzle-image" id="puzzleImage">
                    Puzzle Sorusu Yükleniyor...
                </div>
                <div class="puzzle-options" id="puzzleOptions">
                    <!-- Options will be populated by JavaScript -->
                </div>
            </div>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="puzzle-section">
            <div class="result-message">Test Tamamlandı!</div>
            <div class="result-info">
                <p>Puzzle testi başarıyla tamamlandı.</p>
                <p id="scoreText">Skorunuz hesaplanıyor...</p>
            </div>
            <button class="btn btn-next visible" onclick="completeTest()">Tamamla</button>
        </div>
    </div>

    <script>
        'use strict';

        let currentScreen = 'titleScreen';
        let currentQuestion = 0;
        let totalQuestions = 12;
        let correctAnswers = 0;
        let testResults = {
            score: 0,
            totalQuestions: 12,
            correctAnswers: 0,
            testType: 'puzzle'
        };

        // Puzzle test data
        const puzzleData = [
            { question: "Geometrik Şekil Tamamlama 1", options: ['A', 'B', 'C', 'D'], correct: 'C' },
            { question: "Sıralı Desen Tamamlama 1", options: ['A', 'B', 'C', 'D'], correct: 'A' },
            { question: "Dörtgen Tamamlama 1", options: ['A', 'B', 'C', 'D'], correct: 'B' },
            { question: "Üçgen Deseni 1", options: ['A', 'B', 'C', 'D'], correct: 'D' },
            { question: "Çokgen Yapısı 1", options: ['A', 'B', 'C', 'D'], correct: 'A' },
            { question: "Simetrik Şekil 1", options: ['A', 'B', 'C', 'D'], correct: 'C' },
            { question: "Karmaşık Desen 1", options: ['A', 'B', 'C', 'D'], correct: 'B' },
            { question: "Örüntü Tamamlama 1", options: ['A', 'B', 'C', 'D'], correct: 'D' },
            { question: "Geometrik İlişki 1", options: ['A', 'B', 'C', 'D'], correct: 'A' },
            { question: "Uzamsal Analiz 1", options: ['A', 'B', 'C', 'D'], correct: 'C' },
            { question: "Son Desen 1", options: ['A', 'B', 'C', 'D'], correct: 'B' },
            { question: "Final Puzzle", options: ['A', 'B', 'C', 'D'], correct: 'A' }
        ];

        function showScreen(screenId) {
            document.querySelectorAll('.puzzle-section').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                currentScreen = screenId;
            }
        }

        function startPuzzleTest() {
            showScreen('welcomeScreen');
            setTimeout(() => {
                const button = document.querySelector('#welcomeScreen .btn');
                if (button) button.classList.add('visible');
            }, 500);
        }

        function goToDemo() {
            showScreen('demoScreen');
            setTimeout(() => {
                const button = document.querySelector('#demoScreen .btn');
                if (button) button.classList.add('visible');
            }, 500);
        }

        function selectDemoOption(option, isCorrect) {
            // Reset all options
            document.querySelectorAll('#demoScreen .puzzle-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select clicked option
            option.classList.add('selected');
            
            if (isCorrect) {
                setTimeout(() => {
                    alert('Doğru! Test başlamaya hazır.');
                }, 300);
            }
        }

        function goToTest() {
            showScreen('testScreen');
            document.getElementById('questionCounter').style.display = 'block';
            loadNextQuestion();
        }

        function loadNextQuestion() {
            if (currentQuestion >= totalQuestions) {
                showResults();
                return;
            }

            const questionData = puzzleData[currentQuestion];
            const puzzleImage = document.getElementById('puzzleImage');
            const puzzleOptions = document.getElementById('puzzleOptions');
            const questionCounter = document.getElementById('questionCounter');
            
            // Update question display
            puzzleImage.textContent = questionData.question;
            questionCounter.textContent = \`Soru \${currentQuestion + 1}/\${totalQuestions}\`;
            
            // Create options
            puzzleOptions.innerHTML = '';
            questionData.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'puzzle-option';
                optionElement.textContent = option;
                optionElement.onclick = () => handleAnswer(option, questionData.correct);
                puzzleOptions.appendChild(optionElement);
            });

            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            const progress = ((currentQuestion + 1) / totalQuestions) * 100;
            progressBar.style.width = progress + '%';
        }

        function handleAnswer(selectedAnswer, correctAnswer) {
            if (selectedAnswer === correctAnswer) {
                correctAnswers++;
            }
            
            // Disable all options
            document.querySelectorAll('.puzzle-option').forEach(opt => {
                opt.style.pointerEvents = 'none';
                if (opt.textContent === selectedAnswer) {
                    opt.classList.add('selected');
                }
            });

            currentQuestion++;
            
            setTimeout(() => {
                // Re-enable options for next question
                document.querySelectorAll('.puzzle-option').forEach(opt => {
                    opt.style.pointerEvents = 'auto';
                    opt.classList.remove('selected');
                });
                loadNextQuestion();
            }, 1000);
        }

        function showResults() {
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            testResults = {
                score: score,
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                testType: 'puzzle'
            };

            document.getElementById('scoreText').textContent = \`Skorunuz: \${score}% (\${correctAnswers}/\${totalQuestions})\`;
            document.getElementById('questionCounter').style.display = 'none';
            showScreen('resultsScreen');
        }

        function completeTest() {
            window.parent.postMessage({
                type: 'puzzle-test-complete',
                results: testResults
            }, '*');
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
            console.error('Puzzle Test Error:', e.error);
        });
    </script>
</body>
</html>`;

    iframe.srcdoc = htmlContent;
    document.body.appendChild(iframe);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'puzzle-test-complete') {
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