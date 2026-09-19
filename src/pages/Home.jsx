import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/api/apiClient";
import { getSession, getStoredUser } from "@/lib/supabaseAuth";
import AppShell from "@/components/layout/AppShell";

import {
  todayKey,
  sessionsForDay,
  computeAttendance,
  nextSession,
  formatTime,
  DAY_LABELS,
} from "@/lib/studentUtils";

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
const WEEKDAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"]; // Monday first
const CALENDAR_HEADS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

// Finds the key your app uses for a weekday (the keys of DAY_LABELS).
function dayKeyForDate(date) {
  const name = WEEKDAY_NAMES[date.getDay()];
  const keys = Object.keys(DAY_LABELS || {});
  const hit =
    keys.find((k) => String(k).toLowerCase().startsWith(name)) ||
    keys.find((k) => String(DAY_LABELS[k]).toLowerCase().startsWith(name));
  if (hit) return hit;
  return date.getDay() === new Date().getDay() ? todayKey() : null;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

// "09:30", "09:30:00", "9:30 PM" -> minutes since midnight
function toMin(t) {
  if (!t) return null;
  const m = String(t).match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = String(t).match(/(am|pm)/i);
  if (ap) {
    const pm = ap[1].toLowerCase() === "pm";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return h * 60 + min;
}

function fmt(t) {
  if (!t) return "";
  try {
    return formatTime(t);
  } catch {
    return String(t);
  }
}

function buildMonth(viewMonth) {
  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const weeks = [];
  for (let r = 0; r < rows; r++) {
    const week = [];
    for (let c = 0; c < 7; c++) week.push(new Date(y, m, 1 - offset + r * 7 + c));
    weeks.push(week);
  }
  return weeks;
}

const secondaryLine = (s) => s?.room ?? s?.location ?? s?.teacher ?? s?.type ?? null;

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */
function Card({ className = "", children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] p-5 text-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}

function Stat({ value, unit, label }) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-heading font-semibold leading-none">{value}</span>
        {unit && <span className="text-xs font-medium">{unit}</span>}
      </div>
      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-neutral-900/55">
        {label}
      </p>
    </div>
  );
}

// Classes per weekday. Today is solid, the others are dashed outlines.
function WeekBars({ counts, todayIndex }) {
  const max = Math.max(1, ...counts);
  return (
    <div className="mt-5 flex h-28 items-end justify-between gap-2 pr-1">
      {counts.map((count, i) => {
        const h = count === 0 ? 8 : 16 + (count / max) * 72;
        const isToday = i === todayIndex;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              title={`${count} class${count === 1 ? "" : "es"}`}
              className={`w-3.5 rounded-full transition-[height] duration-500 ${
                isToday
                  ? "bg-neutral-900"
                  : "border-2 border-dashed border-neutral-900/60"
              }`}
              style={{ height: `${h}px` }}
            />
            <span className="text-[10px] font-medium text-neutral-900/60">
              {DAY_INITIALS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Half-circle gauge with a marker for the required percentage.
function AttendanceGauge({ pct, required, hasData }) {
  const R = 80;
  const len = Math.PI * R;
  const p = Math.min(100, Math.max(0, Number(pct) || 0));
  const angle = (v) => Math.PI * (1 - v / 100);
  const mx = 100 + R * Math.cos(angle(required));
  const my = 100 - R * Math.sin(angle(required));
  const arc = "M20 100A80 80 0 0 1 180 100";

  return (
    <svg viewBox="0 0 200 120" className="mx-auto mt-3 w-full max-w-[230px]">
      <path d={arc} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="16" strokeLinecap="round" />
      {hasData && p > 0 && (
        <path
          d={arc}
          fill="none"
          stroke="#171717"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(len * p) / 100} ${len}`}
        />
      )}
      <circle cx={mx} cy={my} r="4.5" fill="#fff" stroke="#171717" strokeWidth="2" />
      <text
        x="100"
        y="96"
        textAnchor="middle"
        fill="#171717"
        style={{ fontSize: 34, fontWeight: 700 }}
      >
        {hasData ? `${Math.round(p)}%` : "—"}
      </text>
    </svg>
  );
}

function Starburst({ className = "" }) {
  const pts = [];
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 48 : 30;
    const a = (Math.PI * i) / spikes;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon points={pts.join(" ")} fill="#8ea4dc" />
    </svg>
  );
}

// Live clock. Keeps its own timer so the rest of the page doesn't re-render every second.
function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const part = (type) =>
    new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(now)
      .find((p) => p.type === type)?.value;

  const hour = part("hour");
  const minute = part("minute");
  const second = part("second");
  const period = part("dayPeriod");

  return (
    <div className="shrink-0 self-start rounded-3xl bg-white/60 px-5 py-4 text-right dark:bg-white/[0.06]">
      <div className="flex items-baseline justify-end gap-1.5">
        <span className="text-4xl font-heading font-bold leading-none tabular-nums">
          {hour}:{minute}
        </span>
        <span className="w-5 text-left text-xs font-semibold tabular-nums text-neutral-500 dark:text-neutral-400">
          {second}
        </span>
        {period && <span className="text-sm font-semibold">{period}</span>}
      </div>
      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
        {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [setting, setSetting] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [s, r, p, st, session] = await Promise.all([
        api.getMyClassSessions(),
        api.getAttendanceRecords(),
        api.getWeeklyPlans(),
        api.getSyncSettings(),
        getSession(),
      ]);

      setSessions(s || []);
      setRecords(r || []);
      setPlans(p || []);
      setSetting(st?.[0] || null);
      setUser(getStoredUser(session));
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

<<<<<<< HEAD
  // Full-bleed: cancel the padding AppShell puts around the page so the dashboard
  // fills the whole content area (and its background reaches every edge).
  const pageRef = useRef(null);
  const [bleed, setBleed] = useState(null);
=======
        const [s, r, p, st, session] = await Promise.all([
          api.getMyClassSessions(),
          api.getAttendanceRecords(),
          api.getWeeklyPlans(),
          api.getSyncSettings(),
          getSession(),
        ]);
>>>>>>> cf9c845c25a98d6c361620f4aa9e176b8d447e21

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return undefined;

    const measure = () => {
      let pt = 0;
      let pr = 0;
      let pb = 0;
      let pl = 0;
      let node = el.parentElement;
      let outer = node;
      for (let depth = 0; node && node !== document.body && depth < 4; depth++) {
        const cs = getComputedStyle(node);
        pt += parseFloat(cs.paddingTop) || 0;
        pr += parseFloat(cs.paddingRight) || 0;
        pb += parseFloat(cs.paddingBottom) || 0;
        pl += parseFloat(cs.paddingLeft) || 0;
        outer = node;
        if (node.tagName === "MAIN") break;
        node = node.parentElement;
      }
      const top = Math.max(0, outer ? outer.getBoundingClientRect().top : 0);
      setBleed({
        margin: `-${pt}px -${pr}px -${pb}px -${pl}px`,
        minHeight: Math.max(0, window.innerHeight - top),
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [loading]);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const dayKey = todayKey();
  const todaySessions = sessionsForDay(sessions, dayKey);
  const required = setting?.attendance_required_pct ?? 75;
  const att = computeAttendance(records, required);
  const next = nextSession(sessions);

  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const openPlans = plans.filter((p) => p.status !== "done");
  const donePlans = plans.filter((p) => p.status === "done");

  // number of classes for each weekday (index = JS getDay(): 0 = Sunday)
  const classCounts = useMemo(() => {
    return WEEKDAY_NAMES.map((_, i) => {
      const ref = new Date(2024, 0, 7 + i); // 7 Jan 2024 was a Sunday
      const key = dayKeyForDate(ref);
      return key ? sessionsForDay(sessions, key).length : 0;
    });
  }, [sessions]);

  const weekCounts = [1, 2, 3, 4, 5, 6, 0].map((i) => classCounts[i]); // Monday first
  const weekTotal = weekCounts.reduce((a, b) => a + b, 0);
  const todayIndex = (now.getDay() + 6) % 7;

  const summaryLine = (() => {
    const parts = ["Schedul-Ulu wishes you a focused, productive day."];
    if (todaySessions.length > 0) {
      parts.push(
        `You have ${todaySessions.length} class${todaySessions.length === 1 ? "" : "es"} today${
          next ? `, next up at ${fmt(next.start_time)}` : ""
        }.`
      );
    } else {
      parts.push("Nothing on your plate today — enjoy the breather.");
    }
    return parts.join(" ");
  })();

  // timeline for the selected calendar day
  const timeline = useMemo(() => {
    const key = dayKeyForDate(selectedDate);
    const list = key ? sessionsForDay(sessions, key) : [];
    return [...list].sort((a, b) => (toMin(a.start_time) ?? 0) - (toMin(b.start_time) ?? 0));
  }, [sessions, selectedDate]);

  const selectedIsToday = sameDay(selectedDate, now);
  const weeks = buildMonth(viewMonth);
  const selectedWeekStart = startOfWeek(selectedDate);

  const isNext = (s) => s === next || (s?.id != null && s.id === next?.id);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div
        ref={pageRef}
        style={bleed ? { margin: bleed.margin, minHeight: bleed.minHeight } : undefined}
        className="bg-[#f8f1e3] p-4 text-neutral-900 sm:p-8 lg:p-10 dark:bg-[#211f1b] dark:text-neutral-100"
      >
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ============================ LEFT ============================ */}
          <div className="min-w-0 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold leading-tight sm:text-4xl">
                  {greeting}
                  {firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {summaryLine}
                </p>
              </div>
              <LiveClock />
            </div>

            {/* Colour cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.15fr]">
              {/* Yellow: classes this week */}
              <Card className="bg-[#f5d94e]">
                <div
                  className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 opacity-30"
                  aria-hidden="true"
                >
                  <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 rotate-45 rounded-xl bg-white" />
                  <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 -rotate-45 rounded-xl bg-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold">This week</h3>
                <div className="mt-4 flex gap-8">
                  <Stat value={weekTotal} unit="classes" label="All week" />
                  <Stat value={todaySessions.length} unit="today" label={DAY_LABELS?.[dayKey] ?? "Today"} />
                </div>
                <WeekBars counts={weekCounts} todayIndex={todayIndex} />
              </Card>

              {/* Pink: attendance */}
              <Card className="bg-[#f4b4d3]">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 opacity-40"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4 4 7.5C19 16.65 12 21 12 21z"
                    fill="#fff"
                  />
                </svg>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-heading font-semibold">Attendance</h3>
                  {att.total > 0 && (
                    <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium">
                      {att.pct >= required ? "On track" : "Below target"}
                    </span>
                  )}
                </div>
                <AttendanceGauge pct={att.pct} required={required} hasData={att.total > 0} />
                <div className="mt-3 flex justify-between gap-4">
                  <Stat value={att.present} unit="present" label="So far" />
                  <Stat value={att.total} unit="logged" label="Records" />
                  <Stat value={`${required}%`} label="Required" />
                </div>
              </Card>

              {/* Green: by status */}
              <Card className="bg-[#9fae5e] min-h-[190px]">
                <h3 className="text-xl font-heading font-semibold">By status</h3>
                <div className="mt-4 flex gap-6">
                  <Stat value={att.present} unit="pres" label="Present" />
                  <Stat value={att.absent} unit="abs" label="Absent" />
                  <Stat value={att.excused} unit="exc" label="Excused" />
                </div>
                <svg
                  viewBox="0 0 120 100"
                  className="absolute -bottom-3 right-4 h-28 w-32"
                  aria-hidden="true"
                >
                  <path d="M6 8H114L60 96Z" fill="#6f7d3a" strokeLinejoin="round" stroke="#6f7d3a" strokeWidth="8" />
                </svg>
                <p className="absolute bottom-5 left-5 text-[11px] font-medium text-neutral-900/60">
                  {att.cancelled} cancelled
                </p>
              </Card>

              {/* Blue: plans */}
              <Card className="bg-[#b5c5ee] min-h-[190px]">
                <h3 className="text-xl font-heading font-semibold">Plans</h3>
                <div className="mt-4 flex gap-6">
                  <Stat value={openPlans.length} unit="open" label="This week" />
                  <Stat value={donePlans.length} unit="done" label="Finished" />
                  <Stat value={next ? fmt(next.start_time) : "—"} label="Up next" />
                </div>
                <Starburst className="absolute -bottom-4 right-3 h-28 w-28" />
              </Card>
            </div>

            {/* Today's classes + details */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-heading font-semibold">Today&apos;s classes</h3>
                  <span className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
                    {DAY_LABELS?.[dayKey] ?? "Today"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {todaySessions.length === 0 && (
                    <div className="rounded-2xl bg-white/50 p-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
                      Nothing scheduled — enjoy the breather.
                    </div>
                  )}
                  {todaySessions.slice(0, 4).map((s, i) => {
                    const highlight = isNext(s);
                    return (
                      <div
                        key={s.id ?? i}
                        className={`flex items-center gap-3 rounded-2xl p-3 ${
                          highlight
                            ? "bg-[#f4b4d3] text-neutral-900"
                            : "bg-white/50 dark:bg-white/5"
                        }`}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/80 text-neutral-900">
                          <BookOpen className="h-[18px] w-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{s.title}</p>
                          {secondaryLine(s) && (
                            <p className="truncate text-xs opacity-60">{secondaryLine(s)}</p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            highlight
                              ? "bg-white text-neutral-900"
                              : "bg-[#f4b4d3] text-neutral-900"
                          }`}
                        >
                          {fmt(s.start_time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-heading font-semibold">Class details</h3>
                <Card className="bg-[#f4b4d3]">
                  {next ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-900/55">
                            Up next
                          </p>
                          <p className="mt-1 truncate text-xl font-heading font-semibold">
                            {next.title}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold">
                          {fmt(next.start_time)}
                          {next.end_time ? ` – ${fmt(next.end_time)}` : ""}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {secondaryLine(next) && (
                          <span className="rounded-full border border-dashed border-neutral-900/50 px-3 py-1 text-[11px] font-medium">
                            {secondaryLine(next)}
                          </span>
                        )}
                        <span className="rounded-full border border-dashed border-neutral-900/50 px-3 py-1 text-[11px] font-medium">
                          {DAY_LABELS?.[dayKey] ?? "Today"}
                        </span>
                      </div>

                      <dl className="mt-4 space-y-2 text-xs">
                        <div className="flex gap-3">
                          <dt className="w-20 shrink-0 text-neutral-900/55">Attendance</dt>
                          <dd className="font-medium">
                            {att.present} of {att.total} present · need {required}%
                          </dd>
                        </div>
                        <div className="flex gap-3">
                          <dt className="w-20 shrink-0 text-neutral-900/55">Open plans</dt>
                          <dd className="font-medium">
                            {openPlans.length === 0
                              ? "All caught up"
                              : openPlans
                                  .slice(0, 2)
                                  .map((p) => p.title ?? p.name ?? "Untitled plan")
                                  .join(", ") +
                                (openPlans.length > 2 ? ` +${openPlans.length - 2}` : "")}
                          </dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-lg font-heading font-semibold">All done for today</p>
                      <p className="mt-1 text-xs text-neutral-900/60">No more classes coming up.</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>

          {/* ============================ RIGHT ============================ */}
          <div className="min-w-0 space-y-6">
            {/* Calendar */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() =>
                    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  }
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="rounded-full bg-[#f4b4d3] px-4 py-1.5 text-sm font-medium text-neutral-900">
                  {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  }
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_2.75rem] gap-y-1.5 text-center">
                {CALENDAR_HEADS.map((h) => (
                  <span
                    key={h}
                    className="pb-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    {h}
                  </span>
                ))}
                <span />

                {weeks.map((week) => {
                  const weekIsSelected = sameDay(startOfWeek(week[0]), selectedWeekStart);
                  return (
                    <React.Fragment key={week[0].toISOString()}>
                      {week.map((d) => {
                        const inMonth = d.getMonth() === viewMonth.getMonth();
                        const isToday = sameDay(d, now);
                        const isSelected = sameDay(d, selectedDate);
                        const weekend = d.getDay() === 0 || d.getDay() === 6;
                        const hasClass = classCounts[d.getDay()] > 0;
                        return (
                          <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => {
                              setSelectedDate(d);
                              if (!inMonth) {
                                setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                              }
                            }}
                            aria-label={d.toDateString()}
                            aria-pressed={isSelected}
                            className={`relative mx-auto grid h-9 w-9 place-items-center rounded-full text-sm transition-colors ${
                              isToday
                                ? "bg-[#f4b4d3] font-semibold text-neutral-900"
                                : isSelected
                                  ? "ring-2 ring-neutral-900 dark:ring-neutral-100"
                                  : "hover:bg-black/5 dark:hover:bg-white/10"
                            } ${!inMonth ? "opacity-30" : weekend && !isToday ? "opacity-55" : ""}`}
                          >
                            {d.getDate()}
                            {hasClass && inMonth && !isToday && (
                              <span className="absolute bottom-[3px] h-1 w-1 rounded-full bg-current opacity-60" />
                            )}
                          </button>
                        );
                      })}
                      <span
                        className={`mx-auto my-auto rounded-full px-1.5 py-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 ${
                          weekIsSelected ? "bg-black/10 dark:bg-white/15" : ""
                        }`}
                      >
                        W{isoWeek(week[0])}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/schedule"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <Plus className="h-4 w-4" />
                Add class
              </Link>
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                aria-label="Refresh"
                title={
                  setting?.last_synced_at
                    ? `Last synced: ${new Date(setting.last_synced_at).toLocaleString()}`
                    : "Refresh"
                }
                className="grid h-12 w-12 place-items-center rounded-full border border-neutral-900/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                <RefreshCw className={`h-[18px] w-[18px] ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-2xl font-heading font-bold">
                {selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </h3>
              <div className="mt-3 mb-4 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Time</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedIsToday
                    ? "Today's timeline"
                    : selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
                </span>
              </div>

              <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                {timeline.length === 0 && (
                  <div className="rounded-2xl bg-white/50 p-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
                    No classes on this day.
                  </div>
                )}

                {(() => {
                  const rows = [];
                  let markerPlaced = false;
                  const marker = (
                    <div key="now" className="flex items-center gap-2">
                      <span className="rounded-full bg-[#f4b4d3] px-2.5 py-1 text-[11px] font-semibold text-neutral-900">
                        {String(now.getHours()).padStart(2, "0")}:
                        {String(now.getMinutes()).padStart(2, "0")}
                      </span>
                      <span className="flex-1 border-t border-dashed border-neutral-900/40 dark:border-white/40" />
                    </div>
                  );

                  timeline.forEach((s, i) => {
                    const startMin = toMin(s.start_time);
                    const endMin = toMin(s.end_time) ?? (startMin != null ? startMin + 60 : null);

                    if (selectedIsToday && !markerPlaced && startMin != null && startMin > nowMin) {
                      rows.push(marker);
                      markerPlaced = true;
                    }

                    const past = selectedIsToday && endMin != null && endMin <= nowMin;
                    const current =
                      selectedIsToday && startMin != null && endMin != null &&
                      startMin <= nowMin && nowMin < endMin;

                    rows.push(
                      <div key={s.id ?? `s-${i}`} className="flex items-start gap-3">
                        <span className="w-11 shrink-0 pt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {fmt(s.start_time)}
                        </span>
                        <div
                          className={`min-w-0 flex-1 rounded-2xl p-3 transition-opacity ${
                            current
                              ? "bg-[#ece2cc] dark:bg-white/15"
                              : "bg-white/60 dark:bg-white/[0.06]"
                          } ${past ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                                current ? "bg-[#f5d94e] text-neutral-900" : "bg-[#f4b4d3]/70 text-neutral-900"
                              }`}
                            >
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{s.title}</p>
                              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                                {secondaryLine(s) ? `${secondaryLine(s)} · ` : ""}
                                {fmt(s.start_time)}
                                {s.end_time ? ` – ${fmt(s.end_time)}` : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });

                  if (selectedIsToday && !markerPlaced && timeline.length > 0) rows.push(marker);
                  return rows;
                })()}
              </div>

              <Link
                to="/schedule"
                className="mt-4 flex h-12 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
              >
                View all details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}