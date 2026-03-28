"use client";

import { Home } from "lucide-react";
import Link from "next/link";

interface BackToHomeButtonProps {
  variant?: "icon-only" | "with-text";
  className?: string;
  position?: "top-left" | "top-center" | "top-right";
}

export default function BackToHomeButton({
  variant = "with-text",
  className = "",
  position = "top-left",
}: BackToHomeButtonProps) {
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
  };

  return (
    <Link
      href="/"
      className={`fixed ${positionClasses[position]} z-50 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
      title="Kembali ke Beranda"
    >
      <Home size={20} />
      {variant === "with-text" && <span>Beranda</span>}
    </Link>
  );
}
