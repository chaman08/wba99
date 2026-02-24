import type { ReactNode } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";

interface ChartCardProps {
    title: string;
    children: ReactNode;
    subtitle?: string;
    onFilterChange?: (filter: string) => void;
    onSortChange?: (sort: string) => void;
    onToggleView?: () => void;
    averageValue?: string | number;
    showWarning?: boolean;
}

export const ChartCard = ({
    title,
    children,
    subtitle,
    averageValue,
    showWarning
}: ChartCardProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1 px-2 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center gap-1 text-[10px] font-medium text-slate-500 transition-colors">
                        Monthly <ChevronDown className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 min-h-[200px]">
                    {children}
                </div>

                {(averageValue !== undefined || showWarning) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        {averageValue !== undefined && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Average:</span>
                                <span className="text-sm font-bold text-[#0F172A]">{averageValue}</span>
                            </div>
                        )}
                        {showWarning && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                NEEDS ATTENTION
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
