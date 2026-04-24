import type { CollectionEntry } from 'astro:content';

/** UTC ms for sorting; prefers `started`, else Jan 1 UTC of `year`. */
export function projectStartTime(project: CollectionEntry<'projects'>): number {
  const { started, year } = project.data;
  if (started) return started.getTime();
  if (year != null) return Date.UTC(year, 0, 1);
  return 0;
}

/** "March 2024" style label for cards and project detail meta. */
export function formatProjectStartLabel(project: CollectionEntry<'projects'>): string {
  const { started, year } = project.data;
  const d = started ?? (year != null ? new Date(Date.UTC(year, 0, 1)) : null);
  if (!d) return '';
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(d);
  return `${month} ${d.getUTCFullYear()}`;
}
