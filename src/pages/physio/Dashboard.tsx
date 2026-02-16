import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";

const statConfig = [
  { label: "Active patients", key: "patients" },
  { label: "Submitted cases", key: "submitted" },
  { label: "Report ready", key: "reportReady" },
];

export const PhysioDashboard = () => {
  const user = useAppStore((state) => state.authUser);
  const cases = useAppStore((state) => state.cases);
  const patients = useAppStore((state) => state.patients);
  const filteredCases = useMemo(
    () => cases.filter((item) => item.physiotherapistId === user?.id),
    [cases, user?.id],
  );
  const filteredPatients = useMemo(
    () => patients.filter((patient) => patient.physiotherapistId === user?.id),
    [patients, user?.id],
  );

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
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {statConfig.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-white/0 p-5 transition hover:shadow-soft-light sm:hover:-translate-y-1"
          >
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-text-muted">{stat.label}</p>
            <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold">{stats[stat.key as keyof typeof stats]}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Recent case activity</h2>
          <button className="rounded-full border border-white/10 px-4 py-2 text-xs text-text-muted transition hover:border-primary">
            View all
          </button>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {filteredCases.map((item) => (
            <article
              key={item.id}
              className="group rounded-3xl border border-white/5 bg-surface/70 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.3em] text-text-muted">{item.id}</span>
                <span className={`rounded-2xl px-3 py-1 text-[10px] font-semibold ${statusMap[item.status]}`}>{item.status}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.mskSummary}</p>
              <p className="mt-4 text-xs text-text-muted">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
