const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0 // Default balance 0 hoga jab koi naya user signup karega
  }
}, { 
  timestamps: true // Yeh automatically createdAt aur updatedAt fields add kar dega
});

module.exports = mongoose.model('User', userSchema);