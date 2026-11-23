"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell,
  Search,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Languages,
  UserCheck,
  HeartHandshake,
  Award,
  MessagesSquare,
  ShieldCheck,
  ShieldAlert,
  Zap,
  AlertTriangle,
  StopCircle,
  Sparkles,
  Phone,
  Filter,
  CheckSquare,
  Square,
  Info,
  Clock,
  Check,
  CheckCheck,
  RefreshCw,
  FileText,
  CornerDownRight,
  ExternalLink,
} from "lucide-react";
import Swal from "sweetalert2";
import { BRANDING } from "@/config/branding";

interface PendaftarItem {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  status_pendaftaran: string;
  tahun_ajaran: string;
  phone: string;
  raw_phone: string;
  phone_source: string;
  has_phone: boolean;
}

interface StaffItem {
  id: string;
  full_name: string;
  username: string | null;
  role: string;
  secondary_roles: string[];
  roleLabel: string;
  phone: string;
  raw_phone: string;
  has_phone: boolean;
  is_penguji_quran: boolean;
  is_penguji_arab: boolean;
  is_penguji: boolean;
  is_pewawancara_calsan: boolean;
  is_pewawancara_cawalsan: boolean;
  is_pewawancara: boolean;
  is_all_staff: boolean;
}

type TargetCategory =
  | "all_pendaftar"
  | "selected_pendaftar"
  | "all_penguji_quran"
  | "selected_penguji_quran"
  | "all_penguji_arab"
  | "selected_penguji_arab"
  | "all_penguji"
  | "selected_penguji"
  | "all_pewawancara_calsan"
  | "selected_pewawancara_calsan"
  | "all_pewawancara_cawalsan"
  | "selected_pewawancara_cawalsan"
  | "all_pewawancara"
  | "selected_pewawancara"
  | "all_staff"
  | "selected_staff";

type CategoryTab =
  | "pendaftar"
  | "penguji_quran"
  | "penguji_arab"
  | "all_penguji"
  | "pewawancara_calsan"
  | "pewawancara_cawalsan"
  | "all_pewawancara"
  | "all_staff";

export default function BroadcastPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CategoryTab>("pendaftar");

  // Raw Data from API
  const [pendaftarList, setPendaftarList] = useState<PendaftarItem[]>([]);
  const [staffData, setStaffData] = useState<{
    penguji_quran: StaffItem[];
    penguji_arab: StaffItem[];
    all_penguji: StaffItem[];
    pewawancara_calsan: StaffItem[];
    pewawancara_cawalsan: StaffItem[];
    all_pewawancara: StaffItem[];
    all_staff: StaffItem[];
  }>({
    penguji_quran: [],
    penguji_arab: [],
    all_penguji: [],
    pewawancara_calsan: [],
    pewawancara_cawalsan: [],
    all_pewawancara: [],
    all_staff: [],
  });

  const [counts, setCounts] = useState<any>({});

  // Selection states per category (set of IDs)
  const [selectedPendaftar, setSelectedPendaftar] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const DRAFT_KEY = "alandalus_alimam_admin_broadcast_draft";

  // Filters for Pendaftar
  const [search, setSearch] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState<string>("2027/2028");
  const [filterJenjang, setFilterJenjang] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Message Form States
  const [header, setHeader] = useState("Assalamu'alaikum Warahmatullahi Wabarakatuh");
  const [message, setMessage] = useState("");
  const [footer, setFooter] = useState(`Panitia SPMB ${BRANDING.schoolShortName}`);
  const [includeName, setIncludeName] = useState(true);

  // Autosave draft from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.header !== undefined) setHeader(parsed.header);
          if (parsed.message !== undefined) setMessage(parsed.message);
          if (parsed.footer !== undefined) setFooter(parsed.footer);
          if (typeof parsed.includeName === "boolean") setIncludeName(parsed.includeName);
        }
      } catch (e) {
        console.warn("Failed to load broadcast draft:", e);
      }
    }
  }, []);

  // Autosave draft to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ header, message, footer, includeName })
        );
      } catch (e) {
        console.warn("Failed to save broadcast draft:", e);
      }
    }
  }, [header, message, footer, includeName]);

  // Dynamic available academic years (Tahun Ajaran) from actual data
  const availableTahunAjaran = useMemo(() => {
    const set = new Set<string>();
    pendaftarList.forEach((p) => {
      if (p.tahun_ajaran) set.add(p.tahun_ajaran);
    });
    if (set.size === 0) {
      ["2027/2028", "2026/2027", "2025/2026"].forEach((t) => set.add(t));
    }
    return Array.from(set).sort().reverse();
  }, [pendaftarList]);

  // Dynamic available jenjangs from actual pendaftar data
  const availableJenjangs = useMemo(() => {
    const set = new Set<string>();
    pendaftarList.forEach((p) => {
      if (p.jenjang && p.jenjang.trim()) {
        set.add(p.jenjang.trim().toUpperCase());
      }
    });
    if (set.size === 0) {
      ["SMP IT", "IL", "SMA IT"].forEach((j) => set.add(j));
    }
    return Array.from(set).sort();
  }, [pendaftarList]);

  // Sending progress & results
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Anti-Ban Pacing & Batching States
  const [delayMode, setDelayMode] = useState<"safe" | "normal" | "fast">("safe");
  const [sendProgress, setSendProgress] = useState<{
    active: boolean;
    currentBatch: number;
    totalBatches: number;
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    currentName: string;
    percentage: number;
  }>({
    active: false,
    currentBatch: 0,
    totalBatches: 0,
    sentCount: 0,
    failedCount: 0,
    totalRecipients: 0,
    currentName: "",
    percentage: 0,
  });
  const abortBroadcastRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/broadcast");
      if (res.ok) {
        const json = await res.json();
        const pList = json.data.pendaftar || [];
        setPendaftarList(pList);
        setStaffData({
          penguji_quran: json.data.penguji_quran || [],
          penguji_arab: json.data.penguji_arab || [],
          all_penguji: json.data.all_penguji || [],
          pewawancara_calsan: json.data.pewawancara_calsan || [],
          pewawancara_cawalsan: json.data.pewawancara_cawalsan || [],
          all_pewawancara: json.data.all_pewawancara || [],
          all_staff: json.data.all_staff || [],
        });
        setCounts(json.counts || {});
        if (json.counts?.active_tahun_ajaran) {
          setFilterTahunAjaran(json.counts.active_tahun_ajaran);
        }
      }
    } catch (e) {
      console.error("Failed to fetch recipients:", e);
    } finally {
      setLoading(false);
    }
  };

  // Get current active recipient list based on active tab
  const getCurrentTabList = (): Array<{
    id: string;
    name: string;
    phone: string;
    has_phone: boolean;
    subtitle: string;
    badge: string;
    jenjang?: string;
    status?: string;
  }> => {
    if (activeTab === "pendaftar") {
      return pendaftarList
        .filter((p) => {
          if (filterTahunAjaran !== "ALL" && p.tahun_ajaran !== filterTahunAjaran) {
            return false;
          }
          if (filterJenjang !== "ALL" && p.jenjang.toLowerCase() !== filterJenjang.toLowerCase()) {
            return false;
          }
          if (filterStatus !== "ALL" && p.status_pendaftaran !== filterStatus) {
            return false;
          }
          if (search) {
            const q = search.toLowerCase();
            return (
              p.nama_lengkap.toLowerCase().includes(q) ||
              p.nomor_pendaftaran.toLowerCase().includes(q) ||
              p.phone.includes(q)
            );
          }
          return true;
        })
        .map((p) => ({
          id: p.id,
          name: p.nama_lengkap,
          phone: p.phone,
          has_phone: p.has_phone,
          subtitle: `${p.nomor_pendaftaran} • ${p.jenjang} • TA ${p.tahun_ajaran}`,
          badge: p.status_pendaftaran.toUpperCase(),
          jenjang: p.jenjang,
          tahun_ajaran: p.tahun_ajaran,
          status: p.status_pendaftaran,
        }));
    }

    const currentStaffList = staffData[activeTab] || [];
    return currentStaffList
      .filter((s) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            s.full_name.toLowerCase().includes(q) ||
            (s.username && s.username.toLowerCase().includes(q)) ||
            s.phone.includes(q)
          );
        }
        return true;
      })
      .map((s) => ({
        id: s.id,
        name: s.full_name,
        phone: s.phone,
        has_phone: s.has_phone,
        subtitle: s.username ? `@${s.username}` : "Staff / Penguji",
        badge: s.roleLabel,
      }));
  };

  const currentItems = getCurrentTabList();
  const currentSelectedSet = activeTab === "pendaftar" ? selectedPendaftar : selectedStaff;
  const selectedCount = currentSelectedSet.length;

  const riskLevel = useMemo(() => {
    if (selectedCount <= 25) return "low";
    if (selectedCount <= 50) return "medium";
    return "high";
  }, [selectedCount]);

  const estimatedTimeMinutes = useMemo(() => {
    const avgSeconds = delayMode === "safe" ? 4.5 : delayMode === "normal" ? 2.3 : 1.0;
    const totalSec = selectedCount * avgSeconds;
    return (totalSec / 60).toFixed(1);
  }, [selectedCount, delayMode]);

  // Toggle select single item
  const toggleSelectOne = (id: string) => {
    if (activeTab === "pendaftar") {
      setSelectedPendaftar((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setSelectedStaff((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }
  };

  // Select all currently visible in this tab
  const handleSelectAllVisible = () => {
    const visibleIds = currentItems.map((item) => item.id);
    const allSelected = visibleIds.every((id) => currentSelectedSet.includes(id));

    if (activeTab === "pendaftar") {
      if (allSelected) {
        setSelectedPendaftar((prev) => prev.filter((id) => !visibleIds.includes(id)));
      } else {
        setSelectedPendaftar((prev) => Array.from(new Set([...prev, ...visibleIds])));
      }
    } else {
      if (allSelected) {
        setSelectedStaff((prev) => prev.filter((id) => !visibleIds.includes(id)));
      } else {
        setSelectedStaff((prev) => Array.from(new Set([...prev, ...visibleIds])));
      }
    }
  };

  // Select entire category (sesuai filter yang aktif jika sedang memfilter pendaftar)
  const handleSelectEntireCategory = () => {
    if (activeTab === "pendaftar") {
      const filteredPendaftar = pendaftarList.filter((p) => {
        if (filterTahunAjaran !== "ALL" && p.tahun_ajaran !== filterTahunAjaran) {
          return false;
        }
        if (filterJenjang !== "ALL" && p.jenjang.toLowerCase() !== filterJenjang.toLowerCase()) {
          return false;
        }
        if (filterStatus !== "ALL" && p.status_pendaftaran !== filterStatus) {
          return false;
        }
        return true;
      });
      const ids = filteredPendaftar.map((p) => p.id);
      setSelectedPendaftar(ids);
    } else {
      const allIds = (staffData[activeTab] || []).map((s) => s.id);
      setSelectedStaff(allIds);
    }
  };

  // Clear selections
  const handleClearSelection = () => {
    if (activeTab === "pendaftar") {
      setSelectedPendaftar([]);
    } else {
      setSelectedStaff([]);
    }
  };

  // Total selected count in current view
  const currentCategorySelectedCount = currentItems.filter((i) =>
    currentSelectedSet.includes(i.id),
  ).length;

  // Insert variable into message
  const insertVariable = (tag: string) => {
    if (!textareaRef.current) {
      setMessage((prev) => prev + " " + tag);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal =
      currentVal.substring(0, start) +
      tag +
      currentVal.substring(end, currentVal.length);

    setMessage(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 10);
  };

  // Wrap selected text in formatting (*bold*, _italic_, ~strike~, ```mono```)
  const wrapFormatting = (syntax: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    if (start === end) {
      // Just insert syntax
      insertVariable(syntax + syntax);
      return;
    }

    const selectedText = currentVal.substring(start, end);
    const newVal =
      currentVal.substring(0, start) +
      syntax +
      selectedText +
      syntax +
      currentVal.substring(end, currentVal.length);

    setMessage(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntax.length,
        end + syntax.length,
      );
    }, 10);
  };

  // Quick Templates
  const handleApplyTemplate = (type: string) => {
    switch (type) {
      case "penguji_quran":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Ustadz/Ustadzah *{nama}* (Tim Penguji Tes Al-Qur'an SPMB).\n\n" +
            "Diberitahukan bahwa jadwal pelaksanaan tes Al-Qur'an (Tahfidz & Tahsin) untuk calon santri baru telah tersedia di portal penguji.\n\n" +
            "Mohon kesediaan antum untuk membuka portal dan mengisi penilaian seleksi pada pendaftar yang telah ditugaskan.\n\n" +
            "Jazakumullahu khairan katsiran atas dedikasi dan khidmat antum.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      case "penguji_arab":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Ustadz/Ustadzah *{nama}* (Penguji Tes Lisan Bahasa Arab).\n\n" +
            "Diberitahukan bahwa jadwal tes lisan Bahasa Arab calon santri jenjang SMA & I'dad Lughowi telah diagendakan.\n\n" +
            "Silakan mengakses dashboard penguji untuk memeriksa berkas dan melakukan pengujian lisan serta penginputan nilai.\n\n" +
            "Barakallahu fiikum.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      case "pewawancara_calsan":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Ustadz/Ustadzah *{nama}* (Tim Pewawancara Calon Santri).\n\n" +
            "Mengingatkan pelaksanaan sesi wawancara kepribadian dan kesiapan berasrama calon santri.\n\n" +
            "Daftar calon santri binaan dan form penilaian digital telah disiapkan di panel wawancara masing-masing.\n\n" +
            "Terima kasih atas kerja sama dan bimbingan antum.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      case "pewawancara_cawalsan":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Bapak/Ibu/Ustadz *{nama}* (Tim Pewawancara Calon Orang Tua/Wali).\n\n" +
            "Diberitahukan bahwa sesi wawancara kesiapan orang tua / wali santri baru siap dilaksanakan.\n\n" +
            "Mohon kesediaannya untuk memverifikasi komitmen dan poin keselarasan visi wali di portal SPMB.\n\n" +
            "Jazakumullahu khair.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      case "pendaftar_jadwal":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Orang Tua / Wali dari Ananda *{nama}* (No. Reg: *{nomor_pendaftaran}* - Jenjang *{jenjang}*).\n\n" +
            `Kami informasikan bahwa jadwal pelaksanaan Ujian Seleksi Masuk ${BRANDING.schoolShortName} telah dijadwalkan.\n\n` +
            "Mohon login ke website resmi SPMB untuk melihat rincian ruang ujian, sesi wawancara, dan link Google Meet/jadwal offline.\n\n" +
            "Pastikan hadir 15 menit sebelum waktu yang ditentukan.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      case "pendaftar_pengumuman":
        setHeader("Assalamu'alaikum Warahmatullahi Wabarakatuh");
        setMessage(
          "Yth. Orang Tua / Wali dari Ananda *{nama}* (No. Reg: *{nomor_pendaftaran}*).\n\n" +
            `Hasil Sidang Pleno Seleksi Masuk ${BRANDING.schoolShortName} Tahun Ajaran Baru telah resmi diumumkan!\n\n` +
            "Silakan login ke akun pendaftaran Anda di portal SPMB untuk mengunduh Surat Keputusan (SK) Kelulusan dan informasi daftar ulang.\n\n" +
            "Semoga Allah senantiasa memberikan keberkahan bagi pendidikan ananda.",
        );
        setFooter(`Panitia SPMB ${BRANDING.schoolShortName}`);
        break;

      default:
        break;
    }
  };

  // Preview target generator
  const getPreviewSample = () => {
    if (activeTab === "pendaftar") {
      const selected = pendaftarList.find((p) => selectedPendaftar.includes(p.id));
      const first = selected || pendaftarList[0];
      return {
        nama: first ? first.nama_lengkap : "Ahmad Fulan",
        nomor_pendaftaran: first ? first.nomor_pendaftaran : "SPA2700001",
        jenjang: first ? first.jenjang : "SMP IT",
        tahun_ajaran: first ? first.tahun_ajaran : "2027/2028",
        role: "Calon Santri",
        phone: first && first.phone ? first.phone : "6281234567890",
      };
    } else {
      const list = staffData[activeTab] || [];
      const selected = list.find((s) => selectedStaff.includes(s.id));
      const first = selected || list[0];
      return {
        nama: first ? first.full_name : "Ustadz Abdullah",
        nomor_pendaftaran: "-",
        jenjang: "-",
        tahun_ajaran: "-",
        role: first ? first.roleLabel : "Penguji",
        phone: first && first.phone ? first.phone : "6281234567890",
      };
    }
  };

  const sample = getPreviewSample();

  const renderPreviewText = () => {
    let text = message
      .replace(/{nama}/gi, sample.nama)
      .replace(/{nomor_pendaftaran}/gi, sample.nomor_pendaftaran)
      .replace(/{jenjang}/gi, sample.jenjang)
      .replace(/{tahun_ajaran}/gi, sample.tahun_ajaran || "2027/2028")
      .replace(/{role}/gi, sample.role)
      .replace(/{kontak}/gi, sample.phone);

    const salutation = includeName ? `${sample.nama},\n\n` : "";
    const h = header && header.trim() ? `${header.trim()}\n\n` : "";
    const f = footer && footer.trim() ? `\n\n${footer.trim()}` : "";

    return `${h}${salutation}${text}${f}`;
  };

  // Trigger Send Broadcast with Anti-Ban Micro-Batching
  const handleSendBroadcast = async () => {
    const isPendaftar = activeTab === "pendaftar";
    const selectedList = isPendaftar ? selectedPendaftar : selectedStaff;

    if (selectedList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Penerima Belum Dipilih",
        text: "Silakan pilih minimal 1 penerima pesan sebelum mengirim.",
        confirmButtonColor: "#1e40af",
      });
      return;
    }

    if (!message || message.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Pesan Masih Kosong",
        text: "Silakan ketik isi pesan broadcast terlebih dahulu.",
        confirmButtonColor: "#1e40af",
      });
      return;
    }

    const categoryTitleMap: Record<CategoryTab, string> = {
      pendaftar: "Calon Santri & Wali (Pendaftar)",
      penguji_quran: "Penguji Tes Al-Qur'an",
      penguji_arab: "Penguji Bahasa Arab",
      all_penguji: "Seluruh Penguji (Qur'an + Arab)",
      pewawancara_calsan: "Pewawancara Calon Santri (Calsan)",
      pewawancara_cawalsan: "Pewawancara Calon Orang Tua (Cawalsan)",
      all_pewawancara: "Seluruh Pewawancara (Calsan + Cawalsan)",
      all_staff: "Seluruh Tim Penguji & Pewawancara",
    };

    const targetDesc = categoryTitleMap[activeTab];

    const modeLabels: Record<string, string> = {
      safe: "Mode Aman (Anti-Ban, jeda acak 3–6 detik)",
      normal: "Mode Normal (Jeda 1.5–3 detik)",
      fast: "Mode Cepat (Jeda ~1 detik)",
    };

    const { isConfirmed } = await Swal.fire({
      title: "Kirim Broadcast WhatsApp?",
      html: `
        <div class="text-left text-sm space-y-2 mt-2">
          <p><strong>Target Kategori:</strong> ${targetDesc}</p>
          <p><strong>Jumlah Penerima:</strong> ${selectedList.length} orang</p>
          <p><strong>Mode Pengiriman:</strong> ${modeLabels[delayMode]}</p>
          <p><strong>Estimasi Waktu:</strong> ±${estimatedTimeMinutes} menit</p>
          <p class="text-stone-500 text-xs mt-1">Pesan akan dikirim bertahap dalam batch kecil untuk mencegah timeout server dan melindungi nomor dari pemblokiran spam WhatsApp.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      confirmButtonText: "Ya, Kirim Sekarang!",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    // Resolve all full recipient items
    let recipientsToSend: Array<{
      id: string;
      name: string;
      phone: string;
      nomor_pendaftaran?: string;
      jenjang?: string;
      tahun_ajaran?: string;
      roleLabel?: string;
      type: "pendaftar" | "profile";
    }> = [];

    if (isPendaftar) {
      recipientsToSend = pendaftarList
        .filter((p) => selectedPendaftar.includes(p.id))
        .map((p) => ({
          id: p.id,
          name: p.nama_lengkap,
          phone: p.phone,
          nomor_pendaftaran: p.nomor_pendaftaran,
          jenjang: p.jenjang,
          tahun_ajaran: p.tahun_ajaran,
          roleLabel: "Calon Santri",
          type: "pendaftar" as const,
        }));
    } else {
      const list = staffData[activeTab] || [];
      recipientsToSend = list
        .filter((s) => selectedStaff.includes(s.id))
        .map((s) => ({
          id: s.id,
          name: s.full_name,
          phone: s.phone,
          nomor_pendaftaran: "-",
          jenjang: "-",
          tahun_ajaran: "-",
          roleLabel: s.roleLabel,
          type: "profile" as const,
        }));
    }

    const CHUNK_SIZE = delayMode === "safe" ? 8 : delayMode === "normal" ? 12 : 20;
    const chunks: typeof recipientsToSend[] = [];
    for (let i = 0; i < recipientsToSend.length; i += CHUNK_SIZE) {
      chunks.push(recipientsToSend.slice(i, i + CHUNK_SIZE));
    }

    try {
      setSending(true);
      setResults(null);
      abortBroadcastRef.current = false;

      // Lock browser window reload/close to prevent accidental tab closing
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Proses broadcast sedang berjalan. Jangan tutup halaman ini agar seluruh pesan terkirim!";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      const combinedResults: Array<any> = [];
      let totalSent = 0;
      let totalFailed = 0;

      for (let b = 0; b < chunks.length; b++) {
        if (abortBroadcastRef.current) {
          console.log("Broadcast stopped by admin user.");
          break;
        }

        const currentChunk = chunks[b];
        setSendProgress({
          active: true,
          currentBatch: b + 1,
          totalBatches: chunks.length,
          sentCount: totalSent,
          failedCount: totalFailed,
          totalRecipients: recipientsToSend.length,
          currentName: currentChunk[0]?.name || "",
          percentage: Math.round(((totalSent + totalFailed) / recipientsToSend.length) * 100),
        });

        // Network resilience with automatic retry loop (up to 3 attempts per batch)
        let batchSuccess = false;
        let batchData: any = null;
        let lastBatchError = "";

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch("/api/admin/broadcast", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipientsChunk: currentChunk,
                delayMode,
                message,
                header,
                footer,
                includeName,
              }),
            });

            const data = await res.json();
            if (res.ok) {
              batchSuccess = true;
              batchData = data;
              break;
            } else {
              lastBatchError = data.error || `HTTP ${res.status}`;
            }
          } catch (netErr: any) {
            lastBatchError = netErr.message || "Network request failed";
          }

          if (attempt < 3 && !abortBroadcastRef.current) {
            console.warn(`⚠️ Batch ${b + 1} attempt ${attempt} failed: ${lastBatchError}. Retrying in 2s...`);
            await new Promise((r) => setTimeout(r, 2000));
          }
        }

        if (batchSuccess && batchData) {
          totalSent += batchData.sent || 0;
          totalFailed += batchData.failed || 0;
          if (Array.isArray(batchData.details)) {
            combinedResults.push(...batchData.details);
          }
        } else {
          // Record entire chunk as failed without aborting remaining batches!
          console.error(`❌ Batch ${b + 1} completely failed after 3 attempts: ${lastBatchError}`);
          totalFailed += currentChunk.length;
          for (const item of currentChunk) {
            combinedResults.push({
              id: item.id,
              name: item.name,
              phone: item.phone,
              status: "failed",
              error: `Gagal jaringan server (3x percobaan): ${lastBatchError}`,
            });
          }
        }

        // Brief 1.5s cooling pause between batches if more batches remain
        if (b < chunks.length - 1 && !abortBroadcastRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      window.removeEventListener("beforeunload", handleBeforeUnload);

      setResults({
        total: recipientsToSend.length,
        sent: totalSent,
        failed: totalFailed,
        details: combinedResults,
      });

      // Clear draft on successful broadcast
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (e) {
          console.warn("Failed to remove draft:", e);
        }
      }

      Swal.fire({
        icon: totalFailed === 0 ? "success" : "info",
        title: abortBroadcastRef.current ? "Broadcast Dihentikan" : "Broadcast Selesai!",
        text: `Berhasil dikirim: ${totalSent} | Gagal: ${totalFailed}`,
        confirmButtonColor: "#059669",
      });
    } catch (e: any) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengirim Broadcast",
        text: e.message || "Terjadi kesalahan pada server",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSending(false);
      setSendProgress((prev) => ({ ...prev, active: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Banners - Platinum Standard Glassmorphism & Elevation */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-primary-500/10 p-6 md:p-8 border border-stone-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-primary-500/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Resmi & Terpadu
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
                  Multi-Target Penerima
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight mt-1">
                Broadcast <span className="text-emerald-600">WhatsApp</span>
              </h1>
              <p className="text-stone-500 text-sm mt-0.5">
                Kirim pesan massal resmi ke Calon Santri, Wali, Penguji Tes Al-Qur'an, Penguji Tes Lisan Bahasa Arab, dan Pewawancara Calsan & Cawalsan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={fetchRecipients}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Segarkan Data
            </button>
          </div>
        </div>
      </div>

      {/* 2. Target Category Segmented Cards */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xl shadow-stone-200/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-stone-900 tracking-tight">
              Pilih Target Kategori Penerima
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Pilih salah satu kelompok target di bawah ini
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Tab 1: Pendaftar */}
          <button
            onClick={() => setActiveTab("pendaftar")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "pendaftar"
                ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {filterTahunAjaran !== "ALL"
                    ? pendaftarList.filter((p) => p.tahun_ajaran === filterTahunAjaran).length
                    : pendaftarList.length}
                </span>
                {filterTahunAjaran !== "ALL" && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    TA {filterTahunAjaran}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Calon Santri / Pendaftar
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Semua calon santri dan wali santri
            </p>
          </button>

          {/* Tab 2: Penguji Quran */}
          <button
            onClick={() => setActiveTab("penguji_quran")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "penguji_quran"
                ? "bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {counts.penguji_quran || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Penguji Tes Al-Qur'an
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Khusus penguji Tahsin & Tahfidz
            </p>
          </button>

          {/* Tab 3: Penguji Tes Lisan Bahasa Arab */}
          <button
            onClick={() => setActiveTab("penguji_arab")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "penguji_arab"
                ? "bg-cyan-50/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold">
                <Languages className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                {counts.penguji_arab || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Penguji Bahasa Arab
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Khusus penguji lisan Arab SMA/IL
            </p>
          </button>

          {/* Tab 4: Semua Penguji */}
          <button
            onClick={() => setActiveTab("all_penguji")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "all_penguji"
                ? "bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {counts.all_penguji || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Semua Penguji (Gabungan)
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Penguji Tes Al-Qur'an + B. Arab
            </p>
          </button>

          {/* Tab 5: Pewawancara Calsan */}
          <button
            onClick={() => setActiveTab("pewawancara_calsan")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "pewawancara_calsan"
                ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {counts.pewawancara_calsan || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Pewawancara Santri (Calsan)
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Wawancara calon santri
            </p>
          </button>

          {/* Tab 6: Pewawancara Cawalsan */}
          <button
            onClick={() => setActiveTab("pewawancara_cawalsan")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "pewawancara_cawalsan"
                ? "bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {counts.pewawancara_cawalsan || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Pewawancara Wali (Cawalsan)
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Wawancara orang tua/wali santri
            </p>
          </button>

          {/* Tab 7: Semua Pewawancara */}
          <button
            onClick={() => setActiveTab("all_pewawancara")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "all_pewawancara"
                ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-bold">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {counts.all_pewawancara || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Semua Pewawancara (Gabungan)
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Pewawancara Calsan + Cawalsan
            </p>
          </button>

          {/* Tab 8: Semua Penguji & Pewawancara */}
          <button
            onClick={() => setActiveTab("all_staff")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeTab === "all_staff"
                ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {counts.all_staff || 0}
              </span>
            </div>
            <div className="mt-3 font-black text-stone-900 text-sm">
              Semua Penguji & Pewawancara
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
              Seluruh tim panitia seleksi
            </p>
          </button>
        </div>
      </div>

      {/* 3. Main Split View: Left Column (Recipient Checklist) & Right Column (Message Editor + WhatsApp Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 COLS): Recipient Selection & Filter */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xl shadow-stone-200/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <span>Daftar Penerima</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  {currentCategorySelectedCount} / {currentItems.length}
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Pilih satu per satu atau gunakan tombol pilih semua
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSelectAllVisible}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all"
                title="Pilih/Batalkan yang tampil"
              >
                Pilih Tampil
              </button>
              <button
                onClick={handleSelectEntireCategory}
                className="px-2.5 py-1 text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-all"
                title="Pilih seluruh kategori"
              >
                Pilih Semua
              </button>
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-all"
                title="Batalkan pilihan"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama, no. pendaftaran, atau nomor WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Additional Filters (Only for Pendaftar) */}
          {activeTab === "pendaftar" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Filter 1: Tahun Ajaran */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1 flex items-center justify-between">
                  <span>Tahun Ajaran</span>
                  {filterTahunAjaran !== "ALL" && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                      Aktif
                    </span>
                  )}
                </label>
                <select
                  value={filterTahunAjaran}
                  onChange={(e) => {
                    setFilterTahunAjaran(e.target.value);
                    setSelectedPendaftar([]); // Reset selection for safety
                  }}
                  className="w-full px-2.5 py-1.5 bg-emerald-50/60 border border-emerald-300 rounded-lg text-xs font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="ALL">Semua Tahun Ajaran</option>
                  {availableTahunAjaran.map((ta) => (
                    <option key={ta} value={ta}>
                      TA {ta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Jenjang */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                  Jenjang
                </label>
                <select
                  value={filterJenjang}
                  onChange={(e) => setFilterJenjang(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Jenjang</option>
                  {availableJenjangs.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Status */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="payment_verification">Verifikasi Bayar</option>
                  <option value="docs_uploaded">Berkas Upload</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="tested">Sudah Tes (Tested)</option>
                  <option value="accepted">Diterima</option>
                  <option value="enrolled">Daftar Ulang</option>
                </select>
              </div>
            </div>
          )}

          {/* Recipient Item List */}
          <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs font-medium">Memuat daftar penerima...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Info className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                <p className="text-xs font-bold">Tidak ada penerima ditemukan</p>
                <p className="text-[11px]">Coba sesuaikan kata kunci atau filter</p>
              </div>
            ) : (
              currentItems.map((item) => {
                const isSelected = currentSelectedSet.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectOne(item.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400/20"
                        : "bg-white hover:bg-stone-50 border-stone-200/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 text-emerald-600">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-stone-900 truncate">
                            {item.name}
                          </p>
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 uppercase shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                          <span>{item.subtitle}</span>
                          <span>•</span>
                          <span
                            className={`flex items-center gap-1 font-mono ${
                              item.has_phone ? "text-stone-600" : "text-rose-500 font-bold"
                            }`}
                          >
                            <Phone className="w-3 h-3" />
                            {item.has_phone ? item.phone : "No. WA Belum Ada"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!item.has_phone && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                        Kosong
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (7 COLS): Message Composer & WhatsApp Live Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Message Editor Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-xl shadow-stone-200/40 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Susun Pesan WhatsApp</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Dapat disesuaikan otomatis dengan variabel dinamis
                </p>
              </div>

              {/* Quick Template Presets Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 shrink-0">
                  Template:
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleApplyTemplate(e.target.value);
                  }}
                  defaultValue=""
                  className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>
                    Pilih Template Siap Pakai...
                  </option>
                  <option value="penguji_quran">Undangan Penguji Tes Al-Qur'an</option>
                  <option value="penguji_arab">Undangan Penguji Tes Lisan Bahasa Arab</option>
                  <option value="pewawancara_calsan">Undangan Wawancara Calsan</option>
                  <option value="pewawancara_cawalsan">Undangan Wawancara Cawalsan</option>
                  <option value="pendaftar_jadwal">Informasi Jadwal Pendaftar</option>
                  <option value="pendaftar_pengumuman">Pengumuman Kelulusan</option>
                </select>
              </div>
            </div>

            {/* Variable Insertion Pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Klik untuk Menyelipkan Variabel Dinamis:</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => insertVariable("{nama}")}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;nama&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{nomor_pendaftaran}")}
                  className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;nomor_pendaftaran&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{jenjang}")}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;jenjang&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{tahun_ajaran}")}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;tahun_ajaran&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{role}")}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;role&#125;
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable("{kontak}")}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  + &#123;kontak&#125;
                </button>
              </div>
            </div>

            {/* Header (Greeting) */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Header Salam / Pembuka (Opsional)
              </label>
              <input
                type="text"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder="Assalamu'alaikum Warahmatullahi Wabarakatuh"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Include Name Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeName"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              <label
                htmlFor="includeName"
                className="text-xs font-bold text-stone-700 cursor-pointer"
              >
                Sebutkan Nama Penerima Secara Otomatis di Awal Pesan (contoh:{" "}
                <span className="italic text-emerald-700 font-normal">
                  "Ahmad Fulan,"
                </span>
                )
              </label>
            </div>

            {/* Formatting Toolbar & Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Isi Pesan Utama
                </label>

                {/* WhatsApp Formatting Shortcuts */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => wrapFormatting("*")}
                    className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-black text-xs flex items-center justify-center transition-all"
                    title="Bold (*teks*)"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormatting("_")}
                    className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 italic font-bold text-xs flex items-center justify-center transition-all"
                    title="Italic (_teks_)"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormatting("~")}
                    className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 line-through text-xs flex items-center justify-center transition-all"
                    title="Strikethrough (~teks~)"
                  >
                    S
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapFormatting("```")}
                    className="px-1.5 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[10px] flex items-center justify-center transition-all"
                    title="Monospace (```teks```)"
                  >
                    M
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan broadcast di sini... Anda bisa menggunakan format WhatsApp seperti *teks tebal* atau _teks miring_."
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all leading-relaxed custom-scrollbar"
              />

              <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1">
                <span>
                  Variabel otomatis akan diganti dengan data masing-masing penerima
                </span>
                <span>{message.length} karakter</span>
              </div>
            </div>

            {/* Footer */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Footer Penutup / Tanda Tangan (Opsional)
              </label>
              <input
                type="text"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder={`Panitia SPMB ${BRANDING.schoolShortName}`}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Mode Kecepatan Anti-Ban & Pacing Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mode Kecepatan Anti-Ban (Proteksi Blokir WhatsApp)</span>
                </label>
                <span className="text-[10px] font-bold text-stone-500">
                  Estimasi: ±{estimatedTimeMinutes} menit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option 1: Safe Mode */}
                <button
                  type="button"
                  onClick={() => setDelayMode("safe")}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    delayMode === "safe"
                      ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                      : "bg-stone-50/70 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-950">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Mode Aman</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-emerald-200 text-emerald-900 uppercase">
                      Anti-Ban
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2">
                    Jeda acak 3–6 detik. Meniru ketikan manusia untuk perlindungan maksimal.
                  </p>
                </button>

                {/* Option 2: Normal Mode */}
                <button
                  type="button"
                  onClick={() => setDelayMode("normal")}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    delayMode === "normal"
                      ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                      : "bg-stone-50/70 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-amber-950">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Mode Normal</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2">
                    Jeda 1.5–3 detik. Seimbang untuk 15–30 kontak.
                  </p>
                </button>

                {/* Option 3: Fast Mode */}
                <button
                  type="button"
                  onClick={() => setDelayMode("fast")}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    delayMode === "fast"
                      ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                      : "bg-stone-50/70 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-black text-xs text-indigo-950">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>Mode Cepat</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2">
                    Jeda ~1 detik. Khusus tes staf atau volume kecil (&lt;15 kontak).
                  </p>
                </button>
              </div>
            </div>

            {/* Smart Anti-Ban Risk Indicator Banner */}
            {selectedCount > 0 && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                  riskLevel === "low"
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                    : riskLevel === "medium"
                    ? "bg-amber-50/60 border-amber-200 text-amber-950"
                    : "bg-rose-50/60 border-rose-200 text-rose-950"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {riskLevel === "low" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : riskLevel === "medium" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase text-[10px] tracking-wide">
                      {riskLevel === "low"
                        ? "Tingkat Risiko: Rendah (Sangat Aman)"
                        : riskLevel === "medium"
                        ? "Tingkat Risiko: Sedang (Perlu Hati-hati)"
                        : "Tingkat Risiko: Volume Tinggi (Perhatian Khusus)"}
                    </span>
                    <span className="font-bold text-[10px]">
                      {selectedCount} Nomor • Estimasi ±{estimatedTimeMinutes} Menit
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    {riskLevel === "low"
                      ? "Jumlah penerima aman untuk gateway WhatsApp. Pesan akan dikirim dengan jeda acak manusiawi agar terhindar dari deteksi spam."
                      : riskLevel === "medium"
                      ? "Disarankan gunakan Mode Aman (Anti-Ban). Pastikan penerima mengenali panitia atau telah menyimpan nomor WhatsApp resmi panitia."
                      : `Mengirim ke ${selectedCount} nomor berisiko memicu proteksi spam WhatsApp Meta jika dikirim sekaligus. Sistem otomatis memecah pengiriman dalam batch kecil 8-10 nomor agar nomor Anda tetap terlindungi dan server tidak timeout.`}
                  </p>
                </div>
              </div>
            )}

            {/* Action Send Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={sending || currentSelectedSet.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sedang Mengirim ke {currentSelectedSet.length} Penerima...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Kirim Broadcast ke {currentSelectedSet.length} Penerima</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* B. Live WhatsApp Screen Preview Card */}
          <div className="bg-[#e5ddd5] rounded-3xl p-4 md:p-6 border border-stone-300/80 shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-3 text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black tracking-wide uppercase">
                  Live Preview Layar WhatsApp
                </span>
              </div>
              <span className="text-[11px] font-medium bg-black/10 px-2 py-0.5 rounded-full">
                Contoh: {sample.nama}
              </span>
            </div>

            {/* WhatsApp Phone Mockup Container */}
            <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white">
                    {sample.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-xs truncate max-w-[200px]">
                      {sample.nama}
                    </p>
                    <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span>online</span>
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-200">
                  {sample.phone}
                </div>
              </div>

              {/* Chat Bubble Area with WhatsApp Wallpaper feel */}
              <div className="p-4 bg-[#efeae2] min-h-[160px] flex flex-col justify-end">
                {/* Chat Bubble */}
                <div className="bg-[#dcf8c6] text-stone-900 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[90%] text-xs leading-relaxed relative">
                  <div className="whitespace-pre-wrap font-sans break-words">
                    {renderPreviewText() || (
                      <span className="text-stone-400 italic">
                        Ketik pesan di atas untuk melihat tampilan live preview...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-stone-400 mt-1">
                    <span>
                      {new Date().toLocaleTimeString([], {
        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1] stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C. Results Delivery Card (When finished) */}
          {results && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-xl shadow-stone-200/40 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Laporan Hasil Pengiriman Broadcast</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    Berhasil: {results.sent}
                  </span>
                  {results.failed > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                      Gagal: {results.failed}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {results.details?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      item.status === "success"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/60 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[11px] font-mono text-stone-500">
                          {item.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black text-[10px] uppercase px-2 py-0.5 rounded ${
                          item.status === "success"
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-rose-200 text-rose-800"
                        }`}
                      >
                        {item.status === "success" ? "Terkirim" : "Gagal"}
                      </span>
                      {item.error && (
                        <p className="text-[10px] text-rose-600 mt-0.5 max-w-[200px] truncate">
                          {item.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Broadcast Streaming Progress Overlay */}
      {sendProgress.active && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-stone-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-stone-900">
                    Mengirim Broadcast WhatsApp
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Batch {sendProgress.currentBatch} dari {sendProgress.totalBatches} • Proteksi Anti-Ban Aktif
                  </p>
                </div>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>
                  {sendProgress.sentCount + sendProgress.failedCount} dari {sendProgress.totalRecipients} nomor
                </span>
                <span className="text-emerald-600 font-black">
                  {sendProgress.percentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Current Recipient Status */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="truncate">
                Sedang memproses batch ke penerima...
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {sendProgress.sentCount} Sukses
                </span>
                {sendProgress.failedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                    {sendProgress.failedCount} Gagal
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-stone-400 text-center italic">
              Pesan dikirim bertahap dengan jeda acak manusiawi agar nomor terhindar dari pemblokiran spam WhatsApp. Jangan tutup halaman ini.
            </p>

            {/* Stop Button */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  abortBroadcastRef.current = true;
                  Swal.fire({
                    title: "Menghentikan Broadcast...",
                    text: "Pengiriman akan dihentikan setelah batch saat ini selesai.",
                    icon: "info",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all"
              >
                <StopCircle className="w-4 h-4 text-rose-600" />
                <span>Hentikan Pengiriman</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
