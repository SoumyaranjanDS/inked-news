const mongoose = require("mongoose");

const TakedownSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  organisation: String,
  url: { type: String, required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Takedown", TakedownSchema, "takedowns");
