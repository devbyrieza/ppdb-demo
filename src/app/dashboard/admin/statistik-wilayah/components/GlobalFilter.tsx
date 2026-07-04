"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export default function GlobalFilter({
  tahunAjaranList,
  jenjangList,
}: {
  tahunAjaranList: string[];
  jenjangList: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTahun = searchParams.get("tahun_ajaran") || "";
  const currentJenjang = searchParams.get("jenjang") || "";

  const [tahunAjaran, setTahunAjaran] = useState(currentTahun || "");
  const [jenjang, setJenjang] = useState(currentJenjang || "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tahunAjaran) {
      params.set("tahun_ajaran", tahunAjaran);
    } else {
      params.delete("tahun_ajaran");
    }

    if (jenjang) {
      params.set("jenjang", jenjang);
    } else {
      params.delete("jenjang");
    }

    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setTahunAjaran("");
    setJenjang("");
    router.push("?");
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-ink-500 mb-2 uppercase">Tahun Ajaran</label>
          <select
            value={tahunAjaran}
            onChange={(e) => setTahunAjaran(e.target.value)}
            className="w-full p-3 bg-surface-50 border border-ink-200 rounded-xl focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Semua Tahun Ajaran</option>
            {tahunAjaranList.map((ta) => (
              <option key={ta} value={ta}>
                {ta}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-ink-500 mb-2 uppercase">Jenjang</label>
          <select
            value={jenjang}
            onChange={(e) => setJenjang(e.target.value)}
            className="w-full p-3 bg-surface-50 border border-ink-200 rounded-xl focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Semua Jenjang</option>
            {jenjangList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleApply}
            className="flex-1 md:flex-none p-3 px-6 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Terapkan Filter
          </button>
          {(currentTahun || currentJenjang) && (
            <button
              onClick={handleReset}
              className="p-3 px-4 bg-ink-100 text-ink-600 rounded-xl font-bold hover:bg-ink-200 transition-colors flex items-center justify-center"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
