const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction"); // Naya model import karein
const User = require("../models/User"); // User model bhi chahiye balance update ke liye

// User ke saare transactions (deposits/withdrawals) fetch karein
router.get("/transactions/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }) // Sabse naya upar
      .limit(50); // Performance ke liye limit laga di

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Error fetching transactions" });
  }
});

// 2. Deposit API (Paisa Add Karna)
router.post("/deposit", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.balance += Number(amount); // User ka balance badhao
    await user.save();

    const newTxn = await Transaction.create({
      userId,
      type: 'deposit',
      amount: Number(amount),
      status: 'success' // Abhi direct success kar rahe hain (real payment gateway me pehle pending hota hai)
    });

    res.json({ success: true, message: "Deposit successful", data: newTxn, balance: user.balance });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ success: false, message: "Deposit fail ho gaya" });
  }
});

// 3. Withdraw API (Paisa Nikalna)
router.post("/withdraw", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // 🔥 Atomic deduction - prevents multiple clicks hacking
    const user = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ success: false, message: "Insufficient balance or user not found!" });
    }

    const newTxn = await Transaction.create({
      userId,
      type: 'withdraw',
      amount: Number(amount),
      status: 'pending' // Withdraw admin approve karega isliye pending
    });

    res.json({ success: true, message: "Withdrawal request sent", data: newTxn, balance: user.balance });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ success: false, message: "Withdraw fail ho gaya" });
  }
});

module.exports = router;