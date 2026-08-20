"use client";

import { useState } from "react";
import {
  BookOpen,
  Brain,
  Heart,
  Users,
  UserCheck,
  BookOpenCheck,
  Search,
  Printer,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Filter,
  Flame,
  Award,
  Check,
  ShieldCheck,
  GraduationCap,
  Pin,
  AlertTriangle,
  Star,
  MessageSquare,
  User,
  Settings,
  BarChart3,
  BookMarked,
  Layers,
  CheckSquare,
} from "lucide-react";
import { AKADEMIK_MTS } from "@/lib/questions/akademik-mts";
import { AKADEMIK_IL, AKADEMIK_MA } from "@/lib/questions/akademik-il-ma";
import { KEPRIBADIAN_QUESTIONS } from "@/lib/questions/kepribadian";
import { KESIAPAN_QUESTIONS } from "@/lib/questions/kesiapan";

export default function BankSoalPanitiaPage() {
  const [activeTab, setActiveTab] = useState<
    "mts" | "il" | "ma" | "kesiapan" | "kepribadian" | "calsan" | "cawalsan" | "quran" | "aturan"
  >("mts");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMts = AKADEMIK_MTS.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.options || []).some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIl = AKADEMIK_IL.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.options || []).some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMa = AKADEMIK_MA.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.options || []).some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredKepribadian = KEPRIBADIAN_QUESTIONS.filter(
    (q) =>
      q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionB.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectBadge = (index: number) => {
    if (index < 5) return { label: "PAI / Studi Islam", color: "bg-[#ddc192]/30 text-[#550000] border-[#ddc192] font-bold" };
    if (index < 10) return { label: "Bahasa Indonesia", color: "bg-blue-100 text-blue-950 border-blue-200 font-bold" };
    if (index < 15) return { label: "IPA Terpadu", color: "bg-purple-100 text-purple-950 border-purple-200 font-bold" };
    return { label: "Matematika", color: "bg-amber-100 text-amber-950 border-amber-200 font-bold" };
  };

  const getMaSubjectBadge = (index: number) => {
    if (index < 10) return { label: "Bahasa Arab & Nahwu", color: "bg-[#ddc192] text-[#550000] border-[#c5a775] font-black" };
    if (index < 15) return { label: "Studi Islam & Umum", color: "bg-indigo-100 text-indigo-950 border-indigo-200 font-bold" };
    return { label: "Logika & Sains", color: "bg-amber-100 text-amber-950 border-amber-200 font-bold" };
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] p-3 sm:p-5 md:p-8 space-y-5 md:space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* HEADER BANNER MAROON & KREM EMAS AL-IMAM (FAILSAFE INLINE STYLES FOR MOBILE) */}
      <div
        className="relative overflow-hidden rounded-3xl bg-[#550000] text-white p-5 sm:p-7 md:p-9 shadow-2xl border border-[#6b0000]"
        style={{ backgroundColor: "#550000", background: "linear-gradient(135deg, #550000 0%, #440000 60%, #300000 100%)" }}
      >
        {/* Pattern Decorator Background */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <BookOpen className="w-[300px] md:w-[420px] h-[300px] md:h-[420px] text-[#ddc192]" />
        </div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#ddc192]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3a0000] rounded-full text-xs font-bold text-[#ddc192] border border-[#ddc192]/40 shadow-inner"
              style={{ backgroundColor: "#3a0000" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ddc192] animate-pulse" /> PORTAL EKSKLUSIF PANITIA & PENGUJI PPDB
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#ddc192] text-[#550000] rounded-full text-xs font-black shadow-md border border-[#ddc192]"
              style={{ backgroundColor: "#ddc192", color: "#550000" }}
            >
              <Award className="w-3.5 h-3.5 text-[#550000]" /> TA 2027/2028
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">
              Bank Soal Seleksi & Form Penilaian PPDB
            </h1>
            <p className="text-[#ddc192] text-xs md:text-sm max-w-3xl leading-relaxed font-medium">
              Pusat peninjauan instrumen tes seleksi (Akademik, Kesiapan, Kepribadian) dan rubrik penilaian resmi penguji (Al-Qur'an, Wawancara Santri & Orang Tua) Pesantren Al-Andalus Al-Andalus Sukabumi.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#ddc192]">
            <div
              className="flex items-center gap-2 bg-[#3b0000] px-3.5 py-2 rounded-xl border border-[#ddc192]/30 shadow-sm text-white"
              style={{ backgroundColor: "#3b0000" }}
            >
              <Clock className="w-4 h-4 text-[#ddc192]" />
              <span className="text-white text-xs">Ujian Online: <strong className="text-[#ddc192]">45–60 Menit</strong></span>
            </div>
            <div
              className="flex items-center gap-2 bg-[#3b0000] px-3.5 py-2 rounded-xl border border-[#ddc192]/30 shadow-sm text-white"
              style={{ backgroundColor: "#3b0000" }}
            >
              <BookOpenCheck className="w-4 h-4 text-[#ddc192]" />
              <span className="text-white text-xs">Lisan & Wawancara: <strong className="text-[#ddc192]">15–20 Menit</strong></span>
            </div>
            <div
              className="flex items-center gap-2 bg-[#3b0000] px-3.5 py-2 rounded-xl border border-[#ddc192]/30 shadow-sm text-white"
              style={{ backgroundColor: "#3b0000" }}
            >
              <ShieldCheck className="w-4 h-4 text-[#ddc192]" />
              <span className="text-white text-xs">Standar Operasional Panitia Resmi</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION & SEARCH BAR */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertanyaan, kata kunci, atau materi soal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#550000] focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#550000] text-white rounded-xl font-black text-xs md:text-sm shadow-md transition-all cursor-pointer border border-[#ddc192]/40 min-h-[44px]"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #700000)" }}
          >
            <Printer className="w-4 h-4 text-[#ddc192]" /> <span className="text-white font-black">Cetak / Export PDF</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION (MAROON & KREM EMAS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "mts", label: "Akademik MTs", count: AKADEMIK_MTS.length, icon: BookOpen },
          { id: "il", label: "Akademik IL", count: AKADEMIK_IL.length, icon: BookOpen },
          { id: "ma", label: "Akademik MA/SMA", count: AKADEMIK_MA.length, icon: GraduationCap },
          { id: "kesiapan", label: "Kesiapan Santri", count: 14, icon: Heart },
          { id: "kepribadian", label: "Kepribadian Santri", count: KEPRIBADIAN_QUESTIONS.length, icon: Brain },
          { id: "calsan", label: "Wawancara Calsan", count: "7 Rubrik", icon: Users },
          { id: "cawalsan", label: "Wawancara Ortu", count: "12 Soal", icon: UserCheck },
          { id: "quran", label: "Penguji Qur'an & Lisan", count: "3 Aspek", icon: BookOpenCheck },
          { id: "aturan", label: "Aturan & Bobot Nilai", count: "Info", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#550000] text-[#ddc192] shadow-lg shadow-[#550000]/25 ring-2 ring-[#ddc192]/60 border border-[#ddc192]/40"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-[#550000]/5 hover:text-[#550000]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#ddc192]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? "bg-[#ddc192] text-[#550000]" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: AKADEMIK MTS */}
      {activeTab === "mts" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#680000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #3a0000)" }}
          >
            <Clock className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Informasi Ujian Akademik MTs:</p>
              <p className="text-xs text-[#ddc192]">
                Durasi Pengerjaan: <strong className="text-white">45 Menit</strong> | Total Soal: <strong className="text-white">20 Butir Multiple Choice (A/B/C/D)</strong>
              </p>
              <p className="text-slate-200 text-xs mt-1 font-medium flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-[#ddc192]" /> Pembagian Mata Pelajaran: PAI (1–5), Bahasa Indonesia (6–10), IPA (11–15), Matematika (16–20).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMts.map((q, idx) => {
              const badge = getSubjectBadge(idx);
              return (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2.5 py-1 bg-[#550000] text-[#ddc192] rounded-lg border border-[#550000]">
                        SOAL #{idx + 1} (ID: {q.id})
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#550000] bg-[#ddc192] px-2.5 py-0.5 rounded-full border border-[#c5a775]">
                      5.0 Poin
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm leading-relaxed whitespace-pre-line">{q.text}</p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.value}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-start gap-2.5 hover:bg-slate-100/80 transition-colors"
                      >
                        <span className="font-black text-[#ddc192] bg-[#550000] px-2.5 py-0.5 rounded-md border border-[#550000]">
                          {opt.value}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AKADEMIK IL */}
      {activeTab === "il" && (
        <div className="space-y-4">
          <div
            className="bg-[#4d0000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#5a0000] flex items-start gap-3.5"
            style={{ backgroundColor: "#4d0000", background: "linear-gradient(to right, #4d0000, #330000)" }}
          >
            <Clock className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Informasi Ujian Akademik I'dad Lughawi (IL):</p>
              <p className="text-xs text-[#ddc192]">
                Durasi Pengerjaan: <strong className="text-white">45 Menit</strong> | Total Soal: <strong className="text-white">20 Butir Multiple Choice (A/B/C/D/E)</strong>
              </p>
              <p className="text-slate-200 text-xs mt-1 font-medium flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-[#ddc192]" /> Soal PAI disesuaikan untuk lulusan SMP/MTs yang masuk kelas persiapan Bahasa Arab intensif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIl.map((q, idx) => {
              const badge = getSubjectBadge(idx);
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2.5 py-1 bg-[#550000] text-[#ddc192] rounded-lg border border-[#550000]">
                        SOAL #{idx + 1} (IL)
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#550000] bg-[#ddc192] px-2.5 py-0.5 rounded-full border border-[#c5a775]">
                      5.0 Poin
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm leading-relaxed whitespace-pre-line">{q.text}</p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.value}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-start gap-2.5 hover:bg-slate-100/80 transition-colors"
                      >
                        <span className="font-black text-[#ddc192] bg-[#550000] px-2.5 py-0.5 rounded-md border border-[#550000]">
                          {opt.value}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AKADEMIK MA / SMA (DENGAN KANAN KE KIRI FONT ARAB) */}
      {activeTab === "ma" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#660000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #300000)" }}
          >
            <Clock className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-black text-base text-[#ddc192]">
                Informasi Ujian Akademik & Syarat Khusus MA / SMA (Langsung Tanpa IL):
              </p>
              <p className="text-xs text-white">
                Durasi Pengerjaan: <strong className="text-[#ddc192]">60 Menit</strong> | Total Soal: <strong className="text-[#ddc192]">20 Butir (Nahwu Bahasa Arab, B.Indo, IPA, Matematika)</strong>
              </p>
              <div
                className="mt-2.5 p-3.5 bg-[#3b0000] border border-[#ddc192]/40 rounded-xl text-[#ddc192] text-xs font-medium leading-relaxed"
                style={{ backgroundColor: "#3b0000" }}
              >
                <span className="inline-flex items-center gap-1.5 bg-[#ddc192] text-[#550000] font-black px-2.5 py-0.5 rounded text-[11px] uppercase mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#550000]" /> SYARAT WAJIB LULUS JALUR SMA/MA LANGSUNG (TANPA IL):
                </span>
                <br />
                Pendaftar Jalur SMA/MA Langsung <strong>WAJIB</strong> mengikuti <strong>Tes Lisan Bahasa Arab</strong> serta memiliki <strong>Tes Hafalan Al-Qur'an Minimal 4 Juz Mutqin</strong>. Apabila tidak memenuhi syarat 4 Juz Mutqin & Lisan Arab, pendaftar akan diarahkan ke Jalur I'dad Lughawi (IL).
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMa.map((q, idx) => {
              const badge = getMaSubjectBadge(idx);
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2.5 py-1 bg-[#550000] text-[#ddc192] rounded-lg border border-[#550000]">
                        SOAL #{idx + 1} (MA/SMA)
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#550000] bg-[#ddc192] px-2.5 py-0.5 rounded-full border border-[#c5a775]">
                      5.0 Poin
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-lg leading-loose whitespace-pre-line text-right font-serif tracking-wide" dir="auto">
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {(q.options || []).map((opt) => (
                      <div
                        key={opt.value}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-start justify-between gap-2.5 hover:bg-slate-100/80 transition-colors"
                      >
                        <span className="font-black text-[#ddc192] bg-[#550000] px-2.5 py-0.5 rounded-md border border-[#550000]">
                          {opt.value}
                        </span>
                        <span className="leading-relaxed font-serif text-base text-right" dir="auto">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: KESIAPAN SANTRI */}
      {activeTab === "kesiapan" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#550000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #380000)" }}
          >
            <Heart className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Informasi Instrumen Kesiapan Santri (Online):</p>
              <p className="text-xs text-[#ddc192]">
                Durasi Pengerjaan: <strong className="text-white">15 Menit</strong> | Skala Jawaban: <strong className="text-white">1 (Sangat Tidak Siap/Patuh) s/d 5 (Sangat Siap/Patuh)</strong>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {KESIAPAN_QUESTIONS.map((sec, sIdx) => (
              <div key={sIdx} className="border-b border-slate-200 last:border-b-0">
                <div className="bg-slate-100 px-5 py-3 font-extrabold text-slate-900 text-sm flex items-center gap-2.5 border-b border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-[#550000] text-[#ddc192] flex items-center justify-center text-xs font-black shadow-sm">
                    {sIdx + 1}
                  </span>
                  <span>{sec.section}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {sec.items.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400">ITEM #{item.id}</span>
                        <p className="text-sm font-bold text-slate-800">{item.text}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold bg-[#550000]/10 text-[#550000] px-3 py-1.5 rounded-xl border border-[#550000]/20">
                        <span>{item.labelMin}</span>
                        <span>➔</span>
                        <span>{item.labelMax}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: KEPRIBADIAN SANTRI */}
      {activeTab === "kepribadian" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#550000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #380000)" }}
          >
            <Brain className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Informasi Instrumen Kepribadian Santri (Forced Choice):</p>
              <p className="text-xs text-[#ddc192]">
                Durasi Pengerjaan: <strong className="text-white">20 Menit</strong> | Metode: <strong className="text-white">Pilihan Paksa A vs B (Memilih mana yang paling menggambarkan diri)</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKepribadian.map((q) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                <span className="text-[11px] font-black px-2.5 py-1 bg-[#550000] text-[#ddc192] rounded-lg border border-[#550000]">
                  PASANGAN #{q.id}
                </span>
                <div className="space-y-2 pt-1">
                  <div className="p-3 bg-[#550000]/5 border border-[#550000]/20 rounded-xl text-xs font-medium text-slate-900 leading-relaxed">
                    <strong className="text-[#550000] font-black">A:</strong> {q.optionA}
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed">
                    <strong className="text-slate-700 font-black">B:</strong> {q.optionB}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WAWANCARA CALSAN */}
      {activeTab === "calsan" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#550000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #380000)" }}
          >
            <Users className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Rubrik Penilaian Wawancara Calon Santri (Calsan Putra & Putri):</p>
              <p className="text-xs text-[#ddc192]">
                Waktu Wawancara: <strong className="text-white">15–20 Menit/Santri</strong> | Diisi oleh Penguji Calsan di Dashboard Input Nilai
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 md:p-7 space-y-6">
            <div className="space-y-4">
              <h3 className="font-black text-lg text-[#550000] flex items-center gap-2 border-b pb-3">
                <User className="w-5 h-5 text-[#550000]" /> Kriteria Penilaian Calsan Putra (7 Indikator)
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "1. Motivasi Masuk Pesantren", s5: "Sangat jelas, kuat, dan sesuai visi pesantren", s3: "Kurang terarah, dipengaruhi orang tua", s1: "Tidak ada motivasi, terpaksa, atau menolak" },
                  { title: "2. Lingkungan di Rumah", s5: "Sangat mendukung (keluarga islami, shalat berjamaah, kontrol gadget baik)", s3: "Biasa saja, kadang ada pengaruh negatif", s1: "Sangat tidak mendukung (bebas tanpa kontrol)" },
                  { title: "3. Game Online / Gadget (Putra)", s5: "Hobi bermanfaat (olahraga, membaca, edukatif)", s3: "Game online rekreasi wajar, masih dikontrol", s1: "Sangat kecanduan game online berat" },
                  { title: "4. Pergaulan / Nongkrong", s5: "Berteman lingkungan positif (masjid, teman shalih)", s3: "Teman biasa saja, netral", s1: "Nongkrong di kelompok bermasalah" },
                  { title: "5. Rokok / Vape / Pod (Putra)", s5: "Menolak tegas dengan alasan agama & ilmu", s3: "Netral / belum ada sikap tegas", s1: "Aktif menggunakan rokok / vape / pod" },
                  { title: "6. Pornografi", s5: "Menolak tegas, paham bahaya dan dosa", s3: "Pernah melihat, merasa salah dan ingin menjauhi", s1: "Kecanduan pornografi berat" },
                  { title: "7. Hobi / Kesukaan", s5: "Positif, produktif, mendukung pengembangan diri", s3: "Hobi kurang bermanfaat tapi tidak berbahaya", s1: "Hobi negatif (rokok, balap liar, dll)" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <p className="font-extrabold text-sm text-slate-900">{item.title}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg border border-emerald-200 leading-relaxed">
                        <strong className="block text-emerald-800 font-black mb-0.5">Skor 5 (Sangat Baik):</strong> {item.s5}
                      </div>
                      <div className="bg-[#ddc192]/20 text-[#550000] p-3 rounded-lg border border-[#ddc192] leading-relaxed">
                        <strong className="block text-[#550000] font-black mb-0.5">Skor 3 (Cukup):</strong> {item.s3}
                      </div>
                      <div className="bg-rose-50 text-rose-950 p-3 rounded-lg border border-rose-200 leading-relaxed">
                        <strong className="block text-rose-800 font-black mb-0.5">Skor 1 (Kurang):</strong> {item.s1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WAWANCARA CAWALSAN */}
      {activeTab === "cawalsan" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#550000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #380000)" }}
          >
            <UserCheck className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Form Penilaian Wawancara Orang Tua (Cawalsan - 12 Pertanyaan Lengkap):</p>
              <p className="text-xs text-[#ddc192]">
                Waktu Wawancara: <strong className="text-white">15–20 Menit/Wali</strong> | Poin Sistem: <strong className="text-white">A = 100, B = 75, C = 50</strong>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-200">
              {[
                { id: "Q1", text: "1. Abu/Ummu ingin ananda menjadi seperti apa di masa depan?", a: "Condong ke orientasi akhirat/agama (100)", b: "Condong ke orientasi dunia/umum (75)", c: "Hanya berorientasi dunia/umum (50)" },
                { id: "Q2", text: "2. Bagaimana pandangan Abu/Ummu tentang sistem pendidikan berbasis pesantren?", a: "Pilihan utama untuk agama, akhlak, dan karakter (100)", b: "Pilihan utama untuk akhlak (75)", c: "Pesantren juga mengajarkan pelajaran umum (50)" },
                { id: "Q3", text: "3. Ananda mau bersekolah di Pesantren atas keinginan siapa?", a: "Orang tua & anak (100)", b: "Anak saja (75)", c: "Orang tua / ikut teman (50)" },
                { id: "Q4", text: "4. Apa yang Abu/Ummu lakukan sehingga ananda mau sekolah di pesantren?", a: "Memberikan pengertian (100)", b: "Memberikan hadiah/iming-iming (75)", c: "Memaksa (50)" },
                { id: "Q5", text: "5. Sejauh apa pendidikan agama/Al-Qur’an ananda sebelumnya?", a: "Intensif (tahfizh, sekolah Islam) (100)", b: "Non intensif (swasta biasa) (75)", c: "Seadanya (sekolah negeri) (50)" },
                { id: "Q6", text: "6. Keberhasilan proses pendidikan anak merupakan tanggung jawab siapa?", a: "Bersama (Pesantren & Ortu) (100)", b: "Orang Tua saja (75)", c: "Sekolah saja (50)" },
                { id: "Q7", text: "7. Sejauh apa kesiapan Abu/Ummu memenuhi kewajiban SPP?", a: "Yakin (100)", b: "Ragu-ragu (75)", c: "Tidak tahu (50)" },
                { id: "Q8", text: "8. Bagaimana pandangan Abu/Ummu tentang pendidikan agama & tahfizh Al-Qur’an?", a: "Sangat penting (100)", b: "Cukup penting (75)", c: "Penting (50)" },
                { id: "Q9", text: "9. Dukungan terhadap program Pesantren?", a: "Mendukung & evaluasi positif (100)", b: "Menyerahkan semua ke sekolah (75)", c: "Tidak tahu (50)" },
                { id: "Q10", text: "10. Seberapa sering Abu/Ummu akan menjenguk ananda?", a: "Berkala (sesuai aturan) (100)", b: "Tidak menjenguk karena jauh (75)", c: "Sesempatnya saja (50)" },
                { id: "Q11", text: "11. Langkah jika ananda diganggu teman (iseng/jail/bully)?", a: "Klarifikasi & beri semangat pada anak (100)", b: "Serahkan ke pesantren (75)", c: "Komplain ke pesantren (50)" },
                { id: "Q12", text: "12. Reaksi jika ananda terkena sanksi kedisiplinan?", a: "Menerima sebagai konsekuensi bimbingan (100)", b: "Menasehati anak (75)", c: "Tidak terima (50)" },
              ].map((q) => (
                <div key={q.id} className="p-4 md:p-5 space-y-2.5 hover:bg-slate-50 transition-colors">
                  <p className="font-bold text-slate-900 text-sm leading-snug">{q.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 leading-relaxed">
                      <strong className="text-emerald-800 font-black">Opsi A:</strong> {q.a}
                    </div>
                    <div className="p-3 bg-[#ddc192]/20 text-[#550000] rounded-xl border border-[#ddc192] leading-relaxed">
                      <strong className="text-[#550000] font-black">Opsi B:</strong> {q.b}
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-950 rounded-xl border border-rose-200 leading-relaxed">
                      <strong className="text-rose-800 font-black">Opsi C:</strong> {q.c}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PENGUJI QURAN & LISAN */}
      {activeTab === "quran" && (
        <div className="space-y-4">
          <div
            className="bg-[#550000] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-[#550000] flex items-start gap-3.5"
            style={{ backgroundColor: "#550000", background: "linear-gradient(to right, #550000, #380000)" }}
          >
            <BookOpenCheck className="w-5 h-5 text-[#ddc192] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm text-white">Form Penilaian Penguji Al-Qur'an, Hafalan & Lisan Bahasa Arab:</p>
              <p className="text-xs text-[#ddc192]">
                Waktu Tes: <strong className="text-white">15–20 Menit/Santri</strong> | Nilai diinput langsung dari HP/Tablet penguji di Dashboard Input Nilai
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="inline-block px-3.5 py-1 bg-[#550000] text-[#ddc192] rounded-full text-xs font-black border border-[#550000]">
                1. TES AL-QUR'AN (UTAMA)
              </span>
              <ul className="text-xs space-y-2.5 text-slate-800 pt-1">
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Fashohah & Kelancaran Bacaan</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Penguasaan Tajwid</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Ketepatan Makhorijul Huruf</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Capaian Juz & Surat</li>
                <li className="flex items-center gap-2 font-bold text-[#550000] pt-3 border-t border-slate-100">
                  Rekomendasi Status: A (Mumtaz), B (Jayyid), C (Dha'if)
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-[#550000] shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#550000] text-[#ddc192] text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm border-b border-l border-[#ddc192]">
                KHUSUS MA/SMA LANGSUNG (TANPA IL)
              </div>
              <span className="inline-block px-3.5 py-1 bg-[#550000] text-[#ddc192] rounded-full text-xs font-black border border-[#550000]">
                2. TES TAMBAHAN HAFALAN
              </span>
              <div className="p-3 bg-[#ddc192]/20 rounded-xl border border-[#ddc192] text-[#550000] text-xs font-bold leading-relaxed flex items-start gap-2">
                <Star className="w-4 h-4 text-[#550000] flex-shrink-0 mt-0.5" />
                <span>Syarat Wajib: Hafalan Al-Qur'an Minimal 4 Juz Mutqin</span>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-800 pt-1">
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Hafalan Ziyadah (Baru)</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Kekuatan Muraja'ah (Lama)</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Sambung Ayat Al-Qur'an (Min 4 Juz Mutqin)</li>
                <li className="flex items-center gap-2 font-bold text-[#550000] pt-3 border-t border-slate-100">
                  Skor Nilai: 0 – 100 & Catatan Penguji Hafalan
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-[#550000] shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#550000] text-[#ddc192] text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm border-b border-l border-[#ddc192]">
                KHUSUS MA/SMA LANGSUNG (TANPA IL)
              </div>
              <span className="inline-block px-3.5 py-1 bg-[#550000] text-[#ddc192] rounded-full text-xs font-black border border-[#550000]">
                3. TES LISAN BAHASA ARAB
              </span>
              <div className="p-3 bg-[#ddc192]/20 rounded-xl border border-[#ddc192] text-[#550000] text-xs font-bold leading-relaxed flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[#550000] flex-shrink-0 mt-0.5" />
                <span>Syarat Wajib: Kemampuan Komunikasi & Nahwu Lisan</span>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-800 pt-1">
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Muhadatsah (Percakapan Bahasa Arab)</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Kafa'ah Lughawiyyah (Grammar/Nahwu)</li>
                <li className="flex items-center gap-2.5 font-medium"><CheckCircle2 className="w-4 h-4 text-[#550000] flex-shrink-0" /> Fahmul Maqru' (Pemahaman Bacaan Kitab)</li>
                <li className="flex items-center gap-2 font-bold text-[#550000] pt-3 border-t border-slate-100">
                  Skor Nilai: 0 – 100 & Catatan Penguji Bahasa Arab
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATURAN & BOBOT NILAI */}
      {activeTab === "aturan" && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h3 className="font-black text-xl text-[#550000] flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#550000]" /> Bobot Rumus Nilai Akhir & Penentuan Kelulusan Sistem PPDB
            </h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Sistem PPDB mengkalkulasi nilai secara otomatis begitu penguji memasukkan nilai pada portal penguji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-black text-base text-[#550000] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#550000]" /> Bobot Komponen Penilaian (100%):
              </h4>
              <ul className="text-xs md:text-sm space-y-2 text-slate-800 font-medium">
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Tes Akademik (Online):</span> <strong className="text-[#550000]">30%</strong></li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Tes Al-Qur'an (Tahfizh & Tajwid):</span> <strong className="text-[#550000]">30%</strong></li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Wawancara Calon Santri:</span> <strong className="text-[#550000]">10%</strong></li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Wawancara Orang Tua:</span> <strong className="text-[#550000]">10%</strong></li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Tes Kepribadian Santri:</span> <strong className="text-[#550000]">10%</strong></li>
                <li className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"><span>• Tes Kesiapan Santri:</span> <strong className="text-[#550000]">10%</strong></li>
              </ul>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-black text-base text-[#550000] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#550000]" /> Kriteria Keputusan Sistem:
              </h4>
              <div className="space-y-2 text-xs md:text-sm font-medium">
                <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 space-y-1">
                  <strong className="block text-emerald-800 font-black">DITERIMA:</strong>
                  <span>Jika Nilai Akhir &ge; 75 dan Rekomendasi Al-Qur'an Status A/B.</span>
                </div>
                <div className="p-3 bg-[#ddc192]/20 text-[#550000] rounded-xl border border-[#ddc192] space-y-1">
                  <strong className="block text-[#550000] font-black">CADANGAN:</strong>
                  <span>Jika Nilai Akhir 65–74 atau kuota gelombang penuh.</span>
                </div>
                <div className="p-3 bg-rose-50 text-rose-950 rounded-xl border border-rose-200 space-y-1">
                  <strong className="block text-rose-800 font-black">DITOLAK:</strong>
                  <span>Jika Nilai Akhir &lt; 65 atau Rekomendasi Al-Qur'an Status C (Perlu Perbaikan Berat).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

