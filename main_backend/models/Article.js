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
});

module.exports = mongoose.model("Article", ArticleSchema, "serving_articles");
