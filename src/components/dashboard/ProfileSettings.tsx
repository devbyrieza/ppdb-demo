"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
}

export default function ProfileSettings({ user }: { user: UserSession }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile Info State
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // UI State
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const formatRoleDisplay = (role?: string) => {
    if (!role) return "-";
    const roleMap: Record<string, string> = {
      admin_super: "Admin Super",
      admin_keuangan: "Admin Keuangan",
      admin_berkas: "Admin Berkas",
      penguji_calsan: "Penguji Al-Qur'an",
      pewawancara_calsan: "Pewawancara Calon Santri",
      pewawancara_cawalsan: "Pewawancara Calon Orangtua/Wali Santri",
      admin: "Admin",
      penguji: "Penguji Al-Qur'an",
    };
    return roleMap[role] || role.replace("_", " ").toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfileSuccess(false);

    if (!fullName) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil");

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    // ... (existing logic remains same)
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("Password baru dan konfirmasi tidak boleh kosong.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah password");
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Profil Saya
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola informasi akun dan pengaturan keamanan Anda.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {fullName || user?.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex m-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {formatRoleDisplay(user?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50/10">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  No. WhatsApp (Aktif)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <div className="mt-1.5 flex flex-col gap-1">
                  <p className="text-[10px] text-gray-400 ml-1 leading-relaxed">
                    Digunakan untuk mengirim pengingat jadwal otomatis H-1.
                  </p>
                  <p className="text-[10px] text-blue-500 font-bold ml-1 flex items-center gap-1 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> PIN Login: 4 Digit Terakhir
                    Nomor Ini
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Saat Ini
              </label>
              <input
                type="text"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:ring-0"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1 italic">
                Email tidak dapat diubah sendiri. Hubungi Admin Pusat jika ada
                kesalahan data.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {profileSuccess && (
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profil diperbarui!
                </p>
              )}
              <div className="flex-1"></div>
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-sm transition-all"
              >
                {profileLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Settings Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
          </div>
          <p className="text-sm text-gray-500">
            Gunakan kombinasi password yang kuat dan aman.
          </p>
        </div>

        <div className="p-6 md:p-8 bg-gray-50/30">
          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">
                  Password Berhasil Diperbarui!
                </p>
                <p className="text-xs text-emerald-700/80 mt-0.5">
                  Silakan gunakan password baru Anda saat login berikutnya.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                    ${
                                      loading ||
                                      !newPassword ||
                                      !confirmPassword
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 hover:shadow"
                                    }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Password Baru
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
