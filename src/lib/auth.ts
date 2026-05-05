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

// ─── 4. SESSION MONITORING (UI HELPERS) ───

/**
 * getSessionRemainingDays
 * Menghitung sisa hari sebelum sesi berakhir (asumsi maxAge 7 hari untuk pendaftar).
 */
export const getSessionRemainingDays = async (): Promise<number> => {
  const session = await getCurrentSession();
  if (!session) return 0;
  
  // Jika server tidak mengirim expires_at, kita bisa mengasumsikan dari maxAge
  // Namun lebih baik jika server mengirimkannya. 
  // Untuk saat ini kita kembalikan nilai mock atau hitung jika ada field-nya.
  if (session.expires_at) {
    const expiry = new Date(session.expires_at);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
  
  return 7; // Default fallback
};

/**
 * formatSessionExpiry
 * Menghasilkan teks sisa waktu sesi (misal: "Sisa 5 hari" atau "Sisa 8 jam").
 */
export const formatSessionExpiry = async (): Promise<string> => {
  const session = await getCurrentSession();
  if (!session) return "Sesi berakhir";

  if (session.expires_at) {
    const expiry = new Date(session.expires_at);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Sesi kedaluwarsa";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `Sisa ${diffHours} jam`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Sisa ${diffDays} hari`;
  }

  return "Sesi Aktif";
};

/**
 * isSessionExpiringSoon
 * Menentukan apakah sesi akan berakhir dalam kurang dari 24 jam.
 */
export const isSessionExpiringSoon = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  if (!session || !session.expires_at) return false;

  const expiry = new Date(session.expires_at);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours < 24;
};
