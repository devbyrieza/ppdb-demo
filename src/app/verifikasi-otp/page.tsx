"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Smartphone,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function VerifikasiOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari query params
  const no_hp = searchParams.get("no_hp") || "";
  const nik = searchParams.get("nik") || "";
  const nama_lengkap = searchParams.get("nama_lengkap") || "";
  const tanggal_lahir = searchParams.get("tanggal_lahir") || "";
  const jenis_kelamin = searchParams.get("jenis_kelamin") || "";
  const jenjang = searchParams.get("jenjang") || "";
  const channel = "whatsapp";

  // OTP State
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulation Code Check
  const sim_code = searchParams.get("sim_code");

  // sim_code is displayed in the banner above for manual entry

  // ... rest of state
  const [countdown, setCountdown] = useState(300); // 5 menit
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otpCode];
    newOTP[index] = value.slice(-1);
    setOtpCode(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    setOtpError("");
  };

  // Handle OTP backspace
  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOTP = pastedData.split("").slice(0, 6);
      setOtpCode(newOTP);

      // Focus last input
      const lastInput = document.getElementById("otp-5");
      lastInput?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const code = otpCode.join("");

    if (code.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      const response = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          no_hp,
          otp_code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verifikasi OTP gagal");
      }

      // Redirect to Success Page
      const successParams = new URLSearchParams({
        nomor_pendaftaran: data.data.nomor_pendaftaran,
        nama_lengkap: data.data.nama_lengkap,
        nik: data.data.nik,
        jenjang: data.data.jenjang
      });

      router.push(`/daftar-sukses?${successParams.toString()}`);
    } catch (error: any) {
      setIsVerifying(false);
      setOtpError(error.message || "Terjadi kesalahan saat verifikasi OTP");
    }
  };



  // Resend OTP
  const handleResendOTP = async () => {
    setOtpCode(["", "", "", "", "", ""]);
    setOtpError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik,
          nama_lengkap,
          tanggal_lahir,
          no_hp,
          jenis_kelamin,
          jenjang,
          otp_channel: channel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim ulang OTP");
      }

      // Reset countdown
      setCountdown(300);
      setCanResend(false);
      setIsVerifying(false);

      // Focus first input
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } catch (error: any) {
      setIsVerifying(false);
      setOtpError(error.message || "Gagal mengirim ulang OTP");
    }
  };

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    const code = otpCode.join("");
    if (code.length === 6 && !isVerifying) {
      handleVerifyOTP();
    }
  }, [otpCode]);

  return (
    <div className="app-card max-w-md w-full bg-white rounded-[2.5rem] shadow-lg border border-cream-200 p-8 relative z-10">
      {/* Decorative Blur Inside Card */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cream-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div
          className={`w-20 h-20 ${channel === "whatsapp" ? "bg-cream-100 border border-cream-200" : "bg-cream-100 border border-cream-200"
            } rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-sm`}
        >
          {/* Icon WhatsApp only */}
          <div className="p-3 bg-maroon-700 rounded-2xl shadow-sm app-card">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-ink-950 mb-2">
          Verifikasi {sim_code ? "Kode" : "via WhatsApp"}
        </h1>
        <p className="text-sm font-medium text-ink-600 mb-1">
          {sim_code
            ? "Masukkan kode verifikasi yang tertera di bawah ini:"
            : "Kami telah mengirim kode 6 digit ke:"}
        </p>
        {!sim_code && <p className="text-lg font-black text-maroon-700">{no_hp}</p>}

        {/* OTP Display Banner (when WhatsApp not available) */}
        {sim_code && (
          <div className="mt-4 p-3 bg-cream-50 border border-cream-200 rounded-xl app-card shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-maroon-800 mb-1">Kode Verifikasi Anda</p>
            <p className="text-sm text-maroon-950 font-medium">
              Masukkan kode berikut: <span className="font-mono text-xl font-black bg-white px-2 py-0.5 rounded-lg border border-cream-100 shadow-sm ml-2">{sim_code}</span>
            </p>
            <p className="text-[10px] text-maroon-600 mt-2 font-bold bg-maroon-50 inline-block px-2 py-1 rounded-md">
              Layanan WhatsApp sedang dalam proses aktivasi
            </p>
          </div>
        )}
      </div>

      {/* OTP Input Fields */}
      <div className="flex gap-2 justify-center mb-6 relative z-10" onPaste={handlePaste}>
        {otpCode.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            onKeyDown={(e) => handleOTPKeyDown(index, e)}
            className={`w-12 h-14 md:w-14 md:h-16 text-center text-3xl font-display font-black border-2 rounded-xl focus:outline-none focus:ring-4 transition-all app-card shadow-sm ${otpError
              ? "border-red-500 bg-red-50 focus:ring-red-100 text-red-700"
              : digit
                ? "border-maroon-600 bg-cream-50 text-maroon-900"
                : "border-cream-200 bg-white focus:ring-cream-50 focus:border-maroon-300 text-ink-900"
              }`}
            disabled={isVerifying}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Error Message */}
      <div className="relative z-10">
        {otpError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl app-card shadow-sm">
            <p className="text-sm text-red-700 font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{otpError}</span>
            </p>
          </div>
        )}

        {/* Loading State */}
        {isVerifying && (
          <div className="mb-4 p-3 bg-cream-50 border border-cream-200 rounded-xl app-card shadow-sm">
            <p className="text-sm text-maroon-700 font-bold flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memverifikasi kode...</span>
            </p>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="text-center mb-6 relative z-10">
        {countdown > 0 ? (
          <p className="text-sm text-ink-600 font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Kode berlaku selama{" "}
            <strong className="text-maroon-700 font-black">{formatTime(countdown)}</strong>
          </p>
        ) : (
          <p className="text-sm text-red-600 flex items-center justify-center gap-2 font-bold bg-red-50 inline-flex px-3 py-1.5 rounded-full border border-red-100">
            <AlertCircle className="w-4 h-4" />
            Kode OTP sudah kadaluarsa
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 relative z-10">
        {/* Verify Button - hanya muncul jika user belum selesai input atau ada error */}
        {(otpCode.join("").length !== 6 || otpError) && (
          <button
            onClick={handleVerifyOTP}
            disabled={isVerifying || otpCode.join("").length !== 6}
            className="w-full py-4 px-6 font-black text-lg md:text-xl rounded-pill transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-md border border-transparent hover:bg-cream-100 hover:text-maroon-900 bg-maroon-900 text-white hover:border-maroon-900 active:scale-95 app-card tracking-wide"
          >
            <CheckCircle2 className="w-6 h-6" />
            Verifikasi Kode
          </button>
        )}

        {/* Resend Button */}
        <button
          onClick={handleResendOTP}
          disabled={!canResend || isVerifying}
          className="w-full py-4 px-6 border-2 font-bold rounded-pill app-card transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border-cream-200 text-maroon-700 bg-white hover:bg-cream-50 active:scale-95"
        >
          <RefreshCw
            className={`w-5 h-5 ${isVerifying ? "animate-spin" : ""}`}
          />
          {canResend
            ? "Kirim Ulang Kode"
            : `Kirim ulang dalam ${formatTime(countdown)}`}
        </button>

        {/* Back Button */}
        <button
          onClick={() => {
            // Kembali ke form pendaftaran jika ingin ubah data
            router.push(`/daftar`);
          }}
          disabled={isVerifying}
          className="w-full py-3 px-6 text-ink-500 text-sm font-black uppercase tracking-widest hover:text-maroon-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ubah Data Pendaftaran
        </button>
      </div>

      {/* Help Info */}
      <div className="mt-6 p-4 bg-cream-50 border border-cream-200 rounded-[1.5rem] relative z-10 app-card shadow-sm">
        <p className="text-xs uppercase tracking-widest text-ink-950 font-black mb-2 pl-1">Tips Verifikasi</p>
        <ul className="text-xs text-ink-600 space-y-1.5 font-medium pl-1">
          <li className="flex gap-2">
            <span className="text-maroon-500 opacity-50">•</span> Pastikan nomor HP Anda aktif dan terdaftar di WhatsApp
          </li>
          <li className="flex gap-2">
            <span className="text-maroon-500 opacity-50">•</span> Kode otomatis terverifikasi setelah 6 digit terisi
          </li>
          <li className="flex gap-2">
            <span className="text-maroon-500 opacity-50">•</span> Jika tidak menerima kode, tunggu countdown habis
          </li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="mt-5 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-ink-500 mb-1.5">Tidak Menerima Kode?</p>
        <a
          href="https://wa.me/622667345601"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-cream-50 text-maroon-700 px-4 py-1.5 rounded-full font-black border border-cream-200 hover:bg-cream-100 transition-colors inline-block"
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
    <div className="app-card max-w-md w-full bg-white rounded-[2.5rem] shadow-lg border border-cream-200 p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-maroon-600 animate-spin mb-4" />
        <p className="text-ink-600 font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}

export default function VerifikasiOTPPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cream-100/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Suspense fallback={<LoadingFallback />}>
        <VerifikasiOTPContent />
      </Suspense>
    </main>
  );
}
