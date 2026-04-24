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

Repository: [github.com/heyderekj/heyderekj.com](https://github.com/heyderekj/heyderekj.com).

Production is on Netlify (**heyderekj-com**). Build settings match [netlify.toml](netlify.toml) (`npm run build`, publish `dist`, Node 20).

### Continuous deployment (GitHub Actions)

After cloning, add these [repository secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository):

| Secret | Where to get it |
| --- | --- |
| `NETLIFY_SITE_ID` | Netlify → Site configuration → Site details → Site ID (`04e6dfb5-bffc-4d96-883a-4c9ff96956bd`) |
| `NETLIFY_AUTH_TOKEN` | Netlify → User settings → Applications → Personal access tokens → New access token |

Pushes to `main` run [.github/workflows/netlify.yml](.github/workflows/netlify.yml) and deploy the `dist` output to production.

You can also deploy from your machine with Netlify CLI: `npx netlify-cli deploy --prod` (project is linked locally via `.netlify/state.json`, which is gitignored).

### Custom domain

`heyderekj.com` is attached in Netlify. Finish DNS at your registrar using **Domain management** for this site (apex `A`/`ALIAS` and `www` as Netlify shows). HTTPS enables after DNS propagates.

### Optional: Netlify “build from Git”

If you prefer builds on Netlify’s runners instead of GitHub Actions, use **Add new site → Import an existing project**, select this repo, and confirm build settings match `netlify.toml`. You can disable or remove the workflow if you switch to that model.
