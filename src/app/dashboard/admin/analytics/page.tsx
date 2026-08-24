"use client";

import React from "react";
import { PieChart, LineChart, Map, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default function AnalyticsDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Statistik & Laporan Analitik
          </h1>
          <p className="text-gray-500 mt-1">
            Visualisasi data real-time, tren pendaftaran, dan laporan pendapatan (Fitur Diamond++).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 font-medium">Total Pendaftar</p>
              <h3 className="text-4xl font-bold mt-2 text-white">1,245</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl"><Users className="w-6 h-6" /></div>
          </div>
          <div className="mt-6 text-sm text-indigo-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> +12% dari minggu lalu
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium">Total Pendapatan</p>
              <h3 className="text-4xl font-bold mt-2 text-white">Rp 498<span className="text-2xl">Jt</span></h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>
          <div className="mt-6 text-sm text-emerald-100 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Pembayaran Pendaftaran
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Rasio Kelulusan Tahun Ini</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-8 border-indigo-100 border-t-indigo-600 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">68%</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div> <span className="text-gray-600">Lulus (846 Santri)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-100 rounded-full"></div> <span className="text-gray-600">Tidak Lulus (399 Santri)</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Map className="w-5 h-5 text-indigo-600"/> Peta Demografi (Heatmap)</h3>
          </div>
          <div className="aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Map className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-medium">Modul Heatmap Peta Indonesia</p>
            <p className="text-sm">Menampilkan sebaran pendaftar per provinsi secara visual</p>
          </div>
        </div>

        {/* Tren Pendaftar Harian */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><LineChart className="w-5 h-5 text-indigo-600"/> Tren Pendaftaran Harian</h3>
          </div>
          <div className="aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <LineChart className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-medium">Modul Chart.js / Recharts</p>
            <p className="text-sm">Grafik garis lonjakan pendaftaran harian</p>
          </div>
        </div>
      </div>
    </div>
  );
}
