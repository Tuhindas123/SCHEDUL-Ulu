# Migrating Flow Tracker from Google Sheets → Supabase

This patch replaces the Google-Sheets-as-a-database backend with a real
Postgres database (Supabase), shared by both the website and the Capacitor
app, so data entered on any device syncs everywhere.

## Files in this patch

```
.env.local.example              -> copy to .env.local and fill in your values
supabase/schema.sql             -> run once in the Supabase SQL editor
src/lib/supabaseClient.js       -> new: Supabase client (env-configured)
src/lib/supabaseAuth.js         -> new: Google sign-in via Supabase Auth
src/lib/supabaseData.js         -> new: CRUD + realtime helpers
src/api/apiClient.js            -> replaces src/lib/sheetsClient.js usage
src/pages/Login.jsx             -> updated to use Supabase OAuth
src/pages/Settings.jsx          -> updated to use Supabase session
src/components/ProtectedRoute.jsx -> updated to use Supabase session
```

Files you can delete after this migration: `src/lib/sheetsClient.js`,
`src/lib/googleAuth.js` (no longer used).

## 1. Create the Supabase project

1. Go to supabase.com → New project (free tier is enough to start).
2. Once created, go to **Project Settings → API** and copy:
   - `Project URL` → put in `.env.local` as `VITE_SUPABASE_URL`
   - `anon public` key → put in `.env.local` as `VITE_SUPABASE_ANON_KEY`
3. Copy `.env.local.example` to `.env.local` in your project root and fill
   those two values in.

## 2. Create the tables

Open **SQL Editor** in the Supabase dashboard, paste the contents of
`supabase/schema.sql`, and run it. This creates:

- `class_sessions`, `attendance_records`, `weekly_plans`, `sync_settings`
- Row Level Security policies so each signed-in user only ever sees their
  own rows (this is what makes "my data, on my devices" work safely)
- Realtime publication for all three main tables, so live sync works

## 3. Enable Google sign-in

Dashboard → **Authentication → Providers → Google** → toggle on, and fill
in a Google OAuth Client ID/Secret (from Google Cloud Console — you can
reuse the same Google Cloud project you already created for the Capacitor
Google Auth plugin, just add a Web application OAuth client for this).

Also add your site URLs under **Authentication → URL Configuration**:
- Site URL: your deployed website URL (e.g. `https://your-app.vercel.app`)
- Redirect URLs: add both your website URL and `http://localhost:5173` for
  local dev.

## 4. Install the dependency

```bash
npm install @supabase/supabase-js
```

## 5. Drop in the files

Copy everything under `src/` in this patch into your project's `src/`
folder (same relative paths, so they overwrite `src/api/apiClient.js`,
`src/pages/Login.jsx`, `src/pages/Settings.jsx`, and
`src/components/ProtectedRoute.jsx`, and add the three new files under
`src/lib/`).

No other page needs to change — `Home.jsx`, `Schedule.jsx`,
`Attendance.jsx`, and `WeeklyPlan.jsx` all call `api.getX()` /
`api.createX()` etc., and `apiClient.js` keeps those exact same function
names, just backed by Supabase now instead of Sheets.

## 6. Web ↔ App sync, in practice

- Both the website and the Capacitor Android app import the same
  `src/api/apiClient.js`, pointed at the same Supabase project via the
  same `.env` values — so they're always reading/writing the same
  database. Data entered on your phone is visible on the website on next
  load, and vice versa.
- For *live* (no-refresh) sync, subscribe in a page, e.g. in `Home.jsx`:

```js
useEffect(() => {
  const unsub = api.subscribe("AttendanceRecord", () => loadDashboard());
  return unsub;
}, []);
```

  Do this in `Schedule.jsx`, `Attendance.jsx`, and `WeeklyPlan.jsx` too if
  you want instant cross-device updates rather than sync-on-next-load.

## 7. One caveat for the Android app

Supabase's `signInWithOAuth` opens a browser-based Google login and
redirects back to a URL — this works out of the box on the website. For
the native Capacitor app, the cleanest approach is to keep using the
existing `@codetrix-studio/capacitor-google-auth` plugin to get a native
Google ID token, then hand that token to Supabase via
`supabase.auth.signInWithIdToken({ provider: "google", token })` instead
of `signInWithOAuth`. I can wire that up too if you want the Android app
to have a fully native (non-browser) Google sign-in — just say the word.

## 8. Exporting to Excel (optional)

Your project already has the `xlsx` (SheetJS) package installed. I can
add an "Export to Excel" button (e.g. on the Settings page) that pulls
all your Supabase tables and downloads a real `.xlsx` workbook, if you
want a periodic offline copy of your data in spreadsheet form.
