"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardEdit, 
  Search, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

export type PendingStudent = {
  jadwalId: string;
  name: string;
  registrationNumber: string;
  date: Date;
};

export type ExaminerStat = {
  id: string;
  name: string;
  phone: string | null;
  roleType: "Wawancara Santri" | "Wawancara Ortu" | "Ujian Quran";
  totalAssigned: number;
  totalGraded: number;
  totalPending: number;
  pendingStudents: PendingStudent[];
};

export default function MonitoringClient({ data }: { data: ExaminerStat[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || item.roleType === filterType;
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const getWhatsappLink = (phone: string | null, count: number) => {
    if (!phone) return "#";
    // Format phone to 62...
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }
    const message = `Assalamu'alaikum Ustadz/Ustadzah. Mengingatkan bahwa ada ${count} calon santri yang masih menunggu input nilai wawancara/ujian dari antum. Mohon bantuannya untuk segera diinput. Syukron.`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-ink-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            <ClipboardEdit className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-black text-ink-400 uppercase tracking-widest">Total Penugasan</p>
            <p className="text-3xl font-black text-primary-950">
              {data.reduce((acc, curr) => acc + curr.totalAssigned, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-ink-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-black text-ink-400 uppercase tracking-widest">Total Pending Nilai</p>
            <p className="text-3xl font-black text-primary-950">
              {data.reduce((acc, curr) => acc + curr.totalPending, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-ink-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-black text-ink-400 uppercase tracking-widest">Total Selesai Dinilai</p>
            <p className="text-3xl font-black text-primary-950">
              {data.reduce((acc, curr) => acc + curr.totalGraded, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-ink-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            placeholder="Cari nama penguji..."
            className="w-full pl-12 pr-4 py-3 bg-ink-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-sm font-bold text-primary-950"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {["All", "Wawancara Santri", "Wawancara Ortu", "Ujian Quran"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filterType === type
                  ? "bg-primary-950 text-white shadow-lg"
                  : "bg-ink-50 text-ink-500 hover:bg-ink-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-ink-100 rounded-3xl overflow-hidden shadow-sm">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-ink-400 font-bold">
            Tidak ada data penguji yang sesuai dengan filter.
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {filteredData.map((stat) => {
              const isExpanded = expandedId === stat.id + stat.roleType;
              const isAllDone = stat.totalPending === 0;

              return (
                <div key={stat.id + stat.roleType} className="hover:bg-ink-50/50 transition-colors">
                  <div 
                    className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => toggleExpand(stat.id + stat.roleType)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        isAllDone ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {stat.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-primary-950 uppercase tracking-tighter">
                          {stat.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-ink-100 text-ink-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {stat.roleType}
                          </span>
                          {stat.phone && (
                            <span className="flex items-center gap-1 text-xs font-bold text-ink-400">
                              <Phone className="w-3 h-3" /> {stat.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">Ditugaskan</p>
                        <p className="text-lg font-black text-primary-950">{stat.totalAssigned}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">Selesai</p>
                        <p className="text-lg font-black text-green-600">{stat.totalGraded}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">Pending</p>
                        <div className={`text-lg font-black ${stat.totalPending > 0 ? "text-red-500 animate-pulse" : "text-ink-300"}`}>
                          {stat.totalPending}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-auto">
                        {stat.totalPending > 0 && stat.phone && (
                          <a 
                            href={getWhatsappLink(stat.phone, stat.totalPending)} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors shadow-md shadow-green-500/20"
                            title="Ingatkan via WA"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        )}
                        <button className="w-10 h-10 bg-white border border-ink-200 text-ink-400 rounded-xl flex items-center justify-center hover:bg-ink-50 transition-colors">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 bg-ink-50/30 border-t border-ink-100">
                          {stat.totalPending === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-green-600">
                              <CheckCircle2 className="w-8 h-8 mb-2" />
                              <p className="font-bold text-sm">Alhamdulillah, semua nilai sudah diinput!</p>
                            </div>
                          ) : (
                            <div>
                              <h4 className="text-xs font-black text-primary-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                Daftar Santri Belum Dinilai ({stat.totalPending})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {stat.pendingStudents.map((student) => (
                                  <div key={student.jadwalId} className="bg-white p-3 rounded-2xl border border-ink-200 shadow-sm flex flex-col">
                                    <span className="text-[10px] font-black text-ink-400 uppercase tracking-widest">{student.registrationNumber}</span>
                                    <span className="text-sm font-bold text-primary-950 truncate" title={student.name}>{student.name}</span>
                                    <span className="text-xs text-ink-500 mt-2 bg-ink-50 w-fit px-2 py-1 rounded-md">
                                      {new Date(student.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
