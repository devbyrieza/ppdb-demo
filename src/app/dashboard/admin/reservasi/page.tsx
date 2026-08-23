"use client";

import React from "react";
import { CalendarDays, MapPin, Users, Phone, CheckCircle, Clock } from "lucide-react";
import Swal from "sweetalert2";

export default function ReservasiPSBPage() {
  const mockReservasi = [
    { id: "R-101", pendaftarId: "B210012", nama: "Rafandra Zabran", asal: "Jakarta", tglReservasi: "12 Okt 2026", tglKedatangan: "15 Okt 2026", jmlPenginap: 3, hp: "08123456789", status: "Approved" },
    { id: "R-102", pendaftarId: "B210023", nama: "Ahmad Fahri", asal: "Surabaya", tglReservasi: "13 Okt 2026", tglKedatangan: "16 Okt 2026", jmlPenginap: 2, hp: "08129876543", status: "Pending" },
  ];

  const handleApprove = (id: string) => {
    Swal.fire({
      title: "Setujui Reservasi?",
      text: "Anda akan mengalokasikan kamar penginapan untuk tamu ini.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0284c7"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Disetujui!", "Reservasi berhasil dikonfirmasi.", "success");
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-sky-600" />
            Manajemen Reservasi PSB
          </h1>
          <p className="text-gray-500 mt-1">
            Modul pengelolaan akomodasi & kunjungan wali santri dari luar kota.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 border-l-4 border-l-sky-500 flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Kamar Tersedia</p><h3 className="text-2xl font-bold text-gray-800">45</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 border-l-4 border-l-amber-500 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Menunggu Konfirmasi</p><h3 className="text-2xl font-bold text-gray-800">12</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500 font-medium">Tamu Terjadwal Hadir</p><h3 className="text-2xl font-bold text-gray-800">28</h3></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">No. Pendf</th>
                <th className="p-4 font-semibold">Nama Santri</th>
                <th className="p-4 font-semibold">Kota Asal</th>
                <th className="p-4 font-semibold">Tgl. Kedatangan</th>
                <th className="p-4 font-semibold text-center">Jml Penginap</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockReservasi.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-50/30 transition-colors">
                  <td className="p-4 font-mono text-sm font-medium text-gray-600">{row.pendaftarId}</td>
                  <td className="p-4 font-semibold text-gray-800">{row.nama}</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {row.asal}</td>
                  <td className="p-4 text-gray-600">{row.tglKedatangan}</td>
                  <td className="p-4 text-center font-bold text-gray-800">{row.jmlPenginap} Orang</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleApprove(row.id)}
                      className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition shadow-sm"
                    >
                      Kelola
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
