/* =============================================
   Birthday Website – script.js
   ============================================= */

// ── Night Sky Canvas ─────────────────────────
(function initSky() {
  const canvas = document.getElementById('skyCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let gradOffset = 0;
  const skyColors = [
    { pos: 0.00, r:  5, g:  3, b: 20 },
    { pos: 0.30, r: 18, g:  6, b: 45 },
    { pos: 0.55, r: 35, g:  8, b: 65 },
    { pos: 0.75, r: 55, g: 10, b: 80 },
    { pos: 0.90, r: 70, g: 12, b: 90 },
    { pos: 1.00, r: 30, g:  5, b: 60 },
  ];

  function mix(a, b, t) {
    return { r: a.r+(b.r-a.r)*t, g: a.g+(b.g-a.g)*t, b: a.b+(b.b-a.b)*t };
  }

  function skyAt(t) {
    t = ((t % 1) + 1) % 1;
    for (let i = 0; i < skyColors.length - 1; i++) {
      const a = skyColors[i], b = skyColors[i+1];
      if (t >= a.pos && t <= b.pos) return mix(a, b, (t-a.pos)/(b.pos-a.pos));
    }
    return skyColors[0];
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, W*0.6, H);
    for (let s = 0; s <= 1; s += 0.1) {
      const c = skyAt(s + gradOffset);
      g.addColorStop(s, `rgb(${c.r|0},${c.g|0},${c.b|0})`);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  const blobs = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random()*W, y: Math.random()*H,
    r: 120+Math.random()*180,
    hue: [270,240,290,260,300,250][i],
    sat: 60+Math.random()*30,
    vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.12,
    alpha: 0.06+Math.random()*0.08,
  }));

  function drawBlobs() {
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,   `hsla(${b.hue},${b.sat}%,55%,${b.alpha})`);
      g.addColorStop(0.5, `hsla(${b.hue},${b.sat}%,40%,${b.alpha*0.5})`);
      g.addColorStop(1,   `hsla(${b.hue},${b.sat}%,30%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = W+b.r; if (b.x > W+b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H+b.r; if (b.y > H+b.r) b.y = -b.r;
    });
  }

  const stars = Array.from({ length: 220 }, () => ({
    x: Math.random()*2000, y: Math.random()*2000,
    size: 0.4+Math.random()*1.8,
    speed: 0.05+Math.random()*0.25,
    phase: Math.random()*Math.PI*2,
    twinkleSpeed: 0.4+Math.random()*1.2,
    color: ['#ffffff','#e8d5ff','#c8b8ff','#ffe8ff','#d0e8ff'][Math.floor(Math.random()*5)],
  }));
  let starShift = 0;

  function drawStars(t) {
    starShift += 0.015;
    stars.forEach(s => {
      const sx = (s.x + starShift*s.speed*40) % (W+20);
      const sy = s.y % (H+20);
      const tw = 0.4+0.6*Math.abs(Math.sin(t*s.twinkleSpeed+s.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(sx, sy, s.size*tw, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  let shimmerX = -300, shimmerTimer = 0, shimmerActive = false, nextShimmer = 7+Math.random()*8;

  function drawShimmer(dt) {
    shimmerTimer += dt;
    if (!shimmerActive && shimmerTimer > nextShimmer) {
      shimmerActive = true; shimmerX = -300; shimmerTimer = 0; nextShimmer = 9+Math.random()*10;
    }
    if (shimmerActive) {
      shimmerX += 3.5;
      const g = ctx.createLinearGradient(shimmerX-120,0,shimmerX+120,H);
      g.addColorStop(0,'rgba(255,255,255,0)');
      g.addColorStop(0.5,'rgba(255,255,255,0.04)');
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(shimmerX-120,0,240,H);
      if (shimmerX > W+300) shimmerActive = false;
    }
  }

  const dust = Array.from({ length: 35 }, () => ({
    x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
    r: 0.8+Math.random()*1.4,
    vx: (Math.random()-0.5)*0.2, vy: -0.1-Math.random()*0.2,
    alpha: 0.1+Math.random()*0.25,
  }));

  function drawDust() {
    dust.forEach(d => {
      ctx.globalAlpha = d.alpha; ctx.fillStyle = '#c8aaff';
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
      d.x += d.vx; d.y += d.vy;
      if (d.y < -5) { d.y = H+5; d.x = Math.random()*W; }
      if (d.x < -5) d.x = W+5; if (d.x > W+5) d.x = -5;
    });
    ctx.globalAlpha = 1;
  }

  let last = 0;
  function loop(ts) {
    const t = ts/1000, dt = t-last; last = t;
    gradOffset += 0.00015;
    drawSky(); drawBlobs(); drawStars(t); drawDust(); drawShimmer(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();


// ── Enhanced Cursor Trail ─────────────────────
const cursorContainer = document.getElementById('cursor-effects');

const cursorParticles = [
  { emoji: '🤖', glow: 'rgba(255,200,80,0.9)',  size: '1.8rem', dur: '1.5s' },
  { emoji: '💖', glow: 'rgba(255,100,180,0.9)', size: '1.6rem', dur: '1.3s' },
  { emoji: '✨', glow: 'rgba(200,180,255,0.9)', size: '1.4rem', dur: '1.2s' },
  { emoji: '🎂', glow: 'rgba(255,160,80,0.9)',  size: '1.7rem', dur: '1.4s' },
  { emoji: '🌟', glow: 'rgba(255,230,100,0.9)', size: '1.5rem', dur: '1.3s' },
  { emoji: '🤖', glow: 'rgba(180,120,255,0.9)', size: '1.6rem', dur: '1.4s' },
  { emoji: '💫', glow: 'rgba(220,200,255,0.9)', size: '1.4rem', dur: '1.2s' },
  { emoji: '🎈', glow: 'rgba(255,100,100,0.9)', size: '1.5rem', dur: '1.6s' },
];

let lastEmit = 0;

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastEmit < 90) return;
  lastEmit = now;
  spawnCursorParticle(e.clientX, e.clientY);
});

function spawnCursorParticle(x, y) {
  const p   = cursorParticles[Math.floor(Math.random() * cursorParticles.length)];
  const el  = document.createElement('span');
  el.className = 'cursor-particle';
  el.textContent = p.emoji;
  el.style.setProperty('--dur',  p.dur);
  el.style.setProperty('--size', p.size);
  el.style.setProperty('--glow', p.glow);
  el.style.setProperty('--rot',  (Math.random()*30-15) + 'deg');
  el.style.setProperty('--rot2', (Math.random()*40-20) + 'deg');
  el.style.left = (x - 14 + (Math.random()*24-12)) + 'px';
  el.style.top  = (y - 14 + (Math.random()*24-12)) + 'px';
  cursorContainer.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}


// ── FX Canvas (Rocket + Blast) ────────────────
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx    = fxCanvas.getContext('2d');
let FW, FH;

function resizeFx() { FW = fxCanvas.width = window.innerWidth; FH = fxCanvas.height = window.innerHeight; }
resizeFx();
window.addEventListener('resize', resizeFx);

// Particle pool for blast
const blastParticles = [];

function addBlastParticles(x, y) {
  const colors = ['#ff6fd8','#ffd200','#6a82fb','#ff3cac','#fff','#c471ed','#38ef7d','#ffb347'];
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 7;
    blastParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r:  2 + Math.random() * 5,
      color: colors[Math.floor(Math.random()*colors.length)],
      alpha: 1,
      decay: 0.012 + Math.random()*0.018,
      gravity: 0.12,
    });
  }
}

// Rocket state
let rocket = null;

function launchRocket(onArrive) {
  const side = Math.floor(Math.random() * 4);
  let sx, sy, tx, ty;
  tx = FW * (0.3 + Math.random() * 0.4);
  ty = FH * (0.3 + Math.random() * 0.4);

  if (side === 0)      { sx = -60;    sy = Math.random()*FH; }
  else if (side === 1) { sx = FW+60;  sy = Math.random()*FH; }
  else if (side === 2) { sx = Math.random()*FW; sy = FH+60; }
  else                 { sx = Math.random()*FW; sy = -60; }

  const dx = tx - sx, dy = ty - sy;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const speed = 9;

  rocket = {
    x: sx, y: sy,
    vx: (dx/dist)*speed, vy: (dy/dist)*speed,
    tx, ty,
    trail: [],
    arrived: false,
    onArrive,
  };
}

function updateRocket() {
  if (!rocket) return;
  rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 });
  if (rocket.trail.length > 28) rocket.trail.shift();

  rocket.x += rocket.vx;
  rocket.y += rocket.vy;

  const dx = rocket.tx - rocket.x, dy = rocket.ty - rocket.y;
  if (Math.sqrt(dx*dx+dy*dy) < 14 && !rocket.arrived) {
    rocket.arrived = true;
    rocket.onArrive(rocket.tx, rocket.ty);
    rocket = null;
  }
}

function drawRocket() {
  if (!rocket) return;
  rocket.trail.forEach((p, i) => {
    const a = (i / rocket.trail.length) * 0.7;
    fxCtx.globalAlpha = a;
    fxCtx.fillStyle = `hsl(${280 + i*3}, 90%, 65%)`;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, 3 + i*0.15, 0, Math.PI*2);
    fxCtx.fill();
  });
  fxCtx.globalAlpha = 1;

  const angle = Math.atan2(rocket.vy, rocket.vx);
  fxCtx.save();
  fxCtx.translate(rocket.x, rocket.y);
  fxCtx.rotate(angle + Math.PI/2);
  fxCtx.font = '2rem serif';
  fxCtx.textAlign = 'center';
  fxCtx.textBaseline = 'middle';
  fxCtx.fillText('🚀', 0, 0);
  fxCtx.restore();
}

// Glow ripple after blast
const ripples = [];

function addRipple(x, y) {
  ripples.push({ x, y, r: 0, maxR: 180, alpha: 0.7 });
}

function drawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.r += 4;
    rp.alpha -= 0.012;
    if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
    fxCtx.globalAlpha = rp.alpha;
    fxCtx.strokeStyle = 'rgba(220,150,255,0.8)';
    fxCtx.lineWidth = 2.5;
    fxCtx.beginPath();
    fxCtx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    fxCtx.stroke();
    fxCtx.globalAlpha = rp.alpha * 0.5;
    fxCtx.strokeStyle = 'rgba(255,200,100,0.6)';
    fxCtx.beginPath();
    fxCtx.arc(rp.x, rp.y, rp.r * 0.65, 0, Math.PI*2);
    fxCtx.stroke();
  }
  fxCtx.globalAlpha = 1;
}

// Light burst flash
let burst = null;

function addBurst(x, y) {
  burst = { x, y, alpha: 1, r: 10 };
}

function drawBurst() {
  if (!burst) return;
  burst.r += 18;
  burst.alpha -= 0.06;
  if (burst.alpha <= 0) { burst = null; return; }
  const g = fxCtx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, burst.r);
  g.addColorStop(0,   `rgba(255,255,255,${burst.alpha})`);
  g.addColorStop(0.3, `rgba(255,180,255,${burst.alpha*0.6})`);
  g.addColorStop(1,   'rgba(180,80,255,0)');
  fxCtx.fillStyle = g;
  fxCtx.beginPath();
  fxCtx.arc(burst.x, burst.y, burst.r, 0, Math.PI*2);
  fxCtx.fill();
}

// FX loop
function fxLoop() {
  fxCtx.clearRect(0, 0, FW, FH);
  updateRocket();
  drawRocket();
  drawBurst();
  drawRipples();

  for (let i = blastParticles.length - 1; i >= 0; i--) {
    const p = blastParticles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.98; p.vy *= 0.98;
    p.alpha -= p.decay;
    if (p.alpha <= 0) { blastParticles.splice(i, 1); continue; }
    fxCtx.globalAlpha = p.alpha;
    fxCtx.fillStyle = p.color;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    fxCtx.fill();
  }
  fxCtx.globalAlpha = 1;
  requestAnimationFrame(fxLoop);
}
fxLoop();


// ── Blast Messages ────────────────────────────
const blastMsgContainer = document.getElementById('blastMessages');

const rocketMessages = [
  'Happy Birthday Tangi 🎉',
  "it's Your Special Day 💖",
  'Stay Happy Always 😊',
  'Cute Tangi 🥰',
  '13-13-1313 🎂',
  'Dear Tangi 💌',
];

function showBlastMessage(x, y, msg) {
  const el = document.createElement('div');
  el.className = 'blast-msg';
  el.textContent = msg;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.setProperty('--dur', '2.6s');
  blastMsgContainer.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

// ── Screen Shake ──────────────────────────────
function shakeScreen() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 520);
}

// ── Gift Box Sparkle Burst on Click ──────────────
function spawnBoxSparkles(cx, cy) {
  const emojis = ['✨','🎉','💖','🌟','🎊','💫','🎈','⭐','🎀','💥'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.style.cssText = `
        position:fixed;
        left:${cx}px; top:${cy}px;
        font-size:${1.2 + Math.random() * 1.4}rem;
        pointer-events:none;
        z-index:9999;
        transform:translate(-50%,-50%);
        user-select:none;
      `;
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      document.body.appendChild(el);
      const angle = Math.random() * Math.PI * 2;
      const dist  = 80 + Math.random() * 140;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist - 60;
      el.animate([
        { opacity: 1, transform: `translate(-50%,-50%) scale(1) rotate(0deg)` },
        { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.2) rotate(${Math.random()*360}deg)` }
      ], { duration: 900 + Math.random() * 500, easing: 'ease-out', fill: 'forwards' });
      setTimeout(() => el.remove(), 1500);
    }, i * 40);
  }
}

// ── Multi-Rocket Sequence ─────────────────────
const giftBox = document.getElementById('giftBox');
const landing = document.getElementById('landing');
let   giftClicked = false;

giftBox.addEventListener('click', () => {
  if (giftClicked) return;
  giftClicked = true;

  giftBox.classList.add('opened');
  giftBox.style.animation = 'none';

  // Confetti burst from box position
  const rect = giftBox.getBoundingClientRect();
  const bx = rect.left + rect.width  / 2;
  const by = rect.top  + rect.height / 2;
  addBlastParticles(bx, by);
  addBurst(bx, by);
  addRipple(bx, by);
  spawnBoxSparkles(bx, by);

  const ROCKET_GAP = 2200;

  rocketMessages.forEach((msg, idx) => {
    const isLast = idx === rocketMessages.length - 1;

    setTimeout(() => {
      launchRocket((bx, by) => {
        addBlastParticles(bx, by);
        addBurst(bx, by);
        addRipple(bx, by);
        shakeScreen();
        showBlastMessage(bx, by, msg);

        if (isLast) {
          setTimeout(() => {
            landing.style.opacity = '0';
            landing.style.pointerEvents = 'none';
            setTimeout(() => {
              landing.classList.add('hidden');
              showPage2();
            }, 800);
          }, 1800);
        }
      });
    }, 500 + idx * ROCKET_GAP);
  });
});

// ── Page 2 + Cinematic Scroll System ─────────
function showPage2() {
  const p2 = document.getElementById('page2');
  p2.classList.remove('hidden');
  startConfetti();
  launchBalloons();
  initScrollSystem();
  setTimeout(triggerCakeSection, 400);
  setTimeout(unlockMusic, 600);
}

function initScrollSystem() {
  const viewport   = document.getElementById('sectionsViewport');
  const sections   = Array.from(document.querySelectorAll('.p2-section'));
  const dotsWrap   = document.getElementById('scrollDots');
  const scrollHint = document.getElementById('scrollHint');
  const TOTAL      = sections.length;

  let current   = 0;
  let animating = false;
  let targetY   = 0;
  let currentY  = 0;

  sections.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'scroll-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.scroll-dot'));

  revealSection(0);

  function animLoop() {
    currentY += (targetY - currentY) * 0.072;
    if (Math.abs(targetY - currentY) < 0.1) currentY = targetY;
    viewport.style.transform = `translateY(${-currentY}px)`;
    requestAnimationFrame(animLoop);
  }
  requestAnimationFrame(animLoop);

  function goTo(idx) {
    if (animating || idx === current || idx < 0 || idx >= TOTAL) return;
    animating = true;
    current   = idx;
    targetY   = idx * window.innerHeight;

    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    if (idx > 0) scrollHint.classList.add('hide');

    onSectionChange(idx);

    setTimeout(() => revealSection(idx), 300);
    setTimeout(() => { animating = false; }, 900);
  }

  function revealSection(idx) {
    sections.forEach((s, i) => {
      const inner = s.querySelector('.s-inner');
      if (i === idx) {
        setTimeout(() => {
          if (inner) inner.classList.add('visible');
          if (s.id === 'wishSection')    triggerWishSection();
          if (s.id === 'carSection')     triggerCarSection();
          if (s.id === 'ufoSection')     triggerUfoSection();
          if (s.id === 'chatSection')    triggerChatSection();
          if (s.id === 'gallerySection') triggerGallerySection();
        }, 120);
      } else {
        if (inner) inner.classList.remove('visible');
      }
    });
  }

  let wheelCooldown = false;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (animating || wheelCooldown) return;
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 950);
    goTo(e.deltaY > 0 ? current + 1 : current - 1);
  }, { passive: false });

  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 40) return;
    goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(current + 1);
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   goTo(current - 1);
  });

  window.addEventListener('resize', () => {
    targetY  = current * window.innerHeight;
    currentY = targetY;
  });
}


// ── Balloons ──────────────────────────────────
const balloonEmojis = ['🎈','🎀','🎊','🎁','🎈'];

function launchBalloons() {
  const container = document.getElementById('balloons');
  function spawnBalloon() {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.textContent = balloonEmojis[Math.floor(Math.random()*balloonEmojis.length)];
    b.style.left = Math.random()*95 + 'vw';
    const dur = 4 + Math.random()*4;
    b.style.animationDuration = dur + 's';
    b.style.fontSize = (2+Math.random()*1.5) + 'rem';
    container.appendChild(b);
    setTimeout(() => b.remove(), dur*1000+200);
  }
  for (let i = 0; i < 12; i++) setTimeout(spawnBalloon, i*350);
  setInterval(spawnBalloon, 1200);
}

// ── Canvas Confetti ───────────────────────────
function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  });

  const colors = ['#ff6fd8','#ffd200','#6a82fb','#38ef7d','#fc5c7d','#fff','#c471ed'];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height - canvas.height,
    w: 6+Math.random()*8, h: 10+Math.random()*6,
    color: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*Math.PI*2, rotV: (Math.random()-0.5)*0.12,
    vx: (Math.random()-0.5)*1.5, vy: 1.5+Math.random()*2.5,
  }));

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y > canvas.height+20) { p.y = -20; p.x = Math.random()*canvas.width; }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Cake Section Animation ────────────────────
let cakeTriggered = false;

function triggerCakeSection() {
  if (cakeTriggered) return;
  cakeTriggered = true;

  const topText   = document.getElementById('cakeTopText');
  const assembly  = document.getElementById('cakeAssembly');
  const cakeEmoji = document.getElementById('cakeEmoji');
  const shadow    = document.getElementById('cakeShadow');
  const cakeMsg   = document.getElementById('cakeMsg');

  topText.classList.add('visible');

  const START_Y  = -window.innerHeight * 0.75;
  const LAND_Y   = 0;
  let   posY     = START_Y;
  let   velY     = 0;
  let   time     = 0;
  const SPEED    = 0.55;
  const SWAY_AMP = 10;
  const SWAY_SPD = 0.018;
  let   phase    = Math.random() * Math.PI * 2;
  let   settled  = false;
  let   rafId;

  assembly.style.transform = `translateY(${START_Y}px) translateX(0px)`;
  assembly.classList.add('visible');

  function floatLoop() {
    time++;

    if (!settled) {
      velY += 0.04;
      velY  = Math.min(velY, SPEED);
      posY += velY;

      const swayX = Math.sin(time * SWAY_SPD + phase) * SWAY_AMP;

      if (posY >= LAND_Y) {
        posY = LAND_Y;
        settled = true;

        let bounceY = 0, bVel = -3.5;
        function bounceLoop() {
          bVel  *= 0.72;
          bounceY += bVel;
          if (Math.abs(bVel) < 0.3) {
            assembly.style.transform = `translateY(0px) translateX(0px)`;
            shadow.classList.add('landed');
            cancelAnimationFrame(rafId);
            onCakeLanded();
            return;
          }
          assembly.style.transform = `translateY(${bounceY}px) translateX(0px)`;
          rafId = requestAnimationFrame(bounceLoop);
        }
        rafId = requestAnimationFrame(bounceLoop);
        return;
      }

      assembly.style.transform = `translateY(${posY}px) translateX(${swayX}px)`;
    }

    rafId = requestAnimationFrame(floatLoop);
  }

  setTimeout(() => { rafId = requestAnimationFrame(floatLoop); }, 700);

  function onCakeLanded() {
    shadow.classList.add('landed');

    setTimeout(() => {
      const rect = cakeEmoji.getBoundingClientRect();
      const tx   = rect.left + rect.width  / 2;
      const ty   = rect.top  + rect.height / 2;

      const side = Math.floor(Math.random() * 4);
      let sx, sy;
      if (side === 0)      { sx = -60;        sy = Math.random() * FH; }
      else if (side === 1) { sx = FW + 60;    sy = Math.random() * FH; }
      else if (side === 2) { sx = Math.random() * FW; sy = FH + 60; }
      else                 { sx = Math.random() * FW; sy = -60; }

      const dx = tx - sx, dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      rocket = {
        x: sx, y: sy,
        vx: (dx / dist) * 10, vy: (dy / dist) * 10,
        tx, ty,
        trail: [],
        arrived: false,
        onArrive: (bx, by) => {
          addBlastParticles(bx, by);
          addBurst(bx, by);
          addRipple(bx, by);
          shakeScreen();
          setTimeout(() => cakeMsg.classList.add('visible'), 350);
        },
      };
    }, 600);
  }
}


// ── Wish Section Animation ────────────────────
let wishTriggered = false;

const WISH_LINES = [
  { text: "On this special day, I just want to say that you are truly amazing. ✨", dir: 'left'   },
  { text: "You bring happiness, smiles, and positivity wherever you go. 🌟",        dir: 'right'  },
  { text: "May your life always be filled with love, laughter, and success. 💫",    dir: 'top'    },
  { text: "Keep shining, keep smiling, and never change who you are. 💖",           dir: 'bottom' },
  { text: "Today is all about you — enjoy every moment! 🎉",                        dir: 'zoom'   },
];

const DIR_OFFSET = {
  left:   { tx: '-130px', ty: '0px',    sc: '1'   },
  right:  { tx:  '130px', ty: '0px',    sc: '1'   },
  top:    { tx: '0px',    ty: '-100px', sc: '1'   },
  bottom: { tx: '0px',    ty:  '100px', sc: '1'   },
  zoom:   { tx: '0px',    ty: '0px',    sc: '0.5' },
};

const FLOATER_ITEMS = ['💖','✨','💫','🌟','💜','🎉','✨','💖','⭐','💕'];

function triggerWishSection() {
  if (wishTriggered) return;
  wishTriggered = true;

  const box       = document.getElementById('wishBox');
  const boxLid    = document.getElementById('wishBoxLid');
  const boxGlow   = document.getElementById('wishBoxGlow');
  const boxShadow = document.getElementById('wishBoxShadow');
  const blink     = document.getElementById('wishBlink');
  const paperWrap = document.getElementById('wishPaperWrap');
  const paper     = document.getElementById('wishPaper');
  const letter    = document.getElementById('wishLetter');
  const paraEl    = document.getElementById('wishPara');
  const floatWrap = document.getElementById('wishFloaters');

  let posY = -window.innerHeight * 0.6;
  let velY = 0;
  let rafId;

  box.style.transform = `translate(-50%, -50%) translateY(${posY}px)`;
  box.style.opacity   = '1';

  function dropBox() {
    velY += 1.6;
    posY += velY;

    const rot = Math.sin(posY * 0.012) * 7;
    box.style.transform = `translate(-50%, -50%) translateY(${posY}px) rotate(${rot}deg)`;

    if (posY >= 0) {
      posY = 0;
      box.style.transform = `translate(-50%, -50%) translateY(0px) rotate(0deg)`;
      boxShadow.classList.add('show');
      cancelAnimationFrame(rafId);
      onBoxLanded();
      return;
    }
    rafId = requestAnimationFrame(dropBox);
  }

  setTimeout(() => { rafId = requestAnimationFrame(dropBox); }, 300);

  function onBoxLanded() {
    shakeScreen();

    const rect = box.getBoundingClientRect();
    const bx = rect.left + rect.width  / 2;
    const by = rect.top  + rect.height / 2;
    addBlastParticles(bx, by);
    addBurst(bx, by);
    addRipple(bx, by);

    let bVel = -11, bPos = 0;
    function bounceBox() {
      bVel *= 0.60;
      bPos += bVel;
      if (Math.abs(bVel) < 0.5) {
        box.style.transform = `translate(-50%, -50%) translateY(0px)`;
        onBoxSettled();
        return;
      }
      if (bPos > 0) { bPos = 0; bVel = -Math.abs(bVel) * 0.5; }
      box.style.transform = `translate(-50%, -50%) translateY(${bPos}px)`;
      requestAnimationFrame(bounceBox);
    }
    requestAnimationFrame(bounceBox);
  }

  function onBoxSettled() {
    setTimeout(() => {
      boxLid.classList.add('open');
      setTimeout(() => {
        boxGlow.classList.add('show');
        spawnOpeningSparkles(box);
      }, 500);
      setTimeout(startBlink, 1200);
    }, 400);
  }

  function startBlink() {
    const BLINK_COUNT = 4;
    const BLINK_CYCLE = 2000 / BLINK_COUNT;

    let b = 0;
    function doBlink() {
      if (b >= BLINK_COUNT) { onBlinkDone(); return; }
      blink.style.transition = `opacity ${BLINK_CYCLE * 0.38}ms ease`;
      blink.style.opacity = b % 2 === 0 ? '0.65' : '0.3';
      setTimeout(() => {
        blink.style.transition = `opacity ${BLINK_CYCLE * 0.55}ms ease`;
        blink.style.opacity = '0';
        b++;
        setTimeout(doBlink, BLINK_CYCLE * 0.55);
      }, BLINK_CYCLE * 0.38);
    }
    setTimeout(doBlink, 200);
  }

  function onBlinkDone() {
    blink.style.opacity = '0';

    box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    box.style.opacity    = '0';
    box.style.transform  = `translate(-50%, -50%) translateY(20px) scale(0.85)`;

    setTimeout(() => {
      paperWrap.classList.add('unfolding');
      setTimeout(() => {
        paper.classList.add('open');
        setTimeout(() => {
          letter.classList.add('visible');
          spawnWishFloaters(floatWrap);
          revealWishLines(paraEl);
          playBgMusic();
        }, 700);
      }, 80);
    }, 300);
  }
}

// Sparkles burst from box opening
function spawnOpeningSparkles(box) {
  const rect = box.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.15;
  const sparkles = ['✨','💫','⭐','🌟','💛','💜'];
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.style.cssText = `
        position:fixed; left:${cx}px; top:${cy}px;
        font-size:${1 + Math.random()}rem;
        pointer-events:none; z-index:9999;
        transform:translate(-50%,-50%);
      `;
      el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      document.body.appendChild(el);
      const angle = Math.random() * Math.PI * 2;
      const dist  = 60 + Math.random() * 100;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist - 40;
      el.animate([
        { opacity: 1, transform: `translate(-50%,-50%) scale(1)` },
        { opacity: 0, transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3) rotate(${Math.random()*360}deg)` }
      ], { duration: 900 + Math.random() * 400, easing: 'ease-out', fill: 'forwards' });
      setTimeout(() => el.remove(), 1400);
    }, i * 80);
  }
}

// Reveal wish lines one by one
function revealWishLines(paraEl) {
  paraEl.innerHTML = '';
  WISH_LINES.forEach((item, i) => {
    const span = document.createElement('span');
    span.className = 'wish-line';
    span.textContent = item.text;
    const off = DIR_OFFSET[item.dir];
    span.style.setProperty('--tx', off.tx);
    span.style.setProperty('--ty', off.ty);
    span.style.setProperty('--sc', off.sc);
    paraEl.appendChild(span);
    setTimeout(() => span.classList.add('show'), 500 + i * 700);
  });
}


// ── Background Music ─────────────────────────
// Single "Happy Birthday" track — starts on first interaction, loops forever.

const musicBtn = document.getElementById('musicBtn');
const bgMusic  = document.getElementById('bgMusic');

bgMusic.volume = 0.3;

let musicStarted = false;
let musicMuted   = false;

function startMusic() {
  if (musicStarted || !bgMusic) return;
  musicStarted = true; // set immediately so concurrent calls don't stack up

  if (musicBtn) musicBtn.style.display = 'flex';

  bgMusic.play().then(() => {
    console.log('✅ Music started');
  }).catch((e) => {
    console.warn('❌ Play blocked:', e);
    // Reset so a future interaction can retry
    musicStarted = false;
  });
}

// Use window-level listeners so the gift-box click on landing doesn't consume them
window.addEventListener('click',   startMusic, { once: true });
window.addEventListener('scroll',  startMusic, { once: true });
window.addEventListener('keydown', startMusic, { once: true });

// Mute / unmute button
if (musicBtn) {
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't re-trigger startMusic
    musicMuted = !musicMuted;
    const icon = musicBtn.querySelector('.music-icon');
    const lbl  = musicBtn.querySelector('.music-label');
    if (musicMuted) {
      bgMusic.volume = 0;
      musicBtn.classList.add('muted');
      if (icon) icon.textContent = '🔇';
      if (lbl)  lbl.textContent  = 'muted';
    } else {
      bgMusic.volume = 0.3;
      if (!musicStarted) startMusic();
      musicBtn.classList.remove('muted');
      if (icon) icon.textContent = '🎵';
      if (lbl)  lbl.textContent  = 'music';
    }
  });
}

// No-ops — single track plays across all sections
function onSectionChange(_idx) {}
function unlockMusic()         { startMusic(); }
function playBgMusic()         { startMusic(); }

// ── Wish Floaters ─────────────────────────────
function spawnOneFloater(container, delay) {
  const el = document.createElement('span');
  el.className = 'wf-item';
  el.textContent = FLOATER_ITEMS[Math.floor(Math.random() * FLOATER_ITEMS.length)];
  const dur  = 5 + Math.random() * 4;
  const size = 0.9 + Math.random() * 1.1;
  el.style.setProperty('--dur',   dur + 's');
  el.style.setProperty('--delay', delay + 'ms');
  el.style.setProperty('--fs',    size + 'rem');
  el.style.left   = Math.random() * 95 + '%';
  el.style.bottom = Math.random() * 20 + '%';
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + delay + 200);
}

function spawnWishFloaters(container) {
  for (let i = 0; i < 18; i++) {
    spawnOneFloater(container, i * 300);
  }
  // Keep spawning periodically
  setInterval(() => spawnOneFloater(container, 0), 1800);
}


// ── Truck Section Animation (Section 3) ──────────────────────────────────
// Scroll trigger → truck drives in from left → stops at centre
// → box drops from truck rear → bounces with "Click me" label
// → user clicks box → birthday message appears → box hides → truck exits right
let carTriggered = false;

function triggerCarSection() {
  if (carTriggered) return;
  carTriggered = true;

  const truck     = document.getElementById('carVehicle');
  const rearDoor  = document.getElementById('truckRearDoor');
  const box       = document.getElementById('carBox');
  const boxShadow = document.getElementById('carBoxShadow');
  const msg       = document.getElementById('carMsg');

  const VW      = window.innerWidth;
  const roadH   = window.innerWidth <= 480 ? 60 : 80;   // matches CSS road height
  // Truck visual width matches CSS clamp(320px, 70vw, 620px)
  const truckPx = Math.min(620, Math.max(320, VW * 0.70));
  // Scale factor: SVG viewBox is 340 wide, rendered at truckPx
  const svgScale = truckPx / 340;
  // Stop position: truck rear (left edge) sits just left of screen centre
  const stopX   = VW * 0.5 - truckPx * 0.12;
  let   truckX  = -truckPx - 60;   // start fully off-screen left

  // ── Phase 1: truck drives in ──────────────────────────────────────────
  truck.style.transform = `translateX(${truckX}px)`;
  truck.classList.add('driving');

  function driveTruck() {
    const dist = stopX - truckX;
    const step = dist > 150 ? 10 : Math.max(0.4, dist * 0.055);
    truckX += step;
    truck.style.transform = `translateX(${truckX}px)`;

    if (truckX >= stopX) {
      truckX = stopX;
      truck.style.transform = `translateX(${truckX}px)`;
      truck.classList.remove('driving');
      // Brief settle pause, then open the rear door
      setTimeout(openRearDoor, 380);
      return;
    }
    requestAnimationFrame(driveTruck);
  }
  requestAnimationFrame(driveTruck);

  // ── Phase 2: rear door swings open ───────────────────────────────────
  function openRearDoor() {
    rearDoor.classList.add('door-open');
    // Wait for door CSS transition (550ms) then slide box out
    setTimeout(slideBoxOut, 620);
  }

  // ── Phase 3: box slides out from truck rear at road level ─────────────
  // The truck rear left edge in screen coords = truckX (truck.style left=0).
  // SVG rear door is at x≈0..18, so rear edge ≈ truckX + 0px in screen space.
  // Box starts hidden at the rear opening and slides left onto the road.
  function slideBoxOut() {
    const boxW = box.offsetWidth || Math.min(120, Math.max(80, VW * 0.13));

    // Position box at the truck's rear opening (road level, no translateY offset)
    // truckX is the truck's left edge in the viewport
    const rearEdgeX = truckX + 10 * svgScale;   // slight inset from rear edge
    box.style.left      = rearEdgeX + 'px';
    box.style.transform = 'translateX(0px)';
    box.style.opacity   = '1';

    // Slide the box leftward from the rear opening to its resting spot
    // Resting spot: centred on screen
    const restX = VW / 2 - boxW / 2;
    let   curX  = rearEdgeX;

    function slideLeft() {
      const dist = curX - restX;
      const step = dist > 60 ? 8 : Math.max(0.5, dist * 0.07);
      curX -= step;
      box.style.left = curX + 'px';

      if (curX <= restX) {
        curX = restX;
        box.style.left = curX + 'px';
        // Small bounce settle
        box.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
        box.style.transform  = 'translateX(0px) translateY(-8px)';
        setTimeout(() => {
          box.style.transform = 'translateX(0px) translateY(0px)';
          boxShadow.classList.add('landed');
          onBoxLanded(curX, boxW);
        }, 360);
        return;
      }
      requestAnimationFrame(slideLeft);
    }
    requestAnimationFrame(slideLeft);
  }

  // ── Phase 4: box landed → truck exits right ───────────────────────────
  function onBoxLanded(boxLeft, boxW) {
    // Impact FX at box centre
    const bx = boxLeft + boxW / 2;
    const by = window.innerHeight - roadH - (box.offsetHeight || 96) / 2;
    addBlastParticles(bx, by);
    addBurst(bx, by);
    addRipple(bx, by);
    shakeScreen();

    // Truck drives off right immediately
    setTimeout(() => {
      truck.classList.add('driving');
      let exitX = truckX;
      function driveOff() {
        exitX += 10;
        truck.style.transform = `translateX(${exitX}px)`;
        if (exitX < VW + truckPx + 80) requestAnimationFrame(driveOff);
      }
      requestAnimationFrame(driveOff);
    }, 250);

    // Box waits for click
    box.addEventListener('click', onBoxClick, { once: true });
  }

  // ── Phase 5: box clicked → hide box + show message ────────────────────
  function onBoxClick() {
    box.classList.add('clicked');

    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    addBlastParticles(cx, cy);
    addBurst(cx, cy);
    addRipple(cx, cy);
    shakeScreen();

    // Scale-out the box
    box.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    box.style.opacity    = '0';
    box.style.transform  = 'translateX(0px) translateY(-30px) scale(0.5)';

    // Reveal birthday message
    setTimeout(() => msg.classList.add('visible'), 200);
  }
}

// ── UFO Section Animation (Section 4) ────────────────────────────────────
// Scroll trigger → UFO flies in from top → hovers → beam fires → box beams down
// → box lands with "Click me" → UFO flies away → user clicks box → message appears
let ufoTriggered = false;

function triggerUfoSection() {
  if (ufoTriggered) return;
  ufoTriggered = true;

  const ufoWrap   = document.getElementById('ufoWrap');
  const beam      = document.getElementById('ufoBeam');
  const box       = document.getElementById('ufoBox');
  const boxShadow = document.getElementById('ufoBoxShadow');
  const msg       = document.getElementById('ufoMsg');

  // ── Phase 1: UFO flies in from above ─────────────────────────────────
  // CSS starts it at translateY(-160%); we animate to translateY(0)
  // using a rAF loop for smooth easing.
  let posY   = -window.innerHeight * 0.9;
  let velY   = 0;
  const LAND_Y = 0;

  ufoWrap.style.transform = `translateX(-50%) translateY(${posY}px)`;

  function flyIn() {
    const dist = LAND_Y - posY;
    velY += dist * 0.018;   // spring toward target
    velY *= 0.78;           // damping
    posY += velY;

    ufoWrap.style.transform = `translateX(-50%) translateY(${posY}px)`;

    if (Math.abs(dist) < 0.5 && Math.abs(velY) < 0.3) {
      posY = LAND_Y;
      ufoWrap.style.transform = `translateX(-50%) translateY(0px)`;
      // Switch to CSS hover animation
      ufoWrap.style.animation = 'ufoHover 3s ease-in-out infinite';
      setTimeout(fireBeam, 500);
      return;
    }
    requestAnimationFrame(flyIn);
  }
  setTimeout(() => requestAnimationFrame(flyIn), 200);

  // ── Phase 2: tractor beam extends downward ────────────────────────────
  // We measure the UFO's bottom position, then grow the beam height
  // until it reaches the box landing spot.
  function fireBeam() {
    const ufoRect  = ufoWrap.getBoundingClientRect();
    const ufoBottom = ufoRect.bottom;                    // beam starts here
    const VH        = window.innerHeight;
    // Box will land at 62% down the viewport
    const boxLandY  = VH * 0.62;
    const beamTarget = boxLandY - ufoBottom;             // px beam needs to grow

    beam.classList.add('active');

    let beamH = 0;
    function growBeam() {
      beamH += (beamTarget - beamH) * 0.09;
      beam.style.height = beamH + 'px';
      if (beamTarget - beamH > 1) {
        requestAnimationFrame(growBeam);
      } else {
        beam.style.height = beamTarget + 'px';
        // Beam fully extended — beam down the box
        setTimeout(beamDownBox, 300);
      }
    }
    requestAnimationFrame(growBeam);
  }

  // ── Phase 3: box materialises inside beam and slides down ─────────────
  function beamDownBox() {
    const ufoRect  = ufoWrap.getBoundingClientRect();
    const VH       = window.innerHeight;
    const boxLandY = VH * 0.62;                          // final top position
    const boxW     = box.offsetWidth || 100;

    // Position box at beam top (just below UFO nozzle), centred
    box.style.left    = '50%';
    box.style.top     = ufoRect.bottom + 'px';
    box.style.transform = 'translateX(-50%)';
    box.style.opacity = '1';

    // Slide box down through the beam to landing spot
    let curTop = ufoRect.bottom;
    function slideDown() {
      const dist = boxLandY - curTop;
      const step = dist > 60 ? 7 : Math.max(0.5, dist * 0.07);
      curTop += step;
      box.style.top = curTop + 'px';

      if (curTop >= boxLandY) {
        box.style.top = boxLandY + 'px';
        // Bounce settle
        box.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        box.style.transform  = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => {
          box.style.transform = 'translateX(-50%) translateY(0px)';
          boxShadow.classList.add('landed');
          onBoxLanded();
        }, 420);
        return;
      }
      requestAnimationFrame(slideDown);
    }
    requestAnimationFrame(slideDown);
  }

  // ── Phase 4: box landed → retract beam → UFO flies away ──────────────
  function onBoxLanded() {
    // Impact FX
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    addBlastParticles(cx, cy);
    addBurst(cx, cy);
    addRipple(cx, cy);
    shakeScreen();

    // Retract beam
    setTimeout(() => {
      beam.style.height  = '0';
      beam.style.opacity = '0';
    }, 200);

    // UFO flies away after beam retracts
    setTimeout(() => {
      ufoWrap.style.animation = 'none';   // stop hover loop
      ufoWrap.classList.add('fly-away');
    }, 700);

    // Box waits for click
    box.addEventListener('click', onBoxClick, { once: true });
  }

  // ── Phase 5: box clicked → hide box + show message ────────────────────
  function onBoxClick() {
    box.classList.add('clicked');

    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    addBlastParticles(cx, cy);
    addBurst(cx, cy);
    addRipple(cx, cy);
    shakeScreen();

    // Scale-out box
    box.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    box.style.opacity    = '0';
    box.style.transform  = 'translateX(-50%) translateY(-30px) scale(0.5)';

    // Reveal birthday message
    setTimeout(() => msg.classList.add('visible'), 200);
  }
}



// ── Unlock Section (Section 5) ───────────────────────────────────────────
let unlockSectionReady = false;
let unlockListenersSet = false;

function triggerChatSection() {
  const card      = document.getElementById('unlockCard');
  const form      = document.getElementById('unlockForm');
  const input     = document.getElementById('passwordInput');
  const inputWrap = document.getElementById('unlockInputWrap');
  const btn       = document.getElementById('unlockBtn');
  const error     = document.getElementById('unlockError');
  const icon      = document.getElementById('unlockIcon');
  const msg       = document.getElementById('secretMessage');
  const msgText   = document.getElementById('unlockMsgText');

  if (!card || !input || !btn) return;

  // Reveal card on every section entry
  card.classList.add('visible');

  // Already unlocked — just keep message showing
  if (unlockSectionReady) {
    msg.style.display = 'flex';
    msg.classList.add('show');
    return;
  }

  // Wire up listeners exactly once
  if (unlockListenersSet) return;
  unlockListenersSet = true;

  const PASSWORD = 'samarth';
  const REVEAL   = 'Small Advice 💡\nLife nag yavaglu honest iru,\nmatthu specially nina S….. sambhand re 🤍\n\nHappy Birthday Tangi ri 🎉';
  const hint     = document.getElementById('unlockHint');
  let attempts   = 0;

  function attempt() {
    const val = input.value.trim();

    if (val === PASSWORD) {
      // ✅ Correct
      unlockSectionReady = true;
      error.classList.remove('show');
      input.classList.remove('error');

      // Swap icon
      icon.textContent = '🔓';

      // Hide the whole form group
      form.classList.add('hidden');

      // Show message
      msg.style.display = 'flex';
      void msg.offsetWidth;           // force reflow so CSS transition fires
      msg.classList.add('show');

      // Type out the message text
      msgText.innerHTML = '';
      typeUnlockMsg(REVEAL, msgText);

    } else {
      // ❌ Wrong
      attempts++;
      input.classList.add('error');
      error.classList.add('show');

      inputWrap.classList.remove('shake');
      void inputWrap.offsetWidth;
      inputWrap.classList.add('shake');
      setTimeout(() => inputWrap.classList.remove('shake'), 450);

      setTimeout(() => {
        input.classList.remove('error');
        error.classList.remove('show');
      }, 2000);

      // Show hint after 3 wrong attempts
      if (attempts >= 3 && hint) hint.classList.add('show');

      input.value = '';
      input.focus();
    }
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attempt();
  });
}

function typeUnlockMsg(text, el) {
  let i = 0;
  function next() {
    if (i >= text.length) return;
    const ch = text[i++];
    if (ch === '\n') {
      el.appendChild(document.createElement('br'));
    } else {
      el.appendChild(document.createTextNode(ch));
    }
    setTimeout(next, ch === '\n' ? 200 : 40);
  }
  next();
}


// ── Gallery Section (Section 6) ───────────────────────────────────────────
let galleryTriggered = false;

function triggerGallerySection() {
  const wrap      = document.getElementById('galleryWrap');
  const items     = document.querySelectorAll('.gallery-item');
  const lightbox  = document.getElementById('galleryLightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbClose   = document.getElementById('lightboxClose');

  if (!wrap) return;

  // Reveal wrap
  wrap.classList.add('visible');

  // Stagger each image in
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), 80 + i * 100);
  });

  // Wire up lightbox once
  if (galleryTriggered) return;
  galleryTriggered = true;

  items.forEach(item => {
    item.addEventListener('click', () => {
      lbImg.src = item.dataset.src;
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}
