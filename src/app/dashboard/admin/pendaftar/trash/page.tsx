"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trash2,
  RotateCcw,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Hash,
  Calendar,
  Search,
  CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";

interface DeletedPendaftar {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  no_hp: string | null;
  status_pendaftaran: string;
  created_at: string;
  deleted_at: string;
  deleted_by: string | null;
  deleted_by_name: string;
  tahun_ajaran: {
    nama: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TrashPage() {
  const [data, setData] = useState<DeletedPendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0 });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("");

  // Restore state
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoringItem, setRestoringItem] = useState<DeletedPendaftar | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);

  // Selection state for bulk permanent delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: search,
        jenjang: jenjangFilter });

      const res = await fetch(`/api/admin/pendaftar/trash?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const result = await res.json();
      setData(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [pagination.page, search, jenjangFilter]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRestore = async () => {
    if (!restoringItem) return;

    try {
      setIsRestoring(true);
      const res = await fetch(
        `/api/admin/pendaftar/${restoringItem.id}/restore`,
        {
          method: "POST" },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal merestore data");
      }

      Swal.fire(
        "Berhasil",
        result.message || "Data berhasil direstore",
        "success",
      );
      setIsRestoreModalOpen(false);
      setRestoringItem(null);
      fetchTrash();
    } catch (error: any) {
      console.error("Error restoring:", error);
      Swal.fire("Gagal", error.message || "Gagal merestore data", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = data.map((d) => d.id);
    const isAllSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const executePermanentDelete = async (payload: {
    ids?: string[];
    all?: boolean;
  }) => {
    try {
      Swal.fire({
        title: "Menghapus Data...",
        text: "Sedang memproses penghapusan permanen dari database",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch("/api/admin/pendaftar/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Gagal menghapus data secara permanen");
      }

      setSelectedIds([]);
      Swal.fire({
        icon: "success",
        title: "Berhasil Dihapus Permanen",
        text: resData.message || "Data berhasil dihapus permanen dari sistem.",
        confirmButtonColor: "#dc2626",
      });
      fetchTrash();
    } catch (err: any) {
      console.error("Error permanent delete:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: err.message || "Terjadi kesalahan saat menghapus data",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handlePermanentDelete = async (item: DeletedPendaftar) => {
    const result = await Swal.fire({
      title: "Hapus Permanen?",
      html: `
        <div class="text-left text-xs text-stone-600 space-y-2.5">
          <p>Apakah Anda yakin ingin menghapus data calon santri berikut secara <strong>PERMANEN</strong>?</p>
          <div class="p-3 bg-red-50 rounded-xl border border-red-200 text-red-950 font-medium space-y-1">
            <div><strong>Nama:</strong> ${toTitleCase(item.nama_lengkap)}</div>
            <div><strong>No. Pendaftaran:</strong> <span class="font-mono text-red-700 font-bold">${item.nomor_pendaftaran}</span></div>
            <div><strong>Jenjang:</strong> ${item.jenjang}</div>
          </div>
          <div class="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-[11px] leading-relaxed">
            ⚠️ <strong>PERINGATAN:</strong> Tindakan ini <u>TIDAK DAPAT DIBATALKAN</u>. Seluruh berkas dokumen, nilai ujian, riwayat pembayaran, dan data pendaftar akan dimusnahkan secara permanen dari server.
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Permanen",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      await executePermanentDelete({ ids: [item.id] });
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Hapus Permanen ${selectedIds.length} Data?`,
      html: `
        <div class="text-left text-xs text-stone-600 space-y-2.5">
          <p>Sebanyak <strong>${selectedIds.length} data pendaftar</strong> yang dipilih akan dihapus secara <strong>PERMANEN</strong> dari database.</p>
          <div class="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-[11px] leading-relaxed">
            ⚠️ <strong>PERINGATAN:</strong> Tindakan ini <u>TIDAK DAPAT DIBATALKAN</u>. Semua data yang terpilih tidak akan dapat dipulihkan kembali.
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Ya, Hapus ${selectedIds.length} Data Permanen`,
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      await executePermanentDelete({ ids: selectedIds });
    }
  };

  const handleEmptyTrash = async () => {
    if (pagination.total === 0) return;

    const result = await Swal.fire({
      title: "Kosongkan Semua Sampah?",
      html: `
        <div class="text-left text-xs text-stone-600 space-y-2.5">
          <p>Apakah Anda yakin ingin mengosongkan seluruh isi folder sampah (<strong>${pagination.total} data</strong>)?</p>
          <div class="p-2.5 bg-red-100 rounded-xl border border-red-300 text-red-950 text-[11px] font-semibold leading-relaxed">
            🚨 <strong>PERINGATAN FATAL:</strong> SELURUH data pendaftar di folder sampah akan DIHAPUS PERMANEN secara total dari database dan TIDAK DAPAT dipulihkan lagi!
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Kosongkan Semua Sampah",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      await executePermanentDelete({ all: true });
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit" });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/admin/pendaftar"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Data Pendaftar
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[24px] shadow-2xl shadow-primary/30  shadow-primary/20 p-[24px_28px] md:p-6 border-2 border-red-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-[24px_28px]">
          <div className="flex items-center gap-3 md:gap-[24px_28px]">
            <div className="p-2.5 md:p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-[24px] flex-shrink-0">
              <Trash2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-stone-900">
                Sampah
              </h2>
              <p className="text-sm text-stone-600">
                {pagination.total} data terhapus — Data bisa di-restore kapan saja
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari nama/no pendaftaran..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="p-[16px_20px] border-2 border-stone-200 rounded-[24px] text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-hidden min-w-[200px]"
              />
              <button
                onClick={handleSearch}
                className="bg-stone-100 p-2 rounded-[24px] border-2 border-stone-200 hover:border-red-500 hover:text-red-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            <select
              value={jenjangFilter}
              onChange={(e) => {
                setJenjangFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="p-[16px_20px] border-2 border-stone-200 rounded-[24px] text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-hidden bg-white appearance-none pr-10"
            >
              <option value="">Semua Jenjang</option>
              <option value="TK">TK</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="MTs">MTs</option>
              <option value="IL">IL</option>
            </select>
            <button
              onClick={handleEmptyTrash}
              disabled={pagination.total === 0 || loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-[24px] text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Hapus permanen semua data di folder sampah"
            >
              <Trash2 className="w-4 h-4" />
              <span>Kosongkan Sampah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-stone-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold">
              <strong className="text-red-400">{selectedIds.length}</strong> data dipilih
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-stone-300 hover:text-white transition-colors"
            >
              Batal Pilih
            </button>
            <button
              onClick={handleBulkPermanentDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Permanen Terpilih ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[24px] shadow-2xl shadow-primary/30  shadow-primary/20 border-2 border-red-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-stone-600">Memuat data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20">
            <Trash2 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 text-lg font-medium">Sampah kosong</p>
            <p className="text-stone-500 text-sm mt-2">
              Tidak ada data pendaftar yang dihapus
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-200">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          data.length > 0 &&
                          data.every((d) => selectedIds.includes(d.id))
                        }
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-red-600 rounded border-stone-300 focus:ring-red-500 cursor-pointer"
                        title="Pilih semua data pada halaman ini"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      No. Pendaftaran
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      Jenjang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      Dihapus Oleh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      Tanggal Hapus
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-red-900 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-red-50/50 transition-colors ${
                        selectedIds.includes(item.id) ? "bg-red-50/70" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 text-red-600 rounded border-stone-300 focus:ring-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-red-400" />
                          <span className="font-mono text-sm font-bold text-red-700">
                            {item.nomor_pendaftaran}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-bold text-stone-900 line-through decoration-red-300">
                            {toTitleCase(item.nama_lengkap)}
                          </div>
                          <div className="text-xs text-stone-500">
                            {["L", "Laki-laki"].includes(item.jenis_kelamin)
                              ? "Laki-laki"
                              : "Perempuan"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">
                          {item.jenjang}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-stone-700 font-medium">
                          {item.deleted_by_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-stone-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDate(item.deleted_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRestoringItem(item);
                              setIsRestoreModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
                            title="Pulihkan data pendaftar ini"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 hover:border-red-400 active:scale-95 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
                            title="Hapus data ini secara permanen dari database"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Hapus Permanen</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-stone-50 px-6 py-4 border-t-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-stone-600">
                    Menampilkan{" "}
                    <span className="font-bold">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    dari <span className="font-bold">{pagination.total}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 bg-white border-2 border-stone-200 rounded-[24px] disabled:opacity-50 hover:bg-red-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-stone-600">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 bg-white border-2 border-stone-200 rounded-[24px] disabled:opacity-50 hover:bg-red-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {isRestoreModalOpen && restoringItem && (
        <div onWheel={(e) => e.stopPropagation()} data-modal="true" aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center bg-black/50 backdrop-blur-sm p-[24px_28px] overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar">
          <div className="bg-white rounded-[24px] shadow-2xl shadow-primary/30 w-full max-w-md border-2 border-green-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-[24px]">
                  <RotateCcw className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Restore Data
                  </h3>
                  <p className="text-sm text-stone-500">
                    Pulihkan data pendaftar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-[24px] p-[24px_28px]">
                <p className="text-sm text-green-800 font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Data <strong>{toTitleCase(restoringItem.nama_lengkap)}</strong> (
                    {restoringItem.nomor_pendaftaran}) akan dipulihkan dan muncul
                    kembali di daftar pendaftar aktif.
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-5 py-2.5 font-bold text-stone-500 hover:bg-stone-100 rounded-[24px] transition-colors"
                  disabled={isRestoring}
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-[24px] shadow-2xl shadow-primary/30  shadow-primary/20 shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memulihkan...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Restore Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
