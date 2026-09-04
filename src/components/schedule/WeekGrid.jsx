import React, { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { COLOR_TAGS, DAYS, DAY_LABELS, formatTime } from "@/lib/studentUtils";

const ROW_HEIGHT = 70; // px per period row (equal for every slot, regardless of real-world duration)

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Formats a minutes-since-midnight value as a compact clock label,
// e.g. 550 -> "9:10am", 600 -> "10am".
function minutesToLabel(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const period = h < 12 ? "am" : "pm";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function getCountdownLabel(sessions, todayKey, nowMinutes) {
  const today = sessions
    .filter((s) => s.day_of_week === todayKey)
    .map((s) => ({ ...s, sM: timeToMinutes(s.start_time), eM: timeToMinutes(s.end_time) }))
    .sort((a, b) => a.sM - b.sM);
  const ongoing = today.find((s) => nowMinutes >= s.sM && nowMinutes < s.eM);
  if (ongoing) return `${ongoing.eM - nowMinutes} min left in ${ongoing.title}`;
  const next = today.find((s) => s.sM > nowMinutes);
  if (next) return `${next.sM - nowMinutes} min until ${next.title}`;
  return null;
}

export default function WeekGrid({ sessions, onSelectSession }) {
  const now = useNow();
  const WEEKDAYS = DAYS.slice(0, 5);

  // Ticks are the actual period boundaries from the uploaded timetable
  // (every session's start and end time). Rows are laid out with equal
  // height per tick interval, not scaled by real-world duration — so a
  // free hour (e.g. lunch) doesn't blow up the layout.
  const ticks = useMemo(() => {
    const minutesSet = new Set();
    sessions.forEach((s) => {
      minutesSet.add(timeToMinutes(s.start_time));
      minutesSet.add(timeToMinutes(s.end_time));
    });
    if (minutesSet.size === 0) {
      for (let h = 9; h <= 17; h++) minutesSet.add(h * 60);
    }
    return Array.from(minutesSet).sort((a, b) => a - b);
  }, [sessions]);

  const tickIndex = useMemo(() => {
    const map = new Map();
    ticks.forEach((m, i) => map.set(m, i));
    return map;
  }, [ticks]);

  const gridHeight = Math.max(ticks.length - 1, 1) * ROW_HEIGHT;

  const todayKey = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowLabel = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const countdown = getCountdownLabel(sessions, todayKey, nowMinutes);

  // Interpolate the now-line's row position between whichever two ticks
  // it currently falls between, since rows are equal-height, not
  // time-proportional.
  const nowPosition = useMemo(() => {
    if (ticks.length < 2) return null;
    if (nowMinutes < ticks[0] || nowMinutes > ticks[ticks.length - 1]) return null;
    for (let i = 0; i < ticks.length - 1; i++) {
      if (nowMinutes >= ticks[i] && nowMinutes <= ticks[i + 1]) {
        const frac = (nowMinutes - ticks[i]) / (ticks[i + 1] - ticks[i]);
        return i * ROW_HEIGHT + frac * ROW_HEIGHT;
      }
    }
    return null;
  }, [ticks, nowMinutes]);

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
            {/* Time labels — one per actual period boundary, equally spaced */}
            <div className="relative">
              {ticks.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 right-2 text-right text-[11px] text-muted-foreground -translate-y-1/2"
                  style={{ top: tickIndex.get(m) * ROW_HEIGHT }}
                >
                  {minutesToLabel(m)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {WEEKDAYS.map((day) => {
              const daySessions = sessions.filter((s) => s.day_of_week === day);
              const isToday = day === todayKey;
              return (
                <div key={day} className={`relative border-l border-border/50 ${isToday ? "bg-muted/30" : ""}`}>
                  {/* Gridlines — one per period boundary, equally spaced */}
                  {ticks.map((m) => (
                    <div
                      key={m}
                      className="absolute left-0 right-0 border-t border-border/40"
                      style={{ top: tickIndex.get(m) * ROW_HEIGHT }}
                    />
                  ))}

                  {/* Current time indicator — line on the left, pill on the right */}
                  {isToday && nowPosition !== null && (
                    <div className="absolute left-0 -right-2 z-30 flex items-center pointer-events-none" style={{ top: nowPosition }}>
                      <div className="flex-1 h-px bg-black" />
                      <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                        {nowLabel}
                      </span>
                    </div>
                  )}

                  {/* Event cards */}
                  {daySessions.map((s) => {
                    const tag = COLOR_TAGS[s.color_tag] || COLOR_TAGS.violet;
                    const startMin = timeToMinutes(s.start_time);
                    const endMin = timeToMinutes(s.end_time);
                    const startIdx = tickIndex.get(startMin);
                    const endIdx = tickIndex.get(endMin);
                    if (startIdx === undefined || endIdx === undefined) return null;

                    const top = startIdx * ROW_HEIGHT;
                    const height = Math.max((endIdx - startIdx) * ROW_HEIGHT - 3, 28);

                    const isOngoing = isToday && nowMinutes >= startMin && nowMinutes < endMin;
                    const progressPct = isOngoing
                      ? Math.min(100, Math.max(0, ((nowMinutes - startMin) / (endMin - startMin)) * 100))
                      : 0;

                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelectSession?.(s)}
                        className={`absolute left-1 right-1 rounded-xl px-2.5 py-1.5 text-left ${tag.bg} ${tag.text} hover:brightness-95 transition-all overflow-hidden`}
                        style={{ top, height }}
                      >
                        {isOngoing && (
                          <div
                            className="absolute inset-y-0 right-0 bg-white/40 pointer-events-none"
                            style={{ width: `${100 - progressPct}%` }}
                          />
                        )}

                        <div className="relative flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold leading-tight truncate">{s.title}</p>
                          {height > 40 && <MoreHorizontal className="w-3 h-3 shrink-0 opacity-50" />}
                        </div>
                        {height > 34 && (
                          <p className="relative text-[10px] opacity-75 leading-tight mt-0.5 truncate">
                            {formatTime(s.start_time)}–{formatTime(s.end_time)}
                          </p>
                        )}
                        {isOngoing && height > 50 && (
                          <p className="relative text-[9px] font-semibold opacity-90 mt-0.5">
                            {Math.round(endMin - nowMinutes)} min left
                          </p>
                        )}
                        {s.is_recurring === false && height > 50 && (
                          <span className="relative inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">
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