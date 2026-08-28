const express = require("express");
const router = express.Router();
const Waitlist = require("../models/Waitlist");
const Takedown = require("../models/Takedown");

// ── POST /api/waitlist ─────────────────────────────────────────────────────
router.post("/waitlist", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email required" });
    }
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.json({ success: true, message: "Already on waitlist" });
    }
    await Waitlist.create({ email, role: role || "reader" });
    console.log(`✅ Waitlist signup: ${email} (${role})`);
    res.json({ success: true, message: "Added to waitlist" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/takedown ─────────────────────────────────────────────────────
router.post("/takedown", async (req, res) => {
  try {
    const { name, email, organisation, url, reason, description } = req.body;
    if (!email || !url || !reason || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }
    const doc = await Takedown.create({
      name,
      email,
      organisation,
      url,
      reason,
      description,
    });
    console.log(`📋 Takedown request received from ${email} for ${url}`);
    res.json({
      success: true,
      reference: `TDN-${doc._id.toString().slice(-6).toUpperCase()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/orchestrate ──────────────────────────────────────────────────
router.post("/orchestrate", async (req, res) => {
  try {
    console.log("Orchestration: Triggering scraper...");
    const scrapeResponse = await fetch("http://localhost:8000/trigger-scrape", {
      method: "POST",
    });
    const scrapeData = await scrapeResponse.json();
    console.log("Orchestration: Scrape finished:", scrapeData);

    res.json({
      success: true,
      message: "Flow completed successfully",
      data: scrapeData,
    });
  } catch (error) {
    console.error("Orchestration Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/notifications/register-device ────────────────────────────────
router.post("/notifications/register-device", async (req, res) => {
  try {
    const { token, platform, userId, topics } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Device token is required" });
    }
    console.log(`📱 FCM Device Token Registered: [${platform || "android"}] ${token.slice(0, 15)}... (User: ${userId || "guest"})`);
    res.json({ success: true, message: "Device registered for breaking news alerts" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/health ────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Main backend is healthy" });
});

module.exports = router;
