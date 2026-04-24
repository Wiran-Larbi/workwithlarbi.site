# heyderekj.com

Personal site for Derek Castelli. Built with [Astro](https://astro.build), hosted on Netlify.

## Stack

- Astro 4 with content collections (posts + projects)
- Plain system-sans typography, light/dark via `prefers-color-scheme`
- RSS, sitemap, Fathom Analytics

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output to dist/
npm run preview   # preview the production build
```

## Write

- **Posts:** add a markdown file under `src/content/posts/`. Filename: `YYYY-MM-DD-slug.md`. See frontmatter schema in `src/content/config.ts`. Set `draft: false` to publish.
- **Projects:** add a markdown file under `src/content/projects/`. Set `featured: true` to surface on the homepage.
- **About:** edit `src/data/about.ts` and rebuild. Home page Bible verse marquee copy stays in `src/data/now.ts`.
- **Tools:** edit `src/pages/tools/index.astro`.

## Import posts from CSV

The one-time CSV → Markdown importer lives at `scripts/import-posts.mjs`.

Move your CSV out of `~/Downloads` (macOS sandbox) to somewhere readable, e.g. `./data/posts.csv`, then:

```sh
npm run import:posts           # reads ./data/posts.csv
node scripts/import-posts.mjs path/to/posts.csv
```

Everything is imported with `draft: true`. Review, expand, and flip to publish.

## Fathom Analytics

`src/layouts/Base.astro` has a `<script>` with `data-site="FATHOM_SITE_ID"`. Replace `FATHOM_SITE_ID` with the ID from your current heyderekj.com Fathom setup.

## Deploy

1. Push to a GitHub repo.
2. In Netlify: "Add new site → Import an existing project", pick the repo.
3. Build command and publish dir come from `netlify.toml`.
4. Once the preview looks right, add `heyderekj.com` as a custom domain in Netlify and repoint DNS.
