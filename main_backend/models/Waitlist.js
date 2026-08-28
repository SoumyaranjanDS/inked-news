const mongoose = require("mongoose");

const WaitlistSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ["reader", "writer"], default: "reader" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Waitlist", WaitlistSchema, "waitlist");
