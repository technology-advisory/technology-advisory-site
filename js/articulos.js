
function taParseArticleDate(value){
  if(!value) return 0;
  const months={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11};
  const clean=String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const match=clean.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if(match && months[match[2]]!==undefined){
    return new Date(Number(match[3]),months[match[2]],Number(match[1])).getTime();
  }
  const parsed=Date.parse(value);
  return Number.isNaN(parsed)?0:parsed;
}

// ==============================
// ARTÍCULOS - LÓGICA COMPARTIDA
// ==============================

let articulosData = [];
let currentCategory = "all";
let currentPage = 1;
let sortMode = "newest";
const PER_PAGE = 7;
let currentJsonPath = null;
let articlesLoading = false;
const TA_LIST_STATE_KEY = `ta:list:${window.location.pathname}`;

// Controlamos la restauración nosotros para que el BFCache no deje el listado a medio pintar.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

function saveListState() {
    try {
        sessionStorage.setItem(TA_LIST_STATE_KEY, JSON.stringify({
            url: window.location.href,
            scrollY: window.scrollY || 0,
            ts: Date.now()
        }));
    } catch (_) {}
}

function restoreListScroll() {
    try {
        const raw = sessionStorage.getItem(TA_LIST_STATE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (!state || state.url !== window.location.href) return;
        // Esperar a que DOM, imágenes y rejilla hayan recuperado su altura real.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            window.scrollTo(0, Number(state.scrollY) || 0);
        }));
    } catch (_) {}
}

function goToArticle(url) {
    saveListState();
    window.location.href = url;
}


// ==============================
// PARSEAR FECHA EN ESPAÑOL
// ==============================
function parseSpanishDate(text) {
    const months = {
        enero: 0, febrero: 1, marzo: 2, abril: 3,
        mayo: 4, junio: 5, julio: 6, agosto: 7,
        septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const parts = text.toLowerCase().split(' ');
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
}

// ==============================
// LEER ESTADO DESDE LA URL
// ==============================
function getStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat') || 'all';
    const page = parseInt(params.get('page')) || 1;
    const mes = params.get('mes') || 'all';
    return { cat, page, mes };
}

// ==============================
// CONSTRUIR URL CON PARÁMETROS
// ==============================
function buildURL(cat, page, mes) {
    const params = new URLSearchParams();
    if (cat && cat !== 'all') params.set('cat', cat);
    if (page && page > 1) params.set('page', page);
    if (mes && mes !== 'all') params.set('mes', mes);
    const query = params.toString();
    return query ? window.location.pathname + '?' + query : window.location.pathname;
}

// ==============================
// NAVEGAR CON RECARGA REAL
// ==============================
function navigateTo(cat, page, mes) {
    const url = buildURL(cat, page, mes);
    window.location.href = url;
}

// ==============================
// OBTENER ARTÍCULOS FILTRADOS POR CATEGORÍA Y MES
// ==============================
function getFilteredArticles(category, month) {
    return articulosData.filter(articulo => {
        const matchCategory = category === "all" || articulo.cat === category;
        const date = parseSpanishDate(articulo.date);
        if (isNaN(date)) return matchCategory;
        const year = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const cardMonth = `${year}-${m}`;
        const matchMonth = month === "all" || cardMonth === month;
        return matchCategory && matchMonth;
    });
}

// ==============================
// POBLAR MESES (SOLO LOS QUE TIENEN ARTÍCULOS EN LA CATEGORÍA ACTUAL)
// ==============================
function poblarMeses(category) {
    const select = document.getElementById("monthFilter");
    if (!select) return;
    
    const nombresMes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const claves = new Set();
    
    // Filtrar artículos por la categoría actual
    const filtered = articulosData.filter(articulo => {
        return category === "all" || articulo.cat === category;
    });
    
    filtered.forEach(a => {
        const d = parseSpanishDate(a.date);
        if (!isNaN(d)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            claves.add(`${y}-${m}`);
        }
    });
    
    // Ordenar descendente (más reciente primero)
    const ordenadas = Array.from(claves).sort((a, b) => b.localeCompare(a));
    
    // Reconstruir el select
    select.innerHTML = '<option value="all">Mes</option>';
    ordenadas.forEach(clave => {
        const [y, m] = clave.split('-');
        const opt = document.createElement('option');
        opt.value = clave;
        opt.textContent = `${nombresMes[parseInt(m, 10) - 1]} ${y}`;
        select.appendChild(opt);
    });
    
    // Respetar únicamente un mes elegido explícitamente.
    // Por defecto, mostrar todos los meses.
    const state = getStateFromURL();

    if (state.mes && state.mes !== 'all') {
        const optionExists = Array.from(select.options).some(opt => opt.value === state.mes);

        if (optionExists) {
            select.value = state.mes;
            return;
        }
    }

    select.value = 'all';
}

// ==============================
// RENDERIZAR ARTÍCULOS
// ==============================
function renderArticles() {
    const state = getStateFromURL();
    currentCategory = state.cat;
    currentPage = state.page;
    const selectedMonth = state.mes || "all";
    
    const grid = document.getElementById("articlesGrid");
    const noResults = document.getElementById("noResults");

    // Algunos índices legacy no incluyen todos los contenedores.
    // Si no existe la rejilla principal, no hay nada que renderizar.
    if (!grid) return;

    // Obtener artículos filtrados
    let filtered = getFilteredArticles(currentCategory, selectedMonth);

    // Ordenar
    filtered.sort((a, b) => {
        const dateA = taParseArticleDate(a.date);
        const dateB = taParseArticleDate(b.date);

        if (sortMode === "newest") {
            const newA = a.nuevo === true || a.badge === 'Nuevo';
            const newB = b.nuevo === true || b.badge === 'Nuevo';

            // En "Más recientes", los marcados como Nuevo tienen prioridad.
            if (newA !== newB) return newB - newA;

            return dateB - dateA;
        }

        // En "Más antiguos", manda exclusivamente la fecha.
        return dateA - dateB;
    });

    // Paginación
    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (noResults) noResults.classList.add('show');
        renderPagination(totalPages);
        return;
    }

    if (noResults) noResults.classList.remove('show');
    grid.replaceChildren();

    pageItems.forEach(articulo => {
        const articleUrl = `/${String(articulo.url || '').replace(/^\/+/, '')}`;
        const thumbUrl = articulo.thumb ? `/${String(articulo.thumb).replace(/^\/+/, '')}` : '';
        const isNew = articulo.nuevo === true || articulo.badge === 'Nuevo';

        const card = document.createElement('article');
        card.className = 'article-card';
        card.dataset.cat = String(articulo.cat || '');
        card.dataset.articleUrl = articleUrl;

        const thumbLink = document.createElement('a');
        thumbLink.className = 'article-thumb';
        thumbLink.href = articleUrl;
        thumbLink.tabIndex = -1;
        thumbLink.setAttribute('aria-hidden', 'true');
        thumbLink.addEventListener('click', saveListState);

        if (thumbUrl) {
            const image = document.createElement('img');
            image.src = thumbUrl;
            image.alt = '';
            image.loading = 'lazy';
            thumbLink.appendChild(image);
        } else {
            const fallback = document.createElement('span');
            fallback.className = 'article-thumb-fallback';
            fallback.textContent = 'TA';
            thumbLink.appendChild(fallback);
        }

        const content = document.createElement('div');
        content.className = 'article-card-content';

        const meta = document.createElement('div');
        meta.className = 'article-meta';
        meta.textContent = String(articulo.meta || '');

        const title = document.createElement('div');
        title.className = 'article-title';
        title.appendChild(document.createTextNode(String(articulo.title || '')));
        if (isNew) {
            const badge = document.createElement('span');
            badge.className = 'article-badge';
            badge.textContent = 'Nuevo';
            title.appendChild(badge);
        }

        const desc = document.createElement('div');
        desc.className = 'article-desc';
        desc.textContent = String(articulo.desc || '');

        const footer = document.createElement('div');
        footer.className = 'article-card-footer';

        const date = document.createElement('span');
        date.className = 'article-date';
        date.textContent = String(articulo.date || '');

        const readLink = document.createElement('a');
        readLink.href = articleUrl;
        readLink.className = 'article-link';
        readLink.textContent = 'Leer artículo';
        readLink.addEventListener('click', saveListState);

        footer.append(date, readLink);
        content.append(meta, title, desc, footer);

        const saveButton = document.createElement('button');
        saveButton.className = 'article-save';
        saveButton.type = 'button';
        saveButton.setAttribute('aria-label', 'Guardar para leer después');
        saveButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
        saveButton.addEventListener('click', event => {
            event.stopPropagation();
            saveButton.classList.toggle('saved');
        });

        card.append(thumbLink, content, saveButton);
        card.addEventListener('click', event => {
            if (event.target.closest('a,button,select,input,label')) return;
            goToArticle(card.dataset.articleUrl);
        });

        grid.appendChild(card);
    });

    renderPagination(totalPages);
    restoreListScroll();
    
    // Actualizar contadores de los botones de filtro
    const counts = {};
    articulosData.forEach(articulo => {
        const cats = articulo.cat.split(' ');
        cats.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; });
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const cat = btn.dataset.filter;
        const label = btn.textContent.split(' (')[0];
        if (cat === 'all') btn.textContent = `Todo (${articulosData.length})`;
        else if (counts[cat]) btn.textContent = `${label} (${counts[cat]})`;
    });
}

function renderPagination(totalPages) {
    const pag = document.getElementById("articlesPagination");
    if (!pag) return;

    let html = '';
    html += `<button class="page-btn page-arrow" ${currentPage === 1 ? 'disabled' : ''} data-ta-action="go-article-page" data-page="${currentPage - 1}">←</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-ta-action="go-article-page" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn page-arrow" ${currentPage === totalPages ? 'disabled' : ''} data-ta-action="go-article-page" data-page="${currentPage + 1}">→</button>`;
    pag.innerHTML = html;
}

function goToPage(n) {
    const state = getStateFromURL();
    const selectedMonth = state.mes || "all";
    const filtered = getFilteredArticles(currentCategory, selectedMonth);
    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    if (n < 1 || n > totalPages) return;
    navigateTo(currentCategory, n, selectedMonth);
}

// ==============================
// FILTRAR POR CATEGORÍA
// ==============================
function filterArticles(cat, btn) {
    // Al cambiar de categoría se reinician página y mes.
    // Evita arrastrar un filtro mensual de otra categoría.
    navigateTo(cat, 1, "all");
}

// ==============================
// ORDEN (toggle)
// ==============================
function toggleSort() {
    const btn = document.getElementById("sortBtn");
    sortMode = sortMode === "newest" ? "oldest" : "newest";

    if (btn) {
        btn.innerText = sortMode === "newest"
            ? "↓ Más recientes"
            : "↑ Más antiguos";
    }

    renderArticles();
}

// ==============================
// APLICAR FILTROS (mes)
// ==============================
function applyFilters() {
    const select = document.getElementById("monthFilter");
    const mes = select ? select.value : "all";
    const state = getStateFromURL();
    navigateTo(state.cat, 1, mes);
}

// ==============================
// CARGAR DATOS DESDE JSON
// ==============================
async function cargarArticulos(jsonPath) {
    if (articlesLoading) return;
    articlesLoading = true;
    currentJsonPath = jsonPath;
    try {
        const jsonUrl = `${jsonPath}${jsonPath.includes('?') ? '&' : '?'}_=${Date.now()}`;
        const response = await fetch(jsonUrl, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} cargando ${jsonPath}`);
        }

        const todos = await response.json();

        articulosData = todos.filter(a => a.published === true);

        const totalNode = document.getElementById('total-articulos');
        if (totalNode) totalNode.textContent = `${articulosData.length} artículos`;

        // Validación estricta de parámetros. Una combinación inexistente se trata
        // como recurso inexistente y se deriva a la página 404.
        const requested = getStateFromURL();
        const allowedParams = new Set(['cat', 'page', 'mes']);
        const rawParams = new URLSearchParams(window.location.search);
        const unknownParam = Array.from(rawParams.keys()).some(key => !allowedParams.has(key));
        const categories = new Set(['all', ...articulosData.map(a => a.cat)]);
        const validCategory = categories.has(requested.cat);
        const validPageSyntax = Number.isInteger(requested.page) && requested.page >= 1;
        const validMonthSyntax = requested.mes === 'all' || /^\d{4}-(0[1-9]|1[0-2])$/.test(requested.mes);
        const categoryArticles = articulosData.filter(a => requested.cat === 'all' || a.cat === requested.cat);
        const availableMonths = new Set(categoryArticles.map(a => {
            const d = parseSpanishDate(a.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }));
        const validMonth = requested.mes === 'all' || availableMonths.has(requested.mes);
        const filteredForValidation = categoryArticles.filter(a => {
            if (requested.mes === 'all') return true;
            const d = parseSpanishDate(a.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === requested.mes;
        });
        const maxPage = Math.max(1, Math.ceil(filteredForValidation.length / PER_PAGE));
        const validPage = requested.page <= maxPage;
        if (unknownParam || !validCategory || !validPageSyntax || !validMonthSyntax || !validMonth || !validPage || filteredForValidation.length === 0) {
            window.location.replace('/404.html');
            return;
        }

        console.info(
            '[ARTICULOS]',
            `JSON=${todos.length}`,
            `publicados=${articulosData.length}`,
            `fuente=${jsonPath}`
        );

        // Siempre arrancar por los más recientes.
        sortMode = "newest";
        const btn = document.getElementById("sortBtn");
        if (btn) btn.innerText = "↓ Más recientes";

        // Leer estado desde URL
        const state = getStateFromURL();
        currentCategory = state.cat;
        currentPage = state.page;

        // Poblar meses (SOLO los de la categoría actual)
        poblarMeses(currentCategory);

        // Actualizar contadores
        const counts = {};
        articulosData.forEach(articulo => {
            const cats = articulo.cat.split(' ');
            cats.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; });
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const cat = btn.dataset.filter;
            const label = btn.textContent.split(' (')[0];
            if (cat === 'all') btn.textContent = `Todo (${articulosData.length})`;
            else if (counts[cat]) btn.textContent = `${label} (${counts[cat]})`;
        });

        // Activar el botón de filtro correcto
        document.querySelectorAll('#filters .filter-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`#filters .filter-btn[data-filter="${currentCategory}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        renderArticles();
    } catch (error) {
        console.error('Error cargando artículos:', error);
        const grid = document.getElementById("articlesGrid");
        if (grid) grid.innerHTML = '<div class="no-results show">Error al cargar los artículos</div>';
    } finally {
        articlesLoading = false;
    }
}

// ==============================
// INICIO
// ==============================
function initArticulos(jsonPath) {
    currentJsonPath = jsonPath;
    const params = new URLSearchParams(window.location.search);
    const allowed = new Set(["cat", "page", "mes"]);
    const keys = Array.from(params.keys());

    const unknown = keys.some(k => !allowed.has(k));
    const duplicated = keys.some((k, i) => keys.indexOf(k) !== i);

    // Un parámetro presente sin valor representa un recurso inexistente:
    // ?cat, ?cat=, ?page, ?page=, ?mes o ?mes= deben responder con 404.
    const emptyKnown = ["cat", "page", "mes"].some(
        k => params.has(k) && !String(params.get(k) || "").trim()
    );

    const page = params.get("page");
    const mes = params.get("mes");

    const badPage =
        params.has("page") &&
        !/^[1-9]\d*$/.test(page || "");

    const badMonth =
        params.has("mes") &&
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes || "");

    // La categoría se valida después de cargar el JSON, usando las
    // categorías realmente publicadas. No depende de los botones del HTML.
    if (unknown || duplicated || emptyKnown || badPage || badMonth) {
        window.location.replace("/404.html");
        return;
    }

    cargarArticulos(jsonPath);
}


// Cuando se vuelve desde un artículo, Safari/Chromium/Firefox pueden restaurar la página
// desde BFCache sin disparar DOMContentLoaded de nuevo. Revalidamos el estado visual.
window.addEventListener('pageshow', event => {
    if (!event.persisted) return;

    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (articulosData.length) {
        const state = getStateFromURL();
        currentCategory = state.cat;
        currentPage = state.page;
        poblarMeses(currentCategory);
        document.querySelectorAll('#filters .filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`#filters .filter-btn[data-filter="${currentCategory}"]`)?.classList.add('active');
        renderArticles();
    } else if (currentJsonPath) {
        cargarArticulos(currentJsonPath);
    }
});
