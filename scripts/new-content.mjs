import fs from 'node:fs';
import path from 'node:path';

const VALID_TYPES = new Set(['post', 'work', 'project']);
const TODAY = new Date().toISOString().slice(0, 10);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileIfMissing(targetPath, content) {
  if (fs.existsSync(targetPath)) {
    throw new Error(`File already exists: ${targetPath}`);
  }
  fs.writeFileSync(targetPath, content, 'utf8');
}

function scaffoldPost(slug, title) {
  const safeTitle = title ?? slug.replace(/-/g, ' ');
  const fileName = `${TODAY}-${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/posts', fileName);
  const content = `---
title: "${safeTitle}"
date: ${TODAY}
draft: true
---

Write your post here.
`;
  writeFileIfMissing(targetPath, content);
  return targetPath;
}

function scaffoldWork(slug, title) {
  const safeTitle = title ?? slug.replace(/-/g, ' ');
  const fileName = `${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/work', fileName);
  const content = `---
title: "${safeTitle}"
date: ${TODAY}
draft: true
description: ""
---

Write your case study here.
`;
  writeFileIfMissing(targetPath, content);
  return targetPath;
}

function scaffoldProject(slug, title) {
  const safeName = title ?? slug.replace(/-/g, ' ');
  const fileName = `${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/projects', fileName);
  const content = `---
name: "${safeName}"
tagline: "Add a one-line tagline"
status: active
featured: false
draft: true
---

Write your project details here.
`;
  writeFileIfMissing(targetPath, content);
  return targetPath;
}

function printUsage() {
  console.log(
    'Usage: npm run new:content -- --type <post|work|project> --slug <my-slug> [--title "Readable Title"]'
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const type = typeof args.type === 'string' ? args.type : '';
  const rawSlug = typeof args.slug === 'string' ? args.slug : '';
  const title = typeof args.title === 'string' ? args.title : undefined;

  if (!VALID_TYPES.has(type)) {
    printUsage();
    throw new Error('Invalid or missing --type');
  }

  if (!rawSlug) {
    printUsage();
    throw new Error('Missing --slug');
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    throw new Error(`Slug "${rawSlug}" produced an empty value`);
  }

  ensureDir(path.join(process.cwd(), 'src/content/posts'));
  ensureDir(path.join(process.cwd(), 'src/content/work'));
  ensureDir(path.join(process.cwd(), 'src/content/projects'));

  let filePath = '';
  if (type === 'post') filePath = scaffoldPost(slug, title);
  if (type === 'work') filePath = scaffoldWork(slug, title);
  if (type === 'project') filePath = scaffoldProject(slug, title);

  console.log(`Created draft: ${filePath}`);
  console.log('When ready to publish, set `draft: false` and deploy.');
}

main();
