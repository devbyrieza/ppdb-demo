"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Lock,
    Loader2,
    CheckCircle,
    XCircle,
    ShieldAlert,
    Mail,
    User,
    MoreHorizontal,
    RefreshCw,
    Link as LinkIcon,
} from "lucide-react";

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    secondary_roles?: string[];
    created_at: string;
}

// Role display names
const ROLE_OPTIONS = [
    { value: "tim_it", label: "Tim IT" },
    { value: "admin_super", label: "Admin Super" },
    { value: "admin_berkas", label: "Admin Berkas" },
    { value: "admin_keuangan", label: "Admin Keuangan" },
    { value: "penguji_calsan", label: "Penguji" },
    { value: "pewawancara_calsan", label: "Pewawancara Calsan" },
    { value: "pewawancara_cawalsan", label: "Pewawancara Cawalsan" },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        id: "",
        email: "",
        password: "",
        full_name: "",
        role: "admin_berkas",
        secondary_roles: [] as string[],
    });
    const [isEditing, setIsEditing] = useState(false);

    // Fetch Users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const result = await response.json();
                setUsers(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setMessage(null);

        try {
            const url = "/api/admin/users";
            const method = isEditing ? "PUT" : "POST";

            const body: any = {
                email: formData.email,
                full_name: formData.full_name,
                role: formData.role,
                secondary_roles: formData.secondary_roles,
            };

            if (isEditing) {
                body.id = formData.id;
                // Only send password if it's filled
                if (formData.password) body.password = formData.password;
            } else {
                body.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: isEditing ? "User berhasil diupdate" : "User berhasil dibuat" });
                setIsModalOpen(false);
                fetchUsers();
                resetForm();
            } else {
                throw new Error(result.error || "Gagal menyimpan user");
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus user "${nama}"?`)) return;

        try {
            const response = await fetch(`/api/admin/users?id=${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setMessage({ type: "success", text: "User berhasil dihapus" });
                fetchUsers();
            } else {
                const result = await response.json();
                throw new Error(result.error || "Gagal menghapus user");
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const handleGenerateMagicLink = async (id: string, nama: string) => {
        try {
            const response = await fetch("/api/admin/users/magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id }),
            });

            if (response.ok) {
                const result = await response.json();
                await navigator.clipboard.writeText(result.link);
                setMessage({ type: "success", text: `Magic Link untuk ${nama} berhasil disalin ke clipboard!` });
            } else {
                const result = await response.json();
                throw new Error(result.error || "Gagal membuat magic link");
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const openAddModal = () => {
        resetForm();
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUser) => {
        setFormData({
            id: user.id,
            email: user.email,
            password: "", // Password always empty initially
            full_name: user.full_name,
            role: user.role,
            secondary_roles: user.secondary_roles || [],
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            id: "",
            email: "",
            password: "",
            full_name: "",
            role: "admin_berkas",
            secondary_roles: [],
        });
    };

    const toggleSecondaryRole = (role: string) => {
        setFormData((prev) => {
            if (prev.secondary_roles.includes(role)) {
                return { ...prev, secondary_roles: prev.secondary_roles.filter(r => r !== role) };
            } else {
                return { ...prev, secondary_roles: [...prev.secondary_roles, role] };
            }
        });
    };

    const filteredUsers = users.filter(
        (u) =>
            (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-stone-900">Manajemen User</h2>
                            <p className="text-stone-600">Kelola akun admin dan staff</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah User
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-xl border-2 flex items-center justify-between ${message.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-indigo-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">Nama & Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">Role Utama</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">Peran Tambahan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">Tanggal Dibuat</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Memuat data user...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                        Tidak ada user ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-stone-900">{user.full_name || "Tanpa Nama"}</p>
                                                <div className="flex items-center gap-1.5 text-sm text-stone-500">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin_super' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                user.role === 'admin_keuangan' ? 'bg-maroon-100 text-maroon-800 border border-maroon-200' :
                                                    user.role === 'admin_berkas' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        user.role === 'penguji_calsan' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                            user.role === 'pewawancara_calsan' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                                user.role === 'pewawancara_cawalsan' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                                    user.role === 'penguji_umum' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                                        'bg-stone-100 text-stone-700'
                                                }`}>
                                                {ROLE_OPTIONS.find(r => r.value === user.role)?.label || user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex flex-wrap gap-2">
                                                {user.secondary_roles && user.secondary_roles.length > 0 ? (
                                                    user.secondary_roles.map(role => (
                                                        <span key={role} className="min-w-fit px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                                            {ROLE_OPTIONS.find(r => r.value === role)?.label || role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-stone-400 italic">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            {new Date(user.created_at).toLocaleDateString("id-ID", {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Magic Link Generator ONLY for examiners */}
                                                {['penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan', 'penguji_umum'].some(r => user.role === r || user.secondary_roles?.includes(r)) && (
                                                    <button
                                                        onClick={() => handleGenerateMagicLink(user.id, user.full_name)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Copy Magic Link"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.full_name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-stone-900">
                                {isEditing ? "Edit User & Akses Multi-Role" : "Tambah User Baru"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-stone-400 hover:text-stone-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                                        placeholder="Nama Lengkap"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none disabled:bg-stone-100 disabled:text-stone-500"
                                        placeholder="email@sekolah.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-100">
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Role Utama (Primary Access)
                                </label>
                                <div className="relative">
                                    <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 bg-indigo-50 text-indigo-900 font-medium rounded-xl focus:border-indigo-500 focus:outline-none appearance-none"
                                    >
                                        {ROLE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                                <label className="block text-sm font-bold text-stone-700 mb-3">
                                    Peran Tambahan (Optional / Multi-Role)
                                </label>
                                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                                    Centang peran di bawah ini jika user juga bertanggung jawab atas tugas lain. Saat login, user akan diminta untuk memilih dashboard mana yang ingin diakses.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                    {ROLE_OPTIONS
                                        .filter(opt => opt.value !== formData.role) // Don't show primary role in secondary list
                                        .map((opt) => (
                                            <label key={opt.value} className="flex items-start gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors group">
                                                <div className="relative flex items-center pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.secondary_roles.includes(opt.value)}
                                                        onChange={() => toggleSecondaryRole(opt.value)}
                                                        className="w-5 h-5 border-2 border-stone-300 rounded text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-stone-700 group-hover:text-indigo-900 leading-tight">
                                                    {opt.label}
                                                </span>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-100">
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Password {isEditing && <span className="text-xs font-normal text-stone-500">(Kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="password"
                                        required={!isEditing}
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                                        placeholder={isEditing ? "••••••••" : "Massukan password"}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3 sticky bottom-0 bg-white shadow-[0_-15px_15px_-15px_rgba(0,0,0,0.1)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan User"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
