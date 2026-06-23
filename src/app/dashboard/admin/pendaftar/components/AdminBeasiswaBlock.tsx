"use client";

import { useState, useEffect, useRef } from "react";
import {
  HandCoins,
  CheckCircle,
  Loader2,
  Save,
  Trash2,
  GraduationCap,
  Coins,
  Building2,
  BookOpen,
  X,
  AlertCircle,
  FileText,
  UploadCloud,
  Eye,
  File,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";

// --------------------------------------------------------------------------
// TYPES
// --------------------------------------------------------------------------

type JenisBantuan = "BEASISWA" | "KERINGANAN";
type CakupanBantuan = "UANG_PANGKAL" | "SPP" | "KEDUANYA";

type BerkasFieldKey =
  | "file_sktm_path"
  | "file_slip_gaji_path"
  | "file_ktp_path"
  | "file_ktp_ibu_path"
  | "file_prestasi_path"
  | "file_permohonan_path";

interface BerkasConfigItem {
  fieldKey: BerkasFieldKey;
  label: string;
  desc: string;
  requiredFor: "BEASISWA" | "KERINGANAN" | "BOTH";
  required: boolean;
}

interface KeringananData {
  jenis_bantuan?: JenisBantuan;
  cakupan?: CakupanBantuan;
  potongan_uang_pangkal?: number;
  potongan_spp?: number;
  nominal_potongan?: number; // legacy compat
  catatan?: string | null;
  jenis?: string; // legacy compat
}

interface PengajuanBerkas {
  file_sktm_path?: string | null;
  file_slip_gaji_path?: string | null;
  file_ktp_path?: string | null;
  file_ktp_ibu_path?: string | null;
  file_prestasi_path?: string | null;
  file_permohonan_path?: string | null;
  jenis_pengajuan?: string | null;
  status?: string | null;
}

// --------------------------------------------------------------------------
// CONFIG BERKAS
// --------------------------------------------------------------------------

const BERKAS_CONFIG: BerkasConfigItem[] = [
  {
    fieldKey: "file_sktm_path",
    label: "SKTM (Surat Keterangan Tidak Mampu)",
    desc: "Dari RT/RW atau Kelurahan setempat.",
    requiredFor: "BOTH",
    required: true,
  },
  {
    fieldKey: "file_slip_gaji_path",
    label: "Surat Keterangan / Bukti Penghasilan",
    desc: "Slip gaji atau surat keterangan penghasilan Orangtua (Ayah & Ibu).",
    requiredFor: "BEASISWA",
    required: true,
  },
  {
    fieldKey: "file_ktp_path",
    label: "KTP Orangtua Ayah",
    desc: "Scan/foto KTP Ayah yang jelas.",
    requiredFor: "BEASISWA",
    required: true,
  },
  {
    fieldKey: "file_ktp_ibu_path",
    label: "KTP Orangtua Ibu",
    desc: "Scan/foto KTP Ibu yang jelas.",
    requiredFor: "BEASISWA",
    required: true,
  },
  {
    fieldKey: "file_permohonan_path",
    label: "Surat Permohonan Keringanan Biaya",
    desc: "Menyebutkan jenis biaya, jumlah sanggup bayar, dan/atau potongan yang diminta.",
    requiredFor: "KERINGANAN",
    required: true,
  },
  {
    fieldKey: "file_prestasi_path",
    label: "Bukti Memiliki Hafalan Al-Qur'an / Ranking 3 Besar",
    desc: "Sertifikat hafalan Qur'an, piagam lomba, atau sertifikat tahfizh.",
    requiredFor: "BEASISWA",
    required: true,
  },
];

// --------------------------------------------------------------------------
// HELPERS
// --------------------------------------------------------------------------

const formatCurrency = (n: number) =>
  n === 0 ? "Rp 0" : `Rp ${n.toLocaleString("id-ID")}`;

const MAX_UP = 7_500_000;
const MAX_SPP = 1_000_000;

function parseKeringanan(raw: any): KeringananData | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw as KeringananData;
}

function getBerkasForJenis(jenisPengajuan?: string | null): BerkasConfigItem[] {
  if (!jenisPengajuan) return BERKAS_CONFIG;
  const isBeasiswa = jenisPengajuan.startsWith("BEASISWA");
  return BERKAS_CONFIG.filter(
    (b) => b.requiredFor === "BOTH" || (isBeasiswa ? b.requiredFor === "BEASISWA" : b.requiredFor === "KERINGANAN")
  );
}

// --------------------------------------------------------------------------
// BERKAS MANAGEMENT SUB-COMPONENT
// --------------------------------------------------------------------------

function AdminBerkasSection({
  pendaftarId,
  pengajuan,
  onRefresh,
}: {
  pendaftarId: string;
  pengajuan: PengajuanBerkas;
  onRefresh: () => void;
}) {
  const [uploadingKey, setUploadingKey] = useState<BerkasFieldKey | null>(null);
  const [deletingKey, setDeletingKey] = useState<BerkasFieldKey | null>(null);
  const fileInputRefs = useRef<Partial<Record<BerkasFieldKey, HTMLInputElement | null>>>({});

  const relevantBerkas = getBerkasForJenis(pengajuan.jenis_pengajuan);

  const handleUpload = async (fieldKey: BerkasFieldKey, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Gagal", "Ukuran file maksimal 10MB", "error");
      return;
    }

    const confirmed = await Swal.fire({
      title: "Upload Berkas?",
      text: `Upload "${file.name}" sebagai berkas ${BERKAS_CONFIG.find(b => b.fieldKey === fieldKey)?.label}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Upload",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
    });

    if (!confirmed.isConfirmed) return;

    setUploadingKey(fieldKey);
    try {
      const formData = new FormData();
      formData.append("pendaftar_id", pendaftarId);
      formData.append("field_key", fieldKey);
      formData.append("file", file);

      const res = await fetch("/api/admin/beasiswa/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Gagal upload");

      Swal.fire({
        title: "Berhasil!",
        text: result.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      onRefresh();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat upload", "error");
    } finally {
      setUploadingKey(null);
      // Reset file input
      if (fileInputRefs.current[fieldKey]) {
        fileInputRefs.current[fieldKey]!.value = "";
      }
    }
  };

  const handleDelete = async (fieldKey: BerkasFieldKey) => {
    const label = BERKAS_CONFIG.find((b) => b.fieldKey === fieldKey)?.label;
    const confirmed = await Swal.fire({
      title: "Hapus Berkas?",
      text: `Berkas "${label}" akan dihapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, Hapus",
    });

    if (!confirmed.isConfirmed) return;

    setDeletingKey(fieldKey);
    try {
      const res = await fetch("/api/admin/beasiswa/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftar_id: pendaftarId, field_key: fieldKey }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Gagal hapus");

      Swal.fire({
        title: "Berhasil Dihapus",
        text: result.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      onRefresh();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat hapus", "error");
    } finally {
      setDeletingKey(null);
    }
  };

  const countUploaded = relevantBerkas.filter(
    (b) => !!(pengajuan as any)[b.fieldKey]
  ).length;
  const countRequired = relevantBerkas.filter((b) => b.required).length;
  const countRequiredUploaded = relevantBerkas.filter(
    (b) => b.required && !!(pengajuan as any)[b.fieldKey]
  ).length;

  return (
    <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-black text-ink-900">Berkas Persyaratan</span>
        </div>
        <div className="flex items-center gap-2">
          {countRequiredUploaded < countRequired ? (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {countRequiredUploaded}/{countRequired} wajib terisi
            </span>
          ) : (
            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {countUploaded} berkas lengkap
            </span>
          )}
        </div>
      </div>

      {/* Jenis Pengajuan indicator */}
      {pengajuan.jenis_pengajuan && (
        <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
          Berkas untuk:{" "}
          <span className="font-bold text-ink-900">
            {pengajuan.jenis_pengajuan === "BEASISWA_PRESTASI"
              ? "Beasiswa Prestasi"
              : "Keringanan Biaya"}
          </span>
        </div>
      )}

      {/* Berkas List */}
      <div className="space-y-2">
        {relevantBerkas.map((item) => {
          const currentPath = (pengajuan as any)[item.fieldKey] as string | null;
          const isUploading = uploadingKey === item.fieldKey;
          const isDeleting = deletingKey === item.fieldKey;
          const isLoading = isUploading || isDeleting;

          return (
            <div
              key={item.fieldKey}
              className={`rounded-xl border p-3 transition-colors ${
                currentPath
                  ? "bg-green-50 border-green-200"
                  : item.required
                  ? "bg-amber-50 border-amber-200"
                  : "bg-stone-50 border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {currentPath ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : item.required ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <File className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-900 leading-tight">
                      {item.label}
                      {item.required && (
                        <span className="text-rose-500 ml-0.5">*</span>
                      )}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {currentPath && (
                    <>
                      <a
                        href={`/api/files/${currentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                        title="Lihat berkas"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.fieldKey)}
                        disabled={isLoading}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-40"
                        title="Hapus berkas"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}

                  {/* Upload / Ganti button */}
                  <label className={`flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors text-xs font-bold ${
                    currentPath
                      ? "bg-white border border-stone-200 text-stone-600 hover:border-primary-300 hover:text-primary-700"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  } ${isLoading ? "opacity-40 pointer-events-none" : ""}`}>
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : currentPath ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    {currentPath ? "Ganti" : "Upload"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      disabled={isLoading}
                      ref={(el) => {
                        fileInputRefs.current[item.fieldKey] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(item.fieldKey, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------------------

export default function AdminBeasiswaBlock({
  pendaftarId,
  dataLengkap,
  onUpdate,
}: {
  pendaftarId: string;
  dataLengkap?: any;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Current active keringanan/beasiswa data (from data_lengkap)
  const [current, setCurrent] = useState<KeringananData | null>(null);

  // Current pengajuan berkas data (from pengajuan_beasiswa table)
  const [pengajuanBerkas, setPengajuanBerkas] = useState<PengajuanBerkas | null>(null);
  const [loadingBerkas, setLoadingBerkas] = useState(false);

  // Section tab: null (idle) | "beasiswa" | "keringanan"
  const [activeSection, setActiveSection] = useState<null | "beasiswa" | "keringanan">(null);

  // Form state — BEASISWA
  const [beasiswaCakupan, setBeasiswaCakupan] = useState<CakupanBantuan>("UANG_PANGKAL");
  const [beasiswaCatatan, setBeasiswaCatatan] = useState("");

  // Form state — KERINGANAN
  const [keringananCakupan, setKeringananCakupan] = useState<CakupanBantuan>("UANG_PANGKAL");
  const [potonganUP, setPotonganUP] = useState("");
  const [potonganSPP, setPotonganSPP] = useState("");
  const [keringananCatatan, setKeringananCatatan] = useState("");

  // Initialize from dataLengkap prop
  useEffect(() => {
    if (dataLengkap) {
      const dl =
        typeof dataLengkap === "string" ? JSON.parse(dataLengkap) : dataLengkap;
      const k = parseKeringanan(dl?.keringanan_daftar_ulang);
      setCurrent(k);
    }
  }, [dataLengkap]);

  // Fetch fresh from server if no prop given
  useEffect(() => {
    if (!dataLengkap) fetchCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendaftarId]);

  // Always fetch berkas from pengajuan_beasiswa
  useEffect(() => {
    fetchBerkas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendaftarId]);

  const fetchCurrent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/pendaftar/${pendaftarId}`);
      if (res.ok) {
        const json = await res.json();
        const dl = json?.data?.data_lengkap;
        const parsed = typeof dl === "string" ? JSON.parse(dl) : (dl as any);
        setCurrent(parseKeringanan(parsed?.keringanan_daftar_ulang));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBerkas = async () => {
    try {
      setLoadingBerkas(true);
      const res = await fetch(`/api/admin/beasiswa?pendaftar_id=${pendaftarId}`);
      if (res.ok) {
        const json = await res.json();
        // Find the one matching this pendaftar
        const item = Array.isArray(json.data)
          ? json.data.find((d: any) => d.pendaftar_id === pendaftarId)
          : null;
        setPengajuanBerkas(item || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBerkas(false);
    }
  };

  const handleRefresh = async () => {
    await fetchBerkas();
    if (onUpdate) onUpdate();
  };

  const openBeasiswa = () => {
    setBeasiswaCakupan("UANG_PANGKAL");
    setBeasiswaCatatan("");
    setActiveSection("beasiswa");
  };

  const openKeringanan = () => {
    setKeringananCakupan("UANG_PANGKAL");
    setPotonganUP("");
    setPotonganSPP("");
    setKeringananCatatan("");
    setActiveSection("keringanan");
  };

  const closeSection = () => setActiveSection(null);

  const save = async (payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pendaftar/keringanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftar_id: pendaftarId, ...payload }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Gagal menyimpan");
      Swal.fire("Berhasil!", "Bantuan biaya berhasil disimpan.", "success");
      setActiveSection(null);
      // Refresh
      await fetchCurrent();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBeasiswa = () => {
    const pUP =
      beasiswaCakupan === "UANG_PANGKAL" || beasiswaCakupan === "KEDUANYA"
        ? MAX_UP
        : 0;
    const pSPP =
      beasiswaCakupan === "SPP" || beasiswaCakupan === "KEDUANYA" ? MAX_SPP : 0;

    save({
      jenis_bantuan: "BEASISWA",
      cakupan: beasiswaCakupan,
      potongan_uang_pangkal: pUP,
      potongan_spp: pSPP,
      catatan: beasiswaCatatan || null,
    });
  };

  const handleSaveKeringanan = () => {
    const pUP =
      keringananCakupan === "UANG_PANGKAL" || keringananCakupan === "KEDUANYA"
        ? Number(potonganUP || 0)
        : 0;
    const pSPP =
      keringananCakupan === "SPP" || keringananCakupan === "KEDUANYA"
        ? Number(potonganSPP || 0)
        : 0;

    if (
      (keringananCakupan === "UANG_PANGKAL" || keringananCakupan === "KEDUANYA") &&
      pUP <= 0
    ) {
      Swal.fire("Peringatan", "Nominal potongan Uang Pangkal harus diisi", "warning");
      return;
    }
    if ((keringananCakupan === "SPP" || keringananCakupan === "KEDUANYA") && pSPP <= 0) {
      Swal.fire("Peringatan", "Nominal potongan SPP harus diisi", "warning");
      return;
    }

    save({
      jenis_bantuan: "KERINGANAN",
      cakupan: keringananCakupan,
      potongan_uang_pangkal: pUP,
      potongan_spp: pSPP,
      catatan: keringananCatatan || null,
    });
  };

  const handleHapus = () => {
    Swal.fire({
      title: "Hapus Bantuan Biaya?",
      text: "Bantuan beasiswa/keringanan yang aktif akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, Hapus",
    }).then((result) => {
      if (result.isConfirmed) {
        save({ jenis_bantuan: null });
      }
    });
  };

  // ---------- Derived display values for active bantuan ----------
  const isBeasiswa = current?.jenis_bantuan === "BEASISWA";
  const isKeringanan = current?.jenis_bantuan === "KERINGANAN";
  const pUPActive = Number(current?.potongan_uang_pangkal ?? current?.nominal_potongan ?? 0);
  const pSPPActive = Number(current?.potongan_spp ?? 0);
  const cakupanActive = current?.cakupan;

  const cakupanLabel = (c?: CakupanBantuan) => {
    if (c === "UANG_PANGKAL") return "Uang Pangkal saja";
    if (c === "SPP") return "SPP Bulan Pertama saja";
    if (c === "KEDUANYA") return "Uang Pangkal + SPP";
    return "-";
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm mt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-ink-900">Bantuan Biaya</h3>
            <p className="text-xs text-stone-500">
              Beasiswa (gratis) atau Keringanan (potongan) per komponen
            </p>
          </div>
        </div>
        {current && (
          <button
            onClick={handleHapus}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>
        )}
      </div>

      {/* Active Bantuan Card */}
      {current ? (
        <div
          className={`rounded-xl p-4 border ${
            isBeasiswa
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {isBeasiswa ? (
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            ) : (
              <Coins className="w-5 h-5 text-amber-600" />
            )}
            <span
              className={`text-xs font-black uppercase tracking-widest ${
                isBeasiswa ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isBeasiswa ? "✓ Beasiswa Aktif" : "✓ Keringanan Aktif"}
            </span>
          </div>

          <p
            className={`text-sm font-bold mb-3 ${
              isBeasiswa ? "text-emerald-900" : "text-amber-900"
            }`}
          >
            Cakupan: {cakupanLabel(cakupanActive as CakupanBantuan)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {(cakupanActive === "UANG_PANGKAL" || cakupanActive === "KEDUANYA") && (
              <div className="bg-white rounded-lg p-3 border border-stone-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                    Uang Pangkal
                  </span>
                </div>
                <p className={`font-black text-lg ${isBeasiswa ? "text-emerald-700" : "text-amber-700"}`}>
                  {isBeasiswa ? "GRATIS" : `- ${formatCurrency(pUPActive)}`}
                </p>
                {isBeasiswa && (
                  <p className="text-[10px] text-stone-400 font-medium">
                    Hemat {formatCurrency(MAX_UP)}
                  </p>
                )}
              </div>
            )}
            {(cakupanActive === "SPP" || cakupanActive === "KEDUANYA") && (
              <div className="bg-white rounded-lg p-3 border border-stone-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                    SPP Bulan Pertama
                  </span>
                </div>
                <p className={`font-black text-lg ${isBeasiswa ? "text-emerald-700" : "text-amber-700"}`}>
                  {isBeasiswa ? "GRATIS" : `- ${formatCurrency(pSPPActive)}`}
                </p>
                {isBeasiswa && (
                  <p className="text-[10px] text-stone-400 font-medium">
                    Hemat {formatCurrency(MAX_SPP)}
                  </p>
                )}
              </div>
            )}
          </div>

          {current.catatan && (
            <p className="text-xs text-stone-600 mt-3 italic">📝 {current.catatan}</p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={openBeasiswa}
              className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Ubah ke Beasiswa
            </button>
            <button
              onClick={openKeringanan}
              className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Ubah ke Keringanan
            </button>
          </div>
        </div>
      ) : (
        /* No active bantuan */
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-5 text-center text-stone-400">
          <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Belum ada bantuan biaya yang diberikan</p>
        </div>
      )}

      {/* --- ACTION BUTTONS (when no form is open and no active assistance) --- */}
      {!current && !activeSection && (
        <div className="grid grid-cols-2 gap-3">
          {/* BEASISWA */}
          <button
            onClick={openBeasiswa}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl transition-all group"
          >
            <GraduationCap className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="font-black text-sm text-emerald-900">Berikan Beasiswa</span>
            <span className="text-[10px] text-emerald-600 font-medium">Gratis sebagian/semua biaya</span>
          </button>
          {/* KERINGANAN */}
          <button
            onClick={openKeringanan}
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-xl transition-all group"
          >
            <Coins className="w-7 h-7 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-black text-sm text-amber-900">Berikan Keringanan</span>
            <span className="text-[10px] text-amber-600 font-medium">Potongan sebagian biaya</span>
          </button>
        </div>
      )}

      {/* ========== FORM: BEASISWA ========== */}
      {activeSection === "beasiswa" && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <h4 className="font-black text-emerald-900">Form Beasiswa</h4>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 font-black px-2 py-0.5 rounded-full">GRATIS</span>
            </div>
            <button onClick={closeSection} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* Cakupan */}
          <div>
            <label className="block text-xs font-black text-stone-600 mb-2 uppercase tracking-widest">
              Cakupan Beasiswa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["UANG_PANGKAL", "SPP", "KEDUANYA"] as CakupanBantuan[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBeasiswaCakupan(c)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    beasiswaCakupan === c
                      ? "border-emerald-500 bg-emerald-100 shadow-sm"
                      : "border-stone-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  {c === "UANG_PANGKAL" && <Building2 className={`w-5 h-5 ${beasiswaCakupan === c ? "text-emerald-600" : "text-stone-400"}`} />}
                  {c === "SPP" && <BookOpen className={`w-5 h-5 ${beasiswaCakupan === c ? "text-emerald-600" : "text-stone-400"}`} />}
                  {c === "KEDUANYA" && <CheckCircle className={`w-5 h-5 ${beasiswaCakupan === c ? "text-emerald-600" : "text-stone-400"}`} />}
                  <span className={`text-[10px] font-black leading-tight ${beasiswaCakupan === c ? "text-emerald-900" : "text-stone-500"}`}>
                    {c === "UANG_PANGKAL" ? "Uang Pangkal" : c === "SPP" ? "SPP Bulan Pertama" : "Uang Pangkal + SPP"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview potongan */}
          <div className="bg-emerald-100 rounded-xl p-4 flex flex-wrap gap-4">
            {(beasiswaCakupan === "UANG_PANGKAL" || beasiswaCakupan === "KEDUANYA") && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold">Uang Pangkal</p>
                  <p className="font-black text-emerald-800 text-sm">GRATIS (hemat {formatCurrency(MAX_UP)})</p>
                </div>
              </div>
            )}
            {(beasiswaCakupan === "SPP" || beasiswaCakupan === "KEDUANYA") && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold">SPP Bulan Pertama</p>
                  <p className="font-black text-emerald-800 text-sm">GRATIS (hemat {formatCurrency(MAX_SPP)})</p>
                </div>
              </div>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Catatan / Dasar Pemberian (Opsional)
            </label>
            <input
              type="text"
              value={beasiswaCatatan}
              onChange={(e) => setBeasiswaCatatan(e.target.value)}
              placeholder="Contoh: Beasiswa prestasi hafal 10 juz, atau anak yatim..."
              className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={closeSection} className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded-lg">
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveBeasiswa}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Beasiswa
            </button>
          </div>
        </div>
      )}

      {/* ========== FORM: KERINGANAN ========== */}
      {activeSection === "keringanan" && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <h4 className="font-black text-amber-900">Form Keringanan</h4>
              <span className="text-[10px] bg-amber-200 text-amber-800 font-black px-2 py-0.5 rounded-full">POTONGAN</span>
            </div>
            <button onClick={closeSection} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          {/* Cakupan */}
          <div>
            <label className="block text-xs font-black text-stone-600 mb-2 uppercase tracking-widest">
              Cakupan Keringanan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["UANG_PANGKAL", "SPP", "KEDUANYA"] as CakupanBantuan[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setKeringananCakupan(c)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    keringananCakupan === c
                      ? "border-amber-500 bg-amber-100 shadow-sm"
                      : "border-stone-200 bg-white hover:border-amber-300"
                  }`}
                >
                  {c === "UANG_PANGKAL" && <Building2 className={`w-5 h-5 ${keringananCakupan === c ? "text-amber-600" : "text-stone-400"}`} />}
                  {c === "SPP" && <BookOpen className={`w-5 h-5 ${keringananCakupan === c ? "text-amber-600" : "text-stone-400"}`} />}
                  {c === "KEDUANYA" && <AlertCircle className={`w-5 h-5 ${keringananCakupan === c ? "text-amber-600" : "text-stone-400"}`} />}
                  <span className={`text-[10px] font-black leading-tight ${keringananCakupan === c ? "text-amber-900" : "text-stone-500"}`}>
                    {c === "UANG_PANGKAL" ? "Uang Pangkal" : c === "SPP" ? "SPP Bulan Pertama" : "Uang Pangkal + SPP"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input nominal potongan */}
          <div className="grid gap-4">
            {(keringananCakupan === "UANG_PANGKAL" || keringananCakupan === "KEDUANYA") && (
              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  <label className="text-xs font-black text-stone-700 uppercase tracking-widest">
                    Potongan Uang Pangkal
                  </label>
                </div>
                <p className="text-[10px] text-stone-400 mb-2 font-medium">
                  Tagihan asli: {formatCurrency(MAX_UP)} — input nominal potongan yang diberikan
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    min={0}
                    max={MAX_UP}
                    value={potonganUP}
                    onChange={(e) => setPotonganUP(e.target.value)}
                    placeholder="Contoh: 3500000"
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm font-bold text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
                  />
                </div>
                {potonganUP && Number(potonganUP) > 0 && (
                  <p className="text-[10px] text-amber-700 mt-1 font-medium">
                    → Tagihan menjadi: {formatCurrency(MAX_UP - Number(potonganUP))}
                  </p>
                )}
              </div>
            )}

            {(keringananCakupan === "SPP" || keringananCakupan === "KEDUANYA") && (
              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  <label className="text-xs font-black text-stone-700 uppercase tracking-widest">
                    Potongan SPP Bulan Pertama
                  </label>
                </div>
                <p className="text-[10px] text-stone-400 mb-2 font-medium">
                  Tagihan asli: {formatCurrency(MAX_SPP)} — input nominal potongan yang diberikan
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    min={0}
                    max={MAX_SPP}
                    value={potonganSPP}
                    onChange={(e) => setPotonganSPP(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm font-bold text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
                  />
                </div>
                {potonganSPP && Number(potonganSPP) > 0 && (
                  <p className="text-[10px] text-amber-700 mt-1 font-medium">
                    → Tagihan menjadi: {formatCurrency(MAX_SPP - Number(potonganSPP))}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Catatan / Dasar Pemberian (Opsional)
            </label>
            <input
              type="text"
              value={keringananCatatan}
              onChange={(e) => setKeringananCatatan(e.target.value)}
              placeholder="Contoh: Keringanan SKTM, anak yatim, dsb..."
              className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={closeSection} className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded-lg">
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveKeringanan}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Keringanan
            </button>
          </div>
        </div>
      )}

      {/* ========== BERKAS SECTION (always visible for admin_super) ========== */}
      {loadingBerkas ? (
        <div className="flex items-center gap-2 text-xs text-stone-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Memuat data berkas...
        </div>
      ) : pengajuanBerkas ? (
        <AdminBerkasSection
          pendaftarId={pendaftarId}
          pengajuan={pengajuanBerkas}
          onRefresh={handleRefresh}
        />
      ) : (
        <div className="mt-4 border-t border-stone-200 pt-4">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Belum ada pengajuan beasiswa/keringanan dari pendaftar ini.</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Admin dapat membuat pengajuan melalui halaman detail pendaftar, tab &quot;Bantuan Biaya&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
