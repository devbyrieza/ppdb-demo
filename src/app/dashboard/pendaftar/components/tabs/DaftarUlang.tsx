"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Lock,
  History,
  MessageCircle,
} from "lucide-react";
import { Alert } from "@/components/ui";
import { formatCurrency } from "@/lib/utils"; // Ensure this utils exists or use Intl locally

export default function DaftarUlangTab() {
  const [loading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState<any>(null);
  const [historyResult, setHistoryResult] = useState<any[]>([]);

  // Form states
  const [nominal, setNominal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pernyataan, setPernyataan] = useState(false);
  const [keringananReason, setKeringananReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [cicilanKe, setCicilanKe] = useState("1");
  const [totalPaid, setTotalPaid] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Get User Status
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      const statusRes = await fetch(
        `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`,
      );
      const statusData = await statusRes.json();
      setDataUser(statusData);

      // 2. Get Payment History (Daftar Ulang only)
      const historyRes = await fetch(`/api/pembayaran/history?jenis=DAFTAR_ULANG`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        const verifiedPayments = historyData.data.filter((p: any) => p.status_pembayaran === "verified");
        const total = verifiedPayments.reduce((acc: number, p: any) => acc + Number(p.jumlah), 0);
        setTotalPaid(total);
        setPaymentHistory(historyData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTipe = (amount: number) => {
    if (amount >= 9800000) return "LUNAS";
    if (amount >= 4900000) return "CICILAN 50% ATAU LEBIH";
    return "CICILAN DIBAWAH 50%";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pernyataan || !file || !nominal) return;

    const amount = parseInt(nominal.replace(/\D/g, ""));
    if (amount < 4900000 && !keringananReason.trim()) {
      setMessage({
        type: "error",
        text: "Untuk pembayaran di bawah 50%, Anda wajib mengisi alasan/permohonan keringanan pada kolom yang tersedia.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jenis_pembayaran", "DAFTAR_ULANG");
    formData.append("jumlah", amount.toString());
    formData.append("file", file);
    if (keringananReason) formData.append("keringanan_reason", keringananReason);
    if (numericNominal < 9800000) formData.append("cicilan_ke", cicilanKe);

    try {
      const res = await fetch("/api/pembayaran/manual/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload");

      setMessage({
        type: "success",
        text: "Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin.",
      });
      setFile(null);
      setNominal("");
      setPernyataan(false);
      fetchData(); // Refresh history
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Cek Status Kelulusan
  const statusKelulusan = dataUser?.hasil_kelulusan?.status;
  const isTestingAccount = dataUser?.nomor_pendaftaran === "ILI2600007";

  if (statusKelulusan !== "LULUS" && !isTestingAccount) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <div className="bg-slate-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-teal-950 mb-2">
          Belum Tersedia
        </h2>
        <p className="text-ink-500">
          Menu Daftar Ulang hanya tersedia bagi santri yang dinyatakan{" "}
          <strong>LULUS</strong> seleksi.
          <br />
          Silakan cek menu <strong>Pengumuman</strong> terlebih dahulu.
        </p>
      </div>
    );
  }

  // ENROLLED STATE (Already Paid Full 9.8M)
  const isLunas = totalPaid >= 9800000;

  if (isLunas) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">
        <div className="bg-linear-to-br from-emerald-600 to-emerald-800 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CheckCircle className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wide text-white">
              ADMINISTRASI LUNAS
            </h2>
            <p className="text-emerald-50 text-lg max-w-lg leading-relaxed font-medium">
              Alhamdulillah! Seluruh biaya Daftar Ulang Ananda telah <strong>Lunas</strong> dan diverifikasi.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-emerald-100">
           <div className="flex items-start gap-6 mb-8">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <History className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-3">
                Langkah Selanjutnya
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Selamat! Anda kini resmi tercatat sebagai Santri Baru. Silakan pantau grup WhatsApp resmi atau dashboard untuk informasi jadwal kedatangan santri.
              </p>
              <div className="flex gap-4">
                <div className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-black shadow-md uppercase tracking-wider">
                  STATUS: LUNAS & ENROLLED
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Riwayat Pembayaran Daftar Ulang
            </h4>
            <div className="space-y-3">
              {paymentHistory.filter(p => p.status_pembayaran === 'verified').map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {p.tipe_cicilan === 'LUNAS' ? 'Pelunasan' : `Cicilan ke-${p.cicilan_ke || '?'}`}
                    </p>
                    <p className="font-black text-slate-900">{formatCurrency(Number(p.jumlah))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(p.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const numericNominal = parseInt(nominal.replace(/\D/g, "") || "0");
  const tipeBayar = calculateTipe(numericNominal);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-linear-to-br from-teal-700 to-teal-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle className="w-32 h-32" />
        </div>
        <h1 className="text-3xl font-black mb-2 relative z-10">
          Daftar Ulang Santri Baru
        </h1>
        <p className="text-sand-100 relative z-10 text-lg font-medium">
          Tahap akhir administrasi penerimaan santri baru
        </p>
      </div>

      {/* Info Tagihan */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-teal-100 shadow-sm">
          <h3 className="text-sm font-black text-teal-900 uppercase tracking-wider mb-2">
            Total Biaya Masuk
          </h3>
          <div className="text-3xl font-black text-teal-600">
            Rp 9.800.000
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Uang Pangkal Pesantren PPDB
          </p>
        </div>

        <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
          <h3 className="text-sm font-black text-teal-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Info Pembayaran
          </h3>
          <ul className="text-sm text-teal-700 space-y-1 list-disc list-inside font-medium">
            <li>
              Transfer ke Rekening <strong>BSI 7171717171</strong>
            </li>
            <li>
              a.n <strong>PP Pesantren Al Fath</strong>
            </li>
            <li>
              Wajib bayar cicilan pertama min.{" "}
              <strong>Rp 4.900.000 (50%)</strong>
            </li>
            <li>
              Pelunasan maksimal bulan <strong>Juli 2026</strong> (3x Cicilan)
            </li>
            <li className="text-emerald-700 font-bold">
              Tersedia kebijakan <strong>Keringanan Khusus</strong> bagi wali santri yang membutuhkan.
            </li>
          </ul>
          <div className="pt-3 mt-3 border-t border-teal-200/50">
            <span className="text-xs text-teal-800 block mb-2 leading-tight font-medium">
              Butuh bantuan, keringanan, atau konfirmasi biaya?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/6285111524441?text=Assalamualaikum%20Admin%20Finance%2C%20saya%20wali%20dari%20calon%20santri%20ingin%20berkonsultasi%2Fmengajukan%20keringanan%20terkait%20biaya%20Daftar%20Ulang."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] sm:text-xs transition-all shadow-md hover:shadow-lg active:scale-95 group"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Finance</span>
              </a>
              <a
                href="https://wa.me/6281285300800?text=Assalamualaikum%20Admin%20CS%2C%20saya%20wali%20dari%20calon%20santri%20ingin%20bertanya%20terkait%20biaya%20Daftar%20Ulang."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-[11px] sm:text-xs transition-all shadow-md hover:shadow-lg active:scale-95 group"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Admin CS</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <Alert
          type={message.type}
          title={message.type === "success" ? "Berhasil" : "Gagal"}
        >
          {message.text}
        </Alert>
      )}

      {message && message.type === "success" && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h4 className="font-black text-emerald-900 mb-1 text-base">
              Ingin Verifikasi Lebih Cepat?
            </h4>
            <p className="text-emerald-700 text-sm leading-relaxed">
              Anda bisa menghubungi CS di nomor{" "}
              <a
                href="https://wa.me/6285111524441"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black underline hover:text-emerald-900 transition-colors"
              >
                0851-1152-4441
              </a>{" "}
              jika ingin cepat diverifikasi.
            </p>
          </div>
        </div>
      )}

      {/* Form Upload */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-ink-100 bg-surface-50 flex justify-between items-center">
          <h3 className="font-black text-lg text-ink-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Form Pembayaran & Konfirmasi
          </h3>
          {/* Badge Status Pembayaran User bisa ditaruh sini jika fetch history */}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Opsi Pembayaran Langsung */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Metode Pelunasan Daftar Ulang
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setNominal(new Intl.NumberFormat("id-ID").format(9800000))
                }
                className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                  numericNominal === 9800000
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-md"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-black text-slate-900">
                    Bayar Lunas
                  </span>
                  {numericNominal === 9800000 ? (
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Pelunasan sekaligus seluruh biaya administrasi.
                </span>
                <span className="text-sm font-black text-teal-600 mt-2">
                  Rp 9.800.000
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setNominal(new Intl.NumberFormat("id-ID").format(4900000))
                }
                className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                  numericNominal >= 4900000 && numericNominal < 9800000
                    ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-md"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-black text-slate-900">
                    Bayar Dicicil
                  </span>
                  {numericNominal >= 4900000 && numericNominal < 9800000 ? (
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Pembayaran bertahap minimal 50% di awal.
                </span>
                <span className="text-sm font-black text-teal-600 mt-2">
                  Min. Rp 4.900.000
                </span>
              </button>
            </div>
          </div>

          {/* Input Cicilan Ke (Hanya jika dicicil) */}
          {numericNominal > 0 && numericNominal < 9800000 && (
            <div className="pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ini adalah Pembayaran Cicilan ke-
              </label>
              <div className="relative w-32">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={cicilanKe}
                  onChange={(e) => setCicilanKe(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Input Nominal */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nominal yang Dibayarkan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                Rp
              </span>
              <input
                type="text"
                value={nominal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNominal(
                    new Intl.NumberFormat("id-ID").format(parseInt(val || "0")),
                  );
                }}
                className="w-full pl-12 pr-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-inner"
                placeholder="0"
              />
            </div>

            {/* Dynamic Status Badge */}
            {numericNominal > 0 && (
              <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="text-xs text-ink-500 font-medium">
                  Status Pembayaran Anda akan tercatat sebagai:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    tipeBayar === "LUNAS"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : tipeBayar.includes("50% ATAU LEBIH")
                        ? "bg-teal-100 text-teal-700 border-teal-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  {tipeBayar}
                </span>
              </div>
            )}

            {/* Input Alasan Keringanan */}
            {numericNominal > 0 && tipeBayar === "CICILAN DIBAWAH 50%" && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-black text-xs uppercase tracking-wider">
                    Permohonan Keringanan Khusus
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Pembayaran di bawah 50% hanya diizinkan bagi wali santri yang memiliki kendala finansial mendesak. Silakan tuliskan alasan singkat Anda di bawah ini agar dapat dipertimbangkan oleh tim Finance.
                </p>
                <textarea
                  value={keringananReason}
                  onChange={(e) => setKeringananReason(e.target.value)}
                  placeholder="Contoh: Sedang ada musibah keluarga, mohon keringanan cicilan pertama 1jt dulu..."
                  className="w-full p-3 text-xs border border-amber-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white font-medium min-h-[80px]"
                  required
                />
              </div>
            )}
          </div>

          {/* Upload File */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Upload Bukti Transfer
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-teal-600" />
                    <span className="font-black text-teal-700">
                      {file.name}
                    </span>
                    <span className="text-xs text-ink-400">
                      Klik untuk ganti file
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-8 h-8 text-slate-400" />
                    <span className="font-medium text-slate-600">
                      Klik atau tarik file ke sini
                    </span>
                    <span className="text-xs text-slate-400">
                      Format: JPG, PNG, PDF (Max 5MB)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pernyataan */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={pernyataan}
              onChange={(e) => setPernyataan(e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded border-ink-300 focus:ring-teal-500"
            />
            <div className="text-sm text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">
                Konfirmasi Kebenaran Data
              </span>
              Saya menyatakan bukti transfer yang saya unggah adalah benar dan
              nominal sesuai dengan yang saya inputkan. Saya bersedia mengikuti
              aturan pembayaran yang berlaku.
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting || !pernyataan || !file || !nominal}
            className="w-full py-4 bg-sand-400 hover:bg-sand-300 text-teal-950 font-black rounded-xl shadow-xl shadow-sand-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-sand-500"
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? "Mengirim Data..." : "Kirim Konfirmasi Daftar Ulang"}
          </button>
        </form>
      </div>
    </div>
  );
}
