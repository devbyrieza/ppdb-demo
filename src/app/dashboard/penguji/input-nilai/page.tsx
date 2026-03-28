"use client";

import { useState, useEffect } from "react";
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
}

// ============================================================================
// FORM DEFINITIONS
// ============================================================================

const CALSAN_CRITERIA = [
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
    label: "Permainan / Game yang Disuka",
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
    label: "Tentang Rokok/Vape/Pod",
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

const CAWALSAN_QUESTIONS = [
  { key: "q1", label: "1. Abu/Ummu ingin ananda menjadi seperti apa di masa depan?", options: ["A. Condong ke orientasi akhirat/agama", "B. Condong ke orientasi dunia/umum", "C. Hanya berorientasi dunia/umum"] },
  { key: "q2", label: "2. Bagaimana pandangan  Abu/Ummu  tentang sistem pendidikan berbasis pesantren?", options: ["A. Pilihan utama untuk agama, akhlak, dan karakter", "B. Pilihan utama untuk akhlak", "C. Pesantren juga mengajarkan pelajaran umum"] },
  { key: "q3", label: "3. Ananda mau bersekolah di Pesantren Al-Andalus atas keinginan siapa?", options: ["A. Orang tua & anak", "B. Anak", "C. Orang tua / ikut teman"] },
  { key: "q4", label: "4. Apa yang  Abu/Ummu   lakukan sehingga ananda mau bersekolah di pesantren?", options: ["A. Memberikan pengertian", "B. Memberikan hadiah/iming-iming", "C. Memaksa"] },
  { key: "q5", label: "5. Sejauh apa pendidikan agama/Al-Qur’an ananda sebelumnya?", options: ["A. Intensif (tahfizh, sekolah Islam)", "B. Non intensif (swasta biasa)", "C. Seadanya (sekolah negeri)"] },
  { key: "q6", label: "6. Menurut Bapak/Ibu, keberhasilan proses pendidikan anak merupakan tanggung jawab siapa?", options: ["A. Bersama", "Orang Tua", "Sekolah"] },
  { key: "q7", label: "7. Sejauh apa kesiapan  Abu/Ummu   memenuhi kewajiban SPP?", options: ["A. Yakin", "B. Ragu-ragu", "C. Tidak tahu"] },
  { key: "q8", label: "8. Bagaimana pandangan  Abu/Ummu   tentang pendidikan agama & tahfizh Al-Qur’an?", options: ["A. Sangat penting", "B. Cukup penting", "C. Penting"] },
  { key: "q9", label: "9. Apa saja yang akan dilakukan oleh Bapak/Ibu untuk mendukung program pendidikan Pesantren?", options: ["A. Mendukung semua program dan memberikan masukan positif/ memantau perkembangan anak", "B. Menyerahkan semua urusan ke Pesan", "C. Tidak Tahu"] },
  { key: "q10", label: "10. Seberapa sering  Abu/Ummu   akan menjenguk ananda?", options: ["A. Berkala", "B. Tidak menjenguk karena jauh", "C. Sesempatnya saja"] },
  { key: "q11", label: "11. Jika ananda diganggu teman (iseng/jail/bully), apa langkah  Abu/Ummu?", options: ["A. Klarifikasi & beri semangat pada anak", "B. Serahkan ke pesantren", "C. Komplain ke pesantren"] },
  { key: "q12", label: "12. Jika ananda terkena sanksi, apa reaksi  Abu/Ummu?", options: ["A. Menerima sebagai konsekuensi (selama bimbingan sudah maksimal)", "B. Menasehati anak", "C. Tidak terima"] },
];

const PENGUJI_QURAN_LIST_PUTRA = ["Agus Cahyono", "Fuad Khomsatun", "Jusman", "Testing"];
const PEWAWANCARA_CALSAN_LIST_PUTRA = ["Muhajir", "Muhammad Syauqi Al Faruq", "Rizaldi", "Testing"];
const PEWAWANCARA_CAWALSAN_LIST_PUTRA = ["Abah", "Teguh", "Maulidin Bachtiar", "Muhammad Adib Achsan", "Testing"];

const PENGUJI_QURAN_LIST_PUTRI = ["Andi Fatimah Azzahra Rahman", "Testing"];
const PEWAWANCARA_CALSAN_LIST_PUTRI = ["Halimah Fauziah", "Rima Maryani Putri Utami", "Testing"];
const PEWAWANCARA_CAWALSAN_LIST_PUTRI = ["Abah", "Teguh", "Maulidin Bachtiar", "Muhammad Adib Achsan", "Testing"]; // Sama dengan Putra

const JENJANG_OPTIONS = ["MTs Putra", "MTs Putri", "IL Putra", "IL Putri", "SMA Putra", "SMA Putri"];

const KATEGORI_OPTIONS = ["Yatim/ah", "Memiliki keluarga/saudara/kerabat di Andalus", "Memiliki teman/rekan/tetangga di Andalus", "Baru"];

const SUMBER_INFO_OPTIONS = ["Searching umum", "IG", "FB", "YouTube", "TikTok", "Lainnya"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Map session role to which form types are visible
const ROLE_TO_FORM_TYPES: Record<string, string[]> = {
  penguji_calsan: ['quran'],
  pewawancara_calsan: ['wawancara'],
  pewawancara_cawalsan: ['ortu'],
  // Admin roles see all forms
  admin: ['quran', 'wawancara', 'ortu'],
  admin_super: ['quran', 'wawancara', 'ortu'],
  head_of_it: ['quran', 'wawancara', 'ortu'],
};

export default function InputNilaiPage() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");

  // Form states for each type
  const [quranForm, setQuranForm] = useState<any>({});
  const [calsanForm, setCalsanForm] = useState<any>({});
  const [cawalsanForm, setCawalsanForm] = useState<any>({});

  // Determine which form types are visible based on the active session role
  const visibleFormTypes = ROLE_TO_FORM_TYPES[activeRole] || ['quran', 'wawancara', 'ortu'];

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  useEffect(() => {
    // Fetch session to get active role
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        const role = data.session?.role || "";
        setActiveRole(role);
      })
      .catch((err) => console.error("Error fetching session:", err));

    fetchPeserta();
  }, []);

  const fetchPeserta = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch("/api/penguji/peserta");
      if (response.ok) {
        const result = await response.json();
        setPeserta(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching peserta:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (p: Peserta) => {
    setEditingId(p.id);
    // Pre-fill forms from existing data
    setQuranForm(p.detail_quran || {});
    setCalsanForm(p.detail_wawancara || {});
    setCawalsanForm(p.detail_cawalsan || {});
    setMessage(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setQuranForm({});
    setCalsanForm({});
    setCawalsanForm({});
  };

  const saveForm = async (p: Peserta, formType: "quran" | "wawancara" | "ortu") => {
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
        const scores = CALSAN_CRITERIA.map((c) => calsanForm[c.key] || 0);
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
        setEditingId(null); // Clear editing state BEFORE showing popup

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data penilaian berhasil disimpan.',
          timer: 1500,
          showConfirmButton: false
        });

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

  const filteredPeserta = peserta.filter(
    (p) =>
      p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      p.nomor_pendaftaran.toLowerCase().includes(search.toLowerCase())
  );

  // ============================================================================
  // RENDER: Tes Al-Qur'an Form
  // ============================================================================
  const renderQuranForm = (p: Peserta) => {
    const isEditing = editingId === p.id;
    const data = isEditing ? quranForm : p.detail_quran || {};
    const isSaved = !!p.detail_quran?.rekomendasi;

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h3 className="text-lg font-bold text-emerald-800">Tes Al-Qur&apos;an</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Sudah Dinilai
            </span>
          )}
        </div>

        {/* Read-only info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-500">Nama:</span> <span className="font-semibold">{toTitleCase(p.nama_lengkap)}</span></div>
          <div><span className="text-gray-500">No. Daftar:</span> <span className="font-semibold">{p.nomor_pendaftaran}</span></div>
          <div><span className="text-gray-500">Jenjang:</span> <span className="font-semibold">{p.jenjang}</span></div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Tajwid */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nilai Kualitas Tajwid (1-100) *</label>
              <input type="number" min="1" max="100" value={quranForm.tajwid || ""} onChange={(e) => setQuranForm({ ...quranForm, tajwid: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none" placeholder="Masukkan nilai 1-100" />
            </div>

            {/* Kelancaran */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nilai Kelancaran Bacaan (1-100) *</label>
              <input type="number" min="1" max="100" value={quranForm.kelancaran || ""} onChange={(e) => setQuranForm({ ...quranForm, kelancaran: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none" placeholder="Masukkan nilai 1-100" />
            </div>

            {/* Rekomendasi */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rekomendasi Penguji *</label>
              <div className="flex flex-col sm:flex-row gap-3">
                {["Diterima", "Cadangan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`px-4 py-2 rounded-lg cursor-pointer border-2 transition-all text-sm font-semibold text-center sm:text-left ${quranForm.rekomendasi === opt ? (opt === "Diterima" ? "border-green-500 bg-green-100 text-green-700" : opt === "Cadangan" ? "border-yellow-500 bg-yellow-100 text-yellow-700" : "border-red-500 bg-red-100 text-red-700") : "border-gray-200 hover:border-gray-400"}`}>
                    <input type="radio" name={`rekom-quran-${p.id}`} value={opt} checked={quranForm.rekomendasi === opt} onChange={() => setQuranForm({ ...quranForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Nama Penguji */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Penguji *</label>
              <select value={quranForm.nama_penguji || ""} onChange={(e) => setQuranForm({ ...quranForm, nama_penguji: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none">
                <option value="">Pilih Penguji</option>
                {(p.jenjang?.toLowerCase().includes("putri") ? PENGUJI_QURAN_LIST_PUTRI : PENGUJI_QURAN_LIST_PUTRA).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan (opsional)</label>
              <textarea value={quranForm.catatan || ""} onChange={(e) => setQuranForm({ ...quranForm, catatan: e.target.value })} rows={3} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 outline-none resize-none" placeholder="Catatan tambahan penguji..." />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={cancelEditing} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg justify-center font-semibold hover:bg-gray-300 transition-colors w-full sm:w-auto">Batal</button>
              <button onClick={() => saveForm(p, "quran")} disabled={!quranForm.tajwid || !quranForm.kelancaran || !quranForm.rekomendasi || !quranForm.nama_penguji || saving === p.id + "quran"} className="w-full sm:w-auto px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving === p.id + "quran" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex items-center gap-2 py-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Nilai sudah tersimpan. Hasil dapat dilihat di Dashboard Admin.</span>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">Belum dinilai</p>
            )}
            <button onClick={() => startEditing(p)} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
              {isSaved ? "Edit Nilai" : "Input Nilai"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Wawancara Calsan Form
  // ============================================================================
  const renderCalsanForm = (p: Peserta) => {
    const isEditing = editingId === p.id;
    const data = isEditing ? calsanForm : p.detail_wawancara || {};
    const isSaved = !!p.detail_wawancara?.rekomendasi;

    return (
      <div className="bg-maroon-50 border border-maroon-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-maroon-700" />
          <h3 className="text-lg font-bold text-maroon-800">Wawancara Calon Santri</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 bg-maroon-100 text-maroon-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Sudah Dinilai
            </span>
          )}
        </div>

        {/* Read-only info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-500">Nama:</span> <span className="font-semibold">{toTitleCase(p.nama_lengkap)}</span></div>
          <div><span className="text-gray-500">No. Daftar:</span> <span className="font-semibold">{p.nomor_pendaftaran}</span></div>
          <div><span className="text-gray-500">Jenjang:</span> <span className="font-semibold">{p.jenjang}</span></div>
        </div>

        {isEditing ? (
          <div className="space-y-5">
            {/* 7 Criteria */}
            {CALSAN_CRITERIA.map((criterion) => (
              <div key={criterion.key} className="bg-white rounded-lg p-4 border border-maroon-100">
                <label className="block text-sm font-bold text-gray-800 mb-3">{criterion.label} *</label>
                <div className="space-y-2">
                  {criterion.options.map((opt) => (
                    <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all text-sm ${calsanForm[criterion.key] === opt.value ? "border-maroon-500 bg-maroon-50" : "border-gray-100 hover:border-maroon-200"}`}>
                      <input type="radio" name={`${criterion.key}-${p.id}`} value={opt.value} checked={calsanForm[criterion.key] === opt.value} onChange={() => setCalsanForm({ ...calsanForm, [criterion.key]: opt.value })} className="w-4 h-4 shrink-0 mt-0.5 accent-maroon-600" />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Nama Pewawancara */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Pewawancara *</label>
              <select value={calsanForm.nama_pewawancara || ""} onChange={(e) => setCalsanForm({ ...calsanForm, nama_pewawancara: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-maroon-500 outline-none">
                <option value="">Pilih Pewawancara</option>
                {(p.jenjang?.toLowerCase().includes("putri") ? PEWAWANCARA_CALSAN_LIST_PUTRI : PEWAWANCARA_CALSAN_LIST_PUTRA).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Rekomendasi */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rekomendasi Pewawancara *</label>
              <div className="space-y-2">
                {[
                  "A. Sangat Layak diterima (potensi besar berkembang di pesantren).",
                  "B. Layak diterima dengan catatan pembinaan.",
                  "C. Perlu Pertimbangan (butuh bimbingan khusus).",
                  "D. Tidak disarankan (risiko tinggi, banyak faktor negatif).",
                  "E. Tidak layak diterima saat ini.",
                ].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all text-sm ${calsanForm.rekomendasi === opt ? "border-maroon-500 bg-maroon-50" : "border-gray-100 hover:border-maroon-200"}`}>
                    <input type="radio" name={`rekom-calsan-${p.id}`} value={opt} checked={calsanForm.rekomendasi === opt} onChange={() => setCalsanForm({ ...calsanForm, rekomendasi: opt })} className="w-4 h-4 shrink-0 mt-1 accent-maroon-600" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Pewawancara (opsional)</label>
              <textarea value={calsanForm.catatan || ""} onChange={(e) => setCalsanForm({ ...calsanForm, catatan: e.target.value })} rows={3} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-maroon-500 outline-none resize-none" placeholder="Catatan pewawancara..." />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 py-2 bg-gray-200 text-gray-700 rounded-lg justify-center font-semibold hover:bg-gray-300 transition-colors">Batal</button>
              <button onClick={() => saveForm(p, "wawancara")} disabled={!CALSAN_CRITERIA.every((c) => calsanForm[c.key]) || !calsanForm.rekomendasi || !calsanForm.nama_pewawancara || saving === p.id + "wawancara"} className="w-full sm:w-auto px-5 py-2 bg-maroon-600 text-white rounded-lg font-semibold hover:bg-maroon-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving === p.id + "wawancara" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex items-center gap-2 py-3">
                <CheckCircle className="w-5 h-5 text-maroon-600" />
                <span className="text-maroon-700 font-semibold">Nilai sudah tersimpan. Hasil dapat dilihat di Dashboard Admin.</span>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">Belum dinilai</p>
            )}
            <button onClick={() => startEditing(p)} className="mt-3 px-4 py-2 bg-maroon-600 text-white rounded-lg text-sm font-semibold hover:bg-maroon-700 transition-colors">
              {isSaved ? "Edit Nilai" : "Input Nilai"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Wawancara Cawalsan Form
  // ============================================================================
  const renderCawalsanForm = (p: Peserta) => {
    const isEditing = editingId === p.id;
    const data = isEditing ? cawalsanForm : p.detail_cawalsan || {};
    const isSaved = !!p.detail_cawalsan?.rekomendasi;

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-amber-700" />
          <h3 className="text-lg font-bold text-amber-800">Wawancara Calon Wali Santri</h3>
          {isSaved && !isEditing && (
            <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Sudah Dinilai
            </span>
          )}
        </div>

        {/* Read-only info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-500">Nama Calon Santri:</span> <span className="font-semibold block sm:inline">{toTitleCase(p.nama_lengkap)}</span></div>
          <div><span className="text-gray-500">No. Daftar:</span> <span className="font-semibold block sm:inline">{p.nomor_pendaftaran}</span></div>
          <div><span className="text-gray-500">Jenjang:</span> <span className="font-semibold block sm:inline">{p.jenjang}</span></div>
        </div>

        {isEditing ? (
          <div className="space-y-5">
            {/* Nama Orangtua */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Audiens/Orangtua *</label>
              <input type="text" value={cawalsanForm.nama_orangtua || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, nama_orangtua: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none" placeholder="Nama orangtua/wali" />
            </div>

            {/* Asal */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Asal *</label>
              <input type="text" value={cawalsanForm.asal || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, asal: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none" placeholder="Asal daerah" />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Calon Santri *</label>
              <div className="space-y-2">
                {KATEGORI_OPTIONS.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all text-sm ${cawalsanForm.kategori === opt ? "border-amber-500 bg-amber-50" : "border-gray-100 hover:border-amber-200"}`}>
                    <input type="radio" name={`kategori-${p.id}`} value={opt} checked={cawalsanForm.kategori === opt} onChange={() => setCawalsanForm({ ...cawalsanForm, kategori: opt })} className="w-4 h-4 shrink-0 mt-0.5 accent-amber-600" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sumber Info */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sumber informasi awal tentang pesantren *</label>
              <select value={cawalsanForm.sumber_info || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, sumber_info: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none">
                <option value="">Pilih sumber</option>
                {SUMBER_INFO_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* 12 Questions */}
            {CAWALSAN_QUESTIONS.map((q) => (
              <div key={q.key} className="bg-white rounded-lg p-4 border border-amber-100">
                <label className="block text-sm font-bold text-gray-800 mb-3">{q.label} *</label>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all text-sm ${cawalsanForm[q.key] === opt ? "border-amber-500 bg-amber-50" : "border-gray-100 hover:border-amber-200"}`}>
                      <input type="radio" name={`${q.key}-${p.id}`} value={opt} checked={cawalsanForm[q.key] === opt} onChange={() => setCawalsanForm({ ...cawalsanForm, [q.key]: opt })} className="w-4 h-4 shrink-0 mt-0.5 accent-amber-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Karakter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Apa karakter ananda yang menonjol: positif & negatif *</label>
              <textarea value={cawalsanForm.karakter || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, karakter: e.target.value })} rows={3} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none resize-none" placeholder="Karakter positif dan negatif..." />
            </div>

            {/* SPP */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Apakah sudah mengetahui biaya SPP satu tahun? *</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {["Sudah", "Belum"].map((opt) => (
                  <label key={opt} className={`px-5 py-2 rounded-lg cursor-pointer border-2 transition-all text-sm font-semibold flex-1 text-center sm:flex-none ${cawalsanForm.tahu_spp === opt ? "border-amber-500 bg-amber-100" : "border-gray-200 hover:border-amber-300"}`}>
                    <input type="radio" name={`spp-${p.id}`} value={opt} checked={cawalsanForm.tahu_spp === opt} onChange={() => setCawalsanForm({ ...cawalsanForm, tahu_spp: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Rekomendasi */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rekomendasi Pewawancara *</label>
              <div className="space-y-2">
                {["Diterima", "Diterima dengan catatan", "Ditolak"].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all text-sm font-semibold ${cawalsanForm.rekomendasi === opt ? (opt === "Diterima" ? "border-green-500 bg-green-50 text-green-700" : opt.includes("catatan") ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-red-500 bg-red-50 text-red-700") : "border-gray-100 hover:border-gray-300"}`}>
                    <input type="radio" name={`rekom-cawalsan-${p.id}`} value={opt} checked={cawalsanForm.rekomendasi === opt} onChange={() => setCawalsanForm({ ...cawalsanForm, rekomendasi: opt })} className="hidden" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Nama Pewawancara */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Pewawancara *</label>
              <select value={cawalsanForm.nama_pewawancara || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, nama_pewawancara: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none">
                <option value="">Pilih Pewawancara</option>
                {(p.jenjang?.toLowerCase().includes("putri") ? PEWAWANCARA_CAWALSAN_LIST_PUTRI : PEWAWANCARA_CAWALSAN_LIST_PUTRA).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Pewawancara (opsional)</label>
              <textarea value={cawalsanForm.catatan || ""} onChange={(e) => setCawalsanForm({ ...cawalsanForm, catatan: e.target.value })} rows={3} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 outline-none resize-none" placeholder="Catatan pewawancara..." />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={cancelEditing} className="w-full sm:w-auto px-5 py-2 bg-gray-200 text-gray-700 rounded-lg justify-center font-semibold hover:bg-gray-300 transition-colors">Batal</button>
              <button onClick={() => saveForm(p, "ortu")} disabled={!cawalsanForm.nama_orangtua || !cawalsanForm.asal || !cawalsanForm.kategori || !cawalsanForm.sumber_info || !cawalsanForm.karakter || !cawalsanForm.tahu_spp || !cawalsanForm.rekomendasi || !cawalsanForm.nama_pewawancara || !CAWALSAN_QUESTIONS.every((q) => cawalsanForm[q.key]) || saving === p.id + "ortu"} className="w-full sm:w-auto px-5 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving === p.id + "ortu" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isSaved ? (
              <div className="flex items-center gap-2 py-3">
                <CheckCircle className="w-5 h-5 text-amber-600" />
                <span className="text-amber-700 font-semibold">Nilai sudah tersimpan. Hasil dapat dilihat di Dashboard Admin.</span>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">Belum dinilai</p>
            )}
            <button onClick={() => startEditing(p)} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">
              {isSaved ? "Edit Nilai" : "Input Nilai"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Main Page
  // ============================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm app-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-maroon-50 rounded-2xl flex items-center justify-center border border-maroon-100 shrink-0">
              <ClipboardCheck className="w-7 h-7 text-maroon-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-950 font-display tracking-tight">Input Nilai Ujian</h1>
              <p className="text-sm font-bold text-ink-500 mt-1">Total: <span className="text-maroon-700">{peserta.length} peserta</span></p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau nomor pendaftaran..." className="w-full pl-12 pr-4 py-3.5 bg-cream-50 border border-cream-200 rounded-2xl focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 outline-none text-sm font-semibold transition-all" />
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
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-cream-200 shadow-sm app-card">
          <Loader2 className="w-10 h-10 animate-spin text-maroon-600 mb-4" />
          <span className="text-ink-600 font-bold">Memuat data peserta...</span>
        </div>
      ) : filteredPeserta.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-cream-200 shadow-sm app-card">
          <User className="w-16 h-16 mx-auto mb-4 text-ink-300" />
          <p className="font-black text-ink-950 text-lg">Tidak ada peserta ditemukan</p>
          <p className="text-sm font-medium text-ink-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPeserta.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 md:p-8 border border-cream-200 shadow-sm app-card">
              {/* Peserta Header */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-cream-100">
                <div className="w-14 h-14 bg-cream-50 rounded-2xl flex items-center justify-center border border-cream-200 shrink-0">
                  <User className="w-7 h-7 text-ink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink-950 font-display">{toTitleCase(p.nama_lengkap)}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-maroon-50 text-maroon-700 text-[10px] font-black uppercase tracking-widest border border-maroon-100">
                      <Hash className="w-3 h-3" /> {p.nomor_pendaftaran}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-100 text-ink-600 text-[10px] font-black uppercase tracking-widest border border-surface-200">
                      {p.jenjang}
                    </span>
                  </div>
                </div>
              </div>

              {/* Forms based on roles AND active session role */}
              <div className="space-y-4">
                {p.roles.includes("quran") && visibleFormTypes.includes("quran") && renderQuranForm(p)}
                {p.roles.includes("wawancara") && visibleFormTypes.includes("wawancara") && renderCalsanForm(p)}
                {p.roles.includes("ortu") && visibleFormTypes.includes("ortu") && renderCawalsanForm(p)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
