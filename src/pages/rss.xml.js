import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  
  const caseStudies = (await getCollection('caseStudies', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const allItems = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/posts/${post.slug}/`,
    })),
    ...caseStudies.map((caseStudy) => ({
      title: `[Case Study] ${caseStudy.data.title}`,
      pubDate: caseStudy.data.date,
      description: caseStudy.data.description ?? '',
      link: `/case-studies/${caseStudy.slug}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Wiran Larbi',
    description: 'Writing on technology, security, and software engineering by Wiran Larbi.',
    site: context.site,
    items: allItems,
    customData: `<language>en-us</language>`,
  });
}
