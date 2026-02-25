import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { User, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const AdminCases = () => {
  const assessments = useAppStore((state) => state.assessments);
  const profiles = useAppStore((state) => state.profiles);
  const users = useAppStore((state) => state.users);
  const updateAssessment = useAppStore((state) => state.updateAssessment);
  const [statusFilter, setStatusFilter] = useState("All");
  const [clinicianFilter, setClinicianFilter] = useState("All");
  const [query, setQuery] = useState("");

  const statuses = ["All", "draft", "submitted", "final"];
  const clinicians = users.filter((u) => u.role === "clinician" || u.role === "assistant");

  const filtered = useMemo(() => {
    return assessments.filter((item) => {
      const profile = profiles.find(p => p.id === item.profileId);
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesClinician = clinicianFilter === "All" || item.createdBy === clinicianFilter;
      const matchesQuery = (profile?.fullName || "").toLowerCase().includes(query.toLowerCase()) ||
        (item.type || "").toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesClinician && matchesQuery;
    });
  }, [assessments, profiles, statusFilter, clinicianFilter, query]);

  const getClinicianName = (id: string) => users.find(u => u.uid === id)?.name || "Unknown";

  const statusIcons: Record<string, any> = {
    draft: <Clock className="w-3.5 h-3.5" />,
    submitted: <AlertCircle className="w-3.5 h-3.5" />,
    final: <CheckCircle className="w-3.5 h-3.5" />,
  };

  const statusStyles: Record<string, string> = {
    draft: "bg-accent/10 text-accent",
    submitted: "bg-primary/10 text-primary",
    final: "bg-success/10 text-success",
  };

  return (
    <section className="space-y-6 animate-fade-in pb-12">
      <div className="rounded-2xl md:rounded-3xl bg-surface/70 p-4 md:p-6 shadow-soft-light border border-white/5">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">Assessment Administration</h2>
            <p className="text-sm text-text-muted mt-1">Review clinical assessments and status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Search by client or type..."
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
          <select value={clinicianFilter} onChange={(event) => setClinicianFilter(event.target.value)} className="rounded-xl border border-white/10 bg-background px-4 py-2 text-xs text-text outline-none focus:border-primary">
            <option value="All">All Clinicians</option>
            {clinicians.map((p) => <option key={p.uid} value={p.uid}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-surface/70 p-12 text-center border border-white/5 border-dashed">
            <p className="text-text-muted">No assessments match your filters.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const profile = profiles.find(p => p.id === item.profileId);
            const date = new Date(typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.seconds * 1000);
            return (
              <div key={item.id} className="group relative flex flex-col gap-4 md:gap-6 rounded-2xl md:rounded-3xl border border-white/5 bg-surface/70 p-4 md:p-6 transition hover:border-primary/30 hover:shadow-soft-light md:flex-row md:items-center">
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold">{item.id.split('-')[1]}</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[item.status] || 'bg-white/5 text-text-muted'}`}>
                      {statusIcons[item.status]}
                      {item.status}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text truncate uppercase italic">{item.type} Analysis</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-text-muted">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" />
                        Client: <span className="text-text font-medium">{profile?.fullName || "Unknown"}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        By: <span className="text-text font-medium">{getClinicianName(item.createdBy)}</span>
                      </span>
                      <span className="flex items-center gap-2 text-[10px]">
                        Last activity: {date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 md:pt-0 md:border-none">
                  <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold px-1">Status</p>
                    <select
                      value={item.status}
                      onChange={(event) => updateAssessment(item.id, { status: event.target.value as any })}
                      className="rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-xs text-text outline-none focus:border-primary transition"
                    >
                      <option value="draft">Draft</option>
                      <option value="final">Final</option>
                    </select>
                  </div>

                  <Link
                    to={`/admin/cases/${item.id}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-6 py-2.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    Manage Assessment
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
