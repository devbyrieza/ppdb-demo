"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileUp,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

interface CandidateItem {
  id: string;
  nama_lengkap: string;
  nomor_pendaftaran: string;
  jenjang?: string;
  kelas_diterima?: string;
}

export function BulkPengumumanDialog({
  candidates,
  onClose,
  onSuccess,
}: {
  candidates: CandidateItem[];
  onClose: () => void;
  onSuccess: (updatedIds: string[]) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kirimWa, setKirimWa] = useState(true);

  // Multi-Upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileMappings, setFileMappings] = useState<Record<string, string>>({}); // candidateId -> filename
  const [candidateClasses, setCandidateClasses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    candidates.forEach((c) => {
      const j = (c.jenjang || "").toUpperCase();
      const defaultKelas = j.includes("IL") || j.includes("IDAD") ? "IL" : "VII";
      map[c.id] = c.kelas_diterima || defaultKelas;
    });
    return map;
  });

  // Body Scroll Lock (Mandatory UX Rule)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "unset";
    };
  }, []);

  // Smart Matching algorithm whenever uploadedFiles changes
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setFileMappings({});
      return;
    }

    const newMappings: Record<string, string> = { ...fileMappings };

    // 1. SPECIAL CASE: If only 1 candidate and 1 file uploaded, ALWAYS auto-map directly!
    if (candidates.length === 1 && uploadedFiles.length === 1) {
      newMappings[candidates[0].id] = uploadedFiles[0].name;
      setFileMappings(newMappings);
      return;
    }

    // 2. SPECIAL CASE: If only 1 candidate and multiple files uploaded
    if (candidates.length === 1) {
      const c = candidates[0];
      // Keep existing manual mapping if file is still present
      if (newMappings[c.id] && uploadedFiles.some((f) => f.name === newMappings[c.id])) {
        setFileMappings(newMappings);
        return;
      }

      // Try smart match
      const cleanReg = c.nomor_pendaftaran.replace(/\W/g, "").toLowerCase();
      const regDigits = c.nomor_pendaftaran.replace(/\D/g, "");
      const fullName = c.nama_lengkap.trim().toLowerCase();
      const nameParts = fullName.split(/\s+/).filter((p) => p.length >= 3);

      const match = uploadedFiles.find((f) => {
        const fn = f.name.toLowerCase();
        if (cleanReg && fn.includes(cleanReg)) return true;
        if (regDigits && regDigits.length >= 4 && fn.includes(regDigits)) return true;
        if (fn.includes(fullName)) return true;
        if (nameParts.some((p) => fn.includes(p))) return true;
        return false;
      });

      // Default to best match, or first uploaded file
      newMappings[c.id] = match ? match.name : uploadedFiles[0].name;
      setFileMappings(newMappings);
      return;
    }

    // 3. MULTIPLE CANDIDATES SMART MATCHING
    const assignedFiles = new Set<string>();

    // Clean up mappings pointing to deleted files
    Object.entries(newMappings).forEach(([cid, fname]) => {
      if (uploadedFiles.some((f) => f.name === fname)) {
        assignedFiles.add(fname);
      } else {
        delete newMappings[cid];
      }
    });

    // Score-based matching for unassigned candidates
    candidates.forEach((c) => {
      if (newMappings[c.id]) return; // already assigned

      const cleanReg = c.nomor_pendaftaran.replace(/\W/g, "").toLowerCase();
      const regDigits = c.nomor_pendaftaran.replace(/\D/g, "");
      const fullName = c.nama_lengkap.trim().toLowerCase();
      const nameParts = fullName.split(/\s+/).filter((p) => p.length >= 3);

      let bestFile: File | null = null;
      let highestScore = 0;

      for (const f of uploadedFiles) {
        if (assignedFiles.has(f.name)) continue;
        const fn = f.name.toLowerCase();
        let score = 0;

        // Full registration number match
        if (cleanReg && fn.includes(cleanReg)) score += 100;
        // Registration digits match (e.g. 2700001)
        else if (regDigits && regDigits.length >= 4 && fn.includes(regDigits)) score += 70;

        // Full name match
        if (fn.includes(fullName)) score += 90;
        // Multiple name parts match
        else if (nameParts.length >= 2 && fn.includes(nameParts[0]) && fn.includes(nameParts[1])) score += 60;
        // Single distinct name part match
        else {
          const matchedParts = nameParts.filter((p) => fn.includes(p));
          if (matchedParts.length > 0) score += matchedParts.length * 25;
        }

        if (score > highestScore) {
          highestScore = score;
          bestFile = f;
        }
      }

      if (bestFile && highestScore > 0) {
        newMappings[c.id] = bestFile.name;
        assignedFiles.add(bestFile.name);
      }
    });

    // 4. Fallback: If 1 unassigned candidate and 1 unassigned file remain, pair them up!
    const unassignedCandidates = candidates.filter((c) => !newMappings[c.id]);
    const unassignedFiles = uploadedFiles.filter((f) => !assignedFiles.has(f.name));
    if (unassignedCandidates.length === 1 && unassignedFiles.length === 1) {
      newMappings[unassignedCandidates[0].id] = unassignedFiles[0].name;
      assignedFiles.add(unassignedFiles[0].name);
    }

    setFileMappings(newMappings);
  }, [uploadedFiles, candidates]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (filesArray.length === 0) {
      Swal.fire("Format Tidak Sesuai", "Hanya file berekstensi .pdf yang diperbolehkan.", "warning");
      return;
    }
    setUploadedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const additions = filesArray.filter((f) => !existingNames.has(f.name));
      return [...prev, ...additions];
    });
  };

  const handleFilesDropped = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = ""; // reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
    setFileMappings((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === fileName) delete next[k];
      });
      return next;
    });
  };

  const handleSubmitUpload = async () => {
    const matchedCount = Object.keys(fileMappings).length;
    if (matchedCount === 0) {
      Swal.fire({
        title: "Belum Ada File Dipasangkan",
        text: "Silakan unggah file PDF atau pilih file dari menu dropdown di samping nama santri.",
        icon: "warning",
        confirmButtonColor: "#059669",
      });
      return;
    }

    if (matchedCount < candidates.length) {
      const confirm = await Swal.fire({
        title: "Sebagian Santri Belum Ada File",
        text: `Baru ${matchedCount} dari ${candidates.length} santri yang memiliki file PDF terpasang. Lanjutkan memproses ${matchedCount} santri yang sudah ada file?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Proses yang Cocok",
        cancelButtonText: "Periksa Lagi",
        confirmButtonColor: "#059669",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("files", file as any));

      const mappingsPayload = Object.entries(fileMappings).map(([pId, fn]) => ({
        pendaftarId: pId,
        filename: fn,
        kelasDiterima: candidateClasses[pId],
      }));

      formData.append("mappings", JSON.stringify(mappingsPayload));
      formData.append("kirim_wa", kirimWa ? "true" : "false");

      const res = await fetch("/api/admin/surat-pengumuman/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload massal.");

      await Swal.fire({
        title: "Berhasil Diproses!",
        text: `${json.count || mappingsPayload.length} file surat kelulusan berhasil diunggah dan status santri resmi Diterima.`,
        icon: "success",
        confirmButtonColor: "#059669",
      });

      onSuccess(mappingsPayload.map((m) => m.pendaftarId));
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Mengunggah",
        text: err.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedCount = useMemo(() => Object.keys(fileMappings).length, [fileMappings]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain custom-scrollbar"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/90 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold shadow-sm">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Upload Surat Keputusan Santri Diterima
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Mengunggah surat kelulusan resmi untuk{" "}
                <b className="text-emerald-700">{candidates.length} santri terpilih</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto overscroll-contain custom-scrollbar space-y-4 flex-1">
          {/* Info Banner */}
          <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-3.5 text-blue-900 text-xs flex items-start gap-3">
            <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-blue-950">Smart File Matching & Fleksibilitas Penuh</p>
              <p className="mt-0.5 text-blue-800">
                {candidates.length === 1
                  ? "Cukup tarik atau pilih 1 file PDF surat kelulusan. Sistem otomatis memasangkan file tersebut ke santri yang dipilih."
                  : "Tarik seluruh file PDF sekaligus. Sistem akan mencocokkan otomatis berdasarkan nama/nomor pendaftaran santri, atau Anda dapat memilih file secara manual pada dropdown di tabel."}
              </p>
            </div>
          </div>

          {/* Dropzone Area */}
          {uploadedFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer group"
            >
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFilesDropped}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-stone-800">
                  Klik atau Tarik & Lepas File PDF ke Sini
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Mendukung 1 atau banyak file PDF sekaligus (Format .pdf)
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    {uploadedFiles.length} file PDF siap diproses ({matchedCount} terpasang ke santri)
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFilesDropped}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah File Lain
                  </button>
                </div>
              </div>

              {/* Uploaded File Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-emerald-200/60 max-h-24 overflow-y-auto custom-scrollbar">
                {uploadedFiles.map((f) => (
                  <span
                    key={f.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-stone-700 text-xs shadow-2xs"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="max-w-[220px] truncate font-medium">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.name)}
                      className="text-stone-400 hover:text-red-500 transition ml-0.5"
                      title="Hapus file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matching Table (Always Visible) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                Daftar Santri & File Surat Kelulusan ({matchedCount}/{candidates.length} Terpasang)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 hover:text-stone-900 transition">
                <input
                  type="checkbox"
                  checked={kirimWa}
                  onChange={(e) => setKirimWa(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                Kirim notifikasi WhatsApp resmi ke wali santri
              </label>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 max-h-64 overflow-y-auto custom-scrollbar bg-white">
              {candidates.map((c, idx) => {
                const matchedFileName = fileMappings[c.id];
                return (
                  <div
                    key={c.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-stone-50 text-xs gap-3 transition ${
                      matchedFileName ? "bg-emerald-50/15" : "bg-amber-50/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-400 font-bold w-5">{idx + 1}.</span>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{c.nama_lengkap}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-stone-500 font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                            {c.nomor_pendaftaran}
                          </span>
                          {c.jenjang && (
                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                              {c.jenjang}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {matchedFileName ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="max-w-[200px] truncate font-bold text-emerald-900" title={matchedFileName}>
                            {matchedFileName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>Pilih file di kanan ➔</span>
                        </div>
                      )}

                      {/* Dropdown Selector */}
                      {uploadedFiles.length > 0 && (
                        <select
                          value={matchedFileName || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFileMappings((prev) => {
                              const next = { ...prev };
                              if (val) next[c.id] = val;
                              else delete next[c.id];
                              return next;
                            });
                          }}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs text-stone-800 bg-white font-medium focus:outline-none max-w-[180px] shadow-2xs ${
                            matchedFileName
                              ? "border-stone-200 hover:border-emerald-500 focus:border-emerald-500"
                              : "border-amber-400 bg-amber-50/50 font-bold text-amber-900 animate-pulse"
                          }`}
                        >
                          <option value="">-- {matchedFileName ? "Ganti File" : "Pilih File"} --</option>
                          {uploadedFiles.map((f) => (
                            <option key={f.name} value={f.name}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-4 shrink-0">
          <div className="text-xs text-stone-500 font-medium">
            {uploadedFiles.length === 0 ? (
              <span className="text-stone-400 italic">Silakan masukkan file PDF di atas</span>
            ) : matchedCount < candidates.length ? (
              <span className="text-amber-700 font-bold">
                ⚠️ {candidates.length - matchedCount} santri belum terpasang file PDF
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" /> Seluruh santri ({matchedCount}) siap diterbitkan
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmitUpload}
              disabled={isSubmitting || matchedCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunggah File...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Upload & Terbitkan Semua ({matchedCount}/{candidates.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
