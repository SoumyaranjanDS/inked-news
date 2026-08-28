const mongoose = require("mongoose");

const AdminSettingsSchema = new mongoose.Schema({
  ai_service_active: { type: Boolean, default: true },
  active_model: { type: String, default: "openrouter" },
  api_keys: {
    openrouter: { type: String, default: "" },
    gemini: { type: String, default: "" },
    openai: { type: String, default: "" },
  },
  custom_prompt: {
    type: String,
    default:
      "You are an expert news editor and content moderator.\nRead the following article and provide two things:\n1. A concise, engaging, and accurate SHORT SUMMARY of the article (3-4 sentences max).\n2. A moderation verdict: 'Clean' if it is safe for general audiences, or 'Flagged' if it contains explicit, dangerous, or highly controversial content.\n\nFormat your response EXACTLY like this:\nREWRITE: <your short summary>\nVERDICT: <Clean or Flagged>",
  },
});

module.exports = mongoose.model(
  "AdminSettings",
  AdminSettingsSchema,
  "admin_settings"
);
