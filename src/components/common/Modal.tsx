import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer
}: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 fade-in duration-200 overflow-hidden mx-2 sm:mx-0">
                <div className="px-5 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-5 sm:px-8 py-8 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>

                {footer && (
                    <div className="px-5 sm:px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
