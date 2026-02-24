import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Camera,
  Stethoscope,
  UserPlus,
  FileText
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export const PhysioDashboard = () => {
  const navigate = useNavigate();
  const { authUser, profiles, assessments, reports } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats = useMemo(() => [
    { label: "Total Profiles", value: profiles.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    {
      label: "Analyses (Weekly)", value: assessments.filter(a => {
        const date = new Date(typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.seconds * 1000);
        return date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
      }).length, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10"
    },
    { label: "Reports Ready", value: reports.length, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  ], [profiles, assessments, reports]);

  const recentProfiles = useMemo(() =>
    [...profiles].sort((a, b) => {
      const dateA = new Date(typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.seconds * 1000).getTime();
      const dateB = new Date(typeof b.updatedAt === 'string' ? b.updatedAt : b.updatedAt.seconds * 1000).getTime();
      return dateB - dateA;
    }).slice(0, 5)
    , [profiles]);

  const recentAssessments = useMemo(() =>
    [...assessments].sort((a, b) => {
      const dateA = new Date(typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.seconds * 1000).getTime();
      const dateB = new Date(typeof b.updatedAt === 'string' ? b.updatedAt : b.updatedAt.seconds * 1000).getTime();
      return dateB - dateA;
    }).slice(0, 10)
    , [assessments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Clinic Workspace</h2>
        <p className="text-text-muted">Welcome back, {authUser?.name}. What's next?</p>
      </header>

      {/* Quick Start Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Profile", icon: UserPlus, to: "/app/clients", color: "bg-blue-600" },
          { label: "Posture", icon: Camera, to: "/app/cases/new?type=posture", color: "bg-primary" },
          { label: "Movement", icon: Activity, to: "/app/cases/new?type=movement", color: "bg-secondary" },
          { label: "MSK Form", icon: Stethoscope, to: "/app/cases/new?type=msk", color: "bg-purple-600" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className="flex flex-col items-center justify-center p-6 bg-surface/50 border border-white/5 rounded-[2rem] hover:bg-surface hover:border-primary/20 transition-all group gap-3 shadow-sm"
          >
            <div className={`h-12 w-12 rounded-2xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Recent Assessments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Recent Analysis
            </h3>
          </div>

          <div className="space-y-3">
            {recentAssessments.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/app/cases/${a.id}`)}
                className="group flex items-center justify-between p-4 bg-surface/30 border border-white/5 rounded-2xl hover:bg-surface/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Activity className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors uppercase italic">{a.type} Analysis</p>
                    <p className="text-[10px] text-text-muted">Updated {new Date(typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${a.status === 'final' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                    {a.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            {recentAssessments.length === 0 && (
              <p className="text-sm text-text-muted py-12 text-center italic bg-surface/10 rounded-[2rem] border border-dashed border-white/5">No recent assessments found.</p>
            )}
          </div>
        </div>

        {/* Sidebar Feed: Recent Clients & Snapshot */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Recent Profiles
            </h3>
            <div className="space-y-2">
              {recentProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/app/clients/${p.id}`)}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {p.fullName.charAt(0)}
                    </div>
                    <p className="text-sm font-bold">{p.fullName}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-text-muted" />
                </div>
              ))}
              {recentProfiles.length === 0 && (
                <p className="text-xs text-text-muted p-4 text-center">No profiles added yet.</p>
              )}
            </div>
          </section>

          <section className="p-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 rounded-[2.5rem] space-y-6 shadow-xl shadow-primary/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary opacity-80">Clinic Snapshot</h3>
            <div className="space-y-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center shadow-inner`}>
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[60]">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ${isMenuOpen ? "bg-white text-primary rotate-45" : "bg-primary text-white hover:scale-110 active:scale-95"}`}
        >
          <Plus className="h-8 w-8" />
        </button>

        {isMenuOpen && (
          <>
            <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-[-1]" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute bottom-20 right-0 space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {[
                { label: "Add Profile", icon: UserPlus, to: "/app/clients" },
                { label: "Movement Analysis", icon: Activity, to: "/app/cases/new?type=movement" },
                { label: "Posture Analysis", icon: Camera, to: "/app/cases/new?type=posture" },
                { label: "MSK Screening", icon: Stethoscope, to: "/app/cases/new?type=msk" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.to); setIsMenuOpen(false); }}
                  className="flex items-center gap-4 px-6 py-5 bg-surface-light border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-surface hover:text-primary transition-all whitespace-nowrap w-full group active:scale-95"
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <item.icon className="h-5 w-5 text-primary group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
