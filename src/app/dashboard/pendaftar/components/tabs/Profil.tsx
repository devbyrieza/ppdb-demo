"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  School,
  Heart,
  Users,
  Briefcase,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface ProfileData {
  nama_lengkap: string;
  nik: string;
  jenis_kelamin: string;
  jenjang: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  no_hp: string | null;
  email: string | null;
  alamat: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  asal_sekolah: string | null;
  status_proses: string;
  nomor_pendaftaran: string;
}

export default function ProfilTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/pendaftar-data");
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-stone-100 text-stone-700" },
      awaiting_payment: { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-700" },
      paid: { label: "Sudah Bayar", color: "bg-blue-100 text-blue-700" },
      data_completed: { label: "Data Lengkap", color: "bg-cream-100 text-maroon-800" },
      docs_uploaded: { label: "Dokumen Terupload", color: "bg-indigo-100 text-indigo-700" },
      docs_verified: { label: "Dokumen Terverifikasi", color: "bg-green-100 text-green-700" },
      scheduled: { label: "Terjadwal Ujian", color: "bg-purple-100 text-purple-700" },
      tested: { label: "Sudah Ujian", color: "bg-violet-100 text-violet-700" },
      announced: { label: "Diumumkan", color: "bg-cyan-100 text-cyan-700" },
      accepted: { label: "Diterima", color: "bg-green-100 text-green-700" },
      rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
      enrolled: { label: "Terdaftar", color: "bg-emerald-100 text-emerald-700" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-stone-100 text-stone-700" };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-maroon-700 mx-auto mb-4" />
          <p className="text-stone-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl p-8 border-2 border-red-200">
        <p className="text-red-600">Gagal memuat data profil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-600 to-maroon-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-2">Profil Saya</h1>
            <p className="text-cream-100">
              Informasi pribadi dan status pendaftaran Anda
            </p>
          </div>
          <div className="hidden md:block">
            {formatStatus(profile.status_proses)}
          </div>
        </div>
      </div>

      {/* Nomor Pendaftaran Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-amber-100 text-sm">Nomor Pendaftaran Anda</p>
            <p className="text-3xl font-black tracking-wider">
              {profile.nomor_pendaftaran}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Pribadi */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-cream-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cream-100 rounded-lg">
              <User className="w-6 h-6 text-maroon-700" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Data Pribadi</h3>
          </div>

          <div className="space-y-3">
            <InfoItem label="Nama Lengkap" value={profile.nama_lengkap} />
            <InfoItem label="NIK" value={profile.nik} />
            <InfoItem
              label="Jenis Kelamin"
              value={["L", "Laki-laki"].includes(profile.jenis_kelamin) ? "Laki-laki" : "Perempuan"}
            />
            <InfoItem label="Jenjang" value={profile.jenjang} />
            <InfoItem label="Tempat Lahir" value={profile.tempat_lahir} />
            <InfoItem
              label="Tanggal Lahir"
              value={formatDate(profile.tanggal_lahir)}
            />
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Informasi Kontak
            </h3>
          </div>

          <div className="space-y-3">
            <InfoItem
              label="No. HP"
              value={profile.no_hp}
              icon={<Phone className="w-4 h-4 text-blue-600" />}
            />
            <InfoItem
              label="Email"
              value={profile.email}
              icon={<Mail className="w-4 h-4 text-blue-600" />}
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Alamat</h3>
          </div>

          <div className="space-y-3">
            <InfoItem label="Alamat Lengkap" value={profile.alamat} />
            <InfoItem label="Kelurahan" value={profile.kelurahan} />
            <InfoItem label="Kecamatan" value={profile.kecamatan} />
            <InfoItem label="Kabupaten/Kota" value={profile.kabupaten} />
            <InfoItem label="Provinsi" value={profile.provinsi} />
          </div>
        </div>

        {/* Asal Sekolah */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <School className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Asal Sekolah</h3>
          </div>

          <div className="space-y-3">
            <InfoItem label="Nama Sekolah" value={profile.asal_sekolah} />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-200 rounded-lg">
              <User className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">
              Informasi Penting
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Pastikan data Anda sudah benar dan sesuai dengan dokumen
                resmi
              </li>
              <li>
                • Jika ada perubahan data, hubungi panitia PPDB di nomor yang
                tertera
              </li>
              <li>
                • Simpan nomor pendaftaran Anda untuk keperluan verifikasi
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-stone-400">{icon}</span>}
        <p className="font-medium text-stone-900">{value || "-"}</p>
      </div>
    </div>
  );
}
