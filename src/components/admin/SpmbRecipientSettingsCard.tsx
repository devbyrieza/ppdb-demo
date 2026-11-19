"use client";

import { useEffect, useState } from "react";
import {
  PhoneCall,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

export default function SpmbRecipientSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const [form, setForm] = useState({
    adminKeuangan: "",
    superAdmin: "",
    ketuaPanitia: "",
    waitingDays: 14,
  });

  const [isConfigured, setIsConfigured] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/spmb-recipients");
      if (res.ok) {
        const d = await res.json();
        setForm({
          adminKeuangan: d.raw?.adminKeuangan || "",
          superAdmin: d.raw?.superAdmin || "",
          ketuaPanitia: d.raw?.ketuaPanitia || "",
          waitingDays: d.waitingDays || 14,
        });
        setIsConfigured(Boolean(d.isConfigured));
      }
    } catch (e) {
      console.error("Gagal load pengaturan:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.adminKeuangan.trim() || !form.superAdmin.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nomor Wajib Belum Diisi",
        text: "Nomor WhatsApp Admin Keuangan dan Super Admin wajib diisi agar notifikasi kuota berjalan.",
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      Swal.fire({
        icon: "success",
        title: "Berhasil Disimpan!",
        text: "Nomor WhatsApp penanggung jawab berhasil diperbarui.",
        timer: 2000,
      });
      setIsConfigured(Boolean(data.settings?.isConfigured));
      fetchSettings();
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

  const handlePreview = async () => {
    try {
      const res = await fetch("/api/admin/spmb-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview_digest" }),
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setPreviewText(data.report);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTest = async () => {
    const confirm = await Swal.fire({
      title: "Kirim Tes Rekap Sekarang?",
      text: "Sistem akan mengirimkan pesan rekap status kuota ke seluruh nomor yang tersimpan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim Sekarang!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSendingTest(true);
      const res = await fetch("/api/admin/spmb-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_digest" }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Terkirim!",
          text: data.message || "Pesan berhasil diantrekan ke WhatsApp.",
        });
      } else {
        throw new Error(data.error || "Gagal mengirim tes");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Kirim",
        text: err.message,
      });
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mt-8">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-stone-900">
                Nomor WhatsApp Penanggung Jawab Alur SPMB
              </h3>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Belum Lengkap
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Notifikasi otomatis pengingat jatuh tempo DP 50%, dispensasi, dan rekap antrean santri cadangan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePreview}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Pratinjau isi pesan WhatsApp rekap harian"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>Pratinjau Pesan</span>
          </button>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={sendingTest || !isConfigured}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Kirim tes pesan rekap sekarang ke nomor terdaftar"
          >
            {sendingTest ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Tes Kirim WA</span>
          </button>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Admin Keuangan */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
              1. Nomor WhatsApp Admin Keuangan <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Menerima alert santri yang mendekati jatuh tempo DP 50% dan permohonan dispensasi. Boleh lebih dari 1 nomor (pisahkan koma).
            </p>
            <input
              type="text"
              placeholder="Contoh: 081298765432, 085712345678"
              value={form.adminKeuangan}
              onChange={(e) => setForm({ ...form, adminKeuangan: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          {/* Super Admin */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
              2. Nomor WhatsApp Super Admin <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Menerima notifikasi teknis kuota kosong, alert eskalasi santri cadangan, dan ringkasan harian.
            </p>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={form.superAdmin}
              onChange={(e) => setForm({ ...form, superAdmin: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          {/* Ketua Panitia / Mudir */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
              3. Nomor WhatsApp Ketua Panitia / Mudir{" "}
              <span className="text-stone-400 font-normal lowercase">(opsional)</span>
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Hanya menerima rekap progres kuota harian. Boleh dikosongkan jika tidak ingin mengganggu beliau dengan pesan bot.
            </p>
            <input
              type="text"
              placeholder="Boleh dikosongkan jika tidak diperlukan"
              value={form.ketuaPanitia}
              onChange={(e) => setForm({ ...form, ketuaPanitia: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Batas Hari Evaluasi Cadangan */}
          <div>
            <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
              Batas Hari Evaluasi Santri Cadangan
            </label>
            <p className="text-[11px] text-stone-500 mb-2">
              Durasi masa tunggu evaluasi kuota cadangan yang tampil transparan di portal calon santri.
            </p>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min="3"
                max="60"
                value={form.waitingDays}
                onChange={(e) =>
                  setForm({ ...form, waitingDays: parseInt(e.target.value, 10) || 14 })
                }
                className="w-24 px-3 py-2 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center"
              />
              <span className="text-xs text-stone-700 font-bold">Hari Kerja (Default: 14)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Format nomor: diawali 08... atau 628... Pisahkan dengan koma jika lebih dari satu.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer disabled:bg-stone-300"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewText && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewText(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50">
              <span className="text-xs font-black text-stone-800">
                Pratinjau Pesan Rekap WhatsApp Harian
              </span>
              <button
                type="button"
                onClick={() => setPreviewText(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 bg-stone-100">
              <pre className="text-xs font-mono whitespace-pre-wrap bg-white p-4 rounded-xl border border-stone-200 text-stone-800 shadow-2xs leading-relaxed">
                {previewText}
              </pre>
            </div>
            <div className="px-5 py-2.5 bg-white border-t border-stone-100 text-right">
              <button
                type="button"
                onClick={() => setPreviewText(null)}
                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
