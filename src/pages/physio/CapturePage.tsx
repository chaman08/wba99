import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Camera,
    User,
    Activity,
    ChevronRight,
    ArrowLeft,
    Search,
    CheckCircle,
    X
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import type { Profile, AssessmentType } from "../../types";
import { toast } from "react-hot-toast";

export const CapturePage = () => {
    const navigate = useNavigate();
    const profiles = useAppStore((state) => state.profiles);
    const organisation = useAppStore((state) => state.organisation);
    const addAssessment = useAppStore((state) => state.addAssessment);
    const uploadFile = useAppStore((state) => state.uploadFile);
    const pendingMedia = useAppStore((state) => state.pendingMedia);
    const setPendingMedia = useAppStore((state) => state.setPendingMedia);

    const [step, setStep] = useState(1);
    const [capturedMedia, setCapturedMedia] = useState<{ file: File; preview: string }[]>(pendingMedia);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [search, setSearch] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clear pending media once consumed
    useMemo(() => {
        if (pendingMedia.length > 0) {
            setPendingMedia([]);
        }
    }, [pendingMedia, setPendingMedia]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredProfiles = useMemo(() =>
        profiles.filter((p) =>
            p.fullName.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search)
        )
        , [profiles, search]);

    const assessmentModules = [
        { id: "posture", label: "Posture Assessment", icon: Camera, description: "Static photo analysis for landmarks and angles.", color: "bg-primary" },
        { id: "movement", label: "Movement Assessment", icon: Activity, description: "Video analysis for joint angles and motion.", color: "bg-secondary" },
    ];

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newMedia = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setCapturedMedia(prev => [...prev, ...newMedia]);
        }
    };

    const removeMedia = (index: number) => {
        setCapturedMedia(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = async (type: string) => {
        if (!selectedProfile || !organisation || capturedMedia.length === 0) return;

        setIsSubmitting(true);
        const assessmentId = `assessment-${crypto.randomUUID().slice(0, 8)}`;
        const baseFolder = `orgs/${organisation.id}/assessments/${assessmentId}`;

        const submissionPromise = (async () => {
            const uploadedMedia = await Promise.all(capturedMedia.map(async (m) => {
                const subfolder = type === "posture" ? "photos" : "movement";
                const path = `${baseFolder}/${subfolder}/${m.file.name}`;
                const url = await uploadFile(path, m.file);
                return { view: subfolder, url, path };
            }));

            await addAssessment({
                profileId: selectedProfile.id,
                type: type as AssessmentType,
                groupId: selectedProfile.groupId,
                categoryId: selectedProfile.categoryId,
                status: "submitted",
                notes: "Captured via mobile direct flow",
                media: {
                    photos: type === "posture" ? uploadedMedia : [],
                    videos: type === "movement" ? uploadedMedia.map(v => ({ angle: "captured", url: v.url, path: v.path })) : [],
                    frames: [],
                },
                annotations: { landmarks: { front: [], side: [] }, lines: [], angles: [] },
                metricsSummary: {},
            });

            navigate("/app/cases");
        })();

        toast.promise(submissionPromise, {
            loading: "Uploading and submitting...",
            success: "Assessment submitted!",
            error: "Failed to submit assessment.",
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 p-4">
            <header className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Capture</h2>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${step >= s ? "bg-primary" : "bg-white/10"}`} />
                        ))}
                    </div>
                </div>
                <p className="text-text-muted">
                    {step === 1 ? "Capture or upload media" : step === 2 ? "Select patient profile" : "Choose assessment type"}
                </p>
            </header>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {capturedMedia.map((media, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                                <img src={media.preview} alt="Captured" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeMedia(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary"
                        >
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Camera className="h-8 w-8 text-primary" />
                            </div>
                            <span className="font-bold text-sm">Take Photo / Video</span>
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        multiple
                        onChange={handleCapture}
                        className="hidden"
                    />

                    {capturedMedia.length > 0 && (
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Continue to Patient Selection
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Media
                    </button>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {filteredProfiles.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setSelectedProfile(p); setStep(3); }}
                                className="flex items-center justify-between p-4 bg-surface/30 border border-white/5 rounded-2xl hover:bg-surface/50 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold group-hover:text-primary transition-colors">{p.fullName}</p>
                                        <p className="text-[10px] text-text-muted">{p.phone}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Patient Selection
                    </button>

                    <div className="p-6 bg-surface/50 border border-white/10 rounded-[2rem] flex items-center gap-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <CheckCircle className="h-6 w-6 text-success" />
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Selected Patient</p>
                            <h3 className="text-2xl font-bold">{selectedProfile?.fullName}</h3>
                            <p className="text-xs text-text-muted">{capturedMedia.length} media items ready</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {assessmentModules.map((module) => (
                            <button
                                key={module.id}
                                disabled={isSubmitting}
                                onClick={() => handleSubmit(module.id)}
                                className="flex items-center gap-6 p-6 bg-surface/30 border border-white/5 rounded-[2rem] hover:bg-surface/50 hover:border-primary/40 transition-all group text-left disabled:opacity-50"
                            >
                                <div className={`h-16 w-16 rounded-[1.2rem] ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                    <module.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-bold text-xl group-hover:text-primary transition-colors uppercase tracking-tight">{module.label}</h4>
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
