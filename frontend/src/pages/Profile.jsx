import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Wallet, History, Settings, Shield, Headphones, LogOut, ChevronRight } from "lucide-react";
import { jwtDecode } from "jwt-decode";; // User ID nikalne ke liye

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Asli user data yahan store hoga
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id; // Token se user ki MongoDB ID nikali

        // Backend se user ka data fetch karein
        const response = await fetch(`/api/game/user-details/${userId}`);
        const result = await response.json();

        if (result.success) {
          setUser(result.data); // User data ko state me save kiya
        } else {
          console.error("User data fetch nahi ho paya:", result.message);
          handleLogout(); // Agar koi error aaye to logout kar do
        }
      } catch (error) {
        console.error("Token decode ya fetch me error:", error);
        handleLogout(); // Invalid token par logout
      } finally {
        setLoading(false); // Loading khatam
      }
    };

    fetchUserData();
  }, [navigate]);

  // Loading spinner jab tak data load ho raha hai
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Agar user data load nahi hua to error dikhayein
  if (!user) {
    return (
      <div className="p-4 pt-6 text-center text-red-400">
        <h2>User data load nahi ho saka. Dobara login karein.</h2>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Force reload taaki sab states reset ho jayein
  };

  const menuItems = [
    { icon: Wallet, label: "Deposit / Withdrawal", path: "/deposit", color: "text-blue-400" },
    { icon: History, label: "Bet History", path: "/bethistory", color: "text-green-400" },
    { icon: Shield, label: "Security & Privacy", path: "#", color: "text-purple-400" },
    // { icon: Headphones, label: "Customer Support", path: "#", color: "text-yellow-400" },
    // { icon: Settings, label: "Settings", path: "#", color: "text-gray-400" },
  ];

  return (
    <div className="p-4 pt-6 max-w-md mx-auto w-full">
      {/* Header */}

      {/* Profile Card */}
      <div className="bg-[#1a2133] rounded-2xl p-6 mb-6 shadow-lg border border-gray-800 flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.4)]">
          <User size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{user.username || user.name}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 shadow-lg flex justify-between items-center text-white">
        <div>
          <p className="text-sm opacity-80 mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold">₹{user.balance ? user.balance.toFixed(2) : '0.00'}</h2>
        </div>
        <button
          onClick={() => navigate("/deposit")}
          className="bg-white text-green-600 px-4 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition"
        >
          Add Fund
        </button>
      </div>

      {/* Menu Options */}
      <div className="bg-[#1a2133] rounded-2xl p-2 mb-6 shadow-lg border border-gray-800">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => item.path !== "#" && navigate(item.path)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#252d43] transition-colors rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <item.icon size={22} className={item.color} />
              <span className="text-gray-200 font-medium">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-500 p-4 rounded-2xl hover:bg-red-500/20 transition-colors border border-red-500/20"
      >
        <LogOut size={20} />
        <span className="font-bold">Logout</span>
      </button>
    </div>
  );
}