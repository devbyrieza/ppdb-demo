"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Sparkles,
  PartyPopper,
  Copy,
  Check,
  CreditCard,
  IdCard,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  School,
} from "lucide-react";

function DaftarSuksesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari query params
  const nomor_pendaftaran = searchParams.get("nomor_pendaftaran") || "";
  const nama_lengkap = searchParams.get("nama_lengkap") || "";
  const jenjang = searchParams.get("jenjang") || "";
  const jenis_kelamin = searchParams.get("jenis_kelamin") || "";
  const nik = searchParams.get("nik") || "";

  const [copiedField, setCopiedField] = useState<"nomor" | "nik" | null>(null);
  // Clear sessionStorage saat sukses (data tidak diperlukan lagi)
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendaftaran_form");
    }
  }, []);

  // Copy to clipboard
  const handleCopy = (text: string, field: "nomor" | "nik") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="app-card max-w-lg w-full bg-white rounded-[2.5rem] shadow-lg border border-cream-200 p-8 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cream-50 rounded-full blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="text-center relative z-10 mb-6 mt-4">
        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-cream-50 rounded-3xl border border-cream-200">
          <CheckCircle2 className="w-14 h-14 text-maroon-600 animate-bounce" />
          <Sparkles className="w-8 h-8 text-maroon-200 absolute -top-3 -right-3 animate-pulse" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center relative z-10 mb-8">
        <h1 className="text-3xl font-display font-black text-ink-950 mb-2 flex items-center justify-center gap-2">
          <PartyPopper className="w-6 h-6 text-maroon-600" />
          Alhamdulillah!
        </h1>
        <p className="text-xl font-bold text-ink-800 mb-2">
          Pendaftaran Berhasil
        </p>
        <p className="text-sm font-medium text-ink-500">
          Data Anda telah tersimpan dengan aman di sistem kami.
        </p>
      </div>

      {/* Credentials Box */}
      <div className="bg-cream-50 border border-cream-200 rounded-[1.5rem] p-6 mb-6 relative z-10">
        <p className="text-[10px] font-black tracking-widest uppercase text-maroon-600 mb-4 text-center flex items-center justify-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          DATA LOGIN ANDA
        </p>

        {/* Nomor Pendaftaran */}
        <div className="bg-white rounded-xl border border-cream-200 p-4 mb-3 shadow-sm app-card">
          <p className="text-xs font-bold text-ink-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-maroon-600" />
            Nomor Pendaftaran
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl font-black text-maroon-900 break-all bg-cream-50/50 px-2 py-1 rounded-lg">
              {nomor_pendaftaran}
            </p>
            <button
              onClick={() => handleCopy(nomor_pendaftaran, "nomor")}
              className="p-2.5 bg-cream-50 hover:bg-cream-200 border border-maroon-200 rounded-xl transition-colors shrink-0 app-card hover:scale-105 active:scale-95"
              title="Salin nomor pendaftaran"
            >
              {copiedField === "nomor" ? (
                <Check className="w-5 h-5 text-maroon-600" />
              ) : (
                <Copy className="w-5 h-5 text-ink-600" />
              )}
            </button>
          </div>
        </div>

        {/* NIK Santri */}
        <div className="bg-white rounded-xl border border-cream-200 p-4 mb-3 shadow-sm app-card">
          <p className="text-xs font-bold text-ink-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <IdCard className="w-3.5 h-3.5 text-maroon-600" />
            NIK Santri (Password)
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-black text-ink-900 break-all">{nik}</p>
            <button
              onClick={() => handleCopy(nik, "nik")}
              className="p-2.5 bg-cream-50 hover:bg-cream-200 border border-maroon-200 rounded-xl transition-colors shrink-0 app-card hover:scale-105 active:scale-95"
              title="Salin NIK"
            >
              {copiedField === "nik" ? (
                <Check className="w-5 h-5 text-maroon-600" />
              ) : (
                <Copy className="w-5 h-5 text-ink-600" />
              )}
            </button>
          </div>
        </div>

        {/* Login Info */}
        <div className="mt-4 py-2">
          <p className="text-xs text-ink-600 flex items-center justify-center gap-1.5 text-center font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-maroon-600" />
            Gunakan <strong className="text-ink-950 font-black">NIK</strong> dan{" "}
            <strong className="text-ink-950 font-black">Nomor Pendaftaran</strong> untuk masuk.
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-white border-2 border-cream-200 rounded-[1.5rem] p-5 mb-8 relative z-10 shadow-sm">
        <p className="text-sm text-ink-950 font-black mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-yellow-400" />
          PENTING - Simpan Data Ini!
        </p>
        <ul className="text-xs text-ink-700 space-y-2.5 font-medium">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-maroon-600 shrink-0" />
            <span>
              Screenshot atau catat <strong>Nomor Pendaftaran</strong> dan{" "}
              <strong>NIK Santri</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-maroon-600 shrink-0" />
            <span>
              <strong>TIDAK perlu password lain</strong> - cukup NIK + Nomor
              Pendaftaran
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-maroon-600 shrink-0" />
            <span>
              Setelah login, lakukan <strong>pembayaran pendaftaran</strong> lalu lengkapi data & upload berkas.
            </span>
          </li>
        </ul>
      </div>



      <div className="relative z-10 w-full mb-6">
        <button
          onClick={() => router.push("/login")}
          className="w-full py-4 md:py-5 rounded-pill bg-maroon-600 text-white font-black text-lg hover:bg-maroon-700 shadow-xl shadow-cream-200 transition-all flex items-center justify-center gap-2.5 active:scale-95"
        >
          Lanjut ke Halaman Login
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center relative z-10">
        <p className="text-[10px] uppercase tracking-widest font-bold text-ink-500 mb-1.5">Butuh Bantuan Login?</p>
        <a
          href="https://wa.me/622667345601"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-cream-50 text-maroon-700 px-4 py-1.5 rounded-full font-black border border-cream-200 hover:bg-cream-200 transition-colors inline-block"
        >
          Hubungi Admin WhatsApp
        </a>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="app-card max-w-lg w-full bg-white rounded-[2.5rem] shadow-lg border border-cream-200 p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-maroon-600 animate-spin mb-4" />
        <p className="text-ink-600 font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}

export default function DaftarSuksesPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cream-200/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Suspense fallback={<LoadingFallback />}>
        <DaftarSuksesContent />
      </Suspense>
    </main>
  );
}
