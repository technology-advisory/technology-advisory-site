document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('footer-container');
  if (!root) return;
  root.innerHTML = `<footer class="ta-footer"><div class="ta-footer-inner">
    <div class="ta-footer-grid">
      <div class="ta-footer-brand"><a href="/index.html"><span>TA</span><b>Technology Advisory</b></a><p>Conocimiento técnico aplicado a arquitectura, seguridad, operaciones y gobernanza. Artículos, referencias y herramientas para tomar decisiones con criterio.</p><small>DISEÑO · OPERACIÓN · EVIDENCIA · MADUREZ</small></div>
      <div><h4>Áreas</h4><a href="/arquitectura/index.html">Arquitectura</a><a href="/seguridad/index.html">Seguridad</a><a href="/operaciones/index.html">Operaciones</a><a href="/gobernanza/index.html">Gobernanza</a></div>
      <div><h4>Biblioteca</h4><a href="/referencias/index.html">Referencias</a><a href="/tools/index.html">Tools</a><a href="/mi-enfoque/index.html">Mi enfoque</a><a href="/sobre-mi/sobre-mi.html">Sobre mí</a></div>
      <div><h4>Ecosistema</h4><a href="https://opentrust.group" target="_blank" rel="noopener">OpenTrust.Group ↗</a><a href="https://grcreal.com" target="_blank" rel="noopener">GRCReal ↗</a><a href="/legal/legal.html">Legal y privacidad</a></div>
    </div>
    <div class="ta-footer-bottom"><span>© 2026 Technology Advisory · OpenTrust Group</span><span>technology-advisory.es</span></div>
  </div></footer>`;
});
