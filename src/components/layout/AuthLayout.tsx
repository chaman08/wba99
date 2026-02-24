import { Activity, Bone, Footprints, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
      title: "Motion Intelligence",
      description:
        "The ultimate clinical-grade movement analysis platform. Professional posture, gait, and MSK insights in a seamless mobile experience.",
    }),
    [],
  );

  if (!isDesktop && !showForm) {
    return (
      <div className="min-h-screen bg-[#020617] text-text font-['Inter'] overflow-hidden relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-1000" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 p-6">
          <div className="space-y-4 text-center">
            <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">
              WBA99 Pro
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{heroText.title}</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">{heroText.description}</p>
          </div>

          <div className="w-full max-w-[340px] rounded-[48px] p-[1px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-slate-950/90 rounded-[47px] p-6 backdrop-blur-3xl">
              <div className="flex flex-col gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                    <Activity className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-2">Next-Gen Assessment</h2>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleHeroAction("signup")}
                    className="flex-1 rounded-2xl bg-white text-slate-950 h-12 text-sm font-bold transition hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/10"
                  >
                    Get Started
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHeroAction("login")}
                    className="flex-1 rounded-2xl border border-white/10 text-white h-12 text-sm font-bold transition hover:bg-white/5 active:scale-95"
                  >
                    Sign In
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {heroFeatures.map(({ label, Icon }) => (
                    <div
                      key={label}
                      className="flex h-28 flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/[0.03] text-white transition hover:bg-white/[0.08] hover:border-white/10 group/item"
                    >
                      <div className="p-3 rounded-2xl bg-white/5 group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-white transition-colors">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="max-w-xs text-center text-xs text-slate-500 leading-relaxed font-medium">
            Join the elite circle of clinicians using AI-powered insights for better patient outcomes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-text font-['Inter'] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center p-6 lg:p-12">
        <div className="flex w-full max-w-6xl h-[800px] rounded-[48px] overflow-hidden border border-white/10 bg-slate-950/50 backdrop-blur-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">

          {/* Hero Side */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-16 relative overflow-hidden border-r border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

            <div className="relative z-10 w-full max-w-md space-y-12">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                  WBA99 Motion Pro
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
                  {heroText.title}
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  {heroText.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {heroFeatures.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-start gap-4 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition group/item"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-white transition-colors">{label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800" />
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Trusted by <span className="text-white font-bold">2,000+</span> specialists globally.
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 bg-slate-900/40 relative">
            <div className="w-full max-w-sm space-y-8">
              <div className="text-center lg:text-left">
                {!isDesktop && (
                  <button
                    onClick={() => setShowForm(false)}
                    className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition group"
                  >
                    <svg className="transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back
                  </button>
                )}
                <h2 className="text-4xl font-bold text-white tracking-tight">{title}</h2>
                {subtitle && <p className="mt-4 text-slate-400 font-medium">{subtitle}</p>}
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative space-y-6">
                  {children}
                </div>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[12px] uppercase tracking-[0.4em] text-white/40 font-black">
                  Powered by
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                    <Activity className="text-white w-4 h-4" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-white">WBA99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
