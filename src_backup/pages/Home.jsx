import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  ListTodo,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/dashboard/StatCard";
import AttendanceRing from "@/components/dashboard/AttendanceRing";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import WeekPlanList from "@/components/dashboard/WeekPlanList";

import {
  todayKey,
  sessionsForDay,
  computeAttendance,
  nextSession,
  formatTime,
  DAY_LABELS,
} from "@/lib/studentUtils";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [setting, setSetting] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [s, r, p, st] = await Promise.all([
          api.getClassSessions(),
          api.getAttendanceRecords(),
          api.getWeeklyPlans(),
          api.getSyncSettings(),
        ]);

        setSessions(s || []);
        setRecords(r || []);
        setPlans(p || []);
        setSetting(st?.[0] || null);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const dayKey = todayKey();
  const todaySessions = sessionsForDay(sessions, dayKey);

  const required = setting?.attendance_required_pct ?? 75;

  const att = computeAttendance(records, required);

  const next = nextSession(sessions);

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1 className="text-3xl font-heading font-bold text-foreground mt-1">
            Hey there 👋
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Here's your flow for today.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={CalendarDays}
            label="Today's classes"
            value={todaySessions.length}
            tone="blue"
          />

          <StatCard
            icon={CheckSquare}
            label="Attended so far"
            value={att.present}
            sub={`${att.total} records logged`}
            tone="mint"
          />

          <StatCard
            icon={ListTodo}
            label="This week's plans"
            value={plans.filter((p) => p.status !== "done").length}
            sub={`${plans.filter((p) => p.status === "done").length} done`}
            tone="yellow"
          />

          <StatCard
            icon={Zap}
            label="Up next"
            value={next ? formatTime(next.start_time) : "—"}
            sub={next ? next.title : "Free time!"}
            tone="pink"
          />
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            <TodaySchedule
              sessions={todaySessions}
              todayLabel={DAY_LABELS[dayKey]}
            />

            <WeekPlanList plans={plans} />
          </div>

          {/* Right */}
          <div className="space-y-4">
            <AttendanceRing
              pct={att.pct}
              required={required}
            />

            <div className="rounded-3xl bg-card p-6 border border-border/60 shadow-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Attendance breakdown
              </h3>

              <BreakdownBar
                label="Present"
                value={att.present}
                total={att.total}
                color="bg-teal-500"
              />

              <BreakdownBar
                label="Absent"
                value={att.absent}
                total={att.total}
                color="bg-rose-500"
              />

              <BreakdownBar
                label="Excused"
                value={att.excused}
                total={att.total}
                color="bg-amber-500"
              />

              <BreakdownBar
                label="Cancelled"
                value={att.cancelled}
                total={att.total}
                color="bg-slate-300"
              />

              {setting && (
                <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                  Last synced:{" "}
                  {setting.last_synced_at
                    ? new Date(setting.last_synced_at).toLocaleString()
                    : "never"}
                </div>
              )}
            </div>

            <Link
              to="/schedule"
              className="block rounded-3xl bg-pink-500 text-white p-5 shadow-lg shadow-pink-500/25 hover:bg-pink-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    See full week
                  </p>

                  <p className="text-sm text-pink-100">
                    All your sessions at a glance
                  </p>
                </div>

                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function BreakdownBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">
          {label}
        </span>

        <span className="font-medium text-foreground">
          {value}
        </span>
      </div>

      <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${pct}%`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}