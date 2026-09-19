import React, { useEffect, useState, useMemo } from "react";
import { Trash2, X, Check, Circle, Loader2, SkipForward, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { api } from "@/api/apiClient";
import AppShell from "@/components/layout/AppShell";
import { toDateString, getWeekStart } from "@/lib/studentUtils";

const CATEGORY_LABELS = {
  study: "Study",
  assignment: "Assignment",
  revision: "Revision",
  personal: "Personal",
  meeting: "Meeting",
  other: "Other",
};

const STATUS_META = {
  planned: {
    icon: Circle,
    cls: "text-slate-400 dark:text-muted-foreground",
    chip: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-muted-foreground",
    label: "Planned",
  },
  in_progress: {
    icon: Loader2,
    cls: "text-amber-500 dark:text-amber-400",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    label: "In progress",
  },
  done: {
    icon: Check,
    cls: "text-teal-500 dark:text-teal-400",
    chip: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    label: "Done",
  },
  skipped: {
    icon: SkipForward,
    cls: "text-rose-400 dark:text-rose-400",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    label: "Skipped",
  },
};

const PRIORITY_CHIP = {
  low: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const PRIORITY_DOT = {
  low: "bg-slate-400 dark:bg-muted-foreground",
  medium: "bg-amber-500 dark:bg-amber-400",
  high: "bg-rose-500 dark:bg-rose-400",
};

function eventDateFor(plan) {
  return plan.due_date || plan.week_start_date || null;
}

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatPill({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-card border-border/60",
    accent: "bg-pink-500 text-white border-transparent dark:bg-pink-600",
    warn: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300",
  };
  return (
    <div className={`rounded-2xl border shadow-sm px-5 py-3 ${tones[tone]}`}>
      <p
        className={`text-[11px] font-medium uppercase tracking-wide ${
          tone === "default" ? "text-muted-foreground" : "opacity-80"
        }`}
      >
        {label}
      </p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

function MonthCalendar({ plans, currentMonth, onMonthChange, selectedDate, onSelectDate }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const plansByDate = useMemo(() => {
    const map = {};
    for (const plan of plans) {
      const key = eventDateFor(plan);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(plan);
    }
    return map;
  }, [plans]);

  const todayStr = toDateString(new Date());

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onMonthChange(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-xl hover:bg-muted dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMonthChange(new Date())}
            className="px-2.5 py-1 rounded-xl text-xs font-medium hover:bg-muted dark:hover:bg-white/5 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => onMonthChange(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-xl hover:bg-muted dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[11px] font-medium text-muted-foreground py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dateStr = toDateString(day);
          const inMonth = day.getMonth() === month;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayPlans = plansByDate[dateStr] || [];

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 gap-1 transition-colors ${
                isSelected
                  ? "bg-pink-500 dark:bg-pink-600 text-white"
                  : isToday
                  ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                  : inMonth
                  ? "hover:bg-[hsl(var(--muted))] text-foreground"
                  : "text-muted-foreground/40 hover:bg-[hsl(var(--muted))]"
              }`}
            >
              <span className="text-xs font-medium">{day.getDate()}</span>
              {dayPlans.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
                  {dayPlans.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : PRIORITY_DOT[p.priority] || PRIORITY_DOT.medium
                      }`}
                    />
                  ))}
                  {dayPlans.length > 3 && (
                    <span className={`text-[9px] leading-none ${isSelected ? "text-white" : "text-muted-foreground"}`}>
                      +{dayPlans.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WeeklyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getWeeklyPlans();
      setPlans(data || []);
    } catch (error) {
      console.error("Failed to load weekly plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dateFiltered = selectedDate
    ? plans.filter((p) => eventDateFor(p) === selectedDate)
    : plans;

  const filtered =
    filter === "all" ? dateFiltered : dateFiltered.filter((p) => p.status === filter);

  // ---- Derived stats ----
  const todayStr = toDateString(new Date());
  const stats = useMemo(() => {
    const open = plans.filter((p) => p.status !== "done" && p.status !== "skipped");
    const overdue = open.filter((p) => {
      const d = eventDateFor(p);
      return d && d < todayStr;
    });
    const dueToday = plans.filter((p) => eventDateFor(p) === todayStr);
    const done = plans.filter((p) => p.status === "done");
    return { open: open.length, overdue: overdue.length, dueToday: dueToday.length, done: done.length };
  }, [plans, todayStr]);

  const handleDelete = async (id) => {
    try {
      await api.deleteWeeklyPlan(id);
      await load();
    } catch (error) {
      console.error("Failed to delete plan:", error);
      alert("Failed to delete plan.");
    }
  };

  const handleStatusChange = async (plan, status) => {
    try {
      await api.updateWeeklyPlan(plan.id, { status });
      await load();
    } catch (error) {
      console.error("Failed to update plan:", error);
      alert("Failed to update plan.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Planner</h1>
            <p className="text-sm text-muted-foreground mt-1">
              See what's coming up, laid out on the calendar.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-500 dark:bg-pink-600 text-white font-medium shadow-lg shadow-pink-500/25 hover:bg-pink-600 dark:hover:bg-pink-700 transition-colors"
          >
            <span className="text-lg">+</span>
            Add plan
          </button>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill label="Open items" value={stats.open} tone="accent" />
            <StatPill label="Due today" value={stats.dueToday} />
            <StatPill
              label="Overdue"
              value={stats.overdue}
              tone={stats.overdue > 0 ? "warn" : "default"}
            />
            <StatPill label="Completed" value={stats.done} />
          </div>
        )}

        {stats.overdue > 0 && !loading && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You have {stats.overdue} overdue item{stats.overdue === 1 ? "" : "s"} that still need{stats.overdue === 1 ? "s" : ""} attention.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MonthCalendar
              plans={plans}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {[
                  ["all", "All"],
                  ["planned", "Planned"],
                  ["in_progress", "In progress"],
                  ["done", "Done"],
                  ["skipped", "Skipped"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === key
                        ? "bg-pink-500 dark:bg-pink-600 text-white"
                        : "bg-card border border-border/60 text-muted-foreground hover:bg-[hsl(var(--muted))]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-pink-600 dark:text-pink-400 font-medium hover:underline"
                >
                  Showing {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · clear
                </button>
              )}
            </div>

            <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  No plans {filter !== "all" ? `for "${filter}"` : ""}
                  {selectedDate ? " on this day" : ""}.
                </p>
              ) : (
                filtered.map((plan) => {
                  const meta = STATUS_META[plan.status] || STATUS_META.planned;
                  const Icon = meta.icon;
                  const isOverdue =
                    plan.status !== "done" &&
                    plan.status !== "skipped" &&
                    eventDateFor(plan) &&
                    eventDateFor(plan) < todayStr;

                  return (
                    <div key={plan.id} className="group flex items-start gap-3 px-5 py-3.5">
                      <button
                        onClick={() => {
                          const order = ["planned", "in_progress", "done", "skipped"];
                          const next = order[(order.indexOf(plan.status) + 1) % order.length];
                          handleStatusChange(plan, next);
                        }}
                        className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${meta.chip}`}
                        title="Click to change status"
                      >
                        <Icon className={`w-4 h-4 ${meta.cls}`} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-medium truncate ${
                            plan.status === "done"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {plan.title}
                        </p>

                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {plan.week_start_date && (
                            <span>
                              Week of{" "}
                              {new Date(plan.week_start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {plan.due_date && (
                            <span className={isOverdue ? "text-rose-500 dark:text-rose-400 font-medium" : ""}>
                              {plan.week_start_date ? "· " : ""}
                              {isOverdue ? "Overdue" : "Due"}{" "}
                              {new Date(plan.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </p>

                        {plan.description && (
                          <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                        )}
                      </div>

                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-muted-foreground capitalize shrink-0">
                        {CATEGORY_LABELS[plan.category] || plan.category}
                      </span>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                          PRIORITY_CHIP[plan.priority] || PRIORITY_CHIP.medium
                        }`}
                      >
                        {plan.priority}
                      </span>

                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-opacity shrink-0"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {showForm && (
          <PlanForm
            defaultDate={selectedDate}
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

function PlanForm({ onClose, onSaved, defaultDate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    week_start_date: toDateString(getWeekStart()),
    category: "study",
    status: "planned",
    due_date: defaultDate || "",
    priority: "medium",
  });

  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400";

  const submit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.week_start_date) {
      return;
    }

    try {
      setSaving(true);
      await api.createWeeklyPlan({
        ...form,
        due_date: form.due_date || null,
      });
      onSaved();
    } catch (error) {
      console.error("Failed to create plan:", error);
      alert("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">New plan</h2>
            <p className="text-sm text-muted-foreground mt-1">Add an item to your planner.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <input
            className={inputCls}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className={inputCls}
            placeholder="Description (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Week start</label>
              <input
                type="date"
                className={inputCls}
                value={form.week_start_date}
                onChange={(e) => setForm({ ...form, week_start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Due date (optional)</label>
              <input
                type="date"
                className={inputCls}
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Priority</label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

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
              {saving ? "Saving…" : "Add plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}