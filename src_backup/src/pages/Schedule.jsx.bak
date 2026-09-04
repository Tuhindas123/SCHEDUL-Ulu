import React, { useEffect, useState } from "react";
import { Clock, MapPin, Trash2, X } from "lucide-react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import SubjectSelect from "@/components/shared/SubjectSelect";
import SubjectManager from "@/components/shared/SubjectManager";
import {
  COLOR_TAGS,
  TYPE_LABELS,
  DAYS,
  DAY_LABELS,
  formatTime,
  sessionsForDay,
} from "@/lib/studentUtils";

export default function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [sessionsData, subjectsData] = await Promise.all([
        api.getClassSessions(),
        api.getSubjects(),
      ]);
      setSessions(sessionsData || []);
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error("Failed to load schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteClassSession(id);
      await load();
    } catch (error) {
      console.error("Failed to delete class session:", error);
      alert("Failed to delete the session.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">Your weekly rhythm, laid out by day.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowManager(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Manage subjects
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:bg-pink-600 transition-colors"
            >
              <span className="text-lg">+</span>
              Add session
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DAYS.map((day) => {
              const list = sessionsForDay(sessions, day);
              return (
                <div key={day} className="rounded-3xl bg-card border border-border/60 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground capitalize">{DAY_LABELS[day]}</h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-[hsl(var(--muted))]">
                      {list.length}
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">Free day</p>
                  ) : (
                    <div className="space-y-2.5">
                      {list.map((session) => {
                        const tag = COLOR_TAGS[session.color_tag] || COLOR_TAGS.violet;
                        return (
                          <div key={session.id} className="group rounded-2xl bg-[hsl(var(--muted))] px-3.5 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{session.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(session.start_time)}–{formatTime(session.end_time)}
                                </p>
                                {session.location && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {session.location}
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tag.bg} ${tag.text} font-medium shrink-0`}>
                                {TYPE_LABELS[session.type] || session.type}
                              </span>
                            </div>

                            <div className="flex justify-end mt-1">
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                                title="Delete session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showManager && (
          <SubjectManager
            subjects={subjects}
            onSubjectsChange={setSubjects}
            onClose={() => setShowManager(false)}
          />
        )}

        {showForm && (
          <SessionForm
            subjects={subjects}
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

function SessionForm({ subjects, onClose, onSaved }) {
  const [form, setForm] = useState({
    subject_id: "",
    type: "lecture",
    day_of_week: "monday",
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    instructor: "",
    color_tag: "violet",
    is_recurring: true,
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400";

  const submit = async (event) => {
    event.preventDefault();

    if (!form.subject_id || !form.start_time || !form.end_time) {
      return;
    }

    const subject = subjects.find((s) => s.id === form.subject_id);

    try {
      setSaving(true);
      await api.createClassSession({
        ...form,
        title: subject?.name || "Untitled",
      });
      onSaved();
    } catch (error) {
      console.error("Failed to create class session:", error);
      alert("Failed to save the session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">New session</h2>
            <p className="text-sm text-muted-foreground mt-1">Add a class to your weekly schedule.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <SubjectSelect
            subjects={subjects}
            value={form.subject_id}
            onSelect={(id) => setForm({ ...form, subject_id: id })}
            inputCls={inputCls}
          />

          <select
            className={inputCls}
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {Object.entries(TYPE_LABELS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select
            className={inputCls}
            value={form.day_of_week}
            onChange={(event) => setForm({ ...form, day_of_week: event.target.value })}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>{DAY_LABELS[day]}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              className={inputCls}
              value={form.start_time}
              onChange={(event) => setForm({ ...form, start_time: event.target.value })}
            />
            <input
              type="time"
              className={inputCls}
              value={form.end_time}
              onChange={(event) => setForm({ ...form, end_time: event.target.value })}
            />
          </div>

          <input
            className={inputCls}
            placeholder="Location (optional)"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />

          <input
            className={inputCls}
            placeholder="Instructor (optional)"
            value={form.instructor}
            onChange={(event) => setForm({ ...form, instructor: event.target.value })}
          />

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Colour tag</p>
            <div className="flex gap-2">
              {Object.entries(COLOR_TAGS).map(([key, tag]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, color_tag: key })}
                  className={`w-8 h-8 rounded-xl ${tag.solid} ${
                    form.color_tag === key ? "ring-2 ring-offset-2 ring-foreground" : ""
                  }`}
                  title={key}
                />
              ))}
            </div>
          </div>

          <textarea
            className={inputCls}
            placeholder="Notes (optional)"
            rows={3}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
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
              {saving ? "Saving…" : "Add session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

