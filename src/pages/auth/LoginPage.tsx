import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { UserRole } from "../../types";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const destinations: Record<UserRole, string> = {
  owner: "/admin/home",
  admin: "/admin/home",
  clinician: "/app/dashboard",
  assistant: "/app/dashboard",
  readOnly: "/app/view",
};

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const { login, isLoadingAuth, isProvisioning, authError } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isProvisioning) {
      navigate("/provisioning");
    }
  }, [isProvisioning, navigate]);

  const onSubmit = async (payload: LoginForm) => {
    const success = await login(payload.email, payload.password);
    if (success) {
      const user = useAppStore.getState().authUser;
      if (user) {
        navigate(destinations[user.role]);
      }
    }
  };

  const inputClasses = "w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-12 pr-4 py-3.5 text-sm text-white outline-none transition-all duration-300 focus:border-primary/50 focus:bg-white/[0.06] placeholder:text-slate-600";

  return (
    <AuthLayout title="Welcome back" subtitle="Please enter your credentials to access your clinical workspace." action="login">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                disabled={isLoadingAuth}
                className={inputClasses}
                placeholder="name@clinic.com"
                {...register("email")}
              />
            </div>
            {formState.errors.email && (
              <p className="text-[11px] text-red-400 ml-1 font-medium">{formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Password</label>
              <a href="/forgot-password" virtual-link="true" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                disabled={isLoadingAuth}
                className={inputClasses}
                placeholder="••••••••"
                {...register("password")}
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
            {formState.errors.password && (
              <p className="text-[11px] text-red-400 ml-1 font-medium">{formState.errors.password.message}</p>
            )}
          </div>
        </div>

        {authError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center animate-in fade-in zoom-in-95 duration-300">
            <p className="text-xs text-red-400 font-medium">{authError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoadingAuth}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:grayscale relative overflow-hidden group"
        >
          {isLoadingAuth ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Sign In to Workspace</span>
            </>
          )}
        </button>

        <div className="pt-4 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:text-secondary transition-colors font-bold ml-1">
              Create one for free
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
