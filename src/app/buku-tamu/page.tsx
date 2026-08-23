"use client";

import { useState, useEffect } from "react";
import { Users, Search, Building, User, ChevronRight, CheckCircle2, UserCheck, ArrowRight } from "lucide-react";

type Kategori = "WALI_SANTRI" | "SURVEY" | "DINAS" | "UMUM" | null;

export default function BukuTamuKiosk() {
  const [step, setStep] = useState(0);
  const [kategori, setKategori] = useState<Kategori>(null);
  
  // Form State
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const [alamat, setAlamat] = useState("");
  const [instansi, setInstansi] = useState("");
  const [keperluan, setKeperluan] = useState("");

  const [currentTime, setCurrentTime] = useState("");
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
      setCurrentDay(now.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setStep(0);
    setKategori(null);
    setNama(""); setWa(""); setAlamat(""); setInstansi(""); setKeperluan("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Success Screen
    setTimeout(() => {
      resetForm();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-100 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-100 rounded-full blur-3xl opacity-40 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl p-6">
        
        {/* STEP 0: WELCOME SCREEN */}
        {step === 0 && (
          <div 
            onClick={() => setStep(1)}
            className="flex flex-col items-center justify-center min-h-[60vh] cursor-pointer hover:scale-[1.02] transition-transform duration-500"
          >
            <div className="bg-white/80 backdrop-blur-xl p-16 rounded-[3rem] shadow-2xl shadow-primary-500/10 text-center border border-white">
              <img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-8 drop-shadow-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Ahlan wa Sahlan</h1>
              <p className="text-2xl text-slate-600 mb-12">Pesantren Al-Andalus / Al-Imam</p>
              
              <div className="inline-flex items-center gap-4 bg-primary-600 text-white px-8 py-5 rounded-full font-bold text-xl shadow-lg shadow-primary-600/30 animate-pulse">
                <span>Sentuh Layar Untuk Mengisi Buku Tamu</span>
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-8 text-slate-500 font-medium tracking-wide">
              {currentDay} • {currentTime} WIB
            </div>
          </div>
        )}

        {/* STEP 1: PILIH KATEGORI */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-black text-center mb-2">Pilih Kategori Tamu</h2>
            <p className="text-center text-slate-500 mb-10">Silakan pilih kategori kunjungan Anda hari ini</p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: "WALI_SANTRI", title: "Wali Santri", desc: "Orang tua / wali dari santri aktif", icon: Users, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                { id: "SURVEY", title: "Tamu Survey", desc: "Calon pendaftar yang ingin survey lokasi", icon: Search, color: "bg-blue-50 text-blue-600 border-blue-200" },
                { id: "DINAS", title: "Tamu Dinas", desc: "Kunjungan resmi / instansi pemerintahan", icon: Building, color: "bg-violet-50 text-violet-600 border-violet-200" },
                { id: "UMUM", title: "Tamu Umum", desc: "Kunjungan personal / silaturahmi", icon: User, color: "bg-orange-50 text-orange-600 border-orange-200" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setKategori(item.id as Kategori);
                    setStep(2);
                  }}
                  className={\`flex flex-col items-center p-8 bg-white rounded-3xl border-2 hover:border-primary-500 hover:shadow-xl transition-all group \${kategori === item.id ? 'border-primary-500 ring-4 ring-primary-500/20' : 'border-slate-100'}\`}
                >
                  <div className={\`p-5 rounded-2xl mb-4 transition-transform group-hover:scale-110 \${item.color}\`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 text-center">{item.desc}</p>
                </button>
              ))}
            </div>
            
            <button onClick={() => setStep(0)} className="mt-12 mx-auto flex items-center text-slate-400 hover:text-slate-600 font-medium">
              Kembali ke Halaman Awal
            </button>
          </div>
        )}

        {/* STEP 2: FORM IDENTITAS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Lengkapi Data Diri</h2>
                <p className="text-slate-500 mt-1">Kategori: <span className="font-bold text-primary-600">{kategori?.replace("_", " ")}</span></p>
              </div>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                Ganti Kategori
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nama Lengkap (Beserta Gelar)</label>
                  <input type="text" required value={nama} onChange={e => setNama(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg" placeholder="Cth: Budi Santoso, S.Pd" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nomor WhatsApp Aktif</label>
                  <input type="tel" required value={wa} onChange={e => setWa(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg" placeholder="08123456789" />
                </div>
              </div>

              {(kategori === "DINAS" || kategori === "UMUM") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <label className="text-sm font-bold text-slate-700">Asal Instansi / Perusahaan</label>
                  <input type="text" required value={instansi} onChange={e => setInstansi(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg" placeholder="Cth: Kemenag / Universitas Terbuka" />
                </div>
              )}

              {(kategori === "WALI_SANTRI") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <label className="text-sm font-bold text-slate-700">Nama Santri (Yang Dikunjungi)</label>
                  <input type="text" required value={instansi} onChange={e => setInstansi(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg" placeholder="Cth: Ahmad Fulan bin Budi (Kelas 10)" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Asal Kota / Alamat Singkat</label>
                <input type="text" required value={alamat} onChange={e => setAlamat(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg" placeholder="Cth: Jakarta Selatan" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Keperluan & Ingin Bertemu Siapa?</label>
                <textarea required value={keperluan} onChange={e => setKeperluan(e.target.value)} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg resize-none" placeholder="Cth: Ingin survey lokasi dan bertemu bagian pendaftaran..." />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary-600/20 transition-all hover:scale-[1.02]">
                  Simpan Buku Tamu
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS SCREEN */}
        {step === 3 && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">Terima Kasih, {nama.split(' ')[0]}!</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-lg">
              Data Anda telah tersimpan. Sistem sedang mengirimkan notifikasi kepada <strong>Ustadz Piket / Resepsionis</strong>. Mohon tunggu sebentar di ruang lobi.
            </p>
            <p className="text-sm text-slate-400 font-medium animate-pulse">Layar ini akan kembali secara otomatis...</p>
          </div>
        )}

      </div>
    </div>
  );
}
