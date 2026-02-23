import { FileText, Search } from "lucide-react";

export const ReportsPage = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                <p className="text-text-muted">Manage and export client clinical reports.</p>
            </header>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search by client or date..."
                    className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
            </div>

            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-surface/20 border border-dashed border-white/10 rounded-[3rem]">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-text-muted/20" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-text-muted">No reports generated yet</p>
                    <p className="text-sm text-text-muted/60">Complete an assessment to start building reports.</p>
                </div>
            </div>
        </div>
    );
};
