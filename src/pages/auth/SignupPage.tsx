import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { AuthLayout } from "../../components/layout/AuthLayout";

const signupSchema = z
  .object({
    name: z.string().min(2, "Use a full name"),
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
    role: z.enum(["physio", "expert", "admin"]),
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
  const { register, handleSubmit, watch, reset, formState } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "physio" },
  });
  const signup = useAppStore((state) => state.signup);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const password = watch("password");
  const strength = strengthScore(password || "");

  const onSubmit = async (values: SignupForm) => {
    await signup(values.name, values.email, values.role, values.password);
    setIsSaved(true);
    setTimeout(() => {
      reset();
      navigate("/login");
    }, 900);
  };

  const strengthLabel = useMemo(() => {
    if (strength >= 75) return "Strong";
    if (strength >= 50) return "Balanced";
    return "Weak";
  }, [strength]);

  return (
    <AuthLayout title="Create account" subtitle="Invite experts and orchestrate assessments.">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Full name</label>
          <input
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
            placeholder="Alex Collector"
            {...register("name")}
          />
          {formState.errors.name && <p className="text-xs text-error">{formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Work email</label>
          <input
            {...register("email")}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
            placeholder="you@example.com"
          />
          {formState.errors.email && <p className="text-xs text-error">{formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Role</label>
          <select
            {...register("role")}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
          >
            <option value="physio">Physiotherapist</option>
            <option value="expert">Expert Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
            placeholder="Create a secure password"
          />
          <div className="mt-2 h-2 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-primary transition-all duration-250"
              style={{ width: `${strength}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted">{strengthLabel}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Confirm password</label>
          <input
            type="password"
            {...register("confirm")}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
            placeholder="Repeat password"
          />
          {formState.errors.confirm && <p className="text-xs text-error">{formState.errors.confirm.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-250 hover:scale-105"
        >
          Create premium workspace
        </button>
        {isSaved && <p className="text-center text-xs text-success">Account ready. Redirecting to login…</p>}
        <p className="text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};



