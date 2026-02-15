import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { reportSections } from "../../constants/reportSections";

export const CaseReport = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const selected = useAppStore((state) => state.cases.find((item) => item.id === caseId));
  const existingReport = useAppStore((state) => state.reports.find((report) => report.caseId === caseId));
  const updateCase = useAppStore((state) => state.updateCase);
  const addReport = useAppStore((state) => state.addReport);
  const [toast, setToast] = useState("");
  const { register, handleSubmit } = useForm({
    defaultValues: existingReport?.sections ?? Object.fromEntries(reportSections.map((section) => [section.key, ""])) as Record<string, string>,
  });

  if (!selected) {
    return <p className="text-text-muted">Select a case first.</p>;
  }

  const timeline = ["Submitted", "Assigned", "In Review", "Report Ready"];
  const currentIndex = Math.max(0, timeline.indexOf(selected.status));

  const onSave = (values: Record<string, string>) => {
    addReport({ caseId: caseId ?? "", sections: values, status: "Draft", updatedAt: new Date().toISOString() });
    setToast("Draft saved");
  };

  const markReady = (values: Record<string, string>) => {
    addReport({ caseId: caseId ?? "", sections: values, status: "Report Ready", updatedAt: new Date().toISOString() });
    updateCase(caseId ?? "", { status: "Report Ready" });
    setToast("Report marked ready");
  };


  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
        <h1 className="text-2xl font-semibold text-text">{selected.title}</h1>
      </header>
      <div className="space-y-3">
        <div className="flex gap-2">
          {timeline.map((step) => (
            <span
              key={step}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                timeline.indexOf(step) <= currentIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-white/5 text-text-muted"
              }`}
            >
              {step}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-muted">Status updated {new Date(selected.updatedAt).toLocaleDateString()}</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSave)}>
        {reportSections.map((section) => (
          <div key={section.key} className="space-y-2 rounded-3xl border border-white/10 bg-background/30 p-4">
            <label className="text-xs uppercase tracking-[0.4em] text-text-muted">{section.label}</label>
            <textarea
              {...register(section.key)}
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/5 bg-transparent px-3 py-2 text-sm text-text outline-none"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handleSubmit(markReady)}
            className="rounded-2xl bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
          >
            Mark as report ready
          </button>
        </div>
        {toast && <p className="text-xs text-success">{toast}</p>}
      </form>
    </section>
  );
};
