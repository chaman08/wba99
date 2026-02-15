import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";

export const PatientsPage = () => {
  const patients = useAppStore((state) => state.patients);
  const authUser = useAppStore((state) => state.authUser);
  const addPatient = useAppStore((state) => state.addPatient);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; age: number; tags: string }>();

  const filtered = useMemo(() => {
    return patients.filter((patient) => patient.name.toLowerCase().includes(search.toLowerCase()));
  }, [patients, search]);

  const onSubmit = (values: { name: string; age: number; tags: string }) => {
    addPatient({
      name: values.name,
      age: Number(values.age),
      physiotherapistId: authUser?.id ?? "u-physio",
      tags: values.tags.split(",").map((tag) => tag.trim()),
    });
    reset();
    setModalOpen(false);
  };

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text">Patients</h2>
          <p className="text-sm text-text-muted">All your longitudinal care partners.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient"
            className="rounded-2xl border border-white/10 bg-background px-4 py-2 text-sm text-text outline-none transition focus:border-primary"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-text transition hover:border-primary"
          >
            Add patient
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((patient) => (
          <article
            key={patient.id}
            className="group rounded-3xl border border-white/5 bg-surface/80 p-5 transition hover:-translate-y-1 hover:border-primary/60"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">{patient.name}</h3>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-muted">{patient.tags.join(", ")}</span>
            </div>
            <p className="mt-3 text-sm text-text-muted">
              Last session: {patient.lastSession || "Not recorded"}
            </p>
          </article>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-3xl bg-surface/90 p-6 shadow-soft-light backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-text">New patient</h3>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <input {...register("name", { required: true })} placeholder="Name" className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
              <input {...register("age", { required: true })} type="number" placeholder="Age" className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
              <input {...register("tags")} placeholder="Tags, separated" className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl px-4 py-2 text-sm text-text-muted">
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
