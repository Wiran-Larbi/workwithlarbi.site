# Content Workflow (Internal)

This document is the day-to-day workflow for drafting and publishing content.

## Create Draft Content

All scaffold commands create entries with `draft: true` by default.

```sh
npm run new:post -- --slug my-new-post --title "My New Post"
npm run new:work -- --slug client-case-study --title "Client Case Study"
npm run new:project -- --slug app-name --title "App Name"
```

Or use one generic command:

```sh
npm run new:content -- --type post --slug my-new-post --title "My New Post"
```

## Review Locally

```sh
npm run dev
```

Use local preview to review copy, links, and formatting. Draft content should remain hidden from public routes until published.

## Publish

1. Change `draft: true` to `draft: false` in the target file.
2. Build and verify:

```sh
npm run build
```

3. Deploy when ready.

## Notes

- Drafts are excluded from public listings, detail pages, and `sitemap.xml`.
- For projects, `featured: true` controls homepage surfacing.
