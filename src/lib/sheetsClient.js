import { getToken, signIn } from "@/lib/googleAuth";

const HEADERS = {
  ClassSession: { tab: "Schedule", cols: ["id", "title", "type", "day_of_week", "start_time", "end_time", "location", "instructor", "color_tag", "is_recurring", "notes"] },
  AttendanceRecord: { tab: "Attendance", cols: ["id", "class_session_id", "session_title", "date", "status", "notes"] },
  WeeklyPlan: { tab: "WeeklyPlan", cols: ["id", "title", "description", "week_start_date", "category", "status", "due_date", "priority"] },
};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function authedFetch(url, opts = {}) {
  let token = getToken();
  if (!token) token = await signIn();
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sheets API error: ${res.status} ${text}`);
  }
  return res;
}

async function findExistingSheet() {
  const stored = localStorage.getItem("gs_spreadsheet_id");
  if (stored) return stored;

  const res = await authedFetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent("name='Student Flow Tracker Data' and trashed=false") +
      "&fields=files(id,name)"
  );
  const json = await res.json();
  if (json.files && json.files.length) {
    localStorage.setItem("gs_spreadsheet_id", json.files[0].id);
    return json.files[0].id;
  }
  return null;
}

async function createSheet() {
  const res = await authedFetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: { title: "Student Flow Tracker Data" },
      sheets: Object.values(HEADERS).map((h) => ({ properties: { title: h.tab } })),
    }),
  });
  const sheet = await res.json();
  const spreadsheetId = sheet.spreadsheetId;

  const dataUpdates = Object.values(HEADERS).map((h) => ({
    range: `${h.tab}!A1`,
    values: [h.cols],
  }));

  await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "RAW", data: dataUpdates }),
    }
  );

  localStorage.setItem("gs_spreadsheet_id", spreadsheetId);
  return spreadsheetId;
}

export async function ensureSheet() {
  const existing = await findExistingSheet();
  if (existing) return existing;
  return createSheet();
}

function rowsToObjects(values, cols) {
  if (!values || values.length < 2) return [];
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || !row[0]) continue;
    const obj = {};
    cols.forEach((c, idx) => { obj[c] = row[idx] != null ? row[idx] : ""; });
    out.push(obj);
  }
  return out;
}

async function listRows(entity) {
  const conf = HEADERS[entity];
  const spreadsheetId = await ensureSheet();
  const range = encodeURIComponent(`${conf.tab}!A1:Z2000`);
  const res = await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`
  );
  const json = await res.json();
  return rowsToObjects(json.values, conf.cols);
}

async function createRow(entity, data) {
  const conf = HEADERS[entity];
  const spreadsheetId = await ensureSheet();
  const newId = uuid();
  const rowValues = conf.cols.map((c) => (c === "id" ? newId : (data?.[c] ?? "")));
  await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      conf.tab + "!A1"
    )}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [rowValues] }),
    }
  );
  return { id: newId, ...data };
}

async function findRowNumber(spreadsheetId, conf, id) {
  const range = encodeURIComponent(`${conf.tab}!A1:Z2000`);
  const res = await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`
  );
  const json = await res.json();
  const values = json.values || [];
  for (let i = 1; i < values.length; i++) {
    if (values[i]?.[0] === id) {
      const existing = {};
      conf.cols.forEach((c, idx) => { existing[c] = values[i][idx] ?? ""; });
      return { rowNumber: i + 1, existing };
    }
  }
  return null;
}

async function updateRow(entity, id, data) {
  const conf = HEADERS[entity];
  const spreadsheetId = await ensureSheet();
  const found = await findRowNumber(spreadsheetId, conf, id);
  if (!found) throw new Error("Record not found");

  const merged = { ...found.existing, ...data, id };
  const rowValues = conf.cols.map((c) => merged[c] ?? "");
  const rowRange = encodeURIComponent(`${conf.tab}!A${found.rowNumber}:Z${found.rowNumber}`);
  await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rowRange}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [rowValues] }),
    }
  );
  return merged;
}

async function deleteRow(entity, id) {
  const conf = HEADERS[entity];
  const spreadsheetId = await ensureSheet();
  const found = await findRowNumber(spreadsheetId, conf, id);
  if (!found) throw new Error("Record not found");
  const rowRange = encodeURIComponent(`${conf.tab}!A${found.rowNumber}:Z${found.rowNumber}`);
  await authedFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rowRange}:clear`,
    { method: "POST" }
  );
  return { ok: true };
}

export const sheetsApi = { listRows, createRow, updateRow, deleteRow };