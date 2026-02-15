import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const CaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const item = useAppStore((state) => state.cases.find((c) => c.id === caseId));
  const patient = useAppStore((state) => state.patients.find((p) => p.id === item?.patientId));
  const assignedAdmin = useAppStore((state) =>
    item?.expertId ? state.users.find((user) => user.id === item.expertId) : undefined,
  );
  const navigate = useNavigate();

  const galleries = useMemo(() => {
    if (!item) return [];
    return Object.entries(item.media).map(([key, slots]) => ({
      label: key,
      count: slots.reduce((acc, slot) => acc + (slot.files.length || 0), 0),
    }));
  }, [item]);

  if (!item) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 text-text">
        <p>Case not found.</p>
        <button onClick={() => navigate("/cases")} className="mt-4 text-sm text-primary underline">
          Back
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{item.id}</p>
        <h1 className="text-2xl font-semibold text-text">{item.title}</h1>
        <p className="text-sm text-text-muted">{patient ? patient.name : "Patient"}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/5 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Status</p>
          <p className="mt-2 text-lg font-semibold text-text">{item.status}</p>
        </article>
        <article className="rounded-3xl border border-white/5 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Created</p>
          <p className="mt-2 text-sm text-text">{new Date(item.createdAt).toLocaleDateString()}</p>
        </article>
        <article className="rounded-3xl border border-white/5 bg-background/50 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Assigned admin</p>
          <p className="mt-2 text-sm text-text">{assignedAdmin?.name || item.expertId || "TBD"}</p>
        </article>
      </div>

      <div className="space-y-3 rounded-3xl border border-white/5 bg-background/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">Media gallery</p>
          <button className="text-xs text-primary underline">Open gallery</button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {galleries.map((group) => (
            <div key={group.label} className="rounded-2xl border border-white/5 bg-surface/80 p-4 text-xs text-text-muted">
              <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">{group.label}</p>
              <p className="mt-2 text-lg font-semibold text-text">{group.count} files</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-background/20 p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">MSK summary</p>
        <p className="mt-2 text-sm text-text">{item.mskSummary}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate(`/cases/${caseId}/report`)} className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-primary">
          View report builder
        </button>
        <button className="rounded-2xl bg-secondary px-4 py-2 text-xs font-semibold text-white">Share</button>
      </div>
    </section>
  );
};
