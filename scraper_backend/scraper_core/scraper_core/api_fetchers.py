"""
api_fetchers.py — Inked Platform
Fetches articles from news APIs and returns them as standardised dicts.
Each fetcher checks its ENV key before running. If no key, it skips gracefully.
"""
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../../.env'))


def _normalise_dt(date_str: str):
    """Try to parse various date formats into (date, time) strings."""
    if not date_str:
        return '', ''
    for fmt in ('%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S%z',
                '%a, %d %b %Y %H:%M:%S %z', '%Y-%m-%d %H:%M:%S'):
        try:
            dt = datetime.strptime(date_str[:25], fmt[:len(date_str[:25])])
            return dt.strftime('%Y-%m-%d'), dt.strftime('%H:%M:%S')
        except ValueError:
            continue
    return date_str[:10], ''


# ─── Currents API ─────────────────────────────────────────────────────────────
def fetch_currents(limit=10):
    key = os.getenv('CURRENTS_API_KEY', '')
    if not key or os.getenv('ENABLE_CURRENTS', 'false').lower() != 'true':
        return []
    url = 'https://api.currentsapi.services/v1/latest-news'
    try:
        r = requests.get(url, params={'apiKey': key, 'language': 'en', 'page_size': limit}, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('news', []):
            date, time = _normalise_dt(a.get('published', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('description', ''),
                'detailed_description': a.get('description', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image', ''),
                'source': 'Currents API',
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[Currents] Error: {e}')
        return []


# ─── NewsData.io ──────────────────────────────────────────────────────────────
def fetch_newsdata(limit=10):
    key = os.getenv('NEWSDATA_API_KEY', '')
    if not key or os.getenv('ENABLE_NEWSDATA', 'false').lower() != 'true':
        return []
    url = 'https://newsdata.io/api/1/news'
    try:
        r = requests.get(url, params={'apikey': key, 'language': 'en', 'country': 'in', 'size': limit}, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('results', []):
            date, time = _normalise_dt(a.get('pubDate', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('description', ''),
                'detailed_description': a.get('content', '') or a.get('description', ''),
                'link': a.get('link', ''),
                'image_link': a.get('image_url', ''),
                'source': a.get('source_id', 'NewsData.io'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[NewsData] Error: {e}')
        return []


# ─── GNews ────────────────────────────────────────────────────────────────────
def fetch_gnews(limit=10):
    key = os.getenv('GNEWS_API_KEY', '')
    if not key or os.getenv('ENABLE_GNEWS', 'false').lower() != 'true':
        return []
    url = 'https://gnews.io/api/v4/top-headlines'
    try:
        r = requests.get(url, params={'token': key, 'lang': 'en', 'country': 'in', 'max': limit}, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('articles', []):
            date, time = _normalise_dt(a.get('publishedAt', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('description', ''),
                'detailed_description': a.get('content', '') or a.get('description', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image', ''),
                'source': a.get('source', {}).get('name', 'GNews'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[GNews] Error: {e}')
        return []


# ─── The Guardian ─────────────────────────────────────────────────────────────
def fetch_guardian(limit=10):
    key = os.getenv('GUARDIAN_API_KEY', '')
    if not key or os.getenv('ENABLE_GUARDIAN', 'false').lower() != 'true':
        return []
    url = 'https://content.guardianapis.com/search'
    try:
        r = requests.get(url, params={
            'api-key': key, 'show-fields': 'thumbnail,trailText,bodyText',
            'page-size': limit, 'order-by': 'newest'
        }, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('response', {}).get('results', []):
            date, time = _normalise_dt(a.get('webPublicationDate', ''))
            fields = a.get('fields', {})
            articles.append({
                'headline': a.get('webTitle', ''),
                'description': fields.get('trailText', ''),
                'detailed_description': fields.get('bodyText', '') or fields.get('trailText', ''),
                'link': a.get('webUrl', ''),
                'image_link': fields.get('thumbnail', ''),
                'source': 'The Guardian',
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[Guardian] Error: {e}')
        return []


# ─── Mediastack ───────────────────────────────────────────────────────────────
def fetch_mediastack(limit=10):
    key = os.getenv('MEDIASTACK_API_KEY', '')
    if not key or os.getenv('ENABLE_MEDIASTACK', 'false').lower() != 'true':
        return []
    url = 'http://api.mediastack.com/v1/news'
    try:
        r = requests.get(url, params={
            'access_key': key, 'languages': 'en', 'limit': limit, 'countries': 'in'
        }, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('data', []):
            date, time = _normalise_dt(a.get('published_at', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('description', ''),
                'detailed_description': a.get('description', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image', ''),
                'source': a.get('source', 'Mediastack'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[Mediastack] Error: {e}')
        return []


# ─── New York Times ───────────────────────────────────────────────────────────
def fetch_nyt(limit=10):
    key = os.getenv('NYT_API_KEY', '')
    if not key or os.getenv('ENABLE_NYT', 'false').lower() != 'true':
        return []
    url = 'https://api.nytimes.com/svc/topstories/v2/home.json'
    try:
        r = requests.get(url, params={'api-key': key}, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('results', [])[:limit]:
            date, time = _normalise_dt(a.get('published_date', ''))
            multimedia = a.get('multimedia', [])
            image_link = ''
            for m in multimedia:
                if m.get('format') == 'Super Jumbo':
                    image_link = m.get('url', '')
                    break
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('abstract', ''),
                'detailed_description': a.get('abstract', ''),
                'link': a.get('url', ''),
                'image_link': image_link,
                'source': 'The New York Times',
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[NYT] Error: {e}')
        return []


# ─── Event Registry ───────────────────────────────────────────────────────────
def fetch_event_registry(limit=10):
    key = os.getenv('EVENTREGISTRY_API_KEY', '')
    if not key or os.getenv('ENABLE_EVENTREGISTRY', 'false').lower() != 'true':
        return []
    url = 'https://eventregistry.org/api/v1/article/getArticles'
    try:
        payload = {
            'action': 'getArticles',
            'articlesPage': 1,
            'articlesCount': limit,
            'articlesSortBy': 'date',
            'articlesSortByAsc': False,
            'resultType': 'articles',
            'dataType': ['news'],
            'apiKey': key,
            'lang': 'eng',
        }
        r = requests.post(url, json=payload, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('articles', {}).get('results', []):
            date, time = _normalise_dt(a.get('dateTimePub', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('body', '')[:300],
                'detailed_description': a.get('body', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image', ''),
                'source': a.get('source', {}).get('title', 'Event Registry'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[EventRegistry] Error: {e}')
        return []


# ─── World News API ───────────────────────────────────────────────────────────
def fetch_worldnews(limit=10):
    key = os.getenv('WORLDNEWS_API_KEY', '')
    if not key or os.getenv('ENABLE_WORLDNEWS', 'false').lower() != 'true':
        return []
    url = 'https://api.worldnewsapi.com/search-news'
    try:
        r = requests.get(url, params={
            'api-key': key, 'language': 'en', 'source-countries': 'in', 'number': limit, 'sort': 'publish-time'
        }, timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('news', []):
            date, time = _normalise_dt(a.get('publish_date', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('text', '')[:300],
                'detailed_description': a.get('text', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image', ''),
                'source': a.get('source_country', 'World News'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[WorldNews] Error: {e}')
        return []


# ─── Hacker News (no key) ─────────────────────────────────────────────────────
def fetch_hackernews(limit=10):
    if os.getenv('ENABLE_HACKERNEWS', 'true').lower() != 'true':
        return []
    try:
        ids_resp = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json', timeout=10)
        ids = ids_resp.json()[:limit]
        articles = []
        for story_id in ids:
            s = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json', timeout=5).json()
            if not s or s.get('type') != 'story':
                continue
            ts = s.get('time', 0)
            dt = datetime.fromtimestamp(ts) if ts else datetime.now()
            articles.append({
                'headline': s.get('title', ''),
                'description': f"Posted by {s.get('by', 'unknown')} · {s.get('score', 0)} points · {s.get('descendants', 0)} comments",
                'detailed_description': '',
                'link': s.get('url', f"https://news.ycombinator.com/item?id={story_id}"),
                'image_link': '',
                'source': 'Hacker News',
                'date': dt.strftime('%Y-%m-%d'),
                'time': dt.strftime('%H:%M:%S'),
            })
        return articles
    except Exception as e:
        print(f'[HackerNews] Error: {e}')
        return []


# ─── Spaceflight News (no key) ────────────────────────────────────────────────
def fetch_spaceflight(limit=10):
    if os.getenv('ENABLE_SPACEFLIGHT', 'true').lower() != 'true':
        return []
    try:
        r = requests.get(f'https://api.spaceflightnewsapi.net/v4/articles/?limit={limit}', timeout=10)
        r.raise_for_status()
        articles = []
        for a in r.json().get('results', []):
            date, time = _normalise_dt(a.get('published_at', ''))
            articles.append({
                'headline': a.get('title', ''),
                'description': a.get('summary', ''),
                'detailed_description': a.get('summary', ''),
                'link': a.get('url', ''),
                'image_link': a.get('image_url', ''),
                'source': a.get('news_site', 'Spaceflight News'),
                'date': date,
                'time': time,
            })
        return articles
    except Exception as e:
        print(f'[Spaceflight] Error: {e}')
        return []


# ─── Reddit ───────────────────────────────────────────────────────────────────
def fetch_reddit(subreddits=None, limit=10):
    client_id = os.getenv('REDDIT_CLIENT_ID', '')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET', '')
    user_agent = os.getenv('REDDIT_USER_AGENT', 'InkedBot/1.0')
    if not client_id or not client_secret or os.getenv('ENABLE_REDDIT', 'false').lower() != 'true':
        return []
    if subreddits is None:
        subreddits = ['worldnews', 'india', 'technology', 'science']
    try:
        auth = requests.auth.HTTPBasicAuth(client_id, client_secret)
        token_r = requests.post('https://www.reddit.com/api/v1/access_token',
                                auth=auth,
                                data={'grant_type': 'client_credentials'},
                                headers={'User-Agent': user_agent},
                                timeout=10)
        token = token_r.json().get('access_token', '')
        headers = {'Authorization': f'bearer {token}', 'User-Agent': user_agent}
        articles = []
        per_sub = max(1, limit // len(subreddits))
        for sub in subreddits:
            r = requests.get(f'https://oauth.reddit.com/r/{sub}/hot',
                             headers=headers, params={'limit': per_sub}, timeout=10)
            for post in r.json().get('data', {}).get('children', []):
                d = post.get('data', {})
                if d.get('is_self') or not d.get('url'):
                    continue
                ts = d.get('created_utc', 0)
                dt = datetime.fromtimestamp(ts) if ts else datetime.now()
                articles.append({
                    'headline': d.get('title', ''),
                    'description': d.get('selftext', '')[:300] or f"r/{sub} · {d.get('score', 0)} upvotes",
                    'detailed_description': d.get('selftext', ''),
                    'link': d.get('url', ''),
                    'image_link': d.get('thumbnail', '') if d.get('thumbnail', '').startswith('http') else '',
                    'source': f"Reddit r/{sub}",
                    'date': dt.strftime('%Y-%m-%d'),
                    'time': dt.strftime('%H:%M:%S'),
                })
        return articles
    except Exception as e:
        print(f'[Reddit] Error: {e}')
        return []


# ─── Master fetcher ───────────────────────────────────────────────────────────
def fetch_all_api_sources(limit_per_source=10):
    """
    Run all enabled API fetchers and return a combined list.
    RSS feeds are handled separately by the Scrapy spider.
    """
    all_articles = []
    fetchers = [
        ('Currents', fetch_currents),
        ('NewsData', fetch_newsdata),
        ('GNews', fetch_gnews),
        ('Guardian', fetch_guardian),
        ('Mediastack', fetch_mediastack),
        ('NYT', fetch_nyt),
        ('EventRegistry', fetch_event_registry),
        ('WorldNews', fetch_worldnews),
        ('HackerNews', fetch_hackernews),
        ('Spaceflight', fetch_spaceflight),
        ('Reddit', fetch_reddit),
    ]
    for name, fn in fetchers:
        try:
            results = fn(limit=limit_per_source) if name not in ('Reddit',) else fn(limit=limit_per_source)
            print(f'[API] {name}: fetched {len(results)} articles')
            all_articles.extend(results)
        except Exception as e:
            print(f'[API] {name} failed: {e}')
    return all_articles
