require('dotenv').config();
const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  headline: String,
  likes: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: Array
});
const Article = mongoose.model("Article", ArticleSchema, "serving_articles");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB!");
  
  const articles = await Article.find().sort({ _id: -1 }).limit(3);
  for (let a of articles) {
    console.log(`- [${a._id}] ${a.headline}`);
    console.log(`  Likes: ${a.likes}, Saves: ${a.saveCount}, Shares: ${a.shares}, Comments: ${a.comments ? a.comments.length : 0}`);
  }
  process.exit(0);
}
run();
