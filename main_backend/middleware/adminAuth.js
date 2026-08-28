// Simple authentication middleware for admin panel
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (authHeader && authHeader.split(" ")[1] === expectedPassword) {
    next();
  } else {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = adminAuth;
