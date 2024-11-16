import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION, PAGINATION_SIZE } from "../config";
import { getCollection } from "astro:content";

export async function GET() {
  const maxItems = 10;
  const blog = await getCollection("blog");

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    items: blog.slice(0, PAGINATION_SIZE).map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
