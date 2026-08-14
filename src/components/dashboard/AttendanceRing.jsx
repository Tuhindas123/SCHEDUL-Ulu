import React from "react";

export default function AttendanceRing({ pct, required = 75 }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const statusColor = pct >= required ? "#14b8a6" : pct >= required - 5 ? "#f59e0b" : "#f43f5e";
  const statusLabel = pct >= required ? "On track" : pct >= required - 5 ? "Watch out" : "At risk";
  return (
    <div className="rounded-3xl bg-card p-6 border border-border/60 shadow-sm flex flex-col items-center">
      <h3 className="self-start text-sm font-semibold text-muted-foreground mb-2">Attendance</h3>
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="none" stroke="#e9e7e0" strokeWidth="14" />
          <circle
            cx="80" cy="80" r={r} fill="none" stroke={statusColor} strokeWidth="14"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-heading font-bold text-foreground">{pct}%</span>
          <span className="text-xs text-muted-foreground">of {required}% required</span>
        </div>
      </div>
      <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${statusColor}1a`, color: statusColor }}>
        {statusLabel}
      </div>
    </div>
  );
}