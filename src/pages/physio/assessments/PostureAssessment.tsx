import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";
import { AssessmentLayout } from "../../../components/layout/AssessmentLayout";
import {
    Camera,
    Activity,
    Trash2,
    Maximize2,
    Move,
    Grid,
    CheckCircle2,
    Target
} from "lucide-react";
import type { Landmark } from "../../../components/assessment/AnnotationCanvas";
import { AnnotationCanvas } from "../../../components/assessment/AnnotationCanvas";

const STEPS = [
    { id: 1, label: "Photo Upload" },
    { id: 2, label: "Annotation" },
    { id: 3, label: "Measurements" },
    { id: 4, label: "Review & Save" }
];

const VIEWS = [
    { id: "front", label: "Front View" },
    { id: "back", label: "Back View" },
    { id: "left", label: "Left Side" },
    { id: "right", label: "Right Side" }
];

const LANDMARKS_CONFIG: Record<string, { id: string; label: string }[]> = {
    front: [
        { id: "f_head", label: "Head Center" },
        { id: "f_sh_l", label: "Shoulder L" },
        { id: "f_sh_r", label: "Shoulder R" },
        { id: "f_asis_l", label: "ASIS L" },
        { id: "f_asis_r", label: "ASIS R" },
        { id: "f_ank_l", label: "Ankle L" },
        { id: "f_ank_r", label: "Ankle R" },
    ],
    back: [
        { id: "b_occ", label: "Occiput" },
        { id: "b_sh_l", label: "Shoulder L" },
        { id: "b_sh_r", label: "Shoulder R" },
        { id: "b_psis_l", label: "PSIS L" },
        { id: "b_psis_r", label: "PSIS R" },
        { id: "b_ank_l", label: "Ankle L" },
        { id: "b_ank_r", label: "Ankle R" },
    ],
    left: [
        { id: "l_ear", label: "Ear" },
        { id: "l_c7", label: "C7" },
        { id: "l_sh", label: "Shoulder" },
        { id: "l_hip", label: "Hip" },
        { id: "l_knee", label: "Knee" },
        { id: "l_ank", label: "Ankle" },
    ],
    right: [
        { id: "r_ear", label: "Ear" },
        { id: "r_c7", label: "C7" },
        { id: "r_sh", label: "Shoulder" },
        { id: "r_hip", label: "Hip" },
        { id: "r_knee", label: "Knee" },
        { id: "r_ank", label: "Ankle" },
    ]
};

export const PostureAssessment = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const patient = useAppStore((state: any) => state.patients.find((p: any) => p.id === clientId));
    const addCase = useAppStore((state: any) => state.addCase);

    const [currentStep, setCurrentStep] = useState(1);
    const [photos, setPhotos] = useState<Record<string, string | null>>({
        front: null,
        back: null,
        left: null,
        right: null
    });

    const [activeView, setActiveView] = useState("front");
    const [viewLandmarks, setViewLandmarks] = useState<Record<string, Landmark[]>>({
        front: LANDMARKS_CONFIG.front.map(l => ({ ...l, x: 0, y: 0 })),
        back: LANDMARKS_CONFIG.back.map(l => ({ ...l, x: 0, y: 0 })),
        left: LANDMARKS_CONFIG.left.map(l => ({ ...l, x: 0, y: 0 })),
        right: LANDMARKS_CONFIG.right.map(l => ({ ...l, x: 0, y: 0 })),
    });

    const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);

    const handlePhotoUpload = (viewId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotos(prev => ({ ...prev, [viewId]: url }));
        }
    };

    const isNextDisabled = currentStep === 1 && !Object.values(photos).some(p => p !== null);

    const handleSave = async () => {
        if (!clientId) return;
        try {
            await addCase({
                title: `Posture Assessment - ${new Date().toLocaleDateString()}`,
                patientId: clientId,
                status: "Draft",
                media: {
                    posture: Object.entries(photos).map(([view, url]) => ({
                        id: view,
                        label: view,
                        files: url ? [url] : [],
                        required: true,
                        completed: !!url,
                        landmarks: viewLandmarks[view]
                    })),
                    ground: [],
                    treadmill: []
                }
            });
            navigate(`/app/clients/${clientId}`);
        } catch (error) {
            console.error("Failed to save assessment", error);
        }
    };

    return (
        <AssessmentLayout
            title="Posture Assessment"
            clientName={patient?.name || "Unknown Client"}
            currentStep={currentStep}
            steps={STEPS}
            onNext={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))}
            onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            onSave={handleSave}
            onExit={() => navigate(`/app/clients/${clientId}`)}
            isNextDisabled={isNextDisabled}
        >
            <div className="h-full w-full p-4 lg:p-8 overflow-y-auto">
                {currentStep === 1 && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="text-center space-y-2">
                            <h2 className="text-3xl font-bold italic tracking-tight uppercase">Upload Posture Photos</h2>
                            <p className="text-text-muted">Take or upload 4 standard views for a complete postural analysis.</p>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {VIEWS.map((view) => (
                                <div key={view.id} className="group relative aspect-[4/3] bg-surface/50 border-2 border-dashed border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all flex flex-col items-center justify-center p-6 text-center">
                                    {photos[view.id] ? (
                                        <>
                                            <img src={photos[view.id]!} alt={view.label} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => setPhotos(prev => ({ ...prev, [view.id]: null }))}
                                                    className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <div className="absolute top-4 right-4 h-8 w-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                                <Camera className="h-8 w-8 text-text-muted group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{view.label}</p>
                                                <p className="text-xs text-text-muted mt-1">Click to upload or drag & drop</p>
                                            </div>
                                            <label className="cursor-pointer inline-block mt-2">
                                                <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Select File</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(view.id, e)} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="h-full flex flex-col animate-in fade-in duration-500">
                        {/* View Selector */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none">
                            {VIEWS.map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeView === view.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface/50 border border-white/5 text-text-muted hover:text-text"
                                        }`}
                                >
                                    {view.label}
                                    {viewLandmarks[view.id].every(l => l.x > 0) && " ✓"}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 bg-surface/30 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col lg:flex-row relative">
                            {/* Canvas Area */}
                            <div className="flex-1 relative bg-black/50 flex items-center justify-center overflow-hidden">
                                {photos[activeView] ? (
                                    <AnnotationCanvas
                                        image={photos[activeView]!}
                                        landmarks={viewLandmarks[activeView]}
                                        onChange={(newLandmarks) => setViewLandmarks(prev => ({ ...prev, [activeView]: newLandmarks }))}
                                        activeLandmarkId={activeLandmarkId || undefined}
                                    />
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                            <Camera className="h-10 w-10 text-text-muted/20" />
                                        </div>
                                        <p className="text-text-muted">No photo uploaded for {activeView} view.</p>
                                        <button onClick={() => setCurrentStep(1)} className="text-primary font-bold hover:underline">Go to Upload</button>
                                    </div>
                                )}

                                {/* Canvas Toolbar */}
                                <div className="absolute right-6 top-6 flex flex-col gap-3">
                                    {[Maximize2, Move, Grid].map((Icon, i) => (
                                        <button key={i} className="p-4 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-surface hover:text-primary transition-all shadow-xl">
                                            <Icon className="h-5 w-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Landmarks Panel */}
                            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col h-full bg-surface/50 overflow-hidden">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" /> Landmarks
                                </h3>
                                <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {viewLandmarks[activeView].map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setActiveLandmarkId(l.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${activeLandmarkId === l.id
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">{l.label}</span>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${l.x > 0 ? "bg-primary border-primary" : "border-white/20"
                                                }`}>
                                                {l.x > 0 && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-[0.2em] mb-4">Instructions</p>
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                        <p className="text-xs text-text-muted leading-relaxed">
                                            Select a landmark and click on the image to place it. Drag markers to adjust position.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="text-center space-y-2">
                            <h2 className="text-3xl font-bold italic tracking-tight uppercase">Measurement Results</h2>
                            <p className="text-text-muted">Clinical angles calculated from your landmarks.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(viewLandmarks).map(([view, landmarks]) => {
                                const placed = landmarks.filter(l => l.x > 0).length;
                                if (placed === 0) return null;

                                let measurements: { label: string; value: string; status: "optimal" | "warning" | "deviation" }[] = [];

                                // Simple Angle Logic Examples
                                if (view === "front") {
                                    const shL = landmarks.find(l => l.id === "f_sh_l");
                                    const shR = landmarks.find(l => l.id === "f_sh_r");
                                    if (shL?.x && shR?.x) {
                                        const tilt = Math.abs((shL.y - shR.y) * 0.5).toFixed(1);
                                        measurements.push({ label: "Shoulder Tilt", value: `${tilt}°`, status: Number(tilt) > 2 ? "warning" : "optimal" });
                                    }
                                    const asisL = landmarks.find(l => l.id === "f_asis_l");
                                    const asisR = landmarks.find(l => l.id === "f_asis_r");
                                    if (asisL?.x && asisR?.x) {
                                        const tilt = Math.abs((asisL.y - asisR.y) * 0.5).toFixed(1);
                                        measurements.push({ label: "Pelvic Tilt", value: `${tilt}°`, status: Number(tilt) > 2 ? "warning" : "optimal" });
                                    }
                                }

                                if (view === "left" || view === "right") {
                                    const ear = landmarks.find(l => l.id.includes("ear"));
                                    const c7 = landmarks.find(l => l.id.includes("c7"));
                                    if (ear?.x && c7?.x) {
                                        const shift = Math.abs(ear.x - c7.x).toFixed(1);
                                        measurements.push({ label: "Forward Head Shift", value: `${shift}cm equiv.`, status: Number(shift) > 5 ? "deviation" : "optimal" });
                                    }
                                }

                                return (
                                    <div key={view} className="p-8 bg-surface/50 border border-white/10 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg uppercase tracking-widest text-primary">{view} View</h3>
                                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Activity className="h-4 w-4 text-primary" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {measurements.map((m, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">{m.label}</p>
                                                        <p className="text-xl font-bold">{m.value}</p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${m.status === "optimal" ? "bg-green-500/10 text-green-500" :
                                                        m.status === "warning" ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
                                                        }`}>
                                                        {m.status}
                                                    </div>
                                                </div>
                                            ))}
                                            {measurements.length === 0 && (
                                                <p className="text-xs text-text-muted italic text-center py-4">Place more landmarks for detailed analysis.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center shadow-2xl shadow-green-500/10">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-3xl font-bold">Ready to Save?</h3>
                            <p className="text-text-muted">Postural analysis for {patient?.name} is complete and ready for clinical reporting.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleSave} className="px-10 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Finalize & Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AssessmentLayout>
    );
};
