import React, { useEffect, useState } from "react";
import { Users, BookOpen, UserCheck, Clock3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/api/apiClient";
import { getSession, getStoredUser } from "@/lib/supabaseAuth";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/dashboard/StatCard";
import DateTimeCard from "@/components/dashboard/DateTimeCard";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";

export default function RoleDashboard() {
  const { effectiveRole } = usePreviewRole();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Teacher-facing data
  const [mySections, setMySections] = useState([]);
  const [rosterCounts, setRosterCounts] = useState({});

  // Admin-facing data
  const [profiles, setProfiles] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const session = await getSession();
        setUser(getStoredUser(session));

        if (effectiveRole === "teacher") {
          const sections = await api.getMySections();
          setMySections(sections || []);
          const counts = {};
          await Promise.all(
            (sections || []).map(async (s) => {
              const roster = await api.getRoster(s.id);
              counts[s.id] = roster?.length || 0;
            })
          );
          setRosterCounts(counts);
        }

        if (effectiveRole === "admin") {
          const [people, sections, directory] = await Promise.all([
            api.listAllProfiles(),
            api.listAllSections(),
            api.listRoleDirectory(),
          ]);
          setProfiles(people || []);
          setAllSections(sections || []);
          const activeEmails = new Set((people || []).map((p) => p.email).filter(Boolean));
          setPendingCount((directory || []).filter((d) => !activeEmails.has(d.email)).length);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [effectiveRole]);

  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const totalStudents = profiles.filter((p) => p.role === "student").length;
  const totalTeachers = profiles.filter((p) => p.role === "teacher").length;
  const totalEnrolled = Object.values(rosterCounts).reduce((sum, n) => sum + n, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
          <div className="max-w-xl">
            <h1 className="text-3xl font-heading font-bold text-foreground leading-tight">
              {greeting}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {effectiveRole === "admin"
                ? "Here's how the department looks today."
                : "Here's a look at your sections."}
            </p>
          </div>
          <DateTimeCard />
        </div>

        {effectiveRole === "teacher" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <StatCard icon={BookOpen} label="Your sections" value={mySections.length} tone="blue" />
              <StatCard icon={Users} label="Students enrolled" value={totalEnrolled} tone="mint" />
              <StatCard icon={UserCheck} label="Roll-call ready" value={mySections.length} sub="Tap a section to mark attendance" tone="pink" />
            </div>

            <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
              <p className="px-5 py-3.5 text-sm font-semibold text-foreground">Your sections</p>
              {mySections.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">No sections assigned yet.</p>
              ) : (
                mySections.map((s) => (
                  <Link
                    key={s.id}
                    to="/attendance"
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rosterCounts[s.id] ?? 0} student{(rosterCounts[s.id] ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </>
        )}

        {effectiveRole === "admin" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <StatCard icon={Users} label="Students" value={totalStudents} tone="blue" />
              <StatCard icon={UserCheck} label="Faculty" value={totalTeachers} tone="mint" />
              <StatCard icon={BookOpen} label="Sections" value={allSections.length} tone="yellow" />
              <StatCard icon={Clock3} label="Waiting for first login" value={pendingCount} tone="pink" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/admin"
                className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">People</p>
                <p className="text-xs text-muted-foreground mt-1">Manage roles &amp; add by email</p>
              </Link>
              <Link
                to="/admin"
                className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Sections</p>
                <p className="text-xs text-muted-foreground mt-1">Create sections, assign teachers</p>
              </Link>
              <Link
                to="/admin"
                className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-foreground">Enrollments</p>
                <p className="text-xs text-muted-foreground mt-1">Enroll students into sections</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}