import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { FileDown, ArrowLeft, CheckCircle, Clock } from "lucide-react";

export const CaseReport = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const selected = useAppStore((state) => state.cases.find((item) => item.id === caseId));
  const existingReport = useAppStore((state) => state.reports.find((report) => report.caseId === caseId));

  if (!selected) {
    return (
      <div className="rounded-3xl bg-surface/70 p-8 text-center border border-white/10">
        <p className="text-text-muted">Case profile missing.</p>
        <button onClick={() => navigate("/dashboard")} className="mt-4 text-sm text-primary underline">Back to dashboard</button>
      </div>
    );
  }

  const timeline = ["Submitted", "Assigned", "In Review", "Report Ready"];
  const currentIndex = Math.max(0, timeline.indexOf(selected.status));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Card */}
      <section className="rounded-3xl bg-surface/70 p-6 shadow-soft-light border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
              <h1 className="text-2xl font-semibold text-text">{selected.title}</h1>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 shadow-lg shadow-primary/20">
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${selected.status === 'Report Ready' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Status</p>
              <p className="text-sm font-semibold">{selected.status}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-text-muted">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Updated</p>
              <p className="text-sm font-semibold">{new Date(selected.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="rounded-3xl bg-surface/70 p-6 shadow-soft-light border border-white/5">
        <div className="flex flex-wrap gap-4">
          {timeline.map((step, idx) => (
            <div key={step} className="flex-1 min-w-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold ${idx <= currentIndex ? 'text-primary' : 'text-text-muted/40'}`}>0{idx + 1}</span>
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${idx <= currentIndex ? 'text-text' : 'text-text-muted/40'}`}>{step}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${idx <= currentIndex ? (idx === 3 ? 'bg-success' : 'bg-primary') : 'bg-transparent'}`}
                  style={{ width: idx <= currentIndex ? '100%' : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Report Content */}
      <section className="space-y-6">
        {!existingReport ? (
          <div className="rounded-3xl bg-surface/70 p-12 text-center border border-white/5 border-dashed">
            <p className="text-text-muted">This report is still being processed by our clinical experts.</p>
          </div>
        ) : (
          Object.entries(existingReport.sections).map(([key, content]) => (
            <article key={key} className="rounded-3xl bg-surface/70 p-8 shadow-soft-light border border-white/5 space-y-4">
              <h3 className="text-xs uppercase tracking-[0.4em] text-primary font-bold">{key}</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-text leading-relaxed whitespace-pre-wrap">{content || "No data provided for this section."}</p>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Footer Info */}
      <div className="text-center text-text-muted text-xs pt-4">
        <p>This is a generated report based on clinical assessment data provided by the physiotherapist.</p>
        <p className="mt-1">© 2026 WBA99 Clinical Platform</p>
      </div>
    </div>
  );
};
