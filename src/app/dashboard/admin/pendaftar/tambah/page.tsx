"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Info, UserPlus } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminTambahPendaftar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "PINDAHAN" ? "PINDAHAN" : "BARU";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipe_pendaftaran: initialType,
    nik: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    jenjang: "",
    no_hp: "",
    email: "",
    // Khusus pindahan
    kelas_masuk: "",
    asal_institusi: "",
    nomor_induk_lama: "",
    catatan_pindahan: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi basic
    if (!formData.nik || formData.nik.length !== 16) {
      Swal.fire("Error", "NIK harus 16 digit angka", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/pendaftar/tambah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil!",
        html: `
          <p>Santri berhasil didaftarkan ke sistem.</p>
          <div class="bg-stone-100 p-4 rounded-xl text-left mt-4 border border-stone-200">
            <p class="text-sm text-stone-500 mb-1">Nomor Pendaftaran:</p>
            <p class="font-bold text-lg text-primary-700">${data.data.nomor_pendaftaran}</p>
            <p class="text-sm text-stone-500 mt-3 mb-1">Pendaftar dapat login menggunakan:</p>
            <p class="font-medium">No HP: ${formData.no_hp}</p>
          </div>
        `,
        confirmButtonColor: "#059669",
      }).then(() => {
        router.push("/dashboard/admin/pendaftar");
        router.refresh();
      });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/pendaftar"
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-primary-600" />
            Pendaftaran Internal (Tanpa OTP)
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Fitur khusus Admin untuk meregistrasi pendaftar secara langsung.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 text-blue-800 text-sm">
        <Info className="w-5 h-5 shrink-0 text-blue-600" />
        <p>
          Menggunakan form ini akan langsung membuatkan akun login pendaftar tanpa melewati verifikasi kode OTP via WhatsApp. Nomor HP yang dimasukkan otomatis menjadi nomor login pendaftar.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Tipe Pendaftaran */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 border-b pb-2">Tipe Pendaftaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${formData.tipe_pendaftaran === 'BARU' ? 'border-primary-500 bg-primary-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <input type="radio" name="tipe_pendaftaran" value="BARU" className="sr-only" checked={formData.tipe_pendaftaran === 'BARU'} onChange={handleChange} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900">Pendaftar Reguler (Baru)</span>
                  <span className="text-xs text-stone-500 mt-1">Untuk calon santri baru masuk di awal jenjang</span>
                </div>
              </label>
              <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${formData.tipe_pendaftaran === 'PINDAHAN' ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <input type="radio" name="tipe_pendaftaran" value="PINDAHAN" className="sr-only" checked={formData.tipe_pendaftaran === 'PINDAHAN'} onChange={handleChange} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900">Pendaftar Pindahan</span>
                  <span className="text-xs text-stone-500 mt-1">Untuk calon santri pindahan/mutasi dari sekolah lain</span>
                </div>
              </label>
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 border-b pb-2">Data Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">NIK (16 Digit) <span className="text-red-500">*</span></label>
                <input required type="text" name="nik" value={formData.nik} onChange={handleChange} maxLength={16} placeholder="Contoh: 3201..." className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Nama Lengkap Sesuai KK <span className="text-red-500">*</span></label>
                <input required type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Nama lengkap..." className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Jenis Kelamin <span className="text-red-500">*</span></label>
                <select required name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none bg-white">
                  <option value="">Pilih Jenis Kelamin...</option>
                  <option value="Laki-laki">Laki-laki (Putra)</option>
                  <option value="Perempuan">Perempuan (Putri)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Jenjang Tujuan <span className="text-red-500">*</span></label>
                <select required name="jenjang" value={formData.jenjang} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none bg-white">
                  <option value="">Pilih Jenjang...</option>
                  <option value="TK">TK</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="MTs">MTs</option>
                  <option value="IL">I'dad Lughowi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Tempat Lahir</label>
                <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} placeholder="Kota/Kab..." className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Data Kontak */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 border-b pb-2">Data Kontak (Untuk Login & Notifikasi)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Nomor WhatsApp <span className="text-red-500">*</span></label>
                <input required type="tel" name="no_hp" value={formData.no_hp} onChange={handleChange} placeholder="Contoh: 081234567890" className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Email (Opsional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com" className="w-full px-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Data Pindahan (Jika Memilih Pindahan) */}
          {formData.tipe_pendaftaran === "PINDAHAN" && (
            <div className="space-y-4 bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-lg font-bold text-purple-900 border-b border-purple-200 pb-2">Informasi Santri Pindahan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900">Kelas Tujuan Masuk <span className="text-red-500">*</span></label>
                  <select required name="kelas_masuk" value={formData.kelas_masuk} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all appearance-none bg-white">
                    <option value="">Pilih Kelas...</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(kelas => (
                      <option key={kelas} value={kelas}>Kelas {kelas}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900">Asal Institusi / Sekolah <span className="text-red-500">*</span></label>
                  <input required type="text" name="asal_institusi" value={formData.asal_institusi} onChange={handleChange} placeholder="Nama sekolah asal..." className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900">NISN / NSM / NPSN Sekolah Asal</label>
                  <input type="text" name="nomor_induk_lama" value={formData.nomor_induk_lama} onChange={handleChange} placeholder="Nomor statistik/induk..." className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-purple-900">Alasan Pindah (Opsional)</label>
                  <textarea name="catatan_pindahan" value={formData.catatan_pindahan} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md shadow-primary-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Daftarkan Santri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
