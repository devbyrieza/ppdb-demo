"use client";

import { useState, useEffect } from "react";
import {
  User,
  Activity,
  Award,
  BookOpen,
  MessageSquare,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Lock,
  Search,
  Filter,
  Users
} from "lucide-react";
import Swal from "sweetalert2";

// --- Types ---

interface Student {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  // Scores
  nilai_tes_quran: number | null;
  nilai_wawancara_santri: number | null;
  nilai_wawancara_ortu: number | null;
  catatan_quran: string | null;
  catatan_santri: string | null;
  catatan_ortu: string | null;
  // Details (Prisma/JSON)
  detail_quran: any | null;
  detail_wawancara: any | null;
  detail_cawalsan: any | null;
  // Meta
  input_at_quran: string | null;
  input_at_santri: string | null;
  input_at_ortu: string | null;
  roles: string[]; // ["quran", "wawancara", "ortu"]
}

// --- Component ---

export default function InputNilaiPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [activeRole, setActiveRole] = useState<string>("");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Form State
  const [formType, setFormType] = useState<'quran' | 'wawancara' | 'ortu'>('quran');
  const [formScore, setFormScore] = useState<number>(0);
  const [formNotes, setFormNotes] = useState("");
  const [formDetails, setFormDetails] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // --- Fetchers ---

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/penguji/peserta");
      const result = await res.json();
      if (res.ok) {
        setStudents(result.data || []);
      }
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // Also fetch current session for role detection
    fetch("/api/auth/session").then(res => res.json()).then(data => {
        if (data.session) setActiveRole(data.session.role);
    });
  }, []);

  // --- Handlers ---

  const openForm = (student: Student, type: 'quran' | 'wawancara' | 'ortu') => {
    // 1. Check for lock status (Ported logic from backend)
    const inputAt = type === 'quran' ? student.input_at_quran : 
                    type === 'wawancara' ? student.input_at_santri : 
                    student.input_at_ortu;
    
    const isAdmin = ['admin', 'admin_super', 'head_of_it'].includes(activeRole);
    if (inputAt && !isAdmin) {
      const lockDate = new Date(new Date(inputAt).getTime() + 24 * 60 * 60 * 1000);
      if (new Date() > lockDate) {
        Swal.fire('Terkunci!', 'Penilaian ini sudah tersimpan lebih dari 24 jam dan tidak dapat diubah lagi.', 'info');
        // We still allow viewing, but the save button will be hidden/disabled
      }
    }

    setSelectedStudent(student);
    setFormType(type);
    
    // Load existing values
    if (type === 'quran') {
      setFormScore(student.nilai_tes_quran || 0);
      setFormNotes(student.catatan_quran || "");
      setFormDetails(student.detail_quran || {});
    } else if (type === 'wawancara') {
      setFormScore(student.nilai_wawancara_santri || 0);
      setFormNotes(student.catatan_santri || "");
      setFormDetails(student.detail_wawancara || {});
    } else {
      setFormScore(student.nilai_wawancara_ortu || 0);
      setFormNotes(student.catatan_ortu || "");
      setFormDetails(student.detail_cawalsan || {});
    }

    setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/penguji/nilai/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          score: formScore,
          notes: formNotes,
          details: formDetails
        })
      });

      if (res.ok) {
        // Show success alert
        const result = await res.json();
        await Swal.fire({
          title: 'Berhasil!',
          text: result.isAllComplete 
            ? 'Penilaian berhasil disimpan. Semua rangkai ujian santri ini telah SELESAI!' 
            : 'Penilaian berhasil disimpan.',
          icon: 'success'
        });
        
        // Refresh and return
        fetchStudents();
        setView('list');
      } else {
        const err = await res.json();
        Swal.fire('Gagal!', err.error || 'Terjadi kesalahan saat menyimpan.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Tidak dapat menyambung ke server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Filtering ---
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
                          s.nomor_pendaftaran.includes(search);
    const matchesRole = filterRole === 'all' || s.roles.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  // --- Helpers ---
  const getLockInfo = (inputAt: string | null) => {
    if (!inputAt) return { isLocked: false, text: "Baru" };
    const isAdmin = ['admin', 'admin_super', 'head_of_it'].includes(activeRole);
    const lockDate = new Date(new Date(inputAt).getTime() + 24 * 60 * 60 * 1000);
    const isLocked = new Date() > lockDate;
    
    if (isAdmin) return { isLocked: false, text: "Admin Access" };
    if (isLocked) return { isLocked: true, text: "Terkunci (24j)" };
    
    // Calculate remaining
    const diff = lockDate.getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { isLocked: false, text: `Edit: ${hours}j ${mins}m` };
  };

  // --- Render ---

  if (view === 'form' && selectedStudent) {
    const lockInfo = getLockInfo(formType === 'quran' ? selectedStudent.input_at_quran : formType === 'wawancara' ? selectedStudent.input_at_santri : selectedStudent.input_at_ortu);
    const isEditingLocked = lockInfo.isLocked;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-ink-500 hover:text-maroon-600 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali ke Daftar
        </button>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm app-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-maroon-50 rounded-2xl flex items-center justify-center border border-maroon-100 shrink-0">
                  <User className="w-8 h-8 text-maroon-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-ink-950 font-display tracking-tight">{selectedStudent.nama_lengkap}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="px-2.5 py-1 bg-surface-100 text-ink-600 border border-surface-200 rounded-lg text-xs font-black uppercase tracking-widest">{selectedStudent.jenjang}</span>
                    <span className="text-ink-400 font-mono text-sm font-bold">{selectedStudent.nomor_pendaftaran}</span>
                  </div>
               </div>
            </div>
            
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${isEditingLocked ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
               {isEditingLocked ? <Lock className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
               <div className="text-sm font-bold">
                 <p className="opacity-70 text-[10px] uppercase tracking-wider leading-none mb-1">Status Kunci Edit</p>
                 <p>{lockInfo.text}</p>
               </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Input */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-black text-ink-900 uppercase tracking-widest">
                  <Award className="w-4 h-4 text-maroon-600" /> Skor Penilaian (0-100)
                </label>
                <div className="relative group">
                   <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    required 
                    readOnly={isEditingLocked}
                    value={formScore || ""} 
                    onChange={e => setFormScore(Number(e.target.value))}
                    className={`w-full text-4xl font-black p-6 rounded-3xl text-center border-2 transition-all outline-none ${isEditingLocked ? 'bg-cream-50 border-cream-200 text-ink-400' : 'bg-white border-cream-200 focus:border-maroon-500 text-ink-950 focus:ring-4 focus:ring-maroon-50 shadow-sm'}`}
                    placeholder="0"
                  />
                  {!isEditingLocked && <div className="absolute inset-x-0 -bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="bg-maroon-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Ketik Skor</span></div>}
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-black text-ink-900 uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4 text-maroon-600" /> Catatan {formType === 'quran' ? 'Tilawah' : 'Wawancara'}
                </label>
                <textarea 
                  rows={4}
                  readOnly={isEditingLocked}
                  value={formNotes || ""}
                  onChange={e => setFormNotes(e.target.value)}
                  className={`w-full p-5 rounded-3xl border-2 transition-all outline-none font-medium ${isEditingLocked ? 'bg-cream-50 border-cream-200 text-ink-400' : 'bg-white border-cream-200 focus:border-maroon-500 text-ink-900 focus:ring-4 focus:ring-maroon-50 shadow-sm'}`}
                  placeholder="Berikan catatan mendalam mengenai hasil ujian hari ini..."
                />
              </div>
            </div>

            {/* Criteria / Details (Dynamic based on formType) */}
            <div className="bg-cream-50/50 rounded-3xl p-6 md:p-8 border border-cream-100">
               <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Detail Kriteria Penilaian
               </h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {formType === 'quran' && [
                   { key: 'tahsin', label: 'Tahsin & Makhroj' },
                   { key: 'tajwid', label: 'Tajwid' },
                   { key: 'kelancaran', label: 'Kelancaran' },
                   { key: 'hafalan', label: 'Kualitas Hafalan' },
                   { key: 'adab', label: 'Adab Berinteraksi' },
                 ].map(item => (
                   <div key={item.key} className="space-y-2">
                     <label className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">{item.label}</label>
                     <select 
                      disabled={isEditingLocked}
                      value={formDetails[item.key] || ""}
                      onChange={e => setFormDetails({...formDetails, [item.key]: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm font-bold text-ink-900 outline-none focus:ring-2 focus:ring-maroon-500 transition-all cursor-pointer disabled:bg-cream-50 disabled:text-ink-300"
                    >
                       <option value="">Pilih...</option>
                       <option value="Sangat Baik">Sangat Baik (A)</option>
                       <option value="Baik">Baik (B)</option>
                       <option value="Cukup">Cukup (C)</option>
                       <option value="Kurang">Kurang (D)</option>
                     </select>
                   </div>
                 ))}

                 {formType !== 'quran' && [
                   { key: 'akhlak', label: 'Akhlak & Adab' },
                   { key: 'kemandirian', label: 'Kemandirian' },
                   { key: 'motivasi', label: 'Motivasi Belajar' },
                   { key: 'kesehatan', label: 'Kesehatan Fisik' },
                   { key: 'lingkungan', label: 'Latar Belakang Lingkungan' },
                   { key: 'komitmen', label: 'Komitmen Orang Tua' },
                 ].map(item => (
                   <div key={item.key} className="space-y-2">
                     <label className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">{item.label}</label>
                     <select 
                      disabled={isEditingLocked}
                      value={formDetails[item.key] || ""}
                      onChange={e => setFormDetails({...formDetails, [item.key]: e.target.value})}
                       className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm font-bold text-ink-900 outline-none focus:ring-2 focus:ring-maroon-500 transition-all cursor-pointer disabled:bg-cream-50 disabled:text-ink-300"
                    >
                       <option value="">Pilih...</option>
                       <option value="Sangat Tinggi">Sangat Tinggi (A)</option>
                       <option value="Tinggi">Tinggi (B)</option>
                       <option value="Cukup">Cukup (C)</option>
                       <option value="Kurang">Kurang (D)</option>
                     </select>
                   </div>
                 ))}
               </div>
            </div>

            {!isEditingLocked && (
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-10 py-4 bg-maroon-600 hover:bg-maroon-700 text-white rounded-2xl font-black shadow-lg shadow-maroon-100 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Simpan Penilaian
                </button>
              </div>
            )}
            
            {isEditingLocked && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4 ring-4 ring-amber-50/50">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                   <h4 className="font-bold text-amber-900">Ulasan Mode Baca</h4>
                   <p className="text-sm text-amber-700 mt-1 font-medium leading-relaxed">Penilaian ini telah diproses oleh sistem. Untuk melakukan perbaikan data setelah batas waktu 24 jam, hubungi Koordinator Penguji atau Admin IT PPDB.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-1 bg-maroon-600 rounded-full"></span>
              <span className="text-sm font-black text-maroon-600 uppercase tracking-[0.2em]">Testing Panel</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-ink-950 font-display tracking-tight">Input Nilai Seleksi</h1>
           <p className="text-ink-500 mt-2 font-bold max-w-xl">Berikan penilaian objektif untuk setiap santri. Perlu diperhatikan bahwa data yang telah disimpan hanya dapat diubah dalam waktu <span className="text-maroon-600">24 jam</span>.</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl border border-cream-200 shadow-sm">
           <div className="px-4 py-2 bg-maroon-50 rounded-xl flex items-center gap-3">
              <Users className="w-5 h-5 text-maroon-600" />
              <div className="text-xs font-bold leading-tight">
                 <p className="text-maroon-900">{students.length}</p>
                 <p className="text-maroon-600/60 uppercase tracking-tighter">Terdaftar</p>
              </div>
           </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau nomor pendaftaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-cream-200 rounded-2xl focus:ring-4 focus:ring-maroon-50 focus:border-maroon-400 outline-none font-bold text-ink-900 transition-all placeholder:text-ink-200"
            />
         </div>
         <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-maroon-500" />
            <select 
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full pl-12 pr-10 py-4 bg-white border border-cream-200 rounded-2xl focus:ring-4 focus:ring-maroon-50 focus:border-maroon-400 outline-none font-bold text-ink-900 appearance-none cursor-pointer transition-all"
            >
              <option value="all">Semua Tipe Ujian</option>
              <option value="quran">Tes Al-Quran</option>
              <option value="wawancara">Wawancara Calsan</option>
              <option value="ortu">Wawancara Cawalsan</option>
            </select>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <Loader2 className="w-12 h-12 text-maroon-600 animate-spin" />
           <p className="text-ink-400 font-bold animate-pulse">Menghubungkan ke pangkalan data...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 border border-cream-200 text-center shadow-sm">
           <div className="w-20 h-20 bg-cream-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-ink-200" />
           </div>
           <h3 className="text-xl font-black text-ink-950 font-display">Pendaftar Tidak Ditemukan</h3>
           <p className="text-ink-400 mt-2 font-medium max-w-sm mx-auto">Kami tidak menemukan pendaftar yang sesuai dengan kriteria pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-[2rem] border border-cream-200 shadow-sm hover:shadow-xl hover:border-maroon-200 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col group app-card">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-maroon-50 rounded-2xl flex items-center justify-center border border-maroon-100 group-hover:bg-maroon-600 group-hover:border-maroon-700 transition-colors">
                  <User className="w-6 h-6 text-maroon-600 group-hover:text-white transition-colors" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-ink-200 uppercase tracking-widest">{student.jenjang}</span>
                  <p className="text-xs font-mono font-bold text-ink-950">{student.nomor_pendaftaran}</p>
                </div>
              </div>

              {/* Identity */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-ink-950 font-display leading-tight">{student.nama_lengkap}</h3>
              </div>

              {/* Status & Scores (Master Merge View) */}
              <div className="space-y-3 mb-8">
                 {/* Quran Score */}
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50/50 border border-cream-100">
                    <div className="flex items-center gap-2.5">
                       <BookOpen className="w-4 h-4 text-emerald-600" />
                       <span className="text-xs font-black text-ink-900 uppercase tracking-tight">Quran</span>
                    </div>
                    {student.nilai_tes_quran !== null ? (
                      <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{student.nilai_tes_quran}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-ink-300 italic">Belum Ujian</span>
                    )}
                 </div>

                 {/* Santri Score */}
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50/50 border border-cream-100">
                    <div className="flex items-center gap-2.5">
                       <Activity className="w-4 h-4 text-blue-600" />
                       <span className="text-xs font-black text-ink-900 uppercase tracking-tight">Calsan</span>
                    </div>
                    {student.nilai_wawancara_santri !== null ? (
                      <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{student.nilai_wawancara_santri}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-ink-300 italic">Belum Ujian</span>
                    )}
                 </div>

                 {/* Ortu Score */}
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-cream-50/50 border border-cream-100">
                    <div className="flex items-center gap-2.5">
                       <Users className="w-4 h-4 text-purple-600" />
                       <span className="text-xs font-black text-ink-900 uppercase tracking-tight">Cawalsan</span>
                    </div>
                    {student.nilai_wawancara_ortu !== null ? (
                      <span className="text-sm font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{student.nilai_wawancara_ortu}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-ink-300 italic">Belum Ujian</span>
                    )}
                 </div>
              </div>

              {/* Action: Entry Buttons based on roles */}
              <div className="mt-auto space-y-2">
                 {student.roles.includes('quran') && (
                   <button 
                    onClick={() => openForm(student, 'quran')}
                    className="w-full py-3 px-4 bg-maroon-600 hover:bg-maroon-700 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-between shadow-lg shadow-maroon-50 active:scale-95"
                  >
                     INPUT NILAI QURAN 
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 )}
                 {student.roles.includes('wawancara') && (
                   <button 
                    onClick={() => openForm(student, 'wawancara')}
                    className="w-full py-3 px-4 bg-ink-950 hover:bg-ink-800 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-between shadow-lg shadow-ink-100 active:scale-95"
                  >
                     WAWANCARA CALSAN
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 )}
                 {student.roles.includes('ortu') && (
                   <button 
                    onClick={() => openForm(student, 'ortu')}
                    className="w-full py-3 px-4 border-2 border-maroon-600 text-maroon-600 hover:bg-maroon-50 rounded-2xl font-black text-xs transition-all flex items-center justify-between active:scale-95"
                  >
                     WAWANCARA CAWALSAN
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
