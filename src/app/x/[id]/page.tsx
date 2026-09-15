"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, Loader2, UserCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function MagicLinkVerification({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const p = searchParams.get("p");
  const router = useRouter();

  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== 4) {
      Swal.fire("Error", "Masukkan tepat 4 digit angka", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, digits, p })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Akses Diberikan',
          text: 'Mengalihkan ke halaman input nilai...',
          timer: 1500,
          showConfirmButton: false
        });
        router.push(data.url);
      } else {
        Swal.fire("Akses Ditolak", data.error || "4 digit nomor WA salah", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-[2rem] p-8 shadow-clay-lg border border-gold-100">
        <div className="w-20 h-20 bg-primary-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3">
          <UserCheck className="w-10 h-10 text-primary-600 -rotate-3" />
        </div>
        <h1 className="text-2xl font-black text-ink-900 text-center mb-2">Verifikasi Penguji</h1>
        <p className="text-ink-600 text-center text-sm mb-8 leading-relaxed">
          Untuk menjaga keamanan data santri, silakan masukkan <b>4 digit terakhir</b> nomor WhatsApp Anda yang terdaftar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-ink-400 uppercase tracking-widest mb-3 text-center">
              4 Digit Terakhir No. WA
            </label>
            <input
              type="tel"
              maxLength={4}
              pattern="\d{4}"
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center text-4xl font-black tracking-[0.5em] p-6 rounded-3xl bg-surface-100 border-2 border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || digits.length !== 4}
            className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-black uppercase tracking-widest text-sm py-5 rounded-2xl transition-all shadow-premium-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {loading ? "Memverifikasi..." : "Akses Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}
