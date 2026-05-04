// TypeScript types untuk database

export type JenisKelamin = "L" | "P";
export type Jenjang = "MTs" | "IL" | "SMA"; // UPDATED: Tambah IL (I'dad Lughowi), MA renamed to SMA
export type Role =
  | "pendaftar"
  | "admin"
  | "admin_super"
  | "admin_berkas"
  | "admin_keuangan"
  | "penguji"
  | "penguji_calsan"
  | "pewawancara_calsan"
  | "pewawancara_cawalsan";

export interface RegisterFormData {
  nik: string;
  nama_lengkap: string;
  no_hp: string;
  jenis_kelamin: JenisKelamin;
  jenjang: Jenjang;
  password: string;
  password_confirm?: string;
}

export interface RegisterResponse {
  user_id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  no_hp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Pendaftar {
  id: string;
  user_id: string;
  tahun_ajaran_id: string;
  nomor_pendaftaran: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: JenisKelamin;
  jenjang: Jenjang;
  nisn?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  golongan_darah?: string;
  anak_ke?: number;
  jumlah_saudara?: number;
  hobi?: string;
  cita_cita?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
  no_hp?: string;
  email?: string;
  asal_sekolah?: string;
  alamat_sekolah?: string;
  npsn?: string;
  tahun_lulus?: number;
  sumber_informasi?: string;
  jumlah_hafalan?: string;
  status_pendaftaran: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// PEMBAYARAN TYPES
// ============================================

export type StatusPembayaran = "pending" | "verified" | "rejected" | "expired";
export type MetodePembayaran = "midtrans" | "manual";

export interface Pembayaran {
  id: string;
  pendaftar_id: string;
  tahun_ajaran_id: string;
  metode_pembayaran: MetodePembayaran;
  jumlah: number;
  midtrans_order_id?: string;
  midtrans_transaction_id?: string;
  midtrans_transaction_status?: string;
  midtrans_payment_type?: string;
  midtrans_response_json?: Record<string, any>;
  bukti_transfer_path?: string;
  bukti_transfer_filename?: string;
  status_pembayaran: StatusPembayaran;
  verified_by?: string;
  verified_at?: string;
  catatan_verifikasi?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TahunAjaran {
  id: string;
  tahun_mulai: number;
  tahun_selesai: number;
  nama: string;
  is_active: boolean;
  tanggal_buka_pendaftaran: string;
  tanggal_tutup_pendaftaran: string;
  biaya_pendaftaran: number;
  link_tes_tertulis?: string;
  deskripsi_tes_tertulis?: string;
  created_at: string;
  updated_at: string;
}

export interface PembayaranWithDetails extends Pembayaran {
  pendaftar?: Pendaftar;
  tahun_ajaran?: TahunAjaran;
}
