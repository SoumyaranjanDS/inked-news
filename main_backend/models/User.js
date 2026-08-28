const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  name: { type: String, default: "Inked Reader" },
  avatar: { type: String, default: "" },
  savedArticles: [{ type: mongoose.Schema.Types.Mixed }],
  likedArticles: [{ type: String }],
  preferredTopics: [{ type: String, default: ["Technology", "Space", "Business"] }],
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

// Helper to hash passwords securely
UserSchema.statics.hashPassword = function (password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

// Helper to verify password against hash
UserSchema.methods.verifyPassword = function (password) {
  if (!this.passwordHash || !this.passwordHash.includes(":")) return false;
  const [salt, hash] = this.passwordHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === testHash;
};

// Sanitize user object for client response
UserSchema.methods.toClientJSON = function () {
  return {
    id: this._id,
    googleId: this.googleId,
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    savedArticles: this.savedArticles || [],
    likedArticles: this.likedArticles || [],
    preferredTopics: this.preferredTopics || [],
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema, "users");
