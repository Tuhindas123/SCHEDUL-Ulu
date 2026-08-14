import React from "react";

export default function StatCard({ icon: Icon, label, value, sub, tone = "violet" }) {
  const tones = {
    violet: "from-violet-500 to-violet-400 text-white shadow-violet-500/30",
    coral: "from-rose-500 to-rose-400 text-white shadow-rose-500/30",
    mint: "from-teal-500 to-teal-400 text-white shadow-teal-500/30",
    amber: "from-amber-500 to-amber-400 text-white shadow-amber-500/30",
    sky: "from-sky-500 to-sky-400 text-white shadow-sky-500/30"
  };
  return (
    <div className="rounded-3xl bg-card p-5 border border-border/60 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-2xl grid place-items-center bg-gradient-to-br ${tones[tone]} shadow-lg`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-heading font-bold text-foreground leading-tight">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-3 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}