import React, { useState } from "react";
import { X as XIcon } from "lucide-react";
import { api } from "@/api/apiClient";

const STATUS_OPTIONS = [
  { key: "present", label: "Present", cls: "bg-teal-500 text-white" },
  { key: "absent", label: "Absent", cls: "bg-rose-500 text-white" },
  { key: "excused", label: "Excused", cls: "bg-amber-500 text-white" },
  { key: "cancelled", label: "Cancelled", cls: "bg-slate-400 text-white" },
];

// `initial` optionally pre-fills and locks a subject:
// { class_session_id, session_title }
export default function LogEntryForm({ sessions, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    session_title: initial?.session_title || "",
    date: new Date().toISOString().slice(0, 10),
    status: "present",
    notes: "",
    class_session_id: initial?.class_session_id || "",
  });

  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-60";

  const submit = async (event) => {
    event.preventDefault();
    if (!form.session_title || !form.date) return;

    try {
      setSaving(true);
      const payload = {
        ...form,
        class_session_id: form.class_session_id === "" ? null : form.class_session_id,
      };
      await api.createAttendanceRecord(payload);
      onSaved();
    } catch (error) {
      console.error("Failed to create attendance record:", error);
      alert("Failed to save attendance record.");
    } finally {
      setSaving(false);
    }
  };

  const handleSessionChange = (event) => {
    const sessionId = event.target.value;
    const selectedSession = sessions.find((s) => String(s.id) === String(sessionId));
    setForm({
      ...form,
      class_session_id: sessionId,
      session_title: selectedSession?.title || form.session_title,
    });
  };

  const subjectLocked = !!initial?.class_session_id || !!initial?.session_title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Log attendance</h2>
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

        <form onSubmit={submit} className="p-6 space-y-4">
          {!subjectLocked && (
            <select className={inputCls} value={form.class_session_id} onChange={handleSessionChange}>
              <option value="">Pick a session (optional)</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} ({session.day_of_week})
                </option>
              ))}
            </select>
          )}

          <input
            className={inputCls}
            placeholder="Session title"
            value={form.session_title}
            onChange={(e) => setForm({ ...form, session_title: e.target.value })}
            disabled={subjectLocked}
          />

          <input
            type="date"
            className={inputCls}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm({ ...form, status: opt.key })}
                className={`py-2 rounded-2xl text-xs font-medium border transition-all ${
                  form.status === opt.key
                    ? `${opt.cls} border-transparent`
                    : "border-border text-muted-foreground hover:bg-[hsl(var(--muted))]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <input
            className={inputCls}
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

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
              className="px-4 py-2.5 rounded-2xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
