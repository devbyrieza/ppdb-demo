"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Gavel,
  HelpCircle,
  Info,
  Loader2,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Upload,
  UploadCloud,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SuratPengumumanDialog } from "@/components/admin/SuratPengumumanDialog";
import { BulkPengumumanDialog } from "@/components/admin/BulkPengumumanDialog";

const KKM_STANDAR = 75;

type MainTab = "siap_pleno" | "sudah_diumumkan" | "proses_seleksi";

function PengumumanContent() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<
    Array<{ id: string; nama: string; is_active: boolean }>
  >([]);
  const [showBulkAcceptedDialog, setShowBulkAcceptedDialog] = useState(false);
  const [suratTarget, setSuratTarget] = useState<{
    id: string;
    nama_lengkap: string;
    nomor_pendaftaran: string;
  } | null>(null);

  // Tab & Sub-Filter States
  const [activeTab, setActiveTab] = useState<MainTab>("siap_pleno");
  const [plenoFilter, setPlenoFilter] = useState<"all" | "rekomendasi_diterima" | "perlu_dirapatkan">("all");
  const [announcedFilter, setAnnouncedFilter] = useState<"all" | "accepted" | "cadangan" | "rejected">("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filter, setFilter] = useState({
    jenjang: "",
    tahun_ajaran: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Tahun Ajaran list on mount and default to active TA
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const res = await fetch("/api/admin/tahun-ajaran");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setTahunAjaranList(list);
          const activeTA = list.find((ta: any) => ta.is_active);
          const latestTA = list[0];
          const defaultTA = activeTA || latestTA;
          if (defaultTA) {
            setFilter((prev) => ({
              ...prev,
              tahun_ajaran: prev.tahun_ajaran || defaultTA.id,
            }));
          }
        }
      } catch (e) {
        console.error("Gagal memuat tahun ajaran:", e);
      }
    };
    fetchTahunAjaran();
  }, []);

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.jenjang) params.append("jenjang", filter.jenjang);
      if (filter.tahun_ajaran) params.append("tahun_ajaran", filter.tahun_ajaran);
      params.append("status", "all"); // Fetch all candidates for the TA to separate into tabs
      params.append("limit", "500");

      const res = await fetch(`/api/admin/pendaftar/list?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCandidates(data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    setSelectedIds([]);
  }, [filter.tahun_ajaran, filter.jenjang]);

  // Candidate Classification
  const isAnnounced = (c: any) => {
    return (
      ["accepted", "enrolled", "enrolled_full", "cadangan", "rejected"].includes(c.status_pendaftaran) ||
      Boolean(c.pengumuman?.is_published)
    );
  };

  const isReadyForPleno = (c: any) => {
    if (isAnnounced(c)) return false;
    return (
      c.status_pendaftaran === "tested" ||
      c.status_pendaftaran === "passed" ||
      c.exam_score_count === 6 ||
      c.exam_status === "tested"
    );
  };

  const isProsesSeleksi = (c: any) => {
    return !isAnnounced(c) && !isReadyForPleno(c);
  };

  const isMemenuhiKKM = (c: any) => {
    const total = Number(c.nilai_ujian?.nilai_total ?? 0);
    const quran = c.nilai_ujian?.score_quran != null ? Number(c.nilai_ujian.score_quran) : null;
    // Hard gate Al-Qur'an: Skor < 70 (Grade D/E) mutlak tidak boleh lolos otomatis (wajib dirapatkan tim)
    if (quran != null && quran < 70) return false;
    return total >= KKM_STANDAR;
  };

  // Sort candidates by total score descending
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const nA = a.nilai_ujian?.nilai_total ?? -1;
      const nB = b.nilai_ujian?.nilai_total ?? -1;
      return nB - nA;
    });
  }, [candidates]);

  // Statistics for Tabs
  const statsReady = useMemo(() => sortedCandidates.filter(isReadyForPleno), [sortedCandidates]);
  const statsAnnounced = useMemo(() => sortedCandidates.filter(isAnnounced), [sortedCandidates]);
  const statsProses = useMemo(() => sortedCandidates.filter(isProsesSeleksi), [sortedCandidates]);

  const countLolosKKM = useMemo(() => statsReady.filter(isMemenuhiKKM).length, [statsReady]);
  const countPerluRapat = useMemo(() => statsReady.filter((c) => !isMemenuhiKKM(c)).length, [statsReady]);

  const countAccepted = useMemo(
    () =>
      statsAnnounced.filter(
        (c) =>
          ["accepted", "enrolled", "enrolled_full"].includes(c.status_pendaftaran) ||
          c.pengumuman?.status_kelulusan === "Diterima"
      ).length,
    [statsAnnounced]
  );
  const countCadangan = useMemo(
    () =>
      statsAnnounced.filter(
        (c) =>
          c.status_pendaftaran === "cadangan" ||
          c.pengumuman?.status_kelulusan === "Cadangan"
      ).length,
    [statsAnnounced]
  );
  const countRejected = useMemo(
    () =>
      statsAnnounced.filter(
        (c) =>
          c.status_pendaftaran === "rejected" ||
          c.pengumuman?.status_kelulusan === "Ditolak"
      ).length,
    [statsAnnounced]
  );

  // Active Tab Candidates
  const tabCandidates = useMemo(() => {
    if (activeTab === "siap_pleno") {
      let list = statsReady;
      if (plenoFilter === "rekomendasi_diterima") {
        list = list.filter(isMemenuhiKKM);
      } else if (plenoFilter === "perlu_dirapatkan") {
        list = list.filter((c) => !isMemenuhiKKM(c));
      }
      return list;
    } else if (activeTab === "sudah_diumumkan") {
      let list = statsAnnounced;
      if (announcedFilter === "accepted") {
        list = list.filter(
          (c) =>
            ["accepted", "enrolled", "enrolled_full"].includes(c.status_pendaftaran) ||
            c.pengumuman?.status_kelulusan === "Diterima"
        );
      } else if (announcedFilter === "cadangan") {
        list = list.filter(
          (c) =>
            c.status_pendaftaran === "cadangan" ||
            c.pengumuman?.status_kelulusan === "Cadangan"
        );
      } else if (announcedFilter === "rejected") {
        list = list.filter(
          (c) =>
            c.status_pendaftaran === "rejected" ||
            c.pengumuman?.status_kelulusan === "Ditolak"
        );
      }
      return list;
    } else {
      return statsProses;
    }
  }, [statsReady, statsAnnounced, statsProses, activeTab, plenoFilter, announcedFilter]);

  // Search filter
  const filteredCandidates = useMemo(() => {
    let list = tabCandidates;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.nama_lengkap?.toLowerCase().includes(q) ||
          c.nomor_pendaftaran?.toLowerCase().includes(q) ||
          c.nik?.includes(q) ||
          c.asal_sekolah?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tabCandidates, debouncedSearch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllLolosKKM = () => {
    const ids = statsReady.filter(isMemenuhiKKM).map((c) => c.id);
    setSelectedIds(ids);
    toast.success(
      `${ids.length} santri yang lolos standar KKM (≥ 80) berhasil dipilih. Silakan klik tombol 'Diterima (${ids.length})' untuk proses SK.`,
      { duration: 4000 }
    );
  };

  const handleRapatkanDulu = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: "Agendakan ke Rapat Pleno?",
      html: `<p>Tandai santri an. <b>${nama}</b> untuk dirapatkan dan dibahas khusus bersama tim pleno?</p><p class="mt-2 text-xs text-stone-500">Status akan dicatat sebagai 'Menunggu Rapat' di draft pengumuman.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Agendakan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: [id],
          new_status: "tested",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Santri ${nama} berhasil diagendakan untuk rapat pleno.`);
        fetchCandidates();
      } else {
        toast.error(data.error || "Gagal mengagendakan rapat");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishSingle = async (
    id: string,
    nama: string,
    new_status: "accepted" | "cadangan" | "rejected" | "tested"
  ) => {
    const actionText =
      new_status === "cadangan"
        ? "menjadikan CADANGAN"
        : new_status === "tested"
          ? "MEMBATALKAN KELULUSAN & KEMBALIKAN KE SIAP PLENO"
          : "menetapkan DITOLAK";
    const btnColor =
      new_status === "cadangan"
        ? "#d97706"
        : new_status === "tested"
          ? "#4b5563"
          : "#dc2626";

    const result = await Swal.fire({
      title: `${actionText} Santri?`,
      html: `<p>Yakin ingin <b>${actionText}</b> santri an. <b>${nama}</b>?</p><p class="mt-2 text-xs text-stone-500">Status akan langsung diperbarui di database.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: "#57534e",
      confirmButtonText: "Ya, Tetapkan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: [id],
          new_status: new_status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Status ${nama} berhasil diperbarui.`);
        fetchCandidates();
      } else {
        toast.error(data.error || "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async (new_status: "accepted" | "cadangan" | "rejected" | "tested") => {
    if (selectedIds.length === 0) return;

    if (new_status === "accepted") {
      setShowBulkAcceptedDialog(true);
      return;
    }

    const actionText =
      new_status === "cadangan"
        ? "menjadikan CADANGAN"
        : new_status === "tested"
          ? "MEMBATALKAN KELULUSAN (kembalikan ke siap pleno) untuk"
          : "menetapkan DITOLAK";
    const btnColor =
      new_status === "cadangan"
        ? "#d97706"
        : new_status === "tested"
          ? "#6b7280"
          : "#dc2626";

    const result = await Swal.fire({
      title: "Publikasi Penetapan?",
      text: `Apakah Anda yakin ingin ${actionText} ${selectedIds.length} santri ini? Status akan diperbarui resmi.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: "#57534e",
      confirmButtonText: "Ya, Eksekusi!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: selectedIds,
          new_status: new_status,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || `Berhasil memperbarui ${selectedIds.length} santri.`);
        fetchCandidates();
        setSelectedIds([]);
      } else {
        toast.error(result.error || "Gagal memproses pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  const getGradeBadge = (
    score: number | null | undefined,
    type: string,
    label?: string
  ) => {
    if (score == null) return null;
    let s = Number(score);
    // Normalisasi jika skor penguji skala 1-5
    if (s > 0 && s <= 5) s = s * 20;

    let grade = "C";
    if (type === "quran" || type === "hafalan" || type === "arab") {
      grade = s >= 85 ? "A" : s >= 75 ? "B" : s >= 70 ? "C" : s >= 40 ? "D" : "E";
    } else if (type === "akademik") {
      grade = s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : s >= 30 ? "D" : "E";
    } else if (type === "kepribadian") {
      grade = s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
    } else if (type.startsWith("wawancara")) {
      grade = s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
    } else if (type === "kesiapan") {
      grade = s >= 75 ? "A" : s >= 55 ? "B" : s >= 40 ? "C" : s >= 25 ? "D" : "E";
    } else {
      grade = s >= 80 ? "A" : s >= 65 ? "B" : "C";
    }

    const color =
      grade === "A"
        ? "bg-emerald-500 text-white"
        : grade === "B"
          ? "bg-blue-500 text-white"
          : grade === "C"
            ? "bg-amber-500 text-white"
            : grade === "D"
              ? "bg-orange-500 text-white"
              : "bg-rose-500 text-white";

    const titleText = `${label || type}: ${grade} (${s.toFixed(1)})`;

    return (
      <span
        key={type}
        title={titleText}
        className={`${color} text-[9px] font-black w-5 h-5 rounded-full inline-flex items-center justify-center uppercase shrink-0 shadow-xs cursor-help hover:scale-110 transition-transform`}
      >
        {grade}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP-LEVEL WORKSPACE TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={() => {
            setActiveTab("siap_pleno");
            setSelectedIds([]);
          }}
          className={`flex items-center justify-between sm:justify-start gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "siap_pleno"
              ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-[1.01]"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎯</span>
            <div className="text-left">
              <div className="leading-tight">Siap Pleno &amp; Rekomendasi</div>
              <div className={`text-[10px] font-medium ${activeTab === "siap_pleno" ? "text-blue-100" : "text-stone-400"}`}>
                Belum Ditetapkan / Menunggu Keputusan
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black ml-2 ${
              activeTab === "siap_pleno" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
            }`}
          >
            {statsReady.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("sudah_diumumkan");
            setSelectedIds([]);
          }}
          className={`flex items-center justify-between sm:justify-start gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "sudah_diumumkan"
              ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 scale-[1.01]"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✅</span>
            <div className="text-left">
              <div className="leading-tight">Sudah Ditetapkan / Diumumkan</div>
              <div className={`text-[10px] font-medium ${activeTab === "sudah_diumumkan" ? "text-emerald-100" : "text-stone-400"}`}>
                Arsip Kelulusan &amp; Terbit SK
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black ml-2 ${
              activeTab === "sudah_diumumkan" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {statsAnnounced.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("proses_seleksi");
            setSelectedIds([]);
          }}
          className={`flex items-center justify-between sm:justify-start gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "proses_seleksi"
              ? "bg-stone-800 text-white shadow-xl shadow-stone-800/30 scale-[1.01]"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⏳</span>
            <div className="text-left">
              <div className="leading-tight">Proses Seleksi</div>
              <div className={`text-[10px] font-medium ${activeTab === "proses_seleksi" ? "text-stone-300" : "text-stone-400"}`}>
                Ujian Belum Lengkap
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black ml-2 ${
              activeTab === "proses_seleksi" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            {statsProses.length}
          </span>
        </button>
      </div>

      {/* 2. TAB CONTENT: SMART RECOMMENDATION BANNER FOR TAB 1 (SIAP PLENO) */}
      {activeTab === "siap_pleno" && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white p-6 rounded-2xl border border-blue-200/80 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-blue-950 flex items-center gap-2">
                  <span>Rekomendasi Kelulusan Otomatis (Standar KKM: {KKM_STANDAR}.00)</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Otomasi AI Seleksi
                  </span>
                </h3>
                <p className="text-xs text-blue-800/80 font-medium">
                  Sistem mengevaluasi nilai akhir peserta secara objektif untuk mempermudah keputusan Admin Super &amp; Tim Pleno.
                </p>
              </div>
            </div>

            {countLolosKKM > 0 && (
              <button
                onClick={handleSelectAllLolosKKM}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pilih Semua yang Lolos KKM ({countLolosKKM})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Lolos KKM */}
            <div
              onClick={() => setPlenoFilter(plenoFilter === "rekomendasi_diterima" ? "all" : "rekomendasi_diterima")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                plenoFilter === "rekomendasi_diterima"
                  ? "bg-emerald-100/90 border-emerald-300 ring-2 ring-emerald-500"
                  : "bg-white/80 hover:bg-emerald-50/50 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
                  <span>🌟</span> Rekomendasi: Diterima Langsung
                </span>
                <span className="text-lg font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {countLolosKKM} Santri
                </span>
              </div>
              <p className="text-xs text-emerald-700/90 leading-relaxed font-medium">
                Nilai akhir mencapai standar kelulusan KKM (≥ {KKM_STANDAR}.00 / Grade A-B). Siap diumumkan diterima langsung atau pilih &apos;Rapatkan Dulu&apos; jika ingin pembahasan khusus.
              </p>
            </div>

            {/* Perlu Dirapatkan */}
            <div
              onClick={() => setPlenoFilter(plenoFilter === "perlu_dirapatkan" ? "all" : "perlu_dirapatkan")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                plenoFilter === "perlu_dirapatkan"
                  ? "bg-amber-100/90 border-amber-300 ring-2 ring-amber-500"
                  : "bg-white/80 hover:bg-amber-50/50 border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-amber-800 uppercase flex items-center gap-1.5">
                  <span>⚖️</span> Perlu Dirapatkan Tim Pleno
                </span>
                <span className="text-lg font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {countPerluRapat} Santri
                </span>
              </div>
              <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                Nilai akhir di bawah standar KKM (&lt; {KKM_STANDAR}.00 / Grade C-D-E). Arahkan untuk dirapatkan bersama tim apakah santri tetap diterima (dispensasi/kuota), cadangan, atau ditolak.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. FILTERS & BATCH ACTIONS BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Tahun Ajaran */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
            <Calendar className="w-4 h-4 text-stone-500" />
            <select
              className="bg-transparent text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
              value={filter.tahun_ajaran}
              onChange={(e) => setFilter({ ...filter, tahun_ajaran: e.target.value })}
            >
              <option value="all">Semua Tahun Ajaran</option>
              {tahunAjaranList.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} {ta.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Filters per Tab */}
          {activeTab === "siap_pleno" && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setPlenoFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  plenoFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Semua ({statsReady.length})
              </button>
              <button
                onClick={() => setPlenoFilter("rekomendasi_diterima")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  plenoFilter === "rekomendasi_diterima"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                🌟 Lolos KKM ({countLolosKKM})
              </button>
              <button
                onClick={() => setPlenoFilter("perlu_dirapatkan")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  plenoFilter === "perlu_dirapatkan"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                ⚖️ Rapat Tim ({countPerluRapat})
              </button>
            </div>
          )}

          {activeTab === "sudah_diumumkan" && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setAnnouncedFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  announcedFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Semua ({statsAnnounced.length})
              </button>
              <button
                onClick={() => setAnnouncedFilter("accepted")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  announcedFilter === "accepted" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Diterima ({countAccepted})
              </button>
              <button
                onClick={() => setAnnouncedFilter("cadangan")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  announcedFilter === "cadangan" ? "bg-amber-600 text-white shadow-xs" : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                Cadangan ({countCadangan})
              </button>
              <button
                onClick={() => setAnnouncedFilter("rejected")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  announcedFilter === "rejected" ? "bg-red-600 text-white shadow-xs" : "text-red-700 hover:bg-red-50"
                }`}
              >
                Ditolak ({countRejected})
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-primary-500 focus-within:bg-white transition-all w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama / no. daftar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full focus:outline-none placeholder:text-stone-400 font-medium text-stone-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "siap_pleno" && (
            <>
              <button
                onClick={() => handlePublish("accepted")}
                disabled={selectedIds.length === 0 || isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm text-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isPublishing ? "Proses..." : `Diterima (${selectedIds.length})`}</span>
              </button>
              <button
                onClick={() => handlePublish("cadangan")}
                disabled={selectedIds.length === 0 || isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm text-xs cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{isPublishing ? "Proses..." : `Cadangkan (${selectedIds.length})`}</span>
              </button>
              <button
                onClick={() => handlePublish("rejected")}
                disabled={selectedIds.length === 0 || isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm text-xs cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{isPublishing ? "Proses..." : `Tolak (${selectedIds.length})`}</span>
              </button>
            </>
          )}

          {activeTab === "sudah_diumumkan" && (
            <>
              <button
                onClick={() => handlePublish("tested")}
                disabled={isPublishing || selectedIds.length === 0}
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-stone-600 text-white rounded-xl hover:bg-stone-700 transition-all font-bold text-xs ${
                  selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : "shadow-sm cursor-pointer"
                }`}
                title="Batalkan kelulusan & kembalikan ke Siap Pleno"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kembalikan ke Siap Pleno ({selectedIds.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. TABLE & CARDS VIEW */}
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <p className="text-sm font-semibold">Memuat data kandidat...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="text-base font-bold text-stone-700">Tidak ada data santri</p>
            <p className="text-xs text-stone-400 mt-1">
              {activeTab === "siap_pleno"
                ? "Semua santri yang selesai ujian telah ditetapkan/diumumkan, atau belum ada yang selesai ujian lengkap."
                : activeTab === "sudah_diumumkan"
                  ? "Belum ada santri yang ditetapkan/diterbitkan SK pengumuman."
                  : "Tidak ada data santri dalam proses seleksi."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50/80 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedIds.length === filteredCandidates.length
                      }
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-stone-600 uppercase tracking-wider">
                    Nama &amp; Komponen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-stone-600 uppercase tracking-wider">
                    Jenjang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-stone-600 uppercase tracking-wider">
                    Total / Grade
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-stone-600 uppercase tracking-wider">
                    {activeTab === "siap_pleno" ? "Rekomendasi Seleksi" : "Status Pengumuman"}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-stone-600 uppercase tracking-wider">
                    Aksi Penetapan (1-Klik)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCandidates.map((c) => {
                  const nu = c.nilai_ujian;
                  const total = nu?.nilai_total != null ? Number(nu.nilai_total) : 0;
                  const grade = total >= 85 ? "A" : total >= 75 ? "B" : total >= 60 ? "C" : "D";
                  const lolosKKM = isMemenuhiKKM(c);

                  const ws = nu?.nilai_wawancara_santri ?? nu?.score_wawancara;
                  const wo = nu?.nilai_wawancara_ortu;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-stone-50/60 transition-colors ${
                        selectedIds.includes(c.id) ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => handleSelectOne(c.id)}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-stone-900 text-sm">
                          {toTitleCase(c.nama_lengkap)}
                        </div>
                        <div className="text-xs font-mono font-bold text-stone-400 mb-1.5">
                          {c.nomor_pendaftaran}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex gap-1 items-center" title="Predikat per Komponen (Arahkan kursor untuk skor angka)">
                            {getGradeBadge(nu?.score_quran, "quran", "Al-Qur'an")}
                            {getGradeBadge(nu?.score_akademik, "akademik", "Akademik")}
                            {getGradeBadge(nu?.score_kepribadian, "kepribadian", "Kepribadian")}
                            {getGradeBadge(ws, "wawancara_santri", "W. Santri")}
                            {getGradeBadge(wo, "wawancara_ortu", "W. Ortu")}
                            {getGradeBadge(nu?.score_kesiapan, "kesiapan", "Kesiapan")}
                            {nu?.score_hafalan != null && getGradeBadge(nu?.score_hafalan, "hafalan", "Hafalan")}
                            {nu?.score_arab != null && getGradeBadge(nu?.score_arab, "arab", "B. Arab")}
                          </div>
                          {c.exam_score_count >= 6 ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ {c.exam_score_count === 6 ? "6/6 Nilai Lengkap" : `${c.exam_score_count} Nilai Lengkap`}
                            </span>
                          ) : c.exam_score_count > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              {c.exam_score_count}/6 Nilai
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-black uppercase whitespace-nowrap inline-block shrink-0">
                          {c.jenjang}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-black text-stone-900 text-base leading-none">
                            {nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : "-"}
                          </div>
                          {nu?.nilai_total != null && (
                            <span className="text-[11px] font-bold text-stone-400 mt-1">
                              Grade: <span className="text-stone-800 font-black">{grade}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status / Recommendation Column */}
                      <td className="px-6 py-4 text-center">
                        {activeTab === "siap_pleno" ? (
                          <div className="flex flex-col items-center gap-1">
                            {c.pengumuman?.status_kelulusan === "Menunggu Rapat" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                <Users className="w-3.5 h-3.5" />
                                Diagendakan Rapat
                              </span>
                            ) : lolosKKM ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase whitespace-nowrap shadow-xs border border-emerald-200">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                  Rekomendasi: Diterima
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold">
                                  Lolos KKM {KKM_STANDAR} (Grade {grade})
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase whitespace-nowrap shadow-xs border border-amber-200">
                                  <Gavel className="w-3.5 h-3.5 text-amber-700" />
                                  Perlu Dirapatkan Tim
                                </span>
                                <span className="text-[10px] text-amber-700 font-bold">
                                  Di Bawah KKM (Grade {grade})
                                </span>
                              </>
                            )}
                          </div>
                        ) : activeTab === "sudah_diumumkan" ? (
                          <div className="flex flex-col items-center gap-1">
                            {["accepted", "enrolled", "enrolled_full"].includes(c.status_pendaftaran) ||
                            c.pengumuman?.status_kelulusan === "Diterima" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Diterima (SK Terbit)
                              </span>
                            ) : c.status_pendaftaran === "cadangan" || c.pengumuman?.status_kelulusan === "Cadangan" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Cadangan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                Ditolak
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase whitespace-nowrap">
                            {c.status_pendaftaran}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons Column */}
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {activeTab === "siap_pleno" ? (
                            <>
                              {/* 1. Diterima */}
                              <button
                                onClick={() => {
                                  setSelectedIds([c.id]);
                                  setShowBulkAcceptedDialog(true);
                                }}
                                title="Upload Surat Resmi & Tetapkan Diterima"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{lolosKKM ? "Diterima" : "Terima (Pleno)"}</span>
                              </button>

                              {/* 2. Rapatkan Dulu */}
                              <button
                                onClick={() => handleRapatkanDulu(c.id, c.nama_lengkap)}
                                title="Agendakan santri ini untuk dirapatkan bersama tim pleno"
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  !lolosKKM
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                                    : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                                }`}
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Rapatkan Dulu</span>
                              </button>

                              {/* 3. Cadangan */}
                              <button
                                onClick={() => handlePublishSingle(c.id, c.nama_lengkap, "cadangan")}
                                title="Jadikan Cadangan"
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Cadangan</span>
                              </button>

                              {/* 4. Tolak */}
                              <button
                                onClick={() => handlePublishSingle(c.id, c.nama_lengkap, "rejected")}
                                title="Tolak Pendaftar"
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : activeTab === "sudah_diumumkan" ? (
                            <>
                              {/* Ganti Surat */}
                              <button
                                onClick={() => {
                                  setSuratTarget({
                                    id: c.id,
                                    nama_lengkap: c.nama_lengkap,
                                    nomor_pendaftaran: c.nomor_pendaftaran,
                                  });
                                }}
                                title="Upload / Ganti Surat Pengumuman Resmi"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Ganti Surat</span>
                              </button>

                              {/* Lihat Surat jika ada */}
                              {c.pengumuman?.surat_pengumuman_path && (
                                <a
                                  href={c.pengumuman.surat_pengumuman_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Lihat Surat Pengumuman Resmi"
                                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-red-600" />
                                  <span>Lihat</span>
                                </a>
                              )}

                              {/* Kembalikan ke Pleno */}
                              <button
                                onClick={() => handlePublishSingle(c.id, c.nama_lengkap, "tested")}
                                title="Batalkan status pengumuman dan kembalikan santri ke tab Siap Pleno"
                                className="px-2.5 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-xl text-xs font-bold border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Kembalikan ke Pleno</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-stone-400 italic">Menunggu Ujian Selesai</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Pengumuman Massal */}
      {showBulkAcceptedDialog && (
        <BulkPengumumanDialog
          candidates={candidates
            .filter((c) => selectedIds.includes(c.id))
            .map((c) => ({
              id: c.id,
              nama_lengkap: c.nama_lengkap,
              nomor_pendaftaran: c.nomor_pendaftaran,
              jenjang: c.jenjang,
              kelas_diterima: c.pengumuman?.kelas_diterima,
            }))}
          onClose={() => setShowBulkAcceptedDialog(false)}
          onSuccess={() => {
            setShowBulkAcceptedDialog(false);
            setSelectedIds([]);
            fetchCandidates();
          }}
        />
      )}

      {/* Modal Upload Surat Pengumuman Resmi (Single) */}
      {suratTarget && (
        <SuratPengumumanDialog
          pendaftar={suratTarget}
          onClose={() => setSuratTarget(null)}
          onDone={() => {
            setSuratTarget(null);
            fetchCandidates();
          }}
        />
      )}
    </div>
  );
}

export default function PengumumanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PengumumanContent />
    </Suspense>
  );
}
