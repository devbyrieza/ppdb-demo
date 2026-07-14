"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  LayoutDashboard, Users, FileCheck, CreditCard, Calendar, Trophy, Settings,
  LogOut, Menu, X, FileText, Bell, BarChart, ClipboardEdit, UserCog, Landmark,
  Map, Zap, UserCircle, Edit3, Activity, PieChart, ChevronRight, Shuffle, Shirt, Wallet
} from "lucide-react";
import { getMenuItemsForRole, UserRole, ROLE_LABELS } from "@/lib/access-control";
import { BRANDING } from "@/config/branding";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Users, FileCheck, CreditCard, Calendar, Trophy, Settings,
  FileText, BarChart, ClipboardEdit, UserCog, Landmark, Map, Zap, UserCircle,
  Edit3, Activity, PieChart, Shuffle, Shirt, Wallet,
};

interface AdminSidebarProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  adminName: string;
  userId?: string;
  availableRoles?: string[];
  unverifiedPaymentsCount?: number;
  unverifiedDocsCount?: number;
  pendingDataRequestsCount?: number;
}

export default function AdminSidebar({
  children,
  userRole,
  adminName,
  userId,
  availableRoles,
  unverifiedPaymentsCount: initialPaymentsCount = 0,
  unverifiedDocsCount: initialDocsCount = 0,
  pendingDataRequestsCount: initialRequestsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentsCount, setPaymentsCount] = useState(initialPaymentsCount);
  const [docsCount, setDocsCount] = useState(initialDocsCount);
  const [requestsCount, setRequestsCount] = useState(initialRequestsCount);

  useEffect(() => {
    if (!userRole || userRole === "pendaftar") return;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/sidebar-counts");
        if (res.ok) {
          const data = await res.json();
          setPaymentsCount(data.unverifiedPaymentsCount || 0);
          setDocsCount(data.unverifiedDocsCount || 0);
          setRequestsCount(data.pendingDataRequestsCount || 0);
        }
      } catch (error) {
        console.error("Failed to poll sidebar counts:", error);
      }
    };
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [userRole]);

  const rawMenuItems = userRole ? getMenuItemsForRole(userRole) : [];
  const menuItems = rawMenuItems.map((item) => {
    let badgeCount = 0;
    if (item.name === "Verifikasi Pembayaran") badgeCount = paymentsCount;
    else if (item.name === "Verifikasi Dokumen") badgeCount = docsCount;
    else if (item.name === "Perubahan Data" || item.name.includes("Perubahan") || item.name.includes("Edit")) badgeCount = requestsCount;

    return {
      ...item,
      icon: ICON_MAP[item.icon] || LayoutDashboard,
      isActive: pathname === item.href,
      badge: badgeCount,
    };
  });

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar Sekarang?",
      text: "Anda akan diarahkan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout process failed:", error);
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
      console.error("Role switching failed:", error);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile header toggler */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary-dark text-white p-4 flex items-center justify-between">
        <span className="font-bold text-lg">{BRANDING.schoolShortName}</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h1>{BRANDING.schoolShortName}</h1>
          <p>Admin Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Utama</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link ${item.isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.badge > 0 && (
                  <span className="badge bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {availableRoles && availableRoles.length > 1 && (
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <select
                value={userRole || ""}
                onChange={handleRoleSwitch}
                className="form-control"
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role as UserRole] || role}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700
            }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{adminName}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                {userRole ? ROLE_LABELS[userRole] : "Admin"}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "white" }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="app-content">
        <div className="page-header">
          <div>
            <h1>Dashboard Administrasi</h1>
            <p>Selamat datang di panel admin {BRANDING.schoolName}</p>
          </div>
        </div>
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .app-content {
            padding-top: 56px; /* Offset for mobile header */
          }
        }
      `}</style>
    </div>
  );
}
