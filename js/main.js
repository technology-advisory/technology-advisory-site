/* ============================================
   MAIN.JS
   Lógica del index
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Technology Advisory loaded');
    
    // ============================================
    // COMPARTIR EN LINKEDIN
    // Añade botón de share a todos los artículos
    // ============================================
    addLinkedInShare();
});

function closeDevModal() {
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('dev-modal');
    if (modal && event.target === modal) {
        closeDevModal();
    }
});

// ============================================
// COMPARTIR EN LINKEDIN - FUNCIÓN
// ============================================

function addLinkedInShare() {
    // Buscar la zona de metadatos del artículo
    const metaContainer = document.querySelector('.article-meta') || document.querySelector('.defensa-meta');
    
    // Si ya existe un share en los metadatos, no duplicar
    if (document.querySelector('.article-share-inline')) return;
    
    // Si no hay metadatos, buscar el footer del autor como fallback
    let targetElement = metaContainer;
    let isInline = true;
    
    if (!targetElement) {
        const authorFoot = document.querySelector('.defensa-foot');
        if (authorFoot) {
            targetElement = authorFoot;
            isInline = false;
        } else {
            return;
        }
    }
    
    // Obtener URL para compartir
    const url = encodeURIComponent(window.location.href);
    
    // Crear el contenedor de share
    const shareContainer = document.createElement('div');
    shareContainer.className = isInline ? 'article-share-inline' : 'article-share';
    
    shareContainer.innerHTML = `
        <span class="share-label">Compartir</span>
        <div class="share-buttons">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" 
               target="_blank" 
               class="share-btn share-btn-linkedin" 
               aria-label="Compartir en LinkedIn"
               rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
            </a>
        </div>
    `;
    
    // Insertar el share
    if (isInline && metaContainer) {
        metaContainer.appendChild(shareContainer);
    } else {
        targetElement.parentNode.insertBefore(shareContainer, targetElement);
    }
    
    // Añadir estilos si no existen
    if (!document.querySelector('#shareStyles')) {
        const style = document.createElement('style');
        style.id = 'shareStyles';
        style.textContent = `
            .article-share-inline {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-left: 16px;
                padding-left: 16px;
                border-left: 1px solid #e2e8f0;
                flex-wrap: wrap;
            }
            @media (max-width: 700px) {
                .article-share-inline {
                    display: flex;
                    margin-left: 0;
                    padding-left: 0;
                    border-left: none;
                    padding-top: 8px;
                    width: 100%;
                }
            }
            .article-share {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 24px 0 8px;
                border-top: 1px solid #e2e8f0;
                margin-top: 8px;
                flex-wrap: wrap;
            }
            @media (max-width: 700px) {
                .article-share {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 16px 0 8px;
                }
            }
            .share-label {
                font-family: monospace;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #94a3b8;
                font-weight: 700;
            }
            .article-share-inline .share-label {
                font-size: 10px;
                color: #94a3b8;
            }
            .share-buttons {
                display: flex;
                gap: 6px;
                align-items: center;
            }
            .share-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #f1f5f9;
                color: #334155;
                transition: all 0.2s ease;
                text-decoration: none;
                border: 1px solid #e2e8f0;
                cursor: pointer;
            }
            .share-btn:hover {
                transform: scale(1.05);
            }
            .share-btn svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
                flex-shrink: 0;
            }
            .share-btn-linkedin {
                background: #0a66c2;
                color: #ffffff;
                border-color: #0a66c2;
            }
            .share-btn-linkedin:hover {
                background: #004182;
                border-color: #004182;
            }
            .article-meta, .defensa-meta {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 8px 16px !important;
            }
            .article-meta > *, .defensa-meta > * {
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
        `;
        document.head.appendChild(style);
    }
}