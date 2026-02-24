import { useState, useMemo } from "react";
import {
    FileText,
    Search,
    ChevronRight,
    Calendar,
    User as UserIcon,
    ArrowLeft,
    Share2,
    Printer,
    Target,
    ClipboardCheck,
    Footprints
} from "lucide-react";
import { useAppStore } from "../../../store/useAppStore";
import { format } from "date-fns/format";

export const ReportsPage = () => {
    const profiles = useAppStore((state) => state.profiles);
    const assessments = useAppStore((state) => state.assessments);
    const organisation = useAppStore((state) => state.organisation);

    const [search, setSearch] = useState("");
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

    const filteredAssessments = useMemo(() => {
        return assessments.filter((a) => {
            const profile = profiles.find((p) => p.id === a.profileId);
            return (
                a.type.toLowerCase().includes(search.toLowerCase()) ||
                profile?.fullName.toLowerCase().includes(search.toLowerCase())
            );
        }).sort((a, b) => {
            const dateA = new Date(typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.seconds * 1000).getTime();
            const dateB = new Date(typeof b.createdAt === 'string' ? b.createdAt : b.createdAt.seconds * 1000).getTime();
            return dateB - dateA;
        });
    }, [assessments, profiles, search]);

    const selectedAssessment = useMemo(() =>
        assessments.find((a) => a.id === selectedAssessmentId)
        , [assessments, selectedAssessmentId]);

    const profile = useMemo(() =>
        profiles.find((p) => p.id === selectedAssessment?.profileId)
        , [profiles, selectedAssessment]);

    if (selectedAssessmentId && selectedAssessment) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => setSelectedAssessmentId(null)}
                        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors self-start"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Reports
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                            <Share2 className="h-4 w-4" /> Share
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all">
                            <Printer className="h-4 w-4" /> Print PDF
                        </button>
                    </div>
                </header>

                {/* Report Preview Surface */}
                <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[800px] flex flex-col">
                    {/* Branded Header */}
                    <div className="p-12 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
                        <div className="space-y-4">
                            {organisation?.logoUrl ? (
                                <img src={organisation.logoUrl} className="h-16 object-contain" alt="Org Logo" />
                            ) : (
                                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black italic">W</div>
                            )}
                            <div>
                                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                                    {organisation?.name || "WBA99 Biomechanical Analysis"}
                                </h1>
                                <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Clinical Patient Report</p>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-slate-900 font-bold text-sm uppercase">{organisation?.name || "Lead Practitioner"}</p>
                            <p className="text-slate-500 text-xs font-medium">{organisation?.address1}</p>
                            <p className="text-slate-500 text-xs font-medium">{organisation?.phone}</p>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="flex-1 p-12 space-y-12">
                        {/* Patient Summary */}
                        <section className="grid grid-cols-4 gap-8 pb-8 border-b border-slate-100">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                                <p className="text-slate-900 font-bold text-lg">{profile?.fullName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profile ID</p>
                                <p className="text-slate-900 font-bold text-lg">#{profile?.id.split('-')[1]}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Analysis Date</p>
                                <p className="text-slate-900 font-bold text-lg">
                                    {format(new Date(typeof selectedAssessment.createdAt === 'string' ? selectedAssessment.createdAt : selectedAssessment.createdAt.seconds * 1000), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment Type</p>
                                <p className="text-primary font-bold text-lg italic uppercase">{selectedAssessment.type}</p>
                            </div>
                        </section>

                        {/* Assessment Blocks */}
                        <div className="space-y-12">
                            {selectedAssessment.media.photos.length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-xl font-black uppercase italic flex items-center gap-3 border-l-4 border-primary pl-4">
                                        <Target className="h-6 w-6 text-primary" /> Postural Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {selectedAssessment.media.photos.map((p, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                                    <img src={p.url} className="w-full h-full object-cover" alt={p.view} />
                                                </div>
                                                <p className="text-[10px] font-bold text-center uppercase text-slate-500 tracking-widest">{p.view}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {selectedAssessment.media.videos.length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-xl font-black uppercase italic flex items-center gap-3 border-l-4 border-secondary pl-4">
                                        <Footprints className="h-6 w-6 text-secondary" /> Movement Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {selectedAssessment.media.videos.map((v, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                                                    <video src={v.url} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                                        <span className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                                                            <Target className="h-6 w-6 text-white opacity-40" />
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-center uppercase text-slate-500 tracking-widest">{v.angle}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {selectedAssessment.metricsSummary && (
                                <section className="space-y-6">
                                    <h3 className="text-xl font-black uppercase italic flex items-center gap-3 border-l-4 border-secondary pl-4">
                                        <ClipboardCheck className="h-6 w-6 text-secondary" /> Metrics Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pain Score (VAS)</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">{selectedAssessment.metricsSummary.painScore ?? 0}</span>
                                                <span className="text-slate-400 font-bold text-sm mb-1 uppercase">/ 10</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Shoulder Tilt</p>
                                            <p className="text-slate-900 font-bold">{selectedAssessment.metricsSummary.shoulderTiltDeg?.toFixed(1) ?? "N/A"}°</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-12 bg-slate-900 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 italic">Generated by WBA99 Biomechanics Engine</p>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Confidential Medical Record</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight">Report List</h2>
                <p className="text-text-muted">Access and print assessment results for your clients.</p>
            </header>

            <div className="space-y-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search reports by client or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredAssessments.map((a) => {
                        const prof = profiles.find((p) => p.id === a.profileId);
                        return (
                            <button
                                key={a.id}
                                onClick={() => setSelectedAssessmentId(a.id)}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface/30 border border-white/5 rounded-[2.5rem] hover:bg-surface/50 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div className="text-left space-y-1">
                                        <h4 className="font-bold text-xl uppercase italic group-hover:text-primary transition-colors">{a.type} Analysis</h4>
                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                                            <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {prof?.fullName}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.seconds * 1000), 'MMM dd')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-6 md:mt-0">
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === 'final' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                                        {a.status}
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                    {filteredAssessments.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-surface/10 border border-dashed border-white/5 rounded-[3rem]">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                                <FileText className="h-10 w-10 text-text-muted" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg text-text-muted">No reports found</p>
                                <p className="text-sm text-text-muted/60">Complete an assessment to generate your first report.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
