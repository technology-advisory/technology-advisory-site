import { cp, lstat, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const dist = join(root, 'dist');

// Copy the public site by default. Only development/build/internal material is excluded.
// This avoids having to maintain an allowlist every time a new public section is added.
const EXCLUDED_TOP_LEVEL = new Set([
  '.git',
  '.github',
  '.idea',
  '.vscode',
  '.wrangler',
  'dist',
  'node_modules',
  'scripts'
]);

const EXCLUDED_FILE_NAMES = new Set([
  '.dev.vars',
  '.env',
  '.gitignore',
  'package-lock.json',
  'package.json',
  'pnpm-lock.yaml',
  'wrangler.json',
  'wrangler.jsonc',
  'wrangler.toml',
  'yarn.lock'
]);

const FORBIDDEN_EXTENSIONS = [
  '.bak',
  '.key',
  '.log',
  '.old',
  '.p12',
  '.pem',
  '.pfx',
  '.tmp',
  '.zip'
];

function isReadme(name) {
  return /^readme(?:[._-].*)?\.md$/i.test(name);
}

function isExcludedFile(name) {
  const lower = name.toLowerCase();

  if (EXCLUDED_FILE_NAMES.has(name) || EXCLUDED_FILE_NAMES.has(lower)) return true;
  if (isReadme(name)) return true;
  if (lower.endsWith('.md')) return true;
  if (lower.startsWith('.env.')) return true;
  if (lower.startsWith('.dev.vars.')) return true;
  return FORBIDDEN_EXTENSIONS.some(extension => lower.endsWith(extension));
}

function displayPath(path) {
  return relative(root, path).split(sep).join('/');
}

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

const rootEntries = await readdir(root, { withFileTypes: true });
let copiedTopLevel = 0;
let excludedTopLevel = 0;
const excludedFiles = [];

for (const entry of rootEntries) {
  if (EXCLUDED_TOP_LEVEL.has(entry.name)) {
    excludedTopLevel += 1;
    continue;
  }

  if (entry.isFile() && isExcludedFile(entry.name)) {
    excludedFiles.push(entry.name);
    continue;
  }

  const source = join(root, entry.name);
  const destination = join(dist, entry.name);

  // Do not publish symlinks. They can make the build depend on content outside the repository tree.
  const metadata = await lstat(source);
  if (metadata.isSymbolicLink()) {
    throw new Error(`Build failed: symbolic link not allowed in production artifact: ${displayPath(source)}`);
  }

  await cp(source, destination, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
    filter: async sourcePath => {
      if (sourcePath === source) return true;

      const name = basename(sourcePath);
      const sourceMeta = await lstat(sourcePath);

      if (sourceMeta.isSymbolicLink()) {
        throw new Error(`Build failed: symbolic link not allowed in production artifact: ${displayPath(sourcePath)}`);
      }

      if (sourceMeta.isFile() && isExcludedFile(name)) {
        excludedFiles.push(displayPath(sourcePath));
        return false;
      }

      return true;
    }
  });

  copiedTopLevel += 1;
}

// Fail closed if a sensitive/development artifact somehow survived the copy filter.
async function scanPublishedTree(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_TOP_LEVEL.has(entry.name)) {
        throw new Error(`Forbidden production directory detected: ${relative(dist, full)}`);
      }
      await scanPublishedTree(full);
      continue;
    }

    if (isExcludedFile(entry.name)) {
      throw new Error(`Forbidden production artifact detected: ${relative(dist, full)}`);
    }
  }
}

await scanPublishedTree(dist);

const requiredPaths = [
  'index.html',
  '.well-known/security.txt'
];

for (const requiredPath of requiredPaths) {
  if (!(await exists(join(dist, requiredPath)))) {
    throw new Error(`Build failed: dist/${requiredPath} is missing.`);
  }
}

// Regression guard for the section that exposed the old allowlist problem.
if (await exists(join(root, 'sobre-mi'))) {
  if (!(await exists(join(dist, 'sobre-mi')))) {
    throw new Error('Build failed: public section sobre-mi/ exists in source but was not published.');
  }
}

console.log(`Cloudflare Pages artifact ready: ${copiedTopLevel} top-level public entries copied to dist/.`);
console.log(`Excluded ${excludedTopLevel} development directories and ${excludedFiles.length} non-public files.`);
