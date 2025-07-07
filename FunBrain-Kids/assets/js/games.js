// ===== BASE GAME CLASS =====
class BaseGame {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentQuestion = 0;
        this.score = 0;
        this.maxScore = 3;
        this.gameData = [];
        this.startTime = Date.now();
        this.isGameActive = false;
    }

    init() {
        this.isGameActive = true;
        this.generateGameData();
        this.render();
        this.startGame();
    }

    generateGameData() {
        // Override in child classes
    }

    render() {
        // Override in child classes
    }

    startGame() {
        // Override in child classes
    }

    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion >= this.gameData.length) {
            this.endGame();
        } else {
            this.render();
        }
    }

    endGame() {
        this.isGameActive = false;
        const endTime = Date.now();
        const timeTaken = (endTime - this.startTime) / 1000;
        
        let stars = 0;
        if (this.score >= this.maxScore) stars = 3;
        else if (this.score >= this.maxScore * 0.7) stars = 2;
        else if (this.score >= this.maxScore * 0.4) stars = 1;
        
        // Speed bonus
        if (timeTaken < 30 && stars > 0) {
            stars = Math.min(3, stars + 1);
        }
        
        this.app.closeGameModal();
        this.app.onGameComplete(this.gameType, stars);
    }

    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `game-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 1000;
            animation: feedbackPop 0.5s ease;
        `;
        
        this.container.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1500);
    }

    addProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-text">Pertanyaan ${this.currentQuestion + 1} dari ${this.gameData.length}</div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${((this.currentQuestion + 1) / this.gameData.length) * 100}%"></div>
            </div>
        `;
        return progressContainer;
    }
}

// ===== LETTER GAME =====
class LetterGame extends BaseGame {
    constructor(container, app) {
        super(container, app);
        this.gameType = 'letters';
        this.maxScore = 5;
        this.init();
    }

    generateGameData() {
        const letters = [
            { letter: 'A', options: ['A', 'B', 'C', 'D'], sound: 'A' },
            { letter: 'B', options: ['A', 'B', 'C', 'D'], sound: 'B' },
            { letter: 'C', options: ['A', 'B', 'C', 'D'], sound: 'C' },
            { letter: 'M', options: ['M', 'N', 'W', 'V'], sound: 'M' },
            { letter: 'S', options: ['S', 'C', 'O', 'Q'], sound: 'S' }
        ];
        
        this.gameData = letters.map(item => ({
            ...item,
            options: this.shuffleArray(item.options)
        }));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    render() {
        const currentData = this.gameData[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-content">
                <div class="game-title">
                    <i class="fas fa-font"></i>
                    Tebak Huruf
                </div>
                <div class="game-score">Skor: ${this.score}/${this.maxScore}</div>
                
                ${this.addProgressBar().outerHTML}
                
                <div class="game-question">
                    Huruf apakah ini?
                </div>
                
                <div class="letter-display" id="letterDisplay">
                    ${currentData.letter}
                </div>
                
                <div class="game-options">
                    ${currentData.options.map(option => `
                        <button class="game-option letter-option" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="speakBtn">
                        <i class="fas fa-volume-up"></i>
                        Dengarkan
                    </button>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const options = this.container.querySelectorAll('.letter-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isGameActive) return;
                
                const selectedAnswer = option.dataset.answer;
                const correctAnswer = this.gameData[this.currentQuestion].letter;
                
                this.handleAnswer(selectedAnswer, correctAnswer, option);
            });
        });
        
        // Speak button
        const speakBtn = this.container.querySelector('#speakBtn');
        speakBtn.addEventListener('click', () => {
            this.speakLetter(this.gameData[this.currentQuestion].letter);
        });
        
        // Auto-speak on load
        setTimeout(() => {
            this.speakLetter(this.gameData[this.currentQuestion].letter);
        }, 1000);
    }

    speakLetter(letter) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(letter);
            utterance.lang = 'id-ID';
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            speechSynthesis.speak(utterance);
        }
    }

    handleAnswer(selected, correct, optionElement) {
        const options = this.container.querySelectorAll('.letter-option');
        options.forEach(opt => opt.disabled = true);
        
        if (selected === correct) {
            optionElement.classList.add('correct');
            this.score++;
            this.showFeedback('Benar! 🎉', 'success');
            AudioManager.playSound('success');
        } else {
            optionElement.classList.add('incorrect');
            options.forEach(opt => {
                if (opt.dataset.answer === correct) {
                    opt.classList.add('correct');
                }
            });
            this.showFeedback('Coba lagi! 😊', 'error');
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    startGame() {
        // Add letter bounce animation
        const letterDisplay = this.container.querySelector('#letterDisplay');
        letterDisplay.style.animation = 'letterBounce 2s ease-in-out infinite';
    }
}

// ===== FRUIT MATCHING GAME =====
class FruitMatchingGame extends BaseGame {
    constructor(container, app) {
        super(container, app);
        this.gameType = 'fruits';
        this.maxScore = 4;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.init();
    }

    generateGameData() {
        const fruits = ['🍎', '🍌', '🍇', '🍊'];
        this.gameData = [...fruits, ...fruits];
        this.gameData = this.shuffleArray(this.gameData);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    render() {
        this.container.innerHTML = `
            <div class="game-content">
                <div class="game-title">
                    <i class="fas fa-apple-alt"></i>
                    Cocokkan Buah
                </div>
                <div class="game-score">Langkah: ${this.moves} | Pasangan: ${this.matchedPairs}/4</div>
                
                <div class="game-question">
                    Temukan pasangan buah yang sama!
                </div>
                
                <div class="fruit-grid">
                    ${this.gameData.map((fruit, index) => `
                        <div class="fruit-card" data-index="${index}" data-fruit="${fruit}">
                            <div class="card-back">?</div>
                            <div class="card-front">${fruit}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="hintBtn">
                        <i class="fas fa-lightbulb"></i>
                        Petunjuk
                    </button>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const cards = this.container.querySelectorAll('.fruit-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                if (!this.isGameActive) return;
                
                const index = parseInt(card.dataset.index);
                this.flipCard(index);
            });
        });
        
        // Hint button
        const hintBtn = this.container.querySelector('#hintBtn');
        hintBtn.addEventListener('click', () => {
            this.showHint();
        });
    }

    flipCard(index) {
        const card = this.container.querySelector(`[data-index="${index}"]`);
        
        if (card.classList.contains('flipped') || 
            card.classList.contains('matched') || 
            this.flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push(index);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateScore();
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.container.querySelector(`[data-index="${index1}"]`);
        const card2 = this.container.querySelector(`[data-index="${index2}"]`);
        
        if (this.gameData[index1] === this.gameData[index2]) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.score++;
            
            this.showFeedback('Cocok! 🎉', 'success');
            AudioManager.playSound('success');
            
            if (this.matchedPairs === 4) {
                setTimeout(() => this.endGame(), 1000);
            }
        } else {
            // No match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.showFeedback('Coba lagi! 😊', 'error');
        }
        
        this.flippedCards = [];
        this.updateScore();
    }

    updateScore() {
        const scoreElement = this.container.querySelector('.game-score');
        scoreElement.textContent = `Langkah: ${this.moves} | Pasangan: ${this.matchedPairs}/4`;
    }

    showHint() {
        const unmatched = this.container.querySelectorAll('.fruit-card:not(.matched)');
        if (unmatched.length > 0) {
            const randomCard = unmatched[Math.floor(Math.random() * unmatched.length)];
            randomCard.classList.add('flipped');
            setTimeout(() => {
                if (!randomCard.classList.contains('matched')) {
                    randomCard.classList.remove('flipped');
                }
            }, 1000);
        }
    }

    startGame() {
        this.showFeedback('Ingat posisi buah-buahan! 🍎', 'info');
        
        // Show all cards briefly at start
        const cards = this.container.querySelectorAll('.fruit-card');
        cards.forEach(card => card.classList.add('flipped'));
        
        setTimeout(() => {
            cards.forEach(card => card.classList.remove('flipped'));
        }, 2000);
    }
}

// ===== NUMBER COUNTING GAME =====
class NumberCountingGame extends BaseGame {
    constructor(container, app) {
        super(container, app);
        this.gameType = 'numbers';
        this.maxScore = 5;
        this.init();
    }

    generateGameData() {
        const numbers = [
            { number: 1, objects: ['⭐'], options: [1, 2, 3, 4] },
            { number: 2, objects: ['🌟', '🌟'], options: [1, 2, 3, 4] },
            { number: 3, objects: ['🍎', '🍎', '🍎'], options: [2, 3, 4, 5] },
            { number: 4, objects: ['🎈', '🎈', '🎈', '🎈'], options: [3, 4, 5, 6] },
            { number: 5, objects: ['🌸', '🌸', '🌸', '🌸', '🌸'], options: [4, 5, 6, 7] }
        ];
        
        this.gameData = numbers.map(item => ({
            ...item,
            options: this.shuffleArray(item.options)
        }));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    render() {
        const currentData = this.gameData[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-content">
                <div class="game-title">
                    <i class="fas fa-calculator"></i>
                    Hitung Angka
                </div>
                <div class="game-score">Skor: ${this.score}/${this.maxScore}</div>
                
                ${this.addProgressBar().outerHTML}
                
                <div class="game-question">
                    Berapa banyak objek di bawah ini?
                </div>
                
                <div class="objects-container">
                    ${currentData.objects.map((obj, index) => `
                        <div class="counting-object" style="animation-delay: ${index * 0.2}s">
                            ${obj}
                        </div>
                    `).join('')}
                </div>
                
                <div class="game-options">
                    ${currentData.options.map(option => `
                        <button class="game-option number-option" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="countBtn">
                        <i class="fas fa-hand-point-right"></i>
                        Hitung Ulang
                    </button>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const options = this.container.querySelectorAll('.number-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isGameActive) return;
                
                const selectedAnswer = parseInt(option.dataset.answer);
                const correctAnswer = this.gameData[this.currentQuestion].number;
                
                this.handleAnswer(selectedAnswer, correctAnswer, option);
            });
        });
        
        // Count button - highlights objects one by one
        const countBtn = this.container.querySelector('#countBtn');
        countBtn.addEventListener('click', () => {
            this.animateCount();
        });
    }

    animateCount() {
        const objects = this.container.querySelectorAll('.counting-object');
        objects.forEach((obj, index) => {
            setTimeout(() => {
                obj.style.transform = 'scale(1.3)';
                obj.style.transition = 'transform 0.3s ease';
                
                // Speak the number
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance((index + 1).toString());
                    utterance.lang = 'id-ID';
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                }
                
                setTimeout(() => {
                    obj.style.transform = 'scale(1)';
                }, 300);
            }, index * 500);
        });
    }

    handleAnswer(selected, correct, optionElement) {
        const options = this.container.querySelectorAll('.number-option');
        options.forEach(opt => opt.disabled = true);
        
        if (selected === correct) {
            optionElement.classList.add('correct');
            this.score++;
            this.showFeedback(`Benar! Ada ${correct} objek! 🎉`, 'success');
            AudioManager.playSound('success');
        } else {
            optionElement.classList.add('incorrect');
            options.forEach(opt => {
                if (parseInt(opt.dataset.answer) === correct) {
                    opt.classList.add('correct');
                }
            });
            this.showFeedback(`Salah! Ada ${correct} objek! 😊`, 'error');
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    startGame() {
        setTimeout(() => {
            this.animateCount();
        }, 1000);
    }
}

// ===== COLOR PUZZLE GAME =====
class ColorPuzzleGame extends BaseGame {
    constructor(container, app) {
        super(container, app);
        this.gameType = 'colors';
        this.maxScore = 5;
        this.init();
    }

    generateGameData() {
        const colorQuestions = [
            { color: 'red', colorName: 'Merah', object: '🍎', options: ['Merah', 'Biru', 'Hijau', 'Kuning'] },
            { color: 'blue', colorName: 'Biru', object: '🌊', options: ['Hijau', 'Biru', 'Merah', 'Ungu'] },
            { color: 'green', colorName: 'Hijau', object: '🌿', options: ['Kuning', 'Hijau', 'Biru', 'Merah'] },
            { color: 'yellow', colorName: 'Kuning', object: '🌞', options: ['Hijau', 'Kuning', 'Orange', 'Merah'] },
            { color: 'purple', colorName: 'Ungu', object: '🍇', options: ['Biru', 'Ungu', 'Merah', 'Pink'] }
        ];
        
        this.gameData = colorQuestions.map(item => ({
            ...item,
            options: this.shuffleArray(item.options)
        }));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    render() {
        const currentData = this.gameData[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-content">
                <div class="game-title">
                    <i class="fas fa-palette"></i>
                    Puzzle Warna
                </div>
                <div class="game-score">Skor: ${this.score}/${this.maxScore}</div>
                
                ${this.addProgressBar().outerHTML}
                
                <div class="color-question">
                    <div class="game-question">
                        Apa warna dari objek ini?
                    </div>
                    <div class="color-object">
                        ${currentData.object}
                    </div>
                </div>
                
                <div class="game-options">
                    ${currentData.options.map(option => `
                        <button class="game-option color-option" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="colorHintBtn">
                        <i class="fas fa-eye"></i>
                        Lihat Contoh
                    </button>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const options = this.container.querySelectorAll('.color-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isGameActive) return;
                
                const selectedAnswer = option.dataset.answer;
                const correctAnswer = this.gameData[this.currentQuestion].colorName;
                
                this.handleAnswer(selectedAnswer, correctAnswer, option);
            });
        });
        
        // Color hint button
        const colorHintBtn = this.container.querySelector('#colorHintBtn');
        colorHintBtn.addEventListener('click', () => {
            this.showColorHint();
        });
    }

    showColorHint() {
        const currentData = this.gameData[this.currentQuestion];
        const hintModal = document.createElement('div');
        hintModal.className = 'color-hint-modal';
        hintModal.innerHTML = `
            <div class="color-hint-content">
                <div class="color-sample color-${currentData.color}"></div>
                <p>Ini adalah warna ${currentData.colorName}</p>
                <button class="close-hint">OK</button>
            </div>
        `;
        
        hintModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const content = hintModal.querySelector('.color-hint-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            max-width: 300px;
        `;
        
        const colorSample = hintModal.querySelector('.color-sample');
        colorSample.style.cssText = `
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 1rem;
            border: 3px solid #333;
        `;
        
        document.body.appendChild(hintModal);
        
        hintModal.querySelector('.close-hint').addEventListener('click', () => {
            hintModal.remove();
        });
    }

    handleAnswer(selected, correct, optionElement) {
        const options = this.container.querySelectorAll('.color-option');
        options.forEach(opt => opt.disabled = true);
        
        if (selected === correct) {
            optionElement.classList.add('correct');
            this.score++;
            this.showFeedback(`Benar! Itu warna ${correct}! 🎉`, 'success');
            AudioManager.playSound('success');
        } else {
            optionElement.classList.add('incorrect');
            options.forEach(opt => {
                if (opt.dataset.answer === correct) {
                    opt.classList.add('correct');
                }
            });
            this.showFeedback(`Salah! Itu warna ${correct}! 😊`, 'error');
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    startGame() {
        // Add pulsing animation to the color object
        const colorObject = this.container.querySelector('.color-object');
        colorObject.style.animation = 'pulse 2s ease-in-out infinite';
    }
}

// ===== TIME LEARNING GAME =====
class TimeGame extends BaseGame {
    constructor(container, app) {
        super(container, app);
        this.gameType = 'time';
        this.maxScore = 5;
        this.init();
    }

    generateGameData() {
        const timeQuestions = [
            { hour: 1, minute: 0, time: '1:00', options: ['1:00', '2:00', '12:00', '11:00'] },
            { hour: 3, minute: 0, time: '3:00', options: ['3:00', '4:00', '2:00', '9:00'] },
            { hour: 6, minute: 30, time: '6:30', options: ['6:30', '6:00', '7:30', '5:30'] },
            { hour: 9, minute: 0, time: '9:00', options: ['9:00', '3:00', '12:00', '6:00'] },
            { hour: 12, minute: 0, time: '12:00', options: ['12:00', '1:00', '11:00', '6:00'] }
        ];
        
        this.gameData = timeQuestions.map(item => ({
            ...item,
            options: this.shuffleArray(item.options)
        }));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    render() {
        const currentData = this.gameData[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-content">
                <div class="game-title">
                    <i class="fas fa-clock"></i>
                    Belajar Jam
                </div>
                <div class="game-score">Skor: ${this.score}/${this.maxScore}</div>
                
                ${this.addProgressBar().outerHTML}
                
                <div class="game-question">
                    Jam berapa yang ditunjukkan?
                </div>
                
                <div class="clock-container">
                    <div class="clock-face">
                        ${this.generateClockNumbers()}
                        <div class="hour-hand" id="hourHand"></div>
                        <div class="minute-hand" id="minuteHand"></div>
                        <div class="clock-center"></div>
                    </div>
                </div>
                
                <div class="time-options">
                    ${currentData.options.map(option => `
                        <button class="time-option" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="game-btn" id="explainBtn">
                        <i class="fas fa-info-circle"></i>
                        Jelaskan
                    </button>
                </div>
            </div>
        `;
        
        this.setupClock(currentData.hour, currentData.minute);
        this.setupEventListeners();
    }

    generateClockNumbers() {
        let numbersHTML = '';
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30) - 90; // 30 degrees per hour, -90 to start from 12
            const x = Math.cos(angle * Math.PI / 180) * 80;
            const y = Math.sin(angle * Math.PI / 180) * 80;
            
            numbersHTML += `
                <div class="clock-number" style="
                    transform: translate(${x}px, ${y}px);
                    left: 50%;
                    top: 50%;
                    margin-left: -15px;
                    margin-top: -15px;
                ">
                    ${i}
                </div>
            `;
        }
        return numbersHTML;
    }

    setupClock(hour, minute) {
        const hourHand = this.container.querySelector('#hourHand');
        const minuteHand = this.container.querySelector('#minuteHand');
        
        // Calculate angles (0 degrees = 12 o'clock)
        const hourAngle = (hour % 12) * 30 + (minute * 0.5) - 90;
        const minuteAngle = minute * 6 - 90;
        
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    }

    setupEventListeners() {
        const options = this.container.querySelectorAll('.time-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (!this.isGameActive) return;
                
                const selectedAnswer = option.dataset.answer;
                const correctAnswer = this.gameData[this.currentQuestion].time;
                
                this.handleAnswer(selectedAnswer, correctAnswer, option);
            });
        });
        
        // Explain button
        const explainBtn = this.container.querySelector('#explainBtn');
        explainBtn.addEventListener('click', () => {
            this.explainTime();
        });
    }

    explainTime() {
        const currentData = this.gameData[this.currentQuestion];
        const explanation = `
            <div class="time-explanation">
                <h3>Penjelasan Jam</h3>
                <p>Jarum pendek menunjuk ke angka <strong>${currentData.hour}</strong> (jam)</p>
                <p>Jarum panjang menunjuk ke angka <strong>${currentData.minute === 0 ? '12' : '6'}</strong> (menit)</p>
                <p>Jadi waktu yang ditunjukkan adalah <strong>${currentData.time}</strong></p>
            </div>
        `;
        
        this.showFeedback(explanation, 'info');
    }

    handleAnswer(selected, correct, optionElement) {
        const options = this.container.querySelectorAll('.time-option');
        options.forEach(opt => opt.disabled = true);
        
        if (selected === correct) {
            optionElement.classList.add('correct');
            this.score++;
            this.showFeedback(`Benar! Jam ${correct}! 🎉`, 'success');
            AudioManager.playSound('success');
        } else {
            optionElement.classList.add('incorrect');
            options.forEach(opt => {
                if (opt.dataset.answer === correct) {
                    opt.classList.add('correct');
                }
            });
            this.showFeedback(`Salah! Jam ${correct}! 😊`, 'error');
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    startGame() {
        // Add ticking animation to clock hands
        const hourHand = this.container.querySelector('#hourHand');
        const minuteHand = this.container.querySelector('#minuteHand');
        
        hourHand.style.transition = 'transform 0.5s ease';
        minuteHand.style.transition = 'transform 0.5s ease';
        
        this.showFeedback('Perhatikan posisi jarum jam! 🕐', 'info');
    }
}

// ===== EXPORT GAMES =====
window.LetterGame = LetterGame;
window.FruitMatchingGame = FruitMatchingGame;
window.NumberCountingGame = NumberCountingGame;
window.ColorPuzzleGame = ColorPuzzleGame;
window.TimeGame = TimeGame;
