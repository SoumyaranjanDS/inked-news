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
  
  const article = await Article.findOne({ _id: '6a93dd3a7f4c900c9fcb5b43' });
  console.log('Before comment push:', article.comments);
  
  article.comments.push({ user: new mongoose.Types.ObjectId(), text: 'Test comment', createdAt: new Date() });
  await article.save();
  
  console.log('After comment push:', article.comments);
  
  const fetched = await Article.findOne({ _id: '6a93dd3a7f4c900c9fcb5b43' });
  console.log('Re-fetched from DB:', fetched.comments);
  
  process.exit(0);
}
run();
