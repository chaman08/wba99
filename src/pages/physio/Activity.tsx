import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { Clock, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export const PhysioActivity = () => {
    const assessments = useAppStore((state) => state.assessments);
    const authUser = useAppStore((state) => state.authUser);
    const navigate = useNavigate();

    // Scoped to the current user (clinician)
    const myActivities = useMemo(() => {
        return [...assessments]
            .filter((a) => a.createdBy === authUser?.uid)
            .sort((a, b) => {
                const dateA = new Date(typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.seconds * 1000).getTime();
                const dateB = new Date(typeof b.updatedAt === 'string' ? b.updatedAt : b.updatedAt.seconds * 1000).getTime();
                return dateB - dateA;
            });
    }, [assessments, authUser?.uid]);

    const statusMap: Record<string, { label: string; class: string; icon: any }> = {
        draft: { label: "Draft", class: "bg-white/5 text-text-muted", icon: <Clock className="w-3 h-3" /> },
        submitted: { label: "Submitted", class: "bg-accent/10 text-accent", icon: <AlertCircle className="w-3 h-3" /> },
        assigned: { label: "Assigned", class: "bg-secondary/10 text-secondary", icon: <Clock className="w-3 h-3" /> },
        review: { label: "In Review", class: "bg-primary/10 text-primary", icon: <FileText className="w-3 h-3" /> },
        final: { label: "Report Ready", class: "bg-success/10 text-success", icon: <CheckCircle className="w-3 h-3" /> },
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <header className="rounded-3xl bg-surface/70 p-6 shadow-soft-light border border-white/5">
                <h2 className="text-2xl font-semibold text-text">Activity History</h2>
                <p className="text-sm text-text-muted mt-1">Track all your submitted analyses and report statuses.</p>
            </header>

            <div className="grid gap-4">
                {myActivities.length === 0 ? (
                    <div className="rounded-3xl bg-surface/70 p-12 text-center border border-white/5 border-dashed">
                        <Clock className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                        <p className="text-text-muted">No activity recorded yet.</p>
                        <Link to="/app/cases/new" className="mt-4 inline-block text-primary hover:underline text-sm font-semibold">
                            Start your first analysis
                        </Link>
                    </div>
                ) : (
                    myActivities.map((item) => (
                        <article
                            key={item.id}
                            onClick={() => navigate(`/app/cases/${item.id}`)}
                            className="group cursor-pointer rounded-3xl border border-white/5 bg-surface/70 p-5 transition duration-200 hover:border-primary/40 hover:bg-surface/90 hover:shadow-soft-light flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`mt-1 p-2.5 rounded-2xl bg-white/5 text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold truncate max-w-[100px]">{item.id}</span>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusMap[item.status]?.class || 'bg-white/5 text-text-muted'}`}>
                                            {statusMap[item.status]?.icon || <Clock className="w-3 h-3" />}
                                            {statusMap[item.status]?.label || item.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-text uppercase italic">{item.type} Analysis</h3>
                                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        Last activity: {new Date(typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {item.status === 'final' ? (
                                    <span className="text-xs font-bold text-success bg-success/10 px-4 py-2 rounded-xl">
                                        View Report
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-text-muted bg-white/5 px-4 py-2 rounded-xl">
                                        Check Status
                                    </span>
                                )}
                                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};
