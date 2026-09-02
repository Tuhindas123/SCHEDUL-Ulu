import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toDateString } from "@/lib/studentUtils";

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + "T00:00:00") : new Date();
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const days = getMonthMatrix(viewMonth.getFullYear(), viewMonth.getMonth());
  const todayStr = toDateString(new Date());
  const yesterdayStr = toDateString(new Date(Date.now() - 86400000));

  const displayLabel = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "Pick a date";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        <span className="text-foreground">{displayLabel}</span>
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl p-3">
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { onChange(todayStr); setOpen(false); }}
              className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                value === todayStr ? "bg-pink-500 text-white border-transparent" : "border-border text-muted-foreground hover:bg-[hsl(var(--muted))]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { onChange(yesterdayStr); setOpen(false); }}
              className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                value === yesterdayStr ? "bg-pink-500 text-white border-transparent" : "border-border text-muted-foreground hover:bg-[hsl(var(--muted))]"
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-xs font-semibold text-foreground">
              {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const dateStr = toDateString(day);
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`aspect-square rounded-lg text-xs transition-colors ${
                    isSelected
                      ? "bg-pink-500 text-white font-semibold"
                      : isToday
                      ? "bg-pink-100 text-pink-700"
                      : inMonth
                      ? "text-foreground hover:bg-[hsl(var(--muted))]"
                      : "text-muted-foreground/40 hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
