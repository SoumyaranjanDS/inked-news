const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const AdminSettings = require("../models/AdminSettings");
const ModerationLog = require("../models/ModerationLog");

// ── GET /api/admin/settings ────────────────────────────────────────────────
router.get("/settings", adminAuth, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/admin/settings ───────────────────────────────────────────────
router.post("/settings", adminAuth, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/admin/trigger-scraper ────────────────────────────────────────
router.post("/trigger-scraper", adminAuth, async (req, res) => {
  try {
    const scrapeResponse = await fetch("http://localhost:8000/trigger-scrape", {
      method: "POST",
    });
    const scrapeData = await scrapeResponse.json();
    res.json({ success: true, data: scrapeData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/admin/scraped-articles ────────────────────────────────────────
router.get("/scraped-articles", adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const response = await fetch(
      `http://localhost:8000/latest-scraped?limit=${limit}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/admin/logs ────────────────────────────────────────────────────
router.get("/logs", adminAuth, async (req, res) => {
  try {
    const logs = await ModerationLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/admin/logs ─────────────────────────────────────────────────
router.delete("/logs", adminAuth, async (req, res) => {
  try {
    await ModerationLog.deleteMany({});
    res.json({ success: true, message: "All moderation logs cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/admin/users ───────────────────────────────────────────────────
router.get("/users", adminAuth, async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "usr_1",
        name: "Soumyaranjan",
        email: "soumy@example.com",
        status: "Active",
      },
      {
        id: "usr_2",
        name: "John Doe",
        email: "john@example.com",
        status: "Active",
      },
    ],
  });
});

module.exports = router;
