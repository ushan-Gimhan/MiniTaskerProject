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

window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(31, 41, 55, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
        header.style.backdropFilter = 'none';
    }
});

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const targets = ['5000', '250000', '15000', '99.5'];
    const symbols = ['', '$', '', ''];

    counters.forEach((counter, index) => {
        const target = parseFloat(targets[index]);
        const symbol = symbols[index];
        let current = 0;
        const increment = target / 100;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (index === 1) {
                counter.textContent = `${symbol}${Math.floor(current).toLocaleString()}`;
            } else if (index === 3) {
                counter.textContent = `${current.toFixed(1)}%`;
            } else {
                counter.textContent = `${Math.floor(current).toLocaleString()}+`;
            }
        }, 20);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
});
observer.observe(document.querySelector('.stats'));

document.querySelectorAll('.hero .cta-buttons a').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Signup.html';
    });
});

const ctaBtn = document.querySelector('.cta-section .btn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Signup.html';
    });
}

const loginBtn = document.querySelector('.auth-buttons .btn-secondary');
const signupBtn = document.querySelector('.auth-buttons .btn-primary');

if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Login.html'; // Login button always goes to login page
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Signup.html';
    });
}

document.querySelectorAll('.footer a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.getElementById(href.substring(1));
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});
