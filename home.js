/* ============================================================
   STACKLY HOME — JavaScript
   Features: Splash · Frosted Navbar · Particle Canvas
             Hero Slide Switcher · Orbit Nodes · Scroll Parallax
             Scroll Reveals · Counters · Tilt · Toast · Typewriter
   ============================================================ */

// ── SPLASH SCREEN ──────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const s = document.getElementById('splash-screen');
    if (s) s.classList.add('hidden');
  }, 1800);
});

// ── FROSTED NAVBAR (FMCG style — transparent → frosted) ────
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('frosted', y > 60);
  lastScroll = y;
}, { passive: true });

// ── HAMBURGER MENU ──────────────────────────────────────────
const burger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

// ── HERO PARTICLE CANVAS ────────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function mkParticle() {
    const colors = ['0,212,255', '124,58,237', '168,85,247'];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.45 + 0.08,
      c: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  function init() {
    particles = [];
    const n = Math.min(Math.floor((canvas.width * canvas.height) / 7500), 110);
    for (let i = 0; i < n; i++) particles.push(mkParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.055 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
    animId = requestAnimationFrame(draw);
  }

  resize(); init(); draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize(); init(); draw();
  });
})();

// ── HERO SLIDE SWITCHER (FMCG pill-switcher style) ──────────
(function initSwitcher() {
  const slides = document.querySelectorAll('.hero-slide');
  const btns = document.querySelectorAll('.switcher-btn');
  if (!slides.length || !btns.length) return;

  let current = 0, timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    btns[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    btns[current].classList.add('active');
  }

  function autoNext() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  goTo(0);
  autoNext();

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      autoNext();
    });
  });
})();

// ── TYPEWRITER ───────────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words = JSON.parse(el.dataset.words || '[]');
  if (!words.length) return;
  let wi = 0, ci = 0, del = false;

  function type() {
    const word = words[wi];
    if (!del) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { del = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, del ? 55 : 95);
  }
  setTimeout(type, 900);
})();

// ── ORBIT NODES — position 6 nodes around the center ────────
(function initOrbit() {
  const stage = document.querySelector('.orbit-stage');
  if (!stage) return;
  const nodes = stage.querySelectorAll('.orbit-node');
  const count = nodes.length;
  const radius = stage.offsetWidth * 0.4;
  const cx = stage.offsetWidth / 2;
  const cy = stage.offsetHeight / 2;

  nodes.forEach((node, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius - node.offsetWidth / 2;
    const y = cy + Math.sin(angle) * radius - node.offsetHeight / 2;
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.margin = '0';
  });

  // Animate the whole ring slowly spinning
  let angle = 0;
  function spin() {
    angle += 0.003;
    nodes.forEach((node, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2 + angle;
      const x = cx + Math.cos(a) * radius - node.offsetWidth / 2;
      const y = cy + Math.sin(a) * radius - node.offsetHeight / 2;
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      // Counter-rotate so labels stay upright
      node.style.transform = `rotate(${-angle}rad)`;
    });
    requestAnimationFrame(spin);
  }
  spin();
})();

// ── SCROLL PARALLAX — hero background image ──────────────────
window.addEventListener('scroll', () => {
  const slides = document.querySelectorAll('.hero-slide.active');
  const hero = document.getElementById('hero');
  if (!hero) return;
  const heroH = hero.offsetHeight;
  const progress = Math.min(window.scrollY / heroH, 1);
  slides.forEach(sl => {
    sl.style.transform = `scale(${1.08 + progress * 0.06}) translateY(${progress * 40}px)`;
    sl.style.opacity = 1 - progress * 0.6;
  });
  // Fade floating elements on scroll
  const floats = document.querySelectorAll('.hero-float-el');
  floats.forEach(f => { f.style.opacity = (0.25 * (1 - progress * 2)).toString(); });
}, { passive: true });

// ── COUNTER ANIMATION ────────────────────────────────────────
function animCount(el) {
  if (el._counted) return;
  el._counted = true;
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const isFloat = el.dataset.float === '1';
  const dur = 2000;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = eased * target;
    el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── INTERSECTION OBSERVER — reveals + counters ───────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(animCount);
      if (e.target.dataset.count) animCount(e.target);
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.hs, .stat-c, [data-count]').forEach(el => countObs.observe(el));

// ── 3D TILT CARDS ────────────────────────────────────────────
document.querySelectorAll('.fcard, .stat-c, .hiw-c').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-5px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── NEWSLETTER FORM ──────────────────────────────────────────
const nlForm = document.getElementById('nl-form');
if (nlForm) {
  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('🔒 Subscribed! Check your inbox for confirmation.');
    nlForm.reset();
  });
}

function showToast(msg) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── HERO STATS — place them below hero section ───────────────
// (Hero stats row is inside the section, positioned at bottom)
