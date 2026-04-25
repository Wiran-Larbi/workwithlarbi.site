import { marked } from 'marked';

/**
 * Renders a Markdown string to HTML (for frontmatter / CMS fields, not .md content).
 * Content is site-authored only — do not use for user-provided input.
 */
export function mdStringToHtml(md: string | undefined | null): string {
  if (!md?.trim()) return '';
  return marked.parse(md.trim(), { async: false }) as string;
}
