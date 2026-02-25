import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, UploadCloud, Activity, Footprints, FileText } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { MSKAssessmentForm } from "../../components/forms/MSKAssessmentForm";
import { toast } from "react-hot-toast";
import type { AssessmentType } from "../../types";

const wizardSchema = z.object({
    profileId: z.string().min(1, "Select a profile"),
    postureNotes: z.string().optional(),
    groundNotes: z.string().optional(),
    treadmillNotes: z.string().optional(),
    mskSummary: z.string().optional(),
    mskData: z.any().optional(),
});

type WizardForm = z.infer<typeof wizardSchema>;

const DRAFT_KEY = "assessment-wizard-draft";

const useMediaGroup = (initial: { name: string; file?: File }[] = []) => {
    const [files, setFiles] = useState<{ name: string; file?: File }[]>(initial);
    const dropzone = useDropzone({
        accept: { "image/*": [], "video/*": [] },
        onDrop: (accepted) => {
            setFiles((prev) => {
                const newItems = accepted.map((file) => ({ name: file.name, file }));
                const next = [...prev, ...newItems];
                // Keep unique by name and limit to 4
                const unique = Array.from(new Map(next.map(item => [item.name, item])).values());
                return unique.slice(0, 4);
            });
        },
    });
    const remove = (targetName: string) => setFiles((prev) => prev.filter((item) => item.name !== targetName));
    return { files, setFiles, remove, getRootProps: dropzone.getRootProps, getInputProps: dropzone.getInputProps };
};

type TestChoice = "posture" | "movement" | "msk";

export const CaseWizard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialProfileId = searchParams.get("clientId") || "";
    const initialType = searchParams.get("type") as TestChoice || null;

    const { register, handleSubmit, reset, watch, trigger, setValue } = useForm<WizardForm>({
        resolver: zodResolver(wizardSchema),
        defaultValues: { profileId: initialProfileId, postureNotes: "", groundNotes: "", treadmillNotes: "", mskSummary: "", mskData: {} },
    });

    const [activeStep, setActiveStep] = useState(initialProfileId ? 1 : 0);
    const [stepError, setStepError] = useState("");
    const [savedLabel, setSavedLabel] = useState("Auto-saving...");
    const [submitted, setSubmitted] = useState(false);
    const [selectedTest, setSelectedTest] = useState<TestChoice | null>(initialType);

    const watchValues = watch();
    const postureGroup = useMediaGroup([]);
    const groundGroup = useMediaGroup([]);
    const treadmillGroup = useMediaGroup([]);
    const addAssessment = useAppStore((state) => state.addAssessment);
    const uploadFile = useAppStore((state) => state.uploadFile);
    const organisation = useAppStore((state) => state.organisation);
    const profiles = useAppStore((state) => state.profiles);

    const steps = [
        { label: "Profile selection" },
        { label: "Assessment choice" },
        { label: selectedTest === "posture" ? "Posture test" : selectedTest === "movement" ? "Movement analysis" : selectedTest === "msk" ? "MSK screening" : "Assessment" },
        { label: "Final review" },
    ];

    const profileOptions = useMemo(
        () => profiles.map((p) => ({ label: p.fullName, value: p.id })),
        [profiles],
    );

    useEffect(() => {
        if (initialProfileId) setValue("profileId", initialProfileId);
        if (initialType) setSelectedTest(initialType);
    }, [initialProfileId, initialType, setValue]);

    useEffect(() => {
        const stored = localStorage.getItem(DRAFT_KEY);
        if (stored && !initialProfileId) {
            const parsed = JSON.parse(stored);
            reset(parsed.form);
            postureGroup.setFiles(parsed.media.posture ?? []);
            groundGroup.setFiles(parsed.media.ground ?? []);
            treadmillGroup.setFiles(parsed.media.treadmill ?? []);
            if (parsed.test) setSelectedTest(parsed.test);
            setActiveStep(parsed.step ?? 0);
        }
    }, [reset, initialProfileId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({
                    form: watchValues,
                    media: {
                        posture: postureGroup.files.map(f => ({ name: f.name })),
                        ground: groundGroup.files.map(f => ({ name: f.name })),
                        treadmill: treadmillGroup.files.map(f => ({ name: f.name })),
                    },
                    test: selectedTest,
                    step: activeStep,
                }),
            );
            setSavedLabel("Saved just now");
        }, 400);
        return () => clearTimeout(timer);
    }, [JSON.stringify(watchValues), JSON.stringify(postureGroup.files.map(f => f.name)), JSON.stringify(groundGroup.files.map(f => f.name)), JSON.stringify(treadmillGroup.files.map(f => f.name)), activeStep, selectedTest]);

    const handleNext = async () => {
        setStepError("");

        if (activeStep === 0) {
            const valid = await trigger("profileId");
            if (!valid) {
                setStepError("Pick a profile to continue.");
                return;
            }
        }

        if (activeStep === 1) {
            if (!selectedTest) {
                setStepError("Please select a test to perform.");
                return;
            }
        }

        if (activeStep === 2) {
            if (selectedTest === "posture") {
                if (postureGroup.files.length < 1) {
                    setStepError("Upload at least 1 posture photo.");
                    return;
                }
            } else if (selectedTest === "movement") {
                if (groundGroup.files.length === 0 && treadmillGroup.files.length === 0) {
                    setStepError("Upload at least 1 video for analysis.");
                    return;
                }
            }
        }

        setStepError("");
        setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const onSubmit = async (values: WizardForm) => {
        if (submitted) return;
        setStepError("");
        setSavedLabel("Uploading and submitting...");

        const profile = profiles.find(p => p.id === values.profileId);
        if (!profile || !organisation) return;

        const submissionPromise = (async () => {
            const assessmentId = `assessment-${crypto.randomUUID().slice(0, 8)}`;
            const baseFolder = `orgs/${organisation.id}/assessments/${assessmentId}`;

            const uploadTasks = async (items: { name: string, file?: File }[], subfolder: string) => {
                return Promise.all(items.map(async (item) => {
                    if (!item.file) return null;
                    const path = `${baseFolder}/${subfolder}/${item.name}`;
                    const url = await uploadFile(path, item.file);
                    return { view: subfolder, url, path };
                }));
            };

            const photos = selectedTest === "posture"
                ? (await uploadTasks(postureGroup.files, "photos")).filter(Boolean) as any[]
                : [];

            const groundVideos = selectedTest === "movement"
                ? (await uploadTasks(groundGroup.files, "ground")).filter(Boolean) as any[]
                : [];

            const treadmillVideos = selectedTest === "movement"
                ? (await uploadTasks(treadmillGroup.files, "treadmill")).filter(Boolean) as any[]
                : [];

            await addAssessment({
                profileId: values.profileId,
                type: selectedTest as AssessmentType,
                groupId: profile.groupId,
                categoryId: profile.categoryId,
                status: "submitted",
                notes: selectedTest === "posture" ? (values.postureNotes || "") : (selectedTest === "movement" ? `${values.groundNotes || ""} ${values.treadmillNotes || ""}`.trim() : values.mskSummary || ""),
                media: {
                    photos: photos,
                    videos: [
                        ...groundVideos.map(v => ({ angle: "ground", url: v.url, path: v.path })),
                        ...treadmillVideos.map(v => ({ angle: "treadmill", url: v.url, path: v.path }))
                    ],
                    frames: [],
                },
                annotations: { landmarks: { front: [], side: [] }, lines: [], angles: [] },
                metricsSummary: selectedTest === "msk" ? values.mskData : {},
            });

            localStorage.removeItem(DRAFT_KEY);
            setSubmitted(true);
            setSavedLabel("Analysis submitted");

            // Wait a bit before redirecting so they see the success toast
            setTimeout(() => {
                navigate("/app/cases");
            }, 1500);
        })();

        toast.promise(submissionPromise, {
            loading: "Uploading media and creating assessment...",
            success: "Assessment submitted successfully!",
            error: "Failed to submit assessment. Please try again.",
        });
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-[0.4em] text-text-muted">Profile</label>
                        <select
                            {...register("profileId")}
                            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-3 text-sm text-text outline-none transition focus:border-primary"
                        >
                            <option value="">Select profile</option>
                            {profileOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/app/clients"
                                className="text-left text-xs text-primary underline-offset-4 hover:underline"
                            >
                                Create new profile
                            </Link>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => { setSelectedTest("posture"); handleNext(); }}
                            className={`flex flex-col items-center gap-4 rounded-3xl border p-6 transition hover:scale-105 ${selectedTest === "posture" ? "border-primary bg-primary/10" : "border-white/10 bg-surface/50"}`}
                        >
                            <Activity className="h-8 w-8 text-primary" />
                            <div className="text-center">
                                <p className="font-semibold text-text">Posture</p>
                                <p className="text-xs text-text-muted">Static analysis</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setSelectedTest("movement"); handleNext(); }}
                            className={`flex flex-col items-center gap-4 rounded-3xl border p-6 transition hover:scale-105 ${selectedTest === "movement" ? "border-primary bg-primary/10" : "border-white/10 bg-surface/50"}`}
                        >
                            <Footprints className="h-8 w-8 text-primary" />
                            <div className="text-center">
                                <p className="font-semibold text-text">Movement</p>
                                <p className="text-xs text-text-muted">Gait & Running</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setSelectedTest("msk"); handleNext(); }}
                            className={`flex flex-col items-center gap-4 rounded-3xl border p-6 transition hover:scale-105 ${selectedTest === "msk" ? "border-primary bg-primary/10" : "border-white/10 bg-surface/50"}`}
                        >
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="text-center">
                                <p className="font-semibold text-text">MSK Screen</p>
                                <p className="text-xs text-text-muted">Clinical exams</p>
                            </div>
                        </button>
                    </div>
                );

            case 2:
                if (selectedTest === "posture") {
                    return (
                        <div className="space-y-4">
                            <MediaSection
                                label="Posture Test (Min 1 photo)"
                                files={postureGroup.files}
                                dropzone={{ getRootProps: postureGroup.getRootProps, getInputProps: postureGroup.getInputProps }}
                                removeFile={postureGroup.remove}
                            />
                            <textarea
                                {...register("postureNotes")}
                                rows={3}
                                placeholder="Capture posture findings with detail"
                                className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
                            />
                        </div>
                    );
                }
                if (selectedTest === "movement") {
                    return (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <MediaSection
                                    label="Ground (Slow-mo recommended)"
                                    files={groundGroup.files}
                                    dropzone={{ getRootProps: groundGroup.getRootProps, getInputProps: groundGroup.getInputProps }}
                                    removeFile={groundGroup.remove}
                                />
                                <textarea
                                    {...register("groundNotes")}
                                    rows={2}
                                    placeholder="Ground observations"
                                    className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
                                />
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="space-y-4">
                                <MediaSection
                                    label="Treadmill (Steady view)"
                                    files={treadmillGroup.files}
                                    dropzone={{ getRootProps: treadmillGroup.getRootProps, getInputProps: treadmillGroup.getInputProps }}
                                    removeFile={treadmillGroup.remove}
                                />
                                <textarea
                                    {...register("treadmillNotes")}
                                    rows={2}
                                    placeholder="Treadmill observations"
                                    className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    );
                }
                if (selectedTest === "msk") {
                    return (
                        <div className="space-y-6">
                            <MSKAssessmentForm register={register} />
                            <div className="h-px bg-white/5" />
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Summary & Recommendations</p>
                                <textarea
                                    {...register("mskSummary")}
                                    rows={4}
                                    placeholder="Final summary of findings..."
                                    className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                                />
                            </div>
                        </div>
                    );
                }
                return null;

            case 3:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-text-muted">Review before submission.</p>
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                            <Panel title="Profile">{profiles.find((p) => p.id === watchValues.profileId)?.fullName}</Panel>
                            {selectedTest === "posture" && <Panel title="Posture notes">{watchValues.postureNotes}</Panel>}
                            {selectedTest === "movement" && (
                                <>
                                    <Panel title="Ground notes">{watchValues.groundNotes}</Panel>
                                    <Panel title="Treadmill notes">{watchValues.treadmillNotes}</Panel>
                                </>
                            )}
                            {selectedTest === "msk" && <Panel title="MSK data logged">Detailed clinical observations recorded.</Panel>}
                        </div>
                        <p className="text-xs text-text-muted">
                            {selectedTest === 'movement' ? `Videos: ${groundGroup.files.length} ground, ${treadmillGroup.files.length} treadmill` : ''}
                            {selectedTest === 'posture' ? `Photos: ${postureGroup.files.length} ready` : ''}
                        </p>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition hover:scale-105"
                        >
                            Confirm & Submit
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="space-y-6 rounded-2xl md:rounded-3xl bg-surface/70 p-4 md:p-6 shadow-soft-light animate-fade-in mb-20 lg:mb-0">
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between lg:hidden mb-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Step {activeStep + 1} / {steps.length}</span>
                        <span className="text-[9px] text-text-muted uppercase tracking-wider">{steps[activeStep].label}</span>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap gap-1 md:gap-3">
                        {steps.map((step, index) => (
                            <div key={step.label} className="flex-1 min-w-[30px] lg:min-w-[120px]">
                                <div className="hidden lg:block text-[11px] text-text-muted mb-2 font-bold uppercase tracking-wider">{`${index + 1}. ${step.label}`}</div>
                                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                                    <span
                                        className={`block h-full rounded-full transition-all duration-300 ${activeStep > index ? "bg-success" : activeStep === index ? "bg-primary" : "bg-white/5"
                                            }`}
                                        style={{ width: `${activeStep >= index ? 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-background/40 p-3 md:p-6">
                    {renderStep()}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
                <p className="text-[10px] md:text-[11px] text-text-muted order-2 sm:order-1">{stepError || savedLabel}</p>
                <div className="flex gap-2 md:gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                        type="button"
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                        className="flex-1 sm:flex-none rounded-xl md:rounded-2xl border border-white/10 px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-xs text-text transition hover:border-primary disabled:opacity-40"
                    >
                        Back
                    </button>
                    {activeStep < steps.length - 1 && activeStep !== 1 ? (
                        <button type="button" onClick={handleNext} className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-primary px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold text-white transition hover:scale-105">
                            Next
                        </button>
                    ) : activeStep === steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold text-white transition hover:scale-105"
                        >
                            Submit
                        </button>
                    ) : null}
                </div>
            </div>
            {submitted && <p className="text-[10px] md:text-xs text-success text-center">Analysis submitted successfully - check the analysis view for updates.</p>}
        </section>
    );
};

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-surface/80 p-3 md:p-4 text-sm text-text">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-text-muted">{title}</p>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-text">{children || "-"}</p>
    </div>
);

const MediaSection = ({
    label,
    files,
    dropzone,
    removeFile,
}: {
    label: string;
    files: { name: string; file?: File }[];
    dropzone: {
        getRootProps: () => any;
        getInputProps: () => any;
    };
    removeFile: (name: string) => void;
}) => {
    const rootProps = dropzone.getRootProps();
    const inputProps = dropzone.getInputProps();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{label}</p>
                </div>
                {files.length >= 1 && (
                    <span className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle className="h-4 w-4" /> ready
                    </span>
                )}
            </div>
            <div {...rootProps} className="rounded-3xl border border-dashed border-white/20 bg-background/30 p-4 transition hover:border-primary cursor-pointer">
                <input {...inputProps} className="hidden" />
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={`slot-${label}-${index}`}
                            className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-surface/80 p-2 sm:p-3 text-xs text-text-muted"
                        >
                            {files[index] ? (
                                <>
                                    <p className="truncate font-semibold text-text">{files[index].name}</p>
                                    <button
                                        type="button"
                                        className="text-[11px] text-primary underline text-left"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeFile(files[index].name);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-2">
                                    <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
                                    <p className="text-[10px] sm:text-xs text-center">Drop or click</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-text-muted text-center sm:text-left">{files.length} / 4 ready (Min 1)</p>
        </div>
    );
};
