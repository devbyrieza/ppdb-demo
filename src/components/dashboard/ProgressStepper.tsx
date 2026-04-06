"use client";

import { Check, ClipboardList, CreditCard, FileText, Calendar, GraduationCap, UserCheck } from "lucide-react";
import { type StatusProses } from "@/lib/access-control";

interface ProgressStepperProps {
    currentStatus: StatusProses;
}

const STEPS = [
    { id: "draft", label: "Registrasi", icon: ClipboardList, statuses: ["draft"] },
    { id: "payment", label: "Pembayaran", icon: CreditCard, statuses: ["waiting_payment", "awaiting_payment", "payment_verification", "payment_rejected"] },
    { id: "data", label: "Isi Data", icon: FileText, statuses: ["paid", "verified", "data_completed"] },
    { id: "docs", label: "Berkas", icon: FileText, statuses: ["docs_uploaded", "docs_verified", "docs_rejected"] },
    { id: "test", label: "Tes Seleksi", icon: Calendar, statuses: ["scheduled", "tested"] },
    { id: "result", label: "Hasil", icon: GraduationCap, statuses: ["announced", "accepted"] },
    { id: "re_register", label: "Daftar Ulang", icon: UserCheck, statuses: ["enrolled", "re_registered"] },
];

export default function ProgressStepper({ currentStatus }: ProgressStepperProps) {
    // Find current step index
    const currentStepIndex = STEPS.findIndex(step => step.statuses.includes(currentStatus));
    // If not found, default to 0
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full py-6 px-4 mb-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-stone-100 shadow-sm overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between min-w-[700px] lg:min-w-0 px-4">
                {STEPS.map((step, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={idx} className="flex flex-col items-center relative flex-1">
                            {/* Connector Line */}
                            {idx < STEPS.length - 1 && (
                                <div className="absolute top-5 left-[50%] right-[-50%] h-0.5 bg-stone-100 z-0">
                                    <div
                                        className={`h-full bg-brand-blue-600 transition-all duration-700 ${idx < activeIndex ? 'w-full' : 'w-0'}`}
                                    />
                                </div>
                            )}

                            {/* Icon Circle */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 border-2 ${isCompleted
                                    ? "bg-brand-blue-600 border-brand-blue-600 text-white shadow-brand-blue-200 shadow-lg"
                                    : isActive
                                        ? "bg-white border-brand-blue-600 text-brand-blue-600 shadow-brand-blue-100 shadow-lg scale-110 font-bold"
                                        : "bg-white border-stone-200 text-stone-300"
                                    }`}
                            >
                                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                            </div>

                            {/* Label */}
                            <span
                                className={`mt-3 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors duration-500 ${isActive ? "text-brand-blue-800" : isCompleted ? "text-stone-600" : "text-stone-400"
                                    }`}
                            >
                                {step.label}
                            </span>

                            {/* Status Indicator Bar */}
                            {isActive && (
                                <div className="mt-1 h-1 w-8 bg-brand-yellow-400 rounded-full animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
