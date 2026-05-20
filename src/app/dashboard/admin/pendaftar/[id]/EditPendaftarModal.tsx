"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

interface EditPendaftarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftar: any;
  paramsId: string;
  onSaveSuccess: () => void;
}

export default function EditPendaftarModal({
  isOpen,
  onClose,
  pendaftar,
  paramsId,
  onSaveSuccess,
}: EditPendaftarModalProps) {
  const [editTab, setEditTab] = useState("santri");
  const [editFormData, setEditFormData] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (pendaftar) {
      setEditFormData({
        santri: {
          nama_lengkap: pendaftar.nama_lengkap || "",
          nik: pendaftar.nik || "",
          tempat_lahir: pendaftar.tempat_lahir || "",
          tanggal_lahir: pendaftar.tanggal_lahir
            ? new Date(pendaftar.tanggal_lahir).toISOString().split("T")[0]
            : "",
          jenis_kelamin: pendaftar.jenis_kelamin || "L",
          no_hp: pendaftar.no_hp || "",
          email: pendaftar.email || "",
          golongan_darah: pendaftar.golongan_darah || "",
          anak_ke: pendaftar.anak_ke ?? "",
          jumlah_saudara: pendaftar.jumlah_saudara ?? "",
          hobi: pendaftar.hobi || "",
          cita_cita: pendaftar.cita_cita || "",
          alamat: pendaftar.alamat || "",
          rt: pendaftar.rt || "",
          rw: pendaftar.rw || "",
          kelurahan: pendaftar.kelurahan || "",
          kecamatan: pendaftar.kecamatan || "",
          kabupaten: pendaftar.kabupaten || "",
          provinsi: pendaftar.provinsi || "",
          kode_pos: pendaftar.kode_pos || "",
          asal_sekolah: pendaftar.asal_sekolah || "",
          alamat_sekolah: pendaftar.alamat_sekolah || "",
          tahun_lulus: pendaftar.tahun_lulus ?? "",
          nisn: pendaftar.nisn || "",
          tipe_pendaftaran: pendaftar.tipe_pendaftaran || "BARU",
          kelas_masuk: pendaftar.kelas_masuk ?? "",
          asal_institusi: pendaftar.asal_institusi || "",
          nomor_induk_lama: pendaftar.nomor_induk_lama || "",
          catatan_pindahan: pendaftar.catatan_pindahan || "",
        },
        orang_tua: {
          nama_ayah: pendaftar.orang_tua?.nama_ayah || "",
          nik_ayah: pendaftar.orang_tua?.nik_ayah || "",
          tempat_lahir_ayah: pendaftar.orang_tua?.tempat_lahir_ayah || "",
          tanggal_lahir_ayah: pendaftar.orang_tua?.tanggal_lahir_ayah
            ? new Date(pendaftar.orang_tua.tanggal_lahir_ayah)
                .toISOString()
                .split("T")[0]
            : "",
          pendidikan_ayah: pendaftar.orang_tua?.pendidikan_ayah || "",
          pekerjaan_ayah: pendaftar.orang_tua?.pekerjaan_ayah || "",
          penghasilan_ayah: pendaftar.orang_tua?.penghasilan_ayah || "",
          no_hp_ayah: pendaftar.orang_tua?.no_hp_ayah || "",
          status_ayah: pendaftar.orang_tua?.status_ayah || "Masih Hidup",
          alamat_ayah: pendaftar.orang_tua?.alamat_ayah || "",
          nama_ibu: pendaftar.orang_tua?.nama_ibu || "",
          nik_ibu: pendaftar.orang_tua?.nik_ibu || "",
          tempat_lahir_ibu: pendaftar.orang_tua?.tempat_lahir_ibu || "",
          tanggal_lahir_ibu: pendaftar.orang_tua?.tanggal_lahir_ibu
            ? new Date(pendaftar.orang_tua.tanggal_lahir_ibu)
                .toISOString()
                .split("T")[0]
            : "",
          pendidikan_ibu: pendaftar.orang_tua?.pendidikan_ibu || "",
          pekerjaan_ibu: pendaftar.orang_tua?.pekerjaan_ibu || "",
          penghasilan_ibu: pendaftar.orang_tua?.penghasilan_ibu || "",
          no_hp_ibu: pendaftar.orang_tua?.no_hp_ibu || "",
          status_ibu: pendaftar.orang_tua?.status_ibu || "Masih Hidup",
          alamat_ibu: pendaftar.orang_tua?.alamat_ibu || "",
          nama_wali: pendaftar.orang_tua?.nama_wali || "",
          nik_wali: pendaftar.orang_tua?.nik_wali || "",
          tempat_lahir_wali: pendaftar.orang_tua?.tempat_lahir_wali || "",
          tanggal_lahir_wali: pendaftar.orang_tua?.tanggal_lahir_wali
            ? new Date(pendaftar.orang_tua.tanggal_lahir_wali)
                .toISOString()
                .split("T")[0]
            : "",
          pendidikan_wali: pendaftar.orang_tua?.pendidikan_wali || "",
          pekerjaan_wali: pendaftar.orang_tua?.pekerjaan_wali || "",
          penghasilan_wali: pendaftar.orang_tua?.penghasilan_wali || "",
          no_hp_wali: pendaftar.orang_tua?.no_hp_wali || "",
          alamat_wali: pendaftar.orang_tua?.alamat_wali || "",
          hubungan_wali: pendaftar.orang_tua?.hubungan_wali || "",
        },
      });
    }
  }, [pendaftar]);

  if (!isOpen || !editFormData) return null;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/admin/pendaftar/${paramsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_edit_full: true,
          santri: editFormData.santri,
          orang_tua: editFormData.orang_tua,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: data.message || "Data pendaftar berhasil diperbarui secara lengkap!",
        confirmButtonColor: "#0d6e6e",
      });

      onSaveSuccess();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Terjadi kesalahan saat menyimpan data",
        confirmButtonColor: "#0d6e6e",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="bg-primary-950 p-6 text-white flex items-center justify-between border-b border-primary-900">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Edit Biodata & Ortu Pendaftar</h2>
            <p className="text-xs text-primary-200 font-bold mt-1">Super Admin Panel - Lakukan koreksi data dengan teliti.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-50 border-b border-stone-200 overflow-x-auto scrollbar-thin">
          {[
            { id: "santri", label: "Data Santri" },
            { id: "alamat", label: "Alamat & Kontak" },
            { id: "sekolah", label: "Sekolah & Pindahan" },
            { id: "ayah", label: "Data Ayah" },
            { id: "ibu", label: "Data Ibu" },
            { id: "wali", label: "Data Wali" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setEditTab(tab.id)}
              className={`px-6 py-4 font-black text-sm tracking-wide transition-all border-b-2 uppercase whitespace-nowrap ${
                editTab === tab.id
                  ? "border-primary-600 text-primary-700 bg-white"
                  : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-8 space-y-6">
          {editTab === "santri" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Nama Lengkap Santri</label>
                <input
                  type="text"
                  value={editFormData.santri.nama_lengkap}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, nama_lengkap: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">NIK Santri</label>
                <input
                  type="text"
                  value={editFormData.santri.nik}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, nik: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir</label>
                <input
                  type="text"
                  value={editFormData.santri.tempat_lahir}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, tempat_lahir: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir</label>
                <input
                  type="date"
                  value={editFormData.santri.tanggal_lahir}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, rounded_xl: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Jenis Kelamin</label>
                <select
                  value={editFormData.santri.jenis_kelamin}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, jenis_kelamin: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Golongan Darah</label>
                <select
                  value={editFormData.santri.golongan_darah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, golongan_darah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                >
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Tidak Tahu">Tidak Tahu</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Anak Ke</label>
                <input
                  type="number"
                  value={editFormData.santri.anak_ke}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, anak_ke: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Jumlah Bersaudara</label>
                <input
                  type="number"
                  value={editFormData.santri.jumlah_saudara}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, jumlah_saudara: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Hobi</label>
                <input
                  type="text"
                  value={editFormData.santri.hobi}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, hobi: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Cita-Cita</label>
                <input
                  type="text"
                  value={editFormData.santri.cita_cita}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, cita_cita: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
            </div>
          )}

          {editTab === "alamat" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">No. HP Santri</label>
                  <input
                    type="text"
                    value={editFormData.santri.no_hp}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, no_hp: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Email Santri</label>
                  <input
                    type="email"
                    value={editFormData.santri.email}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, email: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Alamat Rumah Lengkap</label>
                <textarea
                  value={editFormData.santri.alamat}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    santri: { ...editFormData.santri, alamat: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">RT</label>
                  <input
                    type="text"
                    value={editFormData.santri.rt}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, rt: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">RW</label>
                  <input
                    type="text"
                    value={editFormData.santri.rw}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, rw: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Kelurahan</label>
                  <input
                    type="text"
                    value={editFormData.santri.kelurahan}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, kelurahan: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Kecamatan</label>
                  <input
                    type="text"
                    value={editFormData.santri.kecamatan}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, kecamatan: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Kabupaten/Kota</label>
                  <input
                    type="text"
                    value={editFormData.santri.kabupaten}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, kabupaten: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Provinsi</label>
                  <input
                    type="text"
                    value={editFormData.santri.provinsi}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, provinsi: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Kode Pos</label>
                  <input
                    type="text"
                    value={editFormData.santri.kode_pos}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, kode_pos: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}

          {editTab === "sekolah" && (
            <div className="space-y-8">
              {/* General School Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Nama Asal Sekolah</label>
                  <input
                    type="text"
                    value={editFormData.santri.asal_sekolah}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, asal_sekolah: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">NISN</label>
                  <input
                    type="text"
                    value={editFormData.santri.nisn}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, nisn: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Alamat Sekolah</label>
                  <input
                    type="text"
                    value={editFormData.santri.alamat_sekolah}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, alamat_sekolah: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-stone-600">Tahun Lulus</label>
                  <input
                    type="number"
                    value={editFormData.santri.tahun_lulus}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      santri: { ...editFormData.santri, tahun_lulus: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Transfer specific details */}
              <div className="border-t border-stone-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-black text-[10px] uppercase">Pindahan</span>
                  <h3 className="text-lg font-black text-stone-900">Informasi Khusus Siswa Pindahan</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tipe Pendaftaran</label>
                    <select
                      value={editFormData.santri.tipe_pendaftaran}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, tipe_pendaftaran: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                    >
                      <option value="BARU">BARU (Reguler)</option>
                      <option value="PINDAHAN">PINDAHAN</option>
                    </select>
                  </div>

                  {editFormData.santri.tipe_pendaftaran === "PINDAHAN" && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-stone-600">Kelas Masuk</label>
                        <input
                          type="number"
                          value={editFormData.santri.kelas_masuk}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            santri: { ...editFormData.santri, kelas_masuk: e.target.value }
                          })}
                          placeholder="Contoh: 8"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-stone-600">Asal Institusi/Sekolah Lama</label>
                        <input
                          type="text"
                          value={editFormData.santri.asal_institusi}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            santri: { ...editFormData.santri, asal_institusi: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-stone-600">Nomor Induk Lama (NIS/NISP)</label>
                        <input
                          type="text"
                          value={editFormData.santri.nomor_induk_lama}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            santri: { ...editFormData.santri, nomor_induk_lama: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black uppercase text-stone-600">Catatan Pindahan</label>
                        <textarea
                          value={editFormData.santri.catatan_pindahan}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            santri: { ...editFormData.santri, catatan_pindahan: e.target.value }
                          })}
                          rows={3}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800 resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {editTab === "ayah" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Nama Ayah Kandung</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nama_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nama_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">NIK Ayah</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nik_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nik_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Ayah</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.tempat_lahir_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tempat_lahir_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Ayah</label>
                <input
                  type="date"
                  value={editFormData.orang_tua.tanggal_lahir_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tanggal_lahir_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pendidikan_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pendidikan_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pekerjaan</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pekerjaan_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pekerjaan_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Penghasilan Bulanan</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.penghasilan_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, penghasilan_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">No. HP/WhatsApp Ayah</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.no_hp_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, no_hp_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Status Hidup Ayah</label>
                <select
                  value={editFormData.orang_tua.status_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, status_ayah: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                >
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Sudah Meninggal">Sudah Meninggal</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Ayah</label>
                <textarea
                  value={editFormData.orang_tua.alamat_ayah}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, alamat_ayah: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                />
              </div>
            </div>
          )}

          {editTab === "ibu" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Nama Ibu Kandung</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nama_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nama_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">NIK Ibu</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nik_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nik_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Ibu</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.tempat_lahir_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tempat_lahir_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Ibu</label>
                <input
                  type="date"
                  value={editFormData.orang_tua.tanggal_lahir_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tanggal_lahir_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pendidikan_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pendidikan_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pekerjaan</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pekerjaan_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pekerjaan_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Penghasilan Bulanan</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.penghasilan_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, penghasilan_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">No. HP/WhatsApp Ibu</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.no_hp_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, no_hp_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Status Hidup Ibu</label>
                <select
                  value={editFormData.orang_tua.status_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, status_ibu: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                >
                  <option value="Masih Hidup">Masih Hidup</option>
                  <option value="Sudah Meninggal">Sudah Meninggal</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Ibu</label>
                <textarea
                  value={editFormData.orang_tua.alamat_ibu}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, alamat_ibu: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800 resize-none"
                />
              </div>
            </div>
          )}

          {editTab === "wali" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Hubungan Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.hubungan_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, hubungan_wali: e.target.value }
                  })}
                  placeholder="Contoh: Paman, Kakek, Kakak, dll."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Nama Lengkap Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nama_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nama_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">NIK Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.nik_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, nik_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.tempat_lahir_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tempat_lahir_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Wali</label>
                <input
                  type="date"
                  value={editFormData.orang_tua.tanggal_lahir_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, tanggal_lahir_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pendidikan_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pendidikan_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Pekerjaan Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.pekerjaan_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, pekerjaan_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">Penghasilan Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.penghasilan_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, penghasilan_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-600">No. HP Wali</label>
                <input
                  type="text"
                  value={editFormData.orang_tua.no_hp_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, no_hp_wali: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Wali</label>
                <textarea
                  value={editFormData.orang_tua.alamat_wali}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    orang_tua: { ...editFormData.orang_tua, alamat_wali: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-800 resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="border-t border-stone-200 pt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-black text-sm uppercase transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm uppercase transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
