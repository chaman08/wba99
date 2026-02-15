import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";

export const AdminDashboard = () => {
  const cases = useAppStore((state) => state.cases);
  const experts = useAppStore((state) => state.users.filter((user) => user.role === "expert"));

  const stats = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter((item) => item.status === "Submitted").length;
    const completed = cases.filter((item) => item.status === "Report Ready" || item.status === "Completed").length;
    return { total, pending, completed, experts: experts.length };
  }, [cases, experts.length]);

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header>
        <h2 className="text-xl font-semibold text-text">Admin cockpit</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total cases" value={stats.total} />
        <StatCard label="Pending assignment" value={stats.pending} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Active experts" value={stats.experts} />
      </div>
    </section>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <article className="rounded-3xl border border-white/5 bg-background/30 p-5">
    <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label}</p>
    <p className="mt-4 text-3xl font-semibold text-text">{value}</p>
  </article>
);
