const REF_PER_PAGE = 7;
const META_URL = new URL('referencias-meta.json', window.location.href).href;

let refPage = parseInt(new URLSearchParams(location.search).get('page') || '1', 10);
let refItems = [];

function getRefItems() {
  return [...document.querySelectorAll('#referencesGrid [data-ref-item]')];
}

function targetFromHash() {
  if (!location.hash || location.hash === '#referencesGrid') return null;
  try {
    const id = decodeURIComponent(location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  } catch (_) {
    return null;
  }
}

function pageForHash() {
  const target = targetFromHash();
  if (!target) return null;
  const index = refItems.indexOf(target);
  return index >= 0 ? Math.floor(index / REF_PER_PAGE) + 1 : null;
}

function syncPageFromHash() {
  const hashPage = pageForHash();
  if (hashPage !== null) refPage = hashPage;
}

function renderRefs() {
  refItems = getRefItems();
  const total = Math.max(1, Math.ceil(refItems.length / REF_PER_PAGE));
  refPage = Math.min(Math.max(refPage, 1), total);
  refItems.forEach((el, i) => {
    el.style.display = (i >= (refPage - 1) * REF_PER_PAGE && i < refPage * REF_PER_PAGE) ? 'block' : 'none';
  });

  let h = `<button class="page-btn" ${refPage === 1 ? 'disabled' : ''} data-ta-action="go-ref" data-page="${refPage - 1}">←</button>`;
  for (let i = 1; i <= total; i++) {
    h += `<button class="page-btn${i === refPage ? ' active' : ''}" data-ta-action="go-ref" data-page="${i}">${i}</button>`;
  }
  h += `<button class="page-btn" ${refPage === total ? 'disabled' : ''} data-ta-action="go-ref" data-page="${refPage + 1}">→</button>`;
  const pag = document.getElementById('referencesPagination');
  if (pag) pag.innerHTML = h;
}

function scrollToCurrentHash() {
  const target = targetFromHash();
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function goRef(n) {
  refItems = getRefItems();
  const total = Math.max(1, Math.ceil(refItems.length / REF_PER_PAGE));
  if (n < 1 || n > total) return;
  refPage = n;
  const u = new URL(location.href);
  n === 1 ? u.searchParams.delete('page') : u.searchParams.set('page', n);
  history.pushState({ refPage: n }, '', u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : '') + '#referencesGrid');
  renderRefs();
  requestAnimationFrame(() => document.getElementById('referencesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function toggleZoom(el) {
  if (el.classList.contains('zoomed')) {
    el.classList.remove('zoomed');
    document.querySelector('.zoom-overlay')?.classList.remove('active');
  } else {
    document.querySelectorAll('.reference-diagram.zoomed').forEach(x => x.classList.remove('zoomed'));
    el.classList.add('zoomed');
    let o = document.querySelector('.zoom-overlay');
    if (!o) {
      o = document.createElement('div');
      o.className = 'zoom-overlay';
      o.onclick = () => {
        document.querySelectorAll('.reference-diagram.zoomed').forEach(x => x.classList.remove('zoomed'));
        o.classList.remove('active');
      };
      document.body.appendChild(o);
    }
    o.classList.add('active');
  }
}

/** Aplica orden y etiqueta NUEVO desde referencias-meta.json */
function applyMeta(meta) {
  const grid = document.getElementById('referencesGrid');
  if (!grid || !meta || !Array.isArray(meta.items)) return;

  const byId = new Map();
  getRefItems().forEach(el => {
    if (el.id) byId.set(el.id, el);
  });

  // Ordenar según JSON (order asc); ítems no listados al final.
  // Map evita claves especiales como __proto__ en metadatos externos.
  const sorted = [...meta.items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const orderedIds = [];
  sorted.forEach(item => {
    if (item.id && byId.has(item.id)) orderedIds.push(item.id);
  });
  byId.forEach((_, id) => {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  });

  orderedIds.forEach(id => {
    const el = byId.get(id);
    if (el) grid.appendChild(el);
  });

  // Badges NUEVO
  const nuevoSet = new Set(
    meta.items.filter(i => i.nuevo === true).map(i => i.id)
  );

  getRefItems().forEach(el => {
    const series = el.querySelector('.reference-series');
    if (!series) return;

    // Quitar badge previo
    series.querySelectorAll('.badge-nuevo').forEach(b => b.remove());
    el.removeAttribute('data-nuevo');

    if (nuevoSet.has(el.id)) {
      el.setAttribute('data-nuevo', 'true');
      const badge = document.createElement('span');
      badge.className = 'badge-nuevo';
      badge.textContent = 'NUEVO';
      series.appendChild(badge);
    }
  });
}

async function initReferences() {
  try {
    const res = await fetch(META_URL, { cache: 'no-cache' });
    if (res.ok) {
      const meta = await res.json();
      applyMeta(meta);
    } else {
      console.warn('referencias-meta.json no disponible:', res.status);
    }
  } catch (err) {
    console.warn('No se pudo cargar referencias-meta.json (¿misma carpeta y servidor HTTP?):', err);
  }

  refItems = getRefItems();
  syncPageFromHash();
  renderRefs();
  scrollToCurrentHash();
}

initReferences();

window.addEventListener('popstate', () => {
  refPage = parseInt(new URLSearchParams(location.search).get('page') || '1', 10);
  refItems = getRefItems();
  syncPageFromHash();
  renderRefs();
  if (location.hash && location.hash !== '#referencesGrid') {
    scrollToCurrentHash();
  } else {
    requestAnimationFrame(() => document.getElementById('referencesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
});
