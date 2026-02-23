import type { ReactNode } from "react";
import { X, Save, ArrowRight, ArrowLeft } from "lucide-react";

interface Step {
    id: number;
    label: string;
}

interface AssessmentLayoutProps {
    title: string;
    clientName: string;
    currentStep: number;
    steps: Step[];
    children: ReactNode;
    onNext: () => void;
    onPrev: () => void;
    onSave: () => void;
    onExit: () => void;
    isNextDisabled?: boolean;
}

export const AssessmentLayout = ({
    title,
    clientName,
    currentStep,
    steps,
    children,
    onNext,
    onPrev,
    onSave,
    onExit,
    isNextDisabled = false
}: AssessmentLayoutProps) => {
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
            {/* Top Header */}
            <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-surface/30 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-xl text-text-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div>
                        <h1 className="text-sm font-bold text-text">{title}</h1>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{clientName}</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="hidden md:flex items-center gap-8">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${currentStep >= step.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-text-muted"
                                }`}>
                                {step.id}
                            </div>
                            <span className={`text-xs font-semibold ${currentStep === step.id ? "text-text" : "text-text-muted"}`}>
                                {step.label}
                            </span>
                            {step.id < steps.length && <div className="w-8 h-px bg-white/10" />}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onSave}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-text-muted"
                    >
                        <Save className="h-4 w-4" />
                        Save Draft
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>

            {/* Bottom Footer Controls */}
            <footer className="h-20 border-t border-white/10 px-6 flex items-center justify-between bg-surface/50 backdrop-blur-xl">
                <button
                    onClick={onPrev}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-text-muted hover:text-text hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="flex items-center gap-3">
                    {currentStep === steps.length ? (
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Complete & Save
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            disabled={isNextDisabled}
                            className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            Next Step
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};
