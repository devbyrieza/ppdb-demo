"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  School,
  Heart,
  Home,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  Users,
  Briefcase,
  DollarSign,
  Trophy,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import AdminBeasiswaBlock from "../components/AdminBeasiswaBlock";

interface PendaftarDetail {
  id: string;
  nomor_pendaftaran: string;
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  data_lengkap: any | null;
  no_hp: string | null;
  email: string | null;
  asal_sekolah: string | null;
  tahun_lulus: number | null;
  alamat_sekolah: string | null;
  nisn: string | null;
  golongan_darah: string | null;
  anak_ke: number | null;
  jumlah_saudara: number | null;
  hobi: string | null;
  cita_cita: string | null;
  tipe_pendaftaran: string;
  kelas_masuk: number | null;
  asal_institusi: string | null;
  nomor_induk_lama: string | null;
  catatan_pindahan: string | null;
  status_proses: string;
  created_at: string;
  updated_at: string;
  tahun_ajaran: {
    nama: string;
    biaya_pendaftaran: string;
  } | null;
  orang_tua: {
    nama_ayah: string | null;
    nik_ayah: string | null;
    tempat_lahir_ayah: string | null;
    tanggal_lahir_ayah: string | null;
    pendidikan_ayah: string | null;
    pekerjaan_ayah: string | null;
    penghasilan_ayah: string | null;
    no_hp_ayah: string | null;
    alamat_ayah: string | null;
    nama_ibu: string | null;
    nik_ibu: string | null;
    tempat_lahir_ibu: string | null;
    tanggal_lahir_ibu: string | null;
    pendidikan_ibu: string | null;
    pekerjaan_ibu: string | null;
    penghasilan_ibu: string | null;
    no_hp_ibu: string | null;
    alamat_ibu: string | null;
    status_ayah: string | null;
    status_ibu: string | null;
    nama_wali: string | null;
    hubungan_wali: string | null;
    no_hp_wali: string | null;
    pekerjaan_wali: string | null;
    alamat_wali: string | null;
    nik_wali?: string | null;
    tempat_lahir_wali?: string | null;
    tanggal_lahir_wali?: string | null;
    pendidikan_wali?: string | null;
    penghasilan_wali?: string | null;
  } | null;
  dokumen: Array<{
    id: string;
    jenis_dokumen: string;
    is_verified: boolean;
    catatan: string | null;
    file_path: string | null;
  }>;
  pembayaran: Array<{
    id: string;
    jumlah: string;
    metode_pembayaran: string;
    status_pembayaran: string;
    tanggal_pembayaran: string | null;
    bukti_transfer_path: string | null;
    jenis_pembayaran: string;
  }>;
  nilai_ujian: {
    nilai_total: number;
    catatan?: string;
    catatan_umum?: string;
    score_akademik?: number;
    score_kepribadian?: number;
    score_kesiapan?: number;
    score_quran?: number;
      score_hafalan?: number;
      nilai_tes_hafalan?: number;
      catatan_hafalan?: string;
      score_lisan_arab?: number;
      nilai_tes_lisan_arab?: number;
      catatan_lisan_arab?: string;
    nilai_tes_quran?: number;
    catatan_quran?: string;
    score_wawancara?: number;
    nilai_wawancara_santri?: number;
    catatan_santri?: string;
    nilai_wawancara_ortu?: number;
    catatan_ortu?: string;
  } | null;
}

/* import { useSession } from "next-auth/react"; -- Removed */

export default function PendaftarDetailPage() {
      const getDocLabel = (key: string) => {
    const labels: Record<string, string> = {
      kartu_keluarga: "Scan Kartu Keluarga",
      akta_kelahiran: "Scan Akte Kelahiran",
      rapor_sem1: "Scan Rapor Semester Ganjil Terakhir",
      rapor_sem2: "Scan Rapor Semester Genap Terakhir",
      nisn: "Scan NISN",
      foto_setengah_badan: "Foto Setengah Badan",
      surat_kesehatan: "Surat Keterangan Sehat",
      pakta_integritas_santri: "Scan Pakta Integritas Calon Santri",
      pakta_integritas_ortu: "Scan Pakta Integritas Calon Orangtua/Wali Santri",
      pernyataan_bebas_negatif: "Scan Pernyataan Bebas Perilaku Negatif",
      pakta_integritas: "Scan Pakta Integritas Calon Santri",
      scan_kartu_keluarga: "Scan Kartu Keluarga",
      scan_akta_kelahiran: "Scan Akte Kelahiran",
      scan_rapor_sem1: "Scan Rapor Semester Ganjil Terakhir",
      scan_rapor_sem2: "Scan Rapor Semester Genap Terakhir",
      scan_nisn: "Scan NISN",
      scan_foto_setengah_badan: "Foto Setengah Badan",
      scan_surat_kesehatan: "Surat Keterangan Sehat",
      scan_pakta_integritas_santri: "Scan Pakta Integritas Calon Santri",
      scan_pakta_integritas_ortu: "Scan Pakta Integritas Calon Orangtua/Wali Santri",
      scan_pernyataan_bebas_negatif: "Scan Pernyataan Bebas Perilaku Negatif",
      scan_pakta_integritas: "Scan Pakta Integritas Calon Santri",
    };
    return labels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  const params = useParams();
  const router = useRouter();
  /* const { data: session } = useSession(); -- Removed */
  const [userRole, setUserRole] = useState<string | null>(null);

  const [pendaftar, setPendaftar] = useState<PendaftarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const payInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedPayId, setSelectedPayId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState("santri");
  const [editFormData, setEditFormData] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState(false);
  const [nilaiFormData, setNilaiFormData] = useState({
    score_akademik: "",
    score_kepribadian: "",
    score_kesiapan: "",
    score_quran: "",
  });
  const [savingNilai, setSavingNilai] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session?.role) {
            setUserRole(data.session.role);
          } else if (data.user?.user_metadata?.role) {
            setUserRole(data.user.user_metadata.role);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };
    fetchSession();
  }, []);

  // Helper for role checks
  const isKeuangan = userRole === "admin_keuangan";

  const handleOpenEditModal = () => {
    if (!pendaftar) return;
    setEditFormData({
      santri: {
        nama_lengkap: pendaftar.nama_lengkap || "",
        nik: pendaftar.nik || "",
        tempat_lahir: pendaftar.tempat_lahir || "",
        tanggal_lahir: pendaftar.tanggal_lahir ? new Date(pendaftar.tanggal_lahir).toISOString().split("T")[0] : "",
        jenis_kelamin: pendaftar.jenis_kelamin || "L",
        no_hp: pendaftar.no_hp || "",
        email: pendaftar.email || "",
        golongan_darah: pendaftar.golongan_darah || "",
        anak_ke: pendaftar.anak_ke ?? "",
        jumlah_saudara: pendaftar.jumlah_saudara ?? "",
        hobi: pendaftar.hobi || "",
        cita_cita: pendaftar.cita_cita || "",
        alamat: pendaftar.alamat || "",
        rt: pendaftar.rt || "",
        rw: pendaftar.rw || "",
        kelurahan: pendaftar.kelurahan || "",
        kecamatan: pendaftar.kecamatan || "",
        kabupaten: pendaftar.kabupaten || "",
        provinsi: pendaftar.provinsi || "",
        kode_pos: pendaftar.kode_pos || "",
        asal_sekolah: pendaftar.asal_sekolah || "",
        alamat_sekolah: pendaftar.alamat_sekolah || "",
        tahun_lulus: pendaftar.tahun_lulus ?? "",
        nisn: pendaftar.nisn || "",
        tipe_pendaftaran: pendaftar.tipe_pendaftaran || "BARU",
        kelas_masuk: pendaftar.kelas_masuk ?? "",
        asal_institusi: pendaftar.asal_institusi || "",
        nomor_induk_lama: pendaftar.nomor_induk_lama || "",
        catatan_pindahan: pendaftar.catatan_pindahan || "",
      },
      orang_tua: {
        nama_ayah: pendaftar.orang_tua?.nama_ayah || "",
        nik_ayah: pendaftar.orang_tua?.nik_ayah || "",
        tempat_lahir_ayah: pendaftar.orang_tua?.tempat_lahir_ayah || "",
        tanggal_lahir_ayah: pendaftar.orang_tua?.tanggal_lahir_ayah ? new Date(pendaftar.orang_tua.tanggal_lahir_ayah).toISOString().split("T")[0] : "",
        pendidikan_ayah: pendaftar.orang_tua?.pendidikan_ayah || "",
        pekerjaan_ayah: pendaftar.orang_tua?.pekerjaan_ayah || "",
        penghasilan_ayah: pendaftar.orang_tua?.penghasilan_ayah || "",
        no_hp_ayah: pendaftar.orang_tua?.no_hp_ayah || "",
        status_ayah: pendaftar.orang_tua?.status_ayah || "Masih Hidup",
        alamat_ayah: pendaftar.orang_tua?.alamat_ayah || "",
        nama_ibu: pendaftar.orang_tua?.nama_ibu || "",
        nik_ibu: pendaftar.orang_tua?.nik_ibu || "",
        tempat_lahir_ibu: pendaftar.orang_tua?.tempat_lahir_ibu || "",
        tanggal_lahir_ibu: pendaftar.orang_tua?.tanggal_lahir_ibu ? new Date(pendaftar.orang_tua.tanggal_lahir_ibu).toISOString().split("T")[0] : "",
        pendidikan_ibu: pendaftar.orang_tua?.pendidikan_ibu || "",
        pekerjaan_ibu: pendaftar.orang_tua?.pekerjaan_ibu || "",
        penghasilan_ibu: pendaftar.orang_tua?.penghasilan_ibu || "",
        no_hp_ibu: pendaftar.orang_tua?.no_hp_ibu || "",
        status_ibu: pendaftar.orang_tua?.status_ibu || "Masih Hidup",
        alamat_ibu: pendaftar.orang_tua?.alamat_ibu || "",
        nama_wali: pendaftar.orang_tua?.nama_wali || "",
        nik_wali: pendaftar.orang_tua?.nik_wali || "",
        tempat_lahir_wali: pendaftar.orang_tua?.tempat_lahir_wali || "",
        tanggal_lahir_wali: pendaftar.orang_tua?.tanggal_lahir_wali ? new Date(pendaftar.orang_tua.tanggal_lahir_wali).toISOString().split("T")[0] : "",
        pendidikan_wali: pendaftar.orang_tua?.pendidikan_wali || "",
        pekerjaan_wali: pendaftar.orang_tua?.pekerjaan_wali || "",
        penghasilan_wali: pendaftar.orang_tua?.penghasilan_wali || "",
        no_hp_wali: pendaftar.orang_tua?.no_hp_wali || "",
        alamat_wali: pendaftar.orang_tua?.alamat_wali || "",
        hubungan_wali: pendaftar.orang_tua?.hubungan_wali || "",
      },
    });
    setEditTab("santri");
    setIsEditModalOpen(true);
  };

  const handleSaveNilaiManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingNilai(true);
      const res = await fetch(`/api/admin/pendaftar/${pendaftar?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_nilai_manual",
          scores: nilaiFormData
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan nilai");
      
      Swal.fire("Berhasil", "Nilai manual berhasil disimpan", "success");
      setIsNilaiModalOpen(false);
      fetchPendaftarDetail();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setSavingNilai(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/admin/pendaftar/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_edit_full: true,
          santri: editFormData.santri,
          orang_tua: editFormData.orang_tua,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: data.message || "Data pendaftar berhasil diperbarui secara lengkap!",
        confirmButtonColor: "#800000",
      });

      setIsEditModalOpen(false);
      // reload pendaftar data
      setLoading(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`);
      const json = await response.json();
      if (json.success) {
        setPendaftar(json.data);
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Terjadi kesalahan saat menyimpan data",
        confirmButtonColor: "#800000",
      });
    } finally {
      setSavingEdit(false);
      setLoading(false);
    }
  };
  const isBerkas = userRole === "admin_berkas";
  const isPenguji =
    userRole === "penguji" ||
    userRole === "pewawancara_calsan" ||
    userRole === "pewawancara_cawalsan";

  useEffect(() => {
    fetchPendaftarDetail();
  }, [params.id]);

  const fetchPendaftarDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      setPendaftar(result.data);
      setNewStatus(result.data.status_proses);
    } catch (error) {
      console.error("Error fetching pendaftar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType || !params.id) return;

    try {
      setUploadingDoc(selectedDocType);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jenis_dokumen", selectedDocType);
      formData.append("pendaftar_id", params.id as string);

      const response = await fetch("/api/admin/verifikasi/dokumen/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire("Berhasil", data.message, "success");
        fetchPendaftarDetail();
      } else {
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Terjadi kesalahan saat upload", "error");
    } finally {
      setUploadingDoc(null);
      setSelectedDocType(null);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handlePaymentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPayId) return;

    try {
      setUploadingPayment(selectedPayId);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pembayaran_id", selectedPayId);

      const response = await fetch("/api/admin/verifikasi/pembayaran/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire("Berhasil", data.message, "success");
        fetchPendaftarDetail();
      } else {
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Terjadi kesalahan saat upload", "error");
    } finally {
      setUploadingPayment(null);
      setSelectedPayId(null);
      if (payInputRef.current) payInputRef.current.value = "";
    }
  };

  const handleDeleteDokumen = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Dokumen?",
      text: "Anda yakin ingin menghapus file dokumen ini? File yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/verifikasi/dokumen/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Terhapus!", data.message, "success");
          fetchPendaftarDetail();
        } else {
          Swal.fire("Gagal", data.error, "error");
        }
      } catch (error) {
        console.error("Delete document error:", error);
        Swal.fire("Error", "Terjadi kesalahan sistem", "error");
      }
    }
  };

  const handleReviewPengajuan = async (action: 'approved' | 'rejected') => {
    let nominal = 0;
    if (action === 'approved') {
      const { value: inputNominal } = await Swal.fire({
        title: "Setujui Keringanan",
        input: "number",
        inputLabel: "Masukkan nilai potongan (Rp) yang diberikan",
        inputPlaceholder: "Contoh: 2500000",
        showCancelButton: true,
        confirmButtonText: "Simpan & Setujui",
        inputValidator: (value) => {
          if (!value || parseInt(value) <= 0) return "Nominal potongan tidak valid!";
        }
      });
      if (!inputNominal) return;
      nominal = parseInt(inputNominal);
    } else {
      const confirm = await Swal.fire({
        title: "Tolak Pengajuan?",
        text: "Pendaftar akan menerima notifikasi bahwa pengajuannya ditolak.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ya, Tolak"
      });
      if (!confirm.isConfirmed) return;
    }

    Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const res = await fetch("/api/admin/pendaftar/keringanan/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftar_id: pendaftar?.id, action, nominal })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("Berhasil", "Review pengajuan selesai disimpan.", "success").then(() => window.location.reload());
      } else {
        Swal.fire("Gagal", data.error || "Terjadi kesalahan", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const handleSetKeringanan = async () => {
    const { value: selectedKeringanan } = await Swal.fire({
      title: "Atur Beasiswa/Keringanan",
      input: "select",
      inputOptions: {
        "none": "Tidak Ada / Hapus Keringanan",
        "Beasiswa": "Beasiswa (Yatim/Dhuafa/Tahfizh/Prestasi)",
        "Keringanan": "Keringanan Biaya Daftar Ulang (Sosial/Dhuafa)",
      },
      inputPlaceholder: "Pilih Jenis",
      showCancelButton: true,
      confirmButtonText: "Selanjutnya &rarr;",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) return "Anda harus memilih jenis keringanan!";
      }
    });

    if (selectedKeringanan) {
      let nominal = 0;
      let finalJenis = selectedKeringanan;
      
      if (selectedKeringanan === "none") {
        nominal = 0;
        finalJenis = "";
      } else {
        const { value: formValues } = await Swal.fire({
          title: `Input ${selectedKeringanan}`,
          html: `
            <div class="text-left text-sm mb-4 text-stone-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              Masukkan nominal <b>POTONGAN (Diskon)</b> (bukan sisa tagihan).<br/><br/>
              Contoh: Jika Uang Pangkal normal Rp 7.500.000, dan wali santri hanya sanggup bayar Rp 6.000.000, berarti <b>potongannya adalah Rp 1.500.000</b>. <br/>Ketik: <b>1500000</b>.
            </div>
            <div class="mb-3 text-left w-full">
              <label class="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500 ml-1">Keterangan Label</label>
              <input id="swal-input-label" class="swal2-input !w-[95%] !mx-auto !mt-0 !h-12 !text-sm" placeholder="Misal: ${selectedKeringanan} Khusus" value="${selectedKeringanan}">
            </div>
            <div class="mb-3 text-left w-full">
              <label class="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500 ml-1">Nominal Potongan (Rp)</label>
              <input id="swal-input-nominal" type="number" class="swal2-input !w-[95%] !mx-auto !mt-0 !h-12 !font-black !text-lg" placeholder="Misal: 1500000">
            </div>
            <div class="mb-3 text-left w-full">
              <label class="block text-xs font-bold mb-1 uppercase tracking-wider text-slate-500 ml-1">Kesanggupan Bayar Wali (Rp) <span style="color:#94a3b8;font-weight:normal">(Opsional)</span></label>
              <input id="swal-input-kesanggupan" type="number" class="swal2-input !w-[95%] !mx-auto !mt-0 !h-12 !text-sm" placeholder="Misal: 6000000 (jika ada)">
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Konfirmasi",
          cancelButtonText: "Batal",
          preConfirm: () => {
            const label = (document.getElementById('swal-input-label') as HTMLInputElement).value;
            const nom = (document.getElementById('swal-input-nominal') as HTMLInputElement).value;
            const kesanggupan = (document.getElementById('swal-input-kesanggupan') as HTMLInputElement).value;
            if (!label || !nom) {
              Swal.showValidationMessage('Label dan Nominal wajib diisi!');
              return null;
            }
            if (parseInt(nom) <= 0) {
              Swal.showValidationMessage('Nominal potongan harus lebih dari 0');
              return null;
            }
            return { label, nominal: parseInt(nom), kesanggupan: kesanggupan ? parseInt(kesanggupan) : 0 };
          }
        });

        if (!formValues) return;

        finalJenis = formValues.label;
        nominal = formValues.nominal;
        (window as any).__kesanggupanBayar = formValues.kesanggupan || 0;
      }

      let fixNominal = nominal;
      let fixJenis = finalJenis;

      const confirm = await Swal.fire({
        title: "Konfirmasi",
        html: `Anda akan menetapkan:<br/><br/><b>${selectedKeringanan === "none" ? "Penghapusan Keringanan" : finalJenis}</b><br/>Nominal Potongan: <b>Rp ${nominal.toLocaleString("id-ID")}</b><br/><br/>Apakah Anda yakin?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Simpan!",
        cancelButtonText: "Batal",
      });

      if (confirm.isConfirmed) {
        Swal.fire({
          title: "Menyimpan...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const res = await fetch("/api/admin/pendaftar/keringanan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pendaftar_id: pendaftar?.id,
              jenis: fixJenis === "" ? null : fixJenis,
              nominal_potongan: fixJenis === "" ? undefined : fixNominal,
              kesanggupan_bayar: fixJenis === "" ? undefined : ((window as any).__kesanggupanBayar || 0)
            })
          });

          const data = await res.json();
          if (data.success) {
            Swal.fire("Berhasil!", "Data keringanan berhasil diperbarui.", "success").then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire("Gagal", data.error || "Terjadi kesalahan", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    }
  };

  const handleDeletePembayaran = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Bukti Transfer?",
      text: "Anda yakin ingin menghapus file bukti transfer ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/verifikasi/pembayaran/${id}/bukti`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Terhapus!", data.message, "success");
          fetchPendaftarDetail();
        } else {
          Swal.fire("Gagal", data.error, "error");
        }
      } catch (error) {
        console.error("Delete payment error:", error);
        Swal.fire("Error", "Terjadi kesalahan sistem", "error");
      }
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSavingStatus(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_proses: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update");

      await fetchPendaftarDetail();
      setEditingStatus(false);
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error", "Gagal mengubah status", "error");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!newPhone) return;
    try {
      setSavingPhone(true);
      const response = await fetch(`/api/admin/pendaftar/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ no_hp: newPhone }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal update nomor HP");
      }

      await fetchPendaftarDetail();
      setEditingPhone(false);
      Swal.fire("Berhasil", "Nomor HP berhasil diperbarui", "success");
    } catch (error: any) {
      console.error("Error updating phone:", error);
      Swal.fire(
        "Error",
        error.message || "Gagal memperbarui nomor HP",
        "error",
      );
    } finally {
      setSavingPhone(false);
    }
  };

  const formatStatus = (status: string, dataLengkap?: any) => {
    const s = status.toLowerCase().trim();
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "Draft", color: "bg-stone-100 text-stone-700" },
      awaiting_payment: {
        label: "Draft",
        color: "bg-stone-100 text-stone-700",
      },
      payment_verification: {
        label: "Verifikasi Bayar",
        color: "bg-primary-50 text-primary-700 border border-primary-100",
      },
      paid: {
        label: "Terdaftar",
        color: "bg-primary-100 text-primary-800 border border-primary-200",
      },
      verified: {
        label: "Terdaftar",
        color: "bg-primary-100 text-primary-800 border border-primary-200",
      },
      data_completed: {
        label: "Data Lengkap",
        color: "bg-gold-50 text-gold-800 border border-gold-100",
      },
      docs_uploaded: {
        label: "Data Lengkap",
        color: "bg-gold-50 text-gold-800 border border-gold-100",
      },
      docs_verified: {
        label: "Berkas Lengkap",
        color: "bg-emerald-50 text-emerald-800 border border-emerald-100",
      },
      scheduled: {
        label: "Proses Seleksi",
        color: "bg-purple-50 text-purple-800 border border-purple-100",
      },
      testing: {
        label: "Proses Seleksi",
        color: "bg-purple-50 text-purple-800 border border-purple-100",
      },
      selection: {
        label: "Proses Seleksi",
        color: "bg-purple-50 text-purple-800 border border-purple-100",
      },
      tested: {
        label: "Proses Seleksi",
        color: "bg-primary-600 text-white shadow-sm",
      },
      exam_completed: {
        label: "Proses Seleksi",
        color: "bg-primary-600 text-white shadow-sm",
      },
      announced: {
        label: "Cadangan",
        color: "bg-gold-100 text-gold-800 border border-gold-200",
      },
      cadangan: {
        label: "Cadangan",
        color: "bg-gold-100 text-gold-800 border border-gold-200",
      },
      accepted: { label: "Diterima", color: "bg-emerald-600 text-white" },
      rejected: { label: "Ditolak", color: "bg-rose-600 text-white" },
      mengundurkan_diri: {
        label: "Mengundurkan Diri",
        color: "bg-stone-600 text-white",
      },
      pindah_keluar: {
        label: "Pindah Keluar",
        color: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      enrolled: {
        label: "Proses Daftar Ulang",
        color: "bg-emerald-100 text-emerald-800",
      },
      enrolled_full: {
        label: "Lunas Daftar Ulang",
        color: "bg-primary-100 text-primary-800 border border-primary-200",
      },
    };
    return (
      statusMap[s] || {
        label: status,
        color: "bg-stone-100 text-stone-700",
      }
    );
  };

  const toTitleCase = (str: string | null | undefined) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-stone-600">Memuat detail pendaftar...</p>
        </div>
      </div>
    );
  }

  if (!pendaftar) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-stone-600 text-lg font-medium">
          Pendaftar tidak ditemukan
        </p>
        <Link
          href="/dashboard/admin/pendaftar"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const statusInfo = formatStatus(pendaftar.status_proses, pendaftar.data_lengkap);

  // Calculate document and payment progress
  const totalDocs = pendaftar.dokumen.length;
    const verifiedDocs = pendaftar.dokumen.filter((d) => d.is_verified).length;
  const isEnrolled = pendaftar.status_proses === "enrolled";
  const hasPaidRegistration = pendaftar.pembayaran.some(
    (p) => p.status_pembayaran === "verified",
  );
  const hasPendingPayment = pendaftar.pembayaran.some(
    (p) => p.status_pembayaran === "pending",
  );

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocUpload}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      <input
        type="file"
        ref={payInputRef}
        onChange={handlePaymentUpload}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      {/* Back Button */}
      <Link
        href="/dashboard/admin/pendaftar"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Pendaftar
      </Link>

      {/* Summary Card */}
      <div className="bg-linear-to-br from-primary-600 to-primary-900 rounded-3xl shadow-xl shadow-primary-900/20 p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* Main Info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-gold-300 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                {toTitleCase(pendaftar.nama_lengkap)}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="font-mono bg-white/20 px-2.5 py-1 rounded-lg text-sm font-black text-white border border-white/20">
                  {pendaftar.nomor_pendaftaran}
                </span>
                <span className="px-2.5 py-1 bg-gold-400 text-primary-900 rounded-lg text-xs font-black uppercase shadow-sm">
                  {pendaftar.jenjang}
                </span>
                <span className="text-primary-100 font-bold">
                  {["L", "Laki-laki"].includes(pendaftar.jenis_kelamin)
                    ? "Laki-laki"
                    : "Perempuan"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 min-w-[120px] border border-white/10">
              <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-1">
                {isEnrolled ? "Daftar Ulang" : "Bayar Pendaftaran"}
              </p>
              <p className="font-black text-xl flex items-center gap-1.5 text-white">
                {isEnrolled || hasPaidRegistration ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> Lunas
                  </>
                ) : hasPendingPayment ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-secondary-400" />{" "}
                    Pending
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-white/40" />{" "}
                    Belum Bayar
                  </>
                )}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 min-w-[120px] border border-white/10">
              <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-1">
                Dokumen
              </p>
              <p className="font-black text-xl text-white">
                {verifiedDocs}/{totalDocs}{" "}
                <span className="text-xs font-medium text-primary-200">
                  Verified
                </span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 min-w-[120px] border border-white/10">
              <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-1">
                Thn. Ajaran
              </p>
              <p className="font-black text-xl text-white">
                {pendaftar.tahun_ajaran?.nama || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Status & Actions Bar */}
        <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-primary-100">Status:</span>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-bold ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                Swal.fire({
                  title: "Buka Kunci Formulir?",
                  text: "Pendaftar akan bisa mengedit data kembali.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#e11d48",
                  confirmButtonText: "Ya, buka kunci!",
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    setSavingStatus(true);
                    try {
                      const res = await fetch(
                        `/api/admin/pendaftar/${params.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status_proses: "draft" }),
                        },
                      );
                      if (res.ok) {
                        await fetchPendaftarDetail();
                        Swal.fire(
                          "Selesai",
                          "Formulir berhasil dibuka kuncinya.",
                          "success",
                        );
                      }
                    } catch (e) {
                      Swal.fire("Error", "Gagal membuka kunci.", "error");
                    } finally {
                      setSavingStatus(false);
                    }
                  }
                });
              }}
              disabled={savingStatus || pendaftar.status_proses === "draft"}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 disabled:opacity-50 shadow-sm active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              Buka Kunci
            </button>
            {pendaftar.no_hp && (
              <a
                href={`https://wa.me/${pendaftar.no_hp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            {userRole === "admin_super" && (
              <button
                onClick={handleOpenEditModal}
                className="px-4 py-2 bg-gold-400 hover:bg-yellow-500 text-primary-900 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-gold-300 mr-2"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Biodata & Ortu
              </button>
            )}
            {pendaftar.email && (
              <a
                href={`mailto:${pendaftar.email}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black transition-all flex items-center gap-1 backdrop-blur-md active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Untuk Admin Berkas: Dokumen pindah ke kolom utama paling atas */}
          {isBerkas && (
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-50 rounded-xl">
                  <FileText className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight">
                  Dokumen (Prioritas Verifikasi)
                </h3>
              </div>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { id: "kartu_keluarga", label: "KK" },
                  { id: "akta_kelahiran", label: "Akta" },
                  { id: "rapor_sem1", label: "Rapor Ganjil" },
                  { id: "rapor_sem2", label: "Rapor Genap" },
                  { id: "nisn", label: "NISN" },
                  { id: "foto_setengah_badan", label: "Foto" },
                  { id: "surat_kesehatan", label: "Sehat" },
                  { id: "pakta_integritas_santri", label: "Pakta Santri" },
                  { id: "pakta_integritas_ortu", label: "Pakta Ortu/Wali" },
                  { id: "pernyataan_bebas_negatif", label: "Bebas Negatif" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedDocType(item.id);
                      setTimeout(() => docInputRef.current?.click(), 100);
                    }}
                    disabled={!!uploadingDoc}
                    className="px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-primary-100 disabled:opacity-50"
                  >
                    {uploadingDoc === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3 h-3" />
                    )}
                    Bantu Upload {item.label}
                  </button>
                ))}
              </div>
              {pendaftar.dokumen.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Belum ada dokumen terupload
                </p>
              ) : (
                <div className="space-y-4">
                  {pendaftar.dokumen.map((doc) => {
                    const isGlobalVerified = [
                      "docs_verified",
                      "scheduled",
                      "tested",
                      "announced",
                      "accepted",
                      "enrolled",
                      "verified",
                    ].includes(pendaftar.status_proses);
                    const isVerified =
                      doc.is_verified || (isGlobalVerified && !doc.catatan);
                    const isRejected = !doc.is_verified && doc.catatan;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-stone-400" />
                          <div>
                            <span className="block font-medium text-stone-900">
                              {getDocLabel(doc.jenis_dokumen)}
                            </span>
                            {((doc as any).file_url ||
                              (doc as any).file_path) && (
                              <>
                                <a
                                  href={
                                    (doc as any).file_url ||
                                    `/api/files/${(doc as any).file_path}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:underline"
                                >
                                  Lihat File
                                </a>
                                {!doc.is_verified && (
                                  <>
                                    <span className="mx-2 text-stone-300">|</span>
                                    <button
                                      onClick={() => handleDeleteDokumen(doc.id)}
                                      className="text-xs text-red-600 hover:underline"
                                    >
                                      Hapus
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            {isRejected && (
                              <p className="text-xs text-red-600 mt-1">
                                Catatan: {doc.catatan}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isVerified
                              ? "bg-green-100 text-green-700"
                              : isRejected
                                ? "bg-red-100 text-red-700"
                                : "bg-secondary-100 text-secondary-700"
                          }`}
                        >
                          {isVerified
                            ? "Terverifikasi"
                            : isRejected
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Hasil Seleksi & Ujian (Tampil untuk Admin Super, Admin Umum, dan Penguji) */}
          {(isPenguji ||
            userRole === "admin_super" ||
            userRole === "admin") && (
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gold-50 rounded-xl">
                  <Trophy className="w-6 h-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary-950 tracking-tight leading-tight">
                    Hasil Seleksi & Ujian
                  </h3>
                  <p className="text-sm text-ink-300 font-medium tracking-tight">
                    Rincian nilai 6 komponen tes Calon Santri & Calon
                    Orangtua/Wali Santri
                  </p>
                </div>
              </div>

              {/* Grid 6 Test Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Tes Kemampuan Akademik (CBT) */}
                <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100 relative">
                  <span className="block text-[10px] text-primary-600 font-black uppercase tracking-widest mb-1 leading-none">
                    CBT: Akademik
                  </span>
                  {!pendaftar.nilai_ujian ? (
                    <span className="text-sm font-bold text-ink-200 italic">
                      Belum Ujian
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-4xl font-black text-primary-950">
                        {pendaftar.nilai_ujian?.score_akademik != null ? Number(pendaftar.nilai_ujian.score_akademik).toFixed(1).replace(".0", "") : "-"}
                      </span>
                      <span className="text-sm text-primary-400 font-medium">/ 100</span>
                    </div>
                  )}
                </div>

                {/* 2. Tes Identifikasi Kepribadian (CBT) */}
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <span className="block text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">
                    CBT: Kepribadian
                  </span>
                  {!pendaftar.nilai_ujian ? (
                    <span className="text-sm font-bold text-stone-400 italic">
                      Belum Ujian
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-900">
                        {pendaftar.nilai_ujian?.score_kepribadian != null ? Number(pendaftar.nilai_ujian.score_kepribadian).toFixed(1).replace(".0", "") : "-"}
                      </span>
                      <span className="text-sm text-indigo-400 font-medium">
                        / 100
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Seleksi Kesiapan (CBT) */}
                <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                  <span className="block text-xs text-violet-600 font-bold uppercase tracking-wide mb-1">
                    CBT: Kesiapan
                  </span>
                  {!pendaftar.nilai_ujian ? (
                    <span className="text-sm font-bold text-stone-400 italic">
                      Belum Ujian
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-violet-900">
                        {pendaftar.nilai_ujian?.score_kesiapan != null ? Number(pendaftar.nilai_ujian.score_kesiapan).toFixed(1).replace(".0", "") : "-"}
                      </span>
                      <span className="text-sm text-violet-400 font-medium">
                        / 100
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Seleksi Al Qur'an (Offline) */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">
                      Tes Al-Qur&apos;an
                    </span>
                    {!pendaftar.nilai_ujian ? (
                      <span className="text-sm font-bold text-stone-400 italic">
                        Belum Ujian
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-900">
                          {pendaftar.nilai_ujian?.score_quran != null
                            ? Number(pendaftar.nilai_ujian.score_quran).toFixed(1).replace(".0", "")
                            : pendaftar.nilai_ujian?.nilai_tes_quran != null
                              ? Number(pendaftar.nilai_ujian.nilai_tes_quran).toFixed(1).replace(".0", "")
                              : "-"}
                        </span>
                        <span className="text-sm text-emerald-400 font-medium">
                          / 100
                        </span>
                      </div>
                    )}
                  </div>
                  {pendaftar.nilai_ujian?.catatan_quran && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-emerald-200/50 pt-2">
                      &ldquo;{pendaftar.nilai_ujian.catatan_quran}&rdquo;
                    </div>
                  )}
                </div>

                
                {pendaftar.jenjang?.toLowerCase().includes("ma") && (
                  <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs text-teal-600 font-bold uppercase tracking-wide mb-1">
                        Tes Hafalan
                      </span>
                      {!pendaftar.nilai_ujian ? (
                        <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                          Belum Ada
                        </span>
                      ) : pendaftar.nilai_ujian?.nilai_tes_hafalan || (pendaftar.nilai_ujian as any)?.score_hafalan ? (
                        <div className="flex flex-col mt-2 space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-teal-900">
                              {pendaftar.nilai_ujian?.score_hafalan != null
                                ? Number(pendaftar.nilai_ujian.score_hafalan).toFixed(1).replace(".0", "")
                                : pendaftar.nilai_ujian?.nilai_tes_hafalan != null
                                  ? Number(pendaftar.nilai_ujian.nilai_tes_hafalan).toFixed(1).replace(".0", "")
                                  : "-"}
                            </span>
                            <span className="text-sm text-teal-400 font-medium">/ 100</span>
                          </div>
                          {(pendaftar.nilai_ujian as any)?.detail_hafalan?.rekomendasi && (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-max ${(pendaftar.nilai_ujian as any).detail_hafalan.rekomendasi === "Diterima" ? "bg-teal-100 text-teal-700" : "bg-red-100 text-red-700"}`}>
                              {(pendaftar.nilai_ujian as any).detail_hafalan.rekomendasi}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                          Belum Dinilai
                        </span>
                      )}
                    </div>
                    {pendaftar.nilai_ujian?.catatan_hafalan && (
                      <div className="mt-3 text-[10px] text-stone-500 line-clamp-3 italic border-t border-teal-200/50 pt-2 leading-relaxed">
                        "`${pendaftar.nilai_ujian.catatan_hafalan}`"
                      </div>
                    )}
                  </div>
                )}


                {pendaftar.jenjang?.toLowerCase().includes("ma") && (
                  <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs text-sky-600 font-bold uppercase tracking-wide mb-1">
                        Lisan B. Arab
                      </span>
                      {!pendaftar.nilai_ujian ? (
                        <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                          Belum Ada
                        </span>
                      ) : pendaftar.nilai_ujian?.nilai_tes_lisan_arab || (pendaftar.nilai_ujian as any)?.score_lisan_arab ? (
                        <div className="flex flex-col mt-2 space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-sky-900">
                              {pendaftar.nilai_ujian?.score_lisan_arab != null
                                ? Number(pendaftar.nilai_ujian.score_lisan_arab).toFixed(1).replace(".0", "")
                                : pendaftar.nilai_ujian?.nilai_tes_lisan_arab != null
                                  ? Number(pendaftar.nilai_ujian.nilai_tes_lisan_arab).toFixed(1).replace(".0", "")
                                  : "-"}
                            </span>
                            <span className="text-sm text-sky-400 font-medium">/ 100</span>
                          </div>
                          {(pendaftar.nilai_ujian as any)?.detail_lisan_arab?.rekomendasi && (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-max ${(pendaftar.nilai_ujian as any).detail_lisan_arab.rekomendasi === "Diterima" ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700"}`}>
                              {(pendaftar.nilai_ujian as any).detail_lisan_arab.rekomendasi}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                          Belum Dinilai
                        </span>
                      )}
                    </div>
                    {pendaftar.nilai_ujian?.catatan_lisan_arab && (
                      <div className="mt-3 text-[10px] text-stone-500 line-clamp-3 italic border-t border-sky-200/50 pt-2 leading-relaxed">
                        "`${pendaftar.nilai_ujian.catatan_lisan_arab}`"
                      </div>
                    )}
                  </div>
                )}


                  {/* 5. Seleksi Wawancara Calon Santri (Offline) */}
                <div className="bg-secondary-50/50 p-4 rounded-xl border border-secondary-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-secondary-600 font-bold uppercase tracking-wide mb-1">
                      Wawancara: Calon Santri
                    </span>
                    {!pendaftar.nilai_ujian ? (
                      <span className="text-sm font-bold text-stone-400 italic">
                        Belum Ujian
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-secondary-900">
                          {pendaftar.nilai_ujian?.score_wawancara != null
                            ? Number(pendaftar.nilai_ujian.score_wawancara).toFixed(1).replace(".0", "")
                            : pendaftar.nilai_ujian?.nilai_wawancara_santri !=
                                null
                              ? Number(pendaftar.nilai_ujian.nilai_wawancara_santri).toFixed(1).replace(".0", "")
                              : "-"}
                        </span>
                        <span className="text-sm text-secondary-400 font-medium">
                          / 100
                        </span>
                      </div>
                    )}
                  </div>
                  {pendaftar.nilai_ujian?.catatan_santri && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-secondary-200/50 pt-2">
                      &ldquo;{pendaftar.nilai_ujian.catatan_santri}&rdquo;
                    </div>
                  )}
                </div>

                {/* 6. Seleksi Wawancara Orang Tua (Offline) */}
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex flex-col justify-between">
                  <div>
                    <span className="block text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">
                      Wawancara: Calon Orangtua/Wali Santri
                    </span>
                    {!pendaftar.nilai_ujian ? (
                      <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                        Belum Ada
                      </span>
                    ) : pendaftar.nilai_ujian?.nilai_wawancara_ortu ||
                      (pendaftar.nilai_ujian as any)?.detail_cawalsan ? (
                      <div className="flex flex-col mt-2 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-rose-900">
                            {pendaftar.nilai_ujian?.nilai_wawancara_ortu != null &&
                            Number(pendaftar.nilai_ujian.nilai_wawancara_ortu) > 1
                              ? Number(pendaftar.nilai_ujian.nilai_wawancara_ortu).toFixed(1).replace(".0", "")
                              : "-"}
                          </span>
                          <span className="text-sm text-rose-400 font-medium">/ 100</span>
                        </div>
                        {(pendaftar.nilai_ujian as any)?.detail_cawalsan?.rekomendasi && (
                          <span className="text-xs font-black text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-widest w-max">
                            {(pendaftar.nilai_ujian as any).detail_cawalsan.rekomendasi}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-stone-400 italic inline-block mt-2 px-3 py-1 bg-stone-100 rounded">
                        Belum Ada
                      </span>
                    )}
                  </div>
                  {pendaftar.nilai_ujian?.catatan_ortu && (
                    <div className="mt-2 text-xs text-stone-600 line-clamp-2 italic border-t border-rose-200/50 pt-2">
                      &ldquo;{pendaftar.nilai_ujian.catatan_ortu}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {(pendaftar.nilai_ujian?.catatan_umum || pendaftar.nilai_ujian?.catatan) && (
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mt-4">
                  <span className="block text-sm text-stone-500 font-medium mb-1">
                    Catatan Umum Penguji
                  </span>
                  <p className="text-stone-800 italic">
                    &ldquo;{pendaftar.nilai_ujian?.catatan_umum || pendaftar.nilai_ujian?.catatan}&rdquo;
                  </p>
                </div>
              )}

              {/* Tampilkan tombol edit hanya jika itu penguji, biar admin super dkk cukup melihat hasil saja, jika mengedit lewat form khusus */}
              {isPenguji && (
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/dashboard/penguji/input-nilai?search=${pendaftar.nomor_pendaftaran}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow hover:shadow-md font-bold text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Input / Lengkapi Edit Nilai
                  </Link>
                </div>
              )}

              {/* Tombol Hitung Ulang untuk Admin */}
              {(userRole === "admin_super" || userRole === "admin") && pendaftar.nilai_ujian && (
                <div className="mt-4 flex justify-end gap-2">
                  {userRole === "admin_super" && (
                    <button
                      onClick={async () => {
                        const { value: status } = await Swal.fire({
                          title: "Ubah Status Kelulusan (Manual)",
                          text: "Pilih status baru untuk menimpa hasil perhitungan sistem:",
                          input: "select",
                          inputOptions: {
                            DITERIMA: "DITERIMA",
                            CADANGAN: "CADANGAN",
                            DITOLAK: "DITOLAK",
                          },
                          inputPlaceholder: "Pilih status...",
                          showCancelButton: true,
                          confirmButtonText: "Simpan Perubahan",
                          cancelButtonText: "Batal",
                          confirmButtonColor: "#800000",
                          inputValidator: (value) => {
                            if (!value) return "Pilih status terlebih dahulu!";
                          }
                        });

                        if (!status) return;

                        try {
                          const res = await fetch(`/api/penilaian/recalculate/${params.id}`, { 
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ overrideStatus: status })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Gagal mengubah status");
                          Swal.fire("Berhasil!", `Status kelulusan berhasil diubah menjadi: ${data.status_kelulusan || "-"}`, "success");
                          fetchPendaftarDetail();
                        } catch (err: any) {
                          Swal.fire("Error", err.message || "Terjadi kesalahan", "error");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow hover:shadow-md font-bold text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Override Status
                    </button>
                  )}
                  {userRole === "admin_super" && (
                    <button
                      onClick={() => {
                        setNilaiFormData({
                          score_akademik: pendaftar.nilai_ujian?.score_akademik?.toString() || "",
                          score_kepribadian: pendaftar.nilai_ujian?.score_kepribadian?.toString() || "",
                          score_kesiapan: pendaftar.nilai_ujian?.score_kesiapan?.toString() || "",
                          score_quran: pendaftar.nilai_ujian?.score_quran?.toString() || "",
                        });
                        setIsNilaiModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow hover:shadow-md font-bold text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Input Nilai Khusus
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: "Hitung Ulang Nilai?",
                        text: "Sistem akan menghitung ulang total skor dan menentukan status kelulusan berdasarkan semua nilai yang ada.",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Ya, Hitung Ulang!",
                        cancelButtonText: "Batal",
                        confirmButtonColor: "#800000",
                      });
                      if (!result.isConfirmed) return;
                      try {
                        const res = await fetch(`/api/penilaian/recalculate/${params.id}`, { method: "POST" });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Gagal menghitung ulang");
                        Swal.fire("Berhasil!", `Skor akhir: ${data.nilai_total ? Number(data.nilai_total).toFixed(2) : "-"} | Status: ${data.status_kelulusan || "-"}`, "success");
                        fetchPendaftarDetail();
                      } catch (err: any) {
                        Swal.fire("Error", err.message || "Terjadi kesalahan", "error");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow hover:shadow-md font-bold text-sm"
                  >
                    <Trophy className="w-4 h-4" />
                    Hitung Ulang Nilai
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Untuk Admin Keuangan: Pembayaran pindah ke kolom utama paling atas */}
          {/* TODO: Ganti logic check permission dengan session role yang sebenarnya */}
          {isKeuangan && (
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gold-100 rounded-xl shadow-sm">
                  <CreditCard className="w-6 h-6 text-gold-700" />
                </div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight">
                  Pembayaran (Prioritas Keuangan)
                </h3>
              </div>
              {pendaftar.pembayaran.length === 0 ? (
                <p className="text-sm text-ink-300 font-bold italic">
                  Belum ada pembayaran
                </p>
              ) : (
                <div className="space-y-4">
                  {pendaftar.pembayaran.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 bg-gold-50/50 rounded-2xl border border-gold-100 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-primary-950 tracking-tighter">
                          {formatRupiah(payment.jumlah)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            payment.status_pembayaran === "verified"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : payment.status_pembayaran === "rejected"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-gold-100 text-gold-700 border border-gold-200"
                          }`}
                        >
                          {payment.status_pembayaran === "verified"
                            ? "Terverifikasi"
                            : payment.status_pembayaran === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                        <div className="flex flex-col items-end gap-2">
                          {payment.bukti_transfer_path && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`/api/files/${payment.bukti_transfer_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary-600 hover:underline font-bold"
                              >
                                Lihat Bukti
                              </a>
                              {payment.status_pembayaran !== "verified" && (
                                <>
                                  <span className="text-stone-300">|</span>
                                  <button
                                    onClick={() => handleDeletePembayaran(payment.id)}
                                    className="text-[10px] text-red-600 hover:underline font-bold"
                                  >
                                    Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                          {(!payment.bukti_transfer_path || payment.status_pembayaran !== "verified") && (
                            <button
                              onClick={() => {
                                setSelectedPayId(payment.id);
                                setTimeout(() => payInputRef.current?.click(), 100);
                              }}
                              disabled={!!uploadingPayment}
                              className="px-3 py-1 bg-white hover:bg-gold-100 text-gold-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-gold-200 disabled:opacity-50"
                            >
                              {uploadingPayment === payment.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UploadCloud className="w-3 h-3" />
                              )}
                              Bantu Upload Bukti
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gold-200/50">
                        <div>
                          <span className="block text-[10px] text-ink-200 font-black uppercase tracking-widest leading-none mb-1">
                            Metode
                          </span>
                          <span className="font-bold text-primary-950 text-sm">
                            {payment.metode_pembayaran}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-ink-200 font-black uppercase tracking-widest leading-none mb-1">
                            Tanggal
                          </span>
                          <span className="font-bold text-primary-950 text-sm">
                            {formatDate(payment.tanggal_pembayaran)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Pribadi (Selalu tampil, tapi mungkin disederhanakan) */}
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-50 rounded-xl">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-black text-primary-950 tracking-tight">
                Data Pribadi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Nama Lengkap"
                value={toTitleCase(pendaftar.nama_lengkap)}
              />
              <InfoItem label="NIK" value={pendaftar.nik} />
              <InfoItem
                label="Jenis Kelamin"
                value={
                  ["L", "Laki-laki"].includes(pendaftar.jenis_kelamin)
                    ? "Laki-laki"
                    : "Perempuan"
                }
              />
              <InfoItem label="Jenjang" value={pendaftar.jenjang} />
              {/* Hide extensive personal details for Finance/Berkas/Penguji to reduce noise */}
              {!isKeuangan && !isBerkas && !isPenguji && (
                <>
                  <InfoItem
                    label="Tempat Lahir"
                    value={pendaftar.tempat_lahir}
                  />
                  <InfoItem
                    label="Tanggal Lahir"
                    value={formatDate(pendaftar.tanggal_lahir)}
                  />
                  <InfoItem
                    label="Golongan Darah"
                    value={pendaftar.golongan_darah}
                  />
                  <InfoItem label="NISN" value={pendaftar.nisn} />
                  <InfoItem
                    label="Anak Ke"
                    value={pendaftar.anak_ke?.toString()}
                  />
                  <InfoItem
                    label="Berapa Bersaudara"
                    value={pendaftar.jumlah_saudara?.toString()}
                  />
                  <InfoItem
                    label="Tinggi Badan"
                    value={pendaftar.data_lengkap?.santri?.tinggi_badan ? `${pendaftar.data_lengkap.santri.tinggi_badan} cm` : "-"}
                  />
                  <InfoItem
                    label="Berat Badan"
                    value={pendaftar.data_lengkap?.santri?.berat_badan ? `${pendaftar.data_lengkap.santri.berat_badan} kg` : "-"}
                  />
                  <InfoItem label="Hobi" value={pendaftar.hobi} />
                  <InfoItem label="Cita-cita" value={pendaftar.cita_cita} />
                </>
              )}
            </div>
          </div>

          {/* Kontak & Alamat (Penting untuk Penagihan) */}
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-primary-950 tracking-tight">
                Kontak & Alamat
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                {editingPhone ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-ink-200 font-black uppercase tracking-widest mb-1 leading-none">
                      No. HP (Update)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold text-primary-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Contoh: 0812..."
                        disabled={savingPhone}
                      />
                      <button
                        onClick={handleUpdatePhone}
                        disabled={savingPhone}
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        title="Simpan Nomor"
                      >
                        {savingPhone ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingPhone(false)}
                        disabled={savingPhone}
                        className="p-2 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300 transition-colors"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[9px] text-stone-500 italic mt-0.5">
                      *Mengubah ini juga akan mengubah nomor login pendaftar.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-end justify-between">
                    <InfoItem
                      label="No. HP"
                      value={pendaftar.no_hp}
                      icon={<Phone className="w-4 h-4" />}
                    />
                    {userRole === "admin_super" && (
                      <button
                        onClick={() => {
                          setNewPhone(pendaftar.no_hp || "");
                          setEditingPhone(true);
                        }}
                        className="p-1.5 text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-1"
                        title="Edit Nomor HP"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Edit</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <InfoItem
                label="Email"
                value={pendaftar.email}
                icon={<Mail className="w-4 h-4" />}
              />
              <div className="md:col-span-2">
                <InfoItem label="Alamat Lengkap" value={pendaftar.alamat} />
              </div>
              {/* Simplified address details for Finance */}
              {!isKeuangan && (
                <>
                  <InfoItem
                    label="RT/RW"
                    value={`${pendaftar.rt || "-"}/${pendaftar.rw || "-"}`}
                  />
                  <InfoItem label="Kelurahan" value={pendaftar.kelurahan} />
                  <InfoItem label="Kecamatan" value={pendaftar.kecamatan} />
                  <InfoItem label="Kabupaten" value={pendaftar.kabupaten} />
                  <InfoItem label="Provinsi" value={pendaftar.provinsi} />
                  <InfoItem label="Kode Pos" value={pendaftar.kode_pos} />
                </>
              )}
            </div>
          </div>

          {/* Asal Sekolah (Sembunyikan untuk Keuangan) */}
          {!isKeuangan && (
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gold-50 rounded-xl">
                  <School className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight">
                  Asal Sekolah
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Nama Sekolah" value={pendaftar.asal_sekolah} />
                <InfoItem
                  label="Tahun Lulus"
                  value={pendaftar.tahun_lulus?.toString()}
                />
                <InfoItem
                  label="NPSN / NSM Sekolah"
                  value={pendaftar.data_lengkap?.santri?.npsn || "-"}
                />
                <InfoItem label="NISN" value={pendaftar.nisn} />
                <div className="md:col-span-2">
                  <InfoItem
                    label="Alamat Sekolah"
                    value={pendaftar.alamat_sekolah}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Orang Tua (Penting untuk Penagihan) */}
          {pendaftar.orang_tua && (
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-gold-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gold-100 rounded-xl">
                  <Users className="w-6 h-6 text-gold-700" />
                </div>
                <h3 className="text-xl font-black text-primary-950 tracking-tight">
                  Data Orang Tua/Wali
                </h3>
              </div>

              <div className="space-y-8">
                {/* Data Ayah */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-600" />
                      Data Ayah / Wali Laki-laki
                    </div>
                    {pendaftar.orang_tua.status_ayah && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          pendaftar.orang_tua.status_ayah === "Sudah Meninggal"
                            ? "bg-red-100 text-red-600 border border-red-200"
                            : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        {pendaftar.orang_tua.status_ayah}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoItem
                      label="Nama Lengkap"
                      value={toTitleCase(pendaftar.orang_tua.nama_ayah)}
                    />
                    <InfoItem
                      label="No. HP / WA"
                      value={pendaftar.orang_tua.no_hp_ayah}
                    />
                    <InfoItem
                      label="Pekerjaan"
                      value={pendaftar.orang_tua.pekerjaan_ayah}
                    />
                    <InfoItem
                      label="Penghasilan"
                      value={pendaftar.orang_tua.penghasilan_ayah}
                    />
                    {!isKeuangan && (
                      <>
                        <InfoItem
                          label="NIK"
                          value={pendaftar.orang_tua.nik_ayah}
                        />
                        <InfoItem
                          label="Tempat, Tgl Lahir"
                          value={`${pendaftar.orang_tua.tempat_lahir_ayah || ""}, ${formatDate(pendaftar.orang_tua.tanggal_lahir_ayah)}`}
                        />
                        <InfoItem
                          label="Pendidikan Terakhir"
                          value={pendaftar.orang_tua.pendidikan_ayah}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Alamat Ayah"
                            value={
                              pendaftar.orang_tua.alamat_ayah ||
                              (pendaftar.orang_tua.status_ayah === "Masih Hidup"
                                ? pendaftar.alamat
                                : "-")
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-rose-600" />
                      Data Ibu / Wali Perempuan
                    </div>
                    {pendaftar.orang_tua.status_ibu && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          pendaftar.orang_tua.status_ibu === "Sudah Meninggal"
                            ? "bg-red-100 text-red-600 border border-red-200"
                            : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        {pendaftar.orang_tua.status_ibu}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoItem
                      label="Nama Lengkap"
                      value={toTitleCase(pendaftar.orang_tua.nama_ibu)}
                    />
                    <InfoItem
                      label="No. HP / WA"
                      value={pendaftar.orang_tua.no_hp_ibu}
                    />
                    {!isKeuangan && (
                      <>
                        <InfoItem
                          label="NIK"
                          value={pendaftar.orang_tua.nik_ibu}
                        />
                        <InfoItem
                          label="Tempat, Tgl Lahir"
                          value={`${pendaftar.orang_tua.tempat_lahir_ibu || ""}, ${formatDate(pendaftar.orang_tua.tanggal_lahir_ibu)}`}
                        />
                        <InfoItem
                          label="Pendidikan Terakhir"
                          value={pendaftar.orang_tua.pendidikan_ibu}
                        />
                        <InfoItem
                          label="Pekerjaan"
                          value={pendaftar.orang_tua.pekerjaan_ibu}
                        />
                        <InfoItem
                          label="Penghasilan"
                          value={pendaftar.orang_tua.penghasilan_ibu}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Alamat Ibu"
                            value={
                              pendaftar.orang_tua.alamat_ibu ||
                              (pendaftar.orang_tua.status_ibu === "Masih Hidup"
                                ? pendaftar.alamat
                                : "-")
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat Penyakit (Sembunyikan untuk Keuangan) */}
          {!isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Data Kesehatan & Catatan
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Golongan Darah"
                  value={pendaftar.golongan_darah}
                />
                <div className="md:col-span-2">
                  <p className="text-xs text-stone-500 mb-1">
                    Riwayat Penyakit
                  </p>
                  <div className="p-3 bg-red-50 text-red-900 rounded-lg border border-red-100 min-h-[60px]">
                    {pendaftar.hobi ||
                      "Tidak ada riwayat penyakit yang dilaporkan"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Sidebar Component for Documents & Payments (existing sidebar logic adapted) */}
          {/* If Keuangan, Sidebar Pembayaran di-hide atau ditampilkan sebagai Secondary info (karena sudah ada di header) */}

          {/* Status Dokumen */}
          {!isKeuangan && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Dokumen</h3>
              </div>
              {pendaftar.dokumen.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Belum ada dokumen terupload
                </p>
              ) : (
                <div className="space-y-2">
                  {pendaftar.dokumen.map((doc) => {
                    const isGlobalVerified = [
                      "docs_verified",
                      "scheduled",
                      "tested",
                      "announced",
                      "accepted",
                      "enrolled",
                      "verified",
                    ].includes(pendaftar.status_proses);
                    const isVerified =
                      doc.is_verified || (isGlobalVerified && !doc.catatan);
                    const isRejected = !doc.is_verified && doc.catatan;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-stone-700">
                          {getDocLabel(doc.jenis_dokumen)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            isVerified
                              ? "bg-green-100 text-green-700"
                              : isRejected
                                ? "bg-red-100 text-red-700"
                                : "bg-secondary-100 text-secondary-700"
                          }`}
                        >
                          {isVerified
                            ? "Terverifikasi"
                            : isRejected
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Status Pembayaran (Sidebar View - Hide IF Keuangan because it's already on top, OR keep as consistent view) */}
          {/* Hide IF Berkas as well, unless we want them to see it. User request implies focus on relevant data. */}
          {!isKeuangan && !isBerkas && !isPenguji && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Pembayaran</h3>
              </div>
              {pendaftar.pembayaran.length === 0 ? (
                <p className="text-sm text-stone-500">Belum ada pembayaran</p>
              ) : (
                <div className="space-y-3">
                  {pendaftar.pembayaran.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-3 bg-stone-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone-900">
                          {formatRupiah(payment.jumlah)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            payment.status_pembayaran === "verified"
                              ? "bg-green-100 text-green-700"
                              : payment.status_pembayaran === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-secondary-100 text-secondary-700"
                          }`}
                        >
                          {payment.status_pembayaran === "verified"
                            ? "Terverifikasi"
                            : payment.status_pembayaran === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600">
                        <div>Metode: {payment.metode_pembayaran}</div>
                        <div>
                          Tanggal: {formatDate(payment.tanggal_pembayaran)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Keringanan & Beasiswa */}
          {userRole === "admin_super" && (
            <AdminBeasiswaBlock
              pendaftarId={pendaftar.id}
              dataLengkap={pendaftar.data_lengkap}
              onUpdate={fetchPendaftarDetail}
            />
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-stone-100 rounded-lg">
                <Calendar className="w-6 h-6 text-stone-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Timeline</h3>
            </div>
            <div className="space-y-3">
              <InfoItem
                label="Tanggal Daftar"
                value={formatDate(pendaftar.created_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem
                label="Update Terakhir"
                value={formatDate(pendaftar.updated_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Edit Data Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center z-50 p-4 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="bg-primary-950 p-6 text-white flex items-center justify-between border-b border-primary-900">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Edit Biodata & Ortu Pendaftar</h2>
                <p className="text-xs text-primary-200 font-bold mt-1">Super Admin Panel - Lakukan koreksi data dengan teliti.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-stone-50 border-b border-stone-200 overflow-x-auto scrollbar-thin">
              {[
                { id: "santri", label: "Data Santri" },
                { id: "alamat", label: "Alamat & Kontak" },
                { id: "sekolah", label: "Sekolah & Pindahan" },
                { id: "ayah", label: "Data Ayah" },
                { id: "ibu", label: "Data Ibu" },
                { id: "wali", label: "Data Wali" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditTab(tab.id)}
                  className={`px-6 py-4 font-black text-sm tracking-wide transition-all border-b-2 uppercase whitespace-nowrap ${
                    editTab === tab.id
                      ? "border-primary-600 text-primary-700 bg-white"
                      : "border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
              {editTab === "santri" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Nama Lengkap Santri</label>
                    <input
                      type="text"
                      value={editFormData.santri.nama_lengkap}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, nama_lengkap: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">NIK Santri</label>
                    <input
                      type="text"
                      value={editFormData.santri.nik}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, nik: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir</label>
                    <input
                      type="text"
                      value={editFormData.santri.tempat_lahir}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, tempat_lahir: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={editFormData.santri.tanggal_lahir}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, tanggal_lahir: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Jenis Kelamin</label>
                    <select
                      value={editFormData.santri.jenis_kelamin}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, jenis_kelamin: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Golongan Darah</label>
                    <select
                      value={editFormData.santri.golongan_darah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, golongan_darah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    >
                      <option value="">Pilih Golongan Darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                      <option value="Tidak Tahu">Tidak Tahu</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Anak Ke</label>
                    <input
                      type="number"
                      value={editFormData.santri.anak_ke}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, anak_ke: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Berapa Bersaudara</label>
                    <input
                      type="number"
                      value={editFormData.santri.jumlah_saudara}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, jumlah_saudara: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Hobi</label>
                    <input
                      type="text"
                      value={editFormData.santri.hobi}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, hobi: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Cita-Cita</label>
                    <input
                      type="text"
                      value={editFormData.santri.cita_cita}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, cita_cita: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                </div>
              )}

              {editTab === "alamat" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">No. HP Santri</label>
                      <input
                        type="text"
                        value={editFormData.santri.no_hp}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, no_hp: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Email Santri</label>
                      <input
                        type="email"
                        value={editFormData.santri.email}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, email: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Alamat Rumah Lengkap</label>
                    <textarea
                      value={editFormData.santri.alamat}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        santri: { ...editFormData.santri, alamat: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">RT</label>
                      <input
                        type="text"
                        value={editFormData.santri.rt}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, rt: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">RW</label>
                      <input
                        type="text"
                        value={editFormData.santri.rw}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, rw: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Kelurahan</label>
                      <input
                        type="text"
                        value={editFormData.santri.kelurahan}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, kelurahan: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Kecamatan</label>
                      <input
                        type="text"
                        value={editFormData.santri.kecamatan}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, kecamatan: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Kabupaten/Kota</label>
                      <input
                        type="text"
                        value={editFormData.santri.kabupaten}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, kabupaten: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Provinsi</label>
                      <input
                        type="text"
                        value={editFormData.santri.provinsi}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, provinsi: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Kode Pos</label>
                      <input
                        type="text"
                        value={editFormData.santri.kode_pos}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, kode_pos: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editTab === "sekolah" && (
                <div className="space-y-8">
                  {/* General School Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Nama Asal Sekolah</label>
                      <input
                        type="text"
                        value={editFormData.santri.asal_sekolah}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, asal_sekolah: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">NISN</label>
                      <input
                        type="text"
                        value={editFormData.santri.nisn}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, nisn: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Alamat Sekolah</label>
                      <input
                        type="text"
                        value={editFormData.santri.alamat_sekolah}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, alamat_sekolah: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-stone-600">Tahun Lulus</label>
                      <input
                        type="number"
                        value={editFormData.santri.tahun_lulus}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          santri: { ...editFormData.santri, tahun_lulus: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                      />
                    </div>
                  </div>

                  {/* Transfer specific details */}
                  <div className="border-t border-stone-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-black text-[10px] uppercase">Pindahan</span>
                      <h3 className="text-lg font-black text-stone-900">Informasi Khusus Siswa Pindahan</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-stone-600">Tipe Pendaftaran</label>
                        <select
                          value={editFormData.santri.tipe_pendaftaran}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            santri: { ...editFormData.santri, tipe_pendaftaran: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                        >
                          <option value="BARU">BARU (Reguler)</option>
                          <option value="PINDAHAN">PINDAHAN</option>
                        </select>
                      </div>

                      {editFormData.santri.tipe_pendaftaran === "PINDAHAN" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-stone-600">Kelas Masuk</label>
                            <input
                              type="number"
                              value={editFormData.santri.kelas_masuk}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                santri: { ...editFormData.santri, kelas_masuk: e.target.value }
                              })}
                              placeholder="Contoh: 8"
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-stone-600">Asal Institusi/Sekolah Lama</label>
                            <input
                              type="text"
                              value={editFormData.santri.asal_institusi}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                santri: { ...editFormData.santri, asal_institusi: e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-stone-600">Nomor Induk Lama (NIS/NISP)</label>
                            <input
                              type="text"
                              value={editFormData.santri.nomor_induk_lama}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                santri: { ...editFormData.santri, nomor_induk_lama: e.target.value }
                              })}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-black uppercase text-stone-600">Catatan Pindahan</label>
                            <textarea
                              value={editFormData.santri.catatan_pindahan}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                santri: { ...editFormData.santri, catatan_pindahan: e.target.value }
                              })}
                              rows={3}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {editTab === "ayah" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Nama Ayah Kandung</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nama_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nama_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">NIK Ayah</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nik_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nik_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Ayah</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.tempat_lahir_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tempat_lahir_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Ayah</label>
                    <input
                      type="date"
                      value={editFormData.orang_tua.tanggal_lahir_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tanggal_lahir_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pendidikan_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pendidikan_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pekerjaan</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pekerjaan_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pekerjaan_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Penghasilan Bulanan</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.penghasilan_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, penghasilan_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">No. HP/WhatsApp Ayah</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.no_hp_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, no_hp_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Status Hidup Ayah</label>
                    <select
                      value={editFormData.orang_tua.status_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, status_ayah: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    >
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Sudah Meninggal">Sudah Meninggal</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Ayah</label>
                    <textarea
                      value={editFormData.orang_tua.alamat_ayah}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, alamat_ayah: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                    />
                  </div>
                </div>
              )}

              {editTab === "ibu" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Nama Ibu Kandung</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nama_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nama_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">NIK Ibu</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nik_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nik_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Ibu</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.tempat_lahir_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tempat_lahir_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Ibu</label>
                    <input
                      type="date"
                      value={editFormData.orang_tua.tanggal_lahir_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tanggal_lahir_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pendidikan_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pendidikan_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pekerjaan</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pekerjaan_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pekerjaan_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Penghasilan Bulanan</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.penghasilan_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, penghasilan_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">No. HP/WhatsApp Ibu</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.no_hp_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, no_hp_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Status Hidup Ibu</label>
                    <select
                      value={editFormData.orang_tua.status_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, status_ibu: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    >
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Sudah Meninggal">Sudah Meninggal</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Ibu</label>
                    <textarea
                      value={editFormData.orang_tua.alamat_ibu}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, alamat_ibu: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                    />
                  </div>
                </div>
              )}

              {editTab === "wali" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Hubungan Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.hubungan_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, hubungan_wali: e.target.value }
                      })}
                      placeholder="Contoh: Paman, Kakek, Kakak, dll."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Nama Lengkap Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nama_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nama_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">NIK Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.nik_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, nik_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tempat Lahir Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.tempat_lahir_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tempat_lahir_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Tanggal Lahir Wali</label>
                    <input
                      type="date"
                      value={editFormData.orang_tua.tanggal_lahir_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, tanggal_lahir_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pendidikan Terakhir Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pendidikan_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pendidikan_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Pekerjaan Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.pekerjaan_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, pekerjaan_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">Penghasilan Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.penghasilan_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, penghasilan_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-stone-600">No. HP Wali</label>
                    <input
                      type="text"
                      value={editFormData.orang_tua.no_hp_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, no_hp_wali: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black uppercase text-stone-600">Alamat Tinggal Wali</label>
                    <textarea
                      value={editFormData.orang_tua.alamat_wali}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        orang_tua: { ...editFormData.orang_tua, alamat_wali: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 font-bold text-stone-850 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="border-t border-stone-200 pt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-black text-sm uppercase transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm uppercase transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT NILAI MANUAL (ADMIN SUPER ONLY) */}
      {isNilaiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setIsNilaiModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 md:px-8 py-6 border-b border-surface-100 flex items-center justify-between shrink-0 bg-surface-50/50">
              <h2 className="text-xl font-black tracking-tight">Input Nilai Khusus</h2>
              <button
                onClick={() => setIsNilaiModalOpen(false)}
                className="p-2 hover:bg-surface-200 rounded-xl transition-colors text-ink-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveNilaiManual} className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-4">
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm mb-4 border border-amber-200 font-medium">
                  <strong>Peringatan:</strong> Fitur ini akan langsung menimpa data nilai secara spesifik (untuk pindahan/bypass).
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase text-stone-600">Nilai CBT Akademik</label>
                  <input
                    type="number"
                    step="any"
                    value={nilaiFormData.score_akademik}
                    onChange={(e) => setNilaiFormData({...nilaiFormData, score_akademik: e.target.value})}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all mt-1"
                    placeholder="Contoh: 95"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase text-stone-600">Nilai CBT Kepribadian</label>
                  <input
                    type="number"
                    step="any"
                    value={nilaiFormData.score_kepribadian}
                    onChange={(e) => setNilaiFormData({...nilaiFormData, score_kepribadian: e.target.value})}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all mt-1"
                    placeholder="Contoh: 52"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-stone-600">Nilai CBT Kesiapan</label>
                  <input
                    type="number"
                    step="any"
                    value={nilaiFormData.score_kesiapan}
                    onChange={(e) => setNilaiFormData({...nilaiFormData, score_kesiapan: e.target.value})}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all mt-1"
                    placeholder="Contoh: 65.3"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-stone-600">Nilai Tes Al Quran</label>
                  <input
                    type="number"
                    step="any"
                    value={nilaiFormData.score_quran}
                    onChange={(e) => setNilaiFormData({...nilaiFormData, score_quran: e.target.value})}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all mt-1"
                    placeholder="Contoh: 70"
                  />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-surface-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNilaiModalOpen(false)}
                  className="px-5 py-2.5 hover:bg-surface-100 text-ink-600 rounded-xl font-bold text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNilai}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm uppercase transition-all shadow-md disabled:opacity-50"
                >
                  {savingNilai ? "Menyimpan..." : "Simpan Nilai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for info items
function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] text-ink-200 font-black uppercase tracking-widest mb-1 leading-none">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary-300">{icon}</span>}
        <p className="font-bold text-primary-950 leading-tight">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

