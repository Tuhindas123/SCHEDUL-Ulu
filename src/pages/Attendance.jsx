import React, { useEffect, useState } from "react";
import {
  Trash2,
  Check,
  X as XIcon,
  AlertCircle,
  Ban,
} from "lucide-react";

import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import AttendanceRing from "@/components/dashboard/AttendanceRing";
import { computeAttendance } from "@/lib/studentUtils";

const STATUS_META = {
  present: {
    icon: Check,
    cls: "bg-teal-500 text-white",
    chip: "bg-teal-100 text-teal-700",
    label: "Present",
  },

  absent: {
    icon: XIcon,
    cls: "bg-rose-500 text-white",
    chip: "bg-rose-100 text-rose-700",
    label: "Absent",
  },

  excused: {
    icon: AlertCircle,
    cls: "bg-amber-500 text-white",
    chip: "bg-amber-100 text-amber-700",
    label: "Excused",
  },

  cancelled: {
    icon: Ban,
    cls: "bg-slate-400 text-white",
    chip: "bg-slate-100 text-slate-600",
    label: "Cancelled",
  },
};

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [setting, setSetting] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);

      const [recordsData, sessionsData, settingsData] =
        await Promise.all([
          api.getAttendanceRecords(),
          api.getClassSessions(),
          api.getSyncSettings(),
        ]);

      const sortedRecords = (recordsData || []).sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );

      setRecords(sortedRecords);
      setSessions(sessionsData || []);
      setSetting(settingsData?.[0] || null);
    } catch (error) {
      console.error("Failed to load attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const required = Number(setting?.attendance_required_pct ?? 75);

  const att = computeAttendance(records, required);

  const filtered =
    filter === "all"
      ? records
      : records.filter((record) => record.status === filter);

  const handleDelete = async (id) => {
    try {
      await api.deleteAttendanceRecord(id);
      await load();
    } catch (error) {
      console.error("Failed to delete attendance record:", error);
      alert("Failed to delete attendance record.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Attendance
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Keep that percentage above {required}% to sit exams.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:bg-violet-600 transition-colors"
          >
            <span className="text-lg">+</span>
            Log entry
          </button>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Attendance summary */}
            <div className="lg:col-span-1">
              <AttendanceRing
                pct={att.pct}
                required={required}
              />

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Stat
                  label="Present"
                  value={att.present}
                  cls="text-teal-600"
                />

                <Stat
                  label="Absent"
                  value={att.absent}
                  cls="text-rose-600"
                />

                <Stat
                  label="Excused"
                  value={att.excused}
                  cls="text-amber-600"
                />

                <Stat
                  label="Cancelled"
                  value={att.cancelled}
                  cls="text-slate-500"
                />
              </div>

              {att.gap < 0 && (
                <div className="mt-4 rounded-2xl bg-rose-50 text-rose-700 p-4 text-sm">
                  You're{" "}
                  <strong>{Math.abs(att.gap)}%</strong> below the requirement.
                </div>
              )}
            </div>

            {/* Attendance records */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  ["all", "All"],
                  ["present", "Present"],
                  ["absent", "Absent"],
                  ["excused", "Excused"],
                  ["cancelled", "Cancelled"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === key
                        ? "bg-violet-500 text-white"
                        : "bg-card border border-border/60 text-muted-foreground hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Records */}
              <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    No records{" "}
                    {filter !== "all" ? `for "${filter}"` : ""} yet.
                  </p>
                ) : (
                  filtered.map((record) => {
                    const meta =
                      STATUS_META[record.status] ||
                      STATUS_META.present;

                    const Icon = meta.icon;

                    return (
                      <div
                        key={record.id}
                        className="group flex items-center gap-3 px-5 py-3.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${meta.cls}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {record.session_title}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {record.date
                              ? new Date(
                                  record.date
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}

                            {record.notes
                              ? ` · ${record.notes}`
                              : ""}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${meta.chip}`}
                        >
                          {meta.label}
                        </span>

                        <button
                          onClick={() =>
                            handleDelete(record.id)
                          }
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                          title="Delete attendance record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Attendance form */}
        {showForm && (
          <AttForm
            sessions={sessions}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              load();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}


function Stat({ label, value, cls }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <p
        className={`text-2xl font-heading font-bold ${cls}`}
      >
        {value}
      </p>

      <p className="text-xs text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}


function AttForm({ sessions, onClose, onSaved }) {
  const [form, setForm] = useState({
    session_title: "",
    date: new Date().toISOString().slice(0, 10),
    status: "present",
    notes: "",
    class_session_id: "",
  });

  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

  const submit = async (event) => {
    event.preventDefault();

    if (!form.session_title || !form.date) {
      return;
    }

    try {
      setSaving(true);

      await api.createAttendanceRecord(form);

      onSaved();
    } catch (error) {
      console.error(
        "Failed to create attendance record:",
        error
      );

      alert("Failed to save attendance record.");
    } finally {
      setSaving(false);
    }
  };

  const handleSessionChange = (event) => {
    const sessionId = event.target.value;

    const selectedSession = sessions.find(
      (session) => String(session.id) === String(sessionId)
    );

    setForm({
      ...form,
      class_session_id: sessionId,
      session_title:
        selectedSession?.title || form.session_title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Log attendance
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Record your attendance for a class.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="p-6 space-y-4"
        >
          {/* Session selector */}
          <select
            className={inputCls}
            value={form.class_session_id}
            onChange={handleSessionChange}
          >
            <option value="">
              Pick a session (optional)
            </option>

            {sessions.map((session) => (
              <option
                key={session.id}
                value={session.id}
              >
                {session.title} ({session.day_of_week})
              </option>
            ))}
          </select>

          {/* Session title */}
          <input
            className={inputCls}
            placeholder="Session title"
            value={form.session_title}
            onChange={(event) =>
              setForm({
                ...form,
                session_title: event.target.value,
              })
            }
          />

          {/* Date */}
          <input
            type="date"
            className={inputCls}
            value={form.date}
            onChange={(event) =>
              setForm({
                ...form,
                date: event.target.value,
              })
            }
          />

          {/* Status */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_META).map(
              ([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      status: key,
                    })
                  }
                  className={`py-2 rounded-2xl text-xs font-medium border transition-all ${
                    form.status === key
                      ? `${meta.cls} border-transparent`
                      : "border-border text-muted-foreground hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {meta.label}
                </button>
              )
            )}
          </div>

          {/* Notes */}
          <input
            className={inputCls}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(event) =>
              setForm({
                ...form,
                notes: event.target.value,
              })
            }
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-2xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}