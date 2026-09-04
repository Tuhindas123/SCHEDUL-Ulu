import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Check, X as XIcon, AlertCircle, Ban } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import AttendanceRing from "@/components/dashboard/AttendanceRing";
import LogEntryForm from "@/components/attendance/LogEntryForm";
import { api } from "@/api/apiClient";
import { computeAttendance, subjectKeyFor } from "@/lib/studentUtils";

const STATUS_META = {
  present: { icon: Check, cls: "bg-teal-500 text-white", chip: "bg-teal-100 text-teal-700", label: "Present" },
  absent: { icon: XIcon, cls: "bg-rose-500 text-white", chip: "bg-rose-100 text-rose-700", label: "Absent" },
  excused: { icon: AlertCircle, cls: "bg-amber-500 text-white", chip: "bg-amber-100 text-amber-700", label: "Excused" },
  cancelled: { icon: Ban, cls: "bg-slate-400 text-white", chip: "bg-slate-100 text-slate-600", label: "Cancelled" },
};

export default function SubjectAttendance() {
  const { subjectKey: encodedKey } = useParams();
  const subjectKey = decodeURIComponent(encodedKey || "");

  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [recordsData, sessionsData, settingsData] = await Promise.all([
        api.getAttendanceRecords(),
        api.getClassSessions(),
        api.getSyncSettings(),
      ]);
      setRecords(recordsData || []);
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

  const subjectRecords = useMemo(
    () =>
      records
        .filter((r) => subjectKeyFor(r) === subjectKey)
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    [records, subjectKey]
  );

  const title = subjectRecords[0]?.session_title || "Subject";
  const stats = computeAttendance(subjectRecords, required);
  const matchingSession = sessions.find((s) => String(s.id) === subjectKey);

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
        <div className="flex items-center gap-3">
          <Link to="/attendance" className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground truncate">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Full attendance breakdown for this subject.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : subjectRecords.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border/60 shadow-sm py-16 text-center">
            <p className="text-sm text-muted-foreground">No records found for this subject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <AttendanceRing pct={stats.pct} required={required} />

              <div className="grid grid-cols-2 gap-2">
                <Stat label="Total classes" value={stats.total} cls="text-foreground" />
                <Stat label="Present" value={stats.present} cls="text-teal-600" />
                <Stat label="Absent" value={stats.absent} cls="text-rose-600" />
                <Stat label="Excused" value={stats.excused} cls="text-amber-600" />
                <Stat label="Cancelled" value={stats.cancelled} cls="text-slate-500" />
              </div>

              {stats.gap < 0 && (
                <div className="rounded-2xl bg-rose-50 text-rose-700 p-4 text-sm">
                  You're <strong>{Math.abs(stats.gap)}%</strong> below the requirement in this subject.
                </div>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
              >
                <span className="text-lg">+</span>
                Log entry for this subject
              </button>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
                {subjectRecords.map((record) => {
                  const meta = STATUS_META[record.status] || STATUS_META.present;
                  const Icon = meta.icon;
                  return (
                    <div key={record.id} className="group flex items-center gap-3 px-5 py-3.5">
                      <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${meta.cls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {record.date
                            ? new Date(record.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                          {record.notes ? ` · ${record.notes}` : ""}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${meta.chip}`}>
                        {meta.label}
                      </span>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                        title="Delete attendance record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <LogEntryForm
            sessions={sessions}
            initial={
              matchingSession
                ? { class_session_id: matchingSession.id, session_title: matchingSession.title }
                : { session_title: title }
            }
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
