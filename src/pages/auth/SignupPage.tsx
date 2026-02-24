import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Building2, Eye, EyeOff, Lock, Mail, User, ShieldCheck, Check } from "lucide-react";

const signupSchema = z
  .object({
    orgName: z.string().min(2, "Organisation name required"),
    name: z.string().min(2, "Full name required"),
    email: z.string().email("Valid professional email required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const strengthScore = (value: string) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return (score / 4) * 100;
};

export const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, reset, formState } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });
  const { createOrganisation, isLoadingAuth, isProvisioning, authError } = useAppStore();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const password = watch("password");
  const strength = strengthScore(password || "");

  useEffect(() => {
    if (isProvisioning) {
      navigate("/provisioning");
    }
  }, [isProvisioning, navigate]);

  const onSubmit = async (values: SignupForm) => {
    try {
      await createOrganisation(values.orgName, values.name, values.email, values.password);
      setIsSaved(true);
      setTimeout(() => {
        reset();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const strengthLabel = useMemo(() => {
    if (!password) return "Not set";
    if (strength >= 75) return "Exceptional";
    if (strength >= 50) return "Secure";
    return "Basic";
  }, [strength, password]);

  const strengthColor = useMemo(() => {
    if (strength >= 75) return "bg-green-400 shadow-green-400/20";
    if (strength >= 50) return "bg-primary shadow-primary/20";
    return "bg-amber-400 shadow-amber-400/20";
  }, [strength]);

  const inputClasses = "w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-12 pr-4 py-3.5 text-sm text-white outline-none transition-all duration-300 focus:border-primary/50 focus:bg-white/[0.06] placeholder:text-slate-600";

  return (
    <AuthLayout title="Create workspace" subtitle="Establish your professional clinic in under 60 seconds." action="signup">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Clinic Name</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input
                disabled={isLoadingAuth}
                className={inputClasses}
                placeholder="Elite Physiotherapy"
                {...register("orgName")}
              />
            </div>
            {formState.errors.orgName && <p className="text-[11px] text-red-400 ml-1 font-medium">{formState.errors.orgName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input
                disabled={isLoadingAuth}
                className={inputClasses}
                placeholder="Dr. Alex Carter"
                {...register("name")}
              />
            </div>
            {formState.errors.name && <p className="text-[11px] text-red-400 ml-1 font-medium">{formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Professional Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input
                disabled={isLoadingAuth}
                {...register("email")}
                className={inputClasses}
                placeholder="alex@clinic.pro"
              />
            </div>
            {formState.errors.email && <p className="text-[11px] text-red-400 ml-1 font-medium">{formState.errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  disabled={isLoadingAuth}
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={inputClasses}
                  placeholder="Create"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  disabled={isLoadingAuth}
                  type={showPassword ? "text" : "password"}
                  {...register("confirm")}
                  className={inputClasses}
                  placeholder="Confirm"
                />
              </div>
            </div>
          </div>

          <div className="px-1 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${strengthColor}`}
                style={{ width: `${strength}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Security: <span className="text-slate-400">{strengthLabel}</span></p>
              {formState.errors.confirm && <p className="text-[11px] text-red-400 font-medium">{formState.errors.confirm.message}</p>}
            </div>
          </div>
        </div>

        {authError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center animate-in fade-in zoom-in-95 duration-300">
            <p className="text-xs text-red-400 font-medium">{authError}</p>
          </div>
        )}

        {isSaved ? (
          <div className="w-full h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm font-bold text-green-400">Workspace Ready! Launching...</p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isLoadingAuth}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:grayscale relative overflow-hidden group"
          >
            {isLoadingAuth ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Clinical Space...</span>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Initialise Professional Workspace</span>
              </>
            )}
          </button>
        )}

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already a partner?{" "}
            <a href="/login" className="text-primary font-bold hover:text-secondary transition-colors underline-offset-4 ml-1">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};



