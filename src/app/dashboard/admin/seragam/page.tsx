"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Download, MessageSquare, Shirt, CheckCircle2, XCircle, Edit, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { exportToExcelProfessional } from "@/lib/utils/export";
import { getUniformConfig } from "@/config/seragam";

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

  const config = getUniformConfig();
  const isPutri = config.isPutri;

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

  const jenjangOrder: Record<string, number> = {
    "TK": 1,
    "SD": 2,
    "MI": 2,
    "SMP": 3,
    "SMP IT": 3,
    "MTs": 3,
    "IL": 4,
    "SMA": 5,
    "MA": 5
  };

  const exportExcel = async () => {
    const sortedDataForExport = [...filteredData].sort((a, b) => {
      const rankA = jenjangOrder[a.jenjang || ""] || 99;
      const rankB = jenjangOrder[b.jenjang || ""] || 99;
      if (rankA !== rankB) return rankA - rankB;
      const jenjangCompare = String(a.jenjang || "").localeCompare(String(b.jenjang || ""));
      if (jenjangCompare !== 0) return jenjangCompare;
      return String(a.nama_lengkap || "").localeCompare(String(b.nama_lengkap || ""));
    });

    const belumIsi = sortedDataForExport.filter(d => !d.ukuran_seragam_baju || !d.ukuran_seragam_celana || !d.ukuran_seragam_almamater).length;
    const sudahIsi = sortedDataForExport.length - belumIsi;

    const colBaju = isPutri ? "Gamis" : "Baju";
    const colCelana = isPutri ? "Bawahan/Rok" : "Celana";

    try {
      await exportToExcelProfessional({
        fileName: `Rekap_Seragam_${new Date().toISOString().slice(0, 10)}`,
        sheets: [
          {
            name: "Rekap Seragam",
            title: isPutri ? "Laporan Rekapitulasi Ukuran Seragam Santriwati" : "Laporan Rekapitulasi Ukuran Seragam Santri",
            subTitle: `Total Pendaftar: ${sortedDataForExport.length} | Lengkap: ${sudahIsi} | Belum: ${belumIsi}`,
            header: ["No", "No. Pendaftaran", "Nama Lengkap", "Jenjang", "L/P", colBaju, colCelana, "Almamater"],
            centeredColumns: [1, 2, 4, 5, 6, 7, 8],
            data: sortedDataForExport.map((item, index) => [
              index + 1,
              item.nomor_pendaftaran,
              item.nama_lengkap,
              item.jenjang,
              item.jenis_kelamin,
              item.ukuran_seragam_baju || "-",
              item.ukuran_seragam_celana || "-",
              item.ukuran_seragam_almamater || "-"
            ])
          }
        ]
      });
    } catch (error) {
      console.error("Error exporting to excel:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat mengunduh Excel", "error");
    }
  };

  const exportPDF = () => {
    const sortedDataForExport = [...filteredData].sort((a, b) => {
      const rankA = jenjangOrder[a.jenjang || ""] || 99;
      const rankB = jenjangOrder[b.jenjang || ""] || 99;
      if (rankA !== rankB) return rankA - rankB;
      const jenjangCompare = String(a.jenjang || "").localeCompare(String(b.jenjang || ""));
      if (jenjangCompare !== 0) return jenjangCompare;
      return String(a.nama_lengkap || "").localeCompare(String(b.nama_lengkap || ""));
    });

    const belumIsi = sortedDataForExport.filter(d => !d.ukuran_seragam_baju || !d.ukuran_seragam_celana || !d.ukuran_seragam_almamater).length;
    const sudahIsi = sortedDataForExport.length - belumIsi;

    const colBaju = isPutri ? "Gamis" : "Baju";
    const colCelana = isPutri ? "Bawahan" : "Celana";

    const doc = new jsPDF("p", "pt", "a4");
    const tableColumn = ["No. Pendaftaran", "Nama Lengkap", "Jenjang", "L/P", colBaju, colCelana, "Almamater"];
    const tableRows: any[] = [];

    sortedDataForExport.forEach(item => {
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
    doc.text(isPutri ? "Laporan Rekapitulasi Ukuran Seragam Santriwati" : "Laporan Rekapitulasi Ukuran Seragam Santri", 40, 40);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 40, 55);
    doc.text(`Total Pendaftar: ${filteredData.length}`, 40, 70);
    doc.text(`Lengkap: ${sudahIsi} | Belum: ${belumIsi}`, 40, 85);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: isPutri ? [157, 23, 77] : [30, 58, 138], textColor: 255 }
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
      title: showAll ? "Kirim Broadcast KHUSUS?" : "Kirim Pengingat WA?",
      text: showAll 
        ? `Anda sedang dalam mode Tampilkan Semua Pendaftar. Sistem akan mengirim pesan WA dengan link JALUR KHUSUS ke ${belumIsi.length} orang agar mereka bisa mengisi seragam lebih awal. Lanjutkan?`
        : `Anda akan mengirim pesan WhatsApp pengingat pengisian seragam ke ${belumIsi.length} pendaftar/orang tua. Lanjutkan?`,
      icon: showAll ? "warning" : "question",
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
          body: JSON.stringify({ pendaftarIds, isSpecial: showAll })
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
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-5 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-100 shadow-inner">
            <Shirt className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              {isPutri ? "Rekap Ukuran Seragam Santriwati" : "Rekap Ukuran Seragam Santri"}
            </h1>
            <p className="text-primary-100 mt-1 font-medium">
              {isPutri
                ? "Data ukuran gamis dan perlengkapan seragam santriwati tahap Daftar Ulang"
                : "Data ukuran seragam santri yang telah masuk tahap Daftar Ulang"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-ink-100 flex flex-col min-h-[500px]">
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
              className="w-full pl-11 pr-4 py-3 bg-white border border-ink-200 rounded-3xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm font-medium transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-3xl border border-ink-200 shadow-sm md:mr-2">
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
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-ink-200 text-ink-700 rounded-3xl text-sm font-black hover:bg-ink-50 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-red-200 text-red-700 rounded-3xl text-sm font-black hover:bg-red-50 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleBroadcast}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-primary-700 text-white rounded-3xl text-sm font-black hover:bg-primary-800 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Ingatkan (WA)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-left text-sm whitespace-nowrap max-w-full">
              <thead className="bg-ink-50/50 text-ink-500 text-xs uppercase font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Pendaftar</th>
                  <th className="px-6 py-4 text-center">{isPutri ? "Gamis" : "Baju"}</th>
                  <th className="px-6 py-4 text-center">{isPutri ? "Bawahan/Rok" : "Celana"}</th>
                  <th className="px-6 py-4 text-center">Almamater</th>
                  <th className="px-6 py-4 text-center">Status Form</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-ink-400 font-bold">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
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
                            <span className="inline-flex items-center justify-center px-2.5 py-1 min-w-8 rounded-xl bg-blue-50 text-blue-900 font-black text-xs border border-blue-200">
                              {item.ukuran_seragam_baju}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.ukuran_seragam_celana ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 min-w-8 rounded-xl bg-emerald-50 text-emerald-900 font-black text-xs border border-emerald-200">
                              {item.ukuran_seragam_celana}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.ukuran_seragam_almamater ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 min-w-8 rounded-xl bg-purple-50 text-purple-900 font-black text-xs border border-purple-200">
                              {item.ukuran_seragam_almamater}
                            </span>
                          ) : (
                            <span className="text-ink-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sudahIsi ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lengkap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-black">
                              <XCircle className="w-3.5 h-3.5" />
                              Belum Lengkap
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-2xl border border-primary-200 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
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

        {/* Footer info */}
        <div className="p-4 border-t border-ink-100 bg-ink-50/50 flex flex-col md:flex-row justify-between items-center text-xs text-ink-500 font-bold gap-2">
          <span>Menampilkan {filteredData.length} pendaftar</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              Sudah Lengkap: {filteredData.filter(d => d.ukuran_seragam_baju && d.ukuran_seragam_celana && d.ukuran_seragam_almamater).length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Belum Lengkap: {filteredData.filter(d => !d.ukuran_seragam_baju || !d.ukuran_seragam_celana || !d.ukuran_seragam_almamater).length}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-ink-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-ink-100 bg-ink-50/50">
              <h3 className="text-lg font-black text-ink-900">
                Edit Ukuran Seragam
              </h3>
              <p className="text-xs text-ink-500 font-bold mt-1">
                {editingItem?.nama_lengkap} ({editingItem?.nomor_pendaftaran})
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  {isPutri ? "Ukuran Gamis" : "Ukuran Baju"}
                </label>
                <div className="space-y-2">
                  <select
                    value={config.sizeOptions.some(o => o.value === formSizes.baju) ? formSizes.baju : formSizes.baju.startsWith(">XXL") ? ">XXL" : "CUSTOM"}
                    onChange={(e) => {
                      if (e.target.value !== "CUSTOM") {
                        setFormSizes({ ...formSizes, baju: e.target.value });
                      }
                    }}
                    className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {config.sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    {!config.sizeOptions.some(o => o.value === formSizes.baju) && formSizes.baju && (
                      <option value="CUSTOM">Khusus: {formSizes.baju}</option>
                    )}
                  </select>
                  {/* Field text bila admin ingin mengubah teks ukuran khusus */}
                  {(formSizes.baju.startsWith(">XXL") || !config.sizeOptions.some(o => o.value === formSizes.baju)) && formSizes.baju && (
                    <input
                      type="text"
                      placeholder="Detail ukuran khusus..."
                      value={formSizes.baju}
                      onChange={(e) => setFormSizes({ ...formSizes, baju: e.target.value })}
                      className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  {isPutri ? "Ukuran Rok / Bawahan" : "Ukuran Celana"}
                </label>
                <div className="space-y-2">
                  <select
                    value={config.sizeOptions.some(o => o.value === formSizes.celana) ? formSizes.celana : formSizes.celana.startsWith(">XXL") ? ">XXL" : "CUSTOM"}
                    onChange={(e) => {
                      if (e.target.value !== "CUSTOM") {
                        setFormSizes({ ...formSizes, celana: e.target.value });
                      }
                    }}
                    className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                  >
                    <option value="">-- Pilih --</option>
                    {config.sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    {!config.sizeOptions.some(o => o.value === formSizes.celana) && formSizes.celana && (
                      <option value="CUSTOM">Khusus: {formSizes.celana}</option>
                    )}
                  </select>
                  {(formSizes.celana.startsWith(">XXL") || !config.sizeOptions.some(o => o.value === formSizes.celana)) && formSizes.celana && (
                    <input
                      type="text"
                      placeholder="Detail ukuran khusus..."
                      value={formSizes.celana}
                      onChange={(e) => setFormSizes({ ...formSizes, celana: e.target.value })}
                      className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Ukuran Almamater
                </label>
                <select
                  value={config.sizeOptions.some(o => o.value === formSizes.almamater) ? formSizes.almamater : formSizes.almamater ? formSizes.almamater : ""}
                  onChange={(e) => setFormSizes({ ...formSizes, almamater: e.target.value })}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                >
                  <option value="">-- Pilih --</option>
                  {config.sizeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-ink-100 flex items-center justify-end gap-3 bg-ink-50/30">
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
                className="px-5 py-2.5 rounded-2xl text-sm font-black text-ink-600 hover:bg-ink-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
