const CLIENT_ID = "105526018528-snp4pnkfoqi3er3cp0veeti3ekgl7ugd.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

let tokenClient = null;
let accessToken = null;

function initTokenClient() {
  if (tokenClient || !window.google?.accounts?.oauth2) return;
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // real callback is set per sign-in attempt below
  });
}

function loadGis() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      initTokenClient();
      return resolve();
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      initTokenClient();
      resolve();
    };
    document.head.appendChild(script);
  });
}

// Kick this off immediately when the app loads, not when the user clicks.
loadGis();

// IMPORTANT: this is intentionally NOT async and does no "await" before
// calling requestAccessToken(). Mobile browsers only allow the Google
// sign-in popup to open if it's triggered synchronously from a tap. Any
// "await" before this call makes mobile Safari/Chrome silently block the
// popup, which is what caused the "stuck on sign in" bug.
export function signIn() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google sign-in isn't ready yet — please wait a moment and try again."));
      return;
    }
    tokenClient.callback = (resp) => {
      if (resp.error) return reject(resp);
      accessToken = resp.access_token;
      localStorage.setItem("gs_token", accessToken);
      localStorage.setItem("gs_token_time", Date.now().toString());
      resolve(accessToken);
    };
    tokenClient.requestAccessToken();
  });
}

export function getToken() {
  if (accessToken) return accessToken;
  const stored = localStorage.getItem("gs_token");
  const storedTime = Number(localStorage.getItem("gs_token_time") || 0);
  if (stored && Date.now() - storedTime < 55 * 60 * 1000) {
    accessToken = stored;
    return stored;
  }
  return null;
}

export function signOut() {
  accessToken = null;
  localStorage.removeItem("gs_token");
  localStorage.removeItem("gs_token_time");
  localStorage.removeItem("gs_user");
  localStorage.removeItem("gs_spreadsheet_id");
}

export async function fetchUserInfo(token) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load user info");
  const data = await res.json();
  localStorage.setItem("gs_user", JSON.stringify(data));
  return data;
}

export function getStoredUser() {
  const raw = localStorage.getItem("gs_user");
  return raw ? JSON.parse(raw) : null;
}