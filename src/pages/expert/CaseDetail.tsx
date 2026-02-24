import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const ExpertCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const selected = useAppStore((state) => state.assessments.find((item) => item.id === caseId));
  const existingReport = useAppStore((state) => state.reports.find((report) => report.id === `report-${caseId}`));
  const addReport = useAppStore((state) => state.addReport);
  const updateAssessment = useAppStore((state) => state.updateAssessment);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "frames">("photos");

  const { register, handleSubmit } = useForm({
    defaultValues: {
      summaryText: existingReport?.summaryText ?? "",
      recommendations: existingReport?.recommendations ?? "",
    }
  });

  if (!selected) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 shadow-soft-light">
        <p className="text-text-muted">Assessment not found.</p>
        <button onClick={() => navigate("/expert/cases")} className="mt-4 text-sm text-primary underline">
          Back
        </button>
      </section>
    );
  }

  const timeline = ["draft", "final"];
  const statusIndex = timeline.indexOf(selected.status);

  const mediaTabs = [
    { key: "photos", label: "Photos" },
    { key: "videos", label: "Videos" },
    { key: "frames", label: "Frames" },
  ];

  const onSave = (values: { summaryText: string; recommendations: string }) => {
    addReport({
      id: `report-${selected.id}`,
      profileId: selected.profileId,
      createdBy: selected.createdBy, // In real case, should be current user
      createdAt: new Date().toISOString(),
      templateId: null,
      assessmentIds: [selected.id],
      summaryText: values.summaryText,
      recommendations: values.recommendations,
      pdf: { url: "", path: "" },
      share: { enabled: false, token: null, expiresAt: null },
    });
  };

  const onReady = (values: { summaryText: string; recommendations: string }) => {
    addReport({
      id: `report-${selected.id}`,
      profileId: selected.profileId,
      createdBy: selected.createdBy,
      createdAt: new Date().toISOString(),
      templateId: null,
      assessmentIds: [selected.id],
      summaryText: values.summaryText,
      recommendations: values.recommendations,
      pdf: { url: "", path: "" },
      share: { enabled: false, token: null, expiresAt: null },
    });
    updateAssessment(selected.id, { status: "final" });
  };

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{selected.id}</p>
        <h1 className="text-2xl font-semibold text-text">Assessment: {selected.type}</h1>
      </header>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-background/20 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Media gallery</p>
          <div className="flex gap-3">
            {mediaTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`rounded-full px-4 py-1 text-xs font-semibold ${activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3">
            {activeTab === "photos" && selected.media.photos.map((photo, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-white/5 bg-surface/80 p-1">
                <img src={photo.url} alt={photo.view} className="aspect-square w-full object-cover rounded-xl" />
                <p className="mt-1 px-2 pb-1 text-[10px] text-text-muted uppercase tracking-wider">{photo.view}</p>
              </div>
            ))}
            {activeTab === "videos" && selected.media.videos.map((video, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-white/5 bg-surface/80 p-3 text-sm">
                <p className="text-xs text-text-muted">{video.angle}</p>
                <p className="truncate text-text text-[10px]">{video.url}</p>
              </div>
            ))}
            {activeTab === "frames" && selected.media.frames.map((frame, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-white/5 bg-surface/80 p-1">
                <img src={frame.url} alt="Frame" className="aspect-square w-full object-cover rounded-xl" />
              </div>
            ))}
            {(selected.media[activeTab] as any[]).length === 0 && (
              <p className="col-span-2 py-8 text-center text-xs text-text-muted">No {activeTab} available</p>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-background/30 p-4">
            <div className="flex flex-wrap gap-2">
              {timeline.map((step) => (
                <span
                  key={step}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${timeline.indexOf(step) <= statusIndex ? "bg-primary/20 text-primary" : "bg-white/5 text-text-muted"
                    }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-text-muted">Updated {new Date(typeof selected.updatedAt === 'string' ? selected.updatedAt : selected.updatedAt.seconds * 1000).toLocaleDateString()}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
            <div className="space-y-2 rounded-3xl border border-white/10 bg-background/20 p-4">
              <label className="text-xs uppercase tracking-[0.4em] text-text-muted">Summary Text</label>
              <textarea
                {...register("summaryText")}
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/5 bg-transparent px-3 py-2 text-sm text-text outline-none"
              />
            </div>
            <div className="space-y-2 rounded-3xl border border-white/10 bg-background/20 p-4">
              <label className="text-xs uppercase tracking-[0.4em] text-text-muted">Recommendations</label>
              <textarea
                {...register("recommendations")}
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/5 bg-transparent px-3 py-2 text-sm text-text outline-none"
              />
            </div>
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
