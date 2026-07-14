"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  Trash2,
  File,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type BerkasFieldKey =
  | "file_sktm_path"
  | "file_slip_gaji_path"
  | "file_ktp_path"
  | "file_ktp_ibu_path"
  | "file_prestasi_path"
  | "file_permohonan_path";

interface BerkasItem {
  fieldKey: BerkasFieldKey;
  label: string;
  desc: string;
  required: boolean;
  showFor: "BEASISWA" | "KERINGANAN_BIAYA" | "BOTH";
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG: Daftar berkas sesuai jenis pengajuan
// ─────────────────────────────────────────────────────────────────────────────

const BERKAS_CONFIG: BerkasItem[] = [
  {
    fieldKey: "file_sktm_path",
    label: "Surat Keterangan Tidak Mampu (SKTM)",
    desc: "Dari RT/RW atau Kelurahan setempat.",
    required: true,
    showFor: "BOTH",
  },
  {
    fieldKey: "file_slip_gaji_path",
    label: "Surat Keterangan / Bukti Penghasilan Orangtua",
    desc: "Slip Gaji Ayah dan Ibu, atau Surat Keterangan Penghasilan.",
    required: true,
    showFor: "BEASISWA",
  },
  {
    fieldKey: "file_ktp_path",
    label: "KTP Orangtua Ayah",
    desc: "Scan atau foto KTP Ayah yang jelas dan dapat dibaca.",
    required: true,
    showFor: "BEASISWA",
  },
  {
    fieldKey: "file_ktp_ibu_path",
    label: "KTP Orangtua Ibu",
    desc: "Scan atau foto KTP Ibu yang jelas dan dapat dibaca.",
    required: true,
    showFor: "BEASISWA",
  },
  {
    fieldKey: "file_permohonan_path",
    label: "Surat Permohonan Keringanan Biaya",
    desc: "Menyebutkan jenis biaya (Uang Pangkal / SPP), jumlah yang sanggup dibayar dan/atau potongan yang diminta.",
    required: true,
    showFor: "KERINGANAN_BIAYA",
  },
  {
    fieldKey: "file_prestasi_path",
    label: "Bukti Memiliki Hafalan Al-Qur'an / Ranking 3 Besar",
    desc: "Sertifikat hafalan atau bukti peringkat 3 besar di sekolah asal.",
    required: true,
    showFor: "BEASISWA",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOAD FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function FileUploadField({
  item,
  file,
  onFileChange,
}: {
  item: BerkasItem;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      Swal.fire("Gagal", "Ukuran file maksimal 10MB", "error");
      return;
    }
    onFileChange(f);
  };

  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
      <div className="flex justify-between items-start mb-1">
        <label className="block text-sm font-bold text-ink-900">
          {item.label}{" "}
          {item.required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <p className="text-xs text-stone-500 mb-3">{item.desc}</p>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-white transition-colors bg-stone-50">
        <div className="flex flex-col items-center justify-center py-4">
          {file ? (
            <>
              <File className="w-5 h-5 text-primary-500 mb-1" />
              <p className="text-xs text-primary-700 font-bold px-3 text-center line-clamp-2">
                {file.name}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6 text-stone-400 mb-1" />
              <p className="text-xs text-stone-500 font-medium">
                Klik untuk upload (PDF/JPG/PNG, maks 10MB)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOADED BERKAS DISPLAY (for submitted state)
// ─────────────────────────────────────────────────────────────────────────────

function BerkasStatusItem({
  label,
  path,
}: {
  label: string;
  path: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-2">
        {path ? (
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <span className="text-xs font-medium text-stone-700">{label}</span>
      </div>
      {path ? (
        <a
          href={`/api/files/${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Lihat
        </a>
      ) : (
        <span className="text-xs text-amber-600 font-medium">Belum ada</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PengajuanBeasiswaTab() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);

  const [jenisPengajuan, setJenisPengajuan] = useState("KERINGANAN_BIAYA");
  const [alasanPengajuan, setAlasanPengajuan] = useState("");
  const [nominalKesanggupan, setNominalKesanggupan] = useState("");

  // File states — keyed by BerkasFieldKey
  const [files, setFiles] = useState<Partial<Record<BerkasFieldKey, File | null>>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/pendaftar/beasiswa");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setFile = (key: BerkasFieldKey) => (f: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: f }));
  };

  const uploadFile = async (file: File, kategori: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kategori", kategori);

    const uploadRes = await fetch("/api/upload/dokumen", {
      method: "POST",
      body: formData,
    });
    const result = await uploadRes.json();
    if (!uploadRes.ok || !result.path) throw new Error(`Gagal upload ${file.name}`);
    return result.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanPengajuan) {
      Swal.fire("Peringatan", "Harap isi alasan pengajuan", "warning");
      return;
    }

    // Validate required files based on jenis
    const requiredFields = BERKAS_CONFIG.filter(
      (b) =>
        b.required &&
        (b.showFor === "BOTH" || b.showFor === jenisPengajuan)
    );

    for (const field of requiredFields) {
      if (!files[field.fieldKey]) {
        Swal.fire(
          "Peringatan",
          `Berkas wajib "${field.label}" belum diupload`,
          "warning"
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      // Upload all files
      const uploaded: Partial<Record<BerkasFieldKey, string>> = {};

      for (const [key, file] of Object.entries(files)) {
        if (file) {
          uploaded[key as BerkasFieldKey] = await uploadFile(file, "BEASISWA");
        }
      }

      const payload = {
        jenis_pengajuan: jenisPengajuan,
        alasan_pengajuan: alasanPengajuan,
        nominal_kesanggupan: nominalKesanggupan || null,
        file_sktm_path: uploaded.file_sktm_path || null,
        file_slip_gaji_path: uploaded.file_slip_gaji_path || null,
        file_ktp_path: uploaded.file_ktp_path || null,
        file_ktp_ibu_path: uploaded.file_ktp_ibu_path || null,
        file_prestasi_path: uploaded.file_prestasi_path || null,
        file_permohonan_path: uploaded.file_permohonan_path || null,
      };

      const res = await fetch("/api/pendaftar/beasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire(
          "Berhasil",
          "Pengajuan berhasil dikirim dan akan diverifikasi",
          "success"
        );
        fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Terjadi kesalahan sistem", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // ── Already submitted ──
  if (data) {
    const isApproved = data.status === "DISETUJUI";
    const isRejected = data.status === "DITOLAK";
    const isBeasiswa = data.jenis_pengajuan?.startsWith("BEASISWA");
    const StatusIcon = isApproved ? CheckCircle : isRejected ? XCircle : Clock;

    // Determine which berkas fields to show based on jenis
    const berkasToShow: Array<{ label: string; path: string | null }> =
      isBeasiswa
        ? [
            { label: "SKTM", path: data.file_sktm_path },
            {
              label: "Surat Keterangan / Bukti Penghasilan",
              path: data.file_slip_gaji_path,
            },
            { label: "KTP Orangtua Ayah", path: data.file_ktp_path },
            { label: "KTP Orangtua Ibu", path: data.file_ktp_ibu_path },
            {
              label: "Bukti Prestasi / Hafalan",
              path: data.file_prestasi_path,
            },
          ]
        : [
            { label: "SKTM", path: data.file_sktm_path },
            {
              label: "Surat Permohonan Keringanan",
              path: data.file_permohonan_path || data.file_prestasi_path,
            },
          ];

    // Check if any required berkas missing
    const requiredBerkas = isBeasiswa
      ? berkasToShow.slice(0, 5)
      : berkasToShow.slice(0, 2);
    const missingCount = requiredBerkas.filter((b) => !b.path).length;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-6">
        {/* Status Header */}
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isApproved
                ? "bg-green-100 text-green-600"
                : isRejected
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <StatusIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-ink-950 mb-2">
            Status Pengajuan
          </h2>
          <p className="text-stone-500 font-medium">
            {isApproved
              ? "Pengajuan Anda telah disetujui."
              : isRejected
              ? "Mohon maaf, pengajuan Anda tidak dapat disetujui."
              : "Pengajuan Anda sedang dalam proses tinjauan."}
          </p>
        </div>

        {/* Detail */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Jenis Pengajuan</span>
            <span className="font-bold text-ink-900">
              {data.jenis_pengajuan?.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Tanggal Pengajuan</span>
            <span className="font-bold text-ink-900">
              {new Date(data.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Diajukan Oleh</span>
            <span className="font-bold text-ink-900">
              {data.diajukan_oleh_role === "ADMIN"
                ? "Admin (Bantuan Input)"
                : "Anda Sendiri"}
            </span>
          </div>
          {data.nominal_kesanggupan && (
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-500 text-sm">Kesanggupan Nominal</span>
              <span className="font-bold text-ink-900">
                Rp {Number(data.nominal_kesanggupan).toLocaleString("id-ID")}
              </span>
            </div>
          )}
          {data.catatan_keputusan && (
            <div className="bg-surface-50 p-4 rounded-xl mt-2">
              <span className="block text-xs font-bold text-surface-600 uppercase mb-1">
                Catatan Verifikator
              </span>
              <p className="text-sm font-medium text-ink-800">
                {data.catatan_keputusan}
              </p>
            </div>
          )}
        </div>

        {/* Berkas Section */}
        <div className="border border-stone-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-500" />
              Berkas Persyaratan
            </h3>
            {missingCount > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {missingCount} berkas belum ada
              </span>
            )}
          </div>
          <div className="space-y-0">
            {berkasToShow.map((b) => (
              <BerkasStatusItem key={b.label} label={b.label} path={b.path} />
            ))}
          </div>
          {missingCount > 0 && (
            <p className="text-xs text-amber-700 mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5 font-medium">
              ℹ️ Berkas yang belum ada dapat dilengkapi oleh Admin. Silakan hubungi tim administrasi.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Belum mengajukan ──
  const visibleBerkas = BERKAS_CONFIG.filter(
    (b) => b.showFor === "BOTH" || b.showFor === jenisPengajuan
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-black text-ink-950 mb-2">
          Pengajuan Beasiswa / Keringanan
        </h2>
        <p className="text-stone-500 font-medium text-sm max-w-lg mx-auto">
          Lengkapi form dan unggah seluruh dokumen persyaratan di bawah ini
          untuk mengajukan permohonan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jenis Pengajuan */}
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">
            Jenis Pengajuan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                jenisPengajuan === "KERINGANAN_BIAYA"
                  ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm"
                  : "border-stone-200 hover:border-primary-200"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={jenisPengajuan === "KERINGANAN_BIAYA"}
                onChange={() => setJenisPengajuan("KERINGANAN_BIAYA")}
              />
              <span className="font-bold text-sm block mb-1">
                Keringanan Biaya
              </span>
              <span className="text-[10px] opacity-75">
                Berdasarkan kemampuan ekonomi orang tua (SKTM)
              </span>
            </label>
            <label
              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                jenisPengajuan === "BEASISWA_PRESTASI"
                  ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm"
                  : "border-stone-200 hover:border-primary-200"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={jenisPengajuan === "BEASISWA_PRESTASI"}
                onChange={() => setJenisPengajuan("BEASISWA_PRESTASI")}
              />
              <span className="font-bold text-sm block mb-1">
                Beasiswa Prestasi
              </span>
              <span className="text-[10px] opacity-75">
                Hafalan Quran / Juara Lomba / Yatim Dhuafa
              </span>
            </label>
          </div>
        </div>

        {/* Alasan */}
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">
            Alasan Pengajuan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Jelaskan secara singkat alasan pengajuan Anda..."
            className="w-full p-3 border border-stone-300 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none text-sm"
            value={alasanPengajuan}
            onChange={(e) => setAlasanPengajuan(e.target.value)}
          />
        </div>

        {/* Nominal Kesanggupan (hanya untuk Keringanan) */}
        {jenisPengajuan === "KERINGANAN_BIAYA" && (
          <div>
            <label className="block text-sm font-bold text-ink-900 mb-2">
              Kesanggupan Membayar Uang Pangkal (Rp){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="Contoh: 5000000"
              className="w-full p-3 border border-stone-300 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
              value={nominalKesanggupan}
              onChange={(e) => setNominalKesanggupan(e.target.value)}
            />
            <p className="text-xs text-stone-500 mt-1">
              Sebutkan nominal pasti yang Anda sanggupi. Anda juga bisa
              mencantumkan rincian di Surat Permohonan.
            </p>
          </div>
        )}

        {/* Dokumen Persyaratan */}
        <div className="border-t border-stone-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-ink-900 text-lg">
              Dokumen Persyaratan
            </h3>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
              Format: PDF/JPG/PNG (Maks 10MB)
            </span>
          </div>

          {/* Info syarat berkas */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium">
            {jenisPengajuan === "BEASISWA_PRESTASI" ? (
              <span>
                📋 <strong>Beasiswa</strong> memerlukan: SKTM + Surat Keterangan
                Penghasilan + KTP Orangtua Ayah + KTP Orangtua Ibu + Bukti Memiliki
                Hafalan Al-Qur'an / Ranking 3 Besar.
              </span>
            ) : (
              <span>
                📋 <strong>Keringanan</strong> memerlukan: SKTM + Surat
                Permohonan Keringanan. Surat Permohonan harus menyebutkan jenis
                biaya (Uang Pangkal / SPP), jumlah yang sanggup dibayar,
                dan/atau potongan yang diminta.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleBerkas.map((item) => (
              <FileUploadField
                key={item.fieldKey}
                item={item}
                file={files[item.fieldKey] || null}
                onFileChange={setFile(item.fieldKey)}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition-all disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
          {submitting ? "Mengunggah dokumen..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
