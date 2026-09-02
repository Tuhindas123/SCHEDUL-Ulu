import React, { useState } from "react";
import { Download, Loader2, CloudUpload, Check, Share2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { api } from "@/api/apiClient";
import { supabase } from "@/lib/supabaseClient";
import { uploadToDrive } from "@/lib/googleDrive";

async function buildWorkbook() {
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
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scheduleRows), "Schedule");

  const attendanceRows = (attendance || []).map((a) => ({
    Session: a.session_title,
    Date: a.date,
    Status: a.status,
    Notes: a.notes,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceRows), "Attendance");

  const planRows = (plans || []).map((p) => ({
    Title: p.title,
    Description: p.description,
    "Week Start": p.week_start_date,
    Category: p.category,
    Status: p.status,
    "Due Date": p.due_date,
    Priority: p.priority,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planRows), "Weekly Plan");

  return wb;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const FILENAME = "flow-tracker-export.xlsx";

async function getGoogleAccessToken() {
  const { data } = await supabase.auth.getSession();
  const webToken = data?.session?.provider_token;
  if (webToken) return webToken;

  // Native fallback: captured from the OAuth deep-link redirect in App.jsx
  return localStorage.getItem("google_provider_token");
}

export default function ExportButton({ className = "" }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [driveStatus, setDriveStatus] = useState(""); // "", "ok", "failed"
  const [savedInfo, setSavedInfo] = useState(null); // { path, uri } after a successful native save
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const wb = await buildWorkbook();

      if (Capacitor.isNativePlatform()) {
        const wbArray = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const base64Data = arrayBufferToBase64(wbArray);

        const result = await Filesystem.writeFile({
          path: FILENAME,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        setSavedInfo({ path: `Documents/${FILENAME}`, uri: result.uri });
        setShowLocationPopup(true);
      } else {
        XLSX.writeFile(wb, FILENAME);
        setSavedInfo({ path: "Your browser's Downloads folder", uri: null });
        setShowLocationPopup(true);
      }
    } catch (error) {
      console.error("Local export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      let uri = savedInfo?.uri;

      // If nothing's been saved yet this session, build + save it first
      // so there's an actual file to share.
      if (!uri && Capacitor.isNativePlatform()) {
        const wb = await buildWorkbook();
        const wbArray = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const base64Data = arrayBufferToBase64(wbArray);
        const result = await Filesystem.writeFile({
          path: FILENAME,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });
        uri = result.uri;
        setSavedInfo({ path: `Documents/${FILENAME}`, uri });
      }

      if (Capacitor.isNativePlatform() && uri) {
        await Share.share({
          title: "Flow Tracker Export",
          url: uri,
          dialogTitle: "Share your export",
        });
      } else {
        alert("Sharing is only available in the app. Use Download on the web.");
      }
    } catch (error) {
      console.error("Share failed:", error);
      alert("Failed to share the file.");
    } finally {
      setSharing(false);
    }
  };

  const handleDriveUpload = async () => {
    setUploading(true);
    setDriveStatus("");
    try {
      const wb = await buildWorkbook();
      const accessToken = await getGoogleAccessToken();

      if (!accessToken) {
        setDriveStatus("failed");
        return;
      }

      const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileBlob = new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await uploadToDrive(fileBlob, FILENAME, accessToken);
      setDriveStatus("ok");
    } catch (error) {
      console.error("Drive upload failed:", error);
      setDriveStatus("failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? "Exporting…" : "Download"}
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {sharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {sharing ? "Preparing…" : "Share"}
        </button>

        <button
          onClick={handleDriveUpload}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-pink-500 text-white font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
          {uploading ? "Uploading…" : "Save to Drive"}
        </button>
      </div>

      {driveStatus === "ok" && (
        <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          Backed up to Google Drive
        </p>
      )}

      {driveStatus === "failed" && (
        <p className="text-xs text-muted-foreground mt-2">
          Drive backup failed. Try logging out and back in to reconnect.
        </p>
      )}

      {showLocationPopup && savedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 grid place-items-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              File saved
            </h2>
            <p className="text-sm text-muted-foreground mb-4 break-words">
              Saved to: <span className="font-medium text-foreground">{savedInfo.path}</span>
            </p>
            <button
              onClick={() => setShowLocationPopup(false)}
              className="w-full px-4 py-2.5 rounded-2xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
