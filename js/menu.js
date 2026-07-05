/* Menu.js - Technology Advisory */

document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    // Detectar la profundidad de directorios para ajustar las rutas relativas de forma automática
    const basePath = window.location.pathname.includes('/sobre-mi/') || 
                     window.location.pathname.includes('/legal/') ? '../' : '';

    menuContainer.innerHTML = `
        <style>
            .site-nav {
                border-bottom: 1px solid #e2e8f0;
                padding: 0.8rem 2rem;
                background: #ffffff;
                position: sticky;
                top: 0;
                z-index: 100;
            }

            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }

            .logo-link {
                font-size: 1.2rem;
                font-weight: 700;
                color: #0f172a;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.6rem;
                white-space: nowrap;
            }

            .logo-link svg {
                width: 26px;
                height: 26px;
                stroke: #059669;
                stroke-width: 2.5;
                fill: none;
            }

            .nav-list {
                display: flex;
                gap: 2rem;
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .nav-list li {
                white-space: nowrap;
            }

            .nav-list a {
                text-decoration: none;
                color: #334155;
                font-weight: 600;
                font-size: 0.85rem;
                transition: color 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
            }

            .nav-list a:hover {
                color: #059669;
            }

            .nav-list a.btn-legal {
                background: #059669;
                color: white !important;
                padding: 6px 14px;
                border-radius: 16px;
                font-weight: 700;
            }

            .nav-list a.btn-legal:hover {
                background: #047857;
            }

            .nav-list a svg {
                width: 16px;
                height: 16px;
                stroke: currentColor;
                fill: none;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                flex-shrink: 0;
            }

            .hamburger {
                display: none;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                color: #0f172a;
                flex-shrink: 0;
                width: 40px;
                height: 40px;
            }

            .hamburger svg {
                width: 100%;
                height: 100%;
                stroke: #0f172a;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                fill: none;
            }

            @media (max-width: 768px) {
                .hamburger {
                    display: block;
                }

                .logo-link {
                    flex: 1;
                }

                .nav-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    gap: 0;
                    width: 100%;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    padding: 0;
                    margin: 0;
                    border: 1px solid #e2e8f0;
                    border-top: none;
                    z-index: 200;
                    display: flex !important;
                }

                .nav-list.open {
                    max-height: 500px;
                    padding: 10px 0;
                }

                .nav-list li {
                    white-space: normal;
                    width: 100%;
                    border-bottom: 1px solid #f1f5f9;
                }

                .nav-list li:last-child {
                    border-bottom: none;
                }

                .nav-list a {
                    display: flex;
                    padding: 12px 1.5rem;
                    width: 100%;
                    box-sizing: border-box;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.95rem;
                }

                .nav-list a.btn-legal {
                    background: #059669;
                    color: white !important;
                    margin: 8px 1.5rem;
                    width: auto;
                    display: inline-block;
                    border-bottom: none;
                    padding: 8px 20px;
                }

                .nav-list a svg {
                    width: 20px;
                    height: 20px;
                    stroke: #059669;
                }

                .nav-list a.btn-legal svg {
                    stroke: white;
                }
            }

            @media (max-width: 480px) {
                .logo-link {
                    font-size: 1rem;
                }

                .hamburger {
                    width: 36px;
                    height: 36px;
                }

                .nav-list a {
                    font-size: 0.85rem;
                    padding: 10px 1rem;
                }
            }
        </style>

        <nav class="site-nav">
            <div class="nav-container">
                <a href="${basePath}index.html" class="logo-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="2" y1="20" x2="22" y2="20"></line>
                        <line x1="6" y1="17" x2="6" y2="20"></line>
                        <line x1="18" y1="17" x2="18" y2="20"></line>
                        <circle cx="8" cy="8" r="1.5" fill="currentColor"></circle>
                        <circle cx="12" cy="8" r="1.5" fill="currentColor"></circle>
                        <circle cx="16" cy="8" r="1.5" fill="currentColor"></circle>
                        <circle cx="8" cy="12" r="1.5" fill="currentColor"></circle>
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
                    </svg>
                    Technology Advisory
                </a>
                <button class="hamburger" id="hamburger">
                    <svg viewBox="0 0 24 24">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <ul class="nav-list" id="nav-list">
                    <li>
                        <a href="${basePath}index.html">
                            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}desarrollo.html" data-dev="true">
                            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                            Arquitectura
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}desarrollo.html" data-dev="true">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Operaciones
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}desarrollo.html" data-dev="true">
                            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                            Seguridad
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}desarrollo.html" data-dev="true">
                            <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            Gobernanza
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}sobre-mi/sobre-mi.html">
                            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Sobre Mí
                        </a>
                    </li>
                    <li>
                        <a href="${basePath}legal/legal.html" class="btn-legal">
                            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                            Legal
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    `;

    // --- MANEJO DEL MENÚ DESPLEGABLE (MÓVIL) ---
    const hamburger = document.getElementById('hamburger');
    const navList = document.getElementById('nav-list');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navList.classList.toggle('open');
        });

        // Asegurar el cierre del menú al hacer clic en enlaces normales o de desarrollo
        const allLinks = navList.querySelectorAll('a');
        allLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('open');
            });
        });

        // Cerrar menú si se hace clic fuera del área de navegación
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.site-nav')) {
                navList.classList.remove('open');
            }
        });
    }
});