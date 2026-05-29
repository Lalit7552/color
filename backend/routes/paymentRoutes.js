const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const User = require('../models/User');
const Transaction = require('../models/Transaction'); 

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Make sure your .env matches this
});

// 1. Create Order Endpoint
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount provided.' });
    }
    
    const options = {
      amount: Math.round(Number(amount) * 100), // Paise mein convert kiya aur round kar diya (Razorpay requires integer)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ success: false, message: 'Error creating order' });
    }
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error creating Razorpay order',
      errorDetails: error 
    });
  }
});

// 2. Verify Payment Endpoint
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Signature verification string
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // SECURITY: Razorpay se original amount fetch karein (Frontend pe trust na karein)
      const order = await razorpay.orders.fetch(razorpay_order_id);
      const actualAmountInRupees = order.amount / 100;

      // EFFICIENCY: Direct MongoDB update with $inc
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { $inc: { balance: actualAmountInRupees } },
        { new: true } // Returns the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // HISTORY: Transaction record save karein
      await Transaction.create({ 
        userId, 
        type: 'deposit', 
        amount: actualAmountInRupees, 
        status: 'success' 
      });

      res.json({ success: true, message: 'Payment verified & balance updated', balanceAdded: actualAmountInRupees });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Signature. Payment failed.' });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

module.exports = router;