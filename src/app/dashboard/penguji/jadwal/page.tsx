"use client";

import { useState, useEffect, useMemo } from "react";
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
  Save,
  Trophy,
  AlertCircle,
  Edit2,
  CheckSquare,
  Square,
  Layers,
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

const ROLE_TO_JADWAL_TYPES: Record<string, string[]> = {
  penguji: ["Seleksi Al Qur'an"],
  penguji_hafalan: ["Seleksi Hafalan Al-Qur'an"],
  penguji_bahasa_arab: ["Seleksi Lisan Bahasa Arab"],
  pewawancara_calsan: ["Seleksi Wawancara Calon Santri"],
  pewawancara_cawalsan: ["Seleksi Wawancara Orang Tua"],
  admin: [
    "Seleksi Hafalan Al-Qur'an",
    "Seleksi Lisan Bahasa Arab",
    "Seleksi Al Qur'an",
    "Seleksi Wawancara Calon Santri",
    "Seleksi Wawancara Orang Tua/Wali",
  ],
  admin_super: [
    "Seleksi Hafalan Al-Qur'an",
    "Seleksi Lisan Bahasa Arab",
    "Seleksi Al Qur'an",
    "Seleksi Wawancara Calon Santri",
    "Seleksi Wawancara Orang Tua/Wali",
  ],
};

// Auto-map role to session title (for specific examiner roles)
const ROLE_TO_SESSION_TITLE: Record<string, string> = {
  penguji: "Tes Al-Quran",
  penguji_hafalan: "Tes Hafalan Al-Qur'an",
  penguji_bahasa_arab: "Tes Lisan Bahasa Arab",
  pewawancara_calsan: "Seleksi Wawancara Calon Santri",
  pewawancara_cawalsan: "Seleksi Wawancara Orang Tua",
};

// Roles that can choose any session type (need dropdown)
const ADMIN_ROLES = ["admin", "admin_super"];

export default function JadwalPengujiPage() {
  const [activeTab, setActiveTab] = useState<"assigned" | "slots">("assigned");
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
  const [selectedPendaftar, setSelectedPendaftar] = useState<
    JadwalAssignment["pendaftar"] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getDurationFromTitle = (title: string) => {
    const t = (title || "").toLowerCase();
    if (t.includes("quran") || t.includes("qur'an")) return 30;
    if (t.includes("calon santri") || t.includes("calsan")) return 30;
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

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Impersonate state
  const [pengujiList, setPengujiList] = useState<any[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");

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

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ExamSession | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    start_time: "08:00",
    end_time: "09:00",
    location: "",
    notes: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Multi-Select / Bulk Edit State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<
    "edit" | "delete" | null
  >(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(
    new Set(),
  );
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [bulkForm, setBulkForm] = useState({
    title: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    selectedDays: [] as number[], // 0=Sun, 1=Mon, etc.
    daySlots: {} as Record<number, { start: string; end: string }[]>,
    notes: "",
  });

  // Grouping Logic
  const displaySlots = useMemo(() => {
    const groups: Record<string, any> = {};

    slots.forEach((slot) => {
      const key = `${slot.title}|${slot.start_time}|${slot.end_time}|${slot.location}`;
      if (!groups[key]) {
        groups[key] = {
          ...slot,
          ids: [slot.id],
          totalBookings: slot._count?.bookings || 0,
          totalQuota: slot.quota,
        };
      } else {
        groups[key].ids.push(slot.id);
        groups[key].totalBookings += slot._count?.bookings || 0;
        groups[key].totalQuota += slot.quota;
      }
    });

    // Only show slots that have at least one available space
    return Object.values(groups)
      .filter((g: any) => g.totalBookings < g.totalQuota)
      .sort(
        (a: any, b: any) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );
  }, [slots]);

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
      const response = await fetch(
        "/api/exam-sessions?creator_id=me&is_active=true",
      );
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

    if (activeTab === "assigned") fetchAssignments();
    if (activeTab === "slots") fetchSlots();
  }, [activeTab]);

  useEffect(() => {
    if (["admin_super", "admin"].includes(activeRole)) {
      const fetchPenguji = async () => {
        try {
          const res = await fetch("/api/admin/users");
          if (res.ok) {
            const data = await res.json();
            const filtered = (data.data || []).filter((u: any) => {
              const roles = ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"];
              
              let secRoles: string[] = [];
              if (Array.isArray(u.secondary_roles)) {
                secRoles = u.secondary_roles;
              } else if (typeof u.secondary_roles === 'string') {
                try { secRoles = JSON.parse(u.secondary_roles); } catch (e) {}
              }
              
              return roles.includes(u.role) || (Array.isArray(secRoles) && secRoles.some((r: string) => roles.includes(r)));
            });
            setPengujiList(filtered);
          }
        } catch (e) {
          console.error("Error fetching penguji list", e);
        }
      };
      fetchPenguji();
    }
  }, [activeRole]);

  // Auto-set session title and duration from role when role is known
  useEffect(() => {
    const autoTitle = ROLE_TO_SESSION_TITLE[activeRole];
    if (autoTitle) {
      setSlotForm((prev) => ({
        ...prev,
        title: autoTitle,
        end_time: calculateEndTime(prev.start_time, autoTitle),
      }));
      setBulkForm((prev) => ({ ...prev, title: autoTitle }));
    }
  }, [activeRole]);

  // Update end_time when title changes (for admins or manual selection)
  useEffect(() => {
    if (slotForm.title) {
      setSlotForm((prev) => ({
        ...prev,
        end_time: calculateEndTime(prev.start_time, prev.title),
      }));
    }
  }, [slotForm.title]);

  useEffect(() => {
    if (bulkForm.title && isBulkModalOpen) {
      setBulkForm((prev) => {
        const newDaySlots = { ...prev.daySlots };
        Object.keys(newDaySlots).forEach((day) => {
          const dayId = Number(day);
          newDaySlots[dayId] = newDaySlots[dayId].map((slot) => ({
            ...slot,
            end: calculateEndTime(slot.start, prev.title),
          }));
        });
        return { ...prev, daySlots: newDaySlots };
      });
    }
  }, [bulkForm.title, isBulkModalOpen]);

  // Initialize active day's slots if empty when modal opens or activeDay changes
  useEffect(() => {
    if (isBulkModalOpen) {
      if (!bulkForm.daySlots[activeDay]) {
        setBulkForm((prev) => ({
          ...prev,
          daySlots: {
            ...prev.daySlots,
            [activeDay]: [
              {
                start: "08:00",
                end: calculateEndTime("08:00", prev.title),
              },
            ],
          },
        }));
      }
    }
  }, [isBulkModalOpen, activeDay, activeRole]);

  // --- Handlers ---

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSlot(true);
    setMessage(null);

    try {
      // Combine date and time
      const startDateTime = new Date(
        `${slotForm.date}T${slotForm.start_time}:00`,
      );
      const endDateTime = new Date(`${slotForm.date}T${slotForm.end_time}:00`);

      // Validate end time
      const diffMinutes =
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      if (diffMinutes <= 0) {
        setMessage({
          type: "error",
          text: "Jam selesai harus lebih besar dari jam mulai.",
        });
        setSubmittingSlot(false);
        return;
      }
      if (diffMinutes > 60) {
        setMessage({
          type: "error",
          text: "Durasi maksimal 1 jam (60 menit).",
        });
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
        setSlotForm((prev) => ({ ...prev, title: "", notes: "" }));
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
      Swal.fire("Pilih Hari", "Pilih minimal satu hari!", "warning");
      return;
    }
    if (!bulkForm.endDate) {
      Swal.fire("Pilih Tanggal", "Pilih tanggal berakhir!", "warning");
      return;
    }

    // Filter daySlots to only include selectedDays
    const daySlotsToSend: Record<number, any[]> = {};
    bulkForm.selectedDays.forEach((day) => {
      daySlotsToSend[day] = bulkForm.daySlots[day] || [];
    });

    setSubmittingBulk(true);
    try {
      const res = await fetch("/api/exam-sessions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bulkForm,
          daySlots: daySlotsToSend,
          creator_id: (["admin_super", "admin"].includes(activeRole) && selectedCreatorId) ? selectedCreatorId : undefined,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        Swal.fire("Berhasil!", result.message, "success");
        setIsBulkModalOpen(false);
        fetchSlots();
      } else {
        Swal.fire("Gagal!", result.error, "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("Error!", "Terjadi kesalahan sistem", "error");
    } finally {
      setSubmittingBulk(false);
    }
  };

  const addTimeSlot = () => {
    const currentSlots = bulkForm.daySlots[activeDay] || [];
    let newStart = "08:00";
    if (currentSlots.length > 0) {
      newStart = currentSlots[currentSlots.length - 1].end;
    }
    setBulkForm({
      ...bulkForm,
      daySlots: {
        ...bulkForm.daySlots,
        [activeDay]: [
          ...currentSlots,
          {
            start: newStart,
            end: calculateEndTime(newStart, bulkForm.title),
          },
        ],
      },
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
        [activeDay]: newSlots,
      },
    });
  };

  const toggleDay = (day: number) => {
    const current = [...bulkForm.selectedDays];

    // Case 1: Day is not selected -> Select it and make it active
    if (!current.includes(day)) {
      const newSelected = [...current, day];

      // Initialize slots for this day if they don't exist
      if (!bulkForm.daySlots[day]) {
        setBulkForm((prev) => ({
          ...prev,
          selectedDays: newSelected,
          daySlots: {
            ...prev.daySlots,
            [day]: prev.daySlots[activeDay]
              ? JSON.parse(JSON.stringify(prev.daySlots[activeDay]))
              : [
                  {
                    start: "08:00",
                    end: calculateEndTime("08:00", prev.title),
                  },
                ],
          },
        }));
      } else {
        setBulkForm((prev) => ({ ...prev, selectedDays: newSelected }));
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
    const newSelected = current.filter((d) => d !== day);
    setBulkForm((prev) => ({ ...prev, selectedDays: newSelected }));

    // If we have other days selected, pick one to be the new active day
    if (newSelected.length > 0) {
      setActiveDay(newSelected[0]);
    }
  };

  const copySlotsToAll = () => {
    const currentSlots = bulkForm.daySlots[activeDay] || [];
    const newDaySlots = { ...bulkForm.daySlots };
    bulkForm.selectedDays.forEach((day) => {
      newDaySlots[day] = JSON.parse(JSON.stringify(currentSlots));
    });
    setBulkForm({ ...bulkForm, daySlots: newDaySlots });
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Disalin ke semua hari terpilih",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleOpenEdit = (slot: ExamSession) => {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    const toLocalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const toLocalTime = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setEditingSlot(slot);
    setEditForm({
      date: toLocalDate(start),
      start_time: toLocalTime(start),
      end_time: toLocalTime(end),
      location: slot.location || "",
      notes: slot.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    setSubmittingEdit(true);
    try {
      const startDateTime = new Date(
        `${editForm.date}T${editForm.start_time}:00`,
      );
      const endDateTime = new Date(`${editForm.date}T${editForm.end_time}:00`);
      const diffMinutes =
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      if (diffMinutes <= 0) {
        setMessage({
          type: "error",
          text: "Jam selesai harus lebih besar dari jam mulai.",
        });
        setSubmittingEdit(false);
        return;
      }
      const response = await fetch(`/api/exam-sessions?id=${editingSlot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingSlot.title,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: editForm.location || "Online",
          notes: editForm.notes,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Sesi berhasil diperbarui!" });
        setIsEditModalOpen(false);
        setEditingSlot(null);
        fetchSlots();
      } else {
        throw new Error(result.error || "Gagal memperbarui sesi");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const toggleSelectSlot = (ids: string[]) => {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSlotIds.size === displaySlots.reduce((acc, s: any) => acc + s.ids.length, 0)) {
      setSelectedSlotIds(new Set());
    } else {
      const allIds = displaySlots.flatMap((s: any) => s.ids);
      setSelectedSlotIds(new Set(allIds));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setBulkActionType(null);
    setSelectedSlotIds(new Set());
  };

  // Quick-select: pilih semua slot dengan jam mulai yang sama
  const selectByTime = (startHHMM: string) => {
    const matchingGroups = displaySlots.filter((s: any) => {
      const d = new Date(s.start_time);
      const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return hhmm === startHHMM;
    });
    
    const allIds = matchingGroups.flatMap((g: any) => g.ids);
    const allSelected = allIds.every((id) => selectedSlotIds.has(id));

    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) =>
        allSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });
  };

  // Dapatkan daftar jam unik dari slots untuk quick-select chips
  const uniqueTimesForChips = Array.from(
    slots
      .filter((s) => (s._count?.bookings || 0) === 0)
      .reduce((map, slot) => {
        const start = new Date(slot.start_time);
        const end = new Date(slot.end_time);
        const hhmm = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
        const label = `${String(start.getHours()).padStart(2, "0")}.${String(start.getMinutes()).padStart(2, "0")} – ${String(end.getHours()).padStart(2, "0")}.${String(end.getMinutes()).padStart(2, "0")}`;
        if (!map.has(hhmm)) map.set(hhmm, { hhmm, label, count: 0 });
        map.get(hhmm)!.count++;
        return map;
      }, new Map<string, { hhmm: string; label: string; count: number }>())
      .values(),
  ).sort((a, b) => a.hhmm.localeCompare(b.hhmm));

  const handleBulkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlotIds.size === 0) return;
    setSubmittingBulkEdit(true);

    const idsToUpdate = Array.from(selectedSlotIds);
    let successCount = 0;
    let errorCount = 0;

    for (const slotId of idsToUpdate) {
      // Build patch payload from selected slot + form overrides
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) continue;

      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);

      // If changing time, build new datetimes on same date
      let newStart = start;
      let newEnd = end;
      if (
        bulkEditForm.changeTime &&
        bulkEditForm.start_time &&
        bulkEditForm.end_time
      ) {
        const dateStr = start.toISOString().split("T")[0];
        newStart = new Date(`${dateStr}T${bulkEditForm.start_time}:00`);
        newEnd = new Date(`${dateStr}T${bulkEditForm.end_time}:00`);
      }

      const payload: Record<string, any> = {
        title: slot.title,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      };
      if (bulkEditForm.changeLocation)
        payload.location = bulkEditForm.location || "Online";
      if (bulkEditForm.changeNotes) payload.notes = bulkEditForm.notes;

      try {
        const res = await fetch(`/api/exam-sessions?id=${slotId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) successCount++;
        else errorCount++;
      } catch {
        errorCount++;
      }
    }

    setSubmittingBulkEdit(false);
    setIsBulkEditModalOpen(false);
    exitSelectMode();
    fetchSlots();

    if (errorCount === 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${successCount} sesi berhasil diperbarui!`,
        showConfirmButton: false,
        timer: 2500,
      });
    } else {
      Swal.fire(
        "Selesai",
        `${successCount} berhasil, ${errorCount} gagal.`,
        "warning",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSlotIds.size === 0) return;

    const idsToDelete = Array.from(selectedSlotIds);
    const slotsToDelete = slots.filter((s) => idsToDelete.includes(s.id));
    const emptySlots = slotsToDelete.filter(
      (s) => (s._count?.bookings || 0) === 0,
    );
    const bookedSlots = slotsToDelete.length - emptySlots.length;

    if (emptySlots.length === 0) {
      Swal.fire(
        "Gagal!",
        "Semua sesi yang dipilih sudah ada pendaftar dan tidak dapat dihapus.",
        "error",
      );
      return;
    }

    let textMsg = `Apakah Anda yakin ingin menghapus ${emptySlots.length} sesi kosong?`;
    if (bookedSlots > 0) {
      textMsg += `\n\n(${bookedSlots} sesi diabaikan karena sudah ada pendaftar)`;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Hapus Sesi Terpilih?",
      text: textMsg,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    // Use a custom state if you want a loading spinner, or just rely on SweetAlert
    Swal.fire({
      title: "Menghapus...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    let successCount = 0;
    let errorCount = 0;

    for (const slot of emptySlots) {
      try {
        const res = await fetch(`/api/exam-sessions?id=${slot.id}`, {
          method: "DELETE",
        });
        if (res.ok) successCount++;
        else errorCount++;
      } catch {
        errorCount++;
      }
    }

    exitSelectMode();
    fetchSlots();

    if (errorCount === 0) {
      Swal.fire(
        "Terhapus!",
        `${successCount} sesi berhasil dihapus.`,
        "success",
      );
    } else {
      Swal.fire(
        "Selesai",
        `${successCount} berhasil dihapus, ${errorCount} gagal.`,
        "warning",
      );
    }
  };

  const handleDeleteGroup = async (ids: string[], count: number) => {
    if (count > 0) {
      Swal.fire(
        "Gagal!",
        "Terdapat sesi dalam grup ini yang sudah ada pendaftar!",
        "error",
      );
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Hapus Grup Sesi?",
      text: `Apakah Anda yakin ingin menghapus ${ids.length} sesi waktu dalam grup ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Menghapus...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    let successCount = 0;
    for (const id of ids) {
      try {
        const response = await fetch(`/api/exam-sessions?id=${id}`, {
          method: "DELETE",
        });
        if (response.ok) successCount++;
      } catch (error: any) {}
    }

    Swal.close();
    if (successCount > 0) {
      setMessage({ type: "success", text: `${successCount} sesi berhasil dihapus` });
      fetchSlots();
    }
  };

  const handleCompleteExam = async (jadwalId: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "Tandai Selesai?",
      text: "Apakah Anda yakin ingin menandai ujian ini selesai? Status akan diperbarui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669", // green-600
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Tandai Selesai!",
      cancelButtonText: "Batal",
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
            title: "Selesai!",
            text: "Semua rangkaian ujian santri ini telah SELESAI! Notifikasi telah dikirim.",
            icon: "success",
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

  const handleCancelAssignment = async (
    jadwalId: string,
    pendaftarNama: string,
  ) => {
    const { value: reason } = await Swal.fire({
      title: "Batalkan Jadwal?",
      text: `Apakah Anda yakin ingin membatalkan jadwal ${pendaftarNama}? Santri akan mendapatkan notifikasi untuk memilih jadwal ulang dan slot waktu Anda akan dihapus.`,
      icon: "warning",
      input: "text",
      inputLabel: "Alasan Pembatalan (Opsional)",
      inputPlaceholder: "Ustadz Berhalangan Hadir",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Batalkan!",
      cancelButtonText: "Kembali",
    });

    if (reason === undefined) return; // User cancelled the modal

    try {
      setLoadingAssignments(true);
      const response = await fetch("/api/penguji/jadwal/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jadwal_id: jadwalId,
          alasan: reason || "Ustadz Berhalangan Hadir",
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire("Terhapus!", result.message, "success");
        fetchAssignments();
      } else {
        throw new Error(result.error || "Gagal membatalkan jadwal");
      }
    } catch (error: any) {
      Swal.fire("Gagal!", error.message, "error");
    } finally {
      setLoadingAssignments(false);
    }
  };

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace("Minggu", "Ahad");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    const checkDate = dateString.split("T")[0];
    return today === checkDate;
  };

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-gold-100 shadow-sm app-card overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 shrink-0 shadow-sm">
              <Calendar className="w-8 h-8 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-primary-950 font-display tracking-tight leading-none mb-2">
                Jadwal & Sesi Ujian
              </h1>
              <p className="text-xs md:text-sm font-bold text-ink-500 uppercase tracking-widest opacity-70">
                Management & Availability
              </p>
            </div>
          </div>

          <div className="flex bg-ink-50/50 p-1.5 rounded-2xl border border-ink-100 w-full md:w-auto min-w-[320px]">
            <button
              onClick={() => setActiveTab("assigned")}
              className={`flex-1 py-3 px-6 rounded-xl font-black text-xs transition-all text-center uppercase tracking-wider ${activeTab === "assigned" ? "bg-white shadow-md text-primary-700 border border-ink-100 scale-[1.02]" : "text-ink-400 hover:text-ink-600"}`}
            >
              {["admin_super", "admin"].includes(activeRole) ? "Semua Jadwal" : "Jadwal Saya"}
            </button>
            <button
              onClick={() => setActiveTab("slots")}
              className={`flex-1 py-3 px-6 rounded-xl font-black text-xs transition-all text-center uppercase tracking-wider ${activeTab === "slots" ? "bg-white shadow-md text-primary-700 border border-ink-100 scale-[1.02]" : "text-ink-400 hover:text-ink-600"}`}
            >
              Sesi Ketersediaan
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border-2 flex items-center justify-between ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}>
            <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* TAB CONTENT: ASSIGNED */}
      {activeTab === "assigned" && (
        <>
          {loadingAssignments ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-xl p-6 md:p-12 border-2 border-secondary-200 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-ink-400" />
              </div>
              <h3 className="font-bold text-ink-950">Belum Ada Jadwal</h3>
              <p className="text-secondary-500">
                Anda belum memiliki jadwal seleksi yang ditugaskan.
              </p>
            </div>
          ) : (
            (() => {
              // Filter assignments based on active role
              const visibleTypes = ROLE_TO_JADWAL_TYPES[activeRole] || [
                "Seleksi Al Qur'an",
                "Seleksi Wawancara Calon Santri",
                "Seleksi Wawancara Orang Tua",
              ];
              const filteredAssignments = assignments.filter((item) => {
                // Check if any of the item's jenis_tugas matches the visible types
                return visibleTypes.some((type) =>
                  item.jenis_tugas.includes(type),
                );
              });

              if (filteredAssignments.length === 0) {
                return (
                  <div className="bg-white rounded-xl p-6 md:p-12 border-2 border-secondary-200 text-center">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-ink-400" />
                    </div>
                    <h3 className="font-bold text-ink-950">Belum Ada Jadwal</h3>
                    <p className="text-secondary-500">
                      Tidak ada jadwal seleksi untuk role yang dipilih saat ini.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid gap-4">
                  {filteredAssignments.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-3xl p-5 md:p-8 border transition-all app-card ${isToday(item.tanggal_ujian) ? "border-emerald-200 shadow-md ring-4 ring-emerald-50" : "border-secondary-200 shadow-sm hover:border-primary-200 hover:shadow-md"}`}
                    >
                      {/* Top section: Date badge + Name */}
                      <div className="flex items-start gap-5 mb-6">
                        <div
                          className={`p-4 rounded-[1.5rem] font-bold text-center min-w-[85px] shrink-0 border flex flex-col justify-center shadow-sm ${isToday(item.tanggal_ujian) ? "bg-primary-600 text-white border-primary-500" : "bg-primary-50 border-primary-100 text-primary-900"}`}
                        >
                          <div className="text-[10px] uppercase tracking-[0.2em] font-black opacity-80 mb-1">
                            {new Date(item.tanggal_ujian)
                              .toLocaleDateString("id-ID", { weekday: "short" })
                              .replace("Min", "Ahd")}
                          </div>
                          <div className="text-3xl font-black font-display leading-none">
                            {new Date(item.tanggal_ujian).getDate()}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest font-black mt-1 opacity-80">
                            {new Date(item.tanggal_ujian).toLocaleDateString(
                              "id-ID",
                              { month: "short" },
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-lg text-[9px] font-black uppercase tracking-[0.15em]">
                              {item.pendaftar.jenjang}
                            </span>
                            <span className="px-3 py-1 bg-gold-400 text-primary-950 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5" />{" "}
                              {item.pendaftar.nomor_pendaftaran}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-2xl font-black text-primary-950 font-display leading-tight mb-2">
                            {item.pendaftar.nama_lengkap}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-ink-500 font-bold">
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                            <span className="text-primary-700 uppercase tracking-widest font-black">
                              {item.jenis_tugas}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time & Location Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-4 py-4 bg-primary-50/30 rounded-2xl border border-primary-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <Clock className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-ink-400 font-black uppercase tracking-widest">
                              Waktu
                            </span>
                            <span className="text-sm text-primary-950 font-black">
                              {formatTime(item.waktu_mulai)} WIB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <MapPin className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-ink-400 font-black uppercase tracking-widest">
                              Lokasi
                            </span>
                            <span className="text-sm text-primary-950 font-black truncate">
                              {item.lokasi || "Online"}
                            </span>
                          </div>
                        </div>
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
                          if (
                            tugas.includes("calsan") ||
                            tugas.includes("santri")
                          )
                            showSantri = true;
                          if (tugas.includes("qur")) showQuran = true;
                          if (
                            tugas.includes("cawalsan") ||
                            tugas.includes("ortu")
                          )
                            showOrtu = true;
                        }

                        return (
                          <div className="flex flex-col gap-2">
                            {userId &&
                              showSantri &&
                              (item.status_santri === "completed" ? (
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                  <CheckCircle className="w-4 h-4" /> Seleksi
                                  Wawancara Calon Santri Selesai
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCompleteExam(item.id)}
                                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary-600/20"
                                >
                                  ✓ Tandai Wawancara Calon Santri Selesai
                                </button>
                              ))}
                            {userId &&
                              showQuran &&
                              (item.status_quran === "completed" ? (
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                  <CheckCircle className="w-4 h-4" /> Seleksi Al
                                  Qur'an Selesai
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCompleteExam(item.id)}
                                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary-600/20"
                                >
                                  ✓ Tandai Seleksi Al Qur'an Selesai
                                </button>
                              ))}
                            {userId &&
                              showOrtu &&
                              (item.status_ortu === "completed" ? (
                                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-sm font-bold border border-green-100">
                                  <CheckCircle className="w-4 h-4" /> Seleksi
                                  Wawancara Orang Tua Selesai
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCompleteExam(item.id)}
                                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary-600/20"
                                >
                                  ✓ Tandai Seleksi Wawancara Orang Tua Selesai
                                </button>
                              ))}
                            {/* Bottom row: Lihat Data + Batalkan */}
                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => {
                                  setSelectedPendaftar(item.pendaftar);
                                  setIsDetailModalOpen(true);
                                }}
                                className="flex-1 py-4 bg-white border border-primary-100 text-primary-700 hover:bg-primary-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                              >
                                <FileText className="w-4 h-4" /> Lihat Data
                              </button>
                              <button
                                onClick={() =>
                                  handleCancelAssignment(
                                    item.id,
                                    item.pendaftar.nama_lengkap,
                                  )
                                }
                                className="px-4 py-4 border border-red-100 text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center active:scale-95 shadow-sm"
                                title="Batalkan Jadwal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </>
      )}

      {/* TAB CONTENT: SLOTS */}
      {activeTab === "slots" && (
        <>
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gold-100 shadow-sm app-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-600/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="max-w-md">
                <h3 className="text-xl font-black text-primary-950 font-display tracking-tight mb-2">
                  Kelola Sesi Ketersediaan
                </h3>
                <p className="text-xs font-bold text-ink-500 leading-relaxed uppercase tracking-widest opacity-60">
                  Pilih waktu dimana Anda bersedia menguji calon santri atau
                  orang tua.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {!isSelectMode ? (
                  <>
                    {slots.length > 0 && (
                      <>
                        <button
                          onClick={() => {
                            setIsSelectMode(true);
                            setBulkActionType("edit");
                          }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-2xl font-black border border-stone-200 transition-all text-xs uppercase tracking-widest active:scale-95"
                        >
                          <Layers className="w-4 h-4" /> Edit Massal
                        </button>
                        <button
                          onClick={() => {
                            setIsSelectMode(true);
                            setBulkActionType("delete");
                          }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black border border-red-200 transition-all text-xs uppercase tracking-widest active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" /> Hapus Massal
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsBulkModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl font-black border border-primary-100 transition-all text-xs uppercase tracking-widest active:scale-95 shadow-sm"
                    >
                      <Plus className="w-5 h-5" /> Buat Massal
                    </button>
                    <button
                      onClick={() => setIsSlotModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-lg shadow-primary-600/20 transition-all text-xs uppercase tracking-widest active:scale-95"
                    >
                      <Plus className="w-5 h-5" /> Buat Sesi Tunggal
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 rounded-xl font-black text-xs border border-primary-100 hover:bg-primary-100 transition-all"
                    >
                      {selectedSlotIds.size === slots.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      {selectedSlotIds.size === slots.length
                        ? "Batal Semua"
                        : "Pilih Semua"}
                    </button>
                    <button
                      onClick={exitSelectMode}
                      className="px-4 py-3 border border-stone-200 text-stone-500 rounded-xl font-black text-xs hover:bg-stone-50 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PILIH CEPAT - muncul saat select mode aktif */}
          {isSelectMode && uniqueTimesForChips.length > 1 && (
            <div className="bg-white rounded-2xl border border-primary-100 px-5 py-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-ink-400 uppercase tracking-widest shrink-0 mr-1">
                Pilih Cepat:
              </span>
              {uniqueTimesForChips.map(({ hhmm, label, count }) => {
                const matchingIds = slots
                  .filter((s) => (s._count?.bookings || 0) === 0)
                  .filter((s) => {
                    const d = new Date(s.start_time);
                    return (
                      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` ===
                      hhmm
                    );
                  })
                  .map((s) => s.id);
                const allSelected = matchingIds.length > 0 && matchingIds.every((id) =>
                  selectedSlotIds.has(id),
                );
                return (
                  <button
                    key={hhmm}
                    onClick={() => selectByTime(hhmm)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-xs border transition-all active:scale-95 ${
                      allSelected
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100"
                    }`}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    {label}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                        allSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary-100 text-primary-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
              <div className="ml-auto text-[10px] text-ink-300 font-bold">
                {selectedSlotIds.size} / {displaySlots.reduce((acc, s: any) => acc + s.ids.length, 0)} dipilih
              </div>
            </div>
          )}

          {loadingSlots ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
            </div>
          ) : displaySlots.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              <p>Belum ada sesi waktu tersedia yang dibuat.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySlots.map((slot: any) => (
                <div
                  key={slot.ids.join(",")}
                  onClick={
                    isSelectMode ? () => toggleSelectSlot(slot.ids) : undefined
                  }
                  className={`bg-white rounded-[2rem] p-6 border shadow-sm transition-all group relative app-card ${
                    isSelectMode
                      ? "cursor-pointer hover:border-primary-300"
                      : "hover:shadow-xl hover:shadow-primary-600/5"
                  } ${
                    slot.ids.every((id: string) => selectedSlotIds.has(id))
                      ? "border-primary-400 ring-2 ring-primary-200 shadow-primary-100"
                      : "border-gold-100"
                  }`}
                >
                  {/* Checkbox overlay in select mode */}
                  {isSelectMode && (
                    <div className="absolute top-5 left-5 z-10">
                      {slot.ids.every((id: string) => selectedSlotIds.has(id)) ? (
                        <CheckSquare className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Square className="w-6 h-6 text-ink-300" />
                      )}
                    </div>
                  )}
                  <div
                    className={`absolute top-6 right-6 flex items-center gap-1 ${isSelectMode ? "hidden" : ""}`}
                  >
                    <button
                      onClick={() => handleOpenEdit(slot)}
                      className="p-2.5 text-ink-300 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all active:scale-90"
                      title="Edit Sesi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteGroup(slot.ids, slot.totalBookings)
                      }
                      className="p-2.5 text-ink-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-90"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 text-primary-700 font-black text-xl shadow-sm">
                      {slot.title?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-primary-950 font-display leading-tight">
                        {slot.title || "Sesi Seleksi"}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${slot.totalBookings >= slot.totalQuota ? "bg-secondary-500 animate-pulse" : "bg-green-500"}`}
                        />
                        <span className="text-[10px] font-black text-ink-400 uppercase tracking-widest">
                          {slot.totalBookings >= slot.totalQuota ? "Terisi" : "Tersedia"}
                          {slot.totalQuota > 1 && ` (${slot.totalQuota - slot.totalBookings}/${slot.totalQuota})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-2">
                    <div className="flex items-center gap-3 text-primary-900 bg-primary-50/50 p-3 rounded-2xl border border-primary-100/30 font-bold text-xs">
                      <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                      {formatDate(slot.start_time)}
                    </div>
                    <div className="flex items-center gap-3 text-primary-900 bg-primary-50/50 p-3 rounded-2xl border border-primary-100/30 font-bold text-xs">
                      <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                      {formatTime(slot.start_time)}
                      {slot.end_time
                        ? ` – ${formatTime(slot.end_time)}`
                        : ""}{" "}
                      WIB
                    </div>
                    <div className="flex items-center gap-3 text-primary-900 bg-primary-50/50 p-3 rounded-2xl border border-primary-100/30 font-bold text-xs">
                      <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="truncate">
                        {slot.location || "Online / Zoom"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* FLOATING BOTTOM BAR (select mode) */}
      {isSelectMode && selectedSlotIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4 bg-primary-950 text-white px-6 py-4 rounded-[2rem] shadow-2xl shadow-primary-950/40">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gold-400" />
              <span className="font-black text-sm">
                {selectedSlotIds.size} sesi dipilih
              </span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            {bulkActionType === "edit" && (
              <button
                onClick={() => {
                  const title = slots.length > 0 ? slots[0].title || "" : "";
                  setBulkEditForm({
                    start_time: "08:00",
                    end_time: calculateEndTime("08:00", title),
                    location: "",
                    notes: "",
                    changeTime: false,
                    changeLocation: false,
                    changeNotes: false,
                  });
                  setIsBulkEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 text-primary-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-300 transition-all active:scale-95"
              >
                <Edit2 className="w-4 h-4" /> Edit Terpilih
              </button>
            )}
            {bulkActionType === "delete" && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> Hapus Terpilih
              </button>
            )}
            <button
              onClick={exitSelectMode}
              className="px-4 py-2.5 border border-white/20 text-white/70 hover:text-white rounded-xl font-black text-xs transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* MODAL BULK EDIT */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight leading-none">
                  Edit Massal
                </h3>
                <p className="text-[10px] text-ink-300 font-bold uppercase tracking-widest mt-1.5">
                  {selectedSlotIds.size} sesi dipilih — centang yang ingin
                  diubah
                </p>
              </div>
              <button
                onClick={() => setIsBulkEditModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBulkEdit} className="p-5 md:p-8 space-y-5">
              {/* Waktu */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all ${bulkEditForm.changeTime ? "border-primary-300 bg-primary-50/30" : "border-stone-100 bg-stone-50/50"}`}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeTime}
                    onChange={(e) =>
                      setBulkEditForm({
                        ...bulkEditForm,
                        changeTime: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-xs font-black text-ink-400 uppercase tracking-widest">
                    Ubah Jam
                  </span>
                </label>
                {bulkEditForm.changeTime && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1.5">
                        Mulai
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-primary-950 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                        value={bulkEditForm.start_time}
                        onChange={(e) =>
                          setBulkEditForm({
                            ...bulkEditForm,
                            start_time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1.5">
                        Selesai
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-primary-950 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                        value={bulkEditForm.end_time}
                        onChange={(e) =>
                          setBulkEditForm({
                            ...bulkEditForm,
                            end_time: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lokasi */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all ${bulkEditForm.changeLocation ? "border-primary-300 bg-primary-50/30" : "border-stone-100 bg-stone-50/50"}`}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeLocation}
                    onChange={(e) =>
                      setBulkEditForm({
                        ...bulkEditForm,
                        changeLocation: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-xs font-black text-ink-400 uppercase tracking-widest">
                    Ubah Lokasi
                  </span>
                </label>
                {bulkEditForm.changeLocation && (
                  <input
                    type="text"
                    placeholder="Online / Zoom / Pesantren"
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-primary-950 text-sm focus:ring-2 focus:ring-primary-400 outline-none mt-2"
                    value={bulkEditForm.location}
                    onChange={(e) =>
                      setBulkEditForm({
                        ...bulkEditForm,
                        location: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {/* Catatan */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all ${bulkEditForm.changeNotes ? "border-primary-300 bg-primary-50/30" : "border-stone-100 bg-stone-50/50"}`}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={bulkEditForm.changeNotes}
                    onChange={(e) =>
                      setBulkEditForm({
                        ...bulkEditForm,
                        changeNotes: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-xs font-black text-ink-400 uppercase tracking-widest">
                    Ubah Catatan
                  </span>
                </label>
                {bulkEditForm.changeNotes && (
                  <textarea
                    rows={2}
                    placeholder="Catatan untuk semua sesi..."
                    className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-primary-950 text-sm focus:ring-2 focus:ring-primary-400 outline-none resize-none mt-2"
                    value={bulkEditForm.notes}
                    onChange={(e) =>
                      setBulkEditForm({
                        ...bulkEditForm,
                        notes: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {!bulkEditForm.changeTime &&
                !bulkEditForm.changeLocation &&
                !bulkEditForm.changeNotes && (
                  <p className="text-xs text-secondary-600 font-bold text-center">
                    Centang minimal satu perubahan di atas.
                  </p>
                )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  className="flex-1 py-3.5 border border-stone-200 text-stone-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all"
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
                  className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                >
                  {submittingBulkEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan {selectedSlotIds.size} Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SLOT */}
      {isEditModalOpen && editingSlot && (
        <div className="fixed inset-0 z-[60] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight leading-none">
                  Edit Sesi
                </h3>
                <p className="text-[10px] text-ink-300 font-bold uppercase tracking-widest mt-1.5">
                  {editingSlot.title || "Sesi Seleksi"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSlot(null);
                }}
                className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSlot} className="p-5 md:p-8 space-y-5">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950 transition-all"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />
              </div>

              {/* Waktu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Mulai
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950"
                    value={editForm.start_time}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setEditForm({
                        ...editForm,
                        start_time: newStart,
                        end_time: calculateEndTime(
                          newStart,
                          editingSlot?.title || "",
                        ),
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Selesai
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950"
                    value={editForm.end_time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Online / Zoom / Pesantren"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950 resize-none"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSlot(null);
                  }}
                  className="flex-1 py-3.5 border border-stone-200 text-stone-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
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

      {/* MODAL CREATE SLOT */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight leading-none">
                  Buat Sesi Baru
                </h3>
                <p className="text-[10px] text-ink-300 font-bold uppercase tracking-widest mt-1.5">
                  Single Availability Slot
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-5 md:p-8 space-y-6">
              {/* Jenis Ujian */}
              {ADMIN_ROLES.includes(activeRole) ? (
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Jenis Ujian
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950 transition-all"
                    value={slotForm.title}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, title: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Pilih Jenis Ujian
                    </option>
                    <option value="Tes Al-Quran">Tes Al-Quran</option>
                    <option value="Seleksi Wawancara Calon Santri">
                      Seleksi Wawancara Calon Santri
                    </option>
                    <option value="Seleksi Wawancara Orang Tua">
                      Seleksi Wawancara Orang Tua
                    </option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Jenis Ujian
                  </label>
                  <div className="w-full px-4 py-3 bg-primary-50/50 border border-primary-100 rounded-xl text-primary-900 font-black flex items-center gap-2 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                    {slotForm.title || "—"}
                  </div>
                  <p className="text-[10px] text-ink-300 italic mt-2">
                    *Jenis ujian otomatis sesuai role akun Anda.
                  </p>
                </div>
              )}

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950 transition-all"
                  value={slotForm.date}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, date: e.target.value })
                  }
                />
              </div>

              {/* Waktu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Mulai
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950"
                    value={slotForm.start_time}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setSlotForm({
                        ...slotForm,
                        start_time: newStart,
                        end_time: calculateEndTime(newStart, slotForm.title),
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2">
                    Selesai
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-950"
                    value={slotForm.end_time}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="text-[10px] text-ink-300 italic -mt-4">
                ⏱ Durasi sesi: {getDurationFromTitle(slotForm.title)} menit.
              </p>

              {/* Alerts */}
              <div className="space-y-3">
                <div className="bg-primary-600 rounded-2xl p-4 shadow-lg shadow-primary-950/20 text-white flex items-start gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm">✨</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-0.5">
                      Informasi Otomatis
                    </p>
                    <p className="text-[11px] leading-relaxed font-bold">
                      Sesi ini diatur sebagai{" "}
                      <span className="text-gold-300">Full Online</span>. Link
                      Meet akan otomatis diambil dari profil Anda.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest mb-0.5">
                      Kapasitas
                    </p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                      Setiap sesi memiliki <b>Kuota 1 Santri</b> (Private /
                      1-on-1).
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingSlot}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submittingSlot ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                SIMPAN SESI KETERSEDIAAN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PENDAFTAR */}
      {isDetailModalOpen && selectedPendaftar && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-secondary-100 flex justify-between items-center bg-secondary-50 rounded-t-2xl shrink-0">
              <h3 className="font-bold text-ink-950">Data Pendaftar</h3>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <XCircle className="w-6 h-6 text-ink-400 hover:text-ink-600" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Data Diri */}
              <div>
                <h4 className="text-sm font-bold text-ink-400 uppercase tracking-wider mb-3">
                  Identitas Santri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Nama Lengkap
                    </label>
                    <p className="font-bold text-ink-950">
                      {selectedPendaftar.nama_lengkap}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Nomor Pendaftaran
                    </label>
                    <p className="font-mono font-bold text-ink-950">
                      {selectedPendaftar.nomor_pendaftaran}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">NIK</label>
                    <p className="font-mono text-ink-700">
                      {selectedPendaftar.nik || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Jenis Kelamin
                    </label>
                    <p className="text-ink-700">
                      {selectedPendaftar.jenis_kelamin}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Tempat, Tanggal Lahir
                    </label>
                    <p className="text-ink-700">
                      {selectedPendaftar.tempat_lahir},{" "}
                      {selectedPendaftar.tanggal_lahir
                        ? new Date(
                            selectedPendaftar.tanggal_lahir,
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Jenjang
                    </label>
                    <p className="text-ink-700">{selectedPendaftar.jenjang}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-secondary-500 text-xs">
                      No. WA / HP (Wali/Utama)
                    </label>
                    <p className="font-mono font-bold text-green-700">
                      {selectedPendaftar.no_hp || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-secondary-500 text-xs">
                      Alamat
                    </label>
                    <p className="text-ink-700">
                      {selectedPendaftar.alamat || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-secondary-500 text-xs">
                      Asal Sekolah
                    </label>
                    <p className="text-ink-700 font-medium">
                      {selectedPendaftar.asal_sekolah || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-secondary-100" />

              {/* Data Orang Tua */}
              <div>
                <h4 className="text-sm font-bold text-ink-400 uppercase tracking-wider mb-3">
                  Data Orang Tua
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Nama Ayah
                    </label>
                    <p className="font-bold text-ink-950">
                      {selectedPendaftar.orang_tua?.nama_ayah || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      No. HP Ayah
                    </label>
                    <p className="font-mono text-ink-700">
                      {selectedPendaftar.orang_tua?.no_hp_ayah || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Pekerjaan Ayah
                    </label>
                    <p className="text-ink-700">
                      {selectedPendaftar.orang_tua?.pekerjaan_ayah || "-"}
                    </p>
                  </div>
                  <div>{/* Empty spacer or Mother info */}</div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      Nama Ibu
                    </label>
                    <p className="font-bold text-ink-950">
                      {selectedPendaftar.orang_tua?.nama_ibu || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-secondary-500 text-xs">
                      No. HP Ibu
                    </label>
                    <p className="font-mono text-ink-700">
                      {selectedPendaftar.orang_tua?.no_hp_ibu || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-secondary-100 bg-secondary-50 rounded-b-2xl shrink-0">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full py-2.5 bg-secondary-200 hover:bg-secondary-200 text-ink-900 font-bold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BULK CREATE SLOT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-4 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Header */}
            <div className="p-5 md:p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-[40px] shrink-0">
              <div>
                <h3 className="text-2xl font-black text-primary-950 tracking-tight leading-tight">
                  Buat Jadwal Massal
                </h3>
                <p className="text-xs text-ink-300 font-bold uppercase tracking-widest mt-2">
                  Bulk Availability Scheduler
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-3 hover:bg-stone-200 rounded-full transition-colors text-stone-400"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <form
              onSubmit={handleCreateBulk}
              className="p-6 md:p-10 space-y-8 overflow-y-auto overscroll-contain custom-scrollbar flex-1"
            >
              {/* Select Penguji (Admin Super / Admin Only) */}
              {["admin_super", "admin"].includes(activeRole) && (
                <div className="space-y-3">
                  <label className="block text-sm font-black text-primary-950 uppercase tracking-wider">
                    Buat Atas Nama Penguji
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-stone-100/50 border border-stone-200 text-stone-900 font-bold rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none outline-none"
                    value={selectedCreatorId}
                    onChange={(e) => {
                      setSelectedCreatorId(e.target.value);
                      // Update title based on selected penguji role
                      const selectedPenguji = pengujiList.find((p) => p.id === e.target.value);
                      if (selectedPenguji) {
                        const autoTitle = ROLE_TO_SESSION_TITLE[selectedPenguji.role] || "Sesi Ujian";
                        setBulkForm((prev) => ({ ...prev, title: autoTitle }));
                      } else {
                        // Reset to admin's default if empty
                        setBulkForm((prev) => ({ ...prev, title: ROLE_TO_SESSION_TITLE[activeRole] || "Sesi Ujian" }));
                      }
                    }}
                  >
                    <option value="">Pilih Penguji (Opsional)</option>
                    {pengujiList.map((p) => {
                      const exRoles = ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"];
                      let displayRole = p.role;
                      
                      let secRoles: string[] = [];
                      if (Array.isArray(p.secondary_roles)) {
                        secRoles = p.secondary_roles;
                      } else if (typeof p.secondary_roles === 'string') {
                        try { secRoles = JSON.parse(p.secondary_roles); } catch (e) {}
                      }

                      if (!exRoles.includes(p.role) && Array.isArray(secRoles)) {
                        const secRole = secRoles.find((r: string) => exRoles.includes(r));
                        if (secRole) displayRole = secRole;
                      }
                      return (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({displayRole.replace(/_/g, " ").toUpperCase()})
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-stone-500">
                    Jika dikosongkan, jadwal akan dibuat atas nama Anda sendiri.
                  </p>
                </div>
              )}

              {/* Jenis Ujian Info */}
              <div className="bg-primary-600 rounded-3xl p-6 shadow-xl shadow-primary-950/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-1.5 leading-none">
                  Mata Ujian Terpilih
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl shadow-inner">
                    <Trophy className="w-5 h-5 text-gold-300" />
                  </div>
                  <p className="text-2xl font-black tracking-tight text-white">
                    {bulkForm.title || "—"}
                  </p>
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-4">
                  Pilih Hari Rutin Seminggu
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 1, label: "Senin" },
                    { id: 2, label: "Selasa" },
                    { id: 3, label: "Rabu" },
                    { id: 4, label: "Kamis" },
                    { id: 5, label: "Jumat" },
                    { id: 6, label: "Sabtu" },
                    { id: 0, label: "Ahad" },
                  ].map((day) => {
                    const isSelected = bulkForm.selectedDays.includes(day.id);
                    const isActive = activeDay === day.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all border relative flex flex-col items-center min-w-[70px] ${
                          isSelected
                            ? isActive
                              ? "bg-primary-700 text-white border-primary-800 shadow-lg scale-105 z-10"
                              : "bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100"
                            : "bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {day.label}
                        {isSelected && !isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                        )}
                        {isActive && (
                          <div className="mt-1 w-5 h-1 bg-gold-400 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-ink-300 italic mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                  Klik untuk aktifkan hari, klik lagi untuk atur jam spesifik
                  hari tersebut.
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-stone-50 rounded-3xl border border-stone-100 shadow-inner">
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2.5">
                    Mulai Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-black text-primary-950 shadow-sm"
                    value={bulkForm.startDate}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-ink-400 uppercase tracking-widest mb-2.5">
                    Hingga Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-black text-primary-950 shadow-sm"
                    value={bulkForm.endDate}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-stone-50 rounded-[32px] p-5 md:p-8 border border-stone-100">
                <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
                  <div>
                    <label className="block text-[10px] text-ink-300 font-black uppercase tracking-[0.2em] mb-1">
                      Pengaturan Sesi:
                    </label>
                    <span className="text-xl font-black text-primary-800">
                      {
                        [
                          "Ahad",
                          "Senin",
                          "Selasa",
                          "Rabu",
                          "Kamis",
                          "Jumat",
                          "Sabtu",
                        ][activeDay]
                      }
                    </span>
                  </div>
                  {bulkForm.selectedDays.length > 1 && (
                    <button
                      type="button"
                      onClick={copySlotsToAll}
                      className="text-[10px] bg-primary-600 text-white px-3 py-2 rounded-xl font-black hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <Save className="w-3 h-3" /> SALIN KE SEMUA HARI
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {(bulkForm.daySlots[activeDay] || []).map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="time"
                            required
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 text-sm font-black text-primary-950 focus:ring-2 focus:ring-primary-500 outline-none"
                            value={slot.start}
                            onChange={(e) => {
                              const newStart = e.target.value;
                              const newSlots = [
                                ...(bulkForm.daySlots[activeDay] || []),
                              ];
                              newSlots[index].start = newStart;
                              newSlots[index].end = calculateEndTime(
                                newStart,
                                bulkForm.title,
                              );

                              setBulkForm({
                                ...bulkForm,
                                daySlots: {
                                  ...bulkForm.daySlots,
                                  [activeDay]: newSlots,
                                },
                              });
                            }}
                          />
                          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        </div>
                        <div className="relative">
                          <input
                            type="time"
                            required
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3 text-sm font-black text-primary-950 focus:ring-2 focus:ring-primary-500 outline-none"
                            value={slot.end}
                            onChange={(e) => {
                              const newSlots = [
                                ...(bulkForm.daySlots[activeDay] || []),
                              ];
                              newSlots[index].end = e.target.value;
                              setBulkForm({
                                ...bulkForm,
                                daySlots: {
                                  ...bulkForm.daySlots,
                                  [activeDay]: newSlots,
                                },
                              });
                            }}
                          />
                          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-3 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="w-full py-4 border-2 border-dashed border-stone-200 rounded-[28px] text-[10px] font-black text-stone-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 tracking-[0.2em]"
                  >
                    <Plus className="w-4 h-4" /> TAMBAH JAM LAIN
                  </button>
                </div>
              </div>

              {/* Informational Alert */}
              <div className="bg-gold-50 rounded-3xl p-6 border border-gold-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-400 rounded-2xl flex items-center justify-center shrink-0 text-primary-950">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gold-800 uppercase tracking-widest mb-1">
                    Informasi Otomatis
                  </p>
                  <p className="text-[11px] text-primary-900 leading-relaxed font-bold">
                    Semua sesi yang dibuat massal akan otomatis diset sebagai{" "}
                    <span className="text-primary-600">Online</span> dan memiliki{" "}
                    <span className="text-emerald-600">Kuota 1 Santri</span>.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingBulk}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[32px] transition-all shadow-2xl shadow-primary-900/40 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-lg tracking-tight"
              >
                {submittingBulk ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                BUAT JADWAL RUTIN SEKARANG
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

