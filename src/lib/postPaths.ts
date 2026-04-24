import type { CollectionEntry } from 'astro:content';
import { postHasWorkTag } from './postTags';

/** Canonical URL path for a published post (work-tagged → `/work/…`, else `/posts/…`). */
export function postEntryHref(post: CollectionEntry<'posts'>): string {
  return postHasWorkTag(post.data) ? `/work/${post.slug}/` : `/posts/${post.slug}/`;
}
