import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/api/apiClient";

const STORAGE_KEY = "schedul-ulu:previewRole";
const ROLES = ["student", "teacher", "admin"];

const PreviewRoleContext = createContext(null);

/**
 * Wraps the app in a "real role" (from Supabase, via RLS) and an optional
 * "preview role" (local-only, admin-only) that lets an admin see what the
 * Student/Teacher/Admin UI looks like without signing in as a different
 * account. This NEVER touches Supabase auth or RLS — it only changes which
 * branch of the UI renders and which of the already-role-gated api calls
 * get used (e.g. getMySections vs listAllSections). A non-admin can't
 * escalate through this: the moment realRole isn't "admin", any stored
 * preview override is ignored and cleared.
 */
export function PreviewRoleProvider({ children }) {
  const [realRole, setRealRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewRole, setPreviewRoleState] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    api.getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        setRealRole(profile?.role || "student");
      })
      .catch(() => {
        if (!cancelled) setRealRole("student");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Only real admins get to preview as someone else. If a non-admin
  // somehow has a stale value in sessionStorage, wipe it.
  useEffect(() => {
    if (loading) return;
    if (realRole !== "admin" && previewRole) {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setPreviewRoleState(null);
    }
  }, [loading, realRole, previewRole]);

  const setPreviewRole = useCallback((role) => {
    if (role && !ROLES.includes(role)) return;
    setPreviewRoleState(role);
    try {
      if (role) sessionStorage.setItem(STORAGE_KEY, role);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  const canPreview = realRole === "admin";
  const effectiveRole = (canPreview && previewRole) ? previewRole : realRole;
  const isPreviewing = canPreview && !!previewRole && previewRole !== realRole;

  return (
    <PreviewRoleContext.Provider
      value={{
        loading,
        realRole,
        effectiveRole,
        canPreview,
        isPreviewing,
        previewRole: canPreview ? previewRole : null,
        setPreviewRole,
        clearPreview: () => setPreviewRole(null),
        roles: ROLES,
      }}
    >
      {children}
    </PreviewRoleContext.Provider>
  );
}

export function usePreviewRole() {
  const ctx = useContext(PreviewRoleContext);
  if (!ctx) throw new Error("usePreviewRole must be used inside a PreviewRoleProvider");
  return ctx;
}
