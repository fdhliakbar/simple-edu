// ===== ENHANCED FEATURES FOR FUNBRAIN KIDS =====

// Tutorial System
window.showWelcomeTutorial = function() {
    if (StorageManager.load('tutorialCompleted')) return;
    
    const tutorial = document.createElement('div');
    tutorial.className = 'tutorial-overlay';
    tutorial.innerHTML = `
        <div class="tutorial-content">
            <div class="tutorial-header">
                <h2>🎉 Selamat Datang di FunBrain Kids!</h2>
                <p>Mari belajar cara bermain!</p>
            </div>
            
            <div class="tutorial-steps">
                <div class="tutorial-step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>🎮 Pilih Game</h3>
                        <p>Klik kartu game untuk memulai bermain. Game terbuka secara bertahap!</p>
                    </div>
                </div>
                
                <div class="tutorial-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>⭐ Kumpulkan Bintang</h3>
                        <p>Mainkan dengan baik untuk mendapatkan 1-3 bintang per game!</p>
                    </div>
                </div>
                
                <div class="tutorial-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>🏆 Raih Achievement</h3>
                        <p>Selesaikan tantangan untuk membuka achievement spesial!</p>
                    </div>
                </div>
            </div>
            
            <div class="tutorial-actions">
                <button class="btn btn-secondary" onclick="skipTutorial()">Lewati</button>
                <button class="btn btn-primary" onclick="nextTutorialStep()">Selanjutnya</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(tutorial);
    window.currentTutorialStep = 1;
    addTutorialCSS();
};

window.nextTutorialStep = function() {
    const currentStep = document.querySelector('.tutorial-step.active');
    const nextStep = document.querySelector(`[data-step="${window.currentTutorialStep + 1}"]`);
    
    if (nextStep) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        window.currentTutorialStep++;
    } else {
        completeTutorial();
    }
};

window.skipTutorial = function() {
    completeTutorial();
};

window.completeTutorial = function() {
    const tutorial = document.querySelector('.tutorial-overlay');
    if (tutorial) {
        tutorial.remove();
    }
    StorageManager.save('tutorialCompleted', true);
};

function addTutorialCSS() {
    if (document.querySelector('#tutorial-css')) return;
    
    const style = document.createElement('style');
    style.id = 'tutorial-css';
    style.textContent = `
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        }
        
        .tutorial-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            text-align: center;
        }
        
        .tutorial-header h2 {
            color: #4a90e2;
            margin-bottom: 10px;
            font-family: var(--font-heading);
        }
        
        .tutorial-steps {
            margin: 30px 0;
        }
        
        .tutorial-step {
            display: none;
            align-items: center;
            text-align: left;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .tutorial-step.active {
            display: flex;
            animation: slideIn 0.5s ease;
        }
        
        .step-number {
            background: #4a90e2;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 20px;
            flex-shrink: 0;
        }
        
        .tutorial-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    
    document.head.appendChild(style);
}

// Feedback System
window.showFeedbackModal = function(gameType, stars) {
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <div class="feedback-content">
            <div class="feedback-header">
                <h2>📝 Bagaimana Perasaanmu?</h2>
                <p>Berikan rating untuk game ini!</p>
            </div>
            
            <div class="emoji-rating">
                <button class="emoji-btn" data-rating="1" onclick="setGameRating('${gameType}', 1)">😢</button>
                <button class="emoji-btn" data-rating="2" onclick="setGameRating('${gameType}', 2)">😐</button>
                <button class="emoji-btn" data-rating="3" onclick="setGameRating('${gameType}', 3)">😊</button>
                <button class="emoji-btn" data-rating="4" onclick="setGameRating('${gameType}', 4)">😄</button>
                <button class="emoji-btn" data-rating="5" onclick="setGameRating('${gameType}', 5)">🤩</button>
            </div>
            
            <div class="feedback-text">
                <textarea id="feedbackText" placeholder="Tulis pesan untuk orang tua atau guru (opsional)..."></textarea>
            </div>
            
            <div class="feedback-actions">
                <button class="btn btn-secondary" onclick="closeFeedbackModal()">Lewati</button>
                <button class="btn btn-primary" onclick="submitFeedback('${gameType}')">Kirim</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addFeedbackCSS();
};

window.setGameRating = function(gameType, rating) {
    window.currentRating = rating;
    
    // Update button states
    document.querySelectorAll('.emoji-btn').forEach((btn, index) => {
        btn.classList.remove('selected');
        if (index + 1 <= rating) {
            btn.classList.add('selected');
        }
    });
    
    // Play sound
    AudioManager.playSound('click');
};

window.submitFeedback = function(gameType) {
    const feedbackText = document.getElementById('feedbackText').value;
    
    const feedbackData = {
        gameType: gameType,
        rating: window.currentRating || 3,
        comment: feedbackText,
        timestamp: new Date().toISOString()
    };
    
    // Save feedback to local storage
    const existingFeedback = StorageManager.load('gameFeedback') || [];
    existingFeedback.push(feedbackData);
    StorageManager.save('gameFeedback', existingFeedback);
    
    // Show thank you message
    showThankYouMessage();
    
    // Close modal
    closeFeedbackModal();
};

window.showThankYouMessage = function() {
    const message = document.createElement('div');
    message.className = 'thank-you-message';
    message.innerHTML = `
        <div class="thank-you-content">
            <div class="thank-you-icon">🎉</div>
            <h3>Terima Kasih!</h3>
            <p>Feedback kamu sangat berharga untuk kami!</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
};

window.closeFeedbackModal = function() {
    const modal = document.querySelector('.feedback-modal');
    if (modal) {
        modal.remove();
    }
};

function addFeedbackCSS() {
    if (document.querySelector('#feedback-css')) return;
    
    const style = document.createElement('style');
    style.id = 'feedback-css';
    style.textContent = `
        .feedback-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        }
        
        .feedback-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
        }
        
        .feedback-header h2 {
            color: #4a90e2;
            margin-bottom: 10px;
            font-family: var(--font-heading);
        }
        
        .emoji-rating {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
        }
        
        .emoji-btn {
            background: #f8f9fa;
            border: 3px solid #e9ecef;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .emoji-btn:hover {
            transform: scale(1.1);
            border-color: #4a90e2;
        }
        
        .emoji-btn.selected {
            background: #4a90e2;
            border-color: #4a90e2;
            transform: scale(1.2);
        }
        
        .feedback-text {
            margin: 30px 0;
        }
        
        .feedback-text textarea {
            width: 100%;
            min-height: 100px;
            padding: 15px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-family: var(--font-body);
            font-size: 1rem;
            resize: vertical;
        }
        
        .feedback-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .thank-you-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10001;
            transition: transform 0.3s ease;
        }
        
        .thank-you-message.show {
            transform: translate(-50%, -50%) scale(1);
        }
        
        .thank-you-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .thank-you-content h3 {
            margin-bottom: 10px;
            font-family: var(--font-heading);
        }
    `;
    
    document.head.appendChild(style);
}

// Auto-initialize tutorial for first-time users
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showWelcomeTutorial();
    }, 2000);
});

console.log('🎮 Enhanced Features Loaded - Tutorial & Feedback System Ready!');
