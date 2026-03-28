"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface WilayahItem {
  id: string;
  name: string;
}

interface AddressData {
  alamat_lengkap: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
}

interface AddressInputProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function AddressInput({
  value,
  onChange,
  disabled = false,
  required = false,
}: AddressInputProps) {
  // Wilayah data
  const [provinsiList, setProvinsiList] = useState<WilayahItem[]>([]);
  const [kabupatenList, setKabupatenList] = useState<WilayahItem[]>([]);
  const [kecamatanList, setKecamatanList] = useState<WilayahItem[]>([]);
  const [kelurahanList, setKelurahanList] = useState<WilayahItem[]>([]);

  // Selected IDs for cascading
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<string>("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState<string>("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<string>("");

  // Loading states
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKabupaten, setLoadingKabupaten] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingKelurahan, setLoadingKelurahan] = useState(false);

  // Fetch provinsi on mount
  useEffect(() => {
    const fetchProvinsi = async () => {
      setLoadingProvinsi(true);
      try {
        const res = await fetch("/api/wilayah/provinsi");
        const result = await res.json();
        if (result.success) {
          setProvinsiList(result.data);
        }
      } catch (error) {
        console.error("Error fetching provinsi:", error);
      } finally {
        setLoadingProvinsi(false);
      }
    };
    fetchProvinsi();
  }, []);

  // Fetch kabupaten when provinsi changes
  useEffect(() => {
    if (!selectedProvinsiId) {
      setKabupatenList([]);
      return;
    }

    const fetchKabupaten = async () => {
      setLoadingKabupaten(true);
      try {
        const res = await fetch(`/api/wilayah/kabupaten?provinsi_id=${selectedProvinsiId}`);
        const result = await res.json();
        if (result.success) {
          setKabupatenList(result.data);
        }
      } catch (error) {
        console.error("Error fetching kabupaten:", error);
      } finally {
        setLoadingKabupaten(false);
      }
    };
    fetchKabupaten();
  }, [selectedProvinsiId]);

  // Fetch kecamatan when kabupaten changes
  useEffect(() => {
    if (!selectedKabupatenId) {
      setKecamatanList([]);
      return;
    }

    const fetchKecamatan = async () => {
      setLoadingKecamatan(true);
      try {
        const res = await fetch(`/api/wilayah/kecamatan?kabupaten_id=${selectedKabupatenId}`);
        const result = await res.json();
        if (result.success) {
          setKecamatanList(result.data);
        }
      } catch (error) {
        console.error("Error fetching kecamatan:", error);
      } finally {
        setLoadingKecamatan(false);
      }
    };
    fetchKecamatan();
  }, [selectedKabupatenId]);

  // Fetch kelurahan when kecamatan changes
  useEffect(() => {
    if (!selectedKecamatanId) {
      setKelurahanList([]);
      return;
    }

    const fetchKelurahan = async () => {
      setLoadingKelurahan(true);
      try {
        const res = await fetch(`/api/wilayah/kelurahan?kecamatan_id=${selectedKecamatanId}`);
        const result = await res.json();
        if (result.success) {
          setKelurahanList(result.data);
        }
      } catch (error) {
        console.error("Error fetching kelurahan:", error);
      } finally {
        setLoadingKelurahan(false);
      }
    };
    fetchKelurahan();
  }, [selectedKecamatanId]);

  const handleChange = useCallback(
    (field: keyof AddressData, fieldValue: string) => {
      onChange({ ...value, [field]: fieldValue });
    },
    [onChange, value]
  );

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = provinsiList.find((p) => p.id === id);
    setSelectedProvinsiId(id);
    setSelectedKabupatenId("");
    setSelectedKecamatanId("");
    setKabupatenList([]);
    setKecamatanList([]);
    setKelurahanList([]);
    onChange({
      ...value,
      provinsi: selected?.name || "",
      kabupaten: "",
      kecamatan: "",
      kelurahan: "",
    });
  };

  const handleKabupatenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = kabupatenList.find((k) => k.id === id);
    setSelectedKabupatenId(id);
    setSelectedKecamatanId("");
    setKecamatanList([]);
    setKelurahanList([]);
    onChange({
      ...value,
      kabupaten: selected?.name || "",
      kecamatan: "",
      kelurahan: "",
    });
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = kecamatanList.find((k) => k.id === id);
    setSelectedKecamatanId(id);
    setKelurahanList([]);
    onChange({
      ...value,
      kecamatan: selected?.name || "",
      kelurahan: "",
    });
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = kelurahanList.find((k) => k.id === id);
    onChange({
      ...value,
      kelurahan: selected?.name || "",
    });
  };

  const inputClass =
    "w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500";

  const selectClass =
    "w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500";

  return (
    <div className="space-y-4">
      {/* Alamat Lengkap */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Alamat Lengkap
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={value.alamat_lengkap}
          onChange={(e) => handleChange("alamat_lengkap", e.target.value)}
          placeholder="Jalan, nomor rumah, nama perumahan/kampung"
          disabled={disabled}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* RT & RW */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">RT</label>
          <input
            type="text"
            value={value.rt}
            onChange={(e) => handleChange("rt", e.target.value)}
            placeholder="001"
            disabled={disabled}
            maxLength={3}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">RW</label>
          <input
            type="text"
            value={value.rw}
            onChange={(e) => handleChange("rw", e.target.value)}
            placeholder="002"
            disabled={disabled}
            maxLength={3}
            className={inputClass}
          />
        </div>
      </div>

      {/* Provinsi */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Provinsi
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedProvinsiId}
            onChange={handleProvinsiChange}
            disabled={disabled || loadingProvinsi}
            className={selectClass}
          >
            <option value="" disabled={selectedProvinsiId !== ""}>
              {loadingProvinsi ? "Memuat..." : "Pilih Provinsi"}
            </option>
            {provinsiList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {loadingProvinsi && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-teal-600" />
          )}
        </div>
      </div>

      {/* Kabupaten/Kota */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Kabupaten/Kota
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedKabupatenId}
            onChange={handleKabupatenChange}
            disabled={disabled || !selectedProvinsiId || loadingKabupaten}
            className={selectClass}
          >
            <option value="" disabled={selectedKabupatenId !== ""}>
              {loadingKabupaten
                ? "Memuat..."
                : !selectedProvinsiId
                ? "Pilih provinsi terlebih dahulu"
                : "Pilih Kabupaten/Kota"}
            </option>
            {kabupatenList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          {loadingKabupaten && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-teal-600" />
          )}
        </div>
      </div>

      {/* Kecamatan */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Kecamatan
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedKecamatanId}
            onChange={handleKecamatanChange}
            disabled={disabled || !selectedKabupatenId || loadingKecamatan}
            className={selectClass}
          >
            <option value="" disabled={selectedKecamatanId !== ""}>
              {loadingKecamatan
                ? "Memuat..."
                : !selectedKabupatenId
                ? "Pilih kabupaten/kota terlebih dahulu"
                : "Pilih Kecamatan"}
            </option>
            {kecamatanList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          {loadingKecamatan && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-teal-600" />
          )}
        </div>
      </div>

      {/* Kelurahan/Desa */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Kelurahan/Desa
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            value={kelurahanList.find((k) => k.name === value.kelurahan)?.id || ""}
            onChange={handleKelurahanChange}
            disabled={disabled || !selectedKecamatanId || loadingKelurahan}
            className={selectClass}
          >
            <option value="" disabled={value.kelurahan !== ""}>
              {loadingKelurahan
                ? "Memuat..."
                : !selectedKecamatanId
                ? "Pilih kecamatan terlebih dahulu"
                : "Pilih Kelurahan/Desa"}
            </option>
            {kelurahanList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
          {loadingKelurahan && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-teal-600" />
          )}
        </div>
      </div>

      {/* Kode Pos */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Kode Pos</label>
        <input
          type="text"
          value={value.kode_pos}
          onChange={(e) => handleChange("kode_pos", e.target.value)}
          placeholder="12345"
          disabled={disabled}
          maxLength={5}
          className={inputClass}
        />
      </div>
    </div>
  );
}
