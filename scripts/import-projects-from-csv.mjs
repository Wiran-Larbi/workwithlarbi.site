#!/usr/bin/env node
/**
 * Import Webflow projects export → src/content/projects/<slug>.md
 *
 * Usage:
 *   node scripts/import-projects-from-csv.mjs [path/to/projects.csv]
 *
 * Defaults to src/data/projects.csv.
 * Skips harvous (maintain that file by hand) and any slug in `SKIP_SLUGS`. Idempotent: skips existing slugs.
 * Each new inactive row gets a mock `started` date spread across 2024 (CSV created dates are often identical).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outDir = resolve(projectRoot, 'src/content/projects');

const inputPath = resolve(projectRoot, process.argv[2] ?? 'src/data/projects.csv');

if (!existsSync(inputPath)) {
  console.error(`CSV not found at: ${inputPath}`);
  process.exit(1);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const csv = readFileSync(inputPath, 'utf8');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(csv);
if (rows.length < 2) {
  console.error('CSV has no data rows.');
  process.exit(1);
}

const headers = rows[0].map((h) => h.trim());
const col = (name) => {
  const idx = headers.indexOf(name);
  if (idx === -1) {
    console.error(`Missing column: ${name}. Headers: ${headers.join(', ')}`);
    process.exit(1);
  }
  return idx;
};

/** Slugs never auto-imported from CSV (removed or hand-maintained). */
const SKIP_SLUGS = new Set(['harvous', 'ministry-supply-co']);

const cName = col('Name');
const cSlug = col('Slug');
const cTag = col('Tag');
const cBurner = col('Burner Level');

const yamlEscape = (s) => {
  if (s == null) return '""';
  const str = String(s);
  if (/[\n":\[\]{}#&*!|>'"%@`]/.test(str) || str.trim() !== str) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
};

/** Mock `started` spread across 2024 for inactive imports (CSV dates are often identical). */
function mockStartedForInactiveOrdinal(ordinal) {
  const d = new Date(Date.UTC(2024, 0, 12));
  d.setUTCDate(d.getUTCDate() + ordinal * 17);
  return d.toISOString().slice(0, 10);
}

let written = 0;
let skipped = 0;
let inactiveOrdinal = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row || row.every((c) => !c || !String(c).trim())) continue;

  const name = (row[cName] ?? '').trim();
  const slug = (row[cSlug] ?? '').trim().toLowerCase();
  if (!name || !slug) {
    skipped++;
    continue;
  }
  if (SKIP_SLUGS.has(slug)) {
    skipped++;
    continue;
  }

  const filepath = resolve(outDir, `${slug}.md`);
  if (existsSync(filepath)) {
    skipped++;
    continue;
  }

  const tag = (row[cTag] ?? '').trim();
  const burner = (row[cBurner] ?? '').trim();
  const started = mockStartedForInactiveOrdinal(inactiveOrdinal);
  inactiveOrdinal += 1;

  const tagline = tag
    ? `Past portfolio entry — ${tag}.`
    : 'Past portfolio entry from the archive.';

  const lines = [
    '---',
    `name: ${yamlEscape(name)}`,
    `tagline: ${yamlEscape(tagline)}`,
    `started: ${started}`,
    'status: retired',
    'featured: false',
    'order: 0',
  ];
  if (tag) lines.push(`category: ${yamlEscape(tag)}`);
  if (burner) lines.push(`burnerLevel: ${yamlEscape(burner)}`);
  lines.push('---', '', '## About', '', 'A past idea from the portfolio archive; not actively developed.', '');

  try {
    writeFileSync(filepath, lines.join('\n'), 'utf8');
    written++;
  } catch (err) {
    console.error(`Failed to write ${slug}.md: ${err.message}`);
    process.exit(1);
  }
}

console.log(
  `Wrote ${written} project files. Skipped ${skipped} (skip list, existing file, or empty row).`,
);
