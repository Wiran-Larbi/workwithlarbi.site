#!/usr/bin/env node
/**
 * Works CSV → src/content/work/<slug>.md + public/images/work/<slug>/*
 *
 * Usage:
 *   node scripts/import-work.mjs <path/to/works.csv> [--dry-run]
 *
 * Only updates slugs that already have a matching .md in src/content/work.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const workContentDir = resolve(projectRoot, 'src/content/work');
const publicWorkImagesRoot = resolve(projectRoot, 'public/images/work');

const DRY = process.argv.includes('--dry-run') || process.argv.includes('--dryRun');
const argvArgs = process.argv.slice(2).filter((a) => a !== '--dry-run' && a !== '--dryRun');
const inputPath = resolve(projectRoot, argvArgs[0] ?? 'data/works.csv');

if (!existsSync(inputPath)) {
  console.error(`CSV not found at: ${inputPath}`);
  process.exit(1);
}

if (!DRY) {
  if (!existsSync(workContentDir)) mkdirSync(workContentDir, { recursive: true });
  if (!existsSync(publicWorkImagesRoot)) mkdirSync(publicWorkImagesRoot, { recursive: true });
}

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

const headers = rows[0].map((h) => h.trim().toLowerCase());
const col = (name) => {
  const idx = headers.indexOf(name);
  return idx === -1 ? -1 : idx;
};

const getCell = (row, ...names) => {
  for (const n of names) {
    const i = col(n);
    if (i !== -1 && row[i] != null) return String(row[i]).trim();
  }
  return '';
};

const toISODate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString().slice(0, 10);
};

const parseBool = (s) => {
  if (s == null || s === '') return false;
  return String(s).toLowerCase() === 'true';
};

const htmlToMd = (html) => {
  if (!html) return '';
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

const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const yamlEscape = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** YAML multiline block for frontmatter: `| + indented lines` */
const yamlLiteralBlock = (s) => {
  if (!s?.trim()) return null;
  const lines = s.replace(/\r\n/g, '\n').split('\n');
  return `|\n${lines.map((l) => `  ${l}`).join('\n')}`;
};

function extFromUrl(u) {
  try {
    const p = new URL(u).pathname;
    const e = extname(p);
    if (e && e.length >= 1 && e.length <= 5) return e.toLowerCase();
  } catch {
    /* ignore */
  }
  return '.webp';
}

function splitUrls(s) {
  if (!s) return [];
  return s
    .split(/;/)
    .map((p) => p.trim())
    .filter((p) => /^https?:\/\//i.test(p));
}

const existingSlugs = new Map();
for (const f of readdirSync(workContentDir)) {
  if (!f.endsWith('.md')) continue;
  const slug = f.replace(/\.md$/, '');
  existingSlugs.set(slug, join(workContentDir, f));
}

async function downloadTo(url, destFile) {
  if (DRY) return;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'heyderekj-site-import/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(destFile), { recursive: true });
  await writeFile(destFile, buf);
}

let updated = 0;
let skippedNoSlug = 0;
let skippedNoFile = 0;
let downloadErrors = 0;
const missingSlugs = [];

async function run() {
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((c) => !c || !String(c).trim())) continue;

    const name = getCell(row, 'name');
    const slug = getCell(row, 'slug');
    if (!slug) {
      skippedNoSlug++;
      continue;
    }

    const mdPath = existingSlugs.get(slug);
    if (!mdPath) {
      missingSlugs.push(slug);
      skippedNoFile++;
      continue;
    }

    const archived = parseBool(getCell(row, 'archived'));
    const draft = parseBool(getCell(row, 'draft'));
    const highlight = parseBool(getCell(row, 'highlight'));

    const workType = getCell(row, 'work type');
    const industryRaw = getCell(row, 'industry');
    const industry = industryRaw
      .split(/;/)
      .map((s) => s.trim())
      .filter(Boolean);

    const dateCompletedRaw = getCell(row, 'date completed');
    const publishedOn = getCell(row, 'published on');
    const dateIso =
      toISODate(dateCompletedRaw) ?? toISODate(publishedOn) ?? toISODate(getCell(row, 'created on'));
    if (!dateIso) {
      console.error(`No parseable date for slug=${slug}, skipping.`);
      skippedNoFile++;
      continue;
    }

    const weeksCell = getCell(row, 'number of weeks to complete');
    let weeksToComplete;
    if (weeksCell) {
      const n = Number(weeksCell);
      if (!Number.isNaN(n) && String(weeksCell).trim() === String(n)) weeksToComplete = n;
      else weeksToComplete = weeksCell;
    }

    const thumbnailUrl = getCell(row, 'thumbnail');
    const desktopUrl = getCell(row, 'desktop');
    const mobileUrl = getCell(row, 'mobile');
    const allWorkRaw = getCell(row, 'all work');
    const galleryUrls = splitUrls(allWorkRaw);

    const liveLink = getCell(row, 'live link');
    const wayback = getCell(row, 'wayback url');
    const partnership = getCell(row, 'partnership');
    const partnershipWorkLink =
      getCell(row, 'partnership work link') || getCell(row, 'partnership link');
    const brief = htmlToMd(getCell(row, 'brief'));
    const problem = htmlToMd(getCell(row, 'problem'));
    const solution = htmlToMd(getCell(row, 'solution'));
    const specificWork = htmlToMd(getCell(row, 'specific work'));
    const postBodyHtml = getCell(row, 'post body');
    const postBodyMd = htmlToMd(postBodyHtml);
    const soloOrAgency = getCell(row, 'solo or agency');
    const estimatedTimeSpent = getCell(row, 'estimated time spent');

    let desc = '';
    if (brief) desc = stripTags(brief).slice(0, 220);
    else if (postBodyMd) desc = postBodyMd.replace(/\n/g, ' ').slice(0, 220);
    if (desc.length > 200) desc = desc.slice(0, 199) + '…';

    const outDir = join(publicWorkImagesRoot, slug);
    const publicPrefix = `/images/work/${slug}`;

    let thumbnail;
    let desktop;
    let mobile;
    const gallery = [];

    async function fetchOne(url, fileBase) {
      if (!url) return null;
      const ext = extFromUrl(url);
      const fileName = `${fileBase}${ext}`;
      const dest = join(outDir, fileName);
      const pubPath = `${publicPrefix}/${fileName}`;
      try {
        if (DRY) {
          console.log(`[dry-run] would download ${url} → ${dest}`);
          return pubPath;
        }
        if (existsSync(dest) && statSync(dest).size > 0) return pubPath;
        await downloadTo(url, dest);
      } catch (e) {
        console.error(`Download failed [${slug}] ${url}:`, e?.message || e);
        downloadErrors++;
        return null;
      }
      return pubPath;
    }

    if (thumbnailUrl) thumbnail = await fetchOne(thumbnailUrl, 'thumbnail');
    if (desktopUrl) desktop = await fetchOne(desktopUrl, 'desktop');
    if (mobileUrl) mobile = await fetchOne(mobileUrl, 'mobile');
    for (let i = 0; i < galleryUrls.length; i++) {
      const idx = String(i + 1).padStart(2, '0');
      const p = await fetchOne(galleryUrls[i], `gallery-${idx}`);
      if (p) gallery.push(p);
    }

    const fm = [];
    fm.push('---');
    fm.push(`title: ${yamlEscape(name || slug)}`);
    fm.push(`date: ${dateIso}`);

    if (desc) fm.push(`description: ${yamlEscape(desc)}`);
    fm.push(`draft: ${draft}`);
    if (archived) fm.push(`archived: ${archived}`);
    if (highlight) fm.push(`highlight: ${highlight}`);
    if (workType) fm.push(`workType: ${yamlEscape(workType)}`);

    if (industry.length) {
      fm.push('industry:');
      for (const ind of industry) fm.push(`  - ${yamlEscape(ind)}`);
    }

    fm.push(`dateCompleted: ${dateIso}`);

    if (weeksToComplete !== undefined) {
      if (typeof weeksToComplete === 'number') fm.push(`weeksToComplete: ${weeksToComplete}`);
      else fm.push(`weeksToComplete: ${yamlEscape(String(weeksToComplete))}`);
    }

    if (thumbnail) fm.push(`thumbnail: ${yamlEscape(thumbnail)}`);
    if (desktop) fm.push(`desktop: ${yamlEscape(desktop)}`);
    if (mobile) fm.push(`mobile: ${yamlEscape(mobile)}`);
    if (gallery.length) {
      fm.push('gallery:');
      for (const g of gallery) fm.push(`  - ${yamlEscape(g)}`);
    }

    if (liveLink) {
      try {
        new URL(liveLink);
        fm.push(`liveLink: ${yamlEscape(liveLink)}`);
      } catch {
        /* skip bad url */
      }
    }
    if (wayback) {
      try {
        new URL(wayback);
        fm.push(`waybackUrl: ${yamlEscape(wayback)}`);
      } catch {
        /* skip */
      }
    }
    if (partnership) fm.push(`partnership: ${yamlEscape(partnership)}`);
    if (partnershipWorkLink) {
      try {
        new URL(partnershipWorkLink);
        fm.push(`partnershipWorkLink: ${yamlEscape(partnershipWorkLink)}`);
      } catch {
        /* skip */
      }
    }
    if (soloOrAgency) fm.push(`soloOrAgency: ${yamlEscape(soloOrAgency)}`);
    if (estimatedTimeSpent) fm.push(`estimatedTimeSpent: ${yamlEscape(estimatedTimeSpent)}`);

    const bb = yamlLiteralBlock(brief);
    if (bb) fm.push(`brief: ${bb}`);
    const bp = yamlLiteralBlock(problem);
    if (bp) fm.push(`problem: ${bp}`);
    const bs = yamlLiteralBlock(solution);
    if (bs) fm.push(`solution: ${bs}`);
    const bsp = yamlLiteralBlock(specificWork);
    if (bsp) fm.push(`specificWork: ${bsp}`);

    if (industry.length) {
      fm.push('tags:');
      for (const ind of industry) fm.push(`  - ${yamlEscape(ind)}`);
    }

    fm.push('---');

    const body = postBodyMd
      ? `${postBodyMd}\n`
      : brief || problem || solution || specificWork
        ? ''
        : '_Imported from CSV — expand this post._\n';

    const out = `${fm.join('\n')}\n\n${body}`;

    if (DRY) {
      console.log(`[dry-run] would write ${mdPath} (${slug})`);
    } else {
      writeFileSync(mdPath, out, 'utf8');
    }
    updated++;
  }

  console.log(`Done. Updated ${updated} work files.`);
  if (missingSlugs.length) {
    console.log(`Missing local work files (skipped): ${[...new Set(missingSlugs)].join(', ')}`);
  }
  console.log(
    `Skipped: no slug=${skippedNoSlug}, no matching file=${skippedNoFile}. Download errors: ${downloadErrors}.`,
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
