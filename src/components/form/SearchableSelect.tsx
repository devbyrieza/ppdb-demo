"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, X } from "lucide-react";

interface SearchableSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    optionsUrl?: string;
    options?: string[];
}

export default function SearchableSelect({
    label,
    value,
    onChange,
    placeholder = "Pilih...",
    required = false,
    disabled = false,
    optionsUrl,
    options: initialOptions = [],
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<string[]>(initialOptions);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (optionsUrl) {
            const fetchOptions = async () => {
                try {
                    setLoading(true);
                    const res = await fetch(optionsUrl);
                    const json = await res.json();
                    if (json.success) {
                        setOptions(json.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch options", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchOptions();
        }
    }, [optionsUrl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50); // Limit to 50 for performance

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="block text-sm font-bold text-ink-700 ml-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 text-left ${disabled
                            ? "bg-surface-100 border-ink-100 text-ink-400 cursor-not-allowed"
                            : isOpen
                                ? "bg-white border-teal-500 shadow-teal-glow ring-2 ring-teal-500/10"
                                : "bg-surface-50 border-white/50 hover:bg-white hover:border-teal-200"
                        }`}
                >
                    <span className={`truncate ${!value ? "text-ink-300" : "text-ink-900 font-medium"}`}>
                        {value || placeholder}
                    </span>
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
                    ) : (
                        <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    )}
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-teal-100 shadow-clay-lg animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                        <div className="p-3 border-b border-ink-50 bg-surface-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari wilayah..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-teal-100 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${value === opt
                                                ? "bg-teal-50 text-teal-700 font-bold"
                                                : "text-ink-600 hover:bg-surface-100 hover:text-teal-600"
                                            }`}
                                    >
                                        <span>{opt}</span>
                                        {value === opt && <Check className="w-4 h-4" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-ink-400 italic">Tidak ditemukan wilayah "{search}"</p>
                                </div>
                            )}
                        </div>

                        {options.length > 50 && !search && (
                            <div className="p-2 border-t border-ink-50 bg-surface-50/50">
                                <p className="text-[10px] text-center text-ink-400 font-medium">Ketik untuk mencari lebih banyak wilayah</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
