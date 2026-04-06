"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  Send,
} from "lucide-react";

interface ExamSession {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  quota: number;
  booked_count: number;
  location: string | null;
  notes: string | null;
  _count?: {
    bookings: number;
  };
}

interface Pendaftar {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  status_pendaftaran: string;
  tahun_ajaran_id: string;
}

export default function JadwalUjianPage() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    start_time: "",
    end_time: "",
    quota: 10,
    location: "Pesantren Al-Andalus Ulul Albaab",
    notes: ""
  });

  const [search, setSearch] = useState("");
  const [selectedPendaftarId, setSelectedPendaftarId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{
    active: boolean;
    curr: number;
    total: number;
    logs: string[];
  }>({
    active: false,
    curr: 0,
    total: 0,
    logs: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, pendaftarRes] = await Promise.all([
        fetch("/api/admin/exam-sessions"),
        fetch("/api/admin/pendaftar/list?status=paid,docs_verified&limit=100")
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.data);
      }
      if (pendaftarRes.ok) {
        const data = await pendaftarRes.json();
        setPendaftar(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
      if (res.ok) {
        setShowAddSession(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (sessionId: string) => {
    if (!selectedPendaftarId) return;

    const p = pendaftar.find(p => p.id === selectedPendaftarId);

    try {
      setAssigning(true);
      const res = await fetch("/api/admin/jadwal-ujian/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: selectedPendaftarId,
          exam_session_id: sessionId,
          tahun_ajaran_id: p?.tahun_ajaran_id,
        }),
      });

      if (res.ok) {
        setSelectedPendaftarId(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menetapkan jadwal");
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`Yakin ingin Assign Massal ke sesi "${sessionTitle}"?\n\nLink ujian akan dikirim via WhatsApp ke semua pendaftar yang belum punya jadwal.`)) return;

    try {
      setAssigning(true);
      const res = await fetch("/api/admin/jadwal-ujian/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.queue && data.queue.length > 0) {
          // Start batch sending
          setSendingProgress({ active: true, curr: 0, total: data.queue.length, logs: ["Mulai antrian pengiriman..."] });

          let success = 0;
          for (let i = 0; i < data.queue.length; i++) {
            const item = data.queue[i];
            setSendingProgress(prev => ({
              ...prev,
              curr: i + 1,
              logs: [`Mengirim ke ${item.nama}...`, ...prev.logs.slice(0, 3)]
            }));

            try {
              await fetch("/api/admin/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "schedule",
                  ...item
                })
              });
              success++;
            } catch (err) {
              console.error("Gagal kirim ke", item.nama, err);
            }

            // Delay 4 detik untuk mencegah ban
            if (i < data.queue.length - 1) {
              await new Promise(r => setTimeout(r, 4000));
            }
          }

          alert(`Selesai! ${success} notifikasi terkirim.`);
          setSendingProgress({ active: false, curr: 0, total: 0, logs: [] });
        } else {
          alert(data.message);
        }
        fetchData();
      } else {
        alert(data.error || "Gagal broadcast");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem");
    } finally {
      setAssigning(false);
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} • ${s.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredPendaftar = pendaftar.filter(p =>
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-clay-lg p-8 border border-white/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-900 tracking-tight">Manajemen <span className="text-purple-600">Jadwal Ujian</span></h1>
              <p className="text-ink-500 font-medium">Atur sesi ujian dan tetapkan peserta ke dalam jadwal.</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddSession(true)}
            className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Sesi Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sessions List */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-black text-ink-900 text-lg flex items-center gap-2 px-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Daftar Sesi Ujian
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-white/40">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-ink-100">
                <Calendar className="w-12 h-12 text-ink-200 mx-auto mb-4" />
                <p className="font-bold text-ink-400">Belum ada sesi ujian yang dibuat.</p>
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className={`group bg-white rounded-2xl shadow-clay-md border border-white/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${selectedPendaftarId ? "ring-2 ring-purple-100 hover:ring-purple-200" : ""}`}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-ink-900 text-lg">{s.title || "Sesi Ujian"}</h3>
                      <p className="text-sm font-bold text-ink-500">{formatTimeRange(s.start_time, s.end_time)}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-ink-400 uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5" />
                          {s.location || "Pesantren Al-Andalus Ulul Albaab"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5" />
                          {s.booked_count} / {s.quota} Peserta
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedPendaftarId ? (
                      <button
                        onClick={() => handleAssign(s.id)}
                        disabled={assigning || s.booked_count >= s.quota}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-br from-maroon-600 to-emerald-600 text-white rounded-xl font-black shadow-lg shadow-maroon-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2 "
                      >
                        {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Terapkan ke Sesi Ini
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3 w-full md:w-64 items-end">
                        <div className="w-full bg-cream-100 h-2.5 rounded-full overflow-hidden border border-white">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                            style={{ width: `${(s.booked_count / s.quota) * 100}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => handleBulkAssign(s.id, s.title || "Sesi Ini")}
                          disabled={assigning}
                          className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Broadcast Link (Massal)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Candidate List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-black text-ink-900 text-lg flex items-center gap-2 px-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Calon Peserta
          </h2>

          <div className="bg-white rounded-2xl shadow-clay-md border border-white/40 overflow-hidden flex flex-col h-[600px] sticky top-28">
            <div className="p-4 border-b border-ink-100 bg-cream-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Cari calon peserta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-ink-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredPendaftar.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-400 opacity-50">
                  <span className="text-xs font-bold uppercase">Tidak ada data</span>
                </div>
              ) : (
                filteredPendaftar.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPendaftarId(selectedPendaftarId === p.id ? null : p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedPendaftarId === p.id
                      ? "bg-indigo-50 border-indigo-200 shadow-inner"
                      : "bg-white border-transparent hover:bg-cream-50"
                      }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900 truncate text-sm leading-tight">{toTitleCase(p.nama_lengkap)}</p>
                      <p className="text-[10px] font-mono text-ink-400 mt-1">{p.nomor_pendaftaran}</p>
                    </div>
                    {selectedPendaftarId === p.id ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-indigo-600 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Status Pemilihan</p>
              <p className="text-xs font-bold font-mono">
                {selectedPendaftarId ? "Pilih sesi ujian di sebelah kiri" : "Pilih pendaftar untuk dijadwalkan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-clay-lg border border-white overflow-hidden animate-in zoom-in-95 duration-300">
            <form onSubmit={handleCreateSession}>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-ink-900">Buat Sesi <span className="text-purple-600">Baru</span></h2>
                  <button type="button" onClick={() => setShowAddSession(false)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors">
                    <AlertCircle className="w-5 h-5 text-ink-400 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Nama Sesi (Opsional)</label>
                    <input
                      type="text"
                      value={newSession.title}
                      onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                      placeholder="Contoh: Gelombang 1 - Sesi Pagi"
                      className="w-full bg-cream-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Mulai</label>
                      <input
                        type="datetime-local"
                        required
                        value={newSession.start_time}
                        onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                        className="w-full bg-cream-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Selesai</label>
                      <input
                        type="datetime-local"
                        required
                        value={newSession.end_time}
                        onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                        className="w-full bg-cream-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Kuota</label>
                      <input
                        type="number"
                        required
                        value={newSession.quota}
                        onChange={(e) => setNewSession({ ...newSession, quota: parseInt(e.target.value) })}
                        className="w-full bg-cream-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Lokasi</label>
                      <input
                        type="text"
                        value={newSession.location}
                        onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                        className="w-full bg-cream-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSession(false)}
                  className="flex-1 py-4 bg-cream-100 hover:bg-cream-200 text-ink-600 rounded-2xl font-black transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-600/20 transition-all"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sending Progress Modal */}
      {sendingProgress.active && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-white p-8 text-center animate-pulse">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-black text-ink-900 mb-2">Mengirim Notifikasi...</h2>
            <p className="font-bold text-red-500 mb-6 uppercase tracking-widest text-xs">JANGAN TUTUP HALAMAN INI!</p>

            <div className="w-full bg-cream-100 h-4 rounded-full overflow-hidden mb-4 border border-ink-100">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${(sendingProgress.curr / sendingProgress.total) * 100}%` }}
              ></div>
            </div>

            <p className="font-mono font-bold text-ink-500 mb-4">{sendingProgress.curr} / {sendingProgress.total}</p>

            <div className="bg-cream-50 rounded-xl p-4 text-left h-32 overflow-hidden flex flex-col-reverse gap-1 border border-ink-100">
              {sendingProgress.logs.map((log, idx) => (
                <p key={idx} className="text-xs font-mono text-ink-400 truncate">{log}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
