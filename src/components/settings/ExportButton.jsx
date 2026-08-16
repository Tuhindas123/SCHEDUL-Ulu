import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { api } from "@/api/apiClient";

// Pulls Schedule, Attendance, and Weekly Plan from Supabase and downloads
// them as a single .xlsx workbook (one tab per data type) — opens straight
// in Excel, Google Sheets, or Numbers for easy reading/filtering.
export default function ExportButton({ className = "" }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [sessions, attendance, plans] = await Promise.all([
        api.getClassSessions(),
        api.getAttendanceRecords(),
        api.getWeeklyPlans(),
      ]);

      const wb = XLSX.utils.book_new();

      const scheduleRows = (sessions || []).map((s) => ({
        Title: s.title,
        Type: s.type,
        Day: s.day_of_week,
        "Start Time": s.start_time,
        "End Time": s.end_time,
        Location: s.location,
        Instructor: s.instructor,
        Recurring: s.is_recurring ? "Yes" : "No",
        Notes: s.notes,
      }));
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(scheduleRows),
        "Schedule"
      );

      const attendanceRows = (attendance || []).map((a) => ({
        Session: a.session_title,
        Date: a.date,
        Status: a.status,
        Notes: a.notes,
      }));
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(attendanceRows),
        "Attendance"
      );

      const planRows = (plans || []).map((p) => ({
        Title: p.title,
        Description: p.description,
        "Week Start": p.week_start_date,
        Category: p.category,
        Status: p.status,
        "Due Date": p.due_date,
        Priority: p.priority,
      }));
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(planRows),
        "Weekly Plan"
      );

      const filename = `flow-tracker-export-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors ${className}`}
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {exporting ? "Exporting…" : "Export to Excel"}
    </button>
  );
}
