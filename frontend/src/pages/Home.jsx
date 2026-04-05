import L from "leaflet";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  MapPin,
  Navigation,
  Search,
  Wrench,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "leaflet/dist/leaflet.css";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);
  return null;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const themeColor = "#9AB17A";
  const themeColorLowOpacity = "rgba(154, 177, 122, 0.1)";

  // --- ROLE LOGIC ---
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = user?.role || localStorage.getItem("role");
  const isFixer =
    isLoggedIn && (userRole === "fixer" || userRole === "authority");

  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const defaultCenter = [25.0441, 76.2418];

  const handleActionClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isFixer) {
      // Fixer goes directly to the Map Navigation (Heatmap view)
      navigate("/map");
    } else {
      // Citizen goes to the reporting flow
      navigate("/report-issue");
    }
  };

  const handleFindMe = (e) => {
    e.stopPropagation();
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const customIcon = new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${themeColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${themeColor}aa; animation: pulse-marker 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const citizenSteps = [
    {
      icon: <Camera size={32} />,
      title: "Capture",
      desc: "Snap a photo of the civic issue.",
    },
    {
      icon: <MapPin size={32} />,
      title: "Locate",
      desc: "GPS auto-tags the exact location.",
    },
    {
      icon: <Search size={32} />,
      title: "Verify",
      desc: "AI filters out non-civic photos.",
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Resolve",
      desc: "Track the fix in real-time.",
    },
  ];

  const fixerSteps = [
    {
      icon: <Search size={32} />,
      title: "Claim",
      desc: "Find issues in your assigned area.",
    },
    {
      icon: <MapPin size={32} />,
      title: "Navigate",
      desc: "Get precise GPS route to the site.",
    },
    {
      icon: <Wrench size={32} />,
      title: "Fix",
      desc: "Repair and resolve the reported problem.",
    },
    {
      icon: <Camera size={32} />,
      title: "Verify",
      desc: "Upload 'After' photo to close ticket.",
    },
  ];

  const currentSteps = isFixer ? fixerSteps : citizenSteps;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-transparent overflow-x-hidden relative">
      <Navbar />

      {/* Hero Section */}
      <section className="px-10 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            Better Cities,
            <br />
            <span style={{ color: themeColor }}>
              {isFixer ? "Fixing Issues" : "One Report"}
            </span>{" "}
            at a Time.
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            {isFixer
              ? "Access the live map to find reported issues in your area and start resolving them."
              : "CivicLens turns your neighborhood concerns into action using AI-verified reporting."}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleActionClick}
              className="px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg hover:brightness-110 transition transform hover:-translate-y-1 cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              {isFixer ? (
                <>
                  Start Fixing <Wrench size={20} />
                </>
              ) : (
                <>
                  Report an Issue <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* ONLY SHOW HEATMAP BUTTON FOR CITIZENS/GUESTS */}
            {!isFixer && (
              <button
                onClick={() => navigate("/map")}
                className="px-8 py-4 rounded-xl font-bold border-2 border-gray-200 bg-white/50 transition backdrop-blur-sm cursor-pointer hover:bg-gray-50"
              >
                View Heatmap
              </button>
            )}
          </div>
        </div>

        {/* Map Preview */}
        <div className="flex justify-center relative">
          <div className="w-full max-w-md h-[400px] bg-white/40 backdrop-blur-md rounded-3xl border-8 border-white shadow-xl overflow-hidden animate-main-float relative z-20">
            <MapContainer
              center={defaultCenter}
              zoom={14}
              scrollWheelZoom={false}
              zoomControl={false}
              dragging={false}
              attributionControl={false}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <MapRecenter position={userLocation} />
              {userLocation && (
                <Marker position={userLocation} icon={customIcon} />
              )}
            </MapContainer>

            <button
              onClick={handleFindMe}
              disabled={isLocating}
              className="absolute top-4 right-4 z-[1001] p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md flex items-center gap-2 text-xs font-bold cursor-pointer"
              style={{ color: themeColor }}
            >
              <Navigation
                size={14}
                className={isLocating ? "animate-spin" : ""}
              />
              {isLocating ? "Locating..." : "Find Me"}
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-10 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isFixer ? "Your Repair Workflow" : "How it Works"}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {isFixer
              ? "Follow these steps to efficiently resolve community reports."
              : "Empowering your community in four simple steps."}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {currentSteps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center group"
            >
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: themeColorLowOpacity,
                  color: themeColor,
                }}
              >
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes mainFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-main-float { animation: mainFloat 6s ease-in-out infinite; }
        @keyframes pulse-marker {
          0% { box-shadow: 0 0 0 0 rgba(154, 177, 122, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(154, 177, 122, 0); }
          100% { box-shadow: 0 0 0 0 rgba(154, 177, 122, 0); }
        }
        .leaflet-container { background-color: #f8fafc !important; }
      `}</style>
    </div>
  );
}
