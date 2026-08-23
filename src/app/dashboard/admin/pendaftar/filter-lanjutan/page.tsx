"use client";

import React, { useState } from "react";
import { 
  Filter, Search, Download, ChevronDown, ChevronUp, User, 
  MapPin, CreditCard, GraduationCap, Users, RefreshCw, FileText
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function FilterLanjutanPage() {
  const [expandedSection, setExpandedSection] = useState<string>("sekolah");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Memuat Data...",
      text: "Menyaring data pendaftar berdasarkan kriteria lanjutan.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Filter className="w-8 h-8 text-primary" />
            Filter Data Lanjutan
          </h1>
          <p className="text-gray-500 mt-1">
            Modul penyaringan data pendaftar komprehensif (Mode Diamond).
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={() => Swal.fire('Info', 'Fitur Export CSV akan segera hadir', 'info')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Filter Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        
        {/* Section 1: Data Sekolah & Jenjang */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
          <button 
            type="button" 
            onClick={() => toggleSection('sekolah')}
            className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">1. Filter Data Sekolah & Jenjang</h2>
            </div>
            {expandedSection === 'sekolah' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSection === 'sekolah' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tahun Pelajaran</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua Tahun</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jenjang Tujuan</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua Jenjang</option>
                  <option value="SMPIT">SMPIT (Mutawasithah)</option>
                  <option value="SMAIT">SMAIT (I'dad Lughowy)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="L">Laki-laki (Putra)</option>
                  <option value="P">Perempuan (Putri)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bersedia di Cabang</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="ya">Ya</option>
                  <option value="tidak">Tidak</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Data Santri */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
          <button 
            type="button" 
            onClick={() => toggleSection('santri')}
            className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">2. Filter Data Personal Santri</h2>
            </div>
            {expandedSection === 'santri' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSection === 'santri' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">No. Pendaftaran</label>
                <input type="text" placeholder="Cth: B260012" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Santri (Mengandung Kata)</label>
                <input type="text" placeholder="Cth: Muhammad" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jumlah Hafalan Al-Quran</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="0">0 Juz</option>
                  <option value="1-5">1 - 5 Juz</option>
                  <option value=">5">&gt; 5 Juz</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Kelengkapan & Pembayaran */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
          <button 
            type="button" 
            onClick={() => toggleSection('kelengkapan')}
            className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">3. Filter Kelengkapan & Pembayaran</h2>
            </div>
            {expandedSection === 'kelengkapan' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSection === 'kelengkapan' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status Biaya Pendaftaran</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="lunas">Lunas (Terverifikasi)</option>
                  <option value="menunggu">Menunggu Verifikasi</option>
                  <option value="belum">Belum Bayar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status Upload Berkas</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="lengkap">Lengkap</option>
                  <option value="kurang">Kurang/Belum Lengkap</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status Daftar Ulang</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="lunas">Lunas</option>
                  <option value="cicil">Cicil / Sebagian</option>
                  <option value="belum">Belum Bayar</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Seleksi & Hasil */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
          <button 
            type="button" 
            onClick={() => toggleSection('seleksi')}
            className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">4. Filter Data Seleksi & Kelulusan</h2>
            </div>
            {expandedSection === 'seleksi' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSection === 'seleksi' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jadwal Ujian</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua Jadwal</option>
                  <option value="gel1">Gelombang 1</option>
                  <option value="gel2">Gelombang 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kehadiran Ujian</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="hadir">Hadir</option>
                  <option value="alpa">Tidak Hadir</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status Penerimaan</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="lulus">Lulus / Diterima</option>
                  <option value="cadangan">Cadangan</option>
                  <option value="tidak_lulus">Tidak Diterima</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Jalur</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="reguler">Reguler / Murni</option>
                  <option value="prestasi">Rekomendasi / Prestasi</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Orang Tua */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
          <button 
            type="button" 
            onClick={() => toggleSection('ortu')}
            className="w-full flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-gray-800 text-lg">5. Filter Data Orang Tua / Wali</h2>
            </div>
            {expandedSection === 'ortu' ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSection === 'ortu' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Penghasilan Wali</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="<3">&lt; Rp 3.000.000</option>
                  <option value="3-5">Rp 3.000.000 - Rp 5.000.000</option>
                  <option value=">5">&gt; Rp 5.000.000</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Anak Civitas</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition">
                  <option value="">Semua</option>
                  <option value="ya">Ya, Anak Pegawai</option>
                  <option value="tidak">Bukan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Ayah (Mengandung)</label>
                <input type="text" placeholder="Cth: Abdullah" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-6 pb-12">
          <button 
            type="submit"
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
          >
            <Search className="w-6 h-6" />
            Terapkan Filter & Tampilkan Data
          </button>
        </div>

      </form>
    </div>
  );
}
