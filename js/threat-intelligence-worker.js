'use strict';

const sources = new Map();

const text = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const arr = value => Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);
const num = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function rootItems(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.items
    || payload?.records
    || payload?.vulnerabilities
    || payload?.advisories
    || payload?.alerts
    || [];
}

function cvesOf(item) {
  return [...new Set([
    ...arr(item.cves),
    ...arr(item.aliases),
    item.cveID,
    item.cve_id,
  ].map(text).filter(value => /^CVE-\d{4}-\d+/i.test(value)))];
}

function productsOf(item) {
  return [...new Set([
    ...arr(item.products),
    ...arr(item.affected_products),
    ...arr(item.affected_resources),
    ...arr(item.product),
  ].map(text).filter(Boolean))];
}

function versionsOf(item) {
  return [...new Set([
    ...arr(item.affected_versions),
    ...arr(item.versions),
  ].map(text).filter(Boolean))];
}

function scoreOf(item) {
  for (const key of [
    'cvss',
    'cvss_score',
    'baseScore',
    'base_score',
    'cvss_max',
    'max_cvss',
    '_linkedCvss',
  ]) {
    const value = num(item[key]);
    if (value !== null && value >= 0 && value <= 10) return value;
  }
  return null;
}

function dateOf(item) {
  return item.updated_at
    || item.published_at
    || item.date_updated
    || item.date_published
    || item.dateAdded
    || item.date_added
    || item.last_updated_at
    || '';
}

function idOf(item) {
  return text(
    item.advisory_id
    || item.record_id
    || item.cveID
    || item.cve_id
    || item.incibe_id
    || item.id
    || cvesOf(item)[0]
    || 'Sin identificador'
  );
}

function providerOf(item, source) {
  return text(
    arr(item.manufacturers)[0]
    || arr(item.vendor)[0]
    || item.vendor
    || item.vendorProject
    || item.provider
    || item.source
    || item.source_name
    || source.label
    || source.id
    || 'Fuente oficial'
  );
}

function exploitedOf(item, source) {
  if (source?.id === 'cisa-kev') return true;
  if (item.known_exploited === true || item.exploited === true || item.exploitation_status === 'exploited') return true;
  if (item.known_exploited === false || item.exploited === false || item.exploitation_status === 'no_evidence') return false;
  return null;
}

function descriptionOf(item) {
  return text(
    item.description
    || item.shortDescription
    || item.summary
    || item.detail
    || item.notes
    || 'Sin descripción disponible.'
  );
}

function published(item) {
  return item.publishable !== false
    && !['discovery_only', 'error'].includes(item.enrichment_status);
}

function compact(item, source, index) {
  const cves = cvesOf(item);
  const products = productsOf(item);
  const versions = versionsOf(item);
  const id = idOf(item);
  const title = text(item.title || item.vulnerabilityName || id);
  const provider = providerOf(item, source);
  const description = descriptionOf(item);
  const score = scoreOf(item);

  return {
    _source: source.id,
    _label: source.label,
    _sourceColor: source.color || '#07884a',
    _recordIndex: index,
    _chunk: text(item.chunk),
    _searchText: [
      id,
      title,
      description,
      provider,
      cves.join(' '),
      products.join(' '),
      versions.join(' '),
    ].join(' ').toLowerCase(),
    advisory_id: id,
    title,
    provider,
    descriptionPreview: description === 'Sin descripción disponible.' ? '' : description.slice(0, 420),
    cves,
    productsPreview: products.slice(0, 3),
    versionsPreview: versions.slice(0, 3),
    updated_at: dateOf(item),
    cvss: score,
    epss: num(item.epss),
    severity: (() => {
      if (typeof item.importance === 'number') {
        if (item.importance >= 5) return 'critical';
        if (item.importance >= 4) return 'high';
        if (item.importance >= 3) return 'medium';
        return 'low';
      }
      return item.severity || item.risk || item.impact || item.importance || '';
    })(),
    known_exploited: exploitedOf(item, source),
    enrichment_status: item.enrichment_status,
    publishable: item.publishable,
    sources: arr(item.sources),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'default' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadSource(source) {
  if (sources.has(source.id)) {
    const state = sources.get(source.id);
    if (state.compact) return state.compact;
    throw new Error(`La fuente ${source.id} ya está cargada`);
  }

  const payload = await fetchJson(source.url);
  const full = rootItems(payload).filter(published);
  const compactItems = full.map((item, index) => compact(item, source, index));
  const chunkedIndex = source.mode === 'index-chunks';

  // En fuentes index+chunks no retenemos el índice original ni una segunda copia
  // compacta en el Worker. El navegador conserva la copia que recibe por postMessage;
  // para el detalle enviará id/chunk de vuelta y aquí solo cacheamos chunks visitados.
  sources.set(source.id, {
    source,
    full: chunkedIndex ? null : full,
    compact: chunkedIndex ? null : compactItems,
    chunks: new Map(),
    chunkOrder: [],
  });

  return compactItems;
}

function safeChunkId(value) {
  const id = text(value).trim();
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id) ? id : '';
}

function chunkUrl(source, chunkId) {
  const safeId = safeChunkId(chunkId);
  if (!safeId) throw new Error('Identificador de chunk no válido');
  const file = `${safeId}.json`;
  if (source.chunkBaseUrl) {
    return new URL(file, source.chunkBaseUrl.endsWith('/') ? source.chunkBaseUrl : `${source.chunkBaseUrl}/`).href;
  }
  return new URL(`chunks/${file}`, source.url).href;
}

async function loadChunk(sourceState, chunkId) {
  const safeId = safeChunkId(chunkId);
  if (!safeId) return null;

  if (sourceState.chunks.has(safeId)) {
    sourceState.chunkOrder = sourceState.chunkOrder.filter(id => id !== safeId);
    sourceState.chunkOrder.push(safeId);
    return sourceState.chunks.get(safeId);
  }

  const payload = await fetchJson(chunkUrl(sourceState.source, safeId));
  const records = rootItems(payload);
  sourceState.chunks.set(safeId, records);
  sourceState.chunkOrder.push(safeId);

  // Mantener solo unos pocos chunks visitados. Nunca precargar el catálogo completo.
  while (sourceState.chunkOrder.length > 3) {
    const oldest = sourceState.chunkOrder.shift();
    sourceState.chunks.delete(oldest);
  }

  return records;
}

async function detailItem(sourceId, recordIndex, reference = null) {
  const sourceState = sources.get(sourceId);
  if (!sourceState) return null;

  if (sourceState.source.mode !== 'index-chunks') {
    return sourceState.full?.[recordIndex] || null;
  }

  const chunkId = safeChunkId(reference?.chunk);
  const wantedId = text(reference?.id);
  if (!chunkId || !wantedId) return null;

  const records = await loadChunk(sourceState, chunkId);
  return records?.find(record => idOf(record) === wantedId) || null;
}

self.onmessage = async event => {
  const message = event.data || {};

  try {
    if (message.type === 'load') {
      self.postMessage({
        type: 'progress',
        sourceId: message.source.id,
        status: 'loading',
      });

      const items = await loadSource(message.source);

      self.postMessage({
        type: 'loaded',
        sourceId: message.source.id,
        items,
        count: items.length,
      });
      return;
    }

    if (message.type === 'detail') {
      const item = await detailItem(message.sourceId, message.recordIndex, message.reference);

      self.postMessage({
        type: 'detail',
        requestId: message.requestId,
        sourceId: message.sourceId,
        recordIndex: message.recordIndex,
        item,
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      sourceId: message.source?.id || message.sourceId || '',
      requestId: message.requestId,
      message: error?.message || String(error),
    });
  }
};
