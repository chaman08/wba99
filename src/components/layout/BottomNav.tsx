import { NavLink } from "react-router-dom";
import {
    Home,
    Users,
    Crosshair,
    FileText,
    Settings
} from "lucide-react";
import type { Role } from "../../types";

interface BottomNavProps {
    role: Role;
}

const navConfig = {
    physio: [
        { label: "Home", to: "/app/dashboard", icon: Home },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Assess", to: "/app/assess", icon: Crosshair },
        { label: "Reports", to: "/app/reports", icon: FileText },
        { label: "Settings", to: "/app/settings", icon: Settings },
    ],
    admin: [
        { label: "Home", to: "/app/admin/dashboard", icon: Home },
        { label: "Cases", to: "/app/admin/cases", icon: Users },
        { label: "Users", to: "/app/admin/users", icon: Settings },
    ],
};

export const BottomNav = ({ role }: BottomNavProps) => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-white/10 pb-safe-area z-50">
            <div className="flex items-center justify-around h-16">
                {navConfig[role].map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-all duration-200
              ${isActive ? "text-primary scale-110" : "text-text-muted hover:text-text"}
            `}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
