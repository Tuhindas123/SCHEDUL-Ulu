import React from "react";

export default function StatCard({ icon: Icon, label, value, sub, tone = "pink" }) {
  const tones = {
    pink: "bg-pastelPink text-pastelPink-foreground",
    blue: "bg-pastelBlue text-pastelBlue-foreground",
    yellow: "bg-pastelYellow text-pastelYellow-foreground",
    mint: "bg-pastelMint text-pastelMint-foreground",
    // legacy tone names still used around the app, mapped onto the new palette
    violet: "bg-pastelBlue text-pastelBlue-foreground",
    coral: "bg-pastelPink text-pastelPink-foreground",
    amber: "bg-pastelYellow text-pastelYellow-foreground",
    sky: "bg-pastelBlue text-pastelBlue-foreground"
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
