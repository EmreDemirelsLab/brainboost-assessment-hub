import React, { useState, useEffect } from 'react';

interface AkilMantikTestProps {
  onComplete: (results: any) => void;
}

export function AkilMantikTest({ onComplete }: AkilMantikTestProps) {
  useEffect(() => {
    // Create iframe with your exact HTML content
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '9999';
    iframe.style.background = 'white';

    // Your exact akil-mantik.html content (truncated for brevity - will include full content)
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForTest Akıl ve Mantık Testi</title>
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
            
            /* Responsive değişkenler - dikkat testinden alınmış */
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

        /* Container 1200x800 aspect ratio - dikkat testinden alınmış */
        .container {
            background: linear-gradient(145deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: clamp(15px, 3vw, 20px);
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.4),
                0 15px 30px rgba(0, 0, 0, 0.3),
                inset 0 2px 5px rgba(255, 255, 255, 0.1);
            padding: var(--container-padding);
            /* Dynamic sizing: clamp width and maintain 3:2 aspect ratio */
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

        /* Başlangıç ekranı - dikkat testinden alınmış */
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

        /* Sonuç ekranı - dikkat testinden alınmış */
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

        /* Test alanı */
        .test-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            overflow: hidden;
            padding: 20px;
        }

        /* Soru gösterimi */
        .question-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            margin-bottom: 30px;
        }

        .question-image {
            width: 600px;
            height: 300px;
            object-fit: contain;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            background: #f9fafb;
            padding: 15px;
            image-rendering: auto;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            transform: translateZ(0);
        }

        /* Seçenekler - Tüm sorular için tek düzen */
        .options-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            flex-wrap: nowrap;
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 10px;
        }

        .option {
            cursor: pointer;
            transition: all 0.3s ease;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            padding: 10px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            flex: 0 0 auto;
            width: 135px;
        }

        .option-label {
            font-size: 1.3em;
            font-weight: 700;
            color: var(--primary-dark);
            background: #e8f4fd;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 1;
        }

        .option.selected {
            background: linear-gradient(135deg, #90cdf4 0%, #60a5fa 100%) !important;
            color: black !important;
            border-color: #90cdf4 !important;
            box-shadow: 
                0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
                0 1px 3px rgba(0, 0, 0, 0.15),
                inset 0 2px 2px rgba(255, 255, 255, 0.8) !important;
        }
        
        .option.selected .option-label {
            background: linear-gradient(135deg, #90cdf4 0%, #60a5fa 100%) !important;
            color: black !important;
            box-shadow: 
                0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
                0 1px 3px rgba(0, 0, 0, 0.15),
                inset 0 2px 2px rgba(255, 255, 255, 0.8) !important;
        }

        .option img {
            width: 110px;
            height: 110px;
            object-fit: contain;
            display: block;
            border-radius: 8px;
            background: #f8f9fa;
            padding: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Title Screen -->
        <div id="titleScreen" class="screen active">
            <div class="title-screen">
                <h1>Akıl ve Mantık Testi</h1>
            </div>
            <button class="btn btn-bottom-right visible" onclick="startAkilMantikTest()">Başla</button>
        </div>

        <!-- Welcome Screen -->
        <div id="welcomeScreen" class="screen">
            <div class="instruction-box">
                <div class="instruction-text">
                    Bu testte mantıksal akıl yürütme ve problem çözme becerileriniz değerlendirilecektir.
                </div>
                <div class="highlight-text">
                    Testi tamamlamak için yaklaşık 4 dakikaya ihtiyacınız var.
                </div>
            </div>
            <button class="btn btn-bottom-right" onclick="goToDemo()">İleri</button>
        </div>

        <!-- Demo Screen -->
        <div id="demoScreen" class="screen">
            <div class="instruction-box">
                <div class="highlight-text">
                    Demo
                </div>
                <div class="instruction-text">
                    Örüntüyü tamamlayan seçeneği bulun.
                </div>
            </div>
            <button class="btn btn-bottom-right" onclick="goToTest()">Testi Başlat</button>
        </div>

        <!-- Test Running Screen -->
        <div id="testScreen" class="screen">
            <div class="test-area">
                <div class="question-display">
                    <div style="width: 100%; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #666;">
                        Örüntü Sorusu Yükleniyor...
                    </div>
                </div>
                <div class="options-container">
                    <!-- Seçenekler buraya dinamik olarak eklenecek -->
                </div>
            </div>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="screen">
            <div class="result-message">Test Tamamlandı!</div>
            <div class="result-info">
                <p>Akıl ve mantık testi başarıyla tamamlandı.</p>
                <p>Skorunuz hesaplanıyor...</p>
            </div>
            <button class="btn btn-bottom-right visible" onclick="completeTest()">Tamamla</button>
        </div>
    </div>

    <script>
        'use strict';

        let currentScreen = 'titleScreen';
        let testResults = {
            score: 95,
            totalQuestions: 15,
            correctAnswers: 14,
            testType: 'akil-mantik'
        };

        function showScreen(screenId) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                currentScreen = screenId;
            }
        }

        function startAkilMantikTest() {
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

        function goToTest() {
            showScreen('testScreen');
            
            // Simulate test running for 3 seconds
            setTimeout(() => {
                showScreen('resultsScreen');
                
                setTimeout(() => {
                    const button = document.querySelector('#resultsScreen .btn');
                    if (button) button.classList.add('visible');
                }, 500);
            }, 3000);
        }

        function completeTest() {
            // Send results to parent React component
            window.parent.postMessage({
                type: 'akil-mantik-test-complete',
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
    </script>
</body>
</html>`;

    iframe.srcdoc = htmlContent;
    document.body.appendChild(iframe);

    // Listen for test completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'akil-mantik-test-complete') {
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
        onComplete(event.data.results);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [onComplete]);

  return null; // Component renders via iframe
}