import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, UploadCloud, Activity, Footprints, FileText } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { MSKAssessmentForm } from "../../components/forms/MSKAssessmentForm";

const wizardSchema = z.object({
    patientId: z.string().min(1, "Select a patient"),
    postureNotes: z.string().optional(),
    groundNotes: z.string().optional(),
    treadmillNotes: z.string().optional(),
    mskSummary: z.string().optional(),
    mskData: z.any().optional(),
});

type WizardForm = z.infer<typeof wizardSchema>;

const DRAFT_KEY = "case-wizard-draft";

const useMediaGroup = (initial: string[]) => {
    const [files, setFiles] = useState(initial);
    const dropzone = useDropzone({
        accept: { "image/*": [], "video/*": [] },
        onDrop: (accepted) => {
            setFiles((prev) => {
                const next = [...prev, ...accepted.map((file) => file.name)];
                return Array.from(new Set(next)).slice(0, 4);
            });
        },
    });
    const remove = (target: string) => setFiles((prev) => prev.filter((item) => item !== target));
    return { files, setFiles, remove, getRootProps: dropzone.getRootProps, getInputProps: dropzone.getInputProps };
};

type TestType = "posture" | "gait" | "msk";

export const CaseWizard = () => {
    const { register, handleSubmit, reset, watch, trigger } = useForm<WizardForm>({
        resolver: zodResolver(wizardSchema),
        defaultValues: { patientId: "", postureNotes: "", groundNotes: "", treadmillNotes: "", mskSummary: "", mskData: {} },
    });
    const [activeStep, setActiveStep] = useState(0);
    const [stepError, setStepError] = useState("");
    const [savedLabel, setSavedLabel] = useState("Auto-saving...");
    const [submitted, setSubmitted] = useState(false);
    const [selectedTest, setSelectedTest] = useState<TestType | null>(null);

    const watchValues = watch();
    const postureGroup = useMediaGroup([]);
    const groundGroup = useMediaGroup([]);
    const treadmillGroup = useMediaGroup([]);
    const addCase = useAppStore((state) => state.addCase);
    const patients = useAppStore((state) => state.patients);
    const activeUser = useAppStore((state) => state.authUser);

    const steps = [
        { label: "Patient selection" },
        { label: "Assessment choice" },
        { label: selectedTest === "posture" ? "Posture test" : selectedTest === "gait" ? "Gait analysis" : selectedTest === "msk" ? "MSK screening" : "Assessment" },
        { label: "Final review" },
    ];

    const activePatients = useMemo(() => {
        if (!activeUser) {
            return patients;
        }
        return patients.filter((patient) => patient.physiotherapistId === activeUser.id);
    }, [patients, activeUser?.id]);

    const patientOptions = useMemo(
        () => activePatients.map((patient) => ({ label: patient.name, value: patient.id })),
        [activePatients],
    );

    useEffect(() => {
        const stored = localStorage.getItem(DRAFT_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            reset(parsed.form);
            postureGroup.setFiles(parsed.media.posture ?? []);
            groundGroup.setFiles(parsed.media.ground ?? []);
            treadmillGroup.setFiles(parsed.media.treadmill ?? []);
            if (parsed.test) setSelectedTest(parsed.test);
            setActiveStep(parsed.step ?? 0);
        }
    }, [reset]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({
                    form: watchValues,
                    media: {
                        posture: postureGroup.files,
                        ground: groundGroup.files,
                        treadmill: treadmillGroup.files,
                    },
                    test: selectedTest,
                    step: activeStep,
                }),
            );
            setSavedLabel("Saved just now");
        }, 400);
        return () => clearTimeout(timer);
    }, [JSON.stringify(watchValues), JSON.stringify(postureGroup.files), JSON.stringify(groundGroup.files), JSON.stringify(treadmillGroup.files), activeStep, selectedTest]);

    const handleNext = async () => {
        setStepError("");

        if (activeStep === 0) {
            const valid = await trigger("patientId");
            if (!valid) {
                setStepError("Pick a patient to continue.");
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
            } else if (selectedTest === "gait") {
                if (groundGroup.files.length === 0 && treadmillGroup.files.length === 0) {
                    setStepError("Upload at least 1 video for ground or treadmill.");
                    return;
                }
            } else if (selectedTest === "msk") {
                // MSK is optional or heavily multi-field, so we don't strictly require fields in code for now
            }
        }

        setStepError("");
        setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const onSubmit = (values: WizardForm) => {
        if (submitted) return;

        addCase({
            title: `${patients.find((patient) => patient.id === values.patientId)?.name} · ${selectedTest ? selectedTest.toUpperCase() : 'Assessment'}`,
            patientId: values.patientId,
            mskSummary: values.mskSummary || "",
            mskData: values.mskData,
            media: {
                posture: postureGroup.files.map((name) => ({ id: name, label: name, files: [], required: true, completed: true })),
                ground: groundGroup.files.map((name) => ({ id: name, label: name, files: [], required: true, completed: true })),
                treadmill: treadmillGroup.files.map((name) => ({ id: name, label: name, files: [], required: false, completed: true })),
            },
        });
        localStorage.removeItem(DRAFT_KEY);
        setSubmitted(true);
        setSavedLabel("Case submitted");
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <label className="text-xs uppercase tracking-[0.4em] text-text-muted">Patient</label>
                        <select
                            {...register("patientId")}
                            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-3 text-sm text-text outline-none transition focus:border-primary"
                        >
                            <option value="">Select patient</option>
                            {patientOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/patients"
                                className="text-left text-xs text-primary underline-offset-4 hover:underline"
                            >
                                Create new patient
                            </Link>
                            <Link className="text-left text-xs text-primary underline-offset-4 hover:underline" to="/patients">
                                Manage patients
                            </Link>
                        </div>
                        {patientOptions.length === 0 && (
                            <p className="text-xs text-text-muted">No patients saved yet. Visit the Patients tab to onboard someone new.</p>
                        )}
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
                            onClick={() => { setSelectedTest("gait"); handleNext(); }}
                            className={`flex flex-col items-center gap-4 rounded-3xl border p-6 transition hover:scale-105 ${selectedTest === "gait" ? "border-primary bg-primary/10" : "border-white/10 bg-surface/50"}`}
                        >
                            <Footprints className="h-8 w-8 text-primary" />
                            <div className="text-center">
                                <p className="font-semibold text-text">Gait Analysis</p>
                                <p className="text-xs text-text-muted">Ground & Treadmill</p>
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
                                <p className="text-xs text-text-muted">Written summary</p>
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
                if (selectedTest === "gait") {
                    return (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <MediaSection
                                    label="Ground (Min 1 total)"
                                    files={groundGroup.files}
                                    dropzone={{ getRootProps: groundGroup.getRootProps, getInputProps: groundGroup.getInputProps }}
                                    removeFile={groundGroup.remove}
                                />
                                <textarea
                                    {...register("groundNotes")}
                                    rows={2}
                                    placeholder="Ground gait observations"
                                    className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none focus:border-primary"
                                />
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="space-y-4">
                                <MediaSection
                                    label="Treadmill (Min 1 total)"
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
                            <Panel title="Patient">{patients.find((p) => p.id === watchValues.patientId)?.name}</Panel>
                            {selectedTest === "posture" && <Panel title="Posture notes">{watchValues.postureNotes}</Panel>}
                            {selectedTest === "gait" && (
                                <>
                                    <Panel title="Ground notes">{watchValues.groundNotes}</Panel>
                                    <Panel title="Treadmill notes">{watchValues.treadmillNotes}</Panel>
                                </>
                            )}
                            {selectedTest === "msk" && <Panel title="MSK data logged">Detailed clinical observations recorded.</Panel>}
                        </div>
                        <p className="text-xs text-text-muted">
                            {selectedTest === 'gait' ? `Gait: ${groundGroup.files.length} ground, ${treadmillGroup.files.length} treadmill` : ''}
                            {selectedTest === 'posture' ? `Posture: ${postureGroup.files.length} photos` : ''}
                        </p>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition hover:scale-105"
                        >
                            Submit case
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="space-y-6 rounded-3xl bg-surface/70 p-4 md:p-6 shadow-soft-light animate-fade-in">
            <div className="space-y-5">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between lg:hidden mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Step {activeStep + 1} / {steps.length}</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">{steps[activeStep].label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {steps.map((step, index) => (
                            <div key={step.label} className="flex-1 min-w-[30px] md:min-w-[120px]">
                                <div className="hidden lg:block text-[11px] text-text-muted mb-2">{`${index + 1}. ${step.label}`}</div>
                                <div className="h-1 sm:h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
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
                <div className="rounded-3xl border border-white/10 bg-background/40 p-4 md:p-6">
                    {renderStep()}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
                <p className="text-[11px] text-text-muted order-2 sm:order-1">{stepError || savedLabel}</p>
                <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                        type="button"
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                        className="flex-1 sm:flex-none rounded-2xl border border-white/10 px-6 py-2.5 text-xs text-text transition hover:border-primary disabled:opacity-40"
                    >
                        Back
                    </button>
                    {activeStep < steps.length - 1 && activeStep !== 1 ? (
                        <button type="button" onClick={handleNext} className="flex-1 sm:flex-none rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-white transition hover:scale-105">
                            Next
                        </button>
                    ) : activeStep === steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1 sm:flex-none rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-2.5 text-xs font-semibold text-white transition hover:scale-105"
                        >
                            Submit
                        </button>
                    ) : null}
                </div>
            </div>
            {submitted && <p className="text-xs text-success text-center">Case submitted - review it in the case inbox.</p>}
        </section>
    );
};

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="rounded-3xl border border-white/10 bg-surface/80 p-4 text-sm text-text">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">{title}</p>
        <p className="mt-2 text-sm text-text">{children || "-"}</p>
    </div>
);

const MediaSection = ({
    label,
    files,
    dropzone,
    removeFile,
}: {
    label: string;
    files: string[];
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
                                    <p className="truncate font-semibold text-text">{files[index]}</p>
                                    <button
                                        type="button"
                                        className="text-[11px] text-primary underline text-left"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeFile(files[index]);
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
