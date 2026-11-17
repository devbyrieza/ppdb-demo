"use client";

"use client";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardEdit,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  MessageSquare,
  RefreshCcw,
  Search,
  Send,
  Share2,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { exportToExcelProfessional, exportToPDF } from "@/lib/utils/export";

// Removed basic xlsx imports in favor of professional utility

// Simplified type for MVP.
type Student = {
  id: string;
  status_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  nomor_pendaftaran: string;
  nilai_ujian?: {
    nilai_total: number;
    status_kelulusan: string;
    catatan_kelulusan: string;
    score_quran: number;
    score_hafalan?: number;
    score_arab?: number;
    score_wawancara: number;
    nilai_wawancara_santri: number;
    score_akademik: number;
    score_kepribadian: number;
    score_kesiapan: number;
    nilai_wawancara_ortu: number;
    detail_akademik?: any;
  };
  whatsapp_status?: {
    status: string;
    updated_at: string;
    error_message?: string;
  } | null;
};

export default function ExaminerDashboard() {
  const [activeTab, setActiveTab] = useState<"data" | "system">("data");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminSuper, setIsAdminSuper] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedExaminerId, setSelectedExaminerId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);
  const [assignType, setAssignType] = useState<"quran" | "wawancara_santri" | "wawancara_ortu">(
    "quran"
  );
  const [assignExaminerId, setAssignExaminerId] = useState("");

  // Form State for Modal
  const [inputType, setInputType] = useState<"quran" | "wawancara_santri" | "wawancara_ortu">(
    "quran"
  );

  // Dedicated Sub-form States
  const [quranForm, setQuranForm] = useState({ tajwid: "", kelancaran: "" });
  const [wsForm, setWsForm] = useState({
    motivasi: "",
    lingkungan: "",
    permainan: "",
    teman: "",
    rokok: "",
    pornografi: "",
    hobi: "",
  });
  const [woForm, setWoForm] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: "",
    q9: "",
    q10: "",
  });
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [queueStats, setQueueStats] = useState<{
    pending: number;
    sent: number;
    failed: number;
  } | null>(null);
  const [flushProgress, setFlushProgress] = useState(0);
  const [taList, setTaList] = useState<{ id: string; nama: string; is_active: boolean }[]>([]);
  const [selectedTa, setSelectedTa] = useState<string>("");

  useEffect(() => {
    checkUserRole();
    fetchTahunAjaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data saat filter tahun ajaran berubah
  useEffect(() => {
    if (selectedTa) fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTa]);

  const checkUserRole = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data?.session) {
          setCurrentUserId(data.session.id || "");
          setCurrentUserName(data.session.full_name || data.session.name || "Admin");
          const roles = [
            data.session.role,
            ...(data.availableRoles || []),
            ...(data.session.secondary_roles || []),
          ].map((r: string) => (r || "").toLowerCase());

          if (roles.some((r: string) => ["admin_super", "admin", "head_of_it"].includes(r))) {
            setIsAdminSuper(true);
            fetchUsers();
          }
        }
      }
    } catch (e) {
      console.error("Error checking session:", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        const staff = (json.data || []).filter((u: any) => u.role !== "pendaftar");
        setUsersList(staff);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch("/api/admin/tahun-ajaran");
      const json = await res.json();
      const list: { id: string; nama: string; is_active: boolean }[] = json.data || [];
      setTaList(list);
      // Default: tahun ajaran TERBARU (API urut tahun_mulai desc)
      setSelectedTa(list.length > 0 ? list[0].id : "all");
    } catch (e) {
      console.error("Error fetching tahun ajaran:", e);
      setSelectedTa("all");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const taParam = selectedTa ? "&tahun_ajaran=" + encodeURIComponent(selectedTa) : "";
      const res = await fetch("/api/admin/pendaftar/list?limit=500" + taParam);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setStudents(json.data || []);

      // Also fetch stats from cron result (using same secret)
      const statsRes = await fetch("/api/cron/whatsapp?secret=ppdb-alimam-cron-2026");
      const statsJson = await statsRes.json();
      if (statsJson.stats?.queue) {
        setQueueStats({
          pending: statsJson.stats.queue.pending || 0,
          sent: statsJson.stats.queue.sent || 0,
          failed: statsJson.stats.queue.failed || 0,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInput = (
    student: Student,
    type: "quran" | "wawancara_santri" | "wawancara_ortu"
  ) => {
    setSelectedStudent(student);
    setInputType(type);
    setQuranForm({ tajwid: "", kelancaran: "" });
    setWsForm({
      motivasi: "",
      lingkungan: "",
      permainan: "",
      teman: "",
      rokok: "",
      pornografi: "",
      hobi: "",
    });
    setWoForm({
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      q6: "",
      q7: "",
      q8: "",
      q9: "",
      q10: "",
    });
    setCatatan("");
    // Default to current logged-in admin
    setSelectedExaminerId(currentUserId || "");
  };

  const handleSubmitScore = async () => {
    if (!selectedStudent) return;

    const effectiveExaminerId = selectedExaminerId || currentUserId;
    if (isAdminSuper && !effectiveExaminerId) {
      Swal.fire("Peringatan", "Silakan pilih Penguji/Pewawancara terlebih dahulu", "warning");
      return;
    }

    if (!catatan || !catatan.trim()) {
      Swal.fire("Peringatan", "Catatan / Komentar penguji wajib diisi sebelum menyimpan nilai.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalScore = 0;
      let detailData: any = { catatan };

      if (inputType === "quran") {
        finalScore = (Number(quranForm.tajwid) + Number(quranForm.kelancaran)) / 2;
        detailData = { ...detailData, ...quranForm, quran: quranForm };
      } else if (inputType === "wawancara_santri") {
        const sum = Object.values(wsForm).reduce((acc, val) => acc + Number(val || 0), 0);
        finalScore = (sum / 35) * 100;
        detailData = { ...detailData, ...wsForm, calsan: wsForm };
      } else if (inputType === "wawancara_ortu") {
        let total = 0;
        let counted = 0;
        Object.values(woForm).forEach((val) => {
          if (val === "A") {
            total += 100;
            counted++;
          } else if (val === "B") {
            total += 75;
            counted++;
          } else if (val === "C") {
            total += 50;
            counted++;
          }
        });
        finalScore = counted > 0 ? total / counted : 0;
        detailData = { ...detailData, ...woForm, cawalsan: woForm };
      }

      const payload = {
        pendaftar_id: selectedStudent.id,
        type: inputType,
        score: finalScore,
        details: detailData,
        examiner_id: effectiveExaminerId || currentUserId || "admin-system",
      };

      const res = await fetch("/api/penilaian/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resJson.error || "Gagal menyimpan nilai");
      }

      Swal.fire("Sukses", "Nilai berhasil disimpan", "success");
      setSelectedStudent(null);
      fetchStudents();
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", error.message || "Gagal menyimpan nilai", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlushQueue = async () => {
    try {
      const currentPending = queueStats?.pending || 0;
      if (currentPending === 0) {
        Swal.fire("Info", "Tidak ada antrean yang perlu diproses", "info");
        return;
      }

      setIsProcessingQueue(true);
      setFlushProgress(0);

      let processedInLoop = 0;
      // Limit to max 50 per manual trigger to prevent timeout
      const maxToProcess = Math.min(currentPending, 50);

      for (let i = 0; i < maxToProcess; i++) {
        try {
          const res = await fetch("/api/cron/whatsapp?secret=ppdb-alimam-cron-2026");
          if (!res.ok) break;

          const data = await res.json();
          if (!data?.result?.processed) break;

          processedInLoop++;
          setFlushProgress(Math.round(((i + 1) / maxToProcess) * 100));

          // Small delay to prevent rate limit issues
          await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          console.warn("Individual flush failed:", err);
          break;
        }
      }

      Swal.fire({
        title: "Antrean Diproses",
        text: `${processedInLoop} pesan telah dikirim ke Wablas.`,
        icon: "success",
      });
      fetchStudents();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memproses antrean", "error");
    } finally {
      setIsProcessingQueue(false);
      setFlushProgress(0);
    }
  };

  const handleOpenAssignDialog = (student: Student) => {
    setAssignStudent(student);
    setAssignType("quran");
    try {
      const da = student.nilai_ujian?.detail_akademik;
      const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
      if (parsedDa?.assigned_examiners?.quran) {
        setAssignExaminerId(parsedDa.assigned_examiners.quran);
      } else {
        setAssignExaminerId("");
      }
    } catch (e) {
      setAssignExaminerId("");
    }
  };

  const handleAssignTypeChange = (
    type: "quran" | "wawancara_santri" | "wawancara_ortu",
    student: Student
  ) => {
    setAssignType(type);
    try {
      const da = student.nilai_ujian?.detail_akademik;
      const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
      if (parsedDa?.assigned_examiners?.[type]) {
        setAssignExaminerId(parsedDa.assigned_examiners[type]);
      } else {
        setAssignExaminerId("");
      }
    } catch (e) {
      setAssignExaminerId("");
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignStudent) return;
    try {
      const res = await fetch("/api/penilaian/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: assignStudent.id,
          type: assignType,
          examiner_id: assignExaminerId,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Penugasan penguji berhasil diperbarui", "success");
        setAssignStudent(null);
        fetchStudents();
      } else {
        const err = await res.json();
        Swal.fire("Gagal", err.error || "Gagal memperbarui penugasan", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
    }
  };

  const handleOpenSkipDialog = async (student: Student) => {
    let currentSkipped: string[] = [];
    try {
      const da = student.nilai_ujian?.detail_akademik;
      const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
      if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
        currentSkipped = parsedDa.skipped_stages;
      }
    } catch (e) {
      console.error(e);
    }

    const stages = [
      { id: "QURAN", label: "Al-Qur'an (Bobot 30%)" },
      { id: "AKADEMIK", label: "Akademik (Bobot 30%)" },
      { id: "WAWANCARA_SANTRI", label: "Wawancara Calon Santri (Bobot 10%)" },
      { id: "WAWANCARA_ORTU", label: "Wawancara Orang Tua (Bobot 10%)" },
      { id: "KEPRIBADIAN", label: "Kepribadian (Bobot 10%)" },
      { id: "KESIAPAN", label: "Kesiapan (Bobot 10%)" },
    ];

    const checkboxesHtml = stages
      .map(
        (stg) => `
        <div style="display: flex; align-items: center; margin-bottom: 12px; font-family: sans-serif; text-align: left;">
          <input type="checkbox" id="skip_stage_${stg.id}" value="${stg.id}" ${
            currentSkipped.includes(stg.id) ? "checked" : ""
          } style="width: 18px; height: 18px; cursor: pointer; accent-color: #f59e0b; margin-right: 10px;" />
          <label for="skip_stage_${stg.id}" style="font-size: 14px; font-weight: 600; cursor: pointer; color: #1f2937;">
            ${stg.label}
          </label>
        </div>
      `
      )
      .join("");

    const result = await Swal.fire({
      title: `<span style="font-family: sans-serif; font-size: 18px; font-weight: 800; color: #b45309;">BYPASS / SKIP SELEKSI</span>`,
      html: `
        <p style="font-family: sans-serif; font-size: 13px; color: #4b5563; margin-bottom: 20px; text-align: left; line-height: 1.5;">
          Pilih tahapan seleksi yang ingin dilewati (bypass/skip) untuk <strong>${student.nama_lengkap.toUpperCase()}</strong>. Tahap yang di-skip akan otomatis lulus dengan grade A dan tidak dihitung dalam pembobotan nilai akhir.
        </p>
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 8px;">
          ${checkboxesHtml}
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      confirmButtonText: "Simpan Konfigurasi",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const selected: string[] = [];
        stages.forEach((stg) => {
          const checkbox = document.getElementById(`skip_stage_${stg.id}`) as HTMLInputElement;
          if (checkbox && checkbox.checked) {
            selected.push(stg.id);
          }
        });
        return selected;
      },
    });

    if (result.isConfirmed) {
      const skipped_stages = result.value || [];
      try {
        Swal.fire({
          title: "Memproses...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await fetch("/api/penilaian/skip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pendaftar_id: student.id,
            skipped_stages,
          }),
        });

        if (!res.ok) {
          const errorJson = await res.json();
          throw new Error(errorJson.error || "Gagal menyimpan konfigurasi skip");
        }

        Swal.fire({
          title: "Sukses!",
          text: "Konfigurasi bypass berhasil disimpan dan nilai telah dikalkulasi ulang.",
          icon: "success",
        });

        fetchStudents();
      } catch (err: any) {
        console.error(err);
        Swal.fire("Error", err.message || "Gagal menyimpan konfigurasi skip", "error");
      }
    }
  };

  const filteredStudents = (students || []).filter((s) => {
    const name = (s?.nama_lengkap || "").toLowerCase();
    const regNum = (s?.nomor_pendaftaran || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    return name.includes(query) || regNum.includes(query);
  });

  const handleExportExcel = async () => {
    if (!students?.length) {
      return Swal.fire("Info", "Tidak ada data santri untuk diekspor", "info");
    }

    try {
      setIsExporting(true);

      const isJenjangTanpaIL = (jenjang?: string | null): boolean => {
        if (!jenjang) return false;
        const clean = jenjang.trim().toUpperCase();
        if (clean === "IL" || clean === "I'DAD LUGHAWI" || clean === "IDAD") return false;
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

      const getGrade = (score: number | undefined | null, type: string) => {
        if (score == null) return "-";
        let s = Number(score);
        if (s > 0 && s <= 5) s = s * 20;
        if (type === "quran" || type === "hafalan" || type === "arab") {
          return s >= 85 ? "A" : s >= 75 ? "B" : s >= 70 ? "C" : s >= 40 ? "D" : "E";
        }
        if (type === "akademik") {
          return s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : s >= 30 ? "D" : "E";
        }
        if (type === "kepribadian") {
          return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
        }
        if (type.startsWith("wawancara")) {
          return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
        }
        if (type === "kesiapan") {
          return s >= 75 ? "A" : s >= 55 ? "B" : s >= 40 ? "C" : s >= 25 ? "D" : "E";
        }
        return s >= 80 ? "A" : s >= 65 ? "B" : "C";
      };

      const formatScoreWithGrade = (score: number | undefined | null, type: string) => {
        if (score == null) return "-";
        let s = Number(score);
        if (s > 0 && s <= 5) s = s * 20;
        const grade = getGrade(s, type);
        return `${s.toFixed(1)} (${grade})`;
      };

      const hasMACandidates = students.some(
        (s) =>
          isJenjangTanpaIL(s.jenjang) ||
          s.nilai_ujian?.score_hafalan != null ||
          s.nilai_ujian?.score_arab != null
      );

      const formatStudentForExport = (s: Student) => {
        const ws = s?.nilai_ujian?.nilai_wawancara_santri ?? (s?.nilai_ujian as any)?.score_wawancara;
        const wo = s?.nilai_ujian?.nilai_wawancara_ortu;

        let examStatus = s?.nilai_ujian?.status_kelulusan;
        const pendaftaranStatus = (s?.status_pendaftaran || "").toUpperCase();
        if (
          [
            "ACCEPTED",
            "ENROLLED",
            "ENROLLED_FULL",
            "DITERIMA",
            "PROSES_DAFTAR_ULANG",
            "LUNAS_DAFTAR_ULANG",
          ].includes(pendaftaranStatus)
        ) {
          examStatus = "DITERIMA";
        }

        const totalNum = s?.nilai_ujian?.nilai_total != null ? Number(s.nilai_ujian.nilai_total) : null;
        const totalScore = totalNum != null ? totalNum.toFixed(2) : "-";
        const totalGrade =
          totalNum != null
            ? totalNum >= 85
              ? "A"
              : totalNum >= 75
                ? "B"
                : totalNum >= 60
                  ? "C"
                  : "D"
            : "-";

        const isCandidateMA =
          isJenjangTanpaIL(s.jenjang) ||
          s.nilai_ujian?.score_hafalan != null ||
          s.nilai_ujian?.score_arab != null;

        return [
          s?.nomor_pendaftaran || "-",
          (s?.nama_lengkap || "").toUpperCase(),
          s?.jenjang || "-",
          formatScoreWithGrade(s?.nilai_ujian?.score_akademik, "akademik"),
          formatScoreWithGrade(s?.nilai_ujian?.score_kepribadian, "kepribadian"),
          formatScoreWithGrade(s?.nilai_ujian?.score_kesiapan, "kesiapan"),
          formatScoreWithGrade(s?.nilai_ujian?.score_quran, "quran"),
          formatScoreWithGrade(ws, "wawancara_santri"),
          formatScoreWithGrade(wo, "wawancara_ortu"),
          ...(hasMACandidates
            ? [
                isCandidateMA ? formatScoreWithGrade(s?.nilai_ujian?.score_hafalan, "hafalan") : "-",
                isCandidateMA ? formatScoreWithGrade(s?.nilai_ujian?.score_arab, "arab") : "-",
              ]
            : []),
          totalScore,
          totalGrade,
          examStatus || "BELUM LENGKAP",
        ];
      };

      const header = [
        "No. Pendaftaran",
        "Nama Santri",
        "Jenjang",
        "Akademik",
        "Kepribadian",
        "Kesiapan",
        "Al-Qur'an",
        "Wawancara Calsan",
        "Wawancara Cawalsan",
        ...(hasMACandidates ? ["Hafalan", "Bahasa Arab"] : []),
        "Total Skor",
        "Grade",
        "Keputusan",
      ];

      // Grouping by Jenjang
      const jenjangGroups: Record<string, Student[]> = {};
      students.forEach((s) => {
        const rawJ = s?.jenjang || "LAINNYA";
        const j = rawJ.replace(/[*?:\\/[\]]/g, "-").trim() || "LAINNYA";
        if (!jenjangGroups[j]) jenjangGroups[j] = [];
        jenjangGroups[j].push(s);
      });

      const sheets = [
        {
          name: "REKAP TOTAL",
          title: "REKAPITULASI HASIL SELEKSI PENDAFTAR (SEMUA JENJANG)",
          subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Total: ${students.length} Peserta`,
          header,
          data: students.map(formatStudentForExport),
        },
      ];

      // Add sheets for each Jenjang
      Object.keys(jenjangGroups)
        .sort()
        .forEach((j) => {
          sheets.push({
            name: j.substring(0, 31),
            title: `REKAPITULASI HASIL SELEKSI - ${j}`,
            subTitle: `Jenjang: ${j} | Total: ${jenjangGroups[j].length} Peserta`,
            header,
            data: jenjangGroups[j].map(formatStudentForExport),
          });
        });

      await exportToExcelProfessional({
        fileName: `Rekap_Nilai_PPDB_Professional_${new Date().toISOString().split("T")[0]}`,
        sheets,
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Data rekap penilaian berhasil diekspor ke Excel.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Export Excel error:", error);
      Swal.fire(
        "Gagal Ekspor",
        error?.message || "Terjadi kesalahan saat mengekspor data ke Excel",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!students?.length) {
      return Swal.fire("Info", "Tidak ada data santri untuk diekspor", "info");
    }

    try {
      const isJenjangTanpaIL = (jenjang?: string | null): boolean => {
        if (!jenjang) return false;
        const clean = jenjang.trim().toUpperCase();
        if (clean === "IL" || clean === "I'DAD LUGHAWI" || clean === "IDAD") return false;
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

      const getGrade = (score: number | undefined | null, type: string) => {
        if (score == null) return "-";
        let s = Number(score);
        if (s > 0 && s <= 5) s = s * 20;
        if (type === "quran" || type === "hafalan" || type === "arab") {
          return s >= 85 ? "A" : s >= 75 ? "B" : s >= 70 ? "C" : s >= 40 ? "D" : "E";
        }
        if (type === "akademik") {
          return s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : s >= 30 ? "D" : "E";
        }
        if (type === "kepribadian") {
          return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
        }
        if (type.startsWith("wawancara")) {
          return s >= 80 ? "A" : s >= 65 ? "B" : s >= 50 ? "C" : s >= 35 ? "D" : "E";
        }
        if (type === "kesiapan") {
          return s >= 75 ? "A" : s >= 55 ? "B" : s >= 40 ? "C" : s >= 25 ? "D" : "E";
        }
        return s >= 80 ? "A" : s >= 65 ? "B" : "C";
      };

      const formatScoreWithGrade = (score: number | undefined | null, type: string) => {
        if (score == null) return "-";
        let s = Number(score);
        if (s > 0 && s <= 5) s = s * 20;
        const grade = getGrade(s, type);
        return `${s.toFixed(1)} (${grade})`;
      };

      const hasMACandidates = students.some(
        (s) =>
          isJenjangTanpaIL(s.jenjang) ||
          s.nilai_ujian?.score_hafalan != null ||
          s.nilai_ujian?.score_arab != null
      );

      const columns = [
        "No",
        "No. Pendaftaran",
        "Nama Santri",
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
        "Keputusan",
      ];

      const data = students.map((s, idx) => {
        const ws = s?.nilai_ujian?.nilai_wawancara_santri ?? (s?.nilai_ujian as any)?.score_wawancara;
        const wo = s?.nilai_ujian?.nilai_wawancara_ortu;
        let examStatus = s?.nilai_ujian?.status_kelulusan;
        const pendaftaranStatus = (s?.status_pendaftaran || "").toUpperCase();
        if (["ACCEPTED", "ENROLLED", "ENROLLED_FULL", "DITERIMA"].includes(pendaftaranStatus)) {
          examStatus = "DITERIMA";
        }
        const totalNum = s?.nilai_ujian?.nilai_total != null ? Number(s.nilai_ujian.nilai_total) : null;
        const totalScore = totalNum != null ? totalNum.toFixed(1) : "-";
        const totalGrade =
          totalNum != null
            ? totalNum >= 85
              ? "A"
              : totalNum >= 75
                ? "B"
                : totalNum >= 60
                  ? "C"
                  : "D"
            : "-";

        const isCandidateMA =
          isJenjangTanpaIL(s.jenjang) ||
          s.nilai_ujian?.score_hafalan != null ||
          s.nilai_ujian?.score_arab != null;

        return [
          String(idx + 1),
          s?.nomor_pendaftaran || "-",
          (s?.nama_lengkap || "").substring(0, 18),
          s?.jenjang || "-",
          formatScoreWithGrade(s?.nilai_ujian?.score_akademik, "akademik"),
          formatScoreWithGrade(s?.nilai_ujian?.score_kepribadian, "kepribadian"),
          formatScoreWithGrade(s?.nilai_ujian?.score_kesiapan, "kesiapan"),
          formatScoreWithGrade(s?.nilai_ujian?.score_quran, "quran"),
          formatScoreWithGrade(ws, "wawancara_santri"),
          formatScoreWithGrade(wo, "wawancara_ortu"),
          ...(hasMACandidates
            ? [
                isCandidateMA ? formatScoreWithGrade(s?.nilai_ujian?.score_hafalan, "hafalan") : "-",
                isCandidateMA ? formatScoreWithGrade(s?.nilai_ujian?.score_arab, "arab") : "-",
              ]
            : []),
          totalScore,
          totalGrade,
          examStatus || "BELUM LENGKAP",
        ];
      });

      exportToPDF(
        "REKAPITULASI PENILAIAN HASIL SELEKSI PPDB",
        columns,
        data,
        `Rekap_Nilai_PPDB_${new Date().toISOString().split("T")[0]}`,
        "landscape"
      );
    } catch (e: any) {
      console.error("Export PDF error:", e);
      Swal.fire("Gagal Ekspor", "Terjadi kesalahan saat mengekspor ke PDF", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight flex items-center gap-3">
            <div className="p-4 bg-primary-600 rounded-3xl shadow-2xl">
              <ClipboardEdit className="w-6 h-6 text-white" />
            </div>
            Pusat <span className="text-primary-700">Penilaian</span>
          </h1>
          <p className="text-ink-500 font-medium mt-1">
            Kelola skor ujian dan monitoring notifikasi pendaftar.
          </p>
        </div>

        <div className="flex bg-ink-50 p-1 rounded-2xl border border-ink-100 w-fit">
          <button
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-3xl text-sm font-bold transition-all ${
              activeTab === "data"
                ? "bg-white text-primary-700 shadow-clay-sm"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Data Penilaian
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-3xl text-sm font-bold transition-all ${
              activeTab === "system"
                ? "bg-white text-primary-700 shadow-clay-sm"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            <Zap
              className={`w-4 h-4 ${queueStats?.pending ? "text-secondary-500 animate-pulse" : ""}`}
            />
            Monitoring Notifikasi
            {queueStats?.pending ? (
              <span className="bg-secondary-100 text-secondary-700 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {queueStats.pending}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      {/* BARU: Banner Akses Khusus & Share WA Bank Soal Panitia (Al-Imam Maroon & Krem Emas) */}
      <div
        style={{ background: "linear-gradient(135deg, #9D174D 0%, #500724 100%)" }}
        className="text-white p-5 sm:p-6 rounded-3xl shadow-2xl border border-[#831843]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex-shrink-0">
            <FileText className="w-6 h-6 text-[#ddc192]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ddc192]/20 text-[#ddc192] text-[10px] font-bold rounded-full border border-[#ddc192]/40 mb-1">
              <Sparkles className="w-3 h-3 text-[#ddc192]" /> AKSES & DISKUSI PANITIA SPMB 2027/2028
            </div>
            <h3 className="font-extrabold text-base text-white">
              Bank Soal & Form Penilaian Panitia
            </h3>
            <p className="text-xs text-[#ddc192]/90 max-w-xl font-medium">
              Lihat seluruh soal ujian online, durasi pengerjaan, dan rubrik penguji Al-Qur'an &
              Wawancara, atau bagikan link ke grup WhatsApp panitia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-shrink-0">
          <Link
            href="/dashboard/admin/bank-soal"
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#ddc192] text-[#9D174D] hover:bg-[#c5a775] rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all border border-[#ddc192]"
          >
            <Eye className="w-4 h-4 text-[#9D174D]" /> Lihat Bank Soal
          </Link>
          <button
            onClick={() => {
              const message = encodeURIComponent(
                `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Ustadz / Ustadzah Panitia SPMB Pesantren Al-Andalus Al-Imam,\n\nBerikut link akses khusus Bank Soal Seleksi & Form Penilaian Penguji untuk peninjauan & evaluasi TA 2027/2028:\n\n https://spmb.pesantren-alimam.com/panitia/bank-soal\n\n_Mohon bantuan ustadz/ustadzah untuk meninjau relevansi soal dan rubrik wawancara._\n\nSyukron, Jazakumullahu Khairan. `
              );
              window.open(`https://wa.me/?text=${message}`, "_blank");
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#ddc192] border border-[#ddc192]/40 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4 text-[#ddc192]" /> Bagikan ke WA Panitia
          </button>
        </div>
      </div>

      {activeTab === "data" ? (
        /* TAB 1: DATA PENILAIAN */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Filter Tahun Ajaran */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-ink-500" />
              <span className="text-sm font-black uppercase tracking-wider text-ink-600">
                Tahun Ajaran
              </span>
              <select
                value={selectedTa}
                onChange={(e) => setSelectedTa(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-ink-100 rounded-2xl text-sm font-bold text-ink-800 focus:outline-none focus:border-primary-500 shadow-sm cursor-pointer"
              >
                <option value="all">Semua Tahun Ajaran</option>
                {taList.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    {ta.nama}
                    {ta.is_active ? " (Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-ink-400 font-medium">
              Rekap & daftar mengikuti tahun ajaran terpilih (default: terbaru).
            </p>
          </div>

          {/* Header Stats (Rekap Kelulusan) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-6 rounded-3xl shadow-2xl border border-green-100 relative overflow-hidden">
              <p className="text-[#9D174D] text-sm font-bold tracking-wider uppercase mb-1">
                Total Diterima
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-[#9D174D]">
                  {
                    students.filter(
                      (c) =>
                        c.status_pendaftaran === "accepted" || c.status_pendaftaran === "enrolled"
                    ).length
                  }
                </h3>
                <span className="text-[#9D174D]/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-green-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
            <div className="bg-secondary-50 p-6 rounded-3xl shadow-2xl border border-secondary-100 relative overflow-hidden">
              <p className="text-secondary-600 text-sm font-bold tracking-wider uppercase mb-1">
                Cadangan
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-secondary-700">
                  {
                    students.filter(
                      (c) =>
                        c.status_pendaftaran === "cadangan" || c.status_pendaftaran === "announced"
                    ).length
                  }
                </h3>
                <span className="text-secondary-600/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-secondary-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
            <div className="bg-rose-50 p-6 rounded-3xl shadow-2xl border border-rose-100 relative overflow-hidden">
              <p className="text-rose-600 text-sm font-bold tracking-wider uppercase mb-1">
                Ditolak
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-rose-700">
                  {students.filter((c) => c.status_pendaftaran === "rejected").length}
                </h3>
                <span className="text-rose-600/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-rose-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
            <div className="bg-ink-50 p-6 rounded-3xl shadow-2xl border border-ink-200 relative overflow-hidden">
              <p className="text-ink-600 text-sm font-bold tracking-wider uppercase mb-1">
                Proses Penilaian
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-ink-700">
                  {
                    students.filter(
                      (c) =>
                        !["accepted", "enrolled", "cadangan", "announced", "rejected"].includes(
                          c.status_pendaftaran
                        )
                    ).length
                  }
                </h3>
                <span className="text-ink-600/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-ink-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-clay-md border border-white/40 overflow-hidden">
            <div className="p-6 border-b border-ink-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-ink-50/30">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau no. pendaftaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-ink-100 rounded-3xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none shadow-inner"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <Button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="btn-secondary flex items-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 rounded-3xl font-bold py-2 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" /> Mengekspor...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Export Excel
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="btn-secondary flex items-center gap-2 bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 rounded-3xl font-bold py-2 whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/penilaian/recalculate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          tahun_ajaran_id: selectedTa === "all" ? null : selectedTa,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed");
                      const result = await res.json();
                      Swal.fire(
                        "Sukses",
                        `${result.recalculated} data berhasil dihitung ulang`,
                        "success"
                      );
                      fetchStudents();
                    } catch {
                      Swal.fire("Error", "Gagal menghitung ulang", "error");
                    }
                  }}
                  className="btn-secondary flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 rounded-3xl font-bold py-2 whitespace-nowrap shrink-0"
                >
                  <RefreshCcw className="w-4 h-4" /> Hitung Ulang
                </Button>

                <Button
                  onClick={fetchStudents}
                  variant="outline"
                  className="rounded-3xl border-ink-200"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[1000px] divide-y divide-ink-100 max-w-full">
                <thead className="bg-ink-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      NP
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Nama Peserta
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Jenjang
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Quran
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Akademi
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Keprib.
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Sesuai
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Siap
                    </th>
                    <th className="px-3 py-4 text-center text-[10px] font-black text-primary-700 uppercase tracking-widest bg-primary-50/30">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                      Aksi Input
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-ink-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-ink-400 font-medium italic"
                      >
                        Memuat data santri...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-ink-400 font-medium italic"
                      >
                        Tidak ada data pendaftar yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-primary-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-ink-400">
                          {s.nomor_pendaftaran || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-ink-900 leading-tight">
                            {(s.nama_lengkap || "Tanpa Nama")
                              .toLowerCase()
                              .replace(
                                /\w\S*/g,
                                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                              )}
                          </p>
                          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">
                            {(s.status_pendaftaran || "").replace("_", " ")}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-ink-600 bg-ink-100 px-2 py-1 rounded-2xl">
                            {s.jenjang}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {(() => {
                            let examStatus = s.nilai_ujian?.status_kelulusan;

                            // OVERRIDE: Jika status pendaftaran menandakan tahap lanjutan, override ke DITERIMA
                            const pendaftaranStatus = (s.status_pendaftaran || "").toUpperCase();
                            if (
                              [
                                "ACCEPTED",
                                "ENROLLED",
                                "ENROLLED_FULL",
                                "DITERIMA",
                                "PROSES_DAFTAR_ULANG",
                                "LUNAS_DAFTAR_ULANG",
                              ].includes(pendaftaranStatus)
                            ) {
                              examStatus = "DITERIMA";
                            }

                            const colors: any = {
                              LULUS: "bg-green-100 text-[#9D174D] border-green-200",
                              DITERIMA: "bg-green-100 text-[#9D174D] border-green-200",
                              CADANGAN: "bg-secondary-100 text-secondary-700 border-secondary-200",
                              DITOLAK: "bg-red-100 text-red-700 border-red-200",
                              "BELUM LENGKAP": "bg-orange-100 text-orange-700 border-orange-200",
                              pending: "bg-ink-100 text-ink-500 border-ink-200",
                            };
                            const color =
                              colors[examStatus || "pending"] ||
                              "bg-ink-100 text-ink-500 border-ink-200";
                            return (
                              <span
                                className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${color}`}
                              >
                                {examStatus || "MENUNGGU"}
                              </span>
                            );
                          })()}
                        </td>
                        {/* Kolom Nilai: Quran, Akad, Keprib, Sesuai, Siap */}
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {(() => {
                            let isSkipped = false;
                            try {
                              const da = s.nilai_ujian?.detail_akademik;
                              const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                              if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                isSkipped = parsedDa.skipped_stages.includes("QURAN");
                              }
                            } catch (e) {}

                            if (isSkipped) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  SKIP
                                </span>
                              );
                            }

                            const score = s.nilai_ujian?.score_quran;
                            if (score == null) return <span className="text-ink-200">-</span>;
                            const grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
                            const color =
                              grade === "A"
                                ? "bg-green-500"
                                : grade === "B"
                                  ? "bg-sky-400"
                                  : "bg-secondary-400";
                            return (
                              <span
                                className={`${color} text-white text-[10px] font-black px-2 py-1 rounded      `}
                              >
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {(() => {
                            let isSkipped = false;
                            try {
                              const da = s.nilai_ujian?.detail_akademik;
                              const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                              if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                isSkipped = parsedDa.skipped_stages.includes("AKADEMIK");
                              }
                            } catch (e) {}

                            if (isSkipped) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  SKIP
                                </span>
                              );
                            }

                            const score = s.nilai_ujian?.score_akademik;
                            if (score == null) return <span className="text-ink-200">-</span>;
                            const grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
                            const color =
                              grade === "A"
                                ? "bg-green-500"
                                : grade === "B"
                                  ? "bg-sky-400"
                                  : "bg-secondary-400";
                            return (
                              <span
                                className={`${color} text-white text-[10px] font-black px-2 py-1 rounded      `}
                              >
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {(() => {
                            let isSkipped = false;
                            try {
                              const da = s.nilai_ujian?.detail_akademik;
                              const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                              if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                isSkipped = parsedDa.skipped_stages.includes("KEPRIBADIAN");
                              }
                            } catch (e) {}

                            if (isSkipped) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  SKIP
                                </span>
                              );
                            }

                            const score = s.nilai_ujian?.score_kepribadian;
                            if (score == null) return <span className="text-ink-200">-</span>;
                            const grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
                            const color =
                              grade === "A"
                                ? "bg-green-500"
                                : grade === "B"
                                  ? "bg-sky-400"
                                  : "bg-secondary-400";
                            return (
                              <span
                                className={`${color} text-white text-[10px] font-black px-2 py-1 rounded      `}
                              >
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {(() => {
                            let isWsSkipped = false;
                            let isWoSkipped = false;
                            try {
                              const da = s.nilai_ujian?.detail_akademik;
                              const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                              if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                isWsSkipped = parsedDa.skipped_stages.includes("WAWANCARA_SANTRI");
                                isWoSkipped = parsedDa.skipped_stages.includes("WAWANCARA_ORTU");
                              }
                            } catch (e) {}

                            if (isWsSkipped && isWoSkipped) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  SKIP
                                </span>
                              );
                            }

                            const ws = s.nilai_ujian?.nilai_wawancara_santri || 0;
                            const wo = s.nilai_ujian?.nilai_wawancara_ortu || 0;

                            if (isWsSkipped && wo === 0) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  S: SKIP
                                </span>
                              );
                            }
                            if (isWoSkipped && ws === 0) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  O: SKIP
                                </span>
                              );
                            }

                            if (ws === 0 && wo === 0)
                              return <span className="text-ink-200">-</span>;

                            const score = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;
                            const grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";
                            const color =
                              grade === "A"
                                ? "bg-green-500"
                                : grade === "B"
                                  ? "bg-sky-400"
                                  : "bg-secondary-400";
                            return (
                              <span
                                className={`${color} text-white text-[10px] font-black px-2 py-1 rounded      `}
                              >
                                {grade} {isWsSkipped ? "(S:SKIP)" : isWoSkipped ? "(O:SKIP)" : ""}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {(() => {
                            let isSkipped = false;
                            try {
                              const da = s.nilai_ujian?.detail_akademik;
                              const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                              if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                isSkipped = parsedDa.skipped_stages.includes("KESIAPAN");
                              }
                            } catch (e) {}

                            if (isSkipped) {
                              return (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded border border-amber-200 whitespace-nowrap inline-block shrink-0">
                                  SKIP
                                </span>
                              );
                            }

                            const score = s.nilai_ujian?.score_kesiapan;
                            if (score == null) return <span className="text-ink-200">-</span>;
                            const grade = score >= 75 ? "A" : score >= 55 ? "B" : "C";
                            const color =
                              grade === "A"
                                ? "bg-green-500"
                                : grade === "B"
                                  ? "bg-sky-400"
                                  : "bg-secondary-400";
                            return (
                              <span
                                className={`${color} text-white text-[10px] font-black px-2 py-1 rounded      `}
                              >
                                {grade}
                              </span>
                            );
                          })()}
                        </td>
                        {/* Total */}
                        <td className="px-3 py-4 text-center whitespace-nowrap bg-primary-50/20">
                          <span className="text-base font-black text-primary-700">
                            {s.nilai_ujian?.nilai_total != null ? (
                              Number(s.nilai_ujian.nilai_total).toFixed(2)
                            ) : (
                              <span className="text-ink-300 font-bold">-</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-1">
                            {isAdminSuper && (
                              <>
                                <button
                                  onClick={() => handleOpenSkipDialog(s)}
                                  className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-3xl text-[10px] font-black hover:bg-amber-600 transition-all shadow-2xl group-hover:scale-105"
                                >
                                  <Zap className="w-3 h-3" /> BYPASS
                                </button>
                                <button
                                  onClick={() => handleOpenAssignDialog(s)}
                                  className="flex items-center gap-1.5 bg-[#9D174D] text-white px-3 py-1.5 rounded-3xl text-[10px] font-black hover:bg-[#9D174D] transition-all shadow-2xl group-hover:scale-105"
                                >
                                  <Users className="w-3 h-3" /> PLOT
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleOpenInput(s, "quran")}
                              className="flex items-center gap-1.5 bg-ink-900 text-white px-3 py-1.5 rounded-3xl text-[10px] font-black hover:bg-primary-600 transition-all shadow-2xl group-hover:scale-105"
                            >
                              <Zap className="w-3 h-3" /> QUR&apos;AN
                            </button>
                            <button
                              onClick={() => handleOpenInput(s, "wawancara_santri")}
                              className="flex items-center gap-1.5 bg-white border border-ink-200 text-ink-700 px-3 py-1.5 rounded-3xl text-[10px] font-black hover:border-primary-600 transition-all shadow-2xl group-hover:scale-105"
                            >
                              <MessageSquare className="w-3 h-3" /> W.SANTRI
                            </button>
                            <button
                              onClick={() => handleOpenInput(s, "wawancara_ortu")}
                              className="flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-800 px-3 py-1.5 rounded-3xl text-[10px] font-black hover:border-gold-400 transition-all shadow-2xl group-hover:scale-105"
                            >
                              <MessageSquare className="w-3 h-3" /> W.ORTU
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-6 sm:p-8">
              {loading ? (
                <div className="py-12 text-center text-ink-400 font-medium italic">
                  Memuat data pendaftar...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-ink-400 font-medium italic">
                  Tidak ada data pendaftar.
                </div>
              ) : (
                filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-3xl p-5 shadow-clay-sm border border-ink-50 space-y-4"
                  >
                    {/* Header: No. Daftar + Nama + Jenjang */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-ink-400 tracking-tight">
                            {s.nomor_pendaftaran || "-"}
                          </span>
                          <span className="text-[9px] font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-2xl uppercase">
                            {s.jenjang}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-ink-900 uppercase leading-snug">
                          {(s.nama_lengkap || "Tanpa Nama")
                            .toLowerCase()
                            .replace(
                              /\w\S*/g,
                              (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                            )}
                        </h3>
                        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">
                          {(s.status_pendaftaran || "").replace("_", " ")}
                        </p>
                      </div>
                      {/* Total Badge */}
                      <div className="bg-primary-600 px-4 py-2.5 rounded-2xl text-white text-center shrink-0">
                        <p className="text-[8px] font-black opacity-70 uppercase">Total</p>
                        <p className="text-xl font-black leading-none mt-0.5">
                          {s.nilai_ujian?.nilai_total != null
                            ? Number(s.nilai_ujian.nilai_total).toFixed(2)
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Status Ujian */}
                    {(() => {
                      const examStatus = s.nilai_ujian?.status_kelulusan;
                      const colors: any = {
                        LULUS: "bg-green-100 text-[#9D174D] border-green-200",
                        DITERIMA: "bg-green-100 text-[#9D174D] border-green-200",
                        CADANGAN: "bg-secondary-100 text-secondary-700 border-secondary-200",
                        DITOLAK: "bg-red-100 text-red-700 border-red-200",
                        "BELUM LENGKAP": "bg-orange-100 text-orange-700 border-orange-200",
                        pending: "bg-ink-100 text-ink-500 border-ink-200",
                      };
                      const color =
                        colors[examStatus || "pending"] || "bg-ink-100 text-ink-500 border-ink-200";
                      return (
                        <span
                          className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full border ${color}`}
                        >
                          {examStatus || "MENUNGGU"}
                        </span>
                      );
                    })()}

                    {/* 6 Nilai Grid — 3x2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {[
                        {
                          label: "Akademik",
                          value: s.nilai_ujian?.score_akademik,
                          stageKey: "AKADEMIK",
                        },
                        {
                          label: "Kepribadian",
                          value: s.nilai_ujian?.score_kepribadian,
                          stageKey: "KEPRIBADIAN",
                        },
                        {
                          label: "Kesiapan",
                          value: s.nilai_ujian?.score_kesiapan,
                          stageKey: "KESIAPAN",
                        },
                        {
                          label: "Al-Qur'an",
                          value: s.nilai_ujian?.score_quran,
                          stageKey: "QURAN",
                        },
                        {
                          label: "W. Santri",
                          value: s.nilai_ujian?.nilai_wawancara_santri,
                          stageKey: "WAWANCARA_SANTRI",
                        },
                        {
                          label: "W. Orang Tua",
                          value: s.nilai_ujian?.nilai_wawancara_ortu,
                          stageKey: "WAWANCARA_ORTU",
                        },
                      ].map((item) => (
                        <div key={item.label} className="bg-ink-50 rounded-3xl p-4.5 text-center">
                          <p className="text-sm font-black text-ink-900 leading-none">
                            {(() => {
                              let isSkipped = false;
                              try {
                                const da = s.nilai_ujian?.detail_akademik;
                                const parsedDa = typeof da === "string" ? JSON.parse(da) : da;
                                if (parsedDa && Array.isArray(parsedDa.skipped_stages)) {
                                  isSkipped = parsedDa.skipped_stages.includes(item.stageKey);
                                }
                              } catch (e) {}

                              if (isSkipped)
                                return <span className="text-amber-600 font-bold">SKIP</span>;
                              return item.value != null ? (
                                Math.round(item.value)
                              ) : (
                                <span className="text-ink-300">-</span>
                              );
                            })()}
                          </p>
                          <p className="text-[8px] font-bold text-ink-400 uppercase tracking-wide mt-1 leading-tight">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {isAdminSuper && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 col-span-full">
                          <button
                            onClick={() => handleOpenSkipDialog(s)}
                            className="flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-2xl text-[11px] font-black shadow-2xl shadow-amber-500/20 active:scale-95 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" /> BYPASS
                          </button>
                          <button
                            onClick={() => handleOpenAssignDialog(s)}
                            className="flex items-center justify-center gap-2 bg-[#9D174D] text-white py-3 rounded-2xl text-[11px] font-black shadow-2xl active:scale-95 transition-all"
                          >
                            <Users className="w-3.5 h-3.5" /> PLOT
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleOpenInput(s, "quran")}
                        className="flex items-center justify-center gap-2 bg-ink-900 text-white py-3 rounded-2xl text-[11px] font-black shadow-2xl shadow-ink-900/10 active:scale-95 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> TES QUR&apos;AN
                      </button>
                      <button
                        onClick={() => handleOpenInput(s, "wawancara_santri")}
                        className="flex flex-col items-center justify-center bg-gold-400 text-primary-900 py-2 rounded-2xl text-[10px] sm:text-[11px] font-black shadow-2xl shadow-gold-400/20 active:scale-95 transition-all"
                      >
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> SANTRI
                        </span>
                      </button>
                      <button
                        onClick={() => handleOpenInput(s, "wawancara_ortu")}
                        className="flex flex-col items-center justify-center bg-gold-200 text-gold-900 py-2 rounded-2xl text-[10px] sm:text-[11px] font-black shadow-2xl shadow-gold-200/20 active:scale-95 transition-all"
                      >
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> ORTU
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: MONITORING NOTIFIKASI */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Progress Monitor if Processing */}
          {isProcessingQueue && (
            <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-5 md:p-8 opacity-10">
                <Send className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                  <RefreshCcw className="w-5 h-5 animate-spin" /> Sedang Mengirim Pesan...
                </h3>
                <div className="w-full bg-white/20 rounded-full h-4 mb-2">
                  <div
                    className="bg-white h-4 rounded-full transition-all duration-500"
                    style={{ width: `${flushProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-bold opacity-80">
                  {flushProgress}% Selesai. Jangan tutup halaman ini.
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
              <div className="p-6 sm:p-8 bg-secondary-50 text-secondary-600 rounded-2xl">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">
                  Antrean Pending
                </p>
                <p className="text-3xl font-black text-ink-900">{queueStats?.pending || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
              <div className="p-6 sm:p-8 bg-green-50 text-[#9D174D] rounded-2xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">
                  Berhasil Terkirim
                </p>
                <p className="text-3xl font-black text-ink-900">{queueStats?.sent || 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
              <div className="p-6 sm:p-8 bg-red-50 text-red-600 rounded-2xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">
                  Gagal / Error
                </p>
                <p className="text-3xl font-black text-ink-900">{queueStats?.failed || 0}</p>
              </div>
            </div>
          </div>

          {/* System Actions Area */}

          {/* Filter Tahun Ajaran */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-ink-500" />
              <span className="text-sm font-black uppercase tracking-wider text-ink-600">
                Tahun Ajaran
              </span>
              <select
                value={selectedTa}
                onChange={(e) => setSelectedTa(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-ink-100 rounded-2xl text-sm font-bold text-ink-800 focus:outline-none focus:border-primary-500 shadow-sm cursor-pointer"
              >
                <option value="all">Semua Tahun Ajaran</option>
                {taList.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    {ta.nama}
                    {ta.is_active ? " (Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-ink-400 font-medium">
              Rekap & daftar mengikuti tahun ajaran terpilih (default: terbaru).
            </p>
          </div>

          {/* Header Stats (Rekap Kelulusan) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-6 rounded-3xl shadow-2xl border border-green-100 relative overflow-hidden">
              <p className="text-[#9D174D] text-sm font-bold tracking-wider uppercase mb-1">
                Total Diterima
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-[#9D174D]">
                  {
                    students.filter(
                      (c) =>
                        c.status_pendaftaran === "accepted" || c.status_pendaftaran === "enrolled"
                    ).length
                  }
                </h3>
                <span className="text-[#9D174D]/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-green-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
            <div className="bg-secondary-50 p-6 rounded-3xl shadow-2xl border border-secondary-100 relative overflow-hidden">
              <p className="text-secondary-600 text-sm font-bold tracking-wider uppercase mb-1">
                Cadangan
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-secondary-700">
                  {
                    students.filter(
                      (c) =>
                        c.status_pendaftaran === "cadangan" || c.status_pendaftaran === "announced"
                    ).length
                  }
                </h3>
                <span className="text-secondary-600/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-secondary-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
            <div className="bg-rose-50 p-6 rounded-3xl shadow-2xl border border-rose-100 relative overflow-hidden">
              <p className="text-rose-600 text-sm font-bold tracking-wider uppercase mb-1">
                Ditolak
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl md:text-4xl font-black text-rose-700">
                  {students.filter((c) => c.status_pendaftaran === "rejected").length}
                </h3>
                <span className="text-rose-600/70 font-medium mb-1 pl-1">Santri</span>
              </div>
              <div className="absolute -right-4 -bottom-4 bg-rose-200/50 w-24 h-24 rounded-full blur-xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-clay-md border border-white/40 overflow-hidden">
            <div className="p-5 md:p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-ink-50 rounded-2xl">
                  <LayoutDashboard className="w-6 h-6 text-ink-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink-900 leading-tight">
                    Kontrol Notifikasi Sistem
                  </h2>
                  <p className="text-sm font-medium text-ink-400">
                    Jalankan proses batch notifikasi secara manual di sini.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div className="p-6 bg-primary-50/30 rounded-3xl border border-primary-100/50 hover:bg-primary-50 transition-colors">
                  <h4 className="font-black text-primary-900 mb-2">Broadcast Jadwal Seleksi</h4>
                  <p className="text-xs text-primary-700/70 mb-6 font-medium leading-relaxed">
                    Sistem akan memindai pendaftar yang sudah terverifikasi berkasnya tapi belum
                    memiliki jadwal, lalu memasukkannya ke antrean notifikasi.
                  </p>
                  <Button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: "Siarkan Jadwal?",
                        text: `Sistem akan mencari pendaftar layak yang belum diberi notifikasi jadwal.`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#2563eb",
                        confirmButtonText: "Ya, Siarkan!",
                        cancelButtonText: "Batal",
                      });
                      if (result.isConfirmed) {
                        try {
                          setIsBroadcasting(true);
                          const res = await fetch(
                            "/api/admin/notifications/broadcast-availability",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ reset_flags: false }),
                            }
                          );
                          if (!res.ok) throw new Error("Failed");
                          const data = await res.json();
                          Swal.fire(
                            "Berhasil",
                            `${data.count || 0} pendaftar masuk antrean.`,
                            "success"
                          );
                          fetchStudents();
                        } catch (error) {
                          console.error(error);
                          Swal.fire("Error", "Gagal memproses broadcast", "error");
                        } finally {
                          setIsBroadcasting(false);
                        }
                      }
                    }}
                    disabled={isBroadcasting}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-6 font-black text-base shadow-2xl"
                  >
                    {isBroadcasting ? "Memproses..." : "Siarkan Jadwal Sekarang"}
                  </Button>
                </div>

                <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                  <h4 className="font-black text-[#9D174D] mb-2">Kirim Paksa Antrean (Flush)</h4>
                  <p className="text-xs text-[#9D174D]/70 mb-6 font-medium leading-relaxed">
                    Jalankan pemicu manual untuk mengirim pesan yang sedang tertahan di antrean ke
                    server provider WhatsApp (Wablas).
                  </p>
                  <Button
                    onClick={handleFlushQueue}
                    disabled={isProcessingQueue || !queueStats?.pending}
                    className="w-full bg-[#9D174D] hover:bg-[#9D174D] text-white rounded-2xl py-6 font-black text-base shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {isProcessingQueue
                      ? `Mengirim (${flushProgress}%)...`
                      : "Kirim Seluruh Antrean"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal for Assign Examiner (PLOT) */}
      {assignStudent &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-hidden"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
              onClick={() => setAssignStudent(null)}
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-ink-100 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
              {/* Header (Sticky at top) */}
              <div className="px-6 py-4 sm:py-5 border-b border-ink-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                    <Users className="w-5 h-5 font-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-ink-900" id="modal-title">
                      Plotting Penguji / Pewawancara
                    </h3>
                    <p className="text-xs text-ink-500 font-medium">
                      Atur penugasan penguji untuk peserta ujian
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignStudent(null)}
                  className="p-2 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                <div className="bg-ink-50 rounded-xl p-4 border border-ink-100">
                  <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">
                    Peserta
                  </p>
                  <p className="text-base font-black text-ink-900">
                    {(assignStudent.nama_lengkap || "").replace(
                      /\w\S*/g,
                      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    )}
                  </p>
                  <p className="text-xs font-bold text-ink-500 font-mono mt-0.5">
                    {assignStudent.nomor_pendaftaran || "-"} • {assignStudent.jenjang || "-"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">
                      Jenis Seleksi
                    </label>
                    <select
                      value={assignType}
                      onChange={(e) =>
                        handleAssignTypeChange(e.target.value as any, assignStudent)
                      }
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                    >
                      <option value="quran">Tes Al-Qur&apos;an</option>
                      <option value="wawancara_santri">Wawancara Calon Santri</option>
                      <option value="wawancara_ortu">Wawancara Orang Tua/Wali</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">
                      Pilih Penguji / Pewawancara
                    </label>
                    <select
                      value={assignExaminerId}
                      onChange={(e) => setAssignExaminerId(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                    >
                      <option value="">-- Pilih Staff/Penguji (Kosongkan untuk Hapus) --</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.role.replace("_", " ").toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer (Sticky at bottom) */}
              <div className="bg-ink-50 px-6 py-4 border-t border-ink-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setAssignStudent(null)}
                  className="w-full sm:w-auto bg-white border border-ink-200 text-ink-600 hover:bg-ink-100 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition"
                >
                  Batal
                </button>
                <Button
                  onClick={handleSaveAssignment}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                  Simpan Penugasan
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Custom Modal for Input Nilai */}
      {selectedStudent &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-hidden"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedStudent(null)}
            />

            {/* Modal Dialog Card (Never cut off, scrollable body, sticky header & footer) */}
            <div className="relative w-full max-w-lg max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-ink-100 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
              {/* Header (Sticky / Fixed at top) */}
              <div className="px-6 py-4 sm:py-5 border-b border-ink-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                    <Zap className="w-5 h-5 font-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-ink-900" id="modal-title">
                      Input Nilai{" "}
                      {inputType === "quran"
                        ? "Al-Qur'an"
                        : inputType === "wawancara_santri"
                          ? "Wawancara Calon Santri"
                          : "Wawancara Ortu/Wali"}
                    </h3>
                    <p className="text-xs text-ink-500 font-medium">
                      {(selectedStudent.nama_lengkap || "").replace(
                        /\w\S*/g,
                        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                      )}{" "}
                      • {selectedStudent.nomor_pendaftaran || "-"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body (Accommodates all fields comfortably) */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {/* Info Peserta */}
                <div className="bg-ink-50 rounded-xl p-4 border border-ink-100">
                  <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">
                    Peserta Tes
                  </p>
                  <p className="text-base font-black text-ink-900">
                    {(selectedStudent.nama_lengkap || "").replace(
                      /\w\S*/g,
                      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    )}
                  </p>
                  <p className="text-xs font-bold text-ink-500 font-mono mt-0.5">
                    {selectedStudent.nomor_pendaftaran || "-"} • {selectedStudent.jenjang || "-"}
                  </p>
                </div>

                {/* Penguji Selection */}
                {isAdminSuper && (
                  <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-black text-primary-900 uppercase tracking-wider">
                        Penguji / Pewawancara
                      </label>
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-100/60 px-2 py-0.5 rounded-full">
                        Default: Akun Anda
                      </span>
                    </div>
                    <select
                      value={selectedExaminerId || currentUserId}
                      onChange={(e) => setSelectedExaminerId(e.target.value)}
                      className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/20 outline-none shadow-sm"
                    >
                      {currentUserId && (
                        <option value={currentUserId}>
                          -- Saya Sendiri ({currentUserName || "Admin Super"}) --
                        </option>
                      )}
                      {usersList
                        .filter((u) => u.id !== currentUserId)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.role.replace("_", " ").toUpperCase()})
                          </option>
                        ))}
                    </select>
                    <p className="text-[11px] text-ink-500 mt-1.5 font-medium">
                      Nilai akan tercatat resmi atas nama penguji yang dipilih di atas.
                    </p>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  {inputType === "quran" && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">
                          Nilai Tajwid (0-100)
                        </label>
                        <input
                          type="number"
                          value={quranForm.tajwid}
                          onChange={(e) =>
                            setQuranForm({
                              ...quranForm,
                              tajwid: e.target.value,
                            })
                          }
                          placeholder="0-100"
                          className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">
                          Nilai Kelancaran (0-100)
                        </label>
                        <input
                          type="number"
                          value={quranForm.kelancaran}
                          onChange={(e) =>
                            setQuranForm({
                              ...quranForm,
                              kelancaran: e.target.value,
                            })
                          }
                          placeholder="0-100"
                          className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {inputType === "wawancara_santri" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { k: "motivasi", l: "Motivasi (1-5)" },
                        { k: "lingkungan", l: "Lingkungan (1-5)" },
                        { k: "permainan", l: "Permainan (1-5)" },
                        { k: "teman", l: "Teman (1-5)" },
                        { k: "rokok", l: "Rokok (1-5)" },
                        { k: "pornografi", l: "Pornografi (1-5)" },
                        { k: "hobi", l: "Hobi Positif (1-5)" },
                      ].map((f) => (
                        <div key={f.k}>
                          <label className="block text-[10px] font-black text-ink-400 uppercase tracking-wider mb-2">
                            {f.l}
                          </label>
                          <select
                            value={(wsForm as any)[f.k]}
                            onChange={(e) => setWsForm({ ...wsForm, [f.k]: e.target.value })}
                            className="w-full bg-ink-50 border border-ink-100 rounded-xl px-3 py-2 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                          >
                            <option value="">Pilih...</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {inputType === "wawancara_ortu" && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-ink-500 uppercase">
                        Pilih A/B/C untuk 10 Pertanyaan Standar Wawancara Wali
                      </p>
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <label className="block text-[10px] font-black text-ink-400 uppercase tracking-wider">
                            Pertanyaan {idx + 1}
                          </label>
                          <select
                            value={(woForm as any)[`q${idx + 1}`]}
                            onChange={(e) =>
                              setWoForm({
                                ...woForm,
                                [`q${idx + 1}`]: e.target.value,
                              })
                            }
                            className="w-full bg-ink-50 border border-ink-100 rounded-xl px-3 py-2 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                          >
                            <option value="">Pilih...</option>
                            <option value="A">A (Sangat Baik / Menerima)</option>
                            <option value="B">B (Baik / Kondisional)</option>
                            <option value="C">C (Kurang / Tidak Ideal)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">
                      Catatan / Komentar Penguji <span className="text-red-500 font-bold">* (Wajib Diisi untuk Rapat)</span>
                    </label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      rows={3}
                      required
                      placeholder="Tuliskan catatan/komentar evaluasi santri untuk bahan pertimbangan rapat..."
                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Footer (Sticky / Fixed at bottom - ALWAYS VISIBLE!) */}
              <div className="bg-ink-50 px-6 py-4 border-t border-ink-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-full sm:w-auto bg-white border border-ink-200 text-ink-600 hover:bg-ink-100 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition"
                >
                  Batal
                </button>
                <Button
                  onClick={handleSubmitScore}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
