#!/usr/bin/env node

/**
 * AoN API fetch-and-cache utility.
 *
 * Usage:
 *   node scripts/aon-fetch.mjs fetch <output> <query> [--size N]
 *   node scripts/aon-fetch.mjs lookup <file> <name>
 *   node scripts/aon-fetch.mjs list
 *
 * Examples:
 *   # Fetch by ID list
 *   node scripts/aon-fetch.mjs fetch exploration.json 'id:("action-2622" OR "action-2623")' --size 20
 *
 *   # Fetch all Player Core spells
 *   node scripts/aon-fetch.mjs fetch spells-player-core.json 'category:spell AND primary_source:"Player Core"' --size 1000
 *
 *   # Look up an entry in a cached file
 *   node scripts/aon-fetch.mjs lookup exploration-activities.json "Avoid Notice"
 *
 *   # List cached files
 *   node scripts/aon-fetch.mjs list
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const DEV_ROOT = path.resolve(REPO_ROOT, '..');
const CACHE_DIR =
  process.env.AON_CACHE_DIR || path.join(DEV_ROOT, '.aon-cache');
const API_BASE = 'https://elasticsearch.aonprd.com/aon/_search';

// --- Helpers ---

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cachePath(filename) {
  const base = path.basename(filename);
  if (base !== filename) {
    throw new Error(`Invalid cache filename "${filename}": path segments are not allowed.`);
  }
  return path.join(CACHE_DIR, base);
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// --- Commands ---

async function fetchAndCache(outputFile, query, size = 100) {
  ensureCacheDir();
  const dest = cachePath(outputFile);

  // Check cache
  if (fs.existsSync(dest)) {
    const stats = fs.statSync(dest);
    const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    try {
      const raw = fs.readFileSync(dest, 'utf-8');
      const existing = JSON.parse(raw);
      const count = existing.hits?.hits?.length ?? 0;
      console.log(`Cache hit: ${outputFile} (${count} entries, ${ageHours.toFixed(1)}h old)`);
      console.log('Use --force to re-fetch.');
      return existing;
    } catch (e) {
      console.warn(`Warning: failed to parse cache file ${outputFile}: ${e.message}`);
      console.warn('Re-fetching from API.');
      try { fs.unlinkSync(dest); } catch { /* ignore */ }
    }
  }

  // Fetch
  const encoded = encodeURIComponent(query);
  const url = `${API_BASE}?q=${encoded}&size=${size}`;
  console.log(`Fetching: ${url.length > 120 ? url.slice(0, 120) + '...' : url}`);

  const data = await httpsGet(url);
  const total = data.hits?.total?.value ?? 0;
  const returned = data.hits?.hits?.length ?? 0;

  // Validate
  if (total !== returned) {
    console.warn(`WARNING: total=${total} but returned=${returned}. Increase --size to ${total} or higher.`);
  }

  // Write cache
  fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf-8');
  const sizeKB = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(`Cached: ${outputFile} (${returned} entries, ${sizeKB} KB)`);

  return data;
}

async function forceFetchAndCache(outputFile, query, size = 100) {
  ensureCacheDir();
  const dest = cachePath(outputFile);
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  return fetchAndCache(outputFile, query, size);
}

function lookup(filename, searchName) {
  const filepath = cachePath(filename);
  if (!fs.existsSync(filepath)) {
    console.error(`Not found: ${filepath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const hits = data.hits?.hits ?? [];
  const needle = searchName.toLowerCase();

  const matches = hits.filter((h) =>
    h._source?.name?.toLowerCase().includes(needle),
  );

  if (matches.length === 0) {
    console.log(`No matches for "${searchName}" in ${filename}`);
    console.log(
      'Available:',
      hits.map((h) => h._source?.name).join(', '),
    );
    return;
  }

  for (const match of matches) {
    const src = match._source;
    console.log(`\n=== ${src.name} (${src.id}) ===`);
    console.log(`Source: ${src.source_raw?.[0] ?? src.primary_source_raw ?? 'unknown'}`);
    console.log(`Traits: ${src.trait?.join(', ') || 'none'}`);
    console.log(`Category: ${src.category}`);
    if (src.summary) console.log(`Summary: ${src.summary}`);
    console.log(`\n${src.text}`);
  }
}

function listCache() {
  ensureCacheDir();
  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('Cache is empty.');
    return;
  }

  console.log(`\n${CACHE_DIR} (${files.length} files)\n`);
  for (const file of files.sort()) {
    const filepath = cachePath(file);
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const ageHours = ((Date.now() - stats.mtimeMs) / (1000 * 60 * 60)).toFixed(1);

    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      const count = data.hits?.hits?.length ?? '?';
      const total = data.hits?.total?.value ?? '?';
      const valid = count === total ? 'ok' : `INCOMPLETE (${count}/${total})`;
      console.log(`  ${file.padEnd(40)} ${String(count).padStart(4)} entries  ${sizeKB.padStart(7)} KB  ${ageHours.padStart(6)}h  ${valid}`);
    } catch {
      console.log(`  ${file.padEnd(40)} (parse error)  ${sizeKB.padStart(7)} KB`);
    }
  }
  console.log();
}

// --- CLI ---

const args = process.argv.slice(2);
const command = args[0];

if (command === 'fetch') {
  const outputFile = args[1];
  const query = args[2];
  const forceFlag = args.includes('--force');
  const sizeIdx = args.indexOf('--size');
  let size = 100;
  if (sizeIdx !== -1) {
    const parsed = parseInt(args[sizeIdx + 1], 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      console.error('Invalid --size value.');
      console.error('Usage: aon-fetch.mjs fetch <output.json> <query> [--size N] [--force]');
      process.exit(1);
    }
    size = parsed;
  }

  if (!outputFile || !query) {
    console.error('Usage: aon-fetch.mjs fetch <output.json> <query> [--size N] [--force]');
    process.exit(1);
  }

  const fn = forceFlag ? forceFetchAndCache : fetchAndCache;
  fn(outputFile, query, size).catch((e) => {
    console.error('Fetch failed:', e.message);
    process.exit(1);
  });
} else if (command === 'lookup') {
  const filename = args[1];
  const name = args[2];

  if (!filename || !name) {
    console.error('Usage: aon-fetch.mjs lookup <cached-file.json> <name>');
    process.exit(1);
  }

  lookup(filename, name);
} else if (command === 'list') {
  listCache();
} else {
  console.log(`AoN API fetch-and-cache utility

Commands:
  fetch  <output.json> <query> [--size N] [--force]
         Fetch from AoN API and cache result. Skips if cached (use --force to re-fetch).

  lookup <cached-file.json> <name>
         Search for an entry by name in a cached file. Prints full text.

  list
         Show all cached files with entry counts and validation.

Examples:
  node scripts/aon-fetch.mjs fetch exploration.json 'id:("action-2622" OR "action-2623")'
  node scripts/aon-fetch.mjs fetch spells-pc.json 'category:spell AND primary_source:"Player Core"' --size 1000
  node scripts/aon-fetch.mjs lookup exploration-activities.json "Avoid Notice"
  node scripts/aon-fetch.mjs list`);
}
