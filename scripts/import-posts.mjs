#!/usr/bin/env node
/**
 * One-time importer: CSV → src/content/posts/*.md
 *
 * Usage:
 *   node scripts/import-posts.mjs [path/to/posts.csv]
 *
 * Defaults to ./data/posts.csv. The CSV must live outside macOS-sandboxed
 * folders like ~/Downloads so Node (and this script) can read it.
 *
 * Behavior:
 *   - Auto-detects common column names (title, date, body/content, slug, tags, url).
 *   - Writes src/content/posts/<YYYY-MM-DD>-<slug>.md.
 *   - Sets draft: true on every imported post — review and flip to false manually.
 *   - Idempotent: skips files that already exist so hand-edits aren't clobbered.
 *   - HTML content is passed through a tiny sanitizer into Markdown-ish text.
 *     Review output before publishing.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outDir = resolve(projectRoot, 'src/content/posts');

const inputPath = resolve(projectRoot, process.argv[2] ?? 'data/posts.csv');

if (!existsSync(inputPath)) {
  console.error(`CSV not found at: ${inputPath}`);
  console.error('Move your CSV somewhere readable (not ~/Downloads) and pass its path.');
  process.exit(1);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const csv = readFileSync(inputPath, 'utf8');

// Minimal RFC 4180-ish CSV parser. Handles quoted fields, embedded commas,
// and "" escapes. Assumes first row is a header.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCsv(csv);
if (rows.length < 2) {
  console.error('CSV has no data rows.');
  process.exit(1);
}

const headers = rows[0].map((h) => h.trim().toLowerCase());

const pickCol = (...candidates) => {
  for (const cand of candidates) {
    const idx = headers.indexOf(cand);
    if (idx !== -1) return idx;
  }
  return -1;
};

const colTitle = pickCol('title', 'name', 'post title', 'subject');
const colDate = pickCol('date to display', 'date', 'published', 'created', 'published at', 'created at', 'publish date');
const colBody = pickCol('post body', 'body', 'content', 'html', 'post', 'text', 'markdown');
const colSlug = pickCol('slug', 'permalink', 'path');
const colTags = pickCol('tags', 'categories', 'topics');
const colUrl = pickCol('url', 'link', 'permalink url', 'wayback url');
const colDesc = pickCol('tl;dr', 'description', 'excerpt', 'summary', 'subtitle');

if (colTitle === -1) {
  console.error(`Couldn't find a title column. Headers seen: ${headers.join(', ')}`);
  process.exit(1);
}

const slugify = (s) =>
  s.toLowerCase()
    .replace(/[\u2018\u2019'"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const toISODate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString().slice(0, 10);
};

const htmlToMd = (html) => {
  if (!html) return '';
  // Very light conversion. Review output before publishing.
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_')
    .replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const yamlEscape = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

let written = 0;
let skipped = 0;
let errors = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row || row.every((c) => !c || !c.trim())) continue;

  const title = (row[colTitle] ?? '').trim();
  if (!title) { skipped++; continue; }

  const isoDate = toISODate(colDate !== -1 ? row[colDate] : null) ?? '1970-01-01';
  const rawSlug = colSlug !== -1 ? row[colSlug]?.trim() : '';
  const slug = rawSlug ? slugify(rawSlug) : slugify(title);
  const filename = `${isoDate}-${slug}.md`;
  const filepath = resolve(outDir, filename);

  if (existsSync(filepath)) {
    skipped++;
    continue;
  }

  const body = colBody !== -1 ? htmlToMd(row[colBody] ?? '') : '';
  const tagsRaw = colTags !== -1 ? (row[colTags] ?? '').trim() : '';
  const tags = tagsRaw ? tagsRaw.split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [];
  const description = colDesc !== -1 ? (row[colDesc] ?? '').trim() : '';
  const legacyUrl = colUrl !== -1 ? (row[colUrl] ?? '').trim() : '';

  const frontmatter = [
    '---',
    `title: ${yamlEscape(title)}`,
    `date: ${isoDate}`,
    description ? `description: ${yamlEscape(description)}` : null,
    tags.length ? `tags: [${tags.map(yamlEscape).join(', ')}]` : null,
    legacyUrl ? `legacyUrl: ${yamlEscape(legacyUrl)}` : null,
    'draft: true',
    '---',
    '',
    body || '_Imported from CSV — expand this post._',
    '',
  ].filter((l) => l !== null).join('\n');

  try {
    writeFileSync(filepath, frontmatter, 'utf8');
    written++;
  } catch (err) {
    console.error(`Failed to write ${filename}: ${err.message}`);
    errors++;
  }
}

console.log(`Imported ${written} posts. Skipped ${skipped} (already exist or empty). Errors: ${errors}.`);
console.log(`All imports are marked draft: true — review and flip to false manually.`);
