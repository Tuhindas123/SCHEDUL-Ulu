import React from "react";

export default function StatCard({ icon: Icon, label, value, sub, tone = "pink" }) {
  const tones = {
    // Solid, saturated tile colors matching the reference dashboard
    yellow: "bg-[#F3D34E] text-[#2B2410]",
    pink: "bg-[#F2A6CB] text-[#4A1830]",
    mint: "bg-[#AEBB76] text-[#2A2E0D]", // olive-green, matches the "By condition" tile
    blue: "bg-[#A6C6EA] text-[#16283F]",
    // legacy tone names still used around the app, mapped onto the four above
    violet: "bg-[#A6C6EA] text-[#16283F]",
    coral: "bg-[#F2A6CB] text-[#4A1830]",
    amber: "bg-[#F3D34E] text-[#2B2410]",
    sky: "bg-[#A6C6EA] text-[#16283F]",
  };

  return (
    <div className={`rounded-3xl p-5 ${tones[tone] || tones.pink}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium opacity-70 truncate">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-xl grid place-items-center bg-white/40 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold leading-tight mt-2">{value}</p>
      {sub && <p className="mt-2 text-xs opacity-70">{sub}</p>}
    </div>
  );
}