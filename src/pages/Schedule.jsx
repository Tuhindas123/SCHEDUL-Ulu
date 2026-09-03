import React, { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Trash2, X } from "lucide-react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import SubjectSelect from "@/components/shared/SubjectSelect";
import SubjectManager from "@/components/shared/SubjectManager";
import WeekGrid from "@/components/schedule/WeekGrid";
import TimetableUpload from "@/components/schedule/TimetableUpload";
import {
  COLOR_TAGS,
  TYPE_LABELS,
  DAYS,
  DAY_LABELS,
  formatTime,
  sessionsForDay,
  getWeekStart,
} from "@/lib/studentUtils";

export default function Schedule() {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState("all");

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

  const filteredSessions = useMemo(() => {
    if (activeSubjectId === "all") return sessions;
    return sessions.filter((s) => s.subject_id === activeSubjectId);
  }, [sessions, activeSubjectId]);

  const weekLabel = useMemo(() => {
    const start = getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = start.toLocaleDateString("en-US", { day: "numeric", month: sameMonth ? undefined : "short" });
    const endStr = end.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} – ${endStr}`;
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">{weekLabel}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
            onClick={async () => {
              if (sessions.length > 0) {
                await Promise.all(sessions.map((s) => api.deleteClassSession(s.id)));
                await Promise.all(subjects.map((s) => api.deleteSubject(s.id)));
                setActiveSubjectId("all");
                await load();
              }
              setShowUpload(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            {sessions.length > 0 ? "Clear & reupload" : "Upload timetable"}
          </button>
            <button
              onClick={() => setShowManager(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Manage subjects
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm"
            >
              <span className="text-lg leading-none">+</span>
              Add event
            </button>
          </div>
        </div>

        {/* Subject filter pills */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubjectId("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSubjectId === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              All
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSubjectId(s.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeSubjectId === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop: real weekly time grid */}
            <div className="hidden lg:block">
              <WeekGrid sessions={filteredSessions} />
            </div>

            {/* Mobile: day-by-day list, easier to scan on a small screen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {DAYS.map((day) => {
                const list = sessionsForDay(filteredSessions, day);
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
                                  {session.is_recurring === false && (
                                    <span className="inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pastelPink text-pastelPink-foreground">
                                      Custom
                                    </span>
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
          </>
        )}

        {showUpload && (
          <TimetableUpload
            subjects={subjects}
            onImported={load}
            onClose={() => setShowUpload(false)}
          />
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

          <label className="flex items-center gap-2.5 rounded-2xl border border-border px-3.5 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(event) => setForm({ ...form, is_recurring: event.target.checked })}
              className="w-4 h-4 accent-pink-500"
            />
            <span className="text-sm text-foreground">
              Recurring weekly class
              <span className="block text-xs text-muted-foreground font-normal">
                Uncheck for a one-off override — shows a "Custom" tag on the schedule
              </span>
            </span>
          </label>

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

