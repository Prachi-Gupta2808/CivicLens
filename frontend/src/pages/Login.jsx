import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/");
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
          style={{ backgroundColor: "#9AB17A", height: "45vh" }}
        >
          <div
            className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full opacity-20"
            style={{ backgroundColor: "#6D8165" }}
          />
          <div
            className="absolute top-[20px] right-[40px] w-[100px] h-[100px] rounded-full opacity-15"
            style={{ backgroundColor: "#fff" }}
          />
          <div
            className="absolute bottom-[60px] right-[-20px] w-[130px] h-[130px] rounded-full opacity-20"
            style={{ backgroundColor: "#B8CC9A" }}
          />
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
            <h1 className="text-4xl font-bold text-white">Welcome</h1>
            <p className="text-white/70 text-sm mt-1">
              Sign in to access your civic portal
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

        <div className="flex-1 bg-white px-6 pt-2 pb-8 flex flex-col justify-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2">
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
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2">
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
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ backgroundColor: "#9AB17A" }}
            className="w-full py-4 text-white font-bold rounded-full text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
          {error && (
            <p className="text-red-500 text-xs text-center animate-pulse">
              {error}
            </p>
          )}
          <p className="text-xs text-gray-500 text-center">
            Don't have an Account?{" "}
            <Link
              to="/register"
              className="font-bold"
              style={{ color: "#9AB17A" }}
            >
              Register
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

          {/* Form */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign In</h1>
            <p className="text-sm text-gray-400 mb-8">
              Welcome back! Access your civic portal.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
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
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Password
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 gap-3 focus-within:border-[#9AB17A] focus-within:ring-2 focus-within:ring-[#9AB17A]/20 transition-all">
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

              {error && (
                <p className="text-red-500 text-xs animate-pulse">{error}</p>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#9AB17A" }}
                className="w-full py-4 text-white font-bold rounded-xl text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
              >
                {loading ? "Verifying..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 font-semibold uppercase tracking-widest">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Register link styled as outlined button */}
              <Link
                to="/register"
                className="w-full py-3.5 rounded-xl text-sm font-bold text-center border-2 transition-all hover:bg-gray-50 active:scale-[0.98]"
                style={{ borderColor: "#9AB17A", color: "#9AB17A" }}
              >
                Create New Account
              </Link>
            </form>
          </div>

          {/* Footer */}
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
              Report Issues & <span style={{ color: "#9AB17A" }}>Fix Your</span>{" "}
              City Together!
            </h2>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Snap a photo, report a civic issue, and watch your community come
              together to resolve it.
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
