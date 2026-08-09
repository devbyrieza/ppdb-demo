"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Users,
  ClipboardCheck,
  Download,
  RefreshCcw,
  Search,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcelProfessional } from "@/lib/utils/export";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

interface ExaminerRecap {
  id: string;
  name: string;
  role: string;
  counts: {
    quran: number;
    santri: number;
    ortu: number;
    total: number;
  };
}

export default function RecapFeePage() {
  const [recap, setRecap] = useState<ExaminerRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fee Rates (state for dynamic calculation)
  const [rates, setRates] = useState({
    quran: 20000,
    santri: 15000,
    ortu: 15000,
  });

  useEffect(() => {
    fetchRecap();
  }, []);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/recap/examiners");
      const json = await res.json();
      if (json.success) {
        setRecap(json.data);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data rekap", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalFee = (item: ExaminerRecap) => {
    return (
      item.counts.quran * rates.quran +
      item.counts.santri * rates.santri +
      item.counts.ortu * rates.ortu
    );
  };

  const filteredRecap = recap.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totals = {
    quran: filteredRecap.reduce((acc, curr) => acc + curr.counts.quran, 0),
    santri: filteredRecap.reduce((acc, curr) => acc + curr.counts.santri, 0),
    ortu: filteredRecap.reduce((acc, curr) => acc + curr.counts.ortu, 0),
    totalTests: filteredRecap.reduce((acc, curr) => acc + curr.counts.total, 0),
    grandTotalFee: filteredRecap.reduce(
      (acc, curr) => acc + calculateTotalFee(curr),
      0,
    ),
  };

  const exportToExcel = async () => {
    if (!filteredRecap.length) return;

    const data = filteredRecap.map((item) => [
      item.name.toUpperCase(),
      item.role.replace("_", " ").toUpperCase(),
      item.counts.quran,
      item.counts.santri,
      item.counts.ortu,
      item.counts.total,
      calculateTotalFee(item),
    ]);

    const headers = [
      "Nama Petugas",
      "Role",
      "Tes Quran",
      "Wawancara Calon Santri",
      "Wawancara Ortu",
      "Total Sesi",
      "Total Honor (IDR)"
    ];

    await exportToExcelProfessional({
      fileName: `Rekap_Honor_Penguji_Al_Quran_${new Date().toISOString().split("T")[0]}`,
      sheets: [
        {
          name: "Rekap Honor",
          title: "REKAP HONOR PENGUJI PPDB",
          subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
          header: headers,
          data: data,
        }
      ]
    });
  };

  const exportToPDF = () => {
    if (!filteredRecap.length) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Laporan Rekap Honor Penguji Al-Qur'an", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);
    doc.text(
      `Tarif Aktif: Quran ${formatCurrency(rates.quran)}, Santri ${formatCurrency(rates.santri)}, Ortu ${formatCurrency(rates.ortu)}`,
      14,
      36,
    );

    // Stats Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Petugas: ${filteredRecap.length}`, 14, 46);
    doc.text(
      `Total Keseluruhan Honor: ${formatCurrency(totals.grandTotalFee)}`,
      14,
      52,
    );

    // Table
    const tableBody = filteredRecap.map((item) => [
      item.name.toUpperCase(),
      item.counts.quran,
      item.counts.santri,
      item.counts.ortu,
      formatCurrency(calculateTotalFee(item)),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["Nama Petugas", "Quran", "Santri", "Ortu", "Total Honor"]],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 60 },
      styles: { fontSize: 9 },
    });

    // Signatures area
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Mengetahui,", 140, finalY);
    doc.text("Pimpinan Pondok", 140, finalY + 25);

    doc.save(
      `Rekap_Honor_Penguji_Al_Quran_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-clay-lg border border-white/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="p-3 md:p-4 bg-linear-to-br from-primary-600 to-primary-800 rounded-2xl md:rounded-3xl shadow-xl shadow-primary-600/20 shrink-0">
              <CreditCard className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-ink-900 tracking-tight">
                Rekap{" "}
                <span className="text-primary-700">
                  Honor Penguji Al-Qur'an
                </span>
              </h1>
              <p className="text-ink-500 font-medium mt-1 uppercase text-[10px] tracking-widest leading-none">
                Manajemen Insentif Petugas Seleksi PPDB
              </p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              onClick={exportToExcel}
              className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 rounded-2xl h-11 md:h-12 px-4 md:px-6 font-black shadow-none transition-all text-sm"
            >
              <Download className="w-4 h-4 mr-1.5" /> Excel
            </Button>
            <Button
              onClick={exportToPDF}
              className="flex-1 md:flex-none bg-red-50 text-red-700 border-red-100 hover:bg-red-100 rounded-2xl h-11 md:h-12 px-4 md:px-6 font-black shadow-none transition-all text-sm"
            >
              <FileText className="w-4 h-4 mr-1.5" /> PDF
            </Button>
            <Button
              onClick={fetchRecap}
              disabled={loading}
              variant="outline"
              className="rounded-2xl h-11 md:h-12 px-4 md:px-6 border-ink-100 hover:bg-secondary-50 font-black"
            >
              <RefreshCcw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Rate Settings & Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Stats */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-clay-md border border-white/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-16 h-16" />
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-ink-400 uppercase tracking-widest mb-2 leading-tight">
              Total Penguji Al-Qur'an
            </p>
            <p className="text-2xl md:text-3xl font-black text-ink-900">
              {filteredRecap.length}{" "}
              <span className="text-xs text-ink-400 font-bold uppercase ml-1">
                Staff
              </span>
            </p>
          </div>
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-clay-md border border-white/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-16 h-16" />
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-ink-400 uppercase tracking-widest mb-2 leading-tight">
              Total Tes Selesai
            </p>
            <p className="text-2xl md:text-3xl font-black text-ink-900">
              {totals.totalTests}{" "}
              <span className="text-xs text-ink-400 font-bold uppercase ml-1">
                Sesi
              </span>
            </p>
          </div>
          {/* Total Estimasi Fee — full width on mobile, normal on md+ */}
          <div className="col-span-2 md:col-span-1 bg-linear-to-br from-primary-700 to-primary-900 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-clay-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <DollarSign className="w-16 h-16 text-white" />
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest mb-2 leading-tight">
              Total Estimasi Fee
            </p>
            <p className="text-2xl md:text-2xl font-black text-white">
              {formatCurrency(totals.grandTotalFee)}
            </p>
            <p className="text-[9px] font-bold text-secondary-300 mt-2 uppercase tracking-tight">
              Berdasarkan tarif aktif saat ini
            </p>
          </div>
        </div>

        {/* Right: Rate Config */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white rounded-[2rem] p-6 shadow-clay-md border border-white/40 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-secondary-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-secondary-700" />
              </div>
              <h3 className="text-sm font-black text-ink-900 uppercase tracking-tight">
                Pengaturan Tarif
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { id: "quran", label: "Tarif Tes Quran", value: rates.quran },
                {
                  id: "santri",
                  label: "Wawancara Calon Santri",
                  value: rates.santri,
                },
                { id: "ortu", label: "Wawancara Wali/Ortu", value: rates.ortu },
              ].map((field) => (
                <div key={field.id}>
                  <label className="text-[10px] font-black text-ink-400 uppercase mb-1 block">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-ink-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        setRates({
                          ...rates,
                          [field.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-ink-50 border-none rounded-xl pl-8 pr-4 py-2 text-sm font-black text-ink-900 focus:ring-2 focus:ring-primary-600/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2.5rem] shadow-clay-lg overflow-hidden border border-white/40">
        <div className="p-6 border-b border-ink-50 bg-ink-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Cari penguji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-ink-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none shadow-inner"
            />
          </div>
          <div className="text-xs font-bold text-ink-400 uppercase tracking-widest">
            Menampilkan {filteredRecap.length} Penguji Al-Qur'an
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Petugas Seleksi
                </th>
                <th className="px-4 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest border-x border-white">
                  Al-Quran
                </th>
                <th className="px-4 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest border-r border-white">
                  W. Santri
                </th>
                <th className="px-4 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest border-r border-white">
                  W. Wali/Ortu
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Estimasi Fee
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-ink-400 italic">
                      Menganalisis kontribusi penguji...
                    </p>
                  </td>
                </tr>
              ) : filteredRecap.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Users className="w-12 h-12 text-ink-100 mx-auto mb-2" />
                    <p className="text-sm font-bold text-ink-400">
                      Tidak ada data petugas yang ditemukan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecap.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-primary-50/20 transition-all"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-secondary-100 flex items-center justify-center text-primary-900 font-black shadow-sm border border-secondary-200">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-ink-900 group-hover:text-primary-700 transition-colors uppercase">
                            {item.name}
                          </p>
                          <p className="text-[9px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">
                            {item.role.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center border-x border-ink-50/50">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-base font-black text-ink-900 leading-none">
                          {item.counts.quran}
                        </span>
                        <span className="text-[9px] font-bold text-ink-400 uppercase tracking-tighter mt-1">
                          Sesi
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center border-r border-ink-50/50">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-base font-black text-ink-900 leading-none">
                          {item.counts.santri}
                        </span>
                        <span className="text-[9px] font-bold text-ink-400 uppercase tracking-tighter mt-1">
                          Sesi
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center border-r border-ink-50/50">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-base font-black text-ink-900 leading-none">
                          {item.counts.ortu}
                        </span>
                        <span className="text-[9px] font-bold text-ink-400 uppercase tracking-tighter mt-1">
                          Sesi
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-primary-700 leading-none">
                          {formatCurrency(calculateTotalFee(item))}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mt-1.5 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Total Honor
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && filteredRecap.length > 0 && (
              <tfoot className="bg-ink-900 text-white">
                <tr>
                  <td className="px-6 py-6 text-sm font-black uppercase tracking-widest opacity-60">
                    Grand Total
                  </td>
                  <td className="px-4 py-6 text-center text-lg font-black">
                    {totals.quran}
                  </td>
                  <td className="px-4 py-6 text-center text-lg font-black">
                    {totals.santri}
                  </td>
                  <td className="px-4 py-6 text-center text-lg font-black">
                    {totals.ortu}
                  </td>
                  <td className="px-6 py-6 text-right text-xl font-black text-secondary-400">
                    {formatCurrency(totals.grandTotalFee)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-ink-50">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-black text-ink-400 italic">
                Menganalisis...
              </p>
            </div>
          ) : filteredRecap.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-ink-100 mx-auto mb-2" />
              <p className="text-sm font-bold text-ink-400">Data Kosong</p>
            </div>
          ) : (
            filteredRecap.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white hover:bg-primary-50/10 transition-colors"
              >
                {/* Name + Honor Row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-secondary-100 flex items-center justify-center text-primary-900 font-black text-lg border border-secondary-200 shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-ink-900 uppercase leading-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">
                      {item.role.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {/* Fee Badge — full width, prominent */}
                <div className="mb-3 bg-linear-to-r from-primary-700 to-primary-800 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                      Estimasi Honor
                    </p>
                    <p className="text-lg font-black text-white leading-none mt-0.5">
                      {formatCurrency(calculateTotalFee(item))}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-secondary-300" />
                </div>

                {/* Stats Grid — 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="bg-ink-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-ink-900 leading-none">
                      {item.counts.quran}
                    </p>
                    <p className="text-[9px] font-bold text-ink-400 uppercase tracking-wide mt-1">
                      Al-Quran
                    </p>
                  </div>
                  <div className="bg-ink-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-ink-900 leading-none">
                      {item.counts.santri}
                    </p>
                    <p className="text-[9px] font-bold text-ink-400 uppercase tracking-wide mt-1">
                      W. Santri
                    </p>
                  </div>
                  <div className="bg-ink-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-ink-900 leading-none">
                      {item.counts.ortu}
                    </p>
                    <p className="text-[9px] font-bold text-ink-400 uppercase tracking-wide mt-1">
                      W. Ortu
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && filteredRecap.length > 0 && (
            <div className="p-5 bg-ink-900 text-white rounded-b-[2.5rem]">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    Grand Total Honor
                  </span>
                  <span className="text-xl font-black text-secondary-400">
                    {formatCurrency(totals.grandTotalFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Total Sesi
                  </span>
                  <span className="text-base font-black text-white/80">
                    {totals.totalTests} sesi
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty space at bottom */}
      <div className="h-10"></div>
    </div>
  );
}
