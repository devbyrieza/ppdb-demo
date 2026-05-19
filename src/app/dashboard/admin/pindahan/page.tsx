"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Plus, RefreshCw, Loader2, FileSpreadsheet, FileText, X, CheckCircle, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";

interface Pindahan {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  kelas_masuk: number | null;
  asal_institusi: string | null;
  nomor_induk_lama: string | null;
  catatan_pindahan: string | null;
  no_hp: string | null;
  status_pendaftaran: string;
  created_at: string;
  tahun_ajaran: { nama: string } | null;
  pembayaran: { jumlah: string; status_pembayaran: string; jenis_pembayaran: string }[];
  dokumen: { jenis_dokumen: string; is_verified: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  payment_verification: "bg-orange-100 text-orange-700",
  verified: "bg-blue-100 text-blue-700",
  enrolled: "bg-emerald-100 text-emerald-700",
  enrolled_full: "bg-green-100 text-green-700",
  pindah_keluar: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Terdaftar",
  payment_verification: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  enrolled: "Sedang Daftar Ulang",
  enrolled_full: "Selesai",
  pindah_keluar: "Pindah Keluar",
};

function PindahanContent() {
  const router = useRouter();
  const [data, setData] = useState<Pindahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tahunAjaranList, setTahunAjaranList] = useState<{id:string;nama:string}[]>([]);
  const [form, setForm] = useState({
    nama_lengkap: "", nik: "", jenis_kelamin: "L", jenjang: "MTs",
    kelas_masuk: "8", asal_institusi: "", nomor_induk_lama: "",
    catatan_pindahan: "", no_hp: "", email: "", tahun_ajaran_id: "",
    status_pendaftaran: "submitted",
  });

  useEffect(() => { fetchData(); fetchTahunAjaran(); }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/pindahan${q}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch("/api/admin/pengaturan/tahun-ajaran");
      const json = await res.json();
      setTahunAjaranList(json.data || []);
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap || !form.nik || !form.jenjang || !form.asal_institusi) {
      Swal.fire("Error", "Mohon lengkapi field yang wajib", "error"); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pindahan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kelas_masuk: parseInt(form.kelas_masuk) }),
      });
      const json = await res.json();
      if (!res.ok) { Swal.fire("Gagal", json.error || "Terjadi kesalahan", "error"); return; }
      Swal.fire("Berhasil!", json.message, "success");
      setShowModal(false);
      setForm({ nama_lengkap:"",nik:"",jenis_kelamin:"L",jenjang:"MTs",kelas_masuk:"8",asal_institusi:"",nomor_induk_lama:"",catatan_pindahan:"",no_hp:"",email:"",tahun_ajaran_id:"",status_pendaftaran:"submitted" });
      fetchData();
    } catch (e) { Swal.fire("Error", "Terjadi kesalahan", "error"); }
    finally { setSubmitting(false); }
  };

  const handleMarkPindahKeluar = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: "Tandai Pindah Keluar?",
      html: `<strong>${nama}</strong> akan ditandai sebagai siswa yang <b>pindah keluar</b> dari institusi ini.<br/><br/>Tindakan ini mencatat bahwa siswa tidak lagi aktif di sini.`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Ya, Tandai", cancelButtonText: "Batal",
      confirmButtonColor: "#64748b",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch("/api/admin/pindahan", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftar_id: id, status_pendaftaran: "pindah_keluar" }),
      });
      const json = await res.json();
      if (!res.ok) { Swal.fire("Gagal", json.error, "error"); return; }
      Swal.fire({ title: "Berhasil!", text: json.message, icon: "success", timer: 2000, showConfirmButton: false });
      fetchData();
    } catch (e) { Swal.fire("Error", "Terjadi kesalahan", "error"); }
  };

  const handleExport = async (type: "excel" | "pdf") => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/pindahan?status=all");
      const json = await res.json();
      const rows = (json.data || []).map((p: Pindahan) => ({
        "Nomor Pendaftaran": p.nomor_pendaftaran,
        "Nama Lengkap": p.nama_lengkap,
        "Jenis Kelamin": p.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
        "Jenjang": p.jenjang,
        "Kelas Masuk": p.kelas_masuk ? `Kelas ${p.kelas_masuk}` : "-",
        "Asal Institusi": p.asal_institusi || "-",
        "Nomor Induk Lama": p.nomor_induk_lama || "-",
        "No HP": p.no_hp || "-",
        "Status": STATUS_LABELS[p.status_pendaftaran] || p.status_pendaftaran,
        "Tahun Ajaran": p.tahun_ajaran?.nama || "-",
        "Catatan": p.catatan_pindahan || "-",
        "Tanggal Daftar": new Date(p.created_at).toLocaleDateString("id-ID"),
      }));
      const filename = `siswa-pindahan-${new Date().toISOString().split("T")[0]}`;
      if (type === "excel") {
        exportToExcel(rows, filename, "Data Siswa Pindahan");
      } else {
        exportToPDF("Laporan Siswa Pindahan", Object.keys(rows[0] || {}), rows.map((r: any) => Object.values(r)), filename, "landscape");
      }
    } catch (e) { Swal.fire("Gagal", "Gagal export data", "error"); }
    finally { setExporting(false); }
  };

  const filtered = data.filter(p => statusFilter === "all" || p.status_pendaftaran === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] shadow-sm p-6 md:p-8 border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center border border-violet-100">
              <Shuffle className="w-7 h-7 text-violet-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">Siswa Pindahan</h2>
              <p className="text-stone-500 text-sm font-medium">Kelola pendaftaran siswa pindahan dari institusi lain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport("excel")} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button onClick={() => handleExport("pdf")} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-700/20 transition-all">
              <Plus className="w-4 h-4" />
              <span>Daftarkan Pindahan</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-stone-100 pt-5">
          <span className="px-3 py-1.5 bg-stone-100 rounded-lg text-sm font-bold text-stone-600">Total: {data.length}</span>
          {["all","submitted","payment_verification","verified","enrolled","enrolled_full","pindah_keluar"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${statusFilter === s ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400/30" : "text-stone-500 hover:bg-stone-50"}`}>
              {s === "all" ? "Semua" : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
              <Shuffle className="w-8 h-8 text-violet-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">Belum ada siswa pindahan</h3>
            <p className="text-stone-500 text-sm">Klik "Daftarkan Pindahan" untuk menambah siswa pindahan baru.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map(p => (
              <div key={p.id} className="p-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-800 font-black text-lg shrink-0">
                      {p.nama_lengkap.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-stone-900">{p.nama_lengkap}</h3>
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-violet-200">PINDAHAN</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[p.status_pendaftaran] || "bg-stone-100 text-stone-600"}`}>
                          {STATUS_LABELS[p.status_pendaftaran] || p.status_pendaftaran}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-stone-500 mt-0.5">{p.nomor_pendaftaran}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-stone-600">
                        <span className="font-semibold">{p.jenjang} Kelas {p.kelas_masuk || "-"}</span>
                        <span className="text-stone-400">|</span>
                        <span>Dari: <strong>{p.asal_institusi || "-"}</strong></span>
                        {p.no_hp && <><span className="text-stone-400">|</span><span>{p.no_hp}</span></>}
                      </div>
                      {p.catatan_pindahan && (
                        <p className="mt-1.5 text-xs text-stone-500 italic bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                          📝 {p.catatan_pindahan}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => router.push(`/dashboard/admin/pendaftar/${p.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition-all">
                      <CheckCircle className="w-3.5 h-3.5" /> Detail
                    </button>
                    {p.status_pendaftaran !== "pindah_keluar" && (
                      <button onClick={() => handleMarkPindahKeluar(p.id, p.nama_lengkap)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all">
                        <LogOut className="w-3.5 h-3.5" /> Pindah Keluar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-violet-50/50">
              <div>
                <h3 className="text-xl font-black text-stone-900">Daftarkan Siswa Pindahan</h3>
                <p className="text-sm text-stone-500 mt-0.5">Isi data siswa yang pindah ke institusi ini</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center">
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input required value={form.nama_lengkap} onChange={e => setForm(f => ({...f, nama_lengkap: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800" placeholder="Nama lengkap siswa" />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">NIK <span className="text-red-500">*</span></label>
                  <input required value={form.nik} onChange={e => setForm(f => ({...f, nik: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800" placeholder="16 digit NIK" maxLength={16} />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">No. HP</label>
                  <input value={form.no_hp} onChange={e => setForm(f => ({...f, no_hp: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800" placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Jenjang <span className="text-red-500">*</span></label>
                  <select required value={form.jenjang} onChange={e => setForm(f => ({...f, jenjang: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800 bg-white">
                    <option value="MTs">MTs</option>
                    <option value="IL">I'dad Lughowi (IL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Kelas Masuk <span className="text-red-500">*</span></label>
                  <select required value={form.kelas_masuk} onChange={e => setForm(f => ({...f, kelas_masuk: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800 bg-white">
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Asal Institusi/Sekolah <span className="text-red-500">*</span></label>
                  <input required value={form.asal_institusi} onChange={e => setForm(f => ({...f, asal_institusi: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800" placeholder="Nama pesantren/sekolah asal" />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Nomor Induk Lama (NIS)</label>
                  <input value={form.nomor_induk_lama} onChange={e => setForm(f => ({...f, nomor_induk_lama: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800" placeholder="NIS di sekolah asal" />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Status Awal</label>
                  <select value={form.status_pendaftaran} onChange={e => setForm(f => ({...f, status_pendaftaran: e.target.value}))}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800 bg-white">
                    <option value="submitted">Terdaftar (Menunggu Bayar)</option>
                    <option value="verified">Langsung Terverifikasi</option>
                    <option value="enrolled">Langsung Daftar Ulang</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-widest mb-1.5">Catatan Pindahan</label>
                  <textarea value={form.catatan_pindahan} onChange={e => setForm(f => ({...f, catatan_pindahan: e.target.value}))} rows={3}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-semibold text-stone-800 resize-none" placeholder="Alasan pindah, catatan khusus, dll..." />
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-stone-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-all">Batal</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl font-bold shadow-lg shadow-violet-700/20 transition-all disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Plus className="w-4 h-4" /> Daftarkan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiswaPindahanPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>}><PindahanContent /></Suspense>;
}
