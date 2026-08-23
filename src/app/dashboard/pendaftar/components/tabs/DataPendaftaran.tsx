"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Edit, User, FileText, CreditCard, Award, Clock, AlertCircle, ClipboardList, BarChart2 } from "lucide-react";
import Swal from "sweetalert2";

// Dummy data sebagai fallback
const DUMMY_DATA = {
  id: "dummy-id",
  nik: "3201010120100001",
  nomor_pendaftaran: "MTI20260006",
  nama_lengkap: "Ahmad Zaki Mubarak",
  jenis_kelamin: "Laki-laki",
  jenjang: "MTs",
  tempat_lahir: "Sukabumi",
  tanggal_lahir: "2010-08-15",
  alamat: "Jl. Pesantren No. 123",
  no_hp: "081234567890",
  status_pendaftaran: "draft",
  created_at: new Date().toISOString() };

export default function DataPendaftaranTab() {
  const [pendaftarData, setPendaftarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDummyData, setIsDummyData] = useState(false);

  useEffect(() => {
    fetchPendaftarData();
  }, []);

  const fetchPendaftarData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/pendaftar-data");
      const data = await response.json();

      if (data.success) {
        setPendaftarData(data.data);
        setIsDummyData(data.isDummy || data.isFallback || false);
      } else {
        // Fallback to dummy data
        setPendaftarData(DUMMY_DATA);
        setIsDummyData(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPendaftarData(DUMMY_DATA);
      setIsDummyData(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        <p className="text-stone-600">Memuat data pendaftaran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifikasi jika pakai dummy data */}
      {isDummyData && (
        <div className="bg-secondary-50 border-2 border-secondary-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-secondary-800">
                <span className="font-bold">Info:</span> Menampilkan data
                contoh. Untuk data real, pastikan API endpoint terhubung dengan
                database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Data Pendaftaran</h1>
            <p className="text-secondary-100">
              Kelola data dan dokumen pendaftaran Anda
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() =>
                Swal.fire(
                  "Info",
                  "Fitur lengkapi data akan tersedia segera!",
                  "info",
                )
              }
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-800 font-bold rounded-xl hover:bg-primary-50 transition-all"
            >
              <Edit className="w-4 h-4" />
              Lengkapi Data
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Status</p>
              <p className="text-lg font-bold text-stone-900">
                {pendaftarData?.status_pendaftaran === "draft"
                  ? "Draft"
                  : "Aktif"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Dokumen</p>
              <p className="text-lg font-bold text-stone-900">0/9</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Pembayaran</p>
              <p className="text-lg font-bold text-stone-900">Menunggu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Progress</p>
              <p className="text-lg font-bold text-stone-900">25%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Diri Card */}
      <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">Data Pribadi</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-primary-900">
            <Clock className="w-3 h-3 mr-1" />
            Perlu dilengkapi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                NIK
              </label>
              <p className="text-stone-900 font-medium font-mono">
                {pendaftarData?.nik}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Nama Lengkap
              </label>
              <p className="text-stone-900 font-medium text-lg">
                {pendaftarData?.nama_lengkap}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Jenis Kelamin
              </label>
              <p className="text-stone-900 font-medium">
                {pendaftarData?.jenis_kelamin}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Jenjang
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                {pendaftarData?.jenjang || "MTs"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Nomor Pendaftaran
              </label>
              <p className="text-stone-900 font-medium font-mono text-xl text-primary-700">
                {pendaftarData?.nomor_pendaftaran}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Tanggal Lahir
              </label>
              <p className="text-stone-900 font-medium">
                {formatDate(pendaftarData?.tanggal_lahir)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards - Flow PPDB: Pembayaran → Data Pribadi → Upload Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Pembayaran */}
        <Link
          href="/dashboard/pendaftar/pembayaran-pendaftaran"
          className="group bg-white rounded-xl p-6 border-2 border-stone-200 hover:border-secondary-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                <CreditCard className="w-6 h-6 text-secondary-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-secondary-100 text-secondary-700">
                Tahap 1 - Wajib
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 mb-1">Pembayaran</h3>
                <p className="text-sm text-stone-600">
                  Bayar biaya pendaftaran Rp 150.000
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-secondary-500" />
            </div>
          </div>
        </Link>

        {/* Step 2: Isi Data Lengkap */}
        <Link
          href="/dashboard/pendaftar/kelengkapan-berkas"
          className="group bg-white rounded-xl p-6 border-2 border-stone-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                <User className="w-6 h-6 text-primary-700" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-secondary-100 text-primary-800">
                Tahap 2
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 mb-1">
                  Isi Data Lengkap
                </h3>
                <p className="text-sm text-stone-600">
                  Lengkapi data diri calon santri
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-primary-500" />
            </div>
          </div>
        </Link>

        {/* Step 3: Upload Dokumen */}
        <Link
          href="/dashboard/pendaftar/upload-berkas"
          className="group bg-white rounded-xl p-6 border-2 border-stone-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                Tahap 3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 mb-1">
                  Upload Dokumen
                </h3>
                <p className="text-sm text-stone-600">
                  Upload dokumen persyaratan PPDB
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-green-500" />
            </div>
          </div>
        </Link>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl p-6 border-2 border-stone-200 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          Progress Pendaftaran
        </h2>
        <div className="space-y-4">
          {[
            { label: "1. Pembayaran", progress: 0, color: "bg-secondary-500" },
            {
              label: "2. Isi Data Lengkap",
              progress: 60,
              color: "bg-primary-500" },
            { label: "3. Upload Dokumen", progress: 0, color: "bg-green-500" },
            { label: "4. Verifikasi", progress: 0, color: "bg-purple-500" },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-stone-700">{item.label}</span>
                <span className="font-bold text-stone-900">
                  {item.progress}%
                </span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
