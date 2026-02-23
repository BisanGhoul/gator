import { XMLParser } from "fast-xml-parser";

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: { "User-Agent": "gator" },
  });

  const text = await response.text();

  const parser = new XMLParser();
  const parsed = parser.parse(text);

  const channel = parsed?.rss?.channel;
  if (!channel) {
    throw new Error("no channel found in feed");
  }

  const { title, link, description } = channel;
  if (!title || !link || !description) {
    throw new Error("missing required channel fields");
  }

  let items: RSSItem[] = [];
  if (channel.item) {
    const raw = Array.isArray(channel.item) ? channel.item : [channel.item];
    for (const i of raw) {
      if (!i.title || !i.link || !i.description || !i.pubDate) continue;
      items.push({
        title: i.title,
        link: i.link,
        description: i.description,
        pubDate: i.pubDate,
      });
    }
  }

  return {
    channel: { title, link, description, item: items },
  };
}
