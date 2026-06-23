"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  UploadCloud,
  Loader2,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  File,
} from "lucide-react";
import { Alert } from "@/components/ui";

export default function PengajuanKeringananPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataUser, setDataUser] = useState<any>(null);

  // Form State
  const [kesanggupanBayar, setKesanggupanBayar] = useState("");
  const [alasan, setAlasan] = useState("");

  // File State — Keringanan: SKTM + Surat Permohonan
  const [fileSktm, setFileSktm] = useState<File | null>(null);
  const [filePermohonan, setFilePermohonan] = useState<File | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      const statusRes = await fetch(
        `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`
      );
      const statusData = await statusRes.json();
      setDataUser(statusData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setKesanggupanBayar(
      new Intl.NumberFormat("id-ID").format(parseInt(val || "0"))
    );
  };

  const handleFileChange =
    (setter: (f: File | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null;
      if (f && f.size > 10 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran file maksimal 10MB." });
        return;
      }
      setter(f);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi file Wajib
    if (!fileSktm || !filePermohonan) {
      setMessage({
        type: "error",
        text: "Mohon lengkapi seluruh dokumen WAJIB (SKTM dan Surat Permohonan Keringanan).",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jenis", "Keringanan");
    formData.append("alasan", alasan);
    formData.append("kesanggupan_bayar", kesanggupanBayar.replace(/\D/g, ""));
    formData.append("file_sktm", fileSktm);
    formData.append("file_permohonan", filePermohonan);

    try {
      const res = await fetch("/api/pendaftar/pengajuan-keringanan", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim pengajuan");

      setMessage({
        type: "success",
        text: "Pengajuan berhasil dikirim dan sedang dalam proses peninjauan oleh Tim Finance.",
      });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Parse existing pengajuan
  let dataLengkap = dataUser?.data_lengkap;
  if (typeof dataLengkap === "string") {
    try {
      dataLengkap = JSON.parse(dataLengkap);
    } catch (e) {}
  }
  const pengajuan = dataLengkap?.pengajuan_keringanan;

  if (pengajuan) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-primary-100 flex flex-col items-center text-center">
          <div
            className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border ${
              pengajuan.status === "approved"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : pengajuan.status === "rejected"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}
          >
            {pengajuan.status === "approved" ? (
              <CheckCircle className="w-12 h-12" />
            ) : pengajuan.status === "rejected" ? (
              <AlertCircle className="w-12 h-12" />
            ) : (
              <Loader2 className="w-12 h-12 animate-spin" />
            )}
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Pengajuan {pengajuan.jenis}
          </h2>

          <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
            {pengajuan.status === "pending" &&
              "Pengajuan Anda telah kami terima dan sedang dalam antrean pemeriksaan oleh tim verifikator."}
            {pengajuan.status === "approved" &&
              "Selamat! Pengajuan Anda telah disetujui. Tagihan Daftar Ulang Anda otomatis diperbarui."}
            {pengajuan.status === "rejected" &&
              "Mohon maaf, pengajuan Anda saat ini tidak dapat kami setujui setelah melalui proses pertimbangan."}
          </p>

          <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black border ${
                  pengajuan.status === "approved"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : pengajuan.status === "rejected"
                    ? "bg-rose-100 text-rose-700 border-rose-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}
              >
                {pengajuan.status.toUpperCase()}
              </span>
            </div>

            {pengajuan.kesanggupan_bayar > 0 && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Kesanggupan Bayar
                </span>
                <span className="font-black text-slate-900">
                  Rp{" "}
                  {parseInt(pengajuan.kesanggupan_bayar).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {pengajuan.nominal_disetujui > 0 &&
              pengajuan.status === "approved" && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                    Nilai Potongan Disetujui
                  </span>
                  <span className="font-black text-emerald-700 text-lg">
                    Rp{" "}
                    {pengajuan.nominal_disetujui.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-linear-to-br from-primary-700 to-primary-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <h1 className="text-3xl font-black mb-2 relative z-10">
          Pengajuan Keringanan Biaya
        </h1>
        <p className="text-gold-100 relative z-10 text-lg font-medium">
          Fasilitas penyesuaian biaya bagi keluarga yang membutuhkan.
        </p>
      </div>

      {message && (
        <Alert
          type={message.type}
          title={message.type === "success" ? "Berhasil" : "Gagal"}
        >
          {message.text}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: Rincian */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-2">
              1. Rincian Pengajuan
            </h3>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Kesanggupan Bayar (Rp){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  Rp
                </span>
                <input
                  type="text"
                  value={kesanggupanBayar}
                  onChange={handleNominalChange}
                  className="w-full pl-12 pr-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Contoh: 5.000.000"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium italic">
                Sebutkan nominal pasti yang Anda sanggupi.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Penjelasan / Alasan Pengajuan{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 min-h-[120px] bg-slate-50 text-sm"
                placeholder="Ceritakan dengan singkat dan jelas mengenai kondisi finansial keluarga..."
                required
              />
            </div>
          </div>

          {/* Section 2: Upload Dokumen */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              2. Upload Dokumen Persyaratan
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                Format: PDF/JPG/PNG (Max 10MB)
              </span>
            </h3>

            {/* Info syarat */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 font-medium">
              📋 Keringanan memerlukan 2 dokumen wajib: <strong>SKTM</strong>{" "}
              dan{" "}
              <strong>Surat Permohonan Keringanan Biaya</strong>. Surat
              Permohonan harus menyebutkan jenis biaya (Uang Pangkal / SPP),
              jumlah yang sanggup dibayar, dan/atau potongan yang diminta.
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* SKTM */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  SKTM (Surat Keterangan Tidak Mampu){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[10px] text-slate-500 mb-3">
                  Dari RT/RW atau Kelurahan setempat.
                </p>
                {fileSktm && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
                    <File className="w-3.5 h-3.5" />
                    <span className="font-bold truncate">{fileSktm.name}</span>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileChange(setFileSktm)}
                  className="w-full text-xs"
                  accept="image/*,application/pdf"
                  required
                />
              </div>

              {/* Surat Permohonan */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Surat Permohonan Keringanan Biaya{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[10px] text-slate-500 mb-3">
                  Menyebutkan jenis biaya, jumlah sanggup bayar, dan/atau
                  potongan yang diminta.
                </p>
                {filePermohonan && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
                    <File className="w-3.5 h-3.5" />
                    <span className="font-bold truncate">
                      {filePermohonan.name}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileChange(setFilePermohonan)}
                  className="w-full text-xs"
                  accept="image/*,application/pdf"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Info */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Dengan menekan tombol kirim, Anda menyatakan bahwa seluruh data
              dan dokumen yang dilampirkan adalah benar dan dapat
              dipertanggungjawabkan.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
            {submitting ? "Mengunggah Dokumen..." : "Kirim Pengajuan Keringanan"}
          </button>
        </div>
      </form>
    </div>
  );
}
