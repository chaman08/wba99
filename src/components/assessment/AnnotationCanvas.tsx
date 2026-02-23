import React, { useState, useRef } from "react";

export interface Landmark {
    id: string;
    label: string;
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
}

interface AnnotationCanvasProps {
    image: string;
    landmarks: Landmark[];
    onChange: (landmarks: Landmark[]) => void;
    activeLandmarkId?: string;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
    image,
    landmarks,
    onChange,
    activeLandmarkId
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const handleMouseDown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingId(id);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (draggingId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // If an active landmark is selected but not placed, update it
        if (activeLandmarkId) {
            const updated = landmarks.map(l =>
                l.id === activeLandmarkId ? { ...l, x, y } : l
            );
            onChange(updated);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        const updated = landmarks.map(l =>
            l.id === draggingId ? { ...l, x, y } : l
        );
        onChange(updated);
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black/20 overflow-hidden cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleContainerClick}
        >
            {/* Base Image */}
            <img
                src={image}
                alt="Assessment"
                className="w-full h-full object-contain pointer-events-none"
            />

            {/* SVG Overlay for lines and dots */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Draw lines between related landmarks if needed (e.g., Shoulder L to Shoulder R) */}
                {landmarks.some(l => l.id.includes("Shoulder L") && l.x > 0) &&
                    landmarks.some(l => l.id.includes("Shoulder R") && l.x > 0) && (
                        <line
                            x1={`${landmarks.find(l => l.id.includes("Shoulder L"))?.x}%`}
                            y1={`${landmarks.find(l => l.id.includes("Shoulder L"))?.y}%`}
                            x2={`${landmarks.find(l => l.id.includes("Shoulder R"))?.x}%`}
                            y2={`${landmarks.find(l => l.id.includes("Shoulder R"))?.y}%`}
                            stroke="rgba(59, 130, 246, 0.5)"
                            strokeWidth="2"
                            strokeDasharray="4"
                        />
                    )}
            </svg>

            {/* Landmarks as Interactive Dots */}
            {landmarks.map((l) => (
                l.x > 0 && l.y > 0 && (
                    <div
                        key={l.id}
                        style={{ left: `${l.x}%`, top: `${l.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20`}
                        onMouseDown={(e) => handleMouseDown(l.id, e)}
                    >
                        {/* The Dot */}
                        <div className={`h-4 w-4 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 cursor-move flex items-center justify-center ${activeLandmarkId === l.id ? "bg-primary scale-125" : "bg-primary/80"
                            }`}>
                            <div className="h-1 w-1 bg-white rounded-full" />
                        </div>

                        {/* Label */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface-dark/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {l.label}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
};
