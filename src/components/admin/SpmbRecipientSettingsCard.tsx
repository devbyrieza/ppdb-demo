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
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";

export interface StaffUserSummary {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  role: string;
  roleLabel: string;
}

function PhoneListField({
  label,
  required,
  optional,
  description,
  placeholder = "Contoh: 0812xxxx / 62812xxxx",
  phones,
  onChange,
  suggestions = [],
  allStaff = [],
  accentColor = "emerald",
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  description: string;
  placeholder?: string;
  phones: string[];
  onChange: (phones: string[]) => void;
  suggestions?: StaffUserSummary[];
  allStaff?: StaffUserSummary[];
  accentColor?: "amber" | "emerald";
}) {
  const currentPhones = phones && phones.length > 0 ? phones : [""];

  const norm = (p?: string | null) => {
    if (!p) return "";
    let c = p.replace(/\D/g, "");
    if (c.startsWith("0")) c = "62" + c.slice(1);
    else if (c.startsWith("8")) c = "628" + c.slice(1);
    return c;
  };

  const findStaffInfo = (phoneStr: string) => {
    if (!phoneStr || !allStaff || allStaff.length === 0) return null;
    const clean = norm(phoneStr);
    if (!clean) return null;
    return allStaff.find((s) => norm(s.phone) === clean || norm(s.rawPhone) === clean);
  };

  const updatePhone = (index: number, val: string) => {
    // Jika user paste beberapa nomor sekaligus
    if (val.includes(",") || val.includes(";") || val.includes("\n")) {
      const parts = val
        .split(/[,;\n]+/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        const next = [...currentPhones];
        next.splice(index, 1, ...parts);
        onChange(next);
        return;
      }
    }
    const next = [...currentPhones];
    next[index] = val;
    onChange(next);
  };

  const addPhone = () => {
    onChange([...currentPhones, ""]);
  };

  const removePhone = (index: number) => {
    if (currentPhones.length <= 1) {
      onChange([""]);
    } else {
      onChange(currentPhones.filter((_, i) => i !== index));
    }
  };

  const handleToggleSuggestion = (staff: StaffUserSummary) => {
    const targetPhone = staff.rawPhone || staff.phone;
    const targetNorm = norm(targetPhone);

    const isAlreadySelected = currentPhones.some(
      (p) => p.trim() && norm(p) === targetNorm
    );

    if (isAlreadySelected) {
      // Hapus jika sudah terpilih (toggle off)
      const next = currentPhones.filter((p) => norm(p) !== targetNorm);
      onChange(next.length > 0 ? next : [""]);
    } else {
      // Masukkan ke slot kosong jika ada, atau buat slot baru
      const emptyIdx = currentPhones.findIndex((p) => !p.trim());
      if (emptyIdx !== -1) {
        const next = [...currentPhones];
        next[emptyIdx] = targetPhone;
        onChange(next);
      } else {
        onChange([...currentPhones, targetPhone]);
      }
    }
  };

  const focusRing =
    accentColor === "emerald"
      ? "focus:ring-emerald-500 focus:border-emerald-500"
      : "focus:ring-amber-500 focus:border-amber-500";

  const btnText =
    accentColor === "emerald"
      ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
      : "text-amber-800 hover:text-amber-900 hover:bg-amber-100/70 border-amber-200";

  const validCount = currentPhones.filter((p) => p.trim()).length;

  return (
    <div className="space-y-1.5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
            {optional && <span className="text-stone-400 font-normal lowercase">(opsional)</span>}
          </label>
          {validCount > 1 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
              ✓ {validCount} Nomor
            </span>
          )}
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">{description}</p>

        {/* Input Rows */}
        <div className="space-y-2 mt-2.5">
          {currentPhones.map((phone, idx) => {
            const staff = findStaffInfo(phone);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder={placeholder}
                    value={phone}
                    onChange={(e) => updatePhone(idx, e.target.value)}
                    className={`flex-1 px-3.5 py-2 text-xs font-medium bg-white border border-stone-300 rounded-xl outline-none transition ${focusRing}`}
                    required={required && idx === 0 && validCount === 0}
                  />
                  {currentPhones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(idx)}
                      className="w-8 h-8 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Hapus nomor ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {staff && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 rounded-lg px-2.5 py-1 w-fit animate-in fade-in duration-150">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Terdaftar di Manajemen User: <strong>{staff.name}</strong>{" "}
                      <span className="text-[10px] text-emerald-600 font-normal">({staff.roleLabel})</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {/* Tombol Tambah Manual */}
        <div>
          <button
            type="button"
            onClick={addPhone}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${btnText}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Nomor WhatsApp</span>
          </button>
        </div>

        {/* REKOMENDASI PERSONIL DARI MANAJEMEN USER */}
        {suggestions && suggestions.length > 0 && (
          <div className="pt-2 border-t border-stone-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Rekomendasi dari Manajemen User:
              </span>
              <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
                Klik nama untuk memilih
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => {
                const isSelected = currentPhones.some(
                  (p) => p.trim() && norm(p) === norm(s.phone)
                );
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleSuggestion(s)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200/80"
                        : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-300"
                    }`}
                    title={
                      isSelected
                        ? `Nomor ${s.name} sudah dipilih (klik untuk membatalkan)`
                        : `Klik untuk menambahkan nomor ${s.name} (${s.rawPhone || s.phone})`
                    }
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>{s.name}</strong>{" "}
                          <span className="font-normal opacity-75">({s.rawPhone || s.phone})</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>
                          <strong>{s.name}</strong>{" "}
                          <span className="font-normal text-stone-500">({s.rawPhone || s.phone})</span>
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pilihan Staf Lainnya jika ada staf di luar saran utama */}
        {allStaff && allStaff.length > (suggestions?.length || 0) && (
          <div className="pt-1">
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const emptyIdx = currentPhones.findIndex((p) => !p.trim());
                  if (emptyIdx !== -1) {
                    const next = [...currentPhones];
                    next[emptyIdx] = val;
                    onChange(next);
                  } else {
                    onChange([...currentPhones, val]);
                  }
                }
              }}
              className="text-[11px] font-medium text-stone-600 bg-white/80 border border-dashed border-stone-300 rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:border-stone-400 transition"
            >
              <option value="">+ Tambahkan personil lain dari Manajemen User...</option>
              {allStaff
                .filter((st) => !suggestions?.some((s) => s.id === st.id))
                .map((st) => (
                  <option key={st.id} value={st.rawPhone || st.phone}>
                    {st.name} — {st.roleLabel} ({st.rawPhone || st.phone})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpmbRecipientSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const [form, setForm] = useState({
    superAdmin: [""] as string[],
    adminKeuangan: [""] as string[],
    ketuaPanitia: [""] as string[],
    adminBerkas: [""] as string[],
    waitingDays: 14,
  });

  const [staffSuggestions, setStaffSuggestions] = useState<{
    superAdmin: StaffUserSummary[];
    adminKeuangan: StaffUserSummary[];
    adminBerkas: StaffUserSummary[];
    ketuaPanitia: StaffUserSummary[];
    allStaff: StaffUserSummary[];
  }>({
    superAdmin: [],
    adminKeuangan: [],
    adminBerkas: [],
    ketuaPanitia: [],
    allStaff: [],
  });

  const [isConfigured, setIsConfigured] = useState(false);

  const parseToArray = (raw?: string | null): string[] => {
    if (!raw) return [""];
    const arr = raw
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : [""];
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/spmb-recipients");
      if (res.ok) {
        const d = await res.json();
        setForm({
          superAdmin: parseToArray(d.raw?.superAdmin),
          adminKeuangan: parseToArray(d.raw?.adminKeuangan),
          ketuaPanitia: parseToArray(d.raw?.ketuaPanitia),
          adminBerkas: parseToArray(d.raw?.adminBerkas),
          waitingDays: d.waitingDays || 14,
        });
        setIsConfigured(Boolean(d.isConfigured));
        if (d.staffSuggestions) {
          setStaffSuggestions(d.staffSuggestions);
        }
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

  // Lock scroll background saat preview modal terbuka (termasuk Lenis smooth-scroll)
  useEffect(() => {
    if (previewText) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        if (lenis && typeof lenis.start === "function") {
          lenis.start();
        }
      };
    }
  }, [previewText]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const superClean = form.superAdmin.map((s) => s.trim()).filter(Boolean).join(", ");
    const keuanganClean = form.adminKeuangan.map((s) => s.trim()).filter(Boolean).join(", ");
    const berkasClean = form.adminBerkas.map((s) => s.trim()).filter(Boolean).join(", ");
    const ketuaClean = form.ketuaPanitia.map((s) => s.trim()).filter(Boolean).join(", ");

    if (!keuanganClean || !superClean) {
      Swal.fire({
        icon: "warning",
        title: "Nomor Wajib Belum Diisi",
        text: "Nomor WhatsApp Super Admin dan Admin Keuangan wajib diisi agar notifikasi kuota berjalan.",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/spmb-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superAdmin: superClean,
          adminKeuangan: keuanganClean,
          adminBerkas: berkasClean,
          ketuaPanitia: ketuaClean,
          waitingDays: form.waitingDays,
        }),
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
              Notifikasi bot otomatis untuk kelancaran alur operasional SPMB, status pembayaran, dan rekap antrean.
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
          {/* Super Admin */}
          <PhoneListField
            label="1. Nomor WhatsApp Super Admin"
            required
            description="Menerima notifikasi teknis kuota kosong, alert eskalasi santri cadangan, dan ringkasan harian."
            placeholder="Contoh: 081234567890"
            phones={form.superAdmin}
            onChange={(phones) => setForm({ ...form, superAdmin: phones })}
            suggestions={staffSuggestions.superAdmin}
            allStaff={staffSuggestions.allStaff}
            accentColor="emerald"
          />

          {/* Admin Keuangan */}
          <PhoneListField
            label="2. Nomor WhatsApp Admin Keuangan"
            required
            description="Menerima alert santri yang mendekati jatuh tempo DP 50% dan permohonan dispensasi."
            placeholder="Contoh: 081298765432"
            phones={form.adminKeuangan}
            onChange={(phones) => setForm({ ...form, adminKeuangan: phones })}
            suggestions={staffSuggestions.adminKeuangan}
            allStaff={staffSuggestions.allStaff}
            accentColor="emerald"
          />

          {/* Admin Berkas */}
          <PhoneListField
            label="3. Nomor WhatsApp Admin Berkas"
            optional
            description="Menerima pengingat rekap antrean berkas santri yang menunggu verifikasi atau perbaikan berkas."
            placeholder="Boleh dikosongkan jika tidak diperlukan"
            phones={form.adminBerkas}
            onChange={(phones) => setForm({ ...form, adminBerkas: phones })}
            suggestions={staffSuggestions.adminBerkas}
            allStaff={staffSuggestions.allStaff}
            accentColor="emerald"
          />

          {/* Ketua Panitia / Mudir */}
          <PhoneListField
            label="4. Nomor WhatsApp Ketua Panitia / Mudir"
            optional
            description="Hanya menerima rekap progres kuota harian (tanpa pesan teknis)."
            placeholder="Boleh dikosongkan jika tidak diperlukan"
            phones={form.ketuaPanitia}
            onChange={(phones) => setForm({ ...form, ketuaPanitia: phones })}
            suggestions={staffSuggestions.ketuaPanitia}
            allStaff={staffSuggestions.allStaff}
            accentColor="emerald"
          />
        </div>

        {/* Batas Hari Evaluasi Cadangan */}
        <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80">
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
              className="w-24 px-3 py-2 text-xs font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center"
            />
            <span className="text-xs text-stone-700 font-bold">Hari Kerja (Default: 14)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Format nomor diawali 08... atau 628... Klik tombol <strong>+ Tambah Nomor</strong> jika ada lebih dari 1 personil.</span>
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
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs overflow-y-auto p-4 flex items-center justify-center overscroll-contain animate-in fade-in duration-150"
          onClick={() => setPreviewText(null)}
        >
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto overflow-hidden border border-stone-200 flex flex-col max-h-[85vh] sm:max-h-[88vh] overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50">
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
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-5 bg-stone-100 touch-pan-y"
            >
              <pre className="text-xs font-mono whitespace-pre-wrap bg-white p-4 rounded-xl border border-stone-200 text-stone-800 shadow-2xs leading-relaxed">
                {previewText}
              </pre>
            </div>
            <div className="shrink-0 px-5 py-2.5 bg-white border-t border-stone-100 text-right">
              <button
                type="button"
                onClick={() => setPreviewText(null)}
                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg transition cursor-pointer"
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
