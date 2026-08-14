import React, { useEffect, useState } from "react";
import { Trash2, X, Check, Circle, Loader2, SkipForward } from "lucide-react";
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
  planned: { icon: Circle, cls: "text-slate-400", chip: "bg-slate-100 text-slate-600", label: "Planned" },
  in_progress: { icon: Loader2, cls: "text-amber-500", chip: "bg-amber-100 text-amber-700", label: "In progress" },
  done: { icon: Check, cls: "text-teal-500", chip: "bg-teal-100 text-teal-700", label: "Done" },
  skipped: { icon: SkipForward, cls: "text-rose-400", chip: "bg-rose-100 text-rose-700", label: "Skipped" },
};

const PRIORITY_CHIP = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

export default function WeeklyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

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

  const filtered =
    filter === "all" ? plans : plans.filter((p) => p.status === filter);

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
            <h1 className="text-2xl font-semibold text-foreground">Weekly Plan</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track what you plan to do this week.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:bg-violet-600 transition-colors"
          >
            <span className="text-lg">+</span>
            Add plan
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3 flex-wrap">
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
                      ? "bg-violet-500 text-white"
                      : "bg-card border border-border/60 text-muted-foreground hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  No plans {filter !== "all" ? `for "${filter}"` : ""} yet.
                </p>
              ) : (
                filtered.map((plan) => {
                  const meta = STATUS_META[plan.status] || STATUS_META.planned;
                  const Icon = meta.icon;

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

                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.week_start_date
                            ? `Week of ${new Date(plan.week_start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`
                            : ""}
                          {plan.due_date
                            ? ` · Due ${new Date(plan.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`
                            : ""}
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
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity shrink-0"
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

function PlanForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    week_start_date: toDateString(getWeekStart()),
    category: "study",
    status: "planned",
    due_date: "",
    priority: "medium",
  });

  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

  const submit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.week_start_date) {
      return;
    }

    try {
      setSaving(true);
      await api.createWeeklyPlan(form);
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
            <p className="text-sm text-muted-foreground mt-1">Add an item to your weekly plan.</p>
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
              className="px-4 py-2.5 rounded-2xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Add plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}