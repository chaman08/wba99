import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "../buttons/ThemeToggle";
import { useAppStore } from "../../store/useAppStore";

const navConfig: Record<string, { label: string; to: string }[]> = {
  physio: [
    { label: "Overview", to: "/dashboard" },
    { label: "Patients", to: "/patients" },
    { label: "New case", to: "/cases/new" },
    { label: "Case inbox", to: "/cases" },
  ],
  expert: [
    { label: "Overview", to: "/expert/dashboard" },
    { label: "Cases", to: "/expert/cases" },
  ],
  admin: [
    { label: "Overview", to: "/admin/dashboard" },
    { label: "Cases", to: "/admin/cases" },
    { label: "Users", to: "/admin/users" },
  ],
};

interface ProtectedShellProps {
  role: "physio" | "expert" | "admin";
  label?: string;
  children: ReactNode;
}

const getRoleLabel = (role: string) => {
  if (role === "physio") return "Physiotherapist";
  if (role === "expert") return "Expert reviewer";
  return "Admin";
};

export const ProtectedShell = ({ role, label, children }: ProtectedShellProps) => {
  const user = useAppStore((state) => state.authUser);
  const logout = useAppStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:px-0">
        <aside className="hidden flex-1 flex-col gap-6 rounded-3xl bg-surface/80 p-6 shadow-soft-light lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">role</p>
            <p className="text-lg font-semibold text-text">{getRoleLabel(role)}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {navConfig[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }: { isActive: boolean }) =>
                `rounded-2xl px-4 py-3 transition duration-200 ${isActive ? "bg-primary/20 text-primary" : "text-text-muted hover:bg-white/5"}`
              }
            >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary" />
              <div>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
            <button
              className="text-xs text-primary transition hover:text-secondary"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6">
          <header className="flex flex-col gap-3 rounded-3xl bg-surface/80 p-6 shadow-soft-light backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label ?? "Workspace"}</p>
              <h1 className="text-2xl font-semibold text-text">{getRoleLabel(role)}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
};
