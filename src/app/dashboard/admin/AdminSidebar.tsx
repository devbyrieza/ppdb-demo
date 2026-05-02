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
    PanelLeft,
    FileText,
    Search,
    Bell,
    BarChart,
    ClipboardEdit,
    UserCog,
    Landmark,
    Map,
    Zap,
    UserCircle,
    Edit3,
    Activity,
    PieChart
} from "lucide-react";
import Link from "next/link";
import { getMenuItemsForRole, UserRole, ROLE_LABELS } from "@/lib/access-control";
import Swal from "sweetalert2";

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
    UserCog,
    Landmark,
    Map,
    Zap,
    UserCircle,
    Edit3,
    Activity,
    PieChart
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
                className={`nav-link group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${item.active
                    ? "active bg-white text-brand-blue-700 shadow-clay-sm border border-brand-blue-100"
                    : "text-ink-500 hover:bg-brand-yellow-50 hover:text-ink-900"
                    }`}
            >
                <item.icon className={`w-4 h-4 transition-colors ${item.active ? 'text-brand-blue-600' : 'text-ink-400 group-hover:text-ink-600'}`} />
                <span className="flex-1 font-bold text-[13px] tracking-tight">{item.name}</span>
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
                Swal.fire("Gagal Switch Role", data.error || "Gagal berpindah role", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Terjadi kesalahan sistem saat berpindah role", "error");
        }
    };

    return (
        <div className="min-h-screen font-sans bg-brand-yellow-50/30">
            {/* Mobile Header (Premium Glass) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm px-5 py-4 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2.5 -ml-2 rounded-2xl text-ink-600 hover:bg-brand-yellow-100 active:scale-95 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center">
                    <span className="font-black text-brand-blue-900 tracking-tight leading-none text-base">{BRANDING.schoolShortName}</span>
                    <span className="text-[9px] font-black text-brand-blue-600/60 uppercase tracking-widest mt-1">Admin Panel</span>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 flex items-center justify-center text-white text-sm font-black shadow-md border border-brand-yellow-100">
                    {adminName.charAt(0)}
                </div>
            </div>

            {/* Mobile Sidebar Overlay (Improved Accessibility) */}
            <div className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
                <div 
                    className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300" 
                    onClick={() => setSidebarOpen(false)} 
                />
                <aside className={`absolute top-0 left-0 bottom-0 w-80 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 flex items-center justify-between border-b border-ink-50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                                    <img src={BRANDING.logoPath} alt="Logo" className="w-full h-full object-contain p-1" />
                                </div>
                                <span className="font-black text-ink-900 uppercase tracking-tighter">Navigasi</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-ink-50 rounded-xl text-ink-400 hover:text-ink-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar">
                            {menuItems.map((item, idx) => {
                                const prevItem = menuItems[idx - 1];
                                const showGroupLabel = item.group && (!prevItem || prevItem.group !== item.group);
                                
                                return (
                                    <div key={item.name}>
                                        {showGroupLabel && (
                                            <p className="px-4 text-[9px] font-black text-ink-300 uppercase tracking-[0.2em] mb-2 mt-6 leading-none">
                                                {item.group}
                                            </p>
                                        )}
                                        <div onClick={() => setSidebarOpen(false)}>
                                            <NavLink item={item} />
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-ink-50 bg-ink-50/10">
                            {availableRoles && availableRoles.length > 1 && (
                                <div className="mb-3">
                                    <label className="text-[10px] font-black text-ink-400 mb-2 block uppercase tracking-widest">Switch Role</label>
                                    <select
                                        value={userRole || ""}
                                        onChange={handleRoleSwitch}
                                        className="w-full bg-ink-50 border border-ink-200 text-sm text-ink-900 font-black rounded-xl py-2 px-3 focus:ring-2 focus:ring-brand-blue-600/20"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-red-600 font-black text-sm hover:bg-red-50 transition-all border border-transparent hover:border-red-100 active:scale-95">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Desktop Layout Wrapper */}
            <div className="flex items-start">
                {/* Desktop Sidebar (Glass Panel) */}
                <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-50">
                    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-clay-lg">
                        {/* Brand Area */}
                        <div className="px-6 py-8 pb-4">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-brand-blue-900/10 ring-4 ring-brand-yellow-50/50 overflow-hidden">
                                    <img src={BRANDING.logoPath} alt="Logo" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <h2 className="font-black text-lg text-brand-blue-950 leading-tight">Panel <span className="text-brand-blue-700">Admin</span></h2>
                                    <p className="text-[10px] text-ink-400 font-bold tracking-widest uppercase mt-0.5">{BRANDING.schoolShortName} PPDB</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 space-y-0.5 scrollbar-hide py-2">
                            {menuItems.map((item, idx) => {
                                const prevItem = menuItems[idx - 1];
                                const showGroupLabel = item.group && (!prevItem || prevItem.group !== item.group);
                                
                                return (
                                    <div key={item.name}>
                                        {showGroupLabel && (
                                            <p className="px-4 text-[9px] font-black text-ink-300 uppercase tracking-[0.2em] mb-2 mt-6 leading-none">
                                                {item.group}
                                            </p>
                                        )}
                                        <NavLink item={item} />
                                    </div>
                                );
                            })}
                        </nav>

                        {/* User Profile / Footer */}
                        <div className="p-4 border-t border-ink-100/50 bg-white/50 backdrop-blur-sm">
                            {availableRoles && availableRoles.length > 1 && (
                                <div className="mb-3 px-2">
                                    <label className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1 block">Switch Role</label>
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

                {/* Main Content Area */}
                <main className="flex-1 lg:pl-72 min-w-0 transition-all duration-300 w-full">
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
                    <div className="pt-32 lg:pt-10 p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
