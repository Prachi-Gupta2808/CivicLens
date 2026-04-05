import React, { useEffect, useState } from "react";

const MainLayout = ({ children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col font-sans">
      {/* --- BACKGROUND DOT GRID --- */}
      <div
        className="fixed inset-0 z-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#9AB17A 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* --- DYNAMIC CURSOR BLOBS --- */}
      <div className="pointer-events-none fixed inset-0 z-1 overflow-hidden">
        {/* Main Soft Glow */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[160px] opacity-30 transition-transform duration-700 ease-out"
          style={{
            backgroundColor: "#9AB17A",
            transform: `translate(${mousePos.x - 400}px, ${
              mousePos.y - 400
            }px)`,
          }}
        />

        {/* Small Fast Blob */}
        <div
          className="absolute w-32 h-32 rounded-full blur-2xl opacity-50 transition-transform duration-500 ease-out"
          style={{
            backgroundColor: "#6D8165",
            transform: `translate(${mousePos.x - 40}px, ${mousePos.y - 40}px)`,
          }}
        />

        {/* Large Slow Blob (Extreme Lag) */}
        <div
          className="absolute w-96 h-96 rounded-full blur-[100px] opacity-15 transition-transform duration-[1500ms] ease-out"
          style={{
            backgroundColor: "#B4C69C",
            transform: `translate(${mousePos.x - 480}px, ${
              mousePos.y - 200
            }px)`,
          }}
        />
      </div>

      {/* Render the actual page content */}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

      <style>{`
        @keyframes blobMorph {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          66% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 40%; }
        }
        .animate-blob-morph { animation: blobMorph 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default MainLayout;
