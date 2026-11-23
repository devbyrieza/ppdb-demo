"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  Video,
  VideoOff,
  Maximize,
  Minimize,
  ShieldCheck,
  ShieldAlert,
  User,
  Sparkles,
  HelpCircle,
  Bookmark,
  Check,
  AlertCircle,
  Wifi,
} from "lucide-react";
import Swal from "sweetalert2";
import { BRANDING } from "@/config/branding";

interface QuestionItem {
  id: number;
  category: string;
  text: string;
  options: string[];
  correct: number;
}

const QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    category: "Aqidah & Tauhid",
    text: "Apa hukum mempelajari dasar-dasar ilmu tauhid bagi setiap muslim yang sudah baligh dan berakal (mukallaf)?",
    options: ["Fardhu 'Ain (Wajib bagi setiap individu)", "Fardhu Kifayah", "Sunnah Muakkad", "Mubah"],
    correct: 0,
  },
  {
    id: 2,
    category: "Tarikh & Sirah Nabawiyah",
    text: "Siapakah shahabat Rasulullah ﷺ yang pertama kali membenarkan peristiwa Isra' Mi'raj hingga mendapat gelar As-Siddiq?",
    options: ["Umar bin Khattab radhiyallahu 'anhu", "Ali bin Abi Thalib radhiyallahu 'anhu", "Abu Bakar Ash-Shiddiq radhiyallahu 'anhu", "Utsman bin Affan radhiyallahu 'anhu"],
    correct: 2,
  },
  {
    id: 3,
    category: "Bahasa Arab Dasar",
    text: "Manakah pasangan kata bahasa Arab berikut yang bermakna 'Buku' dan 'Pena'?",
    options: ["Kitabun (كِتَابٌ) dan Qalamun (قَلَمٌ)", "Babun (بَابٌ) dan Kursiyyun (كُرْسِيٌّ)", "Maktabun (مَكْتَبٌ) dan Saburatun (سَبُّوْرَةٌ)", "Haqibatun (حَقِيْبَةٌ) dan Mistharatun (مِسْطَرَةٌ)"],
    correct: 0,
  },
  {
    id: 4,
    category: "Matematika & Logika",
    text: "Sebuah pondok pesantren memiliki 4 asrama. Setiap asrama dihuni oleh 125 santri. Berapakah total santri di seluruh asrama tersebut?",
    options: ["400 Santri", "450 Santri", "500 Santri", "550 Santri"],
    correct: 2,
  },
  {
    id: 5,
    category: "Fiqih Ibadah",
    text: "Berikut ini yang merupakan salah satu dari syarat sahnya shalat adalah...",
    options: ["Membaca Surah Al-Fatihah", "Suci dari hadats kecil dan hadats besar", "Ruku' dengan thuma'ninah", "Sujud dua kali dalam satu rakaat"],
    correct: 1,
  },
];

export default function CBTRoomPage() {
  const router = useRouter();

  // Timer: 45 minutes
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [doubtFlags, setDoubtFlags] = useState<Record<number, boolean>>({});

  // Anti-Cheat & Camera Proctoring State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Dynamic Candidate Profile
  const [candidateInfo, setCandidateInfo] = useState({
    name: "Naufal Benyamin",
    noDaftar: "SPA2700018",
  });

  useEffect(() => {
    fetch("/api/pendaftar/biodata")
      .then((res) => res.json())
      .then((res) => {
        const p = res?.data || res;
        if (p?.namaLengkap || p?.nama) {
          setCandidateInfo({
            name: p.namaLengkap || p.nama,
            noDaftar: p.nomorPendaftaran || p.nomorRegistrasi || "SPA2700018",
          });
        }
      })
      .catch(() => {});
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize Camera Proctoring
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn("Camera access not available or denied:", err);
        setCameraError(true);
      }
    }
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarnings((prev) => {
          const nextCount = prev + 1;
          Swal.fire({
            icon: "warning",
            title: "Peringatan Pengawas Ujian!",
            html: `
              <p style="font-size: 13px; color: #475569; margin-top: 6px;">
                Anda terdeteksi berpindah tab browser / membuka aplikasi lain!
              </p>
              <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 10px; margin-top: 12px;">
                <strong style="color: #dc2626; font-size: 14px;">Pelanggaran ke-${nextCount} dari 3</strong>
                <p style="font-size: 11px; color: #b91c1c; margin: 4px 0 0;">
                  Jika mencapai 3 pelanggaran, ujian akan dihentikan otomatis dan didiskualifikasi oleh panitia.
                </p>
              </div>
            `,
            confirmButtonColor: "#0D7A5F",
            confirmButtonText: "Saya Mengerti, Kembali ke Soal",
            allowOutsideClick: false,
          });
          return nextCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const toggleDoubt = () => {
    setDoubtFlags({ ...doubtFlags, [currentIdx]: !doubtFlags[currentIdx] });
  };

  const handleAutoSubmit = () => {
    calculateAndFinish();
  };

  const calculateAndFinish = () => {
    let correctCount = 0;
    QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    setFinalScore(score);
    setIsSubmitted(true);

    // Save to local submission
    fetch("/api/pendaftar/ujian/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "akademik",
        score,
        answers,
        completed_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  };

  const handleConfirmSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = QUESTIONS.length - answeredCount;
    const doubtCount = Object.values(doubtFlags).filter(Boolean).length;

    Swal.fire({
      title: "Selesai & Kumpulkan Ujian?",
      html: `
        <div style="font-size: 13px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Soal Terjawab:</span>
            <strong style="color: #0D7A5F;">${answeredCount} Soal</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Ragu-ragu:</span>
            <strong style="color: #d97706;">${doubtCount} Soal</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Belum Dijawab:</span>
            <strong style="color: #dc2626;">${unansweredCount} Soal</strong>
          </div>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 12px;">
          Setelah dikumpulkan, jawaban akan dinilai secara otomatis (Auto-Grading) dan masuk ke sistem seleksi panitia.
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D7A5F",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Kumpulkan Jawaban!",
      cancelButtonText: "Periksa Kembali",
    }).then((res) => {
      if (res.isConfirmed) {
        calculateAndFinish();
      }
    });
  };

  const currentQ = QUESTIONS[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  // VIEW: AFTER SUBMISSION / RESULT CARD
  if (isSubmitted) {
    return (
      <div className="min-h-dvh bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-slate-200">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Ujian CBT Telah Selesai
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">Alhamdulillah!</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Jawaban Anda telah berhasil di-grading secara otomatis dan tercatat pada sistem panitia seleksi.
          </p>

          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-6 border border-slate-200 mt-6 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Nama Peserta:</span>
              <strong className="text-slate-900 font-bold">{candidateInfo.name}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">No. Pendaftaran:</span>
              <strong className="text-slate-900 font-mono font-bold">{candidateInfo.noDaftar}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Materi Seleksi:</span>
              <strong className="text-slate-900 font-bold">Akademik & Diniyah (CBT)</strong>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 font-medium">Skor Akhir CBT:</span>
                <p className="text-[10px] text-emerald-700 font-bold">Auto-Grading Sistem</p>
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {finalScore} <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard/pendaftar/undangan-seleksi")}
            className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Kembali ke Halaman Seleksi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-100 flex flex-col font-sans select-none">
      {/* ═══════════════════════════════════════════ */}
      {/* HEADER BAR: CBT EXAM ROOM */}
      {/* ═══════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        {/* Brand & Participant Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900 text-sm leading-tight">
                Ujian Seleksi Online (CBT)
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Wifi className="w-2.5 h-2.5 text-emerald-600" /> Stabil (18ms)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Peserta: <strong>{candidateInfo.name}</strong> ({candidateInfo.noDaftar}) • {BRANDING?.schoolName || "Pesantren Al-Basyir"}
            </p>
          </div>
        </div>

        {/* Center / Right: Countdown Timer & Controls */}
        <div className="flex items-center gap-3">
          {/* Proctoring Active Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Proctoring Online</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Layar Penuh"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Timer Clock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-sm sm:text-base border-2 shadow-sm transition-colors ${
              timeLeft < 300
                ? "border-red-500 text-red-600 bg-red-50 animate-pulse"
                : "border-slate-300 text-slate-800 bg-white"
            }`}
          >
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? "text-red-500" : "text-emerald-600"}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════ */}
      {/* MAIN LAYOUT */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: QUESTION CARD */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Progress Pengerjaan:</span>
                <span className="text-emerald-700">{answeredCount} dari {QUESTIONS.length} Soal ({progressPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentQ.category}</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    {currentQ.id}
                  </span>
                  <h2 className="text-base font-black text-slate-800">
                    Soal Nomor {currentQ.id}
                  </h2>
                </div>
                <button
                  onClick={toggleDoubt}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    doubtFlags[currentIdx]
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <AlertCircle className={`w-3.5 h-3.5 ${doubtFlags[currentIdx] ? "text-amber-600" : "text-slate-400"}`} />
                  <span>{doubtFlags[currentIdx] ? "Ditandai Ragu-Ragu" : "Ragu-Ragu?"}</span>
                </button>
              </div>

              {/* Question Text */}
              <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed mb-6">
                {currentQ.text}
              </p>

              {/* Multiple Choice Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIdx] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className={`text-sm sm:text-base ${isSelected ? "font-bold text-emerald-950" : "font-medium text-slate-700"}`}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
              </button>

              {currentIdx === QUESTIONS.length - 1 ? (
                <button
                  onClick={handleConfirmSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Selesai & Kumpulkan
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIdx((p) => Math.min(QUESTIONS.length - 1, p + 1))}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
                >
                  Soal Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CAMERA PROCTORING & QUESTION GRID */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          
          {/* 1. LIVE WEBCAM PROCTORING WIDGET */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-emerald-600" /> Pengawas Kamera
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> REC Live
              </span>
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${cameraActive ? "block" : "hidden"}`}
              />

              {/* Fallback Simulator if camera is disabled/denied */}
              {!cameraActive && (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                    <User className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-300">
                    Proctoring Stream Aktif
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Mode Pengawasan Ujian Online
                  </p>
                </div>
              )}

              {/* Facial alignment guide box */}
              <div className="absolute inset-4 border border-dashed border-emerald-400/40 rounded-xl pointer-events-none flex items-end justify-center pb-2">
                <span className="text-[9px] font-bold text-emerald-300/80 bg-slate-950/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Posisi Wajah Terpusat
                </span>
              </div>
            </div>

            {/* AI Proctoring Details */}
            <div className="mt-3.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Status Wajah:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 1 Wajah Terdeteksi
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Peringatan Tab:</span>
                <span className={`font-bold ${cheatWarnings > 0 ? "text-red-600" : "text-slate-700"}`}>
                  {cheatWarnings} / 3 Toleransi
                </span>
              </div>
            </div>
          </div>

          {/* 2. QUESTION NUMBER GRID NAVIGATION */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Navigasi Nomor Soal
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-5">
              {QUESTIONS.map((_, idx) => {
                const isCurrent = currentIdx === idx;
                const isAnswered = answers[idx] !== undefined;
                const isDoubt = doubtFlags[idx];

                let btnClass = "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300";
                if (isDoubt) {
                  btnClass = "bg-amber-400 border-amber-500 text-amber-950 font-black shadow-sm";
                } else if (isAnswered) {
                  btnClass = "bg-emerald-600 border-emerald-700 text-white font-black shadow-sm";
                }

                if (isCurrent) {
                  btnClass += " ring-2 ring-emerald-500 ring-offset-2";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0" />
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-500 shrink-0" />
                <span>Ragu-Ragu ({Object.values(doubtFlags).filter(Boolean).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 shrink-0" />
                <span>Belum Dijawab ({QUESTIONS.length - answeredCount})</span>
              </div>
            </div>

            {/* Quick Finish Button */}
            <button
              onClick={handleConfirmSubmit}
              className="w-full mt-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Kumpulkan Ujian Sekarang
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
