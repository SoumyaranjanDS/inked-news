const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/inked";

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to Primary MongoDB Serving Database");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const getOptimizerConnection = () => {
  const OPTIMIZER_DB_URI =
    process.env.MONGO_URI_OPTIMIZER ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/inked";

  if (process.env.MONGO_URI_OPTIMIZER) {
    const conn = mongoose.createConnection(OPTIMIZER_DB_URI);
    conn.on("connected", () => {
      console.log("✅ Connected to Optimizer Database");
    });
    conn.on("error", (err) => {
      console.warn("⚠️ Optimizer DB connection issue:", err.message);
    });
    return conn;
  }
  return mongoose.connection;
};

module.exports = { connectDB, getOptimizerConnection };
