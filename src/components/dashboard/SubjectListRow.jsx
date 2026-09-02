import React from "react";
import { Link } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";
import { attendanceStatus } from "@/lib/studentUtils";

const TONE_CLS = {
  good: "bg-teal-100 text-teal-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function SubjectListRow({ subjectKey, title, pct, required }) {
  const { tone } = attendanceStatus(pct, required);

  return (
    <Link
      to={`/attendance/${encodeURIComponent(subjectKey)}`}
      className="flex items-center justify-between gap-4 rounded-2xl bg-card border border-border/60 shadow-sm p-4 hover:border-violet-200 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 grid place-items-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <p className="font-medium text-foreground truncate">{title}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${TONE_CLS[tone]}`}>
          {pct}%
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
