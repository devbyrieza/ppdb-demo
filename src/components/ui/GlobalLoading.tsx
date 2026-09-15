"use client";

import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-primary-600 animate-spin shadow-sm"></div>
      </div>
      <p className="mt-4 text-[10px] font-black text-stone-400 animate-pulse tracking-widest uppercase">
        Memuat Data...
      </p>
    </div>
  );
}
