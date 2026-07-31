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
              <div className="flex items-start justify-between gap-2 flex-wrap">
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

  const [current, setCurrent] = useState<KeringananData | null>(null);
  const [pengajuanBerkas, setPengajuanBerkas] = useState<PengajuanBerkas | null>(null);
  const [loadingBerkas, setLoadingBerkas] = useState(false);

  const [activeSection, setActiveSection] = useState<null | "form">(null);

  type BantuanType = "NONE" | "KERINGANAN" | "BEASISWA";
  const [tipeUP, setTipeUP] = useState<BantuanType>("NONE");
  const [tipeSPP, setTipeSPP] = useState<BantuanType>("NONE");
  const [potonganUP, setPotonganUP] = useState("");
  const [potonganSPP, setPotonganSPP] = useState("");
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (dataLengkap) {
      setCurrent(parseKeringanan(dataLengkap.keringanan_daftar_ulang));
    }
  }, [dataLengkap]);

  const fetchBerkas = async () => {
    try {
      setLoadingBerkas(true);
      const res = await fetch(`/api/admin/pendaftar/pengajuan-keringanan?pendaftar_id=${pendaftarId}`);
      const data = await res.json();
      if (data.success) {
        setPengajuanBerkas(data.data || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBerkas(false);
    }
  };

  useEffect(() => {
    fetchBerkas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendaftarId]);

  const fetchCurrent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/pendaftar/${pendaftarId}`);
      const data = await res.json();
      if (data.success && data.data?.data_lengkap) {
        setCurrent(parseKeringanan(data.data.data_lengkap.keringanan_daftar_ulang));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchCurrent(), fetchBerkas()]);
    if (onUpdate) onUpdate();
  };

  const openForm = () => {
    if (current) {
      const pUP = Number(current.potongan_uang_pangkal ?? current.nominal_potongan ?? 0);
      const pSPP = Number(current.potongan_spp ?? 0);

      if (pUP >= MAX_UP) { setTipeUP("BEASISWA"); setPotonganUP(""); }
      else if (pUP > 0) { setTipeUP("KERINGANAN"); setPotonganUP(String(pUP)); }
      else { setTipeUP("NONE"); setPotonganUP(""); }

      if (pSPP >= MAX_SPP) { setTipeSPP("BEASISWA"); setPotonganSPP(""); }
      else if (pSPP > 0) { setTipeSPP("KERINGANAN"); setPotonganSPP(String(pSPP)); }
      else { setTipeSPP("NONE"); setPotonganSPP(""); }

      setCatatan(current.catatan || "");
    } else {
      setTipeUP("NONE");
      setTipeSPP("NONE");
      setPotonganUP("");
      setPotonganSPP("");
      setCatatan("");
    }
    setActiveSection("form");
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
      await fetchCurrent();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => {
    let pUP = 0;
    if (tipeUP === "BEASISWA") pUP = MAX_UP;
    else if (tipeUP === "KERINGANAN") pUP = Number(potonganUP || 0);

    let pSPP = 0;
    if (tipeSPP === "BEASISWA") pSPP = MAX_SPP;
    else if (tipeSPP === "KERINGANAN") pSPP = Number(potonganSPP || 0);

    if (tipeUP === "KERINGANAN" && pUP <= 0) {
      Swal.fire("Peringatan", "Nominal potongan Uang Pangkal harus diisi", "warning");
      return;
    }
    if (tipeSPP === "KERINGANAN" && pSPP <= 0) {
      Swal.fire("Peringatan", "Nominal potongan SPP harus diisi", "warning");
      return;
    }

    if (pUP === 0 && pSPP === 0) {
      Swal.fire("Peringatan", "Anda belum memberikan potongan apapun. Jika ingin menghapus bantuan, gunakan tombol Hapus Bantuan.", "warning");
      return;
    }

    let jenisBantuan = "BEASISWA";
    if ((pUP > 0 && pUP < MAX_UP) || (pSPP > 0 && pSPP < MAX_SPP)) {
      jenisBantuan = "KEDUANYA";
    }

    let cakupan = "UANG_PANGKAL";
    if (pUP > 0 && pSPP > 0) cakupan = "KEDUANYA";
    else if (pSPP > 0) cakupan = "SPP";

    save({
      jenis_bantuan: jenisBantuan,
      cakupan,
      potongan_uang_pangkal: pUP,
      potongan_spp: pSPP,
      catatan: catatan || null,
    });
  };

  const handleDelete = async () => {
    const res = await Swal.fire({
      title: "Hapus Bantuan?",
      text: "Data keringanan/beasiswa santri ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;

    setSubmitting(true);
    try {
      const resp = await fetch(`/api/admin/pendaftar/keringanan?pendaftar_id=${pendaftarId}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || "Gagal menghapus data");

      Swal.fire("Terhapus!", "Data bantuan biaya berhasil dihapus.", "success");
      setCurrent(null);
      setActiveSection(null);
      await fetchCurrent();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pUPActive = Number(current?.potongan_uang_pangkal ?? current?.nominal_potongan ?? 0);
  const pSPPActive = Number(current?.potongan_spp ?? 0);
  const isBeasiswaUP = pUPActive >= MAX_UP;
  const isBeasiswaSPP = pSPPActive >= MAX_SPP;
  const isKeringananUP = pUPActive > 0 && pUPActive < MAX_UP;
  const isKeringananSPP = pSPPActive > 0 && pSPPActive < MAX_SPP;
  
  const hasBeasiswa = isBeasiswaUP || isBeasiswaSPP;
  const hasKeringanan = isKeringananUP || isKeringananSPP;
  const isKeduanya = hasBeasiswa && hasKeringanan;
  const cakupanActive = current?.cakupan;

  const cakupanLabel = (c?: CakupanBantuan) => {
    if (c === "UANG_PANGKAL") return "Uang Pangkal saja";
    if (c === "SPP") return "SPP Bulan Pertama saja";
    if (c === "KEDUANYA") return "Uang Pangkal + SPP";
    return "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {current ? (
        <div
          className={`rounded-xl p-4 border ${
            isKeduanya ? "bg-primary-50 border-primary-200" : hasBeasiswa ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {isKeduanya ? (
              <HandCoins className="w-5 h-5 text-primary-600" />
            ) : hasBeasiswa ? (
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            ) : (
              <Coins className="w-5 h-5 text-amber-600" />
            )}
            <span
              className={`text-xs font-black uppercase tracking-widest ${isKeduanya ? "text-primary-700" : hasBeasiswa ? "text-emerald-700" : "text-amber-700"}`}
            >
              {isKeduanya ? "✓ BEASISWA & KERINGANAN AKTIF" : hasBeasiswa ? "✓ Beasiswa Aktif" : "✓ Keringanan Aktif"}
            </span>
          </div>

          <p
            className={`text-sm font-bold mb-3 ${
              isKeduanya ? "text-primary-900" : hasBeasiswa ? "text-emerald-900" : "text-amber-900"
            }`}
          >
            Cakupan: {cakupanLabel(cakupanActive as CakupanBantuan)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(cakupanActive === "UANG_PANGKAL" || cakupanActive === "KEDUANYA") && (
              <div className="bg-white rounded-lg p-3 border border-stone-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                    Uang Pangkal
                  </span>
                </div>
                <p className={`font-black text-lg ${isBeasiswaUP ? "text-emerald-700" : "text-amber-700"}`}>
                  {isBeasiswaUP ? "GRATIS" : `- ${formatCurrency(pUPActive)}`}
                </p>
                {isBeasiswaUP && (
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
                <p className={`font-black text-lg ${isBeasiswaSPP ? "text-emerald-700" : "text-amber-700"}`}>
                  {isBeasiswaSPP ? "GRATIS" : `- ${formatCurrency(pSPPActive)}`}
                </p>
                {isBeasiswaSPP && (
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
              onClick={openForm}
              className="flex-1 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            > Atur Bantuan Biaya </button>
          </div>
          
          <button
            onClick={handleDelete}
            className="w-full mt-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Bantuan
          </button>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-5 text-center text-stone-400">
          <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Belum ada bantuan biaya yang diberikan</p>
        </div>
      )}

      {!current && !activeSection && (
        <button
          onClick={openForm}
          className="w-full flex flex-col items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 rounded-xl transition-all group"
        >
          <HandCoins className="w-7 h-7 text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm text-primary-900">Atur Bantuan Biaya</span>
          <span className="text-[10px] text-primary-600 font-medium">Berikan Beasiswa atau Keringanan SPP / Uang Pangkal</span>
        </button>
      )}

      {activeSection === "form" && (
        <div className="rounded-xl border-2 border-primary-200 bg-primary-50/30 p-4 sm:p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-primary-100 pb-3">
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-primary-600" />
              <h4 className="font-black text-primary-900">Form Bantuan Biaya</h4>
            </div>
            <button onClick={closeSection} className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-primary-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                <h5 className="font-black text-xs text-stone-700 uppercase tracking-widest">Uang Pangkal</h5>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="radio" name="up_type" checked={tipeUP === "NONE"} onChange={() => { setTipeUP("NONE"); setPotonganUP(""); }} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-xs font-bold text-stone-700">Tidak ada potongan</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="radio" name="up_type" checked={tipeUP === "KERINGANAN"} onChange={() => setTipeUP("KERINGANAN")} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-xs font-bold text-stone-700">Keringanan (Sebagian)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input type="radio" name="up_type" checked={tipeUP === "BEASISWA"} onChange={() => { setTipeUP("BEASISWA"); setPotonganUP(""); }} className="text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Beasiswa Penuh (Gratis)</span>
                </label>
              </div>

              {tipeUP === "KERINGANAN" && (
                <div className="pt-2">
                  <p className="text-[10px] text-stone-400 mb-1.5 font-medium">
                    Tagihan asli: {formatCurrency(MAX_UP)} — input nominal potongan
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">Rp</span>
                    <input
                      type="number" min={0} max={MAX_UP}
                      value={potonganUP}
                      onChange={(e) => setPotonganUP(e.target.value)}
                      placeholder="Contoh: 3500000"
                      className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none"
                    />
                  </div>
                  {potonganUP && Number(potonganUP) > 0 && (
                    <p className="text-[10px] text-primary-600 mt-1.5 font-bold">
                      → Tagihan menjadi: {formatCurrency(MAX_UP - Number(potonganUP))}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <BookOpen className="w-4 h-4 text-violet-600" />
                <h5 className="font-black text-xs text-stone-700 uppercase tracking-widest">SPP Bulan Pertama</h5>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="radio" name="spp_type" checked={tipeSPP === "NONE"} onChange={() => { setTipeSPP("NONE"); setPotonganSPP(""); }} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-xs font-bold text-stone-700">Tidak ada potongan</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input type="radio" name="spp_type" checked={tipeSPP === "KERINGANAN"} onChange={() => setTipeSPP("KERINGANAN")} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-xs font-bold text-stone-700">Keringanan (Sebagian)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input type="radio" name="spp_type" checked={tipeSPP === "BEASISWA"} onChange={() => { setTipeSPP("BEASISWA"); setPotonganSPP(""); }} className="text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Beasiswa Penuh (Gratis)</span>
                </label>
              </div>

              {tipeSPP === "KERINGANAN" && (
                <div className="pt-2">
                  <p className="text-[10px] text-stone-400 mb-1.5 font-medium">
                    Tagihan asli: {formatCurrency(MAX_SPP)} — input nominal potongan
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">Rp</span>
                    <input
                      type="number" min={0} max={MAX_SPP}
                      value={potonganSPP}
                      onChange={(e) => setPotonganSPP(e.target.value)}
                      placeholder="Contoh: 500000"
                      className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none"
                    />
                  </div>
                  {potonganSPP && Number(potonganSPP) > 0 && (
                    <p className="text-[10px] text-primary-600 mt-1.5 font-bold">
                      → Tagihan menjadi: {formatCurrency(MAX_SPP - Number(potonganSPP))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              Catatan / Dasar Pemberian Bantuan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Beasiswa yatim dan keringanan SKTM..."
              className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-primary-100">
            <button type="button" onClick={closeSection} className="px-5 py-2.5 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded-lg transition-colors">
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || (tipeUP === "NONE" && tipeSPP === "NONE")}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Bantuan
            </button>
          </div>
        </div>
      )}

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
