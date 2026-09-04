import { getToken, signIn } from "@/lib/googleAuth";

// ── Entity layout: side-by-side blocks inside "Backend_Data" ──
const ENTITIES = {
  ClassSession: {
    tab: "Backend_Data", viewTab: "Schedule",
    startLetter: "A", endLetter: "L", flagLetter: "L", startCol: 0, endCol: 12,
    cols: ["id", "title", "type", "day_of_week", "start_time", "end_time", "location", "instructor", "color_tag", "is_recurring", "notes", "is_deleted"]
  },
  AttendanceRecord: {
    tab: "Backend_Data", viewTab: "Attendance",
    startLetter: "N", endLetter: "T", flagLetter: "T", startCol: 13, endCol: 20,
    cols: ["id", "class_session_id", "session_title", "date", "status", "notes", "is_deleted"]
  },
  WeeklyPlan: {
    tab: "Backend_Data", viewTab: "WeeklyPlan",
    startLetter: "V", endLetter: "AD", flagLetter: "AD", startCol: 21, endCol: 30,
    cols: ["id", "title", "description", "week_start_date", "category", "status", "due_date", "priority", "is_deleted"]
  }
};

const SID = { backend: 0, schedule: 1, attendance: 2, weeklyplan: 3 };
const COLORS = {
  header: { backgroundColor: { red: 0.31, green: 0.16, blue: 0.71 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } } },
  deletedBg: { red: 0.99, green: 0.80, blue: 0.82 },
  deletedFg: { red: 0.72, green: 0.11, blue: 0.11 },
};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function authedFetch(url, opts = {}) {
  let token = getToken();
  if (!token) token = await signIn();
  const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`);
  return res;
}

// ── Automatic spreadsheet creation ──
async function findExistingSheet() {
  const stored = localStorage.getItem("gs_spreadsheet_id");
  
  if (stored) {
    try {
      // Ask Google if the file exists AND if it is in the trash
      const res = await authedFetch(`https://www.googleapis.com/drive/v3/files/${stored}?fields=id,trashed`);
      const fileData = await res.json();
      
      // If the file is in the trash, throw an error to wipe it!
      if (fileData.trashed === true) {
        throw new Error("Ghost file is in the trash!");
      }
      
      return stored; // It's a good, active file. Keep using it.
    } catch (error) {
      console.log("Ghost sheet detected. Wiping memory...");
      localStorage.removeItem("gs_spreadsheet_id"); // Force wipe the memory
      sheetPromise = null; // Reset the lock
    }
  }

  // Search Drive for an existing active database
  const res = await authedFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name='Student Flow Tracker Data' and trashed=false")}&fields=files(id)`);
  const json = await res.json();
  if (json.files?.length) {
    localStorage.setItem("gs_spreadsheet_id", json.files[0].id);
    return json.files[0].id;
  }
  
  return null;
}

async function createSheet() {
  const createRes = await authedFetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { title: "Student Flow Tracker Data" }, sheets: [{ properties: { sheetId: SID.backend, title: "Backend_Data" } }] })
  });
  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;

  const requests = [
    { addSheet: { properties: { sheetId: SID.schedule, title: "Schedule" } } },
    { addSheet: { properties: { sheetId: SID.attendance, title: "Attendance" } } },
    { addSheet: { properties: { sheetId: SID.weeklyplan, title: "WeeklyPlan" } } },
  ];

  Object.values(ENTITIES).forEach(e => {
    requests.push({
      updateCells: {
        range: { sheetId: SID.backend, startRowIndex: 0, endRowIndex: 1, startColumnIndex: e.startCol, endColumnIndex: e.endCol },
        rows: [{ values: e.cols.map(c => ({ userEnteredValue: { stringValue: c } })) }],
        fields: "userEnteredValue"
      }
    });
    
    const viewTabId = e.viewTab.toLowerCase();
    requests.push({
      updateCells: {
        range: { sheetId: SID[viewTabId], startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
        rows: [{ values: [{ userEnteredValue: { formulaValue: `=QUERY(Backend_Data!${e.startLetter}:${e.endLetter}, "SELECT * WHERE ${e.flagLetter} = FALSE", 1)` } }] }],
        fields: "userEnteredValue"
      }
    });
    
    requests.push({
      repeatCell: {
        range: { sheetId: SID.backend, startRowIndex: 0, endRowIndex: 1, startColumnIndex: e.startCol, endColumnIndex: e.endCol },
        cell: { userEnteredFormat: COLORS.header },
        fields: "userEnteredFormat(backgroundColor,textFormat)"
      }
    });
    
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: SID.backend, startRowIndex: 1, startColumnIndex: e.startCol, endColumnIndex: e.endCol }],
          booleanRule: {
            condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=$${e.flagLetter}2=TRUE` }] },
            format: { backgroundColor: COLORS.deletedBg, textFormat: { foregroundColor: COLORS.deletedFg, strikethrough: true } }
          }
        }, index: 0
      }
    });
  });

  await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests })
  });

  localStorage.setItem("gs_spreadsheet_id", spreadsheetId);
  return spreadsheetId;
}

// Concurrency Lock: Prevents the app from trying to create 3 sheets at the exact same time on startup
let sheetPromise = null;
export async function ensureSheet() {
  if (sheetPromise) return sheetPromise;
  sheetPromise = (async () => {
    const existing = await findExistingSheet();
    if (existing) return existing;
    return await createSheet();
  })();
  return sheetPromise;
}

// ── CRUD Operations ──

const rowIndexCache = new Map(); 

async function findRowNumber(spreadsheetId, entity, id) {
  const e = ENTITIES[entity];
  const cached = rowIndexCache.get(`${entity}:${id}`);
  if (cached) return cached;

  const range = encodeURIComponent(`${e.tab}!${e.startLetter}:${e.startLetter}`);
  const res = await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`);
  const values = (await res.json()).values || [];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i]?.[0] === id) {
      rowIndexCache.set(`${entity}:${id}`, i + 1);
      return i + 1;
    }
  }
  throw new Error("Record not found");
}

async function listRows(entity) {
  const e = ENTITIES[entity];
  const spreadsheetId = await ensureSheet();
  
  const range = encodeURIComponent(`${e.viewTab}!A:Z`);
  const res = await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE`);
  const values = (await res.json()).values || [];
  
  if (values.length < 2) return [];
  const out = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || !row[0]) continue;
    const obj = {};
    // Restored exact original mapping to prevent React UI from crashing
    e.cols.forEach((c, idx) => { obj[c] = row[idx] != null ? row[idx] : ""; });
    out.push(obj);
  }
  return out;
}

async function createRow(entity, data) {
  const e = ENTITIES[entity];
  const spreadsheetId = await ensureSheet();
  const newId = uuid();

  const range1 = encodeURIComponent(`${e.tab}!${e.startLetter}:${e.startLetter}`);
  const colRes = await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range1}`);
  const nextRow = ((await colRes.json()).values?.length || 0) + 1;

  const rowValues = e.cols.map((c) => (c === "id" ? newId : c === "is_deleted" ? false : data?.[c] ?? ""));
  
  const range2 = encodeURIComponent(`${e.tab}!${e.startLetter}${nextRow}`);
  await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?valueInputOption=USER_ENTERED`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [rowValues] })
  });
  
  rowIndexCache.set(`${entity}:${newId}`, nextRow);
  return { id: newId, is_deleted: false, ...data };
}

async function updateRow(entity, id, data) {
  const e = ENTITIES[entity];
  const spreadsheetId = await ensureSheet();
  const rowNum = await findRowNumber(spreadsheetId, entity, id);

  const range1 = encodeURIComponent(`${e.tab}!${e.startLetter}${rowNum}:${e.endLetter}${rowNum}`);
  const existingRes = await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range1}?valueRenderOption=UNFORMATTED_VALUE`);
  const existingRow = (await existingRes.json()).values?.[0] || [];
  
  const merged = { id };
  e.cols.forEach((c, i) => { merged[c] = c === "id" ? id : (data[c] !== undefined ? data[c] : existingRow[i] ?? ""); });
  const rowValues = e.cols.map((c) => merged[c] ?? "");

  const range2 = encodeURIComponent(`${e.tab}!${e.startLetter}${rowNum}`);
  await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range2}?valueInputOption=USER_ENTERED`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [rowValues] }),
  });
  return merged;
}

async function deleteRow(entity, id) {
  const e = ENTITIES[entity];
  const spreadsheetId = await ensureSheet();
  const rowNum = await findRowNumber(spreadsheetId, entity, id);

  const range = encodeURIComponent(`${e.tab}!${e.flagLetter}${rowNum}`);
  await authedFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [[true]] }),
  });
  return { ok: true };
}

export const sheetsApi = { listRows, createRow, updateRow, deleteRow, ensureSheet };