import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const AdminCases = () => {
  const allCases = useAppStore((state) => state.cases);
  const users = useAppStore((state) => state.users);
  const updateCase = useAppStore((state) => state.updateCase);
  const [statusFilter, setStatusFilter] = useState("All");
  const [physioFilter, setPhysioFilter] = useState("All");
  const [adminFilter, setAdminFilter] = useState("All");
  const [query, setQuery] = useState("");

  const statuses = ["All", "Draft", "Submitted", "Assigned", "In Review", "Report Ready", "Completed"];
  const physios = users.filter((user) => user.role === "physio");
  const admins = users.filter((user) => user.role === "admin");

  const filtered = useMemo(() => {
    return allCases.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesPhysio = physioFilter === "All" || item.physiotherapistId === physioFilter;
      const matchesAdmin = adminFilter === "All" || item.expertId === adminFilter;
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesPhysio && matchesAdmin && matchesQuery;
    });
  }, [allCases, statusFilter, physioFilter, adminFilter, query]);

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text">All cases</h2>
          <p className="text-sm text-text-muted">Assign, refocus, and close the loop.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search cases"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text outline-none"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select value={physioFilter} onChange={(event) => setPhysioFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text">
            <option value="All">Physiotherapist</option>
            {physios.map((physio) => (
              <option key={physio.id} value={physio.id}>
                {physio.name}
              </option>
            ))}
          </select>
          <select value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text">
            <option value="All">Admin</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-background/30 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{item.id}</p>
              <h3 className="text-lg font-semibold text-text">{item.title}</h3>
              <p className="text-sm text-text-muted">{item.mskSummary}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={item.status}
                onChange={(event) => updateCase(item.id, { status: event.target.value as typeof item.status })}
                className="rounded-2xl border border-white/10 bg-background px-3 py-2 text-xs text-text outline-none"
              >
                {statuses.slice(1).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={item.expertId ?? ""}
                onChange={(event) => updateCase(item.id, { expertId: event.target.value })}
                className="rounded-2xl border border-white/10 bg-background px-3 py-2 text-xs text-text outline-none"
              >
                <option value="">Assign admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
              <Link
                to={`/admin/cases/${item.id}`}
                className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-primary"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
