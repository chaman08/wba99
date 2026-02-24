import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
    Home,
    LayoutDashboard,
    Users,
    Settings,
    ChevronLeft,
    Menu,
    Search,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Wrench,
    Database,
    Activity,
    ShieldCheck,
    ExternalLink
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface NavItem {
    label: string;
    to: string;
    icon: any;
}

const adminNavItems: NavItem[] = [
    { label: "Home", to: "/admin/home", icon: Home },
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Profiles", to: "/admin/profiles", icon: Users },
    { label: "Cases", to: "/admin/cases", icon: Activity },
    { label: "Users", to: "/admin/users", icon: ShieldCheck },
    { label: "Program Builder", to: "/admin/program-builder", icon: Wrench },
    { label: "Configuration", to: "/admin/configuration", icon: Database },
    { label: "Management", to: "/admin/management", icon: Settings },
    { label: "Physio View", to: "/app/dashboard", icon: ExternalLink },
];

export const AdminShell = () => {
    const user = useAppStore((state) => state.authUser);
    const logout = useAppStore((state) => state.logout);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const activeNavItem = adminNavItems.find(item => location.pathname.startsWith(item.to));
    const pageTitle = activeNavItem?.label ?? "Admin Panel";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out z-30 ${isSidebarCollapsed ? "w-20" : "w-64"
                    }`}
            >
                <div className="p-6 flex items-center justify-between">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
                                <span className="text-white font-bold text-xs">WBA</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-[#0F172A]">WBA99</span>
                        </div>
                    )}
                    {isSidebarCollapsed && (
                        <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-xs">W</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <ChevronLeft
                            className={`h-5 w-5 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive
                                    ? "bg-[#0F172A] text-white shadow-md shadow-slate-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                                }
              `}
                        >
                            <item.icon className={`h-5 w-5 shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`} />
                            {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                            {isSidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-[#0F172A] text-white rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-slate-500" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate text-[#0F172A]">{user?.name || "Admin User"}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">Administrator</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 bg-white z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#0F172A]">{pageTitle}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="hidden md:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#0F172A] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-64 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-white" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1 lg:p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                                        {user?.name?.split(' ').map(n => n[0]).join('') || 'AU'}
                                    </div>
                                    <div className="hidden lg:block text-left mr-1">
                                        <p className="text-xs font-bold text-[#0F172A] leading-tight">{user?.name || 'Admin User'}</p>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-2 border-b border-slate-100 mb-2">
                                                <p className="text-sm font-semibold text-[#0F172A]">{user?.name || "Admin User"}</p>
                                                <p className="text-xs text-slate-500 truncate">{user?.email || "admin@wba99.com"}</p>
                                            </div>
                                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <User className="h-4 w-4" />
                                                Profile
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <Users className="h-4 w-4" />
                                                Organisation (Coming Soon)
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 border-t border-slate-100 mt-2 pt-3 hover:bg-red-50 transition-colors"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">WBA</span>
                                </div>
                                <span className="font-bold text-xl tracking-tight text-[#0F172A]">WBA99</span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-4 space-y-2">
                            {adminNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                                            ? "bg-[#0F172A] text-white shadow-md shadow-slate-200"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                                        }
                  `}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="font-medium text-lg">{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-6 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all"
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
