"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  ClipboardCheck,
  CreditCard,
  Zap,
  BookOpen,
  Mic2,
  FileSearch,
  UserCheck,
} from "lucide-react";

interface DemoLoginHelperProps {
  onSelect: (val1: string, val2: string, type: "pendaftar" | "admin", roleId?: string) => void;
}

export default function DemoLoginHelper({ onSelect }: DemoLoginHelperProps) {
  const demoAdmins = [
    {
      role: "Admin Super",
      id: "admin_super",
      email: "admin@ppdb-demo.com",
      pass: "password123",
      icon: ShieldCheck,
      color: "bg-secondary-100 text-secondary-700 border-secondary-200",
    },
    {
      role: "Admin Keuangan",
      id: "admin_keuangan",
      email: "keuangan@ppdb-demo.com",
      pass: "password123",
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      role: "Admin Berkas",
      id: "admin_berkas",
      email: "berkas@ppdb-demo.com",
      pass: "password123",
      icon: FileSearch,
      color: "bg-primary-100 text-primary-700 border-primary-200",
    },
    {
      role: "Penguji Al-Qur'an",
      id: "penguji",
      email: "ust.abdullah@ppdb-demo.com",
      pass: "password123",
      icon: BookOpen,
      color: "bg-primary-100 text-primary-700 border-primary-200",
    },
    {
      role: "Pewawancara Calon Santri",
      id: "pewawancara_calsan",
      email: "ust.umar@ppdb-demo.com",
      pass: "password123",
      icon: Mic2,
      color: "bg-rose-100 text-rose-700 border-rose-200",
    },
    {
      role: "Pewawancara Calon Orangtua/Wali Santri",
      id: "pewawancara_cawalsan",
      email: "ust.ahmad@ppdb-demo.com",
      pass: "password123",
      icon: UserCheck,
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  ];

  // Demo pendaftar accounts for random selection (All fully completed/accepted)
  const pendaftarDemos = [
    { nik: "3201010101010001", no: "MTA2500001" }, // Daud Jordan
    { nik: "3201010101010003", no: "ILI2600001" }, // Khadijah Bint Khuwaylid
    { nik: "3201010101010011", no: "MTA2500007" }, // Fatih Al-Ayyubi
  ];

  const handleRandomPendaftar = () => {
    const randomIdx = Math.floor(Math.random() * pendaftarDemos.length);
    const chosen = pendaftarDemos[randomIdx];
    onSelect(chosen.nik, chosen.no, "pendaftar");
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <Zap className="w-4 h-4 text-secondary-500 fill-secondary-500" />
        <h3 className="text-xs font-black text-ink-500 uppercase tracking-[0.2em]">
          Coba Demo Satu-Klik
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {demoAdmins.map((acc, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(acc.email, acc.pass, "admin", acc.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${acc.color} transition-all hover:shadow-md text-center group`}
          >
            <acc.icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
              {acc.role}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleRandomPendaftar}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-md transition-all group"
      >
        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">
          Login Pendaftar (Acak)
        </span>
      </motion.button>

      <p className="text-[10px] text-center text-ink-400 font-medium mt-6 italic">
        * Data pada versi demo ini direset secara berkala.
      </p>
    </div>
  );
}
