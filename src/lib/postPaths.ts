import type { CollectionEntry } from 'astro:content';

/** Entries shown in `PostList` (posts archive or work index / home previews). */
export type ListableEntry = CollectionEntry<'posts'> | CollectionEntry<'work'>;

export function entryHref(entry: ListableEntry): string {
  return entry.collection === 'work' ? `/work/${entry.slug}/` : `/posts/${entry.slug}/`;
}
