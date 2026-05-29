import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md">

      {/* Left Side */}
      <div className="text-xl font-bold">
        🛠 Admin Panel
      </div>

      {/* Middle Links */}
      <div className="flex gap-6">
        <Link to="/admin/dashboard" className="hover:text-yellow-400">
          Dashboard
        </Link>

        <Link to="/admin/users" className="hover:text-yellow-400">
          Users
        </Link>

        <Link to="/admin/settings" className="hover:text-yellow-400">
          Settings
        </Link>
      </div>

      {/* Right Side */}
      <button
        onClick={logout}
        className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}