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
  X
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

export default function JadwalUjianPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedPendaftarId, setSelectedPendaftarId] = useState<string | null>(null);

  // UNIFIED SCHEDULING MODAL STATE
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<"spesifik" | "umum">("spesifik");
  const [formCandidateId, setFormCandidateId] = useState<string>("");
  const [formCandidateSearch, setFormCandidateSearch] = useState<string>("");
  const [formTestType, setFormTestType] = useState<string>("Wawancara Calon Santri & Orang Tua");
  const [formCustomTestType, setFormCustomTestType] = useState<string>("");
  const [formSessionTitle, setFormSessionTitle] = useState<string>("");
  const [formPengujiOrtuId, setFormPengujiOrtuId] = useState<string>("");
  const [formPengujiSantriId, setFormPengujiSantriId] = useState<string>("");
  const [formStartTime, setFormStartTime] = useState<string>("");
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formEndTime, setFormEndTime] = useState<string>("");
  const [formLocationType, setFormLocationType] = useState<"gmeet" | "zoom" | "offline">("gmeet");
  const [formLocationUrl, setFormLocationUrl] = useState<string>("Online (Google Meet)");
  const [formQuota, setFormQuota] = useState<number>(1);
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

  // Auto detect Google Meet link when examiner changes
  useEffect(() => {
    if (formLocationType === "gmeet") {
      const ortuEx = examiners.find((u) => u.id === formPengujiOrtuId);
      const santriEx = examiners.find((u) => u.id === formPengujiSantriId);
      const meet = ortuEx?.google_meet_link || santriEx?.google_meet_link;
      if (meet && (!formLocationUrl || formLocationUrl === "Online (Google Meet)")) {
        setFormLocationUrl(meet);
      }
    }
  }, [formPengujiOrtuId, formPengujiSantriId, formLocationType, examiners]);

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
        fetch("/api/admin/pendaftar/list?status=paid,docs_verified&limit=100"),
        fetch("/api/admin/users"),
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.data);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setExaminers(uData.data || []);
      }
      if (pendaftarRes.ok) {
        const data = await pendaftarRes.json();
        setPendaftar(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = (candidate?: Pendaftar) => {
    if (candidate) {
      setScheduleType("spesifik");
      setFormCandidateId(candidate.id);
      setFormQuota(1);
    } else {
      setScheduleType("spesifik");
      setFormQuota(1);
    }
    setScheduleModalOpen(true);
  };

  const resetScheduleForm = () => {
    setFormCandidateId("");
    setFormCandidateSearch("");
    setFormTestType("Wawancara Calon Santri & Orang Tua");
    setFormCustomTestType("");
    setFormSessionTitle("");
    setFormPengujiOrtuId("");
    setFormPengujiSantriId("");
    setFormStartTime("");
    setFormDuration(60);
    setFormEndTime("");
    setFormLocationType("gmeet");
    setFormLocationUrl("Online (Google Meet)");
    setFormQuota(1);
    setFormNotes("");
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartTime) {
      Swal.fire("Peringatan", "Waktu mulai pelaksanaan wajib diisi", "warning");
      return;
    }
    if (scheduleType === "spesifik" && !formCandidateId) {
      Swal.fire("Peringatan", "Pilih nama pendaftar / calon santri terlebih dahulu", "warning");
      return;
    }

    try {
      setSubmittingSchedule(true);
      const start = new Date(formStartTime);
      const end = formEndTime ? new Date(formEndTime) : new Date(start.getTime() + formDuration * 60000);

      const actualTestType = formTestType === "Lainnya" ? formCustomTestType || "Tes Seleksi" : formTestType;
      const candidate = pendaftar.find((p) => p.id === formCandidateId);
      const sessionTitle =
        formSessionTitle.trim() ||
        (scheduleType === "spesifik" && candidate
          ? `${actualTestType} - ${candidate.nama_lengkap}`
          : `${actualTestType} (${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })})`);

      let formattedLocation = (formLocationUrl || "Online (Google Meet)").trim();
      if (
        (formattedLocation.includes("meet.google.com") || formattedLocation.includes("zoom.us")) &&
        !formattedLocation.startsWith("http://") &&
        !formattedLocation.startsWith("https://")
      ) {
        formattedLocation = "https://" + formattedLocation;
      }

      const quota = scheduleType === "spesifik" ? 1 : formQuota || 10;

      // 1. Create Session
      const sessionRes = await fetch("/api/admin/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          quota: quota,
          location: formattedLocation,
          notes: formNotes || `Jenis Tes: ${actualTestType}`,
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        throw new Error(err.error || "Gagal membuat sesi ujian");
      }

      const sessionJson = await sessionRes.json();
      const newSessionId = sessionJson.data.id;

      // 2. If specific candidate, assign immediately
      if (scheduleType === "spesifik" && formCandidateId && candidate) {
        const assignRes = await fetch("/api/admin/jadwal-ujian/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pendaftar_id: formCandidateId,
            exam_session_id: newSessionId,
            tahun_ajaran_id: candidate.tahun_ajaran_id,
            penguji_ortu_id: formPengujiOrtuId || undefined,
            penguji_santri_id: formPengujiSantriId || undefined,
          }),
        });

        if (!assignRes.ok) {
          const aErr = await assignRes.json();
          throw new Error(aErr.error || "Gagal menetapkan pendaftar ke sesi");
        }

        Swal.fire({
          icon: "success",
          title: "Jadwal Berhasil Dibuat!",
          text: `Tes "${actualTestType}" untuk ${candidate.nama_lengkap} pada ${start.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} jam ${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB telah berhasil dijadwalkan & notifikasi WhatsApp dikirim.`,
          confirmButtonColor: "#800000",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Sesi Berhasil Dibuat!",
          text: `Sesi "${sessionTitle}" dengan kuota ${quota} peserta berhasil ditambahkan.`,
          confirmButtonColor: "#800000",
        });
      }

      setScheduleModalOpen(false);
      resetScheduleForm();
      fetchData();
      fetchAvailStats();
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Terjadi kesalahan sistem", "error");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleAssign = async (sessionId: string) => {
    if (!selectedPendaftarId) return;

    const p = pendaftar.find((p) => p.id === selectedPendaftarId);

    try {
      setAssigning(true);
      const res = await fetch("/api/admin/jadwal-ujian/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: selectedPendaftarId,
          exam_session_id: sessionId,
          tahun_ajaran_id: p?.tahun_ajaran_id,
        }),
      });

      if (res.ok) {
        setSelectedPendaftarId(null);
        fetchData();
        Swal.fire("Berhasil", "Pendaftar berhasil dijadwalkan ke sesi ini", "success");
      } else {
        const err = await res.json();
        Swal.fire("Gagal", err.error || "Gagal menetapkan jadwal", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Terjadi kesalahan sistem saat menetapkan jadwal", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async (sessionId: string, sessionTitle: string) => {
    const result = await Swal.fire({
      title: "Assign Massal?",
      text: `Yakin ingin Assign Massal ke sesi "${sessionTitle}"?\n\nLink ujian akan dikirim via WhatsApp ke semua pendaftar yang belum punya jadwal.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#57534e",
      confirmButtonText: "Ya, Mulai Broadcast",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setAssigning(true);
      const res = await fetch("/api/admin/jadwal-ujian/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.queue && data.queue.length > 0) {
          setSendingProgress({
            active: true,
            curr: 0,
            total: data.queue.length,
            logs: [`Memulai pengiriman untuk ${data.queue.length} pendaftar...`],
          });

          for (let i = 0; i < data.queue.length; i++) {
            const item = data.queue[i];
            try {
              const sendRes = await fetch("/api/admin/jadwal-ujian/send-notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pendaftar_id: item.pendaftar_id,
                  jadwal_id: item.jadwal_id,
                }),
              });
              const sendData = await sendRes.json();
              setSendingProgress((prev) => ({
                ...prev,
                curr: i + 1,
                logs: [
                  `[${i + 1}/${data.queue.length}] ${item.nama_lengkap}: ${sendData.success ? "Terkirim" : "Gagal"}`,
                  ...prev.logs,
                ],
              }));
            } catch (err: any) {
              setSendingProgress((prev) => ({
                ...prev,
                curr: i + 1,
                logs: [`[${i + 1}/${data.queue.length}] ${item.nama_lengkap}: Error (${err.message})`, ...prev.logs],
              }));
            }
          }

          setTimeout(() => {
            setSendingProgress((prev) => ({ ...prev, active: false }));
            Swal.fire("Selesai", "Semua notifikasi telah diproses.", "success");
            fetchData();
          }, 1500);
        } else {
          Swal.fire("Selesai", data.message || "Berhasil menetapkan jadwal", "success");
          fetchData();
        }
      } else {
        Swal.fire("Gagal", data.error || "Gagal melakukan assign massal", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleBroadcastAvailability = async () => {
    try {
      setBroadcasting(true);
      const res = await fetch("/api/admin/notifications/broadcast-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetFlags }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Broadcast Berhasil Dijalankan!",
          text: `Pesan broadcast telah berhasil dikirim ke antrean untuk ${data.data.count} pendaftar.`,
          icon: "success",
          confirmButtonColor: "#7c3aed",
        });
        setShowBroadcastModal(false);
        fetchAvailStats();
      } else {
        Swal.fire("Gagal", data.error || "Gagal menjalankan broadcast", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Terjadi kesalahan sistem saat broadcast", "error");
    } finally {
      setBroadcasting(false);
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })} • ${s.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const filteredPendaftar = useMemo(() => {
    return pendaftar.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
        p.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase())
    );
  }, [pendaftar, search]);

  const modalCandidateList = useMemo(() => {
    if (!formCandidateSearch) return pendaftar;
    return pendaftar.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(formCandidateSearch.toLowerCase()) ||
        p.nomor_pendaftaran.toLowerCase().includes(formCandidateSearch.toLowerCase())
    );
  }, [pendaftar, formCandidateSearch]);

  const selectedCandidateObj = useMemo(() => {
    return pendaftar.find((p) => p.id === formCandidateId);
  }, [pendaftar, formCandidateId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 overflow-hidden relative">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-700 border border-primary-100">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Plotting & Jadwal <span className="text-primary-600">Seleksi</span>
              </h1>
              <p className="text-stone-500 font-medium text-sm">
                Atur jadwal tes pendaftar, tentukan penguji/pewawancara, dan buat sesi ujian
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
              <Plus className="w-5 h-5" />
              Buat Sesi / Jadwalkan Tes
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
                {availStats.eligibleCount} <span className="text-sm font-bold text-primary-200">Orang</span>
              </h3>
              <p className="text-xs mt-1.5 text-primary-100/70 font-medium">
                Belum memiliki jadwal atau belum disetujui penguji
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
              <CheckCircle2 className="w-3.5 h-3.5" /> Total kuota tersedia: {availStats.totalAvailableSlots} slot
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
              Daftar Sesi & Jadwal Ujian
            </h2>
            <span className="text-xs font-bold text-stone-400">
              {sessions.length} Sesi Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                <p className="text-stone-400 text-sm mt-2 font-medium">Memuat daftar sesi...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-stone-200">
                <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-bold text-stone-600">Belum ada sesi ujian yang dibuat.</p>
                <p className="text-xs text-stone-400 mt-1 mb-4">Klik tombol di bawah untuk membuat jadwal atau sesi baru</p>
                <button
                  onClick={() => openScheduleModal()}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 hover:bg-primary-700 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Buat Sesi Baru Sekarang
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
                        {s.title || "Sesi Ujian"}
                      </h3>
                      <p className="text-xs font-bold text-stone-600 mt-1">
                        {formatTimeRange(s.start_time, s.end_time)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {s.location || "Online (Google Meet)"}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-1.5 text-xs font-black text-primary-600">
                          <Users className="w-3.5 h-3.5" />
                          {s.booked_count} / {s.quota} Peserta
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {selectedPendaftarId ? (
                      <button
                        onClick={() => handleAssign(s.id)}
                        disabled={assigning || s.booked_count >= s.quota}
                        className="w-full md:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                        Plotkan Santri Terpilih
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full md:w-56 items-end">
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full"
                            style={{ width: `${Math.min(100, (s.booked_count / s.quota) * 100)}%` }}
                          />
                        </div>
                        <button
                          onClick={() => handleBulkAssign(s.id, s.title || "Sesi Ini")}
                          disabled={assigning}
                          className="text-xs font-bold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Broadcast Link (Massal)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Candidate List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-stone-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Calon Peserta Butuh Jadwal
            </h2>
            <span className="text-xs font-bold text-stone-400">
              {filteredPendaftar.length} Santri
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-[650px] sticky top-24">
            <div className="p-3.5 border-b border-stone-100 bg-stone-50/70">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau no. pendaftaran..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain custom-scrollbar">
              {filteredPendaftar.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 p-6 text-center">
                  <UserCheck className="w-10 h-10 mb-2 opacity-40" />
                  <span className="text-xs font-bold">Semua pendaftar telah memiliki jadwal</span>
                </div>
              ) : (
                filteredPendaftar.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                      selectedPendaftarId === p.id
                        ? "bg-primary-50/70 border-primary-300 shadow-xs"
                        : "bg-white border-stone-100 hover:border-primary-200 hover:bg-stone-50/50"
                    }`}
                  >
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => setSelectedPendaftarId(selectedPendaftarId === p.id ? null : p.id)}
                    >
                      <p className="font-bold text-stone-900 truncate text-sm leading-tight group-hover:text-primary-700 transition-colors">
                        {toTitleCase(p.nama_lengkap)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold text-stone-400">
                          {p.nomor_pendaftaran}
                        </span>
                        {p.jenjang && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                            {p.jenjang}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openScheduleModal(p)}
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
                <p className="text-xs font-bold font-mono text-stone-200 truncate">
                  {selectedPendaftarId
                    ? `Santri dipilih: ${toTitleCase(pendaftar.find((p) => p.id === selectedPendaftarId)?.nama_lengkap || "")}`
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
      {/* UNIFIED COMPREHENSIVE SCHEDULING MODAL (PENDAFTAR + PENGUJI + JENIS TES) */}
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
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-bold mb-2 border border-white/10">
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Form Penjadwalan Seleksi
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Atur Jadwal & Penguji Seleksi
                </h2>
                <p className="text-primary-200/80 text-xs mt-1">
                  Pilih pendaftar, jenis tes, pewawancara/penguji, dan waktu pelaksanaan tes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-5">
              {/* 1. TARGET PENJADWALAN */}
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                  1. Target Penjadwalan
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleType("spesifik");
                      setFormQuota(1);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      scheduleType === "spesifik"
                        ? "bg-white text-primary-700 shadow-sm font-black"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Pendaftar Tertentu (Jadwal Khusus)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleType("umum");
                      setFormQuota(10);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      scheduleType === "umum"
                        ? "bg-white text-primary-700 shadow-sm font-black"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Sesi Terbuka / Massal (Banyak Santri)
                  </button>
                </div>
              </div>

              {/* 2. PILIHAN NAMA PENDAFTAR (JIKA MODE SPESIFIK) */}
              {scheduleType === "spesifik" ? (
                <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-2.5">
                  <label className="block text-xs font-black text-primary-900 uppercase tracking-wider">
                    Pilih Calon Santri / Pendaftar <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Search Candidate Filter */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Ketik untuk memfilter nama calon santri..."
                      value={formCandidateSearch}
                      onChange={(e) => setFormCandidateSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 font-bold"
                    />
                  </div>

                  <select
                    required
                    value={formCandidateId}
                    onChange={(e) => setFormCandidateId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  >
                    <option value="">-- Pilih Calon Santri / Pendaftar --</option>
                    {modalCandidateList.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.nomor_pendaftaran}] {toTitleCase(p.nama_lengkap)} {p.jenjang ? `(${p.jenjang})` : ""}
                      </option>
                    ))}
                  </select>

                  {selectedCandidateObj && (
                    <div className="text-[11px] text-primary-800 bg-white p-2.5 rounded-lg border border-primary-100 flex items-center justify-between font-bold">
                      <span>Calon Santri: <b>{selectedCandidateObj.nama_lengkap}</b> ({selectedCandidateObj.nomor_pendaftaran})</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Siap Dijadwalkan</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Kuota Peserta untuk Sesi Ini
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formQuota}
                    onChange={(e) => setFormQuota(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              )}

              {/* 3. PILIHAN JENIS TES */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                  2. Jenis Tes / Materi Seleksi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTestType}
                  onChange={(e) => setFormTestType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-primary-500/20 outline-none"
                >
                  <option value="Wawancara Calon Santri & Orang Tua">
                    Wawancara Calon Santri & Orang Tua (Standar)
                  </option>
                  <option value="Tes Lengkap (Wawancara & Al-Qur'an)">
                    Tes Lengkap (Wawancara Ortu, Santri & Tes Al-Qur'an/Tahfidz)
                  </option>
                  <option value="Tes Al-Qur'an & Tahfidz Saja">
                    Tes Al-Qur'an & Tahfidz Saja
                  </option>
                  <option value="Tes Akademik (CBT)">
                    Tes Akademik (CBT / Ujian Tulis)
                  </option>
                  <option value="Wawancara Khusus Permintaan Orang Tua">
                    Wawancara Khusus / Request Jadwal Orang Tua
                  </option>
                  <option value="Lainnya">Lainnya / Kustom...</option>
                </select>

                {formTestType === "Lainnya" && (
                  <input
                    type="text"
                    required
                    placeholder="Tuliskan jenis tes kustom..."
                    value={formCustomTestType}
                    onChange={(e) => setFormCustomTestType(e.target.value)}
                    className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                )}
              </div>

              {/* 4. PILIHAN PENGUJI / PEWAWANCARA */}
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                  3. Pilihan Penguji / Pewawancara
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pewawancara Orang Tua */}
                  <div className="space-y-1.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                      <Users className="w-3.5 h-3.5 text-primary-600" />
                      Pewawancara Orang Tua / Wali
                    </div>
                    <select
                      value={formPengujiOrtuId}
                      onChange={(e) => setFormPengujiOrtuId(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username} {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                    {formPengujiOrtuId && (
                      <p className="text-[10px] text-stone-400 font-medium truncate">
                        Meet Link: {examiners.find((e) => e.id === formPengujiOrtuId)?.google_meet_link || "Belum ada link tersimpan"}
                      </p>
                    )}
                  </div>

                  {/* Penguji Santri */}
                  <div className="space-y-1.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                    <div className="flex items-center gap-1.5 text-xs font-black text-stone-800">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Penguji / Pewawancara Santri
                    </div>
                    <select
                      value={formPengujiSantriId}
                      onChange={(e) => setFormPengujiSantriId(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="">-- Bebas / Tentukan Nanti --</option>
                      {examiners.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.full_name || ex.name || ex.username} {ex.role === "penguji" ? "(Penguji)" : `(${ex.role})`}
                        </option>
                      ))}
                    </select>
                    {formPengujiSantriId && (
                      <p className="text-[10px] text-stone-400 font-medium truncate">
                        Meet Link: {examiners.find((e) => e.id === formPengujiSantriId)?.google_meet_link || "Belum ada link tersimpan"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. WAKTU PELAKSANAAN & DURASI */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                  4. Waktu Pelaksanaan & Durasi <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">
                      Mulai (Tanggal & Jam)
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

              {/* 6. LOKASI / MEDIA (GOOGLE MEET / ZOOM / OFFLINE) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider">
                  5. Lokasi / Media Ujian
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormLocationType("gmeet");
                      if (formLocationUrl.includes("zoom") || formLocationUrl.includes("Ruang")) {
                        setFormLocationUrl("Online (Google Meet)");
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      formLocationType === "gmeet"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                        : "bg-stone-50 text-stone-500 border-stone-200"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Google Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormLocationType("zoom");
                      if (formLocationUrl.includes("meet") || formLocationUrl.includes("Ruang")) {
                        setFormLocationUrl("Online (Zoom)");
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      formLocationType === "zoom"
                        ? "bg-blue-50 text-blue-800 border-blue-300 font-black"
                        : "bg-stone-50 text-stone-500 border-stone-200"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Zoom Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormLocationType("offline");
                      setFormLocationUrl("Kampus Pesantren (Offline)");
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      formLocationType === "offline"
                        ? "bg-amber-50 text-amber-800 border-amber-300 font-black"
                        : "bg-stone-50 text-stone-500 border-stone-200"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Tatap Muka (Offline)
                  </button>
                </div>

                <input
                  type="text"
                  value={formLocationUrl}
                  onChange={(e) => setFormLocationUrl(e.target.value)}
                  placeholder={
                    formLocationType === "gmeet"
                      ? "Link Google Meet (contoh: https://meet.google.com/abc-defg-hij)"
                      : formLocationType === "zoom"
                      ? "Link Zoom Meeting..."
                      : "Ruangan di Pesantren (contoh: Ruang Rapat Lt. 1)"
                  }
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* 7. CATATAN TAMBAHAN (OPSIONAL) */}
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
                      Simpan & Jadwalkan Sekarang
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
                    {resetFlags ? "Semua yang belum jadwal" : `${availStats.eligibleCount} Pendaftar`}
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
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      resetFlags ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-stone-300"
                    }`}
                  >
                    {resetFlags && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-900 uppercase">
                      Reset Status & Broadcast Ulang
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold">
                      Gunakan jika Anda menambah banyak slot baru.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                    Pesan akan masuk antrean untuk mencegah terblokir WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleBroadcastAvailability}
                  disabled={broadcasting || (availStats.eligibleCount === 0 && !resetFlags)}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {broadcasting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Kirim Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
