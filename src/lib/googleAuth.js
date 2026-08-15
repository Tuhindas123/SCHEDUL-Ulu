import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

let accessToken = null;
let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await GoogleAuth.initialize({
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "email",
      "profile",
    ],
    grantOfflineAccess: false,
  });
  initialized = true;
}

export async function signIn() {
  await ensureInit();
  const user = await GoogleAuth.signIn();
  accessToken = user.authentication.accessToken;
  localStorage.setItem("gs_token", accessToken);
  localStorage.setItem("gs_token_time", Date.now().toString());
  localStorage.setItem(
    "gs_user",
    JSON.stringify({
      name: user.name,
      email: user.email,
      picture: user.imageUrl,
    })
  );
  return accessToken;
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

export async function signOut() {
  try {
    await ensureInit();
    await GoogleAuth.signOut();
  } catch {}
  accessToken = null;
  localStorage.removeItem("gs_token");
  localStorage.removeItem("gs_token_time");
  localStorage.removeItem("gs_user");
  localStorage.removeItem("gs_spreadsheet_id");
}

export async function fetchUserInfo() {
  return getStoredUser();
}

export function getStoredUser() {
  const raw = localStorage.getItem("gs_user");
  return raw ? JSON.parse(raw) : null;
}