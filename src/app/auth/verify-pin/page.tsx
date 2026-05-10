"use client";

import { useState, useRef, useEffect } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function VerifyPinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs for input auto-focus
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Handle digit input
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto focus next
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Submit when 4 digits are entered
  useEffect(() => {
    if (pin.every((digit) => digit !== "") && !loading && !success) {
      handleSubmit();
    }
  }, [pin]);

  const handleSubmit = async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan klik ulang link dari WhatsApp.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin: pin.join("") }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PIN salah");

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirect || "/dashboard/penguji/input-nilai");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setPin(["", "", "", ""]); // Reset pin on error
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-stone-500">
            Token login tidak valid atau sudah kedaluwarsa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-stone-100 overflow-hidden text-stone-900">
          <div className="bg-primary p-8 sm:p-10 text-center relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-[-30px] left-[-30px] w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30 rotate-3">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Verifikasi Keamanan
            </h1>
            <p className="text-primary-light font-bold text-xs sm:text-sm mt-2">
              Lapis kedua perlindungan akun Anda
            </p>
          </div>

          <div className="p-7 sm:p-10 text-center">
            <p className="text-stone-900 text-sm sm:text-base mb-8 leading-relaxed font-medium">
              Masukkan{" "}
              <span className="font-black text-primary">
                4 digit terakhir
              </span>{" "}
              nomor WhatsApp Anda untuk melanjutkan.
            </p>

            <div className="flex justify-center gap-3 mb-10">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading || success}
                  className={`w-12 h-16 sm:w-14 sm:h-18 text-center text-2xl sm:text-3xl font-black bg-stone-50 border-2 rounded-2xl transition-all duration-300 outline-none
                                        ${
                                          success
                                            ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                                            : error
                                              ? "border-red-300 bg-red-50 text-red-600 focus:border-red-500"
                                              : "border-stone-100 focus:border-primary focus:bg-white focus:shadow-md"
                                        }`}
                  placeholder="•"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-base mb-6 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
                Akses Diterima! Mengalihkan...
              </div>
            )}

            {!loading && !success && (
              <button
                onClick={handleSubmit}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-teal-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-teal-100 uppercase tracking-widest text-xs"
              >
                Konfirmasi PIN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {loading && (
              <div className="py-4 flex items-center justify-center gap-3 text-stone-400 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                Memverifikasi PIN...
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-stone-50">
              <p className="text-[10px] text-stone-300 font-medium uppercase tracking-widest">
                Pesantren Al Fath
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-stone-500 font-medium">
              Menyiapkan halaman keamanan...
            </p>
          </div>
        </div>
      }
    >
      <VerifyPinContent />
    </Suspense>
  );
}
