import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";
// IMPORTANT: Import your auth hook here
// import { useAuth } from "../context/AuthContext";

const themeColor = "#9AB17A";

const getRaiseCountColor = (count) => {
  if (count >= 25) return "#EF4444";
  if (count >= 11) return "#F97316";
  if (count >= 4) return "#FBBF24";
  return "#9AB17A";
};

const createMarker = (raiseCount) => {
  const color = getRaiseCountColor(raiseCount);
  return new L.DivIcon({
    className: "",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px ${color}99;
      cursor: pointer;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function FlyToLocation({ position, zoom, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (position && trigger) {
      map.flyTo(position, zoom || 14, { animate: true, duration: 1.5 });
    }
  }, [trigger, position, zoom, map]);
  return null;
}

export default function MapView() {
  // --- AUTH LOGIC ---
  // If using Context: const { user } = useAuth();
  // If using localStorage:
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFixer = user?.role === "fixer";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [locateTrigger, setLocateTrigger] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [fixing, setFixing] = useState(false);

  const [reporting, setReporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasAutoLocated = useRef(false);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("/complaints/map");
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!hasAutoLocated.current) {
      handleLocateMe(true);
      hasAutoLocated.current = true;
    }
  }, []);

  const handleLocateMe = (isInitial = false) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setLocateTrigger(Date.now());
        setLocating(false);
      },
      (err) => {
        if (!isInitial) alert("Please enable GPS to locate yourself.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFixIssue = async (id) => {
    setFixing(true);
    try {
      await axios.patch(`/complaints/${id}/status`, { status: "in-progress" });
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept task.");
    } finally {
      setFixing(false);
    }
  };

  const handleReportFalse = async (id) => {
    setReporting(true);
    try {
      const res = await axios.patch(`/complaints/${id}/report`);
      alert(res.data.message);
      setSelected(null);
      setShowConfirm(false);
      fetchComplaints(); // ← this refreshes map
    } catch (err) {
      alert(err.response?.data?.message || "Already flagged or server error.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-6 flex-wrap text-[10px] sm:text-xs">
        <span className="font-bold text-gray-400 uppercase tracking-widest">
          Urgency Scale:
        </span>
        {[
          { color: "#9AB17A", label: "1–3 Reports" },
          { color: "#FBBF24", label: "4–10 Reports" },
          { color: "#F97316", label: "11–25 Reports" },
          { color: "#EF4444", label: "High Priority" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <FlyToLocation
            position={userLocation}
            zoom={15}
            trigger={locateTrigger}
          />

          {complaints.map((complaint) => {
            if (!complaint.location?.coordinates) return null;
            const [lng, lat] = complaint.location.coordinates;
            return (
              <Marker
                key={complaint._id}
                position={[lat, lng]}
                icon={createMarker(complaint.raiseCount)}
                eventHandlers={{
                  click: () => {
                    setSelected(complaint);
                    setExpanded(false);
                    setShowConfirm(false);
                  },
                }}
              />
            );
          })}
        </MapContainer>

        <div className="absolute top-4 left-16 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm text-[11px] font-bold text-gray-700 border border-gray-100 flex items-center gap-2 transition-all">
          <div className="w-2 h-2 rounded-full bg-[#9AB17A] animate-pulse" />
          {loading
            ? "Fetching Data..."
            : `${complaints.length} Local Issues Found`}
        </div>

        <button
          onClick={() => handleLocateMe(false)}
          className="absolute top-4 right-4 z-[1000] bg-white px-5 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-50 border border-gray-100"
          style={{ color: themeColor }}
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <MapPin size={14} />
          )}
          {locating ? "Locating..." : "Find My Area"}
        </button>

        {selected && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
              <div
                className="h-1.5 w-full"
                style={{
                  backgroundColor: getRaiseCountColor(selected.raiseCount),
                }}
              />
              {selected.photos?.[0] && (
                <img
                  src={selected.photos[0]}
                  alt="issue"
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600">
                        {selected.category?.replace("_", " ")}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          selected.status === "in-progress"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {selected.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <TrendingUp
                          size={12}
                          style={{
                            color: getRaiseCountColor(selected.raiseCount),
                          }}
                        />
                        {selected.raiseCount}{" "}
                        {selected.raiseCount === 1 ? "Report" : "Reports"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* ROLE PROTECTION: Only visible to Fixers */}
                    {isFixer && (
                      <button
                        onClick={() => setShowConfirm(!showConfirm)}
                        className={`p-2 rounded-full transition-colors ${
                          showConfirm
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelected(null);
                        setShowConfirm(false);
                      }}
                      className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* ROLE PROTECTION: Confirmation dialog */}
                {isFixer && showConfirm && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in zoom-in duration-200">
                    <p className="text-[10px] font-black text-red-700 uppercase mb-3 text-center">
                      Report false issue? Reporter will be blocked.
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={reporting}
                        onClick={() => handleReportFalse(selected._id)}
                        className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl"
                      >
                        {reporting ? "Blocking..." : "Confirm Report"}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-2 bg-white text-gray-500 text-[10px] font-black uppercase rounded-xl border border-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-6" onClick={() => setExpanded(!expanded)}>
                  <p
                    className={`text-sm text-gray-600 leading-relaxed cursor-pointer ${
                      !expanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {selected.description || "No description provided."}
                  </p>
                </div>

                {isFixer && selected.status === "pending" && !showConfirm && (
                  <button
                    onClick={() => handleFixIssue(selected._id)}
                    disabled={fixing}
                    className="w-full mb-4 py-3.5 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                  >
                    {fixing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Accept to Fix
                  </button>
                )}

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400 italic">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">
                    {selected.location?.address || "GPS Tagged Location"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .leaflet-container { z-index: 0; }
        .leaflet-control-attribution { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}
