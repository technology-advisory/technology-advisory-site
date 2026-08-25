// Lógica de monitorización de lectura interactiva para la barra lateral
  var tocLinks = Array.from(document.querySelectorAll('.defensa-toc-nav a'));
  var sections = tocLinks.map(a => document.querySelector(a.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          tocLinks.forEach(a => {
            if (a.getAttribute('href') === id) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    sections.forEach(function(s){ if (s) observer.observe(s); });
  }
