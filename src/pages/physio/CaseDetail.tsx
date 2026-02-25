import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const CaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const allAssessments = useAppStore((state) => state.assessments);
  const allProfiles = useAppStore((state) => state.profiles);
  const allUsers = useAppStore((state) => state.users);

  const item = useMemo(() => allAssessments.find((a) => a.id === caseId), [allAssessments, caseId]);
  const profile = useMemo(() => allProfiles.find((p) => p.id === item?.profileId), [allProfiles, item?.profileId]);
  const creator = useMemo(() =>
    item?.createdBy ? allUsers.find((user) => user.uid === item.createdBy) : undefined,
    [allUsers, item?.createdBy]
  );
  const navigate = useNavigate();


  if (!item) {
    return (
      <section className="rounded-3xl bg-surface/70 p-6 text-text border border-white/10">
        <p className="text-text-muted">Analysis not found.</p>
        <button onClick={() => navigate("/app/cases")} className="mt-4 text-sm text-primary underline">
          Back to Activity
        </button>
      </section>
    );
  }

  const date = new Date(typeof item.createdAt === 'string' ? item.createdAt : item.createdAt.seconds * 1000);

  return (
    <section className="space-y-6 animate-fade-in pb-20">
      <header className="rounded-3xl bg-surface/70 p-8 shadow-soft-light border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-text-muted font-bold">{item.id}</p>
          <h1 className="text-4xl font-black text-text uppercase italic tracking-tighter">{item.type} Analysis</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{item.status}</span>
            <span className="text-sm text-text-muted">{profile ? profile.fullName : "Profile"}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/app/cases")} className="px-6 py-3 rounded-2xl bg-white/5 text-xs font-bold text-text hover:bg-white/10 transition-all">Back</button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-xs font-bold text-white hover:scale-105 transition-all shadow-lg shadow-primary/20">Download Assets</button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Media Evidence */}
        <div className="space-y-6 rounded-[2.5rem] border border-white/10 bg-surface/40 p-8">
          <h2 className="text-xs font-bold text-text uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Captured Media
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {item.media.photos.map((photo: any, i: number) => (
              <article key={i} className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-black/20 border border-white/5">
                <img src={photo.url} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">{photo.view}</p>
                </div>
              </article>
            ))}
            {item.media.videos.map((video: any, i: number) => (
              <article key={i} className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-black/20 border border-white/5">
                <video src={video.url} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> {video.angle}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Details & Notes */}
        <div className="space-y-6">
          <article className="rounded-[2.5rem] border border-white/10 bg-surface/40 p-8 space-y-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-[0.3em]">Observations & Findings</p>
            <p className="text-lg text-text leading-relaxed font-medium italic">"{item.notes || "No clinical notes provided."}"</p>
          </article>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-surface/40 p-6">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Technician</p>
              <p className="mt-2 text-sm font-bold text-text">{creator?.name || "System"}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface/40 p-6">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Timestamp</p>
              <p className="mt-2 text-sm font-bold text-text">{date.toLocaleDateString()}</p>
            </div>
          </div>

          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-primary/20 text-primary font-black uppercase italic tracking-tighter hover:bg-primary/20 transition-all">
            Generate Interactive Visualization
          </button>
        </div>
      </div>
    </section>
  );
};
