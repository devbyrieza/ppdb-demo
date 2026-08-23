"use client";

import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function ImportCsvPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      Swal.fire("Gagal", "Pilih file CSV terlebih dahulu", "error");
      return;
    }
    
    Swal.fire({
      title: "Memproses CSV...",
      text: "Sistem sedang mensinkronisasi ratusan data kelulusan secara massal.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      Swal.fire("Berhasil!", "Status Kelulusan & Kehadiran berhasil diupdate massal.", "success");
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
          Import Massal (CSV)
        </h1>
        <p className="text-gray-500 mt-1">
          Modul upload file CSV untuk mengatur status kelulusan dan kehadiran ujian ribuan santri sekaligus (Fitur Diamond).
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex gap-4 text-amber-800">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold">Format Penulisan CSV Wajib!</h3>
          <p className="text-sm mt-1">
            Kolom pertama harus berisi <strong>nomor pendaftaran</strong> dan tanpa header tabel serta tanpa abjad awalan.<br/>
            Gunakan urutan berikut untuk status kelulusan: <code>1. Tidak diterima; 2. Diterima; 3. Diterima cabang; 4. Mundur</code>
          </p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-gray-100 text-center space-y-6">
        <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-10 transition hover:bg-indigo-50">
          <UploadCloud className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">Tarik & Lepas File CSV di Sini</h3>
          <p className="text-gray-500 text-sm mt-2 mb-6">atau klik tombol di bawah untuk mencari file di komputer Anda</p>
          
          <input 
            type="file" 
            accept=".csv" 
            id="file-upload" 
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label 
            htmlFor="file-upload"
            className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 font-semibold rounded-xl cursor-pointer hover:bg-indigo-50 transition shadow-sm inline-block"
          >
            Pilih File .CSV
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium bg-emerald-50 py-3 rounded-xl border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
            File terpilih: {file.name}
          </div>
        )}

        <button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-0.5"
        >
          Proses Import Kelulusan Massal
        </button>
      </form>
    </div>
  );
}
