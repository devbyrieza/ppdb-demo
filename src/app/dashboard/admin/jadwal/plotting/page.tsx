"use client";

import { Suspense } from "react";
import JadwalUjianPage from "@/app/dashboard/admin/jadwal-ujian/page";

export default function AdminPlottingJadwalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-stone-400">Memuat Jadwal...</div>}>
      <JadwalUjianPage />
    </Suspense>
  );
}
