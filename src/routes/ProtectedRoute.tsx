import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { ProtectedShell } from "../components/layout/ProtectedShell";
import type { Role } from "../types";

interface ProtectedRouteProps {
  role: Role;
  label?: string;
}

const roleHome = (role: Role) => {
  if (role === "expert") return "/expert/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
};

export const ProtectedRoute = ({ role, label }: ProtectedRouteProps) => {
  const user = useAppStore((state) => state.authUser);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;
  return (
    <ProtectedShell role={role} label={label}>
      <Outlet />
    </ProtectedShell>
  );
};
