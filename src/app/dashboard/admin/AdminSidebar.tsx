"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileCheck,
    CreditCard,
    Calendar,
    Trophy,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Shield,
    FileText,
    Search,
    Bell,
    PanelLeft,
    BarChart,
    ClipboardEdit,
    UserCog
} from "lucide-react";
import Link from "next/link";
import { getMenuItemsForRole, UserRole, ROLE_LABELS } from "@/lib/access-control";

// Map icon strings to components
const ICON_MAP: Record<string, any> = {
    LayoutDashboard,
    Users,
    FileCheck,
    CreditCard,
    Calendar,
    Trophy,
    Settings,
    FileText,
    BarChart,
    ClipboardEdit,
    UserCog
};

import { BRANDING } from "@/config/branding";

interface AdminSidebarProps {
    children: React.ReactNode;
    userRole: UserRole | null;
    adminName: string;
    userId?: string;
    availableRoles?: string[];
}

export default function AdminSidebar({ children, userRole, adminName, userId, availableRoles }: AdminSidebarProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const rawMenuItems = userRole ? getMenuItemsForRole(userRole) : [];

    const menuItems = rawMenuItems.map(item => ({
        ...item,
        icon: ICON_MAP[item.icon] || LayoutDashboard, // Fallback icon
        active: pathname === item.href
    }));

    const NavLink = ({ item }: { item: (typeof menuItems)[0] }) => {
        return (
            <Link
                href={item.href}
                className={`nav-link group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${item.active
                    ? "active bg-white text-brand-blue-700 shadow-clay-sm border border-brand-blue-100"
                    : "text-ink-500 hover:bg-brand-yellow-50 hover:text-ink-900"
                    }`}
            >
                <item.icon className={`w-5 h-5 transition-colors ${item.active ? 'text-brand-blue-600' : 'text-ink-400 group-hover:text-ink-600'}`} />
                <span className="flex-1 font-bold text-sm tracking-tight">{item.name}</span>
                {item.active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue-600" />
                )}
            </Link>
        );
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        try {
            const res = await fetch("/api/auth/select-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_id: userId, chosen_role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = data.redirectTo;
            } else {
                alert(data.error || "Gagal berpindah role");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem");
        }
    };

    return (
        <div className="min-h-screen font-sans bg-brand-yellow-50/30">
            {/* Mobile Header (Glass) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-ink-600 hover:bg-brand-yellow-100"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <span className="font-bold text-ink-900">{BRANDING.dashboardTitle}</span>

                <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-blue-700 to-brand-blue-900 flex items-center justify-center text-white text-xs font-black shadow-md border border-brand-yellow-100">
                    {adminName.charAt(0)}
                </div>
            </div>

            <div className="flex items-start">
                {/* Desktop Sidebar (Glass Panel) */}
                <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-50">
                    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-clay-lg">
                        {/* Brand Area */}
                        <div className="px-6 py-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 flex items-center justify-center text-white shadow-xl shadow-brand-blue-900/20 ring-4 ring-brand-yellow-50/50">
                                    <Shield className="w-5 h-5 text-brand-yellow-100" />
                                </div>
                                <div>
                                    <h1 className="font-black text-lg text-brand-blue-950 leading-tight">Panel <span className="text-brand-blue-700">Admin</span></h1>
                                    <p className="text-[10px] text-ink-400 font-bold tracking-widest uppercase mt-0.5">{BRANDING.schoolShortName} PPDB</p>
                                </div>
                            </div>

                            {/* Search Bar - Aesthetic Only */}
                            <div className="relative group">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400 group-focus-within:text-brand-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari menu..."
                                    className="w-full bg-brand-yellow-50 border-0 rounded-xl pl-9 pr-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:ring-2 focus:ring-brand-blue-600/10 focus:bg-white transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide py-2">
                            <p className="px-4 text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</p>
                            {menuItems.map((item) => (
                                <NavLink key={item.name} item={item} />
                            ))}
                        </nav>

                        {/* User Profile / Footer */}
                        <div className="p-4 border-t border-ink-100/50 bg-white/50 backdrop-blur-sm">
                            {availableRoles && availableRoles.length > 1 && (
                                <div className="mb-3 px-2">
                                    <label className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1 shadow-xs block">Switch Role</label>
                                    <select
                                        value={userRole || ""}
                                        onChange={handleRoleSwitch}
                                        className="w-full bg-brand-yellow-100 border-none text-xs text-brand-blue-900 font-black rounded-lg py-1.5 focus:ring-2 focus:ring-brand-blue-600/20 cursor-pointer"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white transition-all cursor-pointer group hover:shadow-clay-sm border border-transparent hover:border-brand-yellow-100">
                                <div className="w-10 h-10 rounded-full bg-brand-yellow-100 flex items-center justify-center text-brand-blue-900 font-black group-hover:bg-brand-blue-50 group-hover:text-brand-blue-700 transition-colors border border-brand-yellow-200">
                                    {adminName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-ink-900 truncate">{adminName}</p>
                                    <p className="text-xs text-ink-500 truncate capitalize">
                                        {userRole ? ROLE_LABELS[userRole] : ""}
                                    </p>
                                </div>
                                <button onClick={handleLogout} className="p-2 text-ink-400 hover:text-red-600 transition-colors" title="Logout">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                    <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-6 flex items-center justify-between border-b border-brand-yellow-100">
                                <span className="font-black text-xl text-brand-blue-950 tracking-tight">Menu Admin</span>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-brand-yellow-100 rounded-full text-brand-blue-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {menuItems.map((item) => (
                                    <div key={item.name} onClick={() => setSidebarOpen(false)}>
                                        <NavLink item={item} />
                                    </div>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-brand-yellow-100">
                                {availableRoles && availableRoles.length > 1 && (
                                    <div className="mb-4">
                                        <label className="text-[10px] font-black text-ink-400 mb-2 block uppercase tracking-widest">Switch Role</label>
                                        <select
                                            value={userRole || ""}
                                            onChange={handleRoleSwitch}
                                            className="w-full bg-brand-yellow-50 border border-brand-yellow-200 text-sm text-brand-blue-900 font-black rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-blue-600/20"
                                        >
                                            {availableRoles.map(role => (
                                                <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button onClick={handleLogout} className="w-full btn-secondary text-red-600 bg-red-50 border-red-100 hover:bg-red-100 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" /> Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 lg:pl-72 min-w-0 transition-all duration-300">
                    {/* Desktop Topbar - Floating Glass */}
                    <header className="hidden lg:flex sticky top-4 z-30 mx-8 mt-4 rounded-2xl glass px-6 py-3 items-center justify-between shadow-clay-sm border border-white/40">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { }} className="text-ink-400 hover:text-ink-600"><PanelLeft className="w-5 h-5" /></button>
                            <div className="h-4 w-px bg-ink-200" />
                            <div className="flex items-center gap-2 text-sm text-ink-500">
                                <Home className="w-4 h-4" />
                                <span className="opacity-50">/</span>
                                <span className="font-medium text-ink-900">Dashboard</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-ink-400 hover:text-brand-blue-700 hover:bg-brand-blue-50 rounded-full transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-ink-100">
                                <Link href="/" className="text-sm font-black text-brand-blue-700 hover:underline">Lihat Website</Link>
                            </div>
                        </div>
                    </header>

                    {/* Content Wrapper */}
                    <div className="pt-16 lg:pt-0 p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
