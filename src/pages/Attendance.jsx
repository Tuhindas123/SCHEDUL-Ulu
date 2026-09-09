import React, { useEffect, useState, useMemo } from "react";
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
import DatePicker from "@/components/shared/DatePicker";
import TeacherRollCall from "@/components/attendance/teacherRollCall";
import { computeAttendance } from "@/lib/studentUtils";

const STATUS_META = {
  present: { icon: Check, cls: "bg-teal-500 text-white", chip: "bg-teal-100 text-teal-700", label: "Present" },
  absent: { icon: XIcon, cls: "bg-rose-500 text-white", chip: "bg-rose-100 text-rose-700", label: "Absent" },
  excused: { icon: AlertCircle, cls: "bg-amber-500 text-white", chip: "bg-amber-100 text-amber-700", label: "Excused" },
  cancelled: { icon: Ban, cls: "bg-slate-400 text-white", chip: "bg-slate-100 text-slate-600", label: "Cancelled" },
};

// Prefer the canonical subject_id. Older records logged before subjects
// existed fall back to their class_session_id or typed title so nothing
// disappears — but going forward every new entry gets a real subject_id.
function subjectKeyFor(record) {
  if (record.subject_id) return `subj:${record.subject_id}`;
  if (record.class_session_id) return `session:${record.class_session_id}`;
  return `title:${record.session_title || "Untitled"}`;
}

function SubjectCard({ title, stats, active, onClick }) {
  const below = stats.gap < 0;
  const pct = Math.max(0, Math.min(100, stats.pct));

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-colors ${
        active ? "border-pink-400 bg-pink-500/10" : "border-border/60 bg-card hover:bg-[hsl(var(--muted))]"
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="font-medium text-foreground truncate">{title}</p>
        <span className={`text-sm font-bold shrink-0 ${below ? "text-rose-600" : "text-teal-600"}`}>
          {stats.pct}%
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden mb-2">
        <div className={`h-full rounded-full ${below ? "bg-rose-500" : "bg-teal-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{stats.present} present · {stats.absent} absent</span>
        {below && <span className="text-rose-600 font-medium shrink-0">{Math.abs(stats.gap)}% below</span>}
      </div>
    </button>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [setting, setSetting] = useState(null);
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const [recordsData, subjectsData, settingsData, profile] = await Promise.all([
        api.getAttendanceRecords(),
        api.getSubjects(),
        api.getSyncSettings(),
        api.getMyProfile(),
      ]);
      const sortedRecords = (recordsData || []).sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || ""))
      );
      setRecords(sortedRecords);
      setSubjects(subjectsData || []);
      setSetting(settingsData?.[0] || null);
      setRole(profile?.role || "student");
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

  const subjectGroups = useMemo(() => {
    const map = {};
    for (const record of records) {
      const key = subjectKeyFor(record);
      if (!map[key]) {
        const resolvedTitle = record.subject_id
          ? subjects.find((s) => s.id === record.subject_id)?.name || record.session_title
          : record.session_title || "Untitled";
        map[key] = { key, title: resolvedTitle, records: [] };
      }
      map[key].records.push(record);
    }
    return Object.values(map)
      .map((group) => ({ ...group, stats: computeAttendance(group.records, required) }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [records, subjects, required]);

  const subjectScopedRecords =
    subjectFilter === "all" ? records : records.filter((r) => subjectKeyFor(r) === subjectFilter);

  const att = computeAttendance(subjectScopedRecords, required);

  const filtered =
    filter === "all" ? subjectScopedRecords : subjectScopedRecords.filter((r) => r.status === filter);

  const activeSubjectTitle =
    subjectFilter === "all"
      ? "Overall"
      : subjectGroups.find((g) => g.key === subjectFilter)?.title || "Selected subject";

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role === "teacher" || role === "admin"
                ? "Take roll call for your classes."
                : `Keep every subject above ${required}% to sit exams.`}
            </p>
          </div>
          {(role === "teacher" || role === "admin") && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:bg-pink-600 transition-colors"
            >
              <span className="text-lg">+</span>
              Take attendance
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {subjectGroups.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">By subject</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSubjectFilter("all")}
                    className={`text-left rounded-2xl border p-4 transition-colors ${
                      subjectFilter === "all" ? "border-pink-400 bg-pink-500/10" : "border-border/60 bg-card hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <p className="font-medium text-foreground mb-2">All subjects</p>
                    <p className="text-xs text-muted-foreground">
                      Combined across {subjectGroups.length} subject{subjectGroups.length === 1 ? "" : "s"}
                    </p>
                  </button>

                  {subjectGroups.map((group) => (
                    <SubjectCard
                      key={group.key}
                      title={group.title}
                      stats={group.stats}
                      active={subjectFilter === group.key}
                      onClick={() => setSubjectFilter(group.key)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">{activeSubjectTitle}</p>
                <AttendanceRing pct={att.pct} required={required} />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Stat label="Present" value={att.present} cls="text-teal-600" />
                  <Stat label="Absent" value={att.absent} cls="text-rose-600" />
                  <Stat label="Excused" value={att.excused} cls="text-amber-600" />
                  <Stat label="Cancelled" value={att.cancelled} cls="text-slate-500" />
                </div>
                {att.gap < 0 && (
                  <div className="mt-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 text-sm">
                    You're <strong>{Math.abs(att.gap)}%</strong> below the requirement
                    {subjectFilter !== "all" ? ` in ${activeSubjectTitle}` : ""}.
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex gap-2 flex-wrap">
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
                          filter === key ? "bg-pink-500 text-white" : "bg-card border border-border/60 text-muted-foreground hover:bg-[hsl(var(--muted))]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {subjectFilter !== "all" && (
                    <button onClick={() => setSubjectFilter("all")} className="text-xs text-pink-600 font-medium hover:underline">
                      Clear subject filter
                    </button>
                  )}
                </div>

                <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-10 text-center">
                      No records {filter !== "all" ? `for "${filter}"` : ""}
                      {subjectFilter !== "all" ? ` in ${activeSubjectTitle}` : ""} yet.
                    </p>
                  ) : (
                    filtered.map((record) => {
                      const meta = STATUS_META[record.status] || STATUS_META.present;
                      const Icon = meta.icon;
                      return (
                        <div key={record.id} className="group flex items-center gap-3 px-5 py-3.5">
                          <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${meta.cls}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{record.session_title}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.date
                                ? new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                                : ""}
                              {record.notes ? ` · ${record.notes}` : ""}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${meta.chip}`}>{meta.label}</span>
                          {(role === "teacher" || role === "admin") && (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                              title="Delete attendance record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {showForm && (
          <TeacherRollCall
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
      <p className={`text-2xl font-heading font-bold ${cls}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}