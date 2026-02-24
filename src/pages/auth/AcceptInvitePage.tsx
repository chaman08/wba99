import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { AuthLayout } from "../../components/layout/AuthLayout";

const acceptSchema = z
    .object({
        name: z.string().min(2, "Use a full name"),
        password: z.string().min(8, "At least 8 characters"),
        confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords must match",
        path: ["confirm"],
    });

type AcceptForm = z.infer<typeof acceptSchema>;

const strengthScore = (value: string) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return (score / 4) * 100;
};

export const AcceptInvitePage = () => {
    const [searchParams] = useSearchParams();
    const inviteId = searchParams.get("inviteId");
    const orgId = searchParams.get("orgId");

    const { register, handleSubmit, watch, formState } = useForm<AcceptForm>({
        resolver: zodResolver(acceptSchema),
    });
    const { acceptInvite, isLoadingAuth, authError } = useAppStore();
    const [isSaved, setIsSaved] = useState(false);
    const password = watch("password");
    const strength = strengthScore(password || "");

    const onSubmit = async (values: AcceptForm) => {
        if (!inviteId || !orgId) return;
        try {
            await acceptInvite(inviteId, orgId, values.name, values.password);
            setIsSaved(true);
        } catch (err) {
            console.error(err);
        }
    };

    const strengthLabel = useMemo(() => {
        if (strength >= 75) return "Strong";
        if (strength >= 50) return "Balanced";
        return "Weak";
    }, [strength]);

    if (!inviteId || !orgId) {
        return (
            <AuthLayout title="Invalid Invite" subtitle="Link is missing parameters." action="login">
                <p className="text-center text-sm text-error">This invite link is invalid or expired.</p>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Accept Invite" subtitle="Join your team and start working." action="signup">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <label className="text-xs text-text-muted">Full name</label>
                    <input
                        disabled={isLoadingAuth}
                        className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary opacity-disabled"
                        placeholder="Alex Collector"
                        {...register("name")}
                    />
                    {formState.errors.name && <p className="text-xs text-error">{formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-text-muted">Password</label>
                    <input
                        disabled={isLoadingAuth}
                        type="password"
                        {...register("password")}
                        className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary opacity-disabled"
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
                        disabled={isLoadingAuth}
                        type="password"
                        {...register("confirm")}
                        className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none transition focus:border-primary opacity-disabled"
                        placeholder="Repeat password"
                    />
                    {formState.errors.confirm && <p className="text-xs text-error">{formState.errors.confirm.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoadingAuth}
                    className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white transition duration-250 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isLoadingAuth ? "Completing setup..." : "Accept Invite & Login"}
                </button>
                {isSaved && <p className="text-center text-xs text-success">Setup complete. Authenticating…</p>}
                {authError && <p className="text-center text-xs text-error">{authError}</p>}
            </form>
        </AuthLayout>
    );
};
