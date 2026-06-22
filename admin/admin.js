/* ====================================================
   AMH Solutions — Admin dashboard logic
   ==================================================== */

const api = {
  async get(url) { const r = await fetch(url); if (!r.ok) throw new Error(`GET ${url} → ${r.status}`); return r.json(); },
  async json(method, url, body) {
    const r = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const j = r.headers.get('content-type')?.includes('json') ? await r.json() : null;
    if (!r.ok) throw new Error(j?.error || `${method} ${url} → ${r.status}`);
    return j;
  },
  async upload(file) {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'upload failed'); return j;
  },
};

// ============ Who am I + logout ============
(async () => {
  try {
    const me = await api.get('/api/me');
    if (!me.authenticated || me.role !== 'admin') { window.location.href = '/admin/login.html'; return; }
    document.getElementById('adminWho').textContent = me.email;
  } catch { window.location.href = '/admin/login.html'; }
})();
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST' });
  window.location.href = '/';
});

// ============ Tabs ============
const tabs = document.querySelectorAll('.admin-tabs button');
const panes = document.querySelectorAll('.admin-pane');
tabs.forEach(b => b.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('is-active', x === b));
  const which = b.dataset.tab;
  panes.forEach(p => p.classList.toggle('is-active', p.dataset.pane === which));
}));

// ============ Modals ============
function openModal(id) { document.getElementById(id).classList.add('is-open'); }
function closeModal(el) {
  el.closest('.modal-shell')?.classList.remove('is-open');
  el.closest('.modal-shell')?.querySelector('form')?.reset();
  el.closest('.modal-shell')?.querySelector('input[name="id"]')?.removeAttribute('value');
}
document.addEventListener('click', e => {
  if (e.target.dataset.open) { openModal(e.target.dataset.open); }
  if (e.target.dataset.close !== undefined) { closeModal(e.target); }
  if (e.target.classList?.contains('modal-shell')) { closeModal(e.target); }
});

// ============ Brands ============
async function loadBrands() {
  const rows = await api.get('/api/admin/brands');
  const tbody = document.querySelector('#brandsTable tbody');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="9" class="admin-empty">No brands yet — add the first one.</td></tr>`; return; }
  tbody.innerHTML = rows.map(b => `
    <tr data-id="${b.id}">
      <td class="tight">${b.display_order}</td>
      <td class="tight">
        <span class="logo-cell">
          ${b.domain ? `<img src="https://www.google.com/s2/favicons?domain=${b.domain}&sz=64" alt="" onerror="this.style.display='none'" />` : ''}
        </span>
      </td>
      <td>${escape(b.name)}</td>
      <td><code>${escape(b.domain || '—')}</code></td>
      <td>${escape(b.monogram || '')}</td>
      <td>${b.link ? `<a href="${b.link}" target="_blank" rel="noopener">↗</a>` : '—'}</td>
      <td>${b.is_featured ? '★' : '—'}</td>
      <td>${b.is_active ? '✓' : '—'}</td>
      <td class="tight"><div class="row-actions">
        <button data-edit="brand">Edit</button>
        <button data-del="brand" class="danger">Delete</button>
      </div></td>
    </tr>
  `).join('');
  // Cache so edit can re-populate
  window.__brands = Object.fromEntries(rows.map(r => [r.id, r]));
}

function fillForm(form, data) {
  Object.entries(data).forEach(([k, v]) => {
    const el = form.elements.namedItem(k);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!v;
    else el.value = v ?? '';
  });
}
function readForm(form) {
  const data = {};
  Array.from(form.elements).forEach(el => {
    if (!el.name) return;
    if (el.type === 'checkbox') data[el.name] = el.checked;
    else if (el.type === 'number') data[el.name] = el.value === '' ? null : Number(el.value);
    else data[el.name] = el.value || null;
  });
  return data;
}

document.addEventListener('submit', async e => {
  const form = e.target;
  const type = form.dataset.form;
  if (!type) return;
  e.preventDefault();
  const data = readForm(form);
  const id = data.id;
  delete data.id;
  try {
    if (type === 'brand') {
      if (id) await api.json('PUT', `/api/admin/brands/${id}`, data);
      else    await api.json('POST', '/api/admin/brands', data);
      await loadBrands();
    } else if (type === 'service') {
      if (id) await api.json('PUT', `/api/admin/services/${id}`, data);
      else    await api.json('POST', '/api/admin/services', data);
      await loadServices();
    } else if (type === 'portfolio') {
      if (id) await api.json('PUT', `/api/admin/portfolio/${id}`, data);
      else    await api.json('POST', '/api/admin/portfolio', data);
      await loadPortfolio();
    } else if (type === 'client') {
      const note = document.getElementById('clientNote');
      note.style.display = 'none';
      if (id) {
        await api.json('PUT', `/api/admin/clients/${id}`, data);
      } else {
        const r = await api.json('POST', '/api/admin/clients', data);
        if (r.password) {
          note.textContent = `Client created. Auto-password: ${r.password}  — share it securely. ✓`;
          note.style.display = 'block';
        }
      }
      await loadClients();
    } else if (type === 'project') {
      if (id) await api.json('PUT', `/api/admin/projects/${id}`, data);
      else    await api.json('POST', '/api/admin/projects', data);
      await loadProjects();
    }
    // Close modal after a brief delay so messages can read
    setTimeout(() => closeModal(form), type === 'client' ? 2400 : 200);
  } catch (err) {
    alert(err.message);
  }
});

document.addEventListener('click', async e => {
  const ed = e.target.dataset?.edit;
  const del = e.target.dataset?.del;
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = Number(tr.dataset.id);

  if (ed === 'brand') {
    const b = window.__brands[id];
    const form = document.querySelector('[data-form="brand"]');
    fillForm(form, b);
    document.getElementById('brandModalTitle').textContent = 'Edit brand';
    openModal('brandModal');
  } else if (del === 'brand') {
    if (!confirm('Delete this brand?')) return;
    await api.json('DELETE', `/api/admin/brands/${id}`);
    await loadBrands();
  }
  if (ed === 'service') {
    const s = window.__services[id];
    const form = document.querySelector('[data-form="service"]');
    fillForm(form, s);
    document.getElementById('serviceModalTitle').textContent = 'Edit service';
    openModal('serviceModal');
  } else if (del === 'service') {
    if (!confirm('Delete this service?')) return;
    await api.json('DELETE', `/api/admin/services/${id}`);
    await loadServices();
  }
  if (ed === 'portfolio') {
    const p = window.__portfolio[id];
    const form = document.querySelector('[data-form="portfolio"]');
    fillForm(form, p);
    document.getElementById('portfolioModalTitle').textContent = 'Edit item';
    openModal('portfolioModal');
  } else if (del === 'portfolio') {
    if (!confirm('Delete this portfolio item?')) return;
    await api.json('DELETE', `/api/admin/portfolio/${id}`);
    await loadPortfolio();
  }
  if (ed === 'client') {
    const c = window.__clients[id];
    const form = document.querySelector('[data-form="client"]');
    fillForm(form, c);
    form.elements.password.value = '';
    document.getElementById('clientModalTitle').textContent = 'Edit client';
    openModal('clientModal');
  } else if (del === 'client') {
    if (!confirm('Delete this client and ALL their projects?')) return;
    await api.json('DELETE', `/api/admin/clients/${id}`);
    await loadClients(); await loadProjects();
  }
  if (ed === 'project') {
    const p = window.__projects[id];
    const form = document.querySelector('[data-form="project"]');
    fillForm(form, p);
    document.getElementById('projectModalTitle').textContent = 'Edit project';
    openModal('projectModal');
  } else if (del === 'project') {
    if (!confirm('Delete this project?')) return;
    await api.json('DELETE', `/api/admin/projects/${id}`);
    await loadProjects();
  }
});

// ============ Services ============
async function loadServices() {
  const rows = await api.get('/api/admin/services');
  const tbody = document.querySelector('#servicesTable tbody');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="5" class="admin-empty">No services yet — add the first one.</td></tr>`; return; }
  tbody.innerHTML = rows.map(s => `
    <tr data-id="${s.id}">
      <td class="tight">${s.display_order}</td>
      <td>${escape(s.title)}</td>
      <td>${escape((s.description || '').slice(0, 110))}${s.description && s.description.length > 110 ? '…' : ''}</td>
      <td>${s.is_active ? '✓' : '—'}</td>
      <td class="tight"><div class="row-actions">
        <button data-edit="service">Edit</button>
        <button data-del="service" class="danger">Delete</button>
      </div></td>
    </tr>
  `).join('');
  window.__services = Object.fromEntries(rows.map(r => [r.id, r]));
}

// ============ Portfolio ============
async function loadPortfolio() {
  const rows = await api.get('/api/admin/portfolio');
  const tbody = document.querySelector('#portfolioTable tbody');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="7" class="admin-empty">No items yet — add the first one.</td></tr>`; return; }
  tbody.innerHTML = rows.map(p => `
    <tr data-id="${p.id}">
      <td class="tight">${p.display_order}</td>
      <td class="tight"><span class="logo-cell">${p.image_path ? `<img src="${escape(p.image_path)}" alt="" onerror="this.style.display='none'" />` : ''}</span></td>
      <td>${escape(p.title)}</td>
      <td>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener"><code>${escape(shortUrl(p.url))}</code></a>` : '—'}</td>
      <td>${escape(p.category || '—')}</td>
      <td>${p.is_active ? '✓' : '—'}</td>
      <td class="tight"><div class="row-actions">
        <button data-edit="portfolio">Edit</button>
        <button data-del="portfolio" class="danger">Delete</button>
      </div></td>
    </tr>
  `).join('');
  window.__portfolio = Object.fromEntries(rows.map(r => [r.id, r]));
}

// Hook portfolio image file upload
document.getElementById('portfolioImageFile')?.addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const r = await api.upload(f);
    const form = e.target.closest('form');
    form.elements.image_path.value = r.url;
  } catch (err) { alert('Upload failed: ' + err.message); }
});
document.getElementById('projectCoverFile')?.addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const r = await api.upload(f);
    const form = e.target.closest('form');
    form.elements.cover_image.value = r.url;
  } catch (err) { alert('Upload failed: ' + err.message); }
});

// ============ Clients ============
async function loadClients() {
  const rows = await api.get('/api/admin/clients');
  const tbody = document.querySelector('#clientsTable tbody');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="admin-empty">No clients yet.</td></tr>`; return; }
  tbody.innerHTML = rows.map(c => `
    <tr data-id="${c.id}">
      <td class="tight">${c.id}</td>
      <td><code>${escape(c.email)}</code></td>
      <td>${escape(c.full_name || '—')}</td>
      <td>${escape(c.company_name || '—')}</td>
      <td class="tight">${c.created_at?.split(' ')[0] || ''}</td>
      <td class="tight"><div class="row-actions">
        <button data-edit="client">Edit</button>
        <button data-del="client" class="danger">Delete</button>
      </div></td>
    </tr>
  `).join('');
  window.__clients = Object.fromEntries(rows.map(r => [r.id, r]));
  // Also populate project client select
  const sel = document.getElementById('projectClientSelect');
  if (sel) {
    sel.innerHTML = rows.map(c => `<option value="${c.id}">${escape(c.company_name || c.full_name || c.email)} — ${escape(c.email)}</option>`).join('');
  }
}

// ============ Projects ============
async function loadProjects() {
  const rows = await api.get('/api/admin/projects');
  const tbody = document.querySelector('#projectsTable tbody');
  if (!rows.length) { tbody.innerHTML = `<tr><td colspan="6" class="admin-empty">No projects yet.</td></tr>`; return; }
  tbody.innerHTML = rows.map(p => `
    <tr data-id="${p.id}">
      <td><strong>${escape(p.client_company || p.client_name || p.client_email)}</strong><br /><small style="color:var(--text-mute)">${escape(p.client_email)}</small></td>
      <td><strong>${escape(p.title)}</strong>${p.description ? `<br /><small style="color:var(--text-dim)">${escape(p.description.slice(0,90))}${p.description.length>90?'…':''}</small>` : ''}</td>
      <td class="tight"><span class="status-pill ${p.status}">${p.status.replace('_',' ')}</span></td>
      <td class="tight">${p.progress_percent}%</td>
      <td class="tight"><small style="color:var(--text-mute)">${p.start_date || '—'}<br />→ ${p.completed_date || p.expected_end_date || '—'}</small></td>
      <td class="tight"><div class="row-actions">
        <button data-edit="project">Edit</button>
        <button data-del="project" class="danger">Delete</button>
      </div></td>
    </tr>
  `).join('');
  window.__projects = Object.fromEntries(rows.map(r => [r.id, r]));
}

// ============ Helpers ============
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function shortUrl(u) {
  try { const x = new URL(u); return x.hostname + (x.pathname === '/' ? '' : x.pathname.slice(0, 24)); }
  catch { return u; }
}

// ============ Boot ============
(async () => {
  await Promise.all([loadBrands(), loadServices(), loadPortfolio(), loadClients()]);
  await loadProjects();   // projects depend on clients dropdown
})();
