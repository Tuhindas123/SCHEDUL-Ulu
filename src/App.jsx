import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase } from "./lib/supabaseClient";

import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import WeeklyPlan from "./pages/WeeklyPlan";
import SubjectAttendance from "./pages/SubjectAttendance";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import Privacy from './pages/Privacy';
import Restaurants from "./pages/Restaurants";
import Terms from './pages/Terms';

const routerBase = Capacitor.isNativePlatform() || import.meta.env.DEV || import.meta.env.VITE_HOST_ENV === 'cloudflare'
  ? '/'
  : '/schedul-ul';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    });

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
        const provider_token = params.get("provider_token");
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
        if (provider_token) {
          localStorage.setItem("google_provider_token", provider_token);
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
    return <LoadingScreen />;
  }

  return (
    <Router basename={routerBase}>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Home /> : <Navigate to="/login" />} />
        <Route path="/attendance" element={session ? <Attendance /> : <Navigate to="/login" />} />
        
        <Route
          path="/attendance/:subjectKey"
          element={session ? <SubjectAttendance /> : <Navigate to="/login" />}
        />
        
        <Route path="/schedule" element={session ? <Schedule /> : <Navigate to="/login" />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/weekly-plan" element={session ? <WeeklyPlan /> : <Navigate to="/login" />} />
        <Route path="/restaurants" element={session ? <Restaurants /> : <Navigate to="/login" />} />
        <Route path="/feedback" element={session ? <Feedback /> : <Navigate to="/login" />} />
        <Route path="/about" element={session ? <About /> : <Navigate to="/login" />} />
        
        {/* Public Privacy Route (accessible both logged in and logged out) */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Wildcard MUST remain the very last route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;