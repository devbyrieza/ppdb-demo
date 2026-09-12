"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Layers,
  CheckSquare,
  Square,
  Edit2,
  Save,
  Loader2,
  Filter,
  UserCheck,
  Video,
  Search,
  Sparkles,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";

interface ExamSession {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  quota: number;
  location: string | null;
  notes: string | null;
  created_by?: string;
  creator?: {
    full_name: string;
    jenis_kelamin?: string;
  };
  _count?: {
    bookings: number;
  };
}

interface Examiner {
  id: string;
  full_name: string;
  role: string;
  secondary_roles?: string[] | string;
}

interface SesiKetersediaanSectionProps {
  onRefreshPlotting?: () => void;
  initialExaminers?: Examiner[];
}

export default function SesiKetersediaanSection({
  onRefreshPlotting,
  initialExaminers = [],
}: SesiKetersediaanSectionProps) {
  // Slots State
  const [slots, setSlots] = useState<ExamSession[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [filterCreatorId, setFilterCreatorId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "booked">("all");

  // Examiners List
  const [examiners, setExaminers] = useState<Examiner[]>(initialExaminers);

  // Modals State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // Single Slot Form
  const [submittingSlot, setSubmittingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    title: "Seleksi Al Qur'an",
    date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "08:30",
    quota: 1,
    location: "Online",
    notes: "",
    creator_id: "",
  });

  // Edit Slot Form
  const [editingSlot, setEditingSlot] = useState<ExamSession | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    start_time: "08:00",
    end_time: "08:30",
    location: "Online",
    notes: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Multi-Select & Bulk Actions
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
  const [bulkEditForm, setBulkEditForm] = useState({
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
    changeTime: false,
    changeLocation: false,
    changeNotes: false,
  });
  const [submittingBulkEdit, setSubmittingBulkEdit] = useState(false);

  // Bulk Create Modal State
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(6); // Default Sabtu
  const [bulkForm, setBulkForm] = useState({
    title: "Seleksi Al Qur'an",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    selectedDays: [6, 0] as number[], // Sabtu & Ahad
    daySlots: {
      6: [
        { start: "08:00", end: "08:30" },
        { start: "08:30", end: "09:00" },
        { start: "09:00", end: "09:30" },
      ],
      0: [
        { start: "08:00", end: "08:30" },
        { start: "08:30", end: "09:00" },
        { start: "09:00", end: "09:30" },
      ],
    } as Record<number, { start: string; end: string }[]>,
    location: "Online",
    notes: "",
    creator_id: "",
  });

  // Body scroll lock effect for modals
  useEffect(() => {
    const isAnyModalOpen =
      isSlotModalOpen || isBulkModalOpen || isEditModalOpen || isBulkEditModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSlotModalOpen, isBulkModalOpen, isEditModalOpen, isBulkEditModalOpen]);

  // Duration Helper
  const getDurationFromTitle = (title: string) => {
    const t = (title || "").toLowerCase();
    if (t.includes("quran") || t.includes("qur'an")) return 30;
    if (t.includes("santri") || t.includes("calsan")) return 30;
    if (t.includes("orang tua") || t.includes("ortu") || t.includes("wali")) return 30;
    if (t.includes("hafalan")) return 30;
    if (t.includes("arab")) return 30;
    return 60;
  };

  const calculateEndTime = (startTime: string, title: string) => {
    if (!startTime) return "";
    const duration = getDurationFromTitle(title);
    const [h, m] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + duration, 0, 0);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // Fetch examiners if not provided
  useEffect(() => {
    if (initialExaminers.length > 0) {
      setExaminers(initialExaminers);
      return;
    }
    const fetchExaminers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const json = await res.json();
          const filtered = (json.data || []).filter((u: any) => {
            const roles = [
              "penguji",
              "pewawancara_calsan",
              "pewawancara_cawalsan",
              "penguji_hafalan",
              "penguji_bahasa_arab",
            ];
            let secRoles: string[] = [];
            if (Array.isArray(u.secondary_roles)) {
              secRoles = u.secondary_roles;
            } else if (typeof u.secondary_roles === "string") {
              try {
                secRoles = JSON.parse(u.secondary_roles);
              } catch (e) {}
            }
            return (
              roles.includes(u.role) ||
              (Array.isArray(secRoles) && secRoles.some((r: string) => roles.includes(r)))
            );
          });
          setExaminers(filtered);
        }
      } catch (e) {
        console.error("Error fetching examiners", e);
      }
    };
    fetchExaminers();
  }, [initialExaminers]);

  // Fetch Slots
  const fetchSlots = useCallback(async () => {
    try {
      setLoadingSlots(true);
      let url = "/api/exam-sessions";
      if (filterCreatorId) {
        url += `?creator_id=${filterCreatorId}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setSlots(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  }, [filterCreatorId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Update end_time automatically when title or start_time changes in Single Slot Form
  useEffect(() => {
    if (slotForm.start_time && slotForm.title) {
      setSlotForm((prev) => ({
        ...prev,
        end_time: calculateEndTime(prev.start_time, prev.title),
      }));
    }
  }, [slotForm.start_time, slotForm.title]);

  // Single Slot Create Handler
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.date || !slotForm.start_time || !slotForm.end_time) {
      Swal.fire("Lengkapi Form", "Mohon lengkapi tanggal dan jam mulai/selesai!", "warning");
      return;
    }

    setSubmittingSlot(true);
    try {
      const startDateTime = new Date(`${slotForm.date}T${slotForm.start_time}:00`);
      const endDateTime = new Date(`${slotForm.date}T${slotForm.end_time}:00`);

      if (endDateTime <= startDateTime) {
        Swal.fire("Jam Tidak Valid", "Jam selesai harus lebih besar dari jam mulai!", "warning");
        setSubmittingSlot(false);
        return;
      }

      const payload: any = {
        title: slotForm.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        quota: Number(slotForm.quota) || 1,
        location: slotForm.location || "Online",
        notes: slotForm.notes,
      };

      if (slotForm.creator_id) {
        payload.creator_id = slotForm.creator_id;
      } else if (filterCreatorId) {
        payload.creator_id = filterCreatorId;
      }

      const res = await fetch("/api/exam-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Sesi ketersediaan berhasil dibuat.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setIsSlotModalOpen(false);
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal membuat sesi");
      }
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setSubmittingSlot(false);
    }
  };

  // Bulk Create Handler
  const handleCreateBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkForm.selectedDays.length === 0) {
      Swal.fire("Pilih Hari", "Pilih minimal satu hari dalam sepekan!", "warning");
      return;
    }
    if (!bulkForm.endDate) {
      Swal.fire("Pilih Tanggal Berakhir", "Tentukan tanggal berakhir sesi massal!", "warning");
      return;
    }

    const daySlotsToSend: Record<number, any[]> = {};
    bulkForm.selectedDays.forEach((day) => {
      daySlotsToSend[day] = bulkForm.daySlots[day] || [];
    });

    setSubmittingBulk(true);
    try {
      const payload: any = {
        ...bulkForm,
        daySlots: daySlotsToSend,
      };
      if (bulkForm.creator_id) {
        payload.creator_id = bulkForm.creator_id;
      } else if (filterCreatorId) {
        payload.creator_id = filterCreatorId;
      }

      const res = await fetch("/api/exam-sessions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        Swal.fire("Berhasil!", result.message || "Sesi massal berhasil dibuat.", "success");
        setIsBulkModalOpen(false);
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal membuat sesi massal");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setSubmittingBulk(false);
    }
  };

  // Single Slot Delete
  const handleDeleteSlot = async (slotId: string, title?: string | null) => {
    const confirm = await Swal.fire({
      title: "Hapus Sesi?",
      text: `Sesi "${title || "Ujian"}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/exam-sessions?id=${slotId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Terhapus!",
          text: "Sesi berhasil dihapus.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal menghapus sesi");
      }
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    }
  };

  // Single Slot Edit Open
  const openEditModal = (slot: ExamSession) => {
    setEditingSlot(slot);
    const sDate = new Date(slot.start_time);
    const eDate = new Date(slot.end_time);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${sDate.getFullYear()}-${pad(sDate.getMonth() + 1)}-${pad(sDate.getDate())}`;
    const startTimeStr = `${pad(sDate.getHours())}:${pad(sDate.getMinutes())}`;
    const endTimeStr = `${pad(eDate.getHours())}:${pad(eDate.getMinutes())}`;

    setEditForm({
      title: slot.title || "",
      date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      location: slot.location || "Online",
      notes: slot.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Single Slot Edit Save
  const handleEditSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setSubmittingEdit(true);
    try {
      const startDateTime = new Date(`${editForm.date}T${editForm.start_time}:00`);
      const endDateTime = new Date(`${editForm.date}T${editForm.end_time}:00`);

      if (endDateTime <= startDateTime) {
        Swal.fire("Jam Tidak Valid", "Jam selesai harus lebih besar dari jam mulai!", "warning");
        setSubmittingEdit(false);
        return;
      }

      const res = await fetch("/api/exam-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSlot.id,
          title: editForm.title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: editForm.location,
          notes: editForm.notes,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Tersimpan!",
          text: "Perubahan sesi berhasil disimpan.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
        setIsEditModalOpen(false);
        setEditingSlot(null);
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal mengubah sesi");
      }
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Bulk Edit Save
  const handleBulkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotIds.size === 0) return;

    setSubmittingBulkEdit(true);
    try {
      const res = await fetch("/api/exam-sessions/bulk-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_ids: Array.from(selectedSlotIds),
          ...bulkEditForm,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire("Berhasil!", result.message || "Perubahan massal berhasil diterapkan.", "success");
        setIsBulkEditModalOpen(false);
        setIsSelectMode(false);
        setSelectedSlotIds(new Set());
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal memperbarui sesi massal");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message, "error");
    } finally {
      setSubmittingBulkEdit(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedSlotIds.size === 0) return;

    const confirm = await Swal.fire({
      title: `Hapus ${selectedSlotIds.size} Sesi?`,
      text: "Seluruh sesi terpilih yang belum terisi calon santri akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/api/exam-sessions/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_ids: Array.from(selectedSlotIds),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire("Terhapus!", result.message || "Sesi berhasil dihapus.", "success");
        setIsSelectMode(false);
        setSelectedSlotIds(new Set());
        fetchSlots();
        if (onRefreshPlotting) onRefreshPlotting();
      } else {
        throw new Error(result.error || "Gagal menghapus sesi massal");
      }
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    }
  };

  // Selection Toggles
  const toggleSelectSlot = (id: string) => {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const unbookedSlots = filteredSlots.filter((s) => (s._count?.bookings || 0) === 0);
    if (selectedSlotIds.size === unbookedSlots.length) {
      setSelectedSlotIds(new Set());
    } else {
      setSelectedSlotIds(new Set(unbookedSlots.map((s) => s.id)));
    }
  };

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Search
      const term = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (slot.title && slot.title.toLowerCase().includes(term)) ||
        (slot.creator?.full_name && slot.creator.full_name.toLowerCase().includes(term)) ||
        (slot.location && slot.location.toLowerCase().includes(term));

      // Status
      const booked = (slot._count?.bookings || 0) >= slot.quota;
      let matchStatus = true;
      if (statusFilter === "available") matchStatus = !booked;
      if (statusFilter === "booked") matchStatus = booked;

      return matchSearch && matchStatus;
    });
  }, [slots, searchQuery, statusFilter]);

  // Format Date & Time
  const formatSlotDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSlotTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Actions Card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-stone-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filter Penguji */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={filterCreatorId}
                onChange={(e) => setFilterCreatorId(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Semua Ustadz Penguji</option>
                {examiners.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-primary-700 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Semua ({slots.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("available")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "available"
                    ? "bg-white text-emerald-700 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Tersedia ({slots.filter((s) => (s._count?.bookings || 0) < s.quota).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("booked")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "booked"
                    ? "bg-white text-amber-700 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Terisi ({slots.filter((s) => (s._count?.bookings || 0) >= s.quota).length})
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {!isSelectMode ? (
              <>
                {slots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsSelectMode(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl font-bold text-xs transition-all whitespace-nowrap"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Pilih Massal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (filterCreatorId) {
                      setBulkForm((p) => ({ ...p, creator_id: filterCreatorId }));
                    }
                    setIsBulkModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-black text-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Massal (Batch)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (filterCreatorId) {
                      setSlotForm((p) => ({ ...p, creator_id: filterCreatorId }));
                    }
                    setIsSlotModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs shadow-md shadow-primary-600/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Sesi Tunggal
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl font-bold text-xs hover:bg-primary-100 transition-all"
                >
                  {selectedSlotIds.size > 0 &&
                  selectedSlotIds.size ===
                    filteredSlots.filter((s) => (s._count?.bookings || 0) === 0).length ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  Pilih Semua ({selectedSlotIds.size})
                </button>
                <button
                  type="button"
                  disabled={selectedSlotIds.size === 0}
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs hover:bg-amber-100 transition-all disabled:opacity-50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Terpilih
                </button>
                <button
                  type="button"
                  disabled={selectedSlotIds.size === 0}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Terpilih
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedSlotIds(new Set());
                  }}
                  className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-200 transition-all"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul sesi, nama ustadz penguji, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Grid of Slots */}
      {loadingSlots ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-xs font-bold text-stone-500">Memuat sesi ketersediaan penguji...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-100 shadow-sm">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-stone-900 mb-1">
            Belum Ada Sesi Ketersediaan
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
            {filterCreatorId
              ? "Ustadz penguji yang dipilih belum memiliki slot waktu ketersediaan."
              : "Belum ada slot waktu luang penguji yang dibuat. Klik tombol di bawah untuk membuat sesi."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (filterCreatorId) setBulkForm((p) => ({ ...p, creator_id: filterCreatorId }));
                setIsBulkModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-all"
            >
              + Buat Massal (Batch)
            </button>
            <button
              onClick={() => {
                if (filterCreatorId) setSlotForm((p) => ({ ...p, creator_id: filterCreatorId }));
                setIsSlotModalOpen(true);
              }}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs shadow-md shadow-primary-600/20 transition-all"
            >
              + Buat Sesi Tunggal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const isBooked = (slot._count?.bookings || 0) >= slot.quota;
            const isSelected = selectedSlotIds.has(slot.id);

            return (
              <div
                key={slot.id}
                onClick={
                  isSelectMode && !isBooked ? () => toggleSelectSlot(slot.id) : undefined
                }
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all relative ${
                  isSelectMode && !isBooked ? "cursor-pointer hover:border-primary-400" : ""
                } ${
                  isSelected
                    ? "border-primary-500 ring-2 ring-primary-200 bg-primary-50/20"
                    : "border-stone-100 hover:shadow-md"
                }`}
              >
                {/* Select checkbox overlay */}
                {isSelectMode && (
                  <div className="absolute top-4 right-4 z-10">
                    {isBooked ? (
                      <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded-md font-bold">
                        Terisi
                      </span>
                    ) : isSelected ? (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="pr-8">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide mb-1.5 ${
                        isBooked
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isBooked ? "Sudah Diplot / Terisi" : "Tersedia (Siap Diplot)"}
                    </span>
                    <h4 className="font-black text-stone-900 text-sm leading-snug">
                      {slot.title || "Sesi Ujian"}
                    </h4>
                    {slot.creator?.full_name && (
                      <p className="text-[11px] font-bold text-primary-700 mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-primary-600 shrink-0" />
                        Penguji: {slot.creator.full_name}
                      </p>
                    )}
                  </div>

                  {/* Time & Location */}
                  <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/80 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-bold">{formatSlotDate(slot.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-black text-stone-900">
                        {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.location?.toLowerCase().includes("meet") ||
                      slot.location?.toLowerCase().includes("online") ? (
                        <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {slot.location || "Online (Google Meet)"}
                      </span>
                    </div>
                  </div>

                  {slot.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg">
                      &quot;{slot.notes}&quot;
                    </p>
                  )}

                  {/* Card Actions */}
                  {!isSelectMode && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-400">
                        Kuota: {slot._count?.bookings || 0} / {slot.quota} Santri
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(slot)}
                          className="p-1.5 text-stone-500 hover:text-primary-700 hover:bg-stone-100 rounded-lg transition-all"
                          title="Edit Sesi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleDeleteSlot(slot.id, slot.title)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                          title={
                            isBooked
                              ? "Tidak dapat menghapus sesi yang sudah terisi santri"
                              : "Hapus Sesi"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: BUAT SESI TUNGGAL */}
      {isSlotModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  Buat Sesi Ketersediaan Tunggal
                </h3>
                <p className="text-xs text-stone-500 font-bold mt-0.5">
                  Buka slot waktu luang untuk seorang ustadz penguji
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              {/* Ustadz Penguji */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Ustadz Penguji
                </label>
                <select
                  value={slotForm.creator_id}
                  onChange={(e) => setSlotForm({ ...slotForm, creator_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">-- Buat Atas Nama Akun Anda Sendiri --</option>
                  {examiners.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul / Jenis Sesi */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Jenis Ujian / Judul Sesi
                </label>
                <select
                  value={slotForm.title}
                  onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Seleksi Al Qur'an">Seleksi Al Qur&apos;an</option>
                  <option value="Seleksi Wawancara Calon Santri">
                    Seleksi Wawancara Calon Santri
                  </option>
                  <option value="Seleksi Wawancara Orang Tua">
                    Seleksi Wawancara Orang Tua/Wali
                  </option>
                  <option value="Tes Hafalan Al-Qur'an">Tes Hafalan Al-Qur&apos;an</option>
                  <option value="Tes Lisan Bahasa Arab">Tes Lisan Bahasa Arab</option>
                  <option value="Sesi Ujian Terpadu">Sesi Ujian Terpadu (Semua Materi)</option>
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Tanggal Ujian
                </label>
                <input
                  type="date"
                  required
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {/* Waktu Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Jam Mulai (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Jam Selesai (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Lokasi & Kuota */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Lokasi / Metode
                  </label>
                  <input
                    type="text"
                    value={slotForm.location}
                    onChange={(e) => setSlotForm({ ...slotForm, location: e.target.value })}
                    placeholder="Online (Google Meet) / Offline"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Kuota Santri
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={slotForm.quota}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, quota: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={slotForm.notes}
                  onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                  placeholder="Catatan tambahan untuk santri / penguji..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {submittingSlot ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT SESI MASSAL (BATCH) */}
      {isBulkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  Batch Generator Sesi Ketersediaan
                </h3>
                <p className="text-xs text-stone-500 font-bold mt-0.5">
                  Buat puluhan slot sesi sekaligus secara otomatis per pekan
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateBulk}
              className="p-6 space-y-5 overflow-y-auto custom-scrollbar"
            >
              {/* Ustadz Penguji */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Ustadz Penguji
                </label>
                <select
                  value={bulkForm.creator_id}
                  onChange={(e) => setBulkForm({ ...bulkForm, creator_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">-- Buat Atas Nama Akun Anda Sendiri --</option>
                  {examiners.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul / Jenis Sesi */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Jenis Ujian / Judul Sesi
                </label>
                <select
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Seleksi Al Qur'an">Seleksi Al Qur&apos;an</option>
                  <option value="Seleksi Wawancara Calon Santri">
                    Seleksi Wawancara Calon Santri
                  </option>
                  <option value="Seleksi Wawancara Orang Tua">
                    Seleksi Wawancara Orang Tua/Wali
                  </option>
                  <option value="Tes Hafalan Al-Qur'an">Tes Hafalan Al-Qur&apos;an</option>
                  <option value="Tes Lisan Bahasa Arab">Tes Lisan Bahasa Arab</option>
                  <option value="Sesi Ujian Terpadu">Sesi Ujian Terpadu</option>
                </select>
              </div>

              {/* Rentang Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkForm.startDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkForm.endDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Pilihan Hari Aktif */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-2">
                  Hari Berulang Dalam Sepekan
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    { id: 0, label: "Ahad" },
                    { id: 1, label: "Senin" },
                    { id: 2, label: "Selasa" },
                    { id: 3, label: "Rabu" },
                    { id: 4, label: "Kamis" },
                    { id: 5, label: "Jum'at" },
                    { id: 6, label: "Sabtu" },
                  ].map((d) => {
                    const isSelected = bulkForm.selectedDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? bulkForm.selectedDays.filter((x) => x !== d.id)
                            : [...bulkForm.selectedDays, d.id];
                          setBulkForm({ ...bulkForm, selectedDays: next });
                          if (!isSelected) setActiveDay(d.id);
                        }}
                        className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all border ${
                          isSelected
                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Jam Per Hari Terpilih */}
              {bulkForm.selectedDays.length > 0 && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-800">
                      Slot Jam untuk Hari:
                    </span>
                    <div className="flex gap-1">
                      {bulkForm.selectedDays.map((dayId) => {
                        const dayNames = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
                        return (
                          <button
                            key={dayId}
                            type="button"
                            onClick={() => setActiveDay(dayId)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                              activeDay === dayId
                                ? "bg-stone-900 text-white"
                                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                            }`}
                          >
                            {dayNames[dayId]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* List of slots for activeDay */}
                  <div className="space-y-2">
                    {(bulkForm.daySlots[activeDay] || []).map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            const newEnd = calculateEndTime(newStart, bulkForm.title);
                            const current = [...(bulkForm.daySlots[activeDay] || [])];
                            current[idx] = { start: newStart, end: newEnd };
                            setBulkForm({
                              ...bulkForm,
                              daySlots: { ...bulkForm.daySlots, [activeDay]: current },
                            });
                          }}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold"
                        />
                        <span className="text-xs font-black text-stone-400">s/d</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const current = [...(bulkForm.daySlots[activeDay] || [])];
                            current[idx] = { ...current[idx], end: e.target.value };
                            setBulkForm({
                              ...bulkForm,
                              daySlots: { ...bulkForm.daySlots, [activeDay]: current },
                            });
                          }}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = (bulkForm.daySlots[activeDay] || []).filter(
                              (_, i) => i !== idx
                            );
                            setBulkForm({
                              ...bulkForm,
                              daySlots: { ...bulkForm.daySlots, [activeDay]: current },
                            });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const current = bulkForm.daySlots[activeDay] || [];
                        const lastSlot = current[current.length - 1];
                        const nextStart = lastSlot ? lastSlot.end : "08:00";
                        const nextEnd = calculateEndTime(nextStart, bulkForm.title);
                        setBulkForm({
                          ...bulkForm,
                          daySlots: {
                            ...bulkForm.daySlots,
                            [activeDay]: [...current, { start: nextStart, end: nextEnd }],
                          },
                        });
                      }}
                      className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Slot Jam
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingBulk}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {submittingBulk ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Sesi Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SESI TUNGGAL */}
      {isEditModalOpen && editingSlot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">Edit Sesi</h3>
                <p className="text-xs text-stone-500 font-bold mt-0.5">
                  {editingSlot.title || "Sesi Ujian"}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Judul Sesi
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Tanggal Ujian
                </label>
                <input
                  type="date"
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Lokasi / Link Meet
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {submittingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK EDIT */}
      {isBulkEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain custom-scrollbar"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  Edit ${selectedSlotIds.size} Sesi Sekaligus
                </h3>
                <p className="text-xs text-stone-500 font-bold mt-0.5">
                  Centang bagian yang ingin Anda ubah secara massal
                </p>
              </div>
              <button
                onClick={() => setIsBulkEditModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkEdit} className="space-y-4">
              {/* Checkbox Ubah Jam */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeTime}
                    onChange={(e) =>
                      setBulkEditForm({ ...bulkEditForm, changeTime: e.target.checked })
                    }
                    className="rounded text-primary-600"
                  />
                  Ubah Jam Mulai &amp; Selesai
                </label>
                {bulkEditForm.changeTime && (
                  <div className="grid grid-cols-2 gap-2 pl-6">
                    <input
                      type="time"
                      value={bulkEditForm.start_time}
                      onChange={(e) =>
                        setBulkEditForm({ ...bulkEditForm, start_time: e.target.value })
                      }
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="time"
                      value={bulkEditForm.end_time}
                      onChange={(e) =>
                        setBulkEditForm({ ...bulkEditForm, end_time: e.target.value })
                      }
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Checkbox Ubah Lokasi */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeLocation}
                    onChange={(e) =>
                      setBulkEditForm({ ...bulkEditForm, changeLocation: e.target.checked })
                    }
                    className="rounded text-primary-600"
                  />
                  Ubah Lokasi / Link Meet
                </label>
                {bulkEditForm.changeLocation && (
                  <div className="pl-6">
                    <input
                      type="text"
                      placeholder="Online (Google Meet) / Offline"
                      value={bulkEditForm.location}
                      onChange={(e) =>
                        setBulkEditForm({ ...bulkEditForm, location: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Checkbox Ubah Catatan */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeNotes}
                    onChange={(e) =>
                      setBulkEditForm({ ...bulkEditForm, changeNotes: e.target.checked })
                    }
                    className="rounded text-primary-600"
                  />
                  Ubah Catatan
                </label>
                {bulkEditForm.changeNotes && (
                  <div className="pl-6">
                    <textarea
                      rows={2}
                      placeholder="Catatan untuk seluruh sesi terpilih..."
                      value={bulkEditForm.notes}
                      onChange={(e) =>
                        setBulkEditForm({ ...bulkEditForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    submittingBulkEdit ||
                    (!bulkEditForm.changeTime &&
                      !bulkEditForm.changeLocation &&
                      !bulkEditForm.changeNotes)
                  }
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-black rounded-xl text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {submittingBulkEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Terapkan Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
