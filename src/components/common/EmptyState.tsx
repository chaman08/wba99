import type { ReactNode } from "react";
import { Plus } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
}

export const EmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
    icon
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                {icon || <Plus className="h-8 w-8" />}
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-8">{description}</p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
