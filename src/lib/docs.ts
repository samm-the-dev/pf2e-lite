import fs from 'fs';
import path from 'path';

const RULES_DIR = path.join(process.cwd(), 'rules');

/** Ordered chapter slugs matching PF2e Player Core + GM Core layout. */
const CHAPTER_ORDER = [
  '01-introduction',
  '02-ancestries-and-backgrounds',
  '03-classes',
  '04-skills',
  '05-feats-and-dedications',
  '06-equipment',
  '07-spells',
  '08-playing-the-game',
  '09-game-mastering',
];

export interface DocMeta {
  slug: string;
  title: string;
}

/** Extract first # heading from markdown content. */
export function getDocTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

/** Read raw markdown content for a slug. */
export function getDocContent(slug: string): string {
  const filePath = path.join(RULES_DIR, `${slug}.md`);
  return fs.readFileSync(filePath, 'utf-8');
}

/** Get all chapter slugs that exist on disk, in display order. */
export function getDocSlugs(): string[] {
  const files = fs.readdirSync(RULES_DIR).filter((f) => f.endsWith('.md'));
  const slugs = files.map((f) => f.replace(/\.md$/, ''));
  return CHAPTER_ORDER.filter((s) => slugs.includes(s));
}

/** Get metadata (slug + title) for all chapters. */
export function getAllDocs(): DocMeta[] {
  return getDocSlugs().map((slug) => {
    const content = getDocContent(slug);
    return { slug, title: getDocTitle(content) };
  });
}
