import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const AdminCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const selected = useAppStore((state) => state.cases.find((item) => item.id === caseId));
  const patients = useAppStore((state) => state.patients);
  const users = useAppStore((state) => state.users);
  const updateCase = useAppStore((state) => state.updateCase);
  const navigate = useNavigate();

  const patient = selected ? patients.find((item) => item.id === selected.patientId) : null;
  const experts = users.filter((user) => user.role === "expert");
  const timeline = ["Submitted", "Assigned", "In Review", "Report Ready"];
  const currentIndex = selected ? Math.max(0, timeline.indexOf(selected.status)) : 0;

  const mediaGroups = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected.media).map(([label, slots]) => ({
      label,
      content: slots.map((slot) => slot.files.length ? slot.files.join(", ") : "No uploads"),
    }));
  }, [selected]);

  if (!selected) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 text-text">
        <p>Case not found.</p>
        <button onClick={() => navigate("/admin/cases")} className="mt-4 text-sm text-primary underline">
          Back
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
        <h1 className="text-2xl font-semibold text-text">{selected.title}</h1>
        <p className="text-sm text-text-muted">{patient?.name}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-background/30 p-5">
          <h2 className="text-sm font-semibold text-text">Media viewer</h2>
          <div className="space-y-3">
            {mediaGroups.map((group) => (
              <article key={group.label} className="rounded-2xl border border-white/5 bg-surface/80 p-3 text-xs text-text-muted">
                <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted">{group.label}</p>
                <p className="mt-2 text-sm text-text">{group.content.join(" • ")}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-background/30 p-5">
          <h2 className="text-sm font-semibold text-text">Status & assignment</h2>
          <div className="flex flex-wrap gap-3">
            {timeline.map((step) => (
              <span
                key={step}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  timeline.indexOf(step) <= currentIndex ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <div className="space-y-2 pt-3">
            <label className="text-[11px] text-text-muted">Expert</label>
            <select
              value={selected.expertId ?? ""}
              onChange={(event) =>
                updateCase(selected.id, {
                  expertId: event.target.value || undefined,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none"
            >
              <option value="">Assign expert</option>
              {experts.map((expert) => (
                <option key={expert.id} value={expert.id}>
                  {expert.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] text-text-muted">Status</label>
            <select
              value={selected.status}
              onChange={(event) => updateCase(selected.id, { status: event.target.value as typeof selected.status })}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none"
            >
              {timeline.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <article className="rounded-3xl border border-white/10 bg-background/20 p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">MSK summary</p>
        <p className="mt-2 text-sm text-text">{selected.mskSummary}</p>
      </article>
    </section>
  );
};
