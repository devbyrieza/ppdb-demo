import { prisma } from "@/lib/prisma";
import { BRANDING } from "@/config/branding";
import { sendMessage } from "@/lib/wablas";

export interface SpmbNotificationSettings {
  adminKeuangan: string[];
  superAdmin: string[];
  ketuaPanitia: string[];
  adminBerkas: string[];
  raw: {
    adminKeuangan: string;
    superAdmin: string;
    ketuaPanitia: string;
    adminBerkas: string;
  };
  waitingDays: number;
  isConfigured: boolean;
}

const KEY_ADMIN_KEUANGAN = "spmb_wa_admin_keuangan";
const KEY_SUPER_ADMIN = "spmb_wa_super_admin";
const KEY_KETUA_PANITIA = "spmb_wa_ketua_panitia";
const KEY_ADMIN_BERKAS = "spmb_wa_admin_berkas";
const KEY_WAITING_DAYS = "spmb_cadangan_waiting_days";

export function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "628" + cleaned.slice(1);
  }
  return cleaned;
}

export function parsePhoneList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\n\r]+/)
    .map((s) => normalizePhone(s.trim()))
    .filter((s) => s.length >= 9 && s.length <= 16);
}

/**
 * Mengambil konfigurasi nomor WhatsApp penanggung jawab SPMB dari database app_settings.
 * Jika nomor Super Admin belum diatur, coba ambil nomor dari profil admin_super aktif.
 */
export async function getSpmbNotificationSettings(): Promise<SpmbNotificationSettings> {
  let rawKeuangan = "";
  let rawSuper = "";
  let rawKetua = "";
  let rawBerkas = "";
  let waitingDays = 14;

  try {
    const rows = await prisma.appSetting.findMany({
      where: {
        key: {
          in: [KEY_ADMIN_KEUANGAN, KEY_SUPER_ADMIN, KEY_KETUA_PANITIA, KEY_ADMIN_BERKAS, KEY_WAITING_DAYS],
        },
      },
    });

    for (const r of rows) {
      if (r.key === KEY_ADMIN_KEUANGAN) rawKeuangan = r.value || "";
      if (r.key === KEY_SUPER_ADMIN) rawSuper = r.value || "";
      if (r.key === KEY_KETUA_PANITIA) rawKetua = r.value || "";
      if (r.key === KEY_ADMIN_BERKAS) rawBerkas = r.value || "";
      if (r.key === KEY_WAITING_DAYS) {
        const val = parseInt(r.value, 10);
        if (!isNaN(val) && val > 0) waitingDays = val;
      }
    }

    // Fallback: Jika Super Admin belum diatur di setting, ambil dari Profile admin_super
    if (!rawSuper) {
      const superProfile = await prisma.profile.findFirst({
        where: {
          OR: [
            { role: "admin_super" },
            { secondary_roles: { has: "admin_super" } },
          ],
          phone: { notIn: ["", "-"] },
        },
        select: { phone: true },
      });
      if (superProfile?.phone) {
        rawSuper = superProfile.phone;
      }
    }
  } catch (err) {
    console.error("Error reading spmb notification settings:", err);
  }

  const listKeuangan = parsePhoneList(rawKeuangan);
  const listSuper = parsePhoneList(rawSuper);
  const listKetua = parsePhoneList(rawKetua);
  const listBerkas = parsePhoneList(rawBerkas);

  // Dinyatakan configured jika minimal Admin Keuangan dan Super Admin telah terisi nomor valid
  const isConfigured = listKeuangan.length > 0 && listSuper.length > 0;

  return {
    adminKeuangan: listKeuangan,
    superAdmin: listSuper,
    ketuaPanitia: listKetua,
    adminBerkas: listBerkas,
    raw: {
      adminKeuangan: rawKeuangan,
      superAdmin: rawSuper,
      ketuaPanitia: rawKetua,
      adminBerkas: rawBerkas,
    },
    waitingDays,
    isConfigured,
  };
}

/**
 * Menyimpan konfigurasi nomor WhatsApp penanggung jawab SPMB ke tabel app_settings.
 */
export async function saveSpmbNotificationSettings(data: {
  adminKeuangan?: string;
  superAdmin?: string;
  ketuaPanitia?: string;
  adminBerkas?: string;
  waitingDays?: number;
}): Promise<SpmbNotificationSettings> {
  const operations: Promise<any>[] = [];

  if (data.adminKeuangan !== undefined) {
    operations.push(
      prisma.appSetting.upsert({
        where: { key: KEY_ADMIN_KEUANGAN },
        update: { value: data.adminKeuangan.trim(), updated_at: new Date() },
        create: { key: KEY_ADMIN_KEUANGAN, value: data.adminKeuangan.trim() },
      })
    );
  }

  if (data.superAdmin !== undefined) {
    operations.push(
      prisma.appSetting.upsert({
        where: { key: KEY_SUPER_ADMIN },
        update: { value: data.superAdmin.trim(), updated_at: new Date() },
        create: { key: KEY_SUPER_ADMIN, value: data.superAdmin.trim() },
      })
    );
  }

  if (data.ketuaPanitia !== undefined) {
    operations.push(
      prisma.appSetting.upsert({
        where: { key: KEY_KETUA_PANITIA },
        update: { value: data.ketuaPanitia.trim(), updated_at: new Date() },
        create: { key: KEY_KETUA_PANITIA, value: data.ketuaPanitia.trim() },
      })
    );
  }

  if (data.adminBerkas !== undefined) {
    operations.push(
      prisma.appSetting.upsert({
        where: { key: KEY_ADMIN_BERKAS },
        update: { value: data.adminBerkas.trim(), updated_at: new Date() },
        create: { key: KEY_ADMIN_BERKAS, value: data.adminBerkas.trim() },
      })
    );
  }

  if (data.waitingDays !== undefined && data.waitingDays > 0) {
    operations.push(
      prisma.appSetting.upsert({
        where: { key: KEY_WAITING_DAYS },
        update: { value: String(data.waitingDays), updated_at: new Date() },
        create: { key: KEY_WAITING_DAYS, value: String(data.waitingDays) },
      })
    );
  }

  await Promise.all(operations);
  return getSpmbNotificationSettings();
}

/**
 * Menyusun pesan rekap harian kuota SPMB (executive daily summary).
 */
export async function buildDailyQuotaReport(): Promise<{
  text: string;
  stats: {
    targetKuota: number;
    terisi: number;
    menungguDp: number;
    jatuhTempoHariIni: number;
    cadangan: number;
  };
}> {
  const lembaga = (BRANDING.schoolName || "Pesantren Al-Andalus").toUpperCase();
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Ambil tahun ajaran aktif
  const ta = await prisma.tahunAjaran.findFirst({
    where: { is_active: true },
    select: { id: true, nama: true },
  });

  const taWhere = ta ? { tahun_ajaran_id: ta.id } : {};

  // Hitung santri diterima & sudah bayar DP/daftar ulang
  const terisiCount = await prisma.pendaftar.count({
    where: {
      ...taWhere,
      status_pendaftaran: { in: ["enrolled", "enrolled_full"] },
      deleted_at: null,
    },
  });

  // Santri diterima yang masih menunggu pembayaran (dalam masa tenggang)
  const acceptedList = await prisma.pendaftar.findMany({
    where: {
      ...taWhere,
      status_pendaftaran: "accepted",
      deleted_at: null,
    },
    select: {
      id: true,
      nama_lengkap: true,
      nomor_pendaftaran: true,
      updated_at: true,
      pengumuman: {
        select: { published_at: true },
      },
    },
  });

  // Hitung yang jatuh tempo (misal lewat 7 hari sejak pengumuman terbit)
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  let jatuhTempoCount = 0;
  const jatuhTempoNames: string[] = [];

  for (const s of acceptedList) {
    const publishedAt = s.pengumuman?.published_at
      ? new Date(s.pengumuman.published_at).getTime()
      : new Date(s.updated_at).getTime();
    if (now - publishedAt > SEVEN_DAYS_MS) {
      jatuhTempoCount++;
      jatuhTempoNames.push(s.nama_lengkap);
    }
  }

  const menungguDpCount = acceptedList.length - jatuhTempoCount;

  // Santri cadangan
  const cadanganCount = await prisma.pendaftar.count({
    where: {
      ...taWhere,
      status_pendaftaran: { in: ["cadangan", "announced"] },
      deleted_at: null,
    },
  });

  const targetKuota = 76; // Target kuota standar lembaga

  const text =
    `📊 *UPDATE HARIAN STATUS KUOTA SPMB*\n` +
    `*${lembaga}*\n` +
    `📅 ${dateStr}\n\n` +
    `• Kuota Terisi (DP Masuk): *${terisiCount}* santri\n` +
    `• Menunggu Pembayaran DP (Masa 7 Hari): *${menungguDpCount}* santri\n` +
    `• ⚠️ *Jatuh Tempo Belum Bayar:* *${jatuhTempoCount}* santri${
      jatuhTempoNames.length > 0 ? ` (${jatuhTempoNames.slice(0, 3).join(", ")}${jatuhTempoNames.length > 3 ? "..." : ""})` : ""
    }\n` +
    `• Antrean Cadangan Siaga: *${cadanganCount}* santri\n\n` +
    `_Laporan otomatis sistem SPMB ${BRANDING.schoolName}_`;

  return {
    text,
    stats: {
      targetKuota,
      terisi: terisiCount,
      menungguDp: menungguDpCount,
      jatuhTempoHariIni: jatuhTempoCount,
      cadangan: cadanganCount,
    },
  };
}

/**
 * Mengirimkan pesan ringkasan kuota harian ke semua nomor penanggung jawab (Keuangan, Super, Ketua).
 */
export async function sendDailyQuotaDigest(): Promise<{
  sentCount: number;
  recipients: string[];
}> {
  const settings = await getSpmbNotificationSettings();
  if (!settings.isConfigured) {
    return { sentCount: 0, recipients: [] };
  }

  // Gabungkan seluruh penerima unik
  const allPhones = Array.from(
    new Set([
      ...settings.adminKeuangan,
      ...settings.superAdmin,
      ...settings.ketuaPanitia,
    ])
  );

  const { text } = await buildDailyQuotaReport();
  let sentCount = 0;

  for (const phone of allPhones) {
    try {
      await sendMessage({ phone, message: text });
      sentCount++;
    } catch (err) {
      console.error(`Gagal mengirim digest ke ${phone}:`, err);
    }
  }

  return { sentCount, recipients: allPhones };
}
