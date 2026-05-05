"use client";

import {
  Check,
  Clock,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  GraduationCap,
  CreditCard,
  Target,
  CheckCircle,
} from "lucide-react";
import {
  getStatusIndex,
  type StatusProses,
  formatStatusDisplay,
} from "@/lib/access-control";
import { motion } from "framer-motion";

interface ProgressTrackerProps {
  currentStatus: StatusProses;
}

export default function ProgressTracker({
  currentStatus,
}: ProgressTrackerProps) {
  const currentIndex = getStatusIndex(currentStatus);
  const statusInfo = formatStatusDisplay(currentStatus);

  const phases = [
    {
      id: "pendaftaran",
      label: "Registration",
      sub: "Initial & Payment",
      icon: CreditCard,
      requiredStatus: "verified",
      description: "Registration & Payment",
    },
    {
      id: "dokumen",
      label: "Documents",
      sub: "Data & Upload",
      icon: FileText,
      requiredStatus: "docs_verified",
      description: "Documents Completion",
    },
    {
      id: "ujian",
      label: "Selection",
      sub: "Exam & Interview",
      icon: Target,
      requiredStatus: "tested",
      description: "Entrance Examination",
    },
    {
      id: "pengumuman",
      label: "Enrollment",
      sub: "Results & Final",
      icon: GraduationCap,
      requiredStatus: "enrolled",
      description: "Results Announcement",
    },
  ];

  // Calculate overall progress percentage for the progress bar
  const totalPhases = phases.length;
  let completedPhases = 0;
  phases.forEach((phase) => {
    if (currentIndex >= getStatusIndex(phase.requiredStatus)) {
      completedPhases++;
    }
  });

  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-stone-100 shadow-2xl shadow-stone-200/50 overflow-hidden relative group text-left">
      {/* Decorative Background Icons */}
      <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
        <GraduationCap size={300} className="text-teal-900" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 rounded-full border border-teal-100 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">
                Application Progress
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-teal-950 tracking-tight leading-none italic">
              Monitor{" "}
              <span className="text-teal-700 not-italic">Your Journey.</span>
            </h3>
            <p className="text-stone-400 font-medium text-sm italic italic">
              "Follow these steps to complete your registration process
              successfully."
            </p>
          </div>
          <div className="bg-stone-50 px-6 py-4 rounded-2xl border border-stone-100 text-right hidden lg:block">
            <p className="text-[9px] font-black uppercase text-stone-400 tracking-widest mb-1">
              CURRENT STEP
            </p>
            <p className="font-black text-teal-900 flex items-center gap-2 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {statusInfo.label}
            </p>
          </div>
        </div>

        {/* PROGRESS STEPS - HORIZONTAL ON DESKTOP */}
        <div className="relative">
          {/* Main Connector Line (Desktop) */}
          <div className="absolute top-10 left-0 w-full h-1 bg-stone-100 rounded-full hidden md:block overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-teal-600 to-teal-800"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
            {phases.map((phase, idx) => {
              const requiredIndex = getStatusIndex(phase.requiredStatus);
              const isCompleted = currentIndex >= requiredIndex;
              const isCurrent =
                !isCompleted &&
                (idx === 0 ||
                  currentIndex >=
                    getStatusIndex(phases[idx - 1].requiredStatus));
              const Icon = phase.icon;

              return (
                <div key={phase.id} className="relative group/step">
                  <div className="flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-4">
                    {/* Step Icon / Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center relative z-10 transition-all duration-500 border-4 ${
                        isCompleted
                          ? "bg-teal-700 border-white text-white shadow-xl shadow-teal/20"
                          : isCurrent
                            ? "bg-white border-teal-700 text-teal-700 shadow-2xl shadow-teal/10 scale-110"
                            : "bg-white border-stone-100 text-stone-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                      ) : (
                        <Icon
                          className={`w-6 h-6 md:w-8 md:h-8 ${isCurrent ? "animate-bounce-subtle" : ""}`}
                        />
                      )}

                      {/* Step Number Badge */}
                      <div
                        className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                          isCompleted
                            ? "bg-emerald-500 border-white text-white"
                            : isCurrent
                              ? "bg-teal-700 border-white text-white"
                              : "bg-stone-200 border-white text-stone-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </motion.div>

                    {/* Step Content */}
                    <div className="flex-1 md:pt-2">
                      <h4
                        className={`text-sm md:text-lg font-black tracking-tight leading-none mb-1 transition-colors ${
                          isCompleted
                            ? "text-teal-900"
                            : isCurrent
                              ? "text-teal-800"
                              : "text-stone-300"
                        }`}
                      >
                        {phase.label}
                      </h4>
                      <p
                        className={`text-[10px] md:text-xs font-bold transition-all ${
                          isCompleted || isCurrent
                            ? "text-teal-700/60"
                            : "text-stone-300"
                        }`}
                      >
                        {phase.sub}
                      </p>
                    </div>
                  </div>

                  {/* Vertikal Connector for Mobile Only */}
                  {idx < phases.length - 1 && (
                    <div className="absolute top-14 left-7 w-0.5 h-10 bg-stone-100 md:hidden -z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
