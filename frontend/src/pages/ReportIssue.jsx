import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";

export default function ReportIssue() {
  const themeColor = "#9AB17A";
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [reportData, setReportData] = useState({
    category: "",
    description: "",
    photoUrl: "",
    address: "",
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.longitude, pos.coords.latitude]),
        (err) => console.error("Location error:", err)
      );
    }
  }, []);

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStep(2);
    await analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await axios.post("/complaints/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReportData({
        category: res.data.label,
        description: res.data.description,
        photoUrl: res.data.photoUrl,
        address: "",
      });
      setStep(3);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Analysis failed. Please try a clearer photo."
      );
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert("Please enable location permissions to submit.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/complaints", {
        photoUrl: reportData.photoUrl,
        description: reportData.description,
        category: reportData.category,
        coordinates: JSON.stringify(location),
        address: reportData.address || "",
      });
      setStep(4);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-md mx-auto px-6 pt-10">
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 mx-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: step >= s ? themeColor : "#e5e7eb" }}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Camera size={40} style={{ color: themeColor }} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Capture the Issue</h2>
              <p className="text-gray-500 mb-8 text-sm">
                Upload a clear photo of the problem. Our AI will identify the
                category and describe it automatically.
              </p>

              <label className="block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="hidden"
                />
                <div
                  className="py-4 px-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  <Camera size={20} /> Open Camera
                </div>
              </label>

              <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                <MapPin size={12} />
                {location
                  ? "Location detected ✓"
                  : "Detecting your location..."}
              </p>
            </div>
          </div>
        )}

        {/* step 2 — analyzing */}
        {step === 2 && (
          <div className="text-center py-20">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl mb-8 opacity-60"
              />
            )}
            <Loader2
              className="animate-spin mx-auto mb-4"
              size={48}
              style={{ color: themeColor }}
            />
            <h2 className="text-xl font-bold">AI Analyzing...</h2>
            <p className="text-gray-500 text-sm mt-2">
              Identifying issue and generating description...
            </p>
          </div>
        )}

        {/* step 3 — review and edit */}
        {step === 3 && (
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* photo preview */}
              <img
                src={reportData.photoUrl || preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                {/* detected category badge */}
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                  }}
                >
                  Detected: {reportData.category}
                </div>

                {/* editable description */}
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none"
                  rows="5"
                  value={reportData.description}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      description: e.target.value,
                    })
                  }
                />
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> AI generated — you can edit this
                  before submitting.
                </p>

                {/* location status */}
                <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                  <MapPin size={12} style={{ color: themeColor }} />
                  {location
                    ? "Location tagged automatically"
                    : "Location not detected — please enable GPS"}
                </p>

                {/* submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !location}
                  className="w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Send size={18} /> Submit Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <CheckCircle2 size={60} style={{ color: themeColor }} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Report Submitted!</h2>
            <p className="text-gray-500 mb-10">
              Thank you for helping improve your city. Authorities will be
              notified shortly.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-4 rounded-xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
