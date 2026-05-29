import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ye function Deposit aur Withdraw dono ko handle karega
  const handleTransaction = async (type) => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id; // User ki ID nikal li

      const endpoint = type === 'deposit' ? '/api/wallet/deposit' : '/api/wallet/withdraw';

      // Nayi banayi gayi API ko call kar rahe hain
      const response = await axios.post(endpoint, {
        userId,
        amount: Number(amount)
      });

      if (response.data.success) {
        alert(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
        navigate("/transaction"); // Transaction page par bhej do taaki history dikh sake
      } else {
        alert(response.data.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pt-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Wallet</h2>
      
      <div className="bg-[#1a2133] rounded-2xl p-6 shadow-lg border border-gray-800">
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Amount (₹)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Enter Amount" 
            className="w-full bg-[#0a0f1e] text-white border border-gray-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => handleTransaction('deposit')}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition flex justify-center items-center disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
          
          <button 
            onClick={() => handleTransaction('withdraw')}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition flex justify-center items-center disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;