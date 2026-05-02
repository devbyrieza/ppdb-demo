"use client";

import { useState, useEffect, useCallback, use } from "react";
import {
    FileCheck,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCw,
    User,
    FileText,
    AlertCircle,
    Check,
    X,
    Image as ImageIcon,
    ExternalLink,
    ChevronLeft,
    Download,
    ZoomIn,
    ZoomOut,
    Maximize,
    UploadCloud,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef } from "react";

interface Dokumen {
    id: string;
    jenis_dokumen: string;
    status_verifikasi: string;
    is_verified: boolean;
    catatan: string | null;
    file_url: string | null;
    file_type: string | null;
    created_at: string;
    updated_at: string;
    pendaftar_id: string;
}

interface PendaftarInfo {
    id: string;
    nomor_pendaftaran: string;
    nama_lengkap: string;
    jenjang: string;
    no_hp: string | null;
}

const JENIS_DOKUMEN_ORDER = [
    "Foto Setengah Badan",
    "Scan Kartu Keluarga",
    "Scan Akte Kelahiran",
    "Scan Rapor 2 Semester Terakhir (1)",
    "Scan Rapor 2 Semester Terakhir (2)",
    "Scan NISN",
    "Surat Keterangan Sehat",
    "Scan Pakta Integritas",
    "Scan Pernyataan Bebas Perilaku Negatif",
];

export default function VerifikasiDokumenDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [pendaftar, setPendaftar] = useState<PendaftarInfo | null>(null);
    const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingDocs, setProcessingDocs] = useState<Set<string>>(new Set());
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string | null; label: string } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedUploadDoc, setSelectedUploadDoc] = useState<{ id: string; jenis: string } | null>(null);

    // Reject Modal State
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; docId: string; docName: string; initialReason: string }>({
        isOpen: false,
        docId: "",
        docName: "",
        initialReason: ""
    });
    const [rejectReason, setRejectReason] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // We use status=all but filter by pendaftar_id
            const response = await fetch(
                `/api/admin/verifikasi/dokumen?pendaftar_id=${id}&status=all`
            );
            if (!response.ok) throw new Error("Failed to fetch");

            const result = await response.json();

            if (result.data && result.data.length > 0) {
                const firstDoc = result.data[0];
                setPendaftar(firstDoc.pendaftar);

            // Process uploaded documents
            const docsData = result.data || [];
            const uploadedTypes = new Set(docsData.map((d: any) => d.jenis_dokumen));
            
            const processedDocs = docsData.map((d: any) => {
                let label = d.jenis_dokumen;
                switch (d.jenis_dokumen) {
                    case 'foto_setengah_badan': label = "Foto Setengah Badan"; break;
                    case 'kartu_keluarga': label = "Scan Kartu Keluarga"; break;
                    case 'akta_kelahiran': label = "Scan Akte Kelahiran"; break;
                    case 'rapor_sem1': label = "Scan Rapor 2 Semester Terakhir (1)"; break;
                    case 'rapor_sem2': label = "Scan Rapor 2 Semester Terakhir (2)"; break;
                    case 'nisn': label = "Scan NISN"; break;
                    case 'surat_kesehatan': label = "Surat Keterangan Sehat"; break;
                    case 'pakta_integritas': label = "Scan Pakta Integritas"; break;
                    case 'pernyataan_bebas_negatif': label = "Scan Pernyataan Bebas Perilaku Negatif"; break;
                    default: label = d.jenis_dokumen.replace(/_/g, " ");
                }

                return {
                    id: d.id,
                    jenis_dokumen: label,
                    raw_jenis: d.jenis_dokumen,
                    status_verifikasi: d.is_verified ? "verified" : (d.catatan ? "rejected" : "pending"),
                    is_verified: d.is_verified,
                    catatan: d.catatan,
                    file_url: d.file_url,
                    file_type: d.file_type,
                    created_at: d.created_at,
                    updated_at: d.updated_at,
                    pendaftar_id: id,
                };
            });

            // Add placeholders for missing required documents
            const REQUIRED_RAW_TYPES = [
                'foto_setengah_badan', 'kartu_keluarga', 'akta_kelahiran', 
                'rapor_sem1', 'rapor_sem2', 'nisn', 'surat_kesehatan', 
                'pakta_integritas', 'pernyataan_bebas_negatif'
            ];

            REQUIRED_RAW_TYPES.forEach(rawType => {
                if (!uploadedTypes.has(rawType)) {
                    let label = rawType;
                    switch (rawType) {
                        case 'foto_setengah_badan': label = "Foto Setengah Badan"; break;
                        case 'kartu_keluarga': label = "Scan Kartu Keluarga"; break;
                        case 'akta_kelahiran': label = "Scan Akte Kelahiran"; break;
                        case 'rapor_sem1': label = "Scan Rapor 2 Semester Terakhir (1)"; break;
                        case 'rapor_sem2': label = "Scan Rapor 2 Semester Terakhir (2)"; break;
                        case 'nisn': label = "Scan NISN"; break;
                        case 'surat_kesehatan': label = "Surat Keterangan Sehat"; break;
                        case 'pakta_integritas': label = "Scan Pakta Integritas"; break;
                        case 'pernyataan_bebas_negatif': label = "Scan Pernyataan Bebas Perilaku Negatif"; break;
                    }

                    processedDocs.push({
                        id: `placeholder-${rawType}`,
                        jenis_dokumen: label,
                        raw_jenis: rawType,
                        status_verifikasi: "empty",
                        is_verified: false,
                        catatan: null,
                        file_url: null,
                        file_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        pendaftar_id: id,
                    });
                }
            });

            // Sort documents based on JENIS_DOKUMEN_ORDER
            processedDocs.sort((a: any, b: any) => {
                const aIndex = JENIS_DOKUMEN_ORDER.indexOf(a.jenis_dokumen);
                const bIndex = JENIS_DOKUMEN_ORDER.indexOf(b.jenis_dokumen);
                if (aIndex === -1 && bIndex === -1) return a.jenis_dokumen.localeCompare(b.jenis_dokumen);
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });

            setDokumenList(processedDocs);
            } else {
                // Handle case where no documents found or applicant doesn't exist/has no docs
                // We might want to fetch pendaftar info separately if needed, 
                // but for now let's assume if there are no docs, we just show empty
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVerify = async (dokumenId: string, status: "verified" | "rejected", catatan?: string) => {
        try {
            setProcessingDocs(prev => new Set(prev).add(dokumenId));

            const response = await fetch("/api/admin/verifikasi/dokumen", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dokumen_id: dokumenId,
                    status_verifikasi: status,
                    catatan: catatan || null,
                }),
            });

            if (!response.ok) throw new Error("Failed to verify");

            // Update local state
            setDokumenList(prev => prev.map(d => {
                if (d.id === dokumenId) {
                    return {
                        ...d,
                        status_verifikasi: status,
                        is_verified: status === "verified",
                        catatan: status === "verified" ? null : (catatan || d.catatan)
                    };
                }
                return d;
            }));
        } catch (error) {
            console.error("Error verifying dokumen:", error);
            alert("Gagal memverifikasi dokumen");
        } finally {
            setProcessingDocs(prev => {
                const next = new Set(prev);
                next.delete(dokumenId);
                return next;
            });
        }
    };

    const toTitleCase = (str: string) => {
        if (!str) return "";
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const isImageFile = (dok: Dokumen) => {
        if (dok.file_type) return dok.file_type.startsWith("image/");
        if (!dok.file_url) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(dok.file_url);
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed, opening in new tab", error);
            window.open(url, "_blank");
        }
    };

    const openPreview = (url: string, type: string | null, label: string) => {
        setZoomLevel(1);
        setPreviewDoc({ url, type, label });
    };

    const handleReplaceClick = (dokId: string, jenis: string) => {
        setSelectedUploadDoc({ id: dokId, jenis });
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedUploadDoc) return;

        try {
            setUploadingDoc(selectedUploadDoc.id);

            const formData = new FormData();
            formData.append("file", file);

            // Revert label mapping to raw key, or if `raw_jenis` exists in state use it
            // Assuming `raw_jenis` is attached inside `fetchData`
            const docObj = dokumenList.find(d => d.id === selectedUploadDoc.id);
            const rawJenis = (docObj as any)?.raw_jenis || selectedUploadDoc.jenis.toLowerCase().replace(/ /g, "_");

            formData.append("jenis_dokumen", rawJenis);
            formData.append("pendaftar_id", id);

            const response = await fetch("/api/admin/verifikasi/dokumen/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert("Dokumen berhasil diganti dan otomatis diverifikasi");
                fetchData(); // Reload all data to see the new document
            } else {
                alert(data.error || "Gagal mengunggah dokumen");
            }
        } catch (error) {
            console.error("Error replacing dokumen:", error);
            alert("Terjadi kesalahan saat mengunggah");
        } finally {
            setUploadingDoc(null);
            setSelectedUploadDoc(null);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-brand-blue-600 mb-4" />
                <p className="text-ink-300 font-bold tracking-wide">Memuat berkas pendaftar...</p>
            </div>
        );
    }

    if (!pendaftar && !loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm p-10 border border-brand-yellow-200 text-center">
                <AlertCircle className="w-16 h-16 text-brand-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-brand-blue-950 mb-2">Data Tidak Ditemukan</h2>
                <p className="text-ink-300 font-medium mb-6">Pendaftar ini belum mengunggah berkas apapun atau data salah.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-blue-700/20 active:scale-95"
                >
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg, image/png, application/pdf"
            />
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-brand-yellow-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-brand-yellow-50 rounded-lg text-ink-300 transition-colors"
                            title="Kembali"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-linear-to-br from-brand-blue-600 to-brand-blue-900 rounded-2xl shadow-xl shadow-brand-blue-900/20">
                            <User className="w-8 h-8 text-brand-yellow-300" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-brand-blue-950 leading-none mb-1">
                                {toTitleCase(pendaftar?.nama_lengkap || "")}
                            </h2>
                            <div className="flex items-center gap-3 text-ink-300">
                                <span className="font-mono bg-brand-blue-50 px-2.5 py-1 rounded-lg text-sm font-black text-brand-blue-600 border border-brand-blue-100">{pendaftar?.nomor_pendaftaran}</span>
                                <span className="px-2.5 py-1 bg-brand-yellow-400 text-brand-blue-900 rounded-lg text-[10px] font-black uppercase shadow-xs">
                                    {pendaftar?.jenjang}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Muat Ulang
                    </button>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dokumenList.map((dok) => (
                    <div
                        key={dok.id}
                        className={`bg-white border rounded-3xl overflow-hidden transition-all shadow-xs hover:shadow-xl hover:shadow-brand-blue-900/5 ${dok.status_verifikasi === "verified"
                            ? "border-emerald-200"
                            : dok.status_verifikasi === "rejected"
                                ? "border-rose-200"
                                : "border-brand-yellow-200"
                            }`}
                    >
                        {/* Document Preview */}
                        <div className="relative aspect-[4/3] bg-stone-100">
                            {dok.file_url ? (
                                isImageFile(dok) ? (
                                    <img
                                        src={dok.file_url}
                                        alt={dok.jenis_dokumen}
                                        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                        onClick={() => openPreview(dok.file_url!, dok.file_type, dok.jenis_dokumen)}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                                        <FileText className="w-16 h-16 mb-2" />
                                        <span className="text-sm font-medium">Dokumen PDF</span>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => openPreview(dok.file_url!, dok.file_type, dok.jenis_dokumen)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                                            >
                                                Pratinjau
                                            </button>
                                            <a
                                                href={dok.file_url}
                                                target="_blank"
                                                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold transition-all"
                                            >
                                                Tab Baru
                                            </a>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                                    <AlertCircle className="w-12 h-12 mb-2" />
                                    <span className="text-sm">File tidak tersedia</span>
                                </div>
                            )}

                            {/* View button overlay for images */}
                            {dok.file_url && isImageFile(dok) && (
                                <a
                                    href={dok.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-xl text-stone-700 shadow-sm transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-black text-brand-blue-950 capitalize tracking-tight leading-tight">{dok.jenis_dokumen.replace(/_/g, " ")}</h3>
                                {dok.status_verifikasi === "verified" ? (
                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                        <CheckCircle className="w-3 h-3" />
                                        Diterima
                                    </div>
                                ) : dok.status_verifikasi === "rejected" ? (
                                    <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                        <XCircle className="w-3 h-3" />
                                        Ditolak
                                    </div>
                                ) : dok.status_verifikasi === "empty" ? (
                                    <div className="flex items-center gap-1 text-stone-400 bg-stone-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-stone-200 italic">
                                        <Clock className="w-3 h-3" />
                                        Belum Ada
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-brand-yellow-700 bg-brand-yellow-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-brand-yellow-200">
                                        <RefreshCw className="w-3 h-3" />
                                        Menunggu
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] text-ink-300 font-black uppercase tracking-widest leading-none">
                                    {formatDate(dok.created_at)}
                                </p>
                                <button
                                    onClick={() => handleReplaceClick(dok.id, dok.jenis_dokumen)}
                                    disabled={uploadingDoc === dok.id}
                                    className="flex items-center gap-1 text-[10px] font-black text-brand-blue-600 hover:text-brand-blue-800 transition-colors uppercase disabled:opacity-50 italic"
                                >
                                    {uploadingDoc === dok.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                    {dok.status_verifikasi === "empty" ? "Upload Berkas" : "Ubah Data"}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVerify(dok.id, "verified")}
                                    disabled={processingDocs.has(dok.id) || dok.status_verifikasi === "verified"}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${dok.status_verifikasi === "verified"
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                                        }`}
                                >
                                    {processingDocs.has(dok.id) ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Terima
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setRejectModal({
                                            isOpen: true,
                                            docId: dok.id,
                                            docName: dok.jenis_dokumen.replace(/_/g, " "),
                                            initialReason: dok.catatan || ""
                                        });
                                        setRejectReason(dok.catatan || "");
                                    }}
                                    disabled={processingDocs.has(dok.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 ${dok.status_verifikasi === "rejected"
                                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                                        : "bg-white border-2 border-brand-yellow-100 hover:border-rose-400 hover:text-rose-600 text-ink-300"
                                        }`}
                                >
                                    {processingDocs.has(dok.id) ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <X className="w-4 h-4" />
                                            Tolak
                                        </>
                                    )}
                                </button>
                            </div>

                            {dok.catatan && (
                                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                    <p className="text-[10px] font-bold text-rose-800 uppercase mb-1">Catatan Penolakan:</p>
                                    <p className="text-xs text-rose-700">{dok.catatan}</p>
                                </div>
                            )}

                            {(dok.status_verifikasi === "verified" || dok.status_verifikasi === "rejected") && (
                                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
                                    {!dok.is_verified && dok.catatan && (
                                        <p className="mt-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {dok.catatan}</p>
                                    )}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Image/PDF Preview Modal */}
            {previewDoc && (
                <div
                    className="fixed inset-0 bg-stone-900/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md"
                    onClick={() => setPreviewDoc(null)}
                >
                    <div className="relative max-w-6xl max-h-[95vh] w-full h-full bg-white/5 overflow-hidden rounded-3xl flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 bg-stone-900/80 backdrop-blur-md border-b border-white/10 shrink-0 z-10 sticky top-0">
                            <h3 className="text-white font-bold capitalize">{previewDoc.label.replace(/_/g, " ")}</h3>
                            <div className="flex items-center gap-2">
                                {/* Zoom Controls for Images Only */}
                                {previewDoc.type !== "application/pdf" && (
                                    <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 mr-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(0.5, prev - 0.25)); }}
                                            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <span className="text-white text-xs font-mono w-12 text-center select-none">
                                            {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(4, prev + 0.25)); }}
                                            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setZoomLevel(1); }}
                                            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all"
                                            title="Reset Zoom"
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(previewDoc.url, `${pendaftar?.nama_lengkap}_${previewDoc.label.replace(/ /g, "_")}.${previewDoc.url.split('.').pop()?.split('?')[0] || 'file'}`);
                                    }}
                                    className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 rounded-xl text-emerald-400 backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold"
                                    title="Unduh Dokumen"
                                >
                                    <Download className="w-4 h-4" />
                                    Unduh
                                </button>
                                <a
                                    href={previewDoc.url}
                                    target="_blank"
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Buka Tab Baru
                                </a>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-2.5 bg-rose-600/20 hover:bg-rose-600/40 rounded-xl text-rose-400 backdrop-blur-md transition-all ml-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto bg-stone-100 flex items-center justify-center p-2 relative" onClick={(e) => e.stopPropagation()}>
                            {previewDoc.type === "application/pdf" ? (
                                <iframe
                                    src={`${previewDoc.url}#toolbar=0`}
                                    className="w-full h-full rounded-xl shadow-inner border-0"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center overflow-auto absolute inset-0">
                                    <img
                                        src={previewDoc.url}
                                        alt="Preview"
                                        className="max-w-none origin-center drop-shadow-2xl rounded-lg transition-transform duration-200 ease-out"
                                        style={{ transform: `scale(${zoomLevel})` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[110] px-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!processingDocs.has(rejectModal.docId)) {
                            setRejectModal({ ...rejectModal, isOpen: false });
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-rose-600" />
                                Tolak Dokumen
                            </h3>
                            <button
                                onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                                disabled={processingDocs.has(rejectModal.docId)}
                                className="text-stone-400 hover:text-stone-600 transition-colors p-2 hover:bg-stone-200 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                <FileText className="w-5 h-5 text-rose-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-0.5">Dokumen yang ditolak</p>
                                    <p className="font-bold text-rose-900 capitalize text-sm">{rejectModal.docName}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Alasan Penolakan <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Contoh: Foto buram, dokumen tidak terbaca, masa berlaku habis..."
                                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none min-h-[120px] text-sm resize-none transition-all placeholder:text-stone-400"
                                        autoFocus
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-stone-400 font-medium bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                        {rejectReason.length} chars
                                    </div>
                                </div>
                                <p className="text-xs text-stone-500 mt-2 flex items-start gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                    <span>Alasan ini akan dikirimkan otomatis ke WhatsApp pendaftar.</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-stone-50 flex items-center justify-end gap-3 border-t border-stone-100">
                            <button
                                onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                                disabled={processingDocs.has(rejectModal.docId)}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={async () => {
                                    if (!rejectReason.trim()) {
                                        alert("Mohon isi alasan penolakan");
                                        return;
                                    }
                                    await handleVerify(rejectModal.docId, "rejected", rejectReason);
                                    setRejectModal({ ...rejectModal, isOpen: false });
                                }}
                                disabled={processingDocs.has(rejectModal.docId) || !rejectReason.trim()}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {processingDocs.has(rejectModal.docId) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <XCircle className="w-4 h-4" />
                                )}
                                Tolak Dokumen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
