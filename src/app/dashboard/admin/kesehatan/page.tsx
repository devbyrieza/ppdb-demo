"use client";

import React, { useState } from "react";
import { Activity, Search, CheckCircle, AlertTriangle, Download, Filter } from "lucide-react";
import Swal from "sweetalert2";

export default function KesehatanPage() {
  const [filter, setFilter] = useState("Semua");

  const mockData = [
    { id: "B210012", name: "Rafandra Zabran", jenjang: "MTW", form: "Lengkap", hbsag: "Negatif", ortu: "08123456789", checked: true },
    { id: "B210023", name: "Ahmad Fahri Zaidan", jenjang: "MTW", form: "Lengkap", hbsag: "Positif", ortu: "08129876543", checked: true },
    { id: "C210074", name: "Ahmad Haidar", jenjang: "IL", form: "-", hbsag: "-", ortu: "08551234567", checked: false },
  ];

  const handleVerify = (id: string) => {
    Swal.fire({
      title: "Verifikasi Berkas Kesehatan?",
      text: "Anda yakin berkas kesehatan santri ini valid?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Valid",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Berhasil!", "Data kesehatan telah diverifikasi.", "success");
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" />
            Verifikasi Data Kesehatan
          </h1>
          <p className="text-gray-500 mt-1">
            Modul pengecekan rekam medis dan hasil tes laboratorium (HBsAg) calon santri.
          </p>
        </div>
        <button 
          onClick={() => Swal.fire('Info', 'Export CSV Data Kesehatan', 'info')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Laporan
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            className="w-full md:w-64 p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Ditandai">Belum Diverifikasi</option>
            <option value="Sudah Ditandai">Sudah Diverifikasi</option>
          </select>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari No Pendaftaran / Nama..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold w-16 text-center">Cek</th>
                <th className="p-4 font-semibold">No. Pendf</th>
                <th className="p-4 font-semibold">Nama Santri</th>
                <th className="p-4 font-semibold">Jenjang</th>
                <th className="p-4 font-semibold text-center">Form Kesehatan</th>
                <th className="p-4 font-semibold text-center">Hasil Tes HBsAg</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockData.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 text-center">
                    {row.checked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 font-mono text-sm font-medium text-gray-600">{row.id}</td>
                  <td className="p-4 font-semibold text-gray-800">{row.name}</td>
                  <td className="p-4 text-gray-600">{row.jenjang}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.form === 'Lengkap' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {row.form}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.hbsag === 'Negatif' ? 'bg-blue-100 text-blue-700' : 
                      row.hbsag === 'Positif' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {row.hbsag}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleVerify(row.id)}
                      className="px-4 py-2 bg-white border border-gray-200 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition"
                    >
                      {row.checked ? "Ubah" : "Verifikasi"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
