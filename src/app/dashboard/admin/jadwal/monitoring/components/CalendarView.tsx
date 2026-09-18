"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';

interface Schedule {
    id: string;
    pendaftar: {
        nomor: string;
        nama: string;
        jenjang: string;
    };
    sesi: {
        title: string;
        start: string;
        end: string;
        location: string;
        metode: string;
    };
    ustadz: {
        quran: string | null;
        santri: string | null;
        ortu: string | null;
    };
}

interface CalendarViewProps {
    schedules: Schedule[];
}

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarView({ schedules }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getSchedulesForDay = (day: number) => {
        return schedules.filter(s => {
            const d = new Date(s.sesi.start);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    // Build the calendar grid
    const calendarDays = [];
    // Empty slots before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }
    // Fill the rest of the last row
    while (calendarDays.length % 7 !== 0) {
        calendarDays.push(null);
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                    Kalender Ujian
                </h3>
                <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-700 min-w-[120px] text-center">
                        {MONTH_NAMES[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Grid Header (Days) */}
            <div className="grid grid-cols-7 border-b border-slate-100">
                {DAY_NAMES.map((day, idx) => (
                    <div key={day} className={\`px-2 py-3 text-center text-xs font-black uppercase tracking-wider \${idx === 0 ? 'text-rose-500' : 'text-slate-500'}\`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 bg-slate-50 gap-[1px]">
                {calendarDays.map((day, idx) => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const daySchedules = day ? getSchedulesForDay(day) : [];
                    
                    return (
                        <div 
                            key={idx} 
                            className={\`min-h-[120px] bg-white p-2 flex flex-col \${!day ? 'bg-slate-50/50' : 'hover:bg-slate-50 transition-colors'}\`}
                        >
                            {day && (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={\`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full \${isToday ? 'bg-primary-600 text-white shadow-md' : (idx % 7 === 0 ? 'text-rose-500' : 'text-slate-700')}\`}>
                                            {day}
                                        </span>
                                        {daySchedules.length > 0 && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-md">
                                                {daySchedules.length} Sesi
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[80px]">
                                        {daySchedules.map((s, sIdx) => {
                                            const time = new Date(s.sesi.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={s.id + sIdx} className="px-1.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded text-left cursor-default group transition-colors">
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                                                            <Clock className="w-2.5 h-2.5" /> {time}
                                                        </span>
                                                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-white border border-slate-200 text-slate-600 truncate max-w-[50px]">
                                                            {s.sesi.title.substring(0, 10)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                                                        {s.pendaftar.nama}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
