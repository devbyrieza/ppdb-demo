"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Loader2,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Hash,
} from "lucide-react";

// --- Types ---

interface JadwalAssignment {
  id: string;
  pendaftar: {
    nama_lengkap: string;
    nomor_pendaftaran: string;
    jenjang: string;
    jenis_kelamin: string;
    nik?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    no_hp?: string;
    asal_sekolah?: string;
    orang_tua?: {
      nama_ayah?: string;
      nama_ibu?: string;
      no_hp_ayah?: string;
      no_hp_ibu?: string;
      pekerjaan_ayah?: string;
      pekerjaan_ibu?: string;
    };
  };
  tanggal_ujian: string;
  waktu_mulai: string;
  waktu_selesai: string | null;
  lokasi: string | null;
  jenis_tugas: string;
  status: string;
  session_title?: string;
  // Granular Statuses
  status_santri?: string;
  status_quran?: string;
  status_ortu?: string;
  // Assignee IDs
  penguji_santri_id?: string;
  penguji_quran_id?: string;
  penguji_ortu_id?: string;
  session_created_by?: string;
}

interface ExamSession {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  quota: number;
  location: string | null;
  notes: string | null;
  _count?: { bookings: number };
}

// --- Component ---

// Map session role to which jenis_tugas types are visible
const ROLE_TO_JADWAL_TYPES: Record<string, string[]> = {
  penguji_calsan: ["Tes Al-Qur'an"],
  pewawancara_calsan: ["Wawancara Calsan"],
  pewawancara_cawalsan: ["Wawancara Cawalsan"],
  // Admin roles see all
  admin: ["Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan"],
  admin_super: ["Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan"],
  head_of_it: ["Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan"],
};

// Auto-map role to session title (for specific examiner roles)
const ROLE_TO_SESSION_TITLE: Record<string, string> = {
  penguji_calsan: "Tes Al-Quran",
  pewawancara_calsan: "Wawancara Calsan",
  pewawancara_cawalsan: "Wawancara Cawalsan",
};

// Roles that can choose any session type (need dropdown)
const ADMIN_ROLES = ["admin", "admin_super", "head_of_it", "tim_it"];

export default function JadwalPengujiPage() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'slots'>('assigned');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");

  // State for Assignments
  const [assignments, setAssignments] = useState<JadwalAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // State for Slots
  const [slots, setSlots] = useState<ExamSession[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Detail Modal State
  const [selectedPendaftar, setSelectedPendaftar] = useState<JadwalAssignment['pendaftar'] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Common State
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State for Slot
  const [slotForm, setSlotForm] = useState({
    title: "",
    date: "",
    start_time: "08:00",
    end_time: "09:00",
    quota: 1,
    location: "", // Default empty, falls back to "Online" on submit if empty
    notes: "",
  });
  const [submittingSlot, setSubmittingSlot] = useState(false);

  // --- Fetchers ---

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await fetch("/api/penguji/jadwal");
      if (response.ok) {
        const result = await response.json();
        setAssignments(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch("/api/exam-sessions?creator_id=me");
      if (response.ok) {
        const result = await response.json();
        setSlots(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    // Fetch User Session ID and active role
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          const session = data.session;
          if (session) {
            setUserId(session.id || session.user_id);
            setActiveRole(session.role || "");
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };
    fetchSession();

    if (activeTab === 'assigned') fetchAssignments();
    if (activeTab === 'slots') fetchSlots();
  }, [activeTab]);

  // Auto-set session title from role when role is known
  useEffect(() => {
    const autoTitle = ROLE_TO_SESSION_TITLE[activeRole];
    if (autoTitle) {
      setSlotForm(prev => ({ ...prev, title: autoTitle }));
    }
  }, [activeRole]);

  // --- Handlers ---

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSlot(true);
    setMessage(null);

    try {
      // Combine date and time
      const startDateTime = new Date(`${slotForm.date}T${slotForm.start_time}:00`);
      const endDateTime = new Date(`${slotForm.date}T${slotForm.end_time}:00`);

      // Validate end time
      const diffMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      if (diffMinutes <= 0) {
        setMessage({ type: "error", text: "Jam selesai harus lebih besar dari jam mulai." });
        setSubmittingSlot(false);
        return;
      }
      if (diffMinutes > 60) {
        setMessage({ type: "error", text: "Durasi maksimal 1 jam (60 menit)." });
        setSubmittingSlot(false);
        return;
      }

      const payload = {
        title: slotForm.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        quota: 1, // Fixed quota to 1 as per requirement (Private/1-on-1)
        location: slotForm.location || "Online",
        notes: slotForm.notes,
      };

      const response = await fetch("/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Sesi waktu berhasil dibuat!" });
        setIsSlotModalOpen(false);
        fetchSlots();
        // Reset form partial
        setSlotForm(prev => ({ ...prev, title: "", notes: "" }));
      } else {
        throw new Error(result.error || "Gagal membuat sesi");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: string, count: number) => {
    if (count > 0) {
      alert("Tidak dapat menghapus sesi yang sudah ada pendaftar!");
      return;
    }
    if (!confirm("Hapus sesi waktu ini?")) return;

    try {
      const response = await fetch(`/api/exam-sessions?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        setMessage({ type: "success", text: "Sesi berhasil dihapus" });
        fetchSlots();
      } else {
        const res = await response.json();
        throw new Error(res.error || "Gagal menghapus");
      }
    } catch (error: any) {
    }
  };

  const handleCompleteExam = async (jadwalId: string) => {
    if (!confirm("Apakah Anda yakin ingin menandai ujian ini selesai? Status akan diperbarui.")) return;

    try {
      const response = await fetch("/api/penguji/jadwal/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jadwal_id: jadwalId }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: result.message });
        if (result.isAllDone) {
          alert("Semua rangkaian ujian santri ini telah SELESAI! Notifikasi telah dikirim.");
        }
        fetchAssignments(); // Refresh data
      } else {
        throw new Error(result.error || "Gagal update status");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    }
  };

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    const checkDate = dateString.split("T")[0];
    return today === checkDate;
  };

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm app-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-maroon-50 rounded-2xl flex items-center justify-center border border-maroon-100 shrink-0">
              <Calendar className="w-7 h-7 text-maroon-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ink-950 font-display tracking-tight">
                Jadwal & Sesi Ujian
              </h2>
              <p className="text-sm font-bold text-ink-500 mt-1">
                Kelola jadwal menguji dan ketersediaan waktu
              </p>
            </div>
          </div>
          <div className="flex bg-cream-50 p-1.5 rounded-2xl border border-cream-200">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 px-5 py-2.5 rounded-xl font-black text-sm transition-all text-center ${activeTab === 'assigned' ? 'bg-white shadow-sm text-maroon-700 border border-cream-100' : 'text-ink-400 hover:text-ink-700 hover:bg-cream-100/50'}`}
            >
              Jadwal Saya
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 px-5 py-2.5 rounded-xl font-black text-sm transition-all text-center ${activeTab === 'slots' ? 'bg-white shadow-sm text-maroon-700 border border-cream-100' : 'text-ink-400 hover:text-ink-700 hover:bg-cream-100/50'}`}
            >
              Kelola Sesi Ketersediaan
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><XCircle className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
        </div>
      )}

      {/* TAB CONTENT: ASSIGNED */}
      {activeTab === 'assigned' && (
        <>
          {loadingAssignments ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-maroon-500" /></div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border-2 border-cream-200 text-center">
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-ink-400" />
              </div>
              <h3 className="font-bold text-ink-950">Belum Ada Jadwal</h3>
              <p className="text-cream-500">Anda belum memiliki jadwal ujian yang ditugaskan.</p>
            </div>
          ) : (() => {
            // Filter assignments based on active role
            const visibleTypes = ROLE_TO_JADWAL_TYPES[activeRole] || ["Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan"];
            const filteredAssignments = assignments.filter(item => {
              // Check if any of the item's jenis_tugas matches the visible types
              return visibleTypes.some(type => item.jenis_tugas.includes(type));
            });

            if (filteredAssignments.length === 0) {
              return (
                <div className="bg-white rounded-xl p-12 border-2 border-cream-200 text-center">
                  <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-ink-400" />
                  </div>
                  <h3 className="font-bold text-ink-950">Belum Ada Jadwal</h3>
                  <p className="text-cream-500">Tidak ada jadwal ujian untuk role yang dipilih saat ini.</p>
                </div>
              );
            }

            return (
              <div className="grid gap-5">
                {filteredAssignments.map(item => (
                  <div key={item.id} className={`bg-white rounded-3xl p-6 md:p-8 border transition-all app-card ${isToday(item.tanggal_ujian) ? "border-emerald-200 shadow-md ring-4 ring-emerald-50" : "border-cream-200 shadow-sm hover:border-maroon-200 hover:shadow-md"}`}>
                    <div className="flex md:items-center justify-between flex-col md:flex-row gap-6">
                      <div className="flex items-start gap-5">
                        <div className={`p-4 rounded-2xl font-bold text-center min-w-[70px] shrink-0 border ${isToday(item.tanggal_ujian) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-maroon-50 border-maroon-100 text-maroon-700'}`}>
                          <div className="text-xs uppercase tracking-wider">{new Date(item.tanggal_ujian).toLocaleDateString('id-ID', { month: 'short' })}</div>
                          <div className="text-3xl font-display mt-0.5">{new Date(item.tanggal_ujian).getDate()}</div>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-surface-100 text-ink-600 border border-surface-200 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.pendaftar.jenjang}</span>
                            <span className="px-2.5 py-1 bg-maroon-50 text-maroon-700 border border-maroon-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Hash className="w-3 h-3" /> {item.pendaftar.nomor_pendaftaran}</span>
                          </div>
                          <h3 className="text-xl font-black text-ink-950 font-display">{item.pendaftar.nama_lengkap}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-ink-500 mt-1.5 font-bold">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-ink-400" />
                              Tugas:
                            </div>
                            <span className="text-maroon-700 uppercase tracking-wide text-xs">{item.jenis_tugas}</span>
                          </div>

                          {/* Action Buttons: Status Completion */}
                          {(() => {
                            // Determine which roles this penguji has for this jadwal
                            const isSantri = item.penguji_santri_id === userId;
                            const isQuran = item.penguji_quran_id === userId;
                            const isOrtu = item.penguji_ortu_id === userId;
                            const isCreator = item.session_created_by === userId;

                            // Fallback: if matched via session creator, derive from jenis_tugas
                            let showSantri = isSantri;
                            let showQuran = isQuran;
                            let showOrtu = isOrtu;
                            if (!isSantri && !isQuran && !isOrtu && isCreator) {
                              const tugas = (item.jenis_tugas || "").toLowerCase();
                              if (tugas.includes("calsan") || tugas.includes("santri")) showSantri = true;
                              if (tugas.includes("qur")) showQuran = true;
                              if (tugas.includes("cawalsan") || tugas.includes("ortu")) showOrtu = true;
                            }

                            return (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {userId && showSantri && (
                                  item.status_santri === 'completed' ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Wawancara Calsan Selesai
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleCompleteExam(item.id)}
                                      className="px-3 py-1 bg-maroon-600 hover:bg-maroon-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Tandai Wawancara Selesai
                                    </button>
                                  )
                                )}

                                {userId && showQuran && (
                                  item.status_quran === 'completed' ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Tes Al-Qur'an Selesai
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleCompleteExam(item.id)}
                                      className="px-3 py-1 bg-maroon-600 hover:bg-maroon-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Tandai Tes Al-Qur'an Selesai
                                    </button>
                                  )
                                )}

                                {userId && showOrtu && (
                                  item.status_ortu === 'completed' ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Wawancara Cawalsan Selesai
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleCompleteExam(item.id)}
                                      className="px-3 py-1 bg-maroon-600 hover:bg-maroon-700 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Tandai Wawancara Cawalsan Selesai
                                    </button>
                                  )
                                )}
                              </div>
                            );
                          })()}

                          <button
                            onClick={() => {
                              setSelectedPendaftar(item.pendaftar);
                              setIsDetailModalOpen(true);
                            }}
                            className="mt-2 text-xs font-bold text-maroon-600 hover:text-maroon-800 underline"
                          >
                            Lihat Data Pendaftar
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[200px] border-l pl-0 md:pl-6 border-cream-100">
                        <div className="flex items-center gap-2 text-sm text-ink-600">
                          <Clock className="w-4 h-4 text-maroon-500" />
                          {formatTime(item.waktu_mulai)} WIB
                        </div>
                        <div className="flex items-center gap-2 text-sm text-ink-600">
                          <MapPin className="w-4 h-4 text-maroon-500" />
                          {item.lokasi || "Lokasi belum ditentukan"}
                        </div>
                        {item.session_title && (
                          <div className="text-xs text-ink-400 mt-1">Sesi: {item.session_title}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}

      {/* TAB CONTENT: SLOTS */}
      {activeTab === 'slots' && (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-cream-200">
            <div>
              <h3 className="font-bold text-ink-950">Sesi Ketersediaan Anda</h3>
              <p className="text-sm text-cream-500">Buat sesi waktu dimana Anda bersedia menguji.</p>
            </div>
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-bold shadow-lg shadow-maroon-200 transition-all"
            >
              <Plus className="w-4 h-4" /> Buat Sesi
            </button>
          </div>

          {loadingSlots ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-maroon-500" /></div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-cream-500">
              <p>Belum ada sesi waktu yang dibuat.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {slots.map(slot => (
                <div key={slot.id} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all group relative app-card">
                  <button
                    onClick={() => handleDeleteSlot(slot.id, slot._count?.bookings || 0)}
                    className="absolute top-4 right-4 p-2 text-ink-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 bg-cream-50 rounded-2xl flex items-center justify-center border border-cream-100 mb-4 text-ink-400 font-black">
                    {slot.title?.charAt(0) || "S"}
                  </div>
                  <h4 className="font-black text-lg text-ink-950 mb-1 font-display">{slot.title || "Sesi Tanpa Judul"}</h4>
                  <div className="space-y-3 mt-4 text-sm font-bold">
                    <div className="flex items-center gap-3 text-ink-600 bg-cream-50/50 p-2 rounded-xl">
                      <Calendar className="w-4 h-4 text-maroon-600 shrink-0" />
                      {formatDate(slot.start_time)}
                    </div>
                    <div className="flex items-center gap-3 text-ink-600 bg-cream-50/50 p-2 rounded-xl">
                      <Clock className="w-4 h-4 text-maroon-600 shrink-0" />
                      {formatTime(slot.start_time)}{slot.end_time ? ` – ${formatTime(slot.end_time)}` : ''} WIB
                    </div>
                    <div className="flex items-center gap-3 text-ink-600 bg-cream-50/50 p-2 rounded-xl">
                      <MapPin className="w-4 h-4 text-maroon-600 shrink-0" />
                      <span className="truncate">{slot.location || "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL CREATE SLOT */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-cream-100 flex justify-between items-center bg-cream-50">
              <h3 className="font-bold text-ink-950">Buat Sesi Ketersediaan</h3>
              <button onClick={() => setIsSlotModalOpen(false)}><XCircle className="w-6 h-6 text-ink-400 hover:text-ink-600" /></button>
            </div>
            <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
              {/* Jenis Ujian: auto dari role, dropdown hanya untuk admin */}
              {ADMIN_ROLES.includes(activeRole) ? (
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Jenis Ujian</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none bg-white"
                    value={slotForm.title}
                    onChange={e => setSlotForm({ ...slotForm, title: e.target.value })}
                  >
                    <option value="" disabled>Pilih Jenis Ujian</option>
                    <option value="Tes Al-Quran">Tes Al-Quran</option>
                    <option value="Wawancara Calsan">Wawancara Calsan</option>
                    <option value="Wawancara Cawalsan">Wawancara Cawalsan</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Jenis Ujian</label>
                  <div className="w-full px-3 py-2 border border-maroon-200 bg-maroon-50 rounded-lg text-maroon-800 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-maroon-500 inline-block"></span>
                    {slotForm.title || "—"}
                  </div>
                  <p className="text-xs text-ink-400 mt-1">Jenis ujian otomatis sesuai role akun Anda.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  value={slotForm.date}
                  onChange={e => setSlotForm({ ...slotForm, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Mulai Ujian</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                    value={slotForm.start_time}
                    onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-700 mb-1">Selesai Ujian</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                    value={slotForm.end_time}
                    onChange={e => setSlotForm({ ...slotForm, end_time: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-ink-400 -mt-2">⏱ Maksimal durasi sesi adalah <strong>1 jam</strong>.</p>

              <div>
                <label className="block text-sm font-bold text-ink-700 mb-1">Link Google Meet / Lokasi</label>
                <input
                  type="text"
                  placeholder="Paste Link Google Meet di sini (Contoh: https://meet.google.com/abc-xyz-123)"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                  value={slotForm.location}
                  onChange={e => setSlotForm({ ...slotForm, location: e.target.value })}
                />
              </div>


              {/* Hidden/Fixed Quota Note */}
              <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                <div className="mt-0.5 min-w-[16px]">ℹ️</div>
                <p className="text-xs text-blue-800">
                  Setiap sesi waktu yang dibuat otomatis memiliki <strong>Kuota 1 Pendaftar</strong> (Private/1-on-1).
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingSlot}
                className="w-full py-3 bg-maroon-600 hover:bg-maroon-700 text-white font-bold rounded-xl transition-colors flex justify-center gap-2"
              >
                {submittingSlot && <Loader2 className="w-5 h-5 animate-spin" />}
                Simpan Sesi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PENDAFTAR */}
      {isDetailModalOpen && selectedPendaftar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-cream-100 flex justify-between items-center bg-cream-50 rounded-t-2xl shrink-0">
              <h3 className="font-bold text-ink-950">Data Pendaftar</h3>
              <button onClick={() => setIsDetailModalOpen(false)}><XCircle className="w-6 h-6 text-ink-400 hover:text-ink-600" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Data Diri */}
              <div>
                <h4 className="text-sm font-bold text-ink-400 uppercase tracking-wider mb-3">Identitas Santri</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-cream-500 text-xs">Nama Lengkap</label>
                    <p className="font-bold text-ink-950">{selectedPendaftar.nama_lengkap}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Nomor Pendaftaran</label>
                    <p className="font-mono font-bold text-ink-950">{selectedPendaftar.nomor_pendaftaran}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">NIK</label>
                    <p className="font-mono text-ink-700">{selectedPendaftar.nik || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Jenis Kelamin</label>
                    <p className="text-ink-700">{selectedPendaftar.jenis_kelamin}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Tempat, Tanggal Lahir</label>
                    <p className="text-ink-700">
                      {selectedPendaftar.tempat_lahir}, {selectedPendaftar.tanggal_lahir ? new Date(selectedPendaftar.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Jenjang</label>
                    <p className="text-ink-700">{selectedPendaftar.jenjang}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-cream-500 text-xs">No. WA / HP (Wali/Utama)</label>
                    <p className="font-mono font-bold text-green-700">{selectedPendaftar.no_hp || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-cream-500 text-xs">Alamat</label>
                    <p className="text-ink-700">{selectedPendaftar.alamat || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-cream-500 text-xs">Asal Sekolah</label>
                    <p className="text-ink-700 font-medium">{selectedPendaftar.asal_sekolah || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-cream-100" />

              {/* Data Orang Tua */}
              <div>
                <h4 className="text-sm font-bold text-ink-400 uppercase tracking-wider mb-3">Data Orang Tua</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-cream-500 text-xs">Nama Ayah</label>
                    <p className="font-bold text-ink-950">{selectedPendaftar.orang_tua?.nama_ayah || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">No. HP Ayah</label>
                    <p className="font-mono text-ink-700">{selectedPendaftar.orang_tua?.no_hp_ayah || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Pekerjaan Ayah</label>
                    <p className="text-ink-700">{selectedPendaftar.orang_tua?.pekerjaan_ayah || "-"}</p>
                  </div>
                  <div>
                    {/* Empty spacer or Mother info */}
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">Nama Ibu</label>
                    <p className="font-bold text-ink-950">{selectedPendaftar.orang_tua?.nama_ibu || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-cream-500 text-xs">No. HP Ibu</label>
                    <p className="font-mono text-ink-700">{selectedPendaftar.orang_tua?.no_hp_ibu || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-cream-100 bg-cream-50 rounded-b-2xl shrink-0">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full py-2.5 bg-cream-200 hover:bg-cream-200 text-ink-900 font-bold rounded-xl transition-colors"
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
