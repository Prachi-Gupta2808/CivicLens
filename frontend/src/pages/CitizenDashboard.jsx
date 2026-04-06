import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Plus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";

const themeColor = "#9AB17A";

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("/complaints/my-reports");
        if (res.data.success) {
          setComplaints(res.data.complaints);
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      fixed: "bg-green-100 text-green-700 border-green-200",
      "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 cursor-auto">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-1">
              Here is the status of your civic contributions.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/report-issue")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-bold shadow-lg shadow-[#9AB17A40] transition hover:brightness-110 active:scale-95 cursor-pointer"
            style={{ backgroundColor: themeColor }}
          >
            <Plus size={20} /> Report New Issue
          </button>
        </div>

        {/* Status Quick-Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard
              label="Total Filed"
              value={stats.total}
              icon={<BarChart3 size={20} />}
              color="gray"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<AlertCircle size={20} />}
              color="amber"
            />
            <StatCard
              label="Working"
              value={stats.inProgress}
              icon={<Clock size={20} />}
              color="blue"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon={<CheckCircle2 size={20} />}
              color="green"
            />
          </div>
        )}

        {/* Complaints List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
              Your Reported Issues
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {complaints.length > 0 ? (
              complaints.map((issue) => (
                <div
                  key={issue._id}
                  onClick={() => (window.location.href = `/issue/${issue._id}`)}
                  className="p-6 hover:bg-gray-50/80 transition-all cursor-pointer group active:bg-gray-100"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <img
                      src={issue.photos[0] || "https://via.placeholder.com/150"}
                      className="w-full md:w-32 h-24 object-cover rounded-2xl shadow-sm border border-gray-100"
                      alt="issue"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(issue.status)}
                        <span className="text-[11px] text-gray-400 font-medium">
                          Filed {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 capitalize truncate mb-1">
                        {issue.category.replace("_", " ")}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">
                          {issue.location.address || "Location shared via GPS"}
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Support
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {issue.raiseCount} Votes
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 text-gray-300 group-hover:text-[#9AB17A] group-hover:bg-[#9AB17A10] transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium">No reports found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
          {label}
        </p>
        <p className="text-xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}
