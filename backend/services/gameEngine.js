const Game = require("../models/Game");
const Bet = require("../models/Bet");
const User = require("../models/User");
const gameState = require("../state/gameState");

const startGameLoop = async () => {
  await Game.findOneAndUpdate({ period: gameState.currentPeriod }, {}, { upsert: true });

  setInterval(async () => {
    gameState.timeLeft--;

    if (gameState.timeLeft <= 5) {
      gameState.isBettingLocked = true;
    }

    if (gameState.timeLeft <= 0) {
      const currentPeriod = gameState.currentPeriod;
      
      const periodBets = await Bet.find({ period: currentPeriod, status: "pending" });
      const currentGame = await Game.findOne({ period: currentPeriod }).lean(); // 🔥 .lean() lagaya taaki non-schema fields mil sakein

      // ==========================================
      // 🔥 ADMIN PROFIT LOGIC (LOWEST LIABILITY)
      // ==========================================
      
      const outcomes = {
        0: { colors: ['red', 'violet'], size: 'small' },
        1: { colors: ['green'], size: 'small' },
        2: { colors: ['red'], size: 'small' },
        3: { colors: ['green'], size: 'small' },
        4: { colors: ['red'], size: 'small' },
        5: { colors: ['green', 'violet'], size: 'big' },
        6: { colors: ['red'], size: 'big' },
        7: { colors: ['green'], size: 'big' },
        8: { colors: ['red'], size: 'big' },
        9: { colors: ['green'], size: 'big' }
      };

      let minPayout = Infinity;
      let possibleWinningNumbers = []; 

      // 1. Admin Override filtering (Smart Logic)
      let validNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      if (currentGame) {
        if (currentGame.adminManualNumber !== undefined && currentGame.adminManualNumber !== null && currentGame.adminManualNumber !== "") {
          validNumbers = [parseInt(currentGame.adminManualNumber)];
        } else {
          if (currentGame.adminManualColor) {
            validNumbers = validNumbers.filter(n => outcomes[n].colors.includes(currentGame.adminManualColor));
          }
          if (currentGame.adminManualSize) {
            validNumbers = validNumbers.filter(n => outcomes[n].size === currentGame.adminManualSize);
          }
          
          // Old code support (agar sirf adminManualResult string ho)
          if (validNumbers.length === 10 && currentGame.adminManualResult) {
            const val = currentGame.adminManualResult;
            if (['red', 'green', 'violet'].includes(val)) {
              validNumbers = validNumbers.filter(n => outcomes[n].colors.includes(val));
            } else if (!isNaN(parseInt(val))) {
              validNumbers = [parseInt(val)];
            }
          }
        }
        
        // Agar admin galat combination chunta hai (jaise green color par number 2) toh wapas default kardo
        if (validNumbers.length === 0) validNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      }

      // 2. Calculate liability ONLY for valid numbers
      for (let i of validNumbers) {
        let currentPayout = 0;
        const outcome = outcomes[i];

        periodBets.forEach(bet => {
          if (bet.type === 'number' && Number(bet.number) === i) {
            currentPayout += bet.amount * 7.4; // 20% fee on profit
          }
          if (bet.type === 'size' && bet.size === outcome.size) {
            currentPayout += bet.amount * 1.8; // 20% fee on profit
          }
          if (bet.type === 'color' && outcome.colors.includes(bet.color)) {
            if (bet.color === 'violet') {
              currentPayout += bet.amount * 3.8; // 20% fee on profit
            } else if (outcome.colors.includes('violet')) {
              currentPayout += bet.amount * 1.4; // 20% fee on profit
            } else {
              currentPayout += bet.amount * 1.8; // 20% fee on profit
            }
          }
        });

        if (currentPayout < minPayout) {
          minPayout = currentPayout;
          possibleWinningNumbers = [i]; 
        } 
        else if (currentPayout === minPayout) {
          possibleWinningNumbers.push(i);
        }
      }

      const winningNumber = possibleWinningNumbers[Math.floor(Math.random() * possibleWinningNumbers.length)];
      const finalOutcome = outcomes[winningNumber];
      
      const finalResult = `${winningNumber},${finalOutcome.colors.join('-')},${finalOutcome.size}`;

      await Game.updateOne({ period: currentPeriod }, { result: finalResult });
      console.log(`\n🎉 Period ${currentPeriod} Result Declared: ${finalResult.toUpperCase()} (Total Liability: ₹${minPayout})`);

      // ==========================================
      // 💰 WINNINGS DISTRIBUTION (With 20% Profit Fee Logic)
      // ==========================================
      try {
        for (let bet of periodBets) {
          let winAmount = 0;
          let isWinner = false;

          if (bet.type === 'number' && bet.number === winningNumber) {
            isWinner = true;
            winAmount = bet.amount * 7.4; 
          } else if (bet.type === 'size' && bet.size === finalOutcome.size) {
            isWinner = true;
            winAmount = bet.amount * 1.8; 
          } else if (bet.type === 'color' && finalOutcome.colors.includes(bet.color)) {
            isWinner = true;
            if (bet.color === 'violet') {
              winAmount = bet.amount * 3.8; 
            } else if (finalOutcome.colors.includes('violet')) {
              winAmount = bet.amount * 1.4; 
            } else {
              winAmount = bet.amount * 1.8; 
            }
          }

          if (isWinner) {
            bet.status = "win";
            bet.winningAmount = winAmount; 
            await bet.save();
            await User.findByIdAndUpdate(bet.userId, { $inc: { balance: winAmount } });
          } else {
            bet.status = "lose";
            await bet.save();
          }
        }
      } catch (err) {
        console.error("Winnings Distribution Error:", err);
      }

      // ==========================================
      // 🔄 NAYA PERIOD START
      // ==========================================
      gameState.currentPeriod = (BigInt(currentPeriod) + 1n).toString();
      gameState.timeLeft = 60;
      gameState.isBettingLocked = false;
      
      await Game.findOneAndUpdate({ period: gameState.currentPeriod }, {}, { upsert: true });
    }
  }, 1000);
};

module.exports = { startGameLoop };