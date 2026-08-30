const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const User = require("../models/User");

// Middleware to ensure user is provided (can be expanded to real auth later)
const requireAuth = (req, res, next) => {
  const userId = req.body.userId || req.query.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized: userId is required" });
  }
  req.userId = userId;
  next();
};

// POST /api/interactions/like/:articleId
router.post("/like/:articleId", requireAuth, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { userId } = req;

    let article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const likedIndex = article.likedBy.findIndex(id => id.toString() === userId.toString());
    let isLiked = false;

    if (likedIndex > -1) {
      // Unlike
      article.likedBy.splice(likedIndex, 1);
      article.likes = Math.max(0, article.likes - 1);
      
      // Update user document
      const userLikedIndex = user.likedArticles.indexOf(article.headline);
      if (userLikedIndex > -1) user.likedArticles.splice(userLikedIndex, 1);
    } else {
      // Like
      article.likedBy.push(userId);
      article.likes = (article.likes || 0) + 1;
      isLiked = true;
      
      // Update user document
      if (!user.likedArticles.includes(article.headline)) {
        user.likedArticles.push(article.headline);
      }
    }

    await article.save();
    await user.save();

    res.json({ success: true, isLiked, likes: article.likes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interactions/share/:articleId
router.post("/share/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findByIdAndUpdate(
      articleId,
      { $inc: { shares: 1 } },
      { new: true }
    );
    
    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    res.json({ success: true, shares: article.shares });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interactions/comment/:articleId
router.post("/comment/:articleId", requireAuth, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { userId } = req;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, error: "Comment text is required" });
    }

    let article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };

    article.comments.push(newComment);
    await article.save();

    // Populate user info before returning
    await article.populate('comments.user', 'name avatar');
    const addedComment = article.comments[article.comments.length - 1];

    res.json({ success: true, comment: addedComment, commentCount: article.comments.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/interactions/comments/:articleId
router.get("/comments/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findById(articleId).populate('comments.user', 'name avatar').select('comments');
    
    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    // Sort comments newest first
    const sortedComments = article.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, comments: sortedComments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interactions/share/:articleId
router.post("/share/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Increment share count and disable expireAt so it doesn't get deleted
    const article = await Article.findByIdAndUpdate(
      articleId,
      { 
        $inc: { shares: 1 },
        $unset: { expireAt: "" }
      },
      { new: true }
    );

    if (!article) return res.status(404).json({ success: false, error: "Article not found" });

    res.json({ success: true, shares: article.shares });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
