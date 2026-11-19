"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Loader2,
  Shirt,
  Save,
  CheckCircle2,
  Ruler,
  Edit,
  Lock,
  ZoomIn,
  X,
  Info,
  Sparkles
} from "lucide-react";
import { canAccessSeragam } from "@/lib/access-control";
import type { StatusProses } from "@/lib/access-control";
import {
  getUniformConfig,
  AKHWAT_MEASUREMENTS,
  IKHWAN_MEASUREMENTS,
  parseCustomSize,
  formatSizeValue
} from "@/config/seragam";

export default function SeragamPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [syncAllSizes, setSyncAllSizes] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  // Form base states
  const [bajuBase, setBajuBase] = useState("");
  const [bajuLd, setBajuLd] = useState("");
  const [bajuPb, setBajuPb] = useState("");

  const [celanaBase, setCelanaBase] = useState("");
  const [celanaLd, setCelanaLd] = useState("");
  const [celanaPb, setCelanaPb] = useState("");

  const [almaBase, setAlmaBase] = useState("");
  const [almaLd, setAlmaLd] = useState("");
  const [almaPb, setAlmaPb] = useState("");

  const [savedData, setSavedData] = useState({
    baju: "",
    celana: "",
    almamater: ""
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isAuthorized, setIsAuthorized] = useState(true);

  const config = getUniformConfig();
  const isPutri = config.isPutri;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get session
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) throw new Error("Failed to fetch session");
      const sessionData = await sessionRes.json();

      const pendaftarId = sessionData.pendaftar_id || sessionData.session?.id;
      if (!pendaftarId) throw new Error("Pendaftar ID not found in session");

      // 2. Fetch status
      const res = await fetch(
        `/api/pendaftar/status?pendaftar_id=${pendaftarId}&t=${Date.now()}`
      );
      if (res.ok) {
        const data = await res.json();
        const isUserAuthorized = canAccessSeragam(
          data.status_proses as StatusProses,
          data.nomor_pendaftaran
        );
        setIsAuthorized(isUserAuthorized);

        if (isUserAuthorized) {
          const bajuRaw = data.ukuran_seragam_baju || "";
          const celanaRaw = data.ukuran_seragam_celana || "";
          const almaRaw = data.ukuran_seragam_almamater || "";

          setSavedData({
            baju: bajuRaw,
            celana: celanaRaw,
            almamater: almaRaw
          });

          // Check draft
          let currentBaju = bajuRaw;
          let currentCelana = celanaRaw;
          let currentAlma = almaRaw;

          if (typeof window !== "undefined") {
            try {
              const draft = localStorage.getItem("spmb_seragam_draft");
              if (draft) {
                const parsed = JSON.parse(draft);
                if (parsed.baju) currentBaju = parsed.baju;
                if (parsed.celana) currentCelana = parsed.celana;
                if (parsed.almamater) currentAlma = parsed.almamater;
              }
            } catch (e) {
              console.warn("Failed to load draft:", e);
            }
          }

          const parsedBaju = parseCustomSize(currentBaju);
          setBajuBase(parsedBaju.baseSize);
          setBajuLd(parsedBaju.ld);
          setBajuPb(parsedBaju.pbOrTb);

          const parsedCelana = parseCustomSize(currentCelana);
          setCelanaBase(parsedCelana.baseSize);
          setCelanaLd(parsedCelana.ld);
          setCelanaPb(parsedCelana.pbOrTb);

          const parsedAlma = parseCustomSize(currentAlma);
          setAlmaBase(parsedAlma.baseSize);
          setAlmaLd(parsedAlma.ld);
          setAlmaPb(parsedAlma.pbOrTb);

          if (bajuRaw && celanaRaw && almaRaw) {
            setIsEditing(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Autosave draft to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isEditing && !loading) {
      const formattedBaju = formatSizeValue(bajuBase, bajuBase === ">XXL", bajuLd, bajuPb, isPutri);
      const formattedCelana = formatSizeValue(celanaBase, celanaBase === ">XXL", celanaLd, celanaPb, isPutri);
      const formattedAlma = formatSizeValue(almaBase, almaBase === ">XXL", almaLd, almaPb, isPutri);
      try {
        localStorage.setItem(
          "spmb_seragam_draft",
          JSON.stringify({
            baju: formattedBaju,
            celana: formattedCelana,
            almamater: formattedAlma
          })
        );
      } catch (e) {
        console.warn("Autosave draft error:", e);
      }
    }
  }, [bajuBase, bajuLd, bajuPb, celanaBase, celanaLd, celanaPb, almaBase, almaLd, almaPb, isEditing, loading, isPutri]);

  // Handle main baju/gamis size change
  const handleBajuChange = (val: string) => {
    setBajuBase(val);
    if (syncAllSizes) {
      setCelanaBase(val);
      setAlmaBase(val);
      if (val !== ">XXL") {
        setBajuLd("");
        setBajuPb("");
        setCelanaLd("");
        setCelanaPb("");
        setAlmaLd("");
        setAlmaPb("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (!bajuBase || !celanaBase || !almaBase) {
        setMessage({
          type: "error",
          text: "Mohon pilih ukuran lengkap (Gamis/Baju, Bawahan, dan Almamater) sebelum menyimpan."
        });
        setSaving(false);
        return;
      }

      if (bajuBase === ">XXL" && (!bajuLd.trim() || !bajuPb.trim())) {
        setMessage({
          type: "error",
          text: `Untuk ukuran >XXL pada ${isPutri ? "Gamis" : "Baju"}, mohon cantumkan Lingkar Dada (LD) dan ${isPutri ? "Panjang Baju/Gamis (PB)" : "Tinggi Baju (TB)"}.`
        });
        setSaving(false);
        return;
      }

      const formattedBaju = formatSizeValue(bajuBase, bajuBase === ">XXL", bajuLd, bajuPb, isPutri);
      const formattedCelana = formatSizeValue(celanaBase, celanaBase === ">XXL", celanaLd, celanaPb, isPutri);
      const formattedAlma = formatSizeValue(almaBase, almaBase === ">XXL", almaLd, almaPb, isPutri);

      const res = await fetch("/api/pendaftar/seragam", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ukuran_seragam_baju: formattedBaju,
          ukuran_seragam_celana: formattedCelana,
          ukuran_seragam_almamater: formattedAlma
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");

      setSavedData({
        baju: formattedBaju,
        celana: formattedCelana,
        almamater: formattedAlma
      });

      setMessage({ type: "success", text: "Ukuran seragam berhasil disimpan!" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("spmb_seragam_draft");
      }
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 md:p-12 min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <p className="text-sm font-semibold text-ink-500">Memuat data ukuran seragam...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-white p-10 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-ink-950 mb-3">Akses Terkunci</h2>
        <p className="text-ink-600 max-w-md mx-auto leading-relaxed">
          Anda belum dapat mengakses halaman ini. Halaman pendataan ukuran seragam hanya terbuka bagi santri yang telah dinyatakan <strong>Diterima</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-ink-100 flex items-start gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary-50/70 rounded-bl-[120px] -z-0 pointer-events-none"></div>
        <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-sm">
          <Shirt className="w-7 h-7" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kategori: {config.genderLabel}</span>
          </div>
          <h1 className="text-2xl font-black text-primary-950 tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm font-medium text-ink-600 mt-1 max-w-2xl leading-relaxed">
            {config.subtitle}
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 md:p-5 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-sm transition-all ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Input / Summary (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          {isEditing ? (
            <div className="bg-white p-6 md:p-7 rounded-3xl shadow-xl border border-ink-100">
              <div className="flex items-center justify-between border-b border-ink-100 pb-4 mb-5">
                <h2 className="text-lg font-black text-ink-950 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-primary-600" />
                  Form Pemilihan Ukuran
                </h2>
              </div>

              {/* Checkbox Sync All Sizes */}
              <div className="mb-5 p-3.5 bg-primary-50/60 rounded-2xl border border-primary-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="syncAllSizes"
                  checked={syncAllSizes}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSyncAllSizes(checked);
                    if (checked && bajuBase) {
                      setCelanaBase(bajuBase);
                      setAlmaBase(bajuBase);
                    }
                  }}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-ink-300 cursor-pointer"
                />
                <label
                  htmlFor="syncAllSizes"
                  className="text-xs font-bold text-primary-950 cursor-pointer select-none"
                >
                  Samakan semua ukuran dengan {isPutri ? "Gamis" : "Baju"} utama
                </label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Baju / Gamis */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-ink-700 uppercase tracking-wider block">
                    {config.baju.label}
                  </label>
                  <select
                    value={bajuBase}
                    onChange={(e) => handleBajuChange(e.target.value)}
                    className="w-full bg-ink-50/70 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-bold text-sm transition-all"
                  >
                    <option value="">{config.baju.placeholder}</option>
                    {config.sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Input khusus bila >XXL */}
                  {bajuBase === ">XXL" && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 mt-2 animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Tuliskan ukuran centimeter (cm) khusus:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-black text-ink-600 block mb-1">
                            Lingkar Dada (LD)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="Contoh: 125"
                              value={bajuLd}
                              onChange={(e) => setBajuLd(e.target.value)}
                              className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-sm font-bold pr-10 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-ink-400">cm</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-ink-600 block mb-1">
                            {isPutri ? "Panjang Gamis (PB)" : "Tinggi Baju (TB)"}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder={isPutri ? "Contoh: 148" : "Contoh: 75"}
                              value={bajuPb}
                              onChange={(e) => setBajuPb(e.target.value)}
                              className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-sm font-bold pr-10 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-ink-400">cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Celana / Rok */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-ink-700 uppercase tracking-wider block">
                    {config.celana.label}
                  </label>
                  <select
                    value={celanaBase}
                    disabled={syncAllSizes}
                    onChange={(e) => setCelanaBase(e.target.value)}
                    className="w-full bg-ink-50/70 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">{config.celana.placeholder}</option>
                    {config.sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Input khusus bila >XXL (hanya jika tidak sync) */}
                  {!syncAllSizes && celanaBase === ">XXL" && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Tuliskan ukuran centimeter (cm) bawahan:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-black text-ink-600 block mb-1">
                            Lingkar Pinggang (LP)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="Contoh: 95"
                              value={celanaLd}
                              onChange={(e) => setCelanaLd(e.target.value)}
                              className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-sm font-bold pr-10 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-ink-400">cm</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-ink-600 block mb-1">
                            Tinggi / Panjang Bawahan
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="Contoh: 102"
                              value={celanaPb}
                              onChange={(e) => setCelanaPb(e.target.value)}
                              className="w-full bg-white border border-amber-200 px-3 py-2 rounded-xl text-sm font-bold pr-10 focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-ink-400">cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Almamater */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-ink-700 uppercase tracking-wider block">
                    {config.almamater.label}
                  </label>
                  <select
                    value={almaBase}
                    disabled={syncAllSizes}
                    onChange={(e) => setAlmaBase(e.target.value)}
                    className="w-full bg-ink-50/70 border border-ink-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">{config.almamater.placeholder}</option>
                    {config.sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 hover:bg-primary-800 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-700/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Menyimpan Data..." : "Simpan Ukuran Seragam"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 md:p-7 rounded-3xl shadow-xl border border-ink-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Data Sudah Tersimpan
                  </span>
                </div>

                <h2 className="text-lg font-black text-ink-950 mb-2">
                  Detail Ukuran Terpilih
                </h2>
                <p className="text-sm font-medium text-ink-500 mb-6 leading-relaxed">
                  Ukuran seragam telah tersimpan di sistem kami. Anda masih dapat memperbaruinya bila terdapat perubahan.
                </p>

                <div className="space-y-3.5">
                  {/* Baju / Gamis */}
                  <div className="flex items-center justify-between p-4 bg-ink-50/80 border border-ink-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-ink-400 uppercase tracking-wider">
                          {config.baju.sublabel}
                        </p>
                        <p className="text-sm font-bold text-ink-800">
                          {isPutri ? "Gamis Utama" : "Baju / Kemeja"}
                        </p>
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 bg-white border border-ink-200 text-primary-950 font-black text-base rounded-xl text-center shadow-xs">
                      {savedData.baju || "-"}
                    </div>
                  </div>

                  {/* Celana / Bawahan */}
                  <div className="flex items-center justify-between p-4 bg-ink-50/80 border border-ink-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                        <Ruler className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-ink-400 uppercase tracking-wider">
                          {config.celana.sublabel}
                        </p>
                        <p className="text-sm font-bold text-ink-800">
                          {isPutri ? "Rok / Bawahan" : "Celana Panjang"}
                        </p>
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 bg-white border border-ink-200 text-primary-950 font-black text-base rounded-xl text-center shadow-xs">
                      {savedData.celana || "-"}
                    </div>
                  </div>

                  {/* Almamater */}
                  <div className="flex items-center justify-between p-4 bg-ink-50/80 border border-ink-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-ink-400 uppercase tracking-wider">
                          {config.almamater.sublabel}
                        </p>
                        <p className="text-sm font-bold text-ink-800">Jas Almamater</p>
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 bg-white border border-ink-200 text-primary-950 font-black text-base rounded-xl text-center shadow-xs">
                      {savedData.almamater || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMessage({ type: "", text: "" });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-primary-600 text-primary-700 hover:bg-primary-50 rounded-2xl font-black text-sm active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Ubah Pilihan Ukuran
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Panduan Ukuran & Gambar Resmi (7 Kolom) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-7 rounded-3xl shadow-xl border border-ink-100 space-y-6">
          <div className="border-b border-ink-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-ink-950 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary-600" />
                {config.chartTitle}
              </h2>
              <p className="text-xs font-medium text-ink-500 mt-0.5">
                {config.chartDescription}
              </p>
            </div>
          </div>

          {/* Banner Gambar Size Chart Resmi */}
          <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 shadow-inner" onClick={() => setShowImageModal(true)}>
            <img
              src={config.chartImageSrc}
              alt={config.chartTitle}
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-ink-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs">
              <ZoomIn className="w-4 h-4" />
              <span>Klik untuk melihat gambar penuh</span>
            </div>
          </div>

          {/* Tabel Detail Pengukuran */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-ink-500 uppercase tracking-wider">
              Tabel Ukuran Lengkap (Satuan Centimeter - cm)
            </h3>

            {isPutri ? (
              <div className="overflow-x-auto rounded-2xl border border-ink-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-primary-50 text-primary-950 border-b border-ink-200 font-black">
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Lingkar Dada (LD)</th>
                      <th className="py-2.5 px-3">Lebar Bahu</th>
                      <th className="py-2.5 px-3">Panjang Lengan</th>
                      <th className="py-2.5 px-3">Panjang Gamis (PB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 font-medium text-ink-700">
                    {AKHWAT_MEASUREMENTS.map((row) => (
                      <tr
                        key={row.size}
                        className={`hover:bg-primary-50/30 transition-colors ${
                          bajuBase === row.size ? "bg-primary-50/60 font-bold text-primary-900" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-black text-primary-950">
                          {row.size}
                        </td>
                        <td className="py-2.5 px-3">{row.ld} cm</td>
                        <td className="py-2.5 px-3">{row.bahu} cm</td>
                        <td className="py-2.5 px-3">{row.lengan} cm</td>
                        <td className="py-2.5 px-3">{row.pb} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-ink-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-primary-50 text-primary-950 border-b border-ink-200 font-black">
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Baju (LD)</th>
                      <th className="py-2.5 px-3">Tinggi Baju (TB)</th>
                      <th className="py-2.5 px-3">Celana (LP)</th>
                      <th className="py-2.5 px-3">Tinggi Celana (TC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 font-medium text-ink-700">
                    {IKHWAN_MEASUREMENTS.map((row) => (
                      <tr
                        key={row.size}
                        className={`hover:bg-primary-50/30 transition-colors ${
                          bajuBase === row.size ? "bg-primary-50/60 font-bold text-primary-900" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-black text-primary-950">
                          {row.size}
                        </td>
                        <td className="py-2.5 px-3">{row.bajuLd} cm</td>
                        <td className="py-2.5 px-3">{row.bajuTb} cm</td>
                        <td className="py-2.5 px-3">{row.celanaLp} cm</td>
                        <td className="py-2.5 px-3">{row.celanaTc} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3.5 bg-ink-50 border border-ink-200 rounded-xl text-xs text-ink-600 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Ukuran Khusus:</strong> Jika ukuran calon santri melebihi ukuran standar XXL, silakan pilih opsi <strong>&gt;XXL (Khusus / Custom)</strong> pada form dan cantumkan ukuran detail Lingkar Dada (LD) serta {isPutri ? "Panjang Gamis (PB)" : "Tinggi Baju & Celana"}.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Zoom Gambar Size Chart */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-4">
              <h3 className="text-base font-black text-ink-950">
                {config.chartTitle}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center">
              <img
                src={config.chartImageSrc}
                alt={config.chartTitle}
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
