"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  History,
  Copy,
  Building2,
  CreditCard as CreditCardIcon,
  MessageCircle,
  Banknote,
  BookOpen,
} from "lucide-react";
import { Alert } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function DaftarUlangTab() {
  const [loading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  // Tab state: "uang_pangkal" = DAFTAR_ULANG, "spp" = SPP
  const [subTab, setSubTab] = useState<"uang_pangkal" | "spp">("uang_pangkal");

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
  const [totalDaftarUlangPaid, setTotalDaftarUlangPaid] = useState(0);
  const [totalSppPaid, setTotalSppPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "va">("transfer");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update cicilanKe when subTab or history changes
  useEffect(() => {
    const activeTabType = subTab === "uang_pangkal" ? "DAFTAR_ULANG" : "SPP";
    const activeTabPayments = paymentHistory.filter(
      (p: any) => p.jenis_pembayaran === activeTabType
    );
    const activeCount = activeTabPayments.filter(
      (p: any) => p.status_pembayaran !== "rejected"
    ).length;
    setCicilanKe((activeCount + 1).toString());
    // Reset form state when switching tabs
    setNominal("");
    setFile(null);
    setPernyataan(false);
    setKeringananReason("");
    setMessage(null);
  }, [subTab, paymentHistory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      const statusRes = await fetch(
        `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`
      );
      const statusData = await statusRes.json();
      setDataUser(statusData);

      const historyRes = await fetch(`/api/pembayaran/history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        const payments = historyData.data || [];
        const verifiedDU = payments.filter(
          (p: any) =>
            p.jenis_pembayaran === "DAFTAR_ULANG" &&
            p.status_pembayaran === "verified"
        );
        const verifiedSPP = payments.filter(
          (p: any) =>
            p.jenis_pembayaran === "SPP" &&
            p.status_pembayaran === "verified"
        );
        setTotalDaftarUlangPaid(
          verifiedDU.reduce((acc: number, p: any) => acc + Number(p.jumlah), 0)
        );
        setTotalSppPaid(
          verifiedSPP.reduce((acc: number, p: any) => acc + Number(p.jumlah), 0)
        );
        setPaymentHistory(payments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Parse keringanan dari data_lengkap
  let dataLengkap = dataUser?.data_lengkap;
  if (typeof dataLengkap === "string") {
    try {
      dataLengkap = JSON.parse(dataLengkap);
    } catch (e) {}
  }
  const keringanan = dataLengkap?.keringanan_daftar_ulang;
  const potonganUP =
    keringanan?.potongan_uang_pangkal ?? keringanan?.nominal_potongan ?? 0;
  const potonganSPP =
    keringanan?.potongan_spp ?? 0;

  const expectedUangPangkal = 7500000 - potonganUP;
  const expectedSpp = 1000000 - potonganSPP;
  const expectedTagihan =
    subTab === "uang_pangkal" ? expectedUangPangkal : expectedSpp;
  const totalPaid =
    subTab === "uang_pangkal" ? totalDaftarUlangPaid : totalSppPaid;
  const halfTagihan = expectedTagihan / 2;

  const numericNominal = parseInt(nominal.replace(/\D/g, "") || "0");
  const isLunas =
    subTab === "uang_pangkal"
      ? totalDaftarUlangPaid + numericNominal >= expectedUangPangkal
      : totalSppPaid + numericNominal >= expectedSpp;

  let tipeBayar = "";
  if (numericNominal > 0) {
    if (isLunas) {
      tipeBayar = "LUNAS";
    } else if (numericNominal >= halfTagihan) {
      tipeBayar = "CICILAN 50% ATAU LEBIH";
    } else {
      tipeBayar = "CICILAN DIBAWAH 50%";
    }
  }

  const activeTabType = subTab === "uang_pangkal" ? "DAFTAR_ULANG" : "SPP";
  const activeTabPayments = paymentHistory.filter(
    (p: any) => p.jenis_pembayaran === activeTabType
  );
  const hasExistingVerifiedPayment = activeTabPayments.some(
    (p: any) => p.status_pembayaran === "verified"
  );
  const isTabLunas = totalPaid >= expectedTagihan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !nominal || !pernyataan) return;
    if (tipeBayar === "CICILAN DIBAWAH 50%" && !keringananReason.trim()) {
      setMessage({ type: "error", text: "Harap isi alasan keringanan." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jumlah", String(numericNominal));
      formData.append("jenis_pembayaran", activeTabType);
      formData.append("cicilan_ke", cicilanKe);
      if (keringananReason.trim()) {
        formData.append("keringanan_reason", keringananReason);
      }

      const res = await fetch("/api/pembayaran/manual/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Bukti pembayaran berhasil diupload! Tim kami akan memverifikasi dalam 1x24 jam.",
        });
        setNominal("");
        setFile(null);
        setPernyataan(false);
        setKeringananReason("");
        fetchData();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Terjadi kesalahan saat upload.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal mengirim data. Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-linear-to-br from-primary-700 to-primary-900 rounded-2xl p-5 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle className="w-32 h-32" />
        </div>
        <h1 className="text-3xl font-black mb-2 relative z-10 text-white">
          Daftar Ulang Santri Baru
        </h1>
        <p className="text-gold-100 relative z-10 text-lg font-medium">
          Tahap akhir administrasi penerimaan santri baru
        </p>
      </div>

      {/* Sub-Tab Switcher: Uang Pangkal / SPP */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Pilih Jenis Pembayaran Daftar Ulang
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tab: Uang Pangkal */}
          <button
            type="button"
            onClick={() => setSubTab("uang_pangkal")}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
              subTab === "uang_pangkal"
                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            {totalDaftarUlangPaid >= expectedUangPangkal && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                ✓ LUNAS
              </span>
            )}
            <Building2
              className={`w-6 h-6 ${subTab === "uang_pangkal" ? "text-primary-600" : "text-slate-400"}`}
            />
            <div>
              <p
                className={`font-black text-sm ${subTab === "uang_pangkal" ? "text-primary-900" : "text-slate-600"}`}
              >
                Uang Pangkal
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                (Biaya Masuk)
              </p>
            </div>
            <span
              className={`text-sm font-black ${subTab === "uang_pangkal" ? "text-primary-700" : "text-slate-500"}`}
            >
              {formatCurrency(expectedUangPangkal)}
            </span>
            {potonganUP > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold ml-2">
                Potongan {formatCurrency(potonganUP)}
              </span>
            )}
          </button>

          {/* Tab: SPP Bulan Pertama */}
          <button
            type="button"
            onClick={() => setSubTab("spp")}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
              subTab === "spp"
                ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/20"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            {totalSppPaid >= expectedSpp && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                ✓ LUNAS
              </span>
            )}
            <BookOpen
              className={`w-6 h-6 ${subTab === "spp" ? "text-violet-600" : "text-slate-400"}`}
            />
            <div>
              <p
                className={`font-black text-sm ${subTab === "spp" ? "text-violet-900" : "text-slate-600"}`}
              >
                SPP Bulan Pertama
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                (Biaya Bulanan)
              </p>
            </div>
            <span
              className={`text-sm font-black ${subTab === "spp" ? "text-violet-700" : "text-slate-500"}`}
            >
              {formatCurrency(expectedSpp)}
            </span>
          </button>
        </div>
      </div>

      {/* Dashboard Status (per-tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Status{" "}
            {subTab === "uang_pangkal" ? "Uang Pangkal" : "SPP Bulan Pertama"}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black border ${
                isTabLunas
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : totalPaid > 0
                  ? "bg-primary-100 text-primary-700 border-primary-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isTabLunas ? "✓ LUNAS" : totalPaid > 0 ? "CICILAN AKTIF" : "BELUM BAYAR"}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Sudah Dibayarkan
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(totalPaid)}
          </span>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Total Tagihan: {formatCurrency(expectedTagihan)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
            Sisa Tagihan
          </span>
          <span className="text-2xl font-black text-rose-600 mt-2">
            {formatCurrency(Math.max(0, expectedTagihan - totalPaid))}
          </span>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Wajib lunas sebelum Juli 2026
          </p>
        </div>
      </div>

      {/* Riwayat Pembayaran (filter per tab) */}
      {activeTabPayments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-base">
            <History className="w-5 h-5 text-slate-400" />
            Riwayat Pembayaran{" "}
            {subTab === "uang_pangkal" ? "Uang Pangkal" : "SPP Bulan Pertama"}
          </h3>
          <div className="space-y-3">
            {activeTabPayments.map((p, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {p.jumlah >= expectedTagihan
                        ? "Pelunasan"
                        : `Cicilan ke-${p.cicilan_ke || "?"}`}
                    </p>
                    {p.keringanan_reason && (
                      <span className="text-[9px] bg-secondary-100 text-secondary-700 border border-secondary-200 px-1.5 py-0.5 rounded-full font-black">
                        Keringanan
                      </span>
                    )}
                  </div>
                  <p className="font-black text-slate-900 text-lg mt-0.5">
                    {formatCurrency(Number(p.jumlah))}
                  </p>
                  {p.catatan && p.status_pembayaran === "rejected" && (
                    <p className="text-xs text-rose-600 mt-1 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100">
                      Alasan Ditolak: {p.catatan}
                    </p>
                  )}
                </div>
                <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-1">
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(p.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      p.status_pembayaran === "verified"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : p.status_pembayaran === "rejected"
                        ? "bg-rose-100 text-rose-700 border-rose-200"
                        : "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                    }`}
                  >
                    {p.status_pembayaran === "verified"
                      ? "✓ Verified"
                      : p.status_pembayaran === "rejected"
                      ? "✗ Ditolak"
                      : "⏰ Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Tagihan & Rekening */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-primary-900 uppercase tracking-wider mb-2">
              {subTab === "uang_pangkal" ? "Uang Pangkal (Biaya Masuk)" : "SPP Bulan Pertama"}
            </h3>
            <div className="text-3xl font-black text-primary-600">
              {formatCurrency(expectedTagihan)}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Uang Pangkal Normal:</span>
              <span className="font-bold text-ink-800">Rp 7.500.000</span>
            </div>
            {potonganUP > 0 && (
              <div className="flex justify-between items-center text-sm text-emerald-600">
                <span>Potongan Keringanan:</span>
                <span className="font-bold">- {formatCurrency(potonganUP)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
              <span className="text-ink-500">SPP Bulan Pertama:</span>
              <span className="font-bold text-ink-800">Rp 1.000.000</span>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-primary-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Info Pembayaran & Metode
            </h3>

            {/* Opsi Metode Pembayaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 bg-white p-1 rounded-xl shadow-sm border border-primary-100">
              <button
                onClick={() => setPaymentMethod("transfer")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === "transfer"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-4 h-4" /> Transfer Bank
              </button>
              <div className="py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 bg-slate-50 border border-slate-100 text-slate-400 opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-1.5">
                  <CreditCardIcon className="w-4 h-4" /> Virtual Account
                </div>
                <span className="text-[9px] bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded-full leading-none mt-0.5">
                  Segera Hadir
                </span>
              </div>
            </div>

            {paymentMethod === "transfer" && (
              <div className="mb-4 p-3 bg-white border border-primary-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 text-left">
                      Rekening Tujuan
                    </p>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="bg-[#009B9B] px-2 py-1 rounded text-[10px] text-white font-black leading-none flex items-center justify-center shadow-sm">
                        BSI
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Bank Syariah Indonesia
                      </span>
                    </div>
                    <p className="font-black text-primary-950 text-2xl tracking-tight leading-none mb-2">
                      4222224441
                    </p>
                    <p className="text-xs font-bold text-primary-700/70 text-left italic">
                      a.n PP Al Andalus Al Imam
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy("4222224441")}
                    className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors flex flex-col items-center gap-1 group"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[9px] font-bold">
                      {copied ? "Tersalin!" : "Salin"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <ul className="text-sm text-primary-700 space-y-1.5 list-disc list-inside font-medium mb-4">
              <li>
                Uang Pangkal dapat dibayar <strong>Lunas</strong> atau{" "}
                <strong>Dicicil</strong>.
              </li>
              {subTab === "uang_pangkal" && (
                <li>
                  Cicil tahap pertama minimal{" "}
                  <strong>50% ({formatCurrency(halfTagihan)})</strong>.
                </li>
              )}
              <li>
                SPP bulan pertama wajib lunas{" "}
                <strong>sebelum Juli 2026</strong>.
              </li>
              <li className="text-emerald-700 font-bold">
                Tersedia kebijakan <strong>Keringanan Khusus</strong> bagi wali
                santri yang membutuhkan.
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-primary-200">
            <span className="text-xs text-primary-600 block mb-2 leading-tight">
              Butuh bantuan, keringanan, atau konfirmasi biaya?
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <a
                href="https://wa.me/6281220636945?text=Assalamualaikum%20Admin%20Finance%2C%20saya%20wali%20dari%20calon%20santri%20ingin%20berkonsultasi%2Fmengajukan%20keringanan%20terkait%20biaya%20Daftar%20Ulang."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] sm:text-xs transition-all shadow-md hover:shadow-lg active:scale-95 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>Finance</span>
              </a>
              <a
                href="https://wa.me/6285111524441?text=Assalamualaikum%20Admin%20CS%2C%20saya%20wali%20dari%20calon%20santri%20ingin%20bertanya%20terkait%20biaya%20Daftar%20Ulang."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-[11px] sm:text-xs transition-all shadow-md hover:shadow-lg active:scale-95 group"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Admin CS</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
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
              Hubungi CS di nomor{" "}
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

      {/* Form Upload — Sembunyikan jika tab sudah LUNAS */}
      {isTabLunas ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-black text-emerald-900 text-xl mb-2">
            {subTab === "uang_pangkal" ? "Uang Pangkal" : "SPP Bulan Pertama"}{" "}
            Sudah Lunas!
          </h3>
          <p className="text-emerald-700 text-sm font-medium">
            Pembayaran{" "}
            {subTab === "uang_pangkal" ? "uang pangkal" : "SPP bulan pertama"}{" "}
            Anda sudah terverifikasi dan dinyatakan lunas.
          </p>
          {subTab === "uang_pangkal" && totalSppPaid < expectedSpp && (
            <button
              type="button"
              onClick={() => setSubTab("spp")}
              className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Lanjut ke Pembayaran SPP
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div
            className={`p-6 border-b border-ink-100 flex justify-between items-center ${
              subTab === "uang_pangkal" ? "bg-primary-50" : "bg-violet-50"
            }`}
          >
            <h3
              className={`font-black text-lg flex items-center gap-2 ${
                subTab === "uang_pangkal"
                  ? "text-primary-900"
                  : "text-violet-900"
              }`}
            >
              {subTab === "uang_pangkal" ? (
                <Banknote className="w-5 h-5 text-primary-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-violet-600" />
              )}
              Upload Bukti{" "}
              {subTab === "uang_pangkal"
                ? "Uang Pangkal (Biaya Masuk)"
                : "SPP Bulan Pertama"}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Quick Pick Nominal */}
            {subTab === "uang_pangkal" && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Metode Pelunasan Uang Pangkal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNominal(
                        new Intl.NumberFormat("id-ID").format(expectedTagihan)
                      )
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                      numericNominal === expectedTagihan
                        ? "border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-md"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-black text-slate-900">
                        Bayar Lunas
                      </span>
                      {numericNominal === expectedTagihan ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Pelunasan sekaligus seluruh biaya masuk.
                    </span>
                    <span className="text-sm font-black text-primary-600 mt-2">
                      {formatCurrency(expectedTagihan)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNominal(
                        new Intl.NumberFormat("id-ID").format(halfTagihan)
                      )
                    }
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col ${
                      numericNominal >= halfTagihan &&
                      numericNominal < expectedTagihan
                        ? "border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20 shadow-md"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-black text-slate-900">
                        Bayar Dicicil
                      </span>
                      {numericNominal >= halfTagihan &&
                      numericNominal < expectedTagihan ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Pembayaran bertahap minimal 50%.
                    </span>
                    <span className="text-sm font-black text-primary-600 mt-2">
                      Min. {formatCurrency(halfTagihan)}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Input Cicilan Ke (khusus Uang Pangkal dicicil) */}
            {subTab === "uang_pangkal" &&
              numericNominal > 0 &&
              numericNominal < expectedTagihan && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ini adalah Pembayaran Cicilan ke-
                  </label>
                  <div className="relative w-32">
                    <input
                      type="text"
                      readOnly
                      value={cicilanKe}
                      className="w-full px-4 py-3 text-lg font-black text-primary-700 border border-primary-200 bg-primary-50 rounded-xl focus:outline-none shadow-inner text-center"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
                      * Otomatis dihitung sistem
                    </p>
                  </div>
                </div>
              )}

            {/* Input Nominal */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nominal yang Dibayarkan (Rp){" "}
                {subTab === "spp" && (
                  <span className="text-violet-600 font-bold">
                    — SPP Bulan Pertama
                  </span>
                )}
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
                      new Intl.NumberFormat("id-ID").format(
                        parseInt(val || "0")
                      )
                    );
                  }}
                  className="w-full pl-12 pr-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-inner"
                  placeholder="0"
                />
              </div>

              {/* Status Badge Dinamis */}
              {numericNominal > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-ink-500 font-medium">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border ${
                      tipeBayar === "LUNAS"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : tipeBayar.includes("50% ATAU LEBIH")
                        ? "bg-primary-100 text-primary-700 border-primary-200"
                        : "bg-secondary-100 text-secondary-700 border-secondary-200"
                    }`}
                  >
                    {tipeBayar}
                  </span>
                </div>
              )}

              {/* Keringanan Reason (hanya uang pangkal cicil di bawah 50%) */}
              {subTab === "uang_pangkal" &&
                numericNominal > 0 &&
                tipeBayar === "CICILAN DIBAWAH 50%" &&
                !hasExistingVerifiedPayment &&
                totalPaid < halfTagihan && (
                  <div className="mt-4 p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-secondary-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-black text-xs uppercase tracking-wider">
                        Permohonan Keringanan Khusus
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary-700 leading-relaxed font-medium">
                      Pembayaran di bawah 50% hanya diizinkan bagi wali santri
                      yang memiliki kendala finansial mendesak. Silakan tuliskan
                      alasan singkat Anda.
                    </p>
                    <textarea
                      value={keringananReason}
                      onChange={(e) => setKeringananReason(e.target.value)}
                      placeholder="Contoh: Sedang ada musibah keluarga, mohon keringanan cicilan pertama 1jt dulu..."
                      className="w-full p-3 text-xs border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all bg-white font-medium min-h-[80px]"
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
                      <FileText className="w-8 h-8 text-primary-600" />
                      <span className="font-black text-primary-700">
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
                className="mt-1 w-5 h-5 text-primary-600 rounded border-ink-300 focus:ring-primary-500"
              />
              <div className="text-sm text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">
                  Konfirmasi Kebenaran Data
                </span>
                Saya menyatakan bukti transfer yang saya unggah adalah benar
                dan nominal sesuai dengan yang saya inputkan.
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting || !pernyataan || !file || !nominal}
              className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-primary-950 font-black rounded-xl shadow-xl shadow-gold-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gold-500"
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {submitting
                ? "Mengirim Data..."
                : `Kirim Bukti ${subTab === "uang_pangkal" ? "Uang Pangkal" : "SPP Bulan Pertama"}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
