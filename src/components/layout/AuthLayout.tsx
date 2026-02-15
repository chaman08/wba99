import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  accent?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-between rounded-3xl bg-gradient-to-br from-slate-900/40 via-slate-900 to-slate-950 p-1 shadow-soft-light">
        <div className="hidden flex-1 flex-col rounded-3xl bg-slate-900/70 p-14 text-left text-white lg:flex">
          <div className="mb-10 text-sm uppercase tracking-[0.3em] text-slate-400">Physio Intelligence</div>
          <h1 className="text-4xl font-semibold leading-tight">Calm, confident care intelligence.</h1>
          <p className="mt-6 max-w-sm text-base text-slate-300">
            Securely capture assessments, invite experts, and deliver reports within a single, premium workspace.
          </p>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center rounded-3xl bg-slate-950/70 p-10 shadow-soft-light lg:max-w-2xl">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-semibold text-text">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
            <div className="mt-8 space-y-6 rounded-3xl bg-slate-900/60 p-8 shadow-glass-dark">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
