import { prisma } from "./prisma";

/**
 * Utility to mark a specific exam component as complete and trigger pendaftar status update if all done.
 */
export async function markExamComponentAsComplete({
  jadwalId,
  userId,
  componentType,
}: {
  jadwalId: string;
  userId: string;
  componentType?: "santri" | "quran" | "ortu";
}) {
  // 1. Get Jadwal
  const jadwal = await prisma.jadwalUjian.findUnique({
    where: { id: jadwalId },
    include: {
      pendaftar: {
        select: {
          id: true,
          nama_lengkap: true,
          no_hp: true,
          orang_tua: { select: { no_hp_ayah: true, no_hp_ibu: true } },
        },
      },
    },
  });

  if (!jadwal) throw new Error("Jadwal not found");

  // 2. Determine what to update
  const updates: any = {};
  let updatedField = "";

  // If componentType is provided, prioritize it (useful for backend automation where we know what's being saved)
  if (componentType) {
    if (componentType === "santri") {
      updates.status_santri = "completed";
      updatedField = "Seleksi Wawancara Santri";
    } else if (componentType === "quran") {
      updates.status_quran = "completed";
      updatedField = "Seleksi Al Qur'an";
    } else if (componentType === "ortu") {
      updates.status_ortu = "completed";
      updatedField = "Seleksi Wawancara Orang Tua";
    }
  } else {
    // Fallback to manual check (logic from original /complete endpoint)
    if (jadwal.penguji_santri_id === userId) {
      updates.status_santri = "completed";
      updatedField = "Seleksi Wawancara Santri";
    } else if (jadwal.penguji_quran_id === userId) {
      updates.status_quran = "completed";
      updatedField = "Seleksi Al Qur'an";
    } else if (jadwal.penguji_ortu_id === userId) {
      updates.status_ortu = "completed";
      updatedField = "Seleksi Wawancara Orang Tua";
    } else {
      // Check session creator fallback
      const sess = await prisma.examSession.findFirst({
        where: { id: jadwal.exam_session_id ?? undefined },
        select: { created_by: true, title: true },
      });
      if (sess && sess.created_by === userId) {
        const title = (sess.title || "").toLowerCase();
        if (title.includes("qur") || title.includes("quran")) {
          updates.status_quran = "completed";
          updates.penguji_quran_id = userId;
          updatedField = "Seleksi Al Qur'an";
        } else if (title.includes("calsan") || title.includes("santri")) {
          updates.status_santri = "completed";
          updates.penguji_santri_id = userId;
          updatedField = "Seleksi Wawancara Santri";
        } else if (
          title.includes("cawalsan") ||
          title.includes("ortu") ||
          title.includes("orang")
        ) {
          updates.status_ortu = "completed";
          updates.penguji_ortu_id = userId;
          updatedField = "Seleksi Wawancara Orang Tua";
        }
      }
    }
  }

  if (!updatedField) {
    throw new Error(
      "You are not assigned to this exam component or component type is unknown",
    );
  }

  // 3. Update Status
  const updatedJadwal = await prisma.jadwalUjian.update({
    where: { id: jadwalId },
    data: updates,
  });

  // 4. Check if ALL DONE
  const isSantriDone =
    !updatedJadwal.penguji_santri_id ||
    updatedJadwal.status_santri === "completed";
  const isQuranDone =
    !updatedJadwal.penguji_quran_id ||
    updatedJadwal.status_quran === "completed";
  const isOrtuDone =
    !updatedJadwal.penguji_ortu_id || updatedJadwal.status_ortu === "completed";

  const isAllDone = isSantriDone && isQuranDone && isOrtuDone;

  if (isAllDone) {
    // Recalculate scores — this will set status_pendaftaran to 'tested' only if ALL 6 score components are present
    // And it will trigger the notification only when it first reaches 'tested' state.
    const { recalculateNilaiUjian } = await import("./scoring");
    await recalculateNilaiUjian(jadwal.pendaftar_id);
  }

  return {
    success: true,
    updatedField,
    isAllDone,
  };
}
