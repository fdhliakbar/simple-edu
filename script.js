// Global Variables
let currentGame = null;
let gameData = {
    math: {
        score: 0,
        currentQuestion: 0,
        questions: []
    },
    memory: {
        score: 0,
        flippedCards: [],
        matchedCards: [],
        moves: 0
    },
    word: {
        score: 0,
        currentWord: 0,
        words: []
    },
    science: {
        score: 0,
        currentQuestion: 0,
        questions: []
    }
};

// DOM Elements
const modal = document.getElementById('gameModal');
const gameContainer = document.getElementById('gameContainer');
const closeBtn = document.getElementsByClassName('close')[0];
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
    generateGameData();
});

// Event Listeners
function initializeEventListeners() {
    // Mobile navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Modal close events
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Contact form
    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', handleContactForm);

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Scroll to Games Section
function scrollToGames() {
    document.getElementById('games').scrollIntoView({
        behavior: 'smooth'
    });
}

// Animation on Scroll
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    });

    document.querySelectorAll('.game-card, .about-content, .contact-content').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// Generate Game Data
function generateGameData() {
    // Math Questions
    gameData.math.questions = [
        {
            question: "Berapa hasil dari 15 + 27?",
            options: ["42", "41", "43", "40"],
            correct: 0
        },
        {
            question: "Berapa hasil dari 8 × 9?",
            options: ["71", "72", "73", "74"],
            correct: 1
        },
        {
            question: "Berapa hasil dari 144 ÷ 12?",
            options: ["11", "12", "13", "14"],
            correct: 1
        },
        {
            question: "Berapa hasil dari 5² + 3²?",
            options: ["32", "33", "34", "35"],
            correct: 2
        },
        {
            question: "Berapa hasil dari 25% dari 80?",
            options: ["15", "20", "25", "30"],
            correct: 1
        }
    ];

    // Science Questions
    gameData.science.questions = [
        {
            question: "Planet terbesar di tata surya kita adalah?",
            options: ["Mars", "Jupiter", "Saturn", "Neptune"],
            correct: 1
        },
        {
            question: "Rumus kimia untuk air adalah?",
            options: ["H2O", "CO2", "O2", "H2SO4"],
            correct: 0
        },
        {
            question: "Berapa kecepatan cahaya di ruang hampa?",
            options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
            correct: 0
        },
        {
            question: "Organ yang memompa darah dalam tubuh manusia adalah?",
            options: ["Paru-paru", "Hati", "Jantung", "Ginjal"],
            correct: 2
        },
        {
            question: "Gas yang paling banyak di atmosfer bumi adalah?",
            options: ["Oksigen", "Nitrogen", "Karbon dioksida", "Argon"],
            correct: 1
        }
    ];

    // Word Game Data
    gameData.word.words = [
        {
            word: "PENDIDIKAN",
            hint: "Proses pembelajaran dan pengajaran",
            scrambled: "KANDIPENID"
        },
        {
            word: "TEKNOLOGI",
            hint: "Ilmu pengetahuan terapan",
            scrambled: "GITEKNOLO"
        },
        {
            word: "KREATIVITAS",
            hint: "Kemampuan menciptakan sesuatu yang baru",
            scrambled: "VITITASKREA"
        },
        {
            word: "INOVASI",
            hint: "Pembaruan atau penemuan baru",
            scrambled: "VINASIO"
        },
        {
            word: "KOLABORASI",
            hint: "Kerja sama tim",
            scrambled: "BORALIKOLA"
        }
    ];
}

// Open Game Modal
function openGame(gameType) {
    currentGame = gameType;
    modal.style.display = 'block';
    
    switch(gameType) {
        case 'math':
            startMathGame();
            break;
        case 'memory':
            startMemoryGame();
            break;
        case 'word':
            startWordGame();
            break;
        case 'science':
            startScienceGame();
            break;
    }
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
    currentGame = null;
    gameContainer.innerHTML = '';
}

// Math Game
function startMathGame() {
    gameData.math.score = 0;
    gameData.math.currentQuestion = 0;
    showMathQuestion();
}

function showMathQuestion() {
    const data = gameData.math;
    const question = data.questions[data.currentQuestion];
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-calculator"></i>
                Matematika Quiz
            </div>
            <div class="game-score">Skor: ${data.score} | Pertanyaan: ${data.currentQuestion + 1}/${data.questions.length}</div>
            
            <div class="question-container">
                <div class="question">${question.question}</div>
                <div class="options">
                    ${question.options.map((option, index) => 
                        `<button class="option-btn" onclick="selectMathAnswer(${index})">${option}</button>`
                    ).join('')}
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

function selectMathAnswer(selectedIndex) {
    const data = gameData.math;
    const question = data.questions[data.currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    
    // Disable all options
    options.forEach(btn => btn.disabled = true);
    
    // Show correct/incorrect
    options[selectedIndex].classList.add(selectedIndex === question.correct ? 'correct' : 'incorrect');
    options[question.correct].classList.add('correct');
    
    // Update score
    if (selectedIndex === question.correct) {
        data.score += 10;
    }
    
    setTimeout(() => {
        data.currentQuestion++;
        if (data.currentQuestion < data.questions.length) {
            showMathQuestion();
        } else {
            showMathResults();
        }
    }, 1500);
}

function showMathResults() {
    const data = gameData.math;
    const percentage = (data.score / (data.questions.length * 10)) * 100;
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-trophy"></i>
                Hasil Quiz Matematika
            </div>
            
            <div class="question-container">
                <h3>Selamat! Anda telah menyelesaikan quiz</h3>
                <div class="game-score">Skor Akhir: ${data.score}</div>
                <div class="game-score">Persentase: ${percentage.toFixed(1)}%</div>
                <div class="game-score">
                    ${percentage >= 80 ? 'Luar Biasa! 🌟' : 
                      percentage >= 60 ? 'Bagus! 👍' : 
                      percentage >= 40 ? 'Cukup Baik! 😊' : 'Perlu Latihan Lagi! 💪'}
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn primary" onclick="startMathGame()">Main Lagi</button>
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

// Memory Game
function startMemoryGame() {
    gameData.memory.score = 0;
    gameData.memory.flippedCards = [];
    gameData.memory.matchedCards = [];
    gameData.memory.moves = 0;
    
    const icons = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];
    const cards = [...icons, ...icons].sort(() => Math.random() - 0.5);
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-brain"></i>
                Memory Game
            </div>
            <div class="game-score">Langkah: ${gameData.memory.moves} | Pasangan: ${gameData.memory.matchedCards.length / 2}/8</div>
            
            <div class="memory-grid">
                ${cards.map((card, index) => 
                    `<div class="memory-card" data-card="${card}" data-index="${index}" onclick="flipCard(${index})">
                        <span class="card-content" style="display: none;">${card}</span>
                        <span class="card-back">?</span>
                    </div>`
                ).join('')}
            </div>
            
            <div class="game-controls">
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

function flipCard(index) {
    const card = document.querySelector(`[data-index="${index}"]`);
    const data = gameData.memory;
    
    if (data.flippedCards.length >= 2 || 
        data.flippedCards.includes(index) || 
        data.matchedCards.includes(index)) {
        return;
    }
    
    card.classList.add('flipped');
    card.querySelector('.card-content').style.display = 'block';
    card.querySelector('.card-back').style.display = 'none';
    
    data.flippedCards.push(index);
    
    if (data.flippedCards.length === 2) {
        data.moves++;
        setTimeout(checkMemoryMatch, 1000);
    }
}

function checkMemoryMatch() {
    const data = gameData.memory;
    const [first, second] = data.flippedCards;
    const firstCard = document.querySelector(`[data-index="${first}"]`);
    const secondCard = document.querySelector(`[data-index="${second}"]`);
    
    if (firstCard.dataset.card === secondCard.dataset.card) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        data.matchedCards.push(first, second);
        data.score += 10;
        
        if (data.matchedCards.length === 16) {
            setTimeout(showMemoryResults, 500);
        }
    } else {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.querySelector('.card-content').style.display = 'none';
        secondCard.querySelector('.card-content').style.display = 'none';
        firstCard.querySelector('.card-back').style.display = 'block';
        secondCard.querySelector('.card-back').style.display = 'block';
    }
    
    data.flippedCards = [];
    updateMemoryScore();
}

function updateMemoryScore() {
    const data = gameData.memory;
    const scoreElement = document.querySelector('.game-score');
    scoreElement.textContent = `Langkah: ${data.moves} | Pasangan: ${data.matchedCards.length / 2}/8`;
}

function showMemoryResults() {
    const data = gameData.memory;
    const rating = data.moves <= 10 ? 'Sempurna! 🌟' : 
                   data.moves <= 15 ? 'Bagus Sekali! 👍' : 
                   data.moves <= 20 ? 'Cukup Baik! 😊' : 'Perlu Latihan! 💪';
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-trophy"></i>
                Hasil Memory Game
            </div>
            
            <div class="question-container">
                <h3>Selamat! Semua pasangan telah ditemukan</h3>
                <div class="game-score">Skor: ${data.score}</div>
                <div class="game-score">Total Langkah: ${data.moves}</div>
                <div class="game-score">${rating}</div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn primary" onclick="startMemoryGame()">Main Lagi</button>
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

// Word Game
function startWordGame() {
    gameData.word.score = 0;
    gameData.word.currentWord = 0;
    showWordChallenge();
}

function showWordChallenge() {
    const data = gameData.word;
    const word = data.words[data.currentWord];
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-spell-check"></i>
                Word Challenge
            </div>
            <div class="game-score">Skor: ${data.score} | Kata: ${data.currentWord + 1}/${data.words.length}</div>
            
            <div class="question-container">
                <div class="word-hint">${word.hint}</div>
                <div class="word-display">${word.scrambled}</div>
                <input type="text" class="word-input" id="wordInput" placeholder="Susun kata yang benar" maxlength="${word.word.length}">
            </div>
            
            <div class="game-controls">
                <button class="game-btn primary" onclick="checkWordAnswer()">Periksa</button>
                <button class="game-btn secondary" onclick="skipWord()">Lewati</button>
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
    
    document.getElementById('wordInput').focus();
    document.getElementById('wordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkWordAnswer();
        }
    });
}

function checkWordAnswer() {
    const data = gameData.word;
    const word = data.words[data.currentWord];
    const input = document.getElementById('wordInput');
    const userAnswer = input.value.toUpperCase().trim();
    
    if (userAnswer === word.word) {
        data.score += 15;
        showWordFeedback('Benar! 🎉', 'correct');
    } else {
        showWordFeedback(`Salah! Jawaban yang benar: ${word.word}`, 'incorrect');
    }
    
    setTimeout(() => {
        data.currentWord++;
        if (data.currentWord < data.words.length) {
            showWordChallenge();
        } else {
            showWordResults();
        }
    }, 2000);
}

function skipWord() {
    const data = gameData.word;
    const word = data.words[data.currentWord];
    showWordFeedback(`Jawaban yang benar: ${word.word}`, 'skipped');
    
    setTimeout(() => {
        data.currentWord++;
        if (data.currentWord < data.words.length) {
            showWordChallenge();
        } else {
            showWordResults();
        }
    }, 2000);
}

function showWordFeedback(message, type) {
    const container = document.querySelector('.question-container');
    container.innerHTML = `
        <div class="word-feedback ${type}">
            <h3>${message}</h3>
        </div>
    `;
}

function showWordResults() {
    const data = gameData.word;
    const percentage = (data.score / (data.words.length * 15)) * 100;
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-trophy"></i>
                Hasil Word Challenge
            </div>
            
            <div class="question-container">
                <h3>Selamat! Anda telah menyelesaikan tantangan</h3>
                <div class="game-score">Skor Akhir: ${data.score}</div>
                <div class="game-score">Persentase: ${percentage.toFixed(1)}%</div>
                <div class="game-score">
                    ${percentage >= 80 ? 'Luar Biasa! 🌟' : 
                      percentage >= 60 ? 'Bagus! 👍' : 
                      percentage >= 40 ? 'Cukup Baik! 😊' : 'Perlu Latihan Lagi! 💪'}
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn primary" onclick="startWordGame()">Main Lagi</button>
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

// Science Game
function startScienceGame() {
    gameData.science.score = 0;
    gameData.science.currentQuestion = 0;
    showScienceQuestion();
}

function showScienceQuestion() {
    const data = gameData.science;
    const question = data.questions[data.currentQuestion];
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-flask"></i>
                Science Quiz
            </div>
            <div class="game-score">Skor: ${data.score} | Pertanyaan: ${data.currentQuestion + 1}/${data.questions.length}</div>
            
            <div class="question-container">
                <div class="question">${question.question}</div>
                <div class="options">
                    ${question.options.map((option, index) => 
                        `<button class="option-btn" onclick="selectScienceAnswer(${index})">${option}</button>`
                    ).join('')}
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

function selectScienceAnswer(selectedIndex) {
    const data = gameData.science;
    const question = data.questions[data.currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    
    // Disable all options
    options.forEach(btn => btn.disabled = true);
    
    // Show correct/incorrect
    options[selectedIndex].classList.add(selectedIndex === question.correct ? 'correct' : 'incorrect');
    options[question.correct].classList.add('correct');
    
    // Update score
    if (selectedIndex === question.correct) {
        data.score += 10;
    }
    
    setTimeout(() => {
        data.currentQuestion++;
        if (data.currentQuestion < data.questions.length) {
            showScienceQuestion();
        } else {
            showScienceResults();
        }
    }, 1500);
}

function showScienceResults() {
    const data = gameData.science;
    const percentage = (data.score / (data.questions.length * 10)) * 100;
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-title">
                <i class="fas fa-trophy"></i>
                Hasil Science Quiz
            </div>
            
            <div class="question-container">
                <h3>Selamat! Anda telah menyelesaikan quiz</h3>
                <div class="game-score">Skor Akhir: ${data.score}</div>
                <div class="game-score">Persentase: ${percentage.toFixed(1)}%</div>
                <div class="game-score">
                    ${percentage >= 80 ? 'Luar Biasa! 🌟' : 
                      percentage >= 60 ? 'Bagus! 👍' : 
                      percentage >= 40 ? 'Cukup Baik! 😊' : 'Perlu Latihan Lagi! 💪'}
                </div>
            </div>
            
            <div class="game-controls">
                <button class="game-btn primary" onclick="startScienceGame()">Main Lagi</button>
                <button class="game-btn secondary" onclick="closeModal()">Keluar</button>
            </div>
        </div>
    `;
}

// Contact Form Handler
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Mengirim...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert(`Terima kasih ${name}! Pesan Anda telah terkirim. Kami akan menghubungi Anda segera.`);
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Window resize handler
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
}, 250));

// Add loading states
function showLoading(element) {
    element.innerHTML = '<span class="loading"></span> Loading...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .word-feedback {
        padding: 2rem;
        border-radius: 15px;
        font-size: 1.2rem;
        text-align: center;
    }
    
    .word-feedback.correct {
        background: #10b981;
        color: white;
    }
    
    .word-feedback.incorrect {
        background: #ef4444;
        color: white;
    }
    
    .word-feedback.skipped {
        background: #f59e0b;
        color: white;
    }
`;
document.head.appendChild(style);
