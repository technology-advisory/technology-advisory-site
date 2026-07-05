/* ============================================
   FOOTER.JS
   Footer dinámico estilo FraudeDigital, colores verdes
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <footer style="background-color: var(--primary); color: #94a3b8; padding: 4rem 2rem 2rem; font-size: 0.9rem; border-top: 1px solid #1e293b; font-family: 'Segoe UI', system-ui, sans-serif;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; padding-bottom: 3rem; border-bottom: 1px solid #1e293b;">
                
                <!-- Columna 1: Marca y Propósito -->
                <div>
                    <a href="/" style="font-size: 1.3rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 1rem;">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><line x1="6" y1="17" x2="6" y2="20"></line><line x1="18" y1="17" x2="18" y2="20"></line><circle cx="8" cy="8" r="1.5" fill="var(--accent)"></circle><circle cx="12" cy="8" r="1.5" fill="var(--accent)"></circle><circle cx="16" cy="8" r="1.5" fill="var(--accent)"></circle><circle cx="8" cy="12" r="1.5" fill="var(--accent)"></circle><circle cx="12" cy="12" r="1.5" fill="var(--accent)"></circle></svg>
                        Technology Advisory
                    </a>
                    <p style="color: #64748b; line-height: 1.6;">Arquitectura, infraestructura crítica y operación real. Diseño y resiliencia de sistemas que soportan el negocio.</p>
                </div>

                <!-- Columna 2: Contenido -->
                <div>
                    <h4 style="color: #ffffff; margin-bottom: 1.2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Contenido</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Inicio</a></li>
                        <li><a href="/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Arquitectura</a></li>
                        <li><a href="/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Operaciones</a></li>
                        <li><a href="/" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Seguridad</a></li>
                    </ul>
                </div>

                <!-- Columna 3: Enlaces -->
                <div>
                    <h4 style="color: #ffffff; margin-bottom: 1.2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Enlaces</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="/sobre-mi/sobre-mi.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Sobre mí</a></li>
                        <li><a href="/legal/legal.html" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">Legal</a></li>
                        <li><a href="https://grcreal.com" target="_blank" rel="noopener" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">GRCreal</a></li>
                        <li><a href="https://linkedin.com/in/macarriazo" target="_blank" rel="noopener" style="color: #94a3b8; text-decoration: none; transition: color 0.2s;">LinkedIn</a></li>
                    </ul>
                </div>

            </div>

            <!-- Barra Inferior -->
            <div style="max-width: 1200px; margin: 2rem auto 0; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.85rem; color: #64748b;">
                <p>© 2026 Technology Advisory — Arquitectura que resiste. Ingeniería que protege.</p>
                <div style="display: flex; gap: 1.5rem;">
                    <a href="/legal/legal.html" style="color: #64748b; text-decoration: none;">Aviso Legal</a>
                    <a href="/legal/legal.html" style="color: #64748b; text-decoration: none;">Privacidad</a>
                </div>
            </div>
        </footer>
    `;
});
