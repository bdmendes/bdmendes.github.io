import rss from "@astrojs/rss";
import { METADATA, PAGINATION_SIZE } from "../config";
import { getCollection } from "astro:content";
import { extractDescription, extractDate, createSlug } from "src/lib/util";

export async function GET() {
  const posts = (await getCollection("blog")).sort(
    (a, b) => extractDate(b.id).valueOf() - extractDate(a.id).valueOf(),
  );
  const poems = (await getCollection("poetry")).sort(
    (a, b) => extractDate(b.id).valueOf() - extractDate(a.id).valueOf(),
  );
  const slides = (await getCollection("slides")).sort(
    (a, b) => extractDate(b.id).valueOf() - extractDate(a.id).valueOf(),
  );

  const items = posts.map((post) => ({
    title: post.data.title,
    pubDate: extractDate(post.id),
    description: extractDescription(post.body),
    link: `/blog/${createSlug(post.data.title)}`,
  })).concat(poems.map((poem) => ({
    title: poem.data.title,
    pubDate: extractDate(poem.id),
    description: extractDescription(poem.body),
    link: `/poetry/${createSlug(poem.data.title)}`,
  }))).concat(slides.map((slide) => ({
    title: slide.data.title,
    pubDate: extractDate(slide.id),
    description: slide.data.description,
    link: `/slides/${createSlug(slide.data.title)}`,
  })));

  return rss({
    title: METADATA.title,
    description: METADATA.description,
    site: import.meta.env.SITE,
    items: items
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
      .slice(0, PAGINATION_SIZE),
  });
}
