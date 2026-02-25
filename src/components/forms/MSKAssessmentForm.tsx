import { useState } from "react";
import { Activity, Bone, History, List, PersonStanding, Shield, Zap } from "lucide-react";

interface SectionProps {
    register: any;
    watch?: any;
}

const MSKField = ({ label, name, register, placeholder = { left: "Left", right: "Right" } }: { label: string; name: string; register: any; placeholder?: { left: string, right: string } }) => (
    <div className="grid grid-cols-1 gap-2 border-b border-white/5 pb-4 last:border-0 lg:grid-cols-4 lg:items-center lg:gap-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted lg:col-span-1">{label}</label>
        <div className="grid grid-cols-2 gap-2 lg:col-span-2">
            <input
                {...register(`${name}.left`)}
                placeholder={placeholder.left}
                className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
            />
            <input
                {...register(`${name}.right`)}
                placeholder={placeholder.right}
                className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none transition focus:border-primary"
            />
        </div>
        <input
            {...register(`${name}.comments`)}
            placeholder="Comments"
            className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none transition focus:border-primary lg:col-span-1"
        />
    </div>
);

const StandingSection = ({ register }: SectionProps) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <PersonStanding className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Standing Measures</h3>
        </div>
        <MSKField label="Knee to wall (>10cm)" name="mskData.standing.kneeToWall" register={register} />
        <MSKField label="Foot Posture (Flat/Normal/High)" name="mskData.standing.footPosture" register={register} />
        <MSKField label="Single leg standing (>30s)" name="mskData.standing.singleLegStanding" register={register} />
        <MSKField label="Lumbar Flexion (L1-S1 >5cm)" name="mskData.standing.lumbarFlexion" register={register} />
        <MSKField label="Lumbar Extension (L1-S1 >-2cm)" name="mskData.standing.lumbarExtension" register={register} />
        <MSKField label="Lumbar Side Flexion (+/- 3cm)" name="mskData.standing.lumbarSideFlexion" register={register} />
        <MSKField label="Lumbar Quadrant (+/-)" name="mskData.standing.lumbarQuadrant" register={register} />
        <MSKField label="Shoulder Abduction (Full/Restricted)" name="mskData.standing.shoulderAbduction" register={register} />
        <MSKField label="Hawkins Kennedy (Pain/No)" name="mskData.standing.hawkinsKennedy" register={register} />
        <MSKField label="O'Brien's Test (Pain/Weak)" name="mskData.standing.obriensTest" register={register} />
        <MSKField label="Empty Can (Pain/Weak)" name="mskData.standing.emptyCan" register={register} />
    </div>
);

const FloorSeatedSection = ({ register }: SectionProps) => (
    <div className="space-y-6">
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <List className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Floor</h3>
            </div>
            <MSKField label="Combined Elevation (cm)" name="mskData.floor.combinedElevation" register={register} />
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Seated</h3>
            </div>
            <MSKField label="Thoracic Rotation (cm)" name="mskData.seated.thoracicRotation" register={register} />
            <MSKField label="Slump Test (Degree KE)" name="mskData.seated.slumpTest" register={register} />
        </div>
    </div>
);

const SupineSideSection = ({ register }: SectionProps) => (
    <div className="space-y-6">
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Bone className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Supine</h3>
            </div>
            <MSKField label="Leg Length (>2cm)" name="mskData.supine.legLength" register={register} />
            <MSKField label="Shoulder ER @ 90 (>90)" name="mskData.supine.shoulderER" register={register} />
            <MSKField label="Shoulder IR @ 90 (>90)" name="mskData.supine.shoulderIR" register={register} />
            <MSKField label="Active Knee Ext (90/90 >160)" name="mskData.supine.activeKneeExtension" register={register} />
            <MSKField label="Hip Quadrant (Sx)" name="mskData.supine.hipQuadrant" register={register} />
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Side Lying</h3>
            </div>
            <MSKField label="1st MTP Ext / Ankle Neutral" name="mskData.sideLying.mtpExtension" register={register} />
        </div>
    </div>
);

const ProneSection = ({ register }: SectionProps) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Prone</h3>
        </div>
        <MSKField label="Hip IR 0 (>30)" name="mskData.prone.hipIR" register={register} />
        <MSKField label="Hip ER 0 (>45)" name="mskData.prone.hipER" register={register} />
        <MSKField label="Knee Flexion Test" name="mskData.prone.proneKneeFlexion" register={register} />
        <MSKField label="Forced Ankle PF (Imp)" name="mskData.prone.forcedAnklePF" register={register} />
    </div>
);

const StrengthSection = ({ register }: SectionProps) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Strength</h3>
        </div>
        <MSKField label="SL Bridge (90/90 Sec)" name="mskData.strength.singleLegBridge" register={register} />
        <MSKField label="RC Strength (MMT)" name="mskData.strength.rcStrength" register={register} />

        <div className="grid grid-cols-1 gap-2 border-b border-white/5 pb-4 lg:grid-cols-4 lg:items-center lg:gap-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Plank (180s)</label>
            <input
                {...register("mskData.strength.plank")}
                placeholder="Seconds"
                className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none transition focus:border-primary lg:col-span-3"
            />
        </div>

        <MSKField label="Side Plank (80s)" name="mskData.strength.sidePlank" register={register} />
        <MSKField label="SLHB (>30 reps)" name="mskData.strength.slhbTest" register={register} />
    </div>
);

const HistorySection = ({ register }: SectionProps) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Injury & History</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
            <textarea {...register("mskData.history.injury")} placeholder="Current injury" className="rounded-2xl border border-white/10 bg-surface/50 p-3 text-xs text-text outline-none focus:border-primary" rows={2} />
            <textarea {...register("mskData.history.pastInjury")} placeholder="Past injury" className="rounded-2xl border border-white/10 bg-surface/50 p-3 text-xs text-text outline-none focus:border-primary" rows={2} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
            <input {...register("mskData.history.matchesPlayed")} placeholder="Matches played" className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none focus:border-primary" />
            <input {...register("mskData.history.missedMatches")} placeholder="Missed matches" className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none focus:border-primary" />
            <input {...register("mskData.history.totalMatches")} placeholder="Total matches" className="rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-xs text-text outline-none focus:border-primary" />
        </div>
        <textarea {...register("mskData.history.medicines")} placeholder="Medicines / Supplements" className="w-full rounded-2xl border border-white/10 bg-surface/50 p-3 text-xs text-text outline-none focus:border-primary" rows={2} />
    </div>
);

const YBTSection = ({ register }: SectionProps) => (
    <div className="space-y-6">
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[11px]">YBT Lower Limb</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Right</p>
                    <div className="grid grid-cols-3 gap-2">
                        <input {...register("mskData.ybt.lowerLimb.right.anterior")} placeholder="Ant" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.lowerLimb.right.pm")} placeholder="PM" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.lowerLimb.right.pl")} placeholder="PL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Left</p>
                    <div className="grid grid-cols-3 gap-2">
                        <input {...register("mskData.ybt.lowerLimb.left.anterior")} placeholder="Ant" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.lowerLimb.left.pm")} placeholder="PM" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.lowerLimb.left.pl")} placeholder="PL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                    </div>
                </div>
            </div>
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[11px]">YBT Upper Limb</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Right</p>
                    <div className="grid grid-cols-3 gap-2">
                        <input {...register("mskData.ybt.upperLimb.right.medial")} placeholder="Med" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.upperLimb.right.sl")} placeholder="SL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.upperLimb.right.il")} placeholder="IL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Left</p>
                    <div className="grid grid-cols-3 gap-2">
                        <input {...register("mskData.ybt.upperLimb.left.medial")} placeholder="Med" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.upperLimb.left.sl")} placeholder="SL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                        <input {...register("mskData.ybt.upperLimb.left.il")} placeholder="IL" className="rounded-lg border border-white/10 bg-surface/50 p-2 text-[10px] text-text outline-none" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const MSKAssessmentForm = ({ register }: { register: any }) => {
    const sections = ["Standing", "Floor/Seated", "Supine/Side", "Prone", "Strength", "History", "YBT"];
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="space-y-6">
            <div className="relative group">
                <div className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5 pr-4">
                    {sections.map((s, i) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setActiveTab(i)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition duration-200 ${activeTab === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-text-muted hover:bg-white/10"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-surface/80 to-transparent pointer-events-none sm:hidden" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 0 && <StandingSection register={register} />}
                {activeTab === 1 && <FloorSeatedSection register={register} />}
                {activeTab === 2 && <SupineSideSection register={register} />}
                {activeTab === 3 && <ProneSection register={register} />}
                {activeTab === 4 && <StrengthSection register={register} />}
                {activeTab === 5 && <HistorySection register={register} />}
                {activeTab === 6 && <YBTSection register={register} />}
            </div>
        </div>
    );
};
