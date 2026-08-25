import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = join(root, 'dist');

// Production content expected in the repository root.
const INCLUDE = [
  '404.html',
  'CNAME',
  'index.html',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  '.well-known',
  'arquitectura',
  'assets',
  'css',
  'data',
  'gobernanza',
  'images',
  'img',
  'js',
  'legal',
  'operaciones',
  'referencias',
  'seguridad',
  'tools'
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

let copied = 0;
for (const item of INCLUDE) {
  const source = join(root, item);
  if (!(await exists(source))) continue;

  await cp(source, join(dist, item), {
    recursive: true,
    force: true,
    preserveTimestamps: true
  });
  copied += 1;
}

// Defensive checks: files that should never be part of the published artifact.
const forbiddenNames = new Set([
  'README.md',
  'README_SECURITY_CLEANUP.md',
  '.env',
  '.dev.vars',
  'wrangler.jsonc',
  'wrangler.toml',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
]);

async function scan(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await scan(full);
      continue;
    }

    const lower = entry.name.toLowerCase();
    if (
      forbiddenNames.has(entry.name) ||
      lower.endsWith('.bak') ||
      lower.endsWith('.old') ||
      lower.endsWith('.tmp') ||
      lower.endsWith('.log') ||
      lower.endsWith('.zip') ||
      lower.endsWith('.pem') ||
      lower.endsWith('.key') ||
      lower.endsWith('.p12') ||
      lower.endsWith('.pfx')
    ) {
      throw new Error(`Forbidden production artifact detected: ${full.slice(dist.length + 1)}`);
    }
  }
}

await scan(dist);

if (!(await exists(join(dist, 'index.html')))) {
  throw new Error('Build failed: dist/index.html is missing.');
}

if (!(await exists(join(dist, '.well-known', 'security.txt')))) {
  throw new Error('Build failed: dist/.well-known/security.txt is missing.');
}

console.log(`Cloudflare Pages artifact ready: ${copied} top-level production entries copied to dist/.`);
