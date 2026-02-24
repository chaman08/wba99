import { useState, useEffect } from "react";
import {
    Building2,
    Image as ImageIcon,
    Globe,
    Mail,
    Phone,
    MapPin,
    Save,
    CheckCircle2,
    Settings as SettingsIcon,
} from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";
import { toast } from "react-hot-toast";

export const SettingsPage = () => {
    const organisation = useAppStore((state) => state.organisation);
    const updateOrganisation = useAppStore((state) => state.updateOrganisation);

    const [form, setForm] = useState({
        name: "",
        logoUrl: "",
        phone: "",
        email: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "USA",
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (organisation) {
            setForm({
                name: organisation.name || "",
                logoUrl: organisation.logoUrl || "",
                phone: organisation.phone || "",
                email: organisation.contactEmail || "",
                address1: organisation.address1 || "",
                address2: organisation.address2 || "",
                city: organisation.city || "",
                state: organisation.state || "",
                postalCode: organisation.postalCode || "",
                country: organisation.country || "USA",
            });
        }
    }, [organisation]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganisation({
                name: form.name,
                logoUrl: form.logoUrl,
                phone: form.phone,
                contactEmail: form.email,
                address1: form.address1,
                address2: form.address2,
                city: form.city,
                state: form.state,
                postalCode: form.postalCode,
                country: form.country
            });
            toast.success("Organisation settings updated", {
                style: {
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    color: "#fff",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }
            });
        } catch (error) {
            toast.error("Failed to save organization settings");
        } finally {
            setIsSaving(false);
        }
    };

    const SectionTitle = ({ icon: Icon, title, description }: any) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold italic tracking-tight uppercase">{title}</h3>
                <p className="text-xs text-text-muted font-medium">{description}</p>
            </div>
        </div>
    );

    const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text" }: any) => (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">{label}</label>
            <div className="relative group">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type={type}
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-text-muted">Global configuration and organization branding.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Changes
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Clinic Branding */}
                <div className="space-y-8">
                    <SectionTitle
                        icon={Building2}
                        title="Organisation"
                        description="Configure how your clinic appears on reports."
                    />

                    <div className="p-8 bg-surface/30 border border-white/5 rounded-[2.5rem] space-y-6 backdrop-blur-xl">
                        <InputField
                            label="Clinic Name"
                            icon={Building2}
                            value={form.name}
                            onChange={(val: any) => setForm({ ...form, name: val })}
                            placeholder="e.g. Elite Physio Hub"
                        />
                        <InputField
                            label="Logo URL"
                            icon={ImageIcon}
                            value={form.logoUrl}
                            onChange={(val: any) => setForm({ ...form, logoUrl: val })}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                </div>

                {/* Units & Preferences */}
                <div className="space-y-8">
                    <SectionTitle
                        icon={SettingsIcon}
                        title="Global Units"
                        description="Settings for analysis output."
                    />

                    <div className="p-8 bg-surface/30 border border-white/5 rounded-[2.5rem] space-y-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <p className="text-xs text-text-muted">Angles are measured in **degrees (deg)** by default for all WBA99 assessments.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="lg:col-span-2 space-y-8">
                    <SectionTitle
                        icon={Globe}
                        title="Contact Information"
                        description="Contact details shown in report footers."
                    />

                    <div className="p-8 bg-surface/30 border border-white/5 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-6 backdrop-blur-xl">
                        <InputField
                            label="Clinic Phone"
                            icon={Phone}
                            value={form.phone}
                            onChange={(val: any) => setForm({ ...form, phone: val })}
                            placeholder="+91 9876543210"
                        />
                        <InputField
                            label="Clinic Email"
                            icon={Mail}
                            value={form.email}
                            onChange={(val: any) => setForm({ ...form, email: val })}
                            placeholder="contact@clinic.com"
                            type="email"
                        />
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Main Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-6 h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                <textarea
                                    value={form.address1}
                                    onChange={(e) => setForm({ ...form, address1: e.target.value })}
                                    placeholder="Enter full clinic address..."
                                    className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
