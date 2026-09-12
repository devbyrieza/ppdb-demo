import { redirect } from "next/navigation";

export default function AdminInputJadwalPage() {
  redirect("/dashboard/admin/jadwal/plotting?tab=ketersediaan");
}
