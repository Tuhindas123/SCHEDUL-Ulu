import Home from "@/pages/Home";
import RoleDashboard from "@/pages/RoleDashboard";
import LoadingScreen from "@/components/LoadingScreen";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";

// Students land on the normal Home page. Teachers and admins get their
// own dashboard-style Home (RoleDashboard) instead of being redirected
// away to /admin. Uses the shared effective role, so Preview-As-Student
// correctly shows Home too.
export default function RoleHome() {
  const { effectiveRole, loading } = usePreviewRole();

  if (loading) return <LoadingScreen />;
  if (effectiveRole === "teacher" || effectiveRole === "admin") return <RoleDashboard />;
  return <Home />;
}