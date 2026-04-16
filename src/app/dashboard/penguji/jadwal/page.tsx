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
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";

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
  
  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [bulkForm, setBulkForm] = useState({
    title: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "", 
    selectedDays: [] as number[], // 0=Sun, 1=Mon, etc.
    daySlots: {} as Record<number, { start: string, end: string }[]>,
    notes: ""
  });

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
      setBulkForm(prev => ({ ...prev, title: autoTitle }));
    }
  }, [activeRole]);

  // Initialize active day's slots if empty when modal opens or activeDay changes
  useEffect(() => {
    if (isBulkModalOpen) {
      if (!bulkForm.daySlots[activeDay]) {
        setBulkForm(prev => ({
          ...prev,
          daySlots: {
            ...prev.daySlots,
            [activeDay]: [{ start: "08:00", end: "09:00" }]
          }
        }));
      }
    }
  }, [isBulkModalOpen, activeDay]);

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
        location: "Online",
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

  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkForm.selectedDays.length === 0) {
      alert("Pilih minimal satu hari!");
      return;
    }
    if (!bulkForm.endDate) {
      alert("Pilih tanggal berakhir!");
      return;
    }

    // Filter daySlots to only include selectedDays
    const daySlotsToSend: Record<number, any[]> = {};
    bulkForm.selectedDays.forEach(day => {
      daySlotsToSend[day] = bulkForm.daySlots[day] || [];
    });

    setSubmittingBulk(true);
    try {
      const res = await fetch("/api/exam-sessions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bulkForm,
          daySlots: daySlotsToSend
        }),
      });
      const result = await res.json();
      if (res.ok) {
        Swal.fire('Berhasil!', result.message, 'success');
        setIsBulkModalOpen(false);
        fetchSlots();
      } else {
        Swal.fire('Gagal!', result.error, 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error!', "Terjadi kesalahan sistem", 'error');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const addTimeSlot = () => {
    const currentSlots = bulkForm.daySlots[activeDay] || [];
    setBulkForm({
      ...bulkForm,
      daySlots: {
        ...bulkForm.daySlots,
        [activeDay]: [...currentSlots, { start: "16:00", end: "17:00" }]
      }
    });
  };

  const removeTimeSlot = (index: number) => {
    const currentSlots = bulkForm.daySlots[activeDay] || [];
    if (currentSlots.length <= 1) return;
    const newSlots = [...currentSlots];
    newSlots.splice(index, 1);
    setBulkForm({
      ...bulkForm,
      daySlots: {
        ...bulkForm.daySlots,
        [activeDay]: newSlots
      }
    });
  };

  const toggleDay = (day: number) => {
    const current = [...bulkForm.selectedDays];
    
    // Case 1: Day is not selected -> Select it and make it active
    if (!current.includes(day)) {
      const newSelected = [...current, day];
      
      // Initialize slots for this day if they don't exist
      if (!bulkForm.daySlots[day]) {
        setBulkForm(prev => ({
          ...prev,
          selectedDays: newSelected,
          daySlots: {
            ...prev.daySlots,
            [day]: prev.daySlots[activeDay] ? JSON.parse(JSON.stringify(prev.daySlots[activeDay])) : [{ start: "08:00", end: "09:00" }]
          }
        }));
      } else {
        setBulkForm(prev => ({ ...prev, selectedDays: newSelected }));
      }
      setActiveDay(day);
      return;
    }

    // Case 2: Day is selected but NOT active -> Make it active (to edit its times)
    if (activeDay !== day) {
      setActiveDay(day);
      return;
    }

    // Case 3: Day is selected AND active -> Deselect it
    const newSelected = current.filter(d => d !== day);
    setBulkForm(prev => ({ ...prev, selectedDays: newSelected }));
    
    // If we have other days selected, pick one to be the new active day
    if (newSelected.length > 0) {
      setActiveDay(newSelected[0]);
    }
  };

  const copySlotsToAll = () => {
    const currentSlots = bulkForm.daySlots[activeDay] || [];
    const newDaySlots = { ...bulkForm.daySlots };
    bulkForm.selectedDays.forEach(day => {
      newDaySlots[day] = JSON.parse(JSON.stringify(currentSlots));
    });
    setBulkForm({ ...bulkForm, daySlots: newDaySlots });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Disalin ke semua hari terpilih',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleDeleteSlot = async (id: string, count: number) => {
    if (count > 0) {
      Swal.fire('Gagal!', 'Tidak dapat menghapus sesi yang sudah ada pendaftar!', 'error');
      return;
    }
    
    const { isConfirmed } = await Swal.fire({
      title: 'Hapus Sesi?',
      text: "Apakah Anda yakin ingin menghapus sesi waktu ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!isConfirmed) return;

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
    const { isConfirmed } = await Swal.fire({
      title: 'Tandai Selesai?',
      text: "Apakah Anda yakin ingin menandai ujian ini selesai? Status akan diperbarui.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669', // green-600
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Tandai Selesai!',
      cancelButtonText: 'Batal'
    });

    if (!isConfirmed) return;

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
          Swal.fire({
            title: 'Selesai!',
            text: 'Semua rangkaian ujian santri ini telah SELESAI! Notifikasi telah dikirim.',
            icon: 'success'
          });
        }
        fetchAssignments(); // Refresh data
      } else {
        throw new Error(result.error || "Gagal update status");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    }
  };
  
  const handleCancelAssignment = async (jadwalId: string, pendaftarNama: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Batalkan Jadwal?',
      text: `Apakah Anda yakin ingin membatalkan jadwal ${pendaftarNama}? Santri akan mendapatkan notifikasi untuk memilih jadwal ulang dan slot waktu Anda akan dihapus.`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Alasan Pembatalan (Opsional)',
      inputPlaceholder: 'Ustadz Berhalangan Hadir',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Batalkan!',
      cancelButtonText: 'Kembali'
    });

    if (reason === undefined) return; // User cancelled the modal

    try {
      setLoadingAssignments(true);
      const response = await fetch("/api/penguji/jadwal/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jadwal_id: jadwalId,
          alasan: reason || "Ustadz Berhalangan Hadir"
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire('Terhapus!', result.message, 'success');
        fetchAssignments();
      } else {
        throw new Error(result.error || "Gagal membatalkan jadwal");
      }
    } catch (error: any) {
      Swal.fire('Gagal!', error.message, 'error');
    } finally {
      setLoadingAssignments(false);
    }
  };

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).replace("Minggu", "Ahad");
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
      <div className="bg-white rounded-3xl p-5 md:p-8 border border-cream-200 shadow-sm app-card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-maroon-50 rounded-2xl flex items-center justify-center border border-maroon-100 shrink-0">
              <Calendar className="w-7 h-7 text-maroon-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ink-950 font-display tracking-tight">
                Jadwal & Sesi Ujian
              </h2>
              <p className="text-sm font-bold text-ink-500 mt-1">
                Kelola jadwal seleksi dan ketersediaan waktu
              </p>
            </div>
          </div>
          <div className="flex bg-cream-50 p-1.5 rounded-2xl border border-cream-200 w-full">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-3 px-3 rounded-xl font-black text-xs md:text-sm transition-all text-center ${activeTab === 'assigned' ? 'bg-white shadow-sm text-maroon-700 border border-cream-100' : 'text-ink-400 hover:text-ink-700 hover:bg-cream-100/50'}`}
            >
              Jadwal Saya
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 py-3 px-3 rounded-xl font-black text-xs md:text-sm transition-all text-center ${activeTab === 'slots' ? 'bg-white shadow-sm text-maroon-700 border border-cream-100' : 'text-ink-400 hover:text-ink-700 hover:bg-cream-100/50'}`}
            >
              Sesi Ketersediaan
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
              <div className="grid gap-4">
                {filteredAssignments.map(item => (
                  <div key={item.id} className={`bg-white rounded-3xl p-5 md:p-8 border transition-all app-card ${isToday(item.tanggal_ujian) ? "border-emerald-200 shadow-md ring-4 ring-emerald-50" : "border-cream-200 shadow-sm hover:border-maroon-200 hover:shadow-md"}`}>
                    {/* Top section: Date badge + Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-2xl font-bold text-center min-w-[72px] shrink-0 border flex flex-col justify-center ${isToday(item.tanggal_ujian) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-maroon-50 border-maroon-100 text-maroon-700'}`}>
                        <div className="text-[9px] uppercase tracking-widest opacity-70 mb-0.5">
                          {new Date(item.tanggal_ujian).toLocaleDateString('id-ID', { weekday: 'short' }).replace('Min', 'Ahd')}
                        </div>
                        <div className="text-2xl font-display leading-none">{new Date(item.tanggal_ujian).getDate()}</div>
                        <div className="text-[9px] uppercase tracking-wider mt-1 opacity-70">
                          {new Date(item.tanggal_ujian).toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-surface-100 text-ink-600 border border-surface-200 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.pendaftar.jenjang}</span>
                          <span className="px-2 py-0.5 bg-maroon-50 text-maroon-700 border border-maroon-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3" /> {item.pendaftar.nomor_pendaftaran}</span>
                        </div>
                        <h3 className="text-base md:text-xl font-black text-ink-950 font-display leading-tight">{item.pendaftar.nama_lengkap}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1 font-bold">
                          <FileText className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                          <span className="text-maroon-700 uppercase tracking-wide">{item.jenis_tugas}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time & Location Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 px-1 py-3 bg-cream-50 rounded-2xl border border-cream-100">
                      <div className="flex items-center gap-2 text-sm text-ink-600 font-bold">
                        <Clock className="w-4 h-4 text-maroon-500 shrink-0" />
                        {formatTime(item.waktu_mulai)} WIB
                      </div>
                      <div className="w-px h-4 bg-cream-200" />
                      <div className="flex items-center gap-2 text-sm text-ink-600 font-bold">
                        <MapPin className="w-4 h-4 text-maroon-500 shrink-0" />
                        {item.lokasi || "Lokasi belum ditentukan"}
                      </div>
                      {item.session_title && (
                        <span className="text-xs text-ink-400 ml-auto">Sesi: {item.session_title}</span>
                      )}
                    </div>

                    {/* Action Buttons: Status Completion */}
                    {(() => {
                      const isSantri = item.penguji_santri_id === userId;
                      const isQuran = item.penguji_quran_id === userId;
                      const isOrtu = item.penguji_ortu_id === userId;
                      const isCreator = item.session_created_by === userId;

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
                        <div className="flex flex-col gap-2">
                          {userId && showSantri && (
                            item.status_santri === 'completed' ? (
                              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                <CheckCircle className="w-4 h-4" /> Wawancara Calsan Selesai
                              </div>
                            ) : (
                              <button onClick={() => handleCompleteExam(item.id)} className="w-full py-3.5 bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-black rounded-2xl transition-colors active:scale-95">
                                ✓ Tandai Wawancara Selesai
                              </button>
                            )
                          )}
                          {userId && showQuran && (
                            item.status_quran === 'completed' ? (
                              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                <CheckCircle className="w-4 h-4" /> Tes Al-Qur'an Selesai
                              </div>
                            ) : (
                              <button onClick={() => handleCompleteExam(item.id)} className="w-full py-3.5 bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-black rounded-2xl transition-colors active:scale-95">
                                ✓ Tandai Tes Al-Qur'an Selesai
                              </button>
                            )
                          )}
                          {userId && showOrtu && (
                            item.status_ortu === 'completed' ? (
                              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                <CheckCircle className="w-4 h-4" /> Wawancara Cawalsan Selesai
                              </div>
                            ) : (
                              <button onClick={() => handleCompleteExam(item.id)} className="w-full py-3.5 bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-black rounded-2xl transition-colors active:scale-95">
                                ✓ Tandai Wawancara Cawalsan Selesai
                              </button>
                            )
                          )}
                          {/* Bottom row: Lihat Data + Batalkan */}
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => { setSelectedPendaftar(item.pendaftar); setIsDetailModalOpen(true); }}
                              className="flex-1 py-3 border border-cream-200 text-ink-600 hover:bg-cream-50 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5" /> Lihat Data
                            </button>
                            <button
                              onClick={() => handleCancelAssignment(item.id, item.pendaftar.nama_lengkap)}
                              className="flex-1 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Batalkan
                            </button>
                          </div>
                        </div>
                      );
                    })()}
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
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-cream-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink-950">Sesi Ketersediaan Anda</h3>
                <p className="text-xs text-cream-500 mt-0.5">Buat sesi waktu dimana Anda bersedia menguji.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-bold border border-indigo-200 transition-all text-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Buat Massal
                </button>
                <button
                  onClick={() => setIsSlotModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-maroon-600 hover:bg-maroon-700 text-white rounded-2xl font-bold shadow-lg shadow-maroon-200 transition-all text-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Buat Sesi
                </button>
              </div>
            </div>
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
                    onChange={e => {
                      const newStart = e.target.value;
                      let newEnd = slotForm.end_time;
                      
                      if (newStart) {
                        const [hours, minutes] = newStart.split(':').map(Number);
                        const date = new Date();
                        date.setHours(hours + 1, minutes);
                        newEnd = date.getHours().toString().padStart(2, '0') + ':' + 
                                 date.getMinutes().toString().padStart(2, '0');
                      }
                      
                      setSlotForm({ ...slotForm, start_time: newStart, end_time: newEnd });
                    }}
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

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-start gap-3">
                <div className="mt-0.5 text-lg">💡</div>
                <div>
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">Informasi Otomatis</p>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    Sesi ini diatur sebagai <b>Full Online</b>. Sistem akan otomatis menyertakan <b>Link Google Meet</b> dari profil Anda saat pendaftar mengambil jadwal ini.
                  </p>
                </div>
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

      {/* MODAL BULK CREATE SLOT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-cream-100 flex justify-between items-center bg-cream-50 rounded-t-3xl shrink-0">
              <h3 className="text-xl font-black text-ink-950 font-display">Buat Jadwal Sekaligus (Massal)</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-2 hover:bg-cream-100 rounded-full">
                <XCircle className="w-6 h-6 text-ink-400 hover:text-ink-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBulk} className="p-8 space-y-6 overflow-y-auto">
              {/* Jenis Ujian Info */}
              <div className="bg-maroon-50 border border-maroon-100 p-4 rounded-2xl">
                <p className="text-xs font-black text-maroon-800 uppercase tracking-widest mb-1">Mata Ujian</p>
                <p className="text-lg font-black text-maroon-700">{bulkForm.title || "—"}</p>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-3">Pilih Hari Rutin</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 1, label: "Sen" },
                    { id: 2, label: "Sel" },
                    { id: 3, label: "Rab" },
                    { id: 4, label: "Kam" },
                    { id: 5, label: "Jum" },
                    { id: 6, label: "Sab" },
                    { id: 0, label: "Ahd" },
                  ].map((day) => {
                    const isSelected = bulkForm.selectedDays.includes(day.id);
                    const isActive = activeDay === day.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border relative ${isSelected 
                          ? (isActive 
                              ? "bg-maroon-700 text-white border-maroon-800 shadow-lg ring-4 ring-maroon-100 scale-105 z-10" 
                              : "bg-maroon-100 text-maroon-800 border-maroon-200 hover:bg-maroon-200")
                          : "bg-white text-ink-500 border-cream-200 hover:bg-cream-50"}`}
                      >
                        {day.label}
                        {isSelected && !isActive && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-maroon-600 rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-ink-400 mt-2">💡 Klik untuk mengaktifkan hari, klik lagi untuk mengatur jam ketersediaan hari tersebut.</p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">Dari Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-cream-50 border-none rounded-xl focus:ring-2 focus:ring-maroon-500 outline-none font-bold"
                    value={bulkForm.startDate}
                    onChange={e => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-cream-50 border-none rounded-xl focus:ring-2 focus:ring-maroon-500 outline-none font-bold"
                    value={bulkForm.endDate}
                    onChange={e => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-cream-100 pb-2">
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest">
                    Jam Sesi: <span className="text-maroon-600">{
                      ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][activeDay]
                    }</span>
                  </label>
                  {bulkForm.selectedDays.length > 1 && (
                    <button 
                      type="button" 
                      onClick={copySlotsToAll}
                      className="text-[10px] bg-maroon-50 text-maroon-700 px-2 py-1 rounded-lg border border-maroon-100 font-bold hover:bg-maroon-100 transition-colors"
                    >
                      Sama untuk semua hari
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(bulkForm.daySlots[activeDay] || []).map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 bg-cream-50 p-3 rounded-2xl border border-cream-100">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          required
                          className="bg-white border-none rounded-xl px-3 py-2 text-sm font-bold shadow-sm"
                          value={slot.start}
                          onChange={e => {
                            const newStart = e.target.value;
                            const newSlots = [...(bulkForm.daySlots[activeDay] || [])];
                            newSlots[index].start = newStart;
                            
                            if (newStart) {
                              const [hours, minutes] = newStart.split(':').map(Number);
                              const date = new Date();
                              date.setHours(hours + 1, minutes);
                              newSlots[index].end = date.getHours().toString().padStart(2, '0') + ':' + 
                                                   date.getMinutes().toString().padStart(2, '0');
                            }
                            
                            setBulkForm({ ...bulkForm, daySlots: { ...bulkForm.daySlots, [activeDay]: newSlots } });
                          }}
                        />
                        <input
                          type="time"
                          required
                          className="bg-white border-none rounded-xl px-3 py-2 text-sm font-bold shadow-sm"
                          value={slot.end}
                          onChange={e => {
                            const newSlots = [...(bulkForm.daySlots[activeDay] || [])];
                            newSlots[index].end = e.target.value;
                            setBulkForm({ ...bulkForm, daySlots: { ...bulkForm.daySlots, [activeDay]: newSlots } });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-2 text-ink-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="w-full py-2 border-2 border-dashed border-cream-300 rounded-2xl text-xs font-black text-ink-400 hover:border-maroon-300 hover:text-maroon-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah Jam Lain
                  </button>
                </div>
              </div>

              {/* Automated Note */}
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
                <div className="text-lg">✨</div>
                <div>
                  <p className="text-xs font-black text-purple-900 uppercase tracking-widest mb-1">Informasi Otomatis</p>
                  <p className="text-[11px] text-purple-700 leading-relaxed font-medium">
                    Semua sesi yang dibuat massal akan otomatis diset sebagai <b>Online</b> dan memiliki <b>Kuota 1 Santri</b>.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingBulk}
                className="w-full py-4 bg-maroon-600 hover:bg-maroon-700 text-white font-black rounded-2xl shadow-lg shadow-maroon-200 transition-all flex justify-center items-center gap-2"
              >
                {submittingBulk && <Loader2 className="w-5 h-5 animate-spin" />}
                Generate Jadwal Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
