/* ====================================================
   AMH Solutions — public-page dynamic content
   Fetches brands, services and portfolio items the admin
   has added via the dashboard, and merges them into the
   existing static markup.

   Static HTML is the fallback — if the API is unreachable,
   the page still looks right.
   ==================================================== */

(async function () {
  // ===== Sign-in dropdown toggle (header) =====
  const signinWrap = document.getElementById('navSignin');
  if (signinWrap) {
    const btn = signinWrap.querySelector('.nav-signin-btn');
    btn?.addEventListener('click', e => {
      e.stopPropagation();
      const open = signinWrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', e => {
      if (!signinWrap.contains(e.target)) {
        signinWrap.classList.remove('is-open');
        btn?.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        signinWrap.classList.remove('is-open');
        btn?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ===== Auth-aware nav =====
  try {
    const me = await fetch('/api/me').then(r => r.json()).catch(() => ({ authenticated: false }));
    if (me.authenticated) {
      // Hide the Sign-in dropdown when already signed in
      document.body.classList.add('is-authed');
      const dest = me.role === 'admin' ? '/admin/dashboard.html' : '/client/dashboard.html';
      const cta = document.querySelector('.nav-cta');
      if (cta) {
        cta.setAttribute('href', dest);
        cta.innerHTML = (me.role === 'admin' ? 'Admin →' : 'My projects →');
      }
    }
  } catch {}

  // ===== Brands wall — append admin-added brands =====
  const brandsGrids = document.querySelectorAll('.brands-logo-grid');
  if (brandsGrids.length) {
    try {
      const brands = await fetch('/api/brands').then(r => r.json());
      const existingNames = new Set();
      document.querySelectorAll('.brand-tile').forEach(t => {
        const name = t.querySelector('span:last-child')?.textContent?.trim();
        if (name) existingNames.add(name.toLowerCase());
      });
      brands.forEach(b => {
        if (existingNames.has((b.name || '').toLowerCase())) return; // already rendered statically
        brandsGrids.forEach(grid => {
          const isHome = grid.closest('.brands-home') !== null;
          if (isHome && !b.is_featured) return;
          grid.appendChild(makeBrandTile(b));
        });
      });
    } catch (e) { /* silent — static fallback */ }
  }

  // ===== Services — append admin-added services not already on page =====
  const servicesGrid = document.querySelector('.services-grid:not(.services-grid-teaser)');
  if (servicesGrid) {
    try {
      const services = await fetch('/api/services').then(r => r.json());
      const existingTitles = new Set(
        Array.from(servicesGrid.querySelectorAll('.service h3'))
          .map(h => h.textContent.trim().toLowerCase())
      );
      services.forEach((s, i) => {
        if (existingTitles.has(s.title.trim().toLowerCase())) return;
        servicesGrid.appendChild(makeServiceCard(s, existingTitles.size + i + 1));
      });
    } catch (e) {}
  }

  // ===== Portfolio — append admin-added work cards =====
  const workGrids = document.querySelectorAll('.work-grid');
  if (workGrids.length) {
    try {
      const items = await fetch('/api/portfolio').then(r => r.json());
      const existingTitles = new Set(
        Array.from(document.querySelectorAll('.work-card h3'))
          .map(h => h.firstChild?.textContent?.trim().toLowerCase())
      );
      items.forEach(item => {
        if (existingTitles.has((item.title || '').trim().toLowerCase())) return;
        workGrids.forEach(grid => grid.appendChild(makeWorkCard(item)));
      });
    } catch (e) {}
  }

  // ─── helpers ────────────────────────────────────────
  function makeBrandTile(b) {
    const tile = document.createElement(b.link ? 'a' : 'div');
    tile.className = 'brand-tile';
    if (b.link) { tile.href = b.link; tile.target = '_blank'; tile.rel = 'noopener'; }
    const logoUrl = b.domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(b.domain)}&sz=128` : '';
    tile.innerHTML = `
      <span class="brand-logo-wrap">
        ${logoUrl ? `<img src="${logoUrl}" alt="${esc(b.name)}" loading="lazy" onerror="this.classList.add('failed')" />` : ''}
        <span class="brand-mono" style="--bc:${esc(b.color || '#3B82F6')}">${esc(b.monogram || initials(b.name))}</span>
      </span>
      <span>${esc(b.name)}</span>
    `;
    return tile;
  }

  function makeServiceCard(s, num) {
    const wrap = document.createElement('article');
    wrap.className = 'service';
    wrap.innerHTML = `
      <div class="service-icon">
        ${s.icon_svg || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>'}
      </div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description || '')}</p>
      <span class="service-num">${String(num).padStart(2, '0')}</span>
    `;
    return wrap;
  }

  function makeWorkCard(item) {
    const a = document.createElement(item.url ? 'a' : 'div');
    a.className = 'work-card';
    if (item.url) { a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',') : []);
    a.innerHTML = `
      <div class="work-frame">
        <div class="frame-bar">
          <span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span>
          <div class="frame-url">${esc(shortUrl(item.url || ''))}</div>
        </div>
        <div class="frame-screen" style="background:linear-gradient(135deg,#1F2937,#0F172A);">
          ${item.image_path ? `<img loading="lazy" src="${esc(item.image_path)}" alt="${esc(item.title)}" onerror="this.style.display='none'" />` : ''}
        </div>
      </div>
      <div class="work-meta">
        <div class="work-tags">${tags.map(t => `<span>${esc(t.trim())}</span>`).join('')}</div>
        <h3>${esc(item.title)} <span class="arrow">↗</span></h3>
        <p>${esc(item.description || '')}</p>
      </div>
    `;
    return a;
  }

  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function initials(n) { return (n || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
  function shortUrl(u) { try { const x = new URL(u); return x.hostname; } catch { return u; } }
})();
