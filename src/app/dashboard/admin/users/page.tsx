"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    XCircle,
    ShieldAlert,
    Mail,
    SearchX,
    Key
} from "lucide-react";
import Swal from "sweetalert2";
import { ROLE_LABELS, UserRole } from "@/lib/access-control";

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    secondary_roles?: string[];
    phone?: string;
    created_at: string;
}

const ROLE_OPTIONS = [
    { value: "tim_it", label: "Tim IT" },
    { value: "admin_super", label: "Admin Super" },
    { value: "admin_berkas", label: "Admin Berkas" },
    { value: "admin_keuangan", label: "Admin Keuangan" },
    { value: "penguji", label: "Penguji Al-Qur'an" },
    { value: "pewawancara_calsan", label: "Pewawancara Calsan" },
    { value: "pewawancara_cawalsan", label: "Pewawancara Cawalsan" },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const generateMagicLink = async (user: AdminUser) => {
        try {
            const response = await fetch(`/api/admin/users/magic-link`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    title: 'Magic Link Akses Cepat',
                    html: `<p class="text-sm text-stone-500 mb-4">Bagikan link ini ke penguji/admin terkait untuk login tanpa password (hanya butuh 4 digit terakhir nomor HP)</p><input type="text" value="${data.link}" class="w-full p-3 border-2 border-brand-blue-100 rounded-xl bg-stone-50 font-bold focus:outline-none focus:border-brand-blue-500" readonly onclick="this.select()" />`,
                    icon: 'success',
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: '#1e3a8a'
                });
            } else {
                Swal.fire('Gagal!', data.error || 'Gagal membuat magic link', 'error');
            }
        } catch (e: any) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    const [formData, setFormData] = useState({
        id: "",
        email: "",
        password: "",
        full_name: "",
        role: "admin_berkas",
        secondary_roles: [] as string[],
        phone: "",
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/users");
            if (response.ok) {
                const result = await response.json();
                setUsers(result.data || []);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const resetForm = () => {
        setFormData({ id: "", email: "", password: "", full_name: "", role: "admin_berkas", secondary_roles: [], phone: "" });
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch("/api/admin/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setMessage({ type: "success", text: "User saved successfully" });
                setIsModalOpen(false);
                fetchUsers();
            } else {
                const res = await response.json();
                setMessage({ type: "error", text: res.error || "Failed to save" });
            }
        } catch (err) { setMessage({ type: "error", text: "An error occurred" }); }
    };

    const handleDelete = async (id: string, name: string) => {
        Swal.fire({
            title: 'Hapus Akses?',
            text: `Akses untuk ${name} akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
                    if (response.ok) {
                        Swal.fire('Terhapus!', 'Sistem akses user berhasil dicabut.', 'success');
                        fetchUsers();
                    } else {
                        const res = await response.json();
                        Swal.fire('Gagal!', res.error || 'Gagal menghapus user', 'error');
                    }
                } catch (e: any) {
                    Swal.fire('Error', e.message, 'error');
                }
            }
        });
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && users.length === 0) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-blue-600" /></div>;

    return (
        <div className="space-y-10 pb-16 animate-in fade-in duration-700">
            {/* IT Banner */}
            <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 text-white p-10 md:p-14 shadow-2xl app-card border border-brand-blue-600">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 text-brand-yellow-300">
                            <ShieldAlert className="w-10 h-10" />
                        </div>
                        <div>
                            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Control Console</span>
                            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mt-2 italic shadow-sm text-white">IT Management</h1>
                        </div>
                    </div>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 px-10 py-5 rounded-3xl font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                        <Plus className="w-6 h-6" /> Add System User
                    </button>
                </div>
            </div>

            {/* User List Dashboard */}
            <div className="bg-white rounded-4xl border border-brand-yellow-100 shadow-sm overflow-hidden app-card">
                <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-brand-yellow-50/10">
                    <div className="relative w-full md:w-[28rem]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                        <input type="text" placeholder="Search system users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-white border-2 border-brand-yellow-100 rounded-[2.5rem] focus:outline-none focus:border-brand-blue-500 font-bold shadow-sm placeholder:text-stone-300" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 px-4 py-2 rounded-full">Total: {users.length} Database entries</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50/50 text-[10px] font-black uppercase tracking-widest text-stone-500 border-b border-stone-50">
                            <tr>
                                <th className="p-8">Identitas Akun</th>
                                <th className="p-8 text-center">Akses Sistem</th>
                                <th className="p-8 text-right">Manajemen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-20 text-center opacity-30">
                                        <SearchX className="w-16 h-16 mx-auto mb-6" />
                                        <p className="font-bold text-xl">User tidak terdaftar</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-brand-yellow-50/30 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                               <div className="w-12 h-12 rounded-2xl bg-brand-blue-100 flex items-center justify-center text-brand-blue-700 font-black text-xs border-2 border-white shadow-sm">{user.full_name.charAt(0)}</div>
                                               <div>
                                                  <p className="font-black text-ink-950 text-base leading-tight mb-1">{user.full_name}</p>
                                                  <div className="flex items-center gap-2 text-xs text-ink-400 font-bold"><Mail className="w-3" /> {user.email}</div>
                                               </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <span className="px-4 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-[10px] font-black rounded-xl border border-brand-blue-100 uppercase tracking-widest shadow-sm">
                                                    {user.role}
                                                </span>
                                                {user.secondary_roles && user.secondary_roles.filter(r => r !== user.role).map((r, i) => (
                                                    <span key={i} className="px-4 py-1.5 bg-stone-100 text-stone-600 text-[10px] font-black rounded-xl border border-stone-200 uppercase tracking-widest shadow-sm">
                                                        {ROLE_LABELS[r as UserRole] || r.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <button onClick={() => generateMagicLink(user)} title="Buat Magic Link Login" className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                    <Key className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => { setFormData({ id: user.id, email: user.email, password: "", full_name: user.full_name, role: user.role, secondary_roles: user.secondary_roles || [], phone: user.phone || "" }); setIsEditing(true); setIsModalOpen(true); }} className="p-4 bg-brand-blue-50 text-brand-blue-600 rounded-2xl hover:bg-brand-blue-600 hover:text-white transition-all shadow-sm">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id, user.full_name)} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-blue-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                        <div className="p-12 border-b flex justify-between items-center bg-stone-50/50">
                            <div>
                               <h3 className="text-3xl font-black text-ink-950 font-display italic tracking-tight uppercase leading-none mb-1">{isEditing ? "Configure" : "Initialize"} Account</h3>
                               <p className="text-ink-400 font-bold text-sm tracking-wide">Pengaturan aksesibilitas user dashboard.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-rose-600 transition-colors p-2 bg-stone-100 rounded-full hover:bg-rose-50"><XCircle className="w-10 h-10" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">Nama Lengkap Personal</label>
                                    <input required type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-brand-blue-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">Database Identifier (Email)</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-brand-blue-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">Authority Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-8 py-5 bg-brand-blue-50 border-2 border-brand-blue-100 text-brand-blue-900 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer">
                                        {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">Access Key (Password)</label>
                                    <input required={!isEditing} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-brand-blue-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all" placeholder={isEditing ? "(Kosongkan jika tidak ubah)" : "••••••••"} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">Secondary Roles (Multi-Role)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {ROLE_OPTIONS.map(o => (
                                            <label key={o.value} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${formData.secondary_roles.includes(o.value) ? 'bg-brand-blue-50 border-brand-blue-200 text-brand-blue-800' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'} ${formData.role === o.value ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-brand-blue-600 focus:ring-brand-blue-500 hidden"
                                                    checked={formData.secondary_roles.includes(o.value)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, secondary_roles: [...formData.secondary_roles, o.value] });
                                                        } else {
                                                            setFormData({ ...formData, secondary_roles: formData.secondary_roles.filter(r => r !== o.value) });
                                                        }
                                                    }}
                                                    disabled={formData.role === o.value}
                                                />
                                                <div className={`w-4 h-4 rounded border flex flex-shrink-0 items-center justify-center ${formData.secondary_roles.includes(o.value) ? 'bg-brand-blue-600 border-brand-blue-600 text-white' : 'bg-white border-stone-300'}`}>
                                                    {formData.secondary_roles.includes(o.value) && (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                </div>
                                                <span className="font-bold text-xs">{o.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <button type="submit" className="w-full py-6 bg-brand-blue-950 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl hover:bg-brand-blue-800 hover:scale-[1.02] active:scale-95 transition-all shadow-brand-blue-900/30">
                                    {isEditing ? "Synchronize Updates" : "Commit New User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
