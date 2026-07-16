import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../../.env'))

import datetime

class MongoDBPipeline:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/inked')
        self.client = None
        self.db = None

    def open_spider(self, spider):
        self.client = MongoClient(self.mongo_uri)
        try:
            self.db = self.client.get_database()
        except Exception:
            self.db = self.client['scraper']
        
        # Ensure TTL index is set on the collection
        self.db['articles'].create_index("created_at", expireAfterSeconds=172800)

    def close_spider(self, spider):
        if self.client:
            self.client.close()

    def process_item(self, item, spider):
        # Insert or update based on link to avoid duplicates
        collection = self.db['articles']
        collection.update_one(
            {'link': item.get('link')},
            {
                '$set': dict(item),
                '$setOnInsert': {
                    'created_at': datetime.datetime.now(datetime.timezone.utc),
                    'transformed': False
                }
            },
            upsert=True
        )
        return item
