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
  Lock as LockIcon } from "lucide-react";

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
  detail_arab?: any;
  catatan_arab?: string | null;
  score_arab?: number | null;
  nilai_arab_total?: number | null;
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
    ] },
  {
    key: "lingkungan",
    label: "Lingkungan di rumah",
    options: [
      { value: 5, label: "5: Lingkungan sangat mendukung (keluarga islami, shalat berjamaah, kontrol gadget baik)." },
      { value: 4, label: "4: Lingkungan cukup mendukung, ada perhatian orang tua." },
      { value: 3, label: "3: Lingkungan biasa saja, kadang ada pengaruh negatif." },
      { value: 2, label: "2: Lingkungan kurang mendukung (teman/saudara sering pengaruh negatif)." },
      { value: 1, label: "1: Lingkungan sangat tidak mendukung (bebas tanpa kontrol, pergaulan buruk)." },
    ] },
  {
    key: "game",
    label: "Permainan / Game yang Disuka (Putra)",
    options: [
      { value: 5, label: "5: Hobi bermanfaat (olahraga, membaca, permainan edukatif)." },
      { value: 4, label: "4: Game rekreasi wajar, tidak berlebihan." },
      { value: 3, label: "3: Game online, tapi masih bisa dikontrol." },
      { value: 2, label: "2: Game online intens, mulai kecanduan." },
      { value: 1, label: "1: Sangat kecanduan game, mengganggu sekolah/ibadah." },
    ] },
  {
    key: "teman",
    label: "Teman / Nongkrong di Rumah",
    options: [
      { value: 5, label: "5: Berteman dengan lingkungan positif (masjid, teman shalih/shalihah)." },
      { value: 4, label: "4: Mayoritas teman baik, ada sedikit yang kurang baik." },
      { value: 3, label: "3: Teman biasa saja, netral." },
      { value: 2, label: "2: Lebih sering bersama teman berpengaruh negatif." },
      { value: 1, label: "1: Nongkrong dengan kelompok bermasalah (merokok, tawuran, dll)." },
    ] },
  {
    key: "rokok",
    label: "Tentang Rokok/Vape/Pod (Putra)",
    options: [
      { value: 5, label: "5: Jelas menolak, punya alasan agama/ilmu." },
      { value: 4, label: "4: Menolak, tapi alasannya umum." },
      { value: 3, label: "3: Netral/tidak tahu, belum ada sikap tegas." },
      { value: 2, label: "2: Pernah mencoba atau terpengaruh." },
      { value: 1, label: "1: Aktif menggunakan rokok/vape/pod." },
    ] },
  {
    key: "pornografi",
    label: "Pornografi",
    options: [
      { value: 5, label: "5: Menolak dengan tegas, paham bahaya dan dosa." },
      { value: 4, label: "4: Menolak, tapi belum terlalu paham alasannya." },
      { value: 3, label: "3: Pernah melihat, tapi merasa salah dan ingin menjauhi." },
      { value: 2, label: "2: Sering terpapar, belum bisa lepas." },
      { value: 1, label: "1: Kecanduan pornografi." },
    ] },
  {
    key: "hobi",
    label: "Hobi / Kesukaan",
    options: [
      { value: 5, label: "5: Hobi positif, produktif, mendukung pengembangan diri (olahraga, membaca, seni islami)." },
      { value: 4, label: "4: Hobi umum yang wajar (menggambar, dll)." },
      { value: 3, label: "3: Hobi kurang bermanfaat, tapi tidak berbahaya." },
      { value: 2, label: "2: Hobi berisiko (main game berlebihan, nongkrong tanpa tujuan)." },
      { value: 1, label: "1: Hobi negatif (rokok, balapan liar, dll)." },
    ] },
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
    ] },
  {
    key: "lingkungan",
    label: "Lingkungan di rumah",
    options: [
      { value: 5, label: "5: Lingkungan sangat mendukung (keluarga islami, shalat berjamaah, kontrol gadget baik)." },
      { value: 4, label: "4: Lingkungan cukup mendukung, ada perhatian orang tua." },
      { value: 3, label: "3: Lingkungan biasa saja, kadang ada pengaruh negatif." },
      { value: 2, label: "2: Lingkungan kurang mendukung (teman/saudara sering pengaruh negatif)." },
      { value: 1, label: "1: Lingkungan sangat tidak mendukung (bebas tanpa kontrol, pergaulan buruk)." },
    ] },
  {
    key: "game",
    label: "Media Sosial / Gadget (Putri)",
    options: [
      { value: 5, label: "5: Penggunaan sangat terbatas, hanya untuk hal bermanfaat." },
      { value: 4, label: "4: Wajar, di bawah pengawasan ketat." },
      { value: 3, label: "3: Aktif di media sosial, tapi masih dalam batas kewajaran." },
      { value: 2, label: "2: Sering menghabiskan waktu di gadget, mulai kurang terkontrol." },
      { value: 1, label: "1: Kecanduan gadget/media sosial berat." },
    ] },
  {
    key: "teman",
    label: "Teman / Pergaulan di Rumah",
    options: [
      { value: 5, label: "5: Berteman dengan lingkungan positif (masjid, teman shalihah)." },
      { value: 4, label: "4: Mayoritas teman baik, ada sedikit yang kurang baik." },
      { value: 3, label: "3: Teman biasa saja, netral." },
      { value: 2, label: "2: Lebih sering bersama teman berpengaruh negatif." },
      { value: 1, label: "1: Pergaulan bebas atau bermasalah." },
    ] },
  {
    key: "rokok",
    label: "Tentang Adab & Hijab (Putri)",
    options: [
      { value: 5, label: "5: Sangat menjaga adab dan hijab dengan kesadaran sendiri." },
      { value: 4, label: "4: Menjaga adab, hijab terkadang masih perlu diingatkan." },
      { value: 3, label: "3: Adab biasa saja, hijab hanya formalitas." },
      { value: 2, label: "2: Kurang menjaga adab, sering tidak berhijab di luar." },
      { value: 1, label: "1: Tidak menjaga adab dan tidak berhijab." },
    ] },
  {
    key: "pornografi",
    label: "Pornografi / Drakor / K-Pop Berlebihan",
    options: [
      { value: 5, label: "5: Menolak dengan tegas, paham bahaya dan dosa." },
      { value: 4, label: "4: Menolak, tapi belum terlalu paham alasannya." },
      { value: 3, label: "3: Pernah terpapar, merasa salah dan ingin menjauhi." },
      { value: 2, label: "2: Sering menghabiskan waktu untuk hal tersebut, sulit lepas." },
      { value: 1, label: "1: Sangat kecanduan." },
    ] },
  {
    key: "hobi",
    label: "Hobi / Kesukaan",
    options: [
      { value: 5, label: "5: Hobi positif, produktif, mendukung pengembangan diri (olahraga, membaca, seni islami)." },
      { value: 4, label: "4: Hobi umum yang wajar (menggambar, dll)." },
      { value: 3, label: "3: Hobi kurang bermanfaat, tapi tidak berbahaya." },
      { value: 2, label: "2: Hobi berisiko (main game berlebihan, nongkrong tanpa tujuan)." },
      { value: 1, label: "1: Hobi negatif." },
    ] },
];

const CAWALSAN_QUESTIONS = [
  { 
    key: "q1", 
    label: "1. Kebutuhan Khusus & Riwayat Medis / Psikologis", 
    options: [
      "A. Mandiri & Sehat (Tanpa ABK / Tanpa Penyakit Kronis)", 
      "B. Terkontrol Ringan (Ada riwayat ringan bawa obat pribadi)", 
      "C. Butuh Pengawasan Khusus (Riwayat kejang/asma/psikologis)"
    ] 
  },
  { 
    key: "q2", 
    label: "2. Apa tujuan Abu/Ummu memondokkan ananda di pesantren?", 
    options: [
      "A. Visi Akhirat & Karakter (Fondasi Al-Qur'an & As-Sunnah)", 
      "B. Keseimbangan Agama & Umum / Bahasa", 
      "C. Menghindari Pergaulan Luar / Pasrah Penuh"
    ] 
  },
  { 
    key: "q3", 
    label: "3. Bagaimana keseharian ananda di rumah (ibadah, kemandirian)?", 
    options: [
      "A. Mandiri & Tertib (Shalat 5 waktu di masjid, bangun subuh mandiri)", 
      "B. Cukup Baik (Masih sesekali perlu diingatkan)", 
      "C. Bergantung Penuh / Sering Membangkang"
    ] 
  },
  { 
    key: "q4", 
    label: "4. Bagaimana riwayat sekolah lama ananda (perilaku & hubungan guru/teman)?", 
    options: [
      "A. Catatan Bersih & Positif (Prestasi baik, hormat guru, bebas bullying)", 
      "B. Wajar / Normal (Pernah teguran kecil biasa)", 
      "C. Pernah Mengalami Masalah Disiplin / Kasus Berat"
    ] 
  },
  { 
    key: "q5", 
    label: "5. Apa kebiasaan ananda bersama teman-temannya di luar rumah?", 
    options: [
      "A. Lingkungan Positif & Terpantau (Masjid, pulang sebelum maghrib)", 
      "B. Netral & Wajar (Teman sebaya biasa di komplek)", 
      "C. Rentan Pengaruh / Sering Nongkrong Larut / Game Berlebihan"
    ] 
  },
  { 
    key: "q6", 
    label: "6. Komitmen membayar segala pembayaran yang ditetapkan pesantren (Infaq, SPP, dll)?", 
    options: [
      "A. Sangat Siap & Berkomitmen Tertib Setiap Bulan", 
      "B. Siap Berkomitmen dengan Perencanaan", 
      "C. Memerlukan Skema Cicilan / Keringanan Resmi"
    ] 
  },
  { 
    key: "q7", 
    label: "7. Sikap Abu/Ummu ketika ananda bermasalah atau dikenakan sanksi tata tertib?", 
    options: [
      "A. Kooperatif & Tabayyun Santun Bersama Asatidzah", 
      "B. Mendukung Pembinaan setelah Klarifikasi", 
      "C. Cenderung Defensif / Membela Anak Berlebihan"
    ] 
  },
  { 
    key: "q8", 
    label: "8. Sikap jika melihat ananda beramaliyah sunnah berbeda dengan tradisi keluarga?", 
    options: [
      "A. Terbuka, Bahagia, & Siap Belajar Bersama Ananda", 
      "B. Menghormati & Toleran terhadap Dalil Shahih", 
      "C. Khawatir / Keberatan terhadap Perubahan Tradisi"
    ] 
  },
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

const isJenjangLangsungNonIL = (jenjang?: string | null): boolean => {
  if (!jenjang) return false;
  const clean = jenjang.trim().toUpperCase();
  if (clean === "IL" || clean.includes("IL ") || clean.includes(" IL") || clean.includes("(IL)") || clean.includes("I'DAD") || clean.includes("IDAD") || clean.includes("IDADIYAH")) return false;
  if (clean.includes("SMP") || clean.includes("MTS") || clean.includes("TSANAWIYAH")) return false;
  if (clean.includes("SMA") || clean.includes("MA") || clean.includes("ALIYAH") || clean.includes("SLTA")) return true;
  return false;
};

const ROLE_TO_FORM_TYPES: Record<string, string[]> = {
  penguji: ['quran', 'hafalan'],
  penguji_quran: ['quran', 'hafalan'],
  pewawancara: ['wawancara', 'ortu'],
  pewawancara_calsan: ['wawancara'],
  pewawancara_cawalsan: ['ortu'],
  penguji_calsan: ['wawancara'],
  penguji_cawalsan: ['ortu'],
  penguji_hafalan: ['quran', 'hafalan'],
  penguji_bahasa_arab: ['lisan_arab'],
  penguji_arab: ['lisan_arab'],
  admin: ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'],
  admin_super: ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'],
  head_of_it: ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab']
};

export default function InputNilaiPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-2xl app-card">
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
  const [viewFilter, setViewFilter] = useState<"all" | "mine">("all");
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");
  const [activeName, setActiveName] = useState<string>("");
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Form states for each type
  const [quranForm, setQuranForm] = useState<any>({});
  const [calsanForm, setSantriForm] = useState<any>({});
  const [cawalsanForm, setOrangTuaForm] = useState<any>({});
  const [hafalanForm, setHafalanForm] = useState<any>({});
  const [lisanArabForm, setLisanArabForm] = useState<any>({});

  // Autosave grading forms draft
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("alandalus_alimam_penguji_nilai_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.quranForm) setQuranForm(parsed.quranForm);
          if (parsed.calsanForm) setSantriForm(parsed.calsanForm);
          if (parsed.cawalsanForm) setOrangTuaForm(parsed.cawalsanForm);
          if (parsed.hafalanForm) setHafalanForm(parsed.hafalanForm);
          if (parsed.lisanArabForm) setLisanArabForm(parsed.lisanArabForm);
        }
      } catch (e) {
        console.warn("Failed to load penguji nilai draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "alandalus_alimam_penguji_nilai_draft",
          JSON.stringify({ quranForm, calsanForm, cawalsanForm, hafalanForm, lisanArabForm })
        );
      } catch (e) {
        console.warn("Failed to save penguji nilai draft:", e);
      }
    }
  }, [quranForm, calsanForm, cawalsanForm, hafalanForm, lisanArabForm]);

  // Determine which form types are visible based on active role & secondary roles
  const allRoles = [...new Set([activeRole, ...userRoles])].filter(Boolean);
  const isAdmin = allRoles.some(r => ["admin", "admin_super", "head_of_it"].includes(r));
  const rawFormTypes = isAdmin
    ? ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab']
    : (activeRole && ROLE_TO_FORM_TYPES[activeRole])
      ? ROLE_TO_FORM_TYPES[activeRole]
      : [...new Set(allRoles.flatMap(r => ROLE_TO_FORM_TYPES[r] || []))];
  const visibleFormTypes = rawFormTypes.length > 0
    ? rawFormTypes
    : ['quran', 'wawancara', 'ortu', 'hafalan', 'lisan_arab'];

  const toTitleCase = (str: string) => {
    if (!str || typeof str !== 'string') return "";
    return str.split(" ").map(w => {
      if (!w) return "";
      return w[0].toUpperCase() + w.substring(1).toLowerCase();
    }).join(" ");
  };

  const getLockInfo = (inputAt: string | null | undefined) => {
    // Kebijakan: penguji bebas edit nilai kapan saja — tanpa penguncian
    return { isLocked: false, remainingText: inputAt ? "Bebas edit kapan saja" : "" };
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
        const roles = [role, ...(data.availableRoles || []), ...(data.session?.secondary_roles || [])].filter(Boolean);
        setUserRoles([...new Set(roles)]);
        fetchPeserta(true, role);
      })
      .catch((err) => {
        console.error("Error fetching session:", err);
        fetchPeserta();
      });
  }, []);

  const fetchPeserta = async (showLoading = true, roleOverride?: string, filterOverride?: string) => {
    try {
      if (showLoading) setLoading(true);
      const targetRole = roleOverride !== undefined ? roleOverride : activeRole;
      const targetFilter = filterOverride !== undefined ? filterOverride : viewFilter;
      const roleParam = targetRole ? `&role=${encodeURIComponent(targetRole)}` : "";
      const filterParam = targetFilter ? `&filter=${encodeURIComponent(targetFilter)}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search.trim())}` : "";
      // Use no-store and timestamp to prevent caching issues after saving
      const response = await fetch(`/api/penguji/peserta?t=${Date.now()}${roleParam}${filterParam}${searchParam}`, {
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

  const handleViewFilterChange = (filter: "all" | "mine") => {
    setViewFilter(filter);
    fetchPeserta(true, activeRole, filter);
  };

  const startEditing = (p: Peserta, type: "quran" | "wawancara" | "ortu" | "hafalan" | "lisan_arab") => {
    setEditingId(p.id + type);
    
    // Pre-fill forms from existing data (clone objects to avoid mutating memory)
    const quranData = p.detail_quran ? { ...p.detail_quran } : {};
    const calsanData = p.detail_wawancara ? { ...p.detail_wawancara } : {};
    const cawalsanData = p.detail_cawalsan ? { ...p.detail_cawalsan } : {};
    const hafalanData = p.detail_hafalan ? { ...p.detail_hafalan } : {};
    const lisanArabData = (p.detail_arab || p.detail_lisan_arab) ? { ...(p.detail_arab || p.detail_lisan_arab) } : {};

    // Auto-fill examiner/interviewer name if not already set
    if (!quranData.nama_penguji && activeName) quranData.nama_penguji = activeName;
    if (!calsanData.nama_pewawancara && activeName) calsanData.nama_pewawancara = activeName;
    if (!cawalsanData.nama_pewawancara && activeName) cawalsanData.nama_pewawancara = activeName;
    if (!hafalanData.nama_penguji && activeName) hafalanData.nama_penguji = activeName;
    if (!lisanArabData.nama_penguji && activeName) lisanArabData.nama_penguji = activeName;

    // Pre-fill hafalan in quranData if candidate is SMA/MA
    if (isJenjangLangsungNonIL(p.jenjang)) {
      if ((quranData.hafalan === undefined || quranData.hafalan === "") && (hafalanData.score_override != null || p.score_hafalan != null || p.nilai_tes_hafalan != null)) {
        quranData.hafalan = hafalanData.score_override ?? p.score_hafalan ?? p.nilai_tes_hafalan ?? "";
      }
      if (!quranData.jumlah_juz && (hafalanData.jumlah_juz || p.detail_hafalan?.jumlah_juz)) {
        quranData.jumlah_juz = hafalanData.jumlah_juz || p.detail_hafalan?.jumlah_juz;
      }
      if (!quranData.rekomendasi_hafalan && (hafalanData.rekomendasi || p.detail_hafalan?.rekomendasi)) {
        quranData.rekomendasi_hafalan = hafalanData.rekomendasi || p.detail_hafalan?.rekomendasi;
      }
      if (!quranData.catatan_hafalan && (hafalanData.catatan_tambahan || p.catatan_hafalan || p.detail_hafalan?.catatan_tambahan)) {
        quranData.catatan_hafalan = hafalanData.catatan_tambahan || p.catatan_hafalan || p.detail_hafalan?.catatan_tambahan || "";
      }
    }

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
        if (!quranForm.rekomendasi) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Rekomendasi Penguji Wajib Dipilih',
            text: 'Mohon pilih rekomendasi penguji Al-Qur\'an (Diterima / Cadangan / Ditolak) sebelum mengisi komentar dan menyimpan nilai.'
          });
          return;
        }

        if (!quranForm.catatan || !quranForm.catatan.trim()) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Catatan Penguji Wajib Diisi',
            text: 'Mohon berikan catatan/komentar evaluasi Al-Qur\'an untuk santri ini sebelum menyimpan nilai. Catatan ini sangat penting untuk bahan pertimbangan rapat pleno kelulusan.'
          });
          return;
        }

        const isDirectSMA = isJenjangLangsungNonIL(p.jenjang);

        if (isDirectSMA) {
          if (quranForm.hafalan === undefined || quranForm.hafalan === "") {
            setSaving(null);
            await Swal.fire({
              icon: 'warning',
              title: 'Nilai Hafalan Wajib Diisi',
              text: 'Santri jenjang SMA/MA memiliki seleksi hafalan Al-Qur\'an. Mohon isi nilai tes hafalan (1-100).'
            });
            return;
          }
          if (!quranForm.rekomendasi_hafalan) {
            setSaving(null);
            await Swal.fire({
              icon: 'warning',
              title: 'Rekomendasi Hafalan Wajib Dipilih',
              text: 'Mohon pilih rekomendasi untuk tes hafalan (Diterima / Cadangan / Ditolak).'
            });
            return;
          }
          if (!quranForm.catatan_hafalan || !quranForm.catatan_hafalan.trim()) {
            setSaving(null);
            await Swal.fire({
              icon: 'warning',
              title: 'Catatan Hafalan Wajib Diisi',
              text: 'Mohon berikan catatan evaluasi hafalan (misal: jumlah juz, kelancaran tajwid hafalan) untuk bahan rapat pleno kelulusan.'
            });
            return;
          }
        }

        const tajwid = parseFloat(quranForm.tajwid) || 0;
        const kelancaran = parseFloat(quranForm.kelancaran) || 0;
        const totalScore = Math.round((tajwid + kelancaran) / 2);
        const hafalanVal = isDirectSMA && quranForm.hafalan !== undefined && quranForm.hafalan !== ""
          ? Math.min(100, Math.max(0, parseFloat(quranForm.hafalan)))
          : null;

        body = {
          detail_quran: {
            ...quranForm,
            nama_penguji: quranForm.nama_penguji || activeName,
            rekomendasi: quranForm.rekomendasi,
            tajwid,
            kelancaran,
          },
          score_quran: totalScore,
          nilai_tes_quran: totalScore,
          catatan_quran: quranForm.catatan.trim(),
        };

        if (isDirectSMA && hafalanVal !== null) {
          const autoRekomHafalan = hafalanVal >= 75 ? "Diterima" : (hafalanVal >= 60 ? "Cadangan" : "Ditolak");
          const rekomHafalan = quranForm.rekomendasi_hafalan || autoRekomHafalan;
          body.detail_hafalan = {
            ...hafalanForm,
            nama_penguji: quranForm.nama_penguji || activeName,
            score_override: hafalanVal,
            total_score: hafalanVal,
            score_hafalan: hafalanVal,
            jumlah_juz: quranForm.jumlah_juz || hafalanForm.jumlah_juz || "",
            rekomendasi: rekomHafalan,
            catatan_tambahan: quranForm.catatan_hafalan?.trim() || hafalanForm.catatan_tambahan?.trim() || "",
          };
          body.score_hafalan = hafalanVal;
          body.nilai_tes_hafalan = hafalanVal;
          body.nilai_hafalan_total = hafalanVal;
          body.catatan_hafalan = quranForm.catatan_hafalan?.trim() || "";
        }
      } else if (formType === "wawancara") {
        if (!calsanForm.rekomendasi) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Rekomendasi Pewawancara Wajib Dipilih',
            text: 'Mohon pilih rekomendasi hasil wawancara calon santri sebelum mengisi komentar dan menyimpan nilai.'
          });
          return;
        }

        if (!calsanForm.catatan || !calsanForm.catatan.trim()) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Catatan Pewawancara Wajib Diisi',
            text: 'Mohon berikan catatan/komentar hasil wawancara calon santri sebelum menyimpan nilai. Catatan ini sangat penting untuk bahan pertimbangan rapat pleno kelulusan.'
          });
          return;
        }

        const isPutriByJenjang = (p?.jenjang?.toLowerCase() || "").includes('putri');
        const isPutriByPrefix = ['SPI', 'SMI', 'ILI', 'MTI', 'MAI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
        // Fallback: If examiner is Halimah or Rima, it's definitely a Putri session
        const isPutriByExaminer = ["Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
          p.detail_wawancara?.nama_pewawancara === name
        );
        const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
        
        const criteria = isPutri ? CALSAN_CRITERIA_PUTRI : CALSAN_CRITERIA_PUTRA;
        const scores = criteria.map((c) => calsanForm[c.key] || 0);
        const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        body = {
          detail_wawancara: {
            ...calsanForm,
            nama_pewawancara: calsanForm.nama_pewawancara || activeName,
            rekomendasi: calsanForm.rekomendasi,
          },
          score_wawancara: avgScore,
          nilai_wawancara_santri: avgScore,
          catatan_santri: calsanForm.catatan.trim() };
      } else if (formType === "ortu") {
        if (!cawalsanForm.rekomendasi) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Rekomendasi Pewawancara Wajib Dipilih',
            text: 'Mohon pilih rekomendasi hasil wawancara orang tua/wali santri (Diterima / Diterima dengan catatan / Ditolak) sebelum mengisi komentar dan menyimpan nilai.'
          });
          return;
        }

        if (!cawalsanForm.catatan || !cawalsanForm.catatan.trim()) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Catatan Pewawancara Wajib Diisi',
            text: 'Mohon berikan catatan/komentar hasil wawancara orang tua/wali santri sebelum menyimpan nilai. Catatan ini sangat penting untuk bahan pertimbangan rapat pleno kelulusan.'
          });
          return;
        }

        body = {
          detail_cawalsan: {
            ...cawalsanForm,
            nama_pewawancara: cawalsanForm.nama_pewawancara || activeName,
            rekomendasi: cawalsanForm.rekomendasi,
          },
          catatan_ortu: cawalsanForm.catatan.trim(),
          nilai_wawancara_ortu: 1, // Flag that form is filled
        };
      } else if (formType === "hafalan") {
        if (!hafalanForm.rekomendasi) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Rekomendasi Penguji Wajib Dipilih',
            text: 'Mohon pilih rekomendasi hasil tes hafalan sebelum mengisi komentar dan menyimpan nilai.'
          });
          return;
        }

        if (!hafalanForm.catatan_tambahan || !hafalanForm.catatan_tambahan.trim()) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Catatan Penguji Wajib Diisi',
            text: 'Mohon berikan catatan/komentar hasil tes hafalan sebelum menyimpan nilai. Catatan ini sangat penting untuk bahan pertimbangan rapat pleno kelulusan.'
          });
          return;
        }

        const finalScore = hafalanForm.score_override !== undefined && hafalanForm.score_override !== ""
          ? Math.min(100, Math.max(0, parseFloat(hafalanForm.score_override)))
          : 0;
        const autoRekomendasi = finalScore >= 75 ? "Diterima" : (finalScore >= 60 ? "Cadangan" : "Ditolak");
        const rekomendasi = hafalanForm.rekomendasi || autoRekomendasi;

        body = {
          detail_hafalan: {
            ...hafalanForm,
            nama_penguji: hafalanForm.nama_penguji || activeName,
            total_score: finalScore,
            score_hafalan: finalScore,
            rekomendasi,
          },
          score_hafalan: finalScore,
          nilai_tes_hafalan: finalScore,
          nilai_hafalan_total: finalScore,
          catatan_hafalan: hafalanForm.catatan_tambahan.trim(),
        };
      } else if (formType === "lisan_arab") {
        if (!lisanArabForm.rekomendasi) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Rekomendasi Penguji Wajib Dipilih',
            text: 'Mohon pilih rekomendasi hasil tes bahasa Arab sebelum mengisi komentar dan menyimpan nilai.'
          });
          return;
        }

        if (!lisanArabForm.catatan_tambahan || !lisanArabForm.catatan_tambahan.trim()) {
          setSaving(null);
          await Swal.fire({
            icon: 'warning',
            title: 'Catatan Penguji Wajib Diisi',
            text: 'Mohon berikan catatan/komentar hasil tes bahasa Arab sebelum menyimpan nilai. Catatan ini sangat penting untuk bahan pertimbangan rapat pleno kelulusan.'
          });
          return;
        }

        const muhadatsah = parseFloat(lisanArabForm.muhadatsah) || 0;
        const qiraah = parseFloat(lisanArabForm.qiraah) || 0;
        const qawaid = parseFloat(lisanArabForm.qawaid) || 0;
        const mufrodat = parseFloat(lisanArabForm.mufrodat) || 0;
        const calcScore = Math.min(100, Math.max(0, muhadatsah + qiraah + qawaid + mufrodat));
        const finalScore = lisanArabForm.score_override !== undefined && lisanArabForm.score_override !== ""
          ? Math.min(100, Math.max(0, parseFloat(lisanArabForm.score_override)))
          : calcScore;
        const autoRekomendasi = finalScore >= 75 ? "Diterima" : (finalScore >= 60 ? "Cadangan" : "Ditolak");
        const rekomendasi = lisanArabForm.rekomendasi || autoRekomendasi;

        body = {
          detail_arab: {
            ...lisanArabForm,
            nama_penguji: lisanArabForm.nama_penguji || activeName,
            muhadatsah,
            qiraah,
            qawaid,
            mufrodat,
            total_score: finalScore,
            rekomendasi
          },
          score_arab: finalScore,
          nilai_arab_total: finalScore,
          catatan_arab: lisanArabForm.catatan_tambahan.trim()
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      console.log("[saveForm] Sending PATCH to /api/penguji/nilai/" + p.id, body);

      const res = await fetch(`/api/penguji/nilai/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal });

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
        const mapping: Record<string, "santri" | "quran" | "ortu" | "hafalan" | "arab"> = {
          quran: "quran",
          wawancara: "santri",
          ortu: "ortu",
          hafalan: "hafalan",
          lisan_arab: "arab"
        };
        const componentType = mapping[formType];
        if (p.jadwal_id && componentType) {
          fetch("/api/penguji/jadwal/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              jadwal_id: p.jadwal_id,
              component_type: componentType 
            }) }).catch(err => console.error("[saveForm] Auto-complete error:", err));

          if (formType === "quran" && isJenjangLangsungNonIL(p.jenjang)) {
            fetch("/api/penguji/jadwal/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                jadwal_id: p.jadwal_id,
                component_type: "hafalan" 
              }) }).catch(err => console.error("[saveForm] Auto-complete hafalan error:", err));
          }
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
      const formsNeeded = visibleFormTypes.filter(t => p.roles.includes(t));
      if (formsNeeded.length === 0) return true;
    
    return formsNeeded.every(type => {
      if (type === 'quran') {
        const quranDone = !!p.input_at_quran || p.nilai_tes_quran != null || p.score_quran != null;
        if (isJenjangLangsungNonIL(p.jenjang)) {
          const hafalanDone = !!p.input_at_hafalan || p.nilai_tes_hafalan != null || p.score_hafalan != null;
          return quranDone && hafalanDone;
        }
        return quranDone;
      }
      if (type === 'hafalan') {
        return !!p.input_at_hafalan || p.nilai_tes_hafalan != null || p.score_hafalan != null;
      }
      if (type === 'wawancara') {
        return !!p.input_at_santri || p.nilai_wawancara_santri != null || !!(p.detail_wawancara?.rekomendasi);
      }
      if (type === 'ortu') {
        return !!p.input_at_ortu || p.nilai_wawancara_ortu != null || !!(p.detail_cawalsan?.q1);
      }
      if (type === 'lisan_arab') {
        return !!(p.input_at_lisan_arab || p.score_lisan_arab || (p.detail_lisan_arab && Object.keys(p.detail_lisan_arab).length > 0));
      }
      return true;
    });
  };

  const isSpecificSearch = !!search && search.trim().length > 0;

  const relevantPeserta = peserta.filter(p => {
    // If reviewer is searching for a specific candidate (e.g. from magic link /n/[code]?search=MTA2700038),
    // always make the participant accessible so the reviewer is never blocked by role edge cases
    if (isSpecificSearch && (
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase())
    )) {
      return true;
    }
    return p.roles.some(r => visibleFormTypes.includes(r));
  });
  const pendingPeserta = relevantPeserta.filter(p => !isParticipantFinished(p)).filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const finishedPeserta = relevantPeserta.filter(p => isParticipantFinished(p)).filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPeserta = relevantPeserta.filter(
    (p) =>
      (p.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran || "").toLowerCase().includes(search.toLowerCase())
  );

  // ============================================================================
  // RENDER: Seleksi Al Qur'an Form
  // ============================================================================
  const renderPesertaCard = (p: Peserta) => {
    const hasAnyMatchingRole =
      (p.roles.includes("quran") && visibleFormTypes.includes("quran")) ||
      (p.roles.includes("wawancara") && visibleFormTypes.includes("wawancara")) ||
      (p.roles.includes("ortu") && visibleFormTypes.includes("ortu")) ||
      (isJenjangLangsungNonIL(p.jenjang) && p.roles.includes("hafalan") && visibleFormTypes.includes("hafalan")) ||
      (isJenjangLangsungNonIL(p.jenjang) && p.roles.includes("lisan_arab") && visibleFormTypes.includes("lisan_arab"));

    const allowAllCandidateRoles = !hasAnyMatchingRole && isSpecificSearch;

    return (
    <div key={p.id} className="bg-white rounded-3xl sm:rounded-4xl p-5 sm:p-6 md:p-10 border border-secondary-100 shadow-2xl app-card">
      {/* Peserta Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-ink-100/50">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-ink-50 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-ink-100 shrink-0 shadow-inner">
            <User className="w-7 h-7 sm:w-10 sm:h-10 text-primary-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-primary-950 font-display tracking-tight leading-tight">{toTitleCase(p.nama_lengkap)}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-2xl sm:rounded-3xl bg-primary-50 text-primary-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-primary-100 shadow-xs">
                <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {p.nomor_pendaftaran}
              </span>
              <span className="inline-flex items-center px-3 py-1 sm:py-1.5 rounded-2xl sm:rounded-3xl bg-secondary-400 text-primary-950 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                {p.jenjang}
              </span>
            </div>
          </div>
        </div>

        {isParticipantFinished(p) && (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-[#9D174D] px-4 py-2 rounded-3xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle className="w-4 h-4" /> Dinilai
          </div>
        )}
      </div>

      {/* Forms based on roles AND active session role */}
      <div className="space-y-4">
        {p.roles.includes("quran") && (visibleFormTypes.includes("quran") || allowAllCandidateRoles) && renderQuranForm(p)}
        {p.roles.includes("wawancara") && (visibleFormTypes.includes("wawancara") || allowAllCandidateRoles) && renderSantriForm(p)}
        {p.roles.includes("ortu") && (visibleFormTypes.includes("ortu") || allowAllCandidateRoles) && renderOrangTuaForm(p)}
        {isJenjangLangsungNonIL(p.jenjang) && p.roles.includes("hafalan") && (visibleFormTypes.includes("hafalan") || allowAllCandidateRoles) && !visibleFormTypes.includes("quran") && renderHafalanForm(p)}
        {isJenjangLangsungNonIL(p.jenjang) && p.roles.includes("lisan_arab") && (visibleFormTypes.includes("lisan_arab") || allowAllCandidateRoles) && renderArabForm(p)}
        {!isJenjangLangsungNonIL(p.jenjang) && (p.roles.includes("lisan_arab") || p.roles.includes("hafalan")) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-bold">
            Santri ini terdaftar pada jenjang {p.jenjang}. Jenjang ini tidak memerlukan Tes Lisan Bahasa Arab / Hafalan Tambahan (khusus SMA/MA langsung).
          </div>
        )}
      </div>
    </div>
  );
  };

    const renderHafalanForm = (p: Peserta) => {
    const isSaved = !!(p.detail_hafalan?.rekomendasi || p.nilai_tes_hafalan != null || p.score_hafalan != null);
    const isEditing = editingId === p.id + "hafalan";

    return (
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-4 sm:p-4.5 bg-teal-100 rounded-3xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-teal-900 tracking-tight">Tes Hafalan Al-Qur'an</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-teal-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = false as boolean; // Penguji bebas edit nilai kapan saja
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 sm:p-5 bg-amber-50 rounded-3xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-4 sm:p-4.5 bg-amber-100 rounded-2xl sm:rounded-3xl whitespace-nowrap inline-block shrink-0">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}> <div className="grid grid-cols-1 gap-5 sm:gap-6 text-sm"> <div> <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Hafalan (1-100) *</label> <input type="number" min="1" max="100" value={hafalanForm.score_override || ""} onChange={(e) => setHafalanForm({ ...hafalanForm, score_override: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-teal-100 rounded-3xl sm:rounded-2xl focus:border-teal-500 outline-none font-black text-teal-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">Rekomendasi Penguji *</label>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${hafalanForm.rekomendasi === opt ? (opt === "Diterima" ? "border-teal-500 bg-teal-50 text-teal-700 shadow-2xl     " : opt === "Cadangan" ? "border-gold-500 bg-gold-50 text-gold-800 shadow-2xl     " : "border-red-500 bg-red-50 text-red-700 shadow-2xl     ") : "border-teal-50 bg-white hover:border-teal-200"}`}>
                    <input type="radio" name={`rekom-hafalan-${p.id}`} value={opt} checked={hafalanForm.rekomendasi === opt} onChange={() => setHafalanForm({ ...hafalanForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">
                Catatan / Komentar Penguji <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
              </label>
              <textarea value={hafalanForm.catatan_tambahan || ""} onChange={(e) => setHafalanForm({ ...hafalanForm, catatan_tambahan: e.target.value })} required className="w-full px-4 sm:px-5 py-4 bg-white border-2 border-teal-100 rounded-3xl sm:rounded-2xl focus:border-teal-500 outline-none font-medium text-teal-950 min-h-[120px] transition-all resize-none" placeholder="Tuliskan catatan/komentar evaluasi hafalan santri (misal: jumlah juz, kelancaran tajwid, mutqin/ziyadah)..." />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-teal-100/60">
              <button onClick={cancelEditing} disabled={!!saving} className="px-6 py-4 rounded-3xl sm:rounded-2xl font-black text-xs uppercase tracking-widest text-ink-500 hover:bg-ink-100 transition-all flex-1 text-center">Batal</button>
              <button onClick={() => saveForm(p, "hafalan")} disabled={isInputtedByAdmin || !!saving || !hafalanForm.score_override || !hafalanForm.rekomendasi || !hafalanForm.catatan_tambahan?.trim()} className="px-6 py-4 rounded-3xl sm:rounded-2xl font-black text-xs uppercase tracking-widest bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-2xl shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2">
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
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider ${p.detail_hafalan?.rekomendasi === "Diterima" ? "bg-teal-100 text-teal-800" : p.detail_hafalan?.rekomendasi === "Cadangan" ? "bg-gold-100 text-gold-800" : "bg-red-100 text-red-800"}`}>{p.detail_hafalan?.rekomendasi || "-"}</span>
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
              <button onClick={() => startEditing(p, "hafalan")} className="px-5 md:px-8 py-3.5 sm:py-4 bg-teal-600 text-white rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-2xl shadow-teal-900/20 active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai Hafalan"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200 whitespace-nowrap shrink-0">
                <LockIcon className="w-3.5 h-3.5" /> Edit Terkunci
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderArabForm = (p: Peserta) => {
    const arabScore = p.nilai_tes_lisan_arab ?? p.score_lisan_arab;
    const isSaved = !!(p.detail_lisan_arab?.rekomendasi || arabScore != null);
    const isEditing = editingId === p.id + "lisan_arab";

    const mVal = parseFloat(lisanArabForm.muhadatsah) || 0;
    const qVal = parseFloat(lisanArabForm.qiraah) || 0;
    const wVal = parseFloat(lisanArabForm.qawaid) || 0;
    const fVal = parseFloat(lisanArabForm.mufrodat) || 0;
    const calcScore = Math.min(100, Math.max(0, mVal + qVal + wVal + fVal));
    const currentScore = lisanArabForm.score_override !== undefined && lisanArabForm.score_override !== ""
      ? parseFloat(lisanArabForm.score_override)
      : calcScore;

    return (
      <div className="bg-sky-50/50 border border-sky-100 rounded-lg sm:rounded-lg p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 bg-sky-100 rounded-lg">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-sky-700" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-sky-900 tracking-tight">Tes Lisan Bahasa Arab (SMA Non-IL)</h3>
            <p className="text-xs text-sky-700 font-medium mt-0.5">Standar KKM 75 • 4 Aspek Penilaian Terukur</p>
          </div>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-sky-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-lg flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = false as boolean; // Penguji bebas edit nilai kapan saja
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-amber-50 rounded-lg sm:rounded-lg border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg sm:rounded-lg whitespace-nowrap inline-block shrink-0">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>{/* 4 Aspek Terukur */}
                    <div className="bg-white p-4 sm:p-5 rounded-lg border-2 border-sky-100 mb-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-sky-50">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-900">4 Aspek Rubrik Penilaian</span>
                        <span className="text-[11px] font-bold text-sky-600">Total Bobot: 100 Poin</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-black text-ink-700 uppercase tracking-wider mb-1.5">
                            1. Muhadatsah & Respon (Maks 30) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={lisanArabForm.muhadatsah ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const newScore = (parseFloat(v) || 0) + qVal + wVal + fVal;
                              const autoR = newScore >= 75 ? "Diterima" : (newScore >= 60 ? "Cadangan" : "Ditolak");
                              setLisanArabForm({ ...lisanArabForm, muhadatsah: v, rekomendasi: lisanArabForm.rekomendasi || autoR });
                            }}
                            className="w-full px-3.5 py-2.5 bg-sky-50/50 border border-sky-200 rounded-md font-bold text-sky-950 focus:bg-white focus:border-sky-500 outline-none"
                            placeholder="0 - 30"
                          />
                          <p className="text-[10px] text-ink-400 mt-1">Kelancaran bercakap, respon spontan, pemahaman instruksi</p>
                        </div>

                        <div>
                          <label className="block font-black text-ink-700 uppercase tracking-wider mb-1.5">
                            2. Qira'ah & Pemahaman Teks (Maks 30) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={lisanArabForm.qiraah ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const newScore = mVal + (parseFloat(v) || 0) + wVal + fVal;
                              const autoR = newScore >= 75 ? "Diterima" : (newScore >= 60 ? "Cadangan" : "Ditolak");
                              setLisanArabForm({ ...lisanArabForm, qiraah: v, rekomendasi: lisanArabForm.rekomendasi || autoR });
                            }}
                            className="w-full px-3.5 py-2.5 bg-sky-50/50 border border-sky-200 rounded-md font-bold text-sky-950 focus:bg-white focus:border-sky-500 outline-none"
                            placeholder="0 - 30"
                          />
                          <p className="text-[10px] text-ink-400 mt-1">Membaca teks Arab gundul/berharakat, waqaf/washal, intisari</p>
                        </div>

                        <div>
                          <label className="block font-black text-ink-700 uppercase tracking-wider mb-1.5">
                            3. Kaidah Nahwu / I'rab Lisan (Maks 25) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="25"
                            value={lisanArabForm.qawaid ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const newScore = mVal + qVal + (parseFloat(v) || 0) + fVal;
                              const autoR = newScore >= 75 ? "Diterima" : (newScore >= 60 ? "Cadangan" : "Ditolak");
                              setLisanArabForm({ ...lisanArabForm, qawaid: v, rekomendasi: lisanArabForm.rekomendasi || autoR });
                            }}
                            className="w-full px-3.5 py-2.5 bg-sky-50/50 border border-sky-200 rounded-md font-bold text-sky-950 focus:bg-white focus:border-sky-500 outline-none"
                            placeholder="0 - 25"
                          />
                          <p className="text-[10px] text-ink-400 mt-1">Harakat akhir kata (i'rab marfu'/manshub/majrur), jabatan kata</p>
                        </div>

                        <div>
                          <label className="block font-black text-ink-700 uppercase tracking-wider mb-1.5">
                            4. Mufrodat & Kalimat (Maks 15) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={lisanArabForm.mufrodat ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const newScore = mVal + qVal + wVal + (parseFloat(v) || 0);
                              const autoR = newScore >= 75 ? "Diterima" : (newScore >= 60 ? "Cadangan" : "Ditolak");
                              setLisanArabForm({ ...lisanArabForm, mufrodat: v, rekomendasi: lisanArabForm.rekomendasi || autoR });
                            }}
                            className="w-full px-3.5 py-2.5 bg-sky-50/50 border border-sky-200 rounded-md font-bold text-sky-950 focus:bg-white focus:border-sky-500 outline-none"
                            placeholder="0 - 15"
                          />
                          <p className="text-[10px] text-ink-400 mt-1">Kosakata harian & diniyah, mufrad/jamak, membuat kalimat</p>
                        </div>
                      </div>

                      {/* Kalkulasi Otomatis & Status KKM */}
                      <div className="pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-wider text-ink-700">Total Nilai Lisan:</span>
                          <span className="text-2xl font-black text-sky-950">{currentScore}</span>
                        </div>
                        <div>
                          {currentScore >= 75 ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-md border border-emerald-300">
                              Memenuhi KKM (Lulus Murni SMA Langsung)
                            </span>
                          ) : currentScore >= 60 ? (
                            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-md border border-amber-300">
                              Di Bawah KKM (Disarankan Masuk Jalur IL)
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-md border border-rose-300">
                              Belum Memenuhi Kriteria Standar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Penyesuaian Nilai Manual (Opsional) */}
                    <div className="mb-4">
                      <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-1.5">
                        Nilai Manual / Override (Opsional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={lisanArabForm.score_override ?? ""}
                        onChange={(e) => setLisanArabForm({ ...lisanArabForm, score_override: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-sky-100 rounded-md font-bold text-sky-950 focus:border-sky-500 outline-none text-xs"
                        placeholder={`Kosongkan untuk memakai total aspek (${calcScore})`}
                      />
                    </div>

                    {/* Rekomendasi */}
                    <div className="mb-4">
                      <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2">
                        Rekomendasi Jalur Penguji *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { val: "Diterima", label: "Diterima (SMA Langsung)", color: "sky" },
                          { val: "Cadangan", label: "Cadangan / Rekomendasi IL", color: "gold" },
                          { val: "Ditolak", label: "Tidak Direkomendasikan", color: "red" },
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className={`px-3.5 py-3 rounded-lg cursor-pointer border-2 transition-all text-xs font-black text-center ${
                              lisanArabForm.rekomendasi === opt.val
                                ? (opt.val === "Diterima"
                                    ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                                    : opt.val === "Cadangan"
                                    ? "border-gold-500 bg-gold-50 text-gold-800 shadow-sm"
                                    : "border-red-500 bg-red-50 text-red-700 shadow-sm")
                                : "border-sky-50 bg-white hover:border-sky-200 text-ink-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`rekom-lisan-arab-${p.id}`}
                              value={opt.val}
                              checked={lisanArabForm.rekomendasi === opt.val}
                              onChange={() => setLisanArabForm({ ...lisanArabForm, rekomendasi: opt.val })}
                              className="hidden"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Catatan Penguji */}
                    <div>
                      <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2">
                        Catatan / Komentar Penguji <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
                      </label>
                      <textarea
                        value={lisanArabForm.catatan_tambahan || ""}
                        onChange={(e) => setLisanArabForm({ ...lisanArabForm, catatan_tambahan: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white border border-sky-100 rounded-lg focus:border-sky-500 outline-none font-medium text-sky-950 min-h-[90px] transition-all resize-none text-xs"
                        placeholder="Tuliskan catatan khusus terkait kelancaran qira'ah, pemahaman nahwu, mufrodat, atau kesiapan bahasa santri..."
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-sky-100/60 mt-4">
                      <button
                        onClick={cancelEditing}
                        disabled={!!saving}
                        className="px-6 py-3.5 rounded-lg font-black text-xs uppercase tracking-widest text-ink-500 hover:bg-ink-100 transition-all flex-1 text-center"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => saveForm(p, "lisan_arab")}
                        disabled={isInputtedByAdmin || !!saving || (currentScore === 0 && !lisanArabForm.score_override) || !lisanArabForm.rekomendasi || !lisanArabForm.catatan_tambahan?.trim()}
                        className="px-6 py-3.5 rounded-lg font-black text-xs uppercase tracking-widest bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-sm shadow-sky-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center flex justify-center items-center gap-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Menyimpan...' : 'Simpan Nilai B. Arab'}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-lg border border-sky-100/50">
            {isSaved ? (
              <>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Nilai Bahasa Arab</p>
                  <p className="text-2xl font-black text-sky-950">{arabScore ?? "-"}</p>
                  {p.detail_lisan_arab?.muhadatsah != null && (
                    <div className="mt-2 text-[11px] text-ink-500 space-y-0.5">
                      <p>Muhadatsah: <span className="font-bold text-sky-900">{p.detail_lisan_arab.muhadatsah}</span> / 30 • Qira'ah: <span className="font-bold text-sky-900">{p.detail_lisan_arab.qiraah}</span> / 30</p>
                      <p>Qawa'id: <span className="font-bold text-sky-900">{p.detail_lisan_arab.qawaid}</span> / 25 • Mufrodat: <span className="font-bold text-sky-900">{p.detail_lisan_arab.mufrodat}</span> / 15</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1.5">Rekomendasi Jalur</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    p.detail_lisan_arab?.rekomendasi === "Diterima"
                      ? "bg-sky-100 text-sky-800"
                      : p.detail_lisan_arab?.rekomendasi === "Cadangan"
                      ? "bg-gold-100 text-gold-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {p.detail_lisan_arab?.rekomendasi === "Diterima"
                      ? "Diterima (SMA Langsung)"
                      : p.detail_lisan_arab?.rekomendasi === "Cadangan"
                      ? "Cadangan / Rekomendasi IL"
                      : p.detail_lisan_arab?.rekomendasi || "-"}
                  </span>
                </div>
                {(p.catatan_lisan_arab || p.detail_lisan_arab?.catatan_tambahan) && (
                  <div className="md:col-span-2 mt-2 pt-4 border-t border-sky-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-2">Catatan Penguji</p>
                    <p className="text-sm font-medium text-ink-700 whitespace-pre-wrap">{p.catatan_lisan_arab || p.detail_lisan_arab?.catatan_tambahan}</p>
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
              <button
                onClick={() => startEditing(p, "lisan_arab")}
                className="px-5 md:px-8 py-3.5 sm:py-4 bg-sky-600 text-white rounded-lg sm:rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm shadow-sky-900/20 active:scale-95 leading-none"
              >
                {isSaved ? "Edit Nilai" : "Input Nilai B. Arab"}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-lg sm:rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200 whitespace-nowrap shrink-0">
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
    const isPutriByJenjang = (p?.jenjang?.toLowerCase() || "").includes('putri');
    const isPutriByPrefix = ['SPI', 'SMI', 'ILI', 'MTI', 'MAI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutriByExaminer = ["Andi Fatimah Azzahra Rahman", "Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
      quranForm.nama_penguji === name || p.detail_quran?.nama_penguji === name
    );
    const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
    const examinerList = isPutri ? PENGUJI_QURAN_LIST_PUTRI : PENGUJI_QURAN_LIST_PUTRA;

    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-4 sm:p-4.5 bg-emerald-100 rounded-3xl whitespace-nowrap inline-block shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#9D174D]" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#9D174D] tracking-tight">
            {isJenjangLangsungNonIL(p.jenjang) ? "Tes Al-Qur'an (Bacaan & Hafalan)" : "Tes Al-Qur'an"}
          </h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-[#9D174D] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = false as boolean; // Penguji bebas edit nilai kapan saja
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 sm:p-5 bg-amber-50 rounded-3xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-4 sm:p-4.5 bg-amber-100 rounded-2xl sm:rounded-3xl whitespace-nowrap inline-block shrink-0">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}> <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-sm"> <div> <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Tajwid (1-100) *</label> <input type="number" min="1" max="100" value={quranForm.tajwid || ""} onChange={(e) => setQuranForm({ ...quranForm, tajwid: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-3xl sm:rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nilai Kelancaran (1-100) *</label>
                <input type="number" min="1" max="100" value={quranForm.kelancaran || ""} onChange={(e) => setQuranForm({ ...quranForm, kelancaran: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-3xl sm:rounded-2xl focus:border-emerald-500 outline-none font-black text-emerald-950 transition-all placeholder:text-ink-400" placeholder="0-100" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">
                Rekomendasi Penguji Al-Qur&apos;an <span className="text-red-600 font-bold">* (Wajib Dipilih)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${quranForm.rekomendasi === opt ? (opt === "Diterima" ? "border-emerald-500 bg-emerald-50 text-[#9D174D] shadow-2xl     " : opt === "Cadangan" ? "border-secondary-500 bg-secondary-50 text-secondary-800 shadow-2xl     " : "border-red-500 bg-red-50 text-red-700 shadow-2xl     ") : "border-emerald-50 bg-white hover:border-emerald-200"}`}>
                    <input type="radio" name={`rekom-quran-${p.id}`} value={opt} checked={quranForm.rekomendasi === opt} onChange={() => setQuranForm({ ...quranForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">Nama Penguji Al-Qur&apos;an (Otomatis)</label>
              <input type="text" value={quranForm.nama_penguji || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-3xl sm:rounded-2xl font-black text-emerald-950 outline-none cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">
                Catatan / Komentar Penguji Bacaan <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
              </label>
              <textarea value={quranForm.catatan || ""} onChange={(e) => setQuranForm({ ...quranForm, catatan: e.target.value })} rows={3} required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-emerald-100 rounded-3xl sm:rounded-2xl focus:border-emerald-500 outline-none font-medium text-emerald-950 transition-all resize-none placeholder:text-ink-400" placeholder="Tuliskan catatan/komentar evaluasi bacaan Al-Qur'an santri (misal: makharijul huruf, tajwid, kelancaran, irama, adab)..." />
            </div>

            {/* Khusus SMA / MA: Section Penilaian Hafalan Al-Qur'an (Tahfidz) */}
            {isJenjangLangsungNonIL(p.jenjang) && (
              <div className="pt-6 border-t-2 border-emerald-200/80 space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    Khusus Jenjang {p.jenjang}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-teal-950 uppercase tracking-wider">
                    Penilaian Hafalan Al-Qur&apos;an (Tahfidz)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-sm">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">
                      Jumlah Juz yang Dihafal *
                    </label>
                    <input
                      type="text"
                      value={quranForm.jumlah_juz || ""}
                      onChange={(e) => setQuranForm({ ...quranForm, jumlah_juz: e.target.value })}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-teal-100 rounded-3xl sm:rounded-2xl focus:border-teal-500 outline-none font-black text-teal-950 transition-all placeholder:text-ink-400"
                      placeholder="Misal: 1 Juz, 3 Juz, Juz 30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">
                      Nilai Hafalan (1-100) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quranForm.hafalan !== undefined ? quranForm.hafalan : ""}
                      onChange={(e) => setQuranForm({ ...quranForm, hafalan: e.target.value })}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-teal-100 rounded-3xl sm:rounded-2xl focus:border-teal-500 outline-none font-black text-teal-950 transition-all placeholder:text-ink-400"
                      placeholder="0-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-3 sm:mb-4">
                    Rekomendasi Penguji Hafalan <span className="text-red-600 font-bold">* (Wajib Dipilih)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                      <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black text-center ${quranForm.rekomendasi_hafalan === opt ? (opt === "Diterima" ? "border-teal-500 bg-teal-50 text-teal-700 shadow-2xl" : opt === "Cadangan" ? "border-gold-500 bg-gold-50 text-gold-800 shadow-2xl" : "border-red-500 bg-red-50 text-red-700 shadow-2xl") : "border-teal-50 bg-white hover:border-teal-200"}`}>
                        <input
                          type="radio"
                          name={`rekom-hafalan-quran-${p.id}`}
                          value={opt}
                          checked={quranForm.rekomendasi_hafalan === opt}
                          onChange={() => setQuranForm({ ...quranForm, rekomendasi_hafalan: opt })}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-ink-700 uppercase tracking-widest mb-2 sm:mb-3">
                    Catatan / Komentar Hafalan <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
                  </label>
                  <textarea
                    value={quranForm.catatan_hafalan || ""}
                    onChange={(e) => setQuranForm({ ...quranForm, catatan_hafalan: e.target.value })}
                    rows={3}
                    required
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white border-2 border-teal-100 rounded-3xl sm:rounded-2xl focus:border-teal-500 outline-none font-medium text-teal-950 transition-all resize-none placeholder:text-ink-400"
                    placeholder="Tuliskan catatan evaluasi hafalan (misal: jumlah juz, kelancaran sambung ayat, tajwid hafalan, mutqin/ziyadah)..."
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-emerald-100 text-[#9D174D] rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-emerald-200 transition-all active:scale-95 whitespace-nowrap inline-block shrink-0">Batal</button>
              <button
                onClick={() => saveForm(p, "quran")}
                disabled={
                  isInputtedByAdmin ||
                  !quranForm.tajwid ||
                  !quranForm.kelancaran ||
                  !quranForm.rekomendasi ||
                  !(quranForm.nama_penguji || activeName) ||
                  !quranForm.catatan?.trim() ||
                  (isJenjangLangsungNonIL(p.jenjang) && (
                    quranForm.hafalan === undefined ||
                    quranForm.hafalan === "" ||
                    !quranForm.rekomendasi_hafalan ||
                    !quranForm.catatan_hafalan?.trim()
                  )) ||
                  saving === p.id + "quran"
                }
                className="w-full sm:w-auto px-5 md:px-8 py-4 bg-[#9D174D] text-white rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-[#9D174D] transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
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
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-3xl sm:rounded-2xl px-5 sm:px-6 border border-emerald-100/50 shadow-inner">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#9D174D] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#9D174D] font-black text-sm leading-none">Nilai sudah tersimpan.</p>
                    <div className="mt-2 space-y-1">
                      {(p.score_quran != null || p.nilai_tes_quran != null) && (
                        <p className="text-[#9D174D]/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Skor Bacaan: {p.score_quran ?? p.nilai_tes_quran}
                        </p>
                      )}
                      {p.detail_quran?.rekomendasi && (
                        <p className="text-[#9D174D]/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Rekomendasi Bacaan: {p.detail_quran.rekomendasi}
                        </p>
                      )}
                      {p.detail_quran?.nama_penguji && (
                        <p className="text-[#9D174D]/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                          Penguji: {p.detail_quran.nama_penguji}
                        </p>
                      )}
                      {isJenjangLangsungNonIL(p.jenjang) && (p.score_hafalan != null || p.nilai_tes_hafalan != null) && (
                        <div className="mt-2 pt-2 border-t border-emerald-100 space-y-1">
                          <p className="text-teal-800 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                            Skor Hafalan: {p.score_hafalan ?? p.nilai_tes_hafalan}
                            {p.detail_hafalan?.jumlah_juz ? ` (${p.detail_hafalan.jumlah_juz})` : ""}
                          </p>
                          {p.detail_hafalan?.rekomendasi && (
                            <p className="text-teal-800/80 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                              Rekomendasi Hafalan: {p.detail_hafalan.rekomendasi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {p.input_at_quran && (
                  <div className={`mt-1 flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${getLockInfo(p.input_at_quran).isLocked ? "text-red-600" : "text-[#9D174D]/70"}`}>
                    {getLockInfo(p.input_at_quran).isLocked ? <LockIcon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {getLockInfo(p.input_at_quran).remainingText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[#9D174D]/50 py-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic">Peserta belum dinilai</span>
              </div>
            )}
            
            {(!isSaved || !getLockInfo(p.input_at_quran).isLocked) ? (
              <button onClick={() => startEditing(p, "quran")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-[#9D174D] text-white rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-[#9D174D] transition-all shadow-2xl active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200 whitespace-nowrap shrink-0">
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
    const isPutriByJenjang = (p?.jenjang?.toLowerCase() || "").includes('putri');
    const isPutriByPrefix = ['SPI', 'SMI', 'ILI', 'MTI', 'MAI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutriByExaminer = ["Halimah Fauziah", "Rima Maryani Putri Utami"].some(name => 
      calsanForm.nama_pewawancara === name || p.detail_wawancara?.nama_pewawancara === name
    );
    const isPutri = isPutriByJenjang || isPutriByPrefix || isPutriByExaminer;
    const criteria = isPutri ? CALSAN_CRITERIA_PUTRI : CALSAN_CRITERIA_PUTRA;
    const interviewerList = isPutri ? PEWAWANCARA_CALSAN_LIST_PUTRI : PEWAWANCARA_CALSAN_LIST_PUTRA;

    return (
      <div className="bg-primary-50/50 border border-primary-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-4 sm:p-4.5 bg-primary-100 rounded-3xl whitespace-nowrap inline-block shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-primary-900 tracking-tight">Seleksi Wawancara Calon Santri</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-primary-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = false as boolean; // Penguji bebas edit nilai kapan saja
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 sm:p-5 bg-amber-50 rounded-3xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-4 sm:p-4.5 bg-amber-100 rounded-2xl sm:rounded-3xl whitespace-nowrap inline-block shrink-0">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>{criteria.map((criterion) => (
              <div key={criterion.key} className="space-y-3 sm:space-y-4">
                <label className="block text-xs sm:text-sm font-black text-primary-950 uppercase tracking-tight leading-none">{criterion.label}</label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {criterion.options.map((opt) => (
                    <label key={opt.value} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-6 sm:p-8 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${calsanForm[criterion.key] === opt.value ? "border-primary-600 bg-primary-50 text-primary-900 shadow-2xl     " : "border-ink-100 hover:border-primary-200 bg-ink-50/30 text-ink-700"}`}>
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
                  <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">
                    Rekomendasi Hasil <span className="text-red-600 font-bold">* (Wajib Dipilih)</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {[
                      "A. Sangat Layak diterima (potensi besar berkembang di pesantren).",
                      "B. Layak diterima dengan catatan pembinaan.",
                      "C. Perlu Pertimbangan (butuh bimbingan khusus).",
                      "D. Tidak disarankan (risiko tinggi, banyak faktor negatif).",
                      "E. Tidak layak diterima saat ini.",
                    ].map((opt) => (
                      <label key={opt} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-6 sm:p-8 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${calsanForm.rekomendasi === opt ? "border-primary-600 bg-primary-50 text-primary-900 shadow-2xl     " : "border-ink-100 hover:border-primary-200 bg-ink-50/30 text-ink-700"}`}>
                        <input type="radio" name={`rekom-calsan-${p.id}`} value={opt} checked={calsanForm.rekomendasi === opt} onChange={() => setSantriForm({ ...calsanForm, rekomendasi: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 accent-primary-600" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Pewawancara (Otomatis)</label>
                  <input type="text" value={calsanForm.nama_pewawancara || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-primary-50/50 border-2 border-primary-100 rounded-3xl sm:rounded-2xl font-black text-primary-950 outline-none cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">
                  Catatan / Komentar Pewawancara <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
                </label>
                <textarea value={calsanForm.catatan || ""} onChange={(e) => setSantriForm({ ...calsanForm, catatan: e.target.value })} rows={4} required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/50 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-primary-500 outline-none font-medium text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Tuliskan catatan/komentar hasil wawancara calon santri (misal: motivasi, karakter, kemandirian, pergaulan, kesiapan tinggal di asrama)..." />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-ink-100 text-ink-800 rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-ink-200 transition-all active:scale-95">Batal</button>
              <button onClick={() => saveForm(p, "wawancara")} disabled={isInputtedByAdmin || !criteria.every((c) => calsanForm[c.key]) || !calsanForm.rekomendasi || !(calsanForm.nama_pewawancara || activeName) || !calsanForm.catatan?.trim() || saving === p.id + "wawancara"} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-primary-700 text-white rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-primary-800 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
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
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-3xl sm:rounded-2xl px-5 sm:px-6 border border-primary-100/50 shadow-inner">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-primary-950 font-black text-sm leading-none">Hasil Wawancara Calon Santri sudah tersimpan.</p>
                    <p className="text-primary-700/70 text-[10px] sm:text-xs font-black mt-2 uppercase tracking-widest">Rekomendasi: {p?.detail_wawancara?.rekomendasi?.split('.')?.[0] || 'Tersimpan'}</p>
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
              <button onClick={() => startEditing(p, "wawancara")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-primary-700 text-white rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-primary-800 transition-all shadow-2xl active:scale-95 leading-none">
                {isSaved ? "Edit Nilai" : "Input Nilai"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200 whitespace-nowrap shrink-0">
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

    const isPutriByJenjang = (p?.jenjang?.toLowerCase() || "").includes('putri');
    const isPutriByPrefix = ['SPI', 'SMI', 'ILI', 'MTI', 'MAI'].some(prefix => p.nomor_pendaftaran?.startsWith(prefix));
    const isPutri = isPutriByJenjang || isPutriByPrefix;
    const interviewerList = isPutri ? PEWAWANCARA_CAWALSAN_LIST_PUTRI : PEWAWANCARA_CAWALSAN_LIST_PUTRA;

    return (
      <div className="bg-secondary-50/50 border border-secondary-100 rounded-2xl sm:rounded-3xl p-5 sm:p-5 md:p-8 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-4 sm:p-4.5 bg-secondary-100 rounded-3xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-700" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-primary-950 tracking-tight">Seleksi Wawancara Orang Tua/Wali</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 sm:px-4 sm:py-1.5 bg-secondary-400 text-primary-950 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl flex items-center gap-1.5 border border-secondary-500/20">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Dinilai
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            {(() => {
              const isInputtedByAdmin = false as boolean; // Penguji bebas edit nilai kapan saja
              return (
                <>
                  {isInputtedByAdmin && (
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 sm:p-5 bg-amber-50 rounded-3xl sm:rounded-2xl border-2 border-amber-200 flex items-start gap-3 sm:gap-4">
                      <div className="p-4 sm:p-4.5 bg-amber-100 rounded-2xl sm:rounded-3xl whitespace-nowrap inline-block shrink-0">
                        <LockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-950 text-sm sm:text-base">Terkunci (Input Khusus Admin)</h3>
                        <p className="text-amber-800 text-xs sm:text-sm mt-1 sm:mt-1.5 font-medium leading-relaxed">Nilai ini telah diinput secara khusus oleh Admin Super. Anda tidak dapat mengubahnya.</p>
                      </div>
                    </div>
                  )}
                  <div className={isInputtedByAdmin ? "opacity-60 pointer-events-none grayscale" : ""}>{/* Dasar Informasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 bg-white rounded-3xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Audiens/Orangtua *</label>
                <input type="text" value={cawalsanForm.nama_orangtua || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, nama_orangtua: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all placeholder:text-ink-400" placeholder="Nama orangtua/wali" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Asal Daerah *</label>
                <input type="text" value={cawalsanForm.asal || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, asal: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all placeholder:text-ink-400" placeholder="Contoh: Sukabumi, Jawa Barat" />
              </div>
            </div>

            {/* Kategori & Sumber */}
            <div className="bg-white rounded-3xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">Kategori Calon Santri *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {KATEGORI_OPTIONS.map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-6 sm:p-8 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${cawalsanForm.kategori === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-2xl     " : "border-ink-50 hover:border-secondary-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`kategori-${p.id}`} value={opt} checked={cawalsanForm.kategori === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, kategori: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 accent-secondary-500" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Sumber Informasi *</label>
                <select value={cawalsanForm.sumber_info || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, sumber_info: e.target.value })} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all cursor-pointer">
                  <option value="">Pilih Sumber Informasi</option>
                  {SUMBER_INFO_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* 12 Pertanyaan */}
            <div className="space-y-3 sm:space-y-4">
              {CAWALSAN_QUESTIONS.map((q) => (
                <div key={q.key} className="bg-white rounded-3xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs">
                  <label className="block text-xs sm:text-sm font-black text-primary-950 mb-3 sm:mb-4">{q.label} *</label>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label key={opt} className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-6 sm:p-8 rounded-3xl cursor-pointer border-2 transition-all text-xs sm:text-sm font-black ${cawalsanForm[q.key] === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-2xl     " : "border-ink-50 hover:border-secondary-200 bg-ink-50/30 text-ink-700"}`}>
                        <input type="radio" name={`${q.key}-${p.id}`} value={opt} checked={cawalsanForm[q.key] === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, [q.key]: opt })} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 accent-secondary-500" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Karakter & SPP & Rekomendasi */}
            <div className="bg-white rounded-3xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-100 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Karakter Santri (Positif & Negatif) *</label>
                <textarea value={cawalsanForm.karakter || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, karakter: e.target.value })} rows={3} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-secondary-500 outline-none font-black text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Deskripsikan karakter santri yang menonjol..." />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">Sudah Tahu Biaya SPP? *</label>
                <div className="flex gap-3 sm:gap-4">
                  {["Sudah", "Belum"].map((opt) => (
                    <label key={opt} className={`flex-1 px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl cursor-pointer border-2 transition-all text-[10px] sm:text-xs font-black shadow-2xl text-center uppercase tracking-widest ${cawalsanForm.tahu_spp === opt ? "border-secondary-400 bg-secondary-50 text-primary-950 shadow-2xl     " : "border-ink-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`spp-${p.id}`} value={opt} checked={cawalsanForm.tahu_spp === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, tahu_spp: opt })} className="hidden" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-3 sm:mb-4">
                  Rekomendasi Pewawancara <span className="text-red-600 font-bold">* (Wajib Dipilih)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                  {["Diterima", "Diterima dengan catatan", "Ditolak"].map((opt) => (
                    <label key={opt} className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl cursor-pointer border-2 transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center shadow-2xl ${cawalsanForm.rekomendasi === opt ? (opt === "Diterima" ? "border-emerald-500 bg-emerald-50 text-[#9D174D] shadow-2xl     " : opt.includes("catatan") ? "border-secondary-500 bg-secondary-50 text-secondary-800 shadow-2xl     " : "border-red-500 bg-red-50 text-red-700 shadow-2xl     ") : "border-ink-200 bg-ink-50/30 text-ink-700"}`}>
                      <input type="radio" name={`rekom-cawalsan-${p.id}`} value={opt} checked={cawalsanForm.rekomendasi === opt} onChange={() => setOrangTuaForm({ ...cawalsanForm, rekomendasi: opt })} className="hidden" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">Nama Pewawancara (Otomatis)</label>
                <input type="text" value={cawalsanForm.nama_pewawancara || activeName} readOnly className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-secondary-50/50 border-2 border-ink-100 rounded-3xl sm:rounded-2xl font-black text-primary-950 outline-none cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-ink-800 uppercase tracking-widest mb-2 sm:mb-3">
                  Catatan / Komentar Pewawancara <span className="text-red-600 font-bold">* (Wajib Diisi untuk Rapat)</span>
                </label>
                <textarea value={cawalsanForm.catatan || ""} onChange={(e) => setOrangTuaForm({ ...cawalsanForm, catatan: e.target.value })} rows={3} required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-ink-50/30 border-2 border-ink-100 rounded-3xl sm:rounded-2xl focus:border-secondary-500 outline-none font-medium text-primary-950 transition-all resize-none placeholder:text-ink-400" placeholder="Tuliskan catatan/komentar hasil wawancara orang tua/wali santri (misal: komitmen kepesantrenan, kesiapan pembiayaan, dukungan orang tua)..." />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-secondary-100 text-secondary-900 rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-secondary-200 transition-all active:scale-95">Batal</button>
              <button onClick={() => saveForm(p, "ortu")} disabled={isInputtedByAdmin || !cawalsanForm.nama_orangtua || !cawalsanForm.asal || !cawalsanForm.kategori || !cawalsanForm.sumber_info || !cawalsanForm.karakter || !cawalsanForm.tahu_spp || !cawalsanForm.rekomendasi || !(cawalsanForm.nama_pewawancara || activeName) || !CAWALSAN_QUESTIONS.every((q) => cawalsanForm[q.key]) || !cawalsanForm.catatan?.trim() || saving === p.id + "ortu"} className="w-full sm:w-auto px-5 md:px-8 py-4 bg-secondary-400 text-primary-950 rounded-3xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-secondary-500 transition-all shadow-2xl shadow-secondary-400/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
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
              <div className="flex flex-col gap-3 py-4 sm:py-5 bg-white/50 rounded-3xl sm:rounded-2xl px-5 sm:px-6 border border-secondary-100/50 shadow-inner">
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
              <button onClick={() => startEditing(p, "ortu")} className="mt-5 sm:mt-6 px-5 md:px-8 py-4 bg-secondary-400 text-primary-950 rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-secondary-500 transition-all shadow-2xl shadow-secondary-400/20 active:scale-95 leading-none">
                {isSaved ? "Edit Hasil" : "Input Hasil"}
              </button>
            ) : (
              <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 text-stone-400 rounded-3xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-stone-200 whitespace-nowrap shrink-0">
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
      <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-6 md:p-10 border border-secondary-100 shadow-2xl app-card overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 shrink-0 shadow-2xl">
              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-primary-950 font-display tracking-tight leading-none">Input Nilai Ujian</h1>
              <p className="text-xs sm:text-sm font-bold text-ink-700 mt-2">Total Terdaftar: <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-2xl border border-primary-100/50">{peserta.length} peserta</span></p>
            </div>
          </div>
        </div>

        {/* Admin Filter View Toggle */}
        {isAdmin && (
          <div className="mt-6 flex flex-wrap items-center gap-2 bg-ink-50 p-1.5 rounded-xl border border-ink-100 w-fit relative z-10">
            <button
              type="button"
              onClick={() => handleViewFilterChange("all")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                viewFilter === "all"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              🌐 Semua Peserta Ujian (Admin View)
            </button>
            <button
              type="button"
              onClick={() => handleViewFilterChange("mine")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                viewFilter === "mine"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              👤 Khusus Plotting Saya
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mt-8 relative z-10">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-ink-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau nomor..." className="w-full pl-11 sm:pl-14 pr-6 py-3.5 sm:py-4.5 bg-ink-50/50 border border-ink-200 rounded-2xl sm:rounded-3xl focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none text-sm sm:text-base font-black text-primary-950 transition-all placeholder:text-ink-400" />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-6 sm:p-8 rounded-3xl flex items-center gap-2 text-sm font-semibold ${message.type === "success" ? "bg-green-50 text-[#9D174D] border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-2xl app-card">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <span className="text-ink-600 font-black uppercase tracking-widest text-sm">Memuat data peserta...</span>
        </div>
      ) : filteredPeserta.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-4xl border border-secondary-100 shadow-2xl app-card">
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
