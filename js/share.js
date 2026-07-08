/* ==============================
   COMPARTIR EN REDES SOCIALES
   Añade botones de share a todos los artículos
   ============================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================
    // 1. AÑADIR BOTONES DE COMPARTIR
    // =============================================
    
    function addShareButtons() {
        // Buscar el footer del autor o el final del artículo
        const authorFoot = document.querySelector('.defensa-foot');
        const articleWrap = document.querySelector('.article-wrap');
        const mainContent = document.querySelector('.defensa-main');
        
        // Si ya existe un share, no duplicar
        if (document.querySelector('.article-share')) return;
        
        // Determinar dónde poner el share
        let targetElement = null;
        
        if (authorFoot) {
            // Si hay pie de autor, ponerlo justo antes
            targetElement = authorFoot;
        } else if (articleWrap) {
            // Si no, buscar el final del artículo
            const articleBody = articleWrap.querySelector('.article-body');
            if (articleBody) {
                targetElement = articleBody;
            } else {
                targetElement = articleWrap;
            }
        } else if (mainContent) {
            targetElement = mainContent;
        } else {
            return; // No se encontró lugar para poner el share
        }
        
        // Obtener URL y título para compartir
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        // Crear el contenedor de share
        const shareContainer = document.createElement('div');
        shareContainer.className = 'article-share';
        shareContainer.innerHTML = `
            <span class="share-label">Compartir artículo</span>
            <div class="share-buttons">
                <!-- LinkedIn -->
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" 
                   target="_blank" 
                   class="share-btn share-btn-linkedin" 
                   aria-label="Compartir en LinkedIn"
                   rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                </a>
                <!-- Twitter/X -->
                <a href="https://twitter.com/intent/tweet?url=${url}&text=${title}" 
                   target="_blank" 
                   class="share-btn share-btn-twitter" 
                   aria-label="Compartir en Twitter/X"
                   rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </a>
                <!-- Copiar enlace -->
                <button class="share-btn share-btn-copy" 
                        aria-label="Copiar enlace"
                        onclick="copyLink()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span class="copy-tooltip" id="copyTooltip">Copiado!</span>
                </button>
            </div>
        `;
        
        // Insertar el share antes del targetElement
        targetElement.parentNode.insertBefore(shareContainer, targetElement);
        
        // Añadir estilos para el tooltip de copia
        const style = document.createElement('style');
        style.textContent = `
            .share-btn-copy {
                position: relative;
                cursor: pointer;
            }
            .copy-tooltip {
                display: none;
                position: absolute;
                bottom: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                background: #0f172a;
                color: #fff;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                font-family: sans-serif;
            }
            .copy-tooltip.show {
                display: block;
                animation: fadeInOut 1.5s ease forwards;
            }
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // =============================================
    // 2. FUNCIÓN COPIAR ENLACE
    // =============================================
    
    window.copyLink = function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const tooltip = document.getElementById('copyTooltip');
            if (tooltip) {
                tooltip.classList.add('show');
                setTimeout(() => {
                    tooltip.classList.remove('show');
                }, 1500);
            }
        }).catch(err => {
            // Fallback: seleccionar el texto
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            const tooltip = document.getElementById('copyTooltip');
            if (tooltip) {
                tooltip.classList.add('show');
                setTimeout(() => {
                    tooltip.classList.remove('show');
                }, 1500);
            }
        });
    };
    
    // =============================================
    // 3. EJECUTAR
    // =============================================
    
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addShareButtons);
    } else {
        addShareButtons();
    }
    
});