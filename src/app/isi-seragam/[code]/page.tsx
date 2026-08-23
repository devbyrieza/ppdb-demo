import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { redirect } from "next/navigation";
import IsiSeragamClient from "./client";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

export default async function IsiSeragamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!code || !code.includes("-")) {
    redirect("/login?error=Kode_Tidak_Valid");
  }

  const [nomor_pendaftaran, hash] = code.split("-");

  const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
    .update(nomor_pendaftaran)
    .digest("hex")
    .slice(0, 8);

  if (hash !== expectedHash) {
    redirect("/login?error=Kode_Tidak_Valid");
  }

  const pendaftar = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran },
    select: {
      id: true,
      nama_lengkap: true,
      nomor_pendaftaran: true,
      ukuran_seragam_baju: true,
      ukuran_seragam_celana: true,
      ukuran_seragam_almamater: true }
  });

  if (!pendaftar) {
    redirect("/login?error=Pendaftar_Tidak_Ditemukan");
  }

  return <IsiSeragamClient code={code} pendaftar={pendaftar} />;
}
