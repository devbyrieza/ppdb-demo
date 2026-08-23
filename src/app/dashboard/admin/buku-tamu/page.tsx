"use client";

import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle2, UserPlus, Star, Shield, ArrowRight } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

// The Roster based on user instructions
const ROSTER: Record<number, string> = {
  1: "Ustadz Rieza Eka Tomara, S.Kom.",
  2: "Ustadz Agus Cahyono",
  3: "Ustadz Muhammad Iqbal, S.Kom.",
  4: "Ustadz Maulidin Bachtiar, Amd.Kom.",
  5: "Ustadz Imron Amrullah",
  6: "Ustadz Wahyudi Pranata, Lc.",
  0: "Bebas (Siapa Saja yang Hadir)" // Ahad
};

type TamuStatus = "WAITING" | "HANDLED" | "FINISHED";

interface Tamu {
  id: string;
  nama: string;
  kategori: string;
  keperluan: string;
  waktu: string;
  status: TamuStatus;
  handledBy: string[]; // Can be multiple Ustadz
}

export default function RadarTamuAdmin() {
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [piketHariIni, setPiketHariIni] = useState("");
  
  // Dummy Data for Demo
  const [daftarTamu, setDaftarTamu] = useState<Tamu[]>([
    { id: "1", nama: "Bpk. Budi Santoso", kategori: "Tamu Survey", keperluan: "Ingin melihat fasilitas asrama putra", waktu: "09:15", status: "WAITING", handledBy: [] },
    { id: "2", nama: "Ibu Siti Aminah", kategori: "Wali Santri", keperluan: "Menjenguk Ananda Fulan kelas 10", waktu: "09:30", status: "WAITING", handledBy: [] },
  ]);

  useEffect(() => {
    const today = new Date().getDay();
    setDayOfWeek(today);
    setPiketHariIni(ROSTER[today]);
  }, []);

  const handleClaim = (id: string, isTakeover: boolean = false) => {
    // In real app, this takes the logged in admin's name. For demo, we use prompt or just current Piket.
    const currentUser = piketHariIni; // Simulation
    
    setDaftarTamu(prev => prev.map(tamu => {
      if (tamu.id === id) {
        if (isTakeover) {
          // Add to the array of handlers (transfer baton)
          return { ...tamu, status: "HANDLED", handledBy: [...tamu.handledBy, currentUser] };
        } else {
          return { ...tamu, status: "HANDLED", handledBy: [currentUser] };
        }
      }
      return tamu;
    }));
  };

  const handleFinish = (id: string) => {
    setDaftarTamu(prev => prev.map(tamu => {
      if (tamu.id === id) return { ...tamu, status: "FINISHED" };
      return tamu;
    }));
    // In real app, this triggers the WA Survey Blast!
    alert("Kunjungan Selesai. Link Survei Kepuasan (Rating) telah dikirim via WhatsApp ke tamu secara otomatis!");
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header & Roster Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-900 to-primary-700 p-8 rounded-3xl text-white shadow-xl shadow-primary-900/20">
          <div>
            <h1 className="text-3xl font-black mb-2">Live Radar Tamu</h1>
            <p className="text-primary-100 font-medium">Sistem Monitoring & Resepsionis Digital Al-Andalus</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-1">Jadwal Piket Hari Ini</div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-gold-400" />
              <span className="text-xl font-black text-white">{piketHariIni}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Total Tamu Hari Ini</p>
              <p className="text-2xl font-black text-slate-800">{daftarTamu.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Menunggu (Lobi)</p>
              <p className="text-2xl font-black text-slate-800">{daftarTamu.filter(t=>t.status === 'WAITING').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Sedang Disambut</p>
              <p className="text-2xl font-black text-slate-800">{daftarTamu.filter(t=>t.status === 'HANDLED').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-gold-50 text-gold-600 rounded-2xl"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-bold text-slate-500">Rating Rata-rata</p>
              <p className="text-2xl font-black text-slate-800">4.9 <span className="text-sm text-slate-400 font-medium">/ 5.0</span></p>
            </div>
          </div>
        </div>

        {/* Live Radar List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Tamu di Lobi (Live)
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {daftarTamu.map((tamu) => (
              <div key={tamu.id} className={\`p-6 rounded-2xl border-2 transition-all \${tamu.status === 'WAITING' ? 'border-orange-200 bg-orange-50/30' : tamu.status === 'HANDLED' ? 'border-primary-200 bg-primary-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}\`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Guest Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={\`px-3 py-1 rounded-full text-xs font-black \${tamu.status === 'WAITING' ? 'bg-orange-100 text-orange-700' : 'bg-primary-100 text-primary-700'}\`}>
                        {tamu.waktu} WIB
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        {tamu.kategori}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">{tamu.nama}</h3>
                    <p className="text-slate-600 text-sm font-medium"><strong>Keperluan:</strong> {tamu.keperluan}</p>
                    
                    {tamu.handledBy.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-lg w-max border border-primary-100">
                        <Shield className="w-4 h-4" />
                        Disambut oleh: <strong>{tamu.handledBy.join(" & ")}</strong>
                      </div>
                    )}
                  </div>

                  {/* Actions (The "Claim" Logic) */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {tamu.status === "WAITING" && (
                      <button onClick={() => handleClaim(tamu.id)} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20">
                        <UserPlus className="w-5 h-5" />
                        Sambut Tamu
                      </button>
                    )}
                    
                    {tamu.status === "HANDLED" && (
                      <>
                        <button onClick={() => handleFinish(tamu.id)} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="w-5 h-5" />
                          Selesai Kunjungan
                        </button>
                        <button onClick={() => handleClaim(tamu.id, true)} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600 px-6 py-3 rounded-xl font-bold transition-all">
                          <Users className="w-5 h-5" />
                          Ikut Gabung / Gantikan
                        </button>
                      </>
                    )}

                    {tamu.status === "FINISHED" && (
                      <div className="text-center text-slate-500 font-bold text-sm bg-slate-100 py-3 rounded-xl">
                        Survei Dikirim ✅
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
