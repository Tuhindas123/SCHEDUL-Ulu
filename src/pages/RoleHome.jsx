import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/api/apiClient";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";

// Students land on the normal Home page. Teachers and admins are sent
// straight to /admin, which already shows a different view per role
// (teacher: their sections + roll-call; admin: people/sections/enrollments).
export default function RoleHome() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyProfile()
      .then((p) => setRole(p?.role || "student"))
      .catch(() => setRole("student"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (role === "teacher" || role === "admin") return <Navigate to="/admin" />;
  return <Home />;
}