"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Download, MessageSquare, Shirt, CheckCircle2, XCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function RekapSeragamPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/seragam?t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching seragam data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) =>
    item.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    item.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const csvContent = [
      ["No. Pendaftaran", "Nama Lengkap", "Jenjang", "L/P", "Ukuran Baju", "Ukuran Celana", "Ukuran Almamater"],
      ...filteredData.map(item => [
        item.nomor_pendaftaran,
        item.nama_lengkap,
        item.jenjang,
        item.jenis_kelamin,
        item.ukuran_seragam_baju || "Belum Isi",
        item.ukuran_seragam_celana || "Belum Isi",
        item.ukuran_seragam_almamater || "Belum Isi"
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Seragam_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcast = async () => {
    const belumIsi = filteredData.filter(d => !d.ukuran_seragam_baju || !d.ukuran_seragam_celana || !d.ukuran_seragam_almamater);
    if (belumIsi.length === 0) {
      Swal.fire("Info", "Semua pendaftar di daftar ini sudah mengisi ukuran seragam.", "info");
      return;
    }
    
    const confirm = await Swal.fire({
      title: "Kirim Pengingat WA?",
      text: `Anda akan mengirim pesan WhatsApp pengingat pengisian seragam ke ${belumIsi.length} pendaftar/orang tua. Lanjutkan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: "Memproses...",
          text: "Mohon tunggu, sedang menjadwalkan pesan WhatsApp.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const pendaftarIds = belumIsi.map(d => d.id);
        const res = await fetch("/api/admin/seragam/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendaftarIds }),
        });
        
        const json = await res.json();
        
        if (res.ok) {
          Swal.fire("Sukses!", json.message, "success");
        } else {
          Swal.fire("Gagal", json.message || "Gagal mengirim pengingat", "error");
        }
      } catch (error: any) {
        Swal.fire("Terjadi Kesalahan", error.message || "Gagal menghubungi server", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-br from-primary-700 to-primary-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-100 shadow-inner">
            <Shirt className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Rekap Ukuran Seragam
            </h1>
            <p className="text-primary-100 mt-1 font-medium">
              Data ukuran seragam santri yang telah masuk tahap Daftar Ulang
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-ink-100 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-ink-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-ink-50/50 rounded-t-3xl">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-ink-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau no pendaftaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-ink-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm font-medium transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={exportExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-ink-200 text-ink-700 rounded-xl text-sm font-black hover:bg-ink-50 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </button>
            <button
              onClick={handleBroadcast}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-primary-700 text-white rounded-xl text-sm font-black hover:bg-primary-800 shadow-lg shadow-primary-200 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Ingatkan (WA)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-ink-50/50 text-ink-500 text-xs uppercase font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Pendaftar</th>
                  <th className="px-6 py-4 text-center">Baju</th>
                  <th className="px-6 py-4 text-center">Celana/Rok</th>
                  <th className="px-6 py-4 text-center">Almamater</th>
                  <th className="px-6 py-4 text-center">Status Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ink-400 font-bold">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => {
                    const sudahIsi = item.ukuran_seragam_baju && item.ukuran_seragam_celana && item.ukuran_seragam_almamater;
                    
                    return (
                      <tr key={item.id} className="hover:bg-ink-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-ink-900">{item.nama_lengkap}</span>
                            <span className="text-xs text-ink-500 font-bold mt-0.5 font-mono">
                              {item.nomor_pendaftaran} • {item.jenjang}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.ukuran_seragam_baju ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-xs border border-blue-100">
                              {item.ukuran_seragam_baju}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.ukuran_seragam_celana ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-100">
                              {item.ukuran_seragam_celana}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.ukuran_seragam_almamater ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-black text-xs border border-purple-100">
                              {item.ukuran_seragam_almamater}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sudahIsi ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              LENGKAP
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-black">
                              <XCircle className="w-3.5 h-3.5" />
                              BELUM
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
