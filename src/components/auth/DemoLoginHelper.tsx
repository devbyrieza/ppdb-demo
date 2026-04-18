"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  ClipboardCheck, 
  CreditCard,
  Zap
} from "lucide-react";

interface DemoLoginHelperProps {
  onSelect: (email: string, pass: string, type: "pendaftar" | "admin") => void;
}

export default function DemoLoginHelper({ onSelect }: DemoLoginHelperProps) {
  const demoAccounts = [
    {
      role: "Admin Utama",
      email: "admin@demo-ppdb.com",
      pass: "admin123",
      type: "admin" as const,
      icon: ShieldCheck,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      role: "Pendaftar (Calon Santri)",
      email: "pendaftar@demo-ppdb.com",
      pass: "pendaftar123",
      nik: "1234567890123456",
      noPendaftarm: "MTI2600001",
      type: "pendaftar" as const,
      icon: Users,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      role: "Penguji (Interview)",
      email: "penguji@demo-ppdb.com",
      pass: "penguji123",
      type: "admin" as const,
      icon: ClipboardCheck,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
        role: "Keuangan",
        email: "finance@demo-ppdb.com",
        pass: "finance123",
        type: "admin" as const,
        icon: CreditCard,
        color: "bg-purple-100 text-purple-700 border-purple-200",
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <Zap className="w-4 h-4 text-brand-yellow-500 fill-brand-yellow-500" />
        <h3 className="text-xs font-black text-ink-500 uppercase tracking-[0.2em]">Coba Demo Satu-Klik</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {demoAccounts.map((acc, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                if (acc.type === 'admin') {
                    onSelect(acc.email, acc.pass, "admin");
                } else if (acc.nik && acc.noPendaftarm) {
                    onSelect(acc.nik, acc.noPendaftarm, "pendaftar");
                }
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${acc.color} transition-all hover:shadow-md text-center group`}
          >
            <acc.icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">{acc.role}</span>
          </motion.button>
        ))}
      </div>
      
      <p className="text-[10px] text-center text-ink-400 font-medium mt-6 italic">
        * Data pada versi demo ini direset secara berkala.
      </p>
    </div>
  );
}
