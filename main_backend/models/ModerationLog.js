const mongoose = require("mongoose");
const { getOptimizerConnection } = require("../config/db");

const ModerationLogSchema = new mongoose.Schema({
  article_headline: String,
  verdict: String,
  confidence: Number,
  timestamp: Number,
  on_demand: Boolean,
});

const optimizerConn = getOptimizerConnection();
module.exports = optimizerConn.model(
  "ModerationLog",
  ModerationLogSchema,
  "moderation_log"
);
