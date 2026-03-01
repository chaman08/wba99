import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  PlusCircle,
  ChevronLeft,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { ThemeToggle } from "../buttons/ThemeToggle";
import { useAppStore } from "../../store/useAppStore";
import { BottomNav } from "./BottomNav";
import type { UserRole } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: any;
}

const navConfig: Record<string, NavItem[]> = {
  clinician: [
    { label: "Home", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "Clients", to: "/app/clients", icon: Users },
    { label: "Assess", to: "/app/assess", icon: Activity },
    { label: "Reports", to: "/app/reports", icon: PlusCircle }, // Placeholder for reports
    { label: "Settings", to: "/app/settings", icon: Settings },
  ],
  admin: [
    { label: "Home", to: "/app/admin/dashboard", icon: LayoutDashboard },
    { label: "Cases", to: "/app/admin/cases", icon: Users },
    { label: "Users", to: "/app/admin/users", icon: Settings },
  ],
};

interface ProtectedShellProps {
  role: UserRole;
  label?: string;
  children: ReactNode;
}

export const ProtectedShell = ({ role, label, children }: ProtectedShellProps) => {
  const user = useAppStore((state) => state.authUser);
  const logout = useAppStore((state) => state.logout);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const config = navConfig[role] || (role === "owner" ? navConfig.admin : navConfig.clinician);
  const activeNavItem = config.find(item => location.pathname.startsWith(item.to));
  const pageTitle = label ?? activeNavItem?.label ?? "Workspace";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/10 bg-surface/50 backdrop-blur-xl transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-20" : "w-64"
          }`}
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="WBA99" className="h-8 w-8 drop-shadow-[0_0_10px_rgba(0,180,216,0.2)]" />
              <span className="font-black text-2xl tracking-tighter text-white uppercase italic">WBA99</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <img src="/logo.png" alt="WBA99" className="h-8 w-8 mx-auto drop-shadow-[0_0_10px_rgba(0,180,216,0.2)]" />
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted transition-colors"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {config.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-text-muted hover:bg-white/5 hover:text-text"}
              `}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`} />
              {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-white/10 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}

          {user?.isAdmin && (role === "clinician" || role === "assistant") && (
            <NavLink
              to="/admin/home"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-text-muted hover:bg-white/5 hover:text-text"
            >
              <ShieldCheck className={`h-5 w-5 shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`} />
              {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Admin Panel</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-white/10 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  Admin Panel
                </div>
              )}
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="h-10 w-10 rounded-full bg-surface-light border border-white/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-text-muted" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate capitalize">{role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-surface/30 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-text-muted"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-text truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 w-64 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 lg:gap-2">
              <button className="p-2 rounded-xl hover:bg-white/5 text-text-muted relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-surface" />
              </button>
              <ThemeToggle />

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 lg:p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-white/5 mb-2">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                        <User className="h-4 w-4" />
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-red-400" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav role={role} />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-surface z-50 lg:hidden flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="WBA99" className="h-8 w-8" />
                <span className="font-black text-2xl tracking-tighter text-white uppercase italic">WBA99</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-text-muted"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {config.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                      ? "bg-primary/20 text-primary shadow-sm"
                      : "text-text-muted hover:bg-white/5 hover:text-text"}
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}

              {user?.isAdmin && (role === "clinician" || role === "assistant") && (
                <NavLink
                  to="/admin/home"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-text-muted hover:bg-white/5 hover:text-text"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-medium">Admin Panel</span>
                </NavLink>
              )}
            </nav>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
