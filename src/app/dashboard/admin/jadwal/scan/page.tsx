"use client";

import React, { useState } from "react";
import { QrCode, UserCheck, AlertCircle, ScanLine } from "lucide-react";
import Swal from "sweetalert2";

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const simulateScan = () => {
    Swal.fire({
      title: "Scanning...",
      text: "Arahkan kamera ke QR Code Kartu Ujian Santri",
      icon: "info",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      setScanResult("B260012 - Rafandra Zabran");
      Swal.fire({
        title: "Presensi Berhasil!",
        text: "Rafandra Zabran telah ditandai Hadir Ujian Seleksi.",
        icon: "success",
      });
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <ScanLine className="w-8 h-8 text-emerald-600" />
          Scanner Kehadiran Ujian (QR Code)
        </h1>
        <p className="text-gray-500 mt-1">
          Gunakan kamera HP atau Barcode Scanner fisik untuk mencatat kehadiran santri secara otomatis.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-64 h-64 border-4 border-emerald-500 border-dashed rounded-3xl flex items-center justify-center bg-emerald-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 animate-bounce" style={{ animationDuration: '2s' }}></div>
              <QrCode className="w-24 h-24 text-emerald-300" />
            </div>
            <p className="mt-4 text-emerald-600 font-bold">Kamera Aktif...</p>
          </div>

          <button 
            onClick={simulateScan}
            className="px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30"
          >
            Simulasi Scan QR Code
          </button>

          {scanResult && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl w-full max-w-md flex items-center gap-4 text-left">
              <div className="p-3 bg-emerald-600 text-white rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">Status: Hadir</p>
                <h4 className="text-lg font-bold text-emerald-900">{scanResult}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
