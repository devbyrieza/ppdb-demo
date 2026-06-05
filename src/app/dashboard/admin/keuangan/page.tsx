"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Search,
  Loader2,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Alert from "@/components/ui/Alert";
import { exportToExcelProfessional, exportToPDF } from "@/lib/utils/export";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RekapDaftarUlang {
  no: number;
  id: string;
  nama: string;
  nomor_pendaftaran: string;
  status_kelulusan: string;
  total_bayar: number;
  tipe_cicilan: string;
  keringanan_reason: string | null;
  sisa_tagihan: number;
  last_updated: string;
  pembayaran_list?: any[];
  no_hp?: string;
  email?: string;
  ortu?: {
    nama_ayah: string;
    pekerjaan_ayah: string;
    penghasilan_ayah: string;
    no_hp_ayah: string;
    nama_ibu: string;
    pekerjaan_ibu: string;
    penghasilan_ibu: string;
    no_hp_ibu: string;
  } | null;
}

interface RekapPendaftaran {
  no: number;
  id: string;
  nama: string;
  nomor_pendaftaran: string;
  status_pendaftaran: string;
  total_bayar: number;
  jumlah_pembayaran: number;
  status_pembayaran: string;
  status_color: string;
  metode: string;
  tanggal_daftar: string;
  last_updated: string;
}

interface PendaftaranSummary {
  total: number;
  terverifikasi: number;
  menunggu: number;
  belum_upload: number;
  ditolak: number;
  total_terkumpul: number;
}

type ActiveTab = "pendaftaran" | "daftar-ulang";

// ─── Status Badge Color ───────────────────────────────────────────────────────

function StatusBadge({ status, color }: { status: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    orange: "bg-secondary-100 text-secondary-700 border-secondary-200",
    red: "bg-red-100 text-red-600 border-red-200",
    gray: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-bold border ${colorMap[color] || colorMap.gray}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KeuanganPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pendaftaran");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Pendaftaran tab state
  const [pendaftaranData, setPendaftaranData] = useState<RekapPendaftaran[]>(
    [],
  );
  const [pendaftaranSummary, setPendaftaranSummary] =
    useState<PendaftaranSummary | null>(null);
  const [loadingPendaftaran, setLoadingPendaftaran] = useState(true);

  // Daftar ulang tab state
  const [daftarUlangData, setDaftarUlangData] = useState<RekapDaftarUlang[]>(
    [],
  );
  const [loadingDaftarUlang, setLoadingDaftarUlang] = useState(true);

  // TA state
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
            fetchPendaftaran("");
            fetchDaftarUlang("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch TA list", err);
        fetchPendaftaran("");
        fetchDaftarUlang("");
      }
    };
    fetchTA();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaranId) {
      fetchPendaftaran(selectedTahunAjaranId);
      fetchDaftarUlang(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId]);

  const fetchPendaftaran = async (taId?: string) => {
    const targetId = taId !== undefined ? taId : selectedTahunAjaranId;
    try {
      setLoadingPendaftaran(true);
      const res = await fetch(
        `/api/admin/rekap-pembayaran?tahun_ajaran_id=${targetId}`,
      );
      if (!res.ok)
        throw new Error("Gagal mengambil data pembayaran pendaftaran");
      const json = await res.json();
      setPendaftaranData(json.data);
      setPendaftaranSummary(json.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPendaftaran(false);
    }
  };

  const fetchDaftarUlang = async (taId?: string) => {
    const targetId = taId !== undefined ? taId : selectedTahunAjaranId;
    try {
      setLoadingDaftarUlang(true);
      const res = await fetch(
        `/api/admin/rekap-keuangan?tahun_ajaran_id=${targetId}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil data daftar ulang");
      const json = await res.json();
      setDaftarUlangData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDaftarUlang(false);
    }
  };

  // Filter
  const filteredPendaftaran = pendaftaranData.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nomor_pendaftaran.includes(search),
  );

  const filteredDaftarUlang = daftarUlangData.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nomor_pendaftaran.includes(search),
  );

  // Export handlers
  const handleExport = async (type: "excel" | "pdf") => {
    if (activeTab === "pendaftaran") {
      if (filteredPendaftaran.length === 0) return;

      if (type === "excel") {
        const header = [
          "No",
          "Nama Santri",
          "Nomor Pendaftaran",
          "Jenjang",
          "Status Bayar",
          "Jumlah Bayar",
          "Metode",
          "Update",
        ];

        const jenjangGroups: Record<string, RekapPendaftaran[]> = {};
        filteredPendaftaran.forEach((i) => {
          const j = (i as any).jenjang || "LAINNYA";
          if (!jenjangGroups[j]) jenjangGroups[j] = [];
          jenjangGroups[j].push(i);
        });

        const formatRow = (i: RekapPendaftaran) => [
          i.no,
          i.nama.toUpperCase(),
          i.nomor_pendaftaran,
          (i as any).jenjang || "-",
          i.status_pembayaran.replace(/_/g, " "),
          i.jumlah_pembayaran,
          i.metode,
          new Date(i.last_updated).toLocaleDateString("id-ID"),
        ];

        const sheets: any[] = [
          {
            name: "TOTAL PENDAFTARAN",
            title: "REKAPITULASI PEMBAYARAN PENDAFTARAN (TOTAL)",
            subTitle: `Tanggal: ${new Date().toLocaleDateString("id-ID")}`,
            header,
            data: filteredPendaftaran.map(formatRow),
          },
        ];

        Object.keys(jenjangGroups)
          .sort()
          .forEach((j) => {
            sheets.push({
              name: j.substring(0, 31),
              title: `PEMBAYARAN PENDAFTARAN - ${j}`,
              subTitle: "",
              header,
              data: jenjangGroups[j].map(formatRow),
            });
          });

        await exportToExcelProfessional({
          fileName: `Rekap_Pendaftaran_${new Date().toISOString().slice(0, 10)}`,
          sheets,
        });
      } else {
        const data = filteredPendaftaran.map((i) => ({
          No: i.no,
          "Nama Santri": i.nama,
          "Nomor Pendaftaran": i.nomor_pendaftaran,
          "Status Bayar": i.status_pembayaran === "verified" ? "Terverifikasi" : (i.status_pembayaran === "rejected" ? "Ditolak" : "Pending"),
          "Jumlah Bayar (Rp)": i.jumlah_pembayaran,
          Metode: i.metode,
          "Terakhir Update": new Date(i.last_updated).toLocaleDateString(
            "id-ID",
          ),
        }));
        const headers = Object.keys(data[0]);
        const rows = data.map((item) => Object.values(item));
        exportToPDF(
          "Rekap Pembayaran Pendaftaran",
          headers,
          rows,
          `Rekap_Pendaftaran_${new Date().toISOString().slice(0, 10)}`,
          "landscape",
        );
      }
    } else {
      // DAFTAR ULANG
      if (filteredDaftarUlang.length === 0) return;

      if (type === "excel") {
        const header = [
          "No",
          "Nama Santri",
          "Nomor Pendaftaran",
          "Jenjang",
          "No. HP Santri",
          "Email Santri",
          "Nama Ayah",
          "Pekerjaan Ayah",
          "Penghasilan Ayah",
          "No. HP Ayah",
          "Nama Ibu",
          "Pekerjaan Ibu",
          "Penghasilan Ibu",
          "No. HP Ibu",
          "Status Lulus",
          "Total Bayar",
          "Status Bayar",
          "Alasan Keringanan",
          "Sisa Tagihan",
          "Update",
        ];

        const lunas = filteredDaftarUlang.filter(
          (i) => i.tipe_cicilan === "LUNAS",
        );
        const cicil = filteredDaftarUlang.filter(
          (i) => i.tipe_cicilan === "CICILAN",
        );

        const formatRow = (i: RekapDaftarUlang) => [
          i.no,
          i.nama.toUpperCase(),
          i.nomor_pendaftaran,
          (i as any).jenjang || "-",
          i.no_hp || "-",
          i.email || "-",
          i.ortu?.nama_ayah || "-",
          i.ortu?.pekerjaan_ayah || "-",
          i.ortu?.penghasilan_ayah || "-",
          i.ortu?.no_hp_ayah || "-",
          i.ortu?.nama_ibu || "-",
          i.ortu?.pekerjaan_ibu || "-",
          i.ortu?.penghasilan_ibu || "-",
          i.ortu?.no_hp_ibu || "-",
          i.status_kelulusan,
          i.total_bayar,
          i.tipe_cicilan.replace(/_/g, " "),
          i.keringanan_reason || "-",
          i.sisa_tagihan,
          new Date(i.last_updated).toLocaleDateString("id-ID"),
        ];

        const sheets: any[] = [
          {
            name: "REKAP TOTAL",
            title: "REKAPITULASI PEMBAYARAN DAFTAR ULANG (SEMUA)",
            header,
            data: filteredDaftarUlang.map(formatRow),
          },
          {
            name: "LUNAS",
            title: "DAFTAR ULANG - LUNAS",
            header,
            data: lunas.map(formatRow),
          },
          {
            name: "CICILAN",
            title: "DAFTAR ULANG - CICILAN",
            header,
            data: cicil.map(formatRow),
          },
        ];

        await exportToExcelProfessional({
          fileName: `Rekap_Daftar_Ulang_${new Date().toISOString().slice(0, 10)}`,
          sheets,
        });
      } else {
        const data = filteredDaftarUlang.map((i) => ({
          No: i.no,
          "Nama Santri": i.nama.toUpperCase(),
          "No. Pendaftaran": i.nomor_pendaftaran,
          "Jenjang": (i as any).jenjang || "-",
          "No. HP Santri": i.no_hp || "-",
          "Email Santri": i.email || "-",
          "Nama Ayah": i.ortu?.nama_ayah || "-",
          "Pekerjaan Ayah": i.ortu?.pekerjaan_ayah || "-",
          "Penghasilan Ayah": i.ortu?.penghasilan_ayah || "-",
          "No. HP Ayah": i.ortu?.no_hp_ayah || "-",
          "Nama Ibu": i.ortu?.nama_ibu || "-",
          "Pekerjaan Ibu": i.ortu?.pekerjaan_ibu || "-",
          "Penghasilan Ibu": i.ortu?.penghasilan_ibu || "-",
          "No. HP Ibu": i.ortu?.no_hp_ibu || "-",
          "Status Seleksi": i.status_kelulusan,
          "Total Bayar (Rp)": i.total_bayar,
          "Status Bayar": i.tipe_cicilan === "LUNAS" ? "Lunas" : (i.tipe_cicilan === "BELUM_BAYAR" ? "Belum Bayar" : "Cicilan"),
          "Alasan Keringanan": i.keringanan_reason || "-",
          "Sisa Tagihan (Rp)": i.sisa_tagihan,
          "Tgl Update": new Date(i.last_updated).toLocaleDateString("id-ID"),
        }));
        const headers = Object.keys(data[0]);
        const rows = data.map((item) => Object.values(item));
        exportToPDF(
          "Rekap Keuangan Daftar Ulang",
          headers,
          rows,
          `Rekap_Daftar_Ulang_${new Date().toISOString().slice(0, 10)}`,
          "landscape",
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Rekap Keuangan
            </h1>
            {tahunAjaranList.length > 0 && (
              <select
                value={selectedTahunAjaranId}
                onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
                className="bg-slate-100 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-200 transition-all border-none"
              >
                {tahunAjaranList.map((ta: any) => (
                  <option key={ta.id} value={ta.id}>
                    TA {ta.nama}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            Monitoring status pembayaran seluruh pendaftar
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setActiveTab("pendaftaran");
            setSearch("");
          }}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "pendaftaran"
              ? "bg-white text-primary-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          💳 Pembayaran Pendaftaran
        </button>
        <button
          onClick={() => {
            setActiveTab("daftar-ulang");
            setSearch("");
          }}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "daftar-ulang"
              ? "bg-white text-primary-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🎓 Daftar Ulang
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* ── Pembayaran Pendaftaran Tab ── */}
      {activeTab === "pendaftaran" && (
        <div className="space-y-5">
          {/* Summary Cards */}
          {pendaftaranSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 font-medium mb-1">
                  Total Pendaftar
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {pendaftaranSummary.total}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs text-emerald-700 font-medium">
                    Terverifikasi
                  </p>
                </div>
                <p className="text-2xl font-black text-emerald-700">
                  {pendaftaranSummary.terverifikasi}
                </p>
              </div>
              <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-secondary-600" />
                  <p className="text-xs text-secondary-700 font-medium">Menunggu</p>
                </div>
                <p className="text-2xl font-black text-secondary-700">
                  {pendaftaranSummary.menunggu}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-xs text-slate-500 font-medium">
                    Belum Upload
                  </p>
                </div>
                <p className="text-2xl font-black text-slate-600">
                  {pendaftaranSummary.belum_upload}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-primary-100 shadow-sm col-span-2 md:col-span-1 lg:col-span-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-700" />
                  <p className="text-xs text-primary-800 font-medium">
                    Total Terkumpul
                  </p>
                </div>
                <p className="text-lg font-black text-primary-800">
                  {formatCurrency(pendaftaranSummary.total_terkumpul)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pembayaran terverifikasi
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama santri atau nomor pendaftaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingPendaftaran ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-6 h-6 text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 w-12">No</th>
                      <th className="px-6 py-3">Nama Santri</th>
                      <th className="px-6 py-3">Status Bayar</th>
                      <th className="px-6 py-3">Jumlah</th>
                      <th className="px-6 py-3">Metode</th>
                      <th className="px-6 py-3">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPendaftaran.length > 0 ? (
                      filteredPendaftaran.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-3 text-center text-slate-400">
                            {row.no}
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-900">
                            {row.nama}
                            <div className="text-xs text-slate-400 font-normal">
                              {row.nomor_pendaftaran}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge
                              status={row.status_pembayaran}
                              color={row.status_color}
                            />
                          </td>
                          <td className="px-6 py-3 font-mono text-slate-700">
                            {row.jumlah_pembayaran > 0
                              ? formatCurrency(row.jumlah_pembayaran)
                              : "-"}
                          </td>
                          <td className="px-6 py-3 text-slate-500 capitalize">
                            {row.metode}
                          </td>
                          <td className="px-6 py-3 text-xs text-slate-400">
                            {new Date(row.last_updated).toLocaleDateString(
                              "id-ID",
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          Tidak ada data ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Daftar Ulang Tab ── */}
      {activeTab === "daftar-ulang" && (
        <div className="space-y-5">
          <div className="bg-secondary-50 border border-secondary-200 rounded-xl px-5 py-3 text-sm text-secondary-800 font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 shrink-0" />
            Menampilkan rekap santri yang <strong>diterima</strong> dan
            status pembayaran daftar ulang mereka.
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama santri atau nomor pendaftaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingDaftarUlang ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-6 h-6 text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 w-12">No</th>
                      <th className="px-6 py-3">Nama Santri</th>
                      <th className="px-6 py-3">Status Kelulusan</th>
                      <th className="px-6 py-3">Total Bayar</th>
                      <th className="px-6 py-3">Status Bayar</th>
                      <th className="px-6 py-3">Sisa Tagihan</th>
                      <th className="px-6 py-3">Update</th>
                      <th className="px-6 py-3 text-center w-24">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDaftarUlang.length > 0 ? (
                      filteredDaftarUlang.map((row) => (
                        <React.Fragment key={row.id}>
                          <tr
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedStudentId(expandedStudentId === row.id ? null : row.id)}
                          >
                            <td className="px-6 py-3 text-center text-slate-400">
                              {row.no}
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-900">
                              {row.nama}
                              <div className="text-xs text-slate-400 font-normal">
                                {row.nomor_pendaftaran}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold">
                                {row.status_kelulusan}
                              </span>
                            </td>
                            <td className="px-6 py-3 font-mono text-slate-700">
                              {formatCurrency(row.total_bayar)}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-bold border ${
                                  row.tipe_cicilan === "LUNAS"
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : row.tipe_cicilan === "BELUM_BAYAR"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : "bg-primary-50 text-primary-600 border-primary-100"
                                }`}
                              >
                                {row.tipe_cicilan.replace(/_/g, " ")}
                              </span>
                              {row.keringanan_reason && (
                                <div 
                                  className="mt-1 flex items-center gap-1 text-[9px] text-secondary-700 font-black bg-secondary-50 px-1.5 py-0.5 rounded border border-secondary-100 uppercase tracking-tighter cursor-help"
                                  title={row.keringanan_reason}
                                >
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Keringanan
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 font-mono text-slate-500">
                              {formatCurrency(row.sisa_tagihan)}
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-400">
                              {new Date(row.last_updated).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedStudentId(expandedStudentId === row.id ? null : row.id);
                                }}
                              >
                                {expandedStudentId === row.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedStudentId === row.id && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={8} className="px-6 py-4 border-t border-slate-100">
                                <div className="grid grid-cols-1 xl:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
                                  
                                  {/* Data Orang Tua / Keluarga */}
                                  <div className="xl:col-span-1 space-y-4 border-r border-slate-100 pr-0 xl:pr-6">
                                    <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary-600" />
                                        Data Keluarga / Orang Tua
                                      </h3>
                                    </div>
                                    
                                    {row.ortu ? (
                                      <div className="space-y-3.5 text-xs">
                                        {/* Data Ayah */}
                                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                                          <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1 mb-2 flex justify-between items-center">
                                            <span>Data Ayah</span>
                                            <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">Wali Utama</span>
                                          </h4>
                                          <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-slate-400">Nama:</span> <strong className="text-slate-800 text-right">{row.ortu.nama_ayah || "-"}</strong></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Pekerjaan:</span> <strong className="text-slate-700 text-right">{row.ortu.pekerjaan_ayah || "-"}</strong></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Penghasilan:</span> <strong className="text-emerald-700 text-right">{row.ortu.penghasilan_ayah || "-"}</strong></div>
                                            <div className="flex justify-between items-center"><span className="text-slate-400">No. HP Ayah:</span>{" "}
                                              {row.ortu.no_hp_ayah && row.ortu.no_hp_ayah !== "-" ? (
                                                <a href={`https://wa.me/${row.ortu.no_hp_ayah.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline font-bold inline-flex items-center gap-1">
                                                  {row.ortu.no_hp_ayah}
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              ) : <strong className="text-slate-700">-</strong>}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Data Ibu */}
                                        <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                                          <h4 className="font-bold text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Data Ibu</h4>
                                          <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-slate-400">Nama:</span> <strong className="text-slate-800 text-right">{row.ortu.nama_ibu || "-"}</strong></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Pekerjaan:</span> <strong className="text-slate-700 text-right">{row.ortu.pekerjaan_ibu || "-"}</strong></div>
                                            <div className="flex justify-between"><span className="text-slate-400">Penghasilan:</span> <strong className="text-emerald-700 text-right">{row.ortu.penghasilan_ibu || "-"}</strong></div>
                                            <div className="flex justify-between items-center"><span className="text-slate-400">No. HP Ibu:</span>{" "}
                                              {row.ortu.no_hp_ibu && row.ortu.no_hp_ibu !== "-" ? (
                                                <a href={`https://wa.me/${row.ortu.no_hp_ibu.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline font-bold inline-flex items-center gap-1">
                                                  {row.ortu.no_hp_ibu}
                                                  <ExternalLink className="w-3 h-3" />
                                                </a>
                                              ) : <strong className="text-slate-700">-</strong>}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Kontak Santri */}
                                        <div className="text-[11px] text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                                          <div className="flex justify-between"><span className="text-slate-400">No. HP Santri:</span> <strong className="text-slate-700">{row.no_hp || "-"}</strong></div>
                                          <div className="flex justify-between"><span className="text-slate-400">Email Santri:</span> <strong className="text-slate-700 break-all text-right">{row.email || "-"}</strong></div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-6 text-slate-400 italic bg-slate-50 rounded-lg text-xs">
                                        Data orang tua belum diisi.
                                      </div>
                                    )}
                                  </div>

                                  {/* Riwayat Pembayaran */}
                                  <div className="xl:col-span-2 space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary-600" />
                                        Riwayat Pembayaran Daftar Ulang - {row.nama}
                                      </h3>
                                      <span className="text-[11px] text-slate-500">
                                        No. Pendaftaran: <strong>{row.nomor_pendaftaran}</strong>
                                      </span>
                                    </div>

                                    {row.pembayaran_list && row.pembayaran_list.length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                              <th className="px-3 py-2">Cicilan Ke</th>
                                              <th className="px-3 py-2">Jumlah</th>
                                              <th className="px-3 py-2">Tanggal Upload</th>
                                              <th className="px-3 py-2">Metode</th>
                                              <th className="px-3 py-2">Bukti</th>
                                              <th className="px-3 py-2">Status</th>
                                              <th className="px-3 py-2">Catatan / Keringanan</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {row.pembayaran_list
                                              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                              .map((pay: any, payIndex: number) => (
                                                <tr key={pay.id || payIndex} className="hover:bg-slate-50/50">
                                                  <td className="px-3 py-2.5 font-bold text-slate-700">
                                                    {pay.cicilan_ke ? `Cicilan Ke-${pay.cicilan_ke}` : "Daftar Ulang"}
                                                  </td>
                                                  <td className="px-3 py-2.5 font-mono font-medium text-slate-800">
                                                    {formatCurrency(Number(pay.jumlah))}
                                                  </td>
                                                  <td className="px-3 py-2.5 text-slate-500">
                                                    {new Date(pay.created_at).toLocaleDateString("id-ID", {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric"
                                                    })}
                                                  </td>
                                                  <td className="px-3 py-2.5 text-slate-600 capitalize font-medium">
                                                    {pay.metode_pembayaran}
                                                  </td>
                                                  <td className="px-3 py-2.5">
                                                    {pay.bukti_transfer_path ? (
                                                      <a
                                                        href={`/api/files/${pay.bukti_transfer_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-0.5 text-primary-600 hover:text-primary-700 font-bold hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Lihat
                                                      </a>
                                                    ) : (
                                                      <span className="text-slate-400 italic">Belum</span>
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2.5">
                                                    <span
                                                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                                        pay.status_pembayaran === "verified"
                                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                          : pay.status_pembayaran === "rejected"
                                                            ? "bg-red-50 text-red-600 border-red-100"
                                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                                      }`}
                                                    >
                                                      {pay.status_pembayaran === "verified"
                                                        ? "Verified"
                                                        : pay.status_pembayaran === "rejected"
                                                          ? "Ditolak"
                                                          : "Pending"}
                                                    </span>
                                                  </td>
                                                  <td className="px-3 py-2.5 space-y-1 max-w-[200px]">
                                                    {pay.keringanan_reason && (
                                                      <div className="text-[9px] text-slate-600 bg-secondary-50/50 p-1 rounded border border-secondary-100">
                                                        <span className="font-bold text-secondary-800 uppercase tracking-tighter">Keringanan:</span>{" "}
                                                        {pay.keringanan_reason}
                                                      </div>
                                                    )}
                                                    {pay.catatan_verifikasi && (
                                                      <div className={`text-[9px] p-1 rounded border ${
                                                        pay.status_pembayaran === "rejected"
                                                          ? "bg-red-50/50 text-red-700 border-red-100"
                                                          : "bg-slate-50 text-slate-600 border-slate-100"
                                                      }`}>
                                                        <span className="font-bold uppercase tracking-tighter">Catatan:</span>{" "}
                                                        {pay.catatan_verifikasi}
                                                      </div>
                                                    )}
                                                    {!pay.keringanan_reason && !pay.catatan_verifikasi && (
                                                      <span className="text-slate-400 italic">-</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-lg text-xs">
                                        Belum ada data pembayaran daftar ulang yang diupload.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          Tidak ada data ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
