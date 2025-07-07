// ===== PARTICLE BACKGROUND SYSTEM =====
class ParticleBackground {
    constructor() {
        this.container = document.getElementById('particleBg');
        this.particles = [];
        this.maxParticles = 50;
        this.colors = ['#4a90e2', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = `radial-gradient(circle, ${color}66 0%, transparent 70%)`;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            this.particles = this.particles.filter(p => p !== particle);
        }, (duration + 5) * 1000);
    }

    animate() {
        // Continuously add new particles
        setInterval(() => {
            if (this.particles.length < this.maxParticles) {
                this.createParticle();
            }
        }, 400);
    }

    // Responsive particle count
    updateParticleCount() {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            this.maxParticles = 20;
        } else if (screenWidth < 1024) {
            this.maxParticles = 35;
        } else {
            this.maxParticles = 50;
        }
    }
}

// ===== INTERACTIVE SOUND EFFECTS =====
class SoundEffects {
    constructor() {
        this.sounds = {
            hover: this.createTone(800, 0.1, 0.05),
            click: this.createTone(1200, 0.15, 0.1),
            success: this.createTone(660, 0.3, 0.2),
            error: this.createTone(300, 0.2, 0.15),
            notification: this.createTone(880, 0.25, 0.12)
        };
    }

    createTone(frequency, duration, volume = 0.1) {
        return () => {
            if (!AudioManager.soundEnabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        this.isLowPerformance = false;
        this.init();
    }

    init() {
        this.monitor();
        this.createPerformanceIndicator();
    }

    monitor() {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Adjust performance based on FPS
            if (this.fps < 30 && !this.isLowPerformance) {
                this.enableLowPerformanceMode();
            } else if (this.fps > 45 && this.isLowPerformance) {
                this.disableLowPerformanceMode();
            }
            
            this.updatePerformanceIndicator();
        }
        
        requestAnimationFrame(() => this.monitor());
    }

    enableLowPerformanceMode() {
        this.isLowPerformance = true;
        document.body.classList.add('low-performance');
        
        // Reduce particle count
        if (window.particleBackground) {
            window.particleBackground.maxParticles = 15;
        }
        
        // Disable some animations
        document.querySelectorAll('.game-card').forEach(card => {
            card.style.animation = 'none';
        });
        
        console.log('🐌 Low performance mode enabled');
    }

    disableLowPerformanceMode() {
        this.isLowPerformance = false;
        document.body.classList.remove('low-performance');
        
        // Restore particle count
        if (window.particleBackground) {
            window.particleBackground.maxParticles = 50;
        }
        
        // Re-enable animations
        document.querySelectorAll('.game-card').forEach((card, index) => {
            card.style.animation = `float 6s ease-in-out infinite ${index}s`;
        });
        
        console.log('🚀 Normal performance mode restored');
    }

    createPerformanceIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'performanceIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 1000;
            font-family: monospace;
            display: none;
        `;
        document.body.appendChild(indicator);
        
        // Show indicator in development mode
        if (localStorage.getItem('showPerformance') === 'true') {
            indicator.style.display = 'block';
        }
    }

    updatePerformanceIndicator() {
        const indicator = document.getElementById('performanceIndicator');
        if (indicator && indicator.style.display === 'block') {
            const color = this.fps > 45 ? 'green' : this.fps > 30 ? 'orange' : 'red';
            indicator.innerHTML = `FPS: <span style="color: ${color}">${this.fps}</span>`;
        }
    }
}

// ===== ACCESSIBILITY MANAGER =====
class AccessibilityManager {
    constructor() {
        this.highContrast = false;
        this.reducedMotion = false;
        this.init();
    }

    init() {
        this.checkPreferences();
        this.addAccessibilityControls();
        this.setupKeyboardNavigation();
    }

    checkPreferences() {
        // Check system preferences
        this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Apply preferences
        if (this.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }

    addAccessibilityControls() {
        const controls = document.createElement('div');
        controls.className = 'accessibility-controls';
        controls.innerHTML = `
            <button id="toggleContrast" class="accessibility-btn" title="Toggle High Contrast">
                <i class="fas fa-adjust"></i>
            </button>
            <button id="toggleMotion" class="accessibility-btn" title="Toggle Animations">
                <i class="fas fa-play"></i>
            </button>
            <button id="toggleSound" class="accessibility-btn" title="Toggle Sound">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        
        // Add CSS for accessibility controls
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
            }
            
            .accessibility-btn {
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: rgba(0,0,0,0.7);
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .accessibility-btn:hover {
                background: rgba(0,0,0,0.9);
                transform: scale(1.1);
            }
            
            .accessibility-btn:focus {
                outline: 3px solid #4a90e2;
                outline-offset: 2px;
            }
            
            @media (max-width: 768px) {
                .accessibility-controls {
                    bottom: 10px;
                    right: 10px;
                }
                
                .accessibility-btn {
                    width: 40px;
                    height: 40px;
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(controls);
        
        // Add event listeners
        document.getElementById('toggleContrast').addEventListener('click', () => {
            this.toggleHighContrast();
        });
        
        document.getElementById('toggleMotion').addEventListener('click', () => {
            this.toggleReducedMotion();
        });
        
        document.getElementById('toggleSound').addEventListener('click', () => {
            AudioManager.toggleSound();
            this.updateSoundIcon();
        });
    }

    toggleHighContrast() {
        this.highContrast = !this.highContrast;
        document.body.classList.toggle('high-contrast', this.highContrast);
        localStorage.setItem('highContrast', this.highContrast);
    }

    toggleReducedMotion() {
        this.reducedMotion = !this.reducedMotion;
        document.body.classList.toggle('reduced-motion', this.reducedMotion);
        localStorage.setItem('reducedMotion', this.reducedMotion);
        
        const icon = document.querySelector('#toggleMotion i');
        icon.className = this.reducedMotion ? 'fas fa-pause' : 'fas fa-play';
    }

    updateSoundIcon() {
        const icon = document.querySelector('#toggleSound i');
        icon.className = AudioManager.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
            
            // Escape key closes modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Arrow key navigation for game cards
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.navigateGameCards(e.key);
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    navigateGameCards(direction) {
        const cards = Array.from(document.querySelectorAll('.game-card'));
        const focused = document.activeElement;
        const currentIndex = cards.indexOf(focused);
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        switch (direction) {
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
                nextIndex = currentIndex > 1 ? currentIndex - 2 : currentIndex;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < cards.length - 2 ? currentIndex + 2 : currentIndex;
                break;
        }
        
        if (nextIndex !== undefined && cards[nextIndex]) {
            cards[nextIndex].focus();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.tutorial-overlay, .feedback-modal, .stats-modal, .completion-modal').forEach(modal => {
            modal.remove();
        });
    }
}

// ===== INITIALIZE ALL SYSTEMS =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle background
    window.particleBackground = new ParticleBackground();
    
    // Initialize sound effects
    window.soundEffects = new SoundEffects();
    
    // Initialize performance monitor
    window.performanceMonitor = new PerformanceMonitor();
    
    // Initialize accessibility manager
    window.accessibilityManager = new AccessibilityManager();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.particleBackground) {
            window.particleBackground.updateParticleCount();
        }
    });
    
    // Add enhanced hover sounds
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('game-card') || e.target.classList.contains('btn')) {
            window.soundEffects.play('hover');
        }
    });
    
    console.log('🎮 Enhanced Systems Initialized!');
});

// Development tools
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.dev = {
        showPerformance: () => {
            localStorage.setItem('showPerformance', 'true');
            document.getElementById('performanceIndicator').style.display = 'block';
        },
        hidePerformance: () => {
            localStorage.setItem('showPerformance', 'false');
            document.getElementById('performanceIndicator').style.display = 'none';
        },
        lowPerformanceMode: () => {
            window.performanceMonitor.enableLowPerformanceMode();
        },
        normalPerformanceMode: () => {
            window.performanceMonitor.disableLowPerformanceMode();
        }
    };
    
    console.log('🔧 Development tools available: window.dev');
}
