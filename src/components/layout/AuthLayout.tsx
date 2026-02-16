import { Activity, Bone, Footprints, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";

type ActionType = "login" | "signup";
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const heroFeatures: { label: string; Icon: IconComponent }[] = [
  { label: "Posture", Icon: User },
  { label: "Walking", Icon: Footprints },
  { label: "Running", Icon: Activity },
  { label: "M.S.K. Analysis", Icon: Bone },
];

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ActionType;
  landingEnabled?: boolean;
}

export const AuthLayout = ({ children, title, subtitle, action, landingEnabled }: AuthLayoutProps) => {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(true);
  const shouldLanding = landingEnabled ?? true;
  const [showForm, setShowForm] = useState(!shouldLanding);
  const effectiveAction = action ?? "login";

  useEffect(() => {
    if (!shouldLanding || typeof window === "undefined") {
      setIsDesktop(true);
      setShowForm(true);
      return;
    }
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = (event: MediaQueryListEvent | MediaQueryList) => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    setShowForm(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [shouldLanding]);

  useEffect(() => {
    if (!shouldLanding) return;
    setShowForm(isDesktop);
  }, [isDesktop, shouldLanding]);

  const handleHeroAction = useCallback(
    (target: ActionType) => {
      if (target === effectiveAction) {
        setShowForm(true);
        return;
      }
      navigate(target === "login" ? "/login" : "/signup");
    },
    [effectiveAction, navigate],
  );

  const heroText = useMemo(
    () => ({
      title: "Mobile Android App",
      description:
        "A premium posture intelligence experience built for confident motion professionals accessing real-time posture, walking, and MSK insights.",
    }),
    [],
  );

  if (!isDesktop && !showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-text">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6">
          <div className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WBA99</p>
            <h1 className="text-3xl font-semibold text-white">{heroText.title}</h1>
            <p className="text-sm text-slate-300">{heroText.description}</p>
          </div>
          <div className="relative w-full max-w-[330px] rounded-[40px] border border-white/10 bg-gradient-to-b from-slate-950/90 to-slate-900/80 p-4 shadow-[0_40px_80px_rgba(15,23,42,0.85)]">
            <div className="flex flex-col gap-4 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-white/60">WBA99</p>
                <p className="text-2xl font-semibold text-white">{heroText.title}</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleHeroAction("signup")}
                  className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white shadow-lg shadow-sky-500/40"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => handleHeroAction("login")}
                  className="rounded-full border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/80"
                >
                  Login
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {heroFeatures.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-slate-900/50 text-white shadow-[0_0_25px_rgba(56,189,248,0.25)] transition duration-300 hover:border-cyan-300/70"
                  >
                    <Icon className="h-6 w-6 text-white" />
                    <span className="text-[11px] uppercase tracking-[0.3em] text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="max-w-xs text-xs text-slate-300">
            Tap into actionable assessments and role-aware insights without leaving the calm, glassy interface you enjoy on
            mobile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-text">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-between gap-1 rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-950 p-1 shadow-soft-light">
        <div className="hidden flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-slate-900/60 p-10 text-left text-white lg:flex">
          <div className="space-y-2 text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WBA99</p>
            <p className="text-2xl font-semibold tracking-tight text-white">{heroText.title}</p>
            <p className="max-w-xs text-sm text-slate-300">{heroText.description}</p>
          </div>
          <div className="relative w-full max-w-[330px]">
            <div className="pointer-events-none absolute -inset-6 z-0 rounded-[45px] bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-sky-500/0 blur-3xl" />
            <div className="relative z-10 overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-b from-slate-950/90 to-slate-900/80 p-4 shadow-[0_40px_80px_rgba(15,23,42,0.85)]">
              <div className="flex flex-col gap-5 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-white/60">WBA99</p>
                  <p className="text-2xl font-semibold text-white">{heroText.title}</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to="/signup"
                    className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white shadow-lg shadow-sky-500/40"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/80"
                  >
                    Login
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {heroFeatures.map(({ label, Icon }) => (
                    <div
                      key={label}
                      className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-slate-900/50 text-white shadow-[0_0_25px_rgba(56,189,248,0.25)] transition duration-300 hover:border-cyan-300/70"
                    >
                      <Icon className="h-6 w-6 text-white" />
                      <span className="text-[11px] uppercase tracking-[0.3em] text-slate-200">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="max-w-xs text-xs text-slate-300">
            Tap into actionable assessments and role-aware insights without leaving the calm, glassy interface you enjoy on
            mobile.
          </p>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center rounded-3xl bg-slate-950/70 p-6 sm:p-10 shadow-soft-light lg:max-w-2xl">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
            <div className="mt-6 sm:mt-8 space-y-6 rounded-3xl bg-slate-900/60 p-6 sm:p-8 shadow-glass-dark relative">
              {!isDesktop && (
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute -top-10 left-0 flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back to info
                </button>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
