const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  description: String,
  detailed_description: String,
  image_link: String,
  link: { type: String, unique: true, required: true },
  source: String,
  date: String,
  time: String,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  shares: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  expireAt: { type: Date } // Replaces created_at TTL. Unset this when saved.
});

module.exports = mongoose.model("Article", ArticleSchema, "serving_articles");
