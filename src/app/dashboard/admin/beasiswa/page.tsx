"use client";

import { useState, useEffect } from "react";
import { HandCoins, FileText, CheckCircle, XCircle, Clock, Loader2, Filter } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminBeasiswaListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, DISETUJUI, DITOLAK
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/beasiswa/export");
      if (!response.ok) throw new Error("Gagal mengunduh laporan");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Laporan_Beasiswa_dan_Keringanan_Lazsip.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        title: "Berhasil!",
        text: "Laporan beasiswa berhasil diunduh.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", "Gagal mengunduh laporan Excel beasiswa: " + error.message, "error");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/beasiswa");
      const result = await res.json();
      if (result.success) {
        setData(result.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => filter === "ALL" || item.status === filter);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-950 flex items-center gap-2">
            <HandCoins className="w-8 h-8 text-primary-600" />
            Review Keringanan & Beasiswa
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Ekspor Laporan Lazsip
          </button>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-stone-200 shadow-sm">
          {["ALL", "PENDING", "DISETUJUI", "DITOLAK"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                filter === status 
                  ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100" 
                  : "text-stone-500 hover:bg-stone-50 border border-transparent"
              }`}
            >
              {status === "ALL" ? "Semua" : status}
            </button>
          ))}
        </div>
      </div>
    </div>

      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Tidak ada data pengajuan yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Pendaftar</th>
                  <th className="px-6 py-4 font-bold">Jenis Pengajuan</th>
                  <th className="px-6 py-4 font-bold">Kesanggupan (Rp)</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-ink-900">{item.pendaftar?.nama_lengkap || "Tanpa Nama"}</div>
                      <div className="text-stone-500 text-xs">{item.pendaftar?.nomor_pendaftaran} - {item.pendaftar?.jenjang}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                        {item.jenis_pengajuan?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink-800">
                      {item.nominal_kesanggupan ? Number(item.nominal_kesanggupan).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-max ${
                        item.status === "DISETUJUI" ? "bg-green-50 text-green-700 border border-green-100" :
                        item.status === "DITOLAK" ? "bg-red-50 text-red-700 border border-red-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {item.status === "DISETUJUI" ? <CheckCircle className="w-3.5 h-3.5"/> :
                         item.status === "DITOLAK" ? <XCircle className="w-3.5 h-3.5"/> :
                         <Clock className="w-3.5 h-3.5"/>}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/dashboard/admin/pendaftar/${item.pendaftar_id}`}
                        className="text-primary-600 hover:text-primary-800 font-bold text-xs px-4 py-2 border border-primary-200 hover:border-primary-300 rounded-lg bg-white shadow-sm inline-block"
                      >
                        Review Profil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
