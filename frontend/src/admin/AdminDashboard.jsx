import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState("");
  
  const [activeColor, setActiveColor] = useState(""); 
  const [activeSize, setActiveSize] = useState("");
  const [activeNumber, setActiveNumber] = useState("");

  // 1. Live Game Status Fetch Karna (Har 1 second me)
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/status`);
        if (data.success) {
          if (period && period !== data.period) {
            // Jaise hi naya period shuru ho, purana selection clear kar do (not initial load)
            setActiveColor("");
            setActiveSize("");
            setActiveNumber("");
            setMessage("");
            localStorage.removeItem("adminManualResult");
          } else if (!period) {
            // Jab page refresh ho (initial load)
            const saved = localStorage.getItem("adminManualResult");
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed.period === data.period) {
                  setActiveColor(parsed.color || "");
                  setActiveSize(parsed.size || "");
                  setActiveNumber(parsed.number || "");
                } else {
                  localStorage.removeItem("adminManualResult");
                }
              } catch (e) {}
            }
          }
          setPeriod(data.period);
          setTimeLeft(data.timeLeft);
        }
      } catch (error) {
        console.error("Game status fetch error");
      }
    };

    fetchGameStatus(); // Turant call karein
    const interval = setInterval(fetchGameStatus, 1000); // Phir har 1 second me
    return () => clearInterval(interval);
  }, [period]);

  // 2. Manual Result Set Karna
  const handleSetResult = async () => {
    const token = localStorage.getItem("adminToken"); // Login se mila token

    if (!token) {
      alert("Admin Token missing. Please login again!");
      return;
    }

    // Check karein ki at least ek chiz select ki gayi ho
    if (!activeColor && !activeSize && !activeNumber) {
      setMessage("⚠️ Pehle Color, Size ya Number select karein!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/set-result`,
        {
          period: period,
          color: activeColor,
          size: activeSize,
          number: activeNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage(`✅ Period ${period} ke liye result set ho gaya!`);
        // Refresh karne par state bacha rahe uske liye LocalStorage me save karein
        localStorage.setItem("adminManualResult", JSON.stringify({
          period: period,
          color: activeColor,
          size: activeSize,
          number: activeNumber
        }));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error setting result");
    }
  };

  // Component ka main render yahan se shuru hota hai
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
          Admin Game Controller
        </h2>

        {/* Live Timer Card */}
        <div className="bg-gray-900 rounded-xl p-6 text-center flex justify-between items-center mb-8 border border-gray-700">
          <div>
            <p className="text-gray-400 text-sm">Active Period</p>
            <p className="text-2xl font-black">{period || "Loading..."}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4 text-yellow-500" /> Time Left
            </p>
            <p className={`text-4xl font-black ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-yellow-500"}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        {/* 🔴 1. COLOR SELECTION */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Set Next Result (Manual Override)</p>
          <p className="text-gray-400 text-sm mb-3 text-center">Select Color</p>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveColor("green")}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2
                ${activeColor === "green" ? "bg-green-600 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-gray-800 border-green-600 hover:bg-green-900 text-green-500 hover:text-white"}`}
            >
              Force Green
            </button>
            <button 
              onClick={() => setActiveColor("violet")}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2
              ${activeColor === "violet" ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-gray-800 border-purple-600 hover:bg-purple-900 text-purple-500 hover:text-white"}`}
            >
              Force Violet
            </button>
            <button 
              onClick={() => setActiveColor("red")}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2
            ${activeColor === "red" ? "bg-red-600 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-gray-800 border-red-600 hover:bg-red-900 text-red-500 hover:text-white"}`}
            >
              Force Red
            </button>
          </div>
        </div>

        {/* 🔴 2. SIZE SELECTION */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Select Size</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveSize("big")}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2 
                ${activeSize === "big" ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-gray-800 border-blue-600 hover:bg-blue-900 text-blue-500 hover:text-white"}`}
            >
              Big
            </button>
            <button 
              onClick={() => setActiveSize("small")}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2 
                ${activeSize === "small" ? "bg-orange-600 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-gray-800 border-orange-600 hover:bg-orange-900 text-orange-500 hover:text-white"}`}
            >
              Small
            </button>
          </div>
        </div>

        {/* 🔴 3. NUMBER SELECTION */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Select Number</p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button 
                key={num}
                onClick={() => setActiveNumber(num.toString())}
                className={`py-2 rounded-xl font-bold text-lg transition-all border-2 
                  ${activeNumber === num.toString() ? "bg-gray-200 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300"}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 🔴 4. CONFIRM BUTTON */}
        <div className="mb-6">
          <button
            onClick={handleSetResult}
            className="w-full py-4 rounded-xl font-black text-xl transition-all border-2 bg-yellow-500 border-yellow-400 text-gray-900 shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:bg-yellow-400"
          >
            CONFIRM RESULT
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg text-center text-sm text-green-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> {message}
          </div>
        )}

      </div>
    </div>
  );
}