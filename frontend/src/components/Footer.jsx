import React from "react";
import { useNavigate } from "react-router-dom";
const userRole = localStorage.getItem("userRole");
const getDashboardPath = () => {
  if (userRole === "fixer") return "/fixer-dashboard";
  return "/citizen-dashboard";
};
export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-10 px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 border-b border-zinc-800 pb-12 mb-8">
        {/* Brand */}
        <div>
          <h4 className="text-2xl font-bold mb-4">CivicLens</h4>
          <p className="text-zinc-400">
            The missing link between community needs and local fixing
            authorities.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 col-span-2">
          {/* Navigation */}
          <div>
            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-zinc-500">
              Navigation
            </h5>
            <ul className="space-y-2 text-zinc-300">
              <li
                onClick={() => navigate("/report-issue")}
                className="hover:text-white cursor-pointer transition"
              >
                Report Issue
              </li>
              <li
                onClick={() => navigate(getDashboardPath())}
                className="hover:text-white cursor-pointer transition"
              >
                Dashboard
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-zinc-500">
              Legal
            </h5>
            <ul className="space-y-2 text-zinc-300">
              <li className="hover:text-white cursor-pointer transition">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer transition">
                Terms of Service
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <p className="text-center text-zinc-600 text-sm">
        © 2026 CivicLens. Built for smart urban governance.
      </p>
    </footer>
  );
}
