import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, UploadCloud } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const wizardSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  postureNotes: z.string().min(10, "Describe posture findings"),
  groundNotes: z.string().min(10, "Add ground gait insights"),
  treadmillNotes: z.string().optional(),
  mskSummary: z.string().min(10, "Add MSK screening summary"),
});

type WizardForm = z.infer<typeof wizardSchema>;

const DRAFT_KEY = "case-wizard-draft";

const steps = [
  { label: "Select / create patient" },
  { label: "Posture test" },
  { label: "Walking / running - ground" },
  { label: "Walking / running - treadmill" },
  { label: "MSK screening" },
  { label: "Review & submit" },
];

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

const mediaProgress = (files: string[], required: number) => Math.min(100, (files.length / required) * 100);

export const CaseWizard = () => {
  const { register, handleSubmit, formState, reset, watch, trigger } = useForm<WizardForm>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { patientId: "", postureNotes: "", groundNotes: "", treadmillNotes: "", mskSummary: "" },
  });
  const [activeStep, setActiveStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [savedLabel, setSavedLabel] = useState("Auto-saving...");
  const [submitted, setSubmitted] = useState(false);
  const watchValues = watch();
  const postureGroup = useMediaGroup([]);
  const groundGroup = useMediaGroup([]);
  const treadmillGroup = useMediaGroup([]);
  const addCase = useAppStore((state) => state.addCase);
  const patients = useAppStore((state) => state.patients);
  const activeUser = useAppStore((state) => state.authUser);

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
          step: activeStep,
        }),
      );
      setSavedLabel("Saved just now");
    }, 400);
    return () => clearTimeout(timer);
  }, [JSON.stringify(watchValues), JSON.stringify(postureGroup.files), JSON.stringify(groundGroup.files), JSON.stringify(treadmillGroup.files), activeStep]);

  const handleNext = async () => {
    setStepError("");
    if (activeStep === 0) {
      const valid = await trigger("patientId");
      if (!valid) {
        setStepError("Pick a patient to continue.");
        return;
      }
    }
    if (activeStep === 1 && postureGroup.files.length < 4) {
      setStepError("Upload 4 posture photos.");
      return;
    }
    if (activeStep === 2 && groundGroup.files.length < 4) {
      setStepError("Upload 4 ground videos.");
      return;
    }
    if (activeStep === 3 && treadmillGroup.files.length > 0 && treadmillGroup.files.length < 4) {
      setStepError("Provide all 4 treadmill captures or clear the step.");
      return;
    }
    setStepError("");
    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const onSubmit = (values: WizardForm) => {
    if (submitted) return;
    addCase({
      title: `${patients.find((patient) => patient.id === values.patientId)?.name} · MSK summary`,
      patientId: values.patientId,
      mskSummary: values.mskSummary,
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
        <button type="button" className="text-xs text-primary underline-offset-4 hover:underline">
          Create new patient
        </button>
        {patientOptions.length === 0 && (
          <p className="text-xs text-text-muted">No patients saved yet. Visit the Patients tab to onboard someone new.</p>
        )}
        <Link className="text-xs text-primary underline-offset-4 hover:underline" to="/patients">
          Manage patients
        </Link>
      </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <MediaSection
              label="Posture Test (4 photos required)"
              files={postureGroup.files}
              progress={mediaProgress(postureGroup.files, 4)}
              dropzone={{ getRootProps: postureGroup.getRootProps, getInputProps: postureGroup.getInputProps }}
              removeFile={postureGroup.remove}
            />
            <textarea
              {...register("postureNotes")}
              rows={3}
              placeholder="Capture posture findings with detail"
              className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none"
            />
            {formState.errors.postureNotes && (
              <p className="text-xs text-error">{formState.errors.postureNotes.message}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <MediaSection
            label="Walking / Running - Ground (4 videos)"
              files={groundGroup.files}
              progress={mediaProgress(groundGroup.files, 4)}
              dropzone={{ getRootProps: groundGroup.getRootProps, getInputProps: groundGroup.getInputProps }}
              removeFile={groundGroup.remove}
            />
            <textarea
              {...register("groundNotes")}
              rows={3}
              placeholder="Summarize gait observations from ground trials"
              className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none"
            />
            {formState.errors.groundNotes && (
              <p className="text-xs text-error">{formState.errors.groundNotes.message}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <MediaSection
            label="Walking / Running - Treadmill (optional, submit 4 or none)"
              files={treadmillGroup.files}
              progress={mediaProgress(treadmillGroup.files, 4)}
              dropzone={{ getRootProps: treadmillGroup.getRootProps, getInputProps: treadmillGroup.getInputProps }}
              removeFile={treadmillGroup.remove}
            />
            <textarea
              {...register("treadmillNotes")}
              rows={3}
              placeholder="Optional notes for treadmill running"
              className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none"
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <textarea
              {...register("mskSummary")}
              rows={6}
              placeholder="Document MSK screening findings and highlight risk"
              className="w-full rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
            />
            {formState.errors.mskSummary && (
              <p className="text-xs text-error">{formState.errors.mskSummary.message}</p>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Review all inputs before submission.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Panel title="Patient">{patients.find((patient) => patient.id === watchValues.patientId)?.name}</Panel>
              <Panel title="Posture notes">{watchValues.postureNotes}</Panel>
              <Panel title="Ground notes">{watchValues.groundNotes}</Panel>
              <Panel title="MSK summary">{watchValues.mskSummary}</Panel>
            </div>
            <p className="text-xs text-text-muted">Treadmill captures: {treadmillGroup.files.length} of 4</p>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full rounded-2xl bg-gradient-to-r from-secondary to-primary px-4 py-3 text-sm font-semibold text-white transition hover:scale-105"
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
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <div className="space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <div key={step.label} className="flex-1 min-w-[120px]">
                <div className="text-[11px] text-text-muted">{`${index + 1}. ${step.label}`}</div>
                <div className="mt-2 h-1 w-full rounded-full bg-white/5">
                  <span
                    className="block h-full rounded-full bg-primary transition-all duration-250"
                    style={{ width: `${Math.min(100, ((activeStep >= index ? 1 : 0) + (activeStep > index ? 1 : 0)) * 50)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-background/40 p-6">
          {renderStep()}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-text-muted">{stepError || savedLabel}</p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-text transition hover:border-primary disabled:opacity-40"
          >
            Back
          </button>
        {activeStep < steps.length - 1 ? (
          <button type="button" onClick={handleNext} className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105">
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="rounded-2xl bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
          >
            Submit
          </button>
        )}
      </div>
    </div>
    {submitted && <p className="text-xs text-success">Case submitted - review it in the case inbox.</p>}
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
  progress,
  dropzone,
  removeFile,
}: {
  label: string;
  files: string[];
  progress: number;
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
        {progress === 100 && (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle className="h-4 w-4" /> complete
          </span>
        )}
      </div>
      <div {...rootProps} className="rounded-3xl border border-dashed border-white/20 bg-background/30 p-4 transition hover:border-primary">
        <input {...inputProps} className="hidden" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`slot-${label}-${index}`}
              className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-surface/80 p-3 text-xs text-text-muted"
            >
              {files[index] ? (
                <>
                  <p className="truncate font-semibold text-text">{files[index]}</p>
                  <button
                    type="button"
                    className="text-[11px] text-primary underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(files[index]);
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <UploadCloud className="h-5 w-5 text-text-muted" />
                  <p>Drop or click to add</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5">
        <div className="h-full rounded-full bg-primary transition-all duration-250" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[11px] text-text-muted">{files.length} / 4 ready</p>
    </div>
  );
};
