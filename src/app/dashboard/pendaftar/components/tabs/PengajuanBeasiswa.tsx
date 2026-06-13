"use client";

import { useState, useEffect } from "react";
import { Loader2, UploadCloud, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import Swal from "sweetalert2";

export default function PengajuanBeasiswaTab() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);

  const [jenisPengajuan, setJenisPengajuan] = useState("KERINGANAN_BIAYA");
  const [alasanPengajuan, setAlasanPengajuan] = useState("");
  const [nominalKesanggupan, setNominalKesanggupan] = useState("");

  const [fileSKTM, setFileSKTM] = useState<File | null>(null);
  const [fileSlipGaji, setFileSlipGaji] = useState<File | null>(null);
  const [fileKTP, setFileKTP] = useState<File | null>(null);
  const [filePrestasi, setFilePrestasi] = useState<File | null>(null);

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

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kategori", "BEASISWA");

    const uploadRes = await fetch("/api/upload/dokumen", {
      method: "POST",
      body: formData,
    });
    const result = await uploadRes.json();
    if (!uploadRes.ok || !result.path) throw new Error(`Gagal upload ${file.name}`);
    return result.path;
  };

  const handleFileChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Gagal", "Ukuran maksimal file adalah 5MB", "error");
        return;
      }
      setter(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanPengajuan) {
      Swal.fire("Peringatan", "Harap isi alasan pengajuan", "warning");
      return;
    }

    if (!fileSKTM || !fileSlipGaji || !fileKTP) {
      Swal.fire("Peringatan", "SKTM, Slip Gaji/Surat Penghasilan, dan KTP wajib diunggah", "warning");
      return;
    }

    if (jenisPengajuan === "BEASISWA_PRESTASI" && !filePrestasi) {
      Swal.fire("Peringatan", "Bukti Hafalan / Peringkat Kelas wajib diunggah untuk jalur Beasiswa Prestasi", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const pathSKTM = await uploadFile(fileSKTM);
      const pathSlipGaji = await uploadFile(fileSlipGaji);
      const pathKTP = await uploadFile(fileKTP);
      const pathPrestasi = filePrestasi ? await uploadFile(filePrestasi) : null;

      const payload = {
        jenis_pengajuan: jenisPengajuan,
        alasan_pengajuan: alasanPengajuan,
        nominal_kesanggupan: nominalKesanggupan || null,
        file_sktm_path: pathSKTM,
        file_slip_gaji_path: pathSlipGaji,
        file_ktp_path: pathKTP,
        file_prestasi_path: pathPrestasi,
      };

      const res = await fetch("/api/pendaftar/beasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire("Berhasil", "Pengajuan berhasil dikirim dan akan diverifikasi", "success");
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

  const FileUploadField = ({ label, desc, required, file, setFile }: any) => (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
      <div className="flex justify-between items-start mb-2">
        <label className="block text-sm font-bold text-ink-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <p className="text-xs text-stone-500 mb-3">{desc}</p>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-white transition-colors bg-stone-50">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-6 h-6 text-stone-400 mb-1" />
          <p className="text-sm text-stone-600 font-medium px-4 text-center line-clamp-1">
            {file ? file.name : "Klik untuk upload (Maks 5MB)"}
          </p>
        </div>
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(setFile)} />
      </label>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Jika sudah mengajukan
  if (data) {
    const isApproved = data.status === "DISETUJUI";
    const isRejected = data.status === "DITOLAK";
    const StatusIcon = isApproved ? CheckCircle : (isRejected ? XCircle : Clock);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isApproved ? 'bg-green-100 text-green-600' :
            isRejected ? 'bg-red-100 text-red-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            <StatusIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-ink-950 mb-2">Status Pengajuan</h2>
          <p className="text-stone-500 font-medium">
            {isApproved ? "Pengajuan Anda telah disetujui." :
             isRejected ? "Mohon maaf, pengajuan Anda tidak dapat disetujui." :
             "Pengajuan Anda sedang dalam proses tinjauan."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Jenis Pengajuan</span>
            <span className="font-bold text-ink-900">{data.jenis_pengajuan.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Tanggal Pengajuan</span>
            <span className="font-bold text-ink-900">{new Date(data.created_at).toLocaleDateString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-stone-100">
            <span className="text-stone-500 text-sm">Diajukan Oleh</span>
            <span className="font-bold text-ink-900">{data.diajukan_oleh_role === "ADMIN" ? "Admin (Bantuan Input)" : "Anda Sendiri"}</span>
          </div>
          {data.nominal_kesanggupan && (
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-stone-500 text-sm">Kesanggupan Nominal</span>
              <span className="font-bold text-ink-900">Rp {Number(data.nominal_kesanggupan).toLocaleString("id-ID")}</span>
            </div>
          )}
          {data.catatan_keputusan && (
            <div className="bg-surface-50 p-4 rounded-xl mt-4">
              <span className="block text-xs font-bold text-surface-600 uppercase mb-1">Catatan Verifikator</span>
              <p className="text-sm font-medium text-ink-800">{data.catatan_keputusan}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Jika belum mengajukan
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-black text-ink-950 mb-2">Pengajuan Beasiswa / Keringanan</h2>
        <p className="text-stone-500 font-medium text-sm max-w-lg mx-auto">
          Lengkapi form dan unggah seluruh dokumen persyaratan di bawah ini untuk mengajukan permohonan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">Jenis Pengajuan</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
              jenisPengajuan === "KERINGANAN_BIAYA" ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm" : "border-stone-200 hover:border-primary-200"
            }`}>
              <input type="radio" className="sr-only" checked={jenisPengajuan === "KERINGANAN_BIAYA"} onChange={() => setJenisPengajuan("KERINGANAN_BIAYA")} />
              <span className="font-bold text-sm block mb-1">Keringanan Biaya</span>
              <span className="text-[10px] opacity-75">Berdasarkan kemampuan ekonomi orang tua (SKTM)</span>
            </label>
            <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
              jenisPengajuan === "BEASISWA_PRESTASI" ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm" : "border-stone-200 hover:border-primary-200"
            }`}>
              <input type="radio" className="sr-only" checked={jenisPengajuan === "BEASISWA_PRESTASI"} onChange={() => setJenisPengajuan("BEASISWA_PRESTASI")} />
              <span className="font-bold text-sm block mb-1">Beasiswa Prestasi</span>
              <span className="text-[10px] opacity-75">Hafalan Quran / Juara Lomba</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">Alasan Pengajuan <span className="text-red-500">*</span></label>
          <textarea
            required
            rows={3}
            placeholder="Jelaskan secara singkat alasan pengajuan Anda..."
            className="w-full p-3 border border-stone-300 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none text-sm"
            value={alasanPengajuan}
            onChange={(e) => setAlasanPengajuan(e.target.value)}
          />
        </div>

        {jenisPengajuan === "KERINGANAN_BIAYA" && (
          <div>
            <label className="block text-sm font-bold text-ink-900 mb-2">Kesanggupan Membayar Uang Pangkal (Rp) <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              min="0"
              placeholder="Contoh: 5000000"
              className="w-full p-3 border border-stone-300 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
              value={nominalKesanggupan}
              onChange={(e) => setNominalKesanggupan(e.target.value)}
            />
          </div>
        )}

        <div className="border-t border-stone-200 pt-6">
          <h3 className="font-black text-ink-900 mb-4 text-lg">Dokumen Persyaratan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadField 
              label="Surat Keterangan Tidak Mampu" 
              desc="Scan/Foto asli dari Kelurahan"
              required={true}
              file={fileSKTM}
              setFile={setFileSKTM}
            />
            <FileUploadField 
              label="KTP Orangtua/Wali" 
              desc="KTP Ayah/Ibu/Wali yang sesuai dengan slip gaji"
              required={true}
              file={fileKTP}
              setFile={setFileKTP}
            />
            <FileUploadField 
              label="Surat Penghasilan / Slip Gaji" 
              desc="Bulan terakhir dari Orangtua/Wali"
              required={true}
              file={fileSlipGaji}
              setFile={setFileSlipGaji}
            />
            <FileUploadField 
              label="Bukti Prestasi / Hafalan" 
              desc="Sertifikat hafalan atau bukti peringkat 3 besar"
              required={jenisPengajuan === "BEASISWA_PRESTASI"}
              file={filePrestasi}
              setFile={setFilePrestasi}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition-all disabled:opacity-70"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
