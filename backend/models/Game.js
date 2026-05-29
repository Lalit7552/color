const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  period: { type: String, required: true, unique: true }, 
  result: { type: String, default: null }, // 🔥 NAYA FORMAT: '0,red-violet,small'
  adminManualResult: { type: String, default: null }, // Admin yahan 0 se 9 tak number dega
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", gameSchema);