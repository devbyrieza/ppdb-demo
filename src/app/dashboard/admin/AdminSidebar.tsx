"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    PieChart,
    ChevronRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { getMenuItemsForRole, UserRole, ROLE_LABELS } from "@/lib/access-control";
import Swal from "sweetalert2";
import { BRANDING } from "@/config/branding";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

// ─── ICON MAPPING ───
const ICON_MAP: Record<string, any> = {
    LayoutDashboard, Users, FileCheck, CreditCard, Calendar, Trophy, 
    Settings, FileText, BarChart, ClipboardEdit, UserCog, Landmark, 
    Map, Zap, UserCircle, Edit3, Activity, PieChart
};

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
    const [collapsed, setCollapsed] = useState(false);

    const rawMenuItems = userRole ? getMenuItemsForRole(userRole) : [];
    const menuItems = rawMenuItems.map(item => ({
        ...item,
        icon: ICON_MAP[item.icon] || LayoutDashboard,
        active: pathname === item.href
    }));

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Keluar?',
            text: "Sesi Anda akan berakhir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Keluar'
        });

        if (result.isConfirmed) {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
            } catch (error) {
                console.error("Logout failed", error);
            }
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
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-5 py-3 flex items-center justify-between">
                <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">{BRANDING.schoolShortName}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Admin</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {adminName.charAt(0)}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 z-[80] w-72 bg-white shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <img src={BRANDING.logoPath} alt="Logo" className="w-7 h-7 object-contain" />
                                    <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">Navigasi</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {menuItems.map((item, idx) => (
                                    <Link 
                                        key={item.name} 
                                        href={item.href} 
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${item.active ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                    >
                                        <item.icon className={`w-4 h-4 ${item.active ? "text-teal-600" : "text-slate-400"}`} />
                                        <span className="text-sm">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Linear-inspired Slim Design) */}
            <aside 
                className={`hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col bg-white border-r border-slate-200/60 transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}
            >
                {/* Header / Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link href="/dashboard/admin" className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200/50">
                            <img src={BRANDING.logoPath} alt="Logo" className="w-5 h-5 object-contain" />
                        </div>
                        {!collapsed && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="whitespace-nowrap"
                            >
                                <span className="font-bold text-slate-900 text-[13px] uppercase tracking-wider">{BRANDING.schoolShortName}</span>
                                <span className="block text-[9px] text-slate-400 font-medium uppercase tracking-[0.2em] -mt-0.5">Admin Panel</span>
                            </motion.div>
                        )}
                    </Link>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 no-scrollbar">
                    {/* Role Switcher (Integrated) */}
                    {!collapsed && availableRoles && availableRoles.length > 1 && (
                        <div className="px-3 mb-4">
                            <div className="relative group">
                                <select
                                    value={userRole || ""}
                                    onChange={handleRoleSwitch}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all group-hover:border-slate-300"
                                >
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
                            </div>
                        </div>
                    )}

                    <nav className="space-y-1">
                        {menuItems.map((item, idx) => {
                            const prevItem = menuItems[idx - 1];
                            const showGroupLabel = !collapsed && item.group && (!prevItem || prevItem.group !== item.group);
                            
                            return (
                                <div key={item.name}>
                                    {showGroupLabel && (
                                        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-6 mb-2">
                                            {item.group}
                                        </p>
                                    )}
                                    <Link
                                        href={item.href}
                                        className={`relative group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                            item.active 
                                            ? "text-teal-700 font-semibold" 
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        {item.active && (
                                            <motion.div 
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-teal-50/60 rounded-lg -z-10 border border-teal-100/50"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${item.active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                                        {!collapsed && <span className="text-[13px] tracking-tight">{item.name}</span>}
                                        {collapsed && (
                                            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100]">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Section: Profile & Search Toggle */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    {/* Collapse Toggle */}
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 mb-2 transition-all"
                    >
                        <PanelLeft className={`w-[18px] h-[18px] shrink-0 transition-transform duration-500 ${collapsed ? "rotate-180" : ""}`} />
                        {!collapsed && <span className="text-[13px] font-medium">Sembunyikan</span>}
                    </button>

                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100 relative">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white border border-slate-200">
                            {adminName.charAt(0)}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{adminName}</p>
                                <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
                                    {userRole ? ROLE_LABELS[userRole] : "Admin"}
                                </p>
                            </div>
                        )}
                        {!collapsed && (
                            <button 
                                onClick={handleLogout} 
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
                {/* Desktop Top Header (Floating Glassmorphism) */}
                <header className="hidden lg:flex sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-slate-200/60 h-16 items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Link href="/dashboard/admin" className="hover:text-slate-900 transition-colors">Admin</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-900 font-bold uppercase tracking-wider">Dashboard</span>
                        </div>
                        
                        <div className="h-4 w-px bg-slate-200" />
                        
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Cari data pendaftar..." 
                                className="bg-slate-100/50 border-none rounded-lg pl-9 pr-4 py-1.5 text-[13px] w-64 focus:w-80 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <LanguageSwitcher />
                        <div className="h-4 w-px bg-slate-200" />
                        <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                            <Bell className="w-4.5 h-4.5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-white shadow-sm" />
                        </button>
                        <Link href="/" className="px-4 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-950/10">
                            Lihat Website
                        </Link>
                    </div>
                </header>

                {/* Content Wrapper */}
                <div className="p-6 md:p-8 pt-24 lg:pt-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
