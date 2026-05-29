import { useNavigate, useLocation } from "react-router-dom";
import { Home, Wallet, History, User } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 Aapke sidebar wale exact routes aur icons ka reference
  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Deposit", path: "/deposit", icon: Wallet },
    { name: "History", path: "/bethistory", icon: History },
    { name: "Profile", path: "/profile", icon: User } // Aap isko apne profile route ke hisaab se change kar sakte hain
  ];

  // md:hidden lagaya hai taaki yeh sirf mobile par dikhe aur PC par hide ho jaye
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#0a0f1e]/95 backdrop-blur-md border-t border-gray-700/50 z-50 md:hidden shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item, index) => {
          // Check if current route matches the button's path
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-full p-1 transition-all duration-300"
            >
              {/* Icon Animation & Glow */}
              <Icon 
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive 
                    ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-110 -translate-y-1" 
                    : "text-gray-400 hover:text-gray-300"
                }`} 
              />
              
              {/* Text Label */}
              <span 
                className={`text-[11px] font-bold mt-1 transition-all duration-300 ${
                  isActive ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                {item.name}
              </span>

              {/* Active Indicator Dot (Chota sa dot jo active tab ke niche aayega) */}
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}