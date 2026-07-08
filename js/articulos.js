// ==============================
// ARTÍCULOS - LÓGICA COMPARTIDA
// ==============================

let articulosData = [];
let currentCategory = "all";
let currentPage = 1;
let sortMode = "newest";
const PER_PAGE = 16;

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
    
    // Seleccionar el mes actual de la URL si existe y está disponible
    const state = getStateFromURL();
    if (state.mes && state.mes !== 'all') {
        // Verificar si el mes existe en las opciones
        const optionExists = Array.from(select.options).some(opt => opt.value === state.mes);
        if (optionExists) {
            select.value = state.mes;
        } else {
            // Si no existe, resetear a "all"
            select.value = 'all';
            // Actualizar URL sin el mes
            const url = buildURL(category, state.page, 'all');
            history.replaceState(null, '', url);
        }
    }
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

    // Obtener artículos filtrados
    let filtered = getFilteredArticles(currentCategory, selectedMonth);

    // Ordenar
    filtered.sort((a, b) => {
        const dateA = parseSpanishDate(a.date);
        const dateB = parseSpanishDate(b.date);
        return sortMode === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Paginación
    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = filtered.slice(start, start + PER_PAGE);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.classList.add('show');
        renderPagination(totalPages);
        return;
    }

    noResults.classList.remove('show');
    grid.innerHTML = pageItems.map(articulo => `
        <div class="article-card" data-cat="${articulo.cat}" onclick="location.href='${articulo.url}'">
            <div class="article-meta">${articulo.meta}</div>
            <div class="article-title">${articulo.title}${articulo.badge ? `<span class="article-badge">${articulo.badge}</span>` : ''}</div>
            <div class="article-date">${articulo.date}</div>
            <div class="article-desc">${articulo.desc}</div>
            <a href="${articulo.url}" class="article-link">Leer artículo →</a>
        </div>
    `).join('');

    renderPagination(totalPages);
    
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
    html += `<button class="page-btn page-arrow" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">←</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn${i === currentPage ? ' active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn page-arrow" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">→</button>`;
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
    const state = getStateFromURL();
    const mes = state.mes || "all";
    navigateTo(cat, 1, mes);
}

// ==============================
// ORDEN (toggle)
// ==============================
function toggleSort() {
    const btn = document.getElementById("sortBtn");
    sortMode = sortMode === "newest" ? "oldest" : "newest";
    btn.innerText = sortMode === "newest" ? "↓ Nuevos" : "↑ Más antiguos";
    sessionStorage.setItem('sortMode', sortMode);
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
    try {
        const response = await fetch(jsonPath);
        const todos = await response.json();

        articulosData = todos.filter(a => a.published === true);

        // Recuperar modo de orden desde sessionStorage
        const savedSort = sessionStorage.getItem('sortMode');
        if (savedSort) sortMode = savedSort;
        const btn = document.getElementById("sortBtn");
        if (btn) btn.innerText = sortMode === "newest" ? "↓ Nuevos" : "↑ Más antiguos";

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
        document.getElementById("articlesGrid").innerHTML = '<div class="no-results show">Error al cargar los artículos</div>';
    }
}

// ==============================
// INICIO
// ==============================
function initArticulos(jsonPath) {
    cargarArticulos(jsonPath);
}