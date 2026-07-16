import scrapy
import feedparser
import os
from datetime import datetime
import re
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../../../.env'))

# ─── All RSS Feeds ───────────────────────────────────────────────────────────
RSS_FEEDS = {
    # Indian publishers
    "Times of India":      "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "The Hindu":           "https://www.thehindu.com/news/national/feeder/default.rss",
    "Indian Express":      "https://indianexpress.com/feed/",
    "Hindustan Times":     "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    "NDTV":                "https://feeds.feedburner.com/ndtvnews-top-stories",
    "India Today":         "https://www.indiatoday.in/rss/home",
    "Financial Express":   "https://www.financialexpress.com/feed/",
    "Economic Times":      "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    # International (Commented out to restrict to India)
    # "BBC News":            "http://feeds.bbci.co.uk/news/rss.xml",
    # "CNN":                 "http://rss.cnn.com/rss/edition.rss",
    # "Reuters":             "https://feeds.reuters.com/reuters/topNews",
    # "Al Jazeera":          "https://www.aljazeera.com/xml/rss/all.xml",
    # "TechCrunch":          "https://techcrunch.com/feed/",
    # "The Verge":           "https://www.theverge.com/rss/index.xml",
    # "Wired":               "https://www.wired.com/feed/rss",
    "Google News India":   "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
}

class RssSpider(scrapy.Spider):
    name = "rss"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.rss_enabled = os.getenv('ENABLE_RSS', 'true').lower() == 'true'

    def start_requests(self):
        if not self.rss_enabled:
            self.logger.info("RSS scraping disabled via ENABLE_RSS env var.")
            return
        for source_name, url in RSS_FEEDS.items():
            yield scrapy.Request(
                url=url,
                callback=self.parse_feed,
                meta={'source_name': source_name},
                errback=self.handle_error,
                dont_filter=True,
            )

    def handle_error(self, failure):
        self.logger.warning(f"RSS feed failed: {failure.request.url} — {failure.value}")

    def parse_feed(self, response):
        source_name = response.meta.get('source_name', response.url)
        feed = feedparser.parse(response.body)

        for entry in feed.entries:
            headline = entry.get('title', '').strip()
            link = entry.get('link', '').strip()
            description = entry.get('summary', '').strip()

            # Remove HTML tags from description
            description = re.sub(r'<[^>]+>', '', description).strip()

            # Parse date/time
            published_parsed = entry.get('published_parsed')
            if published_parsed:
                try:
                    dt = datetime(*published_parsed[:6])
                    date_str = dt.strftime('%Y-%m-%d')
                    time_str = dt.strftime('%H:%M:%S')
                except Exception:
                    date_str, time_str = '', ''
            else:
                date_str, time_str = '', ''

            # Extract image
            image_link = self._extract_image(entry)

            if not headline:
                continue

            item = {
                'headline': headline,
                'link': link,
                'description': description,
                'detailed_description': '',
                'date': date_str,
                'time': time_str,
                'image_link': image_link,
                'source': source_name,
            }

            # Follow link to scrape full article body
            if link:
                yield scrapy.Request(
                    url=link,
                    callback=self.parse_article,
                    meta={'item': item},
                    errback=lambda f: (setattr(f.request.meta['item'], 'detailed_description', f.request.meta['item']['description']),),
                    dont_filter=True,
                )
            else:
                item['detailed_description'] = description
                yield item

    def parse_article(self, response):
        item = response.meta['item']
        # Extract paragraph text
        paragraphs = response.xpath('//article//p//text() | //main//p//text() | //p//text()').getall()
        text = ' '.join([p.strip() for p in paragraphs if p.strip()])
        text = re.sub(r'\s+', ' ', text).strip()

        item['detailed_description'] = text if len(text) > 80 else item.get('description', '')
        yield item

    @staticmethod
    def _extract_image(entry):
        """Try multiple common RSS image locations."""
        # 1. media:content
        if hasattr(entry, 'media_content') and entry.media_content:
            url = entry.media_content[0].get('url', '')
            if url:
                return url
        # 2. enclosures
        for enc in getattr(entry, 'enclosures', []):
            if 'image' in enc.get('type', '') or enc.get('href', '').lower().endswith(('.jpg', '.png', '.webp')):
                return enc.get('href', enc.get('url', ''))
        # 3. links rel="enclosure"
        for l in getattr(entry, 'links', []):
            if l.get('rel') == 'enclosure' or 'image' in l.get('type', ''):
                return l.get('href', '')
        # 4. media:thumbnail
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url', '')
        return ''
