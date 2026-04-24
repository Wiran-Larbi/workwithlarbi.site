import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://heyderekj.com',
  redirects: {
    '/uses': '/tools',
    '/uses/': '/tools/',
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
