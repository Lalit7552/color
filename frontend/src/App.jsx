import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
// 🔥 Wallet पेज को इम्पोर्ट किया गया है
import Wallet from "./pages/Wallet"; 
import Profile from "./pages/Profile";
import Transaction from "./pages/Transation";

// 🔥 Navbars Import
import Navbar from "./component/Navbar";
import BottomNav from "./component/BottomNav"; // <-- Naya import yahan add kiya hai
import BetHistory from "./pages/BetHistory";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminNavbar from "./admin/AdminNavbar";

function AppRoutes() {
  const location = useLocation();

  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  // 🔴 Admin Navbar Logic
  const isAdminRoute = location.pathname.startsWith("/admin") &&
                       location.pathname !== "/admin/login";

  // 🔵 User Navbar Logic (सिर्फ तब दिखेगा जब यूजर एडमिन पेज या लॉगिन/साइनअप पर न हो)
  const isUserRoute = !location.pathname.startsWith("/admin") && 
                      location.pathname !== "/login" && 
                      location.pathname !== "/signup" && 
                      location.pathname !== "/";

  return (
    // Ek parent div jisme background color aur flex-col diya hai better structure ke liye
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      
      {/* 🔥 ADMIN NAVBAR (only admin pages) */}
      {adminToken && isAdminRoute && <AdminNavbar />}

      {/* 🔥 USER NAVBAR (only user pages like /home) */}
      {userToken && isUserRoute && <Navbar />}

      {/* 🚀 Main Wrapper: 
        Agar user route hai, toh bottom padding (pb-20) add hogi taaki content BottomNav ke piche na daab jaye 
      */}
      <main className={`flex-1 ${userToken && isUserRoute ? "pb-20 md:pb-0" : ""}`}>
        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route
            path="/login"
            element={!userToken ? <Login /> : <Navigate to="/home" />}
          />

          <Route
            path="/signup"
            element={!userToken ? <Signup /> : <Navigate to="/home" />}
          />

          <Route
            path="/home"
            element={userToken ? <Home /> : <Navigate to="/login" />}
          />

          {/* 🔥 WALLET ROUTE (Protected) */}
          <Route
            path="/deposit"
            element={userToken ? <Wallet /> : <Navigate to="/login" />}
          />
          <Route
            path="/bethistory"
            element={userToken ? <BetHistory /> : <Navigate to="/login" />}
          />
          <Route
            path="/transaction"
            element={userToken ? <Transaction /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={userToken ? <Profile /> : <Navigate to="/login" />}
          />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<Navigate to="/admin/login" />} />

          <Route
            path="/admin/login"
            element={!adminToken ? <AdminLogin /> : <Navigate to="/admin/dashboard" />}
          />

          <Route
            path="/admin/dashboard"
            element={adminToken ? <AdminDashboard /> : <Navigate to="/admin/login" />}
          />

        </Routes>
      </main>

      {/* 🔥 BOTTOM NAVBAR (Sirf mobile me aur user pages par dikhega) */}
      {userToken && isUserRoute && <BottomNav />}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}