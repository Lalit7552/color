const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Game = require("../models/Game"); // 👈 Game model add kiya
const Bet = require("../models/Bet");   // 👈 Bet model add kiya
const gameState = require("../state/gameState"); // 👈 Game state add kiya

const router = express.Router();

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admn123";

// Middleware to verify Admin Token
function verifyAdminToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Admin token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded payload me { id } pass kiya gaya hai
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired admin token" });
  }
}

/* 1. ADMIN LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, token });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* 2. ADMIN DASHBOARD STATS (Updated for Game) */
router.get("/dashboard/stats", verifyAdminToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await Game.countDocuments(); // 👈 Game count
    const totalBets = await Bet.countDocuments();   // 👈 Bets count

    return res.json({
      success: true,
      totalUsers,
      totalGames,
      totalBets
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* 3. 🔥 ADMIN SET MANUAL RESULT (Secure) */
router.post("/set-result", verifyAdminToken, async (req, res) => {
  const { period, color } = req.body;

  // Check agar admin purane ya galat period ka result set kar raha ho
  if (period !== gameState.currentPeriod) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid Period! Sirf current period ka result set ho sakta hai." 
    });
  }

  try {
    await Game.findOneAndUpdate(
      { period: period },
      { adminManualResult: color },
      { upsert: true }
    );
    return res.json({ 
      success: true, 
      message: `Period ${period} me ${color.toUpperCase()} set ho gaya hai!` 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Database Error" });
  }
});

module.exports = router;