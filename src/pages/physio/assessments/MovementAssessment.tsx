import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";
import { AssessmentLayout } from "../../../components/layout/AssessmentLayout";
import {
    Video as VideoIcon,
    Trash2,
    CheckCircle2,
    Plus,
    Target
} from "lucide-react";
import type { Landmark } from "../../../components/assessment/AnnotationCanvas";
import { AnnotationCanvas } from "../../../components/assessment/AnnotationCanvas";
import { VideoScrubber } from "../../../components/assessment/VideoScrubber";

const STEPS = [
    { id: 1, label: "Video Upload" },
    { id: 2, label: "Analysis" },
    { id: 3, label: "Results" },
    { id: 4, label: "Review & Save" }
];

const MOVEMENT_LANDMARKS = [
    { id: "m_spine", label: "Lower Spine" },
    { id: "m_hip", label: "Hip" },
    { id: "m_knee", label: "Knee" },
    { id: "m_ank", label: "Ankle" },
];

export const MovementAssessment = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const patient = useAppStore((state: any) => state.patients.find((p: any) => p.id === clientId));
    const addCase = useAppStore((state: any) => state.addCase);

    const [currentStep, setCurrentStep] = useState(1);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [capturedFrames, setCapturedFrames] = useState<{ id: string; url: string; landmarks: Landmark[] }[]>([]);
    const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
    const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        }
    };

    const handleCaptureFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameUrl = canvas.toDataURL("image/jpeg");
            const newFrame = {
                id: `frame_${Date.now()}`,
                url: frameUrl,
                landmarks: MOVEMENT_LANDMARKS.map(l => ({ ...l, x: 0, y: 0 }))
            };
            setCapturedFrames(prev => [...prev, newFrame]);
            setActiveFrameId(newFrame.id);
            setCurrentStep(2); // Auto-advance to analysis if capturing from upload step
        }
    };

    const updateFrameLandmarks = (frameId: string, landmarks: Landmark[]) => {
        setCapturedFrames(prev => prev.map(f => f.id === frameId ? { ...f, landmarks } : f));
    };

    const activeFrame = capturedFrames.find(f => f.id === activeFrameId);

    const calculateAngles = (_landmarks: Landmark[]) => {
        // Logic for Knee Flexion (Hip-Knee-Ankle)
        // Logic for Hip Flexion (Spine-Hip-Knee)
        // This would involve vector math (Math.atan2)
        return { knee: 145, hip: 20 }; // Example
    };

    const isTreadmill = window.location.pathname.includes("treadmill");
    const [treadmillInfo, setTreadmillInfo] = useState({ speed: "", incline: "", footwear: "" });

    const handleSave = async () => {
        if (!clientId) return;
        try {
            await addCase({
                title: `${isTreadmill ? 'Treadmill' : 'Movement'} Assessment - ${new Date().toLocaleDateString()}`,
                patientId: clientId,
                status: "Draft",
                media: {
                    posture: [],
                    ground: isTreadmill ? [] : capturedFrames.map(f => ({
                        id: f.id,
                        label: "Action Frame",
                        files: [f.url],
                        required: true,
                        completed: true,
                        landmarks: f.landmarks,
                        measurements: calculateAngles(f.landmarks)
                    })),
                    treadmill: isTreadmill ? capturedFrames.map(f => ({
                        id: f.id,
                        label: "Treadmill Frame",
                        files: [f.url],
                        required: true,
                        completed: true,
                        landmarks: f.landmarks,
                        measurements: calculateAngles(f.landmarks),
                        ...treadmillInfo
                    })) : []
                }
            });
            navigate(`/app/clients/${clientId}`);
        } catch (error) {
            console.error("Failed to save assessment", error);
        }
    };

    return (
        <AssessmentLayout
            title={isTreadmill ? "Treadmill Analysis" : "Movement Assessment"}
            clientName={patient?.name || "Unknown Client"}
            currentStep={currentStep}
            steps={STEPS}
            onNext={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))}
            onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            onSave={handleSave}
            onExit={() => navigate(`/app/clients/${clientId}`)}
            isNextDisabled={currentStep === 1 && !videoUrl}
        >
            <div className="h-full w-full p-4 lg:p-8 overflow-y-auto">
                <canvas ref={canvasRef} className="hidden" />

                {currentStep === 1 && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="text-center space-y-2">
                            <h2 className="text-3xl font-bold italic tracking-tight uppercase">
                                {isTreadmill ? "Upload Treadmill Video" : "Upload Action Video"}
                            </h2>
                            <p className="text-text-muted">Record the client's movement for biomechanical analysis.</p>
                        </header>

                        {isTreadmill && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: "Speed (km/h)", key: "speed" },
                                    { label: "Incline (%)", key: "incline" },
                                    { label: "Footwear", key: "footwear" }
                                ].map(field => (
                                    <div key={field.key} className="p-4 bg-surface/50 border border-white/5 rounded-2xl">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">{field.label}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-transparent border-none focus:outline-none text-sm font-bold placeholder:font-normal"
                                            placeholder="Enter data..."
                                            value={(treadmillInfo as any)[field.key]}
                                            onChange={(e) => setTreadmillInfo({ ...treadmillInfo, [field.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!videoUrl ? (
                            <div className="group relative aspect-video bg-surface/50 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center hover:border-primary/40 transition-all">
                                <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                    <VideoIcon className="h-10 w-10 text-text-muted group-hover:text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-bold text-xl">Drag & Drop Video</p>
                                    <p className="text-sm text-text-muted">Supports MP4, MOV, and WebM format</p>
                                </div>
                                <label className="mt-8 px-10 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-xl shadow-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-all">
                                    Browse Files
                                    <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                    <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => setVideoUrl(null)}
                                        className="absolute top-6 right-6 p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                <VideoScrubber videoRef={videoRef} onCapture={handleCaptureFrame} />
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="h-full flex flex-col animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none">
                            {capturedFrames.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFrameId(f.id)}
                                    className={`h-16 w-24 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${activeFrameId === f.id ? "border-primary scale-105" : "border-white/5 grayscale"}`}
                                >
                                    <img src={f.url} className="w-full h-full object-cover" />
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="h-16 w-24 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-text-muted hover:border-primary/40 hover:text-primary transition-all shrink-0"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 bg-surface/30 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col lg:flex-row relative">
                            <div className="flex-1 relative bg-black/50 flex items-center justify-center">
                                {activeFrame ? (
                                    <AnnotationCanvas
                                        image={activeFrame.url}
                                        landmarks={activeFrame.landmarks}
                                        onChange={(newLandmarks) => updateFrameLandmarks(activeFrame.id, newLandmarks)}
                                        activeLandmarkId={activeLandmarkId || undefined}
                                    />
                                ) : (
                                    <p className="text-text-muted">Capture or select a frame to begin analysis.</p>
                                )}
                            </div>

                            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col h-full bg-surface/50">
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" /> Joint Markers
                                </h3>
                                <div className="flex-1 space-y-2">
                                    {activeFrame?.landmarks.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setActiveLandmarkId(l.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${activeLandmarkId === l.id ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">{l.label}</span>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${l.x > 0 ? "bg-primary border-primary" : "border-white/20"}`}>
                                                {l.x > 0 && <CheckCircle2 className="h-3 w-3 text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep >= 3 && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                            <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Analysis Ready</h3>
                        <p className="text-text-muted">Biofeedback and summary logic will be finalized in the next build.</p>
                        <button onClick={handleSave} className="mt-8 px-10 py-4 bg-primary text-white rounded-[2rem] font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            Finalize Assessment
                        </button>
                    </div>
                )}
            </div>
        </AssessmentLayout>
    );
};
