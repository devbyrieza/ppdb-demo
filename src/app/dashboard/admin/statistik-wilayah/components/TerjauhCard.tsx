"use client";

import { useState } from "react";
import { Loader2, MapPin, Search, Navigation } from "lucide-react";

export default function TerjauhCard({
  tahunAjaranList,
  jenjangList,
}: {
  tahunAjaranList: string[];
  jenjangList: string[];
}) {
  const [tahunAjaran, setTahunAjaran] = useState(tahunAjaranList[0] || "");
  const [jenjang, setJenjang] = useState(jenjangList[0] || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!tahunAjaran || !jenjang) {
      setError("Pilih Tahun Ajaran dan Jenjang terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/statistik-wilayah/terjauh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahun_ajaran: tahunAjaran, jenjang }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal mengambil data pendaftar terjauh");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-primary-950">Pendaftar Terjauh</h2>
          <p className="text-xs text-ink-500 font-medium">
            Temukan santri dengan jarak terjauh dari lokasi pesantren
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-ink-500 mb-2 uppercase">Tahun Ajaran</label>
          <select
            value={tahunAjaran}
            onChange={(e) => setTahunAjaran(e.target.value)}
            className="w-full p-3 bg-surface-50 border border-ink-200 rounded-xl focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            {tahunAjaranList.map((ta) => (
              <option key={ta} value={ta}>
                {ta}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-ink-500 mb-2 uppercase">Jenjang</label>
          <select
            value={jenjang}
            onChange={(e) => setJenjang(e.target.value)}
            className="w-full p-3 bg-surface-50 border border-ink-200 rounded-xl focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            {jenjangList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto p-3 px-6 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? "Mencari..." : "Cari"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {result && Array.isArray(result) && result.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-bold text-ink-500 mb-2 uppercase tracking-widest px-2 border-b border-ink-100 pb-2">
            Top 5 Pendaftar Terjauh
          </div>
          {result.map((item: any, index: number) => (
            <div key={index} className={`p-5 md:p-6 bg-linear-to-br ${index === 0 ? 'from-orange-50 to-white border-orange-200 shadow-md' : 'from-surface-50 to-white border-ink-100 shadow-sm'} border rounded-2xl transition-all hover:shadow-md`}>
              <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6 text-center md:text-left">
                <div className={`rounded-full flex items-center justify-center shrink-0 shadow-sm border ${index === 0 ? 'bg-orange-100 text-orange-600 border-orange-200 w-16 h-16 md:w-20 md:h-20' : 'bg-surface-100 text-ink-500 border-ink-200 w-12 h-12 md:w-14 md:h-14'}`}>
                  {index === 0 ? <MapPin className="w-8 h-8 md:w-10 md:h-10" /> : <span className="text-lg md:text-xl font-black">#{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap justify-center md:justify-start">
                    {index === 0 && (
                      <span className="px-2 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                        Terjauh Utama
                      </span>
                    )}
                    <span className="text-[10px] md:text-xs font-bold text-ink-400 capitalize px-2 py-1 bg-surface-100 rounded-lg">
                      Status: {item.status}
                    </span>
                  </div>
                  <h3 className={`${index === 0 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'} font-black text-ink-900 mb-1 truncate`}>{item.nama}</h3>
                  <p className="text-ink-500 font-medium text-xs md:text-sm leading-relaxed mb-3 line-clamp-2 md:line-clamp-none">
                    {item.alamat_lengkap}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 ${index === 0 ? 'bg-orange-100 border border-orange-200 text-orange-800' : 'bg-surface-100 border border-ink-200 text-ink-700'} font-black rounded-xl text-xs md:text-sm shadow-sm`}>
                    Jarak: {item.jarak_km.toLocaleString("id-ID")} KM
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
