"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  canAccessTab,
  getUnlockMessage,
  getNextStep,
  formatStatusDisplay,
  type TabName,
  type StatusProses,
} from "@/lib/access-control";

interface StepGuardProps {
  children: React.ReactNode;
  tabName: TabName;
  redirectOnFail?: string;
}

export default function StepGuard({
  children,
  tabName,
  redirectOnFail = "/dashboard/pendaftar",
}: StepGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StatusProses>("draft");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get session
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          router.push("/login");
          return;
        }

        const sessionData = await sessionRes.json();
        if (!sessionData.pendaftar_id) {
          router.push("/login");
          return;
        }

        // Get status
        const statusRes = await fetch(
          `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`
        );

        let status: StatusProses = "draft";
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          status = (statusData.status_proses || "draft") as StatusProses;
        }

        setCurrentStatus(status);

        // Check access
        const canAccess = canAccessTab(tabName, status);
        setHasAccess(canAccess);

        if (!canAccess && redirectOnFail) {
          // Optional: auto redirect after delay
          // setTimeout(() => router.push(redirectOnFail), 3000);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [tabName, redirectOnFail, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-stone-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    const statusInfo = formatStatusDisplay(currentStatus);
    const nextStep = getNextStep(currentStatus);
    const unlockMessage = getUnlockMessage(tabName);

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full mx-auto text-center px-4">
          {/* Lock Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Halaman Terkunci
          </h2>

          {/* Description */}
          <p className="text-stone-600 mb-6">{unlockMessage}</p>

          {/* Current Status */}
          <div className="bg-white rounded-xl p-4 border-2 border-amber-200 mb-6">
            <p className="text-sm text-stone-500 mb-2">Status Anda saat ini:</p>
            <span
              className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Next Step */}
          {nextStep && (
            <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-200 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-bold text-teal-900">
                    Langkah selanjutnya:
                  </p>
                  <p className="text-sm text-teal-700">{nextStep.action}</p>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <Link
            href={redirectOnFail}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
