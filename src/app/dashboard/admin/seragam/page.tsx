"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Download, MessageSquare, Shirt, CheckCircle2, XCircle, Edit, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export default function RekapSeragamPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formSizes, setFormSizes] = useState({ baju: "", celana: "", almamater: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormSizes({
      baju: item.ukuran_seragam_baju || "",
      celana: item.ukuran_seragam_celana || "",
      almamater: item.ukuran_seragam_almamater || ""
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/seragam", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          ukuran_seragam_baju: formSizes.baju,
          ukuran_seragam_celana: formSizes.celana,
          ukuran_seragam_almamater: formSizes.almamater
        })
      });
      const json = await res.json();
      if (res.ok) {
        setEditModalOpen(false);
        Swal.fire("Sukses!", "Ukuran seragam berhasil diupdate.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal", json.message || "Gagal update data", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showAll]);

  const fetchData = async () => {
    try {
      const url = `/api/admin/seragam?t=${Date.now()}${showAll ? '&all=1' : ''}`;
      const res = await fetch(url);
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

  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const tableColumn = ["No. Pendaftaran", "Nama Lengkap", "Jenjang", "L/P", "Baju", "Celana", "Almamater"];
    const tableRows: any[] = [];

    filteredData.forEach(item => {
      const rowData = [
        item.nomor_pendaftaran,
        item.nama_lengkap,
        item.jenjang,
        item.jenis_kelamin,
        item.ukuran_seragam_baju || "-",
        item.ukuran_seragam_celana || "-",
        item.ukuran_seragam_almamater || "-"
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(16);
    doc.text("Laporan Rekapitulasi Ukuran Seragam", 40, 40);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 40, 55);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [124, 45, 18], textColor: 255 } // Maroon
    });

    doc.save(`Rekap_Seragam_${new Date().toISOString().slice(0,10)}.pdf`);
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
      <div className="bg-linear-to-br from-primary-700 to-primary-900 rounded-3xl p-5 md:p-8 text-white relative overflow-hidden shadow-xl">
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

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-ink-200 shadow-sm md:mr-2">
              <input 
                type="checkbox" 
                id="showAll" 
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-ink-300 focus:ring-primary-500"
              />
              <label htmlFor="showAll" className="text-xs md:text-sm font-bold text-ink-700 cursor-pointer select-none">
                Tampilkan Semua Pendaftar
              </label>
            </div>
            
            <button
              onClick={exportExcel}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-ink-200 text-ink-700 rounded-xl text-sm font-black hover:bg-ink-50 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-red-200 text-red-700 rounded-xl text-sm font-black hover:bg-red-50 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              Download PDF
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
                  <th className="px-6 py-4 text-center">Aksi</th>
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
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-primary-50 border border-ink-200 hover:border-primary-200 text-ink-700 hover:text-primary-700 rounded-lg text-xs font-black transition-all shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Ubah
                          </button>
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

      {/* Edit Modal */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-ink-950/50 backdrop-blur-sm overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-ink-100 bg-ink-50/50">
              <h3 className="text-xl font-black text-ink-950">Ubah Ukuran Seragam</h3>
              <p className="text-sm font-medium text-ink-500 mt-1">{editingItem.nama_lengkap}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">Ukuran Baju</label>
                <select
                  value={formSizes.baju}
                  onChange={(e) => setFormSizes({ ...formSizes, baju: e.target.value })}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                >
                  <option value="">-- Pilih --</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="3XL">3XL</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">Ukuran Celana / Rok</label>
                <select
                  value={formSizes.celana}
                  onChange={(e) => setFormSizes({ ...formSizes, celana: e.target.value })}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                >
                  <option value="">-- Pilih --</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="3XL">3XL</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">Ukuran Almamater</label>
                <select
                  value={formSizes.almamater}
                  onChange={(e) => setFormSizes({ ...formSizes, almamater: e.target.value })}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                >
                  <option value="">-- Pilih --</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="3XL">3XL</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-ink-100 flex items-center justify-end gap-3 bg-ink-50/30">
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
                className="px-5 py-2.5 rounded-xl text-sm font-black text-ink-600 hover:bg-ink-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
