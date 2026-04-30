
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { 
    ClipboardEdit, 
    MessageSquare, 
    Download, 
    RefreshCcw, 
    Send, 
    BarChart3, 
    AlertCircle, 
    CheckCircle2, 
    Clock,
    LayoutDashboard,
    Zap,
    Users,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

import { utils, writeFile } from 'xlsx';

// Simplified type for MVP.
type Student = {
    id: string;
    status_pendaftaran: string;
    nama_lengkap: string;
    jenjang: string;
    nomor_pendaftaran: string;
    nilai_ujian?: {
        nilai_total: number;
        status_kelulusan: string;
        catatan_kelulusan: string;
        score_quran: number;
        score_wawancara: number;
        nilai_wawancara_santri: number;
        score_akademik: number;
        score_kepribadian: number;
        score_kesiapan: number;
        nilai_wawancara_ortu: number;
    },
    whatsapp_status?: {
        status: string;
        updated_at: string;
        error_message?: string;
    } | null;
};

export default function ExaminerDashboard() {
    const [activeTab, setActiveTab] = useState<'data' | 'system'>('data');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State for Modal
    const [inputType, setInputType] = useState<'quran' | 'wawancara_santri' | 'wawancara_ortu'>('quran');
    
    // Dedicated Sub-form States
    const [quranForm, setQuranForm] = useState({ tajwid: '', kelancaran: '' });
    const [wsForm, setWsForm] = useState({ motivasi: '', lingkungan: '', permainan: '', teman: '', rokok: '', pornografi: '', hobi: '' });
    const [woForm, setWoForm] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '' });
    const [catatan, setCatatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [queueStats, setQueueStats] = useState<{ pending: number, sent: number, failed: number } | null>(null);
    const [flushProgress, setFlushProgress] = useState(0);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/pendaftar/list?limit=100'); 
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setStudents(json.data || []);
            
            // Also fetch stats from cron result (using same secret)
            const statsRes = await fetch('/api/cron/whatsapp?secret=ppdb-alimam-cron-2026');
            const statsJson = await statsRes.json();
            if (statsJson.stats?.queue) {
                setQueueStats({
                    pending: statsJson.stats.queue.pending || 0,
                    sent: statsJson.stats.queue.sent || 0,
                    failed: statsJson.stats.queue.failed || 0
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenInput = (student: Student, type: 'quran' | 'wawancara_santri' | 'wawancara_ortu') => {
        setSelectedStudent(student);
        setInputType(type);
        setQuranForm({ tajwid: '', kelancaran: '' });
        setWsForm({ motivasi: '', lingkungan: '', permainan: '', teman: '', rokok: '', pornografi: '', hobi: '' });
        setWoForm({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '' });
        setCatatan('');
    };

    const handleSubmitScore = async () => {
        if (!selectedStudent) return;

        setIsSubmitting(true);
        try {
            let finalScore = 0;
            if (inputType === 'quran') {
                finalScore = (Number(quranForm.tajwid) + Number(quranForm.kelancaran)) / 2;
            } else if (inputType === 'wawancara_santri') {
                const sum = Object.values(wsForm).reduce((acc, val) => acc + Number(val || 0), 0);
                finalScore = (sum / 35) * 100;
            } else if (inputType === 'wawancara_ortu') {
                let total = 0; let counted = 0;
                Object.values(woForm).forEach(val => {
                    if (val === 'A') { total += 100; counted++; }
                    else if (val === 'B') { total += 75; counted++; }
                    else if (val === 'C') { total += 50; counted++; }
                });
                finalScore = counted > 0 ? total / counted : 0;
            }

            const payload = {
                pendaftar_id: selectedStudent.id,
                type: inputType,
                score: finalScore,
                details: { catatan },
                examiner_id: 'mock-examiner-id'
            };

            const res = await fetch('/api/penilaian/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to submit');

            Swal.fire('Sukses', 'Nilai berhasil disimpan', 'success');
            setSelectedStudent(null);
            fetchStudents();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan nilai', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFlushQueue = async () => {
        try {
            const currentPending = queueStats?.pending || 0;
            if (currentPending === 0) {
                Swal.fire('Info', 'Tidak ada antrean yang perlu diproses', 'info');
                return;
            }

            setIsProcessingQueue(true);
            setFlushProgress(0);
            
            let processedInLoop = 0;
            // Limit to max 50 per manual trigger to prevent timeout
            const maxToProcess = Math.min(currentPending, 50);

            for (let i = 0; i < maxToProcess; i++) {
                try {
                    const res = await fetch('/api/cron/whatsapp?secret=ppdb-alimam-cron-2026');
                    if (!res.ok) break;
                    
                    const data = await res.json();
                    if (!data?.result?.processed) break;
                    
                    processedInLoop++;
                    setFlushProgress(Math.round(((i + 1) / maxToProcess) * 100));
                    
                    // Small delay to prevent rate limit issues
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    console.warn('Individual flush failed:', err);
                    break;
                }
            }

            Swal.fire({
                title: 'Antrean Diproses',
                text: `${processedInLoop} pesan telah dikirim ke Wablas.`,
                icon: 'success'
            });
            fetchStudents();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memproses antrean', 'error');
        } finally {
            setIsProcessingQueue(false);
            setFlushProgress(0);
        }
    };

    const filteredStudents = (students || []).filter(s => {
        const name = (s?.nama_lengkap || '').toLowerCase();
        const regNum = (s?.nomor_pendaftaran || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();
        return name.includes(query) || regNum.includes(query);
    });

    const handleExportExcel = () => {
        if (!students?.length) return Swal.fire('Info', 'Tidak ada data untuk diekspor', 'info');

        const getGrade = (score: number | undefined | null, type: string) => {
            if (score == null) return '-';
            if (type === 'akademik') {
                if (score >= 75) return 'A';
                if (score >= 60) return 'B';
                return 'C';
            }
            if (type === 'quran') {
                if (score >= 80) return 'A';
                if (score >= 65) return 'B';
                return 'C';
            }
            if (type === 'kepribadian') {
                if (score >= 70) return 'A';
                if (score >= 50) return 'B';
                return 'C';
            }
            // Wawancara & Kesiapan
            if (score >= 80) return 'A';
            if (score >= 60) return 'B';
            return 'C';
        };

        const exportData = students.map(s => {
            const wawancaraSantri = s.nilai_ujian?.nilai_wawancara_santri || 0;
            const wawancaraOrtu = s.nilai_ujian?.nilai_wawancara_ortu || 0;
            // Kesesuaian is the average of both interviews
            const avgWawancara = (wawancaraSantri > 0 && wawancaraOrtu > 0) 
                ? (wawancaraSantri + wawancaraOrtu) / 2 
                : (wawancaraSantri || wawancaraOrtu || 0);

            return {
                'NP': s.nomor_pendaftaran || '-',
                'Nama': (s.nama_lengkap || '').toUpperCase(),
                'Jenjang': s.jenjang || '-',
                'Al-Quran': getGrade(s.nilai_ujian?.score_quran, 'quran'),
                'Akademi': getGrade(s.nilai_ujian?.score_akademik, 'akademik'),
                'Kepribadian': getGrade(s.nilai_ujian?.score_kepribadian, 'kepribadian'),
                'Kesesuaian': getGrade(avgWawancara, 'wawancara'),
                'Kesiapan': getGrade(s.nilai_ujian?.score_kesiapan, 'kesiapan'),
                'Keputusan': s.nilai_ujian?.status_kelulusan || 'PENDING'
            };
        });

        const worksheet = utils.json_to_sheet(exportData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Data Penilaian');

        // Set column widths
        const wscols = [
            { wch: 12 }, // NP
            { wch: 35 }, // Nama
            { wch: 12 }, // Jenjang
            { wch: 10 }, // Quran
            { wch: 10 }, // Akademi
            { wch: 10 }, // Kepribadian
            { wch: 12 }, // Kesesuaian
            { wch: 10 }, // Kesiapan
            { wch: 15 }, // Keputusan
        ];
        worksheet['!cols'] = wscols;

        writeFile(workbook, `Rekap_Nilai_PPDB_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-brand-blue-600 rounded-xl shadow-lg shadow-brand-blue-600/20">
                            <ClipboardEdit className="w-6 h-6 text-white" />
                        </div>
                        Pusat <span className="text-brand-blue-700">Penilaian</span>
                    </h1>
                    <p className="text-ink-500 font-medium mt-1">Kelola skor ujian dan monitoring notifikasi pendaftar.</p>
                </div>
                
                <div className="flex bg-ink-50 p-1 rounded-2xl border border-ink-100 w-fit">
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'data' 
                                ? "bg-white text-brand-blue-700 shadow-clay-sm" 
                                : "text-ink-500 hover:text-ink-800"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Data Penilaian
                    </button>
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'system' 
                                ? "bg-white text-brand-blue-700 shadow-clay-sm" 
                                : "text-ink-500 hover:text-ink-800"
                        }`}
                    >
                        <Zap className={`w-4 h-4 ${queueStats?.pending ? 'text-amber-500 animate-pulse' : ''}`} />
                        Monitoring Notifikasi
                        {queueStats?.pending ? (
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full ml-1">{queueStats.pending}</span>
                        ) : null}
                    </button>
                </div>
            </div>

            {activeTab === 'data' ? (
                /* TAB 1: DATA PENILAIAN */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white rounded-3xl shadow-clay-md border border-white/40 overflow-hidden">
                        <div className="p-6 border-b border-ink-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-ink-50/30">
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama atau no. pendaftaran..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-ink-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-blue-600/10 outline-none shadow-inner"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                <Button 
                                    onClick={handleExportExcel} 
                                    className="btn-secondary flex items-center gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 rounded-xl font-bold py-2"
                                >
                                    <Download className="w-4 h-4" /> Export Excel
                                </Button>

                                <Button 
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/penilaian/recalculate', { method: 'POST' });
                                            if (!res.ok) throw new Error('Failed');
                                            const result = await res.json();
                                            Swal.fire('Sukses', `${result.recalculated} data berhasil dihitung ulang`, 'success');
                                            fetchStudents();
                                        } catch {
                                            Swal.fire('Error', 'Gagal menghitung ulang', 'error');
                                        }
                                    }} 
                                    className="btn-secondary flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 rounded-xl font-bold py-2"
                                >
                                    <RefreshCcw className="w-4 h-4" /> Hitung Ulang
                                </Button>

                                <Button onClick={fetchStudents} variant="outline" className="rounded-xl border-ink-200">
                                    <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-ink-100">
                                <thead className="bg-ink-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">NP</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">Nama Peserta</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">Jenjang</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">Status</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Quran</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Akademi</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Keprib.</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Sesuai</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Siap</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-brand-blue-700 uppercase tracking-widest bg-brand-blue-50/30">Total</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">Aksi Input</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-ink-50">
                                    {loading ? (
                                        <tr><td colSpan={8} className="px-6 py-12 text-center text-ink-400 font-medium italic">Memuat data santri...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-12 text-center text-ink-400 font-medium italic">Tidak ada data pendaftar yang cocok.</td></tr>
                                    ) : (
                                        filteredStudents.map(s => (
                                            <tr key={s.id} className="hover:bg-brand-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-ink-400">{s.nomor_pendaftaran || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-black text-ink-900 leading-tight">
                                                        {(s.nama_lengkap || 'Tanpa Nama').toLowerCase().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">{(s.status_pendaftaran || '').replace('_', ' ')}</p>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-ink-600 bg-ink-100 px-2 py-1 rounded-lg">{s.jenjang}</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {(() => {
                                                        const examStatus = s.nilai_ujian?.status_kelulusan;
                                                        const colors: any = {
                                                            'LULUS': 'bg-green-100 text-green-700 border-green-200',
                                                            'DITERIMA': 'bg-green-100 text-green-700 border-green-200',
                                                            'CADANGAN': 'bg-amber-100 text-amber-700 border-amber-200',
                                                            'DITOLAK': 'bg-red-100 text-red-700 border-red-200',
                                                            'BELUM LENGKAP': 'bg-orange-100 text-orange-700 border-orange-200',
                                                            'pending': 'bg-ink-100 text-ink-500 border-ink-200'
                                                        };
                                                        const color = colors[examStatus || 'pending'] || 'bg-ink-100 text-ink-500 border-ink-200';
                                                        return (
                                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border shadow-sm ${color}`}>
                                                                {examStatus || 'MENUNGGU'}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                {/* Kolom Nilai: Quran, Akad, Keprib, Sesuai, Siap */}
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    {(() => {
                                                        const score = s.nilai_ujian?.score_quran;
                                                        if (score == null) return <span className="text-ink-200">-</span>;
                                                        const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : 'C';
                                                        const color = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-sky-400' : 'bg-amber-400';
                                                        return <span className={`${color} text-white text-[10px] font-black px-2 py-1 rounded shadow-sm`}>{grade}</span>
                                                    })()}
                                                </td>
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    {(() => {
                                                        const score = s.nilai_ujian?.score_akademik;
                                                        if (score == null) return <span className="text-ink-200">-</span>;
                                                        const grade = score >= 75 ? 'A' : score >= 60 ? 'B' : 'C';
                                                        const color = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-sky-400' : 'bg-amber-400';
                                                        return <span className={`${color} text-white text-[10px] font-black px-2 py-1 rounded shadow-sm`}>{grade}</span>
                                                    })()}
                                                </td>
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    {(() => {
                                                        const score = s.nilai_ujian?.score_kepribadian;
                                                        if (score == null) return <span className="text-ink-200">-</span>;
                                                        const grade = score >= 70 ? 'A' : score >= 50 ? 'B' : 'C';
                                                        const color = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-sky-400' : 'bg-amber-400';
                                                        return <span className={`${color} text-white text-[10px] font-black px-2 py-1 rounded shadow-sm`}>{grade}</span>
                                                    })()}
                                                </td>
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    {(() => {
                                                        const ws = s.nilai_ujian?.nilai_wawancara_santri || 0;
                                                        const wo = s.nilai_ujian?.nilai_wawancara_ortu || 0;
                                                        if (ws === 0 && wo === 0) return <span className="text-ink-200">-</span>;
                                                        const score = (ws > 0 && wo > 0) ? (ws + wo) / 2 : (ws || wo);
                                                        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : 'C';
                                                        const color = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-sky-400' : 'bg-amber-400';
                                                        return <span className={`${color} text-white text-[10px] font-black px-2 py-1 rounded shadow-sm`}>{grade}</span>
                                                    })()}
                                                </td>
                                                <td className="px-3 py-4 text-center whitespace-nowrap">
                                                    {(() => {
                                                        const score = s.nilai_ujian?.score_kesiapan;
                                                        if (score == null) return <span className="text-ink-200">-</span>;
                                                        const grade = score >= 75 ? 'A' : score >= 55 ? 'B' : 'C';
                                                        const color = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-sky-400' : 'bg-amber-400';
                                                        return <span className={`${color} text-white text-[10px] font-black px-2 py-1 rounded shadow-sm`}>{grade}</span>
                                                    })()}
                                                </td>
                                                {/* Total */}
                                                <td className="px-3 py-4 text-center whitespace-nowrap bg-brand-blue-50/20">
                                                    <span className="text-base font-black text-brand-blue-700">
                                                        {s.nilai_ujian?.nilai_total != null
                                                            ? Number(s.nilai_ujian.nilai_total).toFixed(1)
                                                            : <span className="text-ink-300 font-bold">-</span>
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center items-center gap-1">
                                                        <button 
                                                            onClick={() => handleOpenInput(s, 'quran')} 
                                                            className="flex items-center gap-1.5 bg-ink-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-brand-blue-600 transition-all shadow-md group-hover:scale-105"
                                                        >
                                                            <Zap className="w-3 h-3" /> QURAN
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenInput(s, 'wawancara_santri')} 
                                                            className="flex items-center gap-1.5 bg-white border border-ink-200 text-ink-700 px-3 py-1.5 rounded-xl text-[10px] font-black hover:border-brand-blue-600 transition-all shadow-sm group-hover:scale-105"
                                                        >
                                                            <MessageSquare className="w-3 h-3" /> W.SANTRI
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenInput(s, 'wawancara_ortu')} 
                                                            className="flex items-center gap-1.5 bg-brand-yellow-50 border border-brand-yellow-200 text-brand-yellow-800 px-3 py-1.5 rounded-xl text-[10px] font-black hover:border-brand-yellow-400 transition-all shadow-sm group-hover:scale-105"
                                                        >
                                                            <MessageSquare className="w-3 h-3" /> W.ORTU
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {loading ? (
                                <div className="py-12 text-center text-ink-400 font-medium italic">Memuat data pendaftar...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="py-12 text-center text-ink-400 font-medium italic">Tidak ada data pendaftar.</div>
                            ) : (
                                filteredStudents.map(s => (
                                    <div key={s.id} className="bg-white rounded-3xl p-5 shadow-clay-sm border border-ink-50 space-y-4">
                                        {/* Header: No. Daftar + Nama + Jenjang */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-mono font-bold text-ink-400 tracking-tight">{s.nomor_pendaftaran || '-'}</span>
                                                    <span className="text-[9px] font-black text-brand-blue-700 bg-brand-blue-50 px-2 py-0.5 rounded-lg uppercase">{s.jenjang}</span>
                                                </div>
                                                <h3 className="text-sm font-black text-ink-900 uppercase leading-snug">
                                                    {(s.nama_lengkap || 'Tanpa Nama').toLowerCase().replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                                                </h3>
                                                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mt-0.5">{(s.status_pendaftaran || '').replace('_', ' ')}</p>
                                            </div>
                                            {/* Total Badge */}
                                            <div className="bg-brand-blue-600 px-4 py-2.5 rounded-2xl text-white text-center shrink-0">
                                                <p className="text-[8px] font-black opacity-70 uppercase">Total</p>
                                                <p className="text-xl font-black leading-none mt-0.5">
                                                    {s.nilai_ujian?.nilai_total != null
                                                        ? Number(s.nilai_ujian.nilai_total).toFixed(1)
                                                        : '-'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Ujian */}
                                        {(() => {
                                            const examStatus = s.nilai_ujian?.status_kelulusan;
                                            const colors: any = {
                                                'LULUS': 'bg-green-100 text-green-700 border-green-200',
                                                'DITERIMA': 'bg-green-100 text-green-700 border-green-200',
                                                'CADANGAN': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'DITOLAK': 'bg-red-100 text-red-700 border-red-200',
                                                'BELUM LENGKAP': 'bg-orange-100 text-orange-700 border-orange-200',
                                                'pending': 'bg-ink-100 text-ink-500 border-ink-200'
                                            };
                                            const color = colors[examStatus || 'pending'] || 'bg-ink-100 text-ink-500 border-ink-200';
                                            return (
                                                <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full border ${color}`}>
                                                    {examStatus || 'MENUNGGU'}
                                                </span>
                                            );
                                        })()}

                                        {/* 6 Nilai Grid — 3x2 */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Akademik', value: s.nilai_ujian?.score_akademik },
                                                { label: 'Kepribadian', value: s.nilai_ujian?.score_kepribadian },
                                                { label: 'Kesiapan', value: s.nilai_ujian?.score_kesiapan },
                                                { label: 'Al-Qur\'an', value: s.nilai_ujian?.score_quran },
                                                { label: 'W. Calsan', value: s.nilai_ujian?.nilai_wawancara_santri },
                                                { label: 'W. Cawalsan', value: s.nilai_ujian?.nilai_wawancara_ortu },
                                            ].map((item) => (
                                                <div key={item.label} className="bg-ink-50 rounded-xl p-2.5 text-center">
                                                    <p className="text-sm font-black text-ink-900 leading-none">
                                                        {item.value != null ? Math.round(item.value) : <span className="text-ink-300">-</span>}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-ink-400 uppercase tracking-wide mt-1 leading-tight">{item.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => handleOpenInput(s, 'quran')} 
                                                className="flex items-center justify-center gap-2 bg-ink-900 text-white py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-ink-900/10 active:scale-95 transition-all"
                                            >
                                                <Zap className="w-3.5 h-3.5" /> TES QURAN
                                            </button>
                                            <button 
                                                onClick={() => handleOpenInput(s, 'wawancara_santri')} 
                                                className="flex flex-col items-center justify-center bg-brand-yellow-400 text-brand-blue-900 py-2 rounded-2xl text-[10px] sm:text-[11px] font-black shadow-lg shadow-brand-yellow-400/20 active:scale-95 transition-all"
                                            >
                                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> SANTRI</span>
                                            </button>
                                            <button 
                                                onClick={() => handleOpenInput(s, 'wawancara_ortu')} 
                                                className="flex flex-col items-center justify-center bg-brand-yellow-200 text-brand-yellow-900 py-2 rounded-2xl text-[10px] sm:text-[11px] font-black shadow-lg shadow-brand-yellow-200/20 active:scale-95 transition-all"
                                            >
                                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> ORTU</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB 2: MONITORING NOTIFIKASI */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Progress Monitor if Processing */}
                    {isProcessingQueue && (
                        <div className="bg-brand-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-brand-blue-600/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Send className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                                    <RefreshCcw className="w-5 h-5 animate-spin" /> Sedang Mengirim Pesan...
                                </h3>
                                <div className="w-full bg-white/20 rounded-full h-4 mb-2">
                                    <div 
                                        className="bg-white h-4 rounded-full transition-all duration-500" 
                                        style={{ width: `${flushProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm font-bold opacity-80">{flushProgress}% Selesai. Jangan tutup halaman ini.</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">Antrean Pending</p>
                                <p className="text-3xl font-black text-ink-900">{queueStats?.pending || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
                            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">Berhasil Terkirim</p>
                                <p className="text-3xl font-black text-ink-900">{queueStats?.sent || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-clay-md border border-white/40 flex items-center gap-4">
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest leading-none mb-1">Gagal / Error</p>
                                <p className="text-3xl font-black text-ink-900">{queueStats?.failed || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* System Actions Area */}
                    <div className="bg-white rounded-3xl shadow-clay-md border border-white/40 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-ink-50 rounded-2xl">
                                    <LayoutDashboard className="w-6 h-6 text-ink-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-ink-900 leading-tight">Kontrol Notifikasi Sistem</h2>
                                    <p className="text-sm font-medium text-ink-400">Jalankan proses batch notifikasi secara manual di sini.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                <div className="p-6 bg-brand-blue-50/30 rounded-3xl border border-brand-blue-100/50 hover:bg-brand-blue-50 transition-colors">
                                    <h4 className="font-black text-brand-blue-900 mb-2">Broadcast Jadwal Seleksi</h4>
                                    <p className="text-xs text-brand-blue-700/70 mb-6 font-medium leading-relaxed">Sistem akan memindai pendaftar yang sudah terverifikasi berkasnya tapi belum memiliki jadwal, lalu memasukkannya ke antrean notifikasi.</p>
                                    <Button 
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Siarkan Jadwal?',
                                                text: `Sistem akan mencari pendaftar layak yang belum diberi notifikasi jadwal.`,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#2563eb',
                                                confirmButtonText: 'Ya, Siarkan!',
                                                cancelButtonText: 'Batal'
                                            });
                                            if (result.isConfirmed) {
                                                try {
                                                    setIsBroadcasting(true);
                                                    const res = await fetch('/api/admin/notifications/broadcast-availability', { 
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ reset_flags: false })
                                                    });
                                                    if (!res.ok) throw new Error('Failed');
                                                    const data = await res.json();
                                                    Swal.fire('Berhasil', `${data.count || 0} pendaftar masuk antrean.`, 'success');
                                                    fetchStudents();
                                                } catch (error) {
                                                    console.error(error);
                                                    Swal.fire('Error', 'Gagal memproses broadcast', 'error');
                                                } finally {
                                                    setIsBroadcasting(false);
                                                }
                                            }
                                        }} 
                                        disabled={isBroadcasting}
                                        className="w-full bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-2xl py-6 font-black text-base shadow-lg shadow-brand-blue-600/20"
                                    >
                                        {isBroadcasting ? 'Memproses...' : 'Siarkan Jadwal Sekarang'}
                                    </Button>
                                </div>

                                <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                                    <h4 className="font-black text-emerald-900 mb-2">Kirim Paksa Antrean (Flush)</h4>
                                    <p className="text-xs text-emerald-700/70 mb-6 font-medium leading-relaxed">Jalankan pemicu manual untuk mengirim pesan yang sedang tertahan di antrean ke server provider WhatsApp (Wablas).</p>
                                    <Button 
                                        onClick={handleFlushQueue} 
                                        disabled={isProcessingQueue || !queueStats?.pending}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-black text-base shadow-lg shadow-emerald-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                                    >
                                        {isProcessingQueue ? `Mengirim (${flushProgress}%)...` : 'Kirim Seluruh Antrean'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Modal for Input Nilai */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setSelectedStudent(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20">
                            <div className="bg-white px-6 pt-8 pb-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-brand-blue-50 text-brand-blue-600 rounded-2xl">
                                        <Zap className="w-5 h-5 font-black" />
                                    </div>
                                    <h3 className="text-xl leading-6 font-black text-ink-900" id="modal-title">
                                        Input Nilai {inputType === 'quran' ? 'Al-Quran' : inputType === 'wawancara_santri' ? 'Wawancara Santri' : 'Wawancara Ortu/Wali'}
                                    </h3>
                                </div>

                                <div className="bg-ink-50 rounded-2xl p-4 mb-6 border border-ink-100">
                                    <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">Peserta Tes</p>
                                    <p className="text-lg font-black text-ink-900">{(selectedStudent.nama_lengkap || '').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}</p>
                                    <p className="text-xs font-bold text-ink-500 font-mono mt-0.5">{selectedStudent.nomor_pendaftaran || '-'} • {selectedStudent.jenjang || '-'}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {inputType === 'quran' && (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">Nilai Tajwid (0-100)</label>
                                                <input
                                                    type="number"
                                                    value={quranForm.tajwid}
                                                    onChange={(e) => setQuranForm({ ...quranForm, tajwid: e.target.value })}
                                                    placeholder="0-100"
                                                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-brand-blue-600/10 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">Nilai Kelancaran (0-100)</label>
                                                <input
                                                    type="number"
                                                    value={quranForm.kelancaran}
                                                    onChange={(e) => setQuranForm({ ...quranForm, kelancaran: e.target.value })}
                                                    placeholder="0-100"
                                                    className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-brand-blue-600/10 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {inputType === 'wawancara_santri' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { k: 'motivasi', l: 'Motivasi (1-5)' },
                                                { k: 'lingkungan', l: 'Lingkungan (1-5)' },
                                                { k: 'permainan', l: 'Permainan (1-5)' },
                                                { k: 'teman', l: 'Teman (1-5)' },
                                                { k: 'rokok', l: 'Rokok (1-5)' },
                                                { k: 'pornografi', l: 'Pornografi (1-5)' },
                                                { k: 'hobi', l: 'Hobi Positif (1-5)' }
                                            ].map(f => (
                                                <div key={f.k}>
                                                    <label className="block text-[10px] font-black text-ink-400 uppercase tracking-wider mb-2">{f.l}</label>
                                                    <select
                                                        value={(wsForm as any)[f.k]}
                                                        onChange={(e) => setWsForm({ ...wsForm, [f.k]: e.target.value })}
                                                        className="w-full bg-ink-50 border border-ink-100 rounded-xl px-3 py-2 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-brand-blue-600/10 outline-none"
                                                    >
                                                        <option value="">Pilih...</option>
                                                        <option value="1">1</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="4">4</option>
                                                        <option value="5">5</option>
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {inputType === 'wawancara_ortu' && (
                                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            <p className="text-[10px] font-black text-ink-500 uppercase">Pilih A/B/C untuk 10 Pertanyaan Standar Wawancara Wali</p>
                                            {Array.from({ length: 10 }).map((_, idx) => (
                                                <div key={idx} className="flex flex-col gap-1">
                                                  <label className="block text-[10px] font-black text-ink-400 uppercase tracking-wider">Pertanyaan {idx + 1}</label>
                                                  <select
                                                      value={(woForm as any)[`q${idx+1}`]}
                                                      onChange={(e) => setWoForm({ ...woForm, [`q${idx+1}`]: e.target.value })}
                                                      className="w-full bg-ink-50 border border-ink-100 rounded-xl px-3 py-2 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-brand-blue-600/10 outline-none"
                                                  >
                                                      <option value="">Pilih...</option>
                                                      <option value="A">A (Sangat Baik / Menerima)</option>
                                                      <option value="B">B (Baik / Kondisional)</option>
                                                      <option value="C">C (Kurang / Tidak Ideal)</option>
                                                  </select>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-black text-ink-400 uppercase tracking-wider mb-2">Catatan Khusus</label>
                                        <textarea
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            rows={3}
                                            placeholder="Tambahkan catatan jika diperlukan..."
                                            className="w-full bg-ink-50 border border-ink-100 rounded-xl px-4 py-3 text-sm font-bold text-ink-900 focus:ring-2 focus:ring-brand-blue-600/10 outline-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-ink-50 px-6 py-6 sm:px-8 sm:flex sm:flex-row-reverse gap-3 border-t border-ink-100">
                                <Button
                                    onClick={handleSubmitScore}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-2xl px-8 py-3 font-black shadow-lg shadow-brand-blue-600/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="mt-3 sm:mt-0 w-full sm:w-auto bg-white border border-ink-200 text-ink-600 hover:bg-ink-100 rounded-2xl px-8 py-3 font-black shadow-sm transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
