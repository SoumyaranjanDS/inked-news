const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const Article = require("./models/Article");

async function fixTTLIndex() {
  try {
    await connectDB();
    console.log("Connected to DB");
    
    const collection = mongoose.connection.collection('serving_articles');
    
    try {
      await collection.dropIndex("created_at_1");
      console.log("Dropped created_at_1 index");
    } catch (e) {
      console.log("Index created_at_1 may not exist or couldn't be dropped:", e.message);
    }

    try {
      await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
      console.log("Created expireAt_1 index");
    } catch (e) {
      console.log("Failed to create expireAt_1 index:", e.message);
    }
    
    // Set expireAt for existing docs. For simplicity we'll just set it to 48 hours from now
    // for all articles that don't have it and are not saved.
    const updated = await collection.updateMany(
      { expireAt: { $exists: false }, saveCount: { $in: [null, 0] } },
      { $set: { expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000) } }
    );
    console.log("Updated documents without expireAt:", updated.modifiedCount);

    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixTTLIndex();
