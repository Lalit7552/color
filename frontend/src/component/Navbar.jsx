import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// 🔥 बेहतरीन Lucide Icons
import { Menu, X, Gamepad2, LogOut, Home, Wallet, History, User, Coins, ReceiptText } from "lucide-react";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setIsSidebarOpen(false);
    navigate("/login");
  };

  const navItemClick = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchUserBalance = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBalance(data.balance || 0);
          localStorage.setItem("userId", data._id); // Razorpay verification ke waqt kaam aayega
        } catch (error) {
          console.error("Failed to fetch user balance", error);
        }
      }
    };
    fetchUserBalance();
  }, []);

  return (
    <>
      {/* 🚀 TOP NAVBAR */}
      <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 p-4 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between relative">

          {/* 1. Left: Hamburger Menu (3 Lines) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-300 hover:text-yellow-400 transition-colors z-10"
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* 2. Center: Game Icon & Name (Perfectly Centered) */}
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none"
          >
            <div
              className="flex items-center gap-1 sm:gap-2 pointer-events-auto"
              onClick={() => navigate("/home")}
            >
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
              <h1 className="text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                COLOR WIN
              </h1>
            </div>
          </div>

          {/* 3. Right: User Wallet/Balance (Responsive Fix) */}
          <button className="p-1 text-gray-300 hover:text-yellow-400 transition-colors z-10 flex items-center gap-1">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            {/* 🛑 'hidden sm:block' हटा दिया गया है, अब यह मोबाइल पर भी दिखेगा */}
            <span className="font-bold text-yellow-400 text-sm sm:text-base">
              ₹{balance.toFixed(2)}
            </span>
          </button>

        </div>
      </nav>

      {/* 🌑 SIDEBAR OVERLAY (Background blur when open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 📱 SIDEBAR / DRAWER MENU (🔥 Shadow Removed Here) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0a0f1e] border-r border-gray-700/50 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-700/50 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-lg text-white">My Profile</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="p-4 flex flex-col h-[calc(100%-80px)]">
          <div className="space-y-2">
            <button onClick={() => navItemClick("/home")} className="w-full flex items-center gap-4 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 p-3 rounded-xl transition-all">
              <Home className="w-5 h-5" /> <span className="font-semibold">Home</span>
            </button>

            <button
              onClick={() => navItemClick("/deposit")}
              className="w-full flex items-center gap-4 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 p-3 rounded-xl transition-all"
            >
              <Wallet className="w-5 h-5" /> <span className="font-semibold">Deposit</span>
            </button>

            <button onClick={() => navItemClick("/bethistory")} className="w-full flex items-center gap-4 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 p-3 rounded-xl transition-all">
              <History className="w-5 h-5" /> <span className="font-semibold">Game History</span>
            </button>
            <button
              onClick={() => navItemClick("/transaction")}
              className="w-full flex items-center gap-4 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 p-3 rounded-xl transition-all"
            >
              <ReceiptText className="w-5 h-5" />
              <span className="font-semibold">Transaction History</span>
            </button>
            <button onClick={() => navItemClick("/profile")} className="w-full flex items-center gap-4 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 p-3 rounded-xl transition-all">
              <User className="w-5 h-5" /> <span className="font-semibold">Profile</span>
            </button>
           
          </div>
        </div>
      </div>
    </>
  );
}