"use client";

// src/app/fasilitas/page.tsx
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  User,
  Users,
  MessageCircle,
  Sparkles,
  Check,
  ShieldCheck,
  Award,
  ArrowRight
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BRANDING } from "@/config/branding";

const FACILITIES = [
  {
    title: "Masjid Jami' Pesantren",
    category: "Pusat Ibadah & Tahfidz",
    image: "/images/campus-mosque-interior.webp",
    desc: "Kapasitas ratusan jamaah, nyaman berkarpet tebal, dan menjadi sentra halaqah Al-Qur'an serta shalat berjamaah 5 waktu.",
    badge: "Utama"
  },
  {
    title: "Asrama Santri Kondusif",
    category: "Hunian & Tarbiyah",
    image: "/images/campus-dormitory-room.webp",
    desc: "Kamar berventilasi luas, kasur bertingkat kokoh, lemari pribadi, dan pendampingan musyrif/musyrifah asrama 24 jam.",
    badge: "Kenyamanan Santri"
  },
  {
    title: "Ruang Kelas Multimedia Ber-AC",
    category: "Akademik & Sains",
    image: "/images/campus-library-classroom.webp",
    desc: "Dilengkapi proyektor interaktif, pendingin ruangan (AC), serta suasana belajar santri yang nyaman dan interaktif.",
    badge: "Modern"
  },
  {
    title: "Gedung Akademik & Sains Terpadu",
    category: "Akademik & Keilmuan",
    image: "/images/campus-academic-building.webp",
    desc: "Gedung representatif untuk perkuliahan umum, pendalaman ilmu syar'i, dan laboratorium sains modern.",
    badge: "Representatif"
  },
  {
    title: "Sentra Tahfidz & Kajian Turots",
    category: "Al-Qur'an & Syar'i",
    image: "/images/campus-quran-halaqah.webp",
    desc: "Fasilitas halaqah intensif mutqin, tasmi' hafalan Al-Qur'an, dan kajian kitab-kitab turots bersanad.",
    badge: "Mutqin"
  },
  {
    title: "Sarana Olahraga & Lapangan Terbuka",
    category: "Olahraga & Kebugaran",
    image: "/images/campus-sports-facility.webp",
    desc: "Fasilitas olahraga dan lapangan hijau terbuka untuk melatih ketangkasan fisik, kebugaran jasmani, dan sportivitas santri.",
    badge: "Kebugaran"
  },
  {
    title: "Kantor Layanan SPMB & Ruang Tamu",
    category: "Pelayanan Informasi",
    image: "/images/kantor-spmb-ruang-tamu.png",
    desc: "Ruang tamu representatif dan informatif untuk melayani wali santri yang ingin berkonsultasi langsung tentang SPMB.",
    badge: "Layanan"
  },
  {
    title: "Kantor Dewan Asatidzah & Pengasuhan",
    category: "Manajemen & Kepengasuhan",
    image: "/images/kantor-guru-dan-pengasuhan.png",
    desc: "Pusat koordinasi bidang kepengasuhan putri, pembinaan santriwati, dan supervisi kurikulum diniyah pesantren.",
    badge: "Profesional"
  },
  {
    title: "Fasilitas Sanitasi & Kamar Mandi Bersih",
    category: "Kebersihan & Kesehatan",
    image: "/images/kamar-mandi-bagian-luar.png",
    desc: "Dilengkapi area wudhu, kamar mandi keramik bersih, dan air mengalir lancar untuk menjaga kebersihan santriwati.",
    badge: "Sehat"
  },
  {
    title: "Depot Air Minum Higienis (Gratis)",
    category: "Layanan Gizi Santriwati",
    image: "/images/depot-galon-gratis.webp",
    desc: "Santriwati dapat mengambil air minum isi ulang secara gratis setiap saat dari depot higienis yang tersedia di area pesantren.",
    badge: "Gratis"
  },
];

export default function FasilitasPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "success">("idle");
  const [visitForm, setVisitForm] = useState({
    nama: "",
    wa: "",
    tanggal: "",
    jam: "",
    jumlah: ""
  });

  // Autosave visitForm to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("prima_iibs_fasilitas_visit_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setVisitForm((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.warn("Failed to load visit form draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("prima_iibs_fasilitas_visit_draft", JSON.stringify(visitForm));
      } catch (e) {
        console.warn("Failed to save visit form draft:", e);
      }
    }
  }, [visitForm]);

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Saya ingin mengajukan Jadwal Kunjungan ke ${BRANDING.schoolName}.

*Rincian Rencana Kunjungan:*
• Nama: ${visitForm.nama}
• WhatsApp: ${visitForm.wa}
• Tanggal: ${visitForm.tanggal}
• Waktu: ${visitForm.jam} WIB
• Jumlah Pengunjung: ${visitForm.jumlah} orang

Mohon konfirmasi kesediaan waktu kunjungan tersebut. Terima kasih.`;

    const encodedText = encodeURIComponent(message);
    const waNumber = BRANDING.phone.replace(/[^0-9]/g, ""); 
    
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
    setFormStatus('success');
    if (typeof window !== "undefined") {
      localStorage.removeItem("prima_iibs_fasilitas_visit_draft");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-gradient-to-b from-[#FDFCF9] via-[#F8FAFC] to-white min-h-dvh pt-28 pb-24 lg:pt-36">
      
      {/* ─── 1. HERO OMI EDITORIAL ─── */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

        <Container className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Sarana & Prasarana Modern
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Fasilitas Kampus <br />
            <span className="text-emerald-700">Pesantren Al-Basyir</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Didesain representatif, asri, dan terintegrasi untuk menunjang kenyamanan santri dalam menuntut ilmu, beribadah, dan beraktivitas harian.
          </p>
        </Container>
      </section>

      {/* ─── 2. BENTO FACILITY SHOWCASE (6 OMI CARDS) ─── */}
      <section className="py-6">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 whitespace-nowrap inline-block shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="h-px bg-slate-100 w-full mb-3 whitespace-nowrap inline-block shrink-0" />
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terpelihara & Siap Pakai</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── 3. FORM SURVEY KAMPUS (FILAMENT-STYLE CARD WITH AUTOSAVE) ─── */}
      <section className="py-20">
        <Container className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            
            {/* Header Form */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-850 to-emerald-700 p-5 sm:p-8 md:p-10 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
                  Layanan Survey & Kunjungan
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                  Jadwalkan Kunjungan ke Kampus Pesantren Al-Basyir
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-xl">
                  Bapak/Ibu calon wali santri dipersilakan berkunjung langsung untuk melihat suasana asrama, sarana ibadah, dan berkonsultasi dengan asatidzah.
                </p>
              </div>
            </div>

            {/* Body Form */}
            <form onSubmit={handleVisitSubmit} className="p-5 sm:p-8 md:p-10 space-y-6">
              {formStatus === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pengajuan jadwal kunjungan telah diteruskan ke WhatsApp Panitia SPMB.</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Nama Lengkap Orang Tua / Wali</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={visitForm.nama}
                    onChange={(e) => setVisitForm({ ...visitForm, nama: e.target.value })}
                    placeholder="Contoh: Fulan bin Fulan"
                    className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Nomor WhatsApp Aktif</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={visitForm.wa}
                    onChange={(e) => setVisitForm({ ...visitForm, wa: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Rencana Tanggal Kunjungan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={visitForm.tanggal}
                    onChange={(e) => setVisitForm({ ...visitForm, tanggal: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Waktu Kedatangan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={visitForm.jam}
                    onChange={(e) => setVisitForm({ ...visitForm, jam: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Pilih Jam Kedatangan</option>
                    <option value="09.00">Pagi (09.00 - 11.30 WIB)</option>
                    <option value="13.30">Siang (13.30 - 15.30 WIB)</option>
                    <option value="16.00">Sore (16.00 - 17.00 WIB)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                  <span>Jumlah Rombongan (Orang)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={visitForm.jumlah}
                  onChange={(e) => setVisitForm({ ...visitForm, jumlah: e.target.value })}
                  placeholder="Contoh: 3"
                  className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Jadwal Survey via WhatsApp</span>
                </button>
              </div>
            </form>

          </div>
        </Container>
      </section>

    </main>
  );
}
