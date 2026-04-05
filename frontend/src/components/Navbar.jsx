import { LayoutDashboard, LogOut } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const themeColor = "#9AB17A";

  // Get role from context user, or fallback to storage
  const userRole = user?.role || localStorage.getItem("role");

  const handleDashboardRedirect = () => {
    if (userRole === "fixer") {
      navigate("/fixer-dashboard");
    } else {
      navigate("/citizen-dashboard");
    }
  };

  return (
    <nav className="relative z-50 px-10 py-8 flex items-center justify-between bg-transparent">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: themeColor }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </div>
        <span className="text-gray-900 font-bold text-xl">CivicLens</span>
      </div>

      <div className="flex gap-4 items-center">
        {user || localStorage.getItem("token") ? (
          <>
            <button
              onClick={handleDashboardRedirect}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-bold cursor-pointer transition active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              <LayoutDashboard size={18} />
              {userRole === "fixer" ? "Admin Panel" : "Dashboard"}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-red-200 text-red-500 cursor-pointer"
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: themeColor }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
