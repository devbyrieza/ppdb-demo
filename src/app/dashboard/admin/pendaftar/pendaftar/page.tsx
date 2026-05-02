"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  Users,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  FileText,
  Calendar,
  Phone,
  Mail,
  Hash,
  CheckSquare,
  Square,
  Download,
  Edit,
  ArrowLeft,
  FileSpreadsheet,
  X,
  Save,
  FileCheck,
  RotateCcw,
  UploadCloud,
  CreditCard,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/access-control";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";
import Swal from "sweetalert2";

// Filter labels for dashboard categories
const FILTER_LABELS: Record<string, string> = {
  belum_bayar: "Belum Bayar",
  menunggu_verifikasi_pembayaran: "Menunggu Verifikasi Pembayaran",
  sudah_bayar: "Sudah Bayar",
  pembayaran_ditolak: "Pembayaran Ditolak",
  belum_isi_data: "Belum Isi Data Lengkap",
  sudah_isi_data: "Sudah Isi Data Lengkap",
  belum_upload_dokumen: "Belum Upload Dokumen",
  menunggu_verifikasi_dokumen: "Menunggu Verifikasi Dokumen",
  dokumen_terverifikasi: "Dokumen Terverifikasi",
  dokumen_ditolak: "Dokumen Ditolak",
  terjadwal_ujian: "Terjadwal Ujian & Wawancara",
  belum_ujian: "Belum Ujian & Wawancara",
  sudah_ujian: "Sudah Ujian & Wawancara",
  hasil_ujian: "Hasil Ujian & Wawancara",
  diterima: "Diterima",
  belum_daftar_ulang: "Belum Daftar Ulang",
  sudah_daftar_ulang: "Sudah Daftar Ulang",
};

interface Pendaftar {
  id: string;
  nomor_pendaftaran: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  tanggal_lahir: string | null;
  no_hp: string | null;
  dokumen?: Array<{ status_verifikasi: string }>;
  nilai_ujian?: { nilai_total: number };
  email: string | null;
  status_pendaftaran: string;
  created_at: string;
  tahun_ajaran: {
    nama: string;
  } | null;
  pengumuman?: {
    status_kelulusan: string;
  };
  pembayaran?: Array<{ id: string; status_pembayaran: string }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TahunAjaran {
  id: string;
  nama: string;
  tahun_mulai: number;
  tahun_selesai: number;
  is_active: boolean;
}

function AdminPendaftarContent() {
  const searchParams = useSearchParams();
  /* const { data: session } = useSession();  -- Removed to fix build error */
  const urlFilter = searchParams.get("filter") || "";

  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session?.role) {
            setUserRole(data.session.role);
          } else if (data.user?.user_metadata?.role) {
            setUserRole(data.user.user_metadata.role);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    }
    fetchSession();
  }, []);

  // Role helpers
  // const userRole = session?.user?.role; -- Handled by state above
  const canViewKeuangan = userRole === "admin_super" || userRole === "admin_keuangan" || userRole === "head_of_it" || userRole === "admin";
  const canViewBerkas = userRole === "admin_super" || userRole === "admin_berkas" || userRole === "admin";
  const canViewSeleksi = userRole === "admin_super" || userRole === "penguji_calsan" || userRole === "pewawancara_calsan" || userRole === "pewawancara_cawalsan" || userRole === "admin";

  const isKeuangan = userRole === "admin_keuangan";
  const isBerkas = userRole === "admin_berkas";
  const isPenguji = userRole === "penguji_calsan" || userRole === "pewawancara_calsan" || userRole === "pewawancara_cawalsan";
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState(urlFilter);

  // Set default filter for Admin Berkas/Penguji/Keuangan if no filter provided
  // REMOVED: This causes data to "disappear" for admins once they are processed.
  // Specialized roles should use the specialized menus for task-focused views.
  /* 
  useEffect(() => {
    if (userRole && !urlFilter && !statusFilter) {
      if (isBerkas) {
        setStatusFilter("menunggu_verifikasi_dokumen");
      } else if (isPenguji) {
        setStatusFilter("terjadwal_ujian");
      } else if (isKeuangan) {
        setStatusFilter("menunggu_verifikasi_pembayaran");
      }
    }
  }, [userRole, isBerkas, isPenguji, isKeuangan, urlFilter, statusFilter]);
  */

  const [jenjangFilter, setJenjangFilter] = useState("");
  const [jenisKelaminFilter, setJenisKelaminFilter] = useState("");
  const [tahunAjaranFilter, setTahunAjaranFilter] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  // Location filters
  const [provinsiFilter, setProvinsiFilter] = useState("");
  const [kabupatenFilter, setKabupatenFilter] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");

  // Update filter when URL changes
  useEffect(() => {
    if (urlFilter) {
      setStatusFilter(urlFilter);
    }
  }, [urlFilter]);

  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [kabupatenList, setKabupatenList] = useState<string[]>([]);
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [kelurahanList, setKelurahanList] = useState<string[]>([]);
  // Loading states for location dropdowns
  const [provinsiLoading, setProvinsiLoading] = useState(false);
  const [kabupatenLoading, setKabupatenLoading] = useState(false);
  const [kecamatanLoading, setKecamatanLoading] = useState(false);
  const [kelurahanLoading, setKelurahanLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Announcement State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedPendaftar, setSelectedPendaftar] = useState<Pendaftar | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    status_kelulusan: "Lulus",
    catatan: "",
    surat_keputusan_url: ""
  });
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);

  // Soft Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPendaftar, setDeletingPendaftar] = useState<Pendaftar | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingPay, setUploadingPay] = useState<string | null>(null);
  const [selectedPendaftarId, setSelectedPendaftarId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedPayId, setSelectedPayId] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const payInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAnnouncement = (pendaftar: Pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setAnnouncementForm({
      status_kelulusan: pendaftar.pengumuman?.status_kelulusan || "Lulus",
      catatan: "", // Reset notes for new input or fetch if needed
      surat_keputusan_url: "" // Reset URL
    });
    setIsAnnouncementModalOpen(true);
  };

  // Fetch trash count
  useEffect(() => {
    if (userRole === "admin_super") {
      const fetchTrashCount = async () => {
        try {
          const res = await fetch("/api/admin/pendaftar/trash?limit=1");
          if (res.ok) {
            const data = await res.json();
            setTrashCount(data.pagination?.total || 0);
          }
        } catch (e) {
          console.error("Error fetching trash count", e);
        }
      };
      fetchTrashCount();
    }
  }, [userRole]);

  const handleOpenDelete = (item: Pendaftar) => {
    setDeletingPendaftar(item);
    setDeleteConfirmName("");
    setIsDeleteModalOpen(true);
  };

  const handleSoftDelete = async () => {
    if (!deletingPendaftar) return;
    if (deleteConfirmName.trim().toLowerCase() !== deletingPendaftar.nama_lengkap.trim().toLowerCase()) {
      Swal.fire("Gagal!", "Nama tidak cocok. Silakan ketik nama lengkap pendaftar dengan benar.", "error");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/pendaftar/${deletingPendaftar.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menghapus data");
      }

      Swal.fire("Selesai!", result.message || "Data berhasil dihapus", "success");
      setIsDeleteModalOpen(false);
      setDeletingPendaftar(null);
      setDeleteConfirmName("");
      setTrashCount((prev) => prev + 1);
      fetchPendaftar();
    } catch (error: any) {
      console.error("Error soft deleting:", error);
      Swal.fire("Error!", error.message || "Gagal menghapus data", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendaftar) return;

    try {
      setIsSubmittingAnnouncement(true);
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: selectedPendaftar.id,
          ...announcementForm
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal menyimpan pengumuman");
      }

      Swal.fire("Tersimpan!", "Berhasil menyimpan hasil seleksi!", "success");
      setIsAnnouncementModalOpen(false);
      fetchPendaftar(); // Refresh list
    } catch (error: any) {
      console.error("Error submitting announcement:", error);
      Swal.fire("Error!", error.message, "error");
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const handleQuickDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType || !selectedPendaftarId) return;

    try {
      setUploadingDoc(selectedPendaftarId + selectedDocType);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenis_dokumen", selectedDocType);
      formData.append("pendaftar_id", selectedPendaftarId);

      const response = await fetch("/api/admin/verifikasi/dokumen/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({ title: "Berhasil", text: data.message, icon: "success", toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchPendaftar();
      } else {
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Terjadi kesalahan saat upload", "error");
    } finally {
      setUploadingDoc(null);
      setSelectedDocType(null);
      setSelectedPendaftarId(null);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleQuickPayUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPayId) return;

    try {
      setUploadingPay(selectedPayId);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pembayaran_id", selectedPayId);

      const response = await fetch("/api/admin/verifikasi/pembayaran/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({ title: "Berhasil", text: data.message, icon: "success", toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchPendaftar();
      } else {
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Terjadi kesalahan saat upload", "error");
    } finally {
      setUploadingPay(null);
      setSelectedPayId(null);
      if (payInputRef.current) payInputRef.current.value = "";
    }
  };

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchPendaftar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (jenjangFilter) params.append("jenjang", jenjangFilter);
      if (jenisKelaminFilter) params.append("jenis_kelamin", jenisKelaminFilter);
      if (tahunAjaranFilter) params.append("tahun_ajaran", tahunAjaranFilter);
      if (provinsiFilter) params.append("provinsi", provinsiFilter);
      if (kabupatenFilter) params.append("kabupaten", kabupatenFilter);
      if (kecamatanFilter) params.append("kecamatan", kecamatanFilter);
      if (kelurahanFilter) params.append("kelurahan", kelurahanFilter);

      const response = await fetch(`/api/admin/pendaftar/list?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setPendaftar(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching pendaftar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendaftar();
  }, [
    pagination.page,
    search,
    statusFilter,
    jenjangFilter,
    jenisKelaminFilter,
    tahunAjaranFilter,
    provinsiFilter,
    kabupatenFilter,
    kecamatanFilter,
    kelurahanFilter,
  ]);

  useEffect(() => {
    // Fetch tahun ajaran list
    const fetchTahunAjaran = async () => {
      try {
        const response = await fetch("/api/admin/tahun-ajaran");
        if (response.ok) {
          const result = await response.json();
          setTahunAjaranList(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching tahun ajaran:", error);
      }
    };
    fetchTahunAjaran();
    // Fetch provinsi list
    const fetchProvinsi = async () => {
      try {
        setProvinsiLoading(true);
        const response = await fetch("/api/admin/locations/provinsi");
        if (response.ok) {
          const result = await response.json();
          setProvinsiList(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching provinsi:", error);
      } finally {
        setProvinsiLoading(false);
      }
    };
    fetchProvinsi();

    // Fetch Role
    const fetchRole = async () => {
      try {
        setIsRoleLoading(true);
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          // Fix: Read from session.role based on API structure
          if (sessionData.session?.role) {
            setRole(sessionData.session.role as UserRole);
          } else if (sessionData.user?.user_metadata?.role) {
            // Fallback for standard supabase session
            setRole(sessionData.user.user_metadata.role as UserRole);
          }
        }
      } catch (e) {
        console.error("Error fetching role", e);
      } finally {
        setIsRoleLoading(false);
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    // when provinsi changes, load kabupaten and reset lower selections
    if (!provinsiFilter) {
      setKabupatenList([]);
      setKabupatenFilter("");
      setKecamatanList([]);
      setKecamatanFilter("");
      setKelurahanList([]);
      setKelurahanFilter("");
      return;
    }

    const fetchKabupaten = async () => {
      try {
        setKabupatenLoading(true);
        const response = await fetch(
          `/api/admin/locations/kabupaten?provinsi=${encodeURIComponent(provinsiFilter)}`
        );
        if (response.ok) {
          const result = await response.json();
          setKabupatenList(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching kabupaten:", error);
      } finally {
        setKabupatenLoading(false);
      }
    };
    fetchKabupaten();
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [provinsiFilter]);

  useEffect(() => {
    if (!kabupatenFilter || !provinsiFilter) {
      setKecamatanList([]);
      setKecamatanFilter("");
      setKelurahanList([]);
      setKelurahanFilter("");
      return;
    }

    const fetchKecamatan = async () => {
      try {
        setKecamatanLoading(true);
        const params = new URLSearchParams({
          provinsi: provinsiFilter,
          kabupaten: kabupatenFilter,
        });
        const response = await fetch(`/api/admin/locations/kecamatan?${params}`);
        if (response.ok) {
          const result = await response.json();
          setKecamatanList(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching kecamatan:", error);
      } finally {
        setKecamatanLoading(false);
      }
    };
    fetchKecamatan();
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [kabupatenFilter, provinsiFilter]);

  useEffect(() => {
    if (!kecamatanFilter || !kabupatenFilter || !provinsiFilter) {
      setKelurahanList([]);
      setKelurahanFilter("");
      return;
    }

    const fetchKelurahan = async () => {
      try {
        setKelurahanLoading(true);
        const params = new URLSearchParams({
          provinsi: provinsiFilter,
          kabupaten: kabupatenFilter,
          kecamatan: kecamatanFilter,
        });
        const response = await fetch(`/api/admin/locations/kelurahan?${params}`);
        if (response.ok) {
          const result = await response.json();
          setKelurahanList(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching kelurahan:", error);
      } finally {
        setKelurahanLoading(false);
      }
    };
    fetchKelurahan();
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [kecamatanFilter, kabupatenFilter, provinsiFilter]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    setSelectedIds([]); // Clear selections when changing page
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pendaftar.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendaftar.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.length === 0) {
      Swal.fire("Perhatian", "Pilih status dan minimal 1 pendaftar", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Update Massal",
      text: `Yakin ingin update status ${selectedIds.length} pendaftar menjadi "${bulkStatus}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // Blue 600
      cancelButtonColor: "#57534e", // Stone 600
      confirmButtonText: "Ya, Update Semua",
      cancelButtonText: "Batal",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      setBulkUpdating(true);
      const response = await fetch("/api/admin/pendaftar/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status_pendaftaran: bulkStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      Swal.fire("Sukses", "Berhasil update status!", "success");
      setSelectedIds([]);
      setBulkStatus("");
      fetchPendaftar();
    } catch (error) {
      console.error("Error bulk updating:", error);
      Swal.fire("Gagal", "Gagal update status", "error");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (jenjangFilter) params.append("jenjang", jenjangFilter);
      if (jenisKelaminFilter) params.append("jenis_kelamin", jenisKelaminFilter);
      if (tahunAjaranFilter) params.append("tahun_ajaran", tahunAjaranFilter);
      if (provinsiFilter) params.append("provinsi", provinsiFilter);
      if (kabupatenFilter) params.append("kabupaten", kabupatenFilter);
      if (kecamatanFilter) params.append("kecamatan", kecamatanFilter);
      if (kelurahanFilter) params.append("kelurahan", kelurahanFilter);

      const response = await fetch(`/api/admin/pendaftar/export?${params}`);
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();
      const data = result.data;
      const filename = `data-pendaftar-${new Date().toISOString().split("T")[0]}`;

      if (type === "excel") {
        exportToExcel(data, filename, "Data Pendaftar");
      } else {
        // Transform for PDF
        const headers = Object.keys(data[0] || {});
        const rows = data.map((item: any) => Object.values(item));
        exportToPDF("Data Pendaftar Santri Baru", headers, rows, filename, "landscape");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      Swal.fire("Gagal", "Gagal export data", "error");
    } finally {
      setExporting(false);
    }
  };

  // Role Helpers
  // We use the variables defined at the top of the component (canViewKeuangan, isBerkas, isPenguji)
  // which are derived from the session.

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-stone-100 text-stone-700" },
      awaiting_payment: { label: "Draft", color: "bg-stone-100 text-stone-700" },
      payment_verification: { label: "Verifikasi Bayar", color: "bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100" },
      paid: { label: "Terdaftar", color: "bg-brand-blue-100 text-brand-blue-800" },
      verified: { label: "Terdaftar", color: "bg-brand-blue-100 text-brand-blue-800" },
      data_completed: { label: "Data Lengkap", color: "bg-brand-yellow-50 text-brand-yellow-800 border border-brand-yellow-100" },
      docs_uploaded: { label: "Data Lengkap", color: "bg-brand-yellow-50 text-brand-yellow-800 border border-brand-yellow-100" },
      docs_verified: { label: "Berkas Lengkap", color: "bg-emerald-50 text-emerald-800 border border-emerald-100" },
      scheduled: { label: "Berkas Lengkap", color: "bg-emerald-50 text-emerald-800 border border-emerald-100" },
      testing: { label: "Sedang Ujian", color: "bg-violet-100 text-violet-700 border border-violet-200 shadow-sm" },
      tested: { label: "Sudah Ujian", color: "bg-brand-blue-600 text-white shadow-sm" },
      exam_completed: { label: "Sudah Ujian", color: "bg-brand-blue-600 text-white shadow-sm" },
      announced: { label: "Cadangan", color: "bg-brand-yellow-100 text-brand-yellow-800 border border-brand-yellow-200" },
      cadangan: { label: "Cadangan", color: "bg-brand-yellow-100 text-brand-yellow-800 border border-brand-yellow-200" },
      accepted: { label: "Diterima", color: "bg-emerald-600 text-white" },
      rejected: { label: "Ditolak", color: "bg-rose-600 text-white" },
      enrolled: { label: "Sudah Daftar Ulang", color: "bg-emerald-100 text-emerald-800" },
    };

    const statusInfo = statusMap[status] || { label: status, color: "bg-stone-100 text-stone-700" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get active filter label
  const activeFilterLabel = FILTER_LABELS[statusFilter] || "";

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={docInputRef}
        onChange={handleQuickDocUpload}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      <input
        type="file"
        ref={payInputRef}
        onChange={handleQuickPayUpload}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      {/* Back to Dashboard link when filtered */}
      {urlFilter && (
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-brand-blue-600 hover:text-brand-blue-800 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 border border-brand-yellow-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <div className="p-2.5 md:p-4 bg-linear-to-br from-brand-blue-600 to-brand-blue-900 rounded-2xl shadow-xl shadow-brand-blue-900/20 flex-shrink-0">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-brand-yellow-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-3xl font-black text-brand-blue-950 tracking-tight leading-none truncate">
                {activeFilterLabel || "Pendaftar"}
              </h2>
              <p className="text-sm text-stone-600">
                Total: {pagination.total} pendaftar
                {activeFilterLabel && " (difilter)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {userRole && ['admin_super', 'admin', 'penguji'].includes(userRole) && (
              <Link
                href="/dashboard/admin/pendaftar/trash"
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-colors text-sm"
                title="Lihat data terhapus"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sampah</span>
                {trashCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {trashCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => handleExport("excel")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
              title="Download Excel"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
              title="Download PDF"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-brand-yellow-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-brand-blue-900 mb-2 leading-none uppercase tracking-widest text-[10px]">
              <Search className="w-3.5 h-3.5 inline mr-1" />
              Cari Pendaftar
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama, NIK, atau nomor pendaftaran..."
                className="flex-1 w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none text-sm md:text-base font-bold text-brand-blue-950 placeholder:text-ink-400"
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-8 py-3 bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-xl font-black transition-all flex-shrink-0 text-sm md:text-base shadow-lg shadow-brand-blue-700/20 active:scale-95"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-brand-blue-900 mb-2 leading-none uppercase tracking-widest text-[10px]">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950"
            >
              <option value="">Semua Status</option>

              {canViewKeuangan && (
                <optgroup label="--- Pembayaran ---">
                  <option value="belum_bayar">Belum Bayar (Draft)</option>
                  <option value="menunggu_verifikasi_pembayaran">Menunggu Verifikasi Bayar</option>
                  <option value="sudah_bayar">Terdaftar (Sudah Bayar)</option>
                  <option value="pembayaran_ditolak">Pembayaran Ditolak</option>
                </optgroup>
              )}

              {canViewBerkas && (
                <>
                  <optgroup label="--- Data Lengkap ---">
                    <option value="belum_isi_data">Belum Isi Data Lengkap</option>
                    <option value="sudah_isi_data">Sudah Isi Data Lengkap</option>
                  </optgroup>
                  <optgroup label="--- Dokumen ---">
                    <option value="belum_upload_dokumen">Belum Upload Dokumen</option>
                    <option value="menunggu_verifikasi_dokumen" className="font-bold bg-yellow-50">
                      Menunggu Verifikasi Dokumen (Data Lengkap)
                    </option>
                    <option value="dokumen_terverifikasi">Berkas Lengkap (Siap Ujian)</option>
                    <option value="dokumen_ditolak">Dokumen Ditolak</option>
                  </optgroup>
                </>
              )}

              {canViewSeleksi && (
                <>
                  <optgroup label="--- Ujian & Wawancara ---">
                    <option value="terjadwal_ujian" className={isPenguji ? "font-bold bg-purple-50" : ""}>
                      Terjadwal Ujian {isPenguji ? "(PRIORITAS)" : ""}
                    </option>
                    <option value="belum_ujian">Belum Ujian</option>
                    <option value="sudah_ujian">Sudah Ujian</option>
                    <option value="hasil_ujian">Hasil Ujian</option>
                  </optgroup>
                  <optgroup label="--- Penerimaan ---">
                    <option value="diterima">Diterima</option>
                    <option value="belum_daftar_ulang">Belum Daftar Ulang</option>
                    <option value="sudah_daftar_ulang">Sudah Daftar Ulang</option>
                  </optgroup>
                </>
              )}

              <optgroup label="--- Status Individual ---">
                <option value="draft">Draft</option>
                {canViewKeuangan && (
                  <>
                    <option value="payment_verification">Verifikasi Pembayaran</option>
                    <option value="paid">Terdaftar (paid)</option>
                  </>
                )}
                <option value="data_completed">Data Lengkap</option>
                <option value="docs_uploaded">Data Lengkap (docs)</option>
                <option value="docs_verified">Berkas Lengkap</option>
                <option value="scheduled">Berkas Lengkap (scheduled)</option>
                <option value="cadangan">Cadangan</option>
                <option value="accepted">Diterima</option>
                <option value="rejected">Ditolak</option>
                <option value="enrolled">Sudah Daftar Ulang</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Gender Filter */}
          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Filter Putra / Putri
            </label>
            <select
              value={jenisKelaminFilter}
              onChange={(e) => {
                setJenisKelaminFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950"
            >
              <option value="">Semua (Putra & Putri)</option>
              <option value="L">Putra (Laki-laki)</option>
              <option value="P">Putri (Perempuan)</option>
            </select>
          </div>

          {/* Jenjang Filter */}
          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Filter Jenjang Sekolah
            </label>
            <select
              value={jenjangFilter}
              onChange={(e) => {
                setJenjangFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950"
            >
              <option value="">Semua Jenjang</option>
              <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
              <option value="IL">I'dadiyah Lughawiy</option>
            </select>
          </div>

          {/* Tahun Ajaran Filter */}
          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Filter Tahun Ajaran
            </label>
            <select
              value={tahunAjaranFilter}
              onChange={(e) => {
                setTahunAjaranFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950"
            >
              <option value="">Semua Tahun Ajaran</option>
              {tahunAjaranList.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} {ta.is_active && "⭐"}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(search || statusFilter || jenjangFilter || tahunAjaranFilter || jenisKelaminFilter) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter("");
                  setJenjangFilter("");
                  setJenisKelaminFilter("");
                  setTahunAjaranFilter("");
                  // Clear location filters
                  setProvinsiFilter("");
                  setKabupatenFilter("");
                  setKecamatanFilter("");
                  setKelurahanFilter("");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-medium transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Location cascading filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Provinsi {provinsiLoading && <span className="inline-block ml-2 text-[8px] text-stone-500 italic">Memuat...</span>}
            </label>
            <select
              value={provinsiFilter}
              onChange={(e) => setProvinsiFilter(e.target.value)}
              aria-label="Filter provinsi"
              aria-busy={provinsiLoading}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950"
            >
              <option value="">Semua Provinsi</option>
              {provinsiList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Kabupaten / Kota {kabupatenLoading && <span className="inline-block ml-2 text-[8px] text-stone-500 italic">Memuat...</span>}
            </label>
            <select
              value={kabupatenFilter}
              onChange={(e) => setKabupatenFilter(e.target.value)}
              disabled={kabupatenList.length === 0 || kabupatenLoading}
              aria-label="Filter kabupaten atau kota"
              aria-busy={kabupatenLoading}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950 disabled:opacity-50"
            >
              <option value="">Semua Kabupaten / Kota</option>
              {kabupatenList.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Kecamatan {kecamatanLoading && <span className="inline-block ml-2 text-[8px] text-stone-500 italic">Memuat...</span>}
            </label>
            <select
              value={kecamatanFilter}
              onChange={(e) => setKecamatanFilter(e.target.value)}
              disabled={kecamatanList.length === 0 || kecamatanLoading}
              aria-label="Filter kecamatan"
              aria-busy={kecamatanLoading}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950 disabled:opacity-50"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-brand-blue-900 mb-2 leading-none uppercase tracking-widest">
              Kelurahan {kelurahanLoading && <span className="inline-block ml-2 text-[8px] text-stone-500 italic">Memuat...</span>}
            </label>
            <select
              value={kelurahanFilter}
              onChange={(e) => setKelurahanFilter(e.target.value)}
              disabled={kelurahanList.length === 0 || kelurahanLoading}
              aria-label="Filter kelurahan"
              aria-busy={kelurahanLoading}
              className="w-full px-4 py-3 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-xl focus:border-brand-blue-500 focus:bg-white focus:outline-none font-bold text-brand-blue-950 disabled:opacity-50"
            >
              <option value="">Semua Kelurahan</option>
              {kelurahanList.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {
        selectedIds.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-900">
                    {selectedIds.length} item terpilih
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-purple-600 hover:text-purple-800 underline"
                >
                  Batalkan pilihan
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none font-bold text-purple-900"
                >
                  <option value="" disabled={bulkStatus !== ""}>Pilih status baru...</option>
                  <option value="draft">Draft</option>
                  <option value="awaiting_payment">Menunggu Pembayaran</option>
                  <option value="paid">Sudah Bayar</option>
                  <option value="data_completed">Data Lengkap</option>
                  <option value="docs_uploaded">Dokumen Terupload</option>
                  <option value="docs_verified">Dokumen Terverifikasi</option>
                  <option value="scheduled">Terjadwal Ujian</option>
                  <option value="testing">Sedang Ujian</option>
                  <option value="tested">Sudah Ujian</option>
                  <option value="announced">Diumumkan</option>
                  <option value="accepted">Diterima</option>
                  <option value="rejected">Ditolak</option>
                  <option value="enrolled">Terdaftar</option>
                </select>

                <button
                  onClick={handleBulkUpdate}
                  disabled={!bulkStatus || bulkUpdating}
                  className="flex items-center justify-center gap-2 px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 active:scale-95 text-sm"
                >
                  {bulkUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-brand-yellow-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-stone-600">Memuat data pendaftar...</p>
            </div>
          </div>
        ) : pendaftar.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 text-lg font-medium">
              Tidak ada pendaftar ditemukan
            </p>
            <p className="text-stone-500 text-sm mt-2">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View — hanya tampil di layar kecil */}
            <div className="md:hidden divide-y divide-brand-yellow-50">
              {pendaftar.map((item) => (
                <div key={item.id} className={`p-5 ${selectedIds.includes(item.id) ? 'bg-purple-50' : 'bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleSelectOne(item.id)} className="mt-1 shrink-0 text-purple-600">
                      {selectedIds.includes(item.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-stone-400" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-brand-blue-700 bg-brand-blue-50 px-2 py-0.5 rounded">
                          {item.nomor_pendaftaran}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          {item.jenjang}
                        </span>
                      </div>
                      <p className="font-black text-brand-blue-950 leading-tight text-sm">{toTitleCase(item.nama_lengkap)}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {["L", "Laki-laki"].includes(item.jenis_kelamin) ? "Laki-laki" : "Perempuan"}
                        {item.no_hp && <> &bull; {item.no_hp}</>}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {formatStatus(item.status_pendaftaran)}
                        <span className="text-[10px] text-stone-500">{formatDate(item.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                         <button
                           onClick={() => {
                             setSelectedPendaftarId(item.id);
                             setSelectedDocType('kartu_keluarga');
                             setTimeout(() => docInputRef.current?.click(), 100);
                           }}
                           className="px-2 py-1 bg-brand-blue-50 text-brand-blue-700 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border border-brand-blue-100"
                         >
                           <UploadCloud className="w-3 h-3" /> KK
                         </button>
                         <button
                           onClick={() => {
                             setSelectedPendaftarId(item.id);
                             setSelectedDocType('akta_kelahiran');
                             setTimeout(() => docInputRef.current?.click(), 100);
                           }}
                           className="px-2 py-1 bg-brand-blue-50 text-brand-blue-700 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border border-brand-blue-100"
                         >
                           <UploadCloud className="w-3 h-3" /> Akta
                         </button>
                         {item.pembayaran && item.pembayaran.length > 0 && (
                           <button
                             onClick={() => {
                               setSelectedPayId(item.pembayaran![0].id);
                               setTimeout(() => payInputRef.current?.click(), 100);
                             }}
                             className="px-2 py-1 bg-brand-yellow-50 text-brand-yellow-700 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border border-brand-yellow-100"
                           >
                             <CreditCard className="w-3 h-3" /> Bayar
                           </button>
                         )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/dashboard/admin/pendaftar/${item.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-xl text-xs font-black transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" /> Buka Detail
                        </Link>
                        {userRole && ['admin_super', 'admin', 'penguji'].includes(userRole) && (
                          <>
                            <button
                              onClick={() => handleOpenAnnouncement(item)}
                              className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all active:scale-95"
                              title="Input Hasil Seleksi"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="px-3 py-2.5 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-black transition-all active:scale-95"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View — disembunyikan di mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-brand-blue-50 to-brand-yellow-50 border-b border-brand-yellow-100">
                    <tr>
                      <th className="px-4 py-4 text-center">
                        <button
                          onClick={handleSelectAll}
                          className="text-brand-blue-600 hover:text-brand-blue-800"
                        >
                          {selectedIds.length === pendaftar.length ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        No. Pendaftaran
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Nama Lengkap
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        NIK
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Kontak
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Jenjang
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Status Berkas
                      </th>
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Status Pendaftaran
                      </th>
                      {canViewKeuangan && (
                        <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                          Bayar
                        </th>
                      )}
                      <th className="px-4 py-4 text-left text-[10px] font-black text-brand-blue-900 uppercase tracking-widest">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {pendaftar.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50 transition-colors ${selectedIds.includes(item.id) ? "bg-purple-50" : ""
                          }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSelectOne(item.id)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            {selectedIds.includes(item.id) ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-600" />
                            <span className="font-mono text-sm font-bold text-blue-700">
                              {item.nomor_pendaftaran}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-bold text-stone-900">
                              {toTitleCase(item.nama_lengkap)}
                            </div>
                            <div className="text-xs text-stone-600 font-medium">
                              {["L", "Laki-laki"].includes(item.jenis_kelamin) ? "Laki-laki" : "Perempuan"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-stone-700">
                            {item.nik}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm space-y-1">
                            {item.no_hp && (
                              <div className="flex items-center gap-1 text-stone-600">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{item.no_hp}</span>
                              </div>
                            )}
                            {item.email && (
                              <div className="flex items-center gap-1 text-stone-600">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs truncate max-w-[150px]">
                                  {item.email}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {item.jenjang}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.dokumen && item.dokumen.every((d: any) => d.status_verifikasi === 'verified') && item.dokumen.length > 0
                            ? "bg-green-100 text-green-800"
                            : item.dokumen && item.dokumen.some((d: any) => d.status_verifikasi === 'rejected')
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {item.dokumen && item.dokumen.every((d: any) => d.status_verifikasi === 'verified') && item.dokumen.length > 0
                              ? "Lengkap"
                              : item.dokumen && item.dokumen.length > 0
                                ? "Perlu Cek"
                                : "Belum Upload"}
                          </span>
                          <div className="text-xs text-stone-600 font-medium mt-1">
                            {item.dokumen?.length || 0} Dokumen
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {formatStatus(item.status_pendaftaran)}
                        </td>
                        {canViewKeuangan && (
                          <td className="px-4 py-3">
                            {item.pembayaran && item.pembayaran.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-center w-full ${
                                  item.pembayaran[0].status_pembayaran === 'verified' ? 'bg-green-100 text-green-700' :
                                    item.pembayaran[0].status_pembayaran === 'pending' ? 'bg-amber-100 text-amber-700' :
                                      'bg-stone-100 text-stone-700'
                                  }`}>
                                  {item.pembayaran[0].status_pembayaran === 'verified' ? 'Lunas' :
                                    item.pembayaran[0].status_pembayaran === 'pending' ? 'Cek' : 'Belum'}
                                </span>
                                {item.pembayaran && item.pembayaran.length > 0 && (
                                  <button
                                   onClick={() => {
                                     setSelectedPayId(item.pembayaran![0].id);
                                     setTimeout(() => payInputRef.current?.click(), 100);
                                   }}
                                   className="px-2 py-1 bg-brand-yellow-50 text-brand-yellow-700 hover:bg-brand-yellow-100 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1 border border-brand-yellow-100 transition-colors"
                                   title="Upload Bukti Bayar"
                                 >
                                   <CreditCard className="w-3 h-3" /> Upload
                                 </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-stone-500 text-xs">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                               onClick={() => {
                                 setSelectedPendaftarId(item.id);
                                 setSelectedDocType('kartu_keluarga');
                                 setTimeout(() => docInputRef.current?.click(), 100);
                               }}
                               className="px-2 py-1 bg-brand-blue-50 text-brand-blue-700 hover:bg-brand-blue-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border border-brand-blue-100 transition-colors"
                               title="Upload KK"
                             >
                               <UploadCloud className="w-3 h-3" /> KK
                             </button>
                             <button
                               onClick={() => {
                                 setSelectedPendaftarId(item.id);
                                 setSelectedDocType('akta_kelahiran');
                                 setTimeout(() => docInputRef.current?.click(), 100);
                               }}
                               className="px-2 py-1 bg-brand-blue-50 text-brand-blue-700 hover:bg-brand-blue-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 border border-brand-blue-100 transition-colors"
                               title="Upload Akta"
                             >
                               <UploadCloud className="w-3 h-3" /> Akta
                             </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/admin/pendaftar/${item.id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-brand-blue-700/20 active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </Link>
                            {/* Super Admin Action: Input Hasil Seleksi */}
                            {userRole === 'admin_super' && (
                              <button
                                onClick={() => handleOpenAnnouncement(item)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                                title="Hasil Seleksi"
                              >
                                <FileCheck className="w-4 h-4" />
                              </button>
                            )}
                            {userRole === 'admin_super' && (
                              <button
                                onClick={() => handleOpenDelete(item)}
                                className="p-1.5 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white rounded-lg transition-all"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-stone-50 px-6 py-4 border-t-2 border-blue-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-stone-600 text-center md:text-left">
                  Menampilkan{" "}
                  <span className="font-bold text-stone-900">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-stone-900">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-stone-900">
                    {pagination.total}
                  </span>{" "}
                  pendaftar
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 md:px-4 py-2 bg-white border-2 border-stone-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[200px] md:max-w-none px-1 hide-scrollbar">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and adjacent pages
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - pagination.page) <= 1
                        );
                      })
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center gap-2 shrink-0">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="text-stone-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium transition-colors text-sm md:text-base ${page === pagination.page
                              ? "bg-blue-600 text-white"
                              : "bg-white border-2 border-stone-200 hover:bg-blue-50 hover:border-blue-300"
                              }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 md:px-4 py-2 bg-white border-2 border-stone-200 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Announcement Modal */}
      {isAnnouncementModalOpen && selectedPendaftar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border-2 border-stone-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Input Hasil Seleksi</h3>
                <p className="text-sm text-stone-500 mt-1">{toTitleCase(selectedPendaftar.nama_lengkap)}</p>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAnnouncement} className="p-6 space-y-4">
              {/* Status Kelulusan */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Status Kelulusan</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Lulus", "Cadangan", "Tidak Lulus"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAnnouncementForm({ ...announcementForm, status_kelulusan: status })}
                      className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${announcementForm.status_kelulusan === status
                        ? status === "Lulus"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : status === "Cadangan"
                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                            : "border-red-500 bg-red-50 text-red-700"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catatan (Opsional) */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Catatan (Opsional)</label>
                <textarea
                  rows={3}
                  value={announcementForm.catatan}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, catatan: e.target.value })}
                  placeholder="Tambahkan catatan khusus jika ada..."
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Link SK (Surat Keputusan) */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Link SK (Google Drive / PDF)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="url"
                    value={announcementForm.surat_keputusan_url}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, surat_keputusan_url: e.target.value })}
                    placeholder="https://docs.google.com/..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Masukkan link file Surat Keputusan (SK) atau Surat Pengumuman yang bisa diunduh oleh pendaftar.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-6 py-2.5 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                  disabled={isSubmittingAnnouncement}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAnnouncement}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAnnouncement ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Hasil
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingPendaftar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border-2 border-red-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Hapus Data Pendaftar</h3>
                  <p className="text-sm text-stone-500">Data akan dipindahkan ke Sampah</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Anda akan menghapus data <strong>{toTitleCase(deletingPendaftar.nama_lengkap)}</strong> ({deletingPendaftar.nomor_pendaftaran}).
                  Data akan dipindahkan ke Sampah dan bisa di-restore kapan saja.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Ketik <span className="text-red-600">{toTitleCase(deletingPendaftar.nama_lengkap)}</span> untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Ketik nama lengkap pendaftar..."
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleSoftDelete}
                  disabled={isDeleting || deleteConfirmName.trim().toLowerCase() !== deletingPendaftar.nama_lengkap.trim().toLowerCase()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Hapus Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

export default function AdminPendaftarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Memuat halaman...</p>
        </div>
      </div>
    }>
      <AdminPendaftarContent />
    </Suspense>
  );
}
