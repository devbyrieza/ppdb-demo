"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Legacy page — redirects to individual test pages
export default function StudentTestPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/pendaftar/undangan-seleksi");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-stone-600">Mengalihkan ke halaman Jadwal Seleksi...</p>
    </div>
  );
}
