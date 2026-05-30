import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Wallet as WalletIcon, IndianRupee, ShieldCheck } from "lucide-react";

// Dynamically load Razorpay checkout script

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Wallet() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  // Quick Amount options
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    loadRazorpayScript();
    // Fetch current balance when Wallet UI loads
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBalance(data.balance || 0);
        } catch (error) {
          console.error("Balance fetch error:", error);
        }
      }
    };
    fetchBalance();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      alert("Minimum deposit amount is ₹1");
      return;
    }
    
    let userId = localStorage.getItem("userId");
    if (!userId) {
       const token = localStorage.getItem("token");
       if (token) {
         userId = JSON.parse(atob(token.split('.')[1])).id;
       }
    }
    if (!userId) {
      alert("Please login first!");
      navigate('/login');
      return;
    }

    try {
      // 1. Create Razorpay order on Backend
      const { data: order } = await axios.post(`${import.meta.env.VITE_API_URL}/payment/create-order`, { amount: Number(amount) });

      // 2. Razorpay configuration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure this is in your .env file
        amount: order.amount,
        currency: order.currency,
        name: "Color Win",
        description: "Wallet Deposit",
        order_id: order.id,
        handler: async function (razorpayResponse) {
          // 3. Send payment verification to backend
          try {
            const { data: verifyData } = await axios.post(`${import.meta.env.VITE_API_URL}/payment/verify`, {
              ...razorpayResponse,
              userId,
              amount: Number(amount) // Send amount to backend
            });
            
            if (verifyData.success) {
              alert("Payment Successful & Wallet Updated!");
              setBalance((prev) => prev + verifyData.balanceAdded); // Instant UI Update
              setAmount(""); // Clear input
              navigate("/transaction"); // Go to transaction history
            } else {
              alert("Payment Verification Failed!");
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed on server.");
          }
        },
        theme: { color: "#eab308" } // Yellow color to match UI
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong while initiating payment!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-[#0a0f1e] to-black font-sans pb-10">
      
      {/* 🚀 Header Navbar */}
      <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 p-4 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} // Go back
            className="p-1 text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">Deposit Funds</h1>
        </div>
      </nav>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-2">
        
        {/* 💰 Current Balance Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-yellow-400" /> Current Balance
          </p>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mt-2">
            ₹ {balance.toFixed(2)}
          </h2>
        </div>

        {/* 💵 Enter Amount Section */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <h3 className="text-gray-300 font-semibold mb-4">Enter Amount</h3>
          
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IndianRupee className="h-6 w-6 text-yellow-400" />
            </div>
            <input
              type="number"
              className="w-full border border-gray-600 py-4 pl-12 pr-4 rounded-xl bg-gray-800/50 text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Quick Amounts Grid */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-2 rounded-lg font-bold border transition-all ${
                  amount == amt 
                    ? "bg-yellow-500 text-gray-900 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                    : "bg-gray-800/50 text-gray-300 border-gray-600 hover:border-yellow-400/50"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3 flex justify-center items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-500" /> 100% Safe & Secure Payments via Razorpay
          </p>
        </div>

        {/* 🚀 Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!amount}
          className="w-full py-4 rounded-xl font-extrabold text-gray-900 text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(250,204,21,0.4)] transform hover:-translate-y-1 active:translate-y-0 mt-4"
        >
          Deposit ₹{amount || "0"}
        </button>

      </div>
    </div>
  );
}