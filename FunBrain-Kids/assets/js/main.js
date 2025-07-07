// ===== MAIN APPLICATION CONTROLLER =====
class FunBrainKidsApp {
    constructor() {
        this.currentLevel = 1;
        this.totalStars = 0;
        this.unlockedGames = ['letters']; // First game is always unlocked
        this.gameProgress = {
            letters: { completed: false, stars: 0 },
            fruits: { completed: false, stars: 0 },
            numbers: { completed: false, stars: 0 },
            colors: { completed: false, stars: 0 },
            time: { completed: false, stars: 0 }
        };
        
        // Enhanced Achievement System
        this.initAchievements();
        
        this.init();
    }

    init() {
        // Initialize all systems
        this.initAchievements();
        this.loadGameData();
        this.setupEventListeners();
        this.updateGameCards();
        this.updateStats();
        this.startLoadingSequence();
        
        // Enhanced initialization
        this.initInteractiveElements();
        this.initTooltips();
        this.initKeyboardNavigation();
        this.initPerformanceMonitoring();
        
        console.log('🎮 FunBrain Kids Enhanced - Initialized!');
    }

    initInteractiveElements() {
        // Add hover effects to game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('locked')) {
                    AudioManager.playHoverSound();
                    this.createHoverParticles(card);
                }
            });
        });

        // Add click effects to buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createClickRipple(e.target, e);
                AudioManager.playSound('click');
            });
        });
    }

    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                particle.style.top = (rect.top + Math.random() * rect.height) + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = colors[i];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.animation = 'particleFloat 1s ease-out forwards';
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }, i * 100);
        }
    }

    createClickRipple(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.position = 'absolute';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
            element.style.position = 'relative';
        }
        
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        
        // Add ripple CSS if not exists
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    initTooltips() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameType = card.dataset.game;
            const tooltip = this.createTooltip(gameType);
            
            card.addEventListener('mouseenter', (e) => {
                if (!card.classList.contains('locked')) {
                    this.showTooltip(tooltip, e.target);
                }
            });
            
            card.addEventListener('mouseleave', () => {
                this.hideTooltip(tooltip);
            });
        });
    }

    createTooltip(gameType) {
        const tooltips = {
            'letters': {
                title: '🔤 Tebak Huruf',
                description: 'Lengkapi kata dengan huruf yang hilang',
                difficulty: 'Mudah',
                time: '2-3 menit'
            },
            'fruits': {
                title: '🍎 Cocokkan Buah',
                description: 'Temukan pasangan buah yang sama',
                difficulty: 'Mudah',
                time: '3-4 menit'
            },
            'numbers': {
                title: '🔢 Hitung Angka',
                description: 'Selesaikan soal matematika sederhana',
                difficulty: 'Sedang',
                time: '4-5 menit'
            },
            'colors': {
                title: '🌈 Puzzle Warna',
                description: 'Cocokan warna dengan namanya',
                difficulty: 'Sedang',
                time: '3-4 menit'
            },
            'time': {
                title: '🕐 Belajar Jam',
                description: 'Baca waktu pada jam analog',
                difficulty: 'Sulit',
                time: '5-6 menit'
            }
        };

        const info = tooltips[gameType];
        const tooltip = document.createElement('div');
        tooltip.className = 'game-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">${info.title}</div>
            <div class="tooltip-description">${info.description}</div>
            <div class="tooltip-meta">
                <span class="tooltip-difficulty">📊 ${info.difficulty}</span>
                <span class="tooltip-time">⏱️ ${info.time}</span>
            </div>
        `;
        
        // Add tooltip CSS
        if (!document.querySelector('#tooltip-style')) {
            const style = document.createElement('style');
            style.id = 'tooltip-style';
            style.textContent = `
                .game-tooltip {
                    position: absolute;
                    background: linear-gradient(135deg, #2c3e50, #3498db);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    z-index: 1000;
                    max-width: 250px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    pointer-events: none;
                }
                
                .game-tooltip.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .tooltip-header {
                    font-weight: bold;
                    margin-bottom: 8px;
                    font-size: 1.1rem;
                }
                
                .tooltip-description {
                    margin-bottom: 10px;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                
                .tooltip-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 0.8rem;
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(tooltip);
        return tooltip;
    }

    showTooltip(tooltip, target) {
        const rect = target.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        tooltip.classList.add('show');
    }

    hideTooltip(tooltip) {
        tooltip.classList.remove('show');
    }

    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.closeAllModals();
                    break;
                case 'Enter':
                    if (e.target.classList.contains('game-card') && !e.target.classList.contains('locked')) {
                        e.target.click();
                    }
                    break;
                case ' ':
                    if (e.target.tagName === 'BUTTON') {
                        e.preventDefault();
                        e.target.click();
                    }
                    break;
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.game-modal, .completion-modal, .stats-modal').forEach(modal => {
            modal.remove();
        });
    }

    initPerformanceMonitoring() {
        // Monitor FPS and performance
        let lastTime = performance.now();
        let frameCount = 0;
        
        const checkPerformance = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    // Reduce animations if performance is poor
                    document.body.classList.add('low-performance');
                } else {
                    document.body.classList.remove('low-performance');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        requestAnimationFrame(checkPerformance);
    }

    startLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = loadingScreen.querySelector('.progress-bar');
        const loadingText = loadingScreen.querySelector('.loading-subtitle');
        
        const loadingSteps = [
            { text: 'Memuat game...', progress: 20 },
            { text: 'Menyiapkan audio...', progress: 40 },
            { text: 'Mengecek progress...', progress: 60 },
            { text: 'Menyiapkan UI...', progress: 80 },
            { text: 'Hampir selesai...', progress: 95 },
            { text: 'Siap bermain!', progress: 100 }
        ];
        
        let currentStep = 0;
        
        const updateLoading = () => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                loadingText.textContent = step.text;
                progressBar.style.width = step.progress + '%';
                
                // Add loading particles
                this.createLoadingParticles();
                
                currentStep++;
                setTimeout(updateLoading, 500 + Math.random() * 300);
            } else {
                // Fade out loading screen
                setTimeout(() => {
                    loadingScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        this.showWelcomeAnimation();
                        AudioManager.updateBackgroundMusic('menu');
                    }, 500);
                }, 300);
            }
        };
        
        // Start loading sequence
        setTimeout(updateLoading, 500);
        
        // Add fadeOut animation
        if (!document.querySelector('#loading-animations')) {
            const style = document.createElement('style');
            style.id = 'loading-animations';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createLoadingParticles() {
        const loadingScreen = document.getElementById('loadingScreen');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.animation = 'loadingFloat 2s ease-in-out infinite';
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            loadingScreen.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }
        
        // Add loading float animation
        if (!document.querySelector('#loading-float-style')) {
            const style = document.createElement('style');
            style.id = 'loading-float-style';
            style.textContent = `
                @keyframes loadingFloat {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
                    50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showWelcomeAnimation() {
        const header = document.querySelector('.header');
        const gameGrid = document.querySelector('.games-grid');
        
        // Animate header
        header.style.animation = 'slideInFromTop 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        // Animate game cards with stagger
        const gameCards = gameGrid.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px) scale(0.8)';
            
            setTimeout(() => {
                card.style.animation = `cardSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
                card.style.animationDelay = (index * 0.1) + 's';
            }, 200);
        });
        
        // Add welcome animations
        if (!document.querySelector('#welcome-animations')) {
            const style = document.createElement('style');
            style.id = 'welcome-animations';
            style.textContent = `
                @keyframes slideInFromTop {
                    from {
                        transform: translateY(-100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes cardSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(50px) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show welcome message
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 1000);
    }

    showWelcomeMessage() {
        const welcomeModal = document.createElement('div');
        welcomeModal.className = 'welcome-modal';
        welcomeModal.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">🎮</div>
                <h2>Selamat Datang di FunBrain Kids!</h2>
                <p>Platform game edukasi interaktif untuk anak-anak</p>
                <div class="welcome-features">
                    <div class="feature">🧠 5 Mini-Game Edukatif</div>
                    <div class="feature">⭐ Sistem Bintang & Achievement</div>
                    <div class="feature">📱 Responsive & Mobile-Friendly</div>
                    <div class="feature">🔊 Audio Interaktif & Visual</div>
                </div>
                <button class="btn btn-primary" onclick="this.closest('.welcome-modal').remove(); AudioManager.playSound('click');">
                    🚀 Mulai Bermain!
                </button>
            </div>
        `;
        
        // Add welcome modal CSS
        const style = document.createElement('style');
        style.textContent = `
            .welcome-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: welcomeFadeIn 0.5s ease-out;
            }
            
            .welcome-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                animation: welcomeSlideUp 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .welcome-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: welcomeIconBounce 2s infinite;
            }
            
            .welcome-content h2 {
                margin: 0 0 15px 0;
                font-size: 1.8rem;
            }
            
            .welcome-content p {
                margin: 0 0 25px 0;
                opacity: 0.9;
            }
            
            .welcome-features {
                display: grid;
                gap: 10px;
                margin-bottom: 30px;
                text-align: left;
            }
            
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 0.9rem;
            }
            
            @keyframes welcomeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes welcomeSlideUp {
                from {
                    transform: translateY(50px) scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes welcomeIconBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(welcomeModal);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (welcomeModal.parentNode) {
                welcomeModal.remove();
            }
        }, 10000);
    }

    setupEventListeners() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = card.dataset.game;
                const gameLevel = parseInt(card.dataset.level);
                
                if (this.isGameUnlocked(gameType)) {
                    this.startGame(gameType);
                    AudioManager.playSound('click');
                } else {
                    this.showLockedGameMessage();
                }
            });
        });

        // Modal close events
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.closeGameModal();
        });

        // Celebration modal next game button
        document.getElementById('nextGameBtn').addEventListener('click', () => {
            this.closeCelebrationModal();
            this.unlockNextGame();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGameModal();
                this.closeCelebrationModal();
            }
        });

        // Sound toggle
        this.createSoundToggle();
    }

    createSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundToggle.addEventListener('click', () => {
            AudioManager.toggleSound();
            soundToggle.innerHTML = AudioManager.isMuted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
            soundToggle.classList.toggle('muted', AudioManager.isMuted);
        });
        document.body.appendChild(soundToggle);
    }

    isGameUnlocked(gameType) {
        return this.unlockedGames.includes(gameType);
    }

    startGame(gameType) {
        const modal = document.getElementById('gameModal');
        const gameTitle = document.getElementById('gameTitle');
        const gameContainer = document.getElementById('gameContainer');
        
        // Set game title
        const gameTitles = {
            letters: 'Tebak Huruf',
            fruits: 'Cocokkan Buah',
            numbers: 'Hitung Angka',
            colors: 'Puzzle Warna',
            time: 'Belajar Jam'
        };
        
        gameTitle.textContent = gameTitles[gameType];
        
        // Show modal
        modal.style.display = 'block';
        
        // Initialize game
        switch(gameType) {
            case 'letters':
                new LetterGame(gameContainer, this);
                break;
            case 'fruits':
                new FruitMatchingGame(gameContainer, this);
                break;
            case 'numbers':
                new NumberCountingGame(gameContainer, this);
                break;
            case 'colors':
                new ColorPuzzleGame(gameContainer, this);
                break;
            case 'time':
                new TimeGame(gameContainer, this);
                break;
        }
    }

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        modal.style.display = 'none';
        
        // Clean up game container
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = '';
    }

    showLockedGameMessage() {
        this.showFeedback('Game ini masih terkunci! Selesaikan game sebelumnya terlebih dahulu.', 'info');
    }

    // Enhanced game completion handling
    onGameComplete(gameType, stars) {
        const timeTaken = (Date.now() - this.gameStartTime) / 1000;
        
        // Create celebration effect
        this.createCelebrationEffect(stars);
        
        // Update game data
        this.gameData[gameType].completed = true;
        this.gameData[gameType].stars = Math.max(this.gameData[gameType].stars || 0, stars);
        this.gameData[gameType].bestTime = Math.min(this.gameData[gameType].bestTime || Infinity, timeTaken);
        
        // Save progress
        this.saveGameData();
        
        // Check achievements
        this.checkAchievements(gameType, stars, timeTaken);
        
        // Update UI
        this.updateGameCards();
        this.updateStats();
        
        // Unlock next game
        this.unlockNextGame(gameType);
        
        // Show completion modal
        this.showCompletionModal(gameType, stars, timeTaken);
        
        // Track analytics
        StorageManager.trackGameComplete(gameType, stars, timeTaken);
    }

    createCelebrationEffect(stars) {
        // Fireworks effect for 3 stars
        if (stars === 3) {
            this.createFireworks();
        }
        
        // Confetti for 2+ stars
        if (stars >= 2) {
            this.createConfetti();
        }
        
        // Screen flash effect
        this.createScreenFlash();
    }

    createFireworks() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.6;
                this.createFireworkBurst(x, y, colors[i % colors.length]);
            }, i * 300);
        }
    }

    createFireworkBurst(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = color;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10000';
            
            const angle = (Math.PI * 2 * i) / 12;
            const velocity = 100 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.animation = `fireworkParticle 1.5s ease-out forwards`;
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
        
        // Add CSS for firework animation
        if (!document.querySelector('#firework-style')) {
            const style = document.createElement('style');
            style.id = 'firework-style';
            style.textContent = `
                @keyframes fireworkParticle {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--vx), var(--vy)) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createConfetti() {
        const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d', '#ff8a80'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-10px';
                confetti.style.width = '8px';
                confetti.style.height = '8px';
                confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.animation = `confettiFall ${3 + Math.random() * 2}s linear forwards`;
                confetti.style.zIndex = '9999';
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 5000);
            }, i * 50);
        }
        
        // Add CSS for confetti animation
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createScreenFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = 'rgba(255, 255, 255, 0.8)';
        flash.style.zIndex = '9998';
        flash.style.pointerEvents = 'none';
        flash.style.animation = 'screenFlash 0.3s ease-out';
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
        
        // Add CSS for screen flash
        if (!document.querySelector('#flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes screenFlash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    closeCelebrationModal() {
        const modal = document.getElementById('celebrationModal');
        modal.style.display = 'none';
    }

    unlockNextGame() {
        const gameOrder = ['letters', 'fruits', 'numbers', 'colors', 'time'];
        const currentIndex = gameOrder.indexOf(this.unlockedGames[this.unlockedGames.length - 1]);
        
        if (currentIndex < gameOrder.length - 1) {
            const nextGame = gameOrder[currentIndex + 1];
            this.unlockedGames.push(nextGame);
            this.currentLevel++;
            this.updateUI();
            this.saveGameData();
            
            // Animate the newly unlocked game
            const nextGameCard = document.querySelector(`[data-game="${nextGame}"]`);
            if (nextGameCard) {
                nextGameCard.classList.add('animate-on-scroll', 'animated');
                setTimeout(() => {
                    nextGameCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }

    // Enhanced Achievement System
    initAchievements() {
        this.achievements = {
            'first_game': {
                name: 'Pemula Hebat',
                description: 'Selesaikan game pertama',
                icon: '🌟',
                unlocked: false,
                progress: 0,
                maxProgress: 1
            },
            'three_stars': {
                name: 'Bintang Sempurna',
                description: 'Dapatkan 3 bintang dalam satu game',
                icon: '⭐',
                unlocked: false,
                progress: 0,
                maxProgress: 1
            },
            'speed_demon': {
                name: 'Kilat Cepat',
                description: 'Selesaikan game dalam 30 detik',
                icon: '⚡',
                unlocked: false,
                progress: 0,
                maxProgress: 1
            },
            'collector': {
                name: 'Kolektor Bintang',
                description: 'Kumpulkan 15 bintang',
                icon: '🏆',
                unlocked: false,
                progress: 0,
                maxProgress: 15
            },
            'master_player': {
                name: 'Master Pemain',
                description: 'Unlock semua game',
                icon: '👑',
                unlocked: false,
                progress: 0,
                maxProgress: 5
            }
        };
        
        // Load achievement progress
        const savedAchievements = StorageManager.loadAchievements();
        if (savedAchievements) {
            Object.assign(this.achievements, savedAchievements);
        }
    }

    checkAchievements(gameType, stars, timeTaken) {
        const newUnlocks = [];
        
        // First game achievement
        if (!this.achievements['first_game'].unlocked) {
            this.achievements['first_game'].progress = 1;
            this.achievements['first_game'].unlocked = true;
            newUnlocks.push(this.achievements['first_game']);
        }
        
        // Three stars achievement
        if (stars === 3 && !this.achievements['three_stars'].unlocked) {
            this.achievements['three_stars'].progress = 1;
            this.achievements['three_stars'].unlocked = true;
            newUnlocks.push(this.achievements['three_stars']);
        }
        
        // Speed demon achievement
        if (timeTaken < 30 && !this.achievements['speed_demon'].unlocked) {
            this.achievements['speed_demon'].progress = 1;
            this.achievements['speed_demon'].unlocked = true;
            newUnlocks.push(this.achievements['speed_demon']);
        }
        
        // Collector achievement
        const totalStars = this.getTotalStars();
        this.achievements['collector'].progress = totalStars;
        if (totalStars >= 15 && !this.achievements['collector'].unlocked) {
            this.achievements['collector'].unlocked = true;
            newUnlocks.push(this.achievements['collector']);
        }
        
        // Master player achievement
        const unlockedGames = this.unlockedGames.length;
        this.achievements['master_player'].progress = unlockedGames;
        if (unlockedGames >= 5 && !this.achievements['master_player'].unlocked) {
            this.achievements['master_player'].unlocked = true;
            newUnlocks.push(this.achievements['master_player']);
        }
        
        // Save achievements
        StorageManager.saveAchievements(this.achievements);
        
        // Show new achievements
        newUnlocks.forEach(achievement => {
            this.showAchievementUnlock(achievement);
        });
    }

    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h3>Achievement Unlocked!</h3>
                <p><strong>${achievement.name}</strong></p>
                <p>${achievement.description}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add CSS for achievement notification
        const style = document.createElement('style');
        style.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ffd700, #ffed4a);
                color: #333;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 10000;
                animation: achievementSlideIn 0.5s ease-out;
                max-width: 300px;
            }
            
            .achievement-icon {
                font-size: 3rem;
                animation: achievementBounce 2s infinite;
            }
            
            .achievement-info h3 {
                margin: 0 0 5px 0;
                font-size: 1.2rem;
                color: #d4af37;
            }
            
            .achievement-info p {
                margin: 0;
                font-size: 0.9rem;
            }
            
            @keyframes achievementSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes achievementBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'achievementSlideIn 0.5s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 4000);
        
        // Play achievement sound
        AudioManager.playSound('celebration');
    }

    // Enhanced particle system
    createParticles(element, count = 10) {
        const rect = element.getBoundingClientRect();
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 100 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }
    }

    closeCelebrationModal() {
        const modal = document.getElementById('celebrationModal');
        modal.style.display = 'none';
    }

    unlockNextGame() {
        const gameOrder = ['letters', 'fruits', 'numbers', 'colors', 'time'];
        const currentIndex = gameOrder.indexOf(this.unlockedGames[this.unlockedGames.length - 1]);
        
        if (currentIndex < gameOrder.length - 1) {
            const nextGame = gameOrder[currentIndex + 1];
            this.unlockedGames.push(nextGame);
            this.currentLevel++;
            this.updateUI();
            this.saveGameData();
            
            // Animate the newly unlocked game
            const nextGameCard = document.querySelector(`[data-game="${nextGame}"]`);
            if (nextGameCard) {
                nextGameCard.classList.add('animate-on-scroll', 'animated');
                setTimeout(() => {
                    nextGameCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        }
    }

    updateUI() {
        // Update header info
        document.getElementById('totalStars').textContent = this.totalStars;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        
        // Update game cards
        document.querySelectorAll('.game-card').forEach(card => {
            const gameType = card.dataset.game;
            const gameStatus = card.querySelector('.game-status');
            
            if (this.isGameUnlocked(gameType)) {
                card.classList.remove('locked');
                gameStatus.classList.remove('locked');
                
                if (this.gameProgress[gameType].completed) {
                    gameStatus.classList.add('completed');
                    gameStatus.innerHTML = '<i class="fas fa-check"></i><span>Selesai</span>';
                } else {
                    gameStatus.classList.add('unlocked');
                    gameStatus.innerHTML = '<i class="fas fa-play"></i><span>Mulai</span>';
                }
            } else {
                card.classList.add('locked');
                gameStatus.classList.add('locked');
                gameStatus.innerHTML = '<i class="fas fa-lock"></i><span>Terkunci</span>';
            }
        });
    }

    showFeedback(message, type = 'info') {
        const feedbackContainer = document.querySelector('.feedback-container') || this.createFeedbackContainer();
        
        const feedbackMessage = document.createElement('div');
        feedbackMessage.className = `feedback-message ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
        
        feedbackMessage.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        feedbackContainer.appendChild(feedbackMessage);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            feedbackMessage.remove();
        }, 3000);
    }

    createFeedbackContainer() {
        const container = document.createElement('div');
        container.className = 'feedback-container';
        document.body.appendChild(container);
        return container;
    }

    saveGameData() {
        const gameData = {
            currentLevel: this.currentLevel,
            totalStars: this.totalStars,
            unlockedGames: this.unlockedGames,
            gameProgress: this.gameProgress,
            achievements: this.achievements
        };
        
        StorageManager.save('funBrainKidsData', gameData);
    }

    loadGameData() {
        const savedData = StorageManager.load('funBrainKidsData');
        
        if (savedData) {
            this.currentLevel = savedData.currentLevel || 1;
            this.totalStars = savedData.totalStars || 0;
            this.unlockedGames = savedData.unlockedGames || ['letters'];
            this.gameProgress = savedData.gameProgress || this.gameProgress;
            this.achievements = savedData.achievements || this.achievements;
        }
    }

    updateGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const gameType = card.dataset.game;
            const gameLevel = parseInt(card.dataset.level);
            const gameData = this.gameProgress[gameType];
            
            // Update unlock status
            if (this.isGameUnlocked(gameType)) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
                
                // Update stars display
                const starsContainer = card.querySelector('.stars');
                if (starsContainer && gameData) {
                    const stars = gameData.stars || 0;
                    starsContainer.innerHTML = '';
                    
                    for (let i = 0; i < 3; i++) {
                        const star = document.createElement('span');
                        star.className = `star ${i < stars ? 'earned' : ''}`;
                        star.textContent = i < stars ? '⭐' : '☆';
                        starsContainer.appendChild(star);
                    }
                }
                
                // Update completion status
                if (gameData && gameData.completed) {
                    card.classList.add('completed');
                    const completionBadge = card.querySelector('.completion-badge');
                    if (!completionBadge) {
                        const badge = document.createElement('div');
                        badge.className = 'completion-badge';
                        badge.innerHTML = '✅';
                        badge.title = 'Selesai';
                        card.appendChild(badge);
                    }
                }
            } else {
                card.classList.add('locked');
                card.classList.remove('unlocked');
                
                // Add lock icon
                const lockIcon = card.querySelector('.lock-icon');
                if (!lockIcon) {
                    const lock = document.createElement('div');
                    lock.className = 'lock-icon';
                    lock.innerHTML = '🔒';
                    lock.title = 'Terkunci';
                    card.appendChild(lock);
                }
            }
        });
    }

    updateStats() {
        // Update header stats
        const totalStarsElement = document.getElementById('totalStars');
        const currentLevelElement = document.getElementById('currentLevel');
        
        if (totalStarsElement) {
            totalStarsElement.textContent = this.totalStars;
        }
        
        if (currentLevelElement) {
            currentLevelElement.textContent = this.currentLevel;
        }
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const completedGames = Object.values(this.gameProgress).filter(game => game.completed).length;
            const totalGames = Object.keys(this.gameProgress).length;
            const progress = (completedGames / totalGames) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        // Update overall stats
        this.updateOverallStats();
    }

    updateOverallStats() {
        const completedGames = Object.values(this.gameProgress).filter(game => game.completed).length;
        const totalGames = Object.keys(this.gameProgress).length;
        
        // Calculate total stars earned
        this.totalStars = Object.values(this.gameProgress).reduce((total, game) => {
            return total + (game.stars || 0);
        }, 0);
        
        // Calculate current level based on progress
        this.currentLevel = Math.floor(completedGames / 2) + 1;
        
        // Update achievement progress
        this.updateAchievementProgress();
    }

    updateAchievementProgress() {
        // Update achievement progress based on current stats
        const completedGames = Object.values(this.gameProgress).filter(game => game.completed).length;
        const perfectGames = Object.values(this.gameProgress).filter(game => game.stars === 3).length;
        
        // Check various achievement criteria
        this.checkAchievementCriteria('first_win', completedGames >= 1);
        this.checkAchievementCriteria('five_stars', this.totalStars >= 5);
        this.checkAchievementCriteria('ten_stars', this.totalStars >= 10);
        this.checkAchievementCriteria('fifteen_stars', this.totalStars >= 15);
        this.checkAchievementCriteria('all_games', completedGames >= 5);
        this.checkAchievementCriteria('perfect_player', perfectGames >= 3);
        this.checkAchievementCriteria('speed_demon', this.hasSpeedAchievement());
        this.checkAchievementCriteria('persistent', this.getPlayCount() >= 10);
    }

    checkAchievementCriteria(achievementId, criteria) {
        if (criteria && this.achievements[achievementId] && !this.achievements[achievementId].unlocked) {
            this.unlockAchievement(achievementId);
        }
    }

    hasSpeedAchievement() {
        // Check if player has completed any game in under 30 seconds
        return Object.values(this.gameProgress).some(game => game.bestTime && game.bestTime < 30);
    }

    getPlayCount() {
        // Get total play count from storage
        const playCount = StorageManager.load('playCount') || 0;
        return playCount;
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showAchievementNotification(achievement);
            this.saveGameData();
            
            // Play achievement sound
            AudioManager.playSound('success');
            
            // Create celebration particles
            this.createAchievementParticles();
            
            console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3>Achievement Unlocked!</h3>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    createAchievementParticles() {
        const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = (Math.random() * window.innerWidth) + 'px';
                particle.style.top = (Math.random() * window.innerHeight) + 'px';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                particle.style.animation = 'achievementParticle 2s ease-out forwards';
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    getTotalStars() {
        return Object.values(this.gameProgress).reduce((total, game) => {
            return total + (game.stars || 0);
        }, 0);
    }

    getPerformanceText(stars, timeTaken) {
        if (stars === 3) {
            if (timeTaken < 30) return 'Fantastis!';
            else if (timeTaken < 60) return 'Luar Biasa!';
            else return 'Hebat!';
        } else if (stars === 2) {
            if (timeTaken < 45) return 'Bagus Sekali!';
            else return 'Bagus!';
        } else {
            return 'Terus Berlatih!';
        }
    }

    showNextGame() {
        const gameOrder = ['letters', 'fruits', 'numbers', 'colors', 'time'];
        const nextGameIndex = this.unlockedGames.length;
        
        if (nextGameIndex < gameOrder.length) {
            const nextGame = gameOrder[nextGameIndex];
            const nextGameCard = document.querySelector(`[data-game="${nextGame}"]`);
            
            if (nextGameCard) {
                nextGameCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add highlight effect
                nextGameCard.classList.add('highlight');
                setTimeout(() => {
                    nextGameCard.classList.remove('highlight');
                }, 2000);
            }
        }
    }

    showStats() {
        const modal = document.createElement('div');
        modal.className = 'stats-modal';
        modal.innerHTML = `
            <div class="stats-content">
                <div class="stats-header">
                    <h2>📊 Statistik Permainan</h2>
                    <button class="close-btn" onclick="this.closest('.stats-modal').remove()">×</button>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${this.getTotalStars()}</div>
                        <div class="stat-label">Total Bintang</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎮</div>
                        <div class="stat-value">${this.unlockedGames.length}</div>
                        <div class="stat-label">Game Terbuka</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">${Object.values(this.gameProgress).filter(g => g.completed).length}</div>
                        <div class="stat-label">Game Selesai</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏅</div>
                        <div class="stat-value">${Object.values(this.achievements).filter(a => a.unlocked).length}</div>
                        <div class="stat-label">Achievement</div>
                    </div>
                </div>
                
                <div class="achievements-section">
                    <h3>🏆 Pencapaian</h3>
                    <div class="achievements-grid">
                        ${Object.entries(this.achievements).map(([key, achievement]) => `
                            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                                <div class="achievement-icon">${achievement.icon}</div>
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-desc">${achievement.description}</div>
                                ${achievement.unlocked ? '<div class="achievement-status">✅ Terbuka</div>' : '<div class="achievement-status">🔒 Terkunci</div>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add CSS for stats modal
        this.addStatsModalCSS();
    }

    addStatsModalCSS() {
        if (document.querySelector('#stats-modal-css')) return;
        
        const style = document.createElement('style');
        style.id = 'stats-modal-css';
        style.textContent = `
            .stats-modal {
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
            
            .stats-content {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            }
            
            .stats-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                text-align: center;
            }
            
            .stat-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .achievement-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 2px solid #e9ecef;
            }
            
            .achievement-card.unlocked {
                background: linear-gradient(135deg, #ffd700, #ffa500);
                color: white;
                border-color: #ffd700;
            }
            
            .achievement-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .achievement-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .achievement-desc {
                font-size: 0.9rem;
                opacity: 0.8;
                margin-bottom: 10px;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Welcome Tutorial for First-time Users
    showWelcomeTutorial() {
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
                    <button class="btn btn-secondary" onclick="app.skipTutorial()">Lewati</button>
                    <button class="btn btn-primary" onclick="app.nextTutorialStep()">Selanjutnya</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tutorial);
        this.currentTutorialStep = 1;
        
        // Add tutorial CSS
        this.addTutorialCSS();
    }

    nextTutorialStep() {
        const currentStep = document.querySelector('.tutorial-step.active');
        const nextStep = document.querySelector(`[data-step="${this.currentTutorialStep + 1}"]`);
        
        if (nextStep) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            this.currentTutorialStep++;
        } else {
            this.completeTutorial();
        }
    }

    skipTutorial() {
        this.completeTutorial();
    }

    completeTutorial() {
        const tutorial = document.querySelector('.tutorial-overlay');
        if (tutorial) {
            tutorial.remove();
        }
        StorageManager.save('tutorialCompleted', true);
    }

    addTutorialCSS() {
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

    // Game Feedback System
    showFeedbackModal(gameType, stars) {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-header">
                    <h2>📝 Bagaimana Perasaanmu?</h2>
                    <p>Berikan rating untuk game ini!</p>
                </div>
                
                <div class="emoji-rating">
                    <button class="emoji-btn" data-rating="1" onclick="app.setGameRating('${gameType}', 1)">😢</button>
                    <button class="emoji-btn" data-rating="2" onclick="app.setGameRating('${gameType}', 2)">😐</button>
                    <button class="emoji-btn" data-rating="3" onclick="app.setGameRating('${gameType}', 3)">😊</button>
                    <button class="emoji-btn" data-rating="4" onclick="app.setGameRating('${gameType}', 4)">😄</button>
                    <button class="emoji-btn" data-rating="5" onclick="app.setGameRating('${gameType}', 5)">🤩</button>
                </div>
                
                <div class="feedback-text">
                    <textarea id="feedbackText" placeholder="Tulis pesan untuk orang tua atau guru (opsional)..."></textarea>
                </div>
                
                <div class="feedback-actions">
                    <button class="btn btn-secondary" onclick="app.closeFeedbackModal()">Lewati</button>
                    <button class="btn btn-primary" onclick="app.submitFeedback('${gameType}')">Kirim</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addFeedbackCSS();
    }

    setGameRating(gameType, rating) {
        this.currentRating = rating;
        
        // Update button states
        document.querySelectorAll('.emoji-btn').forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index + 1 <= rating) {
                btn.classList.add('selected');
            }
        });
        
        // Play sound
        AudioManager.playSound('click');
    }

    submitFeedback(gameType) {
        const feedbackText = document.getElementById('feedbackText').value;
        
        const feedbackData = {
            gameType: gameType,
            rating: this.currentRating || 3,
            comment: feedbackText,
            timestamp: new Date().toISOString(),
            stars: this.gameProgress[gameType].stars
        };
        
        // Save feedback to local storage
        const existingFeedback = StorageManager.load('gameFeedback') || [];
        existingFeedback.push(feedbackData);
        StorageManager.save('gameFeedback', existingFeedback);
        
        // Show thank you message
        this.showThankYouMessage();
        
        // Close modal
        this.closeFeedbackModal();
    }

    showThankYouMessage() {
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
    }

    closeFeedbackModal() {
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.remove();
        }
    }

    addFeedbackCSS() {
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

    // ...existing code...
}

// ===== SCROLL ANIMATION HANDLER =====
class ScrollAnimationManager {
    constructor() {
        this.setupScrollObserver();
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all elements that need animation
        document.querySelectorAll('.game-card, .achievement-card, .feature-item').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
}

// ===== RESPONSIVE HANDLER =====
class ResponsiveManager {
    constructor() {
        this.setupResponsiveHandlers();
    }

    setupResponsiveHandlers() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Initial check
        this.handleResize();
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        // Adjust game modal size on mobile
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            if (isMobile) {
                modalContent.style.width = '95%';
                modalContent.style.margin = '5% auto';
            } else {
                modalContent.style.width = '90%';
                modalContent.style.margin = '2% auto';
            }
        }
    }
}

// ===== PERFORMANCE OPTIMIZER =====
class PerformanceOptimizer {
    constructor() {
        this.setupPerformanceOptimizations();
    }

    setupPerformanceOptimizations() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Optimize animations
        this.setupAnimationOptimization();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupAnimationOptimization() {
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            const animations = document.querySelectorAll('.animate-on-scroll');
            animations.forEach(el => {
                if (document.visibilityState === 'hidden') {
                    el.style.animationPlayState = 'paused';
                } else {
                    el.style.animationPlayState = 'running';
                }
            });
        });
    }

    preloadCriticalResources() {
        // Preload important images and sounds
        const criticalAssets = [
            'assets/sounds/click.mp3',
            'assets/sounds/success.mp3',
            'assets/sounds/background.mp3'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset;
            link.as = asset.includes('.mp3') ? 'audio' : 'image';
            document.head.appendChild(link);
        });
    }
}

// ===== ACCESSIBILITY MANAGER =====
class AccessibilityManager {
    constructor() {
        this.setupAccessibilityFeatures();
    }

    setupAccessibilityFeatures() {
        // Add keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add ARIA labels
        this.setupAriaLabels();
        
        // Add focus management
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navigate games with arrow keys
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.navigateGames(e.key);
                e.preventDefault();
            }
            
            // Enter key to select game
            if (e.key === 'Enter') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('game-card')) {
                    focusedElement.click();
                }
            }
        });
    }

    setupAriaLabels() {
        document.querySelectorAll('.game-card').forEach(card => {
            const gameType = card.dataset.game;
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            
            card.setAttribute('aria-label', `${title}: ${description}`);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
        });
    }

    setupFocusManagement() {
        // Focus management for modals
        const modals = document.querySelectorAll('.game-modal, .celebration-modal');
        modals.forEach(modal => {
            modal.addEventListener('shown', () => {
                const firstFocusable = modal.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            });
        });
    }

    navigateGames(direction) {
        const gameCards = Array.from(document.querySelectorAll('.game-card'));
        const currentIndex = gameCards.indexOf(document.activeElement);
        
        let newIndex;
        if (direction === 'ArrowLeft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : gameCards.length - 1;
        } else {
            newIndex = currentIndex < gameCards.length - 1 ? currentIndex + 1 : 0;
        }
        
        gameCards[newIndex].focus();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    window.funBrainApp = new FunBrainKidsApp();
    
    // Initialize additional managers
    new ScrollAnimationManager();
    new ResponsiveManager();
    new PerformanceOptimizer();
    new AccessibilityManager();
    
    // Initialize audio manager
    AudioManager.init();
    
    // Add development tools in dev mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.resetProgress = () => window.funBrainApp.resetProgress();
        console.log('Development mode: Use resetProgress() to reset game progress');
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    
    // Show user-friendly error message
    if (window.funBrainApp) {
        window.funBrainApp.showFeedback('Terjadi kesalahan. Silakan muat ulang halaman.', 'error');
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FunBrainKidsApp };
}