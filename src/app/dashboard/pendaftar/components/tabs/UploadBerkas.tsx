"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Loader2,
  Send,
  Lock,
  ShieldCheck,
  Download,
  MessageCircle,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type DokumenStatus = "pending" | "uploaded" | "verified" | "rejected";

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

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function compressImage(file: File): Promise<File> {
  // Pengecekan apakah file adalah gambar
  const isImageByType = file.type.startsWith("image/");
  const isImageByExt = /\\.(jpe?g|png|webp|heic)$/i.test(file.name);
  
  if (!isImageByType && !isImageByExt) return file;

  // Skip compression for HEIC and WEBP to prevent hanging on unsupported browsers
  if (
    file.type.includes("heic") ||
    file.type.includes("webp") ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".webp")
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Maksimal resolusi (misal 1600px lebar/tinggi)
        const MAX_DIMENSION = 1600;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Kompres kualitas ke 0.7 (70%)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              // Hanya gunakan hasil kompresi jika ukurannya lebih kecil
              resolve(compressedFile.size < file.size ? compressedFile : file);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.7,
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return Image;
  return FileText;
}

function getStatusColor(status: DokumenStatus) {
  switch (status) {
    case "verified":
      return "text-green-600 bg-green-100";
    case "uploaded":
      return "text-primary-600 bg-primary-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-stone-500 bg-stone-100";
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
  onDownload: () => void;
  isLocked: boolean;
}

function DokumenCard({
  dokumen,
  config,
  isUploading,
  uploadProgress,
  onUpload,
  onPreview,
  onDownload,
  isLocked,
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
    [onUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onUpload(files[0]);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUpload],
  );

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Allowed extensions for display
  const allowedExtensions = config?.allowedTypes
    .map((t) => {
      if (t === "image/jpeg") return "JPG/JPEG";
      if (t === "image/png") return "PNG";
      if (t === "application/pdf") return "PDF";
      return t;
    })
    .join(", ");

  const maxSizeDisplay = config ? formatFileSize(config.maxSize) : "-";

  return (
    <div
      className={`group rounded-[1.5rem] border transition-all duration-300 overflow-hidden relative ${
        isDragging
          ? "border-primary-600 bg-primary-50 shadow-lg scale-[1.02] ring-4 ring-primary-600/10"
          : dokumen.status === "verified"
            ? "border-emerald-200 bg-emerald-50/50"
            : dokumen.status === "rejected"
              ? "border-red-200 bg-red-50/50"
              : dokumen.status === "uploaded"
                ? "border-primary-200 bg-primary-50/50"
                : "border-ink-100 bg-white hover:border-primary-300 hover:shadow-lg hover:shadow-primary-950/5"
      }`}
    >
      {/* Status Bar */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors ${
          dokumen.status === "verified"
            ? "bg-emerald-500"
            : dokumen.status === "rejected"
              ? "bg-red-500"
              : dokumen.status === "uploaded"
                ? "bg-primary-500"
                : "bg-transparent group-hover:bg-primary-500"
        }`}
      />

      {/* Header */}
      <div
        className="p-5 pl-7 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all ${
                dokumen.status === "verified"
                  ? "bg-emerald-100 text-emerald-600"
                  : dokumen.status === "rejected"
                    ? "bg-red-100 text-red-600"
                    : dokumen.status === "uploaded"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-surface-100 text-ink-400 group-hover:bg-primary-50 group-hover:text-primary-700"
              }`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-bold text-ink-900 text-lg">
                  {dokumen.label}
                </h4>
                {dokumen.required ? (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-black tracking-wider bg-secondary-100 text-secondary-700 rounded-lg">
                    Wajib
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-black tracking-wider bg-surface-200 text-ink-500 rounded-lg">
                    Opsional
                  </span>
                )}
              </div>
              <p
                className={`text-sm font-medium ${
                  dokumen.status === "verified"
                    ? "text-emerald-700"
                    : dokumen.status === "rejected"
                      ? "text-red-700"
                      : dokumen.status === "uploaded"
                        ? "text-primary-700"
                        : "text-ink-500"
                }`}
              >
                {getStatusLabel(dokumen.status)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Template Download Buttons */}
            {dokumen.key === "surat_kesehatan" && (
              <a
                href="/templates/surat-kesehatan.pdf"
                download="Surat_Keterangan_Kesehatan_AlAndalus.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-[10px] font-black border border-emerald-300 transition-colors shadow-sm"
                title="Download Format Surat Keterangan Kesehatan Panitia"
              >
                <Download className="w-3.5 h-3.5" />
                Download Format
              </a>
            )}
            {(dokumen.key === "pakta_integritas_santri" || dokumen.key === "pakta_integritas_ortu" || dokumen.key === "pakta_integritas") && (
              <a
                href="/templates/pakta-integritas.pdf"
                download="Pakta_Integritas_AlAndalus.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-[10px] font-black border border-emerald-300 transition-colors shadow-sm"
                title="Download Format Pakta Integritas Panitia"
              >
                <Download className="w-3.5 h-3.5" />
                Download Format
              </a>
            )}
            {(dokumen.key === "pernyataan_bebas_negatif" || dokumen.key === "surat_pernyataan" || dokumen.key === "surat_pernyataan_ortu") && (
              <a
                href="/templates/surat-pernyataan.pdf"
                download="Surat_Pernyataan_Orang_Tua_AlAndalus.pdf"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-[10px] font-black border border-emerald-300 transition-colors shadow-sm"
                title="Download Format Surat Pernyataan Orang Tua Panitia"
              >
                <Download className="w-3.5 h-3.5" />
                Download Format
              </a>
            )}
            {dokumen.status !== "pending" && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-ink-400 hover:text-primary-700 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-ink-100"
                  title="Lihat Dokumen"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-ink-400 hover:text-primary-700 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-ink-100"
                  title="Download Dokumen"
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            )}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isExpanded ? "bg-ink-900 text-white" : "bg-surface-100 text-ink-400 group-hover:bg-white group-hover:shadow-sm"}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>

        {/* Progress bar saat upload */}
        {isUploading && (
          <div className="mt-4 bg-white p-3 rounded-xl border border-ink-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-primary-700 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Mengupload...
              </span>
              <span className="text-ink-500">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-7 pb-7 pt-2 border-t border-ink-100/50">
          {/* Info dokumen yang sudah diupload */}
          {dokumen.status !== "pending" && dokumen.file_name && (
            <div className="mb-6 bg-white p-4 rounded-2xl border border-ink-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-surface-100 rounded-bl-full -mr-4 -mt-4 z-0" />
              <div className="flex items-center gap-4 relative z-10">
                {(() => {
                  const FileIcon = getFileIcon(dokumen.file_type);
                  return (
                    <div className="w-14 h-14 bg-surface-50 rounded-xl flex items-center justify-center border border-ink-100 shadow-inner">
                      <FileIcon className="w-7 h-7 text-ink-500" />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900 truncate">
                    {dokumen.file_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-surface-100 rounded text-[10px] font-bold text-ink-500 uppercase tracking-wide">
                      {dokumen?.file_type?.split("/")?.[1]?.toUpperCase() ||
                        "FILE"}
                    </span>
                    <span className="text-xs text-ink-400">
                      {formatFileSize(dokumen.file_size || 0)}
                    </span>
                    <span className="text-xs text-ink-300">&bull;</span>
                    <span className="text-xs text-ink-400">
                      {dokumen.uploaded_at
                        ? new Date(dokumen.uploaded_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Catatan jika ditolak */}
              {dokumen.status === "rejected" && dokumen.catatan && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-800 uppercase tracking-wider mb-1">
                      Perlu Perbaikan
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed">
                      {dokumen.catatan}
                    </p>
                  </div>
                </div>
              )}

              {/* Info verifikasi */}
              {dokumen.status === "verified" && dokumen.verified_at && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3 items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-0.5">
                      Terverifikasi
                    </p>
                    <p className="text-sm text-emerald-700">
                      Dokumen telah disetujui pada{" "}
                      {new Date(dokumen.verified_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center transition-all cursor-pointer group ${
              isDragging
                ? "border-primary-600 bg-primary-50"
                : "border-ink-200 hover:border-primary-400 hover:bg-surface-50"
            } ${isUploading || isLocked ? "pointer-events-none opacity-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {!isLocked && (
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={config?.allowedTypes.join(",")}
                onChange={handleFileSelect}
              />
            )}
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center group-hover:bg-secondary-100 group-hover:scale-110 transition-all duration-300 shadow-inner">
                  {isLocked ? (
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-ink-400 group-hover:text-primary-700 transition-colors" />
                  )}
                </div>
              )}
              <div>
                <p className="font-bold text-ink-700 text-lg group-hover:text-primary-800 transition-colors">
                  {isLocked
                    ? "Berkas Terkunci"
                    : dokumen.status === "pending"
                      ? "Klik atau seret file ke sini"
                      : "Ganti File"}
                </p>
                {!isLocked && (
                  <p className="text-sm text-ink-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    Format:{" "}
                    <span className="font-semibold text-ink-600">
                      {allowedExtensions}
                    </span>
                    <br />
                    Ukuran Maksimal:{" "}
                    <span className="font-semibold text-ink-600">
                      {maxSizeDisplay}
                    </span>
                  </p>
                )}
                {isLocked && (
                  <p className="text-sm text-ink-400 mt-2 max-w-xs mx-auto leading-relaxed">
                    Data sudah dikunci & menunggu verifikasi admin.
                  </p>
                )}
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

export default function UploadBerkasTab() {
  const [dokumenList, setDokumenList] = useState<DokumenItem[]>([]);
  const [dokumenConfig, setDokumenConfig] = useState<
    Record<string, DokumenConfig>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [pendaftarStatus, setPendaftarStatus] = useState<string>("draft");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    uploaded: number;
    verified: number;
    pending: number;
    progress: {
      required: { total: number; uploaded: number; percentage: number };
      all: { total: number; uploaded: number; percentage: number };
    };
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 1. Konfirmasi User
    const result = await Swal.fire({
      title: "Kunci Berkas Pendaftaran?",
      text: "Setelah dikunci, dokumen tidak dapat diubah lagi tanpa bantuan admin. Pastikan semua berkas sudah sesuai.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Kunci Sekarang",
      cancelButtonText: "Periksa Lagi",
      confirmButtonColor: "#0066ff", // primary-600
      cancelButtonColor: "#ef4444", // red-500
      reverseButtons: true,
      focusConfirm: false,
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/pendaftar/submit-dokumen", {
        method: "POST",
      });
      const apiResult = await response.json();

      if (!apiResult.success) {
        throw new Error(apiResult.error || "Gagal mengunci berkas");
      }

      // 2. Sukses! Tampilkan pesan dan redirect/refresh
      await Swal.fire({
        title: "Berkas Berhasil Dikunci!",
        text: "Dokumen Anda sedang dalam antrian verifikasi admin. Halaman Seleksi akan terbuka jika sudah disetujui.",
        icon: "success",
        confirmButtonColor: "#0066ff",
        confirmButtonText: "Dimengerti",
      });

      // Refresh data untuk update isLocked
      await fetchDokumenStatus();

      // Ke dashboard utama agar sidebar terupdate
      window.location.href = "/dashboard/pendaftar";
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Mengunci",
        text: err.message || "Terjadi kesalahan sistem",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch dokumen status
  const fetchDokumenStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, configRes] = await Promise.all([
        fetch("/api/dokumen/status"),
        fetch("/api/upload/dokumen"),
      ]);

      const statusData = await statusRes.json();
      const configData = await configRes.json();

      if (!statusData.success) {
        throw new Error(statusData.error || "Gagal memuat data dokumen");
      }

      setDokumenList(statusData.data.dokumen);
      setSummary(statusData.data.summary);
      setPendaftarStatus(statusData.data.pendaftar_status);

      if (configData.success) {
        setDokumenConfig(configData.data);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDokumenStatus();
  }, [fetchDokumenStatus]);

  const isAllRequiredUploaded = Boolean(
    summary && summary.progress.required.total > 0 && summary.progress.required.uploaded === summary.progress.required.total
  );

  const isLocked = [
    "docs_uploaded",
    "docs_verified",
    "scheduled",
    "tested",
    "announced",
    "accepted",
    "enrolled",
  ].includes(pendaftarStatus) && (!["accepted", "enrolled"].includes(pendaftarStatus) || isAllRequiredUploaded);
  const isVerified = [
    "docs_verified",
    "scheduled",
    "tested",
    "announced",
    "accepted",
    "enrolled",
  ].includes(pendaftarStatus);

  // Show toast
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle upload
  const handleUpload = async (key: string, file: File) => {
    try {
      // 1. Auto Compress Image (wuz-wuz mode)
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file);
      }

      // 2. Cek ukuran setelah kompresi
      const config = dokumenConfig[key];
      if (config && fileToUpload.size > config.maxSize) {
        throw new Error(
          `Ukuran file terlalu besar! Maksimal ${formatFileSize(config.maxSize)}`,
        );
      }

      // Add to uploading set
      setUploadingKeys((prev) => new Set(prev).add(key));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

      // Create form data
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("jenis_dokumen", key);

      // Simulate progress (karena fetch tidak support progress untuk upload)
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

      // Upload
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

      // Refresh data
      await fetchDokumenStatus();
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengupload file");
    } finally {
      // Remove from uploading set
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

  // Handle preview
  const handlePreview = async (dokumen: DokumenItem) => {
    if (!dokumen.file_path) return;

    try {
      const response = await fetch(`/api/dokumen/preview?jenis=${dokumen.key}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal membuat link preview");
      }

      // Buka di tab baru
      window.open(data.data.url, "_blank");
    } catch (err: any) {
      showToast("error", err.message || "Gagal membuka preview");
    }
  };

  // Handle download of uploaded file
  const handleDownload = async (dokumen: DokumenItem) => {
    if (!dokumen.file_path) return;

    try {
      const response = await fetch(`/api/dokumen/preview?jenis=${dokumen.key}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal membuat link download");
      }

      // Fetch the file to trigger a native download prompt instead of just opening it
      const fileResponse = await fetch(data.data.url);
      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = dokumen.file_name || `${dokumen.label}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengunduh dokumen");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 text-primary-700 animate-spin" />
        <p className="text-stone-600">Memuat data dokumen...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDokumenStatus}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeInRight ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary-700 to-primary-900 border border-primary-600 p-5 md:p-8 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-full max-w-[400px] h-[400px] bg-secondary-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              <Upload className="w-8 h-8 text-secondary-100" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white font-display">
                Upload Berkas
              </h1>
              <p className="text-secondary-100/90 font-medium max-w-xl text-sm md:text-base">
                Lengkapi dokumen persyaratan untuk verifikasi data.
              </p>
            </div>
          </div>
          <button
            onClick={fetchDokumenStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-ink-100 text-ink-600 font-bold rounded-xl hover:bg-surface-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                  Total Dokumen
                </p>
                <p className="text-2xl font-black text-ink-900 leading-none mt-1">
                  {summary.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                  Sudah Diupload
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-2xl font-black text-ink-900 leading-none">
                    {summary.uploaded}
                  </p>
                  <span className="text-sm text-ink-400 font-medium">
                    / {summary.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                  Terverifikasi
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-2xl font-black text-ink-900 leading-none">
                    {summary.verified}
                  </p>
                  <span className="text-sm text-ink-400 font-medium">
                    / {summary.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="text-xs font-black text-primary-700">
                    {summary.progress.required.percentage}%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                  Progress Wajib
                </p>
                <div className="w-full h-2.5 bg-surface-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500 shadow-lg shadow-primary-500/20"
                    style={{
                      width: `${summary.progress.required.percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-secondary-50/50 border border-secondary-100 rounded-[1.5rem] p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
        <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-secondary-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-secondary-900 mb-2 text-lg">
            Petunjuk Upload Dokumen
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-secondary-800 list-disc pl-4 marker:text-secondary-500">
            <li>
              Pastikan dokumen hasil scan atau foto terlihat{" "}
              <strong>jelas dan terbaca</strong>
            </li>
            <li>
              Format yang diterima: <strong>JPG, PNG, atau PDF</strong>
            </li>
            <li>
              Ukuran maksimal file: <strong>5MB (Foto & Dokumen)</strong>
            </li>
            <li>
              Anda dapat mengupload ulang jika terjadi kesalahan sebelum
              diverifikasi
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-secondary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            !
          </span>
          Dokumen Wajib
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          {dokumenList
            .filter((d) => d.required)
            .map((dokumen) => (
              <DokumenCard
                key={dokumen.key}
                dokumen={dokumen}
                config={dokumenConfig[dokumen.key]}
                isUploading={uploadingKeys.has(dokumen.key)}
                uploadProgress={uploadProgress[dokumen.key] || 0}
                onUpload={(file) => handleUpload(dokumen.key, file)}
                onPreview={() => handlePreview(dokumen)}
                onDownload={() => handleDownload(dokumen)}
                isLocked={isLocked && dokumen.status !== "rejected"}
              />
            ))}
        </div>
      </div>

      {/* Dokumen Opsional Section */}
      {/* Dokumen Opsional Section - REMOVED as per user request */}
      {/* 
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-stone-400 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            +
          </span>
          Dokumen Opsional
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
          {dokumenList
            .filter((d) => !d.required)
            .map((dokumen) => (
              <DokumenCard
                key={dokumen.key}
                dokumen={dokumen}
                config={dokumenConfig[dokumen.key]}
                isUploading={uploadingKeys.has(dokumen.key)}
                uploadProgress={uploadProgress[dokumen.key] || 0}
                onUpload={(file) => handleUpload(dokumen.key, file)}
                onPreview={() => handlePreview(dokumen)}
              />
            ))}
        </div>
      </div> 
      */}

      {/* Submit/Lock Section */}
      <div className="bg-white border text-center border-ink-200 rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="max-w-xl mx-auto space-y-6">
          {isLocked ? (
            dokumenList.some((d) => d.status === "rejected") ? (
              // Case: Locked but REJECTED docs exist
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto transition-colors animate-pulse">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-red-700 mb-2">
                    Dokumen Perlu Diperbaiki
                  </h3>
                  <p className="text-red-600 font-medium leading-relaxed">
                    Admin telah menolak beberapa dokumen Anda. Silakan cek
                    catatan penolakan pada dokumen yang berwarna merah di atas,
                    lalu upload ulang dokumen yang sesuai.
                  </p>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-bold text-sm">
                    Menunggu Perbaikan Anda
                  </span>
                </div>
              </>
            ) : isVerified ? (
              // Case: Documents APPROVED/VERIFIED
              <>
                <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-primary-700 flex items-center justify-center mx-auto transition-colors">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-primary-900 mb-2">
                    Dokumen Telah Diverifikasi
                  </h3>
                  <p className="text-primary-700 font-medium leading-relaxed mb-4">
                    Selamat! Semua berkas wajib Anda telah disetujui oleh admin.
                  </p>
                  <Link
                    href="/dashboard/pendaftar/undangan-seleksi"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-400 text-primary-950 font-black rounded-xl hover:bg-secondary-300 transition-all shadow-lg shadow-secondary-400/20 hover:-translate-y-1 border border-secondary-500"
                  >
                    Buka Jadwal Seleksi
                    <FileCheck className="w-5 h-5" />
                  </Link>
                </div>
              </>
            ) : (
              // Case: Locked and waiting verification (Normal)
              <>
                <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center mx-auto transition-colors">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-ink-900 mb-2">
                    Dokumen Telah Dikunci
                  </h3>
                  <p className="text-ink-500 font-medium leading-relaxed">
                    Sistem mendeteksi dokumen Anda sedang dalam tahap verifikasi
                    admin. Halaman <strong>Jadwal Seleksi</strong> akan otomatis
                    terbuka setelah admin menyetujui semua berkas wajib Anda.
                  </p>
                </div>

                <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-xl flex gap-3 items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary-600" />
                  <span className="text-secondary-800 font-bold text-sm">
                    Sedang Diverifikasi Admin
                  </span>
                </div>

                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-3 text-left">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">
                      Ingin Verifikasi Lebih Cepat?
                    </p>
                    <p className="text-emerald-700 text-xs mt-0.5 font-medium">
                      Anda bisa menghubungi CS di nomor{" "}
                      <a
                        href="https://wa.me/6281285300800"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black underline hover:text-emerald-900"
                      >
                        0812-8530-0800
                      </a>{" "}
                      jika ingin cepat diverifikasi.
                    </p>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors ${
                  summary && summary.progress.required.percentage === 100
                    ? "bg-secondary-100 text-primary-700"
                    : "bg-surface-100 text-ink-300"
                }`}
              >
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-ink-900 mb-2">
                  {summary && summary.progress.required.percentage === 100
                    ? "Semua Dokumen Wajib Terisi"
                    : "Lengkapi Dokumen Wajib"}
                </h3>
                <p className="text-ink-500 font-medium leading-relaxed">
                  {summary && summary.progress.required.percentage === 100
                    ? "Silakan periksa kembali semua berkas sebelum dikunci. Setelah dikunci, berkas tidak dapat diubah lagi."
                    : "Anda belum dapat mengunci berkas. Mohon lengkapi semua dokumen yang bertanda 'Wajib' di atas."}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  !summary ||
                  summary.progress.required.percentage < 100 ||
                  isSubmitting
                }
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                  summary &&
                  summary.progress.required.percentage === 100 &&
                  !isSubmitting
                    ? "bg-secondary-400 text-primary-950 hover:bg-secondary-300 shadow-xl shadow-secondary-400/20 hover:-translate-y-1 border border-secondary-500"
                    : "bg-surface-200 text-ink-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    <span>Finalisasi & Kunci Berkas</span>
                  </>
                )}
              </button>

              {summary && summary.progress.required.percentage === 100 && (
                <p className="text-xs text-ink-400 font-medium">
                  Setelah dikunci, berkas hanya dapat diubah dengan menghubungi
                  bantuan admin.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
