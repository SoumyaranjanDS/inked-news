const express = require("express");
const router = express.Router();
const Article = require("../models/Article");

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

// ── GET /api/feed ──────────────────────────────────────────────────────────
router.get("/feed", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const category = req.query.category?.toLowerCase();
    const skip = (page - 1) * limit;

    let query = {};
    if (category && CATEGORY_MAP[category]) {
      query.source = { $in: CATEGORY_MAP[category] };
    } else if (category && category !== "all") {
      query.source = { $regex: new RegExp(category, "i") };
    }

    const articles = await Article.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/trending ──────────────────────────────────────────────────────
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const q = req.query.q;

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

// ── GET /api/interests ─────────────────────────────────────────────────────
router.get("/interests", async (req, res) => {
  try {
    const topics = req.query.topics ? req.query.topics.split(",") : [];
    if (topics.length === 0) {
      return res.json({ success: true, data: [] });
    }

    let articles = [];
    for (const topic of topics) {
      let article = await Article.findOne({
        $or: [
          { headline: { $regex: new RegExp(topic, "i") } },
          { description: { $regex: new RegExp(topic, "i") } },
          { detailed_description: { $regex: new RegExp(topic, "i") } },
        ],
        image_link: { $regex: /^http/ },
        _id: { $nin: articles.map((a) => a._id) },
      }).sort({ _id: -1 });

      if (article) {
        article = article.toObject();
        article.matched_category = topic;
        articles.push(article);
      }
    }

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

module.exports = router;
