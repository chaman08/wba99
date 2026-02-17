import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { FileText, ArrowRight, Clock } from "lucide-react";

const statConfig = [
  { label: "Active patients", key: "patients" },
  { label: "Submitted cases", key: "submitted" },
  { label: "Report ready", key: "reportReady" },
];

export const PhysioDashboard = () => {
  const cases = useAppStore((state) => state.cases);
  const patients = useAppStore((state) => state.patients);
  const navigate = useNavigate();

  const filteredCases = cases;
  const filteredPatients = patients;
  const readyReports = cases.filter((item) => item.status === "Report Ready");

  const submitted = filteredCases.filter((item) => item.status === "Submitted").length;
  const reportReady = filteredCases.filter((item) => item.status === "Report Ready").length;
  const stats = {
    patients: filteredPatients.length,
    submitted,
    reportReady,
  };

  const statusMap: Record<string, string> = {
    Draft: "text-text-muted bg-white/5",
    Submitted: "text-accent bg-accent/10",
    Assigned: "text-secondary bg-secondary/10",
    "In Review": "text-primary bg-primary/10",
    "Report Ready": "text-success bg-success/10",
    Completed: "text-text-muted bg-white/5",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {statConfig.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/5 bg-surface/70 p-5 transition hover:shadow-soft-light sm:hover:-translate-y-1"
          >
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-text-muted">{stat.label}</p>
            <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold">{stats[stat.key as keyof typeof stats]}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Activity */}
        <section className="lg:col-span-2 space-y-4 rounded-3xl bg-surface/70 p-6 shadow-soft-light">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Recent case activity</h2>
            <Link to="/cases" className="text-xs text-primary hover:underline">View all cases</Link>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {filteredCases.slice(0, 4).map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(`/cases/${item.id}`)}
                className="group cursor-pointer rounded-3xl border border-white/5 bg-background/40 p-5 transition duration-200 hover:border-primary/40 hover:bg-background/60"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-[0.3em] text-text-muted">{item.id.split('-')[1]}</span>
                  <span className={`rounded-2xl px-3 py-1 text-[10px] font-semibold ${statusMap[item.status]}`}>{item.status}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-text truncate">{item.title}</h3>
                <p className="mt-2 text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Right Column: Reports Section */}
        <section className="space-y-4 rounded-3xl bg-surface/70 p-6 shadow-soft-light">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Ready Reports
            </h2>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
              {readyReports.length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {readyReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-background/30 rounded-2xl border border-dashed border-white/10">
                <FileText className="w-10 h-10 text-text-muted/20 mb-2" />
                <p className="text-sm text-text-muted">No reports ready for review yet.</p>
              </div>
            ) : (
              readyReports.map((reportCase) => (
                <article
                  key={`report-${reportCase.id}`}
                  onClick={() => navigate(`/cases/${reportCase.id}/report`)}
                  className="group cursor-pointer rounded-2xl border border-white/5 bg-background/40 p-4 transition hover:border-success/40 hover:bg-background/60"
                >
                  <p className="text-[10px] uppercase tracking-widest text-text-muted">Case: {reportCase.id.split('-')[1]}</p>
                  <h4 className="mt-1 font-semibold text-text text-sm line-clamp-1 group-hover:text-success transition-colors">{reportCase.title}</h4>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      Available now
                    </span>
                    <ArrowRight className="w-4 h-4 text-success group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              ))
            )}
          </div>

          <button className="w-full mt-2 rounded-2xl bg-white/5 py-3 text-xs font-semibold text-text-muted transition hover:bg-white/10">
            Archive all
          </button>
        </section>
      </div>
    </div>
  );
};
