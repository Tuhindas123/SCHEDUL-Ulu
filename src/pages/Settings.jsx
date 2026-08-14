import React, { useEffect, useState } from "react";
import { LogOut, User, Percent, Info } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { api } from "@/api/apiClient";
import { signOut, getStoredUser } from "@/lib/googleAuth";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [requiredPct, setRequiredPct] = useState(75);
  const user = getStoredUser();

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await api.getSyncSettings();
        setRequiredPct(settings?.[0]?.attendance_required_pct ?? 75);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    signOut();
    window.location.href = "/login";
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-lg space-y-4">
          {/* Profile */}
          <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 grid place-items-center">
                <User className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{user?.name || "Student"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Preferences</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-violet-500" />
                <span className="text-sm text-foreground">Required attendance</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{requiredPct}%</span>
            </div>
          </div>

          {/* About */}
          <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-muted-foreground">About</h2>
            </div>
            <p className="text-xs text-muted-foreground">Flow Tracker · v1.0</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </AppShell>
  );
}