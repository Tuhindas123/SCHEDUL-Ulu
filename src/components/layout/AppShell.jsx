import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  ListTodo,
  Settings,
  Sparkles,
  UtensilsCrossed,
  Menu,
  AlignLeft,
  X,
} from "lucide-react";

// Shared grouped nav — used by both the desktop sidebar and the
// mobile slide-out menu. Add new items to an existing group, or add
// a new { section: "Name", items: [...] } block for a new group.
const NAV_GROUPS = [
  {
    section: "General",
    items: [{ to: "/", label: "Home", icon: LayoutDashboard, end: true }],
  },
  {
    section: "Academics",
    items: [
      { to: "/schedule", label: "Schedule", icon: CalendarDays },
      { to: "/attendance", label: "Attend", icon: CheckSquare },
      { to: "/weekly-plan", label: "Plan", icon: ListTodo },
    ],
  },
  {
    section: "Essentials",
    items: [
      { to: "/restaurants", label: "Eats", icon: UtensilsCrossed },
      // Add future items here, e.g.:
      // { to: "/medicines", label: "Medicines", icon: Pill },
    ],
  },
  {
    section: null,
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
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
  );
}

// Mobile slide-out row — plain text list, Supabase-panel style:
// no rounded pill, thin bottom border feel via parent spacing.
function DrawerLink({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
          isActive
            ? "bg-white/10 text-white font-medium"
            : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon className="w-[17px] h-[17px] shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto lg:gap-6 lg:p-6">
        {/* Sidebar — desktop only */}
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

          <div className="flex-1 px-4 pb-4 space-y-5">
            {NAV_GROUPS.map((group, i) => (
              <div key={group.section || `group-${i}`}>
                {group.section && (
                  <p className="px-3.5 pt-2 pb-2 text-[11px] font-semibold text-sidebar-foreground/40">
                    {group.section}
                  </p>
                )}
                <nav className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <SidebarLink key={item.to} {...item} />
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-sidebar-foreground/60 leading-snug">
                Keep your attendance on track, one class at a time.
              </p>
            </div>
            <Link
              to="/privacy"
              className="block text-center text-[11px] text-sidebar-foreground/35 hover:text-sidebar-foreground/60 transition-colors py-1"
            >
              Privacy Policy
            </Link>
          </div>
        </aside>

        {/* Mobile top bar — sticky, with hamburger trigger */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 px-4 py-3 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-border/60">
  <button
    type="button"
    onClick={() => setMenuOpen(true)}
    className="p-2 rounded-xl hover:bg-muted transition-colors"
    aria-label="Open menu"
  >
    <AlignLeft className="w-5 h-5 text-foreground" />
  </button>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-xl bg-sidebar text-white grid place-items-center">
      <Sparkles className="w-4 h-4" />
    </div>
    <p className="font-heading font-bold text-foreground text-sm">Schedul-Ulu</p>
  </div>
</header>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 lg:px-0 pb-8 pt-4 lg:pt-0">
          {children}
        </main>

        {/* Mobile slide-out menu — Supabase-panel style: dark bg,
            small uppercase section labels, thin dividers between groups */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-start">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative w-[78%] max-w-xs h-full bg-sidebar text-sidebar-foreground overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-5">
                <p className="font-heading font-bold text-white">Menu</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="px-3 pb-4">
                {NAV_GROUPS.map((group, i) => (
                  <div key={group.section || `mgroup-${i}`}>
                    {i > 0 && <div className="my-3 border-t border-white/10" />}
                    {group.section && (
                      <p className="px-4 pt-1 pb-2 text-[10px] font-semibold tracking-wide uppercase text-sidebar-foreground/40">
                        {group.section}
                      </p>
                    )}
                    <nav className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <DrawerLink
                          key={item.to}
                          {...item}
                          onNavigate={() => setMenuOpen(false)}
                        />
                      ))}
                    </nav>
                  </div>
                ))}
              </div>

              <div className="mt-auto px-4 py-4 border-t border-white/10">
                <Link
                  to="/privacy"
                  onClick={() => setMenuOpen(false)}
                  className="block text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors py-1"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
