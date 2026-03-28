"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Check,
  Send,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Zap,
} from "lucide-react";

// MODE DEMO - Set true untuk bypass OTP
const DEMO_MODE = true;

function PilihVerifikasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari query params (dikirim dari halaman daftar)
  const no_hp = searchParams.get("no_hp") || "";
  const nik = searchParams.get("nik") || "";
  const nama_lengkap = searchParams.get("nama_lengkap") || "";
  const tanggal_lahir = searchParams.get("tanggal_lahir") || "";
  const jenis_kelamin = searchParams.get("jenis_kelamin") || "";
  const jenjang = searchParams.get("jenjang") || "";

  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "sms">(
    "whatsapp",
  );
  const [isLoading, setIsLoading] = useState(false);

  // Function untuk generate nomor pendaftaran (sama seperti di backend)
  const generateNomorPendaftaran = () => {
    const year = new Date().getFullYear();
    const prefix =
      jenis_kelamin === "L"
        ? jenjang === "MTs"
          ? "MTI"
          : jenjang === "IL"
            ? "ILI"
            : "MAI"
        : jenjang === "MTs"
          ? "MTA"
          : jenjang === "IL"
            ? "ILA"
            : "MAA";

    // Random 4 digit untuk demo
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return `${prefix}${year}${randomNum}`;
  };

  const handleProsesDemo = async () => {
    setIsLoading(true);

    try {
      // Simulasi loading (agar terlihat profesional)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate nomor pendaftaran
      const nomorPendaftaran = generateNomorPendaftaran();

      // Simpan data ke database (buat API endpoint /api/register/demo-direct)
      const response = await fetch("/api/register/demo-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik,
          nama_lengkap,
          tanggal_lahir,
          no_hp,
          jenis_kelamin,
          jenjang,
          nomor_pendaftaran: nomorPendaftaran,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftar");
      }

      // Redirect langsung ke halaman sukses (bypass verifikasi OTP)
      const params = new URLSearchParams({
        nomor_pendaftaran: nomorPendaftaran,
        nama_lengkap,
        jenjang,
        jenis_kelamin,
        nik,
        channel: selectedChannel,
        demo_mode: "true",
      });

      router.push(`/daftar-sukses?${params.toString()}`);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border-2 border-teal-200 p-8">
      {/* Demo Mode Badge */}
      {DEMO_MODE && (
        <div className="mb-6 p-3 bg-cream-100 border-2 border-maroon-200 rounded-xl app-card">
          <div className="flex items-center gap-2 justify-center">
            <Zap className="w-5 h-5 text-maroon-600" />
            <p className="text-sm font-black text-maroon-900">
              MODE DEMO - Verifikasi OTP Di-bypass
            </p>
          </div>
          <p className="text-xs text-orange-700 mt-1 text-center">
            Data akan langsung tersimpan tanpa verifikasi OTP
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-stone-900 mb-2">
          {DEMO_MODE ? "Simulasi Pendaftaran" : "Pilih Metode Verifikasi"}
        </h1>
        <p className="text-sm text-stone-600 mb-2">
          {DEMO_MODE
            ? "Pilih channel untuk simulasi (tidak akan kirim OTP real)"
            : "Kode OTP 6 digit akan dikirim ke:"}
        </p>
        <p className="text-xl font-black text-teal-700">{no_hp}</p>
      </div>

      <div className="space-y-4 relative z-10 mb-8">
        <button
          type="button"
          onClick={() => {
            console.log("Memilih WhatsApp");
            setSelectedChannel("whatsapp");
          }}
          className={`app-card w-full p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left relative ${selectedChannel === "whatsapp"
              ? "border-maroon-600 bg-cream-50 shadow-md scale-[1.02]"
              : "border-cream-200 bg-white hover:border-maroon-200 hover:shadow-sm"
            }`}
        >
          {/* Selected Badge */}
          {selectedChannel === "whatsapp" && (
            <div className="absolute -top-3 -right-3 bg-maroon-600 text-white rounded-full p-2 shadow-lg animate-bounce">
              <Check className="w-5 h-5" />
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`p-4 rounded-xl transition-all duration-300 ${selectedChannel === "whatsapp"
                  ? "bg-maroon-600 shadow-md"
                  : "bg-cream-100"
                }`}
            >
              <Smartphone
                className={`w-8 h-8 ${selectedChannel === "whatsapp"
                    ? "text-white"
                    : "text-maroon-700"
                  }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-xl font-black ${selectedChannel === "whatsapp"
                      ? "text-maroon-900"
                      : "text-ink-950"
                    }`}
                >
                  WhatsApp
                </h3>
                <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-maroon-100 text-maroon-800 rounded-full">
                  REKOMENDASI
                </span>
              </div>
              <p className="text-sm text-ink-600 mb-2 font-medium">
                {DEMO_MODE
                  ? "Simulasi kirim via WhatsApp"
                  : "Kirim kode via WhatsApp Business"}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${selectedChannel === "whatsapp"
                      ? "bg-maroon-600"
                      : "bg-cream-300"
                    }`}
                />
                <span className="text-xs text-ink-500 font-bold">
                  {DEMO_MODE
                    ? "Mode Demo - Bypass OTP"
                    : "Pengiriman instan & terpercaya"}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* SMS Option */}
        <button
          type="button"
          onClick={() => {
            console.log("Memilih SMS");
            setSelectedChannel("sms");
          }}
          className={`app-card w-full p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left relative ${selectedChannel === "sms"
              ? "border-maroon-600 bg-cream-50 shadow-md scale-[1.02]"
              : "border-cream-200 bg-white hover:border-maroon-200 hover:shadow-sm"
            }`}
        >
          {/* Selected Badge */}
          {selectedChannel === "sms" && (
            <div className="absolute -top-3 -right-3 bg-maroon-600 text-white rounded-full p-2 shadow-lg animate-bounce">
              <Check className="w-5 h-5" />
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`p-4 rounded-xl transition-all duration-300 ${selectedChannel === "sms"
                  ? "bg-maroon-600 shadow-md"
                  : "bg-cream-100"
                }`}
            >
              <MessageSquare
                className={`w-8 h-8 ${selectedChannel === "sms" ? "text-white" : "text-maroon-700"
                  }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3
                className={`text-xl font-black mb-1 ${selectedChannel === "sms" ? "text-maroon-900" : "text-ink-950"
                  }`}
              >
                SMS
              </h3>
              <p className="text-sm text-ink-600 mb-2 font-medium">
                {DEMO_MODE
                  ? "Simulasi kirim via SMS"
                  : "Kirim otomatis via SMS"}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${selectedChannel === "sms" ? "bg-maroon-600" : "bg-cream-300"
                    }`}
                />
                <span className="text-xs text-ink-500 font-bold">
                  {DEMO_MODE
                    ? "Mode Demo - Bypass OTP"
                    : "Tidak perlu internet/data"}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Info Box - Pilihan Aktif */}
      <div
        className={`relative z-10 mb-6 p-4 rounded-xl border transition-all duration-300 ${selectedChannel === "whatsapp"
            ? "bg-cream-50 border-maroon-200"
            : "bg-cream-50 border-maroon-200"
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${selectedChannel === "whatsapp" ? "bg-maroon-600" : "bg-maroon-600"
              }`}
          >
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink-950">
              Anda memilih:{" "}
              <span
                className={
                  selectedChannel === "whatsapp"
                    ? "text-maroon-700"
                    : "text-maroon-700"
                }
              >
                {selectedChannel === "whatsapp" ? "WhatsApp" : "SMS"}
              </span>
            </p>
            <p className="text-xs text-ink-600 mt-1 font-medium">
              {DEMO_MODE
                ? `Mode Demo - Data langsung masuk database`
                : `Kode OTP akan dikirim ke ${no_hp}`}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 relative z-10">
        <button
          onClick={handleProsesDemo}
          disabled={isLoading}
          className={`w-full py-4 px-6 font-black text-lg md:text-xl rounded-pill transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-95 ${selectedChannel === "whatsapp"
              ? "bg-maroon-900 hover:bg-cream-100 border border-maroon-900 hover:text-maroon-900 text-white"
              : "bg-maroon-900 hover:bg-cream-100 border border-maroon-900 hover:text-maroon-900 text-white"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              {DEMO_MODE ? (
                <Zap className="w-6 h-6" />
              ) : (
                <Send className="w-6 h-6" />
              )}
              <span>
                {DEMO_MODE
                  ? "Proses Pendaftaran (Demo)"
                  : `Kirim Kode via ${selectedChannel === "whatsapp" ? "WhatsApp" : "SMS"}`}
              </span>
            </>
          )}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full py-4 px-6 border-2 border-cream-200 text-ink-600 font-bold rounded-pill app-card hover:bg-cream-50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs font-black">Kembali</span>
        </button>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-cream-50 border border-cream-200 rounded-[1.5rem] relative z-10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-maroon-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink-950 font-bold mb-2">
              {DEMO_MODE ? "Info Mode Demo" : "Tips Memilih Channel"}
            </p>
            {DEMO_MODE ? (
              <ul className="text-xs text-ink-700 space-y-2 font-medium">
                <li>- Verifikasi OTP di-bypass untuk keperluan demo</li>
                <li>- Data akan langsung tersimpan ke database</li>
                <li>- Anda akan mendapat Nomor Pendaftaran otomatis</li>
                <li>- Cocok untuk testing fitur dashboard & admin panel</li>
              </ul>
            ) : (
              <ul className="text-xs text-ink-700 space-y-2 font-medium">
                <li>
                  - <strong>WhatsApp:</strong> Lebih cepat & bisa chat langsung
                </li>
                <li>
                  - <strong>SMS:</strong> Tidak perlu internet/kuota data
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="app-card max-w-lg w-full bg-white rounded-[2rem] shadow-lg border border-cream-200 p-8 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-maroon-600 animate-spin mb-4" />
        <p className="text-ink-600 font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}

export default function PilihVerifikasiPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cream-100/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Suspense fallback={<LoadingFallback />}>
        <PilihVerifikasiContent />
      </Suspense>
    </main>
  );
}
