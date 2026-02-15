import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "../../components/layout/AuthLayout";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll remind you with a secure link.">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-xs text-text-muted">Work email</label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary"
          />
          {formState.errors.email && <p className="text-xs text-error">{formState.errors.email.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-250 hover:scale-105"
        >
          Send reset link
        </button>
        {submitted && (
          <p className="text-center text-xs text-success">Check your inbox. Link expires in 15 minutes.</p>
        )}
      </form>
    </AuthLayout>
  );
};
