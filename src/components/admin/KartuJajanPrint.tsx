import React from 'react';
import { Phone, Globe } from "lucide-react";
import { BRANDING } from "@/config/branding";

interface Santri {
  id: string;
  nomor_pendaftaran: string;
  nis?: string;
  nama_lengkap: string;
  jenjang: string;
}

interface KartuJajanPrintProps {
  santri: Santri;
  fotoUrl?: string; // Nanti bisa dikirim dari database, sementara kita sediakan default
}

export default function KartuJajanPrint({ santri, fotoUrl }: KartuJajanPrintProps) {
  // Jika tidak ada foto khusus dari database, gunakan foto almamater yang di-upload user sebagai default
  const defaultFoto = ""; // Foto santri diambil dari database; jika kosong gunakan avatar otomatis

  return (
    <>
      {/* ===================== KARTU BAGIAN DEPAN ===================== */}
      <div className="w-[54mm] h-[86mm] bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden print:shadow-none print:border-none shrink-0" style={{ margin: '0 auto', boxSizing: 'border-box', border: '2px solid #F59E0B' }}>
      
      {/* Background Header - Maroon & Gold Accent */}
      <div className="absolute top-0 left-0 w-full h-[35%] z-0" style={{ backgroundColor: '#E11D74', borderBottom: '4px solid #F59E0B' }}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-3 px-3 pb-6 w-full h-full">
        
        {/* Pattern Background Tipis di Area Putih Depan */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] mt-[35%]"
          style={{ 
            backgroundImage: "url('/images/pattern.svg')", 
            backgroundSize: '15mm' 
          }}
        ></div>

        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-3 drop-shadow-2xl relative z-10">
          <img src={BRANDING.logoPath} alt={`Logo ${BRANDING.schoolShortName}`} className="w-8 h-8 rounded-full object-cover border-[1.5px] border-gold-500/80 mb-1.5" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 className="text-white text-[10px] font-black tracking-widest uppercase">{BRANDING.schoolName}</h1>
        </div>
        
        {/* Foto Container dengan Auto-Crop yang Diperbaiki */}
        <div className="w-20 h-28 rounded-md overflow-hidden shadow-2xl bg-white z-10 relative mt-1" style={{ border: '3px solid #D4AF37' }}>
          <img 
            src={fotoUrl || defaultFoto} 
            alt={`Foto ${santri.nama_lengkap}`}
            className="absolute top-0 left-0 w-full h-[130%] object-cover"
            style={{ objectPosition: 'center top' }} // Memotong bagian perut, fokus ke dada dan wajah
            onError={(e) => {
              e.currentTarget.src = "https://ui-avatars.com/api/?name=" + santri.nama_lengkap + "&background=0D7A5F&color=D4AF37";
            }}
          />
        </div>

        {/* Info Santri (Text in Maroon) */}
        <div className="mt-4 text-center w-full px-1 flex-1 flex flex-col justify-center relative z-10">
          <h2 className="text-[11.5px] font-black leading-tight uppercase line-clamp-2" style={{ color: '#E11D74' }}>
            {santri.nama_lengkap}
          </h2>
          <p className="text-[8px] font-bold mt-1 uppercase tracking-widest" style={{ color: '#F59E0B' }}>
            {santri.jenjang || "SMP IT"}
          </p>
        </div>

        {/* QR Code */}
        <div className="mt-auto mb-1 bg-white p-1 rounded-md border border-slate-200 shadow-sm relative z-10">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${santri.nis || santri.nomor_pendaftaran}`} 
            alt="QR Code" 
            className="w-[45px] h-[45px]"
          />
        </div>

        {/* Footer Area */}
        <div className="w-full h-5 flex items-center justify-center absolute bottom-0 left-0 z-20" style={{ backgroundColor: '#E11D74', borderTop: '2px solid #F59E0B' }}>
          <p className="text-[6.5px] font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>NIS: {santri.nis || '-'}</p>
        </div>

      </div>
    </div>

      {/* ===================== KARTU BAGIAN BELAKANG ===================== */}
      <div className="w-[54mm] h-[86mm] bg-white rounded-2xl shadow-2xl flex flex-col relative overflow-hidden print:shadow-none print:border-none shrink-0" style={{ margin: '0 auto', boxSizing: 'border-box', border: '2px solid #F59E0B' }}>
        
        {/* Watermark Gedung (Sangat Transparan agar teks tetap terbaca 100%) */}
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{ 
            backgroundImage: "url('/images/campus-academic-building.webp')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        ></div>

        {/* Header Belakang */}
        <div className="w-full text-center py-2 relative z-10" style={{ backgroundColor: '#E11D74', borderBottom: '2px solid #F59E0B' }}>
           <h2 className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#F59E0B' }}>Ketentuan Penggunaan</h2>
        </div>
        
        {/* Isi Ketentuan */}
        <div className="px-4 py-4 text-[7px] leading-[1.6] text-left flex-1 font-semibold relative z-10" style={{ color: '#E11D74' }}>
          <ol className="list-decimal pl-3 space-y-2">
             <li>Kartu ini berfungsi sebagai identitas resmi santri dan alat pembayaran elektronik (Kartu Jajan) di lingkungan {BRANDING.schoolName}.</li>
             <li>Segala bentuk transaksi wajib menggunakan kartu ini. Saldo dapat diisi ulang oleh wali santri melalui Portal Resmi.</li>
             <li>Kartu bersifat pribadi dan <strong>tidak dapat dipindahtangankan</strong> kepada siapapun.</li>
             <li>Apabila kartu hilang/rusak, santri wajib melapor kepada Bagian Administrasi (penggantian kartu dikenakan biaya).</li>
             <li>Kartu ini wajib dikembalikan apabila santri telah lulus atau berhenti.</li>
          </ol>
        </div>
        
        {/* Footer Belakang & Alamat */}
        <div className="w-full text-center p-2.5 mt-auto relative z-10 flex flex-col items-center justify-center" style={{ borderTop: '1px dashed #F59E0B', backgroundColor: '#fdfbf7' }}>
           <p className="text-[8px] font-black uppercase mb-1.5" style={{ color: '#E11D74' }}>{BRANDING.schoolName}</p>
           <p className="text-[5.5px] text-gray-600 font-bold leading-relaxed">{BRANDING.address}</p>
           <div className="flex justify-center items-center gap-3 mt-2 text-[6px] font-black" style={{ color: '#E11D74' }}>
             <span className="flex items-center gap-1"><Phone className="w-2 h-2" /> {BRANDING.phone}</span>
             <span className="flex items-center gap-1"><Globe className="w-2 h-2" /> {BRANDING.websiteUrl.replace(/^https?:\/\//, "")}</span>
           </div>
        </div>

      </div>
    </>
  );


}
