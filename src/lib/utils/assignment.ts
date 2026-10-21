import { prisma } from "../prisma";

/**
 * Mencari penguji dengan beban kerja paling ringan dari sekumpulan sesi yang tersedia di waktu yang sama.
 *
 * @param startTime Waktu mulai ujian
 * @param category Kategori ujian (QURAN, W_SANTRI, W_ORTU, LISAN_ARAB)
 * @param tahunAjaranId ID Tahun Ajaran aktif
 * @returns Object berisi examiner_id dan session_id pemenang, atau null jika tidak ada pilihan
 */
export async function getLeastLoadedExaminerFromPool(
  startTime: Date,
  category: string,
  tahunAjaranId: string,
  pendaftarGender?: string | null,
) {
  // 1. Tentukan kondisi filter pencarian berdasarkan kategori
  let titleWhere: any = {};
  if (category === "QURAN") {
    titleWhere = {
      OR: [
        { title: { contains: "qur", mode: "insensitive" } },
        { title: { contains: "bacaan", mode: "insensitive" } },
        { title: { contains: "hafalan", mode: "insensitive" } },
      ],
    };
  } else if (category === "W_ORTU") {
    titleWhere = {
      OR: [
        { title: { contains: "ortu", mode: "insensitive" } },
        { title: { contains: "orang tua", mode: "insensitive" } },
        { title: { contains: "orangtua", mode: "insensitive" } },
        { title: { contains: "wali", mode: "insensitive" } },
        { title: { contains: "cawalsan", mode: "insensitive" } },
      ],
    };
  } else if (category === "W_SANTRI") {
    titleWhere = {
      AND: [
        {
          OR: [
            { title: { contains: "santri", mode: "insensitive" } },
            { title: { contains: "calsan", mode: "insensitive" } },
          ],
        },
        {
          NOT: {
            OR: [
              { title: { contains: "ortu", mode: "insensitive" } },
              { title: { contains: "orang tua", mode: "insensitive" } },
              { title: { contains: "orangtua", mode: "insensitive" } },
              { title: { contains: "wali", mode: "insensitive" } },
              { title: { contains: "cawalsan", mode: "insensitive" } },
            ],
          },
        },
      ],
    };
  } else if (category === "LISAN_ARAB") {
    titleWhere = {
      OR: [
        { title: { contains: "arab", mode: "insensitive" } },
        { title: { contains: "lisan", mode: "insensitive" } },
      ],
    };
  } else if (category === "HAFALAN") {
    titleWhere = {
      title: { contains: "hafalan", mode: "insensitive" },
    };
  }

  // 2. Cari semua sesi yang memiliki waktu mulai yang sama dan kategori yang sama
  const sessions = await prisma.examSession.findMany({
    where: {
      start_time: startTime,
      ...titleWhere,
      is_active: true },
    select: {
      id: true,
      created_by: true,
      booked_count: true,
      quota: true,
      start_time: true,
      end_time: true,
      creator: {
        select: {
          jenis_kelamin: true } } } });

  if (sessions.length === 0) return null;

  // 2.5 Cek penguji yang sedang sibuk/terjadwal di jam yang sama pada kategori apapun
  const busyExaminers = await prisma.jadwalUjian.findMany({
    where: {
      exam_session: {
        start_time: { lte: startTime },
        end_time: { gt: startTime },
      },
    },
    select: {
      penguji_quran_id: true,
      penguji_santri_id: true,
      penguji_ortu_id: true,
      penguji_arab_id: true,
      exam_session: { select: { created_by: true } },
    },
  });

  const busyExaminerIds = new Set<string>();
  busyExaminers.forEach((b) => {
    if (b.penguji_quran_id) busyExaminerIds.add(b.penguji_quran_id);
    if (b.penguji_santri_id) busyExaminerIds.add(b.penguji_santri_id);
    if (b.penguji_ortu_id) busyExaminerIds.add(b.penguji_ortu_id);
    if (b.penguji_arab_id) busyExaminerIds.add(b.penguji_arab_id);
    if (b.exam_session?.created_by) busyExaminerIds.add(b.exam_session.created_by);
  });

  // 3. Filter sesi yang masih memiliki kuota, memiliki pencipta (penguji), bebas bentrokan jadwal, dan mencocokkan jenis kelamin (jika disediakan)
  const jk = pendaftarGender?.toUpperCase() || "";
  const isPendaftarPutra = jk === "L" || jk === "LAKI-LAKI" || jk.includes("PUTRA");

  const availableSessions = sessions.filter((s) => {
    if (s.booked_count >= s.quota || !s.created_by) return false;
    // Exclude if examiner is already occupied at this time
    if (busyExaminerIds.has(s.created_by)) return false;
    
    // Jika gender pendaftar disediakan, filter berdasarkan gender penguji
    if (pendaftarGender) {
      const creatorJk = s.creator?.jenis_kelamin?.toUpperCase() || "";
      if (!creatorJk) return true;
      
      const isCreatorPutra = creatorJk === "L" || creatorJk === "LAKI-LAKI" || creatorJk.includes("PUTRA");
      return isCreatorPutra === isPendaftarPutra;
    }
    return true;
  });
  if (availableSessions.length === 0) return null;

  // 4. Ambil semua ID penguji unik dari pool sesi tersebut
  const examinerIds = Array.from(
    new Set(availableSessions.map((s) => s.created_by!)),
  );

  // 5. Hitung total beban kerja (jumlah jadwal) untuk masing-masing penguji di pool
  const examinersWithLoad = await Promise.all(
    examinerIds.map(async (id) => {
      const count = await prisma.jadwalUjian.count({
        where: {
          tahun_ajaran_id: tahunAjaranId,
          pendaftar: {
            deleted_at: null,
            NOT: {
              nama_lengkap: {
                contains: "tes",
                mode: "insensitive" } } },
          OR: [
            { penguji_quran_id: id },
            { penguji_santri_id: id },
            { penguji_ortu_id: id },
            { penguji_arab_id: id },
          ] } });
      return { id, count };
    }),
  );

  // 6. Urutkan berdasarkan beban kerja terendah (Pemerataan)
  examinersWithLoad.sort((a, b) => a.count - b.count);
  const winnerId = examinersWithLoad[0].id;

  // 7. Cari session_id yang dimiliki oleh pemenang tersebut
  const winningSession = availableSessions.find(
    (s) => s.created_by === winnerId,
  );

  if (!winningSession) return null;

  return {
    examiner_id: winnerId,
    session_id: winningSession.id };
}
