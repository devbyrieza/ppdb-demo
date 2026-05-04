"use client";

import { useState, useEffect } from "react";
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
  grupA: GrupAData;
  grupB: {
    hasSchedules: boolean;
    availableSlots: SlotData[];
    booked: BookedData[];
  };
  progress: ProgressData;
  condition: "jadwal_tersedia" | "jadwal_belum";
  locked?: boolean;
  message?: string;
}

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
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UndanganSeleksiTab() {
  const [data, setData] = useState<UndanganData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isTestingAccount, setIsTestingAccount] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Check session for testing account bypass
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        // Check if registration number matches ILI2600007
        // We might need to fetch the full pendaftar data to get the number if not in session
        // But the layout already has it, so let's assume it's either in session or we fetch status
        if (session.pendaftar_id) {
          const statusRes = await fetch(
            `/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`,
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.nomor_pendaftaran === "ILI2600007") {
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

  const handleBooking = async (sessionId: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Jadwal",
      text: "Apakah Anda yakin ingin memilih jadwal ini? Jadwal tidak dapat diubah setelah dipilih.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0066ff", // brand-blue-600
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
          text: "Jadwal ujian Anda telah tersimpan. Notifikasi WhatsApp akan dikirimkan.",
          confirmButtonColor: "#0066ff",
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
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue-600 mx-auto mb-4" />
          <p className="text-stone-600">Memuat info seleksi...</p>
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
  const grupACompleted = grupAItems.filter(([, v]) => v.completed).length;

  if (data.locked && !isTestingAccount) {
    return (
      <div className="space-y-6">
        <div className="bg-linear-to-r from-stone-600 to-stone-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-2 text-white flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Tahap Seleksi Belum Terbuka
            </h1>
            <p className="text-stone-300 text-sm md:text-base">
              Halaman ini akan terbuka setelah seluruh dokumen Anda diverifikasi
              oleh Admin.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-amber-900 mb-4 uppercase tracking-tight">
            Dokumen Sedang Diverifikasi
          </h2>
          <p className="text-amber-800 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {data.message ||
              "Panitia sedang meninjau kelengkapan dokumen pendaftaran Anda. Mohon cek berkala dashboard atau tunggu notifikasi WhatsApp selanjutnya."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard/pendaftar?tab=upload-berkas"
              className="px-8 py-3 bg-brand-blue-700 text-white font-black rounded-xl hover:bg-brand-blue-800 transition-all shadow-md uppercase tracking-widest text-sm"
            >
              Cek Status Berkas
            </Link>
          </div>
        </div>

        {/* Preview of what's coming (blurred/locked looks) */}
        <div className="opacity-40 pointer-events-none select-none filter blur-[1px]">
          <div className="bg-white rounded-xl border border-stone-100 p-8 text-center">
            <p className="text-stone-400 font-bold uppercase tracking-widest text-sm">
              Pratinjau Tahap Seleksi
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <div className="bg-linear-to-r from-brand-blue-700 to-brand-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-2 text-white">
            Jadwal Seleksi
          </h1>
          <p className="text-brand-yellow-100 text-sm md:text-base">
            Jadwal ujian seleksi calon santri baru — selesaikan semua tahapan di
            bawah ini
          </p>
        </div>

        {/* Print & Background Decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex gap-3 mt-4 relative z-10">
          <a
            href="/dashboard/pendaftar/kartu-ujian"
            target="_blank"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black backdrop-blur-sm text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak Jadwal
          </a>
        </div>
      </div>

      {/* ========== PROGRESS BAR ========== */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink-800 text-sm">Progress Seleksi</h3>
          <span className="text-sm font-black text-brand-blue-600">
            {data.progress.completed}/{data.progress.total} Tahap
          </span>
        </div>
        <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand-blue-500 to-brand-blue-700 rounded-full transition-all duration-700 shadow-lg shadow-brand-blue-500/20"
            style={{ width: `${data.progress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 mt-2">
          {data.progress.percentage}% selesai — lanjutkan untuk menyelesaikan
          seluruh tahapan seleksi
        </p>
      </div>

      {/* ========== GRUP A: TES ONLINE INSTAN ========== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-brand-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg">Seleksi Online</h2>
            <p className="text-sm text-stone-500">
              Langsung bisa dikerjakan kapan saja • {grupACompleted}/
              {grupAItems.length} selesai
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {grupAItems.map(([key, item]) => {
            const Icon = GRUP_A_ICONS[key] || BookOpen;
            return (
              <div
                key={key}
                className={`bg-white rounded-xl border-2 p-5 transition-all ${
                  item.completed
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-stone-100 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.completed ? "bg-emerald-100" : "bg-brand-blue-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        item.completed
                          ? "text-emerald-600"
                          : "text-brand-blue-600"
                      }`}
                    />
                  </div>
                  {item.completed ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">
                      <CheckCircle className="w-3 h-3" /> Selesai
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-brand-blue-100 text-brand-blue-700 text-xs font-black rounded-full">
                      Tersedia
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-stone-900 mb-1 text-sm">
                  {item.label}
                </h3>

                {item.completed ? (
                  <p className="text-xs text-emerald-600 font-medium">
                    Tes telah diselesaikan ✓
                  </p>
                ) : (
                  <Link
                    href={`/dashboard/pendaftar/ujian/${key}`}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 text-xs font-black rounded-lg transition-colors shadow-sm border border-brand-yellow-500"
                  >
                    Mulai Tes
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== GRUP B: TES TERJADWAL ========== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-yellow-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-brand-blue-700" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg">
              Seleksi Terjadwal
            </h2>
            <p className="text-sm text-stone-500">
              Seleksi Al Qur'an, Seleksi Wawancara Santri, Seleksi Wawancara
              Orang Tua/Wali
            </p>
          </div>
        </div>

        {/* Condition: Already booked schedules */}
        {data.grupB.booked.length > 0 && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">
                  Jadwal Terkonfirmasi
                </h3>
                <p className="text-xs text-emerald-700">
                  Berikut sesi ujian yang telah Anda pilih
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.grupB.booked.map((item) => {
                const Icon = GRUP_B_ICONS[item.category] || Calendar;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm p-5 border-2 border-brand-blue-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 bg-brand-blue-50 rounded-bl-xl">
                      <CheckCircle className="w-4 h-4 text-brand-blue-600" />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-brand-blue-600" />
                      <h3 className="text-sm font-black text-ink-900">
                        {expandExamTitle(item.jenis_ujian)}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue-500" />
                        <span className="font-bold text-ink-800">
                          {formatDate(item.tanggal_ujian)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-blue-500" />
                        <span className="font-bold text-ink-800">
                          {formatTime(item.waktu_mulai)} WIB
                        </span>
                      </div>
                      {item.lokasi && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-blue-500" />
                          <span className="font-medium text-ink-700">
                            {item.lokasi}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Online test link */}
                    {item.online_test_link && (
                      <div className="pt-2 border-t border-dashed border-stone-200 mt-3">
                        <a
                          href={item.online_test_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-indigo-600 font-bold hover:underline text-xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          Link Ujian Online
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition 1: No sessions available AND haven't booked all 3 */}
        {!data.grupB.hasSchedules && data.grupB.booked.length < 3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="font-bold text-amber-900 mb-2">
              Jadwal Belum Tersedia
            </h3>
            <p className="text-sm text-amber-700 max-w-md mx-auto">
              Mohon bersabar, jadwal tes lanjutan belum ditentukan oleh tim
              seleksi. Kami akan menginformasikan melalui WhatsApp begitu jadwal
              sudah siap.
            </p>
            <p className="text-xs text-amber-600 mt-3 font-medium">
              Sementara menunggu, Anda bisa mengerjakan Seleksi Online di atas ↑
            </p>
          </div>
        )}

        {/* Condition 2: Sessions available — show picker */}
        {data.grupB.hasSchedules && data.grupB.availableSlots.length > 0 && (
          <div className="space-y-3">
            <div className="bg-brand-blue-50 border-l-4 border-brand-blue-500 p-4 rounded-r-xl">
              <h3 className="font-black text-brand-blue-900 text-sm">
                Alhamdulillah, jadwal seleksi sudah bisa dipilih!
              </h3>
              <p className="text-xs text-brand-blue-700 mt-1 font-medium">
                Silakan pilih sesi ujian untuk jenis ujian yang{" "}
                <strong>belum Anda ambil</strong>.
              </p>
            </div>

            {(() => {
              // Filter out slots for categories already booked
              const bookedCategories = data.grupB.booked.map((j) => j.category);
              const filteredSlots = data.grupB.availableSlots.filter(
                (slot) => !bookedCategories.includes(slot.category),
              );

              if (filteredSlots.length === 0) {
                return (
                  <div className="text-center py-8 bg-white rounded-xl border border-stone-200">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-stone-600 text-sm font-medium">
                      Anda sudah memilih semua jadwal yang tersedia.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSlots.map((slot) => {
                    const Icon = GRUP_B_ICONS[slot.category] || Calendar;
                    return (
                      <div
                        key={slot.id}
                        className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-all ${
                          slot.isFull
                            ? "opacity-75 border-surface-200 bg-surface-50"
                            : "border-surface-100 hover:border-brand-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-brand-blue-600" />
                            <h4
                              className="font-black text-ink-900 text-sm line-clamp-1"
                              title={slot.title}
                            >
                              {slot.title}
                            </h4>
                          </div>
                          {slot.isFull ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold whitespace-nowrap">
                              Penuh
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold whitespace-nowrap">
                              Tersedia
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4 text-xs text-ink-600">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-brand-blue-500" />
                            {formatDate(slot.start_time)}
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <Clock className="w-3.5 h-3.5 text-brand-blue-500" />
                            {formatTime(slot.start_time)} WIB
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-blue-500" />
                            <span className="line-clamp-1 font-medium">
                              {slot.location}
                            </span>
                          </div>
                          <div className="text-xs text-ink-400 font-bold">
                            Kuota: {slot.booked}/{slot.quota} terisi
                          </div>
                        </div>

                        <button
                          onClick={() => handleBooking(slot.id)}
                          disabled={slot.isFull || bookingId !== null}
                          className="w-full py-2.5 bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 font-black rounded-lg disabled:bg-surface-200 disabled:text-ink-400 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center gap-2 text-sm border border-brand-yellow-500"
                        >
                          {bookingId === slot.id && (
                            <Loader2 className="animate-spin w-4 h-4" />
                          )}
                          {slot.isFull ? "Penuh" : "Pilih Jadwal"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* All done state */}
        {data.grupB.hasSchedules &&
          data.grupB.availableSlots.length === 0 &&
          data.grupB.booked.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-stone-200">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">
                Belum ada jadwal seleksi yang tersedia saat ini.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
