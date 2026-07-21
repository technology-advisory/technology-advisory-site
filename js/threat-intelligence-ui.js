(() => {
  'use strict';

  const C = window.TI_CONFIG || {};
  const state = {
    all: [],
    filtered: [],
    source: C.initialSource || C.sources?.[0]?.id || 'all',
    page: 1,
    pageSize: 10,
    selected: null,
    selectedFull: null,
    detailTab: 'summary',
    loaded: new Set(),
    loading: new Set(),
    sourceItems: new Map(),
    sourceCounts: new Map(),
    detailRequests: new Map(),
  };

  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(
    /[&<>"']/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]
  );
  const arr = value => Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);
  const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const num = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const worker = new Worker(
    new URL('../../js/threat-intelligence-worker.js', document.baseURI)
  );

  let debounceTimer = 0;
  let requestSequence = 0;

  function sourceConfig(sourceId) {
    return (C.sources || []).find(source => source.id === sourceId);
  }

  function sourceMessage(source) {
    return {
      id: source.id,
      label: source.label,
      color: source.color || '#07884a',
      url: new URL(source.path, document.baseURI).href,
    };
  }

  function showBusy(message = '') {
    let node = $('#tiRuntimeStatus');
    if (!node) {
      node = document.createElement('div');
      node.id = 'tiRuntimeStatus';
      node.className = 'ti-runtime-status';
      const toolbar = document.querySelector('.ti-toolbar');
      toolbar?.appendChild(node);
    }
    node.textContent = message;
    node.classList.toggle('visible', Boolean(message));
  }

  function rebuildAll() {
    const items = [];
    for (const source of C.sources || []) {
      items.push(...(state.sourceItems.get(source.id) || []));
    }
    state.all = items.sort(
      (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
    );
  }

  function loadSource(sourceId) {
    if (!sourceId || sourceId === 'all') return Promise.resolve();
    if (state.loaded.has(sourceId)) return Promise.resolve();
    if (state.loading.has(sourceId)) {
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (!state.loading.has(sourceId)) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }

    const source = sourceConfig(sourceId);
    if (!source) return Promise.resolve();

    state.loading.add(sourceId);
    showBusy(`Cargando ${source.label}…`);
    buildTabs();

    return new Promise((resolve, reject) => {
      const handler = event => {
        const message = event.data || {};
        if (message.sourceId !== sourceId) return;

        if (message.type === 'loaded') {
          worker.removeEventListener('message', handler);
          state.loading.delete(sourceId);
          state.loaded.add(sourceId);
          state.sourceItems.set(sourceId, message.items || []);
          state.sourceCounts.set(sourceId, message.count || 0);
          rebuildAll();
          buildTabs();
          showBusy('');
          resolve();
        }

        if (message.type === 'error') {
          worker.removeEventListener('message', handler);
          state.loading.delete(sourceId);
          buildTabs();
          showBusy(`No se pudo cargar ${source.label}`);
          console.warn('No se pudo cargar', source.path, message.message);
          reject(new Error(message.message));
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({
        type: 'load',
        source: sourceMessage(source),
      });
    });
  }

  async function ensureAllSources() {
    for (const source of C.sources || []) {
      if (!state.loaded.has(source.id)) {
        await loadSource(source.id);
        apply();
      }
    }
  }

  function detailRequest(compactItem) {
    if (!compactItem) return Promise.resolve(null);

    const requestId = ++requestSequence;
    showBusy('Cargando detalle…');

    return new Promise(resolve => {
      state.detailRequests.set(requestId, resolve);
      worker.postMessage({
        type: 'detail',
        requestId,
        sourceId: compactItem._source,
        recordIndex: compactItem._recordIndex,
      });
    });
  }

  worker.addEventListener('message', event => {
    const message = event.data || {};
    if (message.type !== 'detail') return;

    const resolve = state.detailRequests.get(message.requestId);
    if (!resolve) return;

    state.detailRequests.delete(message.requestId);
    showBusy('');
    resolve(message.item || null);
  });

  const dateVal = item => item.updated_at
    || item.published_at
    || item.date_updated
    || item.date_published
    || item.dateAdded
    || item.date_added
    || item.last_updated_at
    || '';

  const fmtDate = value => {
    if (!value) return 'No disponible';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return text(value);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const idOf = item => text(
    item.advisory_id
    || item.record_id
    || item.cveID
    || item.cve_id
    || item.incibe_id
    || item.id
    || arr(item.cves)[0]
    || 'Sin identificador'
  );

  const cvesOf = item => [...new Set([
    ...arr(item.cves),
    ...arr(item.aliases),
    item.cveID,
    item.cve_id,
  ].map(text).filter(value => /^CVE-\d{4}-\d+/i.test(value)))];

  const productsOf = item => [...new Set([
    ...arr(item.products),
    ...arr(item.affected_products),
    ...arr(item.affected_resources),
    ...arr(item.product),
    ...arr(item.productsPreview),
  ].map(text).filter(Boolean))];

  const versionsOf = item => [...new Set([
    ...arr(item.affected_versions),
    ...arr(item.versions),
    ...arr(item.versionsPreview),
  ].map(text).filter(Boolean))];

  const fixedOf = item => [...new Set(
    arr(item.fixed_versions).map(text).filter(Boolean)
  )];

  const refsOf = item => {
    const references = arr(item.references)
      .map(reference => typeof reference === 'string'
        ? { url: reference, title: reference }
        : {
            url: reference?.url || '',
            title: reference?.title || reference?.url || '',
          })
      .filter(reference => reference.url);

    const notes = text(item.notes);
    const urls = notes.match(/https?:\/\/[^\s;]+/g) || [];
    urls.forEach(url => references.push({ url, title: url }));

    return references.filter(
      (reference, index, all) =>
        all.findIndex(candidate => candidate.url === reference.url) === index
    );
  };

  const scoreOf = item => {
    for (const key of [
      'cvss',
      'cvss_score',
      'baseScore',
      'base_score',
      'cvss_max',
      '_linkedCvss',
    ]) {
      const value = num(item[key]);
      if (value !== null && value >= 0 && value <= 10) return value;
    }
    return null;
  };

  const severityOf = item => {
    const severity = text(
      item.severity || item.risk || item.impact || item.importance
    ).toLowerCase();
    const score = scoreOf(item);

    if (['critical', 'crítica', 'critica'].includes(severity)) return 'critical';
    if (['high', 'alta', 'important'].includes(severity)) return 'high';
    if (['medium', 'media', 'moderate'].includes(severity)) return 'medium';
    if (['low', 'baja', 'informational', 'info'].includes(severity)) return 'low';

    if (score !== null) {
      if (score >= 9) return 'critical';
      if (score >= 7) return 'high';
      if (score >= 4) return 'medium';
      return 'low';
    }

    if (item._source === 'cisa-kev' || item.known_exploited === true) return 'kev';
    return 'unknown';
  };

  const severityLabel = severity => ({
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja / Info',
    kev: 'KEV',
    unknown: 'Sin clasificar',
  })[severity] || severity;

  const providerOf = item => text(
    item.provider
    || item.vendor
    || item.vendorProject
    || item.source
    || item.source_name
    || item._label
    || item._source
    || 'Fuente oficial'
  );

  const descriptionOf = item => text(
    item.description
    || item.shortDescription
    || item.summary
    || item.detail
    || item.notes
    || item.descriptionPreview
    || 'Sin descripción disponible.'
  );

  async function loadInitial() {
    buildTabs();
    renderEmptyLoading();

    try {
      await loadSource(state.source);
    } catch (error) {
      console.warn(error);
    }

    const initialItems = state.sourceItems.get(state.source) || [];
    state.selected = initialItems[0] || null;
    apply();
  }

  function buildTabs() {
    const box = $('#tiTabs');
    if (!box) return;

    const tabs = [
      { id: 'all', label: C.allLabel || 'Todas' },
      ...(C.sources || []),
    ];

    box.innerHTML = tabs.map(source => {
      let count = '';
      if (source.id === 'all') {
        const loadedAll = (C.sources || []).every(item => state.loaded.has(item.id));
        count = loadedAll
          ? state.all.length.toLocaleString('es-ES')
          : `${state.all.length.toLocaleString('es-ES')}+`;
      } else if (state.sourceCounts.has(source.id)) {
        count = state.sourceCounts.get(source.id).toLocaleString('es-ES');
      } else if (state.loading.has(source.id)) {
        count = '…';
      } else {
        count = '—';
      }

      return `<button class="ti-tab ${source.id === state.source ? 'active' : ''}" data-source="${esc(source.id)}">${esc(source.label)} <span>${count}</span></button>`;
    }).join('');

    box.onclick = async event => {
      const button = event.target.closest('.ti-tab');
      if (!button) return;

      state.source = button.dataset.source;
      state.page = 1;
      state.selected = null;
      state.selectedFull = null;
      buildTabs();

      if (state.source === 'all') {
        showBusy('Cargando todas las fuentes…');
        await ensureAllSources();
        showBusy('');
      } else {
        await loadSource(state.source);
      }

      state.selected = (
        state.source === 'all'
          ? state.all
          : state.sourceItems.get(state.source) || []
      )[0] || null;

      apply();
    };
  }

  function renderEmptyLoading() {
    const body = $('#tiTableBody');
    const head = $('#tiTableHead');
    if (head) head.innerHTML = '';
    if (body) {
      body.innerHTML = '<tr><td class="ti-empty">Cargando fuente inicial…</td></tr>';
    }
  }

  function apply() {
    const search = text($('#tiSearch')?.value).toLowerCase();
    const severity = $('#tiSeverity')?.value || '';
    const status = $('#tiStatus')?.value || '';
    const time = $('#tiTime')?.value || '';
    const cutoff = time ? Date.now() - Number(time) * 86400000 : 0;

    const pool = state.source === 'all'
      ? state.all
      : state.sourceItems.get(state.source) || [];

    state.filtered = pool.filter(item => {
      const searchText = item._searchText || '';
      return (
        (!search || searchText.includes(search))
        && (!severity || severityOf(item) === severity)
        && (
          !status
          || (
            status === 'exploited'
              ? item.known_exploited === true
              : status === 'cve'
                ? cvesOf(item).length > 0
                : true
          )
        )
        && (
          !cutoff
          || new Date(dateVal(item) || 0).getTime() >= cutoff
        )
      );
    });

    if (!state.filtered.includes(state.selected)) {
      state.selected = state.filtered[0] || null;
      state.selectedFull = null;
    }

    render();
    if (state.selected) selectItem(state.selected, false);
  }

  function render() {
    renderKpis();
    renderTable();
    renderCards();
    renderDetail();
  }

  function renderKpis() {
    const pool = state.source === 'all'
      ? state.all
      : state.sourceItems.get(state.source) || [];
    const count = severity => pool.filter(
      item => severityOf(item) === severity
    ).length;

    $('#tiKpis').innerHTML = [
      ['Total', pool.length, 'Registros cargados', ''],
      ['Críticas', count('critical'), 'Prioridad inmediata', 'critical'],
      ['Altas', count('high'), 'Prioridad alta', 'high'],
      ['Medias', count('medium'), 'Seguimiento', 'medium'],
      ['Bajas / Info', count('low'), 'Riesgo reducido', 'low'],
    ].map(item => `<div class="ti-kpi ${item[3]}"><div class="ti-kpi-label"><i class="ti-kpi-dot"></i>${esc(item[0])}</div><strong>${item[1].toLocaleString('es-ES')}</strong><small>${esc(item[2])}</small></div>`).join('');
  }

  function columns() {
    return C.columns || [
      'severity',
      'id',
      'provider',
      'date',
      'cvss',
      'product',
      'status',
    ];
  }

  function header(key) {
    return ({
      severity: 'Severidad',
      id: 'CVE / Advisory',
      provider: 'Proveedor',
      date: 'Publicado',
      cvss: 'CVSS',
      product: 'Producto / Servicio',
      epss: 'EPSS',
      exploitation: 'Explotación',
      sources: 'Fuentes',
      status: 'Estado',
    })[key] || key;
  }

  function cell(item, key) {
    if (key === 'severity') {
      const severity = severityOf(item);
      return `<span class="ti-badge ${severity}">${severityLabel(severity)}</span>`;
    }

    if (key === 'id') {
      return `<div class="ti-id">${esc(cvesOf(item)[0] || idOf(item))}</div><div class="ti-row-title">${esc(text(item.title || item.vulnerabilityName || idOf(item)))}</div>`;
    }

    if (key === 'provider') {
      return `<div class="ti-provider"><i class="ti-provider-mark" style="background:${esc(item._sourceColor)}"></i>${esc(providerOf(item))}</div>`;
    }

    if (key === 'date') return esc(fmtDate(dateVal(item)));

    if (key === 'cvss') {
      const score = scoreOf(item);
      return score === null ? '—' : esc(score.toFixed(1).replace('.0', ''));
    }

    if (key === 'product') {
      return `<div class="ti-row-title">${esc(productsOf(item).slice(0, 2).join(', ') || 'No especificado')}</div>`;
    }

    if (key === 'epss') {
      const value = num(item.epss);
      return value === null
        ? '—'
        : esc(`${(value > 1 ? value : value * 100).toFixed(2)}%`);
    }

    if (key === 'exploitation') {
      if (item.known_exploited === true || item._source === 'cisa-kev') {
        return '<span class="ti-badge critical">Activa</span>';
      }
      if (item.known_exploited === false) {
        return '<span class="ti-badge low">No conocida</span>';
      }
      return '—';
    }

    if (key === 'sources') {
      return esc(arr(item.sources).join(', ') || item._label);
    }

    if (key === 'status') {
      return '<span class="ti-badge status">Publicado</span>';
    }

    return '';
  }

  async function selectItem(item, rerenderTable = true) {
    state.selected = item;
    state.selectedFull = null;

    if (rerenderTable) renderTable();
    renderDetail();

    const full = await detailRequest(item);
    if (state.selected !== item) return;

    state.selectedFull = full;
    renderDetail();
  }

  function renderTable() {
    const start = (state.page - 1) * state.pageSize;
    const rows = state.filtered.slice(start, start + state.pageSize);
    const tableColumns = columns();

    $('#tiTableHead').innerHTML = tableColumns
      .map(key => `<th class="col-${key}">${header(key)}</th>`)
      .join('');

    $('#tiTableBody').innerHTML = rows.length
      ? rows.map((item, index) => `<tr data-index="${start + index}" class="${item === state.selected ? 'selected' : ''}">${tableColumns.map(key => `<td>${cell(item, key)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${tableColumns.length}" class="ti-empty">No hay resultados con estos filtros.</td></tr>`;

    $('#tiTableBody').onclick = event => {
      const row = event.target.closest('tr[data-index]');
      if (!row) return;
      selectItem(state.filtered[Number(row.dataset.index)]);
    };

    renderPager();
  }

  function renderCards() {
    const start = (state.page - 1) * state.pageSize;
    const rows = state.filtered.slice(start, start + state.pageSize);

    $('#tiMobileCards').innerHTML = rows.map((item, index) => {
      const severity = severityOf(item);
      return `<article class="ti-mobile-card" data-index="${start + index}"><div class="ti-mobile-card-head"><span class="ti-badge ${severity}">${severityLabel(severity)}</span><b>${esc(scoreOf(item) ?? '—')}</b></div><h3>${esc(cvesOf(item)[0] || idOf(item))}</h3><p>${esc(text(item.title || item.vulnerabilityName || descriptionOf(item)).slice(0, 150))}</p></article>`;
    }).join('');

    $('#tiMobileCards').onclick = event => {
      const card = event.target.closest('[data-index]');
      if (!card) return;
      selectItem(state.filtered[Number(card.dataset.index)]);
      $('#tiDetail').classList.add('open');
    };
  }

  function renderPager() {
    const pages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    if (state.page > pages) state.page = pages;

    $('#tiCount').textContent = `Mostrando ${state.filtered.length ? ((state.page - 1) * state.pageSize + 1) : 0}–${Math.min(state.page * state.pageSize, state.filtered.length)} de ${state.filtered.length.toLocaleString('es-ES')}`;

    const numbers = [];
    for (
      let page = Math.max(1, state.page - 2);
      page <= Math.min(pages, state.page + 2);
      page += 1
    ) {
      numbers.push(page);
    }

    $('#tiPageButtons').innerHTML = `<button data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>‹</button>${numbers.map(page => `<button data-page="${page}" class="${page === state.page ? 'active' : ''}">${page}</button>`).join('')}<button data-page="next" ${state.page >= pages ? 'disabled' : ''}>›</button>`;

    $('#tiPageButtons').onclick = event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;

      const page = button.dataset.page;
      state.page = page === 'prev'
        ? state.page - 1
        : page === 'next'
          ? state.page + 1
          : Number(page);

      renderTable();
      renderCards();
    };
  }

  function listHtml(values, empty = 'No disponible') {
    return values.length
      ? `<ul class="ti-list">${values.map(value => `<li>${esc(value)}</li>`).join('')}</ul>`
      : `<p>${esc(empty)}</p>`;
  }

  function renderDetail() {
    const compact = state.selected;
    const box = $('#tiDetail');

    if (!compact) {
      box.innerHTML = '<div class="ti-detail-empty">Selecciona un registro para consultar el detalle.</div>';
      return;
    }

    const item = state.selectedFull || compact;
    const loadingDetail = !state.selectedFull;
    const references = refsOf(item);
    const products = productsOf(item);
    const versions = versionsOf(item);
    const fixed = fixedOf(item);
    const cves = cvesOf(item);
    const score = scoreOf(item);
    const severity = severityOf(item);

    box.innerHTML = `<div class="ti-detail-head"><div class="ti-detail-top"><div><span class="ti-badge ${severity}">${severityLabel(severity)}</span>${score !== null ? ` <span class="ti-badge unknown">CVSS ${esc(score)}</span>` : ''}</div><button class="ti-close" aria-label="Cerrar">×</button></div><h2>${esc(cves[0] || idOf(item))}</h2><div class="ti-detail-sub">${esc(text(item.title || item.vulnerabilityName || idOf(item)))}</div></div>
    <div class="ti-detail-meta"><div class="ti-meta-cell"><small>Proveedor</small><b>${esc(providerOf(item))}</b></div><div class="ti-meta-cell"><small>Publicado</small><b>${esc(fmtDate(dateVal(item)))}</b></div><div class="ti-meta-cell"><small>Estado</small><b>Publicado</b></div><div class="ti-meta-cell"><small>Producto</small><b>${esc(products.slice(0, 2).join(', ') || 'No especificado')}</b></div></div>
    <div class="ti-detail-tabs"><button class="ti-detail-tab active" data-tab="summary">Resumen</button><button class="ti-detail-tab" data-tab="affected">Afectados (${products.length + versions.length})</button><button class="ti-detail-tab" data-tab="solution">Solución</button><button class="ti-detail-tab" data-tab="references">Referencias (${references.length})</button></div>
    <div class="ti-detail-body"><section class="ti-pane active" data-pane="summary">${loadingDetail ? '<div class="ti-detail-loading">Cargando detalle completo…</div>' : ''}<p>${esc(descriptionOf(item))}</p><div class="ti-data-grid"><div class="ti-data"><small>CVE</small><div class="ti-cve-stack">${cves.length ? cves.map(cve => `<span>${esc(cve)}</span>`).join('') : '<span>No indicado</span>'}</div></div><div class="ti-data"><small>CVSS</small><b>${esc(score ?? 'No disponible')}</b></div><div class="ti-data"><small>EPSS</small><b>${esc(num(item.epss) ?? 'No disponible')}</b></div><div class="ti-data"><small>Explotación</small><b>${(item.known_exploited === true || item._source === 'cisa-kev') ? 'Confirmada' : item.known_exploited === false ? 'No conocida' : 'Sin confirmar'}</b></div></div></section>
    <section class="ti-pane" data-pane="affected"><h4>Productos afectados</h4>${listHtml(products)}<h4>Versiones afectadas</h4>${listHtml(versions)}<h4>Versiones corregidas</h4>${listHtml(fixed)}</section>
    <section class="ti-pane" data-pane="solution"><h4>Solución / remediación</h4><p>${esc(text(item.solution || item.required_action || item.requiredAction || 'Consulte el advisory oficial para conocer la actualización o remediación aplicable.'))}</p><h4>Workaround / mitigación</h4><p>${esc(text(item.workaround || item.mitigation || 'No se ha publicado una mitigación alternativa específica.'))}</p></section>
    <section class="ti-pane" data-pane="references">${listHtml(references.map(reference => reference.title || reference.url))}${(item.url || references[0]?.url) ? `<a class="ti-official" target="_blank" rel="noopener" href="${esc(item.url || references[0].url)}">Abrir fuente oficial ↗</a>` : ''}</section></div>`;

    box.querySelector('.ti-close').onclick = () => box.classList.remove('open');
    box.querySelector('.ti-detail-tabs').onclick = event => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;

      box.querySelectorAll('.ti-detail-tab').forEach(
        tab => tab.classList.toggle('active', tab === button)
      );
      box.querySelectorAll('.ti-pane').forEach(
        pane => pane.classList.toggle(
          'active',
          pane.dataset.pane === button.dataset.tab
        )
      );
    };
  }

  function events() {
    ['tiSeverity', 'tiStatus', 'tiTime'].forEach(id => {
      const element = $(`#${id}`);
      element?.addEventListener('change', () => {
        state.page = 1;
        apply();
      });
    });

    $('#tiSearch')?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      showBusy('Preparando búsqueda…');

      debounceTimer = window.setTimeout(() => {
        state.page = 1;
        apply();
        showBusy('');
      }, 350);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    events();
    loadInitial();
  });
})();
