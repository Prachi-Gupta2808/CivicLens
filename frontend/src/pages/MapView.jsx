import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";

const themeColor = "#9AB17A";

const getRaiseCountColor = (count) => {
  if (count >= 25) return "#EF4444";
  if (count >= 11) return "#F97316";
  if (count >= 4) return "#FBBF24";
  return "#9AB17A";
};

// Group complaints that are visually close on the map
const groupNearbyComplaints = (complaints, thresholdMeters = 80) => {
  const groups = [];
  const assigned = new Set();

  complaints.forEach((c, i) => {
    if (assigned.has(i)) return;
    if (!c.location?.coordinates) return;

    const [lng1, lat1] = c.location.coordinates;
    const group = [c];
    assigned.add(i);

    complaints.forEach((d, j) => {
      if (assigned.has(j) || !d.location?.coordinates) return;
      const [lng2, lat2] = d.location.coordinates;
      const dist = Math.sqrt(
        Math.pow((lat1 - lat2) * 111000, 2) +
          Math.pow((lng1 - lng2) * 111000 * Math.cos((lat1 * Math.PI) / 180), 2)
      );
      if (dist < thresholdMeters) {
        group.push(d);
        assigned.add(j);
      }
    });

    groups.push({
      id: c._id,
      lat: lat1,
      lng: lng1,
      complaints: group,
      maxRaiseCount: Math.max(...group.map((x) => x.raiseCount)),
    });
  });

  return groups;
};

const createMarker = (raiseCount, count = 1) => {
  const color = getRaiseCountColor(raiseCount);
  const size = count > 1 ? 34 : 24;
  const badge =
    count > 1
      ? `<div style="
          position:absolute;top:-6px;right:-6px;
          background:#1f2937;color:white;
          font-size:9px;font-weight:900;
          width:16px;height:16px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:2px solid white;
        ">${count}</div>`
      : "";

  return new L.DivIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        background-color: ${color};
        width: ${size}px;height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 12px ${color}99;
        cursor: pointer;
        display:flex;align-items:center;justify-content:center;
      "></div>
      ${badge}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFixer = user?.role === "fixer";

  const [complaints, setComplaints] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [locateTrigger, setLocateTrigger] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasAutoLocated = useRef(false);

  const selected = selectedGroup?.complaints?.[activeIndex] || null;

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("/complaints/map");
      const data = res.data.complaints;
      setComplaints(data);
      setGroups(groupNearbyComplaints(data));
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
      () => {
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
      setSelectedGroup(null);
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
      setSelectedGroup(null);
      setShowConfirm(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || "Already flagged or server error.");
    } finally {
      setReporting(false);
    }
  };

  const openGroup = (group) => {
    setSelectedGroup(group);
    setActiveIndex(0);
    setExpanded(false);
    setShowConfirm(false);
  };

  const goNext = () => {
    setActiveIndex((i) => Math.min(i + 1, selectedGroup.complaints.length - 1));
    setExpanded(false);
    setShowConfirm(false);
  };

  const goPrev = () => {
    setActiveIndex((i) => Math.max(i - 1, 0));
    setExpanded(false);
    setShowConfirm(false);
  };

  const isMultiple = selectedGroup?.complaints?.length > 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Navbar />

      {/* Urgency Scale Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-x-4 gap-y-2 flex-wrap text-[9px] sm:text-xs">
        <span className="font-bold text-gray-400 uppercase tracking-widest mr-auto sm:mr-0">
          Urgency:
        </span>
        {[
          { color: "#9AB17A", label: "1–3" },
          { color: "#FBBF24", label: "4–10" },
          { color: "#F97316", label: "11–25" },
          { color: "#EF4444", label: "High" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 font-medium whitespace-nowrap">
              {item.label}
            </span>
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

          {groups.map((group) => (
            <Marker
              key={group.id}
              position={[group.lat, group.lng]}
              icon={createMarker(group.maxRaiseCount, group.complaints.length)}
              eventHandlers={{ click: () => openGroup(group) }}
            />
          ))}
        </MapContainer>

        {/* Issues Counter */}
        <div className="absolute top-24 left-3 sm:top-4 sm:left-16 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl sm:rounded-2xl shadow-md text-[10px] sm:text-[11px] font-bold text-gray-700 border border-gray-100 flex items-center gap-2 transition-all">
          <div className="w-2 h-2 rounded-full bg-[#9AB17A] animate-pulse shrink-0" />
          <span className="whitespace-nowrap">
            {loading ? "Loading..." : `${complaints.length} Issues`}
          </span>
        </div>

        {/* Locate Me Button */}
        <button
          onClick={() => handleLocateMe(false)}
          className="absolute top-4 right-4 z-[1000] bg-white p-3 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-50 border border-gray-100 active:scale-95 transition-transform"
          style={{ color: themeColor }}
        >
          {locating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <MapPin size={16} />
          )}
          <span className="hidden sm:inline">
            {locating ? "Locating..." : "Find My Area"}
          </span>
        </button>

        {/* Selected Issue Overlay */}
        {selectedGroup && selected && (
          <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-sm max-h-[75vh] overflow-hidden">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
              <div
                className="h-1.5 w-full shrink-0"
                style={{
                  backgroundColor: getRaiseCountColor(selected.raiseCount),
                }}
              />

              {/* Multi-issue navigator */}
              {isMultiple && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <button
                    onClick={goPrev}
                    disabled={activeIndex === 0}
                    className="p-1.5 rounded-full disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Dot indicators */}
                    <div className="flex gap-1">
                      {selectedGroup.complaints.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveIndex(i);
                            setExpanded(false);
                            setShowConfirm(false);
                          }}
                          className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{
                            backgroundColor:
                              i === activeIndex
                                ? getRaiseCountColor(
                                    selectedGroup.complaints[i].raiseCount
                                  )
                                : "#d1d5db",
                            width: i === activeIndex ? "14px" : "6px",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                      {activeIndex + 1} / {selectedGroup.complaints.length}{" "}
                      issues
                    </span>
                  </div>

                  <button
                    onClick={goNext}
                    disabled={
                      activeIndex === selectedGroup.complaints.length - 1
                    }
                    className="p-1.5 rounded-full disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
              )}

              <div className="overflow-y-auto custom-scrollbar">
                {selected.photos?.[0] && (
                  <img
                    src={selected.photos[0]}
                    alt="issue"
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600">
                          {selected.category?.replace("_", " ")}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase ${
                            selected.status === "in-progress"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {selected.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-400 font-medium">
                        <TrendingUp
                          size={12}
                          style={{
                            color: getRaiseCountColor(selected.raiseCount),
                          }}
                        />
                        {selected.raiseCount}{" "}
                        {selected.raiseCount === 1 ? "Report" : "Reports"}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {isFixer && (
                        <button
                          onClick={() => setShowConfirm(!showConfirm)}
                          className={`p-2 rounded-full transition-colors ${
                            showConfirm
                              ? "bg-red-500 text-white"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          <AlertTriangle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedGroup(null);
                          setShowConfirm(false);
                        }}
                        className="p-2 bg-gray-50 rounded-full text-gray-400"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {isFixer && showConfirm && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in zoom-in duration-200">
                      <p className="text-[9px] font-black text-red-700 uppercase mb-3 text-center leading-tight">
                        Flag as false? Reporter will be blocked.
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={reporting}
                          onClick={() => handleReportFalse(selected._id)}
                          className="flex-1 py-2 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg"
                        >
                          {reporting ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 py-2 bg-white text-gray-500 text-[9px] font-black uppercase rounded-lg border border-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mb-4" onClick={() => setExpanded(!expanded)}>
                    <p
                      className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${
                        !expanded ? "line-clamp-2 sm:line-clamp-3" : ""
                      }`}
                    >
                      {selected.description || "No description provided."}
                    </p>
                  </div>

                  {isFixer && selected.status === "pending" && !showConfirm && (
                    <button
                      onClick={() => handleFixIssue(selected._id)}
                      disabled={fixing}
                      className="w-full mb-4 py-3 rounded-xl bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      {fixing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Accept to Fix
                    </button>
                  )}

                  <div className="pt-3 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 italic">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">
                      {selected.location?.address || "GPS Tagged Location"}
                    </span>
                  </div>
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
