
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Printer } from 'lucide-react';
import { PDF_BRANDING } from '@/config/pdf-branding';

interface StudentData {
    id: string;
    nama_lengkap: string;
    nomor_pendaftaran: string;
    jenjang: string;
    nisn?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    foto_profil?: string;
    jadwal?: {
        jenis_ujian: string;
        tanggal_ujian: string;
        waktu: string;
        lokasi: string;
    }[];
}

export default function ExamCardPage() {
    const [data, setData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data
        const fetchData = async () => {
            try {
                // We reuse existing endpoints to compile data
                const [meRes, jadwalRes] = await Promise.all([
                    fetch('/api/auth/me').then(r => r.json()),
                    fetch('/api/pendaftar/jadwal').then(r => r.json())
                ]);

                // Also need full profile for NISN etc. 
                // Maybe /api/auth/me gives minimal info.
                // Let's try fetching pendaftar detail if we have ID.
                const pendaftarId = meRes.pendaftar_id;
                let profileData = meRes;

                // Construct object
                const student: StudentData = {
                    id: pendaftarId,
                    nama_lengkap: profileData.full_name || 'Nama Santri',
                    nomor_pendaftaran: profileData.nomor_pendaftaran || 'REG-0000',
                    jenjang: profileData.role === 'admin' ? 'ADMIN' : (profileData.jenjang || 'MTs'), // Fallback
                    // Mocking some details if not available in session
                    tempat_lahir: '-',
                    tanggal_lahir: '-',
                    jadwal: jadwalRes.data?.map((j: any) => ({
                        jenis_ujian: j.jenis_ujian,
                        tanggal_ujian: new Date(j.tanggal_ujian).toLocaleDateString('id-ID'),
                        waktu: j.waktu_mulai.substring(0, 5),
                        lokasi: j.lokasi || 'Pesantren Al Andalus Ulul Albaab'
                    })) || []
                };

                setData(student);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Add print style
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                @page { size: A4; margin: 2cm; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none !important; }
                .print-border { border: 2px solid #000 !important; }
            }
        `;
        document.head.appendChild(style);
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!data) return <div>Data tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            {/* Toolbar */}
            <div className="w-full max-w-[21cm] mb-6 flex justify-between items-center no-print">
                <h1 className="text-xl font-bold">Pratinjau Jadwal</h1>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    <Printer className="w-4 h-4" /> Cetak Jadwal
                </button>
            </div>

            {/* A4 Paper simulating div */}
            <div className="bg-white shadow-xl w-full max-w-[21cm] min-h-[29.7cm] p-[2cm] relative print:shadow-none print:w-full print:p-0">
                {/* Header with Border */}
                <div className="border-2 border-black p-1 mb-1">
                    <div className="border border-black p-6 relative">
                        {/* Watermark/Background Logo could go here */}

                        {/* KOP - Professional Institutional Style (Polished version) */}
                        <div className="flex items-center border-b-4 border-black pb-4 mb-6 relative">
                            {/* Logo (Droplet) */}
                            <div className="w-16 h-28 shrink-0 flex items-center justify-center border-r border-stone-300 pr-5">
                                <img src={PDF_BRANDING.assets.logo} alt="Logo" className="h-full object-contain" />
                            </div>
                            
                            {/* Text Info (More Padding) */}
                            <div className="flex-grow pl-8 text-left">
                                <p className="text-[11px] font-sans font-medium text-stone-500 uppercase tracking-widest leading-tight">{PDF_BRANDING.institution.subtitle}</p>
                                <h1 className="text-2xl font-serif font-black uppercase text-brand-blue-900 mb-1 leading-tight tracking-tight">{PDF_BRANDING.institution.committee}</h1>
                                <p className="text-sm font-serif font-bold text-gray-800 mb-1">Tahun Ajaran {PDF_BRANDING.institution.academic_year}</p>
                                <div className="text-[9px] leading-tight font-sans text-stone-400 mt-2">
                                    <p>{PDF_BRANDING.institution.address}</p>
                                    <p className="mt-0.5">{PDF_BRANDING.institution.contact}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Secondary Double line for HTML preview to match PDF */}
                        <div className="absolute left-[2cm] right-[2cm] h-0.5 bg-black -mt-6"></div>

                        <div className="text-center mb-8">
                            <span className="bg-black text-white px-6 py-2 font-bold text-xl uppercase tracking-widest inline-block rounded-sm">JADWAL SELEKSI SANTRI</span>
                        </div>

                        <div className="mb-8 font-serif">
                            <div className="bg-gray-50 p-4 border border-gray-200 rounded text-sm">
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <span className="col-span-3 font-bold">Nomor Pendaftaran</span>
                                    <span className="col-span-9">: {data.nomor_pendaftaran}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <span className="col-span-3 font-bold">Nama Lengkap</span>
                                    <span className="col-span-9 uppercase">: {data.nama_lengkap}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-2">
                                    <span className="col-span-3 font-bold">Jenjang</span>
                                    <span className="col-span-9">: {data.jenjang}</span>
                                </div>
                            </div>
                        </div>

                        {/* Jadwal Table */}
                        <div className="mb-8">
                            <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Rincian Jadwal Ujian</h3>
                            <table className="w-full border-collapse border border-black text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-2 text-left">Mata Ujian</th>
                                        <th className="border border-black p-2 text-left">Hari, Tanggal</th>
                                        <th className="border border-black p-2 text-left">Waktu</th>
                                        <th className="border border-black p-2 text-left">Lokasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.jadwal && data.jadwal.length > 0 ? (
                                        data.jadwal.map((j, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-2 font-medium">{j.jenis_ujian}</td>
                                                <td className="border border-black p-2">{j.tanggal_ujian}</td>
                                                <td className="border border-black p-2">{j.waktu} WIB</td>
                                                <td className="border border-black p-2">{j.lokasi}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border border-black p-4 text-center italic text-gray-500">Jadwal belum dipilih/ditentukan</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Tata Tertib */}
                        <div className="mb-12">
                            <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Tata Tertib Peserta</h3>
                            <ol className="list-decimal list-outside pl-5 text-sm space-y-1 text-justify">
                                <li>Jadwal ini harap dibawa saat mengikuti rangkaian tes seleksi.</li>
                                <li>Peserta diharapkan hadir 30 menit sebelum jadwal ujian dimulai.</li>
                                <li>Mengenakan pakaian muslim/muslimah yang rapi dan sopan.</li>
                                <li>Untuk ujian online, pastikan perangkat dan koneksi internet stabil.</li>
                            </ol>
                        </div>

                        {/* Signature */}
                        <div className="flex justify-end mt-12">
                            <div className="text-center w-48">
                                <p className="mb-20">Sukabumi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="font-bold underline uppercase">Panitia PPDB Ulul Albaab</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs mt-2 italic text-gray-400 no-print">* Dokumen ini dicetak otomatis oleh sistem komputer.</p>
            </div>
        </div>
    );
}
