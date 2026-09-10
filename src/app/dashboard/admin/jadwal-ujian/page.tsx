"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  Send,
  XCircle,
  Sparkles,
  CalendarPlus,
  Video,
  UserCheck,
  BookOpen,
  FileCheck,
  User,
  X,
  ExternalLink,
  School,
  Languages,
  GraduationCap,
} from "lucide-react";
import Swal from "sweetalert2";

interface ExamSession {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  quota: number;
  booked_count: number;
  location: string | null;
  notes: string | null;
  _count?: {
    bookings: number;
  };
}

interface Pendaftar {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  status_pendaftaran: string;
  tahun_ajaran_id: string;
  jenjang?: string;
  no_hp?: string;
}

// Helper untuk mendeteksi jenjang tanpa IL (MA, SMA, SMA IT non-IL)
export const isJenjangTanpaIL = (jenjang?: string | null): boolean => {
  if (!jenjang) return false;
  const clean = jenjang.trim().toUpperCase();

  // Jika eksplisit tertulis Non-IL / Tanpa-IL
  if (
    clean.includes("NON-IL") ||
    clean.includes("NON IL") ||
    clean.includes("TANPA IL") ||
    clean.includes("TANPA-IL") ||
    clean.includes("REGULER")
  ) {
    return true;
  }

  // Jika ada kata IL / I'dad / Idad / Idadiyah, berarti DENGAN IL (bukan tanpa IL)
  if (
    clean === "IL" ||
    clean.includes("IL ") ||
    clean.includes(" IL") ||
    clean.includes("(IL)") ||
    clean.includes("I'DAD") ||
    clean.includes("IDAD") ||
    clean.includes("IDADIYAH")
  ) {
    return false;
  }

  // Jika jenjangnya MA / SMA / SMA IT / ALIYAH dan tidak ada indikasi IL
  if (
    clean.includes("MA") ||
    clean.includes("SMA") ||
    clean.includes("ALIYAH") ||
    clean.includes("SLTA")
  ) {
    return true;
  }

  return false;
};

export default function JadwalUjianPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedPendaftarId, setSelectedPendaftarId] = useState<string | null>(null);
  const [candidateFilterTab, setCandidateFilterTab] = useState<"butuh" | "semua">("butuh");

  // SCHEDULING MODAL STATE (KHUSUS 1 CALON PENDAFTAR - TANPA KUOTA)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [formCandidateId, setFormCandidateId] = useState<string>("");
  const [formCandidateSearch, setFormCandidateSearch] = useState<string>("");
  const [formTestType, setFormTestType] = useState<string>("Tes Bacaan Al-Qur'an");
  const [showAllExaminers, setShowAllExaminers] = useState<boolean>(false);
  const [formCustomTestType, setFormCustomTestType] = useState<string>("");
  const [formSessionTitle, setFormSessionTitle] = useState<string>("");
  
  // Penguji & Pewawancara
  const [formPengujiOrtuId, setFormPengujiOrtuId] = useState<string>("");
  const [formPengujiSantriId, setFormPengujiSantriId] = useState<string>("");
  const [formPengujiQuranId, setFormPengujiQuranId] = useState<string>("");
  const [formPengujiArabId, setFormPengujiArabId] = useState<string>("");
  const [formPengujiHafalanId, setFormPengujiHafalanId] = useState<string>("");

  const [formStartTime, setFormStartTime] = useState<string>("");
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formEndTime, setFormEndTime] = useState<string>("");

  // HANYA DUA PILIHAN: ONLINE (GOOGLE MEET) ATAU OFFLINE (PESANTREN)
  const [formLocationType, setFormLocationType] = useState<"online" | "offline">("online");
  const [formOnlineUrl, setFormOnlineUrl] = useState<string>("");
  const [formOfflinePlace, setFormOfflinePlace] = useState<string>(
    "Kampus Pesantren (Ruang Penguji Seleksi)"
  );

  const [formNotes, setFormNotes] = useState<string>("");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [resetFlags, setResetFlags] = useState(false);
  const [availStats, setAvailStats] = useState({
    eligibleCount: 0,
    totalAvailableSlots: 0,
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{
    active: boolean;
    curr: number;
    total: number;
    logs: string[];
  }>({
    active: false,
    curr: 0,
    total: 0,
    logs: [],
  });

  // Body scroll lock for modals
  useEffect(() => {
    if (scheduleModalOpen || showBroadcastModal || sendingProgress.active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [scheduleModalOpen, showBroadcastModal, sendingProgress.active]);

  // Auto calculate end time when start time or duration changes
  useEffect(() => {
    if (formStartTime) {
      const s = new Date(formStartTime);
      if (!isNaN(s.getTime())) {
        const e = new Date(s.getTime() + formDuration * 60000);
        const year = e.getFullYear();
        const month = String(e.getMonth() + 1).padStart(2, "0");
        const day = String(e.getDate()).padStart(2, "0");
        const hours = String(e.getHours()).padStart(2, "0");
        const mins = String(e.getMinutes()).padStart(2, "0");
        setFormEndTime(`${year}-${month}-${day}T${hours}:${mins}`);
      }
    }
  }, [formStartTime, formDuration]);

  // Deteksi otomatis Google Meet dari penguji yang dipilih
  const detectedPengujiSantri = useMemo(() => {
    return examiners.find((u) => u.id === formPengujiSantriId) || null;
  }, [examiners, formPengujiSantriId]);

  const detectedPengujiOrtu = useMemo(() => {
    return examiners.find((u) => u.id === formPengujiOrtuId) || null;
  }, [examiners, formPengujiOrtuId]);

  const detectedPengujiQuran = useMemo(() => {
    return examiners.find((u) => u.id === formPengujiQuranId) || null;
  }, [examiners, formPengujiQuranId]);

  const detectedPengujiArab = useMemo(() => {
    return examiners.find((u) => u.id === formPengujiArabId) || null;
  }, [examiners, formPengujiArabId]);

  const detectedPengujiHafalan = useMemo(() => {
    return examiners.find((u) => u.id === formPengujiHafalanId) || null;
  }, [examiners, formPengujiHafalanId]);

  const detectedAnyMeet = useMemo(() => {
    return (
      detectedPengujiSantri?.google_meet_link ||
      detectedPengujiOrtu?.google_meet_link ||
      detectedPengujiQuran?.google_meet_link ||
      detectedPengujiArab?.google_meet_link ||
      detectedPengujiHafalan?.google_meet_link ||
      null
    );
  }, [
    detectedPengujiSantri,
    detectedPengujiOrtu,
    detectedPengujiQuran,
    detectedPengujiArab,
    detectedPengujiHafalan,
  ]);

  // Sinkronkan link Google Meet saat penguji terpilih berubah jika mode online
  useEffect(() => {
    if (formLocationType === "online" && detectedAnyMeet) {
      setFormOnlineUrl(detectedAnyMeet);
    }
  }, [detectedAnyMeet, formLocationType]);

  useEffect(() => {
    fetchData();
    fetchAvailStats();
  }, []);

  const fetchAvailStats = async () => {
    try {
      const res = await fetch("/api/admin/notifications/broadcast-availability");
      if (res.ok) {
        const data = await res.json();
        setAvailStats(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, pendaftarRes, usersRes] = await Promise.all([
        fetch("/api/admin/exam-sessions"),
        fetch("/api/admin/pendaftar/list?limit=500&tahun_ajaran=all"),
        fetch("/api/admin/users"),
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.data || []);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setExaminers(uData.data || []);
      }
      if (pendaftarRes.ok) {
        const data = await pendaftarRes.json();
        setPendaftar(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Objek santri terpilih di modal
  const selectedCandidateObj = useMemo(() => {
    return pendaftar.find((p) => p.id === formCandidateId);
  }, [pendaftar, formCandidateId]);

  // Apakah jenjang santri terpilih tanpa IL?
  const isCandidateTanpaIL = useMemo(() => {
    return selectedCandidateObj ? isJenjangTanpaIL(selectedCandidateObj.jenjang) : false;
  }, [selectedCandidateObj]);

  // Sesuaikan pilihan jenis tes default secara otomatis saat calon santri berubah
  useEffect(() => {
    if (selectedCandidateObj) {
      const isNonIL = isJenjangTanpaIL(selectedCandidateObj.jenjang);
      const validOptions = isNonIL
        ? [
            "Tes Bacaan Al-Qur'an",
            "Wawancara Calon Santri",
            "Wawancara Calon Orangtua/Wali",
            "Tes Hafalan Al-Qur'an",
            "Tes Lisan Bahasa Arab",
          ]
        : [
            "Tes Bacaan Al-Qur'an",
            "Wawancara Calon Santri",
            "Wawancara Calon Orangtua/Wali",
          ];

      if (!validOptions.includes(formTestType)) {
        setFormTestType("Tes Bacaan Al-Qur'an");
      }
    }
  }, [formCandidateId, selectedCandidateObj]);

  const openScheduleModal = (candidate?: Pendaftar) => {
    if (candidate) {
      setFormCandidateId(candidate.id);
      setSelectedPendaftarId(candidate.id);
      setFormTestType("Tes Bacaan Al-Qur'an");
    } else if (selectedPendaftarId) {
      setFormCandidateId(selectedPendaftarId);
      setFormTestType("Tes Bacaan Al-Qur'an");
    } else {
      setFormTestType("Tes Bacaan Al-Qur'an");
    }
    setScheduleModalOpen(true);
  };

  const resetScheduleForm = () => {
    setFormCandidateId("");
    setFormCandidateSearch("");
    setFormTestType("Tes Lengkap (Bacaan Al-Qur'an, Wawancara Santri & Ortu)");
    setFormCustomTestType("");
    setFormSessionTitle("");
    setFormPengujiOrtuId("");
    setFormPengujiSantriId("");
    setFormPengujiQuranId("");
    setFormPengujiArabId("");
    setFormPengujiHafalanId("");
    setFormStartTime("");
    setFormDuration(60);
    setFormEndTime("");
    setFormLocationType("online");
    setFormOnlineUrl("");
    setFormOfflinePlace("Kampus Pesantren (Ruang Penguji Seleksi)");
    setFormNotes("");
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartTime) {
      Swal.fire("Peringatan", "Waktu mulai pelaksanaan ujian wajib diisi", "warning");
      return;
    }
    if (!formCandidateId) {
      Swal.fire("Peringatan", "Pilih calon santri / pendaftar terlebih dahulu", "warning");
      return;
    }

    const candidate = pendaftar.find((p) => p.id === formCandidateId);
    if (!candidate) {
      Swal.fire("Peringatan", "Data calon santri tidak ditemukan", "warning");
      return;
    }

    try {
      setSubmittingSchedule(true);
      const start = new Date(formStartTime);
      const end = formEndTime
        ? new Date(formEndTime)
        : new Date(start.getTime() + formDuration * 60000);

      const actualTestType =
        formTestType === "Lainnya"
          ? formCustomTestType.trim() || "Tes Seleksi"
          : formTestType;

      let finalLocation = "";
      if (formLocationType === "online") {
        let url = (formOnlineUrl || detectedAnyMeet || "Online (Google Meet)").trim();
        if (url.startsWith("meet.google.com")) {
          url = "https://" + url;
        }
        finalLocation = url;
      } else {
        finalLocation = (formOfflinePlace || "Kampus Pesantren (Ruang Penguji Seleksi)").trim();
      }

      const sessionTitle =
        formSessionTitle.trim() || `${actualTestType} - ${candidate.nama_lengkap}`;

      // 1. Buat Sesi Ujian khusus untuk 1 pendaftar ini (quota = 1)
      const sessionRes = await fetch("/api/admin/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          quota: 1, // Khusus 1 pendaftar saja
          location: finalLocation,
          notes: formNotes
            ? `${formNotes} | Materi: ${actualTestType}`
            : `Materi: ${actualTestType} (${isCandidateTanpaIL ? "Jenjang Tanpa IL" : "Jenjang Reguler/IL"})`,
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        throw new Error(err.error || "Gagal membuat sesi ujian");
      }

      const sessionJson = await sessionRes.json();
      const newSessionId = sessionJson.data.id;

      // 2. Tetapkan pendaftar ke sesi ini & kaitkan seluruh penguji
      const assignRes = await fetch("/api/admin/jadwal-ujian/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: formCandidateId,
          exam_session_id: newSessionId,
          tahun_ajaran_id: candidate.tahun_ajaran_id,
          materi_tes: actualTestType,
          penguji_ortu_id: formPengujiOrtuId || undefined,
          penguji_santri_id:
            formTestType === "Wawancara Calon Santri"
              ? formPengujiSantriId || undefined
              : formPengujiSantriId || undefined,
          penguji_quran_id:
            formTestType === "Tes Bacaan Al-Qur'an"
              ? formPengujiQuranId || formPengujiSantriId || undefined
              : formPengujiQuranId || undefined,
          penguji_arab_id:
            formTestType === "Tes Lisan Bahasa Arab"
              ? formPengujiArabId || formPengujiSantriId || undefined
              : formPengujiArabId || undefined,
          penguji_hafalan_id:
            formTestType === "Tes Hafalan Al-Qur'an"
              ? formPengujiHafalanId || formPengujiSantriId || undefined
              : formPengujiHafalanId || undefined,
          metode_ujian: formLocationType,
        }),
      });

      if (!assignRes.ok) {
        const aErr = await assignRes.json();
        throw new Error(aErr.error || "Gagal menetapkan jadwal pendaftar");
      }

      Swal.fire({
        icon: "success",
        title: "Jadwal Berhasil Dibuat!",
        text: `Tes "${actualTestType}" untuk ${candidate.nama_lengkap} (${
          formLocationType === "online" ? "Online via Google Meet" : "Offline Tatap Muka di Pesantren"
        }) pada ${start.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })} jam ${start.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })} WIB telah berhasil dijadwalkan & notifikasi WhatsApp dikirim.`,
        confirmButtonColor: "#800000",
      });

      setScheduleModalOpen(false);
      resetScheduleForm();
      fetchData();
      fetchAvailStats();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan jadwal", "error");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleAssign = async (sessionId: string) => {
    if (!selectedPendaftarId) {
      Swal.fire(
        "Pilih Calon Santri",
        "Silakan klik calon santri di kolom kanan terlebih dahulu",
        "info"
      );
      return;
    }

    const candidate = pendaftar.find((p) => p.id === selectedPendaftarId);
    if (!candidate) return;

    try {
      setAssigning(true);
      const res = await fetch("/api/admin/jadwal-ujian/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: candidate.id,
          exam_session_id: sessionId,
          tahun_ajaran_id: candidate.tahun_ajaran_id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menetapkan jadwal");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Santri ${candidate.nama_lengkap} berhasil dijadwalkan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setSelectedPendaftarId(null);
      fetchData();
      fetchAvailStats();
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleStartBroadcast = async () => {
    setShowBroadcastModal(false);
    setSendingProgress({
      active: true,
      curr: 0,
      total: availStats.eligibleCount || 1,
      logs: ["Memulai pengiriman notifikasi WhatsApp..."],
    });

    try {
      const res = await fetch("/api/admin/notifications/broadcast-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_notified_flags: resetFlags,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSendingProgress((prev) => ({
          ...prev,
          curr: prev.total,
          logs: [data.message || "Pengiriman selesai!", ...prev.logs],
        }));

        setTimeout(() => {
          setSendingProgress((prev) => ({ ...prev, active: false }));
          Swal.fire(
            "Selesai",
            "Seluruh notifikasi ketersediaan jadwal telah terkirim.",
            "success"
          );
          fetchAvailStats();
        }, 1200);
      } else {
        throw new Error(data.error || "Terjadi kesalahan pengiriman");
      }
    } catch (e: any) {
      setSendingProgress((prev) => ({ ...prev, active: false }));
      Swal.fire("Error", e.message, "error");
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const optionsDate: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${s.toLocaleDateString("id-ID", optionsDate)} • ${s.toLocaleTimeString(
      "id-ID",
      optionsTime
    )} - ${e.toLocaleTimeString("id-ID", optionsTime)} WIB`;
  };

  // Santri yang belum memiliki jadwal
  const unscheduledCandidates = useMemo(() => {
    return pendaftar.filter(
      (p) =>
        p.status_pendaftaran !== "scheduled" &&
        p.status_pendaftaran !== "accepted" &&
        p.status_pendaftaran !== "enrolled"
    );
  }, [pendaftar]);

  // Filter santri di kolom kanan
  const filteredPendaftar = useMemo(() => {
    const sourceList =
      candidateFilterTab === "butuh" && unscheduledCandidates.length > 0
        ? unscheduledCandidates
        : pendaftar;
    return sourceList.filter((p) => {
      const term = search.toLowerCase();
      return (
        p.nama_lengkap.toLowerCase().includes(term) ||
        p.nomor_pendaftaran.toLowerCase().includes(term) ||
        (p.jenjang && p.jenjang.toLowerCase().includes(term))
      );
    });
  }, [pendaftar, unscheduledCandidates, candidateFilterTab, search]);

  // Filter dropdown santri di modal (selalu menampilkan seluruh calon santri)
  const modalCandidateList = useMemo(() => {
    if (!formCandidateSearch.trim()) return pendaftar;
    const term = formCandidateSearch.toLowerCase();
    return pendaftar.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(term) ||
        p.nomor_pendaftaran.toLowerCase().includes(term) ||
        (p.jenjang && p.jenjang.toLowerCase().includes(term))
    );
  }, [pendaftar, formCandidateSearch]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 overflow-hidden relative">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-700 border border-primary-100">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Plotting &amp; Jadwal <span className="text-primary-600">Seleksi</span>
              </h1>
              <p className="text-stone-500 font-medium text-sm">
                Atur jadwal wawancara calon santri &amp; orang tua, tes Al-Qur&apos;an, bahasa Arab &amp; hafalan
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-200 transition-all whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              Pulse Notifikasi
            </button>
            <button
              onClick={() => openScheduleModal()}
              className="flex items-center gap-2.5 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <CalendarPlus className="w-5 h-5" />
              Jadwalkan Seleksi Santri
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative flex items-center gap-5">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-200">
                Pendaftar Butuh Jadwal
              </p>
              <h3 className="text-3xl font-black text-white leading-none mt-1">
                {unscheduledCandidates.length}{" "}
                <span className="text-sm font-bold text-primary-200">Orang</span>
              </h3>
              <p className="text-xs mt-1.5 text-primary-100/70 font-medium">
                {pendaftar.length} total calon santri terdaftar di sistem
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-700 border border-emerald-100">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Total Sesi Terjadwal
            </p>
            <h3 className="text-3xl font-black text-stone-900 leading-none mt-1">
              {sessions.length} <span className="text-sm font-bold text-stone-400">Sesi</span>
            </h3>
            <p className="text-xs mt-1.5 text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Total slot: {availStats.totalAvailableSlots} slot
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sessions List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-stone-900 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Daftar Sesi &amp; Jadwal Seleksi
            </h2>
            <span className="text-xs font-bold text-stone-400">
              {sessions.length} Jadwal Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                <p className="text-stone-400 text-sm mt-2 font-medium">Memuat jadwal...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-stone-200">
                <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-bold text-stone-600">Belum ada jadwal seleksi yang dibuat.</p>
                <p className="text-xs text-stone-400 mt-1 mb-4">
                  Klik tombol di bawah untuk menjadwalkan calon santri
                </p>
                <button
                  onClick={() => openScheduleModal()}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm"
                >
                  <CalendarPlus className="w-4 h-4" /> Jadwalkan Calon Santri
                </button>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className={`bg-white rounded-2xl shadow-sm border border-stone-100 hover:border-primary-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                    selectedPendaftarId ? "ring-2 ring-primary-100" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0 border border-primary-100">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-base leading-snug">
                        {s.title || "Jadwal Seleksi Santri"}
                      </h3>
                      <p className="text-xs font-bold text-stone-600 mt-1">
                        {formatTimeRange(s.start_time, s.end_time)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
                          {s.location?.includes("http") ||
                          s.location?.toLowerCase().includes("meet") ? (
                            <Video className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span className="truncate max-w-[280px]">
                            {s.location || "Online (Google Meet)"}
                          </span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-1.5 text-xs font-black text-primary-600">
                          <UserCheck className="w-3.5 h-3.5" />
                          {s.quota === 1
                            ? s.booked_count >= 1
                              ? "Sudah Diplot (1 Santri)"
                              : "Tersedia (Khusus 1 Santri)"
                            : `${s.booked_count} / ${s.quota} Santri`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {selectedPendaftarId && (
                      <button
                        onClick={() => handleAssign(s.id)}
                        disabled={assigning || s.booked_count >= s.quota}
                        className="w-full md:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                        Plotkan Santri Terpilih
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Candidates List */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden sticky top-6">
            <div className="p-4 bg-stone-50 border-b border-stone-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-stone-900 text-sm">Daftar Calon Santri</h3>
                  <p className="text-[11px] font-bold text-stone-400">
                    {filteredPendaftar.length} Santri Ditampilkan
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-primary-100 text-primary-800 rounded-lg text-xs font-black">
                  Total: {pendaftar.length}
                </span>
              </div>

              {/* Filter Tabs: Butuh Jadwal vs Semua */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCandidateFilterTab("butuh")}
                  className={`py-1.5 text-xs rounded-lg font-bold transition-all ${
                    candidateFilterTab === "butuh"
                      ? "bg-white text-primary-700 shadow-xs font-black"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Butuh Jadwal ({unscheduledCandidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateFilterTab("semua")}
                  className={`py-1.5 text-xs rounded-lg font-bold transition-all ${
                    candidateFilterTab === "semua"
                      ? "bg-white text-primary-700 shadow-xs font-black"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Semua Santri ({pendaftar.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, jenjang, nomor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-bold outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredPendaftar.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Tidak ada data pendaftar yang cocok
                </div>
              ) : (
                filteredPendaftar.map((p) => (
                  <div
                    key={p.id}
                    onClick={() =>
                      setSelectedPendaftarId(selectedPendaftarId === p.id ? null : p.id)
                    }
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                      selectedPendaftarId === p.id
                        ? "bg-primary-50 border-primary-300 shadow-xs"
                        : "hover:bg-stone-50 border-transparent"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-stone-900 truncate">
                        {toTitleCase(p.nama_lengkap)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-stone-500 font-bold">
                          {p.nomor_pendaftaran}
                        </span>
                        {p.jenjang && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                              isJenjangTanpaIL(p.jenjang)
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {p.jenjang}
                            {isJenjangTanpaIL(p.jenjang) ? " (Tanpa IL)" : ""}
                          </span>
                        )}
                        {p.status_pendaftaran === "scheduled" ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                            Terjadwal
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                            Belum Jadwal
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openScheduleModal(p);
                      }}
                      className="px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                      title="Jadwalkan langsung calon santri ini"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Jadwalkan
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Status Pemilihan
                </p>
                <p className="text-xs font-bold font-mono text-stone-200 truncate max-w-[200px]">
                  {selectedPendaftarId
                    ? `Santri: ${toTitleCase(
                        pendaftar.find((p) => p.id === selectedPendaftarId)?.nama_lengkap || ""
                      )}`
                    : "Pilih santri atau klik 'Jadwalkan'"}
                </p>
              </div>
              {selectedPendaftarId && (
                <button
                  onClick={() => setSelectedPendaftarId(null)}
                  className="text-xs text-stone-400 hover:text-white underline font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REFINED SCHEDULING MODAL (KHUSUS 1 PENDAFTAR - ONLINE VS OFFLINE PESANTREN) */}
      {/* ========================================================================= */}
      {scheduleModalOpen && (
        <div
          onWheel={(e) => e.stopPropagation()}
          data-modal="true"
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-start md:items-center pt-8 pb-16 justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 text-white flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-2 border border-white/20">
                  <CalendarPlus className="w-3.5 h-3.5 text-white" />
                  Jadwalkan Calon Santri
                </div>
                <h2
                  style={{ color: "#ffffff" }}
                  className="text-2xl font-black tracking-tight text-white !text-white drop-shadow-sm"
                >
                  Penjadwalan Seleksi &amp; Penugasan Penguji
                </h2>
                <p
                  style={{ color: "rgba(255, 255, 255, 0.9)" }}
                  className="text-xs mt-1 font-medium"
                >
                  Atur waktu pelaksanaan tes, lokasi ujian, serta penugasan asatidz penguji seleksi
                </p>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-5">
              {/* 1. PILIH CALON SANTRI / PENDAFTAR (WAJIB) */}
              <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-primary-900 uppercase tracking-wider">
                    1. Pilih Calon Santri / Pendaftar <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-primary-700">
                    {modalCandidateList.length} Santri Tersedia
                  </span>
                </div>

                {/* Search Candidate Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Ketik untuk mencari nama, jenjang atau nomor pendaftaran..."
                    value={formCandidateSearch}
                    onChange={(e) => setFormCandidateSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 font-bold"
                  />
                </div>

                <select
                  required
                  value={formCandidateId}
                  onChange={(e) => setFormCandidateId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                >
                  <option value="">
                    {modalCandidateList.length === 0
                      ? "-- Memuat data santri... --"
                      : `-- Pilih Calon Santri (${modalCandidateList.length} Tersedia) --`}
                  </option>
                  {modalCandidateList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.nomor_pendaftaran}] {toTitleCase(p.nama_lengkap)}{" "}
                      {p.jenjang ? `(${p.jenjang}${isJenjangTanpaIL(p.jenjang) ? " - Tanpa IL" : ""})` : ""}{" "}
                      {p.status_pendaftaran === "scheduled" ? "• [Sudah Terjadwal]" : ""}
                    </option>
                  ))}
                </select>

                {selectedCandidateObj && (
                  <div className="text-[11px] text-primary-900 bg-white p-3 rounded-xl border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xs">
                        {selectedCandidateObj.nama_lengkap.charAt(0)}
                      </div>
                      <div>
                        <span className="text-stone-900">
                          <b>{selectedCandidateObj.nama_lengkap}</b> ({selectedCandidateObj.nomor_pendaftaran})
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-stone-500">
                            Jenjang: <b>{selectedCandidateObj.jenjang || "Reguler"}</b>
                          </span>
                          {isCandidateTanpaIL ? (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-black border border-amber-300">
                              Jalur Tanpa IL (+ Tes Bahasa Arab &amp; Hafalan)
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-black border border-emerald-300">
                              Jalur Standar / IL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-black shrink-0 ${
                        selectedCandidateObj.status_pendaftaran === "scheduled"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {selectedCandidateObj.status_pendaftaran === "scheduled"
                        ? "Jadwal Ulang"
                        : "Siap Dijadwalkan"}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. PILIHAN JENIS TES / MATERI SELEKSI (HANYA PILIH SATU) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                    2. Jenis Tes / Materi Seleksi <span className="text-rose-500">*</span>
                  </label>
                  {isCandidateTanpaIL ? (
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-amber-600" />
                      Jalur Langsung Tanpa IL (Ada Tes Hafalan &amp; Bahasa Arab)
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      Jalur Standar / IL (3 Materi Seleksi)
                    </span>
                  )}
                </div>

                {/* Dropdown Select (Hanya satu materi yang dipilih) */}
                <select
                  value={formTestType}
                  onChange={(e) => setFormTestType(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none shadow-xs"
                >
                  <option value="Tes Bacaan Al-Qur'an">Tes Bacaan Al-Qur&apos;an</option>
                  <option value="Wawancara Calon Santri">Wawancara Calon Santri</option>
                  <option value="Wawancara Calon Orangtua/Wali">Wawancara Calon Orangtua/Wali</option>
                  {isCandidateTanpaIL && (
                    <>
                      <option value="Tes Hafalan Al-Qur'an">
                        Tes Hafalan Al-Qur&apos;an (Khusus Jenjang Tanpa IL)
                      </option>
                      <option value="Tes Lisan Bahasa Arab">
                        Tes Lisan Bahasa Arab (Khusus Jenjang Tanpa IL)
                      </option>
                    </>
                  )}
                </select>

                {/* Visual Card Selector (Klik langsung pada materi tes yang diinginkan) */}
                <div className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary-600" />
                      Materi Seleksi yang Dijadwalkan (Pilih Salah Satu):
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      Klik salah satu tombol tes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* 1. Tes Bacaan Al-Qur'an */}
                    <button
                      type="button"
                      onClick={() => setFormTestType("Tes Bacaan Al-Qur'an")}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        formTestType === "Tes Bacaan Al-Qur'an"
                          ? "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20"
                          : "bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen
                          className={`w-3.5 h-3.5 shrink-0 ${
                            formTestType === "Tes Bacaan Al-Qur'an"
                              ? "text-emerald-600"
                              : "text-stone-400"
                          }`}
                        />
                        <span>1. Tes Bacaan Al-Qur&apos;an</span>
                      </div>
                      {formTestType === "Tes Bacaan Al-Qur'an" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>

                    {/* 2. Wawancara Calon Santri */}
                    <button
                      type="button"
                      onClick={() => setFormTestType("Wawancara Calon Santri")}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        formTestType === "Wawancara Calon Santri"
                          ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 font-black shadow-xs ring-2 ring-indigo-500/20"
                          : "bg-white border-stone-200 text-stone-700 hover:border-indigo-300 hover:bg-indigo-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User
                          className={`w-3.5 h-3.5 shrink-0 ${
                            formTestType === "Wawancara Calon Santri"
                              ? "text-indigo-600"
                              : "text-stone-400"
                          }`}
                        />
                        <span>2. Wawancara Calon Santri</span>
                      </div>
                      {formTestType === "Wawancara Calon Santri" && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>

                    {/* 3. Wawancara Calon Orangtua/Wali */}
                    <button
                      type="button"
                      onClick={() => setFormTestType("Wawancara Calon Orangtua/Wali")}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        formTestType === "Wawancara Calon Orangtua/Wali"
                          ? "bg-primary-50/90 border-primary-500 text-primary-950 font-black shadow-xs ring-2 ring-primary-500/20"
                          : "bg-white border-stone-200 text-stone-700 hover:border-primary-300 hover:bg-primary-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users
                          className={`w-3.5 h-3.5 shrink-0 ${
                            formTestType === "Wawancara Calon Orangtua/Wali"
                              ? "text-primary-600"
                              : "text-stone-400"
                          }`}
                        />
                        <span>3. Wawancara Calon Ortu/Wali</span>
                      </div>
                      {formTestType === "Wawancara Calon Orangtua/Wali" && (
                        <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                      )}
                    </button>

                    {/* 4. Tes Hafalan Al-Qur'an (Khusus Tanpa IL) */}
                    {isCandidateTanpaIL && (
                      <button
                        type="button"
                        onClick={() => setFormTestType("Tes Hafalan Al-Qur'an")}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          formTestType === "Tes Hafalan Al-Qur'an"
                            ? "bg-amber-50/90 border-amber-500 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20"
                            : "bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles
                            className={`w-3.5 h-3.5 shrink-0 ${
                              formTestType === "Tes Hafalan Al-Qur'an"
                                ? "text-amber-600"
                                : "text-stone-400"
                            }`}
                          />
                          <div className="truncate">
                            <span>4. Tes Hafalan Al-Qur&apos;an</span>
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-black">
                              Tanpa IL
                            </span>
                          </div>
                        </div>
                        {formTestType === "Tes Hafalan Al-Qur'an" && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </button>
                    )}

                    {/* 5. Tes Lisan Bahasa Arab (Khusus Tanpa IL) */}
                    {isCandidateTanpaIL && (
                      <button
                        type="button"
                        onClick={() => setFormTestType("Tes Lisan Bahasa Arab")}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          formTestType === "Tes Lisan Bahasa Arab"
                            ? "bg-cyan-50/90 border-cyan-500 text-cyan-950 font-black shadow-xs ring-2 ring-cyan-500/20"
                            : "bg-white border-stone-200 text-stone-700 hover:border-cyan-300 hover:bg-cyan-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Languages
                            className={`w-3.5 h-3.5 shrink-0 ${
                              formTestType === "Tes Lisan Bahasa Arab"
                                ? "text-cyan-600"
                                : "text-stone-400"
                            }`}
                          />
                          <div className="truncate">
                            <span>5. Tes Lisan Bahasa Arab</span>
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-black">
                              Tanpa IL
                            </span>
                          </div>
                        </div>
                        {formTestType === "Tes Lisan Bahasa Arab" && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {isCandidateTanpaIL
                      ? "Pilih satu materi seleksi yang ingin dijadwalkan pada sesi ini. Jenjang langsung MA/SMA/SMA IT Tanpa IL memiliki 5 pilihan materi seleksi."
                      : "Pilih satu materi seleksi yang ingin dijadwalkan pada sesi ini. Jenjang Standar / IL memiliki 3 materi seleksi."}
                  </p>
                </div>
              </div>

              {/* 3. PENUGASAN PENGUJI / PEWAWANCARA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                    3. Penugasan Penguji / Pewawancara <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-stone-400">
                    Materi: <span className="text-primary-700 font-black">{formTestType}</span>
                  </span>
                </div>

                {/* Primary Focused Examiner based on selected formTestType */}
                <div className="p-4 bg-primary-50/40 rounded-2xl border border-primary-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-primary-950">
                      {formTestType === "Tes Bacaan Al-Qur'an" && <BookOpen className="w-4 h-4 text-primary-600" />}
                      {formTestType === "Wawancara Calon Santri" && <User className="w-4 h-4 text-indigo-600" />}
                      {formTestType === "Wawancara Calon Orangtua/Wali" && <Users className="w-4 h-4 text-primary-600" />}
                      {formTestType === "Tes Hafalan Al-Qur'an" && <Sparkles className="w-4 h-4 text-amber-600" />}
                      {formTestType === "Tes Lisan Bahasa Arab" && <Languages className="w-4 h-4 text-cyan-600" />}
                      <span>
                        {formTestType === "Tes Bacaan Al-Qur'an" && "Penguji Bacaan Al-Qur'an"}
                        {formTestType === "Wawancara Calon Santri" && "Pewawancara Calon Santri"}
                        {formTestType === "Wawancara Calon Orangtua/Wali" && "Pewawancara Calon Orangtua/Wali"}
                        {formTestType === "Tes Hafalan Al-Qur'an" && "Penguji Hafalan Al-Qur'an"}
                        {formTestType === "Tes Lisan Bahasa Arab" && "Penguji Lisan Bahasa Arab"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                      Penguji Utama
                    </span>
                  </div>

                  {formTestType === "Tes Bacaan Al-Qur'an" && (
                    <select
                      value={formPengujiQuranId || formPengujiSantriId}
                      onChange={(e) => {
                        setFormPengujiQuranId(e.target.value);
                        if (!formPengujiSantriId) setFormPengujiSantriId(e.target.value);
                      }}
                      className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username}{" "}
                          {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {formTestType === "Wawancara Calon Santri" && (
                    <select
                      value={formPengujiSantriId}
                      onChange={(e) => setFormPengujiSantriId(e.target.value)}
                      className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username}{" "}
                          {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {formTestType === "Wawancara Calon Orangtua/Wali" && (
                    <select
                      value={formPengujiOrtuId}
                      onChange={(e) => setFormPengujiOrtuId(e.target.value)}
                      className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username}{" "}
                          {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {formTestType === "Tes Hafalan Al-Qur'an" && (
                    <select
                      value={formPengujiHafalanId}
                      onChange={(e) => setFormPengujiHafalanId(e.target.value)}
                      className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username}{" "}
                          {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {formTestType === "Tes Lisan Bahasa Arab" && (
                    <select
                      value={formPengujiArabId}
                      onChange={(e) => setFormPengujiArabId(e.target.value)}
                      className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username}{" "}
                          {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {formLocationType === "online" && (
                    <p className="text-[10px] text-stone-500 font-medium">
                      Google Meet:{" "}
                      <span className="font-mono text-primary-700 font-bold">
                        {detectedAnyMeet || "Belum ada link Meet tersimpan"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Optional Expandable Additional Examiners */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAllExaminers(!showAllExaminers)}
                    className="text-[11px] font-bold text-stone-500 hover:text-primary-700 flex items-center gap-1 transition-all"
                  >
                    {showAllExaminers
                      ? "− Tutup Penugasan Penguji Lainnya"
                      : "+ Tampilkan Semua Posisi Penguji (Opsional jika satu sesi menggabungkan materi)"}
                  </button>

                  {showAllExaminers && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200/60 animate-in fade-in duration-150">
                      {/* Pewawancara Ortu */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          Pewawancara Ortu/Wali:
                        </label>
                        <select
                          value={formPengujiOrtuId}
                          onChange={(e) => setFormPengujiOrtuId(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                        >
                          <option value="">-- Bebas / Tentukan Nanti --</option>
                          {examiners.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.full_name || ex.name || ex.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Penguji Santri */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          Pewawancara Santri:
                        </label>
                        <select
                          value={formPengujiSantriId}
                          onChange={(e) => setFormPengujiSantriId(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                        >
                          <option value="">-- Bebas / Tentukan Nanti --</option>
                          {examiners.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.full_name || ex.name || ex.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Penguji Qur'an */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          Penguji Bacaan Al-Qur&apos;an:
                        </label>
                        <select
                          value={formPengujiQuranId}
                          onChange={(e) => setFormPengujiQuranId(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                        >
                          <option value="">-- Bebas / Tentukan Nanti --</option>
                          {examiners.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.full_name || ex.name || ex.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Penguji Arab */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          Penguji Lisan Bahasa Arab:
                        </label>
                        <select
                          value={formPengujiArabId}
                          onChange={(e) => setFormPengujiArabId(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                        >
                          <option value="">-- Bebas / Tentukan Nanti --</option>
                          {examiners.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.full_name || ex.name || ex.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Penguji Hafalan */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-700">
                          Penguji Hafalan Qur&apos;an:
                        </label>
                        <select
                          value={formPengujiHafalanId}
                          onChange={(e) => setFormPengujiHafalanId(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                        >
                          <option value="">-- Bebas / Tentukan Nanti --</option>
                          {examiners.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.full_name || ex.name || ex.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. METODE & LOKASI (HANYA DUA PILIHAN: ONLINE VS OFFLINE) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                  4. Metode &amp; Lokasi Seleksi <span className="text-rose-500">*</span>
                </label>

                {/* 2 Opsi Utama: Online vs Offline */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setFormLocationType("online");
                      if (detectedAnyMeet) setFormOnlineUrl(detectedAnyMeet);
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                      formLocationType === "online"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Online (Google Meet)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormLocationType("offline")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                      formLocationType === "offline"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 font-black"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Offline (Tatap Muka di Pesantren)
                  </button>
                </div>

                {/* JIKA ONLINE: LINKKAN GOOGLE MEET PENGUJI */}
                {formLocationType === "online" ? (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                        <Video className="w-4 h-4 text-emerald-600" />
                        Tautan Google Meet Ujian Online
                      </div>
                      {detectedAnyMeet && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terkait dari Profil Penguji
                        </span>
                      )}
                    </div>

                    {detectedAnyMeet ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={formOnlineUrl || detectedAnyMeet}
                            onChange={(e) => setFormOnlineUrl(e.target.value)}
                            placeholder="https://meet.google.com/xxx-yyyy-zzz"
                            className="flex-1 bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          />
                          <a
                            href={formOnlineUrl || detectedAnyMeet}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                            title="Buka dan tes tautan Google Meet"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Tes Link
                          </a>
                        </div>
                        <p className="text-[11px] text-emerald-800/80 font-medium">
                          Tautan ini dikaitkan langsung dari penguji yang dipilih dan otomatis dikirimkan ke WhatsApp orang tua santri.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          Penguji terpilih belum mencantumkan tautan Google Meet di profil mereka. Masukkan link Google Meet:
                        </p>
                        <input
                          type="text"
                          required
                          value={formOnlineUrl}
                          onChange={(e) => setFormOnlineUrl(e.target.value)}
                          placeholder="https://meet.google.com/xxx-yyyy-zzz"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* JIKA OFFLINE: INPUT TEMPAT DI PESANTREN, TANPA GOOGLE MEET */
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        Tempat / Ruangan Ujian Tatap Muka di Pesantren
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                        Tatap Muka (Tanpa Meet)
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      value={formOfflinePlace}
                      onChange={(e) => setFormOfflinePlace(e.target.value)}
                      placeholder="misal: Kampus Pesantren - Ruang Penguji Seleksi"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-amber-800/80">Pilihan Cepat:</span>
                      {[
                        "Kampus Pesantren (Ruang Penguji Seleksi)",
                        "Kantor Asatidz / Penguji",
                        "Ruang Rapat Gedung A",
                        "Masjid Pesantren",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setFormOfflinePlace(chip)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition-all ${
                            formOfflinePlace === chip
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-amber-800/80 font-medium">
                      Penguji tetap ditugaskan untuk menguji langsung di lokasi. Link Google Meet tidak digunakan untuk ujian offline tatap muka.
                    </p>
                  </div>
                )}
              </div>

              {/* 5. WAKTU PELAKSANAAN & DURASI */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                  5. Waktu Pelaksanaan &amp; Durasi <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">
                      Mulai (Tanggal &amp; Jam)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">
                      Selesai (Otomatis / Manual)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Quick duration selector */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-stone-400">Pilihan Cepat Durasi:</span>
                  {[30, 45, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setFormDuration(dur)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        formDuration === dur
                          ? "bg-primary-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. CATATAN TAMBAHAN (OPSIONAL) */}
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1">
                  6. Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Orang tua minta tes jam 09.00 WIB, santri sedang sakit, dll."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="flex-[2] py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingSchedule ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Jadwal...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Simpan &amp; Jadwalkan Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sending Progress Modal */}
      {sendingProgress.active && (
        <div
          onWheel={(e) => e.stopPropagation()}
          data-modal="true"
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-[60] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-stone-900/80 overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg border border-white p-6 text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-3" />
            <h2 className="text-xl font-black text-stone-900 mb-1">Mengirim Notifikasi...</h2>
            <p className="font-bold text-red-500 mb-4 uppercase tracking-widest text-[10px]">
              JANGAN TUTUP HALAMAN INI!
            </p>

            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden mb-3 border border-stone-200">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-500 ease-out"
                style={{
                  width: `${(sendingProgress.curr / sendingProgress.total) * 100}%`,
                }}
              />
            </div>

            <p className="font-mono font-bold text-stone-600 text-xs mb-4">
              {sendingProgress.curr} / {sendingProgress.total} Pendaftar Terkirim
            </p>

            <div className="bg-stone-50 rounded-xl p-3 text-left h-28 overflow-hidden flex flex-col-reverse gap-1 border border-stone-200">
              {sendingProgress.logs.map((log, idx) => (
                <p key={idx} className="text-[11px] font-mono text-stone-600 truncate">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Pulse Modal */}
      {showBroadcastModal && (
        <div
          onWheel={(e) => e.stopPropagation()}
          data-modal="true"
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-stone-900/60 overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-stone-900">
                  Pulse <span className="text-indigo-600">Notifikasi</span>
                </h2>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-900 mb-1">Target Pengiriman</p>
                  <p className="text-2xl font-black text-indigo-600">
                    {resetFlags ? "Semua yang belum jadwal" : `${unscheduledCandidates.length} Pendaftar`}
                  </p>
                  <p className="text-[11px] text-indigo-700/70 mt-1">
                    {resetFlags
                      ? "Menghapus status 'pernah dikabari' dan mengirim ulang ke semua pendaftar tanpa jadwal."
                      : "Hanya mengirim ke pendaftar yang belum pernah mendapatkan notifikasi jadwal tersedia."}
                  </p>
                </div>

                <div
                  className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl cursor-pointer border border-stone-200/60"
                  onClick={() => setResetFlags(!resetFlags)}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      resetFlags
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {resetFlags && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      Kirim Ulang ke Semua yang Belum Jadwal
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium">
                      Abaikan histori apakah santri sudah pernah dikirimi WA broadcast sebelumnya
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleStartBroadcast}
                  disabled={unscheduledCandidates.length === 0}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Notifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
