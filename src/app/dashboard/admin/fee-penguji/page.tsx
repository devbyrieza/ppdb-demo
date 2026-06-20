"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Search,
  Download,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcelProfessional } from "@/lib/utils/export";

interface FeeData {
  id: string;
  nama: string;
  role_utama: string;
  role_tambahan: string[];
  jumlah_quran: number;
  jumlah_santri: number;
  jumlah_ortu: number;
  jumlah_hafalan: number;
  jumlah_arab: number;
  total_sesi: number;
  total_fee: number;
}

export default function RekapFeePengujiPage() {
  const [data, setData] = useState<FeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/fee-penguji");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFeeSemua = filteredData.reduce((acc, curr) => acc + curr.total_fee, 0);
  const totalSesiSemua = filteredData.reduce((acc, curr) => acc + curr.total_sesi, 0);

  const handleExportExcel = async () => {
    if (filteredData.length === 0) return;

    const exportData = filteredData.map((item, index) => [
      index + 1,
      item.nama,
      item.jumlah_quran,
      item.jumlah_santri,
      item.jumlah_ortu,
      item.jumlah_hafalan,
      item.jumlah_arab,
      item.total_sesi,
      item.total_fee,
    ]);

    await exportToExcelProfessional({
      fileName: "Rekap_Fee_Penguji",
      sheets: [
        {
          name: "Fee Penguji",
          title: "Laporan Rekapitulasi Fee Penguji & Pewawancara",
          subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")} | Fee Satuan: Rp 10.000 / Sesi | Total Fee Keseluruhan: Rp ${totalFeeSemua.toLocaleString("id-ID")}`,
          header: [
            "No",
            "Nama Penguji",
            "Sesi Qur'an",
            "Sesi W. Santri",
            "Sesi W. Ortu",
            "Sesi Hafalan",
            "Sesi Arab",
            "Total Sesi",
            "Total Fee (Rp)",
          ],
          data: exportData,
        },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-ink-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl">
            <Wallet className="w-8 h-8 font-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink-950 tracking-tight">
              Rekap Fee Penguji
            </h1>
            <p className="text-sm font-bold text-ink-500 mt-1">
              Monitoring performa dan kalkulasi fee asatidzah (Rp 10.000 / sesi).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={fetchData}
            variant="outline"
            className="rounded-2xl border-ink-200 text-ink-600 font-bold hover:bg-ink-50 h-11"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleExportExcel}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 h-11"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ink-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-ink-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama penguji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-50 border border-ink-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-primary-600/10 outline-none"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-bold border border-orange-100">
              Total Sesi: <span className="font-black text-lg">{totalSesiSemua}</span>
            </div>
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl font-bold border border-primary-100">
              Total Fee: <span className="font-black text-lg">Rp {totalFeeSemua.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-ink-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
            <p className="font-bold">Memuat rekap fee...</p>
          </div>
        ) : error ? (
          <div className="p-20 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p className="font-bold text-center max-w-md">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-50/50 border-b border-ink-100">
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider">
                    Penguji
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider text-center">
                    Qur'an
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider text-center">
                    W. Santri
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider text-center">
                    W. Ortu
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider text-center">
                    Hafalan
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-ink-500 uppercase tracking-wider text-center">
                    Arab
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-primary-600 uppercase tracking-wider text-center bg-primary-50/30">
                    Total Sesi
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-emerald-600 uppercase tracking-wider text-right bg-emerald-50/30">
                    Fee (Rp)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-ink-400 font-bold">
                      Tidak ada data penguji ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-ink-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-black text-ink-900 group-hover:text-primary-700 transition-colors">
                          {item.nama}
                        </div>
                        <div className="text-xs font-bold text-ink-400 mt-0.5">
                          {item.role_utama}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-ink-600">
                        {item.jumlah_quran > 0 ? item.jumlah_quran : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-ink-600">
                        {item.jumlah_santri > 0 ? item.jumlah_santri : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-ink-600">
                        {item.jumlah_ortu > 0 ? item.jumlah_ortu : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-ink-600">
                        {item.jumlah_hafalan > 0 ? item.jumlah_hafalan : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-ink-600">
                        {item.jumlah_arab > 0 ? item.jumlah_arab : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-primary-700 bg-primary-50/30">
                        {item.total_sesi}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700 bg-emerald-50/30 text-base">
                        {item.total_fee.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
