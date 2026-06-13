import React, { useState, useEffect } from "react";
import { Search, Loader2, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminSearchPendaftarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSearchPendaftarModal({ isOpen, onClose }: AdminSearchPendaftarModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex justify-center items-start pt-10 md:pt-16 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative mb-20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-black text-primary-950">Cari Pendaftar</h3>
            <p className="text-sm text-stone-500 font-medium">Pilih pendaftar untuk melihat/mengupload dokumen</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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
            <div className="border border-stone-200 rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto bg-white shadow-sm">
              {results.length > 0 ? (
                results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onClose();
                      router.push(`/dashboard/admin/verifikasi-dokumen/${p.id}`);
                    }}
                    className="w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-primary-50 last:border-0 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
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
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileText className="w-4 h-4" />
                    </div>
                  </button>
                ))
              ) : !isSearching ? (
                <div className="p-8 text-center text-stone-500 font-medium">Tidak ada pendaftar ditemukan</div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
