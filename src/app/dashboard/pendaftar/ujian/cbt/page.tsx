"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Send } from "lucide-react";
import Swal from "sweetalert2";

export default function CBTRoomPage() {
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = [
    { id: 1, text: "Apa hukum mempelajari ilmu tauhid bagi setiap muslim?", options: ["Fardhu Ain", "Fardhu Kifayah", "Sunnah Muakkad", "Mubah"] },
    { id: 2, text: "Siapakah sahabat nabi yang mendapat gelar As-Siddiq?", options: ["Umar bin Khattab", "Ali bin Abi Thalib", "Abu Bakar", "Utsman bin Affan"] },
    { id: 3, text: "Berapa hasil dari 125 x 4?", options: ["400", "500", "450", "600"] },
    { id: 4, text: "Sebutkan rukun iman yang ketiga!", options: ["Iman kepada Malaikat", "Iman kepada Kitab-kitab", "Iman kepada Rasul", "Iman kepada Hari Kiamat"] },
    { id: 5, text: "Apa nama ibu kota provinsi Jawa Barat?", options: ["Jakarta", "Bandung", "Surabaya", "Semarang"] },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const handleSubmit = () => {
    Swal.fire({
      title: "Selesai & Kumpulkan?",
      text: "Anda yakin ingin menyelesaikan ujian? Waktu masih tersisa.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Kumpulkan!",
      cancelButtonText: "Periksa Lagi"
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire("Terkumpul!", "Jawaban Anda telah disubmit secara otomatis (Auto-Grading).", "success");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header CBT */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">Ujian Akademik & Diniyah</h1>
            <p className="text-sm text-gray-500">Computer Based Test (CBT) - PPDB Al-Andalus</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 px-6 py-2 rounded-full font-bold text-xl border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600 bg-red-50' : 'border-emerald-500 text-emerald-600 bg-emerald-50'}`}>
          <Clock className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Soal Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Soal No. {currentQuestion + 1}</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Bobot: 2 Poin</span>
          </div>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            {questions[currentQuestion].text}
          </p>

          <div className="space-y-4 mb-auto">
            {questions[currentQuestion].options.map((opt, idx) => (
              <label 
                key={idx} 
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[currentQuestion] === opt ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion] === opt ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {answers[currentQuestion] === opt && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                </div>
                <input 
                  type="radio" 
                  name="answer" 
                  className="hidden" 
                  checked={answers[currentQuestion] === opt} 
                  onChange={() => handleSelectAnswer(opt)} 
                />
                <span className={`text-base ${answers[currentQuestion] === opt ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                  {String.fromCharCode(65 + idx)}. {opt}
                </span>
              </label>
            ))}
          </div>

          {/* Navigasi Bawah */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
            <button 
              onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5" /> Sebelumnya
            </button>
            
            {currentQuestion === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30"
              >
                Selesai & Kumpulkan <Send className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md"
              >
                Selanjutnya <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigasi Soal */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            Navigasi Soal
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`h-12 rounded-lg font-bold text-sm transition-all border-2 
                  ${currentQuestion === idx ? 'border-indigo-600 ring-2 ring-indigo-200' : answers[idx] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 bg-indigo-600 rounded-sm"></div> Sudah Dijawab
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded-sm"></div> Belum Dijawab
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm"></div> Posisi Saat Ini
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
