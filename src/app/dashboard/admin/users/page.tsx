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
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";
import { ActionDropdown } from "@/components/ui/ActionDropdown";
import { ROLE_LABELS, UserRole } from "@/lib/access-control";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  secondary_roles?: string[];
  phone?: string;
  jenis_kelamin?: string;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: "admin_super", label: "Admin Super" },
  { value: "admin_berkas", label: "Admin Berkas" },
  { value: "admin_keuangan", label: "Admin Keuangan" },
  { value: "penguji", label: "Penguji Al-Qur'an" },
  { value: "pewawancara_calsan", label: "Pewawancara Calsan" },
  { value: "pewawancara_cawalsan", label: "Pewawancara Cawalsan" },
  { value: "penguji_hafalan", label: "Penguji Hafalan Al-Qur'an" },
  { value: "penguji_bahasa_arab", label: "Penguji Lisan B. Arab" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const generateMagicLink = async (user: AdminUser) => {
    try {
      const response = await fetch(`/api/admin/users/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Magic Link Akses Cepat",
          html: `
            <div class="text-left font-sans">
              <p class="text-sm text-stone-500 mb-6 leading-relaxed">
                Bagikan link ini ke penguji/admin terkait untuk login tanpa password. <strong>PIN verifikasi (4 digit terakhir nomor WhatsApp)</strong> wajib dimasukkan saat link diakses.
              </p>
              
              <div class="mb-4">
                <label class="block text-[10px] font-black uppercase text-primary-600 mb-1.5 tracking-wider">
                  Link Singkat (Akses Cepat)
                </label>
                <input type="text" value="${data.shortLink}" class="w-full p-3 border-2 border-primary-100 rounded-xl bg-stone-50 font-bold focus:outline-none focus:border-primary-500 text-sm" readonly onclick="this.select()" />
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase text-stone-400 mb-1.5 tracking-wider">
                  Link Lengkap (Alternatif)
                </label>
                <input type="text" value="${data.link}" class="w-full p-3 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none text-xs text-stone-400" readonly onclick="this.select()" />
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Tutup",
          confirmButtonColor: "#1e3a8a",
        });
      } else {
        Swal.fire("Gagal!", data.error || "Gagal membuat magic link", "error");
      }
    } catch (e: any) {
      Swal.fire("Error", e.message, "error");
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
    jenis_kelamin: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      id: "",
      email: "",
      password: "",
      full_name: "",
      role: "admin_berkas",
      secondary_roles: [],
      phone: "",
      jenis_kelamin: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation: enforce phone number for examiners and interviewers
    const isExaminerOrInterviewer = 
      ["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(formData.role) ||
      formData.secondary_roles.some(role => ["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(role));

    if (isExaminerOrInterviewer && (!formData.phone || formData.phone === "-" || formData.phone.trim().length < 6)) {
      Swal.fire({
        title: "Gagal!",
        text: "Penguji/Pewawancara wajib memiliki nomor WhatsApp aktif untuk verifikasi PIN 4 digit terakhir.",
        icon: "error",
        confirmButtonColor: "#e11d48",
      });
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data user berhasil disimpan",
          confirmButtonColor: "#1e3a8a",
        });
        setIsModalOpen(false);
        fetchUsers();
      } else {
        let errorText = "Gagal menyimpan data user.";
        try {
          const res = await response.json();
          errorText = res.error || errorText;
        } catch (e) {
          if (response.status === 502 || response.status === 503) {
            errorText = "Sistem sedang diperbarui/restart. Silakan coba beberapa saat lagi.";
          }
        }
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: errorText,
          confirmButtonColor: "#e11d48",
        });
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        "Sistem sedang sibuk atau offline. Coba lagi nanti.",
        "error",
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: "Hapus Akses?",
      text: `Akses untuk ${name} akan dihapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/admin/users?id=${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            Swal.fire(
              "Terhapus!",
              "Sistem akses user berhasil dicabut.",
              "success",
            );
            fetchUsers();
          } else {
            const res = await response.json();
            Swal.fire("Gagal!", res.error || "Gagal menghapus user", "error");
          }
        } catch (e: any) {
          Swal.fire("Error", e.message, "error");
        }
      }
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && users.length === 0)
    return (
      <div className="p-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-600" />
      </div>
    );

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      {/* Admin Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-primary-700 to-primary-900 text-white p-6 md:p-10 md:p-14 shadow-2xl app-card border border-primary-600">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 text-secondary-300">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                Control Console
              </span>
              <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mt-2 italic shadow-sm text-white">
                Admin Management
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-secondary-400 hover:bg-secondary-300 text-primary-950 px-6 md:px-10 py-5 rounded-3xl font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" /> Add System User
          </button>
        </div>
      </div>

      {/* User List Dashboard */}
      <div className="bg-white rounded-4xl border border-secondary-100 shadow-sm overflow-hidden app-card">
        <div className="p-5 md:p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-secondary-50/10">
          <div className="relative w-full md:w-[28rem]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input
              type="text"
              placeholder="Search system users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border-2 border-secondary-100 rounded-[2.5rem] focus:outline-none focus:border-primary-500 font-bold shadow-sm placeholder:text-stone-300"
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 px-4 py-2 rounded-full">
            Total: {users.length} Database entries
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50/50 text-[10px] font-black uppercase tracking-widest text-stone-500 border-b border-stone-50">
              <tr>
                <th className="p-5 md:p-8">Identitas Akun</th>
                <th className="p-5 md:p-8 text-center">Akses Sistem</th>
                <th className="p-5 md:p-8 text-right">Manajemen</th>
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
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary-50/30 transition-colors group"
                  >
                    <td className="p-5 md:p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs border-2 border-white shadow-sm">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-ink-950 text-base leading-tight mb-1">
                            {user.full_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-ink-400 font-bold">
                            <Mail className="w-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 md:p-8 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-4 py-1.5 bg-primary-50 text-primary-700 text-[10px] font-black rounded-xl border border-primary-100 uppercase tracking-widest shadow-sm">
                          {ROLE_LABELS[user.role as UserRole] ||
                            user.role.replace("_", " ")}
                        </span>
                        {user.secondary_roles &&
                          user.secondary_roles
                            .filter((r) => r !== user.role)
                            .map((r, i) => (
                              <span
                                key={i}
                                className="px-4 py-1.5 bg-stone-100 text-stone-600 text-[10px] font-black rounded-xl border border-stone-200 uppercase tracking-widest shadow-sm"
                              >
                                {ROLE_LABELS[r as UserRole] ||
                                  r.replace("_", " ")}
                              </span>
                            ))}
                      </div>
                    </td>
                    <td className="p-5 md:p-8 text-right">
                      <div className="flex justify-end gap-3 transition-all duration-300">
                        <ActionDropdown 
                          items={[
                            {
                              label: "Buat Magic Link Login",
                              icon: <Key className="w-4 h-4" />,
                              onClick: () => generateMagicLink(user),
                            },
                            {
                              label: "Edit User",
                              icon: <Edit className="w-4 h-4" />,
                              onClick: () => {
                                setFormData({
                                  id: user.id,
                                  email: user.email,
                                  password: "",
                                  full_name: user.full_name,
                                  role: user.role,
                                  secondary_roles: user.secondary_roles || [],
                                  phone: user.phone || "",
                                  jenis_kelamin: user.jenis_kelamin || "",
                                });
                                setIsEditing(true);
                                setIsModalOpen(true);
                              },
                            },
                            {
                              label: "Hapus Akses",
                              icon: <Trash2 className="w-4 h-4" />,
                              onClick: () => handleDelete(user.id, user.full_name),
                              variant: "danger"
                            }
                          ]} 
                        />
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
        <div className="fixed inset-0 z-50 flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center p-6 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-6 md:p-12 border-b flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-3xl font-black text-ink-950 font-display italic tracking-tight uppercase leading-none mb-1">
                  {isEditing ? "Configure" : "Initialize"} Account
                </h3>
                <p className="text-ink-400 font-bold text-sm tracking-wide">
                  Pengaturan aksesibilitas user dashboard.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-rose-600 transition-colors p-2 bg-stone-100 rounded-full hover:bg-rose-50"
              >
                <XCircle className="w-10 h-10" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Nama Lengkap Personal
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-5 md:px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-primary-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Database Identifier (Email)
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-5 md:px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-primary-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Authority Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-5 md:px-8 py-5 bg-primary-50 border-2 border-primary-100 text-primary-900 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Access Key (Password)
                  </label>
                  <div className="relative group/pass">
                    <input
                      required={!isEditing}
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-5 md:px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-primary-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all pr-16"
                      placeholder={
                        isEditing ? "(Kosongkan jika tidak ubah)" : "••••••••"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-primary-600 transition-colors z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Nomor WhatsApp (untuk Magic Link)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-5 md:px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-primary-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jenis_kelamin || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis_kelamin: e.target.value })
                    }
                    className="w-full px-5 md:px-8 py-5 bg-stone-100/50 border-2 border-transparent focus:border-primary-600 focus:bg-white focus:outline-none font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-Laki (Ustadz)</option>
                    <option value="P">Perempuan (Ustadzah)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-3 tracking-widest">
                    Secondary Roles (Multi-Role)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {ROLE_OPTIONS.map((o) => (
                      <label
                        key={o.value}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${formData.secondary_roles.includes(o.value) ? "bg-primary-50 border-primary-200 text-primary-800" : "bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100"} ${formData.role === o.value ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 hidden"
                          checked={formData.secondary_roles.includes(o.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                secondary_roles: [
                                  ...formData.secondary_roles,
                                  o.value,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                secondary_roles:
                                  formData.secondary_roles.filter(
                                    (r) => r !== o.value,
                                  ),
                              });
                            }
                          }}
                          disabled={formData.role === o.value}
                        />
                        <div
                          className={`w-4 h-4 rounded border flex flex-shrink-0 items-center justify-center ${formData.secondary_roles.includes(o.value) ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-stone-300"}`}
                        >
                          {formData.secondary_roles.includes(o.value) && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-xs">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-10">
                <button
                  type="submit"
                  className="w-full py-6 bg-primary-950 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl hover:bg-primary-800 hover:scale-[1.02] active:scale-95 transition-all shadow-primary-900/30"
                >
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
