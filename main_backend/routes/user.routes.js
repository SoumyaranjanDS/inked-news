const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/user/profile/:id
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({
      success: true,
      data: user.toClientJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/user/bookmarks (Toggle bookmark)
router.post("/bookmarks", async (req, res) => {
  try {
    const { userId, article } = req.body;
    if (!userId || !article) {
      return res
        .status(400)
        .json({ success: false, error: "userId and article are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const existsIndex = user.savedArticles.findIndex(
      (a) =>
        (a.link && a.link === article.link) ||
        (a.headline && a.headline === article.headline)
    );

    let isBookmarked = false;
    if (existsIndex > -1) {
      user.savedArticles.splice(existsIndex, 1);
      isBookmarked = false;
    } else {
      user.savedArticles.unshift(article);
      isBookmarked = true;
    }

    await user.save();
    res.json({
      success: true,
      isBookmarked,
      savedCount: user.savedArticles.length,
      savedArticles: user.savedArticles,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/user/likes (Toggle like)
router.post("/likes", async (req, res) => {
  try {
    const { userId, articleHeadline } = req.body;
    if (!userId || !articleHeadline) {
      return res
        .status(400)
        .json({ success: false, error: "userId and articleHeadline required" });
    }
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const index = user.likedArticles.indexOf(articleHeadline);
    let isLiked = false;
    if (index > -1) {
      user.likedArticles.splice(index, 1);
      isLiked = false;
    } else {
      user.likedArticles.push(articleHeadline);
      isLiked = true;
    }
    await user.save();
    res.json({ success: true, isLiked, likedCount: user.likedArticles.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/user/topics
router.put("/topics", async (req, res) => {
  try {
    const { userId, topics } = req.body;
    if (!userId || !Array.isArray(topics)) {
      return res
        .status(400)
        .json({ success: false, error: "userId and topics array required" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { preferredTopics: topics },
      { new: true }
    );
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, preferredTopics: user.preferredTopics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
