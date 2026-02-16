import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { ProtectedShell } from "../components/layout/ProtectedShell";
import type { Role } from "../types";

interface ProtectedRouteProps {
  role: Role;
  label?: string;
}

const roleHome = (role: Role) => (role === "admin" ? "/admin/dashboard" : "/dashboard");

export const ProtectedRoute = ({ role, label }: ProtectedRouteProps) => {
  const { authUser, isLoadingAuth } = useAppStore();

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== role) return <Navigate to={roleHome(authUser.role)} replace />;
  return (
    <ProtectedShell role={role} label={label}>
      <Outlet />
    </ProtectedShell>
  );
};
