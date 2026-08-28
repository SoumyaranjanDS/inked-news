import os
import sys
import threading
import time
import datetime
import uvicorn

from fastapi import FastAPI, Query
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import schedule

# Ensure scraper_core is in python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scraper_core'))
load_dotenv()

app = FastAPI(docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://inkedfact.online", "https://www.inkedfact.online"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Inked Scraper Backend is running"}


@app.post("/trigger-scrape")
def trigger_scrape(
    spider_name: str = Query(default="rss"),
    use_apis: bool = Query(default=True, description="Also run API-based fetchers")
):
    """
    Trigger the full scrape cycle:
    1. Run Scrapy RSS spider (saves directly to MongoDB via pipeline)
    2. Run API fetchers (saves results to MongoDB)
    """
    import subprocess

    results = {"rss": None, "apis": None}

    # ─── 1. Scrapy RSS Spider ─────────────────────────────────────────────
    try:
        spider_cwd = os.path.join(os.path.dirname(__file__), 'scraper_core')
        proc = subprocess.run(
            ["scrapy", "crawl", spider_name],
            cwd=spider_cwd,
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            results["rss"] = {"status": "error", "message": proc.stderr[-500:]}
        else:
            results["rss"] = {"status": "success"}
    except Exception as e:
        results["rss"] = {"status": "error", "message": str(e)}

    # ─── 2. API Fetchers ──────────────────────────────────────────────────
    if use_apis:
        try:
            try:
                from scraper_core.api_fetchers import fetch_all_api_sources
            except ImportError:
                from scraper_core.scraper_core.api_fetchers import fetch_all_api_sources
            from pymongo import MongoClient

            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/scraper')
            client = MongoClient(mongo_uri)
            try:
                db = client.get_database()
            except Exception:
                db = client['scraper']
            collection = db['articles']

            # Create TTL Index (Expires documents 48 hours after created_at)
            collection.create_index("created_at", expireAfterSeconds=172800)

            api_articles = fetch_all_api_sources(limit_per_source=100)
            inserted = 0
            for article in api_articles:
                if article.get('link'):
                    collection.update_one(
                        {'link': article['link']},
                        {
                            '$set': article,
                            '$setOnInsert': {
                                'created_at': datetime.datetime.now(datetime.timezone.utc),
                                'transformed': False
                            }
                        },
                        upsert=True,
                    )
                    inserted += 1

            # Serialize articles for response (ensure no non-serializable objects)
            clean_articles_list = []
            for art in api_articles:
                clean_art = {k: v for k, v in art.items() if k not in ['_id', 'created_at'] and not isinstance(v, (datetime.datetime, datetime.date))}
                clean_articles_list.append(clean_art)

            results["apis"] = {
                "status": "success", 
                "fetched": len(api_articles), 
                "saved": inserted,
                "articles": clean_articles_list
            }
        except Exception as e:
            results["apis"] = {"status": "error", "message": str(e)}

    return {"status": "Scrape cycle completed", "results": results}


@app.get("/latest-scraped")
def get_latest_scraped(limit: int = 100):
    """Retrieve the most recently scraped raw articles from MongoDB staging."""
    try:
        from pymongo import MongoClient
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/scraper')
        client = MongoClient(mongo_uri)
        try:
            db = client.get_database()
        except Exception:
            db = client['scraper']
        collection = db['articles']
        docs = list(collection.find({}, {'_id': 0}).sort("created_at", -1).limit(limit))
        # Format datetime fields if present
        for doc in docs:
            if 'created_at' in doc and isinstance(doc['created_at'], (datetime.datetime, datetime.date)):
                doc['created_at'] = doc['created_at'].isoformat()
        return {"success": True, "data": docs, "total": len(docs)}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/sources")
def list_sources():
    """List all configured sources and their enabled status."""
    try:
        from scraper_core.spiders.rss_spider import RSS_FEEDS
    except ImportError:
        from scraper_core.scraper_core.spiders.rss_spider import RSS_FEEDS
    rss_sources = {name: {"type": "rss", "enabled": os.getenv('ENABLE_RSS', 'true').lower() == 'true', "url": url}
                   for name, url in RSS_FEEDS.items()}
    api_sources = {
        "Currents API":     {"type": "api", "enabled": bool(os.getenv('CURRENTS_API_KEY'))},
        "NewsData.io":      {"type": "api", "enabled": bool(os.getenv('NEWSDATA_API_KEY'))},
        "GNews":            {"type": "api", "enabled": bool(os.getenv('GNEWS_API_KEY'))},
        "The Guardian":     {"type": "api", "enabled": bool(os.getenv('GUARDIAN_API_KEY'))},
        "Mediastack":       {"type": "api", "enabled": bool(os.getenv('MEDIASTACK_API_KEY'))},
        "NYT":              {"type": "api", "enabled": bool(os.getenv('NYT_API_KEY'))},
        "Event Registry":   {"type": "api", "enabled": bool(os.getenv('EVENTREGISTRY_API_KEY'))},
        "World News API":   {"type": "api", "enabled": bool(os.getenv('WORLDNEWS_API_KEY'))},
        "Hacker News":      {"type": "api", "enabled": os.getenv('ENABLE_HACKERNEWS', 'true') == 'true'},
        "Spaceflight News": {"type": "api", "enabled": os.getenv('ENABLE_SPACEFLIGHT', 'true') == 'true'},
        "Reddit":           {"type": "api", "enabled": bool(os.getenv('REDDIT_CLIENT_ID'))},
    }
    return {"rss": rss_sources, "apis": api_sources}


def run_scheduler():
    schedule.every().day.at("06:00").do(trigger_scrape)
    schedule.every().day.at("13:00").do(trigger_scrape)
    schedule.every().day.at("19:00").do(trigger_scrape)
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    print("Scraper API started with CRON scheduler (6 AM, 1 PM, 7 PM).")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
