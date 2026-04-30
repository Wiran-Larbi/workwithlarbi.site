import type { CollectionEntry } from 'astro:content';

/** Entries shown in `PostList` (posts archive or work index / home previews). */
export type ListableEntry = CollectionEntry<'posts'> | CollectionEntry<'work'> | CollectionEntry<'caseStudies'>;

export function entryHref(entry: ListableEntry): string {
  if (entry.collection === 'work') return `/work/${entry.slug}/`;
  if (entry.collection === 'caseStudies') return `/case-studies/${entry.slug}/`;
  return `/posts/${entry.slug}/`;
}
