// Shared helpers for the Student Flow Tracker UI.

export const COLOR_TAGS = {
  violet: { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-300", dot: "bg-violet-500", solid: "bg-violet-500", soft: "bg-violet-50" },
  coral: { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-300", dot: "bg-rose-500", solid: "bg-rose-500", soft: "bg-rose-50" },
  mint: { bg: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-300", dot: "bg-teal-500", solid: "bg-teal-500", soft: "bg-teal-50" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-300", dot: "bg-amber-500", solid: "bg-amber-500", soft: "bg-amber-50" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", ring: "ring-sky-300", dot: "bg-sky-500", solid: "bg-sky-500", soft: "bg-sky-50" },
  rose: { bg: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-300", dot: "bg-pink-500", solid: "bg-pink-500", soft: "bg-pink-50" }
};

export const TYPE_LABELS = {
  lecture: "Lecture",
  lab: "Lab",
  seminar: "Seminar",
  meeting: "Meeting",
  tutorial: "Tutorial",
  workshop: "Workshop",
  other: "Other"
};

export const TYPE_ICONS = {
  lecture: "BookOpen",
  lab: "FlaskConical",
  seminar: "Users",
  meeting: "Video",
  tutorial: "GraduationCap",
  workshop: "Wrench",
  other: "Calendar"
};

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const DAY_LABELS = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun"
};

export function todayKey() {
  const d = new Date();
  const key = d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  return key;
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function sessionsForDay(sessions, dayKey) {
  return sessions
    .filter((s) => s.day_of_week === dayKey)
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
}

export function computeAttendance(records, requiredPct = 75) {
  const total = records.length;
  if (!total) return { total: 0, present: 0, absent: 0, excused: 0, cancelled: 0, pct: 0, gap: requiredPct, status: "neutral" };
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const cancelled = records.filter((r) => r.status === "cancelled").length;
  const counted = present + absent + excused;
  const pct = counted > 0 ? Math.round((present / counted) * 100) : 0;
  const gap = pct - requiredPct;
  const status = pct >= requiredPct ? "good" : pct >= requiredPct - 5 ? "warning" : "danger";
  return { total, present, absent, excused, cancelled, pct, gap, status };
}

export function nextSession(sessions, from = new Date()) {
  const today = todayKey();
  const nowMins = from.getHours() * 60 + from.getMinutes();
  const todaySess = sessionsForDay(sessions, today);
  const upcomingToday = todaySess.find((s) => {
    const [h, m] = (s.start_time || "00:00").split(":").map(Number);
    return h * 60 + m >= nowMins;
  });
  if (upcomingToday) return upcomingToday;
  const idx = DAYS.indexOf(today);
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7];
    const list = sessionsForDay(sessions, d);
    if (list.length) return list[0];
  }
  return null;
}