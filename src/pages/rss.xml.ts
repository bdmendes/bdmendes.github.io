import rss from "@astrojs/rss";
import { METADATA, PAGINATION_SIZE } from "../config";
import { getCollection } from "astro:content";
import { extractDescription, extractDate, createSlug, createChessSlug, createChessTitle, createChessDescription } from "src/lib/util";

export async function GET() {
  const posts = await getCollection("blog");
  const poems = await getCollection("poetry");
  const slides = await getCollection("slides");
  const chessGames = await getCollection("chess");

  const items = posts.map((post) => ({
    title: post.data.title,
    pubDate: extractDate(post.id),
    description: extractDescription(post.body!),
    link: `/blog/${createSlug(post.data.title)}`,
  })).concat(poems.map((poem) => ({
    title: poem.data.title,
    pubDate: extractDate(poem.id),
    description: extractDescription(poem.body!),
    link: `/poetry/${createSlug(poem.data.title)}`,
  }))).concat(slides.map((slide) => ({
    title: slide.data.title,
    pubDate: extractDate(slide.id),
    description: slide.data.description,
    link: `/slides/${createSlug(slide.data.title)}`,
  }))).concat(chessGames.map((game) => ({
    title: createChessTitle(game),
    pubDate: extractDate(game.id),
    description: createChessDescription(game),
    link: `/chess/${createChessSlug(game)}`,
  })));

  return rss({
    title: METADATA.title,
    description: METADATA.description,
    site: import.meta.env.SITE,
    items: items
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
      .slice(0, PAGINATION_SIZE),
    trailingSlash: false,
  });
}
