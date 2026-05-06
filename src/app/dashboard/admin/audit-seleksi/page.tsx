"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Search,
  Filter,
  Download,
  RefreshCcw,
  Send,
  Loader2,
  ChevronRight,
  AlertCircle,
  FileCheck,
  MoreHorizontal,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { exportToExcelProfessional } from "@/lib/utils/export";

type Candidate = {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  status_pendaftaran: string;
  exam_status: string;
  exam_score_count: number;
  nilai_ujian?: {
    nilai_total: number;
    score_quran: number;
    score_akademik: number;
    score_kepribadian: number;
    score_kesiapan: number;
    nilai_wawancara_santri: number;
    nilai_wawancara_ortu: number;
    status_kelulusan: string;
  };
};

export default function AuditSeleksiPage() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("");
  const [filterStatus, setFilterStatus] = useState("tested"); // Default to those who completed exams

  useEffect(() => {
    fetchCandidates();
  }, [filterStatus, filterJenjang]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterJenjang) params.append("jenjang", filterJenjang);
      if (filterStatus) params.append("status", filterStatus);
      params.append("limit", "100");

      const res = await fetch(`/api/admin/pendaftar/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setCandidates(json.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data audit");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchPublish = async (decision: "accepted" | "rejected" | "cadangan") => {
    if (selectedIds.length === 0) return;

    const labels: Record<string, string> = {
      accepted: "LULUS",
      rejected: "TIDAK LULUS",
      cadangan: "CADANGAN",
    };

    const result = await Swal.fire({
      title: `Umumkan ${labels[decision]}?`,
      text: `Status ${selectedIds.length} pendaftar akan diperbarui dan notifikasi WhatsApp otomatis akan dikirim.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Terbitkan!",
      cancelButtonText: "Batal",
      confirmButtonColor: decision === "accepted" ? "#4d7c0f" : decision === "rejected" ? "#dc2626" : "#d97706",
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: selectedIds,
          new_status: decision,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish");
      const data = await res.json();

      Swal.fire("Sukses", `${data.updated} data berhasil diterbitkan.`, "success");
      setSelectedIds([]);
      fetchCandidates();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menerbitkan pengumuman", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const getGrade = (score: number | undefined | null, type: string) => {
    if (score == null) return { label: "-", color: "text-ink-300" };
    let grade = "C";
    let color = "bg-amber-400";

    if (type === "quran") {
      grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
    } else if (type === "akademik") {
      grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
    } else if (type === "kepribadian") {
      grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
    } else {
      grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
    }

    if (grade === "A") color = "bg-emerald-500";
    else if (grade === "B") color = "bg-sky-500";

    return { label: grade, color };
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!c) return false; const query = (searchQuery || "").toLowerCase();
    return (
      (c.nama_lengkap || "").toLowerCase().includes(query) ||
      (c.nomor_pendaftaran || "").toLowerCase().includes(query)
    );
  });

  const handleExport = async () => {
    if (!candidates.length) return;

    const header = [
      "No. Daftar",
      "Nama Lengkap",
      "Jenjang",
      "Quran",
      "Akademik",
      "Kepribadian",
      "Wawancara",
      "Kesiapan",
      "Total",
      "Status",
    ];

    const data = candidates.map((c) => {
      const nu = c.nilai_ujian;
      const ws = nu?.nilai_wawancara_santri || 0;
      const wo = nu?.nilai_wawancara_ortu || 0;
      const avgW = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

      return [
        c.nomor_pendaftaran,
        c.nama_lengkap.toUpperCase(),
        c.jenjang,
        getGrade(nu?.score_quran, "quran").label,
        getGrade(nu?.score_akademik, "akademik").label,
        getGrade(nu?.score_kepribadian, "kepribadian").label,
        getGrade(avgW, "wawancara").label,
        getGrade(nu?.score_kesiapan, "kesiapan").label,
        (nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : undefined) || "-",
        c.status_pendaftaran.toUpperCase(),
      ];
    });

    await exportToExcelProfessional({
      fileName: `Audit_Hasil_Seleksi_${new Date().toISOString().split("T")[0]}`,
      sheets: [
        {
          name: "AUDIT REKAP",
          title: "AUDIT REKAPITULASI HASIL SELEKSI",
          subTitle: `Tanggal: ${new Date().toLocaleDateString("id-ID")}`,
          header,
          data,
        },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-army-600 rounded-2xl shadow-lg shadow-army-600/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            Audit <span className="text-army-700">Hasil Seleksi</span>
          </h1>
          <p className="text-ink-500 font-medium mt-1">
            Review mendalam seluruh komponen nilai sebelum publikasi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="rounded-2xl border-ink-200 font-bold bg-white"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            onClick={fetchCandidates}
            variant="outline"
            className="rounded-2xl border-ink-200 font-bold bg-white"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-clay-md border border-white/40 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Cari nama/NP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-50 border border-ink-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-army-500/5 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-ink-50 rounded-xl border border-ink-100">
            <Filter className="w-3.5 h-3.5 text-ink-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-ink-700 outline-none"
            >
              <option value="tested">Siap Audit (Sudah Ujian)</option>
              <option value="announced">Sudah Dipublish</option>
              <option value="accepted">Sudah Lulus</option>
              <option value="all">Semua Data</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-ink-50 rounded-xl border border-ink-100">
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="bg-transparent text-xs font-bold text-ink-700 outline-none"
            >
              <option value="">Semua Jenjang</option>
              <option value="MTs">MTs</option>
              <option value="SMA">SMA</option>
              <option value="IL">I&apos;dad Lughowi</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
          <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mr-2 hidden xl:block">
            Terbitkan Sebagai:
          </p>
          <Button
            onClick={() => handleBatchPublish("accepted")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] px-6 py-2.5 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            LULUS ({selectedIds.length})
          </Button>
          <Button
            onClick={() => handleBatchPublish("cadangan")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex-1 lg:flex-none bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[11px] px-6 py-2.5 shadow-lg shadow-amber-200 transition-all active:scale-95"
          >
            CADANGAN
          </Button>
          <Button
            onClick={() => handleBatchPublish("rejected")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex-1 lg:flex-none bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[11px] px-6 py-2.5 shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            TOLAK
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-clay-lg border border-white/40 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ink-50/50 border-b border-ink-100">
                <th className="px-6 py-5 text-center w-12">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-ink-200 text-army-600 focus:ring-army-500"
                    onChange={handleSelectAll}
                    checked={candidates.length > 0 && selectedIds.length === candidates.length}
                  />
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Nama & No. Daftar
                </th>
                <th className="px-4 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Jenjang
                </th>
                <th className="px-3 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Quran
                </th>
                <th className="px-3 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Akademi
                </th>
                <th className="px-3 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Keprib.
                </th>
                <th className="px-3 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Wawancara
                </th>
                <th className="px-3 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Kesiapan
                </th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-army-700 uppercase tracking-widest bg-army-50/30">
                  Total Skor
                </th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-ink-400 uppercase tracking-widest">
                  Status Saat Ini
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-army-600 mb-4" />
                    <p className="text-ink-400 font-bold">Mempersiapkan data audit...</p>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-ink-200 mb-4" />
                    <p className="text-ink-400 font-bold uppercase tracking-widest">
                      Tidak ada data yang perlu diaudit
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const nu = c.nilai_ujian;
                  const ws = nu?.nilai_wawancara_santri || 0;
                  const wo = nu?.nilai_wawancara_ortu || 0;
                  const avgW = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-army-50/20 transition-colors group ${selectedIds.includes(c.id) ? "bg-army-50/40" : ""}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-ink-200 text-army-600 focus:ring-army-500"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => handleSelectOne(c.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-ink-900 uppercase leading-none mb-1 group-hover:text-army-700 transition-colors">
                            {c.nama_lengkap}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-ink-400 tracking-tight">
                            {c.nomor_pendaftaran}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 bg-ink-100 text-ink-600 rounded-lg text-[10px] font-black uppercase">
                          {c.jenjang}
                        </span>
                      </td>
                      
                      {/* Nilai-nilai */}
                      {[
                        { val: nu?.score_quran, type: "quran" },
                        { val: nu?.score_akademik, type: "akademik" },
                        { val: nu?.score_kepribadian, type: "kepribadian" },
                        { val: avgW, type: "wawancara" },
                        { val: nu?.score_kesiapan, type: "kesiapan" },
                      ].map((n, i) => {
                        const g = getGrade(n.val, n.type);
                        return (
                          <td key={i} className="px-3 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`${g.color} text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg shadow-sm`}>
                                {g.label}
                              </span>
                              <span className="text-[9px] font-bold text-ink-300">
                                {n.val != null ? Math.round(n.val) : "-"}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className="px-6 py-4 text-center bg-army-50/20">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-army-700 leading-none">
                            {(nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : undefined) || "-"}
                          </span>
                          <span className="text-[8px] font-black text-army-400 uppercase tracking-widest mt-1">
                            Final Score
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const s = c.status_pendaftaran || "";
                          const labels: any = {
                            accepted: { l: "LULUS", c: "text-emerald-700 bg-emerald-100 border-emerald-200" },
                            announced: { l: "PUBLISHED", c: "text-sky-700 bg-sky-100 border-sky-200" },
                            rejected: { l: "DITOLAK", c: "text-rose-700 bg-rose-100 border-rose-200" },
                            cadangan: { l: "CADANGAN", c: "text-amber-700 bg-amber-100 border-amber-200" },
                            tested: { l: "SIAP AUDIT", c: "text-ink-600 bg-ink-100 border-ink-200" },
                          };
                          const meta = labels[s] || { l: s.toUpperCase() || "UNKNOWN", c: "text-ink-400 bg-ink-50 border-ink-100" };
                          return (
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase shadow-sm ${meta.c}`}>
                              {meta.l}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legend & Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-ink-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Activity className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-4 flex items-center gap-3">
              <AlertCircle className="text-amber-400" /> Matriks Keputusan Otomatis
            </h3>
            <div className="space-y-3 text-sm font-medium opacity-80 leading-relaxed">
              <p className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span><b className="text-white">LULUS:</b> Quran Grade A, maksimal satu Grade C di komponen pendukung.</span>
              </p>
              <p className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span><b className="text-white">CADANGAN:</b> Quran Grade B, atau Wawancara Santri Grade B.</span>
              </p>
              <p className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span><b className="text-white">DITOLAK:</b> Terdapat Grade D/E, atau Quran/Wawancara Santri Grade C.</span>
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-ink-300">
              <span className="px-3 py-1 border border-ink-700 rounded-lg">A: ≥ 80+</span>
              <span className="px-3 py-1 border border-ink-700 rounded-lg">B: ≥ 65+</span>
              <span className="px-3 py-1 border border-ink-700 rounded-lg">C: ≥ 50+</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-ink-100 shadow-premium-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-ink-900 mb-2">Panduan Penerbitan</h3>
            <p className="text-ink-500 text-sm font-medium leading-relaxed">
              Pilih pendaftar dari tabel di atas, kemudian tekan salah satu tombol status di panel kontrol. 
              Sistem akan secara otomatis memperbarui dashboard santri dan mengirimkan notifikasi resmi via WhatsApp.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-4 p-4 bg-army-50 rounded-2xl border border-army-100">
             <div className="p-3 bg-white rounded-xl shadow-sm">
                <RefreshCcw className="w-5 h-5 text-army-600" />
             </div>
             <p className="text-[11px] font-bold text-army-800 leading-snug">
               Gunakan fitur <b>Hitung Ulang</b> di menu Penilaian jika skor total belum muncul atau tidak sinkron.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
