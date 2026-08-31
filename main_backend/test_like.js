const mongoose = require("mongoose");
const Article = require("./models/Article");
const User = require("./models/User");

async function run() {
  await mongoose.connect("mongodb+srv://soumyaranjand543:rPq51Ew3XQj80J2E@cluster0.b73x0.mongodb.net/inked_news?retryWrites=true&w=majority&appName=Cluster0");
  console.log("Connected");

  const article = await Article.findOne().sort({ _id: -1 });
  console.log("Article likes:", article.likes, "likedBy:", article.likedBy);

  // create two fake users
  const u1 = new User({ email: "test1@test.com", googleId: "111" });
  await u1.save();
  const u2 = new User({ email: "test2@test.com", googleId: "222" });
  await u2.save();

  console.log("U1 ID:", u1._id);
  console.log("U2 ID:", u2._id);

  // Like 1
  article.likedBy.push(u1._id);
  article.likes = (article.likes || 0) + 1;
  await article.save();
  console.log("After U1 like:", article.likes, article.likedBy);

  // Like 2
  const article2 = await Article.findById(article._id);
  article2.likedBy.push(u2._id);
  article2.likes = (article2.likes || 0) + 1;
  await article2.save();
  console.log("After U2 like:", article2.likes, article2.likedBy);

  await User.deleteOne({ _id: u1._id });
  await User.deleteOne({ _id: u2._id });
  process.exit(0);
}
run();
