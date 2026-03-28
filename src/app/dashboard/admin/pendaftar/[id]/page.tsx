"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  School,
  Heart,
  Home,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  Users,
  Briefcase,
  DollarSign,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface PendaftarDetail {
  id: string;
  nomor_pendaftaran: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  no_hp: string | null;
  email: string | null;
  asal_sekolah: string | null;
  tahun_lulus: number | null;
  alamat_sekolah: string | null;
  nisn: string | null;
  golongan_darah: string | null;
  anak_ke: number | null;
  jumlah_saudara: number | null;
  hobi: string | null;
  cita_cita: string | null;
  status_proses: string;
  created_at: string;
  updated_at: string;
  tahun_ajaran: {
    nama: string;
    biaya_pendaftaran: string;
  } | null;
  orang_tua: {
    nama_ayah: string | null;
    nik_ayah: string | null;
    tempat_lahir_ayah: string | null;
    tanggal_lahir_ayah: string | null;
    pendidikan_ayah: string | null;
    pekerjaan_ayah: string | null;
    penghasilan_ayah: string | null;
    no_hp_ayah: string | null;
    alamat_ayah: string | null;
    nama_ibu: string | null;
    nik_ibu: string | null;
    tempat_lahir_ibu: string | null;
    tanggal_lahir_ibu: string | null;
    pendidikan_ibu: string | null;
    pekerjaan_ibu: string | null;
    penghasilan_ibu: string | null;
    no_hp_ibu: string | null;
    alamat_ibu: string | null;
    status_ayah: string | null;
    status_ibu: string | null;
    nama_wali: string | null;
    hubungan_wali: string | null;
    no_hp_wali: string | null;
    pekerjaan_wali: string | null;
    alamat_wali: string | null;
  } | null;
  dokumen: Array<{
    id: string;
    jenis_dokumen: string;
    is_verified: boolean;
    catatan: string | null;
    file_path: string | null;
  }>;
  pembayaran: Array<{
    id: string;
    jumlah: string;
    metode_pembayaran: string;
    status_pembayaran: string;
    tanggal_pembayaran: string | null;
  }>;
  nilai_ujian: {
    nilai_total: number;
    catatan?: string;
    catatan_umum?: string;
    score_akademik?: number;
    score_kepribadian?: number;
    score_kesiapan?: number;
    score_quran?: number;
    nilai_tes_quran?: number;
    catatan_quran?: string;
    score_wawancara?: number;
    nilai_wawancara_santri?: number;
    catatan_santri?: string;
    nilai_wawancara_ortu?: number;
    catatan_ortu?: string;
  } | null;
}

/* import { useSession } from "next-auth/react"; -- Removed */

export default function PendaftarDetailPage() {
  const params = useParams();
  const router = useRouter();
  /* const { data: session } = useSession(); -- Removed */
  const [userRole, setUserRole] = useState<string | null>(null);

  const [pendaftar, setPendaftar] = useState<PendaftarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session?.role) {
            setUserRole(data.session.role);
          } else if (data.user?.user_metadata?.role) {
            setUserRole(data.user.user_metadata.role);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    }
    fetchSession();
  }, []);

  // Helper for role checks
  const isKeuangan = userRole === "admin_keuangan";
  const isBerkas = userRole === "admin_berkas";
  const isPenguji = userRole === "penguji_calsan" || userRole === "pewawancara_calsan" || userRole === "pewawancara_cawalsan";

  useEffect(() => {
    fetchPendaftarDetail();
  }, [params.id]);

  const fetchPendaftarDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      setPendaftar(result.data);
      setNewStatus(result.data.status_proses);
    } catch (error) {
      console.error("Error fetching pendaftar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSavingStatus(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_proses: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      await fetchPendaftarDetail();
      setEditingStatus(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    } finally {
      setSavingStatus(false);
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-stone-100 text-stone-700" },
      awaiting_payment: { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-700" },
      paid: { label: "Sudah Bayar", color: "bg-blue-100 text-blue-700" },
      data_completed: { label: "Data Lengkap", color: "bg-maroon-100 text-maroon-800" },
      docs_uploaded: { label: "Dokumen Terupload", color: "bg-indigo-100 text-indigo-700" },
      docs_verified: { label: "Dokumen Terverifikasi", color: "bg-green-100 text-green-700" },
      scheduled: { label: "Terjadwal Ujian", color: "bg-purple-100 text-purple-700" },
      tested: { label: "Sudah Ujian", color: "bg-violet-100 text-violet-700" },
      announced: { label: "Diumumkan", color: "bg-cyan-100 text-cyan-700" },
      accepted: { label: "Diterima", color: "bg-green-100 text-green-700" },
      rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
      enrolled: { label: "Terdaftar", color: "bg-emerald-100 text-emerald-700" },
      // Added missing keys matching seed/list
      verified: { label: "Terverifikasi", color: "bg-green-100 text-green-700" },
      payment_verification: { label: "Verifikasi Pembayaran", color: "bg-orange-100 text-orange-700" },
    };
    return statusMap[status] || { label: status, color: "bg-stone-100 text-stone-700" };
  };

  const toTitleCase = (str: string | null | undefined) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-stone-600">Memuat detail pendaftar...</p>
        </div>
      </div>
    );
  }

  if (!pendaftar) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-stone-600 text-lg font-medium">
          Pendaftar tidak ditemukan
        </p>
        <Link
          href="/dashboard/admin/pendaftar"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const statusInfo = formatStatus(pendaftar.status_proses);

  // Calculate document and payment progress
  const totalDocs = pendaftar.dokumen.length;
  const verifiedDocs = pendaftar.dokumen.filter(d => d.is_verified).length;
  const hasPaid = pendaftar.pembayaran.some(p => p.status_pembayaran === "verified");

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/admin/pendaftar"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pendaftar
      </Link>

      {/* Summary Card */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{toTitleCase(pendaftar.nama_lengkap)}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="font-mono text-blue-100">{pendaftar.nomor_pendaftaran}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold text-white">
                  {pendaftar.jenjang}
                </span>
                <span className="text-blue-100">
                  {pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[100px]">
              <p className="text-xs text-blue-100 mb-1">Pembayaran</p>
              <p className="font-bold text-lg flex items-center gap-1 text-white">
                {hasPaid ? (
                  <><CheckCircle className="w-4 h-4 text-green-300" /> Lunas</>
                ) : (
                  <><AlertCircle className="w-4 h-4 text-amber-300" /> Pending</>
                )}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[100px]">
              <p className="text-xs text-blue-100 mb-1">Dokumen</p>
              <p className="font-bold text-lg text-white">{verifiedDocs}/{totalDocs} Verified</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 min-w-[100px]">
              <p className="text-xs text-blue-100 mb-1">Tahun Ajaran</p>
              <p className="font-bold text-lg text-white">{pendaftar.tahun_ajaran?.nama || "-"}</p>
            </div>
          </div>
        </div>

        {/* Status & Actions Bar */}
        <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-blue-100">Status:</span>
            {editingStatus ? (
              <div className="flex items-center gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-1.5 bg-white text-stone-800 rounded-lg text-sm focus:outline-none"
                  disabled={savingStatus}
                >
                  <option value="draft">Draft</option>
                  <option value="awaiting_payment">Menunggu Pembayaran</option>
                  <option value="paid">Sudah Bayar</option>
                  <option value="data_completed">Data Lengkap</option>
                  <option value="docs_uploaded">Dokumen Terupload</option>
                  <option value="docs_verified">Dokumen Terverifikasi</option>
                  <option value="scheduled">Terjadwal Ujian</option>
                  <option value="tested">Sudah Ujian</option>
                  <option value="announced">Diumumkan</option>
                  <option value="accepted">Diterima</option>
                  <option value="rejected">Ditolak</option>
                  <option value="enrolled">Terdaftar</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={savingStatus}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {savingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                </button>
                <button
                  onClick={() => {
                    setEditingStatus(false);
                    setNewStatus(pendaftar.status_proses);
                  }}
                  disabled={savingStatus}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <button
                  onClick={() => setEditingStatus(true)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Ubah
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (confirm("Buka kunci formulir? Pendaftar akan bisa mengedit data kembali.")) {
                  setSavingStatus(true);
                  try {
                    const res = await fetch(`/api/admin/pendaftar/${params.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status_proses: "draft" }),
                    });
                    if (res.ok) {
                      await fetchPendaftarDetail();
                      alert("Formulir berhasil dibuka kuncinya.");
                    }
                  } catch (e) {
                    alert("Gagal membuka kunci.");
                  } finally {
                    setSavingStatus(false);
                  }
                }
              }}
              disabled={savingStatus || pendaftar.status_proses === "draft"}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3 h-3" />
              Buka Kunci
            </button>
            {pendaftar.no_hp && (
              <a
                href={`https://wa.me/${pendaftar.no_hp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                WhatsApp
              </a>
            )}
            {pendaftar.email && (
              <a
                href={`mailto:${pendaftar.email}`}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Untuk Admin Berkas: Dokumen pindah ke kolom utama paling atas */}
          {isBerkas && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-maroon-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-maroon-100 rounded-lg">
                  <FileText className="w-6 h-6 text-maroon-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Dokumen (Prioritas Verifikasi)</h3>
              </div>
              {pendaftar.dokumen.length === 0 ? (
                <p className="text-sm text-stone-500">Belum ada dokumen terupload</p>
              ) : (
                <div className="space-y-4">
                  {pendaftar.dokumen.map((doc) => {
                    const isGlobalVerified = ["docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled", "verified"].includes(pendaftar.status_proses);
                    const isVerified = doc.is_verified || (isGlobalVerified && !doc.catatan);
                    const isRejected = !doc.is_verified && doc.catatan;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-stone-400" />
                          <div>
                            <span className="block font-medium text-stone-900">
                              {doc.jenis_dokumen}
                            </span>
                            {((doc as any).file_url || (doc as any).file_path) && (
                              <a
                                href={(doc as any).file_url || `/api/files/${(doc as any).file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Lihat File
                              </a>
                            )}
                            {isRejected && (
                              <p className="text-xs text-red-600 mt-1">Catatan: {doc.catatan}</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${isVerified
                            ? "bg-green-100 text-green-700"
                            : isRejected
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {isVerified
                            ? "Terverifikasi"
                            : isRejected
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Hasil Seleksi & Ujian (Tampil untuk Admin Super, Admin Umum, dan Penguji) */}
          {(isPenguji || userRole === "admin_super" || userRole === "admin" || userRole === "head_of_it") && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-6 h-6 text-purple-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Hasil Seleksi & Ujian</h3>
                  <p className="text-sm text-stone-500">Rincian nilai 6 komponen tes Calon Santri & Wali Santri</p>
                </div>
              </div>

              {/* Grid 6 Test Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* 1. Tes Kemampuan Akademik (CBT) */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative">
                  <span className="block text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">CBT: Akademik</span>
                  {!pendaftar.nilai_ujian ?
                    <span className="text-sm font-bold text-stone-400 italic">Belum Ujian</span> :
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-900">
                        {pendaftar.nilai_ujian?.score_akademik ?? "-"}
                      </span>
                      <span className="text-sm text-blue-400 font-medium">/ 100</span>
                    </div>
                  }
                </div>

                {/* 2. Tes Identifikasi Kepribadian (CBT) */}
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <span className="block text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">CBT: Kepribadian</span>
                  {!pendaftar.nilai_ujian ?
                    <span className="text-sm font-bold text-stone-400 italic">Belum Ujian</span> :
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-900">
                        {pendaftar.nilai_ujian?.score_kepribadian ?? "-"}
                      </span>
                      <span className="text-sm text-indigo-400 font-medium">/ 100</span>
                    </div>
                  }
                </div>

                {/* 3. Tes Kesiapan (CBT) */}
                <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                  <span className="block text-xs text-violet-600 font-bold uppercase tracking-wide mb-1">CBT: Kesiapan</span>
                  {!pendaftar.nilai_ujian ?
                    <span className="text-sm font-bold text-stone-400 italic">Belum Ujian</span> :
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-violet-900">
                        {pendaftar.nilai_ujian?.score_kesiapan ?? "-"}
                      </span>
                      <span className="text-sm text-violet-400 font-medium">/ 100</span>
                    </div>
                  }
                </div>

                {/* 4. Tes Al-Qur'an (Offline) */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Wawancara: Al-Qur'an</span>
                    {!pendaftar.nilai_ujian ?
                      <span className="text-sm font-bold text-stone-400 italic">Belum Ujian</span> :
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-900">
                          {pendaftar.nilai_ujian?.score_quran ?? pendaftar.nilai_ujian?.nilai_tes_quran ?? "-"}
                        </span>
                        <span className="text-sm text-emerald-400 font-medium">/ 100</span>
                      </div>
                    }
                  </div>
                  {pendaftar.nilai_ujian?.catatan_quran && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-emerald-200/50 pt-2">
                      "{pendaftar.nilai_ujian.catatan_quran}"
                    </div>
                  )}
                </div>

                {/* 5. Wawancara Calsan (Offline) */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-amber-600 font-bold uppercase tracking-wide mb-1">Wawancara: Calsan</span>
                    {!pendaftar.nilai_ujian ?
                      <span className="text-sm font-bold text-stone-400 italic">Belum Ujian</span> :
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-900">
                          {pendaftar.nilai_ujian?.score_wawancara != null ? Number(pendaftar.nilai_ujian.score_wawancara).toFixed(1) : (pendaftar.nilai_ujian?.nilai_wawancara_santri != null ? Number(pendaftar.nilai_ujian.nilai_wawancara_santri).toFixed(1) : "-")}
                        </span>
                        <span className="text-sm text-amber-400 font-medium">/ 100</span>
                      </div>
                    }
                  </div>
                  {pendaftar.nilai_ujian?.catatan_santri && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-amber-200/50 pt-2">
                      "{pendaftar.nilai_ujian.catatan_santri}"
                    </div>
                  )}
                </div>

                {/* 6. Wawancara Cawalsan (Offline) */}
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Wawancara: Cawalsan</span>
                    {!pendaftar.nilai_ujian ?
                      <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">Belum Ada</span> :
                      (pendaftar.nilai_ujian?.nilai_wawancara_ortu || (pendaftar.nilai_ujian as any)?.detail_cawalsan ? (
                        <div className="flex flex-col mt-2">
                          <span className="text-lg font-black text-rose-900 border border-rose-200 bg-white px-3 py-1 rounded-lg inline-block w-max">
                            {(pendaftar.nilai_ujian as any)?.detail_cawalsan?.rekomendasi || (pendaftar.nilai_ujian?.nilai_wawancara_ortu != null && Number(pendaftar.nilai_ujian.nilai_wawancara_ortu) > 0 ? `${Number(pendaftar.nilai_ujian.nilai_wawancara_ortu).toFixed(1)} / 100` : 'Belum Dinilai')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">Belum Ada</span>
                      ))
                    }
                  </div>
                  {pendaftar.nilai_ujian?.catatan_ortu && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-rose-200/50 pt-2">
                      "{pendaftar.nilai_ujian.catatan_ortu}"
                    </div>
                  )}
                </div>

              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mt-4">
                <span className="block text-sm text-stone-500 font-medium mb-1">Catatan Total (Admin/Penguji Akhir)</span>
                <p className="text-stone-800 italic">
                  {pendaftar.nilai_ujian?.catatan_umum || pendaftar.nilai_ujian?.catatan || "Belum ada catatan umum/akhir."}
                </p>
              </div>

              {/* Tampilkan tombol edit hanya jika itu penguji, biar admin super dkk cukup melihat hasil saja, jika mengedit lewat form khusus */}
              {isPenguji && (
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/penguji/input-nilai?search=${pendaftar.nomor_pendaftaran}`} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow hover:shadow-md font-bold text-sm">
                    <Edit className="w-4 h-4" />
                    Input / Lengkapi Edit Nilai
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Untuk Admin Keuangan: Pembayaran pindah ke kolom utama paling atas */}
          {/* TODO: Ganti logic check permission dengan session role yang sebenarnya */}
          {isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Pembayaran (Prioritas Keuangan)</h3>
              </div>
              {pendaftar.pembayaran.length === 0 ? (
                <p className="text-sm text-stone-500">Belum ada pembayaran</p>
              ) : (
                <div className="space-y-3">
                  {pendaftar.pembayaran.map((payment) => (
                    <div key={payment.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-stone-900">
                          {formatRupiah(payment.jumlah)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status_pembayaran === "verified"
                            ? "bg-green-100 text-green-700"
                            : payment.status_pembayaran === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {payment.status_pembayaran === "verified"
                            ? "Terverifikasi"
                            : payment.status_pembayaran === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-stone-600">
                        <div>
                          <span className="block text-xs text-stone-400">Metode</span>
                          <span className="font-medium">{payment.metode_pembayaran}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-stone-400">Tanggal</span>
                          <span className="font-medium">{formatDate(payment.tanggal_pembayaran)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Pribadi (Selalu tampil, tapi mungkin disederhanakan) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Data Pribadi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Nama Lengkap" value={toTitleCase(pendaftar.nama_lengkap)} />
              <InfoItem label="NIK" value={pendaftar.nik} />
              <InfoItem
                label="Jenis Kelamin"
                value={pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
              />
              <InfoItem label="Jenjang" value={pendaftar.jenjang} />
              {/* Hide extensive personal details for Finance/Berkas/Penguji to reduce noise */}
              {!isKeuangan && !isBerkas && !isPenguji && (
                <>
                  <InfoItem label="Tempat Lahir" value={pendaftar.tempat_lahir} />
                  <InfoItem label="Tanggal Lahir" value={formatDate(pendaftar.tanggal_lahir)} />
                  <InfoItem label="Golongan Darah" value={pendaftar.golongan_darah} />
                  <InfoItem label="NISN" value={pendaftar.nisn} />
                  <InfoItem label="Anak Ke" value={pendaftar.anak_ke?.toString()} />
                  <InfoItem label="Jumlah Saudara" value={pendaftar.jumlah_saudara?.toString()} />
                  <InfoItem label="Hobi" value={pendaftar.hobi} />
                  <InfoItem label="Cita-cita" value={pendaftar.cita_cita} />
                </>
              )}
            </div>
          </div>

          {/* Kontak & Alamat (Penting untuk Penagihan) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Kontak & Alamat</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="No. HP" value={pendaftar.no_hp} icon={<Phone className="w-4 h-4" />} />
              <InfoItem label="Email" value={pendaftar.email} icon={<Mail className="w-4 h-4" />} />
              <div className="md:col-span-2">
                <InfoItem label="Alamat Lengkap" value={pendaftar.alamat} />
              </div>
              {/* Simplified address details for Finance */}
              {!isKeuangan && (
                <>
                  <InfoItem label="RT/RW" value={`${pendaftar.rt || "-"}/${pendaftar.rw || "-"}`} />
                  <InfoItem label="Kelurahan" value={pendaftar.kelurahan} />
                  <InfoItem label="Kecamatan" value={pendaftar.kecamatan} />
                  <InfoItem label="Kabupaten" value={pendaftar.kabupaten} />
                  <InfoItem label="Provinsi" value={pendaftar.provinsi} />
                  <InfoItem label="Kode Pos" value={pendaftar.kode_pos} />
                </>
              )}
            </div>
          </div>

          {/* Asal Sekolah (Sembunyikan untuk Keuangan) */}
          {!isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Asal Sekolah</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Nama Sekolah" value={pendaftar.asal_sekolah} />
                <InfoItem label="Tahun Lulus" value={pendaftar.tahun_lulus?.toString()} />
                <div className="md:col-span-2">
                  <InfoItem label="Alamat Sekolah" value={pendaftar.alamat_sekolah} />
                </div>
              </div>
            </div>
          )}

          {/* Data Orang Tua (Penting untuk Penagihan) */}
          {pendaftar.orang_tua && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Data Orang Tua/Wali</h3>
              </div>

              <div className="space-y-8">
                {/* Data Ayah */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Data Ayah / Wali Laki-laki
                    </div>
                    {pendaftar.orang_tua.status_ayah && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pendaftar.orang_tua.status_ayah === "Sudah Meninggal"
                        ? "bg-red-100 text-red-600 border border-red-200"
                        : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        }`}>
                        {pendaftar.orang_tua.status_ayah}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoItem label="Nama Lengkap" value={toTitleCase(pendaftar.orang_tua.nama_ayah)} />
                    <InfoItem label="No. HP / WA" value={pendaftar.orang_tua.no_hp_ayah} />
                    <InfoItem label="Pekerjaan" value={pendaftar.orang_tua.pekerjaan_ayah} />
                    <InfoItem label="Penghasilan" value={pendaftar.orang_tua.penghasilan_ayah} />
                    {!isKeuangan && (
                      <>
                        <InfoItem label="NIK" value={pendaftar.orang_tua.nik_ayah} />
                        <InfoItem label="Tempat, Tgl Lahir" value={`${pendaftar.orang_tua.tempat_lahir_ayah || ""}, ${formatDate(pendaftar.orang_tua.tanggal_lahir_ayah)}`} />
                        <InfoItem label="Pendidikan Terakhir" value={pendaftar.orang_tua.pendidikan_ayah} />
                        <div className="md:col-span-2">
                          <InfoItem label="Alamat Ayah" value={pendaftar.orang_tua.alamat_ayah || (pendaftar.orang_tua.status_ayah === "Masih Hidup" ? pendaftar.alamat : "-")} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-rose-600" />
                      Data Ibu / Wali Perempuan
                    </div>
                    {pendaftar.orang_tua.status_ibu && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pendaftar.orang_tua.status_ibu === "Sudah Meninggal"
                        ? "bg-red-100 text-red-600 border border-red-200"
                        : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        }`}>
                        {pendaftar.orang_tua.status_ibu}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoItem label="Nama Lengkap" value={toTitleCase(pendaftar.orang_tua.nama_ibu)} />
                    <InfoItem label="No. HP / WA" value={pendaftar.orang_tua.no_hp_ibu} />
                    {!isKeuangan && (
                      <>
                        <InfoItem label="NIK" value={pendaftar.orang_tua.nik_ibu} />
                        <InfoItem label="Tempat, Tgl Lahir" value={`${pendaftar.orang_tua.tempat_lahir_ibu || ""}, ${formatDate(pendaftar.orang_tua.tanggal_lahir_ibu)}`} />
                        <InfoItem label="Pendidikan Terakhir" value={pendaftar.orang_tua.pendidikan_ibu} />
                        <InfoItem label="Pekerjaan" value={pendaftar.orang_tua.pekerjaan_ibu} />
                        <InfoItem label="Penghasilan" value={pendaftar.orang_tua.penghasilan_ibu} />
                        <div className="md:col-span-2">
                          <InfoItem label="Alamat Ibu" value={pendaftar.orang_tua.alamat_ibu || (pendaftar.orang_tua.status_ibu === "Masih Hidup" ? pendaftar.alamat : "-")} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat Penyakit (Sembunyikan untuk Keuangan) */}
          {!isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Data Kesehatan & Catatan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Golongan Darah" value={pendaftar.golongan_darah} />
                <div className="md:col-span-2">
                  <p className="text-xs text-stone-500 mb-1">Riwayat Penyakit</p>
                  <div className="p-3 bg-red-50 text-red-900 rounded-lg border border-red-100 min-h-[60px]">
                    {pendaftar.hobi || "Tidak ada riwayat penyakit yang dilaporkan"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Sidebar Component for Documents & Payments (existing sidebar logic adapted) */}
          {/* If Keuangan, Sidebar Pembayaran di-hide atau ditampilkan sebagai Secondary info (karena sudah ada di header) */}

          {/* Status Dokumen */}
          {!isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-maroon-100 rounded-lg">
                  <FileText className="w-6 h-6 text-maroon-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Dokumen</h3>
              </div>
              {pendaftar.dokumen.length === 0 ? (
                <p className="text-sm text-stone-500">Belum ada dokumen terupload</p>
              ) : (
                <div className="space-y-2">
                  {pendaftar.dokumen.map((doc) => {
                    const isGlobalVerified = ["docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled", "verified"].includes(pendaftar.status_proses);
                    const isVerified = doc.is_verified || (isGlobalVerified && !doc.catatan);
                    const isRejected = !doc.is_verified && doc.catatan;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-stone-700">
                          {doc.jenis_dokumen}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${isVerified
                            ? "bg-green-100 text-green-700"
                            : isRejected
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {isVerified
                            ? "Terverifikasi"
                            : isRejected
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Status Pembayaran (Sidebar View - Hide IF Keuangan because it's already on top, OR keep as consistent view) */}
          {/* Hide IF Berkas as well, unless we want them to see it. User request implies focus on relevant data. */}
          {!isKeuangan && !isBerkas && !isPenguji && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Pembayaran</h3>
              </div>
              {pendaftar.pembayaran.length === 0 ? (
                <p className="text-sm text-stone-500">Belum ada pembayaran</p>
              ) : (
                <div className="space-y-3">
                  {pendaftar.pembayaran.map((payment) => (
                    <div key={payment.id} className="p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone-900">
                          {formatRupiah(payment.jumlah)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${payment.status_pembayaran === "verified"
                            ? "bg-green-100 text-green-700"
                            : payment.status_pembayaran === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {payment.status_pembayaran === "verified"
                            ? "Terverifikasi"
                            : payment.status_pembayaran === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600">
                        <div>Metode: {payment.metode_pembayaran}</div>
                        <div>
                          Tanggal: {formatDate(payment.tanggal_pembayaran)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Calendar className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Timeline</h3>
            </div>
            <div className="space-y-3">
              <InfoItem
                label="Tanggal Daftar"
                value={formatDate(pendaftar.created_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem
                label="Update Terakhir"
                value={formatDate(pendaftar.updated_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for info items
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
