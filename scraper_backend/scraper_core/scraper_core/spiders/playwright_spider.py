import scrapy
from datetime import datetime

class PlaywrightSpider(scrapy.Spider):
    name = "playwright_spider"

    def start_requests(self):
        urls = [
            "https://www.news18.com/", # Dynamic site example
        ]
        for url in urls:
            yield scrapy.Request(
                url,
                meta={
                    "playwright": True,
                    "playwright_include_page": True,
                },
                callback=self.parse
            )

    async def parse(self, response):
        page = response.meta.get("playwright_page")
        if page:
            await page.close()

        # Simple extraction logic for demonstration on homepage articles
        articles = response.css('a[href*="/news/"]')
        for article in articles:
            headline = article.css('::text').get(default='').strip()
            link = article.css('::attr(href)').get()
            image_link = article.css('img::attr(src)').get(default='')
            
            if headline and link:
                yield {
                    'headline': headline,
                    'link': response.urljoin(link),
                    'description': '', # Usually found on the article page itself
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'time': datetime.now().strftime('%H:%M:%S'),
                    'image_link': image_link,
                    'source': 'News18'
                }
