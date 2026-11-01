import rss from "@astrojs/rss";
import { getPosts } from "../i18n/blog";
import { FEED_LANGUAGE, blogPostPath, ui } from "../i18n";

export async function GET(context) {
  const posts = await getPosts("de");

  return rss({
    title: ui.de.blog.rssTitle,
    description: ui.de.blog.rssDescription,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: blogPostPath(post, "de"),
      categories: post.data.tags,
    })),
    customData: `<language>${FEED_LANGUAGE.de}</language>`,
  });
}
