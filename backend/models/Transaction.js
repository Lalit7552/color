const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User model se reference
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw'], // Sirf ye do values ho sakti hain
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'], // Transaction ka status
    default: 'pending',
  },
}, {
  timestamps: true // createdAt aur updatedAt fields automatically add ho jayengi
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;