import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    setError(""); // Reset error on new attempt
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Secure Access</h2>
          <p className="text-sm text-gray-400 mt-2">Authorized personnel only</p>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="email"
              placeholder="Admin Email"
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={login}
          className="w-full mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.3)]"
        >
          Authenticate
        </button>

      </div>
    </div>
  );
}