import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { ProtectedShell } from "../components/layout/ProtectedShell";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  roles?: UserRole[];
  adminOnly?: boolean;
  label?: string;
  variant?: "admin" | "physio";
}

const getHomeRoute = (user: { role: UserRole; isAdmin: boolean }) => {
  if (user.isAdmin) return "/admin/home";
  if (user.role === "clinician" || user.role === "assistant") return "/app/dashboard";
  return "/app/view";
};

export const ProtectedRoute = ({ roles, adminOnly, label, variant = "physio" }: ProtectedRouteProps) => {
  const { authUser, isLoadingAuth, isProvisioning, authError } = useAppStore();

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  // If in provisioning state, redirect to provisioning page
  if (isProvisioning) {
    return <Navigate to="/provisioning" replace />;
  }

  if (!authUser) {
    // If there's an auth error (e.g. missing profile), show it instead of just redirecting
    if (authError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">Access Denied</h2>
          <p className="text-text-muted">{authError}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-6 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white"
          >
            Back to Login
          </button>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  // Admin only check
  if (adminOnly && !authUser.isAdmin) {
    return <Navigate to={getHomeRoute(authUser)} replace />;
  }

  // Role check (if provided)
  if (roles && !roles.includes(authUser.role)) {
    return <Navigate to={getHomeRoute(authUser)} replace />;
  }

  if (variant === "admin") {
    return <Outlet />;
  }

  return (
    <ProtectedShell role="physio" label={label}>
      <Outlet />
    </ProtectedShell>
  );
};
