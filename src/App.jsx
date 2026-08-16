import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase } from "./lib/supabaseClient";


import Login from "./pages/Login";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import WeeklyPlan from "./pages/WeeklyPlan";

// Determine the correct base path depending on the host
const routerBase = import.meta.env.VITE_HOST_ENV === 'cloudflare' ? '/' : '/flow-tracker';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial session (Works on BOTH Web and Android)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (Handles web redirects & logins automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // 3. Deep Link Listener (ONLY runs on Android/iOS native app)
    let nativeListener = null;
    if (Capacitor.isNativePlatform()) {
      nativeListener = CapApp.addListener("appUrlOpen", async ({ url }) => {
        if (!url.includes("login-callback")) return;
        try { await Browser.close(); } catch (e) { /* Ignore browser close error */ }
        const hash = url.split("#")[1];
        if (!hash) return;
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      });
    }

    return () => {
      subscription.unsubscribe();
      if (nativeListener) {
        nativeListener.then((l) => l?.remove());
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    // Apply the smart base path here
    <Router basename={routerBase}>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Home /> : <Navigate to="/login" />} />
        <Route path="/attendance" element={session ? <Attendance /> : <Navigate to="/login" />} />
        <Route path="/schedule" element={session ? <Schedule /> : <Navigate to="/login" />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/weekly-plan" element={session ? <WeeklyPlan /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;