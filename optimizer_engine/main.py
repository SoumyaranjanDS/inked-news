import os
import sys
import time
import threading
import datetime

# Fix Windows console encoding issues for characters like the Rupee symbol (₹)
sys.stdout.reconfigure(encoding='utf-8')
import schedule
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn
from ai_pipeline import setup_ai, generate_summary_and_moderation

load_dotenv()

# We connect to 3 separate databases
scraper_client = MongoClient(os.getenv("MONGO_URI_SCRAPER", "mongodb://localhost:27017/scraper"))
optimizer_client = MongoClient(os.getenv("MONGO_URI_OPTIMIZER", "mongodb://localhost:27017/optimizer"))
main_client = MongoClient(os.getenv("MONGO_URI_MAIN", "mongodb://localhost:27017/main"))

def get_db_safe(client, db_name):
    try:
        return client.get_database()
    except Exception:
        return client[db_name]

raw_collection = get_db_safe(scraper_client, 'scraper')['articles']
serving_collection = get_db_safe(main_client, 'main')['serving_articles']
moderation_log = get_db_safe(optimizer_client, 'optimizer')['moderation_log']

# Ensure TTL index is set on the serving collection (expires after 2 days = 172800s)
serving_collection.create_index("created_at", expireAfterSeconds=172800)

model = setup_ai()
app = FastAPI(docs_url=None, redoc_url=None)

def process_pending_articles():
    print("Transformer running: Polling for unprocessed articles...")
    
    # We fetch articles that haven't been transformed yet
    # Assuming 'transformed' flag doesn't exist or is False
    pending_articles = list(raw_collection.find({"transformed": {"$ne": True}}).limit(50))
    
    if not pending_articles:
        print("No pending articles found.")
        return {"status": "No pending articles found"}

    processed_count = 0
    
    for article in pending_articles:
        headline = article.get('headline', '')
        description = article.get('description', '')
        link = article.get('link', '')
        
        print(f"Processing: {headline}")
        
        # 1. AI Transformation & Moderation with Retry Logic
        ai_result = None
        retries = 3
        while retries > 0:
            try:
                ai_result = generate_summary_and_moderation(model, description, headline)
                break # Success
            except Exception as e:
                err_msg = str(e).lower()
                if "429" in err_msg or "rate limit" in err_msg or "too many requests" in err_msg:
                    print(f"Rate limit hit! Sleeping for 60 seconds... ({retries} retries left)")
                    time.sleep(60)
                else:
                    print(f"Unexpected error: {e}. Sleeping 10s...")
                    time.sleep(10)
                retries -= 1
        
        if not ai_result:
            print(f"Failed to process after retries: {headline}. Skipping for now.")
            continue
            
        # 2. Write to Moderation Log
        moderation_log.insert_one({
            "article_link": link,
            "verdict": ai_result["moderation_status"],
            "confidence": ai_result["confidence"],
            "timestamp": time.time()
        })
        
        # 3. Write to Serving DB if Clean
        if ai_result["moderation_status"] == "Clean":
            serving_article = {
                "headline": headline,
                "summary": ai_result["summary"],
                "image_link": article.get('image_link'),
                "link": link,
                "source": article.get('source'),
                "date": article.get('date'),
                "time": article.get('time'),
                "published": True
            }
            serving_collection.update_one(
                {'link': link},
                {
                    '$set': serving_article,
                    '$setOnInsert': {
                        'created_at': datetime.datetime.now(datetime.timezone.utc)
                    }
                },
                upsert=True
            )
            print(f" -> Published to main db.")
        else:
            print(f" -> Flagged. Sent to admin queue.")
            
        # 4. Mark as transformed in scraper db
        raw_collection.update_one(
            {'_id': article['_id']},
            {'$set': {'transformed': True}}
        )
        processed_count += 1
        
        # Base delay to respect limits (e.g. 30 RPM = 1 per 2 seconds)
        time.sleep(2)
        
    return {"status": f"Successfully processed {processed_count} articles"}

@app.post("/trigger-optimize")
def trigger_optimize():
    try:
        result = process_pending_articles()
        return result
    except Exception as e:
        return {"status": "Error", "message": str(e)}

def run_scheduler():
    schedule.every(5).minutes.do(process_pending_articles)
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    # Start the background scheduler thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    # Run FastAPI server on port 8001
    print("Optimizer Engine API started on port 8001.")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
