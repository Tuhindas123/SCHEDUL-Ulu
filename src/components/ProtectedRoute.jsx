import React, { useEffect, useState } from "react";
import { getToken, getStoredUser } from "@/lib/googleAuth";

export default function ProtectedRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      setOk(true);
    } else {
      window.location.href = "/login";
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ok) return null;

  return children;
}