"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Search, Filter, Loader2, Download } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HasilSeleksiPage() {
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [stats, setStats] = useState({ total_lulus: 0, total_cadangan: 0, total_gagal: 0 });
    const [filter, setFilter] = useState({
        jenjang: "",
        status: "accepted", // Default to those accepted
    });

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.jenjang) params.append("jenjang", filter.jenjang);
            if (filter.status) params.append("status", filter.status); // allowed statuses: accepted, rejected, waiting_list
            params.append("limit", "500"); // Bring a large batch for recap

            // Important: if the user selects "Semua Hasil", we must fetch all post-exam statuses
            if (filter.status === "semua_hasil") {
                params.delete("status"); // We'll filter client-side or assume API handles
            }

            const res = await fetch(`/api/admin/pendaftar/list?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                let theData = data.data || [];

                // If 'semua_hasil', filter manually for post-announcement statuses
                if (filter.status === "semua_hasil") {
                    theData = theData.filter((c: any) =>
                        ['accepted', 'rejected', 'cadangan', 'enrolled'].includes(c.status_pendaftaran)
                    );
                }

                setCandidates(theData);

                // Calculate basic stats from this batch
                const lulus = theData.filter((c: any) => c.status_pendaftaran === 'accepted' || c.status_pendaftaran === 'enrolled').length;
                const gagal = theData.filter((c: any) => c.status_pendaftaran === 'rejected').length;
                const cadangan = theData.filter((c: any) => c.status_pendaftaran === 'cadangan').length;
                setStats({ total_lulus: lulus, total_gagal: gagal, total_cadangan: cadangan });
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data rekapitulasi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [filter]);

    const handleExportExcel = () => {
        if (candidates.length === 0) return toast.error('Tidak ada data yang bisa diexport');

        // Simple CSV Export
        const headers = ['No Pendaftaran', 'Nama Lengkap', 'Jenjang', 'Status', 'Total Nilai (Tes Bukti)'];
        const csvContent = [
            headers.join(','),
            ...candidates.map(s => [
                s.nomor_pendaftaran,
                s.nama_lengkap.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
                s.jenjang,
                s.status_pendaftaran,
                s.nilai_ujian?.nilai_total || '-'
            ].map(v => `"${v}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Rekap_Hasil_Seleksi_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">

            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-black text-stone-800">Rekapitulasi Hasil Seleksi</h1>
                <p className="text-stone-500 mt-1">Laporan menyeluruh untuk pendaftar yang telah diatur status kelulusannya.</p>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100 relative overflow-hidden">
                    <p className="text-green-600 text-sm font-bold tracking-wider uppercase mb-1">Total Lulus</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-green-700">{stats.total_lulus}</h3>
                        <span className="text-green-600/70 font-medium mb-1 pl-1">Santri</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-green-200/50 w-24 h-24 rounded-full blur-xl"></div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100 relative overflow-hidden">
                    <p className="text-amber-600 text-sm font-bold tracking-wider uppercase mb-1">Cadangan</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-amber-700">{stats.total_cadangan}</h3>
                        <span className="text-amber-600/70 font-medium mb-1 pl-1">Santri</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-amber-200/50 w-24 h-24 rounded-full blur-xl"></div>
                </div>
                <div className="bg-rose-50 p-6 rounded-xl shadow-sm border border-rose-100 relative overflow-hidden">
                    <p className="text-rose-600 text-sm font-bold tracking-wider uppercase mb-1">Tidak Lulus</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-black text-rose-700">{stats.total_gagal}</h3>
                        <span className="text-rose-600/70 font-medium mb-1 pl-1">Santri</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-rose-200/50 w-24 h-24 rounded-full blur-xl"></div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                        <Filter className="w-4 h-4 text-stone-500" />
                        <select
                            className="bg-transparent text-sm font-bold text-stone-700 focus:outline-none"
                            value={filter.jenjang}
                            onChange={(e) => setFilter({ ...filter, jenjang: e.target.value })}
                        >
                            <option value="">Semua Jenjang</option>
                            <option value="MTs">MTs</option>
                            <option value="SMA">SMA</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
                        <Search className="w-4 h-4 text-stone-500" />
                        <select
                            className="bg-transparent text-sm font-bold text-stone-700 focus:outline-none"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="semua_hasil">Semua Hasil</option>
                            <option value="accepted">Lulus & Terdaftar</option>
                            <option value="cadangan">Cadangan</option>
                            <option value="rejected">Tidak Lulus</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleExportExcel}
                    disabled={candidates.length === 0 || loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 disabled:shadow-none disabled:bg-stone-300 w-full md:w-auto"
                >
                    <Download className="w-4 h-4" />
                    Ekspor Excel
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-100/50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Nama Lengkap</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Jenjang</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Total Nilai</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-stone-500 uppercase tracking-wider">Keputusan Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-stone-400" />
                                        <p>Memuat rekapitulasi data...</p>
                                    </td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                                        <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                                        <p className="font-medium text-stone-600">Tidak ada data rekapitulasi yang ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((c) => (
                                    <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-stone-800 text-sm">{c.nama_lengkap.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}</div>
                                            <div className="text-xs text-stone-500 mt-0.5">{c.nomor_pendaftaran}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-md text-xs font-bold border border-stone-200 shadow-sm">
                                                {c.jenjang}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-stone-800 text-lg">
                                                {c.nilai_ujian?.nilai_total || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(c.status_pendaftaran === 'accepted' || c.status_pendaftaran === 'enrolled') ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> LULUS
                                                </span>
                                            ) : c.status_pendaftaran === 'cadangan' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                                    CADANGAN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                                                    TIDAK LULUS
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
