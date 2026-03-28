"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface WilayahData {
    id: string;
    name: string;
}

interface AddressValue {
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kode_pos: string;
}

interface WilayahSelectorProps {
    value: AddressValue;
    onChange: (value: AddressValue) => void;
    disabled?: boolean;
}

export default function WilayahSelector({
    value,
    onChange,
    disabled = false,
}: WilayahSelectorProps) {
    const [provinces, setProvinces] = useState<WilayahData[]>([]);
    const [regencies, setRegencies] = useState<WilayahData[]>([]);
    const [districts, setDistricts] = useState<WilayahData[]>([]);
    const [villages, setVillages] = useState<WilayahData[]>([]);

    const [loading, setLoading] = useState({
        provinsi: false,
        kabupaten: false,
        kecamatan: false,
        kelurahan: false,
    });

    // Fetch Provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading((prev) => ({ ...prev, provinsi: true }));
                const res = await fetch("/api/wilayah/provinsi");
                const data = await res.json();
                if (data.success) {
                    setProvinces(data.data);
                }
            } catch (error) {
                console.error("Failed to load provinces", error);
            } finally {
                setLoading((prev) => ({ ...prev, provinsi: false }));
            }
        };

        fetchProvinces();
    }, []);

    // Fetch Regencies (Kabupaten) when Province changes
    useEffect(() => {
        if (!value.provinsi) {
            setRegencies([]);
            return;
        }

        // Find province ID
        const prov = provinces.find((p) => p.name === value.provinsi);
        if (!prov) return;

        const fetchRegencies = async () => {
            try {
                setLoading((prev) => ({ ...prev, kabupaten: true }));
                const res = await fetch(`/api/wilayah/kabupaten?provinsi_id=${prov.id}`);
                const data = await res.json();
                if (data.success) {
                    setRegencies(data.data);
                }
            } catch (error) {
                console.error("Failed to load regencies", error);
            } finally {
                setLoading((prev) => ({ ...prev, kabupaten: false }));
            }
        };

        fetchRegencies();
    }, [value.provinsi, provinces]);

    // Fetch Districts (Kecamatan) when Regency changes
    useEffect(() => {
        if (!value.kabupaten) {
            setDistricts([]);
            return;
        }

        const reg = regencies.find((r) => r.name === value.kabupaten);
        if (!reg) return;

        const fetchDistricts = async () => {
            try {
                setLoading((prev) => ({ ...prev, kecamatan: true }));
                const res = await fetch(`/api/wilayah/kecamatan?kabupaten_id=${reg.id}`);
                const data = await res.json();
                if (data.success) {
                    setDistricts(data.data);
                }
            } catch (error) {
                console.error("Failed to load districts", error);
            } finally {
                setLoading((prev) => ({ ...prev, kecamatan: false }));
            }
        };

        fetchDistricts();
    }, [value.kabupaten, regencies]);

    // Fetch Villages (Kelurahan) when District changes
    useEffect(() => {
        if (!value.kecamatan) {
            setVillages([]);
            return;
        }

        const dist = districts.find((d) => d.name === value.kecamatan);
        if (!dist) return;

        const fetchVillages = async () => {
            try {
                setLoading((prev) => ({ ...prev, kelurahan: true }));
                const res = await fetch(`/api/wilayah/kelurahan?kecamatan_id=${dist.id}`);
                const data = await res.json();
                if (data.success) {
                    setVillages(data.data);
                }
            } catch (error) {
                console.error("Failed to load villages", error);
            } finally {
                setLoading((prev) => ({ ...prev, kelurahan: false }));
            }
        };

        fetchVillages();
    }, [value.kecamatan, districts]);

    const handleChange = (field: keyof AddressValue, val: string) => {
        const newValue = { ...value, [field]: val };

        // Reset children on change
        if (field === "provinsi") {
            newValue.kabupaten = "";
            newValue.kecamatan = "";
            newValue.kelurahan = "";
            newValue.kode_pos = "";
        } else if (field === "kabupaten") {
            newValue.kecamatan = "";
            newValue.kelurahan = "";
            newValue.kode_pos = "";
        } else if (field === "kecamatan") {
            newValue.kelurahan = "";
            newValue.kode_pos = "";
        }

        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PROVINSI */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Provinsi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={value.provinsi}
                            onChange={(e) => handleChange("provinsi", e.target.value)}
                            disabled={disabled || loading.provinsi}
                            className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500 appearance-none cursor-pointer"
                        >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map((p) => (
                                <option key={p.id} value={p.name}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        {loading.provinsi && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* KABUPATEN */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Kabupaten/Kota <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={value.kabupaten}
                            onChange={(e) => handleChange("kabupaten", e.target.value)}
                            disabled={disabled || !value.provinsi || loading.kabupaten}
                            className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500 appearance-none cursor-pointer"
                        >
                            <option value="">Pilih Kabupaten/Kota</option>
                            {regencies.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        {loading.kabupaten && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* KECAMATAN */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={value.kecamatan}
                            onChange={(e) => handleChange("kecamatan", e.target.value)}
                            disabled={disabled || !value.kabupaten || loading.kecamatan}
                            className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500 appearance-none cursor-pointer"
                        >
                            <option value="">Pilih Kecamatan</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        {loading.kecamatan && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* KELURAHAN */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Kelurahan/Desa <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={value.kelurahan}
                            onChange={(e) => {
                                const selectedName = e.target.value;
                                handleChange("kelurahan", selectedName);
                            }}
                            disabled={disabled || !value.kecamatan || loading.kelurahan}
                            className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500 appearance-none cursor-pointer"
                        >
                            <option value="">Pilih Kelurahan/Desa</option>
                            {villages.map((v) => (
                                <option key={v.id} value={v.name}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        {loading.kelurahan && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            </div>
                        )}
                    </div>
                </div>

                {/* KODE POS */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                        Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="kode_pos"
                            value={value.kode_pos}
                            onChange={(e) => handleChange("kode_pos", e.target.value)}
                            placeholder="Contoh: 10110"
                            maxLength={5}
                            disabled={disabled}
                            className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors disabled:bg-stone-100 disabled:text-stone-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
