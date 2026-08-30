require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
require("./config/firebase"); // Initialize Firebase Admin

// Import Route Handlers
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const feedRoutes = require("./routes/feed.routes");
const adminRoutes = require("./routes/admin.routes");
const marketingRoutes = require("./routes/marketing.routes");
const interactionRoutes = require("./routes/interaction.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://inkedfact.online",
    "https://www.inkedfact.online",
  ],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", feedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api", marketingRoutes);

// Connect to Database & Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `🚀 Main Backend Serving API running on http://localhost:${PORT}`,
    );
  });
};

startServer();

module.exports = app;
