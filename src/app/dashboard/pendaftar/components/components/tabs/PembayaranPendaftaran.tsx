"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CreditCard,
  Building2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  FileText,
  Image,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wallet,
  Banknote,
  Shield,
  Calendar,
  Info,
  Phone,
  MessageCircle,
  ArrowRight,
  Check,
  Download,
  Trash2,
  Star as StarIcon,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type PaymentStatus = "unpaid" | "pending" | "verified" | "rejected" | "expired";

interface PembayaranData {
  id: string;
  metode_pembayaran: string;
  jumlah: number;
  status_pembayaran: string;
  bukti_transfer_path?: string;
  bukti_transfer_filename?: string;
  midtrans_order_id?: string;
  midtrans_payment_type?: string;
  verified_at?: string;
  catatan_verifikasi?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentStatusResponse {
  pendaftar: {
    id: string;
    nomor_pendaftaran: string;
    nama_lengkap: string;
    status_pendaftaran: string;
  };
  tahun_ajaran: {
    id: string;
    nama: string;
    biaya_pendaftaran: number;
    tanggal_tutup_pendaftaran: string;
  };
  pembayaran: PembayaranData | null;
  status: PaymentStatus;
  deadline: string;
  is_deadline_passed: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const BANK_INFO = {
  nama_bank: "BSI (Bank Syariah Indonesia)",
  nomor_rekening: "7253701263",
  atas_nama: "Al Andalus Ulul Albaab 1",
  kode_bank: "451",
};

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: any;
    description: string;
  }
> = {
  unpaid: {
    label: "Menunggu Pembayaran",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
    description: "Silakan lakukan pembayaran untuk melanjutkan pendaftaran",
  },
  pending: {
    label: "Menunggu Verifikasi",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Clock,
    description: "Pembayaran sedang diverifikasi oleh tim kami (1x24 jam)",
  },
  verified: {
    label: "Pembayaran Terverifikasi",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle,
    description: "Alhamdulillah! Pembayaran Anda telah terverifikasi",
  },
  rejected: {
    label: "Pembayaran Ditolak",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
    description: "Mohon upload ulang bukti pembayaran yang valid",
  },
  expired: {
    label: "Batas Waktu Habis",
    color: "text-stone-700",
    bgColor: "bg-surface-200",
    borderColor: "border-stone-200",
    icon: AlertCircle,
    description: "Maaf, batas waktu pembayaran telah berakhir",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ============================================
// COPY BUTTON COMPONENT
// ============================================

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink-200 hover:bg-surface-50 text-ink-600 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm"
      title={`Salin ${label}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600">Disalin</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Salin</span>
        </>
      )}
    </button>
  );
}

// ============================================
// TIMELINE COMPONENT
// ============================================

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

function PaymentTimeline({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  const steps: TimelineStep[] = [
    {
      id: 1,
      title: "Upload Bukti",
      description: "Kirim bukti transfer",
      status: paymentStatus === "unpaid" || paymentStatus === "expired" ? "current" : "completed",
    },
    {
      id: 2,
      title: "Verifikasi Admin",
      description: "Pemeriksaan 1x24 jam",
      status:
        paymentStatus === "pending"
          ? "current"
          : paymentStatus === "verified"
            ? "completed"
            : paymentStatus === "rejected"
              ? "current"
              : "upcoming",
    },
    {
      id: 3,
      title: "Selesai",
      description: "Pembayaran valid",
      status: paymentStatus === "verified" ? "completed" : "upcoming",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-200 -z-10 rounded-full" />
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          let statusColor = "bg-surface-100 border-surface-300 text-ink-300"; // default upcoming
          if (step.status === "completed") statusColor = "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30";
          if (step.status === "current") statusColor = "bg-white border-brand-blue-600 text-brand-blue-700 shadow-lg shadow-brand-blue-600/20";

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 z-10 ${statusColor}`}>
                {step.status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-black">{step.id}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-xs font-bold transition-colors ${step.status === "upcoming" ? "text-ink-300" : "text-ink-900"}`}>{step.title}</p>
                <p className="text-[10px] text-ink-400 mt-0.5 font-medium hidden sm:block">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// ============================================
// UPLOAD AREA COMPONENT
// ============================================

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  currentFile?: { name: string; path: string } | null;
  isRejected?: boolean;
}

function UploadArea({
  onUpload,
  isUploading,
  uploadProgress,
  currentFile,
  isRejected,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

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
        setSelectedFile(files[0]);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const handleClick = () => {
    if (!isUploading && !selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFile) {
      onUpload(selectedFile);
      // Don't clear selectedFile here, wait for parent to handle success/reset
    }
  };

  // If uploading, we might want to keep showing the preview with a spinner overlay
  // Or just the progress bar. Let's show progress overlay on top of preview if available.

  return (
    <div className="space-y-6">
      {/* Current file info (Always show existing file if available and NOT currently selecting a NEW file) */}
      {currentFile && !selectedFile && !isRejected && (
        <div className="p-4 bg-brand-yellow-50 border border-brand-yellow-100 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-brand-yellow-100 shadow-sm transition-transform hover:scale-110">
            <FileText className="w-6 h-6 text-brand-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-0.5">File Terupload</p>
            <p className="font-bold text-ink-900 truncate">{currentFile.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-yellow-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-brand-blue-600" />
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`relative overflow-hidden group border-2 border-dashed rounded-[2rem] transition-all ${isDragging
          ? "border-brand-blue-600 bg-brand-yellow-50/50 scale-[1.01]"
          : isRejected && !selectedFile
            ? "border-red-300 bg-red-50 hover:border-red-400"
            : selectedFile
              ? "border-brand-blue-600 bg-white" // Solid border when file selected
              : "border-ink-200 hover:border-brand-blue-400 hover:bg-surface-50 cursor-pointer"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,application/pdf"
          onChange={handleFileSelect}
        />

        {/* PREVIEW SECTION */}
        {selectedFile ? (
          <div className="p-6">
            <div className="flex flex-col items-center gap-6">
              {/* Image Preview or File Icon */}
              <div className="relative group/preview">
                {selectedFile.type.startsWith("image/") && previewUrl ? (
                  <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-ink-100 shadow-sm">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-contain bg-surface-50" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText className="w-12 h-12 text-ink-400" />
                  </div>
                )}

                {/* Remove Button (Top Right of preview area) */}
                {!isUploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 md:opacity-0 md:group-hover/preview:opacity-100"
                    title="Hapus file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <p className="font-bold text-ink-900 text-lg truncate max-w-xs mx-auto">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-ink-500 font-medium">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRemoveFile}
                  className="flex-1 sm:flex-none px-6 py-3 bg-surface-100 text-ink-600 font-bold rounded-xl hover:bg-surface-200 transition-colors"
                >
                  Ganti
                </button>
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-brand-yellow-400 text-brand-blue-950 font-black rounded-xl hover:bg-brand-yellow-300 transition-colors shadow-lg shadow-brand-yellow-400/30 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? "Mengirim..." : "Kirim Bukti"}
                </button>
              </div>
            </div>

            {/* Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                      <path className="text-cream-500 transition-all duration-300 ease-out" strokeDasharray={`${uploadProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-blue-800 text-sm">
                      {uploadProgress}%
                    </div>
                  </div>
                  <p className="font-bold text-brand-blue-900">Mengupload...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // EMPTY STATE
          <div className="p-10 flex flex-col items-center gap-5 relative z-10">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${isRejected && !currentFile
                ? "bg-red-100 text-red-600"
                : "bg-brand-yellow-50 text-brand-blue-700"
                }`}
            >
              <Upload className="w-10 h-10" />
            </div>

            <div>
              <p
                className={`font-bold text-xl ${isRejected && !currentFile ? "text-red-700" : "text-ink-900"
                  }`}
              >
                {isRejected && !currentFile
                  ? "Upload Ulang Bukti Transfer"
                  : currentFile
                    ? "Ganti Bukti Transfer"
                    : "Klik atau Seret File ke Sini"}
              </p>
              <p className="text-sm text-ink-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed text-center">
                Pastikan foto bukti transfer terlihat jelas dan terbaca. Format: JPG, PNG, PDF (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PembayaranPendaftaranTab({
  view = "payment",
}: {
  view?: "payment" | "status";
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMidtransLoading, setIsMidtransLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<
    "midtrans" | "manual" | null
  >(null);
  const instruksiRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke instruksi pembayaran saat metode dipilih
  useEffect(() => {
    if (activePaymentMethod === 'manual' && instruksiRef.current) {
      setTimeout(() => {
        instruksiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // slight delay to let the section render first
    }
  }, [activePaymentMethod]);

  // Fetch payment status
  const fetchPaymentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/pembayaran/status");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Gagal memuat data pembayaran");
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleManualUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran file terlalu besar! Maksimal 5MB");
      // Accept any image format (JPG, PNG, WebP, HEIC from mobile/WhatsApp) + PDF
      const isValidType = file.type.startsWith("image/") || file.type === "application/pdf";
      if (!isValidType) throw new Error("Format file tidak didukung! Gunakan JPG, PNG, WebP, atau PDF");

      const formData = new FormData();
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      const response = await fetch("/api/pembayaran/manual/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Gagal mengupload bukti pembayaran");

      showToast("success", "Bukti pembayaran berhasil diupload!");
      setActivePaymentMethod(null); // Close modal/section
      await fetchPaymentStatus();
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengupload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMidtransPayment = async () => {
    try {
      setIsMidtransLoading(true);
      const response = await fetch("/api/pembayaran/midtrans/create", { method: "POST" });
      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Gagal membuat transaksi");

      if (result.data.redirect_url) {
        window.location.href = result.data.redirect_url;
      } else if (result.data.snap_token && (window as any).snap) {
        (window as any).snap.pay(result.data.snap_token, {
          onSuccess: () => {
            showToast("success", "Pembayaran berhasil!");
            fetchPaymentStatus();
          },
          onPending: () => {
            showToast("info", "Pembayaran pending. Silakan selesaikan pembayaran.");
            fetchPaymentStatus();
          },
          onError: () => {
            showToast("error", "Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            showToast("info", "Anda menutup popup pembayaran.");
          },
        });
      } else {
        throw new Error("Tidak dapat membuka halaman pembayaran");
      }
    } catch (err: any) {
      showToast("error", err.message || "Gagal memproses pembayaran");
    } finally {
      setIsMidtransLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-cream-500 animate-spin mb-4" />
        <p className="text-ink-500 font-medium">Memuat data pembayaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={fetchPaymentStatus} className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-500/20">
          <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Treat "expired" as "unpaid" for UI so user can tetap bayar
  const effectiveStatus =
    data.status === "expired" ? ("unpaid" as PaymentStatus) : data.status;

  // Hard-set biaya pendaftaran sesuai ketentuan (Rp 200.000)
  const biayaPendaftaran = 200_000;

  const statusConfig = STATUS_CONFIG[effectiveStatus];
  const StatusIcon = statusConfig.icon;
  const daysRemaining = Math.max(0, getDaysRemaining(data.deadline));
  const isPaymentCompleted = effectiveStatus === "verified";
  const isPaymentPending = effectiveStatus === "pending";
  const isPaymentRejected = effectiveStatus === "rejected";
  const canMakePayment =
    effectiveStatus === "unpaid" ||
    effectiveStatus === "rejected" ||
    data.status === "expired";

  const isStatusOnly = view === "status";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-clay-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          } text-white shadow-lg`}>
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 p-1 rounded-lg">&times;</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-blue-700 to-brand-blue-900 border border-brand-blue-600 p-8 md:p-10 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-yellow-50/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              {isStatusOnly ? (
                <Shield className="w-8 h-8 text-brand-yellow-100" />
              ) : (
                <CreditCard className="w-8 h-8 text-brand-yellow-100" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white">
                {isStatusOnly ? "Status Pembayaran" : "Pembayaran Pendaftaran"}
              </h1>
              <p className="text-emerald-50 font-medium max-w-lg">
                {isStatusOnly
                  ? "Lihat status verifikasi pembayaran Anda dan riwayat bukti transfer."
                  : "Selesaikan pembayaran untuk membuka akses pengisian data santri lengkap."}
              </p>
            </div>
          </div>
          <button
            onClick={fetchPaymentStatus}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Status Card */}
          <div className="glass-panel p-8 rounded-[2rem] shadow-sm border border-brand-yellow-200 app-card relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${statusConfig.bgColor}`} /> {/* Accent Bar */}

            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-1">Status Pembayaran</p>
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                  <span className={`font-black text-lg ${statusConfig.color}`}>{statusConfig.label}</span>
                </div>
              </div>

              {!data.is_deadline_passed && daysRemaining > 0 && !isPaymentCompleted && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase">Sisa Waktu</p>
                    <p className="text-amber-800 font-bold">{daysRemaining} Hari Lagi</p>
                  </div>
                </div>
              )}
              {data.is_deadline_passed && !isPaymentCompleted && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase">Masa Pembayaran Terlewati</p>
                    <p className="text-amber-800 font-bold">Silakan selesaikan pembayaran secepatnya.</p>
                  </div>
                </div>
              )}
            </div>

            <PaymentTimeline paymentStatus={data.status} />

            {isPaymentRejected && data.pembayaran?.catatan_verifikasi && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Pembayaran Ditolak</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{data.pembayaran.catatan_verifikasi}</p>
                </div>
              </div>
            )}

            {/* Ringkasan pembayaran (khusus halaman Status Pembayaran) */}
            {isStatusOnly && (
              <div className="mt-8 bg-white border border-ink-100 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">Nomor Pendaftaran</p>
                    <p className="font-black text-ink-900">{data.pendaftar.nomor_pendaftaran}</p>
                    <p className="text-sm text-ink-500 mt-1">{data.pendaftar.nama_lengkap}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">Metode</p>
                    <p className="font-black text-ink-900">{data.pembayaran?.metode_pembayaran || "-"}</p>
                    <p className="text-sm text-ink-500 mt-1">
                      {data.pembayaran?.updated_at ? `Update: ${formatDateTime(data.pembayaran.updated_at)}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Transfer Instructions (hanya di halaman Pembayaran) */}
          {!isStatusOnly && canMakePayment && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <h3 className="text-2xl font-black text-brand-blue-950 tracking-tight">Pilih Metode Pembayaran</h3>
                {/* Total Price Tag */}
                <div className="bg-brand-blue-50 text-brand-blue-700 px-5 py-3 md:px-7 md:py-4 rounded-[1.5rem] font-black text-xl md:text-2xl border border-brand-blue-100 shadow-sm flex items-center justify-between sm:justify-center gap-4">
                  <span className="text-sm md:text-base uppercase tracking-widest opacity-70">Total:</span>
                  <span className="tabular-nums">{formatRupiah(biayaPendaftaran)}</span>
                </div>
              </div>

              {/* PAYMENT CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 pt-4">

                {/* CARD 1: MIDTRANS (DEV) */}
                <div className="relative group bg-white rounded-[2.5rem] p-8 border border-surface-200 shadow-sm transition-all hover:shadow-lg overflow-visible opacity-80 grayscale-[0.5] hover:grayscale-0">
                  {/* Background Decor */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow-50 rounded-bl-[4rem] -z-0" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 shadow-alert-100/50 text-amber-600">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-ink-500 uppercase tracking-widest text-xs mb-2">Tahap Pengembangan</h4>
                      <h3 className="font-black text-2xl text-ink-900 mb-2">Virtual Account</h3>


                      <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-6">
                        Otomatis
                      </div>

                      <ul className="space-y-3 mb-8">
                        {[
                          "BCA, BNI, BRI, Mandiri & QRIS",
                          "Verifikasi Otomatis",
                          "Proses Instan (Real-time)"
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-ink-400 text-sm font-medium">
                            <div className="w-5 h-5 rounded-full bg-ink-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-ink-400" />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <button disabled className="w-full py-4 rounded-xl font-bold bg-ink-100 text-ink-400 cursor-not-allowed">
                        Segera Hadir
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD 2: BSI MANUAL */}
                <div
                  onClick={() => setActivePaymentMethod('manual')}
                  className={`relative group bg-white rounded-[2.5rem] p-8 border-2 transition-all cursor-pointer shadow-lg md:hover:-translate-y-2 md:hover:shadow-2xl overflow-visible ${activePaymentMethod === 'manual'
                    ? 'border-brand-blue-600 ring-4 ring-brand-blue-600/10 shadow-brand-blue-600/10'
                    : 'border-white hover:border-brand-blue-300 shadow-sm'
                    }`}
                >
                  {/* Background Decor - Blue Blur */}
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full transition-all duration-500 blur-2xl -z-0 ${
                    activePaymentMethod === 'manual' ? 'bg-brand-blue-100/60 scale-125' : 'bg-brand-blue-50/50 group-hover:bg-brand-blue-100/40'
                  }`} />

                  {activePaymentMethod === 'manual' && (
                    <div className="absolute top-6 right-6 lg:right-8 z-20">
                      <div className="w-8 h-8 bg-brand-blue-600 rounded-full flex items-center justify-center animate-in zoom-in shadow-lg shadow-brand-blue-600/30">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Recommendation Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-brand-blue-700 to-brand-blue-500 text-white text-[10px] sm:text-xs font-black px-6 py-2 rounded-full shadow-lg shadow-brand-blue-600/30 z-20 flex items-center gap-2 uppercase tracking-widest whitespace-nowrap">
                    <StarIcon className="w-3.5 h-3.5 fill-brand-yellow-300 text-brand-yellow-300" />
                    Rekomendasi
                  </div>

                  <div className="relative z-10 flex flex-col h-full pt-6">
                    <div className="mb-6">
                      <div className="h-16 flex items-center justify-start mb-6">
                        <img 
                          src="/images/bsi-logo.png" 
                          alt="BSI Logo" 
                          className="h-full w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105" 
                        />
                      </div>
                      <h4 className="font-bold text-teal-700 uppercase tracking-widest text-[10px] mb-2">Transfer Manual</h4>
                      <h3 className="font-black text-2xl text-ink-900 mb-2">Bank BSI</h3>

                      <div className="inline-block bg-teal-50 text-teal-700 text-[10px] font-bold px-3 py-1 rounded-lg mb-6 border border-teal-100">
                        Pengecekan Manual (± 24 Jam)
                      </div>

                      <ul className="space-y-3 mb-8">
                        {[
                          "Transfer ke Rekening Pesantren",
                          "Verifikasi Tim Admin Kami",
                          "Terjamin Aman & Amanah",
                          "Unggah Bukti Transfer"
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-ink-600 text-sm font-medium">
                            <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
                              <Check className="w-3 h-3 text-teal-600" />
                            </div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <button className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${activePaymentMethod === 'manual'
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-600/20'
                        : 'bg-surface-50 text-teal-800 hover:bg-teal-50 group-hover:bg-teal-600 group-hover:text-white'
                        }`}>
                        {activePaymentMethod === 'manual' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Metode Aktif</span>
                          </>
                        ) : (
                          <>
                            <span>Pilih Metode Ini</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* DETAIL & UPLOAD SECTION (SHOWN BELOW GRID) */}
              {activePaymentMethod === 'manual' && (
                <div ref={instruksiRef} className="mt-8 pt-8 border-t border-ink-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-black text-ink-900 mb-2">Instruksi Pembayaran</h3>
                      <p className="text-ink-500">Silakan transfer sesuai nominal ke rekening di bawah ini, lalu upload bukti transfer.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                      {/* LEFT COLUMN: BANK INFO */}
                      <div className="bg-gradient-to-br from-teal-600 to-teal-800 border border-teal-500 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between text-white group/card">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-10">
                            <div>
                              <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em] mb-3 opacity-90">Bank Syariah Indonesia (BSI)</p>
                              <div className="bg-white p-2 rounded-xl inline-flex items-center justify-center shadow-sm">
                                <img src="/images/bsi-logo.png" alt="BSI" className="h-7 w-auto object-contain" />
                              </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm flex items-center justify-center text-white">
                              <Building2 className="w-8 h-8" />
                            </div>
                          </div>

                          <div className="mb-10">
                            <p className="text-xs font-bold text-teal-100 mb-3 opacity-80 uppercase tracking-widest">Nomor Rekening</p>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <h4 className="font-black text-4xl sm:text-5xl text-white tracking-tighter drop-shadow-sm break-all">{BANK_INFO.nomor_rekening}</h4>
                              <div className="bg-teal-500/30 hover:bg-teal-500/50 transition-colors p-1 rounded-xl backdrop-blur-sm">
                                <CopyButton text={BANK_INFO.nomor_rekening} label="Salin" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-[10px] font-bold text-teal-100 uppercase opacity-80">Atas Nama</p>
                              <p className="text-xl font-bold text-white tracking-tight">{BANK_INFO.atas_nama}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 relative z-10">
                          <div className="flex items-start gap-4 bg-black/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                              <Info className="w-5 h-5 text-teal-100" />
                            </div>
                            <p className="text-xs text-teal-50 leading-relaxed font-medium text-left w-full">
                              <strong>Penting:</strong> Pastikan nominal transfer tepat <strong>{formatRupiah(biayaPendaftaran)}</strong> agar sistem kami dapat memproses verifikasi lebih cepat (Auto-Match).
                            </p>
                          </div>
                        </div>
                      </div>


                      {/* RIGHT COLUMN: UPLOAD AREA */}
                      <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-surface-200 p-8 flex flex-col justify-center relative group hover:border-brand-blue-300 transition-colors">
                        <div className="text-center mb-8">
                          <h5 className="font-bold text-ink-900 text-lg flex items-center justify-center gap-2 mb-2">
                            <Upload className="w-5 h-5 text-brand-blue-700" />
                            Upload Bukti Transfer
                          </h5>
                          <p className="text-sm text-ink-400">Format: JPG, PNG, PDF, WebP (Maks. 5MB)</p>
                        </div>

                        <UploadArea
                          onUpload={handleManualUpload}
                          isUploading={isUploading}
                          uploadProgress={uploadProgress}
                          currentFile={data.pembayaran?.bukti_transfer_filename ? { name: data.pembayaran.bukti_transfer_filename, path: '' } : null}
                          isRejected={isPaymentRejected}
                        />


                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success View (hanya di halaman Pembayaran) */}
          {!isStatusOnly && isPaymentCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 mb-2">Pembayaran Lunas</h3>
              <p className="text-emerald-700 max-w-md mx-auto mb-8">
                Terima kasih telah melakukan pembayaran. Anda sekarang dapat melanjutkan ke tahap berikutnya yaitu mengisi formulir data diri lengkap.
              </p>
              <div className="flex justify-center">
                <a
                  href="/dashboard/pendaftar/isi-data-lengkap"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>Lanjut Isi Data Diri</span>
                </a>
              </div>
            </div>
          )}

          {/* Status-only helper (jika belum bayar) */}
          {isStatusOnly && !isPaymentCompleted && (
            <div className="bg-white border border-ink-100 rounded-[2rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-ink-900 text-lg mb-1">Lakukan Pembayaran di Halaman Pembayaran</h3>
                <p className="text-sm text-ink-500">
                  Untuk upload bukti transfer atau memilih metode pembayaran, silakan buka menu <strong>Pembayaran</strong>.
                </p>
              </div>
              <a
                href="/dashboard/pendaftar/pembayaran-pendaftaran"
                className="px-6 py-3 bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 rounded-xl font-black shadow-lg shadow-brand-yellow-400/20 transition-all hover:scale-105 flex items-center gap-2 border border-brand-yellow-500"
              >
                <span>Ke Halaman Pembayaran</span>
              </a>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-[2.5rem] shadow-sm border border-brand-yellow-200 app-card">
            <h3 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-blue-700" />
              Rincian Biaya
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-500 font-medium">Biaya Pendaftaran</span>
                <span className="font-bold text-ink-900">{formatRupiah(biayaPendaftaran)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-500 font-medium">Biaya Admin</span>
                <span className="font-bold text-ink-900">Rp 0</span>
              </div>
              <div className="h-px bg-ink-100 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-ink-900 font-bold">Total Pembayaran</span>
                <span className="text-xl font-black text-brand-blue-700">{formatRupiah(biayaPendaftaran)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-100 rounded-[2rem] p-6 border border-white/50">
            <h4 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-ink-400" />
              Bantuan Pembayaran
            </h4>
            <p className="text-sm text-ink-500 mb-4 leading-relaxed">
              Mengalami kendala saat melakukan pembayaran? Hubungi tim support kami.
            </p>
            <a href="https://wa.me/6281285300800" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-ink-100 hover:border-cream-200 transition-colors group">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-400 uppercase">WhatsApp Admin</p>
                <p className="font-bold text-ink-900 text-sm">0812-8530-0800</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
