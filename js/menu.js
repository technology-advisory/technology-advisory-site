/* Menu.js - Technology Advisory - Dossier técnico + submenús por área */

document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(seg => seg.length > 0 && !seg.includes('.html'));
    const depth = pathSegments.length;
    let basePath = '';
    if (depth > 0) { basePath = '../'.repeat(depth); }

    /* --- Sección activa --- */
    let active = 'inicio';
    if (/\/arquitectura(\/|$)/.test(currentPath)) active = 'arquitectura';
    else if (/\/seguridad(\/|$)/.test(currentPath)) active = 'seguridad';
    else if (/\/operaciones(\/|$)/.test(currentPath)) active = 'operaciones';
    else if (/\/gobernanza(\/|$)/.test(currentPath)) active = 'gobernanza';
    else if (/\/mi-enfoque(\/|$)/.test(currentPath)) active = 'mi-enfoque';
    else if (/\/referencias(\/|$)/.test(currentPath)) active = 'referencias';
    else if (/\/tools(\/|$)/.test(currentPath)) active = 'tools';
    else if (/\/sobre-mi(\/|$)/.test(currentPath)) active = 'sobre-mi';
    else if (/\/legal(\/|$)/.test(currentPath)) active = 'legal';
    const A = (k) => (active === k ? ' active' : '');

    /* --- Subcategorías por área --- */
    const subs = {
        arquitectura: [
            { num: '1.1', name: 'Alta Disponibilidad', slug: 'alta-disponibilidad' },
            { num: '1.2', name: 'Cloud Híbrido', slug: 'cloud-hibrido' },
            { num: '1.3', name: 'Infraestructura como Código', slug: 'infraestructura-codigo' },
            { num: '1.4', name: 'Diseño de Red', slug: 'diseno-red' },
            { num: '1.5', name: 'Almacenamiento y Datos', slug: 'almacenamiento-datos' },
            { num: '1.6', name: 'Virtualización y Contenedores', slug: 'virtualizacion-contenedores' },
            { num: '1.7', name: 'Capacidad y Rendimiento', slug: 'capacidad-rendimiento' },
            { num: '1.8', name: 'Arquitectura de CPD', slug: 'arquitectura-cpd' }
        ],
        seguridad: [
            { num: '2.1', name: 'Zero Trust', slug: 'zero-trust' },
            { num: '2.2', name: 'Security by Design', slug: 'security-design' },
            { num: '2.3', name: 'Auditoría y Cumplimiento', slug: 'iso-compliance' },
            { num: '2.4', name: 'Firewalls y Perímetro', slug: 'firewalls-perimetro' },
            { num: '2.5', name: 'SIEM y Detección', slug: 'siem-deteccion' },
            { num: '2.6', name: 'Gestión de Vulnerabilidades', slug: 'gestion-vulnerabilidades' },
            { num: '2.7', name: 'Respuesta a Incidentes', slug: 'respuesta-incidentes' },
            { num: '2.8', name: 'Cifrado e Identidad Digital', slug: 'cifrado-identidad-digital' }
        ],
        operaciones: [
            { num: '3.1', name: 'Automatización y Orquestación', slug: 'automatizacion-orquestacion' },
            { num: '3.2', name: 'Continuidad de Negocio', slug: 'continuidad-negocio' },
            { num: '3.3', name: 'Gobierno de Identidades', slug: 'gobierno-identidades' },
            { num: '3.4', name: 'Monitorización y Observabilidad', slug: 'monitorizacion-observabilidad' },
            { num: '3.5', name: 'Gestión de Cambios', slug: 'gestion-cambios' },
            { num: '3.6', name: 'Backup y Recuperación', slug: 'backup-recuperacion' },
            { num: '3.7', name: 'Patch Management', slug: 'patch-management' },
            { num: '3.8', name: 'Gestión de Incidencias', slug: 'gestion-incidencias' }
        ],
        gobernanza: [
            { num: '4.1', name: 'Riesgo Tecnológico', slug: 'riesgo-tecnologico' },
            { num: '4.2', name: 'Gobierno TI', slug: 'gobierno-ti' },
            { num: '4.3', name: 'Gobierno de IA', slug: 'gobierno-ia' },
            { num: '4.4', name: 'Marcos Regulatorios', slug: 'marcos-regulatorios' },
            { num: '4.5', name: 'Gestión de Terceros', slug: 'gestion-terceros' },
            { num: '4.6', name: 'Políticas y Normativa Interna', slug: 'politicas-normativa' },
            { num: '4.7', name: 'Auditoría y Control Interno', slug: 'auditoria-control-interno' },
            { num: '4.8', name: 'Gobierno del Dato', slug: 'gobierno-dato' }
        ]
    };

    function buildSubItems(area) {
        return subs[area].map(s =>
            `<a class="sub-item" href="${basePath}${area}/index.html?cat=${s.slug}">
                <span class="sub-num">${s.num}</span>
                <span class="sub-name">${s.name}</span>
            </a>`
        ).join('');
    }

    function areaItem(key, label, svgPath, devFlag) {
        const dev = devFlag ? ' data-dev="true"' : '';
        return `
            <li class="has-sub">
                <a href="${basePath}${key}/index.html" class="nav-link${A(key)}"${dev}>
                    <svg viewBox="0 0 24 24">${svgPath}</svg>
                    ${label}
                    <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </a>
                <div class="sub-panel">
                    <div class="sub-header">
                        <span class="sub-area-label">${label}</span>
                        <a href="${basePath}${key}/index.html" class="sub-see-all">Ver todos →</a>
                    </div>
                    <div class="sub-grid">${buildSubItems(key)}</div>
                </div>
            </li>`;
    }


    function toolsItem() {
        return `
            <li class="has-sub">
                <a href="${basePath}tools/index.html" class="nav-link${A('tools')}">
                    <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    Tools
                    <svg class="chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </a>
                <div class="sub-panel">
                    <div class="sub-header">
                        <span class="sub-area-label">Tools</span>
                        <a href="${basePath}tools/index.html" class="sub-see-all">Ver todos →</a>
                    </div>
                    <div class="sub-grid">
                        <a class="sub-item" href="${basePath}tools/cisa-kev/index.html">
                            <span class="sub-num">T.1</span>
                            <span class="sub-name">CISA KEV Intelligence</span>
                        </a>
                        <a class="sub-item" href="${basePath}tools/euvd/index.html">
                            <span class="sub-num">T.2</span>
                            <span class="sub-name">EUVD Intelligence</span>
                        </a>
                        <a class="sub-item" href="${basePath}tools/incibe-cert/index.html">
                            <span class="sub-num">T.3</span>
                            <span class="sub-name">INCIBE-CERT Intelligence</span>
                        </a>
                    </div>
                </div>
            </li>`;
    }

    menuContainer.innerHTML = `
        <style>
            .site-nav {
                border-bottom: 1px solid var(--border);
                padding: 0;
                background: #ffffff;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            .nav-container {
                max-width: 1280px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
                padding: 0.78rem 1.25rem;
            }
            .logo-link {
                font-family: var(--font-display);
                font-size: 0.98rem;
                font-weight: 700;
                color: var(--ink);
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.42rem;
                white-space: nowrap;
                letter-spacing: -0.01em;
            }
            .logo-link svg {
                width: 22px; height: 22px;
                min-width: 22px; flex: 0 0 22px;
                stroke: var(--accent); stroke-width: 2.2; fill: none;
                stroke-linecap: round; stroke-linejoin: round;
            }
            .nav-list {
                display: flex; gap: 0.78rem;
                list-style: none; padding: 0; margin: 0;
                align-items: center;
            }
            .nav-list > li { position: relative; white-space: nowrap; }
            .nav-link {
                font-family: var(--font-mono);
                text-decoration: none;
                color: var(--text-muted);
                font-weight: 400;
                font-size: 0.66rem;
                letter-spacing: 0.02em;
                text-transform: uppercase;
                transition: color 0.2s;
                cursor: pointer;
                display: flex; align-items: center; gap: 5px;
                padding: 6px 0;
            }
            .nav-link svg:not(.chevron) {
                width: 13px; height: 13px;
                stroke: currentColor; fill: none; stroke-width: 2;
                stroke-linecap: round; stroke-linejoin: round;
                flex-shrink: 0;
            }
            .chevron {
                width: 9px !important; height: 9px !important;
                stroke: currentColor; fill: none; stroke-width: 2.5;
                stroke-linecap: round; stroke-linejoin: round;
                transition: transform 0.2s;
                margin-left: -2px;
            }
            .nav-link:hover, .has-sub:hover > .nav-link { color: var(--accent); }
            .nav-link.active:not(.btn-legal) { color: var(--accent); font-weight: 500; }

            /* Legal: macizo verde */
            .nav-link.btn-legal {
                color: #ffffff;
                background: var(--accent);
                border: 1px solid var(--accent);
                padding: 6px 10px;
                border-radius: 6px;
                font-weight: 500;
            }
            .nav-link.btn-legal:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
            .nav-link.btn-legal.active { background: var(--accent-deep); border-color: var(--accent-deep); }

            /* ---- SUBMENÚ DESPLEGABLE (escritorio) ---- */
            .sub-panel {
                position: absolute;
                top: calc(100% + 14px);
                left: 50%;
                transform: translateX(-50%);
                width: 340px;
                background: #ffffff;
                border: 1px solid var(--border);
                border-top: 3px solid var(--accent);
                border-radius: 0 0 10px 10px;
                box-shadow: 0 16px 40px rgba(20,19,15,0.12);
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.18s, visibility 0.18s, transform 0.18s;
                z-index: 300;
                padding: 0;
            }
            .sub-panel::before {
                content: '';
                position: absolute;
                top: -17px;
                left: 0;
                right: 0;
                height: 17px;
            }
            .has-sub:hover > .sub-panel {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }
            .has-sub:hover > .nav-link .chevron { transform: rotate(180deg); }

            .sub-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 18px 8px;
                border-bottom: 1px solid var(--border);
            }
            .sub-area-label {
                font-family: var(--font-display);
                font-size: 0.88rem;
                font-weight: 700;
                color: var(--ink);
            }
            .sub-see-all {
                font-family: var(--font-mono);
                font-size: 0.62rem;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: var(--accent);
                text-decoration: none;
            }
            .sub-see-all:hover { color: var(--accent-deep); }

            .sub-grid { padding: 6px 0; }

            .sub-item {
                display: flex;
                align-items: baseline;
                gap: 10px;
                padding: 9px 18px;
                text-decoration: none;
                transition: background 0.15s, padding-left 0.15s;
            }
            .sub-item:hover {
                background: var(--accent-wash, #f0fdf4);
                padding-left: 22px;
            }
            .sub-num {
                font-family: var(--font-mono);
                font-size: 0.74rem;
                color: var(--accent);
                min-width: 26px;
                flex-shrink: 0;
            }
            .sub-name {
                font-family: var(--font-display);
                font-size: 0.85rem;
                font-weight: 500;
                color: var(--ink);
            }
            .sub-item:hover .sub-name { color: var(--accent-deep); }

            /* ---- HAMBURGER ---- */
            .hamburger {
                display: none; background: none; border: none; cursor: pointer;
                padding: 8px; color: var(--ink); flex-shrink: 0; width: 40px; height: 40px;
            }
            .hamburger svg {
                width: 100%; height: 100%; stroke: var(--ink); stroke-width: 2;
                stroke-linecap: round; stroke-linejoin: round; fill: none;
            }

            /* ---- RESPONSIVE ---- */
            @media (max-width: 1040px) {
                .hamburger { display: block; }
                .logo-link { flex: 1; }
                .nav-list {
                    position: absolute; top: 100%; left: 0; right: 0;
                    background: #ffffff; flex-direction: column; align-items: stretch;
                    gap: 0; width: 100%; max-height: 0; overflow-y: auto;
                    transition: max-height 0.35s ease; padding: 0; margin: 0;
                    border: 1px solid var(--border); border-top: none; z-index: 200;
                    display: flex !important;
                }
                .nav-list.open { max-height: 85vh; padding: 4px 0; }
                .nav-list > li { width: 100%; border-bottom: 1px solid var(--border); }
                .nav-list > li:last-child { border-bottom: none; }
                .nav-link {
                    padding: 14px 1.7rem; width: 100%; box-sizing: border-box;
                    font-size: 0.82rem; gap: 10px;
                }
                .nav-link svg:not(.chevron) { width: 18px; height: 18px; stroke: var(--accent); }
                .nav-link.active:not(.btn-legal) {
                    color: var(--accent);
                    box-shadow: inset 3px 0 0 var(--accent);
                    background: var(--accent-wash);
                }
                .nav-link.btn-legal {
                    margin: 10px 1.7rem; width: auto; display: inline-flex;
                }
                .nav-link.btn-legal svg { stroke: currentColor; }

                /* Submenú móvil: colapsa en acordeón */
                .sub-panel {
                    position: static;
                    transform: none;
                    width: 100%;
                    border: none;
                    border-top: 1px solid var(--border);
                    border-radius: 0;
                    box-shadow: none;
                    max-height: 0;
                    overflow: hidden;
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                    transition: max-height 0.3s ease;
                    background: #fafaf8;
                }
                .sub-panel::before { display: none; }
                .sub-panel.mob-open { max-height: 600px; }
                .has-sub:hover > .sub-panel { opacity: 1; visibility: visible; pointer-events: auto; }
                .chevron { transition: transform 0.25s; }
                .mob-open-trigger .chevron { transform: rotate(180deg); }
                .sub-header { padding: 10px 1.7rem 6px; }
                .sub-item { padding: 10px 1.7rem 10px 2.5rem; }
                .sub-item:hover { padding-left: 2.8rem; }
            }
            @media (max-width: 480px) {
                .nav-container { padding: 0.8rem 1.1rem; }
                .logo-link { font-size: 0.98rem; }
            }
        </style>

        <nav class="site-nav">
            <div class="nav-container">
                <a href="${basePath}index.html" class="logo-link">
                    <svg viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="20" x2="22" y2="20"></line>
                        <line x1="6" y1="17" x2="6" y2="20"></line>
                        <line x1="18" y1="17" x2="18" y2="20"></line>
                        <circle cx="8" cy="8" r="1.4" fill="var(--accent)" stroke="none"></circle>
                        <circle cx="12" cy="8" r="1.4" fill="var(--accent)" stroke="none"></circle>
                        <circle cx="16" cy="8" r="1.4" fill="var(--accent)" stroke="none"></circle>
                        <circle cx="8" cy="12" r="1.4" fill="var(--accent)" stroke="none"></circle>
                        <circle cx="12" cy="12" r="1.4" fill="var(--accent)" stroke="none"></circle>
                    </svg>
                    Technology Advisory
                </a>
                <button class="hamburger" id="hamburger" aria-label="Abrir menú">
                    <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <ul class="nav-list" id="nav-list">
                    <li><a href="${basePath}index.html" class="nav-link${A('inicio')}">
                        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Inicio</a></li>
                    <li><a href="${basePath}mi-enfoque/index.html" class="nav-link${A('mi-enfoque')}">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="21" y1="12" x2="18" y2="12"/><line x1="12" y1="21" x2="12" y2="18"/><line x1="3" y1="12" x2="6" y2="12"/></svg>
                        Mi enfoque</a></li>
                    ${areaItem('arquitectura', 'Arquitectura', '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>', false)}
                    ${areaItem('seguridad', 'Seguridad', '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>', true)}
                    ${areaItem('operaciones', 'Operaciones', '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', true)}
                    ${areaItem('gobernanza', 'Gobernanza', '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', true)}
                    <li><a href="${basePath}referencias/index.html" class="nav-link${A('referencias')}">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="4" width="7" height="6" rx="1"/><rect x="8.5" y="14" width="7" height="6" rx="1"/><path d="M6.5 10v2h11v-2M12 12v2"/></svg>
                        Referencias</a></li>
                    ${toolsItem()}
                    <li><a href="${basePath}sobre-mi/sobre-mi.html" class="nav-link${A('sobre-mi')}">
                        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Sobre mí</a></li>
                    <li><a href="${basePath}legal/legal.html" class="nav-link btn-legal${A('legal')}">
                        <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        Legal</a></li>
                </ul>
            </div>
        </nav>
    `;

    /* --- Hamburger --- */
    const hamburger = document.getElementById('hamburger');
    const navList = document.getElementById('nav-list');
    if (hamburger && navList) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navList.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.site-nav')) navList.classList.remove('open');
        });
    }

    /* --- Móvil: acordeón para submenús --- */
    document.querySelectorAll('.has-sub > .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 1040) {
                e.preventDefault();
                e.stopPropagation();
                const panel = this.nextElementSibling;
                const wasOpen = panel.classList.contains('mob-open');
                // Cerrar todos
                document.querySelectorAll('.sub-panel.mob-open').forEach(p => p.classList.remove('mob-open'));
                document.querySelectorAll('.mob-open-trigger').forEach(l => l.classList.remove('mob-open-trigger'));
                if (!wasOpen) {
                    panel.classList.add('mob-open');
                    this.classList.add('mob-open-trigger');
                }
            }
        });
    });

    /* Cerrar submenús al clicar un enlace de subcategoría */
    document.querySelectorAll('.sub-item').forEach(item => {
        item.addEventListener('click', () => {
            if (navList) navList.classList.remove('open');
        });
    });
});
