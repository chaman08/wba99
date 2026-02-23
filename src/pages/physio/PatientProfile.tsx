import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import {
  User,
  Phone,
  Calendar,
  ChevronLeft,
  Plus,
  FileText,
  History,
  Camera,
  Activity,
  Stethoscope,
  PlusCircle,
  ChevronRight,
  ClipboardList
} from "lucide-react";

type AssessmentTab = "overview" | "posture" | "movement" | "msk" | "reports";

export const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const patient = useAppStore((state: any) => state.patients.find((item: any) => item.id === patientId));
  const cases = useAppStore((state: any) => state.cases.filter((item: any) => item.patientId === patientId));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AssessmentTab>("overview");

  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cases]);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-text-muted mb-4">Client not found.</p>
        <button onClick={() => navigate("/app/clients")} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all">
          <ChevronLeft className="h-4 w-4" />
          Back to Directory
        </button>
      </div>
    );
  }

  const tabs: { id: AssessmentTab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: History },
    { id: "posture", label: "Posture", icon: Camera },
    { id: "movement", label: "Movement", icon: Activity },
    { id: "msk", label: "MSK", icon: Stethoscope },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Navigation */}
      <button
        onClick={() => navigate("/app/clients")}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Clients
      </button>

      {/* Hero Header */}
      <section className="bg-surface/50 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{patient.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Age: {patient.age}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {patient.gender || 'Not specified'}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {patient.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/app/cases/new?clientId=${patient.id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Start Assessment
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
              <FileText className="h-5 w-5" />
              Create Report
            </button>
          </div>
        </div>

        {/* Sub-stats (Height/Weight etc) */}
        {(patient.height || patient.weight || patient.complaint) && (
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {patient.height && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                  Height
                </p>
                <p className="text-lg font-bold">{patient.height} cm</p>
              </div>
            )}
            {patient.weight && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                  Weight
                </p>
                <p className="text-lg font-bold">{patient.weight} kg</p>
              </div>
            )}
            {patient.complaint && (
              <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                  Complaint
                </p>
                <p className="text-sm font-medium line-clamp-2">{patient.complaint}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Main Content Area with Tabs */}
      <section className="space-y-6">
        {/* Tabs Scroller */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative shrink-0 ${activeTab === tab.id ? "text-primary" : "text-text-muted hover:text-text"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-lg shadow-primary/40 animate-in slide-in-from-bottom-2" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Latest Posture", icon: Camera, type: "posture", color: "text-blue-500" },
                  { label: "Latest Movement", icon: Activity, type: "movement", color: "text-green-500" },
                  { label: "Latest MSK", icon: Stethoscope, type: "msk", color: "text-purple-500" },
                ].map((summary) => {
                  const lastCase = cases.find((c: any) => c.title.toLowerCase().includes(summary.type));
                  return (
                    <div key={summary.label} className="p-6 bg-surface/30 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${summary.color}`}>
                          <summary.icon className="h-5 w-5" />
                        </div>
                        {lastCase && <span className="text-[10px] font-bold text-text-muted">{new Date(lastCase.updatedAt).toLocaleDateString()}</span>}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">{summary.label}</p>
                        <p className="font-bold">{lastCase ? "Completed" : "No Data Yet"}</p>
                      </div>
                      {lastCase ? (
                        <button onClick={() => navigate(`/app/cases/${lastCase.id}`)} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                          View Results <ChevronRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <button onClick={() => navigate(`/app/assess?clientId=${patient.id}&module=${summary.type}`)} className="text-xs font-bold text-text-muted flex items-center gap-1 hover:text-primary transition-colors">
                          Start Now <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg px-2">Clinical Notes</h4>
                <div className="p-6 bg-surface/20 border border-white/5 rounded-[2rem] text-sm text-text-muted leading-relaxed italic">
                  {patient.notes || "No clinical notes provided for this client."}
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCases
                .filter((c: any) => activeTab === "reports" ? c.status === "Report Ready" : c.title.toLowerCase().includes(activeTab))
                .map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/app/cases/${c.id}`)}
                    className="group text-left p-5 bg-surface/30 border border-white/5 rounded-[2rem] hover:bg-surface/50 hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <History className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${c.status === 'Report Ready' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                        {c.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1 truncate">{c.title}</h4>
                    <p className="text-xs text-text-muted">{new Date(c.updatedAt).toLocaleDateString()}</p>

                    <div className="mt-6 flex items-center justify-between text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}

              {/* Empty State for each tab */}
              {sortedCases.filter(c => activeTab === "reports" ? c.status === "Report Ready" : c.title.toLowerCase().includes(activeTab)).length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <PlusCircle className="h-8 w-8 text-text-muted/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-text-muted">No {activeTab} records yet</p>
                    <p className="text-sm text-text-muted/60">Start a new {activeTab} record for this client.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Shortcut */}
      {cases.length >= 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-surface/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-8 z-30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">Ready to compare assessments?</p>
          </div>
          <button className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95">
            Compare Now
          </button>
        </div>
      )}
    </div>
  );
};
