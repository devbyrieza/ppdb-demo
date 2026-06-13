import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, UploadCloud, X, Check, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface AdminUploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeTab: "PENDAFTARAN" | "DAFTAR_ULANG";
}

export default function AdminUploadPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  activeTab,
}: AdminUploadPaymentModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPendaftar, setSelectedPendaftar] = useState<any>(null);

  const [jumlah, setJumlah] = useState("");
  const [tipeCicilan, setTipeCicilan] = useState("LUNAS");
  const [cicilanKe, setCicilanKe] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedPendaftar(null);
      setJumlah("");
      setTipeCicilan("LUNAS");
      setCicilanKe("1");
      setCatatan("");
      setFile(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchPendaftar = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/pembayaran/upload-for-pendaftar?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPendaftar, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendaftar || !file || !jumlah) {
      Swal.fire("Peringatan", "Lengkapi pendaftar, nominal, dan bukti transfer", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("pendaftar_id", selectedPendaftar.id);
      formData.append("jenis_pembayaran", activeTab);
      formData.append("jumlah", jumlah);
      formData.append("tipe_cicilan", tipeCicilan);
      if (tipeCicilan === "CICILAN") formData.append("cicilan_ke", cicilanKe);
      if (catatan) formData.append("catatan", catatan);
      formData.append("file", file);

      const res = await fetch("/api/admin/pembayaran/upload-for-pendaftar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Berhasil", data.message, "success");
        onSuccess();
        onClose();
      } else {
        Swal.fire("Gagal", data.error || "Terjadi kesalahan", "error");
      }
    } catch (error: any) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPendaftar = (p: any) => {
    setSelectedPendaftar(p);
    
    // Auto fill jumlah based on active tab and pendaftar info if possible
    if (activeTab === "PENDAFTARAN") {
      setJumlah(p.tahun_ajaran?.biaya_pendaftaran?.toString() || "");
    } else {
      setJumlah("");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex justify-center items-start pt-10 md:pt-16 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative mb-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-black text-primary-950">Upload Atas Nama Pendaftar</h3>
            <p className="text-sm text-stone-500 font-medium">Upload bukti {activeTab === "PENDAFTARAN" ? "pendaftaran" : "daftar ulang"} untuk pendaftar</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedPendaftar ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, nomor pendaftaran, atau no hp..."
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none font-medium transition-all"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary-500" />
                )}
              </div>

              {query.length >= 2 && (
                <div className="border border-stone-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto bg-white shadow-sm">
                  {results.length > 0 ? (
                    results.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPendaftar(p)}
                        className="w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-primary-50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-800">{p.nama_lengkap}</span>
                          <span className="text-xs font-black text-primary-600 bg-primary-100 px-2 py-0.5 rounded-lg">
                            {p.jenjang}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>{p.nomor_pendaftaran}</span>
                          <span>•</span>
                          <span>{p.no_hp || "-"}</span>
                        </div>
                      </button>
                    ))
                  ) : !isSearching ? (
                    <div className="p-8 text-center text-stone-500">Tidak ada pendaftar ditemukan</div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Pendaftar Info */}
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1">Pendaftar Terpilih</p>
                  <p className="font-bold text-primary-950 text-lg">{selectedPendaftar.nama_lengkap}</p>
                  <p className="text-sm text-primary-700">{selectedPendaftar.nomor_pendaftaran} • {selectedPendaftar.jenjang}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedPendaftar(null)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-800 underline"
                >
                  Ubah
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nominal */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-stone-700">Nominal Transfer (Rp) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none font-bold text-stone-800"
                    placeholder="Contoh: 350000"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-stone-700">Bukti Transfer <span className="text-rose-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors flex items-center gap-2 border border-stone-200"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Pilih File
                    </button>
                    <span className="text-xs font-medium text-stone-500 truncate max-w-[150px]">
                      {file ? file.name : "Belum ada file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept="image/jpeg, image/png, application/pdf"
                    required
                  />
                </div>

                {/* Cicilan untuk DAFTAR_ULANG */}
                {activeTab === "DAFTAR_ULANG" && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-violet-700 uppercase tracking-widest">Tipe Pembayaran</label>
                      <select
                        value={tipeCicilan}
                        onChange={(e) => setTipeCicilan(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-bold text-violet-900"
                      >
                        <option value="LUNAS">LUNAS</option>
                        <option value="CICILAN">CICILAN</option>
                      </select>
                    </div>
                    {tipeCicilan === "CICILAN" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-violet-700 uppercase tracking-widest">Cicilan Ke-</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={cicilanKe}
                          onChange={(e) => setCicilanKe(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-bold text-violet-900"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Catatan */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-stone-700">Catatan (Opsional)</label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none font-medium text-stone-800"
                    placeholder="Contoh: Bukti dikirim via WhatsApp CS oleh orangtua..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Upload & Simpan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
