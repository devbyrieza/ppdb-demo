// Status yang valid sesuai database constraint
export type StatusProses =
  | 'draft'
  | 'registered'      // Baru mendaftar, belum bayar
  | 'payment_verification'
  | 'verified'        // Pembayaran terverifikasi (Lunas)
  | 'payment_rejected' // Pembayaran bermasalah/ditolak sementara
  | 'rejected'        // Akhir: Tidak diterima (Hasil Seleksi)
  | 'scheduled'       // Terjadwal ujian
  | 'accepted'        // Diterima
  // Legacy statuses (untuk backward compatibility)
  | 'awaiting_payment'
  | 'paid'
  | 'data_completed'
  | 'docs_uploaded'
  | 'docs_verified'
  | 'tested'
  | 'announced'
  | 'enrolled';

/**
 * URUTAN STATUS PENDAFTARAN (Hierarki)
 * Digunakan untuk menentukan akses menu dan progres.
 */
export const STATUS_ORDER: StatusProses[] = [
  'draft',
  'registered',
  'awaiting_payment',
  'payment_verification',
  'verified',
  'paid',
  'data_completed',
  'docs_uploaded',
  'docs_verified',
  'scheduled',
  'tested',
  'announced',
  'accepted',
  'enrolled'
];

/**
 * Mendapatkan index status dalam hierarki.
 * Jika status tidak ditemukan, return 0 (draft).
 */
export function getStatusIndex(status: StatusProses | string): number {
  if (!status) return 0;
  // Case-insensitive check to be safe
  const s = status.toLowerCase() as StatusProses;
  const index = STATUS_ORDER.indexOf(s);
  return index >= 0 ? index : 0;
}

// Check if current status meets minimum requirement
export function hasReachedStatus(currentStatus: StatusProses, minimumStatus: StatusProses): boolean {
  return getStatusIndex(currentStatus) >= getStatusIndex(minimumStatus);
}

export type TabName =
  | 'data-pribadi'              // Step 1 - always accessible
  | 'pembayaran-pendaftaran'    // Step 2 - always accessible
  | 'status-pembayaran'         // Step 3 - always accessible
  | 'kelengkapan-berkas'        // Step 4 - after payment verified
  | 'upload-berkas'             // Step 5 - after data completed
  | 'download-berkas'           // Step 6 - after docs uploaded
  | 'undangan-seleksi'          // Step 7 - after docs verified
  | 'pengumuman'                // Step 8 - after tested
  | 'daftar-ulang'              // Step 9 - after accepted
  | 'profil';                   // always accessible

// Step requirements - which status is needed to access each tab
export const STEP_REQUIREMENTS: Record<TabName, {
  minimumStatus: StatusProses | null;
  label: string;
  description: string;
}> = {
  'data-pribadi': {
    minimumStatus: null,
    label: 'Data Pribadi',
    description: 'Lihat data pendaftaran Anda'
  },
  'pembayaran-pendaftaran': {
    minimumStatus: null,
    label: 'Pembayaran',
    description: 'Lakukan pembayaran pendaftaran'
  },
  'status-pembayaran': {
    minimumStatus: null,
    label: 'Status Bayar',
    description: 'Cek status pembayaran'
  },
  'profil': {
    minimumStatus: null,
    label: 'Profil',
    description: 'Kelola profil Anda'
  },
  'kelengkapan-berkas': {
    minimumStatus: 'verified', // STRICT: Must be verified by admin
    label: 'Isi Data Lengkap',
    description: 'Menunggu pembayaran diverifikasi admin'
  },
  'upload-berkas': {
    minimumStatus: 'data_completed',
    label: 'Upload Berkas',
    description: 'Data lengkap harus diisi terlebih dahulu'
  },
  'download-berkas': {
    minimumStatus: 'docs_uploaded',
    label: 'Download Berkas',
    description: 'Berkas harus diupload terlebih dahulu'
  },
  'undangan-seleksi': {
    minimumStatus: 'docs_verified',
    label: 'Undangan Seleksi',
    description: 'Menunggu dokumen diverifikasi admin'
  },
  'pengumuman': {
    minimumStatus: 'tested',
    label: 'Pengumuman',
    description: 'Ikuti seleksi ujian terlebih dahulu'
  },
  'daftar-ulang': {
    minimumStatus: 'accepted',
    label: 'Daftar Ulang',
    description: 'Anda belum dinyatakan diterima'
  }
};

// Main function to check tab access
export function canAccessTab(tabName: TabName, statusProses: StatusProses): boolean {
  const requirement = STEP_REQUIREMENTS[tabName];

  // No requirement = always accessible
  if (!requirement || !requirement.minimumStatus) {
    return true;
  }

  // Check if current status meets minimum
  return hasReachedStatus(statusProses, requirement.minimumStatus);
}

// Get unlock message for a tab
export function getUnlockMessage(tabName: TabName): string {
  const requirement = STEP_REQUIREMENTS[tabName];
  return requirement?.description || 'Selesaikan tahap sebelumnya';
}

// Calculate progress percentage to unlock a tab
export function calculateProgressToUnlock(tabName: TabName, currentStatus: StatusProses): number {
  const requirement = STEP_REQUIREMENTS[tabName];

  if (!requirement || !requirement.minimumStatus) {
    return 100; // Always accessible
  }

  const currentIndex = getStatusIndex(currentStatus);
  const requiredIndex = getStatusIndex(requirement.minimumStatus);

  if (currentIndex >= requiredIndex) {
    return 100;
  }

  // Calculate progress (0-99%)
  return Math.min(99, Math.round((currentIndex / requiredIndex) * 100));
}

// Get next step info
export function getNextStep(currentStatus: StatusProses): {
  status: StatusProses;
  action: string;
  href: string;
} | null {
  const nextSteps: Record<string, { status: StatusProses; action: string; href: string }> = {
    'draft': { status: 'payment_verification', action: 'Lakukan pembayaran pendaftaran', href: '/dashboard/pendaftar/pembayaran-pendaftaran' },
    'registered': { status: 'payment_verification', action: 'Lakukan pembayaran pendaftaran', href: '/dashboard/pendaftar/pembayaran-pendaftaran' },
    'awaiting_payment': { status: 'payment_verification', action: 'Upload bukti pembayaran', href: '/dashboard/pendaftar/pembayaran-pendaftaran' },
    'payment_verification': { status: 'verified', action: 'Tunggu verifikasi pembayaran', href: '/dashboard/pendaftar/pembayaran-pendaftaran' },
    'verified': { status: 'data_completed', action: 'Isi formulir data lengkap', href: '/dashboard/pendaftar/isi-data-lengkap' },
    'paid': { status: 'data_completed', action: 'Isi formulir data lengkap', href: '/dashboard/pendaftar/isi-data-lengkap' },
    'data_completed': { status: 'docs_uploaded', action: 'Upload dokumen persyaratan', href: '/dashboard/pendaftar/upload-berkas' },
    'docs_uploaded': { status: 'docs_verified', action: 'Tunggu verifikasi dokumen', href: '/dashboard/pendaftar/upload-berkas' },
    'docs_verified': { status: 'scheduled', action: 'Pilih Jadwal Seleksi', href: '/dashboard/pendaftar/undangan-seleksi' },
    'scheduled': { status: 'tested', action: 'Ikuti ujian seleksi', href: '/dashboard/pendaftar/pengumuman' },
    'tested': { status: 'announced', action: 'Tunggu pengumuman hasil', href: '/dashboard/pendaftar/pengumuman' },
    'announced': { status: 'accepted', action: 'Lihat hasil seleksi', href: '/dashboard/pendaftar/pengumuman' },
    'accepted': { status: 'enrolled', action: 'Lakukan daftar ulang', href: '/dashboard/pendaftar/daftar-ulang' },
  };

  return nextSteps[currentStatus] || null;
}

// Format status for display
export function formatStatusDisplay(status: StatusProses): { label: string; color: string } {
  const statusMap: Record<StatusProses, { label: string; color: string }> = {
    'draft': { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-700' },
    'registered': { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-700' },
    'awaiting_payment': { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-700' },
    'payment_verification': { label: 'Menunggu Verifikasi', color: 'bg-orange-100 text-orange-700' },
    'verified': { label: 'Pembayaran Lunas', color: 'bg-blue-100 text-blue-700' },
    'paid': { label: 'Pembayaran Lunas', color: 'bg-blue-100 text-blue-700' },
    'payment_rejected': { label: 'Pembayaran Bermasalah', color: 'bg-red-100 text-red-700' },
    'rejected': { label: 'Perlu Perbaikan', color: 'bg-red-100 text-red-700' },
    'data_completed': { label: 'Data Lengkap', color: 'bg-teal-100 text-teal-700' },
    'docs_uploaded': { label: 'Dokumen Berhasil Diupload', color: 'bg-indigo-100 text-indigo-700' },
    'docs_verified': { label: 'Dokumen Terverifikasi', color: 'bg-green-100 text-green-700' },
    'scheduled': { label: 'Terjadwal Ujian', color: 'bg-purple-100 text-purple-700' },
    'tested': { label: 'Sudah Ujian', color: 'bg-violet-100 text-violet-700' },
    'announced': { label: 'Diumumkan', color: 'bg-cyan-100 text-cyan-700' },
    'accepted': { label: 'Diterima', color: 'bg-green-100 text-green-700' },
    'enrolled': { label: 'Terdaftar', color: 'bg-emerald-100 text-emerald-700' },
  };

  return statusMap[status] || { label: status, color: 'bg-stone-100 text-stone-700' };
}

// ============================================================================
// ROLE DEFINITIONS - 5 DASHBOARD TYPES
// ============================================================================

export type UserRole =
  | 'pendaftar'       // Dashboard Pendaftar - calon santri
  | 'admin_berkas'    // Dashboard Admin Berkas dan Pendaftaran Umum - verifikasi dokumen & data pendaftaran
  | 'admin_keuangan'  // Dashboard Keuangan - verifikasi pembayaran & keuangan
  | 'penguji_calsan'   // Dashboard Penguji (Quran)
  | 'pewawancara_calsan' // Dashboard Pewawancara Calsan
  | 'pewawancara_cawalsan' // Dashboard Pewawancara Orang Tua (Cawalsan)
  | 'head_of_it'      // Kepala IT / Root Admin - Manages users only
  | 'tim_it'          // Tim IT - anggota tim IT, akses sama dengan head_of_it
  | 'admin_super'     // Dashboard Admin Super - akses penuh ke semua fitur KECUALI user management
  | 'admin';          // Legacy Admin Role

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  pendaftar: 'Pendaftar',
  admin_berkas: 'Admin Berkas',
  admin_keuangan: 'Admin Keuangan',
  penguji_calsan: "Penguji Al-Qur'an",
  pewawancara_calsan: 'Pewawancara Calsan',
  pewawancara_cawalsan: 'Pewawancara Cawalsan',
  head_of_it: 'Kepala IT (Root)',
  tim_it: 'Tim IT',
  admin_super: 'Admin Super',
  admin: 'Administrator (Legacy)',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  pendaftar: 'Calon santri yang mendaftar ke Ponpes Al Andalus Ulul Albaab',
  admin_berkas: 'Memverifikasi berkas/dokumen dan data pendaftaran santri',
  admin_keuangan: 'Mengelola verifikasi pembayaran dan keuangan',
  penguji_calsan: 'Melakukan penilaian tahsin/hafalan Al-Quran calon santri',
  pewawancara_calsan: 'Melakukan wawancara calon santri',
  pewawancara_cawalsan: 'Melakukan wawancara orang tua wali santri',
  head_of_it: 'Super Admin yang hanya mengelola user. Tidak ada akses operasional.',
  tim_it: 'Anggota Tim IT, akses dashboard dan pengaturan.',
  admin_super: 'Akses penuh operasional PPDB (Tanpa manajemen user)',
  admin: 'Administrator (Legacy - Full Access)',
};

// Role permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  pendaftar: [
    'view_own_data',
    'edit_own_data',
    'upload_documents',
    'view_payment_status',
    'view_exam_schedule',
    'view_announcement',
  ],
  admin_berkas: [
    'view_pendaftar_list',
    'view_pendaftar_detail',
    'verify_documents',
    'view_document_status',
    'export_pendaftar_data',
  ],
  admin_keuangan: [
    'view_pendaftar_list',
    'view_payment_list',
    'verify_payment',
    'view_financial_reports',
    'export_payment_data',
  ],
  penguji_calsan: [
    'view_exam_schedule',
    'view_pendaftar_for_exam',
    'input_exam_scores',
    'view_exam_results',
  ],
  pewawancara_calsan: [
    'view_exam_schedule',
    'view_pendaftar_for_exam',
    'input_exam_scores',
    'view_exam_results',
  ],
  pewawancara_cawalsan: [
    'view_exam_schedule',
    'view_pendaftar_for_exam',
    'input_exam_scores',
    'view_exam_results',
  ],
  head_of_it: [
    'manage_users',
    'manage_settings',
  ],
  tim_it: [
    'manage_users',
    'manage_settings',
  ],
  admin_super: [
    // Monitoring & Data
    'view_pendaftar_list',
    'view_pendaftar_detail',
    'view_dashboard_stats',
    'view_regional_stats',
    'advanced_filter',
    'view_charts',
    'export_all_data',
    // Seleksi & Keputusan
    'input_selection_result',
    'publish_announcement',
    // WhatsApp Blast
    'view_broadcast',
    'send_wa_blast',
    'send_google_form',
    // Settings
    'manage_settings',
  ],
  admin: [
    'view_pendaftar_list',
    'view_pendaftar_detail',
    'edit_pendaftar_data',
    'delete_pendaftar',
    'verify_documents',
    'view_document_status',
    'view_payment_list',
    'verify_payment',
    'view_financial_reports',
    'view_exam_schedule',
    'manage_exam_schedule',
    'input_exam_scores',
    'view_exam_results',
    'publish_announcement',
    // 'manage_users', // REMOVED
    'manage_settings',
    'export_all_data',
    'view_dashboard_stats',
    'view_broadcast',
    'send_broadcast',
    'view_regional_stats',
  ],
};

// Dashboard routes per role
export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  pendaftar: '/dashboard/pendaftar',
  admin_berkas: '/dashboard/admin',
  admin_keuangan: '/dashboard/admin',
  penguji_calsan: '/dashboard/penguji',
  pewawancara_calsan: '/dashboard/penguji',
  pewawancara_cawalsan: '/dashboard/penguji',
  head_of_it: '/dashboard/admin/users',
  tim_it: '/dashboard/admin/users',
  admin_super: '/dashboard/admin',
  admin: '/dashboard/admin',
};

// Check if role has permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if role is admin type (can access admin dashboard)
export function isAdminRole(role: UserRole): boolean {
  return ['admin_berkas', 'admin_keuangan', 'head_of_it', 'tim_it', 'admin_super', 'admin'].includes(role);
}

// Check if role can verify documents
export function canVerifyDocuments(role: UserRole): boolean {
  return hasPermission(role, 'verify_documents');
}

// Check if role can verify payments
export function canVerifyPayments(role: UserRole): boolean {
  return hasPermission(role, 'verify_payment');
}

// Check if role can input exam scores
export function canInputScores(role: UserRole): boolean {
  return hasPermission(role, 'input_exam_scores');
}

// Get menu items based on role
export function getMenuItemsForRole(role: UserRole): { name: string; href: string; icon: string; group?: string }[] {
  const baseMenuItems: Record<string, { name: string; href: string; icon: string; group?: string }[]> = {
    admin_berkas: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Data Pendaftar', href: '/dashboard/admin/pendaftar', icon: 'Users' },
      { name: 'Permintaan Edit', href: '/dashboard/admin/perubahan-data', icon: 'Edit3' },
      { name: 'Verifikasi Dokumen', href: '/dashboard/admin/verifikasi-dokumen', icon: 'FileCheck' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle' },
    ],
    admin_keuangan: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Data Pendaftar', href: '/dashboard/admin/pendaftar', icon: 'Users' },
      { name: 'Verifikasi Pembayaran', href: '/dashboard/admin/verifikasi-pembayaran', icon: 'CreditCard' },
      { name: 'Rekap Keuangan', href: '/dashboard/admin/keuangan', icon: 'BarChart' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle' },
    ],
    penguji_calsan: [
      { name: 'Dasbor', href: '/dashboard/penguji', icon: 'LayoutDashboard' },
      { name: 'Jadwal Ujian', href: '/dashboard/penguji/jadwal', icon: 'Calendar' },
      { name: 'Input Nilai', href: '/dashboard/penguji/input-nilai', icon: 'ClipboardEdit' },
      { name: 'Profil Saya', href: '/dashboard/penguji/profil', icon: 'UserCircle' },
    ],
    pewawancara_calsan: [
      { name: 'Dasbor', href: '/dashboard/penguji', icon: 'LayoutDashboard' },
      { name: 'Jadwal Ujian', href: '/dashboard/penguji/jadwal', icon: 'Calendar' },
      { name: 'Input Nilai', href: '/dashboard/penguji/input-nilai', icon: 'ClipboardEdit' },
      { name: 'Profil Saya', href: '/dashboard/penguji/profil', icon: 'UserCircle' },
    ],
    pewawancara_cawalsan: [
      { name: 'Dasbor', href: '/dashboard/penguji', icon: 'LayoutDashboard' },
      { name: 'Jadwal Ujian', href: '/dashboard/penguji/jadwal', icon: 'Calendar' },
      { name: 'Input Nilai', href: '/dashboard/penguji/input-nilai', icon: 'ClipboardEdit' },
      { name: 'Profil Saya', href: '/dashboard/penguji/profil', icon: 'UserCircle' },
    ],
    head_of_it: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Manajemen User', href: '/dashboard/admin/users', icon: 'UserCog' },
      { name: 'Pengaturan', href: '/dashboard/admin/pengaturan', icon: 'Settings' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle' },
    ],
    tim_it: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Manajemen User', href: '/dashboard/admin/users', icon: 'UserCog' },
      { name: 'Pengaturan', href: '/dashboard/admin/pengaturan', icon: 'Settings' },
      { name: 'Rekap Honor', href: '/dashboard/admin/recap-fee', icon: 'CreditCard' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle' },
    ],
    admin_super: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      // Group: OPERASIONAL
      { name: 'Data Pendaftar', href: '/dashboard/admin/pendaftar', icon: 'Users', group: 'OPERASIONAL' },
      { name: 'Monitoring Jadwal', href: '/dashboard/admin/jadwal/monitoring', icon: 'Calendar', group: 'OPERASIONAL' },
      { name: 'Penilaian', href: '/dashboard/admin/penilaian', icon: 'ClipboardEdit', group: 'OPERASIONAL' },
      // Group: SELEKSI
      { name: 'Hasil Seleksi', href: '/dashboard/admin/hasil-seleksi', icon: 'Trophy', group: 'HASIL SELEKSI' },
      { name: 'Pengumuman', href: '/dashboard/admin/pengumuman', icon: 'Bell', group: 'HASIL SELEKSI' },
      // Group: KEUANGAN & SDM
      { name: 'Rekap Keuangan', href: '/dashboard/admin/keuangan', icon: 'Landmark', group: 'KEUANGAN & SDM' },
      { name: 'Rekap Honor', href: '/dashboard/admin/recap-fee', icon: 'CreditCard', group: 'KEUANGAN & SDM' },
      // Group: ANALITIK & BROADCAST
      { name: 'Statistik Wilayah', href: '/dashboard/admin/statistik-wilayah', icon: 'Map', group: 'ANALITIK & BROADCAST' },
      { name: 'Broadcast WA', href: '/dashboard/admin/broadcast', icon: 'Zap', group: 'ANALITIK & BROADCAST' },
      // Group: SISTEM
      { name: 'Pengaturan', href: '/dashboard/admin/pengaturan', icon: 'Settings', group: 'SISTEM' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle', group: 'SISTEM' },
    ],
    admin: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { name: 'Data Pendaftar', href: '/dashboard/admin/pendaftar', icon: 'Users' },
      { name: 'Verifikasi Pembayaran', href: '/dashboard/admin/verifikasi-pembayaran', icon: 'CreditCard' },
      { name: 'Verifikasi Dokumen', href: '/dashboard/admin/verifikasi-dokumen', icon: 'FileCheck' },
      { name: 'Jadwal Ujian', href: '/dashboard/admin/jadwal-ujian', icon: 'Calendar' },
      { name: 'Penilaian', href: '/dashboard/admin/penilaian', icon: 'ClipboardEdit' },
      { name: 'Keuangan', href: '/dashboard/admin/keuangan', icon: 'BarChart' },
      { name: 'Rekap Honor', href: '/dashboard/admin/recap-fee', icon: 'CreditCard' },
      { name: 'Pengumuman', href: '/dashboard/admin/pengumuman', icon: 'Trophy' },
      { name: 'Broadcast WA', href: '/dashboard/admin/broadcast', icon: 'Bell' },
      { name: 'Statistik Wilayah', href: '/dashboard/admin/statistik-wilayah', icon: 'BarChart' },
      { name: 'Pengaturan', href: '/dashboard/admin/pengaturan', icon: 'Settings' },
      { name: 'Profil Saya', href: '/dashboard/admin/profil', icon: 'UserCircle' },
    ],
    pendaftar: [], // Pendaftar uses tab-based navigation
  };

  return baseMenuItems[role] || [];
}

// Validate role access to a route
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Admin super can access everything EXCEPT users
  if (role === 'admin_super' || role === 'admin') {
    return route !== '/dashboard/admin/users';
  }

  // Head of IT / Tim IT can only access users, settings, and dashboard
  if (role === 'head_of_it' || role === 'tim_it') {
    const allowed = [
      '/dashboard/admin',
      '/dashboard/admin/users',
      '/dashboard/admin/pengaturan',
    ];
    // Allow strict matches or sub-paths for users
    return allowed.some(r => route === r || route.startsWith(r + '/'));
  }

  // Pendaftar can only access pendaftar routes
  if (role === 'pendaftar') {
    return route.startsWith('/dashboard/pendaftar') || route === '/dashboard';
  }

  // Admin berkas can access admin dashboard and document verification
  if (role === 'admin_berkas') {
    const allowedRoutes = [
      '/dashboard/admin',
      '/dashboard/admin/pendaftar',
      '/dashboard/admin/verifikasi-dokumen',
      '/dashboard/admin/perubahan-data',
    ];
    return allowedRoutes.some(r => route.startsWith(r));
  }

  // Admin keuangan can access admin dashboard and payment verification
  if (role === 'admin_keuangan') {
    const allowedRoutes = [
      '/dashboard/admin',
      '/dashboard/admin/pendaftar',
      '/dashboard/admin/verifikasi-pembayaran',
      '/dashboard/admin/keuangan', // UPDATED
    ];
    return allowedRoutes.some(r => route.startsWith(r));
  }

  // Examiners can only access penguji routes
  if (role === 'penguji_calsan' || role === 'pewawancara_calsan' || role === 'pewawancara_cawalsan') {
    return route.startsWith('/dashboard/penguji');
  }

  return false;
}
