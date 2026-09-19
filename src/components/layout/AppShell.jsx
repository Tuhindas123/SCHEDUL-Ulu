import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  ListTodo,
  Settings,
  Grid,
  ShieldCheck,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";
import { PreviewRoleSwitcher, PreviewRoleBanner } from "@/components/layout/PreviewRoleSwitcher";

const THEMES = {
  student: {
    bg: "bg-yellow-50 dark:bg-background",
    sidebar: "bg-white dark:bg-card border-yellow-200 dark:border-border",
    accent: "bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700",
    active: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    text: "text-slate-700 dark:text-foreground/80",
    accentIcon: "text-pink-500 dark:text-pink-400",
    borderRadius: "rounded-3xl",
    font: "font-medium",
    logoBg: "bg-pink-500 dark:bg-pink-600"
  },
  teacher: {
    bg: "bg-slate-50 dark:bg-background",
    sidebar: "bg-white dark:bg-card border-slate-200 dark:border-border",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
    active: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    text: "text-slate-600 dark:text-foreground/70",
    accentIcon: "text-indigo-600 dark:text-indigo-400",
    borderRadius: "rounded-2xl",
    font: "font-normal",
    logoBg: "bg-indigo-600 dark:bg-indigo-500"
  },
  admin: {
    bg: "bg-slate-100 dark:bg-background",
    sidebar: "bg-slate-900 text-slate-300 border-slate-800 dark:bg-sidebar-background dark:text-sidebar-foreground dark:border-sidebar-border",
    accent: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    active: "bg-blue-500 text-white dark:bg-blue-600",
    text: "text-slate-400 dark:text-sidebar-foreground/70",
    accentIcon: "text-blue-400 dark:text-blue-300",
    borderRadius: "rounded-lg",
    font: "font-normal",
    logoBg: "bg-blue-600 dark:bg-blue-500"
  }
};

function navGroups(role) {
  return [
    {
      section: "Main",
      items: [{ to: "/", label: "Home", icon: LayoutDashboard, end: true }],
    },
    {
      section: "Academics",
      items: [
        { to: "/schedule", label: "Schedule", icon: CalendarDays },
        { to: "/attendance", label: "Attendance", icon: CheckSquare },
        { to: "/weekly-plan", label: "Planning", icon: ListTodo },
        { to: "/assignments", label: "Assignments", icon: FileText },
        { to: "/materials", label: "Materials", icon: FileText },
        { to: "/leave", label: "Leave", icon: FileText },
      ],
    },
    ...(role === "teacher" || role === "admin"
      ? [{ section: "Administration", items: [{ to: "/admin", label: "Admin Panel", icon: ShieldCheck }] }]
      : []),
    {
      section: null,
      items: [{ to: "/settings", label: "Settings", icon: Settings }],
    },
  ];
}

function SidebarLink({ to, label, icon: Icon, end, theme }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 ${theme.borderRadius} text-sm transition-all ${
          isActive
            ? theme.active
            : `${theme.text} hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-foreground`
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 ${isActive ? theme.accentIcon : "text-slate-400 dark:text-muted-foreground"}`} />
          <span className={theme.font}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function DrawerLink({ to, label, icon: Icon, end, onNavigate, theme }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 ${theme.borderRadius} text-sm transition-colors ${
          isActive
            ? theme.active
            : `${theme.text} hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-foreground`
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 ${isActive ? theme.accentIcon : "text-slate-400 dark:text-muted-foreground"}`} />
          <span className={theme.font}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { effectiveRole } = usePreviewRole();

  const theme = THEMES[effectiveRole] || THEMES.teacher;
  const NAV_GROUPS = navGroups(effectiveRole);

  return (
    <div
      className={`min-h-screen min-h-[100dvh] w-full ${theme.bg} font-sans text-slate-900 dark:text-foreground transition-colors duration-300`}
    >
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto lg:gap-0 lg:p-0 min-h-screen min-h-[100dvh]">
        <aside
          className={`hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen lg:sticky lg:top-0 shrink-0 ${theme.sidebar} border-r transition-all`}
        >
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${theme.borderRadius} ${theme.logoBg} text-white grid place-items-center shadow-sm`}>
                <Grid className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-slate-900 dark:text-foreground leading-tight text-lg">Schedul-Ulu</p>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium uppercase tracking-wider">
                  University ERP
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-3 pb-4 space-y-6">
            {NAV_GROUPS.map((group, i) => (
              <div key={group.section || `group-${i}`} className="space-y-1">
                {group.section && (
                  <p className="px-4 pb-2 text-[11px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-widest">
                    {group.section}
                  </p>
                )}
                <nav className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <SidebarLink key={item.to} {...item} theme={theme} />
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-border space-y-4">
            <PreviewRoleSwitcher />
            <div
              className={`rounded-2xl bg-white/50 dark:bg-white/5 p-4 border border-slate-100 dark:border-border ${theme.borderRadius}`}
            >
              <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                Institutional access enabled for {effectiveRole}.
              </p>
            </div>
            <Link
              to="/privacy"
              className="block text-center text-[11px] text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground transition-colors py-2"
            >
              Privacy Policy
            </Link>
          </div>
        </aside>

        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-card border-b border-slate-200 dark:border-border">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${theme.borderRadius} ${theme.logoBg} text-white grid place-items-center`}>
              <Grid className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 dark:text-foreground text-sm">Schedul-Ulu</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-foreground" />
          </button>
        </header>

        <main className="flex-1 min-w-0 px-4 lg:px-8 pb-8 pt-6 lg:pt-8">
          <PreviewRoleBanner />
          {children}
        </main>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative w-[80%] max-w-xs h-full bg-white dark:bg-card border-l border-slate-200 dark:border-border overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-6">
                <p className="font-bold text-slate-900 dark:text-foreground text-lg">Menu</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-foreground" />
                </button>
              </div>

              <div className="px-3 pb-4">
                {NAV_GROUPS.map((group, i) => (
                  <div key={group.section || `mgroup-${i}`} className="mb-6">
                    {group.section && (
                      <p className="px-4 pb-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-muted-foreground">
                        {group.section}
                      </p>
                    )}
                    <nav className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <DrawerLink
                          key={item.to}
                          {...item}
                          onNavigate={() => setMenuOpen(false)}
                          theme={theme}
                        />
                      ))}
                    </nav>
                  </div>
                ))}
              </div>

              <div className="px-6 py-6 border-t border-slate-100 dark:border-border">
                <PreviewRoleSwitcher />
              </div>

              <div className="px-6 pb-8 text-center">
                <Link
                  to="/privacy"
                  onClick={() => setMenuOpen(false)}
                  className="text-[11px] text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground transition-colors"
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