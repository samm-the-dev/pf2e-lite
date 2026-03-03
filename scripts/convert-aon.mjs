/**
 * AoN -> Clean Markdown Converter
 *
 * Reads AoN Elasticsearch cache, strips boilerplate markup,
 * outputs clean markdown files per chapter into rules/.
 *
 * Usage: node scripts/convert-aon.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// === Configuration ===

const CACHE_DIR = 'c:/Dev/.aon-cache';
const OUTPUT_DIR = join(PROJECT_ROOT, 'rules');

// Map AoN breadcrumb[0] -> output file slug
const CHAPTER_MAP = {
  'Chapter 1: Introduction': '01-introduction',
  'Chapter 2: Ancestries & Backgrounds': '02-ancestries-and-backgrounds',
  'Chapter 3: Classes': '03-classes',
  'Chapter 4: Skills': '04-skills',
  'Chapter 5: Feats': '05-feats-and-dedications',
  'Chapter 6: Equipment': '06-equipment',
  'Chapter 7: Spells': '07-spells',
  'Chapter 8: Playing the Game': '08-playing-the-game',
  // Appendices & special sections -> merge into nearest chapter
  'Conditions Appendix': '08-playing-the-game',
  'Snares': '06-equipment',
};

const CHAPTER_TITLES = {
  '01-introduction': 'Introduction',
  '02-ancestries-and-backgrounds': 'Ancestries & Backgrounds',
  '03-classes': 'Classes',
  '04-skills': 'Skills',
  '05-feats-and-dedications': 'Feats & Dedications',
  '06-equipment': 'Equipment',
  '07-spells': 'Spells',
  '08-playing-the-game': 'Playing the Game',
  '09-game-mastering': 'Game Mastering',
};

// Sections to strip from output (Golarion product identity — not ORC-licensed).
// An entry is removed if its name OR any breadcrumb matches a target string.
const SECTIONS_TO_REMOVE = {
  '01-introduction': ['Golarion and the Inner Sea', 'Religion', 'Golarion'],
};

const ACTION_ICONS = {
  'Single Action': '\u25C6',
  'Two Actions': '\u25C6\u25C6',
  'Three Actions': '\u25C6\u25C6\u25C6',
  'Reaction': '\u21BA',
  'Free Action': '\u25C7',
};

// === Helpers ===

function loadCache(filename) {
  const raw = JSON.parse(readFileSync(join(CACHE_DIR, filename), 'utf8'));
  return raw.hits.hits.map((h) => h._source);
}

function extractUrlId(url) {
  const m = url && url.match(/ID=(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Should this entry be stripped? Matches entry name and breadcrumb ancestry. */
function shouldRemoveEntry(entry, slug) {
  const targets = SECTIONS_TO_REMOVE[slug];
  if (!targets) return false;
  if (targets.includes(entry.name)) return true;
  if (entry.breadcrumbs) {
    for (const crumb of entry.breadcrumbs) {
      if (targets.includes(crumb)) return true;
    }
  }
  return false;
}

/** Breadcrumb depth -> heading level (h2-h5). h1 reserved for chapter title. */
function headingLevel(entry) {
  const depth = (entry.breadcrumbs || []).length;
  return Math.max(2, Math.min(depth + 1, 5));
}

/** Strip AoN link syntax: [text](/Foo.aspx?ID=123) -> text */
function stripAonLink(text) {
  return text.replace(/\[([^\]]*)\]\(\/[^)]*\.aspx[^)]*\)/g, '$1');
}

// === Core conversion ===

function stripBoilerplate(markdown, entryLevel) {
  let m = markdown || '';

  // 1. Normalize line endings
  m = m.replace(/\r\n/g, '\n');

  // 2. Convert <aside> blocks -> blockquotes (before stripping titles)
  m = m.replace(/<aside[^>]*>\s*([\s\S]*?)\s*<\/aside>/g, (_, inner) => {
    let c = inner;
    // Convert <title> inside aside -> bold line with trailing newline
    c = c.replace(/<title[^>]*>([\s\S]*?)<\/title>/g, (_, t) => {
      return '**' + stripAonLink(t).trim() + '**\n\n';
    });
    // Handle <br /> inside aside BEFORE line splitting
    c = c.replace(/<br\s*\/?>/g, '\n');
    // Handle lists inside aside
    c = c.replace(/<ul>\s*/g, '\n');
    c = c.replace(/<\/ul>\s*/g, '\n');
    c = c.replace(/<li>([\s\S]*?)<\/li>/g, (_, content) => '- ' + content.trim() + '\n');
    // Collapse blank lines inside aside
    c = c.replace(/\n{3,}/g, '\n\n');
    const lines = c.trim().split('\n');
    return '\n' + lines.map((l) => '> ' + l).join('\n') + '\n';
  });

  // 3. Remove entry-level <title level="1"> (we emit our own heading)
  m = m.replace(/<title\s+level="1"[^>]*>[\s\S]*?<\/title>\s*/g, '');

  // 4. Convert remaining <title level="2"...> -> sub-heading
  m = m.replace(/<title[^>]*>([\s\S]*?)<\/title>/g, (_, content) => {
    const plain = stripAonLink(content).trim();
    const hashes = '#'.repeat(Math.min(entryLevel + 1, 6));
    return '\n' + hashes + ' ' + plain + '\n';
  });

  // 5. Remove **Source** line (entire line)
  m = m.replace(/\*\*Source\*\*[^\n]*\n*/g, '');

  // 6. Remove layout wrapper tags
  m = m.replace(/<row[^>]*>\s*/g, '');
  m = m.replace(/<\/row>\s*/g, '');
  m = m.replace(/<column[^>]*>\s*/g, '');
  m = m.replace(/<\/column>\s*/g, '');

  // 7. Remove <document> self-closing references
  m = m.replace(/<document[^>]*\/>\s*/g, '');

  // 8. Remove <traits> blocks
  m = m.replace(/<traits>[\s\S]*?<\/traits>\s*/g, '');

  // 9. Convert <actions string="..."/> -> unicode icons
  m = m.replace(/<actions\s+string="([^"]*)"[^>]*\/>/g, (_, action) => {
    return ACTION_ICONS[action] || action;
  });

  // 10. Convert <ul><li> -> markdown bulleted list
  m = m.replace(/<ul>\s*/g, '\n');
  m = m.replace(/<\/ul>\s*/g, '\n');
  m = m.replace(/<li>([\s\S]*?)<\/li>/g, (_, content) => '- ' + content.trim() + '\n');

  // 11. Convert <ol><li> -> markdown numbered list
  m = m.replace(/<ol>\s*/g, '\n');
  m = m.replace(/<\/ol>\s*/g, '\n');
  // Numbered lists: use "1." for all (markdown auto-numbers)
  m = m.replace(/<li>([\s\S]*?)<\/li>/g, (_, content) => '1. ' + content.trim() + '\n');

  // 12. Convert <br /> and <br> -> newline
  m = m.replace(/<br\s*\/?>/g, '\n');

  // 13. Strip <center> tags (keep content)
  m = m.replace(/<center>/g, '');
  m = m.replace(/<\/center>/g, '');

  // 14. Strip <hr> / <hr />
  m = m.replace(/<hr\s*\/?>/g, '\n---\n');

  // 15. Strip AoN internal links -> plain text
  m = stripAonLink(m);

  // 16. Strip edition markers
  m = m.replace(/<sup>2\.0<\/sup>/g, '');

  // 17. Remove <image> tags
  m = m.replace(/<image[^>]*\/>\s*/g, '');

  // 18. Collapse 3+ blank lines -> 2
  m = m.replace(/\n{3,}/g, '\n\n');

  return m.trim();
}

function convertEntry(entry) {
  const level = headingLevel(entry);
  const heading = '#'.repeat(level) + ' ' + entry.name;
  const body = stripBoilerplate(entry.markdown, level);

  if (!body) return heading + '\n';
  return heading + '\n\n' + body + '\n';
}

// === Main ===

const pcEntries = loadCache('player-core-rules.json');
const pc2Entries = loadCache('player-core-2-rules.json');

console.log(
  'Loaded: ' + pcEntries.length + ' PC1 entries, ' + pc2Entries.length + ' PC2 entries',
);

// Group entries by chapter slug
const buckets = {};
const unmapped = [];

function addEntry(entry) {
  const chName = (entry.breadcrumbs && entry.breadcrumbs[0]) || 'NONE';
  let slug = CHAPTER_MAP[chName];

  // Entries with no breadcrumbs whose name IS a chapter name -> map by name
  if (!slug && chName === 'NONE') {
    slug = CHAPTER_MAP[entry.name];
  }

  if (!slug) {
    unmapped.push({ name: entry.name, chapter: chName, url: entry.url });
    return;
  }
  if (!buckets[slug]) buckets[slug] = [];
  buckets[slug].push(entry);
}

for (const e of pcEntries) addEntry(e);
for (const e of pc2Entries) addEntry(e);

// Sort entries within each chapter by URL ID (reliable ordering)
for (const slug of Object.keys(buckets)) {
  buckets[slug].sort((a, b) => extractUrlId(a.url) - extractUrlId(b.url));
}

// Report unmapped
if (unmapped.length > 0) {
  console.log('\nUnmapped entries (' + unmapped.length + '):');
  for (const u of unmapped) {
    console.log('  "' + u.chapter + '" -> ' + u.name + ' (' + u.url + ')');
  }
}

// Write chapter files
mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [slug, entries] of Object.entries(buckets).sort()) {
  const title = CHAPTER_TITLES[slug] || slug;
  let content = '# ' + title + '\n\n';

  let removed = 0;
  for (const entry of entries) {
    if (shouldRemoveEntry(entry, slug)) {
      removed++;
      continue;
    }
    content += convertEntry(entry) + '\n\n';
  }

  // Clean trailing whitespace
  content = content.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

  const outPath = join(OUTPUT_DIR, slug + '.md');
  writeFileSync(outPath, content, 'utf8');

  const kb = (content.length / 1024).toFixed(1);
  const removedNote = removed > 0 ? ' (' + removed + ' stripped)' : '';
  console.log('  ' + slug + '.md -- ' + entries.length + ' entries, ' + kb + ' KB' + removedNote);
}

// Stub chapters with no AoN data
for (const [slug, title] of Object.entries(CHAPTER_TITLES)) {
  if (!buckets[slug]) {
    const stub = '# ' + title + '\n\nContent pending -- refer to PF2e Player Core for now.\n';
    const outPath = join(OUTPUT_DIR, slug + '.md');
    writeFileSync(outPath, stub, 'utf8');
    console.log('  ' + slug + '.md -- STUB (no AoN data)');
  }
}

console.log('\nDone!');
