"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  ClipboardCheck,
  Search,
  Save,
  Loader2,
  CheckCircle,
  User,
  Hash,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Users,
  Clock,
  Lock as LockIcon,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Peserta {
  id: string;
  jadwal_id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  roles: string[];
  nilai_wawancara_santri: number | null;
  nilai_tes_quran: number | null;
  nilai_wawancara_ortu: number | null;
  catatan_santri: string | null;
  catatan_quran: string | null;
  catatan_ortu: string | null;
  detail_quran: any;
  detail_wawancara: any;
  detail_cawalsan: any;
  score_quran: number | null;
  score_wawancara: number | null;
  nilai_id: string | null;
  input_at_quran: string | null;
  input_at_santri: string | null;
  input_at_ortu: string | null;
  created_at: string | null;
    nilai_tes_hafalan?: number | null;
    nilai_tes_lisan_arab?: number | null;
    catatan_hafalan?: string | null;
    catatan_lisan_arab?: string | null;
    detail_hafalan?: any;
    detail_lisan_arab?: any;
    score_hafalan?: number | null;
    score_lisan_arab?: number | null;
    input_at_hafalan?: string | null;
    input_at_lisan_arab?: string | null;
}

// ============================================================================
// FORM DEFINITIONS
// ============================================================================

const CALSAN_CRITERIA_PUTRA = [
  {
    key: "motivasi",
    label: "Motivasi masuk pesantren",
    options: [
      { value: 5, label: "5: Sangat jelas, kuat, dan sesuai visi pesantren (ingin belajar agama, mandiri, dekat dengan Allah)." },
      { value: 4, label: "4: Cukup jelas, alasan positif namun masih umum." },
      { value: 3, label: "3: Alasan kurang terarah, dipengaruhi orang tua, tapi ada kesediaan." },
      { value: 2, label: "2: Alasan lemah, tidak paham tujuan pesantren." },
      { value: 1, label: "1: Tidak ada motivasi, terpaksa, atau menolak." },
    ],
  },
  {
    key: "lingkungan",
    label: "Lingkungan di rumah",
    options: [
      { value: 5, label: "5: Lingkungan sangat mendukung (keluarga islami, shalat berjamaah, kontrol gadget baik)." },
      { value: 4, label: "4: Lingkungan cukup mendukung, ada perhatian orang tua." },
      { value: 3, label: "3: Lingkungan biasa saja, kadang ada pengaruh negatif." },
      { value: 2, label: "2: Lingkungan kurang mendukung (teman/saudara sering pengaruh negatif)." },
      { value: 1, label: "1: Lingkungan sangat tidak mendukung (bebas tanpa kontrol, pergaulan buruk)." },
    ],
  },
  {
    key: "game",
    label: "Permainan / Game yang Disuka (Putra)",
    options: [
      { value: 5, label: "5: Hobi bermanfaat (olahraga, membaca, permainan edukatif)." },
      { value: 4, label: "4: Game rekreasi wajar, tidak berlebihan." },
      { value: 3, label: "3: Game online, tapi masih bisa dikontrol." },
      { value: 2, label: "2: Game online intens, mulai kecanduan." },
      { value: 1, label: "1: Sangat kecanduan game, mengganggu sekolah/ibadah." },
    ],
  },
  {
    key: "teman",
    label: "Teman / Nongkrong di Rumah",
    options: [
      { value: 5, label: "5: Berteman dengan lingkungan positif (masjid, teman shalih/shalihah)." },
      { value: 4, label: "4: Mayoritas teman baik, ada sedikit yang kurang baik." },
      { value: 3, label: "3: Teman biasa saja, netral." },
      { value: 2, label: "2: Lebih sering bersama teman berpengaruh negatif." },
      { value: 1, label: "1: Nongkrong dengan kelompok bermasalah (merokok, tawuran, dll)." },
    ],
  },
  {
    key: "rokok",
    label: "Tentang Rokok/Vape/Pod (Putra)",
    options: [
      { value: 5, label: "5: Jelas menolak, punya alasan agama/ilmu." },
      { value: 4, label: "4: Menolak, tapi alasannya umum." },
      { value: 3, label: "3: Netral/tidak tahu, belum ada sikap tegas." },
      { value: 2, label: "2: Pernah mencoba atau terpengaruh." },
      { value: 1, label: "1: Aktif menggunakan rokok/vape/pod." },
    ],
  },
  {
    key: "pornografi",
    label: "Pornografi",
    options: [
      { value: 5, label: "5: Menolak dengan tegas, paham bahaya dan dosa." },
      { value: 4, label: "4: Menolak, tapi belum terlalu paham alasannya." },
      { value: 3, label: "3: Pernah melihat, tapi merasa salah dan ingin menjauhi." },
      { value: 2, label: "2: Sering terpapar, belum bisa lepas." },
      { value: 1, label: "1: Kecanduan pornografi." },
    ],
  },
  {
    key: "hobi",
    label: "Hobi / Kesukaan",
    options: [
      { value: 5, label: "5: Hobi positif, produktif, mendukung pengembangan diri (olahraga, membaca, seni islami)." },
      { value: 4, label: "4: Hobi umum yang wajar (menggambar, dll)." },
      { value: 3, label: "3: Hobi kurang bermanfaat, tapi tidak berbahaya." },
      { value: 2, label: "2: Hobi berisiko (main game berlebihan, nongkrong tanpa tujuan)." },
      { value: 1, label: "1: Hobi negatif (rokok, balapan liar, dll)." },
    ],
  },
];

const CALSAN_CRITERIA_PUTRI = [
  {
    key: "motivasi",
    label: "Motivasi masuk pesantren",
    options: [
      { value: 5, label: "5: Sangat jelas, kuat, dan sesuai visi pesantren (ingin belajar agama, mandiri, dekat dengan Allah)." },
      { value: 4, label: "4: Cukup jelas, alasan positif namun masih umum." },
      { value: 3, label: "3: Alasan kurang terarah, dipengaruhi orang tua, tapi ada kesediaan." },
      { value: 2, label: "2: Alasan lemah, tidak paham tujuan pesantren." },
      { value: 1, label: "1: Tidak ada motivasi, terpaksa, atau menolak." },
    ],
  },
  {
    key: "lingkungan",
    label: "Lingkungan di rumah",
    options: [
      { value: 5, label: "5: Lingkungan sangat mendukung (keluarga islami, shalat berjamaah, kontrol gadget baik)." },
      { value: 4, label: "4: Lingkungan cukup mendukung, ada perhatian orang tua." },
      { value: 3, label: "3: Lingkungan biasa saja, kadang ada pengaruh negatif." },
      { value: 2, label: "2: Lingkungan kurang mendukung (teman/saudara sering pengaruh negatif)." },
      { value: 1, label: "1: Lingkungan sangat tidak mendukung (bebas tanpa kontrol, pergaulan buruk)." },
    ],
  },
  {
    key: "game",
    label: "Media Sosial / Gadget (Putri)",
    options: [
      { value: 5, label: "5: Penggunaan sangat terbatas, hanya untuk hal bermanfaat." },
      { value: 4, label: "4: Wajar, di bawah pengawasan ketat." },
      { value: 3, label: "3: Aktif di media sosial, tapi masih dalam batas kewajaran." },
      { value: 2, label: "2: Sering menghabiskan waktu di gadget, mulai kurang terkontrol." },
      { value: 1, label: "1: Kecanduan gadget/media sosial berat." },
    ],
  },
  {
    key: "teman",
    label: "Teman / Pergaulan di Rumah",
    options: [
      { value: 5, label: "5: Berteman dengan lingkungan positif (masjid, teman shalihah)." },
      { value: 4, label: "4: Mayoritas teman baik, ada sedikit yang kurang baik." },
      { value: 3, label: "3: Teman biasa saja, netral." },
      { value: 2, label: "2: Lebih sering bersama teman berpengaruh negatif." },
      { value: 1, label: "1: Pergaulan bebas atau bermasalah." },
    ],
  },
  {
    key: "rokok",
    label: "Tentang Adab & Hijab (Putri)",
    options: [
      { value: 5, label: "5: Sangat menjaga adab dan hijab dengan kesadaran sendiri." },
      { value: 4, label: "4: Menjaga adab, hijab terkadang masih perlu diingatkan." },
      { value: 3, label: "3: Adab biasa saja, hijab hanya formalitas." },
      { value: 2, label: "2: Kurang menjaga adab, sering tidak berhijab di luar." },
      { value: 1, label: "1: Tidak menjaga adab dan tidak berhijab." },
    ],
  },
  {
    key: "pornografi",
    label: "Pornografi / Drakor / K-Pop Berlebihan",
    options: [
      { value: 5, label: "5: Menolak dengan tegas, paham bahaya dan dosa." },
      { value: 4, label: "4: Menolak, tapi belum terlalu paham alasannya." },
      { value: 3, label: "3: Pernah terpapar, merasa salah dan ingin menjauhi." },
      { value: 2, label: "2: Sering menghabiskan waktu untuk hal tersebut, sulit lepas." },
      { value: 1, label: "1: Sangat kecanduan." },
    ],
  },
  {
    key: "hobi",
    label: "Hobi / Kesukaan",
    options: [
      { value: 5, label: "5: Hobi positif, produktif, mendukung pengembangan diri (olahraga, membaca, seni islami)." },
      { value: 4, label: "4: Hobi umum yang wajar (menggambar, dll)." },
      { value: 3, label: "3: Hobi kurang bermanfaat, tapi tidak berbahaya." },
      { value: 2, label: "2: Hobi berisiko (main game berlebihan, nongkrong tanpa tujuan)." },
      { value: 1, label: "1: Hobi negatif." },
    ],
  },
];

const CAWALSAN_QUESTIONS = [
  { key: "q1", label: "1. Abu/Ummu ingin ananda menjadi seperti apa di masa depan?", options: ["A. Condong ke orientasi akhirat/agama", "B. Condong ke orientasi dunia/umum", "C. Hanya berorientasi dunia/umum"] },
  { key: "q2", label: "2. Bagaimana pandangan  Abu/Ummu  tentang sistem pendidikan berbasis pesantren?", options: ["A. Pilihan utama untuk agama, akhlak, dan karakter", "B. Pilihan utama untuk akhlak", "C. Pesantren juga mengajarkan pelajaran umum"] },
  { key: "q3", label: "3. Ananda mau bersekolah di Pondok Pesantren Al Fath atas keinginan siapa?", options: ["A. Orang tua & anak", "B. Anak", "C. Orang tua / ikut teman"] },
  { key: "q4", label: "4. Apa yang  Abu/Ummu   lakukan sehingga ananda mau bersekolah di pesantren?", options: ["A. Memberikan pengertian", "B. Memberikan hadiah/iming-iming", "C. Memaksa"] },
  { key: "q5", label: "5. Sejauh apa pendidikan agama/Al-Qur’an ananda sebelumnya?", options: ["A. Intensif (tahfizh, sekolah Islam)", "B. Non intensif (swasta biasa)", "C. Seadanya (sekolah negeri)"] },
  { key: "q6", label: "6. Menurut Bapak/Ibu, keberhasilan proses pendidikan anak merupakan tanggung jawab siapa?", options: ["A. Bersama", "Orang Tua", "Sekolah"] },
  { key: "q7", label: "7. Sejauh apa kesiapan  Abu/Ummu   memenuhi kewajiban SPP?", options: ["A. Yakin", "B. Ragu-ragu", "C. Tidak tahu"] },
  { key: "q8", label: "8. Bagaimana pandangan  Abu/Ummu   tentang pendidikan agama & tahfizh Al-Qur’an?", options: ["A. Sangat penting", "B. Cukup penting", "C. Penting"] },
  { key: "q9", label: "9. Apa saja yang akan dilakukan oleh Bapak/Ibu untuk mendukung program pendidikan Pesantren?", options: ["A. Mendukung semua program dan memberikan masukan positif/ memantau perkembangan anak", "B. Menyerahkan semua urusan ke Pesantren", "C. Tidak Tahu"] },
  { key: "q10", label: "10. Seberapa sering  Abu/Ummu   akan menjenguk ananda?", options: ["A. Berkala", "B. Tidak menjenguk karena jauh", "C. Sesempatnya saja"] },
  { key: "q11", label: "11. Jika ananda diganggu teman (iseng/jail/bully), apa langkah  Abu/Ummu?", options: ["A. Klarifikasi & beri semangat pada anak", "B. Serahkan ke pesantren", "C. Komplain ke pesantren"] },
  { key: "q12", label: "12. Jika ananda terkena sanksi, apa reaksi  Abu/Ummu?", options: ["A. Menerima sebagai konsekuensi (selama bimbingan sudah maksimal)", "B. Menasehati anak", "C. Tidak terima"] },
];

const PENGUJI_QURAN_LIST_PUTRA = ["Agus Cahyono", "Jusman", "Testing"];
const PEWAWANCARA_CALSAN_LIST_PUTRA = ["Muhammad Syauqi Al Faruq", "Muhajir", "Testing"];
const PEWAWANCARA_CAWALSAN_LIST_PUTRA = ["Maulidin Bachtiar", "Testing"];

const PENGUJI_QURAN_LIST_PUTRI = ["Andi Fatimah Azzahra Rahman", "Testing"];
const PEWAWANCARA_CALSAN_LIST_PUTRI = ["Halimah Fauziah", "Rima Maryani Putri Utami", "Testing"];
const PEWAWANCARA_CAWALSAN_LIST_PUTRI = ["Maulidin Bachtiar", "Testing"];

const JENJANG_OPTIONS = ["MTs Putra", "MTs Putri", "IL Putra", "IL Putri", "SMA Putra", "SMA Putri"];

const KATEGORI_OPTIONS = ["Yatim/ah", "Memiliki keluarga/saudara/kerabat di Al Fath", "Memiliki teman/rekan/tetangga di Al Fath", "Baru"];

const SUMBER_INFO_OPTIONS = ["Searching umum", "IG", "FB", "YouTube", "TikTok", "Lainnya"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Map session role to which form types are visible
const ROLE_TO_FORM_TYPES: Record<string, string[]> = {
  penguji: ['quran', 'hafalan', 'lisan_arab'],
  pewawancara_calsan: ['wawancara'],
  pewawancara_cawalsan: ['ortu'],
  penguji_hafalan: ['hafalan'],
  penguji_bahasa_arab: ['lisan_arab'],
  admin: ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'],
  admin_super: ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'],
};

export default function InputNilaiPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-sm app-card">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
        <span className="text-ink-600 font-black uppercase tracking-widest text-sm">Menyiapkan halaman...</span>
      </div>
    }>
      <InputNilaiContent />
    </Suspense>
  );
}

function InputNilaiContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");
  const [activeName, setActiveName] = useState<string>("");

  // Form states for each type
  const [quranForm, setQuranForm] = useState<any>({});
  const [calsanForm, setSantriForm] = useState<any>({});
  const [cawalsanForm, setOrangTuaForm] = useState<any>({});
  const [hafalanForm, setHafalanForm] = useState<any>({});
  const [lisanArabForm, setLisanArabForm] = useState<any>({});

  // Determine which form types are visible based on the active session role
  const visibleFormTypes = ["admin", "admin_super"].includes(activeRole) 
    ? ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'] 
    : (ROLE_TO_FORM_TYPES[activeRole] || ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab']);

  const toTitleCase = (str: string) => {
    if (!str || typeof str !== 'string') return "";
    return str.split(" ").map(w => {
      if (!w) return "";
      return w[0].toUpperCase() + w.substring(1).toLowerCase();
    }).join(" ");
  };

  const getLockInfo = (inputAt: string | null | undefined) => {
    if (!inputAt) return { isLocked: false, remainingText: "" };
    
    const isAdmin = ['admin_super', 'admin'].includes(activeRole);
    if (isAdmin) return { isLocked: false, remainingText: "Akses Admin: Bebas Edit" };

    const inputDate = new Date(inputAt);
    const lockDate = new Date(inputDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const isLocked = now > lockDate;
    
    if (isLocked) {
      return { isLocked: true, remainingText: "Terkunci (Batas edit 24 jam habis)" };
    } else {
      const diffMs = lockDate.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return { isLocked: false, remainingText: `Masa edit: ${diffHours}j ${diffMins}m lagi` };
    }
  };

  useEffect(() => {
    // Fetch session to get active role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        const role = data.session?.role || "";
        const name = data.session?.full_name || data.session?.name || "Reviewer";
        setActiveRole(role);
        setActiveName(name);
      })
      .catch((err) => console.error("Error fetching session:", err));

    fetchPeserta();
  }, []);

  const fetchPeserta = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      // Use no-store and timestamp to prevent caching issues after saving
      const response = await fetch(`/api/penguji/peserta?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const result = await response.json();
        const sortedData = (result.data || []).sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setPeserta(sortedData);
      }
    } catch (error) {
      console.error("Error fetching peserta:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (p: Peserta, type: "quran" | "wawancara" | "ortu" | "hafalan" | "lisan_arab") => {
    setEditingId(p.id + type);
    
    // Pre-fill forms from existing data
    const quranData = p.detail_quran || {};
    const calsanData = p.detail_wawancara || {};
    const cawalsanData = p.detail_cawalsan || {};
    const hafalanData = p.detail_hafalan || {};
    const lisanArabData = p.detail_lisan_arab || {};

    // Auto-fill examiner/interviewer name if not already set
    if (!quranData.nama_penguji) quranData.nama_penguji = activeName;
    if (!calsanData.nama_pewawancara) calsanData.nama_pewawancara = activeName;
    if (!cawalsanData.nama_pewawancara) cawalsanData.nama_pewawancara = activeName;
    if (!hafalanData.nama_penguji) hafalanData.nama_penguji = activeName;
    if (!lisanArabData.nama_penguji) lisanArabData.nama_penguji = activeName;

    setQuranForm(quranData);
    setSantriForm(calsanData);
    setOrangTuaForm(cawalsanData);
    setHafalanForm(hafalanData);
    setLisanArabForm(lisanArabData);
    setMessage(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setQuranForm({});
    setSantriForm({});
    setOrangTuaForm({});
    setHafalanForm({});
    setLisanArabForm({});
  };

  const saveForm = async (p: Peserta, formType: "quran" | "wawancara" | "ortu" | "hafalan" | "lisan_arab") => {
    setSaving(p.id + formType);
    setMessage(null);

    try {
      let body: any = {};

      if (formType === "quran") {
        const tajwid = parseFloat(quranForm.tajwid) || 0;
        const kelancaran = parseFloat(quranForm.kelancaran) || 0;
        const totalScore = (tajwid + kelancaran) / 2;
        body = {
          detail_quran: quranForm,
          score_quran: totalScore,
          nilai_tes_quran: totalScore,
          catatan_quran: quranForm.catatan || "",
        };
      } else if (formType === "wawancara") {
        const isPutriByJenjang = p.jenjang?.toLowerCase().includes('putri');
        const isPutriByPrefix = ['MTI', 'ILI', 'SMI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
        // Fallback: If examiner is Halimah or Rima, it's definitely a Putri session
        const isPutriByExaminer = ["Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
          p.detail_wawancara?.nama_pewawancara === name
        );
        const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
        
        const criteria = isPutri ? CALSAN_CRITERIA_PUTRI : CALSAN_CRITERIA_PUTRA;
        const scores = criteria.map((c) => calsanForm[c.key] || 0);
        const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        body = {
          detail_wawancara: calsanForm,
          score_wawancara: avgScore,
          nilai_wawancara_santri: avgScore,
          catatan_santri: calsanForm.catatan || "",
        };
      } else if (formType === "ortu") {
        body = {
          detail_cawalsan: cawalsanForm,
          catatan_ortu: cawalsanForm.catatan || "",
          nilai_wawancara_ortu: 1, // Flag that form is filled
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      console.log("[saveForm] Sending PATCH to /api/penguji/nilai/" + p.id, body);

      const res = await fetch(`/api/penguji/nilai/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("[saveForm] Response status:", res.status);

      if (res.ok) {
        setSaving(null); // Clear saving state BEFORE showing popup
        setEditingId(null); // Clear all editing state

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data penilaian berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
        });
        
        // NEW: Automatically mark as complete in backend if not already (frontend trigger for redundancy)
        const mapping: Record<string, "santri" | "quran" | "ortu"> = {
          quran: "quran",
          wawancara: "santri",
          ortu: "ortu",
        };
        const componentType = mapping[formType];
        if (p.jadwal_id && componentType) {
          fetch("/api/penguji/jadwal/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              jadwal_id: p.jadwal_id,
              component_type: componentType 
            }),
          }).catch(err => console.error("[saveForm] Auto-complete error:", err));
        }

        // Silently refresh data without showing full-page loading spinner
        try {
          await fetchPeserta(false);
        } catch (e) {
          console.error("[saveForm] Error refreshing data:", e);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        let errMsg = "Terjadi kesalahan sistem";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (e) {
          console.error("[saveForm] Error parsing error response:", e);
        }
        await Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: errMsg
        });
      }
    } catch (error: any) {
      console.error("[saveForm] Catch error:", error);
      if (error.name === "AbortError") {
        await Swal.fire({
          icon: 'error',
          title: 'Timeout',
          text: 'Koneksi terputus atau server terlalu lama merespon. Silakan coba lagi.'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Terjadi kesalahan yang tidak terduga'
        });
      }
    } finally {
      setSaving(null);
    }
  };

  const isParticipantFinished = (p: Peserta) => {
    const formsNeeded = ROLE_TO_FORM_TYPES[activeRole] || [];
    if (formsNeeded.length === 0) return false;
    
    // Robust check: use input_at_* OR fallback to score/detail data presence
    return formsNeeded.every(type => {
      if (type === 'quran') {
        return !!p.input_at_quran || p.nilai_tes_quran != null || p.score_quran != null;
      }
      if (type === 'wawancara') {
        return !!p.input_at_santri || p.nilai_wawancara_santri != null || !!(p.detail_wawancara?.rekomendasi);
      }
      if (type === 'ortu') {
        return !!p.input_at_ortu || p.nilai_wawancara_ortu != null || !!(p.detail_cawalsan?.q1);
      }
    if (type === 'hafalan') {
      setHafalanForm({
        ...p.detail_hafalan,
        catatan_tambahan: p.catatan_hafalan || "",
        score_override: p.score_hafalan || 0,
      });
    }
    if (type === 'lisan_arab') {
      setLisanArabForm({
        ...p.detail_lisan_arab,
        catatan_tambahan: p.catatan_lisan_arab || "",
        score_override: p.score_lisan_arab || 0,
      });
    }
        if (type === 'hafalan') {
          return !!(p.input_at_hafalan || p.score_hafalan || (p.detail_hafalan && Object.keys(p.detail_hafalan).length > 0));
        }
        if (type === 'lisan_arab') {
          return !!(p.input_at_lisan_arab || p.score_lisan_arab || (p.detail_lisan_arab && Object.keys(p.detail_lisan_arab).length > 0));
        }
      return true;
    });
  };

  const pendingPeserta = peserta.filter(p => !isParticipantFinished(p)).filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const finishedPeserta = peserta.filter(p => isParticipantFinished(p)).filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPeserta = peserta.filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );

  // ============================================================================
  // RENDER: Seleksi Al Qur'an Form
  // ============================================================================
  const renderPesertaCard = (p: Peserta) => (
    <div key={p.id} className="bg-white rounded-3xl sm:rounded-4xl p-5 sm:p-6 md:p-10 border border-secondary-100 shadow-sm shadow-primary-900/5 app-card">
      {/* Peserta Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-ink-100/50">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-ink-50 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-ink-100 shrink-0 shadow-inner">
            <User className="w-7 h-7 sm:w-10 sm:h-10 text-primary-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-primary-950 font-display tracking-tight leading-tight">{toTitleCase(p.nama_lengkap)}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-primary-50 text-primary-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-primary-100 shadow-xs">
                <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {p.nomor_pendaftaran}
              </span>
              <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-secondary-400 text-primary-950 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm">
                {p.jenjang}
              </span>
            </div>
          </div>
        </div>

        {isParticipantFinished(p) && (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle className="w-4 h-4" /> Dinilai
          </div>
        )}
      </div>

      {/* Forms based on roles AND active session role */}
      <div className="space-y-4">
        {p.roles.includes("quran") && visibleFormTypes.includes("quran") && renderQuranForm(p)}
        {p.roles.includes("wawancara") && visibleFormTypes.includes("wawancara") && renderSantriForm(p)}
        {p.roles.includes("ortu") && visibleFormTypes.includes("ortu") && renderOrangTuaForm(p)}
        {p.roles.includes("hafalan") && visibleFormTypes.includes("hafalan") && renderHafalanForm(p)}
        {p.roles.includes("lisan_arab") && visibleFormTypes.includes("lisan_arab") && renderArabForm(p)}
      </div>
    </div>
  );

    const renderHafalanForm = (p: Peserta) => {
    const isSaved = !!(p.detail_hafalan?.rekomendasi || p.nilai_tes_hafalan != null || p.score_hafalan != null);
    const isEditing = editingId === p.id + "hafalan";

    return (
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-teal-100 rounded-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-teal-900 tracking-tight">Tes Hafalan Al-Qur'an</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-teal-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = p.score_hafalan != null && !p.input_at_hafalan;
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 text-sm">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Hafalan (1-100) *</label>
                <input type="number" min="1" max="100" value={hafalanForm.score_override || ""} onChange={(e) => setHafalanForm({ ...hafalanForm, score_override: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-teal-100 rounded-xl sm:rounded-2xl focus:border-teal-500 outline-none font-black text-teal-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">Rekomendasi Penguji *</label>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${hafalanForm.rekomendasi === opt ? (opt === "Diterima" ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm" : opt === "Cadangan" ? "border-gold-500 bg-gold-50 text-gold-800 shadow-sm" : "border-red-500 bg-red-50 text-red-700 shadow-sm") : "border-teal-50 bg-white hover:border-teal-200"}`}>
                    <input type="radio" name={`rekom-hafalan-${p.id}`} value={opt} checked={hafalanForm.rekomendasi === opt} onChange={() => setHafalanForm({ ...hafalanForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Catatan Penguji</label>
              <textarea value={hafalanForm.catatan_tambahan || ""} onChange={(e) => setHafalanForm({ ...hafalanForm, catatan_tambahan: e.target.value })} className="w-full px-4 sm:px-5 py-4 bg-white border-2 border-teal-100 rounded-xl sm:rounded-2xl focus:border-teal-500 outline-none font-medium text-teal-950 min-h-[120px] transition-all resize-none" placeholder="Tuliskan catatan tambahan terkait hafalan santri..." />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-teal-100/60">
              <button onClick={cancelEditing} disabled={!!saving} className="px-6 py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest text-ink-500 hover:bg-ink-100 transition-all flex-1 text-center">Batal</button>
              <button onClick={() => saveForm(p, "hafalan")} disabled={isInputtedByAdmin || !!saving || !hafalanForm.score_override || !hafalanForm.rekomendasi} className="px-6 py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Menyimpan...' : 'Simpan Nilai Hafalan'}
              </button>
            </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-2xl border border-teal-100/50">
            {isSaved ? (
              <>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Nilai Hafalan</p>
                  <p className="text-2xl font-black text-teal-950">{p.nilai_tes_hafalan || p.score_hafalan || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Rekomendasi</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${p.detail_hafalan?.rekomendasi === "Diterima" ? "bg-teal-100 text-teal-800" : p.detail_hafalan?.rekomendasi === "Cadangan" ? "bg-gold-100 text-gold-800" : "bg-red-100 text-red-800"}`}>{p.detail_hafalan?.rekomendasi || "-"}</span>
                </div>
                {p.catatan_hafalan && (
                  <div className="md:col-span-2 mt-2 pt-4 border-t border-teal-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-2">Catatan</p>
                    <p className="text-sm font-medium text-ink-700 whitespace-pre-wrap">{p.catatan_hafalan}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full py-8 text-center text-ink-400">
                <p className="font-bold text-sm">Belum ada nilai yang diinput</p>
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="flex justify-end mt-4">
            {(!isSaved || !getLockInfo(p.input_at_hafalan).isLocked) ? (
              <button onClick={() => startEditing(p, "hafalan")} className="px-5 md:px-8 py-3.5 sm:py-4 bg-teal-600 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20 active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai Hafalan"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderArabForm = (p: Peserta) => {
    const isSaved = !!(p.detail_lisan_arab?.rekomendasi || p.nilai_tes_lisan_arab != null || p.score_lisan_arab != null);
    const isEditing = editingId === p.id + "lisan_arab";

    return (
      <div className="bg-sky-50/50 border border-sky-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-sky-100 rounded-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-sky-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-sky-900 tracking-tight">Tes Lisan Bahasa Arab</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-sky-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = p.score_lisan_arab != null && !p.input_at_lisan_arab;
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 text-sm">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Bahasa Arab (1-100) *</label>
                <input type="number" min="1" max="100" value={lisanArabForm.score_override || ""} onChange={(e) => setLisanArabForm({ ...lisanArabForm, score_override: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-sky-100 rounded-xl sm:rounded-2xl focus:border-sky-500 outline-none font-black text-sky-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">Rekomendasi Penguji *</label>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${lisanArabForm.rekomendasi === opt ? (opt === "Diterima" ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm" : opt === "Cadangan" ? "border-gold-500 bg-gold-50 text-gold-800 shadow-sm" : "border-red-500 bg-red-50 text-red-700 shadow-sm") : "border-sky-50 bg-white hover:border-sky-200"}`}>
                    <input type="radio" name={`rekom-lisan-arab-${p.id}`} value={opt} checked={lisanArabForm.rekomendasi === opt} onChange={() => setLisanArabForm({ ...lisanArabForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Catatan Penguji</label>
              <textarea value={lisanArabForm.catatan_tambahan || ""} onChange={(e) => setLisanArabForm({ ...lisanArabForm, catatan_tambahan: e.target.value })} className="w-full px-4 sm:px-5 py-4 bg-white border-2 border-sky-100 rounded-xl sm:rounded-2xl focus:border-sky-500 outline-none font-medium text-sky-950 min-h-[120px] transition-all resize-none" placeholder="Tuliskan catatan tambahan terkait lisan arab santri..." />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-sky-100/60">
              <button onClick={cancelEditing} disabled={!!saving} className="px-6 py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest text-ink-500 hover:bg-ink-100 transition-all flex-1 text-center">Batal</button>
              <button onClick={() => saveForm(p, "lisan_arab")} disabled={isInputtedByAdmin || !!saving || !lisanArabForm.score_override || !lisanArabForm.rekomendasi} className="px-6 py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Menyimpan...' : 'Simpan Nilai B. Arab'}
              </button>
            </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-2xl border border-sky-100/50">
            {isSaved ? (
              <>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Nilai Bahasa Arab</p>
                  <p className="text-2xl font-black text-sky-950">{p.nilai_tes_lisan_arab || p.score_lisan_arab || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Rekomendasi</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${p.detail_lisan_arab?.rekomendasi === "Diterima" ? "bg-sky-100 text-sky-800" : p.detail_lisan_arab?.rekomendasi === "Cadangan" ? "bg-gold-100 text-gold-800" : "bg-red-100 text-red-800"}`}>{p.detail_lisan_arab?.rekomendasi || "-"}</span>
                </div>
                {p.catatan_lisan_arab && (
                  <div className="md:col-span-2 mt-2 pt-4 border-t border-sky-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-2">Catatan</p>
                    <p className="text-sm font-medium text-ink-700 whitespace-pre-wrap">{p.catatan_lisan_arab}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full py-8 text-center text-ink-400">
                <p className="font-bold text-sm">Belum ada nilai yang diinput</p>
              </div>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="flex justify-end mt-4">
            {(!isSaved || !getLockInfo(p.input_at_lisan_arab).isLocked) ? (
              <button onClick={() => startEditing(p, "lisan_arab")} className="px-5 md:px-8 py-3.5 sm:py-4 bg-sky-600 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/20 active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai B. Arab"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderQuranForm = (p: Peserta) => {
    const isSaved = !!(p.detail_quran?.rekomendasi || p.nilai_tes_quran != null || p.score_quran != null);
    const isEditing = editingId === p.id + "quran";

    // Gender detection for selection list
    const isPutriByJenjang = p.jenjang?.toLowerCase().includes('putri');
    const isPutriByPrefix = ['MTI', 'ILI', 'SMI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutriByExaminer = ["Andi Fatimah Azzahra Rahman", "Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
      quranForm.nama_penguji === name || p.detail_quran?.nama_penguji === name
    );
    const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
    const examinerList = isPutri ? PENGUJI_QURAN_LIST_PUTRI : PENGUJI_QURAN_LIST_PUTRA;

    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-emerald-900 tracking-tight">Tes Al-Qur&apos;an</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = p.score_quran != null && !p.input_at_quran;
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-sm">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Tajwid (1-100) *</label>
                <input type="number" min="1" max="100" value={quranForm.tajwid || ""} onChange={(e) => setQuranForm({ ...quranForm, tajwid: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-xl sm:rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Kelancaran (1-100) *</label>
                <input type="number" min="1" max="100" value={quranForm.kelancaran || ""} onChange={(e) => setQuranForm({ ...quranForm, kelancaran: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-xl sm:rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">Rekomendasi Penguji Al-Qur&apos;an *</label>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${quranForm.rekomendasi === opt ? (opt === "Diterima" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : opt === "Cadangan" ? "border-secondary-500 bg-secondary-50 text-secondary-800 shadow-sm" : "border-red-500 bg-red-50 text-red-700 shadow-sm") : "border-emerald-50 bg-white hover:border-emerald-200"}`}>
                    <input type="radio" name={`rekom-quran-${p.id}`} value={opt} checked={quranForm.rekomendasi === opt} onChange={() => setQuranForm({ ...quranForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nama Penguji Al-Qur&apos;an (Otomatis)</label>
              <input type="text" value={quranForm.nama_penguji || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-xl sm:rounded-2xl font-black text-emerald-950 outline-none cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Catatan Tambahan (opsional)</label>
              <textarea value={quranForm.catatan || ""} onChange={(e) => setQuranForm({ ...quranForm, catatan: e.target.value })} rows={3} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-xl sm:rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-950 transition-all resize-none placeholder:text-ink-400" placeholder="Catatan tambahan penguji..." />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-emerald-100 text-emerald-700 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-emerald-200 transition-all active:scale-95">Batal</button>
              <button onClick={() => saveForm(p, "quran")} disabled={isInputtedByAdmin || !quranForm.tajwid || !quranForm.kelancaran || !quranForm.rekomendasi || !quranForm.nama_penguji || saving === p.id + "quran"} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                {saving === p.id + "quran" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan
              </button>
            </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-xl sm:rounded-2xl px-5 sm:px-6 border border-emerald-100/50 shadow-inner">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-emerald-900 font-black text-sm leading-none">Nilai sudah tersimpan.</p>
                    <div className="mt-2 space-y-1">
                      {(p.score_quran != null || p.nilai_tes_quran != null) && (
                        <p className="text-emerald-700/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Skor: {p.score_quran ?? p.nilai_tes_quran}
                        </p>
                      )}
                      {p.detail_quran?.rekomendasi && (
                        <p className="text-emerald-700/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Rekomendasi: {p.detail_quran.rekomendasi}
                        </p>
                      )}
                      {p.detail_quran?.nama_penguji && (
                        <p className="text-emerald-700/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Penguji Al-Qur&apos;an: {p.detail_quran.nama_penguji}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {p.input_at_quran && (
                  <div className={`mt-1 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${getLockInfo(p.input_at_quran).isLocked ? "text-red-600" : "text-emerald-600/70"}`}>
                    {getLockInfo(p.input_at_quran).isLocked ? <LockIcon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {getLockInfo(p.input_at_quran).remainingText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-emerald-700/50 py-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">Peserta belum dinilai</span>
              </div>
            )}
            
            {(!isSaved || !getLockInfo(p.input_at_quran).isLocked) ? (
              <button onClick={() => startEditing(p, "quran")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSantriForm = (p: Peserta) => {
    const isSaved = !!(p.detail_wawancara?.rekomendasi || p.nilai_wawancara_santri != null);
    const isEditing = editingId === p.id + "wawancara";

    // Gender detection for selection list
    const isPutriByJenjang = p.jenjang?.toLowerCase().includes('putri');
    const isPutriByPrefix = ['MTI', 'ILI', 'SMI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutriByExaminer = ["Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
      calsanForm.nama_pewawancara === name || p.detail_wawancara?.nama_pewawancara === name
    );
    const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
    const criteria = isPutri ? CALSAN_CRITERIA_PUTRI : CALSAN_CRITERIA_PUTRA;
    const interviewerList = isPutri ? PEWAWANCARA_CALSAN_LIST_PUTRI : PEWAWANCARA_CALSAN_LIST_PUTRA;

    return (
      <div className="bg-primary-50/50 border border-primary-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-primary-100 rounded-xl">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-primary-900 tracking-tight">Seleksi Wawancara Calon Santri</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-primary-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = p.score_wawancara != null && !p.input_at_santri;
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>
            {criteria.map((criterion) => (
              <div key={criterion.key} className="space-y-3 sm:space-y-4">
                <label className="block text-xs sm:text-sm font-black text-primary-950 uppercase tracking-tight leading-none">{criterion.label}</label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {criterion.options.map((opt) => (
                    <label key={opt.value} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${calsanForm[criterion.key] === opt.value ? "border-primary-600 bg-primary-50 text-primary-900 shadow-sm" : "border-ink-100 hover:border-primary-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`calsan-${criterion.key}-${p.id}`} value={opt.value} checked={calsanForm[criterion.key] === opt.value} onChange={() => setSantriForm({ ...calsanForm, [criterion.key]: opt.value })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 accent-primary-600" />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-5 sm:space-y-6 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Rekomendasi Hasil</label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {[
                      "A. Sangat Layak diterima (potensi besar berkembang di pesantren).",
                      "B. Layak diterima dengan catatan pembinaan.",
                      "C. Perlu Pertimbangan (butuh bimbingan khusus).",
                      "D. Tidak disarankan (risiko tinggi, banyak faktor negatif).",
                      "E. Tidak layak diterima saat ini.",
                    ].map((opt) => (
                      <label key={opt} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${calsanForm.rekomendasi === opt ? "border-primary-600 bg-primary-50 text-primary-900 shadow-sm" : "border-ink-100 hover:border-primary-200 bg-ink-50/30 text-ink-700"}`}>
                        <input type="radio" name={`rekom-calsan-${p.id}`} value={opt} checked={calsanForm.rekomendasi === opt} onChange={() => setSantriForm({ ...calsanForm, rekomendasi: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 accent-primary-600" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Pewawancara (Otomatis)</label>
                  <input type="text" value={calsanForm.nama_pewawancara || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-primary-50/50 border-2 border-primary-100 rounded-xl sm:rounded-2xl font-black text-primary-950 outline-none cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Catatan Pewawancara (opsional)</label>
                <textarea value={calsanForm.catatan || ""} onChange={(e) => setSantriForm({ ...calsanForm, catatan: e.target.value })} rows={4} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/50 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-primary-500 outline-none font-black text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Catatan pewawancara..." />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-ink-100 text-ink-800 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-ink-200 transition-all active:scale-95">Batal</button>
              <button onClick={() => saveForm(p, "wawancara")} disabled={isInputtedByAdmin || !criteria.every((c) => calsanForm[c.key]) || !calsanForm.rekomendasi || !calsanForm.nama_pewawancara || saving === p.id + "wawancara"} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-primary-700 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-800 transition-all shadow-xl shadow-primary-900/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                {saving === p.id + "wawancara" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan
              </button>
            </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-xl sm:rounded-2xl px-5 sm:px-6 border border-primary-100/50 shadow-inner">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-primary-950 font-black text-sm leading-none">Hasil Wawancara Calon Santri sudah tersimpan.</p>
                    <p className="text-primary-700/70 text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest">Rekomendasi: {p.detail_wawancara?.rekomendasi?.split('.')[0] || 'Tersimpan'}</p>
                  </div>
                </div>
                {p.input_at_santri && (
                  <div className={`mt-1 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${getLockInfo(p.input_at_santri).isLocked ? "text-red-600" : "text-primary-600/70"}`}>
                    {getLockInfo(p.input_at_santri).isLocked ? <LockIcon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {getLockInfo(p.input_at_santri).remainingText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-primary-700/50 py-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">Belum ada data Wawancara Calon Santri</span>
              </div>
            )}

            {(!isSaved || !getLockInfo(p.input_at_santri).isLocked) ? (
              <button onClick={() => startEditing(p, "wawancara")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-primary-700 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-primary-800 transition-all shadow-lg shadow-primary-900/20 active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Seleksi Wawancara Orang Tua Form
  // ============================================================================
  const renderOrangTuaForm = (p: Peserta) => {
    const isSaved = !!(p.detail_cawalsan?.rekomendasi || p.nilai_wawancara_ortu != null);
    const isEditing = editingId === p.id + "ortu";

    const isPutriByJenjang = p.jenjang?.toLowerCase().includes('putri');
    const isPutriByPrefix = ['MTI', 'ILI', 'SMI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutri = isPutriByJenjang || isPutriByPrefix;
    const interviewerList = isPutri ? PEWAWANCARA_CAWALSAN_LIST_PUTRI : PEWAWANCARA_CAWALSAN_LIST_PUTRA;

    return (
      <div className="bg-secondary-50/50 border border-secondary-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-secondary-100 rounded-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-primary-950 tracking-tight">Seleksi Wawancara Orang Tua/Wali</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-secondary-400 text-primary-950 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm border border-secondary-500/20">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = p.nilai_wawancara_ortu != null && !p.input_at_ortu;
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-xl">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>
            {/* Dasar Informasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Audiens/Orangtua *</label>
                <input type="text" value={cawalsanForm.nama_orangtua || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, nama_orangtua: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all placeholder:text-ink-400" placeholder="Nama orangtua/wali" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Asal Daerah *</label>
                <input type="text" value={cawalsanForm.asal || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, asal: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all placeholder:text-ink-400" placeholder="Contoh: Sukabumi, Jawa Barat" />
              </div>
            </div>

            {/* Kategori & Sumber */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">Kategori Calon Santri *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {KATEGORI_OPTIONS.map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${cawalsanForm.kategori === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-sm" : "border-ink-50 hover:border-secondary-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`kategori-${p.id}`} value={opt} checked={cawalsanForm.kategori === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, kategori: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 accent-secondary-500" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Sumber Informasi *</label>
                <select value={cawalsanForm.sumber_info || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, sumber_info: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all cursor-pointer">
                  <option value="">Pilih Sumber Informasi</option>
                  {SUMBER_INFO_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* 12 Pertanyaan */}
            <div className="space-y-3 sm:space-y-4">
              {CAWALSAN_QUESTIONS.map((q) => (
                <div key={q.key} className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs">
                  <label className="block text-xs sm:text-sm font-black text-primary-950 mb-3 sm:mb-4">{q.label} *</label>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label key={opt} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${cawalsanForm[q.key] === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-sm" : "border-ink-50 hover:border-secondary-200 bg-ink-50/30 text-ink-700"}`}>
                        <input type="radio" name={`${q.key}-${p.id}`} value={opt} checked={cawalsanForm[q.key] === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, [q.key]: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 accent-secondary-500" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Karakter & SPP & Rekomendasi */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Karakter Santri (Positif & Negatif) *</label>
                <textarea value={cawalsanForm.karakter || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, karakter: e.target.value })} rows={3} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Deskripsikan karakter santri yang menonjol..." />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">Sudah Tahu Biaya SPP? *</label>
                <div className="flex gap-3 sm:gap-4">
                  {["Sudah", "Belum"].map((opt) => (
                    <label key={opt} className={`flex-1 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer border-2 transition-all text-[10px] sm:text-xs font-black shadow-sm text-center uppercase tracking-widest ${cawalsanForm.tahu_spp === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-sm" : "border-ink-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`spp-${p.id}`} value={opt} checked={cawalsanForm.tahu_spp === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, tahu_spp: opt })} className="hidden" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">Rekomendasi Pewawancara *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                  {["Diterima", "Diterima dengan catatan", "Ditolak"].map((opt) => (
                    <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl cursor-pointer border-2 transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center shadow-sm ${cawalsanForm.rekomendasi === opt ? (opt === "Diterima" ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : opt.includes("catatan") ? "border-secondary-500 bg-secondary-50 text-secondary-800 shadow-sm" : "border-red-500 bg-red-50 text-red-700 shadow-sm") : "border-ink-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`rekom-cawalsan-${p.id}`} value={opt} checked={cawalsanForm.rekomendasi === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, rekomendasi: opt })} className="hidden" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Pewawancara (Otomatis)</label>
                <input type="text" value={cawalsanForm.nama_pewawancara || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-secondary-50/50 border-2 border-ink-100 rounded-xl sm:rounded-2xl font-black text-primary-950 outline-none cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Catatan Tambahan (opsional)</label>
                <textarea value={cawalsanForm.catatan || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, catatan: e.target.value })} rows={3} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Catatan tambahan pewawancara..." />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-secondary-100 text-secondary-900 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-secondary-200 transition-all active:scale-95">Batal</button>
              <button onClick={() => saveForm(p, "ortu")} disabled={isInputtedByAdmin || !cawalsanForm.nama_orangtua || !cawalsanForm.asal || !cawalsanForm.kategori || !cawalsanForm.sumber_info || !cawalsanForm.karakter || !cawalsanForm.tahu_spp || !cawalsanForm.rekomendasi || !cawalsanForm.nama_pewawancara || !CAWALSAN_QUESTIONS.every((q) => cawalsanForm[q.key]) || saving === p.id + "ortu"} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-secondary-400 text-primary-950 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-secondary-500 transition-all shadow-xl shadow-secondary-400/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                {saving === p.id + "ortu" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan
              </button>
            </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-xl sm:rounded-2xl px-5 sm:px-6 border border-secondary-100/50 shadow-inner">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-secondary-600 shrink-0" />
                  <div>
                    <p className="text-primary-950 font-black text-sm">Hasil wawancara wali santri sudah tersimpan.</p>
                    <p className="text-secondary-800/70 text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest italic">Rekomendasi: {p.detail_cawalsan?.rekomendasi}</p>
                  </div>
                </div>
                {p.input_at_ortu && (
                  <div className={`mt-1 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${getLockInfo(p.input_at_ortu).isLocked ? "text-red-600" : "text-secondary-700/70"}`}>
                    {getLockInfo(p.input_at_ortu).isLocked ? <LockIcon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {getLockInfo(p.input_at_ortu).remainingText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-secondary-700/50 py-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic font-medium">Belum ada data wawancara wali santri</span>
              </div>
            )}

            {(!isSaved || !getLockInfo(p.input_at_ortu).isLocked) ? (
              <button onClick={() => startEditing(p, "ortu")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-secondary-400 text-primary-950 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-secondary-500 transition-all shadow-lg shadow-secondary-400/20 active:scale-95 leading-none">
                {isSaved ? "Edit Hasil" : "Input Hasil"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Main Page
  // ============================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-32">
      {/* Header */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-6 md:p-10 border border-secondary-100 shadow-sm app-card overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 shrink-0 shadow-sm">
              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-primary-950 font-display tracking-tight leading-none">Input Nilai Ujian</h1>
              <p className="text-xs sm:text-sm font-bold text-ink-700 mt-2">Total Terdaftar: <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100/50">{peserta.length} peserta</span></p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 relative z-10">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-ink-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau nomor..." className="w-full pl-11 sm:pl-14 pr-6 py-3.5 sm:py-4.5 bg-ink-50/50 border border-ink-200 rounded-2xl sm:rounded-3xl focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none text-sm sm:text-base font-black text-primary-950 transition-all placeholder:text-ink-400" />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-sm app-card">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <span className="text-ink-600 font-black uppercase tracking-widest text-sm">Memuat data peserta...</span>
        </div>
      ) : filteredPeserta.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-sm app-card">
          <User className="w-20 h-20 mx-auto mb-6 text-ink-100" />
          <p className="font-black text-primary-950 text-2xl tracking-tight">Tidak ada peserta ditemukan</p>
          <p className="text-sm font-bold text-ink-600 mt-2">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section: Pending */}
          {pendingPeserta.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-secondary-200 to-transparent" />
                <h2 className="text-[10px] font-black text-secondary-600 uppercase tracking-[0.3em] whitespace-nowrap bg-surface-50 px-4">
                  Belum Dinilai ({pendingPeserta.length})
                </h2>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-secondary-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-8">
                {pendingPeserta.map(renderPesertaCard)}
              </div>
            </div>
          )}

          {/* Section: Finished */}
          {finishedPeserta.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2 opacity-50">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-ink-200 to-transparent" />
                <h2 className="text-[10px] font-black text-ink-400 uppercase tracking-[0.3em] whitespace-nowrap bg-surface-50 px-4">
                  Sudah Dinilai ({finishedPeserta.length})
                </h2>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-ink-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-8 opacity-90">
                {finishedPeserta.map(renderPesertaCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
