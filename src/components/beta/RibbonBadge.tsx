import React from "react";

interface RibbonBadgeProps {
  text?: string;
  className?: string;
}

export const RibbonBadge: React.FC<RibbonBadgeProps> = ({
  text = "TERLARIS",
  className = "",
}) => {
  return (
    <div
      className={`absolute top-0 left-0 w-24 h-24 overflow-hidden z-20 pointer-events-none select-none ${className}`}
      aria-label={text}
    >
      {/* 3D Fold Shadow Ears (Top and Left corners) */}
      <span className="absolute top-0 right-3 w-2 h-2 bg-[#881337] transform rotate-45" />
      <span className="absolute bottom-3 left-0 w-2 h-2 bg-[#881337] transform rotate-45" />

      {/* Diagonal Ribbon Banner */}
      <div
        className="absolute -left-8 top-5 w-32 -rotate-45 bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#EF4444] text-white text-[10px] font-extrabold tracking-widest uppercase py-1 text-center shadow-md border-y border-white/30"
        style={{
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.35)",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default RibbonBadge;
