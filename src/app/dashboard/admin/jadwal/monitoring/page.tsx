"use client";

import { useState, useEffect } from "react";
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
    Download
} from "lucide-react";

interface Schedule {
    id: string;
    pendaftar: {
        nomor: string;
        nama: string;
        jenjang: string;
    };
    sesi: {
        title: string;
        start: string;
        end: string;
        location: string;
    };
    ustadz: {
        quran: string;
        santri: string;
        ortu: string;
    };
    status: {
        quran: string;
        santri: string;
        ortu: string;
    };
}

export default function MonitoringJadwalPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterJenjang, setFilterJenjang] = useState("ALL");
    const [viewMode, setViewMode] = useState<"flat" | "grouped" | "santri">("flat");
    const [showPast, setShowPast] = useState(false);
    const [conflicts, setConflicts] = useState<any[]>([]);

    useEffect(() => {
        fetchMonitoringData();
    }, []);

    const findConflicts = (data: Schedule[]) => {
        const examinerTimeMap: Record<string, { student: string; pendaftarId: string; scheduleId: string }[]> = {};
        const newConflicts: any[] = [];

        data.forEach(s => {
            const timeKey = new Date(s.sesi.start).getTime().toString();
            
            const roles = [
                { type: 'quran', name: s.ustadz.quran, label: 'Al-Qur\'an' },
                { type: 'santri', name: s.ustadz.santri, label: 'W. Santri' },
                { type: 'ortu', name: s.ustadz.ortu, label: 'W. Ortu' }
            ];

            roles.forEach(role => {
                if (role.name && role.name !== "-") {
                    const key = `${role.name}_${timeKey}`;
                    if (!examinerTimeMap[key]) {
                        examinerTimeMap[key] = [];
                    }
                    examinerTimeMap[key].push({
                        student: s?.pendaftar?.nama,
                        pendaftarId: s.pendaftar.nomor,
                        scheduleId: s.id
                    });
                }
            });
        });

        Object.entries(examinerTimeMap).forEach(([key, items]) => {
            if (items.length > 1) {
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
        if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        if (status === "absent") return <XCircle className="w-4 h-4 text-red-500" />;
        return <Clock className="w-4 h-4 text-primary-400" />;
    };

    const filteredSchedules = schedules.filter(s => {
        const matchesSearch = 
            s?.pendaftar?.nama.toLowerCase().includes(search.toLowerCase()) ||
            s.pendaftar.nomor.toLowerCase().includes(search.toLowerCase()) ||
            s.ustadz.quran.toLowerCase().includes(search.toLowerCase()) ||
            s.ustadz.santri.toLowerCase().includes(search.toLowerCase()) ||
            s.ustadz.ortu.toLowerCase().includes(search.toLowerCase());
        
        const matchesJenjang = filterJenjang === "ALL" || s.pendaftar.jenjang === filterJenjang;
        
        const isPast = new Date(s.sesi.end).getTime() < new Date().getTime();
        const matchesPast = showPast || !isPast;

        return matchesSearch && matchesJenjang && matchesPast;
    }).sort((a, b) => new Date(a.sesi.start).getTime() - new Date(b.sesi.start).getTime());

    const getGroupedSchedules = () => {
        const groups: Record<string, { role: string; schedule: Schedule }[]> = {};

        filteredSchedules.forEach(s => {
            const examiners = [
                { name: s.ustadz.quran, role: "Al-Qur'an" },
                { name: s.ustadz.santri, role: "W. Santri" },
                { name: s.ustadz.ortu, role: "W. Wali/Ortu" }
            ];

            examiners.forEach(ext => {
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
                // Keep "Belum Ditentukan" at the end regardless of time
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

    return (
        <div className="space-y-6">
            {/* Simplified Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-ink-900 tracking-tight">Monitoring <span className="text-primary-600">Jadwal</span></h1>
                        <p className="text-ink-400 font-bold uppercase text-[9px] tracking-widest mt-0.5 flex items-center gap-2">
                             Rekapitulasi Real-time Peserta & Penguji Al-Qur'an
                        </p>
                    </div>
                </div>
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 md:p-8 animate-pulse shadow-lg shadow-red-500/10">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0 border border-red-200">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-red-900 mb-2 uppercase tracking-tight">Terdeteksi Konflik Penjadwalan!</h2>
                            <p className="text-red-700 font-bold text-sm leading-relaxed mb-4">Ditemukan {conflicts.length} penguji yang memiliki lebih dari satu jadwal di waktu yang sama.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {conflicts.slice(0, 6).map((c, i) => (
                                    <div key={i} className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-sm">
                                        <p className="font-black text-red-800 text-xs uppercase mb-2 border-b border-red-100 pb-2">{c.name}</p>
                                        <div className="space-y-1.5">
                                            {c.items.map((it: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                    {it.student} ({it.pendaftarId})
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-mono font-black text-red-400 mt-3 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(c.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {conflicts.length > 6 && <p className="text-red-400 text-[10px] font-black mt-4 uppercase tracking-widest">+ {conflicts.length - 6} Konflik Lainnya</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Statistics - Split Wawancara */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total Terjadwal</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 relative z-10">
                        {totalTerjadwal} <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Peserta</span>
                        <span className="text-slate-200 font-light mx-1">|</span>
                        <span className="ml-2">{totalSesi}</span> <span className="text-[10px] text-slate-400 font-bold uppercase">Jadwal</span>
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai Al-Qur&apos;an</p>
                    <p className="text-2xl md:text-3xl font-black text-emerald-600 relative z-10">{selesaiQuran}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai W. Santri</p>
                    <p className="text-2xl md:text-3xl font-black text-indigo-600 relative z-10">{selesaiWSantri}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-clay-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150"></div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Selesai W. Orang Tua</p>
                    <p className="text-2xl md:text-3xl font-black text-purple-600 relative z-10">{selesaiWOrangTua}</p>
                </div>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search & Jenjang */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                            <input 
                                type="text" 
                                placeholder="Cari santri/penguji Al-Qur'an..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none font-bold h-12 transition-all shadow-sm"
                            />
                        </div>
                        <select 
                            value={filterJenjang}
                            onChange={(e) => setFilterJenjang(e.target.value)}
                            className="w-32 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-[11px] font-black text-ink-600 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none h-12 shadow-sm appearance-none text-center uppercase tracking-wider"
                        >
                            <option value="ALL">SEMUA</option>
                            <option value="MTs">MTs</option>
                            <option value="IL">IL</option>
                        </select>
                    </div>

                    {/* View Switcher & Actions */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 md:flex-none flex bg-slate-100 p-1.5 rounded-2xl h-12 min-w-fit">
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
                            className="w-12 h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl shadow-sm transition-all flex items-center justify-center shrink-0"
                            title="Refresh Data"
                        >
                            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
                        </button>
                        <button 
                            onClick={() => setShowPast(!showPast)}
                            className={`px-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all border h-12 shadow-sm ${
                                showPast 
                                ? "bg-secondary-100 border-secondary-200 text-secondary-700" 
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {showPast ? "Sesi Lalu" : "Cek Lampau"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="space-y-6">
                {loading ? (
                    <div className="bg-white rounded-3xl shadow-clay-lg p-24 text-center border border-white/40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="font-bold text-ink-400">Memuat data monitoring...</p>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-clay-lg p-24 text-center border border-white/40">
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
                                <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-clay-m p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                                                {s?.pendaftar?.nama.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                                    {s.pendaftar.nomor}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    s.pendaftar.jenjang === 'MTs' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    {s.pendaftar.jenjang}
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
                                            <div className="text-sm font-black text-slate-700 mt-0.5 whitespace-nowrap">
                                                {formatDateTime(s.sesi.start).split(', ')[2] ?? ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Status Grid - Only show rows with assigned examiner */}
                                    <div className="grid grid-cols-1 gap-2 py-4 border-y border-slate-100/50">
                                        {[
                                            { label: 'Ujian Al-Qur&apos;an', status: s.status.quran, icon: getStatusIcon(s.status.quran), ustadz: s.ustadz.quran },
                                            { label: 'Wawancara Calon Santri', status: s.status.santri, icon: getStatusIcon(s.status.santri), ustadz: s.ustadz.santri },
                                            { label: 'Wawancara Wali/Ortu', status: s.status.ortu, icon: getStatusIcon(s.status.ortu), ustadz: s.ustadz.ortu }
                                        ].filter(stat => stat.ustadz && stat.ustadz !== '-').map((stat, i) => (
                                            <div key={i} className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg border ${
                                                        stat.status === 'completed' ? 'bg-green-50 border-green-100' : 
                                                        stat.status === 'absent' ? 'bg-red-50 border-red-100' : 
                                                        'bg-primary-50 border-primary-100'
                                                    }`}>
                                                        {stat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none">{stat.label}</p>
                                                        <p className="text-xs font-bold text-slate-700 mt-0.5">{stat.ustadz}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    stat.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    stat.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-primary-100 text-primary-700'
                                                }`}>
                                                    {stat.status === 'completed' ? 'Selesai' : stat.status === 'absent' ? 'Absen' : 'Menunggu'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold px-3 py-2 bg-slate-50 rounded-xl">
                                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                        {(s.sesi.location || '').replace(/Online\/Pesantren/gi, 'Online').replace(/Pesantren\/Online/gi, 'Online')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block bg-white rounded-3xl shadow-clay-lg overflow-hidden border border-white/40">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Peserta</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Jadwal & Lokasi</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Penguji Al-Qur'an</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">W. Santri</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">W. Ortu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredSchedules.map((s) => (
                                            <tr key={s.id} className="hover:bg-primary-50/20 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-extrabold text-slate-800 group-hover:text-primary-600 transition-colors leading-tight">
                                                            {s?.pendaftar?.nama.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                                                {s.pendaftar.nomor}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4 text-primary-500" />
                                                            {formatDateTime(s.sesi.start)}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1.5 pl-5 uppercase tracking-wide">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {(s.sesi.location || '').replace(/Online\/Pesantren/gi, 'Online').replace(/Pesantren\/Online/gi, 'Online')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(s.status.quran)}
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{s.ustadz.quran}</span>
                                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                                                s.status.quran === 'completed' ? 'text-green-600' : 'text-slate-400'
                                                            }`}>{s.status.quran === 'completed' ? 'Selesai' : s.status.quran === 'absent' ? 'Alpa' : 'Menunggu'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(s.status.santri)}
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{s.ustadz.santri}</span>
                                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                                                s.status.santri === 'completed' ? 'text-indigo-600' : 'text-slate-400'
                                                            }`}>{s.status.santri === 'completed' ? 'Selesai' : s.status.santri === 'absent' ? 'Alpa' : 'Menunggu'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(s.status.ortu)}
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{s.ustadz.ortu}</span>
                                                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                                                s.status.ortu === 'completed' ? 'text-emerald-600' : 'text-slate-400'
                                                            }`}>{s.status.ortu === 'completed' ? 'Selesai' : s.status.ortu === 'absent' ? 'Alpa' : 'Menunggu'}</span>
                                                        </div>
                                                    </div>
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
                                        <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-[17px] font-extrabold text-slate-800">{group.name} <span className="text-primary-600 ml-1">({group.items.length})</span></h2>
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Penguji Al-Qur'an / Pewawancara</span>
                                </div>
                                <div className="p-0">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/20">
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Santri</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Tugas</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50">Waktu</th>
                                                <th className="px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/50 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[13px]">
                                            {group.items.map((item, idx) => (
                                                <tr key={`${item.schedule.id}-${idx}`} className="hover:bg-primary-50/10 transition-colors">
                                                    <td className="px-7 py-4">
                                                        <span className="font-extrabold text-slate-800">{item.schedule?.pendaftar?.nama}</span>
                                                    </td>
                                                    <td className="px-7 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                                                            item.role === 'Quran' ? 'bg-orange-100 text-orange-600' :
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
                                                                item.role === 'Quran' ? item.schedule.status.quran :
                                                                item.role === 'W. Santri' ? item.schedule.status.santri :
                                                                item.schedule.status.ortu
                                                            )}
                                                        </div>
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
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                            <Users className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-800 leading-tight">{group.name.split(' (')[0]}</h2>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1.5">{group.name.split(' (')[1].replace(')', '')} • {group.items[0].pendaftar.jenjang}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 space-y-4">
                                    {group.items.map((s, idx) => (
                                        <div key={`${s.id}-${idx}`} className="bg-slate-50/30 rounded-2xl p-4 border border-slate-100/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4 text-primary-500" />
                                                <span className="text-[12px] font-bold text-slate-700">{formatDateTime(s.sesi.start)}</span>
                                            </div>
                                            <div className="space-y-2.5">
                                                {[
                                                    { role: 'Al-Qur&apos;an', ustadz: s.ustadz.quran, status: s.status.quran },
                                                    { role: 'Santri', ustadz: s.ustadz.santri, status: s.status.santri },
                                                    { role: 'Ortu', ustadz: s.ustadz.ortu, status: s.status.ortu }
                                                ].filter(x => x.ustadz !== "-").map((x, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[12px]">
                                                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-tight">{x.role}</span>
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="font-bold text-slate-700">{x.ustadz}</span>
                                                            <div className={`w-2 h-2 rounded-full ${x.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-primary-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]'}`} />
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

        </div>
    );
}
