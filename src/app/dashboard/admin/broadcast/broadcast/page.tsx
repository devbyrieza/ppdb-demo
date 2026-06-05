"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Pendaftar {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  no_hp: string | null;
  status_pendaftaran: string;
  jenjang: string;
}

export default function BroadcastPage() {
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [header, setHeader] = useState("Assalamu'alaikum");
  const [message, setMessage] = useState("");
  const [footer, setFooter] = useState("Panitia PPDB Al Imam");
  const [includeName, setIncludeName] = useState(true);

  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchPendaftar();
  }, []);

  const fetchPendaftar = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pendaftar/list?limit=1000"); // Get more for broadcast
      if (res.ok) {
        const data = await res.json();
        setPendaftar(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPendaftar = pendaftar.filter(
    (p) =>
      p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      p.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPendaftar.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPendaftar.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSendBroadcast = async () => {
    if (selectedIds.length === 0 || !message) return;

    const result = await Swal.fire({
      title: "Kirim Broadcast?",
      text: `Kirim pesan ke ${selectedIds.length} penerima?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c", // Maroon/Red 700
      cancelButtonColor: "#57534e", // Stone 600
      confirmButtonText: "Ya, Kirim Sekarang",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setSending(true);
      setResults(null);
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          message,
          header,
          footer,
          includeName,
        }),
      });

      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      Swal.fire(
        "Error",
        "Gagal mengirim broadcast. Silakan periksa koneksi atau logs.",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const previewMessage = (name: string) => {
    const h = header ? `${header}\n\n` : "";
    const s = includeName ? `${toTitleCase(name)}, ` : "";
    const f = footer ? `\n\n${footer}` : "";
    return `${h}${s}${message}${f}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-clay-lg p-5 md:p-8 border border-white/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative flex items-center gap-6">
          <div className="p-4 bg-gradient-to-br from-primary-600 to-emerald-600 rounded-2xl shadow-lg shadow-primary-600/20">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">
              Broadcast <span className="text-primary-700">WhatsApp</span>
            </h1>
            <p className="text-ink-500 font-medium">
              Kirim pesan massal ke pendaftar dengan mudah.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recipient Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-clay-md border border-white/40 overflow-hidden flex flex-col h-[700px]">
            <div className="p-6 border-b border-ink-100 flex items-center justify-between bg-secondary-50/50">
              <h2 className="font-bold text-ink-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-700" />
                Pilih Penerima ({selectedIds.length})
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Cari pendaftar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-ink-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">Memuat data...</p>
                </div>
              ) : filteredPendaftar.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-400">
                  <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm font-medium">
                    Tidak ada pendaftar ditemukan
                  </p>
                </div>
              ) : (
                filteredPendaftar.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedIds.includes(p.id)
                        ? "bg-primary-50 border-primary-200"
                        : "bg-white border-transparent hover:bg-secondary-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => handleSelectOne(p.id)}
                      className="w-5 h-5 rounded-lg border-2 border-ink-200 text-primary-700 focus:ring-primary-600/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink-900 truncate">
                        {toTitleCase(p.nama_lengkap)}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                        <span className="font-mono">{p.nomor_pendaftaran}</span>
                        <span>•</span>
                        <span>{p.no_hp || "Tanpa No. HP"}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-secondary-200 rounded-full">
                          {p.status_pendaftaran}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="p-4 bg-secondary-50 border-t border-ink-100 flex items-center justify-between">
              <button
                onClick={handleSelectAll}
                className="text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors"
              >
                {selectedIds.length === filteredPendaftar.length
                  ? "Batalkan Semua"
                  : "Pilih Semua Terlihat"}
              </button>
              <div className="text-xs font-medium text-ink-400">
                {selectedIds.length} Terpilih dari {filteredPendaftar.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Message Composer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-clay-md border border-white/40 p-6 space-y-6 sticky top-28">
            <h2 className="font-bold text-ink-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary-700" />
              Tulis Pesan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">
                  Header (Opsional)
                </label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="Contoh: Assalamu'alaikum"
                  className="w-full bg-secondary-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="includeName"
                  checked={includeName}
                  onChange={(e) => setIncludeName(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-ink-200 text-primary-700 focus:ring-primary-600/20"
                />
                <label
                  htmlFor="includeName"
                  className="text-sm font-bold text-ink-700 cursor-pointer"
                >
                  Sertakan Nama Pendaftar
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">
                  Isi Pesan
                </label>
                <textarea
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan Anda di sini..."
                  className="w-full bg-secondary-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">
                  Footer (Opsional)
                </label>
                <input
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="Contoh: Tim PSB Al Imam"
                  className="w-full bg-secondary-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-600/10 outline-none font-medium"
                />
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-secondary-50 rounded-2xl p-4 border border-ink-100">
              <span className="text-[10px] font-black uppercase text-ink-400 tracking-widest block mb-3">
                Pratinjau Pesan (Contoh)
              </span>
              <div className="bg-white rounded-xl p-4 shadow-sm text-sm whitespace-pre-wrap font-medium text-ink-800 leading-relaxed border border-white/80">
                {previewMessage("Muhammad Al-Fatih")}
              </div>
            </div>

            <button
              onClick={handleSendBroadcast}
              disabled={sending || selectedIds.length === 0 || !message}
              className="w-full py-4 bg-gradient-to-br from-primary-600 to-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Broadcast Sekarang
                </>
              )}
            </button>

            {results && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${results.failed > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {results.failed > 0 ? (
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                )}
                <div className="text-sm font-bold">
                  Broadcast Selesai: {results.sent} Berhasil, {results.failed}{" "}
                  Gagal
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
