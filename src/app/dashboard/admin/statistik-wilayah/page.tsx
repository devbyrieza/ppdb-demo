"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  MapPin,
  Users,
  Search,
  Loader2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Heart,
  User,
  UserCheck,
  Home,
} from "lucide-react";

// Type definitions for the statistics data
interface CityData {
  name: string;
  count: number;
}

interface ProvinceData {
  total: number;
  cities: CityData[];
}

interface StatisticsData {
  santri: Record<string, ProvinceData>;
  ayah: Record<string, ProvinceData>;
  ibu: Record<string, ProvinceData>;
  wali: Record<string, ProvinceData>;
}

type TabId = "santri" | "ayah" | "ibu" | "wali" | "keluarga";

// Merge multiple province maps (ayah + ibu + wali) into one combined record
function mergeProvinceData(
  sources: Record<string, ProvinceData>[],
): Record<string, ProvinceData> {
  const merged: Record<string, ProvinceData> = {};
  for (const source of sources) {
    for (const [provName, provData] of Object.entries(source)) {
      if (!merged[provName]) {
        merged[provName] = { total: 0, cities: [] };
      }
      merged[provName].total += provData.total;
      for (const city of provData.cities) {
        const existing = merged[provName].cities.find(
          (c) => c.name === city.name,
        );
        if (existing) {
          existing.count += city.count;
        } else {
          merged[provName].cities.push({ ...city });
        }
      }
    }
  }
  return merged;
}

export default function StatistikWilayahPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("santri");
  const [expandedProv, setExpandedProv] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] =
    useState<string>("");

  useEffect(() => {
    const fetchTA = async () => {
      try {
        const res = await fetch("/api/admin/tahun-ajaran");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setTahunAjaranList(list);
          const active = list.find((t: any) => t.is_active);
          if (active) {
            setSelectedTahunAjaranId(active.id);
          } else if (list.length > 0) {
            setSelectedTahunAjaranId(list[0].id);
          } else {
            fetchStats("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch TA list", err);
        fetchStats("");
      }
    };
    fetchTA();
  }, []);
  useEffect(() => {
    if (selectedTahunAjaranId) {
      fetchStats(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId]);

  const fetchStats = async (taId?: string) => {
    const targetId = taId !== undefined ? taId : selectedTahunAjaranId;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/statistik/wilayah?tahun_ajaran_id=${targetId}`,
      );
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

  // Compute merged "Keluarga" data (Ayah + Ibu + Wali)
  const keluargaData = useMemo(() => {
    if (!data) return {};
    return mergeProvinceData([data.ayah, data.ibu, data.wali]);
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#800000]" />
        <p className="font-bold text-stone-600">Menganalisis data wilayah...</p>
      </div>
    );
  }

  const currentData: Record<string, ProvinceData> =
    activeTab === "keluarga"
      ? keluargaData
      : data
        ? data[activeTab as Exclude<TabId, "keluarga">]
        : {};

  const filteredProvinces = currentData
    ? Object.entries(currentData)
        .filter(([name]) =>
          name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort(([, a], [, b]) => b.total - a.total)
    : [];

  const tabs = [
    { id: "santri", label: "Santri", icon: Users, color: "text-blue-600" },
    { id: "ayah", label: "Ayah", icon: User, color: "text-amber-600" },
    { id: "ibu", label: "Ibu", icon: Heart, color: "text-rose-500" },
    { id: "wali", label: "Wali", icon: UserCheck, color: "text-emerald-600" },
    { id: "keluarga", label: "Keluarga", icon: Home, color: "text-violet-600" },
  ];

  const totalInTab = Object.values(currentData || {}).reduce(
    (acc, prov) => acc + prov.total,
    0,
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="bg-[#0a2647] rounded-3xl shadow-xl p-6 md:p-10 border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-5 bg-[#ffcc00] rounded-2xl shadow-lg shadow-yellow-500/20 rotate-3">
            <MapPin className="w-8 h-8 text-[#0a2647]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Statistik <span className="text-[#ffcc00]">Wilayah</span>
              </h1>
              {tahunAjaranList.length > 0 && (
                <select
                  value={selectedTahunAjaranId}
                  onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
                  className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ffcc00] cursor-pointer hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  {tahunAjaranList.map((ta: any) => (
                    <option
                      key={ta.id}
                      value={ta.id}
                      className="bg-[#0a2647] text-white"
                    >
                      TA {ta.nama}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-white/70 font-medium italic opacity-80 text-sm mt-1">
              Analisis sebaran domisili pendaftar dan keluarga berdasar data
              wilayah.
            </p>
          </div>
        </div>

        {/* Info Legend */}
        <div className="mt-8 flex items-start gap-3 p-4 bg-gradient-to-r from-white/10 to-white/5 border border-white/15 border-l-4 border-l-[#ffcc00] rounded-2xl text-xs text-white font-semibold leading-relaxed backdrop-blur-sm">
          <div className="mt-0.5 bg-[#ffcc00] p-1.5 rounded-md shadow-sm shrink-0">
            <ArrowUpRight className="w-3 h-3 text-[#0a2647]" />
          </div>
          <p className="text-white/90">
            Data mencakup sebaran Provinsi di Indonesia. Tab{" "}
            <strong className="text-[#ffcc00]">Keluarga</strong> menggabungkan
            data Ayah + Ibu + Wali untuk gambaran domisili keluarga secara
            keseluruhan.
          </p>
        </div>
      </div>

      {/* Filter Group */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100 rounded-2xl w-full xl:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabId);
                setExpandedProv(null);
              }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all text-xs uppercase tracking-wider ${
                activeTab === tab.id
                  ? tab.id === "keluarga"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "bg-white text-[#0a2647] shadow-lg"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? (tab.id === "keluarga" ? "text-white" : tab.color) : ""}`}
              />
              {tab.label}
              {tab.id === "keluarga" && activeTab !== "keluarga" && (
                <span className="text-[8px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-black leading-none hidden md:inline">
                  A+I+W
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full xl:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari Provinsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0a2647] focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* "Keluarga" tab badge info */}
      {activeTab === "keluarga" && (
        <div className="flex items-center gap-3 px-5 py-3 bg-violet-50 border border-violet-200 rounded-2xl animate-in fade-in duration-300">
          <Home className="w-4 h-4 text-violet-600 shrink-0" />
          <p className="text-xs font-semibold text-violet-700">
            Menampilkan data gabungan <strong>Ayah + Ibu + Wali</strong>. Total
            unik ini mencerminkan sebaran domisili keluarga secara keseluruhan
            (bukan deduplikasi per individu).
          </p>
        </div>
      )}

      {/* Stats List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProvinces.map(([provName, provData]: [string, any]) => (
          <div
            key={provName}
            className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden group hover:border-[#0a2647]/30 transition-all"
          >
            <div
              onClick={() =>
                setExpandedProv(expandedProv === provName ? null : provName)
              }
              className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div
                  className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl border shadow-inner ${
                    activeTab === "keluarga"
                      ? "bg-violet-50 text-violet-700 border-violet-100"
                      : "bg-[#f0f4f8] text-[#0a2647] border-[#0a2647]/5"
                  }`}
                >
                  <span className="font-black text-xl md:text-2xl leading-none">
                    {provData.total}
                  </span>
                  <span className="text-[8px] md:text-[10px] font-black uppercase mt-1 md:mt-1.5 opacity-60 tracking-widest">
                    Total
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-stone-800 text-sm md:text-lg leading-tight uppercase group-hover:text-[#0a2647] transition-colors truncate">
                    {provName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 ">
                    <div
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === "keluarga" ? "bg-violet-400" : "bg-[#ffcc00]"}`}
                    ></div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">
                      {provData.cities.length} Sebaran Wilayah
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
                    Kontribusi
                  </span>
                  <span
                    className={`text-sm font-black ${activeTab === "keluarga" ? "text-violet-600" : "text-[#0a2647]"}`}
                  >
                    {totalInTab > 0
                      ? ((provData.total / totalInTab) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
                <div
                  className={`p-2 rounded-xl transition-all ${expandedProv === provName ? "bg-[#0a2647] text-white shadow-lg" : "text-stone-300 group-hover:bg-stone-100"}`}
                >
                  {expandedProv === provName ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {expandedProv === provName && (
              <div className="px-5 md:px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px bg-stone-100 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {provData.cities
                    .sort((a: any, b: any) => b.count - a.count)
                    .map((city: any) => (
                      <div
                        key={city.name}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-white hover:border-[#0a2647]/10 transition-all select-none group/city"
                      >
                        <span className="text-xs font-black text-stone-700 truncate mr-2 uppercase tracking-tight">
                          {city.name}
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-stone-100 group-hover/city:border-[#0a2647]/10 transition-all">
                          <span className="text-[14px] font-black text-[#0a2647]">
                            {city.count}
                          </span>
                          <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">
                            JIWA
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredProvinces.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-stone-100">
            <BarChart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">
              Data Tidak Ditemukan
            </h3>
            <p className="text-stone-500 font-medium text-sm mt-1">
              Belum ada pendaftar dari wilayah ini untuk kategori {activeTab}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
