import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Scissors } from "lucide-react";

interface VideoScrubberProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onCapture: () => void;
}

export const VideoScrubber: React.FC<VideoScrubberProps> = ({ videoRef, onCapture }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [videoRef]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const seek = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            videoRef.current.currentTime = percentage * duration;
        }
    };

    return (
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
            {/* Progress Bar */}
            <div
                ref={progressRef}
                className="h-2 bg-white/5 rounded-full cursor-pointer relative group"
                onClick={handleProgressClick}
            >
                <div
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => seek(-0.033)} // ~1 frame at 30fps
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                        title="Previous Frame"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                    </button>

                    <button
                        onClick={() => seek(0.033)} // ~1 frame at 30fps
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                        title="Next Frame"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="ml-4 text-xs font-mono text-text-muted">
                        {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                    </div>
                </div>

                <button
                    onClick={onCapture}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    <Scissors className="h-5 w-5" />
                    Capture Frame
                </button>
            </div>
        </div>
    );
};
