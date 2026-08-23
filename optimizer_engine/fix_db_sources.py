import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

scraper_client = MongoClient(os.getenv("MONGO_URI_SCRAPER", "mongodb://localhost:27017/scraper"))
main_client = MongoClient(os.getenv("MONGO_URI_MAIN", "mongodb://localhost:27017/main"))

def get_db_safe(client, db_name):
    try:
        return client.get_database()
    except Exception:
        return client[db_name]

raw_collection = get_db_safe(scraper_client, 'scraper')['articles']
serving_collection = get_db_safe(main_client, 'main')['serving_articles']

def fix_source(doc):
    source = doc.get('source', '')
    if len(source) <= 3 or source.lower() == 'in':
        headline = doc.get('headline', '')
        if headline and ' - ' in headline:
            new_source = headline.split(' - ')[-1].strip()
            return new_source
    return None

print("Fixing Raw Articles (Scraper DB)...")
raw_count = 0
for doc in raw_collection.find():
    new_src = fix_source(doc)
    if new_src:
        raw_collection.update_one({'_id': doc['_id']}, {'$set': {'source': new_src}})
        raw_count += 1
print(f"Fixed {raw_count} raw articles.")

print("Fixing Serving Articles (Main DB)...")
serve_count = 0
for doc in serving_collection.find():
    new_src = fix_source(doc)
    if new_src:
        serving_collection.update_one({'_id': doc['_id']}, {'$set': {'source': new_src}})
        serve_count += 1
print(f"Fixed {serve_count} serving articles.")

print("Done!")
