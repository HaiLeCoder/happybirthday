// ===== Configuration =====
const CONFIG = {
    balloonCount: 15,
    confettiCount: 100,
    fireworksCount: 3,
    colors: [
        '#ff6b9d', '#c06c84', '#ffd93d', '#6bcf7f',
        '#4ea8de', '#667eea', '#764ba2', '#f093fb',
        '#f5576c', '#4facfe', '#00f2fe'
    ]
};

// ===== State Management =====
let isMusicPlaying = false;
let isGiftOpened = false;
let isCelebrating = false;

// ===== DOM Elements =====
const balloonsContainer = document.getElementById('balloonsContainer');
const confettiContainer = document.getElementById('confettiContainer');
const fireworksCanvas = document.getElementById('fireworksCanvas');
const celebrateBtn = document.getElementById('celebrateBtn');
const musicBtn = document.getElementById('musicBtn');
const giftBox = document.getElementById('giftBox');
const birthdayMusic = document.getElementById('birthdayMusic');

// ===== Canvas Setup =====
const ctx = fireworksCanvas.getContext('2d');
fireworksCanvas.width = window.innerWidth;
fireworksCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
});

// ===== Balloon Creation =====
function createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    const randomColor = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    balloon.style.background = `linear-gradient(135deg, ${randomColor}, ${adjustColor(randomColor, -30)})`;
    balloon.style.left = Math.random() * 100 + '%';
    balloon.style.animationDuration = (Math.random() * 3 + 5) + 's';
    balloon.style.animationDelay = Math.random() * 2 + 's';

    balloonsContainer.appendChild(balloon);

    setTimeout(() => {
        balloon.remove();
    }, 10000);
}

function adjustColor(color, amount) {
    const clamp = (num) => Math.min(Math.max(num, 0), 255);
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function startBalloons() {
    for (let i = 0; i < CONFIG.balloonCount; i++) {
        setTimeout(() => createBalloon(), i * 300);
    }

    setInterval(() => {
        if (isCelebrating) {
            createBalloon();
        }
    }, 1000);
}

// ===== Confetti Creation =====
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const shapes = ['circle', 'square', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const randomColor = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    confetti.style.background = randomColor;
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = Math.random() + 's';

    if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
    } else if (shape === 'triangle') {
        confetti.style.width = '0';
        confetti.style.height = '0';
        confetti.style.background = 'transparent';
        confetti.style.borderLeft = '5px solid transparent';
        confetti.style.borderRight = '5px solid transparent';
        confetti.style.borderBottom = `10px solid ${randomColor}`;
    }

    confettiContainer.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 5000);
}

function startConfetti() {
    for (let i = 0; i < CONFIG.confettiCount; i++) {
        setTimeout(() => createConfetti(), i * 30);
    }
}

// ===== Fireworks =====
class Firework {
    constructor() {
        this.x = Math.random() * fireworksCanvas.width;
        this.y = fireworksCanvas.height;
        this.targetY = Math.random() * fireworksCanvas.height * 0.5;
        this.speed = 5;
        this.particles = [];
        this.exploded = false;
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach((particle, index) => {
                particle.update();
                if (particle.alpha <= 0) {
                    this.particles.splice(index, 1);
                }
            });
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else {
            this.particles.forEach(particle => particle.draw());
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    isDone() {
        return this.exploded && this.particles.length === 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 3 + 1;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.velocity.y += 0.1;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

let fireworks = [];

function animateFireworks() {
    ctx.fillStyle = 'rgba(15, 12, 41, 0.1)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    if (isCelebrating && Math.random() < 0.05) {
        fireworks.push(new Firework());
    }

    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.isDone()) {
            fireworks.splice(index, 1);
        }
    });

    requestAnimationFrame(animateFireworks);
}

// ===== Event Handlers =====
celebrateBtn.addEventListener('click', () => {
    isCelebrating = !isCelebrating;

    if (isCelebrating) {
        celebrateBtn.querySelector('.btn-text').textContent = '🎊 Đang Tiệc Tùng...';
        startBalloons();
        startConfetti();

        // Create continuous confetti
        const confettiInterval = setInterval(() => {
            if (isCelebrating) {
                for (let i = 0; i < 10; i++) {
                    createConfetti();
                }
            } else {
                clearInterval(confettiInterval);
            }
        }, 500);
    } else {
        celebrateBtn.querySelector('.btn-text').textContent = '🎊 Bắt Đầu Tiệc';
    }
});

musicBtn.addEventListener('click', () => {
    isMusicPlaying = !isMusicPlaying;

    if (isMusicPlaying) {
        birthdayMusic.play();
        musicBtn.querySelector('.btn-text').textContent = '🔇 Tắt Nhạc';
        musicBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    } else {
        birthdayMusic.pause();
        musicBtn.querySelector('.btn-text').textContent = '🎵 Nhạc Sinh Nhật';
        musicBtn.style.background = 'var(--secondary-gradient)';
    }
});

giftBox.addEventListener('click', () => {
    if (!isGiftOpened) {
        giftBox.classList.add('open');
        isGiftOpened = true;

        // Create surprise effect
        setTimeout(() => {
            startConfetti();
            createSurpriseMessage();
        }, 500);

        // Reset after animation
        setTimeout(() => {
            giftBox.classList.remove('open');
            isGiftOpened = false;
        }, 3000);
    }
});

function createSurpriseMessage() {
    const messages = [
        '🎉 Chúc mừng sinh nhật!',
        '💖 Bạn thật đặc biệt!',
        '🌟 Tuổi mới nhiều niềm vui!',
        '🎂 Hạnh phúc mãi mãi!',
        '✨ Ước mơ thành hiện thực!'
    ];

    const message = document.createElement('div');
    message.textContent = messages[Math.floor(Math.random() * messages.length)];
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: 3rem;
        font-weight: bold;
        color: white;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        z-index: 1000;
        animation: popIn 2s ease-out forwards;
        pointer-events: none;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Add pop-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== Wish Cards Interaction =====
const wishCards = document.querySelectorAll('.wish-card');
wishCards.forEach(card => {
    card.addEventListener('click', () => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = '';
        }, 10);

        // Create sparkle effect
        for (let i = 0; i < 5; i++) {
            createSparkle(card);
        }
    });
});

function createSparkle(element) {
    const sparkle = document.createElement('div');
    const rect = element.getBoundingClientRect();

    sparkle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        animation: sparkleOut 1s ease-out forwards;
    `;

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Add sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleOut {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);

// ===== Gallery Lightbox =====
const galleryItems = document.querySelectorAll('.gallery-item');
let lightbox = null;

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        openLightbox(item.querySelector('.gallery-img').src, index);
    });
});

function openLightbox(imageSrc, index) {
    // Create lightbox if it doesn't exist
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const lightboxImg = document.createElement('img');
        lightboxImg.id = 'lightbox-img';
        lightboxImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 2rem;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.transform = 'scale(1.1)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1)';
        });

        closeBtn.addEventListener('click', closeLightbox);

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '‹';
        prevBtn.style.cssText = `
            position: absolute;
            left: 2rem;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 3rem;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '›';
        nextBtn.style.cssText = `
            position: absolute;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 3rem;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(-1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(1);
        });

        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(prevBtn);
        lightbox.appendChild(nextBtn);
        document.body.appendChild(lightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
            if (e.key === 'ArrowLeft' && lightbox.style.display === 'flex') {
                navigateLightbox(-1);
            }
            if (e.key === 'ArrowRight' && lightbox.style.display === 'flex') {
                navigateLightbox(1);
            }
        });
    }

    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imageSrc;
    lightboxImg.dataset.currentIndex = index;

    lightbox.style.display = 'flex';
    setTimeout(() => {
        lightbox.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
    }, 10);
}

function closeLightbox() {
    const lightboxImg = document.getElementById('lightbox-img');
    lightbox.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.8)';

    setTimeout(() => {
        lightbox.style.display = 'none';
    }, 300);
}

function navigateLightbox(direction) {
    const lightboxImg = document.getElementById('lightbox-img');
    let currentIndex = parseInt(lightboxImg.dataset.currentIndex);
    const totalImages = galleryItems.length;

    currentIndex = (currentIndex + direction + totalImages) % totalImages;

    const newImageSrc = galleryItems[currentIndex].querySelector('.gallery-img').src;

    lightboxImg.style.transform = 'scale(0.8)';
    lightboxImg.style.opacity = '0';

    setTimeout(() => {
        lightboxImg.src = newImageSrc;
        lightboxImg.dataset.currentIndex = currentIndex;
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.style.opacity = '1';
    }, 200);
}


// ===== Initialize =====
window.addEventListener('load', () => {
    animateFireworks();

    // Auto-start celebration after 1 second
    setTimeout(() => {
        isCelebrating = true;
        startBalloons();

        // Initial confetti burst
        for (let i = 0; i < 50; i++) {
            setTimeout(() => createConfetti(), i * 50);
        }
    }, 1000);
});

// ===== Easter Egg: Click on cake to blow candle =====
const cake = document.querySelector('.cake');
let candleBlown = false;

cake.addEventListener('click', () => {
    if (!candleBlown) {
        const flame = document.querySelector('.flame');
        flame.style.animation = 'none';
        flame.style.opacity = '0';
        candleBlown = true;

        // Trigger confetti
        startConfetti();

        // Relight the candle after 3 seconds
        setTimeout(() => {
            flame.style.animation = 'flicker 0.3s ease-in-out infinite alternate';
            flame.style.opacity = '1';
            candleBlown = false;
        }, 3000);
    }
});

console.log('🎉 Birthday Celebration Page Loaded! 🎂');
console.log('💡 Tip: Click on the cake to blow the candle!');

