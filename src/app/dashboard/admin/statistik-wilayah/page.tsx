import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { Map, MapPin, Users, PieChart as PieChartIcon } from "lucide-react";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Statistik Wilayah | Admin Dashboard",
};

export default async function StatistikWilayahPage() {
  const session = (await getServerSession()) as any;
  if (!session || !["admin_super"].includes(session.role)) {
    redirect("/login");
  }

  // Ambil data wilayah dari pendaftar
  const pendaftarList = await prisma.pendaftar.findMany({
    where: getAdminWhereClause(),
    select: {
      data_lengkap: true,
      jenjang: true,
      jenis_kelamin: true,
      status_proses: true,
    },
  });

  const statsProvinsi: Record<string, number> = {};
  const statsKabupaten: Record<string, number> = {};
  let totalData = 0;

  pendaftarList.forEach((p) => {
    const dataLengkap: any = p.data_lengkap;
    if (dataLengkap && dataLengkap.santri) {
      const { provinsi, kabupaten } = dataLengkap.santri;
      
      if (provinsi) {
        const provName = String(provinsi).trim().toUpperCase();
        statsProvinsi[provName] = (statsProvinsi[provName] || 0) + 1;
        totalData++;
      }
      
      if (kabupaten) {
        const kabName = String(kabupaten).trim().toUpperCase();
        statsKabupaten[kabName] = (statsKabupaten[kabName] || 0) + 1;
      }
    }
  });

  // Sort by highest count
  const sortedProvinsi = Object.entries(statsProvinsi)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15); // Top 15

  const sortedKabupaten = Object.entries(statsKabupaten)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-br from-primary-600 to-primary-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-secondary-300 shadow-inner">
            <Map className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Statistik Wilayah
            </h1>
            <p className="text-primary-100 mt-1 font-medium">
              Analisis sebaran asal daerah seluruh calon santri
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provinsi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-primary-950">Top 15 Provinsi</h2>
              <p className="text-xs text-ink-500 font-medium">Asal daerah pendaftar (berdasarkan data lengkap)</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {sortedProvinsi.length > 0 ? (
              sortedProvinsi.map(([name, count], idx) => {
                const percentage = Math.round((count / totalData) * 100);
                return (
                  <div key={name} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-bold text-ink-700 flex items-center gap-2">
                        <span className="text-xs font-black text-ink-400 w-4">{idx + 1}.</span> {name}
                      </span>
                      <span className="text-sm font-black text-primary-600">
                        {count} <span className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-ink-50 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-ink-400">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Belum ada data wilayah</p>
              </div>
            )}
          </div>
        </div>

        {/* Kabupaten */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-primary-950">Top 20 Kabupaten/Kota</h2>
              <p className="text-xs text-ink-500 font-medium">Distribusi kota asal terbanyak</p>
            </div>
          </div>

          <div className="space-y-4">
            {sortedKabupaten.length > 0 ? (
              sortedKabupaten.map(([name, count], idx) => {
                const percentage = Math.round((count / totalData) * 100);
                return (
                  <div key={name} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-bold text-ink-700 flex items-center gap-2">
                        <span className="text-xs font-black text-ink-400 w-4">{idx + 1}.</span> {name}
                      </span>
                      <span className="text-sm font-black text-primary-600">
                        {count} <span className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-ink-50 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-ink-400">
                <PieChartIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Belum ada data wilayah</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
