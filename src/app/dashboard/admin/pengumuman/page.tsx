"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Gavel,
  HelpCircle,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
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
import { exportToExcelProfessional, exportToPDF } from "@/lib/utils/export";

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
  const [selectedMissingCandidate, setSelectedMissingCandidate] = useState<any | null>(null);
  const [selectedNotesCandidate, setSelectedNotesCandidate] = useState<any | null>(null);

  // Helper WhatsApp & Phone
  const formatPhoneForWA = (phone?: string | null): string => {
    if (!phone) return "";
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.substring(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return clean;
  };

  const getWAExaminerUrl = (
    candidate: any,
    component: { name: string; penguji_name?: string | null; penguji_phone?: string | null }
  ) => {
    const phone = formatPhoneForWA(component.penguji_phone);
    if (!phone) return "";
    const msg = `Assalamu'alaikum Wr. Wb. Ustadz/Ustadzah ${component.penguji_name || ""},\n\nIzin mengingatkan Panitia PPDB terkait penilaian seleksi calon santri:\n• Nama: ${candidate.nama_lengkap}\n• No. Pendaftaran: ${candidate.nomor_pendaftaran}\n• Jenjang: ${candidate.jenjang}\n• Komponen Nilai: ${component.name}\n\nMohon kesediaannya untuk dapat segera menginput nilai melalui portal penilaian PPDB agar rekap hasil ujian santri dapat segera diplenokan.\n\nJazakumullahu khairan katsiran.\n- Panitia PPDB`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const getWACandidateUrl = (candidate: any) => {
    const phone = formatPhoneForWA(candidate.wali_phone || candidate.no_hp);
    if (!phone) return "";
    const msg = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${candidate.wali_name || "Bapak/Ibu Wali Calon Santri"} dari ananda:\n• Nama: ${candidate.nama_lengkap}\n• No. Pendaftaran: ${candidate.nomor_pendaftaran}\n• Jenjang: ${candidate.jenjang}\n\nKami dari Panitia PPDB menginformasikan bahwa ananda saat ini *belum memilih Jadwal Tes Seleksi / Wawancara*.\n\nMohon kesediaannya untuk segera login ke akun portal pendaftaran PPDB Anda dan memilih sesi jadwal tes yang tersedia, atau konfirmasikan ke kami jika memerlukan bantuan penjadwalan khusus dari panitia.\n\nTerima kasih banyak.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\n- Panitia PPDB`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Tab & Sub-Filter States
  const [activeTab, setActiveTab] = useState<MainTab>("siap_pleno");
  const [plenoFilter, setPlenoFilter] = useState<"all" | "rekomendasi_diterima" | "perlu_dirapatkan">("all");
  const [announcedFilter, setAnnouncedFilter] = useState<"all" | "accepted" | "cadangan" | "rejected">("all");
  const [prosesFilter, setProsesFilter] = useState<"all" | "menunggu_penilaian" | "belum_pilih_jadwal">("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filter, setFilter] = useState({
    jenjang: "",
    tahun_ajaran: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Santri Siap Pleno HANYA yang seluruh nilai ujiannya sudah lengkap (minimal 6 nilai)
  const isReadyForPleno = (c: any) => {
    if (isAnnounced(c)) return false;
    return Number(c.exam_score_count ?? 0) >= 6;
  };

  const isProsesSeleksi = (c: any) => {
    return !isAnnounced(c) && !isReadyForPleno(c);
  };

  const getKategoriBelumLengkap = (c: any): "belum_pilih_jadwal" | "menunggu_penilaian" => {
    if (c.kategori_belum_lengkap) return c.kategori_belum_lengkap;
    // Aturan: Jika belum pilih jadwal atau ada tahapan belum terjadwal, prioritaskan belum_pilih_jadwal
    if (!c.has_jadwal || ["submitted", "docs_verified", "registered", "data_completed"].includes(c.status_pendaftaran)) {
      return "belum_pilih_jadwal";
    }
    return "menunggu_penilaian";
  };

  const isMemenuhiKKM = (c: any) => {
    if (c.pengumuman?.status_kelulusan === "Menunggu Rapat") return false;

    const nu = c.nilai_ujian;
    const total = Number(nu?.nilai_total ?? 0);
    const quran = nu?.score_quran != null ? Number(nu.score_quran) : null;
    const hafalan = nu?.score_hafalan != null ? Number(nu.score_hafalan) : null;
    const arab = nu?.score_arab != null ? Number(nu.score_arab) : null;

    // 1. Total nilai akhir wajib mencapai KKM (>= 75 / Grade A atau B)
    if (total < KKM_STANDAR) return false;

    // 2. Al-Qur'an mutlak minimal Grade B (>= 75).
    // Jika Grade C (< 75), D (< 70), atau E -> Di bawah standar nilai, wajib dirapatkan tim!
    if (quran != null && quran < KKM_STANDAR) return false;

    // 3. Khusus jenjang MA/SMA: Hafalan dan Bahasa Arab juga minimal Grade B (>= 75)
    const isMA = (c.jenjang || "").toUpperCase() === "MA" || (c.jenjang || "").toUpperCase() === "SMA";
    if (isMA) {
      if (hafalan != null && hafalan < KKM_STANDAR) return false;
      if (arab != null && arab < KKM_STANDAR) return false;
    }

    return true;
  };

  const getRekomendasiDetail = (c: any) => {
    const nu = c.nilai_ujian;
    const total = nu?.nilai_total != null ? Number(nu.nilai_total) : 0;
    const grade = total >= 85 ? "A" : total >= 75 ? "B" : total >= 60 ? "C" : "D";
    const quran = nu?.score_quran != null ? Number(nu.score_quran) : null;
    const quranGrade = quran != null ? (quran >= 85 ? "A" : quran >= 75 ? "B" : quran >= 70 ? "C" : "D") : null;
    const hafalan = nu?.score_hafalan != null ? Number(nu.score_hafalan) : null;
    const arab = nu?.score_arab != null ? Number(nu.score_arab) : null;
    const isMA = (c.jenjang || "").toUpperCase() === "MA" || (c.jenjang || "").toUpperCase() === "SMA";

    if (c.pengumuman?.status_kelulusan === "Menunggu Rapat") {
      return {
        badgeText: "Diagendakan Rapat",
        subText: "Menunggu Keputusan Tim Pleno",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Users,
      };
    }

    // 1. Al-Qur'an Kurang (Grade D/E < 70)
    if (quran != null && quran < 70) {
      return {
        badgeText: "Perlu Dirapatkan Tim",
        subText: `Al-Qur'an Kurang (Grade ${quranGrade} / ${quran.toFixed(0)})`,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Gavel,
      };
    }

    // 2. Al-Qur'an Grade C (70-74.99 - Di bawah standar minimal B)
    if (quran != null && quran < KKM_STANDAR) {
      return {
        badgeText: "Perlu Dirapatkan Tim",
        subText: `Al-Qur'an Bersyarat (Grade C / ${quran.toFixed(0)})`,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Gavel,
      };
    }

    // 3. Khusus MA: Hafalan / Bahasa Arab di bawah KKM (< 75)
    if (isMA) {
      if (hafalan != null && hafalan < KKM_STANDAR) {
        return {
          badgeText: "Perlu Dirapatkan Tim",
          subText: `Hafalan di Bawah KKM (${hafalan.toFixed(0)})`,
          badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Gavel,
        };
      }
      if (arab != null && arab < KKM_STANDAR) {
        return {
          badgeText: "Perlu Dirapatkan Tim",
          subText: `Bahasa Arab di Bawah KKM (${arab.toFixed(0)})`,
          badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Gavel,
        };
      }
    }

    // 4. Total di bawah KKM (< 75)
    if (total < KKM_STANDAR) {
      return {
        badgeText: "Perlu Dirapatkan Tim",
        subText: `Total di Bawah KKM ${KKM_STANDAR}`,
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Gavel,
      };
    }

    // 5. Memenuhi KKM Murni (Total >= 75 dan Al-Qur'an >= 75 / Minimal Grade B)
    return {
      badgeText: "Rekomendasi: Diterima",
      subText: `Lolos KKM ${KKM_STANDAR}`,
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Sparkles,
    };
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

  const countMenungguPenilaian = useMemo(
    () => statsProses.filter((c) => getKategoriBelumLengkap(c) === "menunggu_penilaian").length,
    [statsProses]
  );
  const countBelumPilihJadwal = useMemo(
    () => statsProses.filter((c) => getKategoriBelumLengkap(c) === "belum_pilih_jadwal").length,
    [statsProses]
  );

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
      let list = statsProses;
      if (prosesFilter === "menunggu_penilaian") {
        list = list.filter((c) => getKategoriBelumLengkap(c) === "menunggu_penilaian");
      } else if (prosesFilter === "belum_pilih_jadwal") {
        list = list.filter((c) => getKategoriBelumLengkap(c) === "belum_pilih_jadwal");
      }
      return list;
    }
  }, [statsReady, statsAnnounced, statsProses, activeTab, plenoFilter, announcedFilter, prosesFilter]);

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
      `${ids.length} santri yang lolos standar KKM (≥ ${KKM_STANDAR} & Al-Qur'an min. Grade B) berhasil dipilih. Silakan klik tombol 'Diterima (${ids.length})' untuk proses SK.`,
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

  // Helper deteksi jenjang SMA / MA langsung (tanpa IL)
  const isJenjangTanpaIL = (jenjang?: string | null): boolean => {
    if (!jenjang) return false;
    const clean = jenjang.trim().toUpperCase();
    if (clean === "IL" || clean === "I'DAD LUGHAWI" || clean === "IDAD") {
      return false;
    }
    if (
      clean.includes("NON-IL") ||
      clean.includes("NON IL") ||
      clean.includes("TANPA IL") ||
      clean === "MA" ||
      clean === "SMA" ||
      clean.startsWith("MA ") ||
      clean.startsWith("SMA ") ||
      clean.includes("ALIYAH") ||
      clean.includes("SLTA")
    ) {
      return true;
    }
    return false;
  };

  const getComponentGrade = (score: number | null | undefined, type: string): string => {
    if (score == null) return "-";
    let s = Number(score);
    if (s > 0 && s <= 5) s = s * 20;

    if (type === "quran" || type === "hafalan" || type === "arab") {
      return s >= 85 ? "A" : s >= 75 ? "B" : s >= 70 ? "C" : s >= 40 ? "D" : "E";
    } else if (type === "akademik") {
      return s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : s >= 30 ? "D" : "E";
    } else if (type === "kepribadian") {
      return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
    } else if (type.startsWith("wawancara")) {
      return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
    } else if (type === "kesiapan") {
      return s >= 75 ? "A" : s >= 55 ? "B" : s >= 40 ? "C" : s >= 25 ? "D" : "E";
    } else {
      return s >= 80 ? "A" : s >= 65 ? "B" : "C";
    }
  };

  const formatScoreWithGrade = (score: number | null | undefined, type: string): string => {
    if (score == null) return "-";
    let s = Number(score);
    if (s > 0 && s <= 5) s = s * 20;
    const grade = getComponentGrade(s, type);
    return `${s.toFixed(1)} (${grade})`;
  };

  const getExaminerName = (
    c: any,
    componentKey: "quran" | "wawancara_santri" | "wawancara_ortu" | "hafalan" | "arab"
  ): string => {
    if (c?.examiner_info?.[componentKey]?.name && c.examiner_info[componentKey].name !== "-") {
      return c.examiner_info[componentKey].name;
    }
    const nu = c?.nilai_ujian;
    const ju = c?.jadwal_ujian;
    const juList = Array.isArray(ju) ? ju : ju ? [ju] : [];

    if (componentKey === "quran") {
      return (
        nu?.detail_quran?.nama_penguji ||
        nu?.detail_quran?.penguji ||
        nu?.detail_quran?.nama ||
        nu?.input_by_quran_profile?.full_name ||
        juList.find((x: any) => x.penguji_quran?.full_name)?.penguji_quran?.full_name ||
        "-"
      );
    } else if (componentKey === "wawancara_santri") {
      return (
        nu?.detail_wawancara?.nama_pewawancara ||
        nu?.detail_wawancara?.nama_penguji ||
        nu?.detail_wawancara?.pewawancara ||
        nu?.detail_wawancara?.penguji ||
        nu?.input_by_santri_profile?.full_name ||
        juList.find((x: any) => x.penguji_santri?.full_name)?.penguji_santri?.full_name ||
        "-"
      );
    } else if (componentKey === "wawancara_ortu") {
      return (
        nu?.detail_cawalsan?.nama_pewawancara ||
        nu?.detail_cawalsan?.nama_penguji ||
        nu?.detail_cawalsan?.pewawancara ||
        nu?.detail_cawalsan?.penguji ||
        nu?.input_by_ortu_profile?.full_name ||
        juList.find((x: any) => x.penguji_ortu?.full_name)?.penguji_ortu?.full_name ||
        "-"
      );
    } else if (componentKey === "hafalan") {
      return (
        nu?.detail_hafalan?.nama_penguji ||
        nu?.detail_hafalan?.penguji ||
        nu?.input_by_hafalan_profile?.full_name ||
        juList.find((x: any) => x.penguji_hafalan?.full_name)?.penguji_hafalan?.full_name ||
        "-"
      );
    } else if (componentKey === "arab") {
      return (
        nu?.detail_arab?.nama_penguji ||
        nu?.detail_lisan_arab?.nama_penguji ||
        nu?.detail_arab?.penguji ||
        nu?.input_by_arab_profile?.full_name ||
        juList.find((x: any) => x.penguji_arab?.full_name)?.penguji_arab?.full_name ||
        "-"
      );
    }
    return "-";
  };

  const getExaminerNotes = (
    c: any,
    componentKey: "quran" | "wawancara_santri" | "wawancara_ortu" | "hafalan" | "arab"
  ): string => {
    if (c?.examiner_info?.[componentKey]?.notes && c.examiner_info[componentKey].notes !== "-") {
      return c.examiner_info[componentKey].notes;
    }
    const nu = c?.nilai_ujian;
    if (componentKey === "quran") {
      return nu?.catatan_quran || nu?.detail_quran?.catatan || "-";
    } else if (componentKey === "wawancara_santri") {
      return nu?.catatan_santri || nu?.detail_wawancara?.catatan || "-";
    } else if (componentKey === "wawancara_ortu") {
      return nu?.catatan_ortu || nu?.detail_cawalsan?.catatan || "-";
    } else if (componentKey === "hafalan") {
      return nu?.catatan_hafalan || nu?.detail_hafalan?.catatan_tambahan || "-";
    } else if (componentKey === "arab") {
      return nu?.catatan_arab || nu?.detail_arab?.catatan_tambahan || "-";
    }
    return "-";
  };

  const getExaminerRecommendation = (
    c: any,
    componentKey: "quran" | "wawancara_santri" | "wawancara_ortu" | "hafalan" | "arab"
  ): string => {
    if (c?.examiner_info?.[componentKey]?.recommendation && c.examiner_info[componentKey].recommendation !== "-") {
      return c.examiner_info[componentKey].recommendation;
    }
    const nu = c?.nilai_ujian;
    if (componentKey === "quran") {
      return nu?.detail_quran?.rekomendasi || "-";
    } else if (componentKey === "wawancara_santri") {
      return nu?.detail_wawancara?.rekomendasi || "-";
    } else if (componentKey === "wawancara_ortu") {
      return nu?.detail_cawalsan?.rekomendasi || "-";
    } else if (componentKey === "hafalan") {
      return nu?.detail_hafalan?.rekomendasi || "-";
    } else if (componentKey === "arab") {
      return nu?.detail_arab?.rekomendasi || nu?.detail_lisan_arab?.rekomendasi || "-";
    }
    return "-";
  };

  const handleExportExcel = async () => {
    if (!filteredCandidates.length) {
      toast.error("Tidak ada data santri untuk diekspor");
      return;
    }

    try {
      setIsExporting(true);
      const tabTitle =
        activeTab === "siap_pleno"
          ? "REKAPITULASI CALON SANTRI SIAP RAPAT PLENO PPDB"
          : activeTab === "sudah_diumumkan"
            ? "REKAPITULASI PENETAPAN KELULUSAN SANTRI PPDB"
            : "REKAPITULASI SANTRI PROSES SELEKSI PPDB";

      // Cek apakah terdapat santri jenjang SMA/MA langsung (tanpa IL)
      const hasMACandidates = filteredCandidates.some((c) => isJenjangTanpaIL(c.jenjang));

      const header = [
        "No",
        "No. Pendaftaran",
        "Nama Lengkap",
        "Jenjang",
        "Akademik",
        "Kepribadian",
        "Kesiapan",
        "Al-Qur'an",
        "Penguji Al-Qur'an",
        "Rekomendasi Al-Qur'an",
        "Catatan Al-Qur'an",
        "Wawancara Calsan",
        "Pewawancara Calsan",
        "Rekomendasi Calsan",
        "Catatan Calsan",
        "Wawancara Cawalsan",
        "Pewawancara Cawalsan",
        "Rekomendasi Cawalsan",
        "Catatan Cawalsan",
        ...(hasMACandidates
          ? [
              "Hafalan",
              "Penguji Hafalan",
              "Rekomendasi Hafalan",
              "Catatan Hafalan",
              "Bahasa Arab",
              "Penguji B. Arab",
              "Rekomendasi B. Arab",
              "Catatan B. Arab",
            ]
          : []),
        "Total Skor",
        "Grade",
        "Rekomendasi / Keputusan",
        "Kelengkapan",
      ];

      const rows = filteredCandidates.map((c, idx) => {
        const nu = c.nilai_ujian;
        const total = nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : "-";
        const grade =
          nu?.nilai_total != null
            ? Number(nu.nilai_total) >= 85
              ? "A"
              : Number(nu.nilai_total) >= 75
                ? "B"
                : Number(nu.nilai_total) >= 60
                  ? "C"
                  : "D"
            : "-";
        const ws = nu?.nilai_wawancara_santri ?? nu?.score_wawancara;
        const wo = nu?.nilai_wawancara_ortu;

        let statusText = "-";
        if (activeTab === "siap_pleno") {
          const rek = getRekomendasiDetail(c);
          statusText = `${rek.badgeText} - ${rek.subText}`;
        } else if (activeTab === "sudah_diumumkan") {
          statusText = c.status_pendaftaran?.toUpperCase() || c.pengumuman?.status_kelulusan || "DITERBITKAN";
        } else {
          statusText =
            getKategoriBelumLengkap(c) === "belum_pilih_jadwal"
              ? "Belum Pilih Jadwal"
              : "Menunggu Penilaian Penguji";
        }

        const isCandidateMA = isJenjangTanpaIL(c.jenjang);

        return [
          idx + 1,
          c.nomor_pendaftaran || "-",
          (c.nama_lengkap || "").toUpperCase(),
          c.jenjang || "-",
          formatScoreWithGrade(nu?.score_akademik, "akademik"),
          formatScoreWithGrade(nu?.score_kepribadian, "kepribadian"),
          formatScoreWithGrade(nu?.score_kesiapan, "kesiapan"),
          formatScoreWithGrade(nu?.score_quran, "quran"),
          getExaminerName(c, "quran"),
          getExaminerRecommendation(c, "quran"),
          getExaminerNotes(c, "quran"),
          formatScoreWithGrade(ws, "wawancara_santri"),
          getExaminerName(c, "wawancara_santri"),
          getExaminerRecommendation(c, "wawancara_santri"),
          getExaminerNotes(c, "wawancara_santri"),
          formatScoreWithGrade(wo, "wawancara_ortu"),
          getExaminerName(c, "wawancara_ortu"),
          getExaminerRecommendation(c, "wawancara_ortu"),
          getExaminerNotes(c, "wawancara_ortu"),
          ...(hasMACandidates
            ? [
                isCandidateMA ? formatScoreWithGrade(nu?.score_hafalan, "hafalan") : "-",
                isCandidateMA ? getExaminerName(c, "hafalan") : "-",
                isCandidateMA ? getExaminerRecommendation(c, "hafalan") : "-",
                isCandidateMA ? getExaminerNotes(c, "hafalan") : "-",
                isCandidateMA ? formatScoreWithGrade(nu?.score_arab, "arab") : "-",
                isCandidateMA ? getExaminerName(c, "arab") : "-",
                isCandidateMA ? getExaminerRecommendation(c, "arab") : "-",
                isCandidateMA ? getExaminerNotes(c, "arab") : "-",
              ]
            : []),
          total,
          grade,
          statusText,
          `${c.exam_score_count ?? 0}/6 Nilai`,
        ];
      });

      // Sheet 2: Khusus fokus pada Catatan Penguji & Pewawancara untuk Rapat Pleno
      const headerCatatan = [
        "No",
        "No. Pendaftaran",
        "Nama Lengkap",
        "Jenjang",
        "Total Skor",
        "Grade",
        "Rekomendasi / Keputusan",
        "Penguji Al-Qur'an",
        "Rekomendasi Penguji Al-Qur'an",
        "Catatan Penguji Al-Qur'an",
        "Pewawancara Calsan",
        "Rekomendasi Pewawancara Calsan",
        "Catatan Pewawancara Calsan",
        "Pewawancara Cawalsan",
        "Rekomendasi Pewawancara Cawalsan",
        "Catatan Pewawancara Cawalsan",
        ...(hasMACandidates
          ? [
              "Penguji Hafalan",
              "Rekomendasi Penguji Hafalan",
              "Catatan Penguji Hafalan",
              "Penguji Bahasa Arab",
              "Rekomendasi Penguji Bahasa Arab",
              "Catatan Penguji Bahasa Arab",
            ]
          : []),
      ];

      const rowsCatatan = filteredCandidates.map((c, idx) => {
        const nu = c.nilai_ujian;
        const total = nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : "-";
        const grade =
          nu?.nilai_total != null
            ? Number(nu.nilai_total) >= 85
              ? "A"
              : Number(nu.nilai_total) >= 75
                ? "B"
                : Number(nu.nilai_total) >= 60
                  ? "C"
                  : "D"
            : "-";

        let statusText = "-";
        if (activeTab === "siap_pleno") {
          const rek = getRekomendasiDetail(c);
          statusText = `${rek.badgeText} - ${rek.subText}`;
        } else if (activeTab === "sudah_diumumkan") {
          statusText = c.status_pendaftaran?.toUpperCase() || c.pengumuman?.status_kelulusan || "DITERBITKAN";
        } else {
          statusText =
            getKategoriBelumLengkap(c) === "belum_pilih_jadwal"
              ? "Belum Pilih Jadwal"
              : "Menunggu Penilaian Penguji";
        }

        const isCandidateMA = isJenjangTanpaIL(c.jenjang);

        return [
          idx + 1,
          c.nomor_pendaftaran || "-",
          (c.nama_lengkap || "").toUpperCase(),
          c.jenjang || "-",
          total,
          grade,
          statusText,
          getExaminerName(c, "quran"),
          getExaminerRecommendation(c, "quran"),
          getExaminerNotes(c, "quran"),
          getExaminerName(c, "wawancara_santri"),
          getExaminerRecommendation(c, "wawancara_santri"),
          getExaminerNotes(c, "wawancara_santri"),
          getExaminerName(c, "wawancara_ortu"),
          getExaminerRecommendation(c, "wawancara_ortu"),
          getExaminerNotes(c, "wawancara_ortu"),
          ...(hasMACandidates
            ? [
                isCandidateMA ? getExaminerName(c, "hafalan") : "-",
                isCandidateMA ? getExaminerRecommendation(c, "hafalan") : "-",
                isCandidateMA ? getExaminerNotes(c, "hafalan") : "-",
                isCandidateMA ? getExaminerName(c, "arab") : "-",
                isCandidateMA ? getExaminerRecommendation(c, "arab") : "-",
                isCandidateMA ? getExaminerNotes(c, "arab") : "-",
              ]
            : []),
        ];
      });

      await exportToExcelProfessional({
        fileName: `Rekap_${activeTab}_${new Date().toISOString().split("T")[0]}`,
        sheets: [
          {
            name: "Rekap Nilai & Penguji",
            title: tabTitle,
            subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Total: ${filteredCandidates.length} Santri`,
            header,
            data: rows,
          },
          {
            name: "Catatan Rapat Pleno",
            title: "CATATAN & EVALUASI PENGUJI UNTUK RAPAT PLENO PPDB",
            subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Total: ${filteredCandidates.length} Santri`,
            header: headerCatatan,
            data: rowsCatatan,
          },
        ],
      });
      toast.success("File Excel berhasil diunduh dengan rincian nama penguji & catatan lengkap!");
    } catch (e: any) {
      console.error(e);
      toast.error("Gagal mengekspor data ke Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!filteredCandidates.length) {
      toast.error("Tidak ada data santri untuk diekspor");
      return;
    }

    try {
      const tabTitle =
        activeTab === "siap_pleno"
          ? "REKAPITULASI CALON SANTRI SIAP RAPAT PLENO PPDB"
          : activeTab === "sudah_diumumkan"
            ? "REKAPITULASI PENETAPAN KELULUSAN SANTRI PPDB"
            : "REKAPITULASI SANTRI PROSES SELEKSI PPDB";

      const hasMACandidates = filteredCandidates.some((c) => isJenjangTanpaIL(c.jenjang));

      const columns = [
        "No",
        "No. Pendaftaran",
        "Nama Lengkap",
        "Jenjang",
        "Akademik",
        "Kepribadian",
        "Kesiapan",
        "Al-Qur'an",
        "W. Calsan",
        "W. Cawalsan",
        ...(hasMACandidates ? ["Hafalan", "B. Arab"] : []),
        "Total",
        "Grade",
        "Status / Rekomendasi",
      ];

      const data = filteredCandidates.map((c, idx) => {
        const nu = c.nilai_ujian;
        const total = nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(1) : "-";
        const grade =
          nu?.nilai_total != null
            ? Number(nu.nilai_total) >= 85
              ? "A"
              : Number(nu.nilai_total) >= 75
                ? "B"
                : Number(nu.nilai_total) >= 60
                  ? "C"
                  : "D"
            : "-";
        const ws = nu?.nilai_wawancara_santri ?? nu?.score_wawancara;
        const wo = nu?.nilai_wawancara_ortu;

        let statusText = "-";
        if (activeTab === "siap_pleno") {
          const rek = getRekomendasiDetail(c);
          statusText = rek.badgeText;
        } else if (activeTab === "sudah_diumumkan") {
          statusText = c.status_pendaftaran?.toUpperCase() || "DITERBITKAN";
        } else {
          statusText =
            getKategoriBelumLengkap(c) === "belum_pilih_jadwal" ? "Belum Jadwal" : "Menunggu Nilai";
        }

        const isCandidateMA = isJenjangTanpaIL(c.jenjang);

        return [
          String(idx + 1),
          c.nomor_pendaftaran || "-",
          (c.nama_lengkap || "").substring(0, 20),
          c.jenjang || "-",
          formatScoreWithGrade(nu?.score_akademik, "akademik"),
          formatScoreWithGrade(nu?.score_kepribadian, "kepribadian"),
          formatScoreWithGrade(nu?.score_kesiapan, "kesiapan"),
          formatScoreWithGrade(nu?.score_quran, "quran"),
          formatScoreWithGrade(ws, "wawancara_santri"),
          formatScoreWithGrade(wo, "wawancara_ortu"),
          ...(hasMACandidates
            ? [
                isCandidateMA ? formatScoreWithGrade(nu?.score_hafalan, "hafalan") : "-",
                isCandidateMA ? formatScoreWithGrade(nu?.score_arab, "arab") : "-",
              ]
            : []),
          total,
          grade,
          statusText,
        ];
      });

      const pdfDetailTable = {
        title: "DETAIL CATATAN PENGUJI & EVALUASI SELEKSI (RAPAT PLENO PPDB)",
        columns: [
          "No",
          "No. Daftar",
          "Nama Lengkap",
          "Rekomendasi",
          "Al-Qur'an (Penguji & Catatan)",
          "W. Calsan (Pewawancara & Catatan)",
          "W. Cawalsan (Pewawancara & Catatan)",
          ...(hasMACandidates ? ["Hafalan & B. Arab"] : []),
        ],
        data: filteredCandidates.map((c, idx) => {
          const isCandidateMA = isJenjangTanpaIL(c.jenjang);

          const rek = getRekomendasiDetail(c);
          const quranRec = getExaminerRecommendation(c, "quran");
          const quranNote = `${getExaminerName(c, "quran")}${quranRec !== "-" ? ` [Rek: ${quranRec}]` : ""}\n"${getExaminerNotes(c, "quran")}"`;

          const wsRec = getExaminerRecommendation(c, "wawancara_santri");
          const wsNote = `${getExaminerName(c, "wawancara_santri")}${wsRec !== "-" ? ` [Rek: ${wsRec}]` : ""}\n"${getExaminerNotes(c, "wawancara_santri")}"`;

          const woRec = getExaminerRecommendation(c, "wawancara_ortu");
          const woNote = `${getExaminerName(c, "wawancara_ortu")}${woRec !== "-" ? ` [Rek: ${woRec}]` : ""}\n"${getExaminerNotes(c, "wawancara_ortu")}"`;

          const hafalanRec = getExaminerRecommendation(c, "hafalan");
          const arabRec = getExaminerRecommendation(c, "arab");
          const maNotes = isCandidateMA
            ? `Hafalan (${getExaminerName(c, "hafalan")}${hafalanRec !== "-" ? ` [Rek: ${hafalanRec}]` : ""}): "${getExaminerNotes(c, "hafalan")}"\nArab (${getExaminerName(c, "arab")}${arabRec !== "-" ? ` [Rek: ${arabRec}]` : ""}): "${getExaminerNotes(c, "arab")}"`
            : "-";

          return [
            String(idx + 1),
            c.nomor_pendaftaran || "-",
            (c.nama_lengkap || "").substring(0, 22),
            rek.badgeText,
            quranNote,
            wsNote,
            woNote,
            ...(hasMACandidates ? [maNotes] : []),
          ];
        }),
      };

      exportToPDF(
        tabTitle,
        columns,
        data,
        `Rekap_${activeTab}_${new Date().toISOString().split("T")[0]}`,
        "landscape",
        pdfDetailTable
      );
      toast.success("File PDF berhasil diunduh lengkap dengan catatan penguji!");
    } catch (e: any) {
      console.error(e);
      toast.error("Gagal mengekspor data ke PDF");
    }
  };

  const getGradeBadge = (
    score: number | null | undefined,
    type: string,
    label?: string,
    showMissingPlaceholder?: boolean
  ) => {
    if (score == null) {
      if (!showMissingPlaceholder) return null;
      return (
        <span
          key={type}
          title={`${label || type}: Belum Dinilai / Belum Ada`}
          className="border border-dashed border-stone-300 text-stone-400 bg-stone-50 text-[9px] font-bold w-5 h-5 rounded-full inline-flex items-center justify-center uppercase shrink-0 cursor-help"
        >
          -
        </span>
      );
    }
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

      {/* 2B. TAB CONTENT: PROCESS & INCOMPLETE TEST MONITORING BANNER (PROSES SELEKSI) */}
      {activeTab === "proses_seleksi" && (
        <div className="bg-gradient-to-r from-stone-50 via-amber-50/30 to-purple-50/20 p-6 rounded-2xl border border-stone-200/90 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-stone-800 text-white rounded-xl shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <span>Monitoring Santri Belum Lengkap Seleksi</span>
                  <span className="bg-stone-200 text-stone-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Tahapan Ujian Belum Selesai
                  </span>
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Santri dalam daftar ini dipisahkan dari agenda rapat pleno penetapan kelulusan karena belum memiliki 6 nilai lengkap.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* 1. Menunggu Penilaian Penguji */}
            <div
              onClick={() => setProsesFilter(prosesFilter === "menunggu_penilaian" ? "all" : "menunggu_penilaian")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                prosesFilter === "menunggu_penilaian"
                  ? "bg-amber-100/90 border-amber-300 ring-2 ring-amber-500"
                  : "bg-white/90 hover:bg-amber-50/50 border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
                  <span>🕒</span> Menunggu Penilaian Penguji
                </span>
                <span className="text-lg font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {countMenungguPenilaian} Santri
                </span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                Santri sudah memiliki jadwal atau sedang ujian, namun penguji/pewawancara belum selesai menginput semua komponen nilai.
              </p>
            </div>

            {/* 2. Belum Pilih Jadwal Seleksi */}
            <div
              onClick={() => setProsesFilter(prosesFilter === "belum_pilih_jadwal" ? "all" : "belum_pilih_jadwal")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                prosesFilter === "belum_pilih_jadwal"
                  ? "bg-purple-100/90 border-purple-300 ring-2 ring-purple-500"
                  : "bg-white/90 hover:bg-purple-50/50 border-purple-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-purple-900 uppercase flex items-center gap-1.5">
                  <span>📅</span> Belum Pilih Jadwal Seleksi
                </span>
                <span className="text-lg font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {countBelumPilihJadwal} Santri
                </span>
              </div>
              <p className="text-xs text-purple-800/90 leading-relaxed font-medium">
                Santri belum memilih jadwal ujian seleksi atau ada tahapan seleksi yang belum dijadwalkan oleh panitia.
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

          {activeTab === "proses_seleksi" && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setProsesFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  prosesFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Semua ({statsProses.length})
              </button>
              <button
                onClick={() => setProsesFilter("menunggu_penilaian")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  prosesFilter === "menunggu_penilaian"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                🕒 Menunggu Penilaian ({countMenungguPenilaian})
              </button>
              <button
                onClick={() => setProsesFilter("belum_pilih_jadwal")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  prosesFilter === "belum_pilih_jadwal"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-purple-700 hover:bg-purple-50"
                }`}
              >
                📅 Belum Pilih Jadwal ({countBelumPilihJadwal})
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-primary-500 focus-within:bg-white transition-all w-full sm:w-56">
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

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredCandidates.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              title="Ekspor daftar santri saat ini ke Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Mengekspor..." : "Excel"}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || filteredCandidates.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              title="Ekspor daftar santri saat ini ke PDF (.pdf)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
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
                            {getGradeBadge(nu?.score_akademik, "akademik", "Akademik", activeTab === "proses_seleksi")}
                            {getGradeBadge(nu?.score_kepribadian, "kepribadian", "Kepribadian", activeTab === "proses_seleksi")}
                            {getGradeBadge(nu?.score_kesiapan, "kesiapan", "Kesiapan", activeTab === "proses_seleksi")}
                            {getGradeBadge(nu?.score_quran, "quran", "Al-Qur'an", activeTab === "proses_seleksi")}
                            {getGradeBadge(ws, "wawancara_santri", "W. Calsan", activeTab === "proses_seleksi")}
                            {getGradeBadge(wo, "wawancara_ortu", "W. Cawalsan", activeTab === "proses_seleksi")}
                            {isJenjangTanpaIL(c.jenjang) &&
                              getGradeBadge(nu?.score_hafalan, "hafalan", "Hafalan", activeTab === "proses_seleksi")}
                            {isJenjangTanpaIL(c.jenjang) &&
                              getGradeBadge(nu?.score_arab, "arab", "B. Arab", activeTab === "proses_seleksi")}
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

                          <button
                            type="button"
                            onClick={() => setSelectedNotesCandidate(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 rounded-full text-[10px] font-bold transition-all shadow-2xs cursor-pointer group"
                            title="Lihat Nama Penguji & Catatan Evaluasi Rapat"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span>Catatan &amp; Penguji</span>
                          </button>
                        </div>

                        {activeTab === "proses_seleksi" && getKategoriBelumLengkap(c) === "menunggu_penilaian" && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMissingCandidate(c)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer group"
                              title="Klik untuk melihat komponen nilai apa saja yang belum diinput dan kontak pengujinya"
                            >
                              <span className="text-amber-600">⚠️</span>
                              <span>Belum Input: <strong>{(c.missing_components?.length || (6 - (c.exam_score_count || 0)))} Komponen</strong></span>
                              <span className="text-amber-700 underline text-[10px] group-hover:text-amber-950 font-semibold ml-0.5">
                                Cek &amp; Kontak Penguji ↗
                              </span>
                            </button>
                          </div>
                        )}

                        {activeTab === "proses_seleksi" && getKategoriBelumLengkap(c) === "belum_pilih_jadwal" && (
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              Belum Memilih Jadwal
                            </span>
                          </div>
                        )}
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
                            {(() => {
                              const rek = getRekomendasiDetail(c);
                              const IconComponent = rek.icon;
                              return (
                                <>
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase whitespace-nowrap shadow-xs border ${rek.badgeClass}`}>
                                    <IconComponent className="w-3.5 h-3.5" />
                                    {rek.badgeText}
                                  </span>
                                  <span className="text-[10px] text-stone-600 font-bold">
                                    {rek.subText}
                                  </span>
                                </>
                              );
                            })()}
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
                        ) : activeTab === "proses_seleksi" ? (
                          <div className="flex flex-col items-center gap-1.5">
                            {getKategoriBelumLengkap(c) === "menunggu_penilaian" ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  Menunggu Penilaian ({c.exam_score_count ?? 0}/6)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedMissingCandidate(c)}
                                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Search className="w-3 h-3" />
                                  <span>Rincian &amp; Kontak Penguji</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black uppercase whitespace-nowrap shadow-xs">
                                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                                  Belum Pilih Jadwal
                                </span>
                                <span className="text-[10px] text-purple-700 font-bold">
                                  Perlu Floating Jadwal
                                </span>
                              </>
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
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {getKategoriBelumLengkap(c) === "menunggu_penilaian" ? (
                                <>
                                  {/* 1. Tombol Cek Rincian Nilai */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedMissingCandidate(c)}
                                    title="Lihat komponen nilai apa saja yang belum diinput & kontak pengujinya"
                                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Search className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Cek Nilai</span>
                                  </button>

                                  {/* 2. Tombol Hubungi WA Penguji */}
                                  {(() => {
                                    const missingWithPhone = (c.missing_components || []).filter(
                                      (m: any) => m.penguji_phone
                                    );
                                    if (missingWithPhone.length === 1) {
                                      return (
                                        <a
                                          href={getWAExaminerUrl(c, missingWithPhone[0])}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={`Hubungi WA ${missingWithPhone[0].penguji_name || "Penguji"} (${missingWithPhone[0].name})`}
                                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          <span>WA Penguji</span>
                                        </a>
                                      );
                                    } else if (missingWithPhone.length > 1) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedMissingCandidate(c)}
                                          title={`Ada ${missingWithPhone.length} penguji yang dapat dihubungi. Klik untuk pilih penguji.`}
                                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          <span>WA Penguji ({missingWithPhone.length})</span>
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}

                                  {/* 3. Tombol Buka Input Nilai */}
                                  <a
                                    href={`/dashboard/admin/penilaian?search=${encodeURIComponent(c.nomor_pendaftaran)}`}
                                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    title="Buka form input nilai ujian penguji / admin"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                                    <span>Input Nilai ↗</span>
                                  </a>
                                </>
                              ) : (
                                <>
                                  {/* 1. Tombol Hubungi WA Pendaftar / Wali */}
                                  {c.wali_phone || c.no_hp ? (
                                    <a
                                      href={getWACandidateUrl(c)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Ingatkan ${c.wali_name || "Wali Santri"} via WhatsApp untuk memilih jadwal seleksi`}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>WA Pendaftar</span>
                                    </a>
                                  ) : (
                                    <span
                                      title="Nomor telepon wali tidak ditemukan di data pendaftar"
                                      className="px-2 py-1.5 bg-stone-100 text-stone-400 rounded-xl text-xs font-medium cursor-not-allowed"
                                    >
                                      WA Tidak Ada
                                    </span>
                                  )}

                                  {/* 2. Tombol Arahkan Langsung ke Manajemen Jadwal (Floating / Plotting) */}
                                  <a
                                    href={`/dashboard/admin/jadwal/plotting?tab=plotting&filter=butuh&search=${encodeURIComponent(
                                      c.nomor_pendaftaran
                                    )}`}
                                    title="Arahkan langsung ke Manajemen Jadwal bagian Floating untuk aturkan jadwal santri ini"
                                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Floating Jadwal ↗</span>
                                  </a>
                                </>
                              )}
                            </div>
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

      {/* Modal Detail Komponen Nilai Belum Input & Kontak Penguji */}
      {selectedMissingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-inner">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight">
                    Rincian Komponen Nilai Seleksi
                  </h3>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">
                    {toTitleCase(selectedMissingCandidate.nama_lengkap)} • {selectedMissingCandidate.nomor_pendaftaran} ({selectedMissingCandidate.jenjang})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMissingCandidate(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Status Banner */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold text-amber-950">
                    Progres Penilaian: {selectedMissingCandidate.exam_score_count || 0} dari {selectedMissingCandidate.jenjang === "MA" || selectedMissingCandidate.jenjang === "SMA" ? 8 : 6} Komponen Terisi
                  </div>
                  <div className="text-amber-800/90 mt-0.5 font-medium">
                    Santri ini belum dapat diplenokan karena masih menunggu penginputan nilai. Anda dapat langsung menghubungi Penguji / Pewawancara yang bersangkutan via WhatsApp di bawah ini.
                  </div>
                </div>
              </div>

              {/* List Komponen */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-stone-600 uppercase tracking-wider">
                  Status Per Komponen Ujian &amp; Kontak Penguji
                </h4>

                {(() => {
                  const c = selectedMissingCandidate;
                  const nu = c.nilai_ujian;
                  const j = c.jadwal_ujian;
                  const ws = nu?.nilai_wawancara_santri ?? nu?.score_wawancara;
                  const isMA = isJenjangTanpaIL(c.jenjang) || nu?.score_hafalan != null || nu?.score_arab != null;

                  const components = [
                    {
                      key: "akademik",
                      name: "CBT Potensi Akademik",
                      score: nu?.score_akademik,
                      type: "sistem",
                      desc: "Dikerjakan santri secara online melalui aplikasi CBT.",
                    },
                    {
                      key: "kepribadian",
                      name: "Tes Kepribadian / Minat Bakat",
                      score: nu?.score_kepribadian,
                      type: "sistem",
                      desc: "Kuesioner psikologi santri melalui sistem.",
                    },
                    {
                      key: "kesiapan",
                      name: "Tes Kesiapan & Kemandirian Santri",
                      score: nu?.score_kesiapan,
                      type: "sistem",
                      desc: "Evaluasi kesiapan santri tinggal di asrama.",
                    },
                    {
                      key: "quran",
                      name: "Tes Bacaan Al-Qur'an",
                      score: nu?.score_quran,
                      type: "penguji",
                      penguji_name: j?.penguji_quran?.full_name || null,
                      penguji_phone: j?.penguji_quran?.phone || null,
                      role_label: "Penguji Al-Qur'an",
                    },
                    {
                      key: "wawancara_santri",
                      name: "Wawancara Calon Santri (Calsan)",
                      score: ws,
                      type: "penguji",
                      penguji_name: j?.penguji_santri?.full_name || null,
                      penguji_phone: j?.penguji_santri?.phone || null,
                      role_label: "Pewawancara Santri",
                    },
                    {
                      key: "wawancara_ortu",
                      name: "Wawancara Orang Tua / Wali (Cawalsan)",
                      score: nu?.nilai_wawancara_ortu,
                      type: "penguji",
                      penguji_name: j?.penguji_ortu?.full_name || null,
                      penguji_phone: j?.penguji_ortu?.phone || null,
                      role_label: "Pewawancara Orang Tua",
                    },
                  ];

                  if (isMA) {
                    components.push({
                      key: "hafalan",
                      name: "Tes Hafalan Al-Qur'an",
                      score: nu?.score_hafalan,
                      type: "penguji",
                      penguji_name: j?.penguji_hafalan?.full_name || null,
                      penguji_phone: j?.penguji_hafalan?.phone || null,
                      role_label: "Penguji Hafalan Al-Qur'an",
                    });
                    components.push({
                      key: "arab",
                      name: "Tes Lisan Bahasa Arab",
                      score: nu?.score_arab,
                      type: "penguji",
                      penguji_name: j?.penguji_arab?.full_name || null,
                      penguji_phone: j?.penguji_arab?.phone || null,
                      role_label: "Penguji Lisan Bahasa Arab",
                    });
                  }

                  return components.map((comp) => {
                    const hasScore = comp.score != null;
                    const waUrl = !hasScore && comp.type === "penguji" ? getWAExaminerUrl(c, comp) : "";

                    return (
                      <div
                        key={comp.key}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          hasScore
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white border-stone-200 shadow-xs hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            hasScore ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                          }`}>
                            {hasScore ? "✓" : "—"}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                              <span>{comp.name}</span>
                              {hasScore ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                                  Skor: {Number(comp.score).toFixed(1)}
                                </span>
                              ) : (
                                <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                                  Belum Diinput
                                </span>
                              )}
                            </div>

                            {comp.type === "penguji" ? (
                              <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-semibold text-stone-700">
                                  {comp.role_label}:
                                </span>
                                <span>
                                  {comp.penguji_name ? (
                                    <strong className="text-stone-800">{comp.penguji_name}</strong>
                                  ) : (
                                    <em className="text-stone-400">Belum ditugaskan di jadwal</em>
                                  )}
                                </span>
                                {comp.penguji_phone && (
                                  <span className="text-stone-400 font-mono text-[10px]">
                                    ({comp.penguji_phone})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-stone-500 mt-1">
                                <em>{comp.desc}</em>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action per component */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!hasScore && comp.type === "penguji" && (
                            comp.penguji_phone ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                title={`Kirim pesan WhatsApp pengingat nilai ke ${comp.penguji_name}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Hubungi WA Penguji</span>
                              </a>
                            ) : (
                              <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
                                No WA Penguji Belum Ada
                              </span>
                            )
                          )}
                          {hasScore && (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Selesai</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Hubungi Wali Santri Info Box */}
              {(selectedMissingCandidate.wali_phone || selectedMissingCandidate.no_hp) && (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-stone-800">Kontak Wali Santri: </span>
                    <span className="text-stone-600">
                      {selectedMissingCandidate.wali_name || "Wali Santri"} ({selectedMissingCandidate.wali_phone || selectedMissingCandidate.no_hp})
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/${formatPhoneForWA(selectedMissingCandidate.wali_phone || selectedMissingCandidate.no_hp)}?text=${encodeURIComponent(
                      `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${selectedMissingCandidate.wali_name || "Bapak/Ibu Wali Santri"} dari calon santri ananda ${selectedMissingCandidate.nama_lengkap} (${selectedMissingCandidate.nomor_pendaftaran}).\n\nKami dari Panitia PPDB menginformasikan bahwa proses penilaian seleksi ananda saat ini sedang dalam rekapitulasi akhir panitia. Jika ada berkas atau konfirmasi yang dibutuhkan, kami akan menghubungi Bapak/Ibu kembali.\n\nTerima kasih atas kesabarannya.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-stone-200 hover:bg-emerald-100 hover:text-emerald-800 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat Wali</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <a
                href={`/dashboard/admin/penilaian?search=${encodeURIComponent(selectedMissingCandidate.nomor_pendaftaran)}`}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Form Penilaian Penguji / Admin ↗</span>
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMissingCandidate(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Catatan & Penguji Evaluasi (Rapat Pleno) */}
      {selectedNotesCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <MessageSquare className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-tight">
                    Catatan &amp; Evaluasi Penguji
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    {toTitleCase(selectedNotesCandidate.nama_lengkap)} • {selectedNotesCandidate.nomor_pendaftaran} ({selectedNotesCandidate.jenjang})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotesCandidate(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Summary Bar */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Skor</span>
                  <span className="text-lg font-black text-stone-900">
                    {selectedNotesCandidate.nilai_ujian?.nilai_total != null ? Number(selectedNotesCandidate.nilai_ujian.nilai_total).toFixed(2) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Grade</span>
                  <span className="text-lg font-black text-stone-900">
                    {selectedNotesCandidate.nilai_ujian?.nilai_total != null
                      ? Number(selectedNotesCandidate.nilai_ujian.nilai_total) >= 85 ? "A" : Number(selectedNotesCandidate.nilai_ujian.nilai_total) >= 75 ? "B" : Number(selectedNotesCandidate.nilai_ujian.nilai_total) >= 60 ? "C" : "D"
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Rekomendasi</span>
                  <span className="text-xs font-black text-stone-800">
                    {getRekomendasiDetail(selectedNotesCandidate).badgeText}
                  </span>
                </div>
              </div>

              {/* Catatan Al-Qur'an */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Tes Al-Qur&apos;an</h4>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {getExaminerRecommendation(selectedNotesCandidate, "quran") !== "-" && (
                      <span className="text-[11px] font-bold text-emerald-900 bg-emerald-200/90 px-2 py-0.5 rounded-md border border-emerald-300">
                        Rekomendasi: {getExaminerRecommendation(selectedNotesCandidate, "quran")}
                      </span>
                    )}
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Nilai: {formatScoreWithGrade(selectedNotesCandidate.nilai_ujian?.score_quran, "quran")}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-700">
                  <span className="font-bold text-stone-500">Penguji: </span>
                  <span className="font-semibold text-stone-900">{getExaminerName(selectedNotesCandidate, "quran")}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs text-stone-800 italic leading-relaxed">
                  &ldquo;{getExaminerNotes(selectedNotesCandidate, "quran")}&rdquo;
                </div>
              </div>

              {/* Catatan Wawancara Calsan */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">Wawancara Calon Santri</h4>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {getExaminerRecommendation(selectedNotesCandidate, "wawancara_santri") !== "-" && (
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-200/90 px-2 py-0.5 rounded-md border border-blue-300">
                        Rekomendasi: {getExaminerRecommendation(selectedNotesCandidate, "wawancara_santri")}
                      </span>
                    )}
                    <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                      Nilai: {formatScoreWithGrade(selectedNotesCandidate.nilai_ujian?.nilai_wawancara_santri ?? selectedNotesCandidate.nilai_ujian?.score_wawancara, "wawancara_santri")}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-700">
                  <span className="font-bold text-stone-500">Pewawancara: </span>
                  <span className="font-semibold text-stone-900">{getExaminerName(selectedNotesCandidate, "wawancara_santri")}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 text-xs text-stone-800 italic leading-relaxed">
                  &ldquo;{getExaminerNotes(selectedNotesCandidate, "wawancara_santri")}&rdquo;
                </div>
              </div>

              {/* Catatan Wawancara Cawalsan */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">Wawancara Calon Wali Santri</h4>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {getExaminerRecommendation(selectedNotesCandidate, "wawancara_ortu") !== "-" && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300">
                        Rekomendasi: {getExaminerRecommendation(selectedNotesCandidate, "wawancara_ortu")}
                      </span>
                    )}
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Nilai: {formatScoreWithGrade(selectedNotesCandidate.nilai_ujian?.nilai_wawancara_ortu, "wawancara_ortu")}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-stone-700">
                  <span className="font-bold text-stone-500">Pewawancara: </span>
                  <span className="font-semibold text-stone-900">{getExaminerName(selectedNotesCandidate, "wawancara_ortu")}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-100 text-xs text-stone-800 italic leading-relaxed">
                  &ldquo;{getExaminerNotes(selectedNotesCandidate, "wawancara_ortu")}&rdquo;
                </div>
              </div>

              {/* Catatan Hafalan (khusus SMA/MA langsung tanpa IL) */}
              {isJenjangTanpaIL(selectedNotesCandidate.jenjang) && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider">Tes Hafalan</h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {getExaminerRecommendation(selectedNotesCandidate, "hafalan") !== "-" && (
                        <span className="text-[11px] font-bold text-teal-900 bg-teal-200/90 px-2 py-0.5 rounded-md border border-teal-300">
                          Rekomendasi: {getExaminerRecommendation(selectedNotesCandidate, "hafalan")}
                        </span>
                      )}
                      <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                        Nilai: {formatScoreWithGrade(selectedNotesCandidate.nilai_ujian?.score_hafalan, "hafalan")}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-stone-500">Penguji: </span>
                    <span className="font-semibold text-stone-900">{getExaminerName(selectedNotesCandidate, "hafalan")}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-teal-100 text-xs text-stone-800 italic leading-relaxed">
                    &ldquo;{getExaminerNotes(selectedNotesCandidate, "hafalan")}&rdquo;
                  </div>
                </div>
              )}

              {/* Catatan Bahasa Arab (khusus SMA/MA langsung tanpa IL) */}
              {isJenjangTanpaIL(selectedNotesCandidate.jenjang) && (
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">Tes Bahasa Arab</h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {getExaminerRecommendation(selectedNotesCandidate, "arab") !== "-" && (
                        <span className="text-[11px] font-bold text-sky-900 bg-sky-200/90 px-2 py-0.5 rounded-md border border-sky-300">
                          Rekomendasi: {getExaminerRecommendation(selectedNotesCandidate, "arab")}
                        </span>
                      )}
                      <span className="text-xs font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                        Nilai: {formatScoreWithGrade(selectedNotesCandidate.nilai_ujian?.score_arab, "arab")}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-stone-500">Penguji: </span>
                    <span className="font-semibold text-stone-900">{getExaminerName(selectedNotesCandidate, "arab")}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100 text-xs text-stone-800 italic leading-relaxed">
                    &ldquo;{getExaminerNotes(selectedNotesCandidate, "arab")}&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedNotesCandidate(null)}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
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
