"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Users,
  MapPin,
  School,
  Heart,
  Phone,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Info,
  Hash,
  Activity,
  Ruler,
  Weight,
  Globe,
  Home as HomeIcon,
} from "lucide-react";

import WilayahSelector from "@/components/form/WilayahSelector";
import SearchableSelect from "@/components/form/SearchableSelect";
import { countries } from "@/lib/data/countries";

// ============================================
// TYPES
// ============================================

interface DataDiriSantri {
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  kewarganegaraan: string;
  tinggal_bersama: string;
  tinggal_bersama_lainnya: string;
  anak_ke: number;
  berapa_bersaudara: number;
  golongan_darah: string;
  tinggi_badan: number;
  berat_badan: number;
  riwayat_penyakit: string;
  // Alamat
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  // Sekolah asal
  asal_sekolah: string;
  nisn: string;
  alamat_sekolah: string;
  tahun_lulus: string;
}

interface DataOrangTua {
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
  pekerjaan_lainnya?: string;
  penghasilan: string;
  no_hp: string;
  no_wa: string;
  email: string;
  status_hidup: string;
  // Address
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
}

interface DataWali {
  hubungan: string;
  hubungan_lainnya?: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
  pekerjaan_lainnya?: string;
  penghasilan: string;
  no_hp: string;
  no_wa: string;
  email: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
}

interface FormData {
  santri: DataDiriSantri;
  ayah: DataOrangTua;
  ibu: DataOrangTua;
  wali: DataWali;
  wali_sama_dengan_ortu: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const AGAMA_OPTIONS = [
  "Islam",
  "Kristen Protestan",
  "Kristen Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];

const GOLONGAN_DARAH_OPTIONS = ["A", "B", "AB", "O", "Tidak Tahu"];

const PENDIDIKAN_OPTIONS = [
  "Tidak Sekolah",
  "SD/MI Sederajat",
  "SMP/MTs Sederajat",
  "SMA/MA/SMK Sederajat",
  "D1",
  "D2",
  "D3",
  "D4/S1",
  "S2",
  "S3",
];

const PEKERJAAN_OPTIONS = [
  "PNS/ASN",
  "TNI/Polri",
  "Karyawan Swasta",
  "Wiraswasta",
  "Petani",
  "Pedagang",
  "Buruh",
  "Guru/Dosen",
  "Dokter",
  "Tidak Bekerja",
  "Pensiunan",
  "Lainnya",
];

const PENGHASILAN_OPTIONS = [
  "Tidak Berpenghasilan",
  "< Rp 1.000.000",
  "Rp 1.000.000 - Rp 2.500.000",
  "Rp 2.500.000 - Rp 5.000.000",
  "Rp 5.000.000 - Rp 10.000.000",
  "> Rp 10.000.000",
];

const TINGGAL_BERSAMA_OPTIONS = [
  "Kedua Orang Tua",
  "Ayah",
  "Ibu",
  "Wali",
  "Sendiri",
  "Lainnya",
];

const HUBUNGAN_WALI_OPTIONS = [
  "Kakek",
  "Nenek",
  "Paman",
  "Bibi",
  "Kakak Kandung",
  "Kakak Ipar",
  "Saudara Sepupu",
  "Lainnya",
];

const INITIAL_SANTRI: DataDiriSantri = {
  nik: "",
  nama_lengkap: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  kewarganegaraan: "Indonesia",
  tinggal_bersama: "Kedua Orang Tua",
  tinggal_bersama_lainnya: "",
  anak_ke: 1,
  berapa_bersaudara: 1,
  golongan_darah: "",
  tinggi_badan: 0,
  berat_badan: 0,
  riwayat_penyakit: "",
  alamat: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
  asal_sekolah: "",
  nisn: "",
  alamat_sekolah: "",
  tahun_lulus: "",
};

const INITIAL_ORTU: DataOrangTua = {
  nama_lengkap: "",
  nik: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  pendidikan_terakhir: "",
  pekerjaan: "",
  pekerjaan_lainnya: "",
  penghasilan: "",
  no_hp: "",
  no_wa: "",
  email: "",
  alamat: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
  status_hidup: "Masih Hidup",
};

const INITIAL_WALI: DataWali = {
  hubungan: "",
  hubungan_lainnya: "",
  nama_lengkap: "",
  nik: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  pendidikan_terakhir: "",
  pekerjaan: "",
  pekerjaan_lainnya: "",
  penghasilan: "",
  no_hp: "",
  no_wa: "",
  email: "",
  alamat: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
};

// ============================================
// COMPONENTS
// ============================================

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  disabled?: boolean;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  isCompleted,
  disabled,
}: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border ${disabled
        ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
        : isOpen
          ? "bg-white border-cream-200 shadow-sm border border-cream-200 app-card"
          : "bg-surface-50 border-white/50 hover:bg-white hover:border-cream-100"
        }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isCompleted
            ? "bg-emerald-100 text-emerald-600"
            : isOpen
              ? "bg-cream-100 text-maroon-700"
              : "bg-surface-200 text-ink-400"
            }`}
        >
          {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        <div className="text-left">
          <h3 className={`font-bold text-lg ${isOpen ? "text-ink-900" : "text-ink-600"}`}>{title}</h3>
          {subtitle && <p className="text-sm text-ink-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isCompleted && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wide">
            Lengkap
          </span>
        )}
        <div className={`p-2 rounded-full transition-all ${isOpen ? "bg-surface-100 rotate-180" : "bg-transparent"}`}>
          <ChevronDown className={`w-5 h-5 ${isOpen ? "text-ink-900" : "text-ink-400"}`} />
        </div>
      </div>
    </button>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: (string | { label: string; value: string })[];
  maxLength?: number;
  inputFilter?: 'letters' | 'numbers';
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  options,
  maxLength,
  inputFilter,
}: InputFieldProps) {
  const baseInputClass = "w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-300 focus:border-maroon-600 focus:ring-4 focus:ring-maroon-600/10 transition-all outline-none disabled:bg-surface-100 disabled:text-ink-400 font-medium";

  // Filter function for input validation
  const handleFilteredChange = (rawValue: string) => {
    if (inputFilter === 'letters') {
      // Allow letters (including accented), spaces, apostrophes, hyphens, periods
      const filtered = rawValue.replace(/[^a-zA-ZÀ-ÿ\s'.\-]/g, '');
      onChange(filtered);
    } else if (inputFilter === 'numbers') {
      // Allow only digits
      const filtered = rawValue.replace(/[^0-9]/g, '');
      onChange(filtered);
    } else {
      onChange(rawValue);
    }
  };

  const filterHint = inputFilter === 'letters' ? 'Hanya huruf' : inputFilter === 'numbers' ? 'Hanya angka' : null;
  const inputMode = inputFilter === 'numbers' ? 'numeric' as const : undefined;

  if (options) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-ink-700 ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${baseInputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled={value !== ""}>Pilih {label}</option>
            {options.map((opt) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              return (
                <option key={val} value={val}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        </div>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-ink-700 ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={(e) => handleFilteredChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={`${baseInputClass} resize-none`}
        />
        {filterHint && <p className="text-xs text-ink-400 ml-1">{filterHint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-ink-700 ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => handleFilteredChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
        className={baseInputClass}
      />
      {filterHint && <p className="text-xs text-ink-400 ml-1">{filterHint}</p>}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DataLengkapForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    santri: INITIAL_SANTRI,
    ayah: INITIAL_ORTU,
    ibu: INITIAL_ORTU,
    wali: INITIAL_WALI,
    wali_sama_dengan_ortu: true,
  });

  const [openSections, setOpenSections] = useState({
    santri: true,
    ayah: false,
    ibu: false,
    wali: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [statusPendaftaran, setStatusPendaftaran] = useState<string>("draft");

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSantri = (field: keyof DataDiriSantri, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      santri: { ...prev.santri, [field]: value },
    }));
  };

  const updateAyah = (field: keyof DataOrangTua, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ayah: { ...prev.ayah, [field]: value },
    }));
  };

  const updateIbu = (field: keyof DataOrangTua, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ibu: { ...prev.ibu, [field]: value },
    }));
  };

  const updateWali = (field: keyof DataWali, value: string) => {
    setFormData((prev) => ({
      ...prev,
      wali: { ...prev.wali, [field]: value },
    }));
  };

  const handleSantriAddressChange = (val: any) => {
    setFormData((prev) => ({
      ...prev,
      santri: {
        ...prev.santri,
        provinsi: val.provinsi,
        kabupaten: val.kabupaten,
        kecamatan: val.kecamatan,
        kelurahan: val.kelurahan,
        kode_pos: val.kode_pos,
      },
    }));
  };

  const handleWaliAddressChange = (val: any) => {
    setFormData((prev) => ({
      ...prev,
      wali: {
        ...prev.wali,
        provinsi: val.provinsi,
        kabupaten: val.kabupaten,
        kecamatan: val.kecamatan,
        kelurahan: val.kelurahan,
        kode_pos: val.kode_pos,
      },
    }));
  };

  // Check if parents are deceased
  const isAyahDeceased = formData.ayah.status_hidup === "Sudah Meninggal";
  const isIbuDeceased = formData.ibu.status_hidup === "Sudah Meninggal";
  const bothParentsDeceased = isAyahDeceased && isIbuDeceased;
  const eitherParentAlive = !isAyahDeceased || !isIbuDeceased;
  const isTinggalBersamaWali = formData.santri.tinggal_bersama === "Wali";
  const isWaliRequired = bothParentsDeceased || isTinggalBersamaWali;
  // Always allowed to fill now, as per user request
  const canFillWali = true;

  useEffect(() => {
    if (isWaliRequired && formData.wali_sama_dengan_ortu) {
      setFormData((prev) => ({
        ...prev,
        wali_sama_dengan_ortu: false,
      }));
      setOpenSections((prev) => ({ ...prev, wali: true }));
    }
  }, [isWaliRequired, formData.wali_sama_dengan_ortu]);

  const [toastMessage, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        const [dataRes, reqRes] = await Promise.all([
          fetch("/api/pendaftar/data-lengkap"),
          session.pendaftar_id ? fetch(`/api/pendaftar/request-edit?pendaftar_id=${session.pendaftar_id}`) : Promise.resolve(null)
        ]);

        const result = await dataRes.json();
        if (result.success && result.data) {
          setFormData((prev) => ({
            ...prev,
            santri: { ...prev.santri, ...result.data.santri },
            ayah: { ...prev.ayah, ...result.data.ayah },
            ibu: { ...prev.ibu, ...result.data.ibu },
            wali: { ...prev.wali, ...result.data.wali },
            wali_sama_dengan_ortu: result.data.wali_sama_dengan_ortu ?? true,
          }));
        }

        if (reqRes) {
          const reqJson = await reqRes.json();
          if (reqJson.success) setRequestStatus(reqJson.data);
        }

        if (result.success && result.data.status_pendaftaran) {
          setStatusPendaftaran(result.data.status_pendaftaran);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-save logic
  useEffect(() => {
    // Don't auto-save while loading initial data
    if (loading) return;

    // Use a debounce to prevent excessive API calls
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/pendaftar/data-lengkap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, is_draft: true }),
        });
        // Auto-save is silent, we don't show toast to user
      } catch (err) {
        console.error("Background auto-save failed", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, loading]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await fetch("/api/pendaftar/data-lengkap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan data");
      }

      if (requestStatus?.status === 'approved_to_edit') {
        const reqUpdate = await fetch("/api/pendaftar/request-edit", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestStatus.id,
            status: 'submitted'
          })
        });

        const reqJson = await reqUpdate.json();
        if (reqJson.success) {
          setRequestStatus(reqJson.data);
          showToast("success", "Perubahan data berhasil diajukan untuk verifikasi!");
        } else {
          showToast("success", "Data tersimpan, namun gagal update status request.");
        }
      } else {
        showToast("success", "Data berhasil disimpan!");
      }

      if (onSuccess) onSuccess();

    } catch (error: any) {
      showToast("error", error.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const isSantriComplete = Boolean(
    formData.santri.nama_lengkap &&
    formData.santri.nik &&
    formData.santri.tempat_lahir &&
    formData.santri.tanggal_lahir &&
    formData.santri.provinsi &&
    formData.santri.kabupaten &&
    formData.santri.kecamatan &&
    formData.santri.kelurahan &&
    formData.santri.kode_pos &&
    formData.santri.anak_ke &&
    formData.santri.berapa_bersaudara &&
    formData.santri.golongan_darah &&
    formData.santri.tinggi_badan &&
    formData.santri.berat_badan &&
    formData.santri.riwayat_penyakit &&
    formData.santri.asal_sekolah &&
    formData.santri.nisn &&
    formData.santri.tahun_lulus
  );

  const isAyahAddressRequired = !isAyahDeceased && !["Kedua Orang Tua", "Ayah"].includes(formData.santri.tinggal_bersama);
  const isAyahComplete = Boolean(isAyahDeceased || (
    formData.ayah.nama_lengkap &&
    formData.ayah.nik &&
    formData.ayah.tanggal_lahir &&
    formData.ayah.pendidikan_terakhir &&
    formData.ayah.pekerjaan &&
    formData.ayah.no_hp &&
    formData.ayah.no_wa &&
    (!isAyahAddressRequired || (
      formData.ayah.provinsi &&
      formData.ayah.kabupaten &&
      formData.ayah.kecamatan &&
      formData.ayah.kelurahan &&
      formData.ayah.kode_pos
    ))
  ));

  const isIbuAddressRequired = !isIbuDeceased && !["Kedua Orang Tua", "Ibu"].includes(formData.santri.tinggal_bersama);
  const isIbuComplete = Boolean(isIbuDeceased || (
    formData.ibu.nama_lengkap &&
    formData.ibu.nik &&
    formData.ibu.tanggal_lahir &&
    formData.ibu.pendidikan_terakhir &&
    formData.ibu.pekerjaan &&
    formData.ibu.no_hp &&
    formData.ibu.no_wa &&
    (!isIbuAddressRequired || (
      formData.ibu.provinsi &&
      formData.ibu.kabupaten &&
      formData.ibu.kecamatan &&
      formData.ibu.kelurahan &&
      formData.ibu.kode_pos
    ))
  ));

  const isWaliAddressRequired = formData.santri.tinggal_bersama !== "Wali";
  const isWaliComplete = Boolean((!isWaliRequired && !formData.wali.nama_lengkap) || (
    formData.wali.hubungan &&
    formData.wali.nama_lengkap &&
    formData.wali.nik &&
    formData.wali.no_hp &&
    (!isWaliAddressRequired || (
      formData.wali.provinsi &&
      formData.wali.kabupaten &&
      formData.wali.kecamatan &&
      formData.wali.kelurahan &&
      formData.wali.kode_pos
    ))
  ));

  const isLocked = !['draft', 'awaiting_payment', 'verified', 'rejected'].includes(statusPendaftaran);
  const isEditMode = requestStatus?.status === 'approved_to_edit';
  const canEdit = !isLocked || isEditMode;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-maroon-700 animate-spin" />
        <p className="text-ink-500 font-medium">Memuat data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">

      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-clay-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toastMessage.type === "success"
            ? "bg-emerald-500 text-white shadow-emerald-500/20"
            : "bg-red-500 text-white shadow-red-500/20"
            }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-bold text-sm tracking-wide">{toastMessage.message}</span>
        </div>
      )}

      {/* Info Box */}
      {isEditMode ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-800 font-bold mb-1">
                Mode Edit Aktif
              </p>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Anda diizinkan admin untuk mengubah data. Silakan perbaiki data yang salah, lalu klik tombol <strong>"Simpan & Ajukan Verifikasi"</strong> di bawah.
              </p>
            </div>
          </div>
        </div>
      ) : isLocked ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-bold mb-1">
                Data Terkunci
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Data Anda sudah dikonfirmasi dan tidak dapat diubah lagi secara mandiri.
                Jika terdapat kesalahan data yang krusial, silakan hubungi <strong>Admin Support</strong> kami melalui WhatsApp:
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/6281234567801?text=Bismillah,%20saya%20ingin%20mengajukan%20perubahan%20data%20pendaftaran%20untuk%20nomor%20pendaftaran:%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                  Admin Pendaftaran 1
                </a>
                <a
                  href="https://wa.me/6281234567899?text=Bismillah,%20saya%20ingin%20mengajukan%20perubahan%20data%20pendaftaran%20untuk%20nomor%20pendaftaran:%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                  Admin Pendaftaran 2
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-900 font-bold mb-1">
              Petunjuk Pengisian Data
            </p>
            <ul className="text-sm text-amber-800 space-y-1 font-medium opacity-80 list-disc list-inside">
              <li>Isi data dengan lengkap dan benar sesuai dokumen resmi</li>
              <li>Data yang bertanda (*) wajib diisi</li>
              <li>Klik tombol "Simpan Data" setelah selesai mengisi</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTIONS */}
      <fieldset disabled={!canEdit} className="space-y-6 border-0 p-0 m-0">
        {/* 1. Data Diri Santri */}
        <div className="space-y-4">
          <SectionHeader
            icon={User}
            title="Data Diri Calon Santri"
            subtitle="Informasi pribadi calon santri/santriwati"
            isOpen={openSections.santri}
            onToggle={() => toggleSection("santri")}
            isCompleted={isSantriComplete}
          />

          {openSections.santri && (
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] space-y-8 animate-in slide-in-from-top-4 duration-300">

              {/* Identitas */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-ink-900 mb-6 pb-2 border-b border-ink-100">
                  <span className="w-8 h-8 rounded-lg bg-cream-100 text-maroon-700 flex items-center justify-center text-sm">1</span>
                  Identitas Utama
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField label="NIK" name="nik" value={formData.santri.nik} onChange={(v) => updateSantri("nik", v)} placeholder="16 digit NIK" maxLength={16} required disabled={!!formData.santri.nik} />
                  <InputField label="Nama Lengkap" name="nama_lengkap" value={formData.santri.nama_lengkap} onChange={(v) => updateSantri("nama_lengkap", v)} placeholder="Sesuai akta kelahiran" required inputFilter="letters" />
                  <SearchableSelect
                    label="Tempat Lahir"
                    value={formData.santri.tempat_lahir}
                    onChange={(v) => updateSantri("tempat_lahir", v)}
                    optionsUrl="/api/wilayah/all-kabupaten"
                    placeholder="Pilih Kota/Kabupaten"
                    required
                  />
                  <InputField label="Tanggal Lahir" name="tanggal_lahir" value={formData.santri.tanggal_lahir} onChange={(v) => updateSantri("tanggal_lahir", v)} type="date" required />
                  <InputField label="Jenis Kelamin" name="jenis_kelamin" value={formData.santri.jenis_kelamin} onChange={(v) => updateSantri("jenis_kelamin", v)} options={[{ label: "Laki-laki", value: "L" }, { label: "Perempuan", value: "P" }]} required />
                  <InputField
                    label="Kewarganegaraan"
                    name="kewarganegaraan"
                    value={formData.santri.kewarganegaraan}
                    onChange={(v) => updateSantri("kewarganegaraan", v)}
                    options={countries.map(c => c.name)}
                    required
                  />
                  <InputField label="Anak Ke" name="anak_ke" value={formData.santri.anak_ke} onChange={(v) => updateSantri("anak_ke", v === "" ? "" : (parseInt(v) || ""))} type="number" required />
                  <InputField label="Berapa Bersaudara" name="berapa_bersaudara" value={formData.santri.berapa_bersaudara} onChange={(v) => updateSantri("berapa_bersaudara", v === "" ? "" : (parseInt(v) || ""))} type="number" required />

                  <InputField
                    label="Tinggal Bersama"
                    name="tinggal_bersama"
                    value={formData.santri.tinggal_bersama}
                    onChange={(v) => updateSantri("tinggal_bersama", v)}
                    options={TINGGAL_BERSAMA_OPTIONS}
                    required
                  />
                  {formData.santri.tinggal_bersama === "Lainnya" && (
                    <InputField
                      label="Sebutkan Tinggal Bersama Siapa"
                      name="tinggal_bersama_lainnya"
                      value={formData.santri.tinggal_bersama_lainnya}
                      onChange={(v) => updateSantri("tinggal_bersama_lainnya", v)}
                      placeholder="Contoh: Kakek/Nenek"
                      required
                      inputFilter="letters"
                    />
                  )}
                </div>
              </div>

              {/* Fisik */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-ink-900 mb-6 pb-2 border-b border-ink-100">
                  <span className="w-8 h-8 rounded-lg bg-cream-100 text-maroon-700 flex items-center justify-center text-sm">2</span>
                  Fisik & Kesehatan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InputField label="Golongan Darah" name="golongan_darah" value={formData.santri.golongan_darah} onChange={(v) => updateSantri("golongan_darah", v)} options={GOLONGAN_DARAH_OPTIONS} required />
                  <InputField label="Tinggi Badan (cm)" name="tinggi_badan" value={formData.santri.tinggi_badan || ""} onChange={(v) => updateSantri("tinggi_badan", parseInt(v) || 0)} type="number" placeholder="150" required />
                  <InputField label="Berat Badan (kg)" name="berat_badan" value={formData.santri.berat_badan || ""} onChange={(v) => updateSantri("berat_badan", parseInt(v) || 0)} type="number" placeholder="45" required />
                  <div className="md:col-span-2 lg:col-span-1">
                    <InputField label="Riwayat Penyakit" name="riwayat_penyakit" value={formData.santri.riwayat_penyakit} onChange={(v) => updateSantri("riwayat_penyakit", v)} placeholder="Isi '-' jika tidak ada" required />
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-ink-900 mb-6 pb-2 border-b border-ink-100">
                  <span className="w-8 h-8 rounded-lg bg-cream-100 text-maroon-700 flex items-center justify-center text-sm">3</span>
                  Alamat Tempat Tinggal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField
                      label="Alamat"
                      name="alamat"
                      value={formData.santri.alamat}
                      onChange={(v) => updateSantri("alamat", v)}
                      type="textarea"
                      placeholder="Nama Jalan/Gang/Desa beserta Nomor Rumah"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="RT" name="rt" value={formData.santri.rt} onChange={(v) => updateSantri("rt", v)} placeholder="001" maxLength={3} required inputFilter="numbers" />
                    <InputField label="RW" name="rw" value={formData.santri.rw} onChange={(v) => updateSantri("rw", v)} placeholder="002" maxLength={3} required inputFilter="numbers" />
                  </div>
                  <div className="md:col-span-2">
                    <WilayahSelector value={{
                      provinsi: formData.santri.provinsi,
                      kabupaten: formData.santri.kabupaten,
                      kecamatan: formData.santri.kecamatan,
                      kelurahan: formData.santri.kelurahan,
                      kode_pos: formData.santri.kode_pos
                    }} onChange={handleSantriAddressChange} />
                  </div>
                </div>
              </div>

              {/* Sekolah Asal */}
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-ink-900 mb-6 pb-2 border-b border-ink-100">
                  <span className="w-8 h-8 rounded-lg bg-cream-100 text-maroon-700 flex items-center justify-center text-sm">4</span>
                  Sekolah Asal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Nama Sekolah Asal" name="asal_sekolah" value={formData.santri.asal_sekolah} onChange={(v) => updateSantri("asal_sekolah", v)} placeholder="Nama Sekolah" required />
                  <InputField label="NISN" name="nisn" value={formData.santri.nisn} onChange={(v) => updateSantri("nisn", v)} placeholder="10 digit NISN" maxLength={10} required inputFilter="numbers" />
                  <InputField label="Tahun Lulus" name="tahun_lulus" value={formData.santri.tahun_lulus} onChange={(v) => updateSantri("tahun_lulus", v)} placeholder="2024" maxLength={4} required inputFilter="numbers" />
                  <InputField label="Alamat Sekolah" name="alamat_sekolah" value={formData.santri.alamat_sekolah} onChange={(v) => updateSantri("alamat_sekolah", v)} placeholder="Alamat lengkap sekolah" />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 2. Data Ayah Kandung */}
        <div className="space-y-4">
          <SectionHeader
            icon={Users}
            title="Data Ayah Kandung"
            subtitle="Informasi orang tua (ayah)"
            isOpen={openSections.ayah}
            onToggle={() => toggleSection("ayah")}
            isCompleted={isAyahComplete}
          />

          {openSections.ayah && (
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] animate-in slide-in-from-top-4 duration-300 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Nama Lengkap Ayah" name="nama_lengkap_ayah" value={formData.ayah.nama_lengkap} onChange={(v) => updateAyah("nama_lengkap", v)} placeholder="Sesuai KTP" required inputFilter="letters" />
                <InputField label="Status Hidup" name="status_ayah" value={formData.ayah.status_hidup} onChange={(v) => updateAyah("status_hidup", v)} options={["Masih Hidup", "Sudah Meninggal"]} required />
                <InputField label="NIK" name="nik_ayah" value={formData.ayah.nik} onChange={(v) => updateAyah("nik", v)} placeholder="16 digit NIK" maxLength={16} required={!isAyahDeceased} disabled={isAyahDeceased} inputFilter="numbers" />

                <SearchableSelect
                  label="Tempat Lahir"
                  value={formData.ayah.tempat_lahir}
                  onChange={(v) => updateAyah("tempat_lahir", v)}
                  optionsUrl="/api/wilayah/all-kabupaten"
                  placeholder="Pilih Kota/Kabupaten"
                  disabled={isAyahDeceased}
                />
                <InputField label="Tanggal Lahir" name="tanggal_lahir_ayah" value={formData.ayah.tanggal_lahir} onChange={(v) => updateAyah("tanggal_lahir", v)} type="date" required={!isAyahDeceased} disabled={isAyahDeceased} />
                <InputField label="Pendidikan Terakhir" name="pendidikan_ayah" value={formData.ayah.pendidikan_terakhir} onChange={(v) => updateAyah("pendidikan_terakhir", v)} options={PENDIDIKAN_OPTIONS} required={!isAyahDeceased} disabled={isAyahDeceased} />

                <InputField label="Pekerjaan" name="pekerjaan_ayah" value={formData.ayah.pekerjaan} onChange={(v) => updateAyah("pekerjaan", v)} options={PEKERJAAN_OPTIONS} required={!isAyahDeceased} disabled={isAyahDeceased} />
                {formData.ayah.pekerjaan === "Lainnya" && (
                  <InputField label="Sebutkan Pekerjaan" name="pekerjaan_lainnya_ayah" value={formData.ayah.pekerjaan_lainnya || ""} onChange={(v) => updateAyah("pekerjaan_lainnya", v)} placeholder="Sebutkan pekerjaan" required={!isAyahDeceased} disabled={isAyahDeceased} />
                )}
                <InputField label="Penghasilan (per bulan)" name="penghasilan_ayah" value={formData.ayah.penghasilan} onChange={(v) => updateAyah("penghasilan", v)} placeholder="Contoh: 3500000" required={!isAyahDeceased} disabled={isAyahDeceased} inputFilter="numbers" />

                <InputField label="Nomor HP" name="no_hp_ayah" value={formData.ayah.no_hp} onChange={(v) => updateAyah("no_hp", v)} placeholder="08xxxxxxxxxx" required={!isAyahDeceased} disabled={isAyahDeceased} inputFilter="numbers" />
                <InputField label="Nomor WhatsApp" name="no_wa_ayah" value={formData.ayah.no_wa || ""} onChange={(v) => updateAyah("no_wa", v)} placeholder="08xxxxxxxxxx" required={!isAyahDeceased} disabled={isAyahDeceased} inputFilter="numbers" />
                <InputField label="Email" name="email_ayah" value={formData.ayah.email} onChange={(v) => updateAyah("email", v)} type="email" placeholder="email@example.com" disabled={isAyahDeceased} />
              </div>

              {!isAyahDeceased && !["Kedua Orang Tua", "Ayah"].includes(formData.santri.tinggal_bersama) && (
                <div className="pt-6 border-t border-ink-100">
                  <h5 className="font-bold text-ink-800 mb-4 bg-surface-100 inline-block px-3 py-1 rounded-lg text-sm">Alamat Ayah</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Alamat" name="alamat_ayah" value={formData.ayah.alamat || ""} onChange={(v) => updateAyah("alamat", v)} type="textarea" placeholder="Nama Jalan/Gang/Desa beserta Nomor Rumah" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="RT" name="rt_ayah" value={formData.ayah.rt || ""} onChange={(v) => updateAyah("rt", v)} placeholder="001" maxLength={3} required inputFilter="numbers" />
                      <InputField label="RW" name="rw_ayah" value={formData.ayah.rw || ""} onChange={(v) => updateAyah("rw", v)} placeholder="002" maxLength={3} required inputFilter="numbers" />
                    </div>
                    <div className="md:col-span-2">
                      <WilayahSelector
                        value={{
                          provinsi: formData.ayah.provinsi || "",
                          kabupaten: formData.ayah.kabupaten || "",
                          kecamatan: formData.ayah.kecamatan || "",
                          kelurahan: formData.ayah.kelurahan || "",
                          kode_pos: formData.ayah.kode_pos || ""
                        }}
                        onChange={(val) => {
                          setFormData(prev => ({
                            ...prev,
                            ayah: {
                              ...prev.ayah,
                              provinsi: val.provinsi,
                              kabupaten: val.kabupaten,
                              kecamatan: val.kecamatan,
                              kelurahan: val.kelurahan,
                              kode_pos: val.kode_pos
                            }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Data Ibu Kandung */}
        <div className="space-y-4">
          <SectionHeader
            icon={Heart}
            title="Data Ibu Kandung"
            subtitle="Informasi orang tua (ibu)"
            isOpen={openSections.ibu}
            onToggle={() => toggleSection("ibu")}
            isCompleted={isIbuComplete}
          />

          {openSections.ibu && (
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] animate-in slide-in-from-top-4 duration-300 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Nama Lengkap Ibu" name="nama_lengkap_ibu" value={formData.ibu.nama_lengkap} onChange={(v) => updateIbu("nama_lengkap", v)} placeholder="Sesuai KTP" required inputFilter="letters" />
                <InputField label="Status Hidup" name="status_ibu" value={formData.ibu.status_hidup} onChange={(v) => updateIbu("status_hidup", v)} options={["Masih Hidup", "Sudah Meninggal"]} required />
                <InputField label="NIK" name="nik_ibu" value={formData.ibu.nik} onChange={(v) => updateIbu("nik", v)} placeholder="16 digit NIK" maxLength={16} required={!isIbuDeceased} disabled={isIbuDeceased} inputFilter="numbers" />

                <SearchableSelect
                  label="Tempat Lahir"
                  value={formData.ibu.tempat_lahir}
                  onChange={(v) => updateIbu("tempat_lahir", v)}
                  optionsUrl="/api/wilayah/all-kabupaten"
                  placeholder="Pilih Kota/Kabupaten"
                  disabled={isIbuDeceased}
                />
                <InputField label="Tanggal Lahir" name="tanggal_lahir_ibu" value={formData.ibu.tanggal_lahir} onChange={(v) => updateIbu("tanggal_lahir", v)} type="date" required={!isIbuDeceased} disabled={isIbuDeceased} />
                <InputField label="Pendidikan Terakhir" name="pendidikan_ibu" value={formData.ibu.pendidikan_terakhir} onChange={(v) => updateIbu("pendidikan_terakhir", v)} options={PENDIDIKAN_OPTIONS} required={!isIbuDeceased} disabled={isIbuDeceased} />

                <InputField label="Pekerjaan" name="pekerjaan_ibu" value={formData.ibu.pekerjaan} onChange={(v) => updateIbu("pekerjaan", v)} options={PEKERJAAN_OPTIONS} required={!isIbuDeceased} disabled={isIbuDeceased} />
                {formData.ibu.pekerjaan === "Lainnya" && (
                  <InputField label="Sebutkan Pekerjaan" name="pekerjaan_lainnya_ibu" value={formData.ibu.pekerjaan_lainnya || ""} onChange={(v) => updateIbu("pekerjaan_lainnya", v)} placeholder="Sebutkan pekerjaan" required={!isIbuDeceased} disabled={isIbuDeceased} />
                )}
                <InputField label="Penghasilan (per bulan)" name="penghasilan_ibu" value={formData.ibu.penghasilan} onChange={(v) => updateIbu("penghasilan", v)} placeholder="Contoh: 3500000" required={!isIbuDeceased} disabled={isIbuDeceased} inputFilter="numbers" />

                <InputField label="Nomor HP" name="no_hp_ibu" value={formData.ibu.no_hp} onChange={(v) => updateIbu("no_hp", v)} placeholder="08xxxxxxxxxx" required={!isIbuDeceased} disabled={isIbuDeceased} inputFilter="numbers" />
                <InputField label="Nomor WhatsApp" name="no_wa_ibu" value={formData.ibu.no_wa || ""} onChange={(v) => updateIbu("no_wa", v)} placeholder="08xxxxxxxxxx" required={!isIbuDeceased} disabled={isIbuDeceased} inputFilter="numbers" />
                <InputField label="Email" name="email_ibu" value={formData.ibu.email} onChange={(v) => updateIbu("email", v)} type="email" placeholder="email@example.com" disabled={isIbuDeceased} />
              </div>

              {!isIbuDeceased && !["Kedua Orang Tua", "Ibu"].includes(formData.santri.tinggal_bersama) && (
                <div className="pt-6 border-t border-ink-100">
                  <h5 className="font-bold text-ink-800 mb-4 bg-surface-100 inline-block px-3 py-1 rounded-lg text-sm">Alamat Ibu</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Alamat" name="alamat_ibu" value={formData.ibu.alamat || ""} onChange={(v) => updateIbu("alamat", v)} type="textarea" placeholder="Nama Jalan/Gang/Desa beserta Nomor Rumah" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="RT" name="rt_ibu" value={formData.ibu.rt || ""} onChange={(v) => updateIbu("rt", v)} placeholder="001" maxLength={3} required inputFilter="numbers" />
                      <InputField label="RW" name="rw_ibu" value={formData.ibu.rw || ""} onChange={(v) => updateIbu("rw", v)} placeholder="002" maxLength={3} required inputFilter="numbers" />
                    </div>
                    <div className="md:col-span-2">
                      <WilayahSelector
                        value={{
                          provinsi: formData.ibu.provinsi || "",
                          kabupaten: formData.ibu.kabupaten || "",
                          kecamatan: formData.ibu.kecamatan || "",
                          kelurahan: formData.ibu.kelurahan || "",
                          kode_pos: formData.ibu.kode_pos || ""
                        }}
                        onChange={(val) => {
                          setFormData(prev => ({
                            ...prev,
                            ibu: {
                              ...prev.ibu,
                              provinsi: val.provinsi,
                              kabupaten: val.kabupaten,
                              kecamatan: val.kecamatan,
                              kelurahan: val.kelurahan,
                              kode_pos: val.kode_pos
                            }
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Data Wali */}
        <div className="space-y-4">
          <SectionHeader
            icon={Users}
            title="Data Wali"
            subtitle={
              isWaliRequired
                ? "Wajib diisi (Karena kondisi khusus)"
                : "Opsional (Boleh diisi atau dikosongkan)"
            }
            isOpen={openSections.wali}
            onToggle={() => toggleSection("wali")}
            isCompleted={isWaliComplete}
            disabled={false}
          />

          {openSections.wali && (
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] animate-in slide-in-from-top-4 duration-300 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  label="Hubungan"
                  name="hubungan_wali"
                  value={formData.wali.hubungan}
                  onChange={(v) => updateWali("hubungan", v)}
                  options={HUBUNGAN_WALI_OPTIONS}
                  required={isWaliRequired}
                />
                {formData.wali.hubungan === "Lainnya" && (
                  <InputField
                    label="Sebutkan Hubungan Wali"
                    name="hubungan_lainnya_wali"
                    value={formData.wali.hubungan_lainnya || ""}
                    onChange={(v) => updateWali("hubungan_lainnya", v)}
                    placeholder="Contoh: Ibu Angkat"
                    required={isWaliRequired}
                  />
                )}
                <InputField label="Nama Lengkap" name="nama_lengkap_wali" value={formData.wali.nama_lengkap} onChange={(v) => updateWali("nama_lengkap", v)} placeholder="Sesuai KTP" required={isWaliRequired} inputFilter="letters" />
                <InputField label="NIK" name="nik_wali" value={formData.wali.nik} onChange={(v) => updateWali("nik", v)} placeholder="16 digit NIK" maxLength={16} required={isWaliRequired} inputFilter="numbers" />

                <SearchableSelect
                  label="Tempat Lahir"
                  value={formData.wali.tempat_lahir}
                  onChange={(v) => updateWali("tempat_lahir", v)}
                  optionsUrl="/api/wilayah/all-kabupaten"
                  placeholder="Pilih Kota/Kabupaten"
                />
                <InputField label="Tanggal Lahir" name="tanggal_lahir_wali" value={formData.wali.tanggal_lahir} onChange={(v) => updateWali("tanggal_lahir", v)} type="date" required={isWaliRequired} />
                <InputField label="Pendidikan Terakhir" name="pendidikan_wali" value={formData.wali.pendidikan_terakhir} onChange={(v) => updateWali("pendidikan_terakhir", v)} options={PENDIDIKAN_OPTIONS} required={isWaliRequired} />

                <InputField label="Pekerjaan" name="pekerjaan_wali" value={formData.wali.pekerjaan} onChange={(v) => updateWali("pekerjaan", v)} options={PEKERJAAN_OPTIONS} required={isWaliRequired} />
                <InputField label="Penghasilan (per bulan)" name="penghasilan_wali" value={formData.wali.penghasilan} onChange={(v) => updateWali("penghasilan", v)} placeholder="Contoh: 3500000" required={isWaliRequired} inputFilter="numbers" />

                <InputField label="Nomor HP" name="no_hp_wali" value={formData.wali.no_hp} onChange={(v) => updateWali("no_hp", v)} placeholder="08xxxxxxxxxx" required={isWaliRequired} inputFilter="numbers" />
                <InputField label="Nomor WhatsApp" name="no_wa_wali" value={formData.wali.no_wa || ""} onChange={(v) => updateWali("no_wa", v)} placeholder="08xxxxxxxxxx" required={isWaliRequired} inputFilter="numbers" />
                <InputField label="Email" name="email_wali" value={formData.wali.email} onChange={(v) => updateWali("email", v)} type="email" placeholder="email@example.com" />
              </div>

              {formData.santri.tinggal_bersama !== "Wali" && (
                <div className="pt-6 border-t border-ink-100">
                  <h5 className="font-bold text-ink-800 mb-4 bg-surface-100 inline-block px-3 py-1 rounded-lg text-sm">Alamat Wali</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Alamat" name="alamat_wali" value={formData.wali.alamat} onChange={(v) => updateWali("alamat", v)} type="textarea" placeholder="Nama Jalan/Gang/Desa beserta Nomor Rumah" required={isWaliRequired} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="RT" name="rt_wali" value={formData.wali.rt} onChange={(v) => updateWali("rt", v)} placeholder="001" maxLength={3} required={isWaliRequired} inputFilter="numbers" />
                      <InputField label="RW" name="rw_wali" value={formData.wali.rw} onChange={(v) => updateWali("rw", v)} placeholder="002" maxLength={3} required={isWaliRequired} inputFilter="numbers" />
                    </div>
                    <div className="md:col-span-2">
                      <WilayahSelector
                        value={{
                          provinsi: formData.wali.provinsi,
                          kabupaten: formData.wali.kabupaten,
                          kecamatan: formData.wali.kecamatan,
                          kelurahan: formData.wali.kelurahan,
                          kode_pos: formData.wali.kode_pos
                        }}
                        onChange={handleWaliAddressChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </fieldset>

      <div className="p-4 bg-surface-50 border border-ink-100 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-ink-400" />
        <p className="text-sm text-ink-500 font-medium">
          Tanda <span className="text-red-500 font-bold">*</span> menunjukkan isian yang <strong>wajib</strong> diisi.
        </p>
      </div>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-maroon-600 to-maroon-700 text-white font-bold text-lg shadow-lg shadow-maroon-600/30 hover:shadow-maroon-600/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : isEditMode ? <Send className="w-6 h-6" /> : <Save className="w-6 h-6" />}
            <span>{saving ? "Menyimpan..." : isEditMode ? "Simpan & Ajukan Verifikasi" : "Simpan Data"}</span>
          </button>
        </div>
      )}

    </form>
  );
}
