/**
 * ─── ACCESS CONTROL SYSTEM ───
 * File ini adalah jantung dari logika alur pendaftaran (State Machine) 
 * dan sistem keamanan hak akses (Role-Based Access Control / RBAC).
 */

// ─── 1. STATUS PENDAFTARAN (STATE MACHINE) ───

export type StatusProses =
  | "draft"
  | "registered"
  | "payment_verification"
  | "verified"
  | "payment_rejected"
  | "rejected"
  | "scheduled"
  | "accepted"
  | "awaiting_payment"
  | "paid"
  | "data_completed"
  | "docs_uploaded"
  | "docs_verified"
  | "selection"
  | "tested"
  | "announced"
  | "enrolled"
  | "enrolled_full"
  | "pindah_keluar";

export const STATUS_ORDER: StatusProses[] = [
  "draft",
  "registered",
  "awaiting_payment",
  "payment_verification",
  "payment_rejected",
  "verified",
  "paid",
  "data_completed",
  "docs_uploaded",
  "docs_verified",
  "selection",
  "scheduled",
  "tested",
  "announced",
  "rejected",
  "accepted",
  "enrolled",
  "enrolled_full",
  "pindah_keluar",
];

export function getStatusIndex(status: StatusProses | string): number {
  if (!status) return 0;
  const s = status.toLowerCase() as StatusProses;
  const index = STATUS_ORDER.indexOf(s);
  return index >= 0 ? index : 0;
}

export function hasReachedStatus(currentStatus: StatusProses, minimumStatus: StatusProses): boolean {
  return getStatusIndex(currentStatus) >= getStatusIndex(minimumStatus);
}

// ─── 2. SISTEM TABS (NAVIGATION CONTROL) ───

export type TabName =
  | "data-pribadi"
  | "pembayaran-pendaftaran"
  | "status-pembayaran"
  | "kelengkapan-berkas"
  | "upload-berkas"
  | "download-berkas"
  | "undangan-seleksi"
  | "pengumuman"
  | "daftar-ulang"
  | "ukuran-seragam"
  | "profil";

export const STEP_REQUIREMENTS: Record<TabName, { minimumStatus: StatusProses | null; label: string; description: string; }> = {
  "data-pribadi": { minimumStatus: null, label: "Data Pribadi", description: "Lihat data pendaftaran Anda" },
  "pembayaran-pendaftaran": { minimumStatus: null, label: "Pembayaran", description: "Lakukan pembayaran pendaftaran" },
  "status-pembayaran": { minimumStatus: null, label: "Status Bayar", description: "Cek status pembayaran" },
  profil: { minimumStatus: null, label: "Profil", description: "Kelola profil Anda" },
  "kelengkapan-berkas": { minimumStatus: "verified", label: "Isi Data Lengkap", description: "Menunggu verifikasi keuangan" },
  "upload-berkas": { minimumStatus: "data_completed", label: "Upload Berkas", description: "Isi data terlebih dahulu" },
  "download-berkas": { minimumStatus: "docs_uploaded", label: "Download Berkas", description: "Unggah berkas terlebih dahulu" },
  "undangan-seleksi": { minimumStatus: "docs_verified", label: "Jadwal Seleksi", description: "Menunggu verifikasi dokumen" },
  pengumuman: { minimumStatus: "announced", label: "Pengumuman", description: "Selesaikan semua tahapan seleksi terlebih dahulu" },
  "daftar-ulang": { minimumStatus: "accepted", label: "Daftar Ulang", description: "Hanya tersedia bagi pendaftar yang diterima" },
  "ukuran-seragam": { minimumStatus: "enrolled", label: "Ukuran Seragam", description: "Hanya tersedia bagi pendaftar yang telah melakukan daftar ulang" },
};

export function canAccessTab(tabName: TabName, statusProses: StatusProses): boolean {
  const requirement = STEP_REQUIREMENTS[tabName];
  if (!requirement || !requirement.minimumStatus) return true;
  return hasReachedStatus(statusProses, requirement.minimumStatus);
}

// ─── 3. GUIDED ACTION LOGIC ───

export function getNextStep(
  currentStatus: StatusProses,
  tipePendaftaran?: string,
) {
  if (tipePendaftaran === "PINDAHAN") {
    const nextStepsPindahan: Record<string, { status: StatusProses; action: string; href: string }> = {
      draft: { status: "payment_verification", action: "Bayar Sekarang", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
      registered: { status: "payment_verification", action: "Bayar Sekarang", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
      awaiting_payment: { status: "payment_verification", action: "Unggah Bukti", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
      payment_verification: { status: "verified", action: "Menunggu Verifikasi", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
      verified: { status: "data_completed", action: "Isi Data Pendaftaran", href: "/dashboard/pendaftar/isi-data-lengkap" },
      paid: { status: "data_completed", action: "Isi Data Pendaftaran", href: "/dashboard/pendaftar/isi-data-lengkap" },
      data_completed: { status: "docs_uploaded", action: "Unggah Berkas", href: "/dashboard/pendaftar/upload-berkas" },
      docs_uploaded: { status: "docs_verified", action: "Menunggu Review Admin", href: "/dashboard/pendaftar/upload-berkas" },
      docs_verified: { status: "announced", action: "Tunggu Pengumuman Kelulusan", href: "/dashboard/pendaftar/pengumuman" },
      selection: { status: "announced", action: "Tunggu Pengumuman Kelulusan", href: "/dashboard/pendaftar/pengumuman" },
      scheduled: { status: "announced", action: "Tunggu Pengumuman Kelulusan", href: "/dashboard/pendaftar/pengumuman" },
      tested: { status: "announced", action: "Tunggu Pengumuman Kelulusan", href: "/dashboard/pendaftar/pengumuman" },
      announced: { status: "accepted", action: "Cek Hasil", href: "/dashboard/pendaftar/pengumuman" },
      accepted: { status: "enrolled", action: "Daftar Ulang Sekarang", href: "/dashboard/pendaftar/daftar-ulang" },
    };
    return nextStepsPindahan[currentStatus] || null;
  }

  const nextSteps: Record<string, { status: StatusProses; action: string; href: string }> = {
    draft: { status: "payment_verification", action: "Bayar Sekarang", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
    registered: { status: "payment_verification", action: "Bayar Sekarang", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
    awaiting_payment: { status: "payment_verification", action: "Unggah Bukti", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
    payment_verification: { status: "verified", action: "Menunggu Verifikasi", href: "/dashboard/pendaftar/pembayaran-pendaftaran" },
    verified: { status: "data_completed", action: "Isi Data Pendaftaran", href: "/dashboard/pendaftar/isi-data-lengkap" },
    paid: { status: "data_completed", action: "Isi Data Pendaftaran", href: "/dashboard/pendaftar/isi-data-lengkap" },
    data_completed: { status: "docs_uploaded", action: "Unggah Berkas", href: "/dashboard/pendaftar/upload-berkas" },
    docs_uploaded: { status: "docs_verified", action: "Menunggu Review Admin", href: "/dashboard/pendaftar/upload-berkas" },
    docs_verified: { status: "selection", action: "Mulai Seleksi & Ujian", href: "/dashboard/pendaftar/undangan-seleksi" },
    selection: { status: "tested", action: "Lanjutkan Seleksi", href: "/dashboard/pendaftar/undangan-seleksi" },
    scheduled: { status: "tested", action: "Ikuti Ujian Masuk", href: "/dashboard/pendaftar/ujian" },
    tested: { status: "announced", action: "Menunggu Hasil", href: "/dashboard/pendaftar/pengumuman" },
    announced: { status: "accepted", action: "Cek Hasil", href: "/dashboard/pendaftar/pengumuman" },
    accepted: { status: "enrolled", action: "Daftar Ulang Sekarang", href: "/dashboard/pendaftar/daftar-ulang" },
  };
  return nextSteps[currentStatus] || null;
}

// ─── 4. DISPLAY FORMATTERS ───

export function formatStatusDisplay(status: StatusProses) {
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "Tahap 1: Pembayaran", color: "bg-secondary-100 text-secondary-700" },
    registered: { label: "Tahap 1: Pembayaran", color: "bg-secondary-100 text-secondary-700" },
    awaiting_payment: { label: "Menunggu Bukti", color: "bg-secondary-100 text-secondary-700" },
    payment_verification: { label: "Verifikasi Keuangan", color: "bg-orange-100 text-orange-700" },
    verified: { label: "Terbayar & Terverifikasi", color: "bg-primary-100 text-primary-700" },
    paid: { label: "Terbayar & Terverifikasi", color: "bg-primary-100 text-primary-700" },
    payment_rejected: { label: "Masalah Pembayaran", color: "bg-red-100 text-red-700" },
    rejected: { label: "Berkas Ditolak", color: "bg-red-100 text-red-700" },
    data_completed: { label: "Tahap 2: Informasi Data", color: "bg-primary-100 text-primary-700" },
    docs_uploaded: { label: "Review Admin", color: "bg-indigo-100 text-indigo-700" },
    docs_verified: { label: "Berkas Lengkap", color: "bg-green-100 text-green-700" },
    selection: { label: "Sedang Seleksi", color: "bg-purple-100 text-purple-700" },
    scheduled: { label: "Sedang Seleksi", color: "bg-purple-100 text-purple-700" },
    tested: { label: "Sedang Seleksi", color: "bg-violet-100 text-violet-700" },
    announced: { label: "Hasil Pengumuman", color: "bg-cyan-100 text-cyan-700" },
    accepted: { label: "Diterima", color: "bg-green-100 text-green-700" },
    enrolled: { label: "Sedang Daftar Ulang", color: "bg-emerald-100 text-emerald-700" },
    enrolled_full: { label: "Selesai", color: "bg-primary-100 text-primary-700" },
    pindah_keluar: { label: "Pindah Keluar", color: "bg-slate-100 text-slate-600" },
  };
  return statusMap[status] || { label: status, color: "bg-stone-100 text-stone-700" };
}

// ─── 5. ROLE-BASED ACCESS CONTROL (RBAC) ───

export type UserRole = "pendaftar" | "admin_berkas" | "admin_keuangan" | "penguji" | "pewawancara_calsan" | "pewawancara_cawalsan" | "admin_super" | "admin" | "penguji_hafalan" | "penguji_bahasa_arab";

export const ROLE_LABELS: Record<UserRole, string> = {
  pendaftar: "Pendaftar",
  admin_berkas: "Admin Berkas",
  admin_keuangan: "Admin Keuangan",
  penguji: "Penguji Al-Qur'an",
  pewawancara_calsan: "Pewawancara Calsan",
  pewawancara_cawalsan: "Pewawancara Cawalsan",
  penguji_hafalan: "Penguji Hafalan",
  penguji_bahasa_arab: "Penguji Lisan B. Arab",
  admin_super: "Admin Super",
  admin: "Administrator",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  pendaftar: ["view_own_data", "edit_own_data", "upload_documents", "view_payment_status", "view_announcement"],
  admin_berkas: ["view_pendaftar_list", "verify_documents", "export_pendaftar_data"],
  admin_keuangan: ["view_pendaftar_list", "verify_payment", "view_financial_reports"],
  penguji: ["view_exam_schedule", "input_exam_scores"],
  pewawancara_calsan: ["view_exam_schedule", "input_exam_scores"],
  pewawancara_cawalsan: ["view_exam_schedule", "input_exam_scores"],
  penguji_hafalan: ["view_exam_schedule", "input_exam_scores"],
  penguji_bahasa_arab: ["view_exam_schedule", "input_exam_scores"],
  admin_super: ["view_pendaftar_list", "view_dashboard_stats", "manage_users", "manage_settings"],
  admin: ["view_pendaftar_list", "verify_documents", "verify_payment", "input_exam_scores"],
};

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  pendaftar: "/dashboard/pendaftar",
  admin_berkas: "/dashboard/admin",
  admin_keuangan: "/dashboard/admin",
  penguji: "/dashboard/penguji",
  pewawancara_calsan: "/dashboard/penguji",
  pewawancara_cawalsan: "/dashboard/penguji",
  penguji_hafalan: "/dashboard/penguji",
  penguji_bahasa_arab: "/dashboard/penguji",
  admin_super: "/dashboard/admin",
  admin: "/dashboard/admin",
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isAdminRole(role: UserRole): boolean {
  return ["admin_berkas", "admin_keuangan", "admin_super", "admin"].includes(role);
}

// ─── 6. DYNAMIC MENU LOGIC ───

export function getMenuItemsForRole(role: UserRole) {
  const menus: Record<string, any[]> = {
    admin_berkas: [
      { name: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
      { name: "Data Pendaftar", href: "/dashboard/admin/pendaftar", icon: "Users" },
      { name: "Verifikasi Dokumen", href: "/dashboard/admin/verifikasi-dokumen", icon: "FileCheck" },
    ],
    admin_keuangan: [
      { name: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
      { name: "Data Pendaftar", href: "/dashboard/admin/pendaftar", icon: "Users" },
      { name: "Verifikasi Pembayaran", href: "/dashboard/admin/verifikasi-pembayaran", icon: "CreditCard" },
      { name: "Rekap Keuangan", href: "/dashboard/admin/keuangan", icon: "BarChart" },
    ],
    penguji: [
      { name: "Dashboard", href: "/dashboard/penguji", icon: "LayoutDashboard" },
      { name: "Jadwal Seleksi", href: "/dashboard/penguji/jadwal", icon: "Calendar" },
      { name: "Input Nilai", href: "/dashboard/penguji/input-nilai", icon: "ClipboardEdit" },
    ],
    pewawancara_calsan: [
      { name: "Dashboard", href: "/dashboard/penguji", icon: "LayoutDashboard" },
      { name: "Jadwal Seleksi", href: "/dashboard/penguji/jadwal", icon: "Calendar" },
      { name: "Input Nilai", href: "/dashboard/penguji/input-nilai", icon: "ClipboardEdit" },
    ],
    pewawancara_cawalsan: [
      { name: "Dashboard", href: "/dashboard/penguji", icon: "LayoutDashboard" },
      { name: "Jadwal Seleksi", href: "/dashboard/penguji/jadwal", icon: "Calendar" },
      { name: "Input Nilai", href: "/dashboard/penguji/input-nilai", icon: "ClipboardEdit" },
    ],
    penguji_hafalan: [
      { name: "Dashboard", href: "/dashboard/penguji", icon: "LayoutDashboard" },
      { name: "Jadwal Seleksi", href: "/dashboard/penguji/jadwal", icon: "Calendar" },
      { name: "Input Nilai", href: "/dashboard/penguji/input-nilai", icon: "ClipboardEdit" },
    ],
    penguji_bahasa_arab: [
      { name: "Dashboard", href: "/dashboard/penguji", icon: "LayoutDashboard" },
      { name: "Jadwal Seleksi", href: "/dashboard/penguji/jadwal", icon: "Calendar" },
      { name: "Input Nilai", href: "/dashboard/penguji/input-nilai", icon: "ClipboardEdit" },
    ],
    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
      { name: "Data Pendaftar", href: "/dashboard/admin/pendaftar", icon: "Users" },
      { name: "Verifikasi Dokumen", href: "/dashboard/admin/verifikasi-dokumen", icon: "FileCheck" },
      { name: "Verifikasi Pembayaran", href: "/dashboard/admin/verifikasi-pembayaran", icon: "CreditCard" },
      { name: "Rekap Seragam", href: "/dashboard/admin/seragam", icon: "Shirt" },
      { name: "Manajemen Jadwal", href: "/dashboard/admin/jadwal/monitoring", icon: "Calendar" },
      { name: "Penilaian", href: "/dashboard/admin/penilaian", icon: "ClipboardEdit" },
      { name: "Bantuan Biaya", href: "/dashboard/admin/beasiswa", icon: "Trophy" },
    ],
    admin_super: [
      { name: "Dashboard", href: "/dashboard/admin", icon: "LayoutDashboard" },
      { name: "Data Pendaftar", href: "/dashboard/admin/pendaftar", icon: "Users", group: "OPERASIONAL" },
      { name: "Rekap Keuangan", href: "/dashboard/admin/keuangan", icon: "Landmark", group: "OPERASIONAL" },
      { name: "Rekap Seragam", href: "/dashboard/admin/seragam", icon: "Shirt", group: "OPERASIONAL" },
      { name: "Manajemen Jadwal", href: "/dashboard/admin/jadwal/monitoring", icon: "Calendar", group: "OPERASIONAL" },
      { name: "Bantuan Biaya", href: "/dashboard/admin/beasiswa", icon: "Trophy", group: "OPERASIONAL" },
      { name: "Penilaian", href: "/dashboard/admin/penilaian", icon: "ClipboardEdit", group: "HASIL SELEKSI" },
      { name: "Rekap Nilai & Kelulusan", href: "/dashboard/admin/audit-seleksi", icon: "Activity", group: "HASIL SELEKSI" },
      { name: "Broadcast WA", href: "/dashboard/admin/broadcast", icon: "Zap", group: "KOMUNIKASI" },
      { name: "Manajemen User", href: "/dashboard/admin/users", icon: "UserCog", group: "SISTEM" },
      { name: "Statistik Wilayah", href: "/dashboard/admin/statistik-wilayah", icon: "Map", group: "SISTEM" },
      { name: "Pengaturan", href: "/dashboard/admin/pengaturan", icon: "Settings", group: "SISTEM" },
    ],
  };
  return menus[role] || [];
}

// ─── 7. PROGRESS & MESSAGING UTILS ───

/**
 * calculateProgressToUnlock
 * Menghitung persentase progres menuju terbukanya sebuah tab.
 */
export function calculateProgressToUnlock(
  tabName: TabName,
  currentStatus: StatusProses,
): number {
  const requirement = STEP_REQUIREMENTS[tabName];
  if (!requirement || !requirement.minimumStatus) return 100;

  if (hasReachedStatus(currentStatus, requirement.minimumStatus)) return 100;

  const currentIndex = getStatusIndex(currentStatus);
  const targetIndex = getStatusIndex(requirement.minimumStatus);

  if (targetIndex === 0) return 100;

  // Hitung persentase sederhana berdasarkan urutan status
  const progress = Math.round((currentIndex / targetIndex) * 100);
  return Math.min(Math.max(progress, 0), 99);
}

/**
 * getUnlockMessage
 * Mengambil pesan instruksi untuk membuka tab yang terkunci.
 */
export function getUnlockMessage(tabName: TabName): string {
  return (
    STEP_REQUIREMENTS[tabName]?.description ||
    "Selesaikan tahap sebelumnya untuk membuka akses."
  );
}

