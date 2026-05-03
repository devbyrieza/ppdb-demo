"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronDown, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WilayahData {
    id: string;
    name: string;
}

interface AddressValue {
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kode_pos: string;
}

interface WilayahSelectorProps {
    value: AddressValue;
    onChange: (value: AddressValue) => void;
    disabled?: boolean;
}

/* ─────────────────────────────────────────
   Sub-component: WilayahSelect
   Dropdown dengan animasi Framer Motion,
   search filter, dan styling Linear-grade
   — palet Netral/Ink (template-demo)
───────────────────────────────────────── */
interface WilayahSelectProps {
    label: string;
    placeholder: string;
    value: string;
    options: WilayahData[];
    onChange: (val: string) => void;
    disabled?: boolean;
    loading?: boolean;
    required?: boolean;
    isUnlocked: boolean;
    lockedMessage?: string;
    icon?: React.ReactNode;
    stepNumber?: number;
}

function WilayahSelect({
    label,
    placeholder,
    value,
    options,
    onChange,
    disabled = false,
    loading = false,
    required = false,
    isUnlocked,
    lockedMessage,
    icon,
    stepNumber,
}: WilayahSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const isDisabled = disabled || !isUnlocked || loading;
    const selectedLabel = options.find((o) => o.name === value)?.name ?? "";

    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    /* Tutup dropdown kalau klik di luar */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Focus search input saat dropdown terbuka */
    useEffect(() => {
        if (open && searchRef.current && options.length > 8) {
            setTimeout(() => searchRef.current?.focus(), 80);
        }
    }, [open, options.length]);

    const handleSelect = (name: string) => {
        onChange(name);
        setOpen(false);
        setSearch("");
    };

    const handleToggle = () => {
        if (isDisabled) return;
        setOpen((prev) => !prev);
        if (!open) setSearch("");
    };

    const isFilled = !!value;
    const isLocked = !isUnlocked && !disabled;

    return (
        <div className="relative" ref={containerRef}>
            {/* Label */}
            <div className="flex items-center gap-2 mb-2">
                {stepNumber && (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
              inline-flex items-center justify-center w-5 h-5 rounded-full
              text-[10px] font-bold leading-none flex-shrink-0
              transition-colors duration-300
              ${isFilled
                                ? "bg-ink-800 text-white"
                                : "bg-ink-100 text-ink-500"
                            }
            `}
                    >
                        {isFilled ? <Check className="w-2.5 h-2.5" /> : stepNumber}
                    </motion.span>
                )}
                <label
                    className={`
            text-sm font-semibold tracking-tight transition-colors duration-200
            ${isFilled ? "text-ink-800" : "text-ink-700"}
          `}
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-red-500 font-bold">*</span>
                    )}
                </label>
            </div>

            {/* Trigger button */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`
          w-full flex items-center gap-3 px-4 py-3
          rounded-xl border-2 text-left text-sm font-medium
          transition-all duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-ink-500/30 focus-visible:ring-offset-1
          ${isDisabled && !disabled
                        ? "bg-surface-100 border-ink-200 text-ink-300 cursor-not-allowed opacity-60"
                        : isFilled
                            ? "bg-white border-ink-400 text-ink-900 shadow-[var(--shadow-premium-sm)] cursor-pointer"
                            : open
                                ? "bg-white border-ink-600 text-ink-900 shadow-[0_0_0_3px_rgba(0,0,0,0.06)] cursor-pointer"
                                : "bg-white border-ink-200 text-ink-400 hover:border-ink-300 hover:bg-surface-50 cursor-pointer"
                    }
          ${disabled
                        ? "!bg-surface-100 !border-ink-200 !text-ink-300 !cursor-not-allowed !opacity-60"
                        : ""
                    }
        `}
            >
                {/* Icon kiri */}
                <span
                    className={`
            flex-shrink-0 transition-colors duration-200
            ${isFilled ? "text-ink-600" : "text-ink-300"}
          `}
                >
                    {icon ?? <MapPin className="w-4 h-4" />}
                </span>

                {/* Value / placeholder */}
                <span
                    className={`
            flex-1 truncate
            ${isFilled
                            ? "text-ink-900 font-semibold"
                            : "text-ink-400 font-normal"
                        }
          `}
                >
                    {isFilled
                        ? selectedLabel
                        : isLocked
                            ? (lockedMessage ?? placeholder)
                            : placeholder}
                </span>

                {/* Loading / Chevron */}
                <span className="flex-shrink-0 flex items-center gap-1.5">
                    {loading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-500" />
                    )}
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="inline-flex"
                    >
                        <ChevronDown
                            className={`
                w-4 h-4 transition-colors
                ${isFilled ? "text-ink-400" : "text-ink-300"}
              `}
                        />
                    </motion.span>
                </span>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="
              absolute z-50 top-[calc(100%+6px)] left-0 right-0
              bg-white border border-ink-200 rounded-xl
              shadow-[var(--shadow-premium-lg)]
              overflow-hidden
            "
                        role="listbox"
                    >
                        {/* Search — hanya tampil jika opsi banyak */}
                        {options.length > 8 && (
                            <div className="p-2 border-b border-ink-100">
                                <div className="relative">
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={`Cari ${label.toLowerCase()}...`}
                                        className="
                      w-full pl-8 pr-3 py-2 text-sm rounded-lg
                      bg-surface-50 border border-ink-200
                      text-ink-900 placeholder:text-ink-400
                      focus:outline-none focus:border-ink-400
                      focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]
                      transition-all duration-150 font-medium
                    "
                                    />
                                    <svg
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Options list */}
                        <ul className="max-h-52 overflow-y-auto overscroll-contain py-1.5">
                            {filtered.length === 0 ? (
                                <li className="px-4 py-6 text-center">
                                    <span className="text-sm text-ink-400 font-medium">
                                        Tidak ditemukan
                                    </span>
                                </li>
                            ) : (
                                filtered.map((opt) => {
                                    const isSelected = opt.name === value;
                                    return (
                                        <li key={opt.id}>
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() => handleSelect(opt.name)}
                                                className={`
                          w-full flex items-center gap-3 px-4 py-2.5
                          text-sm text-left transition-colors duration-100
                          ${isSelected
                                                        ? "bg-ink-50 text-ink-900 font-semibold"
                                                        : "text-ink-700 hover:bg-surface-50 hover:text-ink-900 font-medium"
                                                    }
                        `}
                                            >
                                                {isSelected && (
                                                    <Check className="w-3.5 h-3.5 text-ink-700 flex-shrink-0" />
                                                )}
                                                <span
                                                    className={`${isSelected ? "" : "ml-[1.375rem]"} truncate`}
                                                >
                                                    {opt.name}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        {/* Footer count */}
                        {options.length > 0 && (
                            <div className="px-4 py-2 border-t border-ink-100 bg-surface-50/60">
                                <span className="text-[11px] text-ink-400 font-medium tracking-wide">
                                    {filtered.length} dari {options.length} wilayah
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─────────────────────────────────────────
   Main Component: WilayahSelector
   — template-demo: Netral / Brand-Agnostic
───────────────────────────────────────── */
export default function WilayahSelector({
    value,
    onChange,
    disabled = false,
}: WilayahSelectorProps) {
    const [provinces, setProvinces] = useState<WilayahData[]>([]);
    const [regencies, setRegencies] = useState<WilayahData[]>([]);
    const [districts, setDistricts] = useState<WilayahData[]>([]);
    const [villages, setVillages] = useState<WilayahData[]>([]);

    const [loading, setLoading] = useState({
        provinsi: false,
        kabupaten: false,
        kecamatan: false,
        kelurahan: false,
    });

    /* ── Fetch Provinces on mount ── */
    useEffect(() => {
        const run = async () => {
            try {
                setLoading((prev) => ({ ...prev, provinsi: true }));
                const res = await fetch("/api/wilayah/provinsi");
                const data = await res.json();
                if (data.success) setProvinces(data.data);
            } catch (err) {
                console.error("Failed to load provinces", err);
            } finally {
                setLoading((prev) => ({ ...prev, provinsi: false }));
            }
        };
        run();
    }, []);

    /* ── Fetch Regencies when Province changes ── */
    useEffect(() => {
        if (!value.provinsi) { setRegencies([]); return; }
        const prov = provinces.find((p) => p.name === value.provinsi);
        if (!prov) return;
        const run = async () => {
            try {
                setLoading((prev) => ({ ...prev, kabupaten: true }));
                const res = await fetch(`/api/wilayah/kabupaten?provinsi_id=${prov.id}`);
                const data = await res.json();
                if (data.success) setRegencies(data.data);
            } catch (err) {
                console.error("Failed to load regencies", err);
            } finally {
                setLoading((prev) => ({ ...prev, kabupaten: false }));
            }
        };
        run();
    }, [value.provinsi, provinces]);

    /* ── Fetch Districts when Regency changes ── */
    useEffect(() => {
        if (!value.kabupaten) { setDistricts([]); return; }
        const reg = regencies.find((r) => r.name === value.kabupaten);
        if (!reg) return;
        const run = async () => {
            try {
                setLoading((prev) => ({ ...prev, kecamatan: true }));
                const res = await fetch(`/api/wilayah/kecamatan?kabupaten_id=${reg.id}`);
                const data = await res.json();
                if (data.success) setDistricts(data.data);
            } catch (err) {
                console.error("Failed to load districts", err);
            } finally {
                setLoading((prev) => ({ ...prev, kecamatan: false }));
            }
        };
        run();
    }, [value.kabupaten, regencies]);

    /* ── Fetch Villages when District changes ── */
    useEffect(() => {
        if (!value.kecamatan) { setVillages([]); return; }
        const dist = districts.find((d) => d.name === value.kecamatan);
        if (!dist) return;
        const run = async () => {
            try {
                setLoading((prev) => ({ ...prev, kelurahan: true }));
                const res = await fetch(`/api/wilayah/kelurahan?kecamatan_id=${dist.id}`);
                const data = await res.json();
                if (data.success) setVillages(data.data);
            } catch (err) {
                console.error("Failed to load villages", err);
            } finally {
                setLoading((prev) => ({ ...prev, kelurahan: false }));
            }
        };
        run();
    }, [value.kecamatan, districts]);

    /* ── handleChange dengan cascade reset ── */
    const handleChange = (field: keyof AddressValue, val: string) => {
        const next = { ...value, [field]: val };
        if (field === "provinsi") {
            next.kabupaten = "";
            next.kecamatan = "";
            next.kelurahan = "";
            next.kode_pos = "";
        } else if (field === "kabupaten") {
            next.kecamatan = "";
            next.kelurahan = "";
            next.kode_pos = "";
        } else if (field === "kecamatan") {
            next.kelurahan = "";
            next.kode_pos = "";
        }
        onChange(next);
    };

    /* ── Progress indicator ── */
    const filledCount = [
        value.provinsi,
        value.kabupaten,
        value.kecamatan,
        value.kelurahan,
        value.kode_pos,
    ].filter(Boolean).length;

    const progressPct = (filledCount / 5) * 100;

    return (
        <div className="space-y-5">

            {/* ── Progress bar — netral ink, Linear-style ── */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-ink-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-ink-400 to-ink-800"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
                <span className="text-xs font-semibold text-ink-500 tabular-nums min-w-[2.5rem] text-right">
                    {filledCount}/5
                </span>
            </div>

            {/* ── Grid 2 kolom ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* PROVINSI */}
                <WilayahSelect
                    label="Provinsi"
                    placeholder="Pilih provinsi"
                    value={value.provinsi}
                    options={provinces}
                    onChange={(v) => handleChange("provinsi", v)}
                    disabled={disabled}
                    loading={loading.provinsi}
                    required
                    isUnlocked={!loading.provinsi}
                    lockedMessage="Memuat data..."
                    stepNumber={1}
                    icon={<MapPin className="w-4 h-4" />}
                />

                {/* KABUPATEN / KOTA */}
                <WilayahSelect
                    label="Kabupaten / Kota"
                    placeholder="Pilih kabupaten/kota"
                    value={value.kabupaten}
                    options={regencies}
                    onChange={(v) => handleChange("kabupaten", v)}
                    disabled={disabled}
                    loading={loading.kabupaten}
                    required
                    isUnlocked={!!value.provinsi}
                    lockedMessage="Pilih provinsi dulu"
                    stepNumber={2}
                    icon={<MapPin className="w-4 h-4" />}
                />

                {/* KECAMATAN */}
                <WilayahSelect
                    label="Kecamatan"
                    placeholder="Pilih kecamatan"
                    value={value.kecamatan}
                    options={districts}
                    onChange={(v) => handleChange("kecamatan", v)}
                    disabled={disabled}
                    loading={loading.kecamatan}
                    required
                    isUnlocked={!!value.kabupaten}
                    lockedMessage="Pilih kabupaten dulu"
                    stepNumber={3}
                    icon={<MapPin className="w-4 h-4" />}
                />

                {/* KELURAHAN / DESA */}
                <WilayahSelect
                    label="Kelurahan / Desa"
                    placeholder="Pilih kelurahan/desa"
                    value={value.kelurahan}
                    options={villages}
                    onChange={(v) => handleChange("kelurahan", v)}
                    disabled={disabled}
                    loading={loading.kelurahan}
                    required
                    isUnlocked={!!value.kecamatan}
                    lockedMessage="Pilih kecamatan dulu"
                    stepNumber={4}
                    icon={<MapPin className="w-4 h-4" />}
                />

                {/* KODE POS */}
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`
                inline-flex items-center justify-center w-5 h-5 rounded-full
                text-[10px] font-bold leading-none flex-shrink-0
                transition-colors duration-300
                ${value.kode_pos
                                    ? "bg-ink-800 text-white"
                                    : "bg-ink-100 text-ink-500"
                                }
              `}
                        >
                            {value.kode_pos ? <Check className="w-2.5 h-2.5" /> : 5}
                        </span>
                        <label
                            htmlFor="kode_pos"
                            className={`
                text-sm font-semibold tracking-tight transition-colors duration-200
                ${value.kode_pos ? "text-ink-800" : "text-ink-700"}
              `}
                        >
                            Kode Pos <span className="text-red-500 font-bold">*</span>
                        </label>
                    </div>

                    <div className="relative">
                        {/* Icon amplop */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                                className={`
                  w-4 h-4 transition-colors duration-200
                  ${value.kode_pos ? "text-ink-600" : "text-ink-300"}
                `}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <input
                            id="kode_pos"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="kode_pos"
                            value={value.kode_pos}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "").slice(0, 5);
                                handleChange("kode_pos", raw);
                            }}
                            placeholder="Contoh: 10110"
                            maxLength={5}
                            disabled={disabled}
                            className={`
                w-full pl-11 pr-4 py-3
                rounded-xl border-2 text-sm font-medium
                transition-all duration-200 outline-none
                placeholder:text-ink-400 text-ink-900
                focus-visible:ring-2 focus-visible:ring-ink-500/30 focus-visible:ring-offset-1
                ${disabled
                                    ? "bg-surface-100 border-ink-200 text-ink-300 cursor-not-allowed opacity-60"
                                    : value.kode_pos
                                        ? "bg-white border-ink-400 shadow-[var(--shadow-premium-sm)]"
                                        : "bg-white border-ink-200 hover:border-ink-300 hover:bg-surface-50 focus:border-ink-600 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
                                }
              `}
                        />

                        {/* Live length indicator */}
                        {value.kode_pos && (
                            <span
                                className={`
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-xs font-bold tabular-nums
                  ${value.kode_pos.length === 5 ? "text-ink-700" : "text-ink-400"}
                `}
                            >
                                {value.kode_pos.length}/5
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Completion banner — netral, clean ── */}
            <AnimatePresence>
                {filledCount === 5 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="
              flex items-center gap-3 px-4 py-3
              bg-surface-50 border border-ink-200
              rounded-xl text-sm
            "
                    >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                        </span>
                        <div>
                            <p className="font-semibold text-ink-900 leading-tight">
                                Alamat lengkap tersimpan
                            </p>
                            <p className="text-xs text-ink-500 mt-0.5 font-medium">
                                {value.kelurahan}, {value.kecamatan}, {value.kabupaten}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}