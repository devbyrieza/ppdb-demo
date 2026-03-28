// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH HELPER - V4.0 (Custom Cookie-based Auth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path: src/lib/auth.ts
// Migrated from Supabase to custom cookie-based auth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ===================================
// EMAIL HELPER (STANDARDIZED)
// ===================================

export const generateAuthEmail = (nik: string): string => {
  return `${nik}@pendaftar.local`;
};

// ===================================
// VALIDATION HELPERS
// ===================================

export const validateNIK = (
  nik: string
): { valid: boolean; message: string } => {
  const cleanNIK = nik.replace(/\s/g, "");

  if (cleanNIK.length === 0) {
    return { valid: false, message: "NIK tidak boleh kosong" };
  }

  if (cleanNIK.length !== 16) {
    return { valid: false, message: "NIK harus 16 digit" };
  }

  if (!/^\d+$/.test(cleanNIK)) {
    return { valid: false, message: "NIK hanya boleh angka" };
  }

  return { valid: true, message: "" };
};

export const validateNoHP = (
  no_hp: string
): { valid: boolean; message: string } => {
  const cleanHP = no_hp.replace(/[\s\-\(\)]/g, "");

  if (cleanHP.length === 0) {
    return { valid: false, message: "Nomor HP tidak boleh kosong" };
  }

  if (!/^(08|628|\+628)/.test(cleanHP)) {
    return {
      valid: false,
      message: "Nomor HP harus diawali 08, 628, atau +628",
    };
  }

  const digitOnly = cleanHP.replace(/\+/g, "");
  if (digitOnly.length < 10 || digitOnly.length > 15) {
    return { valid: false, message: "Nomor HP harus 10-15 digit" };
  }

  return { valid: true, message: "" };
};

export const normalizeNoHP = (no_hp: string): string => {
  const cleanHP = no_hp.replace(/[\s\-\(\)]/g, "");

  if (cleanHP.startsWith("08")) {
    return "6" + cleanHP;
  }

  if (cleanHP.startsWith("+628")) {
    return cleanHP.substring(1);
  }

  return cleanHP;
};

export const validatePassword = (
  password: string
): { valid: boolean; message: string } => {
  if (password.length === 0) {
    return { valid: false, message: "Password tidak boleh kosong" };
  }

  if (password.length < 8) {
    return { valid: false, message: "Password minimal 8 karakter" };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password harus mengandung minimal 1 angka",
    };
  }

  return { valid: true, message: "" };
};

export const validateNama = (
  nama: string
): { valid: boolean; message: string } => {
  if (nama.trim().length === 0) {
    return { valid: false, message: "Nama tidak boleh kosong" };
  }

  if (nama.trim().length < 3) {
    return { valid: false, message: "Nama minimal 3 karakter" };
  }

  if (/\d/.test(nama)) {
    return { valid: false, message: "Nama tidak boleh mengandung angka" };
  }

  return { valid: true, message: "" };
};

// ===================================
// SESSION HELPERS (Cookie-based)
// ===================================

/**
 * Session data returned from /api/auth/session
 */
export interface SessionData {
  id: string;
  role: string;
  nama?: string;
  expires_at?: string;
}

/**
 * Fetch current session from server API
 * Uses httpOnly cookie (app_session) - must go through API route
 */
export const getCurrentSession = async (): Promise<SessionData | null> => {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session || null;
  } catch (error) {
    return null;
  }
};

/**
 * Logout user by clearing the app_session cookie via API
 */
export const logoutUser = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || "Gagal logout" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Terjadi kesalahan" };
  }
};

/**
 * Get session remaining time in seconds
 * Reads expires_at from session data
 */
export const getSessionRemainingTime = async (): Promise<number> => {
  try {
    const session = await getCurrentSession();

    if (!session || !session.expires_at) {
      return 0;
    }

    const expiresAt = new Date(session.expires_at).getTime();
    const now = Date.now();
    const remainingMs = expiresAt - now;

    return Math.max(0, Math.floor(remainingMs / 1000));
  } catch (error) {
    return 0;
  }
};

/**
 * Get session remaining time in days
 */
export const getSessionRemainingDays = async (): Promise<number> => {
  try {
    const remainingSeconds = await getSessionRemainingTime();
    const remainingDays = Math.floor(remainingSeconds / (24 * 60 * 60));
    return Math.max(0, remainingDays);
  } catch (error) {
    return 0;
  }
};

/**
 * Check if session will expire soon (< 1 day)
 */
export const isSessionExpiringSoon = async (): Promise<boolean> => {
  try {
    const remainingDays = await getSessionRemainingDays();
    return remainingDays < 1;
  } catch (error) {
    return false;
  }
};

/**
 * Format session expiry time
 * Returns: "Sisa 5 hari" atau "Sisa 2 jam" atau "Sisa 30 menit"
 */
export const formatSessionExpiry = async (): Promise<string> => {
  try {
    const remainingSeconds = await getSessionRemainingTime();

    if (remainingSeconds <= 0) {
      return "Session expired";
    }

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

    if (days > 0) {
      return `Sisa ${days} hari`;
    } else if (hours > 0) {
      return `Sisa ${hours} jam`;
    } else if (minutes > 0) {
      return `Sisa ${minutes} menit`;
    } else {
      return "Akan logout dalam 1 menit";
    }
  } catch (error) {
    return "Unknown";
  }
};

// ===================================
// FORMAT HELPERS
// ===================================

export const formatNIKDisplay = (nik: string): string => {
  const clean = nik.replace(/\s/g, "");
  return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
};

export const formatNoHPDisplay = (no_hp: string): string => {
  const clean = no_hp.replace(/[\s\-\(\)]/g, "");

  let displayHP = clean;
  if (clean.startsWith("628")) {
    displayHP = "0" + clean.substring(2);
  } else if (clean.startsWith("+628")) {
    displayHP = "0" + clean.substring(3);
  }

  return displayHP.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
