import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarDays, CheckSquare, ListTodo, Settings, Sparkles } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/attendance", label: "Attend", icon: CheckSquare },
  { to: "/weekly-plan", label: "Plan", icon: ListTodo },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block lg:w-64 lg:min-h-screen lg:sticky lg:top-0 shrink-0">
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-violet-500 text-white grid place-items-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground leading-tight">Flow Tracker</p>
                <p className="text-[11px] text-muted-foreground leading-tight">your week, in colour</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-4 pb-4 pt-2">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "text-muted-foreground hover:bg-violet-100/60 hover:text-violet-700"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile top bar — app-like, sticky */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 px-4 py-3 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-border/60">
          <div className="w-8 h-8 rounded-xl bg-violet-500 text-white grid place-items-center shadow-md shadow-violet-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-heading font-bold text-foreground text-sm">Flow Tracker</p>
        </header>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 lg:px-8 pb-24 lg:pb-16 pt-4 lg:pt-8">
          {children}
        </main>

        {/* Mobile bottom tab bar — app-like */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[hsl(var(--background))]/95 backdrop-blur-md border-t border-border/60 flex justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? "text-violet-600" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-6 rounded-full grid place-items-center transition-colors ${
                      isActive ? "bg-violet-100" : ""
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
