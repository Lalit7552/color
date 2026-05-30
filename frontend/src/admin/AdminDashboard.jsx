import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [period, setPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState("");
  const [activeColor, setActiveColor] = useState(""); // Admin ne kya select kiya

  // 1. Live Game Status Fetch Karna (Har 1 second me)
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/game/status`);
        if (data.success) {
          // Jaise hi naya period shuru ho, purana selection clear kar do
          if (period !== data.period) {
            setActiveColor("");
            setMessage("");
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
  const handleSetResult = async (color) => {
    const token = localStorage.getItem("adminToken"); // Login se mila token
    
    if (!token) {
      alert("Admin Token missing. Please login again!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/set-result`,
        { period: period, color: color },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setActiveColor(color);
        setMessage(`✅ Period ${period} ke liye ${color.toUpperCase()} set ho gaya!`);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error setting result");
    }
  };

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

        {/* Control Buttons */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Set Next Result (Manual Override)</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleSetResult("green")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border-2 
                ${activeColor === "green" ? "bg-green-600 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-gray-800 border-green-600 hover:bg-green-900 text-green-500 hover:text-white"}`}
            >
              Force Green
            </button>
            <button 
              onClick={() => handleSetResult("violet")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border-2 
                ${activeColor === "violet" ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-gray-800 border-purple-600 hover:bg-purple-900 text-purple-500 hover:text-white"}`}
            >
              Force Violet
            </button>
            <button 
              onClick={() => handleSetResult("red")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border-2 
                ${activeColor === "red" ? "bg-red-600 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-gray-800 border-red-600 hover:bg-red-900 text-red-500 hover:text-white"}`}
            >
              Force Red
            </button>
          </div>
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