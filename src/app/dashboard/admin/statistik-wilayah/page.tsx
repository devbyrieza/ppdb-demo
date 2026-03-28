"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    MapPin,
    Users,
    Building2,
    Loader2,
    ArrowUpRight,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

// Type definitions for the statistics data
interface CityData {
    name: string;
    total: number;
}

interface ProvinceData {
    total: number;
    cities: CityData[];
}

interface StatisticsData {
    santri: Record<string, ProvinceData>;
    wali: Record<string, ProvinceData>;
}

export default function StatistikWilayahPage() {
    const [data, setData] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"santri" | "wali">("santri");
    const [expandedProv, setExpandedProv] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/statistik/wilayah");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-ink-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-maroon-600" />
                <p className="font-bold">Menganalisis data wilayah...</p>
            </div>
        );
    }

    const currentData = activeTab === "santri" ? data?.santri : data?.wali;
    const sortedProvinces = currentData 
        ? Object.entries(currentData).sort(([, a], [, b]) => b.total - a.total)
        : [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-clay-lg p-8 border border-white/40 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-ink-900 tracking-tight">Statistik <span className="text-indigo-600">Wilayah</span></h1>
                        <p className="text-ink-500 font-medium">Analisis sebaran pendaftar dan wali murid berdasarkan lokasi.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-cream-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("santri")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all sm:text-sm ${activeTab === "santri" ? "bg-white text-indigo-600 shadow-clay-sm" : "text-ink-500 hover:text-ink-800"
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Sebaran Santri
                </button>
                <button
                    onClick={() => setActiveTab("wali")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all sm:text-sm ${activeTab === "wali" ? "bg-white text-indigo-600 shadow-clay-sm" : "text-ink-500 hover:text-ink-800"
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Sebaran Wali
                </button>
            </div>

            {/* Stats List */}
            <div className="grid grid-cols-1 gap-6">
                {sortedProvinces.map(([provName, provData]: [string, any]) => (
                    <div key={provName} className="bg-white rounded-2xl shadow-clay-md border border-white/40 overflow-hidden group">
                        <div
                            onClick={() => setExpandedProv(expandedProv === provName ? null : provName)}
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-cream-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner">
                                    {provData.total}
                                </div>
                                <div>
                                    <h3 className="font-black text-ink-900 text-lg">{provName}</h3>
                                    <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">{provData.cities.length} Kota/Kabupaten</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-xs font-bold text-ink-400 uppercase">Presentase</span>
                                    <span className="text-sm font-black text-indigo-600">
                                        {currentData ? ((provData.total / Object.values(currentData).reduce((sum, province) => sum + province.total, 0)) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                </div>
                                {expandedProv === provName ? <ChevronUp className="w-5 h-5 text-ink-300" /> : <ChevronDown className="w-5 h-5 text-ink-300" />}
                            </div>
                        </div>

                        {expandedProv === provName && (
                            <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="h-px bg-ink-100 mb-6"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {provData.cities.sort((a: any, b: any) => b.count - a.count).map((city: any) => (
                                        <div key={city.name} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-white">
                                            <span className="text-sm font-bold text-ink-700 truncate mr-2">{city.name}</span>
                                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-black text-indigo-600 shadow-sm border border-indigo-100">{city.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {sortedProvinces.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-ink-100">
                        <BarChart className="w-16 h-16 text-ink-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-ink-900">Belum Ada Data</h3>
                        <p className="text-ink-500 font-medium">Data wilayah akan muncul setelah pendaftar melengkapi biodata.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
