"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForceChangePassword({ isDefaultPassword }: { isDefaultPassword: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isDefaultPassword && pathname !== "/dashboard/admin/profil") {
      router.push("/dashboard/admin/profil?force_change=true");
    }
  }, [isDefaultPassword, pathname, router]);

  if (isDefaultPassword && pathname !== "/dashboard/admin/profil") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm overscroll-contain">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Aksi Diperlukan</h2>
          <p className="text-gray-600">
            Mengarahkan ke halaman pengaturan profil untuk mengganti password bawaan Anda...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
