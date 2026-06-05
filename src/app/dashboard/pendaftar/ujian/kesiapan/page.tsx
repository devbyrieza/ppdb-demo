"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KESIAPAN_QUESTIONS } from "@/lib/questions";
import { CheckCircle, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function KesiapanTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalQuestions = KESIAPAN_QUESTIONS.reduce(
    (acc, s) => acc + s.items.length,
    0,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Check if already completed
    fetch("/api/pendaftar/undangan-seleksi")
      .then((res) => res.json())
      .then((data) => {
        const info = data.data;
        if (info?.locked) {
          setIsLocked(true);
          setLockMessage(info.message || "");
        } else if (info?.grupA?.kesiapan?.completed) {
          setAlreadyDone(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < totalQuestions) {
      Swal.fire(
        "Perhatian",
        "Mohon lengkapi semua jawaban sebelum mengirim.",
        "warning",
      );
      return;
    }

    const result = await Swal.fire({
      title: "Kirim Jawaban?",
      text: "Jawaban yang sudah dikirim tidak dapat diubah.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch("/api/pendaftar/ujian/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "kesiapan", answers }),
      });
      if (!res.ok) throw new Error("Gagal mengirim");

      await Swal.fire({
        icon: "success",
        title: "Alhamdulillah!",
        text: "Seleksi Kesiapan berhasil diselesaikan.",
        confirmButtonColor: "#059669",
      });
      router.push("/dashboard/pendaftar/undangan-seleksi");
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="max-w-lg mx-auto p-5 md:p-8 text-center mt-10">
        <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-10">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Tes Sudah Dikerjakan</h2>
          <p className="text-stone-600 mb-6">
            Anda sudah menyelesaikan Seleksi Kesiapan sebelumnya.
          </p>
          <button
            onClick={() =>
              router.push("/dashboard/pendaftar?tab=undangan-seleksi")
            }
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors"
          >
            Kembali ke Jadwal Seleksi
          </button>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-lg mx-auto p-5 md:p-8 text-center mt-10">
        <div className="bg-white rounded-[2rem] shadow-xl border p-6 md:p-10">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-secondary-600" />
          </div>
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-ink-950">
            Akses Terkunci
          </h2>
          <p className="text-ink-600 mb-8 leading-relaxed font-medium">
            {lockMessage ||
              "Anda belum dapat mengakses halaman tes ini. Silakan selesaikan tahap verifikasi dokumen terlebih dahulu."}
          </p>
          <button
            onClick={() => router.push("/dashboard/pendaftar")}
            className="w-full px-6 py-4 bg-primary-700 hover:bg-primary-800 text-white font-black rounded-xl transition-all shadow-md uppercase tracking-widest text-sm"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 mb-6">
        <h1 className="text-xl font-bold text-white">
          Seleksi Kesiapan Calon Santri/Wati
        </h1>
        <p className="text-primary-100 text-sm mt-1">
          15 pernyataan • Skala 1-5 • Durasi 45 menit
        </p>
      </div>

      {/* Pesan Mudir */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-primary-100 flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h4 className="font-bold text-primary-800 mb-1 text-sm">
              Pesan dari Mudir
            </h4>
            <p className="text-sm text-primary-700 leading-relaxed italic">
              "Bismillah, kerjakan dengan jujur dan penuh optimisme. Hasil
              terbaik adalah buah dari kejujuran dan usaha yang ikhlas."
            </p>
            <p className="text-sm text-primary-600 leading-relaxed mt-1">
              - Ustadz Juju Junaedi, M.Pd.
            </p>
          </div>
        </div>
      </div>

      {KESIAPAN_QUESTIONS.map((section, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden"
        >
          <div className="px-6 py-4 bg-stone-50 border-b font-bold text-stone-800">
            {section.section}
          </div>
          <div className="p-6 space-y-8">
            {section.items.map((q) => (
              <div key={q.id} className="border-b pb-6 last:border-0 last:pb-0">
                <p className="mb-4 font-medium text-stone-800">{q.text}</p>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <label
                      key={val}
                      className={`cursor-pointer border p-3 rounded-lg flex-1 text-center hover:bg-slate-50 transition-all ${answers[q.id] === val ? "bg-emerald-100 border-emerald-500 font-bold text-emerald-700 shadow-sm" : "border-stone-200"}`}
                    >
                      <input
                        type="radio"
                        name={`k-${q.id}`}
                        value={val}
                        className="hidden"
                        onChange={() =>
                          setAnswers((p) => ({ ...p, [q.id]: val }))
                        }
                      />
                      <span className="block text-lg">{val}</span>
                      <span className="text-[10px] text-stone-500 leading-tight block mt-1">
                        {val === 1 ? q.labelMin : val === 5 ? q.labelMax : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 z-50">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Jawaban"
          )}
        </button>
      </div>
    </div>
  );
}
