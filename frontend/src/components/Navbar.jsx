import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeColor = "#9AB17A";

  const isLoggedIn = !!user;

  const userRole = user?.role;

  if (loading) return null;

  const handleDashboardRedirect = () => {
    setIsMenuOpen(false);
    if (userRole === "fixer") {
      navigate("/fixer-dashboard");
    } else {
      navigate("/citizen-dashboard");
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className="relative z-[2000] px-6 md:px-10 py-6 flex items-center justify-between bg-transparent">
      <div
        className="flex items-center gap-3 cursor-pointer relative z-50"
        onClick={() => navigate("/")}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
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
        <span className="text-gray-900 font-bold text-xl tracking-tight">
          CivicLens
        </span>
      </div>

      <div className="hidden md:flex gap-3 items-center">
        {isLoggedIn ? (
          <>
            <button
              onClick={handleDashboardRedirect}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-bold transition active:scale-95 hover:brightness-105 shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <LayoutDashboard size={18} />
              {userRole === "fixer" ? "Admin Panel" : "Dashboard"}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg font-bold border-2 transition active:scale-95"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 rounded-lg text-white font-bold transition active:scale-95 hover:brightness-105 shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              Register
            </button>
          </div>
        )}
      </div>

      <button
        className="md:hidden p-2 text-gray-600 relative z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 transform md:hidden flex flex-col items-center justify-center px-6 ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col w-full gap-4 max-w-sm">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleDashboardRedirect}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: themeColor }}
              >
                <LayoutDashboard size={22} />
                {userRole === "fixer" ? "Admin Panel" : "Dashboard"}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 border-red-100 text-red-500 font-bold text-lg"
              >
                <LogOut size={22} /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/login");
                }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-lg border-2"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                <LogIn size={20} /> Login
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/register");
                }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: themeColor }}
              >
                <UserPlus size={20} /> Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
