import React from "react";
import { Eye, X } from "lucide-react";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";

const LABEL = { student: "Student", teacher: "Teacher", admin: "Admin" };

// Small segmented control — only ever rendered for real admins.
// Sits in the sidebar/drawer so it's visible wherever you are in the app.
export function PreviewRoleSwitcher({ className = "" }) {
  const { canPreview, effectiveRole, setPreviewRole } = usePreviewRole();
  if (!canPreview) return null;

  return (
    <div className={className}>
      <p className="px-1 pb-1.5 text-[10px] font-semibold tracking-wide uppercase text-sidebar-foreground/40 flex items-center gap-1.5">
        <Eye className="w-3 h-3" /> Preview as
      </p>
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {["student", "teacher", "admin"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setPreviewRole(r === "admin" ? null : r)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
              effectiveRole === r
                ? "bg-pastelPink text-pastelPink-foreground"
                : "text-sidebar-foreground/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {LABEL[r]}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sticky banner shown on every page while previewing as someone else,
// with a one-tap way back to your real admin view.
export function PreviewRoleBanner() {
  const { isPreviewing, previewRole, clearPreview } = usePreviewRole();
  if (!isPreviewing) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 mb-3 rounded-2xl bg-amber-100 text-amber-900 text-sm">
      <span className="flex items-center gap-1.5 font-medium">
        <Eye className="w-4 h-4" />
        Previewing as {LABEL[previewRole]} — you're still logged in as admin.
      </span>
      <button
        type="button"
        onClick={clearPreview}
        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-200 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" /> Exit preview
      </button>
    </div>
  );
}
