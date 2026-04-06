"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";

export default function DashboardPendaftarPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-teal-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-stone-900">
                Dashboard Pendaftar
              </h1>
              <p className="text-sm text-stone-600">Ponpes Al-Andalus Ulul Albaab</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black">Assalamu'alaikum!</h2>
              <p className="text-teal-100">Selamat datang di dashboard Anda</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm mb-1">Nomor Pendaftaran:</p>
            <p className="text-2xl font-black">MTI20260006</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Status Pendaftaran */}
          <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <h3 className="font-bold text-stone-900">Status</h3>
            </div>
            <p className="text-2xl font-black text-green-600">Draft</p>
            <p className="text-xs text-stone-500 mt-1">Lengkapi data Anda</p>
          </div>

          {/* Dokumen */}
          <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-blue-500" />
              <h3 className="font-bold text-stone-900">Dokumen</h3>
            </div>
            <p className="text-2xl font-black text-stone-900">0/5</p>
            <p className="text-xs text-stone-500 mt-1">Belum upload</p>
          </div>

          {/* Jadwal Ujian */}
          <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              <h3 className="font-bold text-stone-900">Jadwal Ujian</h3>
            </div>
            <p className="text-2xl font-black text-stone-900">-</p>
            <p className="text-xs text-stone-500 mt-1">Belum dijadwalkan</p>
          </div>

          {/* Pengumuman */}
          <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-purple-500" />
              <h3 className="font-bold text-stone-900">Pengumuman</h3>
            </div>
            <p className="text-2xl font-black text-stone-900">-</p>
            <p className="text-xs text-stone-500 mt-1">Belum tersedia</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-black text-blue-900 mb-2">
                🎉 Dashboard Sedang Dikembangkan
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Halaman dashboard pendaftar lengkap sedang dalam proses
                development. Fitur yang akan tersedia:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lengkapi data pribadi & orang tua</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload dokumen persyaratan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lihat jadwal ujian</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Download pengumuman hasil</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload bukti pembayaran</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
