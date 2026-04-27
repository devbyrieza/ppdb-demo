import { prisma } from "../prisma";

/**
 * Mencari penguji dengan beban kerja paling ringan dari sekumpulan sesi yang tersedia di waktu yang sama.
 * 
 * @param startTime Waktu mulai ujian
 * @param category Kategori ujian (QURAN, W_SANTRI, W_ORTU)
 * @param tahunAjaranId ID Tahun Ajaran aktif
 * @returns Object berisi examiner_id dan session_id pemenang, atau null jika tidak ada pilihan
 */
export async function getLeastLoadedExaminerFromPool(
    startTime: Date,
    category: string,
    tahunAjaranId: string
) {
    // 1. Tentukan kata kunci pencarian berdasarkan kategori
    let searchKeyword = "";
    if (category === 'QURAN') searchKeyword = "qur";
    else if (category === 'W_SANTRI') searchKeyword = "santri";
    else if (category === 'W_ORTU') searchKeyword = "ortu";

    // 2. Cari semua sesi yang memiliki waktu mulai yang sama dan kategori yang sama
    const sessions = await prisma.examSession.findMany({
        where: {
            start_time: startTime,
            title: { contains: searchKeyword, mode: 'insensitive' },
            is_active: true,
        },
        select: {
            id: true,
            created_by: true,
            booked_count: true,
            quota: true,
        }
    });

    if (sessions.length === 0) return null;

    // 3. Filter sesi yang masih memiliki kuota dan memiliki pencipta (penguji)
    const availableSessions = sessions.filter(s => s.booked_count < s.quota && s.created_by);
    if (availableSessions.length === 0) return null;

    // 4. Ambil semua ID penguji unik dari pool sesi tersebut
    const examinerIds = Array.from(new Set(availableSessions.map(s => s.created_by!)));

    // 5. Hitung total beban kerja (jumlah jadwal) untuk masing-masing penguji di pool
    const examinersWithLoad = await Promise.all(examinerIds.map(async (id) => {
        const count = await prisma.jadwalUjian.count({
            where: {
                tahun_ajaran_id: tahunAjaranId,
                pendaftar: {
                    deleted_at: null,
                    NOT: {
                        nama_lengkap: {
                            contains: "tes",
                            mode: 'insensitive'
                        }
                    }
                },
                OR: [
                    { penguji_quran_id: id },
                    { penguji_santri_id: id },
                    { penguji_ortu_id: id },
                ]
            }
        });
        return { id, count };
    }));

    // 6. Urutkan berdasarkan beban kerja terendah (Pemerataan)
    examinersWithLoad.sort((a, b) => a.count - b.count);
    const winnerId = examinersWithLoad[0].id;

    // 7. Cari session_id yang dimiliki oleh pemenang tersebut
    const winningSession = availableSessions.find(s => s.created_by === winnerId);

    if (!winningSession) return null;

    return {
        examiner_id: winnerId,
        session_id: winningSession.id
    };
}
