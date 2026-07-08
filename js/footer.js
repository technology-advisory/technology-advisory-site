/* ============================================
   FOOTER.JS — Technology Advisory
   Cierre oscuro (negro cálido) como ancla visual.
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer style="background:var(--footer-bg, #16150f); color:#d4d2c9; padding:3.5rem 2rem 2rem; font-family:var(--font-body); position:relative;">
            <!-- Línea verde superior COMPLETA -->
            <span style="position:absolute; top:0; left:0; width:100%; height:3px; background:#34d399;"></span>
            <div style="max-width:1120px; margin:0 auto; display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:2.5rem; padding-bottom:2.5rem; border-bottom:1px solid rgba(255,255,255,0.09);">

                <div>
                    <a href="/index.html" style="font-family:var(--font-display); font-size:1.15rem; font-weight:700; color:#f5f3ec; display:flex; align-items:center; gap:0.55rem; text-decoration:none; margin-bottom:0.9rem; letter-spacing:-0.01em;">
                        <span style="width:13px; height:13px; background:#34d399; border-radius:3px; display:inline-block;"></span>
                        Technology Advisory
                    </a>
                    <p style="color:#c8c5bc; line-height:1.65; font-size:0.9rem; max-width:340px;">Arquitectura, infraestructura crítica y operación real. Diseño y resiliencia de los sistemas que sostienen el negocio.</p>
                    <p style="font-family:var(--font-mono); color:#a09c92; font-size:0.68rem; letter-spacing:0.04em; margin-top:1.1rem; text-transform:uppercase;">25 años · redes · sistemas · cloud · GRC</p>
                </div>

                <div>
                    <h4 style="font-family:var(--font-mono); color:#a09c92; margin-bottom:1rem; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em; font-weight:500;">Áreas</h4>
                    <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.65rem; font-size:0.9rem;">
                        <li><a href="/arquitectura/index.html" class="ftl">Arquitectura</a></li>
                        <li><a href="/seguridad/index.html" class="ftl">Seguridad</a></li>
                        <li><a href="/operaciones/index.html" class="ftl">Operaciones</a></li>
                        <li><a href="/gobernanza/index.html" class="ftl">Gobernanza</a></li>
                    </ul>
                </div>

                <div>
                    <h4 style="font-family:var(--font-mono); color:#a09c92; margin-bottom:1rem; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em; font-weight:500;">Enlaces</h4>
                    <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.65rem; font-size:0.9rem;">
                        <li><a href="/sobre-mi/sobre-mi.html" class="ftl">Sobre mí</a></li>
                        <li><a href="/legal/legal.html" class="ftl">Legal</a></li>
                        <li><a href="https://grcreal.com" target="_blank" rel="noopener" class="ftl">GRCreal ↗</a></li>
                        <li><a href="https://linkedin.com/in/macarriazo" target="_blank" rel="noopener" class="ftl">LinkedIn ↗</a></li>
                    </ul>
                </div>
            </div>

            <div style="max-width:1120px; margin:1.6rem auto 0; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:1rem; font-family:var(--font-mono); font-size:0.68rem; color:#a09c92; text-transform:uppercase; letter-spacing:0.04em;">
                <p>© 2026 Technology Advisory — sistemas críticos diseñados para no caerse</p>
                <div style="display:flex; gap:1.4rem;">
                    <a href="/legal/legal.html" class="ftl-min">Aviso legal</a>
                    <a href="/legal/legal.html" class="ftl-min">Privacidad</a>
                </div>
            </div>
        </footer>

        <style>
            #footer-container .ftl { color:#d4d2c9; text-decoration:none; transition:color .2s; }
            #footer-container .ftl:hover { color:#34d399; }
            #footer-container .ftl-min { color:#a09c92; text-decoration:none; transition:color .2s; }
            #footer-container .ftl-min:hover { color:#d4d2c9; }
            @media (max-width: 768px) {
                #footer-container footer > div:first-of-type { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
                #footer-container footer > div:first-of-type > div:first-child { grid-column: 1 / -1; }
            }
            @media (max-width: 480px) {
                #footer-container footer > div:first-of-type { grid-template-columns: 1fr !important; }
            }
        </style>
    `;
});