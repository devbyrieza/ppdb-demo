"use client";

import { Check, Clock, Lock, ArrowRight, ShieldCheck, FileText, Calendar, GraduationCap, CreditCard } from "lucide-react";
import { 
  getStatusIndex, 
  type StatusProses,
  formatStatusDisplay 
} from "@/lib/access-control";

interface ProgressTrackerProps {
  currentStatus: StatusProses;
}

export default function ProgressTracker({ currentStatus }: ProgressTrackerProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const statusInfo = formatStatusDisplay(currentStatus);

  const phases = [
    { 
      id: "pendaftaran", 
      label: "Registrasi & Pembayaran", 
      icon: CreditCard,
      requiredStatus: "verified",
      description: "Pendaftaran awal dan pelunasan biaya"
    },
    { 
      id: "dokumen", 
      label: "Kelengkapan Berkas", 
      icon: FileText,
      requiredStatus: "docs_verified",
      description: "Pengisian data dan upload dokumen"
    },
    { 
      id: "ujian", 
      label: "Seleksi & Ujian", 
      icon: Calendar,
      requiredStatus: "tested",
      description: "Pelaksanaan ujian seleksi online/offline"
    },
    { 
      id: "pengumuman", 
      label: "Hasil & Daftar Ulang", 
      icon: GraduationCap,
      requiredStatus: "enrolled",
      description: "Pengumuman hasil dan registrasi akhir"
    }
  ];

  return (
    <div className="bg-white rounded-3xl md:rounded-4xl p-6 sm:p-8 border border-brand-yellow-100 shadow-clay-lg overflow-hidden relative group">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-brand-blue-950 tracking-tight leading-none mb-2">Alur Pendaftaran</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-ink-400">Status Saat Ini: <span className="text-brand-blue-700">{statusInfo.label}</span></p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow-50 flex items-center justify-center border border-brand-yellow-100 shadow-clay-sm">
            <ShieldCheck className="w-6 h-6 text-brand-blue-700" />
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {phases.map((phase, idx) => {
            const requiredIndex = getStatusIndex(phase.requiredStatus);
            const isCompleted = currentIndex >= requiredIndex;
            const isCurrent = !isCompleted && (idx === 0 || currentIndex >= getStatusIndex(phases[idx-1].requiredStatus));
            const Icon = phase.icon;

            return (
              <div key={phase.id} className="flex gap-4 md:gap-6 group/item relative">
                {/* Connector Line */}
                {idx < phases.length - 1 && (
                  <div className={`absolute top-10 left-5 md:left-6 w-0.5 h-full -ml-px bg-stone-100 z-0`}>
                    <div className={`h-full bg-brand-blue-600 transition-all duration-1000 ${isCompleted ? 'scale-y-100' : 'scale-y-0'} origin-top`} />
                  </div>
                )}

                {/* Circle Icon */}
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center relative z-10 transition-all duration-500 border-2 ${
                    isCompleted 
                      ? "bg-brand-blue-700 border-brand-blue-700 text-white shadow-brand-blue-200 shadow-xl" 
                      : isCurrent 
                        ? "bg-white border-brand-blue-700 text-brand-blue-700 shadow-brand-blue-100 shadow-xl scale-110" 
                        : "bg-surface-50 border-stone-200 text-stone-300"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                </div>

                {/* Text Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm md:text-base font-black tracking-tight transition-colors ${
                      isCompleted ? "text-brand-blue-900" : isCurrent ? "text-brand-blue-800" : "text-stone-400"
                    }`}>
                      {phase.label}
                    </h4>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[8px] uppercase font-black tracking-widest px-2 py-0.5 bg-brand-yellow-400 text-brand-blue-950 rounded-full animate-pulse">
                        Proses
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] md:text-xs font-bold leading-relaxed transition-opacity ${
                    isCompleted || isCurrent ? "text-ink-600 opacity-80" : "text-stone-400 opacity-50"
                  }`}>
                    {phase.description}
                  </p>
                </div>

                {/* Detail Button (Optional indicator) */}
                {isCurrent && (
                  <div className="hidden md:flex items-center">
                    <div className="p-2 bg-brand-blue-50 rounded-full text-brand-blue-700 group-hover/item:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
