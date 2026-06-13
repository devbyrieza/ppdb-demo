"use client";

import { useState, useEffect } from "react";
import { CheckCircle, UploadCloud, Loader2, AlertCircle, ShieldCheck, HelpCircle } from "lucide-react";
import { Alert } from "@/components/ui";

export default function PengajuanKeringananPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataUser, setDataUser] = useState<any>(null);
  
  // Form State
  const [jenisPengajuan, setJenisPengajuan] = useState<"Keringanan" | "Beasiswa" | "">("");
  const [kesanggupanBayar, setKesanggupanBayar] = useState("");
  const [alasan, setAlasan] = useState("");
  
  // File State
  const [fileSktm, setFileSktm] = useState<File | null>(null);
  const [fileGaji, setFileGaji] = useState<File | null>(null);
  const [fileKtp, setFileKtp] = useState<File | null>(null);
  const [filePrestasi, setFilePrestasi] = useState<File | null>(null);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`);
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
    setKesanggupanBayar(new Intl.NumberFormat("id-ID").format(parseInt(val || "0")));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisPengajuan) {
      setMessage({ type: "error", text: "Pilih jenis pengajuan terlebih dahulu." });
      return;
    }
    
    // Validasi file Wajib
    if (!fileSktm || !fileGaji || !fileKtp) {
      setMessage({ type: "error", text: "Mohon lengkapi seluruh dokumen WAJIB (SKTM, Slip Gaji, KTP)." });
      return;
    }

    if (jenisPengajuan === "Beasiswa" && !filePrestasi) {
      setMessage({ type: "error", text: "Bukti Hafalan/Prestasi WAJIB diunggah untuk pengajuan Beasiswa." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jenis", jenisPengajuan);
    formData.append("alasan", alasan);
    
    if (jenisPengajuan === "Keringanan") {
      formData.append("kesanggupan_bayar", kesanggupanBayar.replace(/\D/g, ""));
    }

    formData.append("file_sktm", fileSktm);
    formData.append("file_gaji", fileGaji);
    formData.append("file_ktp", fileKtp);
    if (filePrestasi) formData.append("file_prestasi", filePrestasi);

    try {
      const res = await fetch("/api/pendaftar/pengajuan-keringanan", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim pengajuan");

      setMessage({ type: "success", text: "Pengajuan berhasil dikirim dan sedang dalam proses peninjauan oleh Tim Finance." });
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
  if (typeof dataLengkap === 'string') {
    try { dataLengkap = JSON.parse(dataLengkap); } catch(e) {}
  }
  const pengajuan = dataLengkap?.pengajuan_keringanan;

  if (pengajuan) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-primary-100 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border ${
            pengajuan.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            pengajuan.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
            'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {pengajuan.status === 'approved' ? <CheckCircle className="w-12 h-12" /> :
             pengajuan.status === 'rejected' ? <AlertCircle className="w-12 h-12" /> :
             <Loader2 className="w-12 h-12 animate-spin" />}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Pengajuan {pengajuan.jenis}
          </h2>
          
          <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
            {pengajuan.status === 'pending' && "Pengajuan Anda telah kami terima dan sedang dalam antrean pemeriksaan oleh tim verifikator."}
            {pengajuan.status === 'approved' && "Selamat! Pengajuan Anda telah disetujui. Tagihan Daftar Ulang Anda otomatis diperbarui."}
            {pengajuan.status === 'rejected' && "Mohon maaf, pengajuan Anda saat ini tidak dapat kami setujui setelah melalui proses pertimbangan."}
          </p>
          
          <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                pengajuan.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                pengajuan.status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {pengajuan.status.toUpperCase()}
              </span>
            </div>
            
            {pengajuan.jenis === "Keringanan" && pengajuan.kesanggupan_bayar > 0 && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kesanggupan Uang Pangkal</span>
                <span className="font-black text-slate-900">
                  Rp {parseInt(pengajuan.kesanggupan_bayar).toLocaleString("id-ID")}
                </span>
              </div>
            )}
            
            {pengajuan.nominal_disetujui > 0 && pengajuan.status === 'approved' && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Nilai Potongan Disetujui</span>
                <span className="font-black text-emerald-700 text-lg">
                  Rp {pengajuan.nominal_disetujui.toLocaleString("id-ID")}
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
          Pengajuan Beasiswa & Keringanan
        </h1>
        <p className="text-gold-100 relative z-10 text-lg font-medium">
          Fasilitas penyesuaian biaya Uang Pangkal bagi santri berprestasi & yang membutuhkan.
        </p>
      </div>

      {message && (
        <Alert type={message.type} title={message.type === "success" ? "Berhasil" : "Gagal"}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Tipe */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-2">1. Pilih Tipe Pengajuan</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <label className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                jenisPengajuan === "Beasiswa" ? "border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20" : "border-slate-200 hover:border-primary-300"
              }`}>
                <input type="radio" name="jenis" value="Beasiswa" className="mt-1" checked={jenisPengajuan === "Beasiswa"} onChange={() => setJenisPengajuan("Beasiswa")} />
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Beasiswa Prestasi / Tahfizh</h4>
                  <p className="text-xs text-slate-500 mt-1">Potongan uang pangkal penuh/parsial untuk santri dengan hafalan Qur'an atau peringkat 3 besar.</p>
                </div>
              </label>

              <label className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                jenisPengajuan === "Keringanan" ? "border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20" : "border-slate-200 hover:border-primary-300"
              }`}>
                <input type="radio" name="jenis" value="Keringanan" className="mt-1" checked={jenisPengajuan === "Keringanan"} onChange={() => setJenisPengajuan("Keringanan")} />
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Keringanan Biaya</h4>
                  <p className="text-xs text-slate-500 mt-1">Penyesuaian nominal Uang Pangkal berdasarkan kemampuan ekonomi keluarga / wali santri.</p>
                </div>
              </label>
            </div>
          </div>

          {jenisPengajuan && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Section 2: Detail Nominal */}
              <div className="space-y-4">
                <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-2">2. Rincian Pengajuan</h3>
                
                {jenisPengajuan === "Keringanan" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kesanggupan Bayar Uang Pangkal (Rp) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                      <input 
                        type="text" 
                        value={kesanggupanBayar} 
                        onChange={handleNominalChange}
                        className="w-full pl-12 pr-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-primary-500" 
                        placeholder="Contoh: 5.000.000"
                        required 
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Sebutkan nominal pasti yang Anda sanggupi untuk pembayaran Uang Pangkal.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Penjelasan / Alasan Pengajuan <span className="text-rose-500">*</span></label>
                  <textarea 
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 min-h-[120px] bg-slate-50 text-sm"
                    placeholder="Ceritakan dengan singkat dan jelas mengenai kondisi finansial atau prestasi Ananda..."
                    required
                  />
                </div>
              </div>

              {/* Section 3: Upload Dokumen */}
              <div className="space-y-4">
                <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                  3. Upload Dokumen Persyaratan
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Format: PDF/JPG/PNG (Max 5MB)</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* SKTM */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      SKTM (Surat Keterangan Tidak Mampu) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mb-3">Dari RT/RW atau Kelurahan setempat.</p>
                    <input type="file" onChange={(e) => setFileSktm(e.target.files?.[0] || null)} className="w-full text-xs" accept="image/*,application/pdf" required />
                  </div>

                  {/* Slip Gaji */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Surat Penghasilan / Slip Gaji <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mb-3">Slip gaji terbaru atau surat keterangan penghasilan ortu/wali.</p>
                    <input type="file" onChange={(e) => setFileGaji(e.target.files?.[0] || null)} className="w-full text-xs" accept="image/*,application/pdf" required />
                  </div>

                  {/* KTP */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      KTP Orangtua/Wali <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mb-3">Scan/Foto KTP yang jelas dan dapat dibaca.</p>
                    <input type="file" onChange={(e) => setFileKtp(e.target.files?.[0] || null)} className="w-full text-xs" accept="image/*,application/pdf" required />
                  </div>

                  {/* Prestasi */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden">
                    {jenisPengajuan === "Beasiswa" && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg">WAJIB BEASISWA</div>}
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Bukti Hafalan / Peringkat 3 Besar {jenisPengajuan === "Beasiswa" ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Opsional)</span>}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-3">Sertifikat/Piagam atau Surat Keterangan dari sekolah asal.</p>
                    <input type="file" onChange={(e) => setFilePrestasi(e.target.files?.[0] || null)} className="w-full text-xs" accept="image/*,application/pdf" required={jenisPengajuan === "Beasiswa"} />
                  </div>
                </div>
              </div>

              {/* Submit Info */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Dengan menekan tombol kirim, Anda menyatakan bahwa seluruh data dan dokumen yang dilampirkan adalah benar dan dapat dipertanggungjawabkan. Segala bentuk kecurangan dapat membatalkan status penerimaan santri.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                {submitting ? "Mengunggah Dokumen..." : "Kirim Pengajuan Keringanan"}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
