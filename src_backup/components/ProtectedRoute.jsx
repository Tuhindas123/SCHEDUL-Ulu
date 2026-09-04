import React, { useEffect, useState } from "react";
import { getSession, onAuthStateChange } from "@/lib/supabaseAuth";

export default function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let active = true;

    getSession().then((session) => {
      if (!active) return;
      if (session) {
        setOk(true);
      } else {
        window.location.href = "/login";
      }
      setChecked(true);
    });

    const unsubscribe = onAuthStateChange((session) => {
      if (!session) {
        window.location.href = "/login";
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ok) return null;

  return children;
}
