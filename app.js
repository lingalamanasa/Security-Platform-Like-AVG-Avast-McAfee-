/* ===============================
   STACKLY — Global Application JS
   =============================== */

'use strict';

/* ── AUTH NAMESPACE ── */
const SS = {
  KEY_USER: 'stackly_user',
  KEY_USERS: 'stackly_users',

  getUser() {
    try { return JSON.parse(localStorage.getItem(this.KEY_USER)); } catch { return null; }
  },

  getUsers() {
    try { return JSON.parse(localStorage.getItem(this.KEY_USERS)) || []; } catch { return []; }
  },

  saveUsers(users) {
    localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(this.KEY_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register(name, email, password, role) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { error: 'Email already registered.' };
    const user = { id: Date.now(), name, email, password, role };
    users.push(user);
    this.saveUsers(users);
    localStorage.setItem(this.KEY_USER, JSON.stringify(user));
    return { user };
  },

  logout() {
    localStorage.removeItem(this.KEY_USER);
    window.location.href = 'login.html';
  },

  requireAuth(requiredRole) {
    let user = this.getUser();
    // If no session exists, create a demo session so dashboard works when opened directly
    if (!user) {
      const demoRole = (requiredRole === 'admin') ? 'admin' : 'user';
      user = { id: 0, name: 'Demo User', email: 'demo@stackly.com', role: demoRole };
      localStorage.setItem(this.KEY_USER, JSON.stringify(user));
    }
    if (requiredRole === 'admin' && user.role !== 'admin') {
      // Upgrade demo user to admin so they can view the admin dashboard
      user.role = 'admin';
      localStorage.setItem(this.KEY_USER, JSON.stringify(user));
    }
    return user;
  }
};

/* ── TOAST ── */
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; setTimeout(() => toast.remove(), 400); }, 4000);
}

/* ── HAMBURGER / MOBILE MENU ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── REVEAL ON SCROLL ── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = (current >= 1000 ? (current >= 1000000 ? (current / 1000000).toFixed(1) + 'M' : Math.floor(current / 1000) + 'K') : Math.floor(current)) + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

const counterEls = document.querySelectorAll('[data-count]');
if (counterEls.length) {
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counterEls.forEach(el => cObs.observe(el));
}

/* ── HERO PARTICLE CANVAS ── */
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let particles = [];
  let W, H;

  function resizeCanvas() {
    W = heroCanvas.width = heroCanvas.offsetWidth;
    H = heroCanvas.height = heroCanvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '124,58,237' : '245,158,11';
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

/* ── TYPEWRITER EFFECT ── */
const typeEl = document.getElementById('typewriter');
if (typeEl) {
  const words = typeEl.dataset.words ? JSON.parse(typeEl.dataset.words) : ['Threats', 'Malware', 'Hackers', 'Data Breaches', 'Ransomware'];
  let wIdx = 0, cIdx = 0, deleting = false;

  function typewriter() {
    const word = words[wIdx];
    if (!deleting) {
      typeEl.textContent = word.substring(0, ++cIdx);
      if (cIdx === word.length) { deleting = true; setTimeout(typewriter, 1600); return; }
    } else {
      typeEl.textContent = word.substring(0, --cIdx);
      if (cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; }
    }
    setTimeout(typewriter, deleting ? 60 : 100);
  }
  setTimeout(typewriter, 500);
}

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── TILT EFFECT on feature cards ── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── NAVBAR ACTIVE STATE ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── LOGIN FORM ── */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const user = SS.login(email, pass);
    if (user) {
      const toastEl = document.getElementById('toast-container');
      if (toastEl) showToast(`Welcome back, ${user.name}! 👋`, 'success');
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
      }, 1000);
    } else {
      showToast('Invalid email or password. Try demo@stackly.com / password123', 'error');
    }
  });
}

/* ── REGISTER FORM ── */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const role = document.getElementById('selected-role').value;
    const result = SS.register(name, email, pass, role);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(`Account created! Welcome, ${name}! 🎉`, 'success');
      setTimeout(() => {
        window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
      }, 1200);
    }
  });
}

/* ── PASSWORD TOGGLE ── */
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (input && input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
    else if (input) { input.type = 'password'; btn.textContent = '👁'; }
  });
});

/* ── NEWSLETTER FORM ── */
document.querySelectorAll('.nl-form, #newsletter-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('You\'re subscribed! Check your inbox for confirmation. 📬', 'success');
    form.reset();
  });
});

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! Our team will respond within 1 hour. 💌', 'success');
    contactForm.reset();
  });
}

/* ── DEMO ACCOUNT SEEDING (first visit) ── */
(function seedDemoAccounts() {
  const existing = SS.getUsers();
  const hasAdmin = existing.find(u => u.email === 'admin@stackly.com');
  const hasUser = existing.find(u => u.email === 'demo@stackly.com');
  if (!hasAdmin || !hasUser) {
    const users = [...existing];
    if (!hasAdmin) users.push({ id: 1, name: 'Arjun Kapoor', email: 'admin@stackly.com', password: 'password123', role: 'admin' });
    if (!hasUser) users.push({ id: 2, name: 'Priya Sharma', email: 'demo@stackly.com', password: 'password123', role: 'user' });
    SS.saveUsers(users);
  }
})();

/* ── THREAT TICKER INIT ── */
if (document.querySelector('.threat-ticker')) {
  document.body.classList.add('has-ticker');
}
