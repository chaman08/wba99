import { useFeedbackStore } from "../../store/useFeedbackStore";
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";

export const GlobalFeedback = () => {
    const { toasts, removeToast, isLoading } = useFeedbackStore();

    return (
        <>
            {/* Global Loader */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-sm font-bold tracking-widest uppercase">Processing...</p>
                    </div>
                </div>
            )}

            {/* Toasts Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] flex items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 ${toast.type === "success"
                                ? "bg-green-500/10 border-green-500/20 text-green-500"
                                : toast.type === "error"
                                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                                    : "bg-primary/10 border-primary/20 text-primary"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === "success" && <CheckCircle2 className="h-5 w-5" />}
                            {toast.type === "error" && <AlertCircle className="h-5 w-5" />}
                            {toast.type === "info" && <Info className="h-5 w-5" />}
                            <span className="text-sm font-semibold">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};
