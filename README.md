# heyderekj.com

Personal site for Derek Castelli. Built with [Astro](https://astro.build), hosted on Netlify.

## Stack

- Astro 4 with content collections (posts, work, projects)
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
- **Work:** add a markdown file under `src/content/work/`. Filename: `slug.md` (no date prefix). Published at `/work/slug/`. Same frontmatter shape as posts.
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

`src/layouts/Base.astro` has a `<script>` with `data-site="FATHOM_SITE_ID"`. Replace that placeholder with your Fathom site ID.

## Deploy

Netlify is connected to the git repo and builds using [netlify.toml](netlify.toml). Domain and DNS live in the Netlify dashboard.

Optional manual deploy: `npx netlify-cli deploy --prod` when the project is linked locally.
