import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  User,
  Phone,
  Calendar,
  X
} from "lucide-react";
import type { Patient } from "../../types";

export const PatientsPage = () => {
  const patients = useAppStore((state) => state.patients);
  const addPatient = useAppStore((state) => state.addPatient);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Patient, "id" | "lastSession" | "physiotherapistId">>();

  const filtered = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.includes(search)
    );
  }, [patients, search]);

  const onSubmit = async (values: any) => {
    try {
      await addPatient({
        ...values,
        age: Number(values.age),
        height: values.height ? Number(values.height) : undefined,
        weight: values.weight ? Number(values.weight) : undefined,
        tags: values.tags && typeof values.tags === 'string' ? values.tags.split(",").map((tag: string) => tag.trim()) : [],
      });
      reset();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to add client", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Clients</h2>
          <p className="text-sm text-text-muted">Manage your clients and their assessment history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="pl-10 pr-4 py-2 bg-surface/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => navigate(`/app/clients/${patient.id}`)}
            className="group text-left p-5 bg-surface/50 border border-white/10 rounded-3xl hover:bg-surface hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-lg font-bold text-text truncate group-hover:text-primary transition-colors">{patient.name}</h3>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                <span>Last: {patient.lastSession ? new Date(patient.lastSession).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>

            {patient.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {patient.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] text-text-muted">
                    {tag}
                  </span>
                ))}
                {patient.tags.length > 3 && (
                  <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] text-text-muted">
                    +{patient.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-surface/20 border border-dashed border-white/10 rounded-3xl text-text-muted">
            <Users className="h-12 w-12 mb-3 opacity-20" />
            <p>No clients found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-text-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <header className="mb-8">
              <h3 className="text-2xl font-bold">Add New Client</h3>
              <p className="text-sm text-text-muted">Create a new profile to track clinical progress.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Full Name *</label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    placeholder="e.g. John Doe"
                    className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 px-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Mobile Number *</label>
                  <input
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                    })}
                    placeholder="10-digit number"
                    className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 px-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Age *</label>
                  <input
                    {...register("age", { required: "Age is required", min: 0 })}
                    type="number"
                    placeholder="Enter age"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Gender</label>
                  <select
                    {...register("gender")}
                    className="w-full bg-surface-light border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Height (cm)</label>
                  <input
                    {...register("height")}
                    type="number"
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Weight (kg)</label>
                  <input
                    {...register("weight")}
                    type="number"
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Primary Complaint</label>
                <textarea
                  {...register("complaint")}
                  placeholder="What is the main issue?"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 rounded-2xl hover:bg-white/5 text-text-muted font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
