import { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";

export const AdminDashboard = () => {
  const assessments = useAppStore((state) => state.assessments);
  const users = useAppStore((state) => state.users);

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users],
  );

  const stats = useMemo(() => {
    const total = assessments.length;
    const pending = assessments.filter((item: any) => item.status === "Submitted" || item.status === "submitted").length;
    const completed = assessments.filter((item: any) => item.status === "Report Ready" || item.status === "Completed" || item.status === "completed" || item.status === "final").length;
    return { total, pending, completed, admins: adminCount };
  }, [assessments, adminCount]);

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header>
        <h2 className="text-xl font-semibold text-text">Admin cockpit</h2>
      </header>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total cases" value={stats.total} />
        <StatCard label="Pending assignment" value={stats.pending} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Active admins" value={stats.admins} />
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
