'use strict';

document.addEventListener('click', event => {
  const target = event.target.closest('[data-ta-action]');
  if (!target) return;

  const action = target.dataset.taAction;
  if (action === 'toggle-zoom' && typeof window.toggleZoom === 'function') {
    window.toggleZoom(target);
    return;
  }
  if (action === 'filter-articles' && typeof window.filterArticles === 'function') {
    window.filterArticles(target.dataset.category || 'all', target);
    return;
  }
  if (action === 'toggle-sort' && typeof window.toggleSort === 'function') {
    window.toggleSort();
    return;
  }
  if (action === 'go-ref' && typeof window.goRef === 'function') {
    const page = Number.parseInt(target.dataset.page || '', 10);
    if (Number.isFinite(page)) window.goRef(page);
    return;
  }
  if (action === 'go-article-page' && typeof window.goToPage === 'function') {
    const page = Number.parseInt(target.dataset.page || '', 10);
    if (Number.isFinite(page)) window.goToPage(page);
  }
});

document.addEventListener('change', event => {
  const target = event.target.closest('[data-ta-action]');
  if (!target) return;

  if (target.dataset.taAction === 'apply-filters'
      && typeof window.applyFilters === 'function') {
    window.applyFilters();
  }
});

