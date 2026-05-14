"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Fetch options from URL ── */
  useEffect(() => {
    if (!optionsUrl) return;
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const res = await fetch(optionsUrl);
        const json = await res.json();
        if (json.success) setOptions(json.data);
      } catch (err) {
        console.error("Failed to fetch options", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [optionsUrl]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Close on Escape ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  /* ── Auto-focus search when opened ── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) setSearch("");
      return !prev;
    });
  }, [disabled]);

  const handleSelect = useCallback(
    (opt: string) => {
      onChange(opt);
      setIsOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const filteredOptions = options
    .filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1] as any,
      },
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.98,
      filter: "blur(2px)",
      transition: {
        duration: 0.16,
        ease: [0.4, 0, 1, 1] as any,
      },
    },
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* ── Label ── */}
      <label className="flex items-center gap-1 text-sm font-semibold text-[var(--color-ink-700)] tracking-[-0.01em]">
        {label}
        {required && (
          <span
            className="text-[var(--color-primary-600)] font-bold"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {/* ── Trigger Button ── */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`${label}${value ? `: ${value}` : ""}`}
          className={[
            "w-full flex items-center justify-between gap-3",
            "px-4 py-3 rounded-[var(--radius-md)]",
            "text-left text-[0.9375rem] font-medium",
            "border-[1.5px] outline-none",
            "transition-all duration-[var(--duration-base)] [transition-timing-function:var(--ease-smooth)]",
            "min-h-[48px]",
            disabled
              ? "bg-[var(--color-surface-100)] border-[var(--color-ink-100)] text-[var(--color-ink-300)] cursor-not-allowed"
              : isOpen
                ? "bg-[var(--color-white)] border-[var(--color-primary-600)] shadow-[0_0_0_3px_rgba(74,102,57,0.10),var(--shadow-xs)] text-[var(--color-ink-900)]"
                : value
                  ? "bg-[var(--color-white)] border-[var(--color-primary-200)] hover:border-[var(--color-primary-400)] shadow-[var(--shadow-xs)] text-[var(--color-ink-900)]"
                  : "bg-[var(--color-white)] border-[var(--color-primary-100)] hover:border-[var(--color-primary-300)] shadow-[var(--shadow-xs)] text-[var(--color-ink-400)]",
          ].join(" ")}
        >
          {/* Selected value or placeholder */}
          <span className="truncate flex-1">{value || placeholder}</span>

          {/* Right icon */}
          <span className="shrink-0 flex items-center">
            {loading ? (
              <Loader2
                className="w-4 h-4 animate-spin text-[var(--color-primary-600)]"
                aria-label="Memuat pilihan..."
              />
            ) : (
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-colors duration-150 ${
                    isOpen
                      ? "text-[var(--color-primary-600)]"
                      : "text-[var(--color-ink-300)]"
                  }`}
                />
              </motion.span>
            )}
          </span>
        </button>

        {/* ── Dropdown Panel ── */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              role="listbox"
              aria-label={label}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute z-50 w-full mt-2 overflow-hidden"
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-xl)",
                border: "1.5px solid var(--color-primary-100)",
                boxShadow: "var(--shadow-premium-md)",
              }}
            >
              {/* ── Search Bar ── */}
              <div
                className="p-3"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-white) 100%)",
                  borderBottom: "1px solid var(--color-primary-100)",
                }}
              >
                <div className="relative">
                  {/* Search icon */}
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--color-ink-300)" }}
                  />

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-9 pr-9 py-2.5 text-sm font-medium outline-none rounded-[var(--radius-md)] transition-all duration-150"
                    style={{
                      background: "var(--color-white)",
                      border: "1.5px solid var(--color-primary-100)",
                      color: "var(--color-ink-900)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-500)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(74,102,57,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-100)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />

                  {/* Clear search */}
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => {
                          setSearch("");
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Hapus pencarian"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-150"
                        style={{
                          color: "var(--color-ink-400)",
                          background: "var(--color-ink-100)",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "var(--color-primary-100)";
                          el.style.color = "var(--color-primary-700)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "var(--color-ink-100)";
                          el.style.color = "var(--color-ink-400)";
                        }}
                      >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Result count */}
                {search && (
                  <p
                    className="text-[11px] font-medium mt-2 px-1"
                    style={{ color: "var(--color-ink-400)" }}
                  >
                    {filteredOptions.length > 0
                      ? `${filteredOptions.length} hasil ditemukan`
                      : "Tidak ditemukan"}
                  </p>
                )}
              </div>

              {/* ── Options List ── */}
              <div
                ref={listRef}
                className="overflow-y-auto p-1.5"
                style={{ maxHeight: "15rem" }}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const isSelected = value === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(opt)}
                        className={[
                          "w-full flex items-center justify-between gap-3",
                          "px-3.5 py-2.5 rounded-[var(--radius-md)]",
                          "text-sm text-left font-medium",
                          "transition-all duration-[var(--duration-fast)]",
                          "[transition-timing-function:var(--ease-smooth)]",
                          isSelected
                            ? "bg-[var(--color-primary-50)] text-[var(--color-primary-800)]"
                            : "text-[var(--color-ink-700)] hover:bg-[var(--color-warm-50)] hover:text-[var(--color-primary-700)]",
                        ].join(" ")}
                      >
                        <span className="truncate flex-1">{opt}</span>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{
                                duration: 0.18,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                background: "var(--color-primary-100)",
                                color: "var(--color-primary-700)",
                              }}
                            >
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })
                ) : (
                  /* ── Empty State ── */
                  <div className="px-4 py-8 text-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: "var(--color-primary-50)",
                        color: "var(--color-primary-300)",
                      }}
                    >
                      <Search className="w-4 h-4" />
                    </div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: "var(--color-ink-600)" }}
                    >
                      Tidak ditemukan
                    </p>
                    {search && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-ink-400)" }}
                      >
                        Coba kata kunci lain untuk{" "}
                        <span
                          className="font-semibold"
                          style={{
                            color: "var(--color-primary-600)",
                          }}
                        >
                          &ldquo;{search}&rdquo;
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Footer hint — shown when list is truncated ── */}
              {options.length > 50 && !search && (
                <div
                  className="px-4 py-2.5 text-center"
                  style={{
                    borderTop: "1px solid var(--color-primary-50)",
                    background: "var(--color-warm-50)",
                  }}
                >
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: "var(--color-ink-400)" }}
                  >
                    Menampilkan 50 dari {options.length.toLocaleString("id-ID")}{" "}
                    pilihan &mdash; ketik untuk mempersempit
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
