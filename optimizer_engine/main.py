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
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
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
admin_settings_collection = get_db_safe(main_client, 'main')['admin_settings']
moderation_log = get_db_safe(optimizer_client, 'optimizer')['moderation_log']

# Ensure TTL index is set on the serving collection (expires after 2 days = 172800s)
serving_collection.create_index("created_at", expireAfterSeconds=172800)

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
    return {"status": "Optimizer Engine is running healthy!"}

class OptimizeRequest(BaseModel):
    headline: str
    text: str

def process_pending_articles():
    print("Transformer running: Polling for unprocessed articles...")
    
    pending_articles = list(raw_collection.find({"transformed": {"$ne": True}}).limit(50))
    
    if not pending_articles:
        print("No pending articles found.")
        return {"status": "No pending articles found"}

    # Fetch admin settings
    settings = admin_settings_collection.find_one() or {}
    ai_active = settings.get("ai_service_active", True)
    
    processed_count = 0
    
    for article in pending_articles:
        headline = article.get('headline', '')
        description = article.get('description', '')
        detailed_description = article.get('detailed_description', '')
        text_to_process = detailed_description if detailed_description else description
        link = article.get('link', '')
        
        print(f"Processing: {headline}")
        
        serving_article = {
            "headline": headline,
            "description": description,
            "detailed_description": detailed_description,
            "image_link": article.get('image_link'),
            "link": link,
            "source": article.get('source'),
            "date": article.get('date'),
            "time": article.get('time'),
            "published": True
        }
        
        if ai_active:
            try:
                ai_result = generate_summary_and_moderation(settings, text_to_process, headline)
                
                # Log moderation
                moderation_log.insert_one({
                    "article_headline": headline,
                    "verdict": ai_result["moderation_status"],
                    "confidence": ai_result.get("confidence", 80),
                    "timestamp": time.time(),
                    "on_demand": False
                })
                
                if ai_result["moderation_status"] == "Clean":
                    serving_article["description"] = ai_result["summary"]
                    # Do not publish if it's flagged
                else:
                    serving_article["published"] = False
                    print(" -> Flagged by AI, skipping publish.")
            except Exception as e:
                print(f" -> AI processing failed for this article: {e}")
                # Fallback to raw text if AI fails
        else:
            print(" -> AI service disabled. Using raw text.")

        if serving_article.get("published", True):
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
            
        # Mark as transformed in scraper db
        raw_collection.update_one(
            {'_id': article['_id']},
            {'$set': {'transformed': True}}
        )
        processed_count += 1
        
    return {"status": f"Successfully processed {processed_count} articles"}

@app.post("/trigger-optimize")
def trigger_optimize():
    try:
        result = process_pending_articles()
        return result
    except Exception as e:
        return {"status": "Error", "message": str(e)}

@app.post("/api/optimize")
def api_optimize(req: OptimizeRequest):
    try:
        settings = admin_settings_collection.find_one() or {}
        ai_active = settings.get("ai_service_active", True)
        
        if not ai_active:
            return {"success": False, "error": "AI Service is currently in maintenance mode."}
            
        # Run AI summary and moderation on-demand
        ai_result = generate_summary_and_moderation(settings, req.text, req.headline)
        
        # Log the on-demand moderation
        moderation_log.insert_one({
            "article_headline": req.headline,
            "verdict": ai_result["moderation_status"],
            "confidence": ai_result.get("confidence", 80),
            "timestamp": time.time(),
            "on_demand": True
        })
        
        return {"success": True, "data": ai_result}
    except Exception as e:
        return {"success": False, "error": str(e)}

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
