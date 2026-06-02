"use client";

import { useState, useEffect } from "react";
import { Loader2, Shirt, Save, CheckCircle2, Ruler } from "lucide-react";

export default function SeragamPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ukuran_seragam_baju: "",
    ukuran_seragam_celana: "",
    ukuran_seragam_almamater: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get session first
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) throw new Error("Failed to fetch session");
      const sessionData = await sessionRes.json();
      
      const pendaftarId = sessionData.pendaftar_id || sessionData.session?.id;
      if (!pendaftarId) throw new Error("Pendaftar ID not found in session");

      // 2. Fetch status with pendaftar_id
      const res = await fetch(
        `/api/pendaftar/status?pendaftar_id=${pendaftarId}&t=${Date.now()}`
      );
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ukuran_seragam_baju: data.ukuran_seragam_baju || "",
          ukuran_seragam_celana: data.ukuran_seragam_celana || "",
          ukuran_seragam_almamater: data.ukuran_seragam_almamater || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/pendaftar/seragam", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");

      setMessage({ type: "success", text: "Ukuran seragam berhasil disimpan!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-ink-100 flex items-start gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100px] -z-0"></div>
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
          <Shirt className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-black text-primary-950">Pendataan Ukuran Seragam</h1>
          <p className="text-sm font-medium text-ink-500 mt-1">
            Silakan pilih ukuran baju dan celana santri sesuai dengan panduan ukuran di bawah ini. Pastikan ukuran yang dipilih sudah benar.
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Form Input */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-ink-100">
          <h2 className="text-lg font-black text-ink-950 mb-6 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-ink-400" />
            Form Pemilihan Ukuran
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                Ukuran Baju *
              </label>
              <select
                value={formData.ukuran_seragam_baju}
                onChange={(e) => setFormData({ ...formData, ukuran_seragam_baju: e.target.value })}
                className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                required
              >
                <option value="">-- Pilih Ukuran Baju --</option>
                <option value="S">Ukuran S</option>
                <option value="M">Ukuran M</option>
                <option value="L">Ukuran L</option>
                <option value="XL">Ukuran XL</option>
                <option value="XXL">Ukuran XXL</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                Ukuran Celana / Rok *
              </label>
              <select
                value={formData.ukuran_seragam_celana}
                onChange={(e) => setFormData({ ...formData, ukuran_seragam_celana: e.target.value })}
                className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                required
              >
                <option value="">-- Pilih Ukuran Celana --</option>
                <option value="S">Ukuran S</option>
                <option value="M">Ukuran M</option>
                <option value="L">Ukuran L</option>
                <option value="XL">Ukuran XL</option>
                <option value="XXL">Ukuran XXL</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                Ukuran Almamater *
              </label>
              <select
                value={formData.ukuran_seragam_almamater}
                onChange={(e) => setFormData({ ...formData, ukuran_seragam_almamater: e.target.value })}
                className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold"
                required
              >
                <option value="">-- Pilih Ukuran Almamater --</option>
                <option value="S">Ukuran S</option>
                <option value="M">Ukuran M</option>
                <option value="L">Ukuran L</option>
                <option value="XL">Ukuran XL</option>
                <option value="XXL">Ukuran XXL</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-200 hover:bg-primary-800 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Menyimpan..." : "Simpan Ukuran Seragam"}
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Panduan Ukuran */}
        <div className="bg-ink-50 p-6 rounded-3xl border border-ink-200 space-y-6">
          <h2 className="text-sm font-black text-ink-950 uppercase tracking-widest border-b border-ink-200 pb-2">
            Panduan Ukuran (Size Chart)
          </h2>
          
          <div className="space-y-4 text-sm font-medium text-ink-700">
            {/* S */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-primary-700 mb-2">Ukuran S</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Baju</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Baju: 64 cm</li>
                    <li>Pundak: 40 cm</li>
                    <li>Pjg Tangan: 21 cm</li>
                    <li>Lbr Ujung Tangan: 15 cm</li>
                    <li>Lbr Badan: 48x2 cm</li>
                    <li>Kerah: 41 cm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Celana</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Celana: 81 cm</li>
                    <li>Pinggang: 38x2 cm</li>
                    <li>Lebar Paha: 30x2 cm</li>
                    <li>Lbr Bawah Celana: 18x2 cm</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* M */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-primary-700 mb-2">Ukuran M</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Baju</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Baju: 65 cm</li>
                    <li>Pundak: 42 cm</li>
                    <li>Pjg Tangan: 23.5 cm</li>
                    <li>Lbr Ujung Tangan: 17 cm</li>
                    <li>Lbr Badan: 50x2 cm</li>
                    <li>Kerah: 42 cm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Celana</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Celana: 83 cm</li>
                    <li>Pinggang: 40x2 cm</li>
                    <li>Lebar Paha: 31x2 cm</li>
                    <li>Lbr Bawah Celana: 19x2 cm</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* L */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-primary-700 mb-2">Ukuran L</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Baju</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Baju: 67 cm</li>
                    <li>Pundak: 44 cm</li>
                    <li>Pjg Tangan: 23.5 cm</li>
                    <li>Lbr Ujung Tangan: 17 cm</li>
                    <li>Lbr Badan: 52x2 cm</li>
                    <li>Kerah: 44 cm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Celana</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Celana: 85 cm</li>
                    <li>Pinggang: 42x2 cm</li>
                    <li>Lebar Paha: 32x2 cm</li>
                    <li>Lbr Bawah Celana: 20x2 cm</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* XL */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-primary-700 mb-2">Ukuran XL</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Baju</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Baju: 69 cm</li>
                    <li>Pundak: 46 cm</li>
                    <li>Pjg Tangan: 24 cm</li>
                    <li>Lbr Ujung Tangan: 17.5 cm</li>
                    <li>Lbr Badan: 56x2 cm</li>
                    <li>Kerah: 46 cm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Celana</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Celana: 90 cm</li>
                    <li>Pinggang: 44x2 cm</li>
                    <li>Lebar Paha: 34x2 cm</li>
                    <li>Lbr Bawah Celana: 22x2 cm (44 cm)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* XXL */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-primary-700 mb-2">Ukuran XXL</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Baju</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Baju: 71 cm</li>
                    <li>Pundak: 46 cm</li>
                    <li>Pjg Tangan: 24.5 cm</li>
                    <li>Lbr Ujung Tangan: 18 cm</li>
                    <li>Lbr Badan: 58x2 cm</li>
                    <li>Kerah: 46 cm</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1 text-ink-900 border-b pb-1">Celana</p>
                  <ul className="space-y-0.5 text-ink-600">
                    <li>Tinggi Celana: 95 cm</li>
                    <li>Pinggang: 46x2 cm</li>
                    <li>Lebar Paha: 36x2 cm</li>
                    <li>Lbr Bawah Celana: 24x2 cm (44 cm)</li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
