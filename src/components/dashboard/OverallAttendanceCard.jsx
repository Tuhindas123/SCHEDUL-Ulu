import React from "react";
import { attendanceStatus } from "@/lib/studentUtils";

const MESSAGES = {
  good: "You are maintaining good attendance.",
  warning: "You're cutting it close — keep attending.",
  danger: "Your attendance is below the requirement.",
};

const CTA = {
  good: "Keep it up!",
  warning: "Don't miss more classes.",
  danger: "Catch up soon.",
};

export default function OverallAttendanceCard({ pct, required }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  const { tone } = attendanceStatus(pct, required);
  const color = tone === "good" ? "#14b8a6" : tone === "warning" ? "#f59e0b" : "#f43f5e";

  return (
    <div className="rounded-3xl bg-[hsl(var(--muted))] border border-border/60 p-6 flex items-center gap-6 flex-wrap">
      <div className="relative w-24 h-24 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e0f0" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-heading font-bold" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-semibold text-foreground">Overall Attendance</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{MESSAGES[tone]}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color }}>
          {CTA[tone]}
        </p>
      </div>
    </div>
  );
}
