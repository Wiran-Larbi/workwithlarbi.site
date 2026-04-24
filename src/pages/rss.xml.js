import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { postHasWorkTag } from '../lib/postTags';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft && !postHasWorkTag(data)))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Derek Castelli',
    description: 'Writing on faith, technology, and agentic design by Derek Castelli.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
