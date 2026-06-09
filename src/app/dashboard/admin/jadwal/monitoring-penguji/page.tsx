import { requireRole } from "@/lib/check-permission";
import { prisma } from "@/lib/prisma";
import MonitoringClient, { ExaminerStat, PendingStudent } from "./MonitoringClient";

export const dynamic = "force-dynamic";

export default async function MonitoringPengujiPage() {
  await requireRole(["admin_super"]);

  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { is_active: true },
  });

  if (!activeTahunAjaran) {
    return (
      <div className="p-5 md:p-8 text-center text-red-500 font-bold">
        Tahun Ajaran aktif tidak ditemukan.
      </div>
    );
  }

  // Fetch all JadwalUjian with their NilaiUjian and assigned Penguji
  const jadwalList = await prisma.jadwalUjian.findMany({
    where: { tahun_ajaran_id: activeTahunAjaran.id },
    include: {
      pendaftar: { 
        select: { 
          id: true, 
          nama_lengkap: true, 
          nomor_pendaftaran: true,
          nilai_ujian: true
        } 
      },
      penguji_santri: { select: { id: true, full_name: true, phone: true } },
      penguji_ortu: { select: { id: true, full_name: true, phone: true } },
      penguji_quran: { select: { id: true, full_name: true, phone: true } },
    },
  });

  const examinerMap = new Map<string, ExaminerStat>();

  const getOrInitializeStat = (
    id: string,
    name: string,
    phone: string | null,
    roleType: "Wawancara Santri" | "Wawancara Ortu" | "Ujian Quran"
  ) => {
    const key = id + roleType;
    if (!examinerMap.has(key)) {
      examinerMap.set(key, {
        id,
        name,
        phone,
        roleType,
        totalAssigned: 0,
        totalGraded: 0,
        totalPending: 0,
        pendingStudents: [],
      });
    }
    return examinerMap.get(key)!;
  };

  jadwalList.forEach((jadwal) => {
    // Fetch from pendaftar to avoid detached jadwal_ujian_id bug
    const nilai = jadwal.pendaftar.nilai_ujian?.[0]; 
    
    // Wawancara Santri
    if (jadwal.penguji_santri_id && jadwal.penguji_santri) {
      const stat = getOrInitializeStat(jadwal.penguji_santri_id, jadwal.penguji_santri.full_name, jadwal.penguji_santri.phone, "Wawancara Santri");
      stat.totalAssigned++;
      if (nilai?.nilai_wawancara_santri !== null && nilai?.nilai_wawancara_santri !== undefined) {
        stat.totalGraded++;
      } else {
        stat.totalPending++;
        stat.pendingStudents.push({
          jadwalId: jadwal.id,
          name: jadwal.pendaftar.nama_lengkap,
          registrationNumber: jadwal.pendaftar.nomor_pendaftaran,
          date: jadwal.tanggal_ujian,
        });
      }
    }

    // Wawancara Ortu
    if (jadwal.penguji_ortu_id && jadwal.penguji_ortu) {
      const stat = getOrInitializeStat(jadwal.penguji_ortu_id, jadwal.penguji_ortu.full_name, jadwal.penguji_ortu.phone, "Wawancara Ortu");
      stat.totalAssigned++;
      if (nilai?.nilai_wawancara_ortu !== null && nilai?.nilai_wawancara_ortu !== undefined) {
        stat.totalGraded++;
      } else {
        stat.totalPending++;
        stat.pendingStudents.push({
          jadwalId: jadwal.id,
          name: jadwal.pendaftar.nama_lengkap,
          registrationNumber: jadwal.pendaftar.nomor_pendaftaran,
          date: jadwal.tanggal_ujian,
        });
      }
    }

    // Ujian Quran
    if (jadwal.penguji_quran_id && jadwal.penguji_quran) {
      const stat = getOrInitializeStat(jadwal.penguji_quran_id, jadwal.penguji_quran.full_name, jadwal.penguji_quran.phone, "Ujian Quran");
      stat.totalAssigned++;
      if (nilai?.nilai_tes_quran !== null && nilai?.nilai_tes_quran !== undefined) {
        stat.totalGraded++;
      } else {
        stat.totalPending++;
        stat.pendingStudents.push({
          jadwalId: jadwal.id,
          name: jadwal.pendaftar.nama_lengkap,
          registrationNumber: jadwal.pendaftar.nomor_pendaftaran,
          date: jadwal.tanggal_ujian,
        });
      }
    }
  });

  const examinerData = Array.from(examinerMap.values());
  // Sort by pending highest first
  examinerData.sort((a, b) => b.totalPending - a.totalPending);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-primary-950 tracking-tighter uppercase italic">
          Monitoring Penguji
        </h1>
        <p className="text-sm font-bold text-ink-500">
          Pantau progres input nilai dari seluruh penguji dan pewawancara
        </p>
      </div>

      <MonitoringClient data={examinerData} />
    </div>
  );
}
