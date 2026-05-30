import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export default function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 1. TOP BAR (Jisme sirf 3 lines aur Title hai) */}
      <div className="bg-gray-900 text-white flex items-center px-6 py-4 shadow-md sticky top-0 z-40">
        <button 
          onClick={() => setIsOpen(true)} 
          className="text-gray-300 hover:text-white transition-colors p-1"
        >
          {/* Yeh rahi apki 3 lines (Hamburger Menu) */}
          <Menu className="w-7 h-7" />
        </button>
        <div className="ml-4 text-xl font-bold tracking-wide">
          <span className="text-red-500">🛠</span> Admin Panel
        </div>
      </div>

      {/* 2. OVERLAY (Piche ka background dark karne ke liye jab menu khula ho) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* 3. SLIDING SIDEBAR (Jo 3 lines pe click karne par aayega) */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        
        {/* Sidebar Header + Close Button */}
        <div className="p-6 flex justify-between items-center border-b border-gray-800 bg-gray-950">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
            MENU
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 transition-all hover:bg-gray-700 hover:rotate-90"
          >
            {/* Close (X) icon */}
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Links) */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <Link 
            to="/admin/dashboard" 
            onClick={() => setIsOpen(false)} // Link pe click karte hi menu band ho jayega
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
              ${isActive('/admin/dashboard') 
                ? "bg-gray-800 text-yellow-500 font-bold shadow-lg shadow-black/20 border-l-4 border-yellow-500" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <Link 
            to="/admin/users" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
              ${isActive('/admin/users') 
                ? "bg-gray-800 text-blue-400 font-bold shadow-lg shadow-black/20 border-l-4 border-blue-400" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Users className="w-5 h-5" />
            Manage Users
          </Link>

          <Link 
            to="/admin/settings" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
              ${isActive('/admin/settings') 
                ? "bg-gray-800 text-green-400 font-bold shadow-lg shadow-black/20 border-l-4 border-green-400" 
                : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        {/* 4. LOGOUT BUTTON (Sabse neeche) */}
        <div className="p-5 border-t border-gray-800 bg-gray-950">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl font-bold bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

      </div>
    </>
  );
}