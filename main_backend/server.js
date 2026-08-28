require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/inked";

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'https://inkedfact.online', 'https://www.inkedfact.online'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to Serving Database (MongoDB)");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });

const OPTIMIZER_DB_URI = process.env.MONGO_URI_OPTIMIZER || "mongodb://localhost:27017/optimizer";
const optimizerConnection = mongoose.createConnection(OPTIMIZER_DB_URI);
optimizerConnection.on('connected', () => {
  console.log("✅ Connected to Optimizer Database (MongoDB)");
});

// Admin Settings Schema
const AdminSettingsSchema = new mongoose.Schema({
  ai_service_active: { type: Boolean, default: true },
  active_model: { type: String, default: 'openrouter' },
  api_keys: {
    openrouter: { type: String, default: '' },
    gemini: { type: String, default: '' },
    openai: { type: String, default: '' },
  },
  custom_prompt: { 
    type: String, 
    default: "You are an expert news editor and content moderator.\nRead the following article and provide two things:\n1. A concise, engaging, and accurate SHORT SUMMARY of the article (3-4 sentences max).\n2. A moderation verdict: 'Clean' if it is safe for general audiences, or 'Flagged' if it contains explicit, dangerous, or highly controversial content.\n\nFormat your response EXACTLY like this:\nREWRITE: <your short summary>\nVERDICT: <Clean or Flagged>" 
  }
});
const AdminSettings = mongoose.model("AdminSettings", AdminSettingsSchema, "admin_settings");

const ModerationLogSchema = new mongoose.Schema({
  article_headline: String,
  verdict: String,
  confidence: Number,
  timestamp: Number,
  on_demand: Boolean
});
const ModerationLog = optimizerConnection.model("ModerationLog", ModerationLogSchema, "moderation_log");

// Simple authentication middleware for admin
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (authHeader && authHeader.split(' ')[1] === expectedPassword) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

// Mongoose Schema for raw_articles
const ArticleSchema = new mongoose.Schema({
  headline: String,
  description: String,
  detailed_description: String,
  image_link: String,
  link: { type: String, unique: true },
  source: String,
  date: String,
  time: String,
});

const Article = mongoose.model("Article", ArticleSchema, "serving_articles");

// Map categories to known sources
const CATEGORY_MAP = {
  technology: [
    "Hacker News",
    "TechCrunch",
    "Arstechnica",
    "digitaltrends",
    "Polygon",
  ],
  space: [
    "SpaceNews",
    "NASA",
    "ESA",
    "NASASpaceflight",
    "Spaceflight Now",
    "European Spaceflight",
    "SpacePolicyOnline.com",
    "Space Scout",
  ],
  business: [
    "americanbankingnews",
    "Business Line",
    "CNBC",
    "Seeking Alpha",
    "actionforex",
    "mainstreet",
  ],
  entertainment: ["dailymail", "Metro", "Mail", "Entertainment"],
  world: [
    "The Guardian",
    "ke",
    "The New York Times",
    "WorldNews",
    "BBC",
    "BBC News - Middle East",
    "latimes",
  ],
  sports: [
    "Sporting News",
    "Dk Pittsburgh Sports News",
    "The Independent - Sports",
    "Yahoo Sports",
    "Complete Sports Nigeria",
    "Essentially Sports",
  ],
  health: ["News-Medical", "Medical Xpress", "health matters"],
  lifestyle: ["lifestyle", "LIFESTYLE"],
};

// Basic Route for App to fetch feed
app.get("/api/feed", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const category = req.query.category?.toLowerCase();
    const skip = (page - 1) * limit;

    let query = {};
    if (category && CATEGORY_MAP[category]) {
      query.source = { $in: CATEGORY_MAP[category] };
    } else if (category && category !== "all") {
      // Fallback: If category not in map but requested, try regex matching on source
      query.source = { $regex: new RegExp(category, "i") };
    }

    const articles = await Article.find(query)
      .sort({ _id: -1 }) // simple descending sort for now
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Trending Route ─────────────────────────────────────────────────────────
app.get("/api/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const q = req.query.q; // e.g. "india"

    const INDIAN_SOURCES = [
      "Times of India",
      "The Hindu",
      "Indian Express",
      "Hindustan Times",
      "NDTV",
      "India Today",
      "Financial Express",
      "Economic Times",
      "Google News India",
    ];

    // Only return articles that have a valid image for the carousel
    let query = {
      image_link: { $regex: /^http/ },
    };

    if (q) {
      if (q.toLowerCase() === "india") {
        query.$or = [
          { headline: { $regex: new RegExp(q, "i") } },
          { description: { $regex: new RegExp(q, "i") } },
          { detailed_description: { $regex: new RegExp(q, "i") } },
          { source: { $in: INDIAN_SOURCES } },
        ];
      } else {
        query.$or = [
          { headline: { $regex: new RegExp(q, "i") } },
          { description: { $regex: new RegExp(q, "i") } },
          { detailed_description: { $regex: new RegExp(q, "i") } },
        ];
      }
    }

    let articles = await Article.find(query).sort({ _id: -1 }).limit(limit);

    // Fallback if no specific keyword matches are found
    if (articles.length === 0) {
      articles = await Article.find({ image_link: { $regex: /^http/ } })
        .sort({ _id: -1 })
        .limit(limit);
    }

    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Interests Route ────────────────────────────────────────────────────────
app.get("/api/interests", async (req, res) => {
  try {
    const topics = req.query.topics ? req.query.topics.split(",") : [];
    if (topics.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let articles = [];
    // Try to fetch 1 article per topic to ensure a diverse mix
    for (const topic of topics) {
      let article = await Article.findOne({
        $or: [
          { headline: { $regex: new RegExp(topic, "i") } },
          { description: { $regex: new RegExp(topic, "i") } },
          { detailed_description: { $regex: new RegExp(topic, "i") } },
        ],
        image_link: { $regex: /^http/ },
        _id: { $nin: articles.map((a) => a._id) }, // Avoid duplicates
      }).sort({ _id: -1 });

      if (article) {
        // Attach a helper property so the frontend knows which category matched
        article = article.toObject();
        article.matched_category = topic;
        articles.push(article);
      }
    }

    // Fallback: if we didn't find exactly one for each, just fill the rest with generic latest news
    if (articles.length < 3) {
      const limitNeeded = 3 - articles.length;
      const fallbackArticles = await Article.find({
        image_link: { $regex: /^http/ },
        _id: { $nin: articles.map((a) => a._id) },
      })
        .sort({ _id: -1 })
        .limit(limitNeeded);

      for (let f of fallbackArticles) {
        let fObj = f.toObject();
        fObj.matched_category = "Latest";
        articles.push(fObj);
      }
    }

    res.json({ success: true, data: articles.slice(0, 3) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orchestration Endpoint: Trigger Scraper then Optimizer
app.post("/api/orchestrate", async (req, res) => {
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

// ── Admin Endpoints ──────────────────────────────────────────────────────────

app.get("/api/admin/settings", adminAuth, async (req, res) => {
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

app.post("/api/admin/settings", adminAuth, async (req, res) => {
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

app.post("/api/admin/trigger-scraper", adminAuth, async (req, res) => {
  try {
    const scrapeResponse = await fetch("http://localhost:8000/trigger-scrape", { method: "POST" });
    const scrapeData = await scrapeResponse.json();
    res.json({ success: true, data: scrapeData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/scraped-articles", adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const response = await fetch(`http://localhost:8000/latest-scraped?limit=${limit}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/logs", adminAuth, async (req, res) => {
  try {
    const logs = await ModerationLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/admin/logs", adminAuth, async (req, res) => {
  try {
    await ModerationLog.deleteMany({});
    res.json({ success: true, message: "All moderation logs cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/users", adminAuth, async (req, res) => {
  res.json({ success: true, data: [
    { id: 'usr_1', name: 'Soumyaranjan', email: 'soumy@example.com', status: 'Active' },
    { id: 'usr_2', name: 'John Doe', email: 'john@example.com', status: 'Active' },
  ] });
});

// ── Waitlist Endpoint (marketing website) ────────────────────────────────────
const WaitlistSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ["reader", "writer"], default: "reader" },
  createdAt: { type: Date, default: Date.now },
});
const Waitlist = mongoose.model("Waitlist", WaitlistSchema, "waitlist");

app.post("/api/waitlist", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: "Email required" });
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

// ── Takedown Request Endpoint (marketing website) ────────────────────────────
const TakedownSchema = new mongoose.Schema({
  name: String,
  email: String,
  organisation: String,
  url: String,
  reason: String,
  description: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
const Takedown = mongoose.model("Takedown", TakedownSchema, "takedowns");

app.post("/api/takedown", async (req, res) => {
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

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Main backend is healthy" });
});
// Start Server
app.listen(PORT, () => {
  console.log(
    `🚀 Main Backend Serving API is running on http://localhost:${PORT}`,
  );
});
