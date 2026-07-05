/* ============================================
   MENU.JS — Technology Advisory
   Menú dinámico estilo FraudeDigital, colores verdes
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    const basePath = window.location.pathname.includes('/sobre-mi/') || 
                     window.location.pathname.includes('/legal/') ? '../' : '';

    const links = [
        { key: 'index', href: `${basePath}index.html`, label: 'Inicio', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
        { key: 'arq', href: '#', label: 'Arquitectura', icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line>' },
        { key: 'ops', href: '#', label: 'Operaciones', icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"/>' },
        { key: 'seg', href: '#', label: 'Seguridad', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>' },
        { key: 'gob', href: '#', label: 'Gobernanza', icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
        { key: 'sobremi', href: `${basePath}sobre-mi/sobre-mi.html`, label: 'Sobre Mí', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' }
    ];

    menuContainer.innerHTML = `
        <style>
            .site-nav {
                border-bottom: 1px solid var(--border);
                padding: 0.8rem 2rem;
                background: var(--bg);
                font-family: 'Segoe UI', system-ui, sans-serif;
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
                gap: 2rem;
                flex-wrap: wrap;
            }

            .logo-link {
                font-size: 1.35rem;
                font-weight: 700;
                color: var(--primary);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                flex-shrink: 0;
            }

            .logo-link svg {
                width: 26px;
                height: 26px;
                stroke: var(--accent);
                stroke-width: 2.5;
                fill: none;
            }

            .nav-list {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                list-style: none;
                padding: 0;
                margin: 0;
                flex-wrap: wrap;
                flex: 1;
                justify-content: flex-end;
            }

            .nav-list a {
                text-decoration: none;
                color: var(--text);
                font-weight: 600;
                font-size: 0.82rem;
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
                transition: color 0.2s ease;
            }

            .nav-list a svg {
                width: 14px;
                height: 14px;
                stroke: currentColor;
                fill: none;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .nav-list a:hover {
                color: var(--accent);
            }

            .nav-list a.menu-link-cta {
                background: var(--accent);
                color: white;
                padding: 5px 13px;
                border-radius: 16px;
                font-weight: 700;
                font-size: 0.78rem;
            }

            .nav-list a.menu-link-cta:hover {
                background: var(--accent-hover);
                color: white;
            }

            @media (max-width: 768px) {
                .nav-container {
                    gap: 1rem;
                }

                .nav-list {
                    width: 100%;
                    gap: 1rem;
                    order: 3;
                }

                .nav-list a {
                    font-size: 0.75rem;
                }

                .nav-list a svg {
                    display: none;
                }
            }
        </style>

        <nav class="site-nav">
            <div class="nav-container">
                <a href="${basePath}index.html" class="logo-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><line x1="6" y1="17" x2="6" y2="20"></line><line x1="18" y1="17" x2="18" y2="20"></line><circle cx="8" cy="8" r="1.5" fill="currentColor"></circle><circle cx="12" cy="8" r="1.5" fill="currentColor"></circle><circle cx="16" cy="8" r="1.5" fill="currentColor"></circle><circle cx="8" cy="12" r="1.5" fill="currentColor"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor"></circle></svg>
                    Technology Advisory
                </a>

                <ul class="nav-list">
                    ${links.map(l => {
                        const isCta = l.key === 'legal';
                        const style = isCta ? 'menu-link-cta' : '';
                        return `
                            <li>
                                <a href="${l.href}" class="menu-link ${style}" data-page="${l.key}" onclick="${l.href === '#' ? 'event.preventDefault(); showDevModal(); return false;' : ''}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${l.icon}</svg>
                                    ${l.label}
                                </a>
                            </li>
                        `;
                    }).join('')}
                    <li>
                        <a href="${basePath}legal/legal.html" class="menu-link menu-link-cta">Legal</a>
                    </li>
                </ul>
            </div>
        </nav>
    `;
});

function showDevModal() {
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeDevModal() {
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}
