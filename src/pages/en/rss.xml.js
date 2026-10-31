import rss from "@astrojs/rss";
import { getPosts } from "../../i18n/blog";
import { FEED_LANGUAGE, blogPostPath, ui } from "../../i18n";

export async function GET(context) {
  const posts = await getPosts("en");

  return rss({
    title: ui.en.blog.rssTitle,
    description: ui.en.blog.rssDescription,
    site: new URL("/en/", context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: blogPostPath(post, "en"),
      categories: post.data.tags,
    })),
    customData: `<language>${FEED_LANGUAGE.en}</language>`,
  });
}
