/* ====================================================
   AMH SOLUTIONS — interactions
   ==================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

/* ---------- Mobile burger ---------- */
const burger = document.getElementById('burger');
burger?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  if (!links) return;
  const visible = links.style.display === 'flex';
  links.style.display = visible ? '' : 'flex';
  links.style.position = 'absolute';
  links.style.top = '70px';
  links.style.right = '24px';
  links.style.flexDirection = 'column';
  links.style.padding = '20px 28px';
  links.style.background = 'rgba(10, 19, 48, 0.95)';
  links.style.borderRadius = '14px';
  links.style.border = '1px solid rgba(255,255,255,0.08)';
  links.style.backdropFilter = 'blur(14px)';
});

/* ---------- Hero entry (non-title elements; title handled by split-text reveal) ---------- */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.4 });
heroTl
  .from('.hero-tag', { y: 20, opacity: 0, duration: 0.7 })
  .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '+=0.45')
  .from('.hero-cta .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.45')
  .from('.hero-stats > div', { y: 30, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.35');

/* ---------- Counters ---------- */
document.querySelectorAll('.hero-stats strong').forEach(el => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
      });
    }
  });
});

/* ---------- Section reveal ---------- */
gsap.utils.toArray('.section-head, .service, .why-card, .step, .contact-form, .contact-list li, .work-card, .mkt-card, .member, .marketing-head, .case-head, .case-feature, .case-card-small, .dash-card, .brands-grid span, .brands-grid .brand-tile, .beyond-card, .tools-row').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%' },
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
  });
});

/* ---------- Service hover spotlight ---------- */
document.querySelectorAll('.service').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});

/* ---------- Contact form ---------- */
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  success.classList.add('show');
  form.reset();
  setTimeout(() => success.classList.remove('show'), 4000);
});

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
  });
});

/* ====================================================
   Background — layered WebGL fluid / aurora shader
   ==================================================== */
(function () {
  const canvas = document.getElementById('bgcanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.4) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uScroll: { value: 0 },
    // AMH palette
    uBg:     { value: new THREE.Color(0x030814) }, // near-black navy
    uBlue:   { value: new THREE.Color(0x1D4ED8) }, // deep royal
    uIndigo: { value: new THREE.Color(0x4F46E5) },
    uViolet: { value: new THREE.Color(0x7C3AED) },
    uCyan:   { value: new THREE.Color(0x22D3EE) }
  };

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Enhanced fragment shader — layered fbm + caustic streaks + light blob + grain
  const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uScroll;
    uniform vec3 uBg;
    uniform vec3 uBlue;
    uniform vec3 uIndigo;
    uniform vec3 uViolet;
    uniform vec3 uCyan;

    // Simplex noise (Ashima)
    vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * snoise(p);
        p *= 2.02;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 p = uv;
      p.x *= aspect;

      float t = uTime * 0.05;
      vec2 mouse = (uMouse - 0.5) * 0.5;

      // First warp pass
      vec2 q = vec2(
        fbm(p * 1.2 + t + mouse),
        fbm(p * 1.2 + vec2(3.4, 1.7) - t)
      );

      // Second warp using q (volumetric)
      vec2 r = vec2(
        fbm(p * 2.2 + 2.6 * q + vec2(1.2, 9.2) + t * 1.4),
        fbm(p * 2.2 + 2.6 * q + vec2(8.3, 2.8) + t * 1.7)
      );

      float n = fbm(p * 1.6 + 3.0 * r);
      n = clamp(n * 0.5 + 0.5, 0.0, 1.0);

      // Aurora bands — sine-modulated, scroll & noise driven
      float band = sin(p.y * 3.0 + n * 5.0 + uScroll * 1.2) * 0.5 + 0.5;
      float ribbon = smoothstep(0.4, 0.95, band * (0.5 + n));

      // Layered color ramp
      vec3 col = uBg;
      col = mix(col, uBlue,   smoothstep(0.05, 0.55, n));
      col = mix(col, uIndigo, smoothstep(0.35, 0.78, n) * 0.85);
      col = mix(col, uViolet, smoothstep(0.62, 0.92, n) * 0.55);
      col = mix(col, uCyan,   ribbon * 0.18);

      // Bright caustic streaks at high noise values
      float streak = smoothstep(0.82, 0.97, n);
      col += uCyan * streak * 0.35;
      col += uIndigo * pow(streak, 2.0) * 0.4;

      // Mouse-following soft light blob
      vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
      float dm = distance(p, mp);
      float blob = smoothstep(0.55, 0.0, dm);
      col += uBlue * blob * 0.18;
      col += uCyan * smoothstep(0.18, 0.0, dm) * 0.22;

      // Top-down depth — keep top darker so nav reads, bottom slightly richer
      col *= 0.78 + 0.35 * (1.0 - uv.y);

      // Soft vignette
      float vd = distance(uv, vec2(0.5, 0.55));
      col *= smoothstep(1.05, 0.25, vd);

      // Very gentle filmic crush for richer blacks
      col = col / (col + vec3(0.85));
      col = pow(col, vec3(0.92));

      // Subtle in-shader grain (CSS layer adds the rest)
      float g = (fract(sin(dot(uv, vec2(12.9898, 78.233)) + uTime * 0.7) * 43758.5453) - 0.5) * 0.025;
      col += g;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let target = { x: 0.5, y: 0.4 };
  document.addEventListener('mousemove', (e) => {
    target.x = e.clientX / window.innerWidth;
    target.y = 1 - (e.clientY / window.innerHeight);
  }, { passive: true });

  let scroll = 0;
  window.addEventListener('scroll', () => {
    scroll = window.scrollY / Math.max(window.innerHeight, 1);
  }, { passive: true });

  const clock = new THREE.Clock();
  let started = false;
  function tick() {
    const dt = clock.getDelta();
    uniforms.uTime.value += reduced ? dt * 0.15 : dt;
    uniforms.uMouse.value.x += (target.x - uniforms.uMouse.value.x) * 0.045;
    uniforms.uMouse.value.y += (target.y - uniforms.uMouse.value.y) * 0.045;
    uniforms.uScroll.value += (scroll - uniforms.uScroll.value) * 0.08;
    renderer.render(scene, camera);
    if (!started) { started = true; canvas.classList.add('is-ready'); }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ====================================================
   1) LENIS SMOOTH SCROLL — buttery scrolling (Linear/Vercel/Stripe)
   ==================================================== */
(function () {
  if (typeof Lenis === 'undefined') return;
  // Tuned for Linear/Vercel-grade feel: low lerp, longer momentum, mouse + touch both smoothed
  const lenis = new Lenis({
    lerp: 0.075,             // lower = silkier inertia (sweet spot between glide and lag)
    duration: 1.4,           // anchor / programmatic scroll length
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // exponential ease-out — Linear-style
    smoothWheel: true,
    syncTouch: true,         // unify trackpad + touch into a single smoothed pipeline
    syncTouchLerp: 0.12,
    wheelMultiplier: 0.85,   // slightly softer wheel response
    touchMultiplier: 1.5,
    infinite: false
  });
  window.__lenis = lenis;

  // Keep ScrollTrigger in sync on every scroll tick
  lenis.on('scroll', () => { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update(); });

  // Drive Lenis off GSAP's RAF for a single sync loop
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length) lenis.scrollTo(value, { immediate: true });
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        }
      });
      ScrollTrigger.defaults({ scroller: document.body });
      ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    }
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // Anchor links — use Lenis for buttery smooth jumps
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.6 });
    });
  });

  // Reset Lenis position after page transitions (e.g., back nav)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) lenis.scrollTo(0, { immediate: true });
  });
})();

/* ====================================================
   2) CUSTOM CURSOR — magnetic dot + ring (Awwwards staple)
   ==================================================== */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('has-custom-cursor');

  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }, { passive: true });

  (function tickCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(tickCursor);
  })();

  const hoverables = 'a, button, .work-card, .service, .case-card, .mkt-card, .member, input, select, textarea, label';
  function bind(el) {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('is-hover');
      ring.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover');
    });
  }
  document.querySelectorAll(hoverables).forEach(bind);

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '';
    ring.style.opacity = '';
  });
})();

/* ====================================================
   3) PAGE TRANSITION OVERLAY — curtain wipe (Vercel/agency)
   ==================================================== */
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  // Reveal on page load — the overlay drops down out of view
  requestAnimationFrame(() => {
    overlay.classList.add('is-revealing');
    setTimeout(() => overlay.classList.remove('is-revealing'), 800);
  });

  // Cover-and-navigate on internal link clicks
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    let u;
    try { u = new URL(href, window.location.href); } catch { return; }
    if (u.hostname !== window.location.hostname) return;
    if (a.target === '_blank') return;
    if (u.pathname === window.location.pathname && (u.hash || u.search === window.location.search)) return;

    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      overlay.classList.remove('is-revealing');
      overlay.classList.add('is-covering');
      setTimeout(() => { window.location.href = href; }, 620);
    });
  });
})();

/* ====================================================
   4) SPLIT-TEXT REVEAL — char-by-char hero/page-hero (Apple/Stripe)
   ==================================================== */
(function () {
  // Recursive: split plain text into per-char spans, but treat .grad / .grad-2
  // gradient words as atomic units (preserves -webkit-background-clip: text).
  function splitInto(el, counter) {
    const kids = [...el.childNodes];
    kids.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.replace(/\s/g, '').length) return;
        const frag = document.createDocumentFragment();
        const words = text.split(/(\s+)/);
        words.forEach(word => {
          if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
          if (!word.length) return;
          const ws = document.createElement('span');
          ws.className = 'split-word';
          for (const ch of word) {
            const cs = document.createElement('span');
            cs.className = 'split-char';
            cs.style.setProperty('--i', counter.i++);
            cs.textContent = ch;
            ws.appendChild(cs);
          }
          frag.appendChild(ws);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Atomic: treat gradient text spans as one revealable unit
        if (node.classList && (node.classList.contains('grad') || node.classList.contains('grad-2'))) {
          const ws = document.createElement('span');
          ws.className = 'split-word';
          node.classList.add('split-char');
          node.style.setProperty('--i', counter.i++);
          node.parentNode.insertBefore(ws, node);
          ws.appendChild(node);
        } else if (node.tagName !== 'BR' && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
          splitInto(node, counter);
        }
      }
    });
  }

  const heroTargets = document.querySelectorAll('.hero-title, .page-hero-title, .port-hero-title');
  heroTargets.forEach(t => splitInto(t, { i: 0 }));
  // Hero titles reveal immediately (no scroll needed)
  setTimeout(() => heroTargets.forEach(el => el.classList.add('is-revealed')), 480);

  // Section headings — split + scroll-trigger reveal
  const scrollTargets = document.querySelectorAll(
    '.section-head h2, .section-head h3, .marketing-head h3, .case-head h3, ' +
    '.why-left h2, .contact-left h2, .port-cta h2, .home-cta h2, ' +
    '.personality-left h2'
  );
  scrollTargets.forEach(el => {
    // Skip if already inside a hero we already split
    if (el.closest('.hero, .page-hero, .port-hero')) return;
    splitInto(el, { i: 0 });
    el.classList.add('split-on-scroll');
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('is-revealed')
      });
    } else {
      // Fallback: IntersectionObserver
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            el.classList.add('is-revealed');
            obs.unobserve(el);
          }
        });
      }, { rootMargin: '0px 0px -15% 0px' });
      io.observe(el);
    }
  });
})();

/* ====================================================
   5) MAGNETIC BUTTONS — primary CTAs follow cursor (Awwwards)
   ==================================================== */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    const strength = btn.classList.contains('nav-cta') ? 0.18 : 0.3;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      btn.style.setProperty('--mx', x + 'px');
      btn.style.setProperty('--my', y + 'px');
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
})();

/* ====================================================
   Bonus: marquee speed reactive on hover
   ==================================================== */
(function () {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const marquee = track.closest('.marquee');
  marquee?.addEventListener('mouseenter', () => track.style.animationDuration = '18s');
  marquee?.addEventListener('mouseleave', () => track.style.animationDuration = '');
})();
