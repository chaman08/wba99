import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "../buttons/ThemeToggle";
import { useAppStore } from "../../store/useAppStore";
import type { Role } from "../../types";

const navConfig: Record<Role, { label: string; to: string }[]> = {
  physio: [
    { label: "Overview", to: "/dashboard" },
    { label: "Patients", to: "/patients" },
    { label: "New case", to: "/cases/new" },
  ],
  admin: [
    { label: "Overview", to: "/admin/dashboard" },
    { label: "Cases", to: "/admin/cases" },
    { label: "Users", to: "/admin/users" },
  ],
};

interface ProtectedShellProps {
  role: Role;
  label?: string;
  children: ReactNode;
}

const getRoleLabel = (role: Role) => (role === "physio" ? "Physiotherapist" : "Admin");

export const ProtectedShell = ({ role, label, children }: ProtectedShellProps) => {
  const user = useAppStore((state) => state.authUser);
  const logout = useAppStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      {navConfig[role].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setIsMenuOpen(false)}
          className={({ isActive }: { isActive: boolean }) =>
            `rounded-2xl px-4 py-3 transition duration-200 ${isActive ? "bg-primary/20 text-primary" : "text-text-muted hover:bg-white/5"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col gap-6 rounded-3xl bg-surface/80 p-6 shadow-soft-light lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">role</p>
            <p className="text-lg font-semibold text-text">{getRoleLabel(role)}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <NavItems />
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
            <button
              className="text-left text-xs text-primary transition hover:text-secondary"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile Header & Menu */}
        <div className="lg:hidden">
          <header className="flex items-center justify-between rounded-3xl bg-surface/80 p-4 shadow-soft-light backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted">{getRoleLabel(role)}</p>
                <p className="text-sm font-semibold">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-xl bg-white/5 p-2 text-text transition hover:bg-white/10"
              >
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
              </button>
            </div>
          </header>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="mt-2 flex flex-col gap-2 rounded-3xl bg-surface/80 p-4 shadow-soft-light backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
              <nav className="flex flex-col gap-1 text-sm">
                <NavItems />
              </nav>
              <div className="mt-2 border-t border-white/10 pt-4 px-2">
                <button
                  className="w-full text-left text-sm text-primary transition hover:text-secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        <main className="flex flex-1 flex-col gap-6 min-w-0">
          <header className="hidden flex-col gap-3 rounded-3xl bg-surface/80 p-6 shadow-soft-light backdrop-blur-xl lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label ?? "Workspace"}</p>
              <h1 className="text-2xl font-semibold text-text">{getRoleLabel(role)}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
