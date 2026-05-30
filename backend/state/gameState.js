const Game = require("../models/Game");

const gameState = {
  currentPeriod: "1", // Yeh dynamically DB se update hoga
  timeLeft: 60,
  isBettingLocked: false // Last 5 seconds me bet block karne ke liye
};

async function initializePeriod() {
  try {
    const lastGame = await Game.findOne().sort({ _id: -1 });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    
    if (lastGame && lastGame.period && String(lastGame.period).startsWith(dateStr)) {
      // Agar aaj ka game DB me hai, toh last period me +1 kardo
      const lastPeriodNum = BigInt(lastGame.period);
      gameState.currentPeriod = (lastPeriodNum + 1n).toString();
    } else {
      // Naya din hai ya database me koi game nahi hai
      gameState.currentPeriod = `${dateStr}001`;
    }
    console.log("🟢 Game Period Initialized:", gameState.currentPeriod);
  } catch (error) {
    console.error("🔴 Error initializing period:", error);
  }
}

initializePeriod();

module.exports = gameState;