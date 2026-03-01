import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    Users,
    Camera,
    FileText,
    Settings
} from "lucide-react";
import type { UserRole } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import React from "react";

interface BottomNavProps {
    role: UserRole;
}

const navConfig: Record<string, any[]> = {
    clinician: [
        { label: "Home", to: "/app/dashboard", icon: Home },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Capture", to: "/app/capture", icon: Camera, specialized: true },
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
    const navigate = useNavigate();
    const location = useLocation();
    const setPendingMedia = useAppStore((state) => state.setPendingMedia);

    // Fallback for roles not in config
    const items = navConfig[role] || (role === "owner" ? navConfig.admin : navConfig.clinician);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newMedia = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setPendingMedia(newMedia);
            navigate("/app/capture");
        }
    };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-white/10 pb-safe-area z-50">
            <div className="flex items-center justify-around h-16">
                {items.map((item: any) => {
                    const isActive = location.pathname === item.to;
                    if (item.specialized) {
                        return (
                            <label key={item.to} className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${isActive ? "text-primary scale-110" : "text-text-muted hover:text-text"}`}>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    capture="environment"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                            </label>
                        );
                    }
                    return (
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
                    );
                })}
            </div>
        </nav>
    );
};
