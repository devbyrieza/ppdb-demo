// ============================================================================
// ADVANCED FILTER: Dynamic Prisma Query Builder
// Digunakan oleh Admin Super untuk query builder kompleks
// ============================================================================

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ============================================================================
// FILTER CRITERIA INTERFACE
// ============================================================================

export interface FilterCriteria {
    // Basic Filters
    search?: string;
    status?: string | string[];
    jenjang?: string;
    jenis_kelamin?: string;
    tahun_ajaran_id?: string;

    // Wilayah Filters
    provinsi?: string;
    kabupaten?: string;
    kecamatan?: string;
    kelurahan?: string;

    // Orang Tua / Wali Filters
    penghasilan_ayah_min?: number;
    penghasilan_ayah_max?: number;
    penghasilan_ibu_min?: number;
    penghasilan_ibu_max?: number;
    pekerjaan_ayah?: string;
    pekerjaan_ibu?: string;
    pendidikan_ayah?: string;
    pendidikan_ibu?: string;

    // Sekolah Asal
    asal_sekolah?: string;
    tahun_lulus?: number;

    // Seleksi / Nilai
    status_seleksi?: string; // "DITERIMA" | "CADANGAN" | "DITOLAK"
    nilai_min?: number;
    nilai_max?: number;

    // Pembayaran
    status_pembayaran?: string;
    jenis_pembayaran?: string;

    // Hafalan
    jumlah_hafalan?: string;

    // Pagination & Sorting
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface FilterResult {
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    appliedFilters: string[];
}

// ============================================================================
// HELPER: Parse range penghasilan dari string ke number
// Format penghasilan di DB: "< 1.000.000", "1.000.000 - 3.000.000", "> 10.000.000"
// ============================================================================

function parseIncomeToNumber(income: string | null | undefined): number {
    if (!income) return 0;
    // Ambil angka terakhir dari string (misal "1.000.000 - 3.000.000" -> 3000000)
    const numbers = income.replace(/[^\d]/g, "");
    return parseInt(numbers) || 0;
}

// ============================================================================
// MAIN FILTER FUNCTION
// ============================================================================

export async function getStudentsByFilter(
    criteria: FilterCriteria
): Promise<FilterResult> {
    const {
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "desc",
    } = criteria;

    const skip = (page - 1) * limit;
    const appliedFilters: string[] = [];

    // Build WHERE clause dynamically
    const where: Prisma.PendaftarWhereInput = {};
    const andConditions: Prisma.PendaftarWhereInput[] = [];

    // ── Basic Search ──────────────────────────────────────────────
    if (criteria.search) {
        andConditions.push({
            OR: [
                { nama_lengkap: { contains: criteria.search, mode: "insensitive" } },
                { nik: { contains: criteria.search, mode: "insensitive" } },
                {
                    nomor_pendaftaran: {
                        contains: criteria.search,
                        mode: "insensitive",
                    },
                },
                { no_hp: { contains: criteria.search, mode: "insensitive" } },
                { asal_sekolah: { contains: criteria.search, mode: "insensitive" } },
            ],
        });
        appliedFilters.push(`Pencarian: "${criteria.search}"`);
    }

    // ── Status Pendaftaran ────────────────────────────────────────
    if (criteria.status) {
        if (Array.isArray(criteria.status)) {
            andConditions.push({
                status_pendaftaran: { in: criteria.status },
            });
        } else {
            andConditions.push({
                status_pendaftaran: criteria.status,
            });
        }
        appliedFilters.push(`Status: ${criteria.status}`);
    }

    // ── Jenjang ───────────────────────────────────────────────────
    if (criteria.jenjang) {
        andConditions.push({ jenjang: criteria.jenjang });
        appliedFilters.push(`Jenjang: ${criteria.jenjang}`);
    }

    // ── Jenis Kelamin ─────────────────────────────────────────────
    if (criteria.jenis_kelamin) {
        const genderValue = criteria.jenis_kelamin;
        const searchValues = ["L", "Laki-laki"].includes(genderValue)
            ? ["L", "Laki-laki"]
            : ["P", "Perempuan"];

        andConditions.push({
            jenis_kelamin: { in: searchValues }
        });

        appliedFilters.push(
            `Jenis Kelamin: ${searchValues.includes("L") ? "Laki-laki" : "Perempuan"}`
        );
    }

    // ── Tahun Ajaran ──────────────────────────────────────────────
    if (criteria.tahun_ajaran_id) {
        andConditions.push({ tahun_ajaran_id: criteria.tahun_ajaran_id });
        appliedFilters.push(`Tahun Ajaran: ${criteria.tahun_ajaran_id}`);
    }

    // ── Wilayah ───────────────────────────────────────────────────
    if (criteria.provinsi) {
        andConditions.push({
            provinsi: { contains: criteria.provinsi, mode: "insensitive" },
        });
        appliedFilters.push(`Provinsi: ${criteria.provinsi}`);
    }
    if (criteria.kabupaten) {
        andConditions.push({
            kabupaten: { contains: criteria.kabupaten, mode: "insensitive" },
        });
        appliedFilters.push(`Kabupaten: ${criteria.kabupaten}`);
    }
    if (criteria.kecamatan) {
        andConditions.push({
            kecamatan: { contains: criteria.kecamatan, mode: "insensitive" },
        });
        appliedFilters.push(`Kecamatan: ${criteria.kecamatan}`);
    }
    if (criteria.kelurahan) {
        andConditions.push({
            kelurahan: { contains: criteria.kelurahan, mode: "insensitive" },
        });
        appliedFilters.push(`Kelurahan: ${criteria.kelurahan}`);
    }

    // ── Sekolah Asal ──────────────────────────────────────────────
    if (criteria.asal_sekolah) {
        andConditions.push({
            asal_sekolah: { contains: criteria.asal_sekolah, mode: "insensitive" },
        });
        appliedFilters.push(`Asal Sekolah: ${criteria.asal_sekolah}`);
    }
    if (criteria.tahun_lulus) {
        andConditions.push({ tahun_lulus: criteria.tahun_lulus });
        appliedFilters.push(`Tahun Lulus: ${criteria.tahun_lulus}`);
    }

    // ── Hafalan ───────────────────────────────────────────────────
    if (criteria.jumlah_hafalan) {
        andConditions.push({
            jumlah_hafalan: {
                contains: criteria.jumlah_hafalan,
                mode: "insensitive",
            },
        });
        appliedFilters.push(`Jumlah Hafalan: ${criteria.jumlah_hafalan}`);
    }

    // ── Orang Tua / Penghasilan (Nested Filter) ──────────────────
    const orangTuaConditions: Prisma.OrangTuaWhereInput = {};
    let hasOrangTuaFilter = false;

    if (criteria.pekerjaan_ayah) {
        orangTuaConditions.pekerjaan_ayah = {
            contains: criteria.pekerjaan_ayah,
            mode: "insensitive",
        };
        hasOrangTuaFilter = true;
        appliedFilters.push(`Pekerjaan Ayah: ${criteria.pekerjaan_ayah}`);
    }

    if (criteria.pekerjaan_ibu) {
        orangTuaConditions.pekerjaan_ibu = {
            contains: criteria.pekerjaan_ibu,
            mode: "insensitive",
        };
        hasOrangTuaFilter = true;
        appliedFilters.push(`Pekerjaan Ibu: ${criteria.pekerjaan_ibu}`);
    }

    if (criteria.pendidikan_ayah) {
        orangTuaConditions.pendidikan_ayah = {
            contains: criteria.pendidikan_ayah,
            mode: "insensitive",
        };
        hasOrangTuaFilter = true;
        appliedFilters.push(`Pendidikan Ayah: ${criteria.pendidikan_ayah}`);
    }

    if (criteria.pendidikan_ibu) {
        orangTuaConditions.pendidikan_ibu = {
            contains: criteria.pendidikan_ibu,
            mode: "insensitive",
        };
        hasOrangTuaFilter = true;
        appliedFilters.push(`Pendidikan Ibu: ${criteria.pendidikan_ibu}`);
    }

    // Penghasilan filter — karena disimpan sebagai string di DB,
    // kita filter di level aplikasi setelah query
    const needsIncomeFilter =
        criteria.penghasilan_ayah_min !== undefined ||
        criteria.penghasilan_ayah_max !== undefined ||
        criteria.penghasilan_ibu_min !== undefined ||
        criteria.penghasilan_ibu_max !== undefined;

    if (needsIncomeFilter) {
        // Pastikan orang_tua harus ada
        orangTuaConditions.id = { not: undefined };
        hasOrangTuaFilter = true;

        if (criteria.penghasilan_ayah_min) {
            appliedFilters.push(
                `Penghasilan Ayah Min: Rp ${criteria.penghasilan_ayah_min.toLocaleString("id-ID")}`
            );
        }
        if (criteria.penghasilan_ayah_max) {
            appliedFilters.push(
                `Penghasilan Ayah Max: Rp ${criteria.penghasilan_ayah_max.toLocaleString("id-ID")}`
            );
        }
        if (criteria.penghasilan_ibu_min) {
            appliedFilters.push(
                `Penghasilan Ibu Min: Rp ${criteria.penghasilan_ibu_min.toLocaleString("id-ID")}`
            );
        }
        if (criteria.penghasilan_ibu_max) {
            appliedFilters.push(
                `Penghasilan Ibu Max: Rp ${criteria.penghasilan_ibu_max.toLocaleString("id-ID")}`
            );
        }
    }

    if (hasOrangTuaFilter) {
        andConditions.push({
            orang_tua: { is: orangTuaConditions },
        });
    }

    // ── Hasil Seleksi (Nested Filter) ─────────────────────────────
    // Logic untuk Status Seleksi
    if (criteria.status_seleksi) {
        const statusSeleksiCondition: any = {
            hasil_seleksi: {
                is: {
                    status_seleksi: criteria.status_seleksi,
                },
            },
        };
        andConditions.push(statusSeleksiCondition);
        appliedFilters.push(`Status Seleksi: ${criteria.status_seleksi}`);
    }

    // Logic untuk Nilai Seleksi
    if (criteria.nilai_min !== undefined || criteria.nilai_max !== undefined) {
        const nilaiFilter: any = {};
        if (criteria.nilai_min !== undefined) {
            nilaiFilter.gte = criteria.nilai_min;
            appliedFilters.push(`Nilai Min: ${criteria.nilai_min}`);
        }
        if (criteria.nilai_max !== undefined) {
            nilaiFilter.lte = criteria.nilai_max;
            appliedFilters.push(`Nilai Max: ${criteria.nilai_max}`);
        }
        const nilaiCondition: any = {
            hasil_seleksi: {
                is: {
                    nilai_akhir: nilaiFilter
                }
            }
        };
        andConditions.push(nilaiCondition);
    }

    // ── Pembayaran (Nested Filter) ────────────────────────────────
    if (criteria.status_pembayaran) {
        andConditions.push({
            pembayaran: {
                some: { status_pembayaran: criteria.status_pembayaran },
            },
        });
        appliedFilters.push(`Status Pembayaran: ${criteria.status_pembayaran}`);
    }

    if (criteria.jenis_pembayaran) {
        const pembayaranCondition: any = {
            pembayaran: {
                some: { jenis_pembayaran: criteria.jenis_pembayaran },
            },
        };
        andConditions.push(pembayaranCondition);
        appliedFilters.push(`Jenis Pembayaran: ${criteria.jenis_pembayaran}`);
    }

    // ── Combine all conditions ────────────────────────────────────
    if (andConditions.length > 0) {
        where.AND = andConditions;
    }

    // ── Build orderBy ─────────────────────────────────────────────
    const validSortFields = [
        "created_at",
        "nama_lengkap",
        "nomor_pendaftaran",
        "status_pendaftaran",
        "jenjang",
        "provinsi",
    ];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const orderBy: any = { [orderField]: sortOrder };

    // ── Execute Query ─────────────────────────────────────────────
    const [total, data] = await prisma.$transaction([
        prisma.pendaftar.count({ where }),
        prisma.pendaftar.findMany({
            where,
            select: {
                id: true,
                nomor_pendaftaran: true,
                nik: true,
                nama_lengkap: true,
                jenis_kelamin: true,
                jenjang: true,
                tempat_lahir: true,
                tanggal_lahir: true,
                alamat: true,
                provinsi: true,
                kabupaten: true,
                kecamatan: true,
                kelurahan: true,
                no_hp: true,
                email: true,
                asal_sekolah: true,
                tahun_lulus: true,
                jumlah_hafalan: true,
                status_pendaftaran: true,
                created_at: true,
                updated_at: true,

                // Relasi
                tahun_ajaran: {
                    select: { id: true, nama: true },
                },
                orang_tua: {
                    select: {
                        nama_ayah: true,
                        pekerjaan_ayah: true,
                        penghasilan_ayah: true,
                        pendidikan_ayah: true,
                        nama_ibu: true,
                        pekerjaan_ibu: true,
                        penghasilan_ibu: true,
                        pendidikan_ibu: true,
                        nama_wali: true,
                        hubungan_wali: true,
                        pekerjaan_wali: true,
                        penghasilan_wali: true,
                    },
                },
                pembayaran: {
                    select: {
                        id: true,
                        jenis_pembayaran: true,
                        tipe_cicilan: true,
                        jumlah: true,
                        status_pembayaran: true,
                    } as any,
                },
                dokumen: {
                    select: {
                        jenis_dokumen: true,
                        is_verified: true,
                    },
                },
                nilai_ujian: {
                    select: {
                        nilai_wawancara_santri: true,
                        nilai_tes_quran: true,
                        nilai_wawancara_ortu: true,
                        nilai_tes_tertulis_total: true,
                        nilai_total: true,
                    },
                },
                hasil_seleksi: {
                    select: {
                        status_seleksi: true,
                        nilai_akhir: true,
                        catatan_admin: true,
                    },
                } as any,
            } as any,
            orderBy,
            skip,
            take: limit,
        }),
    ]);

    // ── Post-process: Filter penghasilan (karena disimpan string) ──
    let filteredData = data;
    if (needsIncomeFilter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredData = data.filter((student: any) => {
            if (!student.orang_tua) return false;

            const incomeAyah = parseIncomeToNumber(
                student.orang_tua.penghasilan_ayah
            );
            const incomeIbu = parseIncomeToNumber(student.orang_tua.penghasilan_ibu);

            if (
                criteria.penghasilan_ayah_min &&
                incomeAyah < criteria.penghasilan_ayah_min
            )
                return false;
            if (
                criteria.penghasilan_ayah_max &&
                incomeAyah > criteria.penghasilan_ayah_max
            )
                return false;
            if (
                criteria.penghasilan_ibu_min &&
                incomeIbu < criteria.penghasilan_ibu_min
            )
                return false;
            if (
                criteria.penghasilan_ibu_max &&
                incomeIbu > criteria.penghasilan_ibu_max
            )
                return false;

            return true;
        });
    }

    return {
        data: filteredData,
        pagination: {
            page,
            limit,
            total: needsIncomeFilter ? filteredData.length : total,
            totalPages: Math.ceil(
                (needsIncomeFilter ? filteredData.length : total) / limit
            ),
        },
        appliedFilters,
    };
}

// ============================================================================
// AGGREGATION: Untuk Recharts visualization
// ============================================================================

export interface AggregationResult {
    label: string;
    value: number;
}

/**
 * Hitung statistik untuk chart pie/bar berdasarkan field tertentu.
 * Bisa digunakan untuk distribusi wilayah, jenis kelamin, jenjang, status, dll.
 */
export async function getAggregation(
    field: string,
    tahunAjaranId?: string
): Promise<AggregationResult[]> {
    const where: Prisma.PendaftarWhereInput = {};
    if (tahunAjaranId) {
        where.tahun_ajaran_id = tahunAjaranId;
    }

    // Mapping field ke kolom yang valid
    const validGroupFields: Record<string, string> = {
        jenis_kelamin: "jenis_kelamin",
        jenjang: "jenjang",
        provinsi: "provinsi",
        kabupaten: "kabupaten",
        status_pendaftaran: "status_pendaftaran",
        sumber_informasi: "sumber_informasi",
        golongan_darah: "golongan_darah",
    };

    const groupField = validGroupFields[field];
    if (!groupField) {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma.pendaftar.groupBy as any)({
        by: [groupField],
        _count: { id: true },
        where,
        orderBy: { _count: { id: "desc" } },
        take: 20,
    });

    return result.map((item: any) => ({
        label: item[groupField] || "Tidak Diketahui",
        value: item._count.id,
    }));
}

/**
 * Statistik pembayaran untuk chart Admin Keuangan & Admin Super
 */
export async function getPaymentStats(tahunAjaranId?: string) {
    const where: Prisma.PembayaranWhereInput = {};
    if (tahunAjaranId) {
        where.tahun_ajaran_id = tahunAjaranId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupByPayment = prisma.pembayaran.groupBy as any;

    const [byStatus, byJenis, byTipeCicilan, totalAmount] = await prisma.$transaction([
        groupByPayment({
            by: ["status_pembayaran"],
            _count: { id: true },
            _sum: { jumlah: true },
            where,
            orderBy: { _count: { id: "desc" } },
        }),
        groupByPayment({
            by: ["jenis_pembayaran"],
            _count: { id: true },
            _sum: { jumlah: true },
            where,
            orderBy: { _count: { id: "desc" } },
        }),
        groupByPayment({
            by: ["tipe_cicilan"],
            _count: { id: true },
            where,
            orderBy: { _count: { id: "desc" } },
        }),
        prisma.pembayaran.aggregate({
            _sum: { jumlah: true },
            where: { ...where, status_pembayaran: "verified" },
        }),
    ]);

    return {
        byStatus: (byStatus as any[]).map((s: any) => ({
            label: s.status_pembayaran,
            count: s._count.id,
            total: s._sum?.jumlah,
        })),
        byJenis: (byJenis as any[]).map((j: any) => ({
            label: j.jenis_pembayaran,
            count: j._count.id,
            total: j._sum?.jumlah,
        })),
        byTipeCicilan: (byTipeCicilan as any[]).map((t: any) => ({
            label: t.tipe_cicilan,
            count: t._count.id,
        })),
        totalVerified: totalAmount._sum.jumlah,
    };
}
