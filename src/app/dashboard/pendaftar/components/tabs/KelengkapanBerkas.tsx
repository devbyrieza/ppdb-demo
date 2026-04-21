"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Loader2,
  Download,
  ClipboardList,
  User,
  MapPin,
  School,
  Activity,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  AlertTriangle,
} from "lucide-react";
import DataLengkapForm from "./DataLengkapForm";

// ============================================
// TYPES
// ============================================

type DokumenStatus = "pending" | "uploaded" | "verified" | "rejected";
type TabType = "isi-data" | "data";

interface DokumenItem {
  key: string;
  label: string;
  required: boolean;
  status: DokumenStatus;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  is_verified: boolean;
  catatan: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
}

interface DokumenConfig {
  label: string;
  maxSize: number;
  allowedTypes: string[];
  required: boolean;
}

interface UploadProgress {
  [key: string]: number;
}

interface DataPendaftaran {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  email: string;
  nomor_ponsel: string;
  [key: string]: any;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return Image;
  return FileText;
}

function getStatusColor(status: DokumenStatus) {
  switch (status) {
    case "verified":
      return "text-emerald-600 bg-emerald-50";
    case "uploaded":
      return "text-blue-600 bg-blue-50";
    case "rejected":
      return "text-red-600 bg-red-50";
    default:
      return "text-ink-600 bg-surface-100";
  }
}

function getStatusIcon(status: DokumenStatus) {
  switch (status) {
    case "verified":
      return CheckCircle;
    case "uploaded":
      return Clock;
    case "rejected":
      return XCircle;
    default:
      return AlertCircle;
  }
}

function getStatusLabel(status: DokumenStatus) {
  switch (status) {
    case "verified":
      return "Terverifikasi";
    case "uploaded":
      return "Berhasil Diupload";
    case "rejected":
      return "Ditolak";
    default:
      return "Belum Diupload";
  }
}

// ============================================
// DOKUMEN CARD COMPONENT
// ============================================

interface DokumenCardProps {
  dokumen: DokumenItem;
  config: DokumenConfig | undefined;
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => void;
  onPreview: () => void;
}

function DokumenCard({
  dokumen,
  config,
  isUploading,
  uploadProgress,
  onUpload,
  onPreview,
}: DokumenCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const StatusIcon = getStatusIcon(dokumen.status);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onUpload(files[0]);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onUpload(files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUpload]
  );

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const allowedExtensions = config?.allowedTypes
    .map((t) => {
      if (t === "image/jpeg") return "JPG";
      if (t === "image/png") return "PNG";
      if (t === "application/pdf") return "PDF";
      return t;
    })
    .join(", ");

  const maxSizeDisplay = config ? formatFileSize(config.maxSize) : "-";

  return (
    <div
      className={`card-glass transition-all duration-300 overflow-hidden ${isDragging
        ? "border-brand-blue-600 bg-brand-blue-50/50 scale-[1.02]"
        : dokumen.status === "verified"
          ? "border-emerald-200"
          : dokumen.status === "rejected"
            ? "border-red-200"
            : dokumen.status === "uploaded"
              ? "border-brand-blue-200"
              : "border-white/40 hover:border-brand-blue-300"
        }`}
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(
                dokumen.status
              )}`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-ink-900">{dokumen.label}</h4>
                {dokumen.required ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-lg">
                    Wajib
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-200 text-ink-600 rounded-lg">
                    Opsional
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-600 font-medium">
                {getStatusLabel(dokumen.status)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dokumen.status !== "pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                className="p-2 text-ink-600 hover:text-brand-blue-700 hover:bg-brand-blue-50 rounded-xl transition-colors"
                title="Lihat Dokumen"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-ink-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-ink-600" />
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-brand-blue-700 uppercase tracking-widest">MENGUPLOAD...</span>
              <span className="text-ink-600">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-brand-blue-500 to-brand-blue-700 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-ink-100/50 pt-4">
          {dokumen.status !== "pending" && dokumen.file_name && (
            <div className="mb-4 p-4 bg-surface-50 rounded-xl border border-ink-100">
              <div className="flex items-center gap-4">
                {(() => {
                  const FileIcon = getFileIcon(dokumen.file_type);
                  return (
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-ink-100 shadow-sm">
                      <FileIcon className="w-6 h-6 text-ink-600" />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900 truncate text-sm">
                    {dokumen.file_name}
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {formatFileSize(dokumen.file_size || 0)} &bull;{" "}
                    {dokumen.uploaded_at
                      ? new Date(dokumen.uploaded_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                      : "-"}
                  </p>
                </div>
              </div>

              {dokumen.status === "rejected" && dokumen.catatan && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Catatan:</strong> {dokumen.catatan}
                  </p>
                </div>
              )}

              {dokumen.status === "verified" && dokumen.verified_at && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">
                    ✓ Diverifikasi pada{" "}
                    {new Date(dokumen.verified_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${isDragging
              ? "border-brand-blue-600 bg-brand-blue-50"
              : "border-ink-200 hover:border-brand-blue-400 hover:bg-surface-50"
              } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={config?.allowedTypes.join(",")}
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-brand-blue-500 animate-spin" />
              ) : (
                <div className="w-14 h-14 bg-brand-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-7 h-7 text-brand-blue-700" />
                </div>
              )}
              <div>
                <p className="font-bold text-ink-900">
                  {dokumen.status === "pending"
                    ? "Klik atau seret file ke sini"
                    : "Upload ulang file"}
                </p>
                <p className="text-xs text-ink-600 mt-1 font-medium bg-surface-100 inline-block px-2 py-1 rounded">
                  {allowedExtensions} &bull; Maks {maxSizeDisplay}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function KelengkapanBerkasTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("isi-data");
  const [dokumenList, setDokumenList] = useState<DokumenItem[]>([]);
  const [dokumenConfig, setDokumenConfig] = useState<
    Record<string, DokumenConfig>
  >({});
  const [dataPendaftaran, setDataPendaftaran] = useState<DataPendaftaran | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [summary, setSummary] = useState<{
    progress: {
      required: { total: number; uploaded: number; percentage: number };
      all: { total: number; uploaded: number; percentage: number };
    };
  } | null>(null);
  const [isDataComplete, setIsDataComplete] = useState(false);
  const [missingSections, setMissingSections] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch data
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const [statusRes, configRes, dataRes] = await Promise.all([
        fetch("/api/dokumen/status"),
        fetch("/api/upload/dokumen"),
        fetch("/api/dashboard/pendaftar-data"),
      ]);

      const statusData = await statusRes.json();
      const configData = await configRes.json();
      const registerData = await dataRes.json();

      if (!statusData.success) {
        throw new Error(statusData.error || "Gagal memuat data dokumen");
      }

      setDokumenList(statusData.data.dokumen);
      setSummary(statusData.data.summary);

      if (configData.success) {
        setDokumenConfig(configData.data);
      }

      if (registerData.success && registerData.data) {
        const pendaftar = registerData.data;
        setDataPendaftaran(pendaftar);

        // Calculate Completion
        const d = pendaftar.data_lengkap || {};
        const missing: string[] = [];

        // Check Santri
        const s = d.santri || {};
        // NIK can come from pendaftar top level or JSON blob
        const santriNik = s.nik || pendaftar.nik;

        const isSantriBasic = s.nama_lengkap && santriNik && s.tempat_lahir && s.tanggal_lahir && s.provinsi && s.kabupaten && s.kecamatan && s.kelurahan && s.kode_pos && s.alamat && s.rt && s.rw;
        const isSantriPhysical = s.anak_ke && s.berapa_bersaudara && s.golongan_darah && (s.tinggi_badan > 0) && (s.berat_badan > 0) && s.riwayat_penyakit;
        const isSekolahComplete = s.asal_sekolah && s.nisn && s.tahun_lulus;

        if (!isSantriBasic) missing.push("Identitas Santri");
        if (!isSantriPhysical) missing.push("Data Fisik Santri");
        if (!isSekolahComplete) missing.push("Data Sekolah");

        // Check Ortu
        const ayah = d.ayah || {};
        const ibu = d.ibu || {};
        const isAyahDeceased = ayah.status_hidup === "Sudah Meninggal";
        const isIbuDeceased = ibu.status_hidup === "Sudah Meninggal";

        // Logic tinggal bersama
        const isAyahAddressRequired = !isAyahDeceased && !["Kedua Orang Tua", "Ayah"].includes(s.tinggal_bersama);
        const isIbuAddressRequired = !isIbuDeceased && !["Kedua Orang Tua", "Ibu"].includes(s.tinggal_bersama);
        const isWaliAddressRequired = s.tinggal_bersama !== "Wali";

        if (!isAyahDeceased && (
          !ayah.nama_lengkap || !ayah.nik || !ayah.tanggal_lahir || !ayah.pendidikan_terakhir || !ayah.pekerjaan || !ayah.no_hp || !ayah.no_wa ||
          (isAyahAddressRequired && (!ayah.alamat || !ayah.rt || !ayah.rw || !ayah.provinsi || !ayah.kabupaten))
        )) {
          missing.push("Data Ayah");
        }

        if (!isIbuDeceased && (
          !ibu.nama_lengkap || !ibu.nik || !ibu.tanggal_lahir || !ibu.pendidikan_terakhir || !ibu.pekerjaan || !ibu.no_hp || !ibu.no_wa ||
          (isIbuAddressRequired && (!ibu.alamat || !ibu.rt || !ibu.rw || !ibu.provinsi || !ibu.kabupaten))
        )) {
          missing.push("Data Ibu");
        }

        // Check Wali if both parents deceased or lives with wali
        if ((isAyahDeceased && isIbuDeceased) || s.tinggal_bersama === "Wali") {
          const wali = d.wali || {};
          if (!wali.nama_lengkap || !wali.nik || !wali.hubungan || !wali.no_hp ||
            (isWaliAddressRequired && (!wali.alamat || !wali.rt || !wali.rw || !wali.provinsi || !wali.kabupaten))
          ) {
            missing.push("Data Wali");
          }
        }

        setMissingSections(missing);
        setIsDataComplete(missing.length === 0);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab === "data");
  }, [fetchData, activeTab]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleUpload = async (key: string, file: File) => {
    try {
      setUploadingKeys((prev) => new Set(prev).add(key));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenis_dokumen", key);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[key] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [key]: current + 10 };
        });
      }, 200);

      const response = await fetch("/api/upload/dokumen", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [key]: 100 }));

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal mengupload file");
      }

      showToast("success", data.message || "File berhasil diupload");
      await fetchData(true);
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengupload file");
    } finally {
      setUploadingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[key];
        return newProgress;
      });
    }
  };

  const handlePreview = async (dokumen: DokumenItem) => {
    if (!dokumen.file_path) return;

    try {
      const response = await fetch(`/api/dokumen/preview?jenis=${dokumen.key}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal membuat link preview");
      }

      window.open(data.data.url, "_blank");
    } catch (err: any) {
      showToast("error", err.message || "Gagal membuka preview");
    }
  };

  const handleDownload = async (dokumen: DokumenItem) => {
    try {
      const response = await fetch(
        `/api/dokumen/download?jenis=${dokumen.key}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal mendownload file");
      }

      window.open(data.data.url, "_blank");
      showToast("success", "Download dimulai...");
    } catch (err: any) {
      showToast("error", err.message || "Gagal mendownload file");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-ink-600 font-medium">Memuat data dokumen...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab !== "data") {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={() => fetchData()}
            className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-clay-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === "success"
            ? "bg-emerald-500 text-white shadow-emerald-500/20"
            : "bg-red-500 text-white shadow-red-500/20"
            }`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4 opacity-0" /> {/* Spacer */}
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
      )}
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-blue-700 to-brand-blue-900 border border-brand-blue-600 p-8 md:p-10 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-yellow-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
            <ClipboardList className="w-8 h-8 text-brand-yellow-100" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white font-display">Kelengkapan Data & Berkas</h1>
            <p className="text-brand-yellow-100/90 font-medium max-w-xl text-sm md:text-base">Lengkapi biodata diri dan upload dokumen persyaratan untuk melanjutkan proses seleksi.</p>
          </div>
        </div>
      </div>
      <div className="bg-brand-yellow-50 border border-brand-yellow-200 p-2 rounded-full flex flex-wrap gap-1 shadow-sm mx-auto max-w-xl">
        {[
          { id: "isi-data", label: "Isi Data Lengkap", icon: User },
          { id: "data", label: "Lihat Data", icon: Eye },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-pill text-sm font-black transition-all duration-300 group ${isActive
                ? 'bg-brand-blue-700 text-white shadow-md'
                : 'text-ink-600 hover:bg-brand-yellow-100 hover:text-brand-blue-800'
                }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-yellow-200' : 'text-ink-600 group-hover:text-brand-blue-800'}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab: Isi Data Lengkap */}
      {activeTab === "isi-data" && (
        <div className="bg-transparent">
          <DataLengkapForm onSuccess={() => {
            fetchData(true);
            setActiveTab("data");
            // Scroll to top to see ringkasan
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
      )}

      {/* Tab: Lihat Data */}
      {activeTab === "data" && (
        <div className="glass-panel p-8 rounded-[2rem] shadow-sm border border-brand-yellow-200 app-card">
          {dataPendaftaran ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-brand-yellow-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Ringkasan Data</h2>
                  <p className="text-ink-600 text-sm">Data yang telah tersimpan di sistem</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-surface-50 p-6 rounded-3xl border border-ink-100 shadow-inner">
                <div className="md:col-span-2 lg:col-span-1">
                  <p className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] mb-1">Nomor Pendaftaran</p>
                  <p className="text-xl font-black text-brand-blue-700 font-mono">{dataPendaftaran.nomor_pendaftaran}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] mb-1">Nama Lengkap Santri</p>
                  <p className="text-base font-bold text-ink-900">{dataPendaftaran.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] mb-1">NIK Santri</p>
                  <p className="text-base font-bold text-ink-900">{dataPendaftaran.data_lengkap?.santri?.nik || dataPendaftaran.nik || "-"}</p>
                </div>
              </div>

              {/* Detail Data Tables */}
              <div className="space-y-6">
                {/* 1. Identitas Lengkap */}
                <div className="bg-white border border-ink-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-surface-50 px-6 py-4 border-b border-ink-100 flex items-center gap-3">
                    <User className="w-5 h-5 text-brand-blue-700" />
                    <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">Identitas & Fisik</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                    <SummaryItem label="Tempat, Tgl Lahir" value={`${dataPendaftaran.data_lengkap?.santri?.tempat_lahir || "-"}, ${dataPendaftaran.data_lengkap?.santri?.tanggal_lahir || "-"}`} />
                    <SummaryItem label="Jenis Kelamin" value={dataPendaftaran.data_lengkap?.santri?.jenis_kelamin || "-"} />
                    <SummaryItem label="Kewarganegaraan" value={dataPendaftaran.data_lengkap?.santri?.kewarganegaraan || "-"} />
                    <SummaryItem label="Anak Ke / Bersaudara" value={`${dataPendaftaran.data_lengkap?.santri?.anak_ke || 0} dari ${dataPendaftaran.data_lengkap?.santri?.berapa_bersaudara || 0}`} />
                    <SummaryItem label="Tinggi / Berat Badan" value={`${dataPendaftaran.data_lengkap?.santri?.tinggi_badan || 0} cm / ${dataPendaftaran.data_lengkap?.santri?.berat_badan || 0} kg`} />
                    <SummaryItem label="Golongan Darah" value={dataPendaftaran.data_lengkap?.santri?.golongan_darah || "-"} />
                    <SummaryItem label="Tinggal Bersama" value={dataPendaftaran.data_lengkap?.santri?.tinggal_bersama || "-"} />
                    <SummaryItem label="Riwayat Penyakit" value={dataPendaftaran.data_lengkap?.santri?.riwayat_penyakit || "-"} />
                    <div className="md:col-span-2">
                      <SummaryItem label="Alamat Domisili" value={`${dataPendaftaran.data_lengkap?.santri?.alamat || "-"}, RT ${dataPendaftaran.data_lengkap?.santri?.rt || "00"}/RW ${dataPendaftaran.data_lengkap?.santri?.rw || "00"}, ${dataPendaftaran.data_lengkap?.santri?.kelurahan || "-"}, ${dataPendaftaran.data_lengkap?.santri?.kecamatan || "-"}, ${dataPendaftaran.data_lengkap?.santri?.kabupaten || "-"}, ${dataPendaftaran.data_lengkap?.santri?.provinsi || "-"}`} />
                    </div>
                  </div>
                </div>

                {/* 2. Sekolah Asal */}
                <div className="bg-white border border-ink-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-surface-50 px-6 py-4 border-b border-ink-100 flex items-center gap-3">
                    <School className="w-5 h-5 text-brand-blue-700" />
                    <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">Sekolah Asal</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                    <SummaryItem label="Nama Sekolah" value={dataPendaftaran.data_lengkap?.santri?.asal_sekolah || "-"} />
                    <SummaryItem label="NISN" value={dataPendaftaran.data_lengkap?.santri?.nisn || "-"} />
                    <SummaryItem label="Tahun Lulus" value={dataPendaftaran.data_lengkap?.santri?.tahun_lulus || "-"} />
                    <div className="md:col-span-2">
                      <SummaryItem label="Alamat Sekolah" value={dataPendaftaran.data_lengkap?.santri?.alamat_sekolah || "-"} />
                    </div>
                  </div>
                </div>

                {/* 3. Orang Tua / Wali */}
                <div className="bg-white border border-ink-100 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-surface-50 px-6 py-4 border-b border-ink-100 flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-blue-700" />
                    <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider">Orang Tua / Wali</h3>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Ayah */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-ink-50 pb-2">
                          <h4 className="font-black text-xs text-ink-600 uppercase tracking-[0.2em]">Data Ayah</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dataPendaftaran.data_lengkap?.ayah?.status_hidup === "Masih Hidup" ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
                            {dataPendaftaran.data_lengkap?.ayah?.status_hidup || "Masih Hidup"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <SummaryItem label="Nama Lengkap" value={dataPendaftaran.data_lengkap?.ayah?.nama_lengkap || "-"} />
                          <SummaryItem label="NIK" value={dataPendaftaran.data_lengkap?.ayah?.nik || "-"} />
                          <SummaryItem label="Tempat, Tgl Lahir" value={`${dataPendaftaran.data_lengkap?.ayah?.tempat_lahir || "-"}, ${dataPendaftaran.data_lengkap?.ayah?.tanggal_lahir || "-"}`} />
                          <SummaryItem label="Pendidikan" value={dataPendaftaran.data_lengkap?.ayah?.pendidikan_terakhir || "-"} />
                          <SummaryItem label="Pekerjaan" value={`${dataPendaftaran.data_lengkap?.ayah?.pekerjaan}${dataPendaftaran.data_lengkap?.ayah?.pekerjaan === "Lainnya" ? ` (${dataPendaftaran.data_lengkap?.ayah?.pekerjaan_lainnya})` : ""} ` || "-"} />
                          <SummaryItem label="Penghasilan" value={dataPendaftaran.data_lengkap?.ayah?.penghasilan || "-"} />
                          <SummaryItem label="WhatsApp/HP" value={`${dataPendaftaran.data_lengkap?.ayah?.no_wa || "-"} / ${dataPendaftaran.data_lengkap?.ayah?.no_hp || "-"}`} />
                          <SummaryItem label="Email" value={dataPendaftaran.data_lengkap?.ayah?.email || "-"} />
                          {dataPendaftaran.data_lengkap?.ayah?.alamat && (
                            <div className="sm:col-span-2">
                              <SummaryItem label="Alamat Ayah (Berbeda)" value={`${dataPendaftaran.data_lengkap?.ayah?.alamat}, RT ${dataPendaftaran.data_lengkap?.ayah?.rt}/RW ${dataPendaftaran.data_lengkap?.ayah?.rw}, ${dataPendaftaran.data_lengkap?.ayah?.kelurahan}, ${dataPendaftaran.data_lengkap?.ayah?.kecamatan}, ${dataPendaftaran.data_lengkap?.ayah?.kabupaten}`} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ibu */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-ink-50 pb-2">
                          <h4 className="font-black text-xs text-ink-600 uppercase tracking-[0.2em]">Data Ibu</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dataPendaftaran.data_lengkap?.ibu?.status_hidup === "Masih Hidup" ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
                            {dataPendaftaran.data_lengkap?.ibu?.status_hidup || "Masih Hidup"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <SummaryItem label="Nama Lengkap" value={dataPendaftaran.data_lengkap?.ibu?.nama_lengkap || "-"} />
                          <SummaryItem label="NIK" value={dataPendaftaran.data_lengkap?.ibu?.nik || "-"} />
                          <SummaryItem label="Tempat, Tgl Lahir" value={`${dataPendaftaran.data_lengkap?.ibu?.tempat_lahir || "-"}, ${dataPendaftaran.data_lengkap?.ibu?.tanggal_lahir || "-"}`} />
                          <SummaryItem label="Pendidikan" value={dataPendaftaran.data_lengkap?.ibu?.pendidikan_terakhir || "-"} />
                          <SummaryItem label="Pekerjaan" value={`${dataPendaftaran.data_lengkap?.ibu?.pekerjaan}${dataPendaftaran.data_lengkap?.ibu?.pekerjaan === "Lainnya" ? ` (${dataPendaftaran.data_lengkap?.ibu?.pekerjaan_lainnya})` : ""} ` || "-"} />
                          <SummaryItem label="Penghasilan" value={dataPendaftaran.data_lengkap?.ibu?.penghasilan || "-"} />
                          <SummaryItem label="WhatsApp/HP" value={`${dataPendaftaran.data_lengkap?.ibu?.no_wa || "-"} / ${dataPendaftaran.data_lengkap?.ibu?.no_hp || "-"}`} />
                          <SummaryItem label="Email" value={dataPendaftaran.data_lengkap?.ibu?.email || "-"} />
                          {dataPendaftaran.data_lengkap?.ibu?.alamat && (
                            <div className="sm:col-span-2">
                              <SummaryItem label="Alamat Ibu (Berbeda)" value={`${dataPendaftaran.data_lengkap?.ibu?.alamat}, RT ${dataPendaftaran.data_lengkap?.ibu?.rt}/RW ${dataPendaftaran.data_lengkap?.ibu?.rw}, ${dataPendaftaran.data_lengkap?.ibu?.kelurahan}, ${dataPendaftaran.data_lengkap?.ibu?.kecamatan}, ${dataPendaftaran.data_lengkap?.ibu?.kabupaten}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {(dataPendaftaran.data_lengkap?.santri?.tinggal_bersama === "Wali" || (dataPendaftaran.data_lengkap?.ayah?.status_hidup === "Sudah Meninggal" && dataPendaftaran.data_lengkap?.ibu?.status_hidup === "Sudah Meninggal")) && (
                      <div className="space-y-4 pt-8 border-t border-ink-50">
                        <h4 className="font-black text-xs text-ink-600 uppercase tracking-[0.2em] border-b border-ink-50 pb-2">Data Wali</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <SummaryItem label="Nama Wali" value={dataPendaftaran.data_lengkap?.wali?.nama_lengkap || "-"} />
                          <SummaryItem label="Hubungan" value={dataPendaftaran.data_lengkap?.wali?.hubungan || "-"} />
                          <SummaryItem label="NIK" value={dataPendaftaran.data_lengkap?.wali?.nik || "-"} />
                          <SummaryItem label="WhatsApp" value={dataPendaftaran.data_lengkap?.wali?.no_wa || "-"} />
                          <SummaryItem label="Pendidikan" value={dataPendaftaran.data_lengkap?.wali?.pendidikan_terakhir || "-"} />
                          <SummaryItem label="Pekerjaan" value={dataPendaftaran.data_lengkap?.wali?.pekerjaan || "-"} />
                          <SummaryItem label="Penghasilan" value={dataPendaftaran.data_lengkap?.wali?.penghasilan || "-"} />
                          <SummaryItem label="Email" value={dataPendaftaran.data_lengkap?.wali?.email || "-"} />
                          <div className="sm:col-span-2 lg:col-span-4">
                            <SummaryItem label="Alamat Wali" value={`${dataPendaftaran.data_lengkap?.wali?.alamat || "-"}, RT ${dataPendaftaran.data_lengkap?.wali?.rt || "00"}/RW ${dataPendaftaran.data_lengkap?.wali?.rw || "00"}, ${dataPendaftaran.data_lengkap?.wali?.kelurahan || "-"}, ${dataPendaftaran.data_lengkap?.wali?.kecamatan || "-"}, ${dataPendaftaran.data_lengkap?.wali?.kabupaten || "-"}, ${dataPendaftaran.data_lengkap?.wali?.provinsi || "-"}`} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isDataComplete ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Data Belum Lengkap</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Anda belum mengisi seluruh data yang wajib diisi pada tab <strong>Isi Data Lengkap</strong>.
                      Bagian yang belum lengkap: <span className="font-bold">{missingSections.join(", ")}</span>.
                      <br />
                      Silakan lengkapi data Anda terlebih dahulu sebelum melakukan konfirmasi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Verifikasi Data Anda</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Silakan pastikan semua data di atas sudah benar. Jika sudah yakin, silakan klik tombol konfirmasi di bawah untuk membuka menu <strong>Upload Berkas</strong>.
                      <br />
                      <span className="text-xs text-emerald-600 mt-2 block italic">* Setelah dikonfirmasi, data tidak bisa diubah lagi kecuali melalui Admin Support.</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setActiveTab("isi-data");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl text-lg font-bold border-2 border-brand-blue-600 text-brand-blue-700 hover:bg-brand-blue-50 transition-all"
                >
                  Kembali Edit Data
                </button>

                <button
                  disabled={!isDataComplete}
                  onClick={() => setShowConfirmModal(true)}
                  className={`w-full sm:w-auto py-3 px-10 rounded-xl text-lg font-black shadow-lg transition-all flex items-center justify-center gap-2 ${isDataComplete
                    ? 'bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 shadow-brand-yellow-400/20 border border-brand-yellow-500'
                    : 'bg-stone-200 text-stone-600 cursor-not-allowed shadow-none'
                    }`}
                >
                  Konfirmasi Data & Lanjut ke Upload Berkas
                  <CheckCircle className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-ink-300" />
              </div>
              <p className="text-ink-600 font-medium">Data pendaftaran belum tersedia.</p>
            </div>
          )}
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center relative">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100 rotate-3">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <h3 className="text-2xl font-black text-ink-900 mb-3 tracking-tight">Konfirmasi Permanen</h3>

            <p className="text-ink-600 mb-8 leading-relaxed">
              Apakah Anda yakin seluruh data sudah benar?
              <span className="block mt-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-sm font-bold border border-amber-100">
                ⚠️ Data yang sudah dikonfirmasi tidak dapat diubah kembali.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-ink-600 bg-surface-100 hover:bg-surface-200 transition-all active:scale-95"
              >
                Periksa Lagi
              </button>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await fetch("/api/pendaftar/konfirmasi-data", { method: "POST" });
                    const result = await res.json();
                    if (result.success) {
                      router.push("/dashboard/pendaftar/upload-berkas");
                    } else {
                      alert(result.error || "Gagal melakukan konfirmasi");
                      setLoading(false);
                      setShowConfirmModal(false);
                    }
                  } catch (err) {
                    alert("Terjadi kesalahan koneksi");
                    setLoading(false);
                    setShowConfirmModal(false);
                  }
                }}
                disabled={loading}
                className="flex-1 py-3.5 px-4 rounded-xl bg-linear-to-r from-brand-yellow-400 to-brand-yellow-500 text-brand-blue-950 font-black hover:shadow-lg hover:shadow-brand-yellow-400/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Lanjut"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] font-black text-ink-600 uppercase tracking-[0.15em] mb-1">{label}</p>
      <p className="text-sm font-bold text-ink-800 break-words">{value}</p>
    </div>
  );
}
