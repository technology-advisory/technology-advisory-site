document.addEventListener('DOMContentLoaded', () => {
  const layout = document.querySelector('.defensa-layout');
  const toc = document.querySelector('.defensa-toc');
  if (layout && toc && !layout.classList.contains('ta-editorial-layout')) {
    layout.classList.add('ta-editorial-layout');
    const children = Array.from(toc.children);
    if (children.length > 1) {
      children[children.length - 1].classList.add('ta-sections-panel');
      const details = document.createElement('aside');
      details.className = 'ta-article-details';
      // Everything before the section index is treated as article metadata/details.
      children.slice(0, -1).forEach(node => details.appendChild(node));
      layout.appendChild(details);
    }
  }
});
