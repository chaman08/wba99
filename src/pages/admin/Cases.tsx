import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { User, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const AdminCases = () => {
  const allCases = useAppStore((state) => state.cases);
  const users = useAppStore((state) => state.users);
  const updateCase = useAppStore((state) => state.updateCase);
  const [statusFilter, setStatusFilter] = useState("All");
  const [physioFilter, setPhysioFilter] = useState("All");
  const [adminFilter, setAdminFilter] = useState("All");
  const [query, setQuery] = useState("");

  const statuses = ["All", "Draft", "Submitted", "Assigned", "In Review", "Report Ready", "Completed"];
  const physios = users.filter((u) => u.role === "physio");
  const admins = users.filter((u) => u.role === "admin");

  const filtered = useMemo(() => {
    return allCases.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesPhysio = physioFilter === "All" || item.physiotherapistId === physioFilter;
      const matchesAdmin = adminFilter === "All" || item.expertId === adminFilter;
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesPhysio && matchesAdmin && matchesQuery;
    });
  }, [allCases, statusFilter, physioFilter, adminFilter, query]);

  const getPhysioName = (id: string) => users.find(u => u.id === id)?.name || "Unknown";

  const statusIcons: Record<string, any> = {
    Submitted: <AlertCircle className="w-3.5 h-3.5" />,
    Assigned: <Clock className="w-3.5 h-3.5" />,
    "In Review": <FileText className="w-3.5 h-3.5" />,
    "Report Ready": <CheckCircle className="w-3.5 h-3.5" />,
  };

  const statusStyles: Record<string, string> = {
    Submitted: "bg-accent/10 text-accent",
    Assigned: "bg-secondary/10 text-secondary",
    "In Review": "bg-primary/10 text-primary",
    "Report Ready": "bg-success/10 text-success",
    Completed: "bg-white/5 text-text-muted",
  };

  return (
    <section className="space-y-6 animate-fade-in pb-12">
      <div className="rounded-3xl bg-surface/70 p-6 shadow-soft-light border border-white/5">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">Case Administration</h2>
            <p className="text-sm text-text-muted mt-1">Review, assign, and deliver clinical reports.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Search by title..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-2xl border border-white/10 bg-background/50 px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition w-full md:w-64"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-white/5 pt-6">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-background px-4 py-2 text-xs text-text outline-none focus:border-primary">
            <option value="All">All Statuses</option>
            {statuses.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={physioFilter} onChange={(event) => setPhysioFilter(event.target.value)} className="rounded-xl border border-white/10 bg-background px-4 py-2 text-xs text-text outline-none focus:border-primary">
            <option value="All">All Physiotherapists</option>
            {physios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)} className="rounded-xl border border-white/10 bg-background px-4 py-2 text-xs text-text outline-none focus:border-primary">
            <option value="All">All Admins</option>
            {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-surface/70 p-12 text-center border border-white/5 border-dashed">
            <p className="text-text-muted">No cases match your filters.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-6 rounded-3xl border border-white/5 bg-surface/70 p-6 transition hover:border-primary/30 hover:shadow-soft-light md:flex-row md:items-center">
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold">{item.id.split('-')[1]}</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.status] || 'bg-white/5 text-text-muted'}`}>
                    {statusIcons[item.status]}
                    {item.status}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text truncate">{item.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-muted">
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Physio: <span className="text-text font-medium">{getPhysioName(item.physiotherapistId)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 md:pt-0 md:border-none">
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold px-1">Assign Admin</p>
                  <select
                    value={item.expertId ?? ""}
                    onChange={(event) => updateCase(item.id, { expertId: event.target.value || null })}
                    className="rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-xs text-text outline-none focus:border-primary transition"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>{admin.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold px-1">Case Status</p>
                  <select
                    value={item.status}
                    onChange={(event) => updateCase(item.id, { status: event.target.value as typeof item.status })}
                    className="rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-xs text-text outline-none focus:border-primary transition"
                  >
                    {statuses.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <Link
                  to={`/admin/cases/${item.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-6 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                >
                  <FileText className="w-4 h-4" />
                  Manage Report
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
