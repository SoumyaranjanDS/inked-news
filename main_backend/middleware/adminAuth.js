// Simple authentication middleware for admin panel
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.split(" ")[1] === "inked@admin2024") {
    next();
  } else {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = adminAuth;
