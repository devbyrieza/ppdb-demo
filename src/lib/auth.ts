/**
 * ─── AUTHENTICATION & VALIDATION SYSTEM ───
 */

export const validateNIK = (nik: string) => {
  const clean = nik.replace(/\s/g, "");
  if (clean.length !== 16) return { valid: false, message: "NIK must be 16 digits" };
  return { valid: true, message: "" };
};

export const normalizeNoHP = (no_hp: string): string => {
  const cleanHP = no_hp.replace(/[\s\-\(\)]/g, "");
  if (cleanHP.startsWith("08")) return "62" + cleanHP.substring(1);
  return cleanHP;
};

export const getCurrentSession = async () => {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    const data = await res.json();
    return data.session || null;
  } catch (e) { return null; }
};

export const logoutUser = async () => {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    return { success: res.ok };
  } catch (e) { return { success: false }; }
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};
