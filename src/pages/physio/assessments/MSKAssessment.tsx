import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";
import { AssessmentLayout } from "../../../components/layout/AssessmentLayout";
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Activity
} from "lucide-react";

const STEPS = [
    { id: 1, label: "Pain Map" },
    { id: 2, label: "Range of Motion" },
    { id: 3, label: "Strength Testing" },
    { id: 4, label: "Review & Save" }
];

export const MSKAssessment = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const profiles = useAppStore((state: any) => state.profiles);
    const patient = useMemo(() => profiles.find((p: any) => p.id === clientId), [profiles, clientId]);
    const addCase = useAppStore((state: any) => state.addCase);

    const [currentStep, setCurrentStep] = useState(1);
    const [openSection, setOpenSection] = useState<string | null>("pain");

    const [formData, setFormData] = useState({
        pain: { score: 0, location: "", notes: "" },
        rom: { cervical: "", lumbar: "", hips: "", knees: "" },
        strength: { core: "", upper: "", lower: "" }
    });

    const handleSave = async () => {
        if (!clientId) return;
        try {
            await addCase({
                title: `MSK Screening - ${new Date().toLocaleDateString()}`,
                patientId: clientId,
                status: "Complete",
                media: {
                    posture: [],
                    ground: [],
                    treadmill: []
                },
                mskData: formData
            });
            navigate(`/app/clients/${clientId}`);
        } catch (error) {
            console.error("Failed to save assessment", error);
        }
    };

    const AccordionItem = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
        <div className="bg-surface/50 border border-white/5 rounded-[2rem] overflow-hidden transition-all">
            <button
                onClick={() => setOpenSection(openSection === id ? null : id)}
                className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${openSection === id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}>
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">{title}</span>
                </div>
                {openSection === id ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
            {openSection === id && (
                <div className="p-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                    <div className="h-px bg-white/5 mb-8" />
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <AssessmentLayout
            title="MSK Screening"
            clientName={patient?.name || "Unknown Client"}
            currentStep={currentStep}
            steps={STEPS}
            onNext={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))}
            onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            onSave={handleSave}
            onExit={() => navigate(`/app/clients/${clientId}`)}
        >
            <div className="h-full w-full p-4 lg:p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="text-center space-y-2 mb-10">
                                <h2 className="text-3xl font-bold italic tracking-tight uppercase">Pain Assessment</h2>
                                <p className="text-text-muted">Map clinical pain sites and intensity (VAS Score).</p>
                            </header>

                            <div className="space-y-8">
                                <div className="p-8 bg-surface/50 border border-white/5 rounded-[2.5rem] space-y-6">
                                    <label className="block">
                                        <span className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 block">VAS Intensity (0-10)</span>
                                        <input
                                            type="range" min="0" max="10"
                                            value={formData.pain.score}
                                            onChange={(e) => setFormData({ ...formData, pain: { ...formData.pain, score: parseInt(e.target.value) } })}
                                            className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-4 text-[10px] font-bold text-text-muted px-1">
                                            <span>NO PAIN</span>
                                            <span className="text-primary text-lg">{formData.pain.score}</span>
                                            <span>SEVERE</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="p-8 bg-surface/50 border border-white/5 rounded-[2.5rem] space-y-4">
                                    <span className="text-sm font-bold uppercase tracking-widest text-text-muted mb-2 block">Primary Pain Site</span>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px]"
                                        placeholder="Describe the location and nature of pain..."
                                        value={formData.pain.location}
                                        onChange={(e) => setFormData({ ...formData, pain: { ...formData.pain, location: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <header className="text-center space-y-2 mb-10">
                                <h2 className="text-3xl font-bold italic tracking-tight uppercase">Range Of Motion</h2>
                                <p className="text-text-muted">Evaluate joint mobility and restrictions.</p>
                            </header>

                            {["cervical", "lumbar", "hips", "knees"].map((joint) => (
                                <AccordionItem key={joint} id={joint} title={joint.charAt(0).toUpperCase() + joint.slice(1)}>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                                        placeholder={`Notes for ${joint} mobility...`}
                                        value={(formData.rom as any)[joint]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            rom: { ...formData.rom, [joint]: e.target.value }
                                        })}
                                    />
                                </AccordionItem>
                            ))}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <header className="text-center space-y-2 mb-10">
                                <h2 className="text-3xl font-bold italic tracking-tight uppercase">Strength & MMT</h2>
                                <p className="text-text-muted">Manual muscle testing and core stability scores.</p>
                            </header>

                            <div className="grid grid-cols-1 gap-4">
                                {["core", "upper", "lower"].map((area) => (
                                    <div key={area} className="p-8 bg-surface/50 border border-white/5 rounded-[2.5rem] space-y-4">
                                        <label className="text-sm font-bold uppercase tracking-widest text-text-muted">{area} Strength</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={(formData.strength as any)[area]}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                strength: { ...formData.strength, [area]: e.target.value }
                                            })}
                                        >
                                            <option value="">Select Level</option>
                                            <option value="5">5/5 - Normal</option>
                                            <option value="4">4/5 - Good</option>
                                            <option value="3">3/5 - Fair</option>
                                            <option value="2">2/5 - Poor</option>
                                            <option value="1">1/5 - Trace</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-bold">Screening Completed</h3>
                                <p className="text-text-muted max-w-sm">All clinical data has been captured. Ready to finalize the report for {patient?.name}.</p>
                            </div>
                            <button onClick={handleSave} className="px-12 py-5 bg-primary text-white rounded-[2rem] font-bold shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Save MSK Screening
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AssessmentLayout>
    );
};
