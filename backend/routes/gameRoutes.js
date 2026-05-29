const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const Bet = require("../models/Bet");
const User = require("../models/User"); // Aapka User model
const gameState = require("../state/gameState");

// 1. Get Live Status (Timer & Period)
router.get("/status", (req, res) => {
  res.json({
    success: true,
    period: gameState.currentPeriod,
    timeLeft: gameState.timeLeft,
    isLocked: gameState.isBettingLocked
  });
});

// 2. Place Bet (User bet lagayega)
router.post("/place-bet", async (req, res) => {
  // 🔥 UPDATE: req.body se 'number' aur 'type' dono nikal rahe hain
  const { userId, type, value, number, amount } = req.body;
  const currentPeriod = gameState.currentPeriod;

  // Last 5 second me entry band
  if (gameState.isBettingLocked) {
    return res.status(400).json({ success: false, message: "Betting is locked for this period!" });
  }

  try {
    // 0.50 fee total deduction mein add karein
    const totalDeduction = amount + 0.50;

    const user = await User.findById(userId);
    if (!user || user.balance < totalDeduction) {
      return res.status(400).json({ success: false, message: "Insufficient balance!" });
    }

    // User ka balance kaato (amount + 0.50 fee)
    user.balance -= totalDeduction;
    await user.save();

    // 🔥 UPDATE: Naye Schema ke hisaab se Bet object banao
    const betData = {
      userId,
      period: currentPeriod,
      amount,
      type // Schema mein ab ye required hai
    };
    
    // Type ke hisaab se values add karo
    if (type === "color") betData.color = value;
    if (type === "size") betData.size = value;
    if (type === "number") betData.number = number;

    // Database me save karo
    const newBet = await Bet.create(betData);

    res.json({ success: true, message: "Bet placed successfully!", bet: newBet, newBalance: user.balance });
  } catch (error) {
    console.error("Bet placement error:", error);
    // Error object pass kiya taaki front-end pe actual error dikhe agar kuch galat ho
    res.status(500).json({ success: false, message: "Error placing bet", error: error.message });
  }
});

// 3. User ki Personal History
router.get("/my-history/:userId", async (req, res) => {
  try {
    const history = await Bet.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching history" });
  }
});

// 4. Get Game Results
router.get("/results", async (req, res) => {
  try {
    // 🔥 Sirf completed games aur current live game ko fetch karein (purane fass gaye games hide ho jayenge)
    const results = await Game.find({
      $or: [
        { result: { $exists: true, $ne: "" } }, // Jinka result successfully aa chuka hai
        { period: gameState.currentPeriod } // Jo match current (live) chal raha hai
      ]
    }).sort({ _id: -1 }).limit(0);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching game results" });
  }
});

// 5. User ki Details Fetch Karna
router.get("/user-details/:userId", async (req, res) => {
  try {
    // User ko ID se dhundein aur password ko chhodkar baki sab bhej dein
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user details" });
  }
});

module.exports = router;