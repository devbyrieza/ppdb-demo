"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Loader2,
  Save,
  X,
  PhoneCall,
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
  accentColor = "amber",
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
      // Hapus jika sudah ada (toggle off)
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
    <div className="space-y-1.5 bg-stone-50/70 p-3.5 sm:p-4 rounded-2xl border border-stone-200/80">
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

      <p className="text-[11px] text-stone-500 leading-relaxed">{description}</p>

      {/* Input Rows */}
      <div className="space-y-2 mt-2">
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

              {/* Tag Kepemilikan User Manajemen */}
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

      {/* Tombol Tambah Manual */}
      <div className="pt-1">
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
        <div className="pt-2.5 border-t border-stone-200/70 mt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
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
    </div>
  );
}

export default function SpmbRecipientBanner({ role }: { role?: string }) {
  const isSuper =
    role === "admin_super" || role === "head_of_it" || role === "superadmin";

  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    superAdmin: [""] as string[],
    adminKeuangan: [""] as string[],
    adminBerkas: [""] as string[],
    ketuaPanitia: [""] as string[],
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

  const parseToArray = (raw?: string | null): string[] => {
    if (!raw) return [""];
    const arr = raw
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : [""];
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/spmb-recipients");
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(Boolean(data.isConfigured));
        setForm({
          superAdmin: parseToArray(data.raw?.superAdmin),
          adminKeuangan: parseToArray(data.raw?.adminKeuangan),
          adminBerkas: parseToArray(data.raw?.adminBerkas),
          ketuaPanitia: parseToArray(data.raw?.ketuaPanitia),
          waitingDays: data.waitingDays || 14,
        });

        if (data.staffSuggestions) {
          setStaffSuggestions(data.staffSuggestions);
        }
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

  // Lock scroll background saat popup modal terbuka (termasuk Lenis smooth-scroll)
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  // Hanya relevan untuk Admin Super / Head of IT
  if (!isSuper || loading) return null;

  // JIKA SUDAH DIATUR → HIGHLIGHT HILANG TOTAL (Return null)
  if (isConfigured && !showModal) {
    return null;
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const superClean = form.superAdmin.map((s) => s.trim()).filter(Boolean).join(", ");
    const keuanganClean = form.adminKeuangan.map((s) => s.trim()).filter(Boolean).join(", ");
    const berkasClean = form.adminBerkas.map((s) => s.trim()).filter(Boolean).join(", ");
    const ketuaClean = form.ketuaPanitia.map((s) => s.trim()).filter(Boolean).join(", ");

    if (!keuanganClean || !superClean) {
      Swal.fire({
        icon: "warning",
        title: "Nomor Wajib Belum Diisi",
        text: "Nomor WhatsApp Super Admin dan Admin Keuangan wajib diisi agar notifikasi berjalan.",
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
                    Nomor WhatsApp Penanggung Jawab Belum Diatur
                  </h4>
                </div>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed max-w-2xl">
                  Untuk kelancaran notifikasi bot pengingat alur operasional, sistem memerlukan nomor WhatsApp <strong>Admin Super</strong> dan <strong>Admin Keuangan</strong>.
                  Silakan atur nomor WhatsApp agar alur otomatisasi berjalan lancar dan terpantau.
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
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center overscroll-contain animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-auto border border-stone-200 flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal (Pinned / Sticky) */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Atur Nomor WhatsApp Penanggung Jawab
                  </h3>
                  <p className="text-xs text-stone-500">
                    Untuk kelancaran notifikasi bot pengingat alur operasional SPMB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 flex items-center justify-center transition cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <form
              id="spmb-recipient-form"
              onSubmit={handleSave}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-5 sm:p-6 space-y-4 touch-pan-y"
            >
              {/* 1. Super Admin */}
              <PhoneListField
                label="1. Nomor WhatsApp Super Admin"
                required
                description="Menerima notifikasi teknis sistem, laporan eskalasi kuota kosong, dan audit log."
                placeholder="Contoh: 081234567890"
                phones={form.superAdmin}
                onChange={(phones) => setForm({ ...form, superAdmin: phones })}
                suggestions={staffSuggestions.superAdmin}
                allStaff={staffSuggestions.allStaff}
                accentColor="amber"
              />

              {/* 2. Admin Keuangan */}
              <PhoneListField
                label="2. Nomor WhatsApp Admin Keuangan"
                required
                description="Menerima alert santri yang mendekati jatuh tempo DP 50% dan permohonan dispensasi."
                placeholder="Contoh: 081298765432"
                phones={form.adminKeuangan}
                onChange={(phones) => setForm({ ...form, adminKeuangan: phones })}
                suggestions={staffSuggestions.adminKeuangan}
                allStaff={staffSuggestions.allStaff}
                accentColor="amber"
              />

              {/* 3. Admin Berkas */}
              <PhoneListField
                label="3. Nomor WhatsApp Admin Berkas"
                optional
                description="Menerima pengingat rekap antrean berkas santri yang menunggu verifikasi atau perbaikan berkas."
                placeholder="Boleh dikosongkan jika tidak diperlukan"
                phones={form.adminBerkas}
                onChange={(phones) => setForm({ ...form, adminBerkas: phones })}
                suggestions={staffSuggestions.adminBerkas}
                allStaff={staffSuggestions.allStaff}
                accentColor="amber"
              />

              {/* 4. Ketua Panitia / Mudir */}
              <PhoneListField
                label="4. Nomor WhatsApp Ketua Panitia / Mudir"
                optional
                description="Hanya menerima rekap progres kuota harian (tanpa pesan teknis)."
                placeholder="Boleh dikosongkan jika tidak diperlukan"
                phones={form.ketuaPanitia}
                onChange={(phones) => setForm({ ...form, ketuaPanitia: phones })}
                suggestions={staffSuggestions.ketuaPanitia}
                allStaff={staffSuggestions.allStaff}
                accentColor="amber"
              />

              {/* 5. Batas Waktu Evaluasi Cadangan */}
              <div className="bg-stone-50/70 p-3.5 sm:p-4 rounded-2xl border border-stone-200/80">
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-1">
                  Batas Hari Evaluasi Santri Cadangan (Default: 14 Hari)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Durasi masa tunggu evaluasi kuota cadangan yang tampil transparan di portal pendaftar.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={form.waitingDays}
                    onChange={(e) =>
                      setForm({ ...form, waitingDays: parseInt(e.target.value, 10) || 14 })
                    }
                    className="w-24 px-3 py-2 text-xs font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center"
                  />
                  <span className="text-xs text-stone-600 font-semibold">Hari Kerja</span>
                </div>
              </div>
            </form>

            {/* Footer Modal (Pinned / Sticky) */}
            <div className="shrink-0 flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-stone-100 bg-stone-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-200/60 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="spmb-recipient-form"
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
          </div>
        </div>
      )}
    </>
  );
}
