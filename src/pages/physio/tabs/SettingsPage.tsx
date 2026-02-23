import { User, Building2, Bell, Shield, Info } from "lucide-react";

export const SettingsPage = () => {
    const sections = [
        { label: "Profile Settings", icon: User, description: "Manage your personal information and login credentials." },
        { label: "Clinic Branding", icon: Building2, description: "Update clinic name, logo, and report headers." },
        { label: "Notifications", icon: Bell, description: "Configure alerts for new assessments and reports." },
        { label: "Data & Privacy", icon: Shield, description: "Export client data or manage workspace security." },
        { label: "About WBA99", icon: Info, description: "App version, legal information, and support." },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-text-muted">Configure your workspace and clinic preferences.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {sections.map((section) => (
                    <button
                        key={section.label}
                        className="flex items-center gap-6 p-6 bg-surface/30 border border-white/5 rounded-[2rem] hover:bg-surface/50 hover:border-primary/40 transition-all group text-left"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <section.icon className="h-6 w-6 text-text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold group-hover:text-primary transition-colors">{section.label}</h4>
                            <p className="text-xs text-text-muted">{section.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
