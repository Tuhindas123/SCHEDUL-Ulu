import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "@/api/apiClient";
import { DAYS } from "@/lib/studentUtils";

const COLOR_KEYS = ["violet", "coral", "mint", "amber", "sky", "rose"];

const DAY_ALIASES = {
  mon: "monday", monday: "monday",
  tue: "tuesday", tues: "tuesday", tuesday: "tuesday",
  wed: "wednesday", weds: "wednesday", wednesday: "wednesday",
  thu: "thursday", thur: "thursday", thurs: "thursday", thursday: "thursday",
  fri: "friday", friday: "friday",
  sat: "saturday", saturday: "saturday",
  sun: "sunday", sunday: "sunday",
};

// Cells in a grid timetable that aren't an actual class.
const FILLER_LABELS = new Set([
  "floating slot",
  "class activity",
  "mentor mentee meeting",
  "open el",
  "open el/sip",
  "sip",
]);

function normalizeDay(raw) {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  return DAY_ALIASES[key] || (DAYS.includes(key) ? key : null);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Accepts "9:10 AM", "09:10", "9.10", Excel time serials, or Date objects
// and normalizes everything to 24-hour "HH:MM".
function normalizeTime(raw) {
  if (raw === null || raw === undefined || raw === "") return null;

  if (raw instanceof Date) {
    return `${pad2(raw.getHours())}:${pad2(raw.getMinutes())}`;
  }

  if (typeof raw === "number") {
    // Excel stores times as a fraction of a 24-hour day
    const totalMinutes = Math.round(raw * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${pad2(h)}:${pad2(m)}`;
  }

  const str = String(raw).trim().toLowerCase();
  const match = str.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/);
  if (!match) return null;

  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);

  if (period === "pm" && h !== 12) h += 12;
  if (period === "am" && h === 12) h = 0;

  if (h > 23 || m > 59) return null;
  return `${pad2(h)}:${pad2(m)}`;
}

function findColumn(headerRow, candidates) {
  const normalized = headerRow.map((h) => String(h || "").trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h === candidate);
    if (idx !== -1) return idx;
  }
  // fallback: partial match
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function findClassColumn(headerRow) {
  return findColumn(headerRow, ["class", "section", "cohort", "batch", "group", "semester"]);
}

// ---- Grid-timetable helpers -------------------------------------------
//
// A grid timetable (the kind a college issues) has one column per period,
// headed by a bare "H.MM-H.MM" range with no AM/PM marker — e.g.
// "9.10-10.10", "12.30-1.30", "2.30-3.30". We resolve those to 24-hour
// time by walking the periods left to right and always picking the next
// time strictly at or after the previous one, since a timetable's periods
// never run backwards within a day.

function parseTimeRangeHeader(raw) {
  const str = String(raw || "").trim();
  const m = str.match(/^(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})$/);
  if (!m) return null;
  return {
    startH: parseInt(m[1], 10),
    startM: parseInt(m[2], 10),
    endH: parseInt(m[3], 10),
    endM: parseInt(m[4], 10),
  };
}

function resolveAscending(hour, minute, prevMinutes) {
  const base = hour % 12;
  const am = base * 60 + minute;
  const pm = (base + 12) * 60 + minute;
  const candidates = [am, pm].filter((v) => v >= prevMinutes);
  return candidates.length ? Math.min(...candidates) : Math.max(am, pm);
}

function minutesToHHMM(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

// Scans the header row for period columns and returns them in order with
// resolved 24-hour start/end times. Returns [] if the header doesn't look
// like a grid timetable.
function buildTimeSlots(headerRow) {
  const slots = [];
  let prevMinutes = 0;
  for (let col = 0; col < headerRow.length; col++) {
    const parsed = parseTimeRangeHeader(headerRow[col]);
    if (!parsed) continue;
    const startMinutes = resolveAscending(parsed.startH, parsed.startM, prevMinutes);
    prevMinutes = startMinutes;
    const endMinutes = resolveAscending(parsed.endH, parsed.endM, prevMinutes);
    prevMinutes = endMinutes;
    slots.push({ col, start: minutesToHHMM(startMinutes), end: minutesToHHMM(endMinutes) });
  }
  return slots;
}

// A grid cell can hold one class, or several elective options separated
// by "/" (often with a line break before the next option).
function splitCellOptions(raw) {
  if (raw === null || raw === undefined) return [];
  const cleaned = String(raw).replace(/\r?\n/g, "").trim();
  if (!cleaned) return [];
  return cleaned.split("/").map((s) => s.trim()).filter(Boolean);
}

// A grid cell's option is usually "CODE (Instructor)" — pull both apart.
function parseSubjectCell(text) {
  const m = text.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  if (m) return { subject: m[1].trim(), instructor: m[2].trim() };
  return { subject: text.trim(), instructor: "" };
}

function downloadTemplate() {
  const rows = [
    ["Day", "Subject", "Start Time", "End Time", "Location"],
    ["Monday", "Data Structures", "09:00", "10:00", "Room 204"],
    ["Monday", "Physics Lab", "10:15", "12:00", "Lab 3"],
    ["Wednesday", "Data Structures", "09:00", "10:00", "Room 204"],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Timetable");
  XLSX.writeFile(workbook, "schedul-ulu-timetable-template.xlsx");
}

// ---- Import routines ----------------------------------------------------

async function importFlatRows(rows, header, subjects) {
  const dayCol = findColumn(header, ["day", "day of week"]);
  const subjectCol = findColumn(header, ["subject", "class", "title", "course"]);
  const startCol = findColumn(header, ["start time", "start", "from"]);
  const endCol = findColumn(header, ["end time", "end", "to"]);
  const locationCol = findColumn(header, ["location", "room", "venue"]);

  if (dayCol === -1 || subjectCol === -1 || startCol === -1 || endCol === -1) {
    return {
      added: 0,
      skipped: [{
        row: 0,
        reason: "Couldn't find Day, Subject, Start Time, and End Time columns. Use the template for the right headers.",
      }],
    };
  }

  const subjectMap = new Map(subjects.map((s) => [s.name.trim().toLowerCase(), s]));
  const colorForSubject = new Map();
  let colorCursor = 0;
  const skipped = [];
  let added = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell) => cell === "" || cell === undefined)) continue;

    const dayRaw = row[dayCol];
    const subjectName = String(row[subjectCol] || "").trim();
    const startRaw = row[startCol];
    const endRaw = row[endCol];
    const location = locationCol !== -1 ? String(row[locationCol] || "").trim() : "";

    const day = normalizeDay(dayRaw);
    const start = normalizeTime(startRaw);
    const end = normalizeTime(endRaw);

    if (!subjectName) {
      skipped.push({ row: i + 1, reason: "Missing subject name." });
      continue;
    }
    if (!day) {
      skipped.push({ row: i + 1, reason: `Unrecognized day: "${dayRaw}".` });
      continue;
    }
    if (!start || !end) {
      skipped.push({ row: i + 1, reason: "Unrecognized start or end time." });
      continue;
    }

    try {
      const key = subjectName.toLowerCase();
      let subject = subjectMap.get(key);
      if (!subject) {
        subject = await api.createSubject(subjectName);
        subjectMap.set(key, subject);
      }

      if (!colorForSubject.has(subject.id)) {
        colorForSubject.set(subject.id, COLOR_KEYS[colorCursor % COLOR_KEYS.length]);
        colorCursor++;
      }

      await api.createClassSession({
        subject_id: subject.id,
        title: subjectName,
        type: "lecture",
        day_of_week: day,
        start_time: start,
        end_time: end,
        location,
        instructor: "",
        color_tag: colorForSubject.get(subject.id),
        is_recurring: true,
        notes: "",
      });

      added++;
    } catch (err) {
      console.error("Failed to import row", i + 1, err);
      skipped.push({ row: i + 1, reason: "Failed to save — please retry this row manually." });
    }
  }

  return { added, skipped };
}

async function importGridRows(gridRows, slots, subjects, selectedClass, classCol) {
  const subjectMap = new Map(subjects.map((s) => [s.name.trim().toLowerCase(), s]));
  const colorForSubject = new Map();
  let colorCursor = 0;
  const skipped = [];
  let added = 0;

  const relevantRows = classCol === -1 ? gridRows : gridRows.filter((r) => r.className === selectedClass);

  for (const { index, day, row } of relevantRows) {
    if (!day) {
      skipped.push({ row: index + 1, reason: "Couldn't determine the day for this row." });
      continue;
    }

    for (const slot of slots) {
      const options = splitCellOptions(row[slot.col]);
      if (options.length === 0) continue;

      for (const optionText of options) {
        if (FILLER_LABELS.has(optionText.toLowerCase())) continue;

        const { subject: subjectName, instructor } = parseSubjectCell(optionText);
        if (!subjectName) continue;

        try {
          const key = subjectName.toLowerCase();
          let subject = subjectMap.get(key);
          if (!subject) {
            subject = await api.createSubject(subjectName);
            subjectMap.set(key, subject);
          }

          if (!colorForSubject.has(subject.id)) {
            colorForSubject.set(subject.id, COLOR_KEYS[colorCursor % COLOR_KEYS.length]);
            colorCursor++;
          }

          await api.createClassSession({
            subject_id: subject.id,
            title: subjectName,
            type: "lecture",
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
            location: "",
            instructor,
            color_tag: colorForSubject.get(subject.id),
            is_recurring: true,
            notes: options.length > 1 ? `Elective slot — choose one: ${options.join(", ")}` : "",
          });

          added++;
        } catch (err) {
          console.error("Failed to import grid cell", index + 1, slot.col, err);
          skipped.push({ row: index + 1, reason: `Failed to save "${subjectName}" — please retry manually.` });
        }
      }
    }
  }

  return { added, skipped };
}

export default function TimetableUpload({ subjects, onImported, onClose }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { added, skipped: [{row, reason}] }
  const [pendingGrid, setPendingGrid] = useState(null); // grid file awaiting class/section choice

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setResult(null);
    setPendingGrid(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (rows.length < 2) {
        setResult({ added: 0, skipped: [{ row: 0, reason: "The file has no data rows." }] });
        return;
      }

      const header = rows[0];
      const slots = buildTimeSlots(header);

      if (slots.length >= 2) {
        // Grid-style timetable: bare period headers like "9.10-10.10",
        // a Day column that's only filled on each day's first row, and
        // (usually) a Class/section column listing several cohorts.
        const dayCol = findColumn(header, ["day", "day of week"]);
        if (dayCol === -1) {
          setResult({ added: 0, skipped: [{ row: 0, reason: "Couldn't find a Day column in this grid timetable." }] });
          return;
        }
        const classCol = findClassColumn(header);

        let currentDay = null;
        const gridRows = [];
        const classSet = new Set();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every((cell) => cell === "" || cell === undefined)) continue;

          const dayRaw = row[dayCol];
          if (String(dayRaw || "").trim() !== "") currentDay = normalizeDay(dayRaw);

          const className = classCol !== -1 ? String(row[classCol] || "").trim() : "";
          if (className) classSet.add(className);

          gridRows.push({ index: i, day: currentDay, className, row });
        }

        const classes = Array.from(classSet);

        if (classes.length <= 1) {
          // Nothing to disambiguate — import straight away.
          const outcome = await importGridRows(gridRows, slots, subjects, classes[0] || null, classCol);
          setResult(outcome);
          if (outcome.added > 0) onImported?.();
        } else {
          // Multiple cohorts share this sheet — ask which one is theirs.
          setPendingGrid({ gridRows, slots, classCol, classes, selectedClass: classes[0] });
        }
        return;
      }

      // Flat one-row-per-session format.
      const outcome = await importFlatRows(rows, header, subjects);
      setResult(outcome);
      if (outcome.added > 0) onImported?.();
    } catch (err) {
      console.error("Failed to parse timetable file:", err);
      setResult({ added: 0, skipped: [{ row: 0, reason: "Couldn't read this file. Make sure it's .xlsx, .xls, or .csv." }] });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmGridImport = async () => {
    if (!pendingGrid) return;
    setBusy(true);
    try {
      const outcome = await importGridRows(
        pendingGrid.gridRows,
        pendingGrid.slots,
        subjects,
        pendingGrid.selectedClass,
        pendingGrid.classCol
      );
      setResult(outcome);
      setPendingGrid(null);
      if (outcome.added > 0) onImported?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">Upload timetable</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We'll auto-create subjects and fill your schedule.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Download template (.xlsx)
          </button>

          <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-2xl border-2 border-dashed border-border cursor-pointer hover:bg-muted transition-colors text-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {busy ? "Importing…" : "Choose your filled-in timetable"}
            </span>
            <span className="text-xs text-muted-foreground">.xlsx, .xls, or .csv — either your own list, or a full college-issued timetable</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              disabled={busy}
              className="hidden"
            />
          </label>

          {pendingGrid && (
            <div className="rounded-2xl bg-[hsl(var(--muted))] p-4 space-y-3">
              <p className="text-sm text-foreground">
                This timetable covers multiple classes/sections. Which one is yours?
              </p>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={pendingGrid.selectedClass}
                onChange={(e) => setPendingGrid({ ...pendingGrid, selectedClass: e.target.value })}
              >
                {pendingGrid.classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingGrid(null)}
                  className="px-3 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmGridImport}
                  disabled={busy}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {busy ? "Importing…" : "Import my classes"}
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-2xl bg-[hsl(var(--muted))] p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {result.added} class{result.added === 1 ? "" : "es"} added
              </div>
              {result.skipped.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-border/60">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                    {result.skipped.map((s, i) => (
                      <li key={i}>
                        {s.row > 0 ? `Row ${s.row}: ` : ""}
                        {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            {result ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
