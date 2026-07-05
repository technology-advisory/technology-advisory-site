/* ============================================
   TECHNOLOGY ADVISORY — GLOBAL.JS
   Único JS compartido entre páginas: inyecta el nav.
   Cada sección tiene su propio JS para su lógica
   particular (servicios.js, casos.js, etc.) — este
   archivo NO debe crecer con lógica de sección.
   ============================================ */

(function () {
  // Rutas SIEMPRE relativas a la raíz del proyecto.
  // index.html vive en la raíz; el resto vive cada una
  // en su propia subcarpeta de un nivel (legal/legal.html,
  // servicios/servicios.html...). El prefijo "../" se
  // calcula automáticamente más abajo: nunca hay que
  // tocar estas rutas al mover o añadir páginas.
  const NAV_LINKS = [
    { href: "index.html", label: "Inicio" },
    //{ href: "servicios/servicios.html", label: "Servicios" },
    //{ href: "casos/casos.html", label: "Casos" },
    { href: "sobre-mi/sobre-mi.html", label: "Sobre mí" },
    { href: "contacto/contacto.html", label: "Contacto" }
  ];

  // Link discreto, fuera del grupo de botones principales:
  // no es una sección de contenido, es un requisito legal.
  const LEGAL_LINK = { href: "legal/legal.html", label: "Legal" };

  // Detecta cuántos niveles de profundidad hay que subir
  // para llegar a la raíz, mirando la URL actual.
  // En index.html (raíz) -> "". En legal/legal.html -> "../".
  function rootPrefix() {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    // El último segmento es el archivo .html, no cuenta.
    const depth = Math.max(segments.length - 1, 0);
    return "../".repeat(depth);
  }

  function currentPage() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "index.html";
    if (segments.length === 1) return segments[0];
    // Página dentro de una subcarpeta: "carpeta/archivo.html"
    return segments.slice(-2).join("/");
  }

  function buildNav() {
    const prefix = rootPrefix();
    const current = currentPage();

    const nav = document.createElement("nav");
    nav.className = "ta-nav";

    const logo = document.createElement("a");
    logo.href = prefix + "index.html";
    logo.className = "ta-nav-logo";
    logo.innerHTML = 'Technology <span>Advisory</span>';

    const ul = document.createElement("ul");
    ul.className = "ta-nav-links";

    const allLinks = NAV_LINKS.concat([LEGAL_LINK]);

    allLinks.forEach(function (link) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = prefix + link.href;
      a.textContent = link.label;
      if (link === LEGAL_LINK) {
        a.classList.add("ta-nav-legal");
      }
      if (link.href === current) {
        a.classList.add("active");
      }
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(logo);
    nav.appendChild(ul);

    document.body.insertBefore(nav, document.body.firstChild);
  }

  function buildFooter() {
    const footer = document.createElement("div");
    footer.className = "ta-footer";

    footer.innerHTML =
      '<div class="ta-footer-inner">' +
        '<div class="ta-author-block">' +
          '<div class="ta-author-avatar">MA</div>' +
          '<div>' +
            '<div class="ta-author-name">Miguel Ángel Carriazo · <span>vCISO</span></div>' +
            '<div class="ta-author-title">Cybersecurity & Infrastructure Architect</div>' +
          '</div>' +
        '</div>' +
        '<a href="https://www.linkedin.com/in/macarriazo/" target="_blank" class="ta-li-btn">' +
          '<svg class="ta-li-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
            '<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>' +
          '</svg>' +
          '<div>' +
            '<span class="ta-li-main">"Merece la pena la experiencia..."</span>' +
            '<span class="ta-li-sub">Hablemos en LinkedIn →</span>' +
          '</div>' +
        '</a>' +
      '</div>';

    document.body.appendChild(footer);
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    if (currentPage() !== "index.html") {
      buildFooter();
    }
  });
})();