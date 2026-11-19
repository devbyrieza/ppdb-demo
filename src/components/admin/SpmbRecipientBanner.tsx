"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Loader2, Save, X, PhoneCall } from "lucide-react";
import Swal from "sweetalert2";

export default function SpmbRecipientBanner({ role }: { role?: string }) {
  const isSuper =
    role === "admin_super" || role === "head_of_it" || role === "superadmin";

  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    adminKeuangan: "",
    superAdmin: "",
    ketuaPanitia: "",
    waitingDays: 14,
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/spmb-recipients");
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(Boolean(data.isConfigured));
        setForm({
          adminKeuangan: data.raw?.adminKeuangan || "",
          superAdmin: data.raw?.superAdmin || "",
          ketuaPanitia: data.raw?.ketuaPanitia || "",
          waitingDays: data.waitingDays || 14,
        });
      }
    } catch (e) {
      console.error("Gagal memuat pengaturan WhatsApp penanggung jawab:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Hanya relevan untuk Admin Super / Head of IT
  if (!isSuper || loading) return null;

  // JIKA SUDAH DIATUR → HIGHLIGHT HILANG TOTAL (Return null)
  if (isConfigured && !showModal) {
    return null;
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.adminKeuangan.trim() || !form.superAdmin.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nomor Wajib Belum Diisi",
        text: "Nomor WhatsApp Admin Keuangan dan Super Admin wajib diisi agar notifikasi berjalan.",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/spmb-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyimpan");

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        text: "Nomor WhatsApp penanggung jawab berhasil disimpan. Notifikasi bot pengingat kini aktif.",
        timer: 2000,
      });

      setIsConfigured(true);
      setShowModal(false);
      loadSettings();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* HIGHLIGHT BANNER PERINGATAN (Hanya Tampil Jika Belum Diatur) */}
      {!isConfigured && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/70 p-4 sm:p-5 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-200 text-amber-900">
                    Konfigurasi Penting
                  </span>
                  <h4 className="text-sm font-black text-amber-950">
                    Nomor WhatsApp Penanggung Jawab SPMB Belum Diatur
                  </h4>
                </div>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed max-w-2xl">
                  Notifikasi bot pengingat jatuh tempo DP 50% dan pemantauan santri cadangan membutuhkan nomor WhatsApp <strong>Admin Keuangan</strong> dan <strong>Super Admin</strong>.
                  Silakan atur nomor WhatsApp agar alur operasional berjalan otomatis dan terpantau.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Atur Nomor WhatsApp Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL / DIALOG FORM PENGATURAN NOMOR WHATSAPP */}
      {showModal && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Atur Nomor WhatsApp Penanggung Jawab
                  </h3>
                  <p className="text-xs text-stone-500">
                    Untuk notifikasi bot pengingat jatuh tempo &amp; kuota cadangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* 1. Admin Keuangan */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                  1. Nomor WhatsApp Admin Keuangan <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-1.5">
                  Menerima alert santri yang mendekati jatuh tempo DP 50% dan permohonan dispensasi. Boleh lebih dari 1 nomor (pisahkan dengan koma).
                </p>
                <input
                  type="text"
                  placeholder="Contoh: 081298765432, 085712345678"
                  value={form.adminKeuangan}
                  onChange={(e) => setForm({ ...form, adminKeuangan: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {/* 2. Super Admin */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                  2. Nomor WhatsApp Super Admin <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-1.5">
                  Menerima notifikasi teknis sistem, laporan eskalasi kuota kosong, dan audit log. Boleh lebih dari 1 nomor.
                </p>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={form.superAdmin}
                  onChange={(e) => setForm({ ...form, superAdmin: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {/* 3. Ketua Panitia / Mudir */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                  3. Nomor WhatsApp Ketua Panitia / Mudir <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-1.5">
                  Hanya menerima rekap progres kuota harian (tanpa pesan teknis). Boleh dikosongkan jika tidak ingin mengganggu beliau.
                </p>
                <input
                  type="text"
                  placeholder="Boleh dikosongkan jika tidak diperlukan"
                  value={form.ketuaPanitia}
                  onChange={(e) => setForm({ ...form, ketuaPanitia: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* 4. Batas Waktu Evaluasi Cadangan */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                  Batas Hari Evaluasi Santri Cadangan (Default: 14 Hari)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={form.waitingDays}
                    onChange={(e) => setForm({ ...form, waitingDays: parseInt(e.target.value, 10) || 14 })}
                    className="w-24 px-3 py-2 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center"
                  />
                  <span className="text-xs text-stone-600 font-semibold">Hari Kerja</span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-stone-300 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan &amp; Aktifkan Notifikasi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
