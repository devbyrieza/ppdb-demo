"use client";

import { useState, useEffect } from "react";
import { HandCoins, FileText, CheckCircle, XCircle, Clock, Loader2, Save, Plus, UploadCloud } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminBeasiswaBlock({ pendaftarId, onUpdate }: { pendaftarId: string, onUpdate?: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Approval
  const [statusForm, setStatusForm] = useState("DISETUJUI");
  const [nominalPotongan, setNominalPotongan] = useState("");
  const [catatan, setCatatan] = useState("");

  // Form Input Admin
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [jenisPengajuan, setJenisPengajuan] = useState("KERINGANAN_BIAYA");
  const [alasanPengajuan, setAlasanPengajuan] = useState("");
  const [nominalKesanggupan, setNominalKesanggupan] = useState("");
  const [fileSKTM, setFileSKTM] = useState<File | null>(null);
  const [fileSlipGaji, setFileSlipGaji] = useState<File | null>(null);
  const [fileKTP, setFileKTP] = useState<File | null>(null);
  const [filePrestasi, setFilePrestasi] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [pendaftarId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/beasiswa`);
      const result = await res.json();
      if (result.success && result.data) {
        const found = result.data.find((x: any) => x.pendaftar_id === pendaftarId);
        setData(found || null);
        if (found) {
          setStatusForm(found.status !== "PENDING" ? found.status : "DISETUJUI");
          setNominalPotongan(found.nominal_potongan ? String(found.nominal_potongan) : "");
          setCatatan(found.catatan_keputusan || "");
          setShowAdminForm(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kategori", "BEASISWA");

    const uploadRes = await fetch("/api/upload/dokumen", { method: "POST", body: formData });
    const result = await uploadRes.json();
    if (!uploadRes.ok || !result.path) throw new Error(`Gagal upload ${file.name}`);
    return result.path;
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanPengajuan) return Swal.fire("Peringatan", "Alasan wajib diisi", "warning");
    if (!fileSKTM || !fileSlipGaji || !fileKTP) return Swal.fire("Peringatan", "SKTM, Slip Gaji, dan KTP wajib diunggah", "warning");
    if (jenisPengajuan === "BEASISWA_PRESTASI" && !filePrestasi) return Swal.fire("Peringatan", "Bukti Prestasi wajib diunggah", "warning");

    setSubmitting(true);
    try {
      const pathSKTM = await uploadFile(fileSKTM);
      const pathSlipGaji = await uploadFile(fileSlipGaji);
      const pathKTP = await uploadFile(fileKTP);
      const pathPrestasi = filePrestasi ? await uploadFile(filePrestasi) : null;

      const payload = {
        pendaftar_id: pendaftarId,
        jenis_pengajuan: jenisPengajuan,
        alasan_pengajuan: alasanPengajuan,
        nominal_kesanggupan: nominalKesanggupan || null,
        file_sktm_path: pathSKTM,
        file_slip_gaji_path: pathSlipGaji,
        file_ktp_path: pathKTP,
        file_prestasi_path: pathPrestasi,
      };

      const res = await fetch("/api/admin/beasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire("Berhasil", "Pengajuan berhasil dikirim atas nama pendaftar.", "success");
        fetchData();
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Gagal input", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/beasiswa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengajuan_id: data?.id,
          pendaftar_id: pendaftarId,
          status: statusForm,
          nominal_potongan: nominalPotongan ? Number(nominalPotongan) : null,
          catatan_keputusan: catatan
        })
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire("Berhasil", "Data berhasil diupdate", "success");
        fetchData();
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Gagal update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const FileUploadField = ({ label, required, file, setFile }: any) => (
    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
      <label className="block text-xs font-bold text-ink-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label className="flex flex-col items-center justify-center w-full h-16 border border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-white transition-colors">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-stone-600 font-medium px-2 line-clamp-1">
            {file ? file.name : "Klik untuk upload"}
          </p>
        </div>
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
          if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
        }} />
      </label>
    </div>
  );

  if (loading) return <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary-500"/></div>;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-ink-900">Pengajuan Beasiswa / Keringanan</h3>
            <p className="text-sm text-stone-500">
              {data ? "Tinjau dan putuskan pengajuan" : "Belum ada pengajuan"}
            </p>
          </div>
        </div>
        {!data && !showAdminForm && (
          <button onClick={() => setShowAdminForm(true)} className="flex items-center gap-1.5 text-xs font-bold bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-100">
            <Plus className="w-3.5 h-3.5" />
            Input oleh Admin
          </button>
        )}
      </div>

      {!data && showAdminForm && (
        <form onSubmit={handleAdminSubmit} className="mb-6 p-4 border border-primary-200 rounded-xl bg-primary-50/30">
          <h4 className="font-bold text-ink-900 text-sm mb-3">Form Input Pengajuan (Khusus Admin)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Jenis Pengajuan</label>
              <select value={jenisPengajuan} onChange={e => setJenisPengajuan(e.target.value)} className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm">
                <option value="KERINGANAN_BIAYA">Keringanan Biaya (SKTM)</option>
                <option value="BEASISWA_PRESTASI">Beasiswa Prestasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Kesanggupan (Rp)</label>
              <input type="number" value={nominalKesanggupan} onChange={e => setNominalKesanggupan(e.target.value)} placeholder="Opsional" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-600 mb-1">Alasan Pengajuan <span className="text-red-500">*</span></label>
              <input type="text" required value={alasanPengajuan} onChange={e => setAlasanPengajuan(e.target.value)} placeholder="Alasan orang tua..." className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <FileUploadField label="SKTM" required={true} file={fileSKTM} setFile={setFileSKTM} />
            <FileUploadField label="KTP Orangtua" required={true} file={fileKTP} setFile={setFileKTP} />
            <FileUploadField label="Slip Gaji" required={true} file={fileSlipGaji} setFile={setFileSlipGaji} />
            <FileUploadField label="Bukti Prestasi" required={jenisPengajuan==="BEASISWA_PRESTASI"} file={filePrestasi} setFile={setFilePrestasi} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdminForm(false)} className="px-4 py-2 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-lg">Batal</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <UploadCloud className="w-3.5 h-3.5"/>}
              Kirim & Upload
            </button>
          </div>
        </form>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <span className="block text-xs font-bold text-stone-500 mb-1">Jenis Pengajuan</span>
            <span className="font-bold text-ink-900">{data.jenis_pengajuan?.replace("_", " ")}</span>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <span className="block text-xs font-bold text-stone-500 mb-1">Kesanggupan Uang Pangkal</span>
            <span className="font-bold text-ink-900">
              {data.nominal_kesanggupan ? `Rp ${Number(data.nominal_kesanggupan).toLocaleString("id-ID")}` : "-"}
            </span>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <span className="block text-xs font-bold text-stone-500 mb-1">Diajukan Oleh</span>
            <span className="font-bold text-ink-900">{data.diajukan_oleh_role === "ADMIN" ? "Admin" : "Pendaftar"}</span>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 md:col-span-3">
            <span className="block text-xs font-bold text-stone-500 mb-1">Alasan Pengajuan</span>
            <p className="text-sm font-medium text-ink-800">{data.alasan_pengajuan}</p>
          </div>
          
          {/* Tampilan Dokumen */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "SKTM", path: data.file_sktm_path },
              { label: "KTP Orangtua", path: data.file_ktp_path },
              { label: "Slip Gaji / Penghasilan", path: data.file_slip_gaji_path },
              { label: "Bukti Prestasi", path: data.file_prestasi_path }
            ].map((doc, i) => doc.path ? (
              <a key={i} href={`/api/files/${doc.path}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-lg hover:bg-blue-100 transition-colors">
                <FileText className="text-blue-500 w-4 h-4 shrink-0" />
                <span className="font-bold text-[10px] text-blue-900 line-clamp-1">{doc.label}</span>
              </a>
            ) : null)}
          </div>
        </div>
      )}

      {/* Admin Action Form */}
      {data && (
        <div className="border-t border-stone-100 pt-5">
          <h4 className="font-bold text-ink-900 mb-3 text-sm">Form Keputusan Verifikator</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Keputusan Akhir</label>
              <select 
                value={statusForm} 
                onChange={(e) => setStatusForm(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 focus:border-primary-500 focus:bg-white transition-all outline-none rounded-lg text-sm font-medium"
              >
                <option value="PENDING">Pending (Belum Diputuskan)</option>
                <option value="DISETUJUI">Disetujui</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
            {statusForm === "DISETUJUI" && (
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Potongan Daftar Ulang (Rp)</label>
                <input 
                  type="number" 
                  value={nominalPotongan} 
                  onChange={(e) => setNominalPotongan(e.target.value)}
                  placeholder="Misal: 500000"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 focus:border-primary-500 focus:bg-white transition-all outline-none rounded-lg text-sm font-medium"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-600 mb-1">Catatan Keputusan</label>
              <input 
                type="text" 
                value={catatan} 
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan dari pewawancara/finance..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 focus:border-primary-500 focus:bg-white transition-all outline-none rounded-lg text-sm font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition-colors disabled:opacity-70"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Keputusan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
