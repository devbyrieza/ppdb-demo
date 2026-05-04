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
  UserCheck
} from "lucide-react";

interface DemoLoginHelperProps {
  onSelect: (val1: string, val2: string, type: "pendaftar" | "admin") => void;
}

export default function DemoLoginHelper({ onSelect }: DemoLoginHelperProps) {
  const demoAdmins = [
    {
      role: "Admin Super",
      email: "admin@ppdb-demo.com",
      pass: "Admin26!",
      icon: ShieldCheck,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      role: "Admin Keuangan",
      email: "keuangan@ppdb-demo.com",
      pass: "Keuangan26!",
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      role: "Admin Berkas",
      email: "berkas@ppdb-demo.com",
      pass: "Berkas26!",
      icon: FileSearch,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      role: "Penguji Al-Qur'an",
      email: "quran@ppdb-demo.com",
      pass: "Quran26!",
      icon: BookOpen,
      color: "bg-teal-100 text-teal-700 border-teal-200",
    },
    {
      role: "Pewawancara Calon Santri",
      email: "calsan@ppdb-demo.com",
      pass: "Calsan26!",
      icon: Mic2,
      color: "bg-rose-100 text-rose-700 border-rose-200",
    },
    {
      role: "Pewawancara Calon Orangtua/Wali Santri",
      email: "cawalsan@ppdb-demo.com",
      pass: "Cawalsan26!",
      icon: UserCheck,
      color: "bg-purple-100 text-purple-700 border-purple-200",
    }
  ];

  // Demo pendaftar accounts for random selection
  const pendaftarDemos = [
    { nik: "1234567890123451", no: "MTA2600001" },
    { nik: "1234567890123452", no: "MTI2600001" },
    { nik: "1234567890123453", no: "ILA2600001" },
    { nik: "1234567890123454", no: "ILI2600001" }
  ];

  const handleRandomPendaftar = () => {
    const randomIdx = Math.floor(Math.random() * pendaftarDemos.length);
    const chosen = pendaftarDemos[randomIdx];
    onSelect(chosen.nik, chosen.no, "pendaftar");
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <Zap className="w-4 h-4 text-brand-yellow-500 fill-brand-yellow-500" />
        <h3 className="text-xs font-black text-ink-500 uppercase tracking-[0.2em]">Coba Demo Satu-Klik</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        {demoAdmins.map((acc, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(acc.email, acc.pass, "admin")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${acc.color} transition-all hover:shadow-md text-center group`}
          >
            <acc.icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{acc.role}</span>
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
        <span className="text-xs font-black uppercase tracking-widest">Login Pendaftar (Acak)</span>
      </motion.button>
      
      <p className="text-[10px] text-center text-ink-400 font-medium mt-6 italic">
        * Data pada versi demo ini direset secara berkala.
      </p>
    </div>
  );
}
