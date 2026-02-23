import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    User,
    Camera,
    Activity,
    Stethoscope,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";

export const AssessTab = () => {
    const navigate = useNavigate();
    const patients = useAppStore((state: any) => state.patients);
    const [step, setStep] = useState(1);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [search, setSearch] = useState("");

    const filteredPatients = useMemo(() =>
        patients.filter((p: any) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search)
        )
        , [patients, search]);

    const assessmentModules = [
        { id: "posture", label: "Posture Assessment", icon: Camera, description: "Static photo analysis for landmarks and angles.", color: "bg-primary" },
        { id: "movement", label: "Movement Assessment", icon: Activity, description: "Video analysis for joint angles and motion.", color: "bg-secondary" },
        { id: "msk", label: "MSK Screening", icon: Stethoscope, description: "Clinical intake form and joint testing.", color: "bg-purple-600" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
                <p className="text-text-muted">Start a new evaluation for your clients.</p>
            </header>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPatients.map((p: any) => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedClient(p); setStep(2); }}
                                className="flex items-center justify-between p-4 bg-surface/30 border border-white/5 rounded-2xl hover:bg-surface/50 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold group-hover:text-primary transition-colors">{p.name}</p>
                                        <p className="text-[10px] text-text-muted">{p.phone}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                        {filteredPatients.length === 0 && (
                            <p className="col-span-full py-20 text-center text-text-muted italic bg-surface/10 rounded-[2rem] border border-dashed border-white/5">No clients found matching your search.</p>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Client Selection
                    </button>

                    <div className="p-6 bg-surface/50 border border-white/10 rounded-[2.5rem] flex items-center gap-6 shadow-xl">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Assessing Client</p>
                            <h3 className="text-2xl font-bold">{selectedClient?.name}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {assessmentModules.map((module) => (
                            <button
                                key={module.id}
                                onClick={() => navigate(`/app/assessment/${module.id}/${selectedClient.id}`)}
                                className="flex items-center gap-6 p-6 bg-surface/30 border border-white/5 rounded-[2.5rem] hover:bg-surface/50 hover:border-primary/40 transition-all group text-left"
                            >
                                <div className={`h-16 w-16 rounded-[1.5rem] ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                    <module.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-bold text-xl group-hover:text-primary transition-colors">{module.label}</h4>
                                    <p className="text-sm text-text-muted leading-relaxed">{module.description}</p>
                                </div>
                                <ChevronRight className="h-6 w-6 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
