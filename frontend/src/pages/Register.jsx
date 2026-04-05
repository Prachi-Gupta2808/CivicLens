import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    aadhaar: "",
    role: "citizen",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Aadhaar validation
    const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
    if (!aadhaarPattern.test(form.aadhaar)) {
      setError("Invalid Aadhaar number");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="relative z-10 px-10 py-8 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "#9AB17A" }}
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
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10 py-8">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Form Side */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Soft glow behind circle */}
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-2xl scale-105"
                style={{ backgroundColor: "#9AB17A" }}
              />

              <form
                onSubmit={handleSubmit}
                style={{ backgroundColor: "#9AB17A" }}
                className="relative w-[500px] h-[500px] sm:w-[540px] sm:h-[540px] rounded-full shadow-2xl flex flex-col items-center justify-center px-20 gap-4 border-[8px] border-white/20 transition-all duration-500 hover:scale-[1.01]"
              >
                <div className="text-center space-y-1">
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    Join Us
                  </h1>
                  <p className="text-white/70 text-[11px] font-bold uppercase tracking-[0.3em]">
                    Create Your Account
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-5 py-2 rounded-full bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-800 placeholder-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-5 py-2 rounded-full bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-800 placeholder-gray-400"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-5 py-2 rounded-full bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-800 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    name="aadhaar"
                    required
                    placeholder="Aadhaar Number"
                    maxLength={12}
                    value={form.aadhaar}
                    onChange={handleChange}
                    className="w-full px-5 py-2 rounded-full bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-800 placeholder-gray-400"
                  />
                  <div className="relative group/select">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full px-5 py-2 rounded-full bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-800 appearance-none cursor-pointer"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="fixer">Fixer (Nagarpalika)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      ▼
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: "#6D8165" }}
                  className="w-full py-3.5 hover:brightness-110 active:scale-95 text-white font-bold rounded-full text-base shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-sm text-white/80">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-white hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                {error && (
                  <p className="absolute -bottom-10 text-red-500 text-xs font-medium text-center animate-pulse">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Illustration Side */}
          <div className="flex-1 hidden md:flex justify-end group">
            <div className="relative animate-main-float">
              <div className="w-[450px] h-[450px] bg-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center p-12 overflow-hidden transition-all duration-700 ease-in-out">
                <img
                  src="/Firefighter-cuate.svg"
                  alt="Civic Illustration"
                  className="w-full h-full object-contain filter grayscale-[0.1] contrast-[1.05] transition-transform duration-1000 ease-in-out group-hover:scale-110"
                />
              </div>

              {/* Floating Badges */}
              <div
                className="absolute -top-4 -right-4 text-white text-[10px] tracking-widest font-bold px-6 py-3 rounded-full shadow-lg z-20 animate-gentle-float"
                style={{ backgroundColor: "#9AB17A" }}
              >
                SNAP & FIX
              </div>
              <div
                className="absolute top-1/2 -right-8 text-white text-[9px] tracking-widest font-bold px-5 py-2.5 rounded-full shadow-md z-20 animate-badge-float-alt"
                style={{ backgroundColor: "#9AB17A" }}
              >
                COMMUNITY
              </div>
              <div
                className="absolute -bottom-6 -left-6 text-white text-[9px] tracking-widest font-bold px-5 py-2.5 rounded-full shadow-md z-20 animate-badge-float-slow"
                style={{ backgroundColor: "#9AB17A" }}
              >
                LIVE UPDATES
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mainFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes badgeFloatAlt {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(5px, -15px) rotate(2deg); }
        }
        .animate-main-float { animation: mainFloat 7s ease-in-out infinite; }
        .animate-gentle-float { animation: badgeFloat 4s ease-in-out infinite; }
        .animate-badge-float-alt { animation: badgeFloatAlt 6s ease-in-out infinite; }
        .animate-badge-float-slow { animation: badgeFloat 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
