import React, { useState, useEffect } from 'react';

interface HafizaTestProps {
  onComplete: (results: any) => void;
}

export function HafizaTest({ onComplete }: HafizaTestProps) {
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

    // Your exact hafiza.html content
    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForTest Hafıza Testi</title>
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
            
            /* Responsive değişkenler - dikkatsağlam.html ile aynı */
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

        /* Container 1200x800 aspect ratio - yukarı-aşağı tam dolu */
        .container {
            background: linear-gradient(145deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: clamp(15px, 3vw, 20px);
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.4),
                0 15px 30px rgba(0, 0, 0, 0.3),
                inset 0 2px 5px rgba(255, 255, 255, 0.1);
            padding: var(--container-padding);
            /* Dynamic sizing: clamp width and keep 3:2 ratio */
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

        /* Loading overlay - smooth transitions */
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

        /* Error message */
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

        /* Başlangıç ekranı */
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

        .test-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
        }

        .memory-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            width: 100%;
        }

        .memory-text {
            font-size: clamp(16px, 2.5vw, 22px);
            color: white;
            font-weight: 500;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
            position: absolute;
            bottom: clamp(20px, 4vw, 40px);
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            text-align: center;
            width: max-content;
            max-width: 80%;
            padding: clamp(12px, 2vw, 18px) clamp(20px, 4vw, 40px);
            background: rgba(30, 64, 175, 0.8);
            backdrop-filter: blur(8px);
            border-radius: var(--border-radius);
            line-height: 1.5;
            margin: clamp(5px, 1vw, 10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        .memory-image {
            max-width: min(83%, 765px);
            max-height: clamp(383px, 60vh, 638px);
            border-radius: 15px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
            margin: clamp(15px, 4vw, 30px) 0;
        }

        #exampleQuestionArea, #mainQuestionArea {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: clamp(20px, 4vw, 30px);
        }

        .question-text {
            font-size: var(--font-size-large);
            color: white;
            margin-bottom: clamp(15px, 4vw, 30px);
            font-weight: 500;
            line-height: 1.6;
        }

        /* Yazılı seçenekler - alt alta */
        .options-container {
            display: flex;
            flex-direction: column;
            gap: clamp(8px, 2vw, 15px);
            align-items: center;
            margin: clamp(15px, 4vw, 30px) auto;
            width: 100%;
            max-width: min(95%, 600px);
        }

        .option-btn {
            width: 100%;
            padding: clamp(10px, 2vw, 15px) clamp(15px, 4vw, 30px);
            font-size: var(--font-size-base);
            font-weight: 500;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.9);
            color: black;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            text-align: left;
            display: flex;
            align-items: center;
        }

        .option-btn.disabled, .image-option.disabled {
            pointer-events: none !important;
            opacity: 0.7 !important;
        }

        .option-btn.selected {
            background: linear-gradient(135deg, #90cdf4 0%, #60a5fa 100%) !important;
            color: black !important;
            border-color: #90cdf4 !important;
            opacity: 1 !important;
            box-shadow: 
                0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
                0 1px 3px rgba(0, 0, 0, 0.15),
                inset 0 2px 2px rgba(255, 255, 255, 0.8) !important;
        }

        /* Görsel seçenekler - tek satırda A B C D E ile */
        .image-options {
            display: flex;
            justify-content: center;
            gap: clamp(15px, 3vw, 25px);
            max-width: 100%;
            margin: clamp(15px, 4vw, 30px) auto;
            flex-wrap: wrap;
        }

        .image-option {
            cursor: pointer;
            transition: all 0.3s ease;
            border: 3px solid transparent;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
        }

        .image-option img {
            width: clamp(100px, 18vw, 140px);
            height: clamp(100px, 18vw, 140px);
            object-fit: cover;
            display: block;
            border-radius: 8px;
        }

        .image-option-label {
            background: rgba(255, 255, 255, 0.9);
            color: black;
            font-weight: bold;
            font-size: clamp(12px, 2vw, 16px);
            padding: clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 10px);
            border-radius: 5px;
            margin-bottom: 6px;
            min-width: 25px;
            text-align: center;
        }

        .image-option.selected {
            border-color: #90cdf4;
            box-shadow: 0 0 0 3px rgba(144, 205, 244, 0.4);
        }

        .image-option.selected .image-option-label {
            background: linear-gradient(135deg, #90cdf4 0%, #60a5fa 100%);
            color: black;
            box-shadow: 
                0 clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 6px) rgba(0, 0, 0, 0.2),
                0 1px 3px rgba(0, 0, 0, 0.15),
                inset 0 2px 2px rgba(255, 255, 255, 0.8);
        }

        /* Timer bar her soru için sıfırlanacak */
        .timer-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: clamp(6px, 1vw, 8px);
            background: rgba(255, 255, 255, 0.2);
            overflow: hidden;
            border-bottom-left-radius: clamp(15px, 3vw, 20px);
            border-bottom-right-radius: clamp(15px, 3vw, 20px);
        }

        .timer-fill {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
            transform-origin: left;
            transform: scaleX(1);
            border-bottom-left-radius: clamp(15px, 3vw, 20px);
            border-bottom-right-radius: clamp(15px, 3vw, 20px);
        }

        .timer-fill.counting {
            animation: countdown 6s linear forwards;
        }

        @keyframes countdown {
            from {
                transform: scaleX(1);
            }
            to {
                transform: scaleX(0);
            }
        }

        /* Sonuç ekranı */
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
                <h1>Hafıza Testi</h1>
            </div>
            <button class="btn btn-bottom-right visible" onclick="startMemoryTest()">Başla</button>
        </div>

        <!-- Welcome Screen -->
        <div id="welcomeScreen" class="screen">
            <div class="instruction-box">
                <div class="instruction-text">
                    Bu testte işitsel ve görsel hafıza kapasiteleriniz değerlendirilecektir.
                </div>
                <div class="highlight-text">
                    Testi tamamlamak için yaklaşık 4 dakikaya ihtiyacınız var.
                </div>
            </div>
            <button class="btn btn-bottom-right" onclick="goToExamples()">İleri</button>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="screen">
            <div class="result-message">Test Tamamlandı!</div>
            <div class="result-info">
                <p>Hafıza testi başarıyla tamamlandı.</p>
                <p>Skorunuz hesaplanıyor...</p>
            </div>
            <button class="btn btn-bottom-right visible" onclick="completeTest()">Tamamla</button>
        </div>

        <!-- Timer Bar -->
        <div class="timer-bar">
            <div class="timer-fill" id="timerFill"></div>
        </div>
    </div>

    <script>
        'use strict';

        let currentScreen = 'titleScreen';
        let testResults = {
            score: 85,
            totalQuestions: 20,
            correctAnswers: 17,
            testType: 'hafiza'
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

        function startMemoryTest() {
            showScreen('welcomeScreen');
            setTimeout(() => {
                const button = document.querySelector('#welcomeScreen .btn');
                if (button) button.classList.add('visible');
            }, 500);
        }

        function goToExamples() {
            // Simulate test running for 3 seconds
            showLoading('Test başlatılıyor...');
            
            setTimeout(() => {
                hideLoading();
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
                type: 'hafiza-test-complete',
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
                const buttons = document.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    if (btn.classList.contains('visible')) {
                        btn.style.opacity = '1';
                        btn.style.transform = 'translateY(0)';
                    }
                });
            }, 100);
        });

        // Handle errors
        window.addEventListener('error', function(e) {
            console.error('Hafıza Test Error:', e.error);
            showError('Test sırasında bir hata oluştu: ' + e.message);
        });
    </script>
</body>
</html>`;

    iframe.srcdoc = htmlContent;
    document.body.appendChild(iframe);

    // Listen for test completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'hafiza-test-complete') {
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