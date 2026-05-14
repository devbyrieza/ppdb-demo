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
} from "lucide-react";
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
    totalPages: 0,
  });

  // Restore state
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoringItem, setRestoringItem] = useState<DeletedPendaftar | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

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
  }, [pagination.page]);

  const handleRestore = async () => {
    if (!restoringItem) return;

    try {
      setIsRestoring(true);
      const res = await fetch(
        `/api/admin/pendaftar/${restoringItem.id}/restore`,
        {
          method: "POST",
        },
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
      minute: "2-digit",
    });
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
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-red-100">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 md:p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex-shrink-0">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 overflow-hidden">
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
                      className="hover:bg-red-50/50 transition-colors"
                    >
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
                        <button
                          onClick={() => {
                            setRestoringItem(item);
                            setIsRestoreModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Restore</span>
                        </button>
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
                      className="px-3 py-2 bg-white border-2 border-stone-200 rounded-lg disabled:opacity-50 hover:bg-red-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-stone-600">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 bg-white border-2 border-stone-200 rounded-lg disabled:opacity-50 hover:bg-red-50 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border-2 border-green-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
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
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Data{" "}
                  <strong>{toTitleCase(restoringItem.nama_lengkap)}</strong> (
                  {restoringItem.nomor_pendaftaran}) akan dipulihkan dan muncul
                  kembali di daftar pendaftar aktif.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-5 py-2.5 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                  disabled={isRestoring}
                >
                  Batal
                </button>
                <button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
