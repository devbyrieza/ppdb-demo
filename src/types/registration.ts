// ===================================
// REGISTRATION TYPES
// ===================================

export interface RegistrationFormData {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: "MTs" | "IL" | "";
}

export interface OTPVerificationData {
  no_hp: string;
  otp_code: string;
}

export interface RegistrationCredentials {
  nomor_pendaftaran: string;
  password: string;
  nama_lengkap: string;
  jenjang: string;
}

// ===================================
// API RESPONSE TYPES
// ===================================

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  phone?: string;
  expires_in?: number;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: RegistrationFormData;
  otp_id?: string;
}

export interface CompleteRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: RegistrationCredentials;
}

// ===================================
// COMPONENT STATE TYPES
// ===================================

export type RegistrationStep = "form" | "otp" | "success";

export interface RegistrationState {
  step: RegistrationStep;
  formData: RegistrationFormData;
  otpId: string | null;
  credentials: RegistrationCredentials | null;
  isLoading: boolean;
  error: string | null;
}

export interface OTPState {
  code: string[];
  error: string;
  isVerifying: boolean;
  countdown: number;
  canResend: boolean;
  attempts: number;
}

// ===================================
// FIELD ERROR TYPES
// ===================================

export type FieldErrors = Partial<Record<keyof RegistrationFormData, string>>;

// ===================================
// JENJANG OPTIONS
// ===================================

export const JENJANG_OPTIONS = [
  { value: "MTs", label: "MTs", description: "Fondasi Kokoh" },
  { value: "IL", label: "I'dad Lughowi", description: "Setara SMA (4 Tahun)" },
] as const;

export type JenjangValue = (typeof JENJANG_OPTIONS)[number]["value"];

// ===================================
// JENIS KELAMIN OPTIONS
// ===================================

export const JENIS_KELAMIN_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
] as const;

export type JenisKelaminValue = (typeof JENIS_KELAMIN_OPTIONS)[number]["value"];
