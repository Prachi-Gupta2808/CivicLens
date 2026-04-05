import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  MapPin,
  PackageCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";

const themeColor = "#9AB17A";

const EmptyState = ({ icon, message }) => (
  <div className="border-2 border-dashed border-gray-200/50 rounded-[2.5rem] py-16 flex flex-col items-center justify-center text-gray-300 gap-4 bg-white/30 backdrop-blur-md">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-widest text-center px-10">
      {message}
    </p>
  </div>
);

export default function FixerDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [stats, setStats] = useState({ inProgress: 0, completed: 0 });

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/complaints/my-tasks");
      const tasks = res.data.tasks || [];
      setIssues(tasks);
      setStats({
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "fixed").length,
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleResolve = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axios.patch(`/complaints/${id}/fix`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchMyIssues();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploadingId(null);
    }
  };

  const inProgress = issues.filter((i) => i.status === "in-progress");
  const completed = issues.filter((i) => i.status === "fixed");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    /* REMOVED bg-[#FAFAFA] to let MainLayout background show through */
    <div className="min-h-screen font-sans relative z-10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-1 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Verified Fixer Portal
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            WORKBOARD
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your assigned issues and upload proof of resolution
          </p>
        </header>

        {/* stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Active Tasks
            </p>
            <p className="text-3xl font-black text-orange-500">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Resolved
            </p>
            <p className="text-3xl font-black" style={{ color: themeColor }}>
              {stats.completed}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Total Handled
            </p>
            <p className="text-3xl font-black text-gray-800">{issues.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* active tasks */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Clock className="text-orange-500" size={18} />
                </div>
                <h2 className="font-bold text-gray-800 uppercase tracking-widest text-xs">
                  Active Assignments
                </h2>
              </div>
              <span className="bg-orange-50 text-orange-500 text-[10px] font-black px-2.5 py-1 rounded-lg border border-orange-100">
                {inProgress.length}
              </span>
            </div>

            <div className="space-y-6">
              {inProgress.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white/90 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {issue.photos?.[0] && (
                    <div className="relative">
                      <img
                        src={issue.photos[0]}
                        alt="issue"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Before
                      </div>
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        In Progress
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase"
                        style={{
                          backgroundColor: `${themeColor}20`,
                          color: themeColor,
                        }}
                      >
                        {issue.category?.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase">
                        #{issue._id.slice(-6)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {issue.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
                      <TrendingUp size={12} className="text-orange-400" />
                      <span>
                        {issue.raiseCount}{" "}
                        {issue.raiseCount === 1
                          ? "person reported"
                          : "people reported"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400 italic mb-6 bg-gray-50/50 p-3 rounded-xl">
                      <MapPin size={12} className="text-gray-300 shrink-0" />
                      <span className="truncate">
                        {issue.location?.address || "GPS Location Tagged"}
                      </span>
                    </div>

                    <input
                      type="file"
                      id={`file-${issue._id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleResolve(issue._id, e.target.files[0])
                      }
                      disabled={uploadingId === issue._id}
                    />
                    <label
                      htmlFor={
                        uploadingId === issue._id ? "" : `file-${issue._id}`
                      }
                      className={`w-full py-4 rounded-2xl text-white text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]
                          ${
                            uploadingId === issue._id
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-black hover:bg-gray-800 cursor-pointer"
                          }`}
                    >
                      {uploadingId === issue._id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Uploading Proof...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={16} />
                          Upload Fix Photo & Resolve
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ))}

              {inProgress.length === 0 && (
                <EmptyState
                  icon={<AlertCircle size={24} />}
                  message="No active tasks. Visit the map to accept new issues."
                />
              )}
            </div>
          </section>

          {/* resolved history */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <CheckCircle2 style={{ color: themeColor }} size={18} />
                </div>
                <h2 className="font-bold text-gray-800 uppercase tracking-widest text-xs">
                  Resolved History
                </h2>
              </div>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-lg border"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor,
                  borderColor: `${themeColor}30`,
                }}
              >
                {completed.length}
              </span>
            </div>

            <div className="space-y-4">
              {completed.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white/80 backdrop-blur-sm rounded-[2rem] border border-gray-100 overflow-hidden hover:border-gray-200 transition-all shadow-sm"
                >
                  {(issue.photos?.[0] || issue.afterPhoto) && (
                    <div className="grid grid-cols-2 h-32">
                      {issue.photos?.[0] ? (
                        <div className="relative">
                          <img
                            src={issue.photos[0]}
                            alt="before"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase backdrop-blur-sm">
                            Before
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100/50 flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-300" />
                        </div>
                      )}
                      {issue.afterPhoto ? (
                        <div className="relative">
                          <img
                            src={issue.afterPhoto}
                            alt="after"
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute bottom-2 right-2 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase"
                            style={{ backgroundColor: themeColor }}
                          >
                            After
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50/50 flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-tight">
                        {issue.category?.replace("_", " ")}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Resolved on{" "}
                        {new Date(
                          issue.fixedAt || issue.updatedAt
                        ).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-2xl"
                      style={{
                        backgroundColor: `${themeColor}15`,
                        color: themeColor,
                      }}
                    >
                      <PackageCheck size={20} />
                    </div>
                  </div>
                </div>
              ))}

              {completed.length === 0 && (
                <EmptyState
                  icon={<PackageCheck size={24} />}
                  message="Your resolved issues will appear here."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
