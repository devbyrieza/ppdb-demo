"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Send,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function PengumumanPage() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, ready: 0, accepted: 0 });
  const [filter, setFilter] = useState({
    jenjang: "",
    status: "tested", // Default to those who have completed ALL 6 exams
  });

  const [isPublishing, setIsPublishing] = useState(false);

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Construct query
      const params = new URLSearchParams();
      if (filter.jenjang) params.append("jenjang", filter.jenjang);
      if (filter.status) params.append("status", filter.status);
      params.append("limit", "100"); // Fetch ample amount

      const res = await fetch(`/api/admin/pendaftar/list?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCandidates(data.data || []);
        // Calculate basic stats from this batch
        const ready = data.data.filter(
          (c: any) =>
            c.exam_status === "tested" || c.status_pendaftaran === "tested",
        ).length;
        const accepted = data.data.filter(
          (c: any) => c.status_pendaftaran === "accepted",
        ).length;
        setStats({ total: data.data.length, ready, accepted });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePublish = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Umumkan Kelulusan?",
      text: `Apakah Anda yakin ingin meluluskan ${selectedIds.length} santri ini? Status akan diperbarui dan pengumuman akan masuk antrean WhatsApp otomatis.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669", // Emerald 600
      cancelButtonColor: "#57534e", // Stone 600
      confirmButtonText: "Ya, Umumkan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: selectedIds,
          new_status: "accepted",
          // Removed hardcoded announcement_message to use buildMessageHasilTes on backend
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(
          result.message ||
            `Berhasil! ${result.queued} pengumuman sedang mengantri untuk dikirim.`,
        );
        fetchCandidates();
        setSelectedIds([]);
      } else {
        toast.error(result.error || "Gagal mempublish pengumuman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm font-medium">Kandidat Tampil</p>
          <h3 className="text-2xl font-bold text-stone-800">{stats.total}</h3>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
          <p className="text-blue-600 text-sm font-medium">
            Siap Diumumkan (Sudah Ujian)
          </p>
          <h3 className="text-2xl font-bold text-blue-700">{stats.ready}</h3>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100">
          <p className="text-green-600 text-sm font-medium">Sudah Lulus</p>
          <h3 className="text-2xl font-bold text-green-700">
            {stats.accepted}
          </h3>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filter.jenjang}
              onChange={(e) =>
                setFilter({ ...filter, jenjang: e.target.value })
              }
            >
              <option value="">Semua Jenjang</option>
              <option value="MTs">MTs</option>
              <option value="SMA">SMA</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200">
            <Search className="w-4 h-4 text-stone-500" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="tested">Sudah Ujian (Siap Diumumkan)</option>
              <option value="accepted">Sudah Lulus/Diumumkan</option>
              <option value="scheduled">Terjadwal Ujian</option>
            </select>
          </div>
        </div>

        <button
          onClick={handlePublish}
          disabled={selectedIds.length === 0 || isPublishing}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 disabled:shadow-none"
        >
          {isPublishing ? (
            "Memproses..."
          ) : (
            <>
              <Send className="w-4 h-4" />
              Umumkan Kelulusan ({selectedIds.length})
            </>
          )}
        </button>
      </div>

      {/* Table & Mobile View */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-stone-100 select-none">
          {candidates.length === 0 ? (
            <div className="px-6 py-12 text-center text-stone-500 italic">
              Tidak ada data kandidat sesuai filter
            </div>
          ) : (
            candidates.map((c) => {
              const nu = c.nilai_ujian;
              const getGradeBadge = (
                score: number | null | undefined,
                type: string,
              ) => {
                if (score == null) return null;
                let grade = "C";
                if (type === "quran")
                  grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
                else if (type === "akademik")
                  grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
                else if (type === "kepribadian")
                  grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
                else grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

                const color =
                  grade === "A"
                    ? "bg-green-500"
                    : grade === "B"
                      ? "bg-sky-400"
                      : "bg-amber-400";
                return (
                  <span
                    key={type}
                    className={`${color} text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase shrink-0`}
                  >
                    {grade}
                  </span>
                );
              };

              const ws = nu?.nilai_wawancara_santri || 0;
              const wo = nu?.nilai_wawancara_ortu || 0;
              const avgWawancara = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectOne(c.id)}
                  className={`p-4 flex items-start gap-4 active:bg-stone-50 transition-colors ${selectedIds.includes(c.id) ? "bg-green-50/50" : ""}`}
                >
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleSelectOne(c.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="font-black text-stone-900 leading-tight uppercase text-sm truncate">
                        {toTitleCase(c.nama_lengkap)}
                      </h4>
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] font-black uppercase shrink-0">
                        {c.jenjang}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-stone-400 tracking-tighter mb-2">
                      {c.nomor_pendaftaran}
                    </p>

                    <div className="flex gap-1 mb-3 overflow-x-auto pb-1 no-scrollbar">
                      {getGradeBadge(nu?.score_quran, "quran")}
                      {getGradeBadge(nu?.score_akademik, "akademik")}
                      {getGradeBadge(nu?.score_kepribadian, "kepribadian")}
                      {getGradeBadge(avgWawancara, "wawancara")}
                      {getGradeBadge(nu?.score_kesiapan, "kesiapan")}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">
                          Total Nilai
                        </span>
                        <span className="text-sm font-black text-stone-700">
                          {nu?.nilai_total != null
                            ? Number(nu.nilai_total).toFixed(2)
                            : "-"}
                          <span className="ml-1 text-stone-400 font-bold">
                            (
                            {nu?.nilai_total >= 80
                              ? "A"
                              : nu?.nilai_total >= 65
                                ? "B"
                                : "C"}
                            )
                          </span>
                        </span>
                      </div>
                      <div>
                        {c.status_pendaftaran === "accepted" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Lulus
                          </span>
                        ) : c.status_pendaftaran === "scheduled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                            Siap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-black uppercase">
                            {c.status_pendaftaran}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                    onChange={handleSelectAll}
                    checked={
                      candidates.length > 0 &&
                      selectedIds.length === candidates.length
                    }
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Nama & Komponen
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Jenjang
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Total / Grade
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-stone-500"
                  >
                    Tidak ada data kandidat sesuai filter
                  </td>
                </tr>
              ) : (
                candidates.map((c) => {
                  const nu = c.nilai_ujian;
                  const getGradeBadge = (
                    score: number | null | undefined,
                    type: string,
                  ) => {
                    if (score == null) return null;
                    let grade = "C";
                    if (type === "quran")
                      grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
                    else if (type === "akademik")
                      grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
                    else if (type === "kepribadian")
                      grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
                    else grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

                    const color =
                      grade === "A"
                        ? "bg-green-500"
                        : grade === "B"
                          ? "bg-sky-400"
                          : "bg-amber-400";
                    return (
                      <span
                        key={type}
                        className={`${color} text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase`}
                      >
                        {grade}
                      </span>
                    );
                  };

                  const ws = nu?.nilai_wawancara_santri || 0;
                  const wo = nu?.nilai_wawancara_ortu || 0;
                  const avgWawancara =
                    ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => handleSelectOne(c.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-800">
                          {toTitleCase(c.nama_lengkap)}
                        </div>
                        <div className="text-xs text-stone-500 mb-2">
                          {c.nomor_pendaftaran}
                        </div>
                        <div className="flex gap-1">
                          {getGradeBadge(nu?.score_quran, "quran")}
                          {getGradeBadge(nu?.score_akademik, "akademik")}
                          {getGradeBadge(nu?.score_kepribadian, "kepribadian")}
                          {getGradeBadge(avgWawancara, "wawancara")}
                          {getGradeBadge(nu?.score_kesiapan, "kesiapan")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold">
                          {c.jenjang}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-black text-stone-800 text-lg leading-none">
                            {nu?.nilai_total != null
                              ? Number(nu.nilai_total).toFixed(2)
                              : "-"}
                          </div>
                          {nu?.nilai_total != null && (
                            <span className="text-[10px] font-bold text-stone-400 mt-1 italic">
                              Grade:{" "}
                              {nu.nilai_total >= 80
                                ? "A"
                                : nu.nilai_total >= 65
                                  ? "B"
                                  : "C"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c.status_pendaftaran === "accepted" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Lulus
                          </span>
                        ) : c.status_pendaftaran === "scheduled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            Siap Diumumkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">
                            {c.status_pendaftaran}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
