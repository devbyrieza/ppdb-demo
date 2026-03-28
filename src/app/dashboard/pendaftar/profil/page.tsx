"use client";

import { useEffect, useState } from "react";
import {
  User,
  MapPin,
  Phone,
  Edit,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Calendar,
  Mail,
  School
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RequestStatus {
  id: string;
  status: "pending" | "approved_to_edit" | "submitted" | "completed" | "rejected";
  reason: string;
  admin_note?: string;
  created_at: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [reason, setReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session.pendaftar_id) {
          // Fetch Data Lengkap
          const dataRes = await fetch("/api/pendaftar/data-lengkap");
          const dataJson = await dataRes.json();

          if (dataJson.success) {
            setData(dataJson.data);
          }

          // Fetch Request Status
          const reqRes = await fetch(`/api/pendaftar/request-edit?pendaftar_id=${session.pendaftar_id}`);
          const reqJson = await reqRes.json();

          if (reqJson.success && reqJson.data) {
            setRequestStatus(reqJson.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRequestEdit = async () => {
    if (!reason.trim()) {
      alert("Mohon isi alasan perubahan data.");
      return;
    }

    try {
      setSubmittingRequest(true);
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const res = await fetch("/api/pendaftar/request-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: session.pendaftar_id,
          reason: reason
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRequestStatus(json.data);
        setIsRequesting(false);
        setReason("");
      } else {
        alert(json.error || "Gagal mengajukan perubahan.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pine-200 border-t-pine-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-500 font-medium">Memuat profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-ink-900">Profil Saya</h1>
          <p className="text-ink-500 mt-1">Informasi data diri dan status pendaftaran</p>
        </div>

        {/* Request Status Banner */}
        {requestStatus && (
          <div className={`px-5 py-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm ${requestStatus.status === 'pending' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
            requestStatus.status === 'approved_to_edit' ? 'bg-gradient-to-r from-emerald-50 to-pine-50 border border-pine-200 text-pine-800' :
              requestStatus.status === 'submitted' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                requestStatus.status === 'rejected' ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-surface-100 border border-ink-200 text-ink-800'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${requestStatus.status === 'pending' ? 'bg-amber-100 text-amber-600' :
              requestStatus.status === 'approved_to_edit' ? 'bg-pine-100 text-pine-600' :
                requestStatus.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                  requestStatus.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-surface-200'
              }`}>
              {requestStatus.status === 'pending' && <Clock className="w-5 h-5 animate-pulse" />}
              {requestStatus.status === 'approved_to_edit' && <CheckCircle className="w-5 h-5" />}
              {requestStatus.status === 'rejected' && <XCircle className="w-5 h-5" />}
              {requestStatus.status === 'submitted' && <ShieldAlert className="w-5 h-5" />}
              {requestStatus.status === 'completed' && <CheckCircle className="w-5 h-5" />}
            </div>

            <div>
              <p className="font-bold text-sm uppercase mb-0.5">{requestStatus.status.replace(/_/g, " ")}</p>
              <p className="text-xs opacity-90 font-medium">
                {requestStatus.status === 'pending' ? 'Menunggu persetujuan admin untuk edit data.' :
                  requestStatus.status === 'approved_to_edit' ? 'Admin menyetujui. Silakan edit menu "Data Lengkap".' :
                    requestStatus.status === 'submitted' ? 'Data baru dikirim. Menunggu verifikasi.' :
                      requestStatus.status === 'rejected' ? 'Permintaan ditolak. Lihat catatan admin.' : ''}
              </p>
            </div>

            {requestStatus.status === 'approved_to_edit' && (
              <Link href="/dashboard/pendaftar/kelengkapan-berkas" className="ml-auto px-4 py-2 bg-pine-600 text-white text-xs font-bold rounded-xl hover:bg-pine-700 shadow-pine-500/20 shadow-lg transition-all">
                Edit Sekarang
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <div className="glass-panel p-6 md:p-8 rounded-[2rem] shadow-clay-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pine-100 flex items-center justify-center text-pine-600 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-900">Identitas Diri</h2>
                <p className="text-xs text-ink-500">Data pribadi pendaftar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Nama Lengkap</p>
                <p className="text-lg font-bold text-ink-900">{data?.santri?.nama_lengkap || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">NIK</p>
                <p className="text-lg font-medium text-ink-900 font-mono tracking-wide">{data?.santri?.nik || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Tempat, Tanggal Lahir</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ink-400" />
                  <p className="text-base font-medium text-ink-900">
                    {data?.santri?.tempat_lahir}, {data?.santri?.tanggal_lahir ? new Date(data.santri.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Jenis Kelamin</p>
                <p className="text-lg font-medium text-ink-900">{data?.santri?.jenis_kelamin || "-"}</p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="glass-panel p-6 md:p-8 rounded-[2rem] shadow-clay-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-900">Alamat & Kontak</h2>
                <p className="text-xs text-ink-500">Domisili dan informasi kontak</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-50 p-4 rounded-2xl border border-ink-100">
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-2">Alamat Lengkap</p>
                <p className="text-base font-medium text-ink-900 leading-relaxed">{data?.santri?.alamat_lengkap || "Belum diisi"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Kota/Kabupaten</p>
                  <p className="font-bold text-ink-900">{data?.santri?.kabupaten || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Provinsi</p>
                  <p className="font-bold text-ink-900">{data?.santri?.provinsi || "-"}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-ink-100/50 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  <Phone className="w-4 h-4" />
                  <span className="font-bold text-sm">{data?.santri?.no_hp || "-"}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                  <Mail className="w-4 h-4" />
                  <span className="font-bold text-sm">{data?.santri?.email || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* School Card */}
          <div className="glass-panel p-6 md:p-8 rounded-[2rem] shadow-clay-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-900">Sekolah Asal</h2>
                <p className="text-xs text-ink-500">Riwayat pendidikan sebelumnya</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">Nama Sekolah</p>
                <p className="text-lg font-bold text-ink-900">{data?.santri?.asal_sekolah || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400 uppercase font-bold tracking-widest mb-1">NPSN / NSM</p>
                <p className="font-mono text-base font-bold text-ink-900">{data?.santri?.npsn || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Request Edit Box */}
          <div className="bg-gradient-mesh p-1 rounded-[2.5rem] shadow-clay-lg">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.3rem] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4 text-ink-900">
                <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-ink-700" />
                </div>
                <h3 className="font-black text-xl">Perubahan Data</h3>
              </div>

              <p className="text-sm text-ink-500 mb-8 leading-relaxed font-medium">
                Data yang sudah diverifikasi dikunci untuk menjaga validitas. Jika terdapat kesalahan, ajukan permintaan perubahan data kepada admin.
              </p>

              {(!requestStatus || requestStatus.status === 'completed' || requestStatus.status === 'rejected') ? (
                !isRequesting ? (
                  <button
                    onClick={() => setIsRequesting(true)}
                    className="w-full py-4 bg-white border border-ink-200 text-ink-700 font-bold rounded-2xl hover:bg-surface-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                  >
                    Ajukan Perubahan
                  </button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-2 block">Alasan Perubahan</label>
                      <textarea
                        className="ft-input min-h-[100px] text-sm resize-none"
                        placeholder="Contoh: Salah input tanggal lahir..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsRequesting(false)}
                        className="py-3 text-sm font-bold text-ink-500 hover:bg-surface-100 rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleRequestEdit}
                        disabled={submittingRequest}
                        className="py-3 text-sm font-bold text-white bg-pine-600 hover:bg-pine-700 rounded-xl shadow-lg shadow-pine-500/20 disabled:opacity-50"
                      >
                        {submittingRequest ? "Mengirim..." : "Kirim Pengajuan"}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-surface-50 p-6 rounded-2xl border border-dashed border-ink-300 text-center">
                  <ShieldAlert className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-ink-500 font-bold">Permintaan Sedang Aktif</p>
                  <p className="text-xs text-ink-400 mt-1 max-w-[200px] mx-auto">Selesaikan proses saat ini sebelum mengajukan baru.</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Note if Rejected */}
          {requestStatus?.status === 'rejected' && requestStatus.admin_note && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-bold">Catatan Penolakan</h4>
              </div>
              <p className="text-sm text-red-700 italic leading-relaxed">"{requestStatus.admin_note}"</p>
              <p className="text-xs text-red-500 mt-3 font-semibold">Silakan ajukan ulang dengan alasan yang lebih jelas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
