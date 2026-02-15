import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const patient = useAppStore((state) => state.patients.find((item) => item.id === patientId));
  const cases = useAppStore((state) => state.cases);
  const navigate = useNavigate();

  const timeline = useMemo(() => {
    return [...cases]
      .filter((item) => item.patientId === patientId)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [cases, patientId]);

  if (!patient) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 shadow-soft-light">
        <p className="text-text-muted">Patient not found.</p>
        <button onClick={() => navigate("/patients")} className="mt-4 rounded-2xl border border-white/10 px-4 py-2 text-sm text-primary">
          Back to directory
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Patient</p>
        <h2 className="text-2xl font-semibold text-text">{patient.name}</h2>
        <p className="text-sm text-text-muted">
          Age {patient.age} • Last session {patient.lastSession || "—"}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/5 bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Tags</p>
          <p className="mt-2 text-sm font-semibold text-text-muted">{patient.tags.join(", ")}</p>
        </article>
        <article className="rounded-3xl border border-white/5 bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Submitted cases</p>
          <p className="mt-2 text-2xl font-semibold text-text">{cases.length}</p>
        </article>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Case history</h3>
          <button onClick={() => navigate("/cases")} className="text-xs text-primary underline-offset-4 hover:underline">
            View all
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {timeline.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-white/5 bg-background/40 px-5 py-4 transition hover:border-primary/60 hover:shadow-soft-light"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">{item.title}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-text-muted">{item.status}</span>
              </div>
              <p className="mt-2 text-xs text-text-muted">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
