"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  BookOpen,
  Brain,
  Heart,
  BookOpenCheck,
  Users,
  UserCheck,
  AlertCircle,
  Link as LinkIcon,
  Info,
  Check,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import Swal from "sweetalert2";
import { expandExamTitle } from "@/lib/utils";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface GrupAItem {
  completed: boolean;
  label: string;
}

interface GrupAData {
  akademik: GrupAItem;
  kepribadian: GrupAItem;
  kesiapan: GrupAItem;
}

interface SlotData {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  quota: number;
  booked: number;
  location: string;
  notes: string;
  category: string;
  isFull: boolean;
}

interface BookedData {
  id: string;
  jenis_ujian: string;
  tanggal_ujian: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  keterangan: string;
  online_test_link?: string;
  status_santri?: string;
  status_quran?: string;
  status_ortu?: string;
  category: string;
}

interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

interface UndanganData {
  isSMA?: boolean;
  jenjang?: string;
  grupA: GrupAData;
  grupB: {
    hasSchedules: boolean;
    availableSlots: SlotData[];
    booked: BookedData[];
  };
  progress: ProgressData;
  condition: "jadwal_tersedia" | "jadwal_belum" | "seleksi_selesai";
  locked?: boolean;
  message?: string;
  current_status?: string;
}

interface CategoryConfig {
  key: string;
  step: number;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORY_DEFS: CategoryConfig[] = [
  {
    key: "QURAN",
    step: 1,
    label: "Seleksi Al-Qur'an",
    shortLabel: "Al-Qur'an",
    icon: BookOpenCheck,
    description: "Tilawah, Tahsin & Hafalan Al-Qur'an",
  },
  {
    key: "W_SANTRI",
    step: 2,
    label: "Wawancara Calon Santri",
    shortLabel: "Wawancara Santri",
    icon: Users,
    description: "Kepribadian, Minat & Kesiapan Santri",
  },
  {
    key: "W_ORTU",
    step: 3,
    label: "Wawancara Calon Wali",
    shortLabel: "Wawancara Wali",
    icon: UserCheck,
    description: "Komitmen & Keselarasan Visi Orang Tua / Wali",
  },
  {
    key: "LISAN_ARAB",
    step: 4,
    label: "Tes Lisan Bahasa Arab",
    shortLabel: "Bahasa Arab",
    icon: Brain,
    description: "Kemampuan Dasar Bahasa Arab (Khusus SMA/MA)",
  },
];

// ============================================================================
// ICONS MAP
// ============================================================================

const GRUP_A_ICONS: Record<string, React.ElementType> = {
  akademik: BookOpen,
  kepribadian: Brain,
  kesiapan: Heart,
};

const GRUP_B_ICONS: Record<string, React.ElementType> = {
  QURAN: BookOpenCheck,
  W_SANTRI: Users,
  W_ORTU: UserCheck,
  HAFALAN: BookOpen,
  LISAN_ARAB: Brain,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UndanganSeleksiTab() {
  const [data, setData] = useState<UndanganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isTestingAccount, setIsTestingAccount] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("QURAN");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session.pendaftar_id) {
          const statusRes = await fetch(
            `/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`,
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (
              statusData.nomor_pendaftaran === "ILI2600007" ||
              statusData.nomor_pendaftaran?.startsWith("DEMO") ||
              statusData.nomor_pendaftaran?.startsWith("TST")
            ) {
              setIsTestingAccount(true);
            }
          }
        }
      }

      const response = await fetch("/api/pendaftar/undangan-seleksi");
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching undangan-seleksi:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSMA = Boolean(
    data?.isSMA ||
    data?.progress?.total === 7 ||
    data?.jenjang?.toUpperCase().includes("SMA") ||
    data?.jenjang?.toUpperCase().includes("MA") ||
    data?.jenjang?.toUpperCase().includes("IL") ||
    data?.grupB?.availableSlots?.some((s) => s.category === "LISAN_ARAB") ||
    data?.grupB?.booked?.some((b) => b.category === "LISAN_ARAB")
  );

  const availableCategories = useMemo(() => {
    return isSMA
      ? CATEGORY_DEFS
      : CATEGORY_DEFS.filter((c) => c.key !== "LISAN_ARAB");
  }, [isSMA]);

  // Auto-select first unbooked category when data arrives
  useEffect(() => {
    if (data?.grupB) {
      const bookedSet = new Set(data.grupB.booked.map((b) => b.category));
      const firstUnbooked = availableCategories.find((c) => !bookedSet.has(c.key));
      if (firstUnbooked) {
        setActiveCategory(firstUnbooked.key);
      } else if (availableCategories.length > 0) {
        setActiveCategory(availableCategories[0].key);
      }
    }
  }, [data, availableCategories]);

  const handleCategoryChange = (catKey: string) => {
    setActiveCategory(catKey);
    setSelectedDate("ALL");
  };

  // Active category free slots
  const activeCategoryFreeSlots = useMemo(() => {
    if (!data?.grupB?.availableSlots) return [];
    return data.grupB.availableSlots.filter(
      (slot) => slot.category === activeCategory && !slot.isFull
    );
  }, [data, activeCategory]);

  // Unique dates for active category
  const uniqueDates = useMemo(() => {
    const map = new Map<string, { dateKey: string; label: string; count: number }>();
    activeCategoryFreeSlots.forEach((slot) => {
      const d = new Date(slot.start_time);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const existing = map.get(dateKey);
      if (existing) {
        existing.count += 1;
      } else {
        const dayName = d.toLocaleDateString("id-ID", { weekday: "short" }).replace("Min", "Ahad");
        const dayNum = d.getDate();
        const monthName = d.toLocaleDateString("id-ID", { month: "short" });
        map.set(dateKey, {
          dateKey,
          label: `${dayName}, ${dayNum} ${monthName}`,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [activeCategoryFreeSlots]);

  // Displayed slots
  const displayedSlots = useMemo(() => {
    if (selectedDate === "ALL") return activeCategoryFreeSlots;
    return activeCategoryFreeSlots.filter((slot) => {
      const d = new Date(slot.start_time);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dateKey === selectedDate;
    });
  }, [activeCategoryFreeSlots, selectedDate]);

  const bookedCategoryItem = useMemo(() => {
    if (!data?.grupB?.booked) return null;
    return data.grupB.booked.find((b) => b.category === activeCategory) || null;
  }, [data, activeCategory]);

  const bookedCount = useMemo(() => {
    if (!data?.grupB?.booked) return 0;
    const bookedSet = new Set(data.grupB.booked.map((b) => b.category));
    return availableCategories.filter((c) => bookedSet.has(c.key)).length;
  }, [data, availableCategories]);

  const nextUnbookedCategory = useMemo(() => {
    if (!data?.grupB?.booked) return null;
    const bookedSet = new Set(data.grupB.booked.map((b) => b.category));
    return availableCategories.find((c) => !bookedSet.has(c.key)) || null;
  }, [data, availableCategories]);

  const activeCategoryMeta = useMemo(() => {
    return availableCategories.find((c) => c.key === activeCategory) || availableCategories[0];
  }, [availableCategories, activeCategory]);

  const handleBooking = async (sessionId: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Jadwal",
      text: "Apakah Anda yakin ingin memilih jadwal ini? Jadwal tidak dapat diubah setelah dipilih.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Pilih Jadwal",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setBookingId(sessionId);

      const response = await fetch("/api/pendaftar/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_session_id: sessionId }),
      });

      const resData = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal seleksi Anda telah tersimpan. Notifikasi WhatsApp akan dikirimkan.",
          confirmButtonColor: "#0f766e",
        });
        fetchData();
      } else {
        throw new Error(resData.error || "Gagal memilih jadwal");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString)
      .toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace("Minggu", "Ahad");
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-stone-600 font-medium text-sm">Memuat info seleksi...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-stone-600">
          Gagal memuat data. Silakan refresh halaman.
        </p>
      </div>
    );
  }

  const grupAItems = Object.entries(data.grupA || {}) as [string, GrupAItem][];

  if (data.locked && !isTestingAccount) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-stone-700 to-stone-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2 text-white flex items-center gap-3">
              Seleksi Belum Dibuka
            </h1>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed">
              {data.message ||
                "Tahap seleksi akan dibuka setelah berkas dan administrasi pendaftaran Anda diverifikasi oleh panitia."}
            </p>
            {data.current_status && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/20">
                <span>Status Anda saat ini:</span>
                <span className="text-amber-300 font-black uppercase">
                  {data.current_status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ========== HERO BANNER ========== */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-primary-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-white/10 text-white/90 backdrop-blur-md mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
            Tahun Ajaran 2027/2028
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 text-white">
            Undangan & Jadwal Seleksi
          </h1>
          <p className="text-white/80 max-w-2xl text-sm leading-relaxed font-medium">
            Selamat datang di tahapan seleksi calon santri baru. Silakan selesaikan seluruh rangkaian seleksi mandiri dan tentukan jadwal seleksi terjadwal Anda di bawah ini.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2">
              <span className="text-white/70">Total Progres:</span>
              <span className="text-secondary-400 font-black text-sm">
                {data.progress?.percentage || 0}%
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2">
              <span className="text-white/70">Tahap Selesai:</span>
              <span className="text-white font-black text-sm">
                {data.progress?.completed || 0} dari {data.progress?.total || 6}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== GRUP A: TES MANDIRI / ONLINE ========== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-black text-ink-900 text-lg">
              Seleksi Mandiri (Online)
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Dapat dikerjakan langsung kapan saja sebelum batas waktu seleksi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {grupAItems.map(([key, item]) => {
            const Icon = GRUP_A_ICONS[key] || BookOpen;
            const linkHref =
              key === "akademik"
                ? "/dashboard/pendaftar/ujian-online/akademik"
                : key === "kepribadian"
                ? "/dashboard/pendaftar/ujian-online/kepribadian"
                : "/dashboard/pendaftar/ujian-online/kesiapan";

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  item.completed
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-stone-200 hover:border-primary-300 hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${
                      item.completed ? "bg-emerald-100 text-emerald-700" : "bg-primary-50 text-primary-600"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.completed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Selesai
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Belum Dikerjakan
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-ink-900 text-sm mb-1">
                    {item.label}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4 font-medium">
                    {item.completed
                      ? "Ujian ini telah selesai Anda kerjakan."
                      : "Klik tombol di bawah untuk mulai mengerjakan ujian."}
                  </p>
                </div>

                {!item.completed ? (
                  <Link
                    href={linkHref}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center text-xs transition-all shadow-md shadow-primary-600/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Mulai Kerjakan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center text-xs border border-emerald-200">
                    Nilai Tersimpan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== GRUP B: TES TERJADWAL ========== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-secondary-100 rounded-2xl flex items-center justify-center border border-secondary-200">
            <Calendar className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h2 className="font-black text-ink-900 text-lg">
              Seleksi Terjadwal (Wawancara & Ujian Lisan)
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Pilih waktu tatap muka online (Google Meet) bersama penguji
            </p>
          </div>
        </div>

        {/* RIWAYAT / JADWAL TERKONFIRMASI */}
        {data.grupB.booked.length > 0 && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-black text-emerald-950 text-sm">
                    Jadwal Terkonfirmasi ({data.grupB.booked.length} Sesi Terjadwal)
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    Sesi seleksi yang telah Anda pilih dapat dilihat rinciannya di bawah ini
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.grupB.booked.map((item) => {
                const isSelesai = item.waktu_selesai
                  ? new Date(item.waktu_selesai) <= new Date()
                  : false;
                const Icon = GRUP_B_ICONS[item.category] || Calendar;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl shadow-md p-5 border-2 relative overflow-hidden transition-all ${
                      isSelesai
                        ? "bg-stone-50 border-stone-200"
                        : "bg-white border-emerald-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${
                          isSelesai ? "bg-stone-200 text-stone-600" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-black text-ink-900 text-sm truncate max-w-[180px]">
                          {expandExamTitle(item.jenis_ujian)}
                        </h4>
                      </div>
                      {isSelesai ? (
                        <span className="text-[10px] font-bold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-md">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          Terjadwal
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-stone-600 mb-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatDate(item.waktu_mulai || item.tanggal_ujian)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-ink-900">
                          {formatTime(item.waktu_mulai)} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.lokasi || "Online / Google Meet"}</span>
                      </div>
                    </div>

                    {item.lokasi && (item.lokasi.includes("meet.google") || item.lokasi.includes("zoom") || item.lokasi.startsWith("http")) && (
                      <div className="pt-2 border-t border-stone-100 mt-2">
                        <a
                          href={item.lokasi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          Buka Google Meet Ujian
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== JADWAL PICKER: STEP-BY-STEP CATEGORY TABS ========== */}
        {data.grupB.hasSchedules && (
          <div className="space-y-5">
            {/* Header / Summary Card */}
            <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 backdrop-blur-md mb-2 border border-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
                    Pilih Jadwal Sesuai Kategori
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Pilih Sesi Ujian Anda
                  </h3>
                  <p className="text-xs text-white/80 mt-1 max-w-xl font-medium leading-relaxed">
                    Setiap pendaftar wajib mengambil 1 sesi di setiap tahap seleksi. Klik salah satu kategori di bawah untuk melihat pilihan hari dan jam yang tersedia.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[220px]">
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                    <span>Progres Pemilihan:</span>
                    <span className="text-secondary-400 font-black">
                      {bookedCount} / {availableCategories.length} Selesai
                    </span>
                  </div>
                  <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-secondary-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (bookedCount / availableCategories.length) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableCategories.map((cat) => {
                const isBooked = data.grupB.booked.some((b) => b.category === cat.key);
                const isCurrent = activeCategory === cat.key;
                const slotCount = data.grupB.availableSlots.filter(
                  (s) => s.category === cat.key && !s.isFull,
                ).length;
                const CatIcon = cat.icon;

                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between group ${
                      isCurrent
                        ? "border-primary-500 bg-white shadow-xl shadow-primary-500/10 ring-2 ring-primary-400/40 translate-y-[-2px]"
                        : isBooked
                        ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50/70"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`p-2.5 rounded-xl transition-all ${
                          isCurrent
                            ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                            : isBooked
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-100 text-stone-600 group-hover:bg-primary-50 group-hover:text-primary-600"
                        }`}
                      >
                        <CatIcon className="w-5 h-5" />
                      </div>

                      {isBooked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 stroke-[3]" /> Terjadwal
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {slotCount} Sesi
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-stone-400 tracking-wider uppercase block">
                        Tahap 0{cat.step}
                      </span>
                      <h4 className="font-black text-ink-900 text-sm mt-0.5 line-clamp-1">
                        {cat.label}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-medium">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: ACTIVE CATEGORY SLOTS OR CONFIRMED CARD */}
            {bookedCategoryItem ? (
              /* If this category is already booked */
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 shrink-0">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-block px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px] font-black uppercase tracking-wider mb-1">
                        Sudah Terjadwal
                      </div>
                      <h3 className="font-black text-emerald-950 text-base">
                        {activeCategoryMeta?.label} Telah Dipilih
                      </h3>
                      <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                        Anda telah berhasil mengonfirmasi waktu untuk tahap seleksi ini.
                      </p>
                    </div>
                  </div>

                  {nextUnbookedCategory && (
                    <button
                      onClick={() => handleCategoryChange(nextUnbookedCategory.key)}
                      className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                      <span>Lanjut ke {nextUnbookedCategory.shortLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-200/60 text-xs font-medium">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-emerald-100">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">
                      Hari & Tanggal
                    </span>
                    <span className="font-black text-ink-900 text-sm mt-0.5 block">
                      {formatDate(
                        bookedCategoryItem.waktu_mulai || bookedCategoryItem.tanggal_ujian,
                      )}
                    </span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-emerald-100">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">
                      Waktu Seleksi
                    </span>
                    <span className="font-black text-ink-900 text-sm mt-0.5 block">
                      {formatTime(bookedCategoryItem.waktu_mulai)} WIB
                    </span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-emerald-100">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">
                      Media / Lokasi
                    </span>
                    <span className="font-black text-ink-900 text-sm mt-0.5 block truncate">
                      {bookedCategoryItem.lokasi || "Online / Google Meet"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* If this category is NOT YET booked: show date filter + slot cards */
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                    <h3 className="font-black text-ink-900 text-base">
                      Pilihan Waktu: {activeCategoryMeta?.label}
                    </h3>
                  </div>
                  <div className="text-xs text-stone-500 font-medium">
                    Tersedia <strong className="text-ink-900 font-bold">{displayedSlots.length}</strong> sesi ujian
                  </div>
                </div>

                {/* Date Filter Bar */}
                {uniqueDates.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                      <Filter className="w-3.5 h-3.5 text-primary-600" />
                      Filter Berdasarkan Hari & Tanggal:
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                      <button
                        onClick={() => setSelectedDate("ALL")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedDate === "ALL"
                            ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 font-black"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        Semua Tanggal ({activeCategoryFreeSlots.length})
                      </button>
                      {uniqueDates.map((item) => (
                        <button
                          key={item.dateKey}
                          onClick={() => setSelectedDate(item.dateKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            selectedDate === item.dateKey
                              ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 font-black"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              selectedDate === item.dateKey
                                ? "bg-white/20 text-white"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {item.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid of slot cards */}
                {displayedSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {displayedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="bg-white rounded-2xl border-2 border-stone-200 hover:border-primary-400 p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="px-3 py-1 rounded-xl bg-primary-50 text-primary-900 font-black text-sm tracking-tight border border-primary-200">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)} WIB
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                              Tersedia
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-stone-600 mb-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                              <span>{formatDate(slot.start_time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                              <span className="truncate">{slot.location}</span>
                            </div>
                            <div className="text-[11px] font-bold text-stone-400">
                              Kuota: {slot.booked}/{slot.quota} terisi
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBooking(slot.id)}
                          disabled={slot.isFull || bookingId !== null}
                          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {bookingId === slot.id && (
                            <Loader2 className="animate-spin w-4 h-4" />
                          )}
                          Pilih Sesi Ini
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                    <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h4 className="font-black text-stone-800 text-sm">
                      {activeCategoryFreeSlots.length === 0
                        ? `Jadwal ${activeCategoryMeta?.label} Sedang Disiapkan`
                        : "Tidak Ada Sesi di Tanggal Ini"}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto font-medium">
                      {activeCategoryFreeSlots.length === 0
                        ? "Seluruh kuota sesi untuk tahap ini telah terisi atau sedang disiapkan oleh panitia. Mohon cek kembali secara berkala."
                        : "Silakan pilih tombol \"Semua Tanggal\" atau klik tanggal lain pada filter di atas."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Condition: No schedules configured at all */}
        {!data.grupB.hasSchedules && data.grupB.booked.length === 0 && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="font-black text-secondary-900 text-lg mb-2">
              Jadwal Belum Tersedia
            </h3>
            <p className="text-sm text-secondary-700 max-w-md mx-auto font-medium leading-relaxed">
              Jadwal untuk tahap seleksi wawancara dan tes lisan sedang dalam proses pengaturan oleh panitia. Informasi pembukaan jadwal akan dikirimkan melalui WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
