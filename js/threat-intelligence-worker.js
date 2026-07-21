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

function fixedOf(item) {
  return [...new Set(arr(item.fixed_versions).map(text).filter(Boolean))];
}

function scoreOf(item) {
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
    item.vendor
    || item.vendorProject
    || item.provider
    || item.source
    || item.source_name
    || source.label
    || source.id
    || 'Fuente oficial'
  );
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
    descriptionPreview: description.slice(0, 420),
    cves,
    productsPreview: products.slice(0, 3),
    versionsPreview: versions.slice(0, 3),
    updated_at: dateOf(item),
    cvss: score,
    epss: num(item.epss),
    severity: item.severity || item.risk || item.impact || item.importance || '',
    known_exploited: item.known_exploited,
    enrichment_status: item.enrichment_status,
    publishable: item.publishable,
    sources: arr(item.sources),
  };
}

async function loadSource(source) {
  if (sources.has(source.id)) {
    return sources.get(source.id).compact;
  }

  const response = await fetch(source.url, { cache: 'default' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const full = rootItems(payload).filter(published);
  const compactItems = full.map((item, index) => compact(item, source, index));

  sources.set(source.id, {
    full,
    compact: compactItems,
  });

  return compactItems;
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
      const source = sources.get(message.sourceId);
      const item = source?.full?.[message.recordIndex] || null;

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
      message: error?.message || String(error),
    });
  }
};
