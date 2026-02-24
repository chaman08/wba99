import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";

export const ExpertDashboard = () => {
  const user = useAppStore((state) => state.authUser);
  const assessments = useAppStore((state) => state.assessments);
  const assignedCases = useMemo(() => assessments.filter((item: any) => item.expertId === user?.uid), [assessments, user?.uid]);

  const statusBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    assignedCases.forEach((item: any) => {
      breakdown[item.status] = (breakdown[item.status] ?? 0) + 1;
    });
    return breakdown;
  }, [assignedCases]);

  const quickFilters = ["Assigned", "In Review", "Report Ready"];

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-text">Expert workspace</h2>
        <p className="text-sm text-text-muted">Cases ready for your clinical interpretation.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/5 bg-background/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Assigned cases</p>
          <p className="mt-2 text-3xl font-semibold text-text">{assignedCases.length}</p>
        </article>
        <article className="rounded-3xl border border-white/5 bg-background/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Highest backlog</p>
          <p className="mt-2 text-sm text-text-muted">Use filters to focus.</p>
        </article>
        <article className="rounded-3xl border border-white/5 bg-background/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Last update</p>
          <p className="mt-2 text-sm text-text-muted">
            {assignedCases[0]?.updatedAt
              ? (typeof assignedCases[0].updatedAt === 'string'
                ? new Date(assignedCases[0].updatedAt)
                : new Date(assignedCases[0].updatedAt.seconds * 1000)
              ).toLocaleDateString()
              : "—"}
          </p>
        </article>
      </div>

      <div className="space-y-3 rounded-3xl border border-white/5 bg-background/20 p-5">
        <div className="flex flex-wrap gap-3">
          {quickFilters.map((filter) => (
            <button key={filter} className="rounded-full border border-white/10 px-4 py-2 text-xs text-text-muted transition hover:border-primary/60">
              {filter}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} className="rounded-2xl border border-white/5 bg-surface/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{status}</p>
              <p className="mt-2 text-2xl font-semibold text-text">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
