"use client";

import { Toaster } from "react-hot-toast";

/**
 * Mount satu kali di dashboard layout agar semua pemanggilan toast.success /
 * toast.error di halaman admin benar-benar tampil.
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#1c1917",
          border: "1px solid #e7e5e4",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
          fontSize: "14px",
          fontWeight: 600,
        },
        success: { iconTheme: { primary: "#059669", secondary: "#fff" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
      }}
    />
  );
}
