import React, { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { COLOR_TAGS, DAYS, DAY_LABELS, formatTime } from "@/lib/studentUtils";

const HOUR_HEIGHT = 64; // px per hour
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 20;

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function WeekGrid({ sessions, onSelectSession }) {
  const now = useNow();
    const WEEKDAYS = DAYS.slice(0, 5);

  const { startHour, endHour } = useMemo(() => {
    let minH = DEFAULT_START_HOUR;
    let maxH = DEFAULT_END_HOUR;
    sessions.forEach((s) => {
      const sH = Math.floor(timeToMinutes(s.start_time) / 60);
      const eH = Math.ceil(timeToMinutes(s.end_time) / 60);
      if (sH < minH) minH = sH;
      if (eH > maxH) maxH = eH;
    });
    return { startHour: minH, endHour: maxH };
  }, [sessions]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = startHour; h <= endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  const gridHeight = (endHour - startHour) * HOUR_HEIGHT;

  const todayKey = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - startHour * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const nowLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Day headers */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)] border-b border-border/60">
            <div />
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className={`px-2 py-3 text-center text-xs font-semibold ${
                  day === todayKey
                    ? "bg-sidebar text-white rounded-t-2xl mx-1 mt-1"
                    : "text-muted-foreground"
                }`}
              >
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div className="grid grid-cols-[64px_repeat(5,1fr)] relative" style={{ height: gridHeight }}>
            {/* Hour labels */}
            <div className="relative">
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-2 text-right text-[11px] text-muted-foreground -translate-y-1/2"
                  style={{ top: (h - startHour) * HOUR_HEIGHT }}
                >
                  {h % 24 === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {WEEKDAYS.map((day) => {
              const daySessions = sessions.filter((s) => s.day_of_week === day);
              const isToday = day === todayKey;
              return (
                <div key={day} className={`relative border-l border-border/50 ${isToday ? "bg-muted/30" : ""}`}>
                  {/* Hour gridlines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-border/40"
                      style={{ top: (h - startHour) * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && showNowLine && (
                    <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: nowTop }}>
                      <span className="text-[10px] font-bold bg-sidebar text-white px-2 py-0.5 rounded-full -ml-1 whitespace-nowrap">
                        {nowLabel}
                      </span>
                      <div className="flex-1 h-[2px] bg-sidebar" />
                    </div>
                  )}

                  {/* Event cards */}
                  {daySessions.map((s) => {
                    const tag = COLOR_TAGS[s.color_tag] || COLOR_TAGS.violet;
                    const startMin = timeToMinutes(s.start_time);
                    const endMin = timeToMinutes(s.end_time);
                    const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
                    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 30);

                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectSession?.(s)}
                        className={`absolute left-1 right-1 rounded-xl px-2.5 py-1.5 text-left ${tag.bg} ${tag.text} hover:brightness-95 transition-all overflow-hidden`}
                        style={{ top, height }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold leading-tight truncate">{s.title}</p>
                          <MoreHorizontal className="w-3 h-3 shrink-0 opacity-50" />
                        </div>
                        <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                          {formatTime(s.start_time)}–{formatTime(s.end_time)}
                        </p>
                        {s.is_recurring === false && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">
                            Custom
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
