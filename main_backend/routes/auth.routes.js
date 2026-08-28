const express = require("express");
const router = express.Router();
const User = require("../models/User");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "757494779758-hc401iip5ddkic9lr98tros8h30gnekg.apps.googleusercontent.com";

// ── GET /api/auth/google/url ────────────────────────────────────────────────
// Returns Google OAuth URL with prompt=select_account so Chrome opens account chooser
router.get("/google/url", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const callbackUrl = isProd
    ? "https://inkedfact.online/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback";

  const scope = encodeURIComponent("openid email profile");
  const redirectUri = encodeURIComponent(callbackUrl);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;

  res.json({ success: true, url: authUrl });
});

// ── GET /api/auth/google/callback ──────────────────────────────────────────
// Browser receiver: extracts token, gets userinfo, and returns deep link to app
router.get("/google/callback", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authenticating with Inked...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0D0D0D; color: #FFF; text-align: center; }
          .card { background: #161618; border: 1px solid #262628; border-radius: 20px; padding: 32px 24px; max-width: 360px; width: 90%; }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #DC2626; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 16px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { margin: 0 0 8px; font-size: 20px; }
          p { color: #8E8E93; font-size: 13px; margin: 0 0 20px; line-height: 1.5; }
          .btn { display: inline-block; background: #DC2626; color: #FFF; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner" id="spinner"></div>
          <h2 id="statusTitle">Connecting Account...</h2>
          <p id="statusMsg">Please wait while we verify your Google credentials.</p>
          <a href="#" id="returnBtn" class="btn" style="display:none;">Open Inked App</a>
        </div>
        <script>
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');

          if (accessToken) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: 'Bearer ' + accessToken }
            })
            .then(r => r.json())
            .then(googleUser => {
              return fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  googleId: googleUser.sub,
                  email: googleUser.email,
                  name: googleUser.name,
                  avatar: googleUser.picture
                })
              });
            })
            .then(r => r.json())
            .then(res => {
              if (res.success && res.data) {
                document.getElementById('statusTitle').innerText = 'Signed In Successfully!';
                document.getElementById('statusMsg').innerText = 'Welcome ' + res.data.name + '. Redirecting to your app...';
                document.getElementById('spinner').style.display = 'none';
                
                const deepLink = 'inked://auth?user=' + encodeURIComponent(JSON.stringify(res.data));
                const returnBtn = document.getElementById('returnBtn');
                returnBtn.href = deepLink;
                returnBtn.style.display = 'inline-block';
                returnBtn.innerText = 'Return to Inked App';
                
                // Attempt automatic deep link launch
                window.location.href = deepLink;
              } else {
                throw new Error(res.error || 'Failed to authenticate');
              }
            })
            .catch(err => {
              document.getElementById('spinner').style.display = 'none';
              document.getElementById('statusTitle').innerText = 'Authentication Error';
              document.getElementById('statusMsg').innerText = err.message || 'Could not verify account.';
            });
          } else {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('statusTitle').innerText = 'Authentication Cancelled';
            document.getElementById('statusMsg').innerText = 'No access token received.';
          }
        </script>
      </body>
    </html>
  `);
});

// POST /api/auth/register (Email & Password Signup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, preferredTopics } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "An account with this email already exists" });
    }

    const avatar = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
      name || cleanEmail
    )}`;
    const user = await User.create({
      email: cleanEmail,
      name: name ? name.trim() : cleanEmail.split("@")[0],
      passwordHash: User.hashPassword(password),
      avatar,
      preferredTopics: preferredTopics || ["Technology", "Space", "Business"],
      savedArticles: [],
      likedArticles: [],
    });

    console.log(`👤 New user registered: ${user.email} (${user.name})`);
    res.json({ success: true, data: user.toClientJSON() });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login (Email & Password Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    if (user.passwordHash && !user.verifyPassword(password)) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    user.lastActive = new Date();
    await user.save();

    console.log(`🔑 User logged in: ${user.email}`);
    res.json({ success: true, data: user.toClientJSON() });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/google (Direct Google Sign In)
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, name, avatar, preferredTopics } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ googleId: googleId || "non_existent_id" }, { email: cleanEmail }],
    });

    if (!user) {
      user = await User.create({
        googleId,
        email: cleanEmail,
        name: name ? name.trim() : cleanEmail.split("@")[0],
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
            name || cleanEmail
          )}`,
        preferredTopics: preferredTopics || ["Technology", "Space", "Business"],
        savedArticles: [],
        likedArticles: [],
      });
      console.log(`👤 New Google user registered: ${user.email} (${user.name})`);
    } else {
      if (avatar && !user.avatar) user.avatar = avatar;
      if (name && (!user.name || user.name === "Inked Reader")) user.name = name;
      if (googleId && !user.googleId) user.googleId = googleId;
      user.lastActive = new Date();
      await user.save();
    }

    res.json({
      success: true,
      data: user.toClientJSON(),
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
