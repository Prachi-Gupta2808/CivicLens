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
      <div className="flex flex-col flex-1 md:hidden">
        <div
          className="relative flex-none"
          style={{ backgroundColor: "#9AB17A", height: "35vh" }}
        >
          <div
            className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6D8165" }}
            >
              <svg
                className="w-4 h-4 text-white"
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
            <span className="text-white font-bold text-lg">CivicLens</span>
          </div>
          <div className="absolute bottom-16 left-6">
            <h1 className="text-4xl font-bold text-white">Join Us</h1>
            <p className="text-white/70 text-sm mt-1">
              Create your civic portal account
            </p>
          </div>
          <svg
            viewBox="0 0 390 80"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 left-0 w-full"
            preserveAspectRatio="none"
            style={{ height: "70px" }}
          >
            <path
              d="M0,40 Q97,0 195,30 Q293,60 390,20 L390,80 L0,80 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="flex-1 bg-white px-6 pt-1 pb-4 flex flex-col justify-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Full Name
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                name="name"
                required
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                type="email"
                name="email"
                required
                placeholder="demo@email.com"
                value={form.email}
                onChange={handleChange}
                className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Aadhaar Number
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 gap-2">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                />
              </svg>
              <input
                type="text"
                name="aadhaar"
                required
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                value={form.aadhaar}
                onChange={handleChange}
                className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Role</label>
            <div className="relative">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none bg-white appearance-none cursor-pointer"
              >
                <option value="citizen">Citizen</option>
                <option value="fixer">Fixer (Nagarpalika)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: "#9AB17A" }}
            className="w-full py-3 text-white font-bold rounded-full text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          {error && (
            <p className="text-red-500 text-xs text-center animate-pulse">
              {error}
            </p>
          )}
          <p className="text-xs text-gray-500 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold"
              style={{ color: "#9AB17A" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-1 min-h-screen bg-gray-50">
        <div className="w-full md:w-[480px] lg:w-[520px] flex flex-col justify-between px-12 py-10 bg-white shadow-[4px_0_30px_rgba(0,0,0,0.04)]">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
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

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-400 mb-5">
              Join CivicLens and help fix your city.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Full Name
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Email
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="civic@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Password
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Aadhaar Number
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                    />
                  </svg>
                  <input
                    type="text"
                    name="aadhaar"
                    required
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    value={form.aadhaar}
                    onChange={handleChange}
                    className="flex-1 text-sm focus:outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Role
                </label>
                <div className="relative border border-gray-200 rounded-xl focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm text-gray-800 focus:outline-none bg-transparent appearance-none cursor-pointer rounded-xl"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="fixer">Fixer (Nagarpalika)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs animate-pulse">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#9AB17A" }}
                className="w-full py-3 text-white font-bold rounded-xl text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold"
                  style={{ color: "#9AB17A" }}
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <p className="text-xs text-gray-300 text-center">
            © {new Date().getFullYear()} CivicLens. All rights reserved.
          </p>
        </div>

        <div
          className="flex-1 hidden md:flex flex-col items-center justify-center px-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #f0f7e8 0%, #e8f3d6 50%, #f5f9ef 100%)",
          }}
        >
          <div
            className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-30"
            style={{ backgroundColor: "#9AB17A" }}
          />
          <div
            className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full opacity-20"
            style={{ backgroundColor: "#6D8165" }}
          />

          <div className="relative z-10 text-center mb-10 max-w-md">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-800 leading-tight tracking-tight">
              Be the Change <span style={{ color: "#9AB17A" }}>Your City</span>{" "}
              Needs!
            </h2>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Join thousands of citizens making their neighborhoods better — one
              report at a time.
            </p>
          </div>

          <div className="relative z-10 w-[340px] h-[340px] lg:w-[400px] lg:h-[400px]">
            <img
              src="/Firefighter-cuate.svg"
              alt="Civic Illustration"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <div className="absolute top-12 left-12 z-10 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md animate-gentle-float">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#9AB17A" }}
            />
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
              Snap & Fix
            </span>
          </div>
          <div className="absolute bottom-16 right-12 z-10 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md animate-badge-float-alt">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
              Live Updates
            </span>
          </div>
          <div className="absolute top-1/2 right-8 z-10 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md animate-badge-float-slow">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#6D8165" }}
            />
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
              Community
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes badgeFloatAlt {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -12px); }
        }
        .animate-gentle-float { animation: badgeFloat 4s ease-in-out infinite; }
        .animate-badge-float-alt { animation: badgeFloatAlt 6s ease-in-out infinite; }
        .animate-badge-float-slow { animation: badgeFloat 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
