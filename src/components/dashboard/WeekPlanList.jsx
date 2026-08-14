import React from "react";
import { Check, Circle, Loader2, SkipForward } from "lucide-react";
import { toDateString, getWeekStart } from "@/lib/studentUtils";

const STATUS_META = {
  planned: { icon: Circle, cls: "text-slate-400", label: "Planned" },
  in_progress: { icon: Loader2, cls: "text-amber-500", label: "In progress" },
  done: { icon: Check, cls: "text-teal-500", label: "Done" },
  skipped: { icon: SkipForward, cls: "text-rose-400", label: "Skipped" }
};

export default function WeekPlanList({ plans, title = "This Week's Plan" }) {
  const weekStart = toDateString(getWeekStart());
  const weekPlans = plans.filter((p) => p.week_start_date === weekStart);
  return (
    <div className="rounded-3xl bg-card p-6 border border-border/60 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{weekPlans.length} item{weekPlans.length !== 1 ? "s" : ""}</span>
      </div>
      {weekPlans.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No plans for this week yet. Add some on the Weekly Plan page.</p>
      ) : (
        <ul className="space-y-2.5">
          {weekPlans.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.planned;
            const Icon = meta.icon;
            return (
              <li key={p.id} className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--muted))] px-4 py-3">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.cls}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${p.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{p.title}</p>
                  {p.description && <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>}
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-background text-muted-foreground capitalize shrink-0">{p.category}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}