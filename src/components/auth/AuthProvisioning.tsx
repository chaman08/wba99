import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AuthLayout } from '../layout/AuthLayout';
import { AlertCircle, RefreshCw, Database, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthProvisioning: React.FC = () => {
    const { authUser, organisation, isCreatingOrg, authError } = useAppStore();
    const [dots, setDots] = useState('');
    const [progress, setProgress] = useState(10);
    const [checkingManually, setCheckingManually] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 5;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // If authenticated and have org, redirect to dashboard
    useEffect(() => {
        if (authUser && organisation) {
            setProgress(100);
            const timeout = setTimeout(() => {
                // Land in physio dashboard by default as requested
                navigate('/app/dashboard');
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [authUser, organisation, navigate]);

    const handleManualCheck = async () => {
        setCheckingManually(true);
        try {
            window.location.reload();
        } finally {
            setTimeout(() => setCheckingManually(false), 2000);
        }
    };

    return (
        <AuthLayout
            title="Initialising Workspace"
            subtitle="Please wait while we prepare your professional clinical environment."
        >
            <div className="space-y-8 py-4">
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative h-24 w-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                            <div
                                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                                style={{ animationDuration: '1.5s' }}
                            />
                            <Zap className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    </div>

                    <div className="text-center space-y-3 w-full">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white uppercase tracking-[0.3em]">
                                {progress === 100 ? 'Complete!' : `Setting up${dots}`}
                            </h3>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {progress < 40 ? 'Securing Profile...' : progress < 70 ? 'Configuring Database...' : progress < 100 ? 'Finalising Settings...' : 'Redirecting...'}
                            </p>
                        </div>

                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[280px] mx-auto">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out shadow-lg shadow-primary/20"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                            Setting up your clinical database, security rules, and workspace preferences.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-green-400" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Profile</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isCreatingOrg ? 'bg-primary/10' : 'bg-green-500/10'}`}>
                                    <Database className={`h-4 w-4 ${isCreatingOrg ? 'text-primary animate-pulse' : 'text-green-400'}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCreatingOrg ? 'text-white' : 'text-slate-400'}`}>Cloud Environment</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCreatingOrg ? 'text-primary animate-pulse' : 'text-green-400'}`}>
                                {isCreatingOrg ? 'Provisioning' : 'Ready'}
                            </span>
                        </div>
                    </div>

                    {authError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs text-red-400 font-medium text-center">{authError}</p>
                        </div>
                    )}

                    {!authError && progress > 80 && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Taking longer than usual?</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                        We're waiting for global security propagation. This can sometimes take up to 60 seconds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleManualCheck}
                        disabled={checkingManually}
                        className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        <RefreshCw className={`h-4 w-4 ${checkingManually ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        {checkingManually ? 'Verifying...' : 'Check Status Again'}
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};
