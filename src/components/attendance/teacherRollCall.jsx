import React, { useEffect, useState } from "react";
import { Check, X as XIcon, AlertCircle, Ban } from "lucide-react";

import { api } from "@/api/apiClient";
import DatePicker from "@/components/shared/DatePicker";

const STATUS_OPTIONS = [
  { key: "present", label: "P", full: "Present", cls: "bg-teal-500 text-white border-transparent" },
  { key: "absent", label: "A", full: "Absent", cls: "bg-rose-500 text-white border-transparent" },
  { key: "excused", label: "E", full: "Excused", cls: "bg-amber-500 text-white border-transparent" },
  { key: "cancelled", label: "C", full: "Cancelled", cls: "bg-slate-400 text-white border-transparent" },
];

// Teacher/admin roll-call: pick a section + date, then set one status
// per enrolled student, and submit them all in a single bulk insert.
// Nothing here lets a student mark their own row — this whole screen
// only renders for role === "teacher" | "admin" (see Attendance.jsx).
export default function TeacherRollCall({ onClose, onSaved }) {
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState([]);
  const [statuses, setStatuses] = useState({}); // user_id -> status
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoadingSections(true);
        const data = await api.getMySections();
        setSections(data || []);
        if (data?.length === 1) setSectionId(data[0].id);
      } catch (err) {
        console.error("Failed to load sections:", err);
        setError("Couldn't load your sections.");
      } finally {
        setLoadingSections(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!sectionId) {
      setRoster([]);
      return;
    }
    (async () => {
      try {
        setLoadingRoster(true);
        const data = await api.getRoster(sectionId);
        setRoster(data || []);
        // default everyone to "present" so the teacher only has to
        // tap the students who were NOT present.
        const defaults = {};
        for (const student of data || []) defaults[student.user_id] = "present";
        setStatuses(defaults);
      } catch (err) {
        console.error("Failed to load roster:", err);
        setError("Couldn't load the class roster.");
      } finally {
        setLoadingRoster(false);
      }
    })();
  }, [sectionId]);

  const setStatus = (userId, status) => {
    setStatuses((prev) => ({ ...prev, [userId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    for (const student of roster) next[student.user_id] = status;
    setStatuses(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!sectionId || roster.length === 0) return;

    const section = sections.find((s) => s.id === sectionId);
    const entries = roster.map((student) => ({
      user_id: student.user_id,
      status: statuses[student.user_id] || "present",
    }));

    try {
      setSaving(true);
      setError("");
      await api.markAttendanceBulk(sectionId, date, section?.name, entries);
      onSaved();
    } catch (err) {
      console.error("Failed to submit attendance:", err);
      setError("Failed to save attendance for the class.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-card border border-border shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Take attendance</h2>
            <p className="text-sm text-muted-foreground mt-1">Mark today's roll call for your class.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 text-sm">{error}</div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Section</label>
            {loadingSections ? (
              <p className="text-sm text-muted-foreground">Loading your sections…</p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don't have any sections yet. An admin needs to set one up for you first.
              </p>
            ) : (
              <select
                className={inputCls}
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
              >
                <option value="" disabled>Choose a section…</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            )}
          </div>

          <DatePicker value={date} onChange={setDate} />

          {sectionId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Roster {roster.length > 0 ? `(${roster.length})` : ""}
                </label>
                {roster.length > 0 && (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => markAll("present")} className="text-xs text-teal-600 font-medium hover:underline">
                      Mark all present
                    </button>
                    <span className="text-xs text-muted-foreground">·</span>
                    <button type="button" onClick={() => markAll("absent")} className="text-xs text-rose-600 font-medium hover:underline">
                      Mark all absent
                    </button>
                  </div>
                )}
              </div>

              {loadingRoster ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading roster…</p>
              ) : roster.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No students enrolled in this section yet.</p>
              ) : (
                <div className="rounded-2xl border border-border/60 divide-y divide-border/40 max-h-72 overflow-y-auto">
                  {roster.map((student) => (
                    <div key={student.user_id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <p className="text-sm font-medium text-foreground truncate">{student.full_name || "Unnamed student"}</p>
                      <div className="flex gap-1 shrink-0">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            title={opt.full}
                            onClick={() => setStatus(student.user_id, opt.key)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${
                              statuses[student.user_id] === opt.key ? opt.cls : "border-border text-muted-foreground hover:bg-[hsl(var(--muted))]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !sectionId || roster.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : `Submit for ${roster.length || 0} student${roster.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}