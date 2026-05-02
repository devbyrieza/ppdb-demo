import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { cookies } from "next/headers";
import { JenisPembayaran, TipeCicilan } from "@prisma/client";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (["admin_super", "admin"].includes(session.role)) {
      return session;
    }
  } catch { }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Read raw data
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
      if (rawData[i].some(cell => {
        const c = String(cell).toLowerCase();
        return c.includes("nama santri") || c.includes("nama lengkap") || c.includes("no pendaftaran");
      })) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: "Could not find header row in Excel" }, { status: 400 });
    }

    const headers = rawData[headerRowIndex].map(h => String(h).trim());
    const dataRows = rawData.slice(headerRowIndex + 1);

    const colIdx = {
      no: headers.findIndex(h => h.toLowerCase().includes("no") && (h.toLowerCase().includes("pendaftaran") || h.toLowerCase().includes("reg"))),
      nama: headers.findIndex(h => h.toLowerCase().includes("nama")),
      gender: headers.findIndex(h => h.toLowerCase() === "l/p" || h.toLowerCase().includes("kelamin")),
      jenjang: headers.findIndex(h => h.toLowerCase().includes("jenjang")),
      hasil: headers.findIndex(h => h.toLowerCase().includes("hasil") || h.toLowerCase().includes("status penerimaan")),
      status_bayar: headers.findIndex(h => h.toLowerCase().includes("status") && (h.toLowerCase().includes("pembayaran") || h.toLowerCase().includes("lunas"))),
      nominal1: headers.findIndex(h => h.toLowerCase().includes("nominal 1")),
      nominal2: headers.findIndex(h => h.toLowerCase().includes("nominal 2"))
    };

    // 1. Get Active TA
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    if (!activeTA) return NextResponse.json({ error: "No active TA" }, { status: 404 });

    const results = { created: 0, updated: 0, skipped: 0, details: [] as string[] };

    const normalize = (name: string) => {
      if (!name) return "";
      return String(name).toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    };

    const protectedNames = [
      "rumaisha hanin hanifa",
      "iklimah mardhatillah",
      "nahla ajwa nursyifa",
      "hudzaifah al fawwaz"
    ].map(n => normalize(n));

    // PHASE 0: RESTORE PROTECTED STUDENTS
    await prisma.pendaftar.updateMany({
      where: {
        OR: [
          { nama_lengkap: { contains: "Rumaisha", mode: "insensitive" } },
          { nama_lengkap: { contains: "Iklimah", mode: "insensitive" } },
          { nama_lengkap: { contains: "Nahla", mode: "insensitive" } },
          { nama_lengkap: { contains: "Hudzaifah", mode: "insensitive" } }
        ]
      },
      data: { deleted_at: null }
    });

    // 3. Fetch all current students for matching
    const currentStudents = await prisma.pendaftar.findMany({
      where: { tahun_ajaran_id: activeTA.id, deleted_at: null },
      select: { id: true, nomor_pendaftaran: true, nama_lengkap: true }
    });

    const updatedIds = new Set<string>();

    // 4. Process Rows
    for (const row of dataRows) {
      const rawNo = String(row[colIdx.no] || "").trim();
      const rawName = String(row[colIdx.nama] || "").trim();
      
      if (!rawName && !rawNo) continue;

      let student = currentStudents.find(s => 
        (rawNo && s.nomor_pendaftaran === rawNo) || 
        (rawName && normalize(s.nama_lengkap) === normalize(rawName))
      );

      let studentId = student?.id;

      if (!studentId) {
        // CREATE NEW STUDENT
        const jenjangRaw = String(row[colIdx.jenjang] || "MTS").toUpperCase();
        const jenjang = jenjangRaw.includes("SMA") ? "SMA" : (jenjangRaw.includes("IL") ? "IL" : "MTS");
        const jkRaw = String(row[colIdx.gender] || "").toUpperCase();
        const jenis_kelamin = jkRaw.includes("P") ? "Perempuan" : "Laki-laki";
        
        // Generate nomor pendaftaran if missing
        const finalNo = rawNo || `${jenjang}${Date.now().toString().slice(-6)}`;

        const newStudent = await prisma.pendaftar.create({
          data: {
            tahun_ajaran_id: activeTA.id,
            nomor_pendaftaran: finalNo,
            nama_lengkap: rawName,
            nik: `32${Math.floor(Math.random() * 10000000000000).toString().padStart(14, '0')}`, // Dummy NIK
            jenis_kelamin,
            jenjang,
            status_pendaftaran: "draft"
          }
        });
        studentId = newStudent.id;
        results.created++;
      } else {
        results.updated++;
      }

      updatedIds.add(studentId!);

      // Sync Status & Payments
      const hasil = String(row[colIdx.hasil] || "").toLowerCase();
      const statusBayar = String(row[colIdx.status_bayar] || "").toLowerCase();
      
      let newStatus = "draft";
      if (statusBayar.includes("lunas") || statusBayar.includes("gratis")) {
        newStatus = "enrolled";
      } else if (hasil.includes("diterima")) {
        newStatus = "accepted";
      } else if (hasil.includes("cadangan")) {
        newStatus = "announced";
      } else if (hasil.includes("ditolak")) {
        newStatus = "rejected";
      }

      await prisma.pendaftar.update({
        where: { id: studentId },
        data: { status_pendaftaran: newStatus }
      });

      // SYNC PAYMENTS
      const existingPayReg = await prisma.pembayaran.findFirst({
        where: { pendaftar_id: studentId, jenis_pembayaran: JenisPembayaran.PENDAFTARAN }
      });
      if (existingPayReg) {
        await prisma.pembayaran.update({
          where: { id: existingPayReg.id },
          data: { status_pembayaran: "verified", verified_at: new Date() }
        });
      } else {
        await prisma.pembayaran.create({
          data: {
            pendaftar_id: studentId!,
            tahun_ajaran_id: activeTA.id,
            metode_pembayaran: "manual",
            jumlah: activeTA.biaya_pendaftaran,
            status_pembayaran: "verified",
            jenis_pembayaran: JenisPembayaran.PENDAFTARAN,
            verified_at: new Date(),
            catatan_verifikasi: "Synced from Master Excel"
          }
        });
      }

      if (statusBayar.includes("lunas") || statusBayar.includes("gratis")) {
        const nominal1 = parseFloat(String(row[colIdx.nominal1] || "0").replace(/[^0-9]/g, "")) || 0;
        const nominal2 = parseFloat(String(row[colIdx.nominal2] || "0").replace(/[^0-9]/g, "")) || 0;
        const total = nominal1 + nominal2;

        const existingPayDU = await prisma.pembayaran.findFirst({
          where: { pendaftar_id: studentId, jenis_pembayaran: JenisPembayaran.DAFTAR_ULANG }
        });
        if (existingPayDU) {
          await prisma.pembayaran.update({
            where: { id: existingPayDU.id },
            data: { status_pembayaran: "verified", jumlah: total || undefined, verified_at: new Date() }
          });
        } else {
          await prisma.pembayaran.create({
            data: {
              pendaftar_id: studentId!,
              tahun_ajaran_id: activeTA.id,
              metode_pembayaran: "manual",
              jumlah: total || 9800000,
              status_pembayaran: "verified",
              jenis_pembayaran: JenisPembayaran.DAFTAR_ULANG,
              tipe_cicilan: TipeCicilan.LUNAS,
              verified_at: new Date(),
              catatan_verifikasi: "Synced from Master Excel (Lunas/Gratis)"
            }
          });
        }
      }
    }

    // 5. Cleanup
    const toDelete = currentStudents.filter(s => {
      const normalizedName = normalize(s.nama_lengkap);
      const isProtected = protectedNames.includes(normalizedName);
      return !updatedIds.has(s.id) && !isProtected;
    });

    for (const s of toDelete) {
      await prisma.pendaftar.update({
        where: { id: s.id },
        data: { deleted_at: new Date() }
      });
    }

    return NextResponse.json({
      message: "Sync complete",
      results: { 
        ...results, 
        cleaned: toDelete.length,
        total_in_db: await prisma.pendaftar.count({ where: { tahun_ajaran_id: activeTA.id, deleted_at: null } })
      }
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
