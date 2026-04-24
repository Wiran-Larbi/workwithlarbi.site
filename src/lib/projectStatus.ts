import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** User-facing label; `paused` is shown as "inactive" across the site. */
export function displayProjectStatus(status: ProjectStatus): string {
  if (status === 'paused') return 'inactive';
  return status;
}
