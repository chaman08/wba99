import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { Report } from "../../types";

export const AdminCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const selected = useAppStore((state) => state.cases.find((item) => item.id === caseId));
  const patients = useAppStore((state) => state.patients);
  const users = useAppStore((state) => state.users);
  const reports = useAppStore((state) => state.reports);
  const updateCase = useAppStore((state) => state.updateCase);
  const addReport = useAppStore((state) => state.addReport);
  const navigate = useNavigate();

  const report = useMemo(() => reports.find((r) => r.caseId === caseId), [reports, caseId]);

  const [reportSections, setReportSections] = useState<Record<string, string>>({
    summary: "",
    observations: "",
    recommendations: "",
  });

  useMemo(() => {
    if (report) {
      setReportSections(report.sections);
    } else {
      setReportSections({
        summary: "",
        observations: "",
        recommendations: "",
      });
    }
  }, [report, caseId]);

  const patient = selected ? patients.find((item) => item.id === selected.patientId) : null;
  const admins = users.filter((user) => user.role === "admin");
  const timeline = ["Submitted", "Assigned", "In Review", "Report Ready"];
  const currentIndex = selected ? Math.max(0, timeline.indexOf(selected.status)) : 0;

  const mediaGroups = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected.media).map(([label, slots]) => ({
      label,
      content: slots.map((slot) => slot.files.length ? slot.files.join(", ") : "No uploads"),
    }));
  }, [selected]);

  const handleDeliverReport = async () => {
    if (!caseId || !selected) return;

    // Save report
    const newReport: Report = {
      caseId,
      physiotherapistId: selected.physiotherapistId,
      sections: reportSections,
      status: "Report Ready",
      updatedAt: new Date().toISOString(),
    };

    try {
      await addReport(newReport);
      await updateCase(caseId, { status: "Report Ready" });
      alert("Report delivered successfully.");
    } catch (error) {
      console.error("Delivery failed", error);
    }
  };

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
    <section className="space-y-6 animate-fade-in">
      <div className="rounded-3xl bg-surface/70 p-6 shadow-soft-light">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
          <h1 className="text-2xl font-semibold text-text">{selected.title}</h1>
          <p className="text-sm text-text-muted">{patient?.name}</p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
            <article className="rounded-2xl border border-white/10 bg-background/20 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">MSK summary</p>
              <p className="mt-2 text-sm text-text">{selected.mskSummary}</p>
            </article>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-background/30 p-5">
            <h2 className="text-sm font-semibold text-text">Status & assignment</h2>
            <div className="flex flex-wrap gap-3">
              {timeline.map((step) => (
                <span
                  key={step}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${timeline.indexOf(step) <= currentIndex ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                    }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="space-y-2 pt-3">
              <label className="text-[11px] text-text-muted">Admin</label>
              <select
                value={selected.expertId ?? ""}
                onChange={(event) =>
                  updateCase(selected.id, {
                    expertId: event.target.value || null,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
              >
                <option value="">Assign admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-text-muted">Status</label>
              <select
                value={selected.status}
                onChange={(event) => updateCase(selected.id, { status: event.target.value as typeof selected.status })}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
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
      </div>

      <div className="rounded-3xl bg-surface/70 p-6 shadow-soft-light">
        <h2 className="text-xl font-semibold text-text">Generate report</h2>
        <p className="text-sm text-text-muted">Write professional findings and recommendations.</p>

        <div className="mt-6 space-y-4">
          {Object.keys(reportSections).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-text-muted font-bold">{key}</label>
              <textarea
                value={reportSections[key]}
                onChange={(e) => setReportSections((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm text-text outline-none focus:border-primary transition"
                placeholder={`Enter ${key}...`}
              />
            </div>
          ))}

          <button
            onClick={handleDeliverReport}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.02] shadow-lg shadow-primary/20"
          >
            Deliver Report to Physiotherapist
          </button>
        </div>
      </div>
    </section>
  );
};
