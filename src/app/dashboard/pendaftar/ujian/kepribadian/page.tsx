"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { KEPRIBADIAN_QUESTIONS } from "@/lib/questions";
import { CheckCircle, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function KepribadianTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(KEPRIBADIAN_QUESTIONS.length / ITEMS_PER_PAGE);
  const currentQuestions = KEPRIBADIAN_QUESTIONS.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetch("/api/pendaftar/undangan-seleksi")
      .then((res) => res.json())
      .then((data) => {
        const info = data.data;
        if (info?.locked) {
          setIsLocked(true);
          setLockMessage(info.message || "");
        } else if (info?.grupA?.kepribadian?.completed) {
          setAlreadyDone(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [page]);

  const handleNext = () => {
    const unanswered = currentQuestions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Swal.fire(
        "Perhatian",
        `Masih ada ${unanswered.length} soal yang belum dijawab di halaman ini.`,
        "warning",
      );
      return;
    }
    setPage((p) => p + 1);
  };

  const handleSubmit = async () => {
    const unanswered = KEPRIBADIAN_QUESTIONS.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Swal.fire(
        "Perhatian",
        `Masih ada ${unanswered.length} soal yang belum dijawab.`,
        "warning",
      );
      return;
    }

    const result = await Swal.fire({
      title: "Kirim Jawaban?",
      text: "Jawaban yang sudah dikirim tidak dapat diubah.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#004A99",
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
        body: JSON.stringify({ type: "kepribadian", answers }),
      });
      if (!res.ok) throw new Error("Gagal mengirim");

      await Swal.fire({
        icon: "success",
        title: "Alhamdulillah!",
        text: "Seleksi Kepribadian berhasil diselesaikan.",
        confirmButtonColor: "#004A99",
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
            Anda sudah menyelesaikan Seleksi Kepribadian sebelumnya.
          </p>
          <button
            onClick={() =>
              router.push("/dashboard/pendaftar?tab=undangan-seleksi")
            }
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-100"
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
      <div ref={topRef} />
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-linear-to-r from-primary-600 to-primary-800 rounded-xl p-6 mb-6">
        <h1 className="text-xl font-bold text-white">
          Seleksi Kepribadian Calon Santri/Wati
        </h1>
        <p className="text-primary-100 text-sm mt-1">
          20 pernyataan • Skala 1-4 • Durasi 30 menit
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
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

      {/* Progress */}
      <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-stone-600">
            Halaman {page + 1} dari {totalPages}
          </span>
          <span className="font-bold text-primary-600">
            {Object.keys(answers).length}/{KEPRIBADIAN_QUESTIONS.length} dijawab
          </span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500 shadow-sm shadow-primary-200"
            style={{
              width: `${(Object.keys(answers).length / KEPRIBADIAN_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {currentQuestions.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm">
            <p className="font-bold text-stone-400 text-sm mb-3">{q.id}.</p>
            <div className="grid grid-cols-1 gap-3">
              <div
                onClick={() => setAnswers((p) => ({ ...p, [q.id]: "A" }))}
                className={`cursor-pointer p-5 border-2 rounded-2xl transition-all duration-300 ${answers[q.id] === "A" ? "bg-primary-50 border-primary-500 text-primary-950 shadow-md ring-4 ring-primary-500/5" : "border-stone-100 hover:border-primary-200 hover:bg-slate-50"}`}
              >
                <span
                  className={`font-black mr-3 border rounded-lg px-2.5 py-1 text-xs transition-colors ${answers[q.id] === "A" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-stone-400 border-stone-200"}`}
                >
                  A
                </span>
                <span className="font-bold text-sm sm:text-base">
                  {q.optionA}
                </span>
              </div>
              <div
                onClick={() => setAnswers((p) => ({ ...p, [q.id]: "B" }))}
                className={`cursor-pointer p-5 border-2 rounded-2xl transition-all duration-300 ${answers[q.id] === "B" ? "bg-primary-50 border-primary-500 text-primary-950 shadow-md ring-4 ring-primary-500/5" : "border-stone-100 hover:border-primary-200 hover:bg-slate-50"}`}
              >
                <span
                  className={`font-black mr-3 border rounded-lg px-2.5 py-1 text-xs transition-colors ${answers[q.id] === "B" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-stone-400 border-stone-200"}`}
                >
                  B
                </span>
                <span className="font-bold text-sm sm:text-base">
                  {q.optionB}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-4 z-50 flex gap-3">
        {page > 0 && (
          <button
            onClick={() => setPage((p) => p - 1)}
            className="flex-1 py-4 bg-white border-2 border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-xl shadow-lg transition-colors"
          >
            Sebelumnya
          </button>
        )}
        {page < totalPages - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-200 transition-all active:scale-95"
          >
            Lanjutkan
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-stone-300 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
              </>
            ) : (
              "Kirim Jawaban"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
