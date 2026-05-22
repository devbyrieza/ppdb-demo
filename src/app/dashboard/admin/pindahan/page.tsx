"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shuffle, Plus, RefreshCw, Loader2, FileSpreadsheet, FileText, X, CheckCircle, LogOut, Trash2 } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [tahunAjaranList, setTahunAjaranList] = useState<{id:string;nama:string}[]>([]);

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


  const handleMarkPindahKeluar = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: "Tandai Pindah Keluar?",
      html: `<strong>${nama}</strong> akan ditandai sebagai santri yang <b>pindah keluar</b> dari institusi ini.<br/><br/>Tindakan ini mencatat bahwa santri tidak lagi aktif di sini.`,
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

  const handleDeleteSantri = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: "Hapus Santri Pindahan?",
      html: `Apakah Anda yakin ingin menghapus data santri pindahan bernama <strong>${nama}</strong>?<br/><br/><small class="text-rose-500 font-bold">⚠️ Data akan di-soft delete dan dicadangkan secara otomatis.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/pendaftar/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) { Swal.fire("Gagal", json.error || "Gagal menghapus data", "error"); return; }
      Swal.fire({ title: "Berhasil!", text: json.message || "Data berhasil dihapus.", icon: "success", timer: 2000, showConfirmButton: false });
      fetchData();
    } catch (e) { Swal.fire("Error", "Terjadi kesalahan saat menghapus data", "error"); }
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
      const filename = `santri-pindahan-${new Date().toISOString().split("T")[0]}`;
      if (type === "excel") {
        exportToExcel(rows, filename, "Data Santri Pindahan");
      } else {
        exportToPDF("Laporan Santri Pindahan", Object.keys(rows[0] || {}), rows.map((r: any) => Object.values(r)), filename, "landscape");
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
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">Santri Pindahan</h2>
              <p className="text-stone-500 text-sm font-medium">Kelola pendaftaran santri pindahan dari institusi lain</p>
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
            <Link href="/daftar-pindahan" target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-700/20 transition-all">
              <Plus className="w-4 h-4" />
              <span>Daftarkan Pindahan</span>
            </Link>
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
            <h3 className="text-lg font-bold text-stone-800 mb-1">Belum ada santri pindahan</h3>
            <p className="text-stone-500 text-sm">Klik "Daftarkan Pindahan" untuk menambah santri pindahan baru.</p>
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
                    <button onClick={() => handleDeleteSantri(p.id, p.nama_lengkap)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SantriPindahanPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>}><PindahanContent /></Suspense>;
}
