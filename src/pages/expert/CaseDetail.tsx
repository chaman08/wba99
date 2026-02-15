import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { reportSections } from "../../constants/reportSections";

export const ExpertCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const selected = useAppStore((state) => state.cases.find((item) => item.id === caseId));
  const existingReport = useAppStore((state) => state.reports.find((report) => report.caseId === caseId));
  const addReport = useAppStore((state) => state.addReport);
  const updateCase = useAppStore((state) => state.updateCase);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posture" | "ground" | "treadmill">("posture");
  const { register, handleSubmit } = useForm({
    defaultValues:
      existingReport?.sections ??
      Object.fromEntries(reportSections.map((section) => [section.key, ""])) as Record<string, string>,
  });

  if (!selected) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 shadow-soft-light">
        <p className="text-text-muted">Case not found.</p>
        <button onClick={() => navigate("/expert/cases")} className="mt-4 text-sm text-primary underline">
          Back
        </button>
      </section>
    );
  }

  const timeline = ["Submitted", "Assigned", "In Review", "Report Ready"];
  const statusIndex = Math.max(0, timeline.indexOf(selected.status));

  const mediaTabs = [
    { key: "posture", label: "Posture" },
    { key: "ground", label: "Ground" },
    { key: "treadmill", label: "Treadmill" },
  ];

  const onSave = (values: Record<string, string>) => {
    addReport({ caseId: selected.id, sections: values, status: "Draft", updatedAt: new Date().toISOString() });
  };

  const onReady = (values: Record<string, string>) => {
    addReport({ caseId: selected.id, sections: values, status: "Report Ready", updatedAt: new Date().toISOString() });
    updateCase(selected.id, { status: "Report Ready" });
  };

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
        <h1 className="text-2xl font-semibold text-text">{selected.title}</h1>
      </header>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-background/20 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Media gallery</p>
          <div className="flex gap-3">
            {mediaTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`rounded-full px-4 py-1 text-xs font-semibold ${
                  activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-3 pt-3">
            {selected.media[activeTab].map((slot) => (
              <div key={slot.id} className="rounded-2xl border border-white/5 bg-surface/80 p-3 text-sm">
                <p className="text-xs text-text-muted">{slot.label}</p>
                <p className="truncate text-text">{slot.files.join(", ") || "No uploads yet"}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-background/30 p-4">
            <div className="flex flex-wrap gap-2">
              {timeline.map((step) => (
                <span
                  key={step}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    timeline.indexOf(step) <= statusIndex ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-text-muted">Updated {new Date(selected.updatedAt).toLocaleDateString()}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
            {reportSections.map((section) => (
              <div key={section.key} className="space-y-2 rounded-3xl border border-white/10 bg-background/20 p-4">
                <label className="text-xs uppercase tracking-[0.4em] text-text-muted">{section.label}</label>
                <textarea
                  {...register(section.key)}
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-white/5 bg-transparent px-3 py-2 text-sm text-text outline-none"
                />
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={handleSubmit(onReady)}
                className="rounded-2xl bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
              >
                Mark report ready
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
