const mongoose = require("mongoose");
const Article = require("./models/Article");

async function run() {
  await mongoose.connect("mongodb+srv://soumyaranjand543:rPq51Ew3XQj80J2E@cluster0.b73x0.mongodb.net/inked_news?retryWrites=true&w=majority&appName=Cluster0");
  const articles = await Article.find({ likes: { $gt: 0 } });
  for (const a of articles) {
    console.log(`Headline: ${a.headline}`);
    console.log(`Likes: ${a.likes}, LikedBy length: ${a.likedBy.length}`);
    console.log(`LikedBy:`, a.likedBy);
    console.log("---");
  }
  process.exit(0);
}
run();
