import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { AuthLayout } from "../../components/layout/AuthLayout";

const loginSchema = z.object({
  email: z.string().email("Use a demo email"),
  password: z.string().min(4, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const destinations: Record<string, string> = {
  physio: "/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin/dashboard",
};

export const LoginPage = () => {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const login = useAppStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (payload: LoginForm) => {
    const success = await login(payload.email, payload.password);
    if (!success) {
      setError("Credentials not recognized. Use the password you set during signup.");
      return;
    }
    const user = useAppStore.getState().authUser;
    if (user) {
      navigate(destinations[user.role]);
    }
  };

  const floatingLabel = "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-text-muted peer-focus:-top-3 peer-focus:text-xs";

  return (
    <AuthLayout title="Login" subtitle="Secure access, zero friction.">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="email"
              className="peer w-full rounded-2xl border border-white/10 bg-transparent px-3 pb-2 pt-6 text-sm text-text outline-none transition focus:border-primary"
              placeholder=" "
              {...register("email")}
            />
            <label className={`pointer-events-none absolute left-3 top-2 text-xs text-text-muted transition duration-250 ${floatingLabel}`}>
              Email
            </label>
          </div>
          {formState.errors.email && (
            <p className="text-xs text-error">{formState.errors.email.message}</p>
          )}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="peer w-full rounded-2xl border border-white/10 bg-transparent px-3 pb-2 pt-6 text-sm text-text outline-none transition focus:border-primary"
              placeholder=" "
              {...register("password")}
            />
            <label className={`pointer-events-none absolute left-3 top-2 text-xs text-text-muted transition duration-250 ${floatingLabel}`}>
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-text-muted"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formState.errors.password && (
            <p className="text-xs text-error">{formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-250 hover:scale-105"
        >
          Enter workspace
        </button>
        <p className="text-center text-xs text-text-muted">
      use your own email/password pair created via sign up.
      </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-text-muted">Need a workspace?</span>
          <a
            href="/signup"
            className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-semibold text-white transition hover:border-primary"
          >
            Create account
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};
