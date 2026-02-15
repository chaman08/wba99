import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const ExpertCases = () => {
  const user = useAppStore((state) => state.authUser);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const cases = useAppStore((state) => state.cases);
  const assignedCases = useMemo(
    () => cases.filter((item) => item.expertId === user?.id),
    [cases, user?.id],
  );

  const filtered = useMemo(() => {
    return assignedCases.filter((item) => {
      const matchesStatus = filter === "All" || item.status === filter;
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [assignedCases, filter, query]);

  const statuses = ["All", "Assigned", "In Review", "Report Ready"];

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text">Expert cases</h2>
          <p className="text-sm text-text-muted">Pin a case to review with precision.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                filter === status ? "border-primary text-primary" : "border-white/10 text-text-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          className="flex-1 min-w-[200px] rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text outline-none"
          placeholder="Search by keyword"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="space-y-4">
        {filtered.map((item) => (
          <Link
            key={item.id}
            to={`/expert/cases/${item.id}`}
            className="group flex flex-col gap-2 rounded-3xl border border-white/10 bg-surface/80 p-5 transition hover:-translate-y-1 hover:border-primary/60"
          >
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{item.id}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px]">{item.status}</span>
            </div>
            <h3 className="text-lg font-semibold text-text">{item.title}</h3>
            <p className="text-sm text-text-muted">{item.mskSummary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
