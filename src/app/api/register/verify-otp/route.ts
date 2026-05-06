import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";
import { enqueueWhatsapp, buildMessageRegistrationSuccess } from "@/lib/whatsapp-queue";
import { normalizePhoneNumber } from "@/lib/validations/registration";
import crypto from "crypto";

/**
 * ─── REGISTER API: VERIFY OTP ───
 */

const hashOTP = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const { no_hp, otp_code } = await request.json();
    const hashedOTP = hashOTP(otp_code);
    const normalizedPhone = normalizePhoneNumber(no_hp);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, otp_hash: hashedOTP, expires_at: { gt: new Date() } },
    });

    if (!otpRecord) return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });

    const regData = (otpRecord.registration_data as any) || {};
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } }) 
                  || await prisma.tahunAjaran.findFirst({ orderBy: { created_at: "desc" } });

    const nomorPendaftaran = await generateNomorPendaftaran(regData.jenjang, regData.jenis_kelamin);
    const profileId = crypto.randomUUID();
    
    await prisma.$transaction([
      prisma.profile.create({ data: { id: profileId, full_name: regData.nama_lengkap, phone: no_hp, role: "pendaftar" } }),
      prisma.pendaftar.create({
        data: {
          nik: regData.nik, nama_lengkap: regData.nama_lengkap, jenis_kelamin: regData.jenis_kelamin,
          jenjang: regData.jenjang, no_hp: no_hp, status_pendaftaran: "draft", user_id: profileId,
          tahun_ajaran_id: activeTA!.id, nomor_pendaftaran: nomorPendaftaran,
        },
      }),
      prisma.otpVerification.delete({ where: { id: otpRecord.id } }),
    ]);

    await enqueueWhatsapp({
      pendaftarId: profileId,
      phone: no_hp,
      jenisNotif: "registration_success",
      messageContent: buildMessageRegistrationSuccess(regData.nama_lengkap, nomorPendaftaran, regData.jenjang),
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { nomor_pendaftaran: nomorPendaftaran } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
