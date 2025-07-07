// ===== AUDIO MANAGER =====
class AudioManager {
    static instance = null;
    static sounds = {};
    static musicVolume = 0.5;
    static sfxVolume = 0.7;
    static isMuted = false;
    static currentMusic = null;
    static audioContext = null;
    static isInitialized = false;

    static getInstance() {
        if (!this.instance) {
            this.instance = new AudioManager();
        }
        return this.instance;
    }

    static init() {
        if (this.isInitialized) return;
        
        this.loadSettings();
        this.createAudioContext();
        this.preloadSounds();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    static createAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    static loadSettings() {
        const settings = StorageManager.loadSettings();
        this.isMuted = !settings.soundEnabled;
        this.musicVolume = settings.musicVolume || 0.5;
        this.sfxVolume = settings.sfxVolume || 0.7;
    }

    static saveSettings() {
        const settings = StorageManager.loadSettings();
        settings.soundEnabled = !this.isMuted;
        settings.musicVolume = this.musicVolume;
        settings.sfxVolume = this.sfxVolume;
        StorageManager.saveSettings(settings);
    }

    static preloadSounds() {
        const soundList = [
            { name: 'click', src: 'assets/sounds/click.mp3' },
            { name: 'success', src: 'assets/sounds/success.mp3' },
            { name: 'error', src: 'assets/sounds/error.mp3' },
            { name: 'background', src: 'assets/sounds/background.mp3' },
            { name: 'celebration', src: 'assets/sounds/celebration.mp3' },
            { name: 'whoosh', src: 'assets/sounds/whoosh.mp3' },
            { name: 'pop', src: 'assets/sounds/pop.mp3' },
            { name: 'chime', src: 'assets/sounds/chime.mp3' }
        ];

        soundList.forEach(sound => {
            this.loadSound(sound.name, sound.src);
        });
    }

    static loadSound(name, src) {
        // Create fallback sound using Web Audio API
        const audio = new Audio();
        audio.preload = 'none'; // Changed to 'none' to prevent 404 errors
        audio.volume = 0.7;
        
        // Try to load the audio file
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ Sound loaded: ${name}`);
        });
        
        audio.addEventListener('error', (e) => {
            console.warn(`⚠️ Could not load sound: ${name}. Using fallback sound.`);
            this.createFallbackSound(name);
        });
        
        // Set src and immediately create fallback as well
        audio.src = src;
        this.sounds[name] = audio;
        
        // Also create fallback immediately for better UX
        this.createFallbackSound(name + '_fallback');
    }

    static createFallbackSound(name) {
        if (!this.audioContext) return;
        
        const fallbackSounds = {
            click: () => this.createTone(800, 0.1, 'square'),
            success: () => this.createMelody([523, 659, 784], 0.2),
            error: () => this.createTone(200, 0.3, 'sawtooth'),
            celebration: () => this.createMelody([523, 659, 784, 1047], 0.15),
            whoosh: () => this.createSweep(100, 1000, 0.3),
            pop: () => this.createTone(1000, 0.1, 'sine'),
            chime: () => this.createMelody([523, 659, 784, 1047, 1319], 0.1)
        };
        
        if (fallbackSounds[name]) {
            this.sounds[name] = { play: fallbackSounds[name] };
        }
    }

    static createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    static createMelody(frequencies, noteDuration) {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createTone(freq, noteDuration)();
                }, index * noteDuration * 1000);
            });
        };
    }

    static createSweep(startFreq, endFreq, duration) {
        return () => {
            if (!this.audioContext || this.isMuted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    static playSound(name) {
        if (this.isMuted) return;
        
        let sound = this.sounds[name];
        
        // If original sound not found, try fallback
        if (!sound) {
            sound = this.sounds[name + '_fallback'];
        }
        
        if (!sound) {
            console.warn(`🔇 Sound not found: ${name}, creating instant fallback`);
            this.createFallbackSound(name);
            sound = this.sounds[name];
        }
        
        try {
            if (sound && sound.play && typeof sound.play === 'function') {
                if (sound.currentTime !== undefined) {
                    // HTML Audio element
                    sound.currentTime = 0;
                    sound.volume = this.sfxVolume;
                    const playPromise = sound.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn(`⚠️ Error playing sound ${name}, using fallback:`, error);
                            // Try fallback sound
                            this.createFallbackSound(name);
                            if (this.sounds[name] && this.sounds[name].play) {
                            }
                        });
                    }
                } else {
                    // Fallback function
                    sound.play();
                }
            }
        } catch (error) {
            console.warn(`⚠️ Error playing sound ${name}:`, error);
        }
    }

    static playMusic(name, loop = true) {
        if (this.isMuted) return;
        
        // Stop current music
        this.stopMusic();
        
        const music = this.sounds[name];
        if (!music) {
            console.warn(`Music not found: ${name}`);
            return;
        }
        
        try {
            music.loop = loop;
            music.volume = this.musicVolume;
            const playPromise = music.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.currentMusic = music;
                }).catch(error => {
                    console.warn(`Error playing music ${name}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing music ${name}:`, error);
        }
    }

    static stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    static pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    static resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused && !this.isMuted) {
            const playPromise = this.currentMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Error resuming music:', error);
                });
            }
        }
    }

    static setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        
        this.saveSettings();
    }

    static setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    static toggleSound() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            // Resume background music if available
            if (this.sounds.background) {
                this.playMusic('background');
            }
        }
        
        this.saveSettings();
    }

    static setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMusic();
            } else {
                this.resumeMusic();
            }
        });
        
        // Handle audio context suspend/resume
        document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
        document.addEventListener('keydown', this.resumeAudioContext.bind(this), { once: true });
        document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
    }

    static resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            }).catch(error => {
                console.warn('Error resuming audio context:', error);
            });
        }
    }

    // Game-specific sound methods
    static playGameStart() {
        this.playSound('chime');
    }

    static playGameSuccess() {
        this.playSound('success');
    }

    static playGameError() {
        this.playSound('error');
    }

    static playGameComplete() {
        this.playSound('celebration');
    }

    static playButtonClick() {
        this.playSound('click');
    }

    static playCardFlip() {
        this.playSound('whoosh');
    }

    static playMatch() {
        this.playSound('pop');
    }

    static playLevelUp() {
        this.playSound('chime');
    }

    // Speech synthesis methods
    static speak(text, options = {}) {
        if (this.isMuted) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set default options
            utterance.lang = options.lang || 'id-ID';
            utterance.rate = options.rate || 0.8;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || this.sfxVolume;
            
            // Handle voice selection
            if (options.voice) {
                const voices = speechSynthesis.getVoices();
                const selectedVoice = voices.find(voice => 
                    voice.name.includes(options.voice) || 
                    voice.lang.includes(options.voice)
                );
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }
            
            speechSynthesis.speak(utterance);
        }
    }

    static speakLetter(letter) {
        this.speak(letter, { 
            rate: 0.7, 
            pitch: 1.2,
            voice: 'id-ID' 
        });
    }

    static speakNumber(number) {
        this.speak(number.toString(), { 
            rate: 0.8, 
            pitch: 1.0,
            voice: 'id-ID' 
        });
    }

    static speakWord(word) {
        this.speak(word, { 
            rate: 0.9, 
            pitch: 1.0,
            voice: 'id-ID' 
        });
    }

    static speakInstruction(instruction) {
        this.speak(instruction, { 
            rate: 0.8, 
            pitch: 1.0,
            voice: 'id-ID' 
        });
    }

    // Enhanced audio feedback system
    static playWithVisualFeedback(soundName) {
        // Play the sound
        this.playSound(soundName);
        
        // Show visual sound indicator
        this.showSoundIndicator();
    }

    static showSoundIndicator() {
        // Remove existing indicator
        const existing = document.querySelector('.sound-indicator');
        if (existing) existing.remove();
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'sound-indicator';
        indicator.innerHTML = `
            <div class="sound-wave"></div>
            <div class="sound-wave"></div>
            <div class="sound-wave"></div>
            <div class="sound-wave"></div>
        `;
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 1000);
    }

    // Enhanced game-specific audio methods
    static playCorrectAnswer() {
        this.playWithVisualFeedback('success');
        this.speak('Benar!', { rate: 1.2, pitch: 1.3 });
    }

    static playIncorrectAnswer() {
        this.playWithVisualFeedback('error');
        this.speak('Coba lagi!', { rate: 0.9, pitch: 0.8 });
    }

    static playGameStart(gameType) {
        this.playWithVisualFeedback('chime');
        
        const gameInstructions = {
            'letters': 'Pilih huruf yang tepat untuk melengkapi kata!',
            'fruits': 'Cocokan buah-buah yang sama!',
            'numbers': 'Hitung dan pilih jawaban yang benar!',
            'colors': 'Cocokan warna dengan namanya!',
            'time': 'Baca waktu di jam dan pilih yang benar!'
        };
        
        const instruction = gameInstructions[gameType] || 'Selamat bermain!';
        setTimeout(() => {
            this.speakInstruction(instruction);
        }, 500);
    }

    static playLevelComplete(stars) {
        if (stars === 3) {
            this.playWithVisualFeedback('celebration');
            this.speak('Luar biasa! Tiga bintang!', { rate: 1.1, pitch: 1.4 });
        } else if (stars === 2) {
            this.playWithVisualFeedback('success');
            this.speak('Bagus sekali! Dua bintang!', { rate: 1.0, pitch: 1.2 });
        } else if (stars === 1) {
            this.playWithVisualFeedback('chime');
            this.speak('Bagus! Satu bintang!', { rate: 1.0, pitch: 1.1 });
        }
    }

    // Interactive sound effects
    static playHoverSound() {
        // Create a subtle hover sound using Web Audio API
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // Dynamic music system
    static updateBackgroundMusic(gameType) {
        // Different background music for different games (if available)
        const musicTracks = {
            'menu': 'background',
            'letters': 'background',
            'fruits': 'background',
            'numbers': 'background',
            'colors': 'background',
            'time': 'background'
        };
        
        const track = musicTracks[gameType] || 'background';
        if (this.sounds[track] && !this.isMuted) {
            this.playMusic(track, true);
        }
    }

    // Utility methods
    static fadeIn(audio, duration = 1000) {
        if (!audio) return;
        
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = this.musicVolume / steps;
        let currentStep = 0;
        
        audio.volume = 0;
        
        const fadeInterval = setInterval(() => {
            if (currentStep < steps) {
                audio.volume = Math.min(volumeStep * currentStep, this.musicVolume);
                currentStep++;
            } else {
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }

    static fadeOut(audio, duration = 1000) {
        if (!audio) return;
        
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = audio.volume / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            if (currentStep < steps) {
                audio.volume = Math.max(audio.volume - volumeStep, 0);
                currentStep++;
            } else {
                clearInterval(fadeInterval);
                audio.pause();
            }
        }, stepTime);
    }

    // Debug methods
    static getAudioInfo() {
        return {
            isInitialized: this.isInitialized,
            isMuted: this.isMuted,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            soundsLoaded: Object.keys(this.sounds).length,
            currentMusic: this.currentMusic ? 'playing' : 'none',
            audioContext: this.audioContext ? this.audioContext.state : 'not available'
        };
    }

    // Test methods
    static testAllSounds() {
        console.log('Testing all sounds...');
        Object.keys(this.sounds).forEach((name, index) => {
            setTimeout(() => {
                console.log(`Playing: ${name}`);
                this.playSound(name);
            }, index * 1000);
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AudioManager.init();
    });
} else {
    AudioManager.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}
