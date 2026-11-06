gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* smooth scroll (same settings as the reference) */
const lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 3), smoothWheel: true, lerp: .08 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { duration: 1.6 }); }
}));

/* ---------- 1. LOADER ---------- */
function runLoader() {
  const wraps = $$('.wrap:not(.final)'), fin = $('.wrap.final');
  const tl = gsap.timeline({ delay: .3 });
  wraps.forEach((w, i) => tl.to(w, { clipPath: 'inset(0% 0 0 0)', duration: .65, ease: 'power2.out' }, i ? '<0.12' : 0));
  tl.to(fin, { clipPath: 'inset(0% 0 0 0)', duration: .65, ease: 'power2.out' }, '<0.12')
    .set(wraps, { opacity: 0 })
    .to('#box', { width: '100vw', height: '100vh', duration: 1.2, ease: 'expo.inOut' }, '>0.2')
    .to('#numwrap', { scale: .6875, filter: 'blur(0px)', duration: 1.2, ease: 'expo.inOut' }, '<')
    .set('.intro', { background: '#0a0a0a' })
    .fromTo('#nav', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '>-0.2')
    .fromTo(['#ticker', '#corner'], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12 }, '<0.3')
    .fromTo('.tb', { y: 40 }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: .08 }, '<')
    .add(() => { document.body.classList.remove('is-loading'); lenis.start(); setupScroll(); setInterval(nextStat, 3400); });
}

/* big number cycles through the stats on its own */
const stats = [
  { n: '2',  label: 'YEARS EXPERIENCE' },
  { n: '10', label: 'WEBSITES LIVE' }
];
let si = 0;
gsap.set('#yr', { xPercent: -50 });
function nextStat() {
  const g = $('.num > .g'), pw = $('.pw'), yr = $('#yr'), parts = [g, pw, yr];
  gsap.timeline()
    .to(parts, { y: -30, opacity: 0, filter: 'blur(14px)', duration: .5, ease: 'power2.in' })
    .add(() => { si = (si + 1) % stats.length; g.textContent = stats[si].n; yr.textContent = stats[si].label; })
    .fromTo(parts, { y: 30, opacity: 0, filter: 'blur(14px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .8, ease: 'power3.out', stagger: .05 });
}

/* ---------- scroll sections ---------- */
function setupScroll() {
  /* name drifts up while leaving the first screen */
  gsap.to('#name', { y: '-20vh', ease: 'none', scrollTrigger: { trigger: '.intro', start: 'top top', end: 'bottom top', scrub: 1 } });

  /* 2. philosophy spotlight */
  const ph = $('#phtext'); let o = 0, ot = 0, x = 0, y = 0, tx = 0, ty = 0, inside = false;
  const upd = () => { o = lerp(o, ot, .05); x = lerp(x, tx, .05); y = lerp(y, ty, .05);
    ph.style.setProperty('--o', o); ph.style.setProperty('--x', x + 'px'); ph.style.setProperty('--y', y + 'px'); };
  gsap.ticker.add(upd);
  const track = (cx, cy) => { const r = ph.getBoundingClientRect(); inside = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    ot = inside ? 1 : 0; if (inside) { tx = cx - r.left; ty = cy - r.top; } };
  let lx = 0, ly = 0;
  addEventListener('mousemove', e => { lx = e.clientX; ly = e.clientY; track(lx, ly); });
  lenis.on('scroll', () => track(lx, ly));

  /* 3. fly-through: cards fly toward the camera, rings orbit */
  const shots13 = [['c01','Nodmax'],['c02','Harbor Guard'],['c03','Nightowl'],['c04','Galaxy India'],['c05','Nodmax'],['c06','Harbor Guard'],['c07','Nightowl'],['c08','Galaxy India'],['c09','Nodmax'],['c10','Concept'],['c11','Nodmax'],['c12','Nightowl'],['c13','Galaxy India']];
  const cardsEl = $('#cards');
  shots13.forEach(([f, n]) => { const d = document.createElement('div'); d.className = 'card';
    d.innerHTML = `<img src="${f}.jpg" alt="${n} website design" draggable="false"><em>${n}</em>`; cardsEl.append(d); });
  const cards = $$('.card');
  const W = innerWidth, H = innerHeight;
  const dirs = [[1.3,.7],[-1.5,1],[1.1,-1.3],[-1.7,-.8],[.8,1.5],[-1,-1.4],[1.6,.3],[-.7,1.7],[1.2,-1.6],[-1.4,.9],[1.8,-.5],[-1.1,-1.8],[.9,1.8]];
  const end = dirs.map(d => ({ x: d[0] * W * 1.2, y: d[1] * H * 1.2, z: 2000, s: 2 }));
  ScrollTrigger.create({ trigger: '#fly', start: 'top top', end: 'bottom bottom', scrub: .5,
    onUpdate: st => { const p = st.progress;
      cards.forEach((c, i) => { const a = i / (cards.length - 1) * .6, s = clamp((p - a) / .4), e = end[i];
        gsap.set(c, { x: e.x * s, y: e.y * s, z: lerp(-1000, e.z, s), scale: lerp(.01, e.s, s), opacity: s > 0 ? 1 : .001, rotationY: 5 * s * (i % 2 ? 1 : -1), rotationX: 2 * s * (i % 3 ? 1 : -1), force3D: true }); }); } });
  $$('.ring').forEach((r, i) => { const b = [0, 120, 240][i]; gsap.set(r, { rotation: b });
    gsap.to(r, { rotation: b + 720, ease: 'none', scrollTrigger: { trigger: '#fly', start: 'top bottom', end: 'bottom bottom', scrub: .5 } }); });
  const ft = $$('#flytitle > div');
  gsap.set('#flytitle', { rotationX: 90, y: '-50vh', scale: .4, opacity: 0, filter: 'blur(16px)', transformOrigin: 'center top' });
  ScrollTrigger.create({ trigger: '#fly', start: 'top 50%',
    onEnter: () => gsap.to('#flytitle', { rotationX: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }),
    onLeaveBack: () => gsap.to('#flytitle', { rotationX: 90, y: '-50vh', scale: .4, opacity: 0, filter: 'blur(16px)', duration: 1.5, ease: 'power2.out' }) });

  /* 4. marquee that reacts to scroll speed */
  ['#m1', '#m2'].forEach(id => { const t = $(id); t.innerHTML = Array(20).fill(`<span>${t.dataset.word}</span><u></u>`).join(''); });
  let off = 0, last = 0;
  lenis.on('scroll', ({ scroll }) => { off += (scroll - last) * .2; last = scroll;
    $('#m1').style.transform = `translateX(calc(-20% + ${off}px))`;
    $('#m2').style.transform = `translateX(calc(-1% - ${off}px))`; });

  /* 5. client list: build the hover marquee */
  const grads = ['ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5'];
  $$('.lrow').forEach((r, k) => { const n = r.dataset.name;
    const img = r.dataset.img;
    r.querySelector('.lmarq').innerHTML = Array(20).fill(0).map((_, i) => `<b>${n}</b><div class="pill ${img ? '' : grads[(i + k) % 5]}" ${img ? `style="background-image:url(${img})"` : ''}></div>`).join(''); });

  /* 6. works: pill expands, scroll drives the slideshow, then curtain lifts */
  const clip = $('#stageclip');
  const pill = { t: 40, s: 12, r: 999 };
  const setClip = () => clip.style.clipPath = `inset(${pill.t}% ${pill.s}% ${pill.t}% ${pill.s}% round ${pill.r}px)`;
  setClip();
  gsap.to(pill, { t: 0, s: 0, r: 0, ease: 'power2.inOut', onUpdate: setClip,
    scrollTrigger: { trigger: '#works', start: 'top 80%', end: 'top top', scrub: 1 } });

  const slides = $$('.slide'), caps = $$('.cap'), bars = $$('#bars u'), N = slides.length; let curIdx = 0;
  /* each laptop "browses" its site on its own: hero -> a few sections -> back to the hero, on a loop.
     The loop restarts from the hero every time its slide comes on screen. */
  const loops = slides.map(s => {
    const imgs = $$('img.pg', s); if (!imgs.length) return null;
    const stops = [0, .3, .6, 1, .6, .3, 0], tl = gsap.timeline({ repeat: -1, paused: true, repeatDelay: .6 });
    tl.to({}, { duration: 1.4 }); // rest on the hero first
    stops.forEach((f, k) => { if (!k) return;
      tl.to(imgs, { y: (i, el) => -f * Math.max(0, el.offsetHeight - el.parentElement.clientHeight), duration: k === 3 ? 2.6 : 2.2, ease: 'power2.inOut' })
        .to({}, { duration: k === 6 ? 0 : 1.1 }); });
    return tl; });
  const playLoop = i => { loops.forEach((t, k) => { if (!t) return; if (k === i) { t.invalidate().restart(); } else t.pause(0); }); };
  playLoop(0);
  /* S-wave transition: time-based, never stuck halfway. Scroll only decides WHICH project is current;
     the wave then sweeps up on its own and finishes completely, like the reference. */
  const wave = slides.map(() => ({ p: 0 }));
  const drawSlide = i => {
    const p = wave[i].p, s = slides[i], off = 14, W = 7, env = Math.min(1, Math.sin(p * Math.PI) * 1.4);
    const base = 100 + off - p * (100 + 2 * off); let pts = '';
    for (let x = 0; x <= 100; x += 4) pts += `${x}% ${(base + W * env * Math.sin(x / 100 * Math.PI * 1.15 + p * 2.2)).toFixed(2)}%,`;
    s.style.clipPath = `polygon(${pts}100% 102%,0% 102%)`;
    const mid = Math.sin(p * Math.PI), sh = 14 * mid;
    s.style.filter = mid > .03 ? `drop-shadow(${sh}px 0 0 rgba(255,0,60,.5)) drop-shadow(${-sh}px 0 0 rgba(0,220,255,.5))` : 'none';
    s.firstElementChild.style.transform = `scale(${1.2 - .2 * p})`;
  };
  slides.forEach((s, i) => { if (i) drawSlide(i); });
  let loopTimer;
  const goTo = (T, from) => {
    slides.forEach((s, i) => { if (!i) return; const target = i <= T ? 1 : 0;
      const delay = Math.abs(i - (target ? from + 1 : from)) * .16;
      gsap.to(wave[i], { p: target, duration: 1.2, delay, ease: 'power3.inOut', overwrite: true, onUpdate: () => drawSlide(i) }); });
    if (loops[from]) loops[from].pause();
    if (loopTimer) loopTimer.kill();
    loopTimer = gsap.delayedCall(1.45, () => { loops.forEach((t, k) => t && k !== T && t.pause(0)); playLoop(T); });
  };
  ScrollTrigger.create({ trigger: '#works', start: 'top top', end: 'bottom bottom',
    onUpdate: st => { const q = st.progress * N;
      bars.forEach((b, i) => b.style.transform = `scaleX(${clamp(q - i)})`);
      const idx = clamp(Math.floor(q), 0, N - 1);
      if (idx !== curIdx) { const from = curIdx; caps[curIdx].classList.remove('on'); caps[idx].classList.add('on'); curIdx = idx;
        $('#pcount').textContent = `0${idx + 1} / 0${N}`; goTo(idx, from); } } });

  /* liquid-glass VIEW cursor */
  const cur = $('#cursor'), stage = $('#stage');
  const mx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), my = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
  stage.addEventListener('mousemove', e => { mx(e.clientX); my(e.clientY); });
  stage.addEventListener('mouseenter', e => { gsap.set(cur, { x: e.clientX, y: e.clientY }); gsap.to(cur, { scale: 1, duration: .5, ease: 'power3.out' }); });
  stage.addEventListener('mouseleave', () => gsap.to(cur, { scale: 0, duration: .4 }));
  stage.addEventListener('click', () => { const h = slides[curIdx].dataset.href; if (h && h !== '#') open(h, '_blank'); });

  /* caption bar appears only once the wave has revealed the stage */
  caps[0].classList.remove('on'); // the first caption also waits for the reveal, then its text follows with a delay
  ScrollTrigger.create({ trigger: '#works', start: 'top 8%',
    onEnter: () => { stage.classList.add('live'); caps[curIdx].classList.add('on'); },
    onLeaveBack: () => { stage.classList.remove('live'); caps[curIdx].classList.remove('on'); } });
  /* curtain: the contact screen is fixed behind the live-sites section, which lifts away to reveal it */
  ScrollTrigger.create({ trigger: '#more', start: 'top bottom',
    onEnter: () => $('#contact').style.visibility = 'visible',
    onLeaveBack: () => $('#contact').style.visibility = 'hidden' });

  /* 7. contact: rolling letters */
  $$('.letters').forEach(a => { const t = a.dataset.text; a.innerHTML = [...t].map((c, i) =>
    `<span class="l" data-l="${c === ' ' ? '&nbsp;' : c}" style="transition-delay:${i * 12}ms">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); });

  ScrollTrigger.refresh();
}

/* ---------- realistic laptop scenes ----------
   If <name>.jpg contains a laptop whose screen is solid chroma green (#00FF00),
   we find the four screen corners and warp the design into it with matrix3d (true perspective).
   No green screen found -> the flat, front-on mockup stays. */
function solve8(A, b) { // gaussian elimination
  const n = 8, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let c = i + 1; c < n; c++) s -= M[i][c] * x[c]; x[i] = s / M[i][i]; }
  return x;
}
function quadMatrix(w, h, d) { // maps rect (0,0,w,h) onto quad d = [TL,TR,BR,BL] (px)
  const s = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
  s.forEach(([x, y], i) => { const [u, v] = d[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); });
  const k = solve8(A, b);
  return `matrix3d(${k[0]},${k[3]},0,${k[6]},${k[1]},${k[4]},0,${k[7]},0,0,1,0,${k[2]},${k[5]},0,1)`;
}
function detectScreen(img) { // returns normalized [TL,TR,BR,BL] or null
  const W = 480, H = Math.round(img.naturalHeight * W / img.naturalWidth);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
  let d; try { d = g.getImageData(0, 0, W, H).data; } catch (e) { return null; }
  let n = 0, tl = [1e9], tr = [-1e9], br = [-1e9], bl = [1e9];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
    if (gg > 140 && gg - r > 70 && gg - b > 70) { n++;
      const s = x + y, t = x - y;
      if (s < tl[0]) tl = [s, x, y]; if (s > br[0]) br = [s, x, y];
      if (t > tr[0]) tr = [t, x, y]; if (t < bl[0]) bl = [t, x, y]; } }
  if (n < W * H * 0.01) return null;
  return [tl, tr, br, bl].map(p => [p[1] / W, p[2] / H]);
}
const sceneState = [];
function placeFit(st) {
  const stage = $('#stage'), SW = stage.clientWidth, SH = stage.clientHeight, im = st.img;
  const sc = Math.max(SW / im.naturalWidth, SH / im.naturalHeight);
  const ox = (SW - im.naturalWidth * sc) / 2, oy = (SH - im.naturalHeight * sc) / 2;
  let q = st.quad.map(([x, y]) => [ox + x * im.naturalWidth * sc, oy + y * im.naturalHeight * sc]);
  const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
  q = q.map(([x, y]) => [cx + (x - cx) * 1.008, cy + (y - cy) * 1.008]); // cover the green fringe
  st.fit.style.transform = quadMatrix(1440, 900, q);
}
function initScenes() {
  $$('.slide').forEach((slide, i) => {
    const m = getComputedStyle(slide).getPropertyValue('--bg').match(/url\(["']?([^"')]+)/);
    if (!m) return;
    const img = new Image(); img.onload = () => {
      const quad = slide.dataset.quad ? (() => { const a = slide.dataset.quad.split(',').map(Number); return [[a[0], a[1]], [a[2], a[3]], [a[4], a[5]], [a[6], a[7]]]; })() : detectScreen(img);
      if (!quad) return;
      const st = { img, quad, fit: $('.fit', slide) }; sceneState[i] = st;
      slide.classList.add('fitted'); placeFit(st);
    };
    img.src = m[1];
  });
  addEventListener('resize', () => sceneState.forEach(st => st && placeFit(st)));
}
initScenes();

/* ---------- hero extras: client ticker + corner work preview ---------- */
const clients = ['Harbor Guard', 'Nodmax', 'Nightowl Tech', 'Uplift Digital', 'DTPX', 'Weber Shandwick']; // swap for logo <img>s later
$('#ttrack').innerHTML = [...clients, ...clients, ...clients, ...clients, ...clients, ...clients, ...clients, ...clients].map(c => `<b>${c}</b>`).join('');
/* corner card: a one-by-one swipe carousel of the four case studies */
const tiles = [['nodmax', 'Nodmax'], ['concept', 'Concept'], ['harbor', 'Harbor Guard'], ['galaxy', 'Galaxy India']];
const ccol = $('#ccol');
ccol.innerHTML = [...tiles, tiles[0]].map(([n]) => `<div style="background-image:url(${n}-l.jpg)"></div>`).join('');
$('#cdots').innerHTML = tiles.map(() => '<i></i>').join('');
let ci = 0;
const showCard = i => { $$('#cdots i').forEach((d, k) => d.classList.toggle('on', k === i)); $('#cname').textContent = tiles[i][1]; };
showCard(0);
setInterval(() => {
  if (document.body.classList.contains('is-loading')) return;
  ci++;
  gsap.to(ccol, { x: -ci * $('#corner').clientWidth, duration: .95, ease: 'power3.inOut',
    onComplete: () => { if (ci === tiles.length) { ci = 0; gsap.set(ccol, { x: 0 }); } } });
  showCard(ci % tiles.length);
}, 3400);

$('#corner').addEventListener('click', () => {
  if (document.body.classList.contains('is-loading')) return;
  const el = $('#corner'), r = el.getBoundingClientRect();
  const z = document.createElement('div'); z.className = 'zoomclone';
  z.style.backgroundImage = 'url(nodmax-l.jpg)'; // first case study, like the first slide
  Object.assign(z.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: '12px' });
  document.body.append(z);
  lenis.stop();
  gsap.timeline({ onComplete: () => { lenis.start(); z.remove(); } })
    .to(z, { left: 0, top: 0, width: '100vw', height: '100vh', borderRadius: 0, duration: 1.1, ease: 'expo.inOut' })
    .add(() => { lenis.scrollTo('#works', { immediate: true, force: true }); ScrollTrigger.update(); })
    .to(z, { opacity: 0, duration: .7, ease: 'power2.out' }, '+=0.15');
});

runLoader();
