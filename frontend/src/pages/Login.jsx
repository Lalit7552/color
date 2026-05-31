import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 🔥 Eye और EyeOff इम्पोर्ट कर लिए गए हैं
import { Mail, Lock, Gamepad2, LogIn, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // 🔥 पासवर्ड देखने/छुपाने के लिए State
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("⚠️ Both Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ Invalid credentials. Try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      
      // Decode token to extract userId and save it to localStorage
      try {
        const userId = JSON.parse(atob(data.token.split('.')[1])).id;
        localStorage.setItem("userId", userId);
      } catch (err) {
        console.error("Token decoding error", err);
      }
      
      navigate("/home");

    } catch (err) {
      setError("❌ Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-[#0a0f1e] to-black p-4 font-sans">
      
      <div className="bg-gray-900/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl p-8 w-full max-w-md border border-gray-700/50 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-purple-500"></div>

        <div className="flex justify-center mb-2">
          <Gamepad2 className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-2 drop-shadow-md">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Login to continue your winning streak!</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-5 text-center font-medium shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={login} className="space-y-5">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
            </div>
            <input
              className="w-full border border-gray-600 py-4 pl-12 pr-4 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Email Address"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* 🔥 Password Input with Eye Button */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border border-gray-600 py-4 pl-12 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-yellow-400 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl font-bold text-gray-900 text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 disabled:opacity-70 shadow-[0_0_15px_rgba(250,204,21,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Login to Play
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link to="/Signup" className="text-yellow-400 font-bold hover:text-yellow-300 hover:underline transition-colors">
            Signup here
          </Link>
        </p>
      </div>
    </div>
  );
}