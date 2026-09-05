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
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto lg:gap-6 lg:p-6">
        {/* Sidebar — desktop only, floats as a dark rounded card like the reference */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-[calc(100vh-3rem)] lg:sticky lg:top-6 shrink-0 rounded-[2rem] bg-sidebar text-sidebar-foreground overflow-hidden">
          <div className="px-6 pt-7 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-pastelPink text-pastelPink-foreground grid place-items-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-white leading-tight">Schedul-Ulu</p>
                <p className="text-[11px] text-sidebar-foreground/60 leading-tight">your week, in colour</p>
              </div>
            </div>
          </div>

          <p className="px-6 pt-2 pb-2 text-[11px] font-semibold text-sidebar-foreground/40">General</p>

          <nav className="flex flex-col gap-1 px-4 pb-4">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span>{label}</span>
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-pastelPink transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-sidebar-foreground/60 leading-snug">
                Keep your attendance on track, one class at a time.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile top bar — app-like, sticky */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 px-4 py-3 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-border/60">
          <div className="w-8 h-8 rounded-xl bg-sidebar text-white grid place-items-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-heading font-bold text-foreground text-sm">Schedul-Ulu</p>
        </header>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 lg:px-0 pb-24 lg:pb-8 pt-4 lg:pt-0">
          {children}
        </main>

        {/* Mobile bottom tab bar — app-like */}
        <nav
          className="lg:hidden fixed bottom-3 inset-x-3 z-50 bg-sidebar rounded-3xl flex justify-around px-2 py-1"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 6px)" }}
        >
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? "text-white" : "text-sidebar-foreground/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-9 h-6 rounded-full grid place-items-center transition-colors ${
                      isActive ? "bg-white/10" : ""
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
