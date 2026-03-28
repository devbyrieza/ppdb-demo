'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AKADEMIK_MTS, AKADEMIK_IL, AKADEMIK_MA } from '@/lib/questions';
import type { Question } from '@/lib/questions';
import { CheckCircle, Loader2, ArrowLeft, Timer } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AkademikTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [jenjang, setJenjang] = useState<'MTs' | 'IL' | 'SMA'>('MTs');
    const [questions, setQuestions] = useState<Question[]>(AKADEMIK_MTS);
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [timerActive, setTimerActive] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetch('/api/pendaftar/undangan-seleksi')
            .then(res => res.json())
            .then(data => {
                if (data.data?.grupA?.akademik?.completed) {
                    setAlreadyDone(true);
                } else if (data.data?.pendaftar?.jenjang) {
                    const j = data.data.pendaftar.jenjang;
                    if (j?.includes('IL') || j?.toLowerCase().includes('i\'dad') || j?.toLowerCase().includes('idad')) {
                        setJenjang('IL');
                        setQuestions(AKADEMIK_IL);
                    } else if (j?.includes('MA') || j?.includes('SMA')) {
                        setJenjang('SMA');
                        setQuestions(AKADEMIK_MA);
                    } else {
                        setJenjang('MTs');
                        setQuestions(AKADEMIK_MTS);
                    }
                }
            })
            .catch(() => { })
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            handleSubmit(true);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleStart = () => {
        setStarted(true);
        setTimerActive(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    const handleSubmit = async (autoSubmit = false) => {
        setTimerActive(false);

        if (!autoSubmit) {
            const result = await Swal.fire({
                title: 'Kirim Jawaban?',
                text: `Anda menjawab ${Object.keys(answers).length} dari ${questions.length} soal. Jawaban tidak dapat diubah.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#4f46e5',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Kirim',
                cancelButtonText: 'Batal',
            });
            if (!result.isConfirmed) {
                setTimerActive(true);
                return;
            }
        }

        try {
            setLoading(true);
            const res = await fetch('/api/pendaftar/ujian/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'akademik', answers, jenjang }),
            });
            if (!res.ok) throw new Error('Gagal mengirim');

            await Swal.fire({ icon: 'success', title: 'Alhamdulillah!', text: 'Tes Akademik berhasil diselesaikan.', confirmButtonColor: '#4f46e5' });
            router.push('/dashboard/pendaftar/undangan-seleksi');
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
    }

    if (alreadyDone) {
        return (
            <div className="max-w-lg mx-auto p-8 text-center mt-10">
                <div className="bg-white rounded-2xl shadow-lg border p-10">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Tes Sudah Dikerjakan</h2>
                    <p className="text-stone-600 mb-6">Anda sudah menyelesaikan Tes Akademik sebelumnya.</p>
                    <button onClick={() => router.push('/dashboard/pendaftar/undangan-seleksi')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                        Kembali ke Undangan Seleksi
                    </button>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">Tes Kemampuan Dasar Akademik</h2>
                    <div className="space-y-4 text-stone-700">
                        <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl text-sm">
                            <div><span className="text-stone-500">Jenjang:</span> <strong>{jenjang}</strong></div>
                            <div><span className="text-stone-500">Jumlah Soal:</span> <strong>20 soal</strong></div>
                            <div><span className="text-stone-500">Durasi:</span> <strong>60 menit</strong></div>
                            <div><span className="text-stone-500">Materi:</span> <strong>PAI, B.Indo, IPA, Mat</strong></div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2">Perhatian</h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Pastikan koneksi internet stabil</li>
                                <li>• Jangan refresh halaman saat mengerjakan</li>
                                <li>• Timer akan berjalan otomatis setelah menekan "Mulai"</li>
                                <li>• Jawaban otomatis dikirim jika waktu habis</li>
                            </ul>
                        </div>
                        <div className="bg-maroon-50 border border-maroon-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🕌</span>
                                <div>
                                    <h4 className="font-bold text-maroon-800 mb-1 text-sm">Pesan dari Mudir</h4>
                                    <p className="text-sm text-maroon-700 leading-relaxed italic">
                                        "Kejujuran anda saat mengerjakan ujian ini, adalah keberkahan selanjutnya dalam menuntut ilmu."
                                    </p>
                                    <p className="text-sm text-maroon-600 leading-relaxed mt-1">
                                        Mengisi secara mandiri akan mengefektifkan waktu yang tersedia.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleStart} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg">
                            Mulai Tes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32">
            {/* Floating Timer */}
            <div className={`fixed top-20 right-4 md:right-10 bg-white border shadow-lg rounded-full px-4 py-2 z-50 flex items-center gap-2 font-bold font-mono text-xl ${timeLeft <= 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                <Timer className="w-5 h-5" /> {formatTime(timeLeft)}
            </div>

            <div className="mt-2 space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white">Tes Akademik — {jenjang}</h2>
                    <p className="text-indigo-100 text-sm mt-1">{Object.keys(answers).length}/{questions.length} soal terjawab</p>
                </div>

                {questions.map((q) => (
                    <div key={q.id} className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="font-medium mb-4 text-stone-900 whitespace-pre-line">
                            <span className="font-bold mr-2 text-stone-400">{q.id}.</span> {q.text}
                        </div>
                        <div className="space-y-2">
                            {q.options?.map(opt => (
                                <div key={opt.value}
                                    onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.value }))}
                                    className={`cursor-pointer p-4 border-2 rounded-lg hover:bg-slate-50 transition-all ${answers[q.id] === opt.value ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm' : 'border-stone-200'}`}
                                >
                                    <span className="font-bold mr-3 inline-block w-6 text-center bg-stone-100 rounded text-stone-600">{opt.value}</span>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <span className="text-sm text-stone-500 hidden sm:inline">{Object.keys(answers).length}/{questions.length} soal terjawab</span>
                    <button onClick={() => handleSubmit(false)} disabled={loading}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold rounded-xl px-8 py-4 text-lg transition-colors flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : 'Selesai & Kumpulkan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
