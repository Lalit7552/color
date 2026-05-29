require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { startGameLoop } = require("./services/gameEngine"); // 👈 Import Engine

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes Mount
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes")); // 👈 Wallet Routes Mount
app.use("/api/game", require("./routes/gameRoutes")); // 👈 Game Routes Mount

// DB & Server Init
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    
    // 👇 DB connect hone ke baad Timer start karein
    startGameLoop();
    console.log("Game Engine Started ⏱️");
  })
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});