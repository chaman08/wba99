import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { Report } from "../../types";
import { FileText, CheckCircle } from "lucide-react";

export const AdminCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const assessment = useAppStore((state) => state.assessments.find((a) => a.id === caseId));
  const profiles = useAppStore((state) => state.profiles);
  const users = useAppStore((state) => state.users);
  const reports = useAppStore((state) => state.reports);
  const updateAssessment = useAppStore((state) => state.updateAssessment);
  const addReport = useAppStore((state) => state.addReport);
  const navigate = useNavigate();

  const report = useMemo(() => reports.find((r) => r.assessmentIds.includes(caseId || "")), [reports, caseId]);

  const [reportData, setReportData] = useState({
    summaryText: "",
    recommendations: "",
  });

  useEffect(() => {
    if (report) {
      setReportData({
        summaryText: report.summaryText,
        recommendations: report.recommendations,
      });
    }
  }, [report]);

  const profile = assessment ? profiles.find((p) => p.id === assessment.profileId) : null;
  const clinician = assessment ? users.find((u) => u.uid === assessment.createdBy) : null;

  const handleDeliverReport = async () => {
    if (!caseId || !assessment || !profile) return;

    const reportId = `report-${caseId}`;
    const newReport: Report = {
      id: reportId,
      profileId: profile.id,
      assessmentIds: [caseId],
      createdBy: "", // Store will overwrite with current authUser.uid
      createdAt: report?.createdAt || new Date().toISOString(),
      templateId: null,
      summaryText: reportData.summaryText,
      recommendations: reportData.recommendations,
      pdf: { url: "", path: "" },
      share: { enabled: false, token: null, expiresAt: null },
    };

    try {
      await addReport(newReport);
      await updateAssessment(caseId, { status: "final" });
      alert("Report delivered successfully.");
      navigate("/admin/cases");
    } catch (error) {
      console.error("Delivery failed", error);
      alert("Failed to deliver report. Please try again.");
    }
  };

  if (!assessment) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 text-text">
        <p>Assessment not found.</p>
        <button onClick={() => navigate("/admin/cases")} className="mt-4 text-sm text-primary underline">
          Back
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in pb-20">
      <div className="rounded-2xl md:rounded-3xl bg-surface/70 p-4 md:p-6 shadow-soft-light transition hover:shadow-lg">
        <header className="flex flex-col gap-1 border-b border-white/5 pb-4 text-center md:text-left">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">{assessment.id}</p>
          <h1 className="text-2xl md:text-3xl font-black text-text uppercase italic tracking-tighter">{assessment.type} Analysis</h1>
          <p className="text-xs md:text-sm text-text-muted flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2">
            <span className="font-bold text-primary">{profile?.fullName}</span>
            <span className="opacity-30 hidden md:block">•</span>
            <span className="text-[11px] md:text-sm">Created by {clinician?.name}</span>
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Media Viewer */}
          <div className="space-y-6 rounded-2xl md:rounded-[2rem] border border-white/10 bg-background/30 p-4 md:p-6">
            <h2 className="text-[10px] md:text-sm font-bold text-text uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Media evidence
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {assessment.media.photos.map((photo, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl bg-surface shadow-lg">
                  <img src={photo.url} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" alt={`View ${photo.view}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest">{photo.view}</p>
                  </div>
                </div>
              ))}
              {assessment.media.videos.map((video, i) => (
                <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl md:rounded-3xl bg-surface shadow-lg">
                  <video src={video.url} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary animate-pulse" /> {video.angle} Video
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {assessment.notes && (
              <article className="rounded-2xl border border-white/10 bg-black/20 p-5 mt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-bold mb-2">Physio Notes</p>
                <p className="text-sm text-text italic leading-relaxed">"{assessment.notes}"</p>
              </article>
            )}
          </div>

          {/* Assessment Data */}
          <div className="space-y-6 rounded-2xl md:rounded-[2rem] border border-white/10 bg-background/30 p-4 md:p-6">
            <h2 className="text-[10px] md:text-sm font-bold text-text uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Technical metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface/50 p-4 border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Status</p>
                <p className={`mt-1 text-sm font-bold uppercase italic ${assessment.status === 'final' ? 'text-success' : 'text-primary'}`}>{assessment.status}</p>
              </div>
              {Object.entries(assessment.metricsSummary).map(([key, val]) => (
                <div key={key} className="rounded-2xl bg-surface/50 p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{key}</p>
                  <p className="mt-1 text-sm font-bold text-text">{String(val)}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-text-muted font-bold">MSK Observations</h3>
              <div className="text-sm text-text bg-surface/30 p-4 rounded-2xl border border-white/5 min-h-[100px]">
                {assessment.type === 'msk' ? 'Detailed clinical exam recorded.' : 'N/A for this assessment type.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Editor */}
      <div className="rounded-2xl md:rounded-3xl bg-surface/70 p-5 md:p-8 shadow-soft-light">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-8 text-center md:text-left">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
            <FileText className="h-5 w-5 md:h-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text tracking-tight">Clinical Report Engine</h2>
            <p className="text-xs md:text-sm text-text-muted">Draft clinical findings and expert recommendations for the client.</p>
          </div>
        </div>

        <div className="grid gap-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black px-1">Summary Findings</label>
            <textarea
              value={reportData.summaryText}
              onChange={(e) => setReportData((prev) => ({ ...prev, summaryText: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-background/40 px-5 py-4 text-sm text-text outline-none focus:border-primary transition focus:ring-4 focus:ring-primary/10"
              placeholder="Describe what you observed in the posture or movement analysis..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black px-1">Recommendations & Correctives</label>
            <textarea
              value={reportData.recommendations}
              onChange={(e) => setReportData((prev) => ({ ...prev, recommendations: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-background/40 px-5 py-4 text-sm text-text outline-none focus:border-primary transition focus:ring-4 focus:ring-primary/10"
              placeholder="Prescribe specific exercises or behavioral changes..."
            />
          </div>

          <button
            onClick={handleDeliverReport}
            disabled={!reportData.summaryText || !reportData.recommendations}
            className="group relative h-12 md:h-14 w-full overflow-hidden rounded-xl md:rounded-2xl bg-primary px-6 text-xs md:text-sm font-bold text-white transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/20 disabled:opacity-40"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Deliver Report to Client
              <CheckCircle className="h-4 w-4" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </section>
  );
};
