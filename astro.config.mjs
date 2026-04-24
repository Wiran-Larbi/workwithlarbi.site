import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** HTTP redirects for old `/posts/…` URLs → `/work/…` (tag `work` in frontmatter). */
function workPostRedirects() {
  const dir = join(__dirname, 'src/content/posts');
  const out = {};
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, name), 'utf8');
    const m = raw.match(/^---([\s\S]*?)\n---/);
    if (!m || !/tags:\s*\[[^\]]*\bwork\b[^\]]*\]/m.test(m[1])) continue;
    const slug = name.replace(/\.md$/, '');
    out[`/posts/${slug}`] = `/work/${slug}`;
    out[`/posts/${slug}/`] = `/work/${slug}/`;
  }
  return out;
}

export default defineConfig({
  site: 'https://heyderekj.com',
  redirects: {
    '/uses': '/tools',
    '/uses/': '/tools/',
    ...workPostRedirects(),
  },
  integrations: [],
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
