"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    Calendar, 
    Search, 
    Users, 
    Clock, 
    MapPin, 
    Filter,
    Loader2,
    CheckCircle2,
    XCircle,
    Download,
    UserPlus,
    UserCheck,
    Edit2,
    X,
    Check,
    AlertCircle,
    AlertTriangle,
    Sparkles,
    BookOpen,
    GraduationCap,
    Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface Schedule {
    id: string;
    pendaftar: {
        id?: string;
        nomor: string;
        nama: string;
        jenjang: string;
        no_hp?: string;
    };
    sesi: {
        id?: string | null;
        title: string;
        start: string;
        end: string;
        location: string;
        metode?: string;
    };
    ustadz: {
        quran: string;
        santri: string;
        ortu: string;
        hafalan?: string;
        arab?: string;
    };
    ustadz_id?: {
        quran: string | null;
        santri: string | null;
        ortu: string | null;
        hafalan?: string | null;
        arab?: string | null;
    };
    is_assigned?: {
        quran: boolean;
        santri: boolean;
        ortu: boolean;
        hafalan?: boolean;
        arab?: boolean;
    };
    status: {
        quran: string;
        santri: string;
        ortu: string;
        hafalan?: string;
        arab?: string;
    };
}

// Helper untuk memeriksa jenjang Langsung MA/SMA/SMA IT Tanpa IL (yang memerlukan Tes Lisan Bahasa Arab)
// Jenjang MTs/SMP/SMP IT dan IL TIDAK memerlukan tes lisan bahasa Arab.
export const isJenjangLangsungNonIL = (jenjang?: string | null): boolean => {
    if (!jenjang) return false;
    const clean = jenjang.trim().toUpperCase();
    if (
        clean === "IL" ||
        clean.includes("IL ") ||
        clean.includes(" IL") ||
        clean.includes("(IL)") ||
        clean.includes("I'DAD") ||
        clean.includes("IDAD") ||
        clean.includes("IDADIYAH")
    ) {
        return false;
    }
    if (
        clean.includes("SMP") ||
        clean.includes("MTS") ||
        clean.includes("TSANAWIYAH")
    ) {
        return false;
    }
    if (
        clean.includes("SMA") ||
        clean.includes("MA") ||
        clean.includes("ALIYAH") ||
        clean.includes("SLTA")
    ) {
        return true;
    }
    return false;
};

export default function MonitoringJadwalPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [examiners, setExaminers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterJenjang, setFilterJenjang] = useState("ALL");
    const [viewMode, setViewMode] = useState<"flat" | "grouped" | "santri">("flat");
    const [showPast, setShowPast] = useState(true);

    const [conflicts, setConflicts] = useState<any[]>([]);

    // Modal Penugasan Penguji State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetSchedule, setTargetSchedule] = useState<Schedule | null>(null);
    const [selectedQuranId, setSelectedQuranId] = useState<string>("");
    const [selectedSantriId, setSelectedSantriId] = useState<string>("");
    const [selectedOrtuId, setSelectedOrtuId] = useState<string>("");
    const [selectedHafalanId, setSelectedHafalanId] = useState<string>("");
    const [selectedArabId, setSelectedArabId] = useState<string>("");
    const [showAllStaff, setShowAllStaff] = useState(false);
    const [savingAssignment, setSavingAssignment] = useState(false);

    // Conflict Guard: Map examiner ID to conflicting student info at target schedule time
    const busyExaminersAtTargetTime = useMemo(() => {
        if (!targetSchedule?.sesi?.start) return new Map<string, string>();
        const targetTime = new Date(targetSchedule.sesi.start).getTime();
        const map = new Map<string, string>();

        schedules.forEach(s => {
            if (s.id === targetSchedule.id || s.pendaftar?.nomor === targetSchedule.pendaftar?.nomor) return;
            const sTime = new Date(s.sesi.start).getTime();
            if (sTime === targetTime) {
                const info = `${s.pendaftar.nama} (${s.pendaftar.nomor})`;
                if (s.ustadz_id?.quran) map.set(s.ustadz_id.quran, info);
                if (s.ustadz_id?.santri) map.set(s.ustadz_id.santri, info);
                if (s.ustadz_id?.ortu) map.set(s.ustadz_id.ortu, info);
                if (s.ustadz_id?.arab) map.set(s.ustadz_id.arab, info);
            }
        });

        return map;
    }, [targetSchedule, schedules]);
    const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

    // Body scroll lock for modals (Mandatory UX Rule)
    useEffect(() => {
        if (assignModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [assignModalOpen]);

    useEffect(() => {
        fetchMonitoringData();
        fetchExaminers();
    }, []);

    const fetchExaminers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const json = await res.json();
                setExaminers(json.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch examiners", e);
        }
    };

    // Filter daftar penguji berdasarkan keahlian
    const quranExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            if (
                r === "penguji_hafalan" ||
                r === "penguji_bahasa_arab" ||
                r === "penguji_arab" ||
                r === "pewawancara_calsan" ||
                r === "pewawancara_cawalsan" ||
                r.startsWith("admin") ||
                r === "pendaftar"
            ) {
                return false;
            }
            return r === "penguji" || r === "penguji_quran" || r === "penguji_bacaan_quran";
        });
    }, [examiners]);

    const santriExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            if (
                r === "penguji_hafalan" ||
                r === "penguji_bahasa_arab" ||
                r === "penguji_arab" ||
                r === "pewawancara_cawalsan" ||
                r === "penguji" ||
                r.startsWith("admin") ||
                r === "pendaftar"
            ) {
                return false;
            }
            return r === "pewawancara_calsan" || r === "penguji_santri" || r === "pewawancara_santri";
        });
    }, [examiners]);

    const ortuExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            if (
                r === "penguji_hafalan" ||
                r === "penguji_bahasa_arab" ||
                r === "penguji_arab" ||
                r === "pewawancara_calsan" ||
                r === "penguji" ||
                r.startsWith("admin") ||
                r === "pendaftar"
            ) {
                return false;
            }
            return (
                r === "pewawancara_cawalsan" ||
                r === "pewawancara_ortu" ||
                r === "pewawancara_wali" ||
                r === "penguji_ortu"
            );
        });
    }, [examiners]);

    const hafalanExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            return r === "penguji_hafalan" || r === "penguji_tahfidz";
        });
    }, [examiners]);

    const arabExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            return r === "penguji_bahasa_arab" || r === "penguji_arab" || r === "penguji_lisan_arab";
        });
    }, [examiners]);

    const allValidExaminers = useMemo(() => {
        return examiners.filter((ex) => {
            const r = (ex.role || "").toLowerCase().trim();
            return r !== "pendaftar" && !r.startsWith("admin_berkas") && !r.startsWith("admin_keuangan");
        });
    }, [examiners]);

    const openAssignModal = (schedule: Schedule, defaultFocus?: 'quran' | 'santri' | 'ortu' | 'hafalan' | 'arab') => {
        setTargetSchedule(schedule);
        setSelectedQuranId(schedule.ustadz_id?.quran || "");
        setSelectedSantriId(schedule.ustadz_id?.santri || "");
        setSelectedOrtuId(schedule.ustadz_id?.ortu || "");
        setSelectedHafalanId(schedule.ustadz_id?.hafalan || "");
        setSelectedArabId(schedule.ustadz_id?.arab || "");
        setShowAllStaff(false);
        setSaveSuccessMsg(null);
        setAssignModalOpen(true);
    };

    const handleSaveAssignment = async (allowConflict: boolean = false) => {
        if (!targetSchedule) return;

        // Front-line Conflict Check
        if (!allowConflict) {
            const conflictDetails: string[] = [];
            if (selectedQuranId && busyExaminersAtTargetTime.has(selectedQuranId)) {
                const name = allValidExaminers.find(u => u.id === selectedQuranId)?.full_name || "Penguji Al-Qur'an";
                conflictDetails.push(`${name} (bentrok dengan ${busyExaminersAtTargetTime.get(selectedQuranId)})`);
            }
            if (selectedSantriId && busyExaminersAtTargetTime.has(selectedSantriId)) {
                const name = allValidExaminers.find(u => u.id === selectedSantriId)?.full_name || "Pewawancara Santri";
                conflictDetails.push(`${name} (bentrok dengan ${busyExaminersAtTargetTime.get(selectedSantriId)})`);
            }
            if (selectedOrtuId && busyExaminersAtTargetTime.has(selectedOrtuId)) {
                const name = allValidExaminers.find(u => u.id === selectedOrtuId)?.full_name || "Pewawancara Ortu";
                conflictDetails.push(`${name} (bentrok dengan ${busyExaminersAtTargetTime.get(selectedOrtuId)})`);
            }
            if (selectedHafalanId && busyExaminersAtTargetTime.has(selectedHafalanId)) {
                const name = allValidExaminers.find(u => u.id === selectedHafalanId)?.full_name || "Penguji Hafalan";
                conflictDetails.push(`${name} (bentrok dengan ${busyExaminersAtTargetTime.get(selectedHafalanId)})`);
            }
            if (selectedArabId && busyExaminersAtTargetTime.has(selectedArabId)) {
                const name = allValidExaminers.find(u => u.id === selectedArabId)?.full_name || "Penguji B. Arab";
                conflictDetails.push(`${name} (bentrok dengan ${busyExaminersAtTargetTime.get(selectedArabId)})`);
            }

            if (conflictDetails.length > 0) {
                const confirm = await Swal.fire({
                    title: "Peringatan Bentrokan Jadwal!",
                    html: `<p class="text-xs mb-2">Penguji berikut terdeteksi sudah memiliki jadwal ujian lain pada jam yang sama (${formatDateTime(new Date(targetSchedule.sesi.start).toISOString())}):</p><ul class="text-xs font-bold text-rose-700 list-disc pl-5 text-left my-2 space-y-1">${conflictDetails.map(c => `<li>${c}</li>`).join("")}</ul><p class="text-xs mt-3 text-slate-500">Apakah Anda ingin tetap menyimpan (memaksa) atau memilih penguji lain?</p>`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#f59e0b",
                    cancelButtonColor: "#6b7280",
                    confirmButtonText: "Tetap Simpan (Paksa)",
                    cancelButtonText: "Pilih Penguji Lain",
                });
                if (!confirm.isConfirmed) return;
                // Admin confirmed, proceed with allowConflict = true
                return handleSaveAssignment(true);
            }
        }

        try {
            setSavingAssignment(true);
            const res = await fetch("/api/admin/jadwal/monitoring", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jadwal_id: targetSchedule.id,
                    penguji_quran_id: selectedQuranId || null,
                    penguji_santri_id: selectedSantriId || null,
                    penguji_ortu_id: selectedOrtuId || null,
                    penguji_hafalan_id: selectedHafalanId || null,
                    penguji_arab_id: selectedArabId || null,
                    allow_conflict: allowConflict,
                }),
            });

            if (res.ok) {
                setSaveSuccessMsg("Penugasan penguji berhasil diperbarui!");
                await fetchMonitoringData();
                setTimeout(() => {
                    setAssignModalOpen(false);
                    setSaveSuccessMsg(null);
                }, 800);
            } else {
                const err = await res.json();
                if (err.conflict) {
                    const confirm = await Swal.fire({
                        title: "Peringatan Bentrokan Jadwal!",
                        text: err.message,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#f59e0b",
                        cancelButtonColor: "#6b7280",
                        confirmButtonText: "Tetap Simpan (Paksa)",
                        cancelButtonText: "Pilih Penguji Lain",
                    });
                    if (confirm.isConfirmed) {
                        return handleSaveAssignment(true);
                    }
                } else {
                    Swal.fire("Gagal", err.error || "Gagal menyimpan penugasan penguji", "error");
                }
            }
        } catch (error) {
            console.error("Error saving assignment:", error);
            Swal.fire("Error", "Terjadi kendala saat menyimpan penugasan penguji.", "error");
        } finally {
            setSavingAssignment(false);
        }
    };

    const findConflicts = (data: Schedule[]) => {
        const examinerTimeMap: Record<string, { student: string; pendaftarId: string; scheduleId: string; roleLabel?: string }[]> = {};
        const newConflicts: any[] = [];

        data.forEach(s => {
            const timeKey = new Date(s.sesi.start).getTime().toString();
            
            // Tes standar seluruh jenjang: Al-Qur'an (Bacaan & Hafalan), W. Santri, W. Ortu
            const roles = [
                { type: 'quran', name: s.ustadz.quran, label: 'Al-Qur\'an' },
                { type: 'santri', name: s.ustadz.santri, label: 'W. Santri' },
                { type: 'ortu', name: s.ustadz.ortu, label: 'W. Ortu' }
            ];

            // Tambahan Tes Lisan Bahasa Arab khusus yang Langsung MA/SMA Tanpa IL
            if (s.ustadz?.arab && s.ustadz.arab !== "-" && isJenjangLangsungNonIL(s.pendaftar?.jenjang)) {
                roles.push({ type: 'arab', name: s.ustadz.arab, label: 'Lisan B. Arab' });
            }

            roles.forEach(role => {
                if (role.name && role.name !== "-") {
                    const key = `${role.name}_${timeKey}`;
                    if (!examinerTimeMap[key]) {
                        examinerTimeMap[key] = [];
                    }
                    examinerTimeMap[key].push({
                        student: s?.pendaftar?.nama,
                        pendaftarId: s.pendaftar.nomor,
                        scheduleId: s.id,
                        roleLabel: role.label
                    });
                }
            });
        });

        Object.entries(examinerTimeMap).forEach(([key, items]) => {
            // Bentrok HANYA terjadi jika satu penguji menangani LEBIH DARI SATU SANTRI BERBEDA di jam yang sama
            const uniqueStudents = new Set(items.map(item => item.pendaftarId));
            if (uniqueStudents.size > 1) {
                const [name, time] = key.split('_');
                newConflicts.push({
                    name,
                    time: parseInt(time),
                    items
                });
            }
        });

        setConflicts(newConflicts);
    };

    const fetchMonitoringData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/jadwal/monitoring");
            if (res.ok) {
                const json = await res.json();
                const data = json.data || [];
                setSchedules(data);
                findConflicts(data);
            }
        } catch (error) {
            console.error("Failed to fetch monitoring data", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).replace("Minggu", "Ahad");
    };

    const getStatusIcon = (status: string) => {
        if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
        if (status === "absent") return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
        return <Clock className="w-4 h-4 text-primary-400 shrink-0" />;
    };

    const filteredSchedules = schedules.filter(s => {
        const matchesSearch = 
            (s?.pendaftar?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
            (s?.pendaftar?.nomor || "").toLowerCase().includes(search.toLowerCase()) ||
            (s?.ustadz?.quran || "").toLowerCase().includes(search.toLowerCase()) ||
            (s?.ustadz?.santri || "").toLowerCase().includes(search.toLowerCase()) ||
            (s?.ustadz?.ortu || "").toLowerCase().includes(search.toLowerCase()) ||
            (s?.ustadz?.arab || "").toLowerCase().includes(search.toLowerCase());
        
        const matchesJenjang = filterJenjang === "ALL" || s?.pendaftar?.jenjang === filterJenjang;
        
        const isPast = s?.sesi?.end ? new Date(s.sesi.end).getTime() < new Date().getTime() : false;
        const matchesPast = showPast || !isPast;

        return matchesSearch && matchesJenjang && matchesPast;
    }).sort((a, b) => new Date(a.sesi.start).getTime() - new Date(b.sesi.start).getTime());

    const getGroupedSchedules = () => {
        const groups: Record<string, { role: string; schedule: Schedule }[]> = {};

        filteredSchedules.forEach(s => {
            const examinersList = [
                { name: s.ustadz.quran, role: "Al-Qur'an" },
                { name: s.ustadz.santri, role: "W. Santri" },
                { name: s.ustadz.ortu, role: "W. Wali/Ortu" }
            ];

            examinersList.forEach(ext => {
                const name = ext.name && ext.name !== "-" ? ext.name : "Belum Ditentukan";
                if (!groups[name]) groups[name] = [];
                groups[name].push({ role: ext.role, schedule: s });
            });
        });

        // Sort groups by the earliest session in each group
        return Object.keys(groups)
            .map(name => ({
                name,
                items: groups[name],
                earliestSession: Math.min(...groups[name].map(i => new Date(i.schedule.sesi.start).getTime()))
            }))
            .sort((a, b) => {
                if (a.name === "Belum Ditentukan") return 1;
                if (b.name === "Belum Ditentukan") return -1;
                return a.earliestSession - b.earliestSession;
            });
    };

    const getGroupedBySantri = () => {
        const groups: Record<string, Schedule[]> = {};

        filteredSchedules.forEach(s => {
            const key = `${s?.pendaftar?.nama} (${s.pendaftar.nomor})`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        return Object.keys(groups)
            .map(name => ({
                name,
                items: groups[name],
                earliestSession: Math.min(...groups[name].map(s => new Date(s.sesi.start).getTime()))
            }))
            .sort((a, b) => a.earliestSession - b.earliestSession);
    };

    // Calculate Unique Stats
    const totalTerjadwal = new Set(filteredSchedules.map(s => s.pendaftar.nomor)).size;
    const totalSesi = filteredSchedules.length;
    const selesaiQuran = new Set(filteredSchedules.filter(s => s.status.quran === 'completed').map(s => s.pendaftar.nomor)).size;
    const selesaiWSantri = new Set(filteredSchedules.filter(s => s.status.santri === 'completed').map(s => s.pendaftar.nomor)).size;
    const selesaiWOrangTua = new Set(filteredSchedules.filter(s => s.status.ortu === 'completed').map(s => s.pendaftar.nomor)).size;

    // Helper untuk merender sel penguji
    const renderExaminerCell = (
        name: string,
        status: string,
        roleType: 'quran' | 'santri' | 'ortu',
        schedule: Schedule
    ) => {
        const isAssigned = name && name !== "-";
        const isConflict = isAssigned && conflicts.some(c => c.name === name && c.time === new Date(schedule.sesi.start).getTime());

        if (!isAssigned) {
            return (
                <div className="flex flex-col gap-1.5 items-start">
                    <button
                        onClick={() => openAssignModal(schedule, roleType)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-300 transition-all group"
                        title="Tugaskan Penguji Sekarang"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span>+ Tugaskan</span>
                    </button>
                    <span className="text-[10px] font-semibold text-amber-600/80 uppercase tracking-tight">
                        Belum Ditentukan
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                {getStatusIcon(status)}
                <div className="flex flex-col group/examiner">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold leading-tight ${isConflict ? 'text-rose-600' : 'text-slate-800'}`}>
                            {name}
                        </span>
                        <button
                            onClick={() => openAssignModal(schedule, roleType)}
                            title="Ubah Penguji"
                            className="opacity-0 group-hover/examiner:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary-600 transition-all"
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${
                        status === 'completed' 
                            ? (roleType === 'quran' ? 'text-green-600' : roleType === 'santri' ? 'text-indigo-600' : 'text-purple-600')
                            : status === 'absent' ? 'text-red-500' : 'text-slate-400'
                    }`}>
                        {status === 'completed' ? 'Selesai' : status === 'absent' ? 'Alpa' : 'Menunggu'}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Simplified Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-ink-900 tracking-tight">Monitoring <span className="text-primary-600">Jadwal</span></h1>
                        <p className="text-ink-400 font-bold uppercase text-[9px] tracking-widest mt-0.5 flex items-center gap-2">
                             Rekapitulasi Real-time & Penugasan Penguji / Pewawancara
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total Terjadwal</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 relative z-10">
                        {totalTerjadwal} <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Peserta</span>
                        <span className="text-slate-200 font-light mx-1">|</span>
                        <span className="ml-2">{totalSesi}</span> <span className="text-[10px] text-slate-400 font-bold uppercase">Jadwal</span>
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai Al-Qur&apos;an</p>
                    <p className="text-2xl md:text-3xl font-black text-emerald-600 relative z-10">{selesaiQuran}</p>
                </div>
                <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai W. Santri</p>
                    <p className="text-2xl md:text-3xl font-black text-indigo-600 relative z-10">{selesaiWSantri}</p>
                </div>
                <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai W. Orang Tua</p>
                    <p className="text-2xl md:text-3xl font-black text-purple-600 relative z-10">{selesaiWOrangTua}</p>
                </div>
            </div>

            {/* Conflict Alert */}
            {conflicts.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-rose-100"
                >
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0 whitespace-nowrap">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-rose-900 uppercase tracking-tight">Terdeteksi Bentrokan Jadwal ({conflicts.length})</h3>
                        <p className="text-xs text-rose-700 font-bold mt-1">Satu penguji terdeteksi menangani beberapa santri di jam yang sama. Mohon segera kroscek data berikut:</p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {conflicts.map((c, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-sm border border-rose-200/80 rounded-2xl p-4 text-[11px] shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-2 mb-2.5">
                                            <div>
                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">Penguji Bentrok</span>
                                                <p className="font-black text-rose-900 text-xs uppercase tracking-wide">{c.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">Waktu Sesi</span>
                                                <p className="text-rose-600 font-bold text-[11px]">{formatDateTime(new Date(c.time).toISOString())}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Santri Terjadwal Bersamaan:</p>
                                        <div className="space-y-2">
                                            {c.items.map((item: any, j: number) => (
                                                <div key={j} className="flex items-center justify-between gap-2 bg-rose-50/70 border border-rose-100 p-2 rounded-xl">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-slate-800 text-xs truncate">{item.student}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-bold text-slate-500">{item.pendaftarId}</span>
                                                            {item.roleLabel && (
                                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-200 text-rose-800 rounded uppercase">
                                                                    {item.roleLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const sched = schedules.find(s => s.id === item.scheduleId);
                                                            if (sched) openAssignModal(sched);
                                                        }}
                                                        className="shrink-0 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-rose-200 transition-all cursor-pointer"
                                                        title="Ganti atau atur penguji untuk santri ini"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        <span>Ganti</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-rose-600 text-[10px]">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        <span>Klik tombol <b>Ganti</b> di atas untuk memindahkan salah satu santri ke penguji lain.</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Filter & Actions Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search & Jenjang */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                            <input 
                                type="text" 
                                placeholder="Cari santri, no pendaftaran, atau nama penguji..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none font-bold h-12 transition-all shadow-sm"
                            />
                        </div>
                        <select 
                            value={filterJenjang}
                            onChange={(e) => setFilterJenjang(e.target.value)}
                            className="w-32 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-ink-600 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none h-12 shadow-sm appearance-none text-center uppercase tracking-wider"
                        >
                            <option value="ALL">SEMUA</option>
                            <option value="MTs">SMP IT</option>
                            <option value="IL">IL</option>
                        </select>
                    </div>

                    {/* View Switcher & Actions */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 md:flex-none flex bg-slate-100 p-1.5 rounded-xl h-12 min-w-fit whitespace-nowrap shrink-0">
                            {[
                                { id: "flat", label: "List" },
                                { id: "grouped", label: "Ustadz" },
                                { id: "santri", label: "Santri" }
                            ].map((mode) => (
                                <button 
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id as any)}
                                    className={`px-5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${viewMode === mode.id ? "bg-white text-primary-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={fetchMonitoringData}
                            className="w-12 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0"
                            title="Refresh Data"
                        >
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
                        </button>
                        <button 
                            onClick={() => setShowPast(!showPast)}
                            className={`px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border h-12 shadow-sm ${
                                showPast 
                                ? "bg-secondary-100 border-secondary-200 text-secondary-700" 
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {showPast ? "Semua Sesi" : "Sesi Mendatang"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="space-y-6">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-clay-lg p-24 text-center border border-white/40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="font-bold text-ink-400">Memuat data monitoring...</p>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-clay-lg p-24 text-center border border-white/40">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="font-bold text-ink-400">Tidak ada jadwal yang ditemukan.</p>
                    </div>
                ) : viewMode === "flat" ? (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredSchedules.map((s) => (
                                <div key={s.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-clay-m p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                                                {s?.pendaftar?.nama.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider whitespace-nowrap inline-block shrink-0">
                                                    {s.pendaftar.nomor}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    s.pendaftar.jenjang === 'MTs' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    {s.pendaftar.jenjang === "IL" ? "IL" : "SMP IT"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-primary-600 flex items-center justify-end gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDateTime(s.sesi.start).split(', ')[1]}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 whitespace-nowrap">
                                                {formatDateTime(s.sesi.start).split(', ')[0]}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Status Grid */}
                                    <div className="grid grid-cols-1 gap-2.5 py-4 border-y border-slate-100">
                                        {[
                                            { label: 'Ujian Al-Qur\'an', status: s.status.quran, ustadz: s.ustadz.quran, type: 'quran' as const },
                                            { label: 'Wawancara Calon Santri', status: s.status.santri, ustadz: s.ustadz.santri, type: 'santri' as const },
                                            { label: 'Wawancara Calon Ortu/Wali', status: s.status.ortu, ustadz: s.ustadz.ortu, type: 'ortu' as const },
                                        ].map((stat, i) => (
                                            <div key={i} className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-xl border ${
                                                        stat.status === 'completed' ? 'bg-green-50 border-green-100' : 
                                                        stat.status === 'absent' ? 'bg-red-50 border-red-100' : 
                                                        'bg-primary-50 border-primary-100'
                                                    }`}>
                                                        {getStatusIcon(stat.status)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none">{stat.label}</p>
                                                        {stat.ustadz && stat.ustadz !== '-' ? (
                                                            <p className="text-xs font-bold text-slate-700 mt-0.5">{stat.ustadz}</p>
                                                        ) : (
                                                            <p className="text-xs font-bold text-amber-600 mt-0.5 italic">Belum Ditugaskan</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    {stat.ustadz && stat.ustadz !== '-' ? (
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                            stat.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            stat.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-primary-100 text-primary-700'
                                                        }`}>
                                                            {stat.status === 'completed' ? 'Selesai' : stat.status === 'absent' ? 'Absen' : 'Menunggu'}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => openAssignModal(s, stat.type)}
                                                            className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100"
                                                        >
                                                            + Tugaskan
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold px-3 py-1.5 bg-slate-50 rounded-xl">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {(s.sesi.location || '').replace(/Online\/Pesantren/gi, 'Online').replace(/Pesantren\/Online/gi, 'Online')}
                                        </div>
                                        <button
                                            onClick={() => openAssignModal(s)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-sm"
                                        >
                                            <UserCheck className="w-3.5 h-3.5" />
                                            <span>Atur Penguji</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block bg-white rounded-2xl shadow-clay-lg overflow-hidden border border-slate-100">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[850px] text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/70">
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Peserta</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Jadwal & Lokasi</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Penguji Al-Qur'an</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">W. Santri</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">W. Ortu</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredSchedules.map((s) => (
                                            <tr key={s.id} className="hover:bg-primary-50/20 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-extrabold text-slate-800 group-hover:text-primary-600 transition-colors leading-tight">
                                                            {s?.pendaftar?.nama.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider whitespace-nowrap inline-block shrink-0">
                                                                {s.pendaftar.nomor}
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                                s.pendaftar.jenjang === 'MTs' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                                {s.pendaftar.jenjang === "IL" ? "IL" : "SMP IT"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                                            {formatDateTime(s.sesi.start)}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                            {(s.sesi.location || '').replace(/Online\/Pesantren/gi, 'Online').replace(/Pesantren\/Online/gi, 'Online')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {renderExaminerCell(s.ustadz.quran, s.status.quran, 'quran', s)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {renderExaminerCell(s.ustadz.santri, s.status.santri, 'santri', s)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {renderExaminerCell(s.ustadz.ortu, s.status.ortu, 'ortu', s)}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button
                                                        onClick={() => openAssignModal(s)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200/60 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"
                                                        title="Atur Seluruh Penguji Peserta Ini"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        <span>Atur Penguji</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : viewMode === "grouped" ? (
                    <div className="space-y-6">
                        {getGroupedSchedules().map((group) => (
                            <div key={group.name} className="bg-white rounded-[2rem] shadow-clay-m border border-slate-100 overflow-hidden">
                                <div className="bg-slate-50 px-7 py-5 flex items-center justify-between border-b border-slate-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${group.name === 'Belum Ditentukan' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-primary-600 shadow-primary-600/20'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-[17px] font-extrabold text-slate-800 leading-tight">
                                                {group.name} <span className="text-primary-600 ml-1">({group.items.length})</span>
                                            </h2>
                                            {group.name === "Belum Ditentukan" && (
                                                <p className="text-xs font-bold text-amber-600 mt-0.5">Memerlukan penugasan penguji dari Admin Super</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Penguji Al-Qur'an / Pewawancara</span>
                                </div>
                                <div className="p-0 overflow-x-auto custom-scrollbar">
                                    <table className="w-full min-w-[750px] text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/20">
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Santri</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Tugas</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Waktu</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50 text-center">Status</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[13px]">
                                            {group.items.map((item, idx) => (
                                                <tr key={`${item.schedule.id}-${idx}`} className="hover:bg-primary-50/10 transition-colors">
                                                    <td className="px-7 py-4">
                                                        <span className="font-extrabold text-slate-800">{item.schedule?.pendaftar?.nama}</span>
                                                        <span className="text-[10px] text-slate-400 block font-mono font-bold mt-0.5">{item.schedule.pendaftar.nomor}</span>
                                                    </td>
                                                    <td className="px-7 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                                                            item.role === 'Al-Qur\'an' ? 'bg-orange-100 text-orange-600' :
                                                            item.role === 'W. Santri' ? 'bg-indigo-100 text-indigo-600' :
                                                            'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                            {item.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-7 py-4">
                                                        <span className="font-bold text-slate-600 whitespace-nowrap">{formatDateTime(item.schedule.sesi.start)}</span>
                                                    </td>
                                                    <td className="px-7 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            {getStatusIcon(
                                                                item.role === 'Al-Qur\'an' ? item.schedule.status.quran :
                                                                item.role === 'W. Santri' ? item.schedule.status.santri :
                                                                item.schedule.status.ortu
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-7 py-4 text-center">
                                                        <button
                                                            onClick={() => openAssignModal(item.schedule)}
                                                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                                                        >
                                                            Tugaskan
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getGroupedBySantri().map((group) => (
                            <div key={group.name} className="bg-white rounded-[2rem] shadow-clay-m border border-slate-100 overflow-hidden flex flex-col transition-all hover:translate-y-[-4px] group">
                                <div className="bg-slate-50 px-6 py-6 border-b border-slate-100 group-hover:bg-primary-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                                <Users className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-extrabold text-slate-800 leading-tight">{group.name.split(' (')[0]}</h2>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">{group.name.split(' (')[1].replace(')', '')} • {group.items[0].pendaftar.jenjang}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openAssignModal(group.items[0])}
                                            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-300 shadow-sm"
                                            title="Atur Penguji"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 space-y-4">
                                    {group.items.map((s, idx) => (
                                        <div key={`${s.id}-${idx}`} className="bg-slate-50/30 rounded-xl p-4 border border-slate-100/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4 text-primary-500" />
                                                <span className="text-[12px] font-bold text-slate-700">{formatDateTime(s.sesi.start)}</span>
                                            </div>
                                            <div className="space-y-2.5">
                                                {[
                                                    { role: 'Al-Qur\'an', ustadz: s.ustadz.quran, status: s.status.quran },
                                                    { role: 'Santri', ustadz: s.ustadz.santri, status: s.status.santri },
                                                    { role: 'Ortu', ustadz: s.ustadz.ortu, status: s.status.ortu }
                                                ].map((x, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[12px]">
                                                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-tight">{x.role}</span>
                                                        <div className="flex items-center gap-2.5">
                                                            {x.ustadz && x.ustadz !== '-' ? (
                                                                <>
                                                                    <span className="font-bold text-slate-700">{x.ustadz}</span>
                                                                    <div className={`w-2 h-2 rounded-full ${x.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]'}`} />
                                                                </>
                                                            ) : (
                                                                <span className="text-amber-600 text-xs font-bold italic">Belum Ditugaskan</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL PENUGASAN PENGUJI (Platinum Standard & Mandatory UX Rule) */}
            <AnimatePresence>
                {assignModalOpen && targetSchedule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overscroll-contain">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <UserCheck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight leading-tight">Penugasan Penguji & Pewawancara</h3>
                                        <p className="text-xs text-white/80 font-medium mt-0.5">
                                            Admin Super • Atur penugasan penguji seleksi
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAssignModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto overscroll-contain">
                                {/* Detail Santri Card */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                                            {targetSchedule.pendaftar.nama}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {targetSchedule.pendaftar.nomor}
                                            </span>
                                            <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                                                {targetSchedule.pendaftar.jenjang}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs">
                                        <p className="font-bold text-slate-600 flex items-center justify-end gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                            {formatDateTime(targetSchedule.sesi.start).split(', ')[0]}
                                        </p>
                                        <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                                            {formatDateTime(targetSchedule.sesi.start).split(', ')[1]}
                                        </p>
                                    </div>
                                </div>

                                {/* Success Toast Notification Inside Modal */}
                                {saveSuccessMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{saveSuccessMsg}</span>
                                    </motion.div>
                                )}

                                {/* Penguji Selection Dropdowns */}
                                <div className="space-y-4">
                                    {/* 1. Penguji Al-Qur'an */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                                                Penguji Al-Qur'an (Bacaan & Hafalan)
                                            </span>
                                            {selectedQuranId && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedQuranId("")}
                                                    className="text-[10px] font-bold text-rose-600 hover:underline"
                                                >
                                                    Kosongkan
                                                </button>
                                            )}
                                        </label>
                                        <select
                                            value={selectedQuranId}
                                            onChange={(e) => setSelectedQuranId(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        >
                                            <option value="">-- Pilih Penguji Al-Qur'an (Belum Ditugaskan) --</option>
                                            {(showAllStaff ? allValidExaminers : quranExaminers).map((u) => {
                                                const conflictInfo = busyExaminersAtTargetTime.get(u.id);
                                                return (
                                                    <option key={u.id} value={u.id}>
                                                        {u.full_name} {u.role ? `(${u.role.replace(/_/g, " ")})` : ""}{conflictInfo ? ` ⚠️ [BENTROK: ${conflictInfo}]` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* 2. Pewawancara Calon Santri */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                Pewawancara Calon Santri
                                            </span>
                                            {selectedSantriId && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSantriId("")}
                                                    className="text-[10px] font-bold text-rose-600 hover:underline"
                                                >
                                                    Kosongkan
                                                </button>
                                            )}
                                        </label>
                                        <select
                                            value={selectedSantriId}
                                            onChange={(e) => setSelectedSantriId(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        >
                                            <option value="">-- Pilih Pewawancara Santri (Belum Ditugaskan) --</option>
                                            {(showAllStaff ? allValidExaminers : santriExaminers).map((u) => {
                                                const conflictInfo = busyExaminersAtTargetTime.get(u.id);
                                                return (
                                                    <option key={u.id} value={u.id}>
                                                        {u.full_name} {u.role ? `(${u.role.replace(/_/g, " ")})` : ""}{conflictInfo ? ` ⚠️ [BENTROK: ${conflictInfo}]` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* 3. Pewawancara Calon Orangtua/Wali */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-purple-500" />
                                                Pewawancara Calon Orangtua/Wali
                                            </span>
                                            {selectedOrtuId && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrtuId("")}
                                                    className="text-[10px] font-bold text-rose-600 hover:underline"
                                                >
                                                    Kosongkan
                                                </button>
                                            )}
                                        </label>
                                        <select
                                            value={selectedOrtuId}
                                            onChange={(e) => setSelectedOrtuId(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        >
                                            <option value="">-- Pilih Pewawancara Ortu/Wali (Belum Ditugaskan) --</option>
                                            {(showAllStaff ? allValidExaminers : ortuExaminers).map((u) => {
                                                const conflictInfo = busyExaminersAtTargetTime.get(u.id);
                                                return (
                                                    <option key={u.id} value={u.id}>
                                                        {u.full_name} {u.role ? `(${u.role.replace(/_/g, " ")})` : ""}{conflictInfo ? ` ⚠️ [BENTROK: ${conflictInfo}]` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* Khusus Langsung MA/SMA/SMA IT Tanpa IL: Penguji Lisan Bahasa Arab */}
                                    {isJenjangLangsungNonIL(targetSchedule.pendaftar.jenjang) && (
                                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                            <label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                                                    Penguji Lisan Bahasa Arab (Khusus Langsung MA/SMA IT Tanpa IL)
                                                </span>
                                                {selectedArabId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedArabId("")}
                                                        className="text-[10px] font-bold text-rose-600 hover:underline"
                                                    >
                                                        Kosongkan
                                                    </button>
                                                )}
                                            </label>
                                            <select
                                                value={selectedArabId}
                                                onChange={(e) => setSelectedArabId(e.target.value)}
                                                className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            >
                                                <option value="">-- Pilih Penguji Bahasa Arab (Opsional) --</option>
                                                {(showAllStaff ? allValidExaminers : (arabExaminers.length > 0 ? arabExaminers : allValidExaminers)).map((u) => {
                                                    const conflictInfo = busyExaminersAtTargetTime.get(u.id);
                                                    return (
                                                        <option key={u.id} value={u.id}>
                                                            {u.full_name} {u.role ? `(${u.role.replace(/_/g, " ")})` : ""}{conflictInfo ? ` ⚠️ [BENTROK: ${conflictInfo}]` : ""}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    {/* Checkbox Tampilkan Semua Staff */}
                                    <div className="pt-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="showAllStaffCheck"
                                            checked={showAllStaff}
                                            onChange={(e) => setShowAllStaff(e.target.checked)}
                                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                        />
                                        <label htmlFor="showAllStaffCheck" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                            Tampilkan Seluruh Staff / Penguji (Lintas Bidang)
                                        </label>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-800 font-medium">
                                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    <span>
                                        Penguji yang dipilih akan otomatis mendapatkan akses input nilai untuk santri ini, dan tautan Google Meet (jika sesi online) akan disinkronkan secara otomatis.
                                    </span>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAssignModalOpen(false)}
                                    disabled={savingAssignment}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-all disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSaveAssignment(false)}
                                    disabled={savingAssignment}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingAssignment ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Simpan Penugasan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
