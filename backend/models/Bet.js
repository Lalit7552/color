const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  period: { type: String, required: true },
  type: { type: String, required: true },   // 🔥 NAYA: 'color', 'size', ya 'number'
  color: { type: String, required: false }, // 'red', 'green', 'violet'
  size: { type: String, required: false },  // 'big', 'small'
  number: { type: Number, required: false },// 🔥 NAYA: 0 se 9 tak number
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" }, // 'pending', 'win', 'lose'
  winningAmount: { type: Number, default: 0 },  // 🔥 NAYA: 'winnings' ko 'winningAmount' kar diya hai
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bet", betSchema);