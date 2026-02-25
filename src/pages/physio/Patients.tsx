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
import type { Profile } from "../../types";

export const PatientsPage = () => {
  const profiles = useAppStore((state) => state.profiles);
  const addProfile = useAppStore((state) => state.addProfile);
  const categories = useAppStore((state) => state.categories);
  const groups = useAppStore((state) => state.groups);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy">>();

  const filtered = useMemo(() => {
    return profiles.filter((profile) =>
      profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
      profile.phone.includes(search)
    );
  }, [profiles, search]);

  const onSubmit = async (values: any) => {
    try {
      await addProfile({
        fullName: values.fullName,
        email: values.email || "",
        phone: values.phone,
        dob: values.dob || null,
        heightCm: Number(values.heightCm) || 0,
        weightKg: Number(values.weightKg) || 0,
        sex: values.sex || "Other",
        categoryId: values.categoryId || categories[0]?.id || "default",
        groupId: values.groupId || groups[0]?.id || "default",
        assignedClinicianIds: [],
        status: "active",
        summary: {
          lastAssessmentAt: null,
          lastAssessmentType: null,
          latestScores: { postureScore: 0, riskScore: 0 },
        },
      });
      reset();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to add profile", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Profiles</h2>
          <p className="text-sm text-text-muted">Manage your clinical profiles and their assessment history.</p>
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
            Add Profile
          </button>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((profile) => (
          <button
            key={profile.id}
            onClick={() => navigate(`/app/clients/${profile.id}`)}
            className="group text-left p-5 bg-surface/50 border border-white/10 rounded-3xl hover:bg-surface hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-primary" />
              </div>
              <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-lg font-bold text-text truncate group-hover:text-primary transition-colors">{profile.fullName}</h3>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Phone className="h-3.5 w-3.5" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                <span>Last Analysis: {profile.summary?.lastAssessmentAt ? new Date(typeof profile.summary.lastAssessmentAt === 'string' ? profile.summary.lastAssessmentAt : profile.summary.lastAssessmentAt.seconds * 1000).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-surface/20 border border-dashed border-white/10 rounded-3xl text-text-muted">
            <Users className="h-12 w-12 mb-3 opacity-20" />
            <p>No profiles found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/5 text-text-muted transition-colors z-10"
            >
              <X className="h-5 w-5 md:h-6 md:h-6" />
            </button>

            <header className="mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold">Add New Profile</h3>
              <p className="text-sm text-text-muted">Create a new profile to track clinical progress.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Full Name *</label>
                  <input
                    {...register("fullName", { required: "Name is required" })}
                    placeholder="e.g. John Doe"
                    className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 px-1">Name is required</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Mobile Number *</label>
                  <input
                    {...register("phone", {
                      required: "Phone is required",
                    })}
                    placeholder="Mobile number"
                    className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 px-1">Phone is required</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Date of Birth</label>
                  <input
                    {...register("dob")}
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Sex</label>
                  <select
                    {...register("sex")}
                    className="w-full bg-surface-light border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Other">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Height (cm)</label>
                  <input
                    {...register("heightCm")}
                    type="number"
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Weight (kg)</label>
                  <input
                    {...register("weightKg")}
                    type="number"
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">Category</label>
                  <select
                    {...register("categoryId")}
                    className="w-full bg-surface-light border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
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
