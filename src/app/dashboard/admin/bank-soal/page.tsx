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
  const [genderFilter, setGenderFilter] = useState<"all" | "putra" | "putri">("all");

  const filteredMts = AKADEMIK_MTS.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIl = AKADEMIK_IL.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMa = AKADEMIK_MA.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredKepribadian = KEPRIBADIAN_QUESTIONS.filter(
    (q) =>
      q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.optionB.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <BookOpen className="w-96 h-96" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/30">
            <Sparkles className="w-3.5 h-3.5" /> PORTAL EKSKLUSIF PANITIA & PENGUJI PPDB
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Bank Soal Seleksi & Form Penilaian PPDB
          </h1>
          <p className="text-teal-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            Pusat peninjauan instrumen tes seleksi (Akademik, Kesiapan, Kepribadian) dan rubrik penilaian penguji (Al-Qur'an, Wawancara Santri & Orang Tua) Pesantren Al-Andalus Demo.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-100">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-teal-300" /> Ujian Online: 45-60 Menit
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <BookOpenCheck className="w-4 h-4 text-teal-300" /> Lisan & Wawancara: 15-20 Menit
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Award className="w-4 h-4 text-amber-300" /> TA 2027–2028
            </span>
          </div>
        </div>
      </div>

      {/* ACTION & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pertanyaan, kata kunci, atau materi soal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak / Export PDF
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "mts", label: "Akademik MTs", count: AKADEMIK_MTS.length, icon: BookOpen },
          { id: "il", label: "Akademik IL", count: AKADEMIK_IL.length, icon: BookOpen },
          { id: "ma", label: "Akademik MA/SMA", count: AKADEMIK_MA.length, icon: BookOpen },
          { id: "kesiapan", label: "Kesiapan Santri", count: 14, icon: Heart },
          { id: "kepribadian", label: "Kepribadian Santri", count: KEPRIBADIAN_QUESTIONS.length, icon: Brain },
          { id: "calsan", label: "Wawancara Calsan", count: "7 Rubrik", icon: Users },
          { id: "cawalsan", label: "Wawancara Ortu", count: "12 Soal", icon: UserCheck },
          { id: "quran", label: "Penguji Al-Qur'an & Lisan", count: "3 Aspek", icon: BookOpenCheck },
          { id: "aturan", label: "Aturan & Bobot Nilai", count: "Info", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-200" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Ujian Akademik MTs:</p>
              <p>Durasi Pengerjaan: <strong>45 Menit</strong> | Total Soal: <strong>20 Butir Multiple Choice (A/B/C/D)</strong></p>
              <p className="text-blue-700 text-xs mt-1">Pembagian Mata Pelajaran: PAI (1-5), Bahasa Indonesia (6-10), IPA (11-15), Matematika (16-20).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMts.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg">
                    SOAL #{idx + 1} (ID: {q.id})
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Poin: 5.0</span>
                </div>
                <p className="font-bold text-slate-800 text-sm whitespace-pre-line">{q.text}</p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.value}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2"
                    >
                      <span className="font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                        {opt.value}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AKADEMIK IL */}
      {activeTab === "il" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Ujian Akademik I'dad Lughawi (IL):</p>
              <p>Durasi Pengerjaan: <strong>45 Menit</strong> | Total Soal: <strong>20 Butir Multiple Choice (A/B/C/D/E)</strong></p>
              <p className="text-emerald-700 text-xs mt-1">Soal PAI disesuaikan untuk lulusan SMP/MTs yang masuk kelas persiapan Bahasa Arab.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIl.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                    SOAL #{idx + 1} (IL)
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Poin: 5.0</span>
                </div>
                <p className="font-bold text-slate-800 text-sm whitespace-pre-line">{q.text}</p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.value}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2"
                    >
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {opt.value}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AKADEMIK MA / SMA */}
      {activeTab === "ma" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Informasi Ujian Akademik & Syarat Khusus MA / SMA (Langsung Tanpa IL):</p>
              <p>Durasi Pengerjaan: <strong>60 Menit</strong> | Total Soal: <strong>20 Butir (Nahwu Bahasa Arab, B.Indo, IPA, Matematika)</strong></p>
              <div className="mt-2 p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-950 font-semibold text-xs">
                ⚠️ <strong>KETENTUAN KHUSUS JALUR SMA/MA LANGSUNG (TANPA I'DAD LUGHAWI):</strong><br />
                Pendaftar Jalur SMA/MA Langsung (Tanpa IL) <strong>WAJIB</strong> mengikuti <strong>Tes Lisan Bahasa Arab</strong> serta memiliki <strong>Tes Hafalan Al-Qur'an Minimal 4 Juz Mutqin</strong>. Apabila tidak memenuhi syarat 4 Juz Mutqin & Lisan Arab, pendaftar akan diarahkan ke Jalur I'dad Lughawi (IL).
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMa.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                    SOAL #{idx + 1} (MA / SMA)
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Poin: 5.0</span>
                </div>
                <p className="font-bold text-slate-800 text-sm whitespace-pre-line dir-rtl text-right font-serif" dir="auto">
                  {q.text}
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.value}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2"
                    >
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {opt.value}
                      </span>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: KESIAPAN SANTRI */}
      {activeTab === "kesiapan" && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Heart className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Instrumen Kesiapan Santri (Online):</p>
              <p>Durasi Pengerjaan: <strong>15 Menit</strong> | Skala Jawaban: <strong>1 (Sangat Tidak Kesiap/Patuh) s/d 5 (Sangat Siap/Patuh)</strong></p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {KESIAPAN_QUESTIONS.map((sec, sIdx) => (
              <div key={sIdx} className="border-b border-slate-200 last:border-b-0">
                <div className="bg-slate-100 px-5 py-3 font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-xs font-extrabold">
                    {sIdx + 1}
                  </span>
                  <span>{sec.section}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {sec.items.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">ITEM #{item.id}</span>
                        <p className="text-sm font-semibold text-slate-800">{item.text}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100">
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
          <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Instrumen Kepribadian Santri (Forced Choice):</p>
              <p>Durasi Pengerjaan: <strong>20 Menit</strong> | Metode: <strong>Pilihan Paksa A vs B (Memilih mana yang paling menggambarkan diri)</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKepribadian.map((q) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <span className="text-[11px] font-extrabold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">
                  PASANGAN #{q.id}
                </span>
                <div className="space-y-2 pt-1">
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs font-medium text-purple-900">
                    <strong className="text-purple-700">A:</strong> {q.optionA}
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-800">
                    <strong className="text-slate-600">B:</strong> {q.optionB}
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
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <Users className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Rubrik Penilaian Wawancara Calon Santri (Calsan Putra & Putri):</p>
              <p>Waktu Wawancara: <strong>15-20 Menit/Santri</strong> | Diisi oleh Penguji Calsan di Dashboard Input Nilai</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 md:p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-indigo-950 flex items-center gap-2 border-b pb-2">
                👦 Kriteria Penilaian Calsan Putra (7 Indikator)
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
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-bold text-sm text-slate-800">{item.title}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
                        <strong className="block text-emerald-700">Skor 5 (Sangat Baik):</strong> {item.s5}
                      </div>
                      <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200">
                        <strong className="block text-amber-700">Skor 3 (Cukup):</strong> {item.s3}
                      </div>
                      <div className="bg-rose-50 text-rose-800 p-2.5 rounded-lg border border-rose-200">
                        <strong className="block text-rose-700">Skor 1 (Kurang):</strong> {item.s1}
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
          <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Form Penilaian Wawancara Orang Tua (Cawalsan - 12 Pertanyaan Lengkap):</p>
              <p>Waktu Wawancara: <strong>15-20 Menit/Wali</strong> | Poin Sistem: <strong>A = 100, B = 75, C = 50</strong></p>
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
                <div key={q.id} className="p-4 space-y-2 hover:bg-slate-50">
                  <p className="font-bold text-slate-900 text-sm">{q.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-medium">
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      <strong className="text-emerald-700">Opsi A:</strong> {q.a}
                    </div>
                    <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      <strong className="text-amber-700">Opsi B:</strong> {q.b}
                    </div>
                    <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                      <strong className="text-rose-700">Opsi C:</strong> {q.c}
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
          <div className="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-2xl text-xs md:text-sm flex items-start gap-3">
            <BookOpenCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Form Penilaian Penguji Al-Qur'an, Hafalan & Lisan Bahasa Arab:</p>
              <p>Waktu Tes: <strong>15-20 Menit/Santri</strong> | Nilai diinput langsung dari HP/Tablet penguji di Dashboard Input Nilai</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-extrabold">
                1. TES AL-QUR'AN (UTAMA)
              </span>
              <ul className="text-xs space-y-2 text-slate-700 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Fashohah & Kelancaran Bacaan</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Penguasaan Tajwid</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Ketepatan Makhorijul Huruf</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Capaian Juz & Surat</li>
                <li className="flex items-center gap-2 font-bold text-teal-800 pt-2 border-t">
                  Rekomendasi Status: A (Mumtaz), B (Jayyid), C (Dha'if)
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-bl-lg">
                KHUSUS MA/SMA LANGSUNG (TANPA IL)
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                2. TES TAMBAHAN HAFALAN
              </span>
              <p className="text-[11px] font-bold text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ⭐ Syarat Wajib: Hafalan Al-Qur'an Minimal 4 Juz Mutqin
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hafalan Ziyadah (Baru)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kekuatan Muraja'ah (Lama)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sambung Ayat Al-Qur'an (Min 4 Juz Mutqin)</li>
                <li className="flex items-center gap-2 font-bold text-emerald-800 pt-2 border-t">
                  Skor Nilai: 0 – 100 & Catatan Penguji Hafalan
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-bl-lg">
                KHUSUS MA/SMA LANGSUNG (TANPA IL)
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-extrabold">
                3. TES LISAN BAHASA ARAB
              </span>
              <p className="text-[11px] font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                🗣️ Syarat Wajib: Kemampuan Komunikasi & Nahwu Lisan
              </p>
              <ul className="text-xs space-y-2 text-slate-700 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Muhadatsah (Percakapan Bahasa Arab)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Kafa'ah Lughawiyyah (Grammar/Nahwu)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Fahmul Maqru' (Pemahaman Bacaan Kitab)</li>
                <li className="flex items-center gap-2 font-bold text-amber-800 pt-2 border-t">
                  Skor Nilai: 0 – 100 & Catatan Penguji Bahasa Arab
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ATURAN & BOBOT NILAI */}
      {activeTab === "aturan" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-900">
              ⚙️ Bobot Rumus Nilai Akhir & Penentuan Kelulusan Sistem PPDB
            </h3>
            <p className="text-xs text-slate-500">
              Sistem PPDB mengkalkulasi nilai secara otomatis begitu penguji memasukkan nilai pada portal penguji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-teal-800">📊 Bobot Komponen Penilaian (100%):</h4>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li>• <strong>Tes Akademik (Online):</strong> 30%</li>
                <li>• <strong>Tes Al-Qur'an (Tahfizh & Tajwid):</strong> 30%</li>
                <li>• <strong>Wawancara Calon Santri:</strong> 10%</li>
                <li>• <strong>Wawancara Orang Tua:</strong> 10%</li>
                <li>• <strong>Tes Kepribadian Santri:</strong> 10%</li>
                <li>• <strong>Tes Kesiapan Santri:</strong> 10%</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-sm text-emerald-800">✅ Kriteria Keputusan Sistem:</h4>
              <ul className="text-xs space-y-1.5 text-slate-700">
                <li>• <strong>DITERIMA:</strong> Jika Nilai Akhir &ge; 75 dan Rekomendasi Al-Qur'an Status A/B.</li>
                <li>• <strong>CADANGAN:</strong> Jika Nilai Akhir 65–74 atau kuota gelombang penuh.</li>
                <li>• <strong>DITOLAK:</strong> Jika Nilai Akhir &lt; 65 atau Rekomendasi Al-Qur'an Status C (Perlu Perbaikan Berat).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
