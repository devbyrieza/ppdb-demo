import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseInt(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
}

/**
 * Expands technical abbreviations like Santri and Orang Tua into full professional terms.
 * Used for user-facing displays (Dashboard Pendaftar, kartu seleksi, etc.)
 */
export function expandExamTitle(title: string | null): string {
  if (!title) return "Seleksi";

  let expanded = title;

  // Expand Santri
  expanded = expanded.replace(/calsan/gi, "Calon Santri");

  // Expand Orang Tua
  expanded = expanded.replace(/cawalsan/gi, "Calon Orangtua/Wali Santri");

  // Clean up potential double "Calon" or other artifacts
  expanded = expanded.replace(/Calon Santri Santri/gi, "Calon Santri");

  return expanded;
}
