'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KEPRIBADIAN_QUESTIONS } from '@/lib/questions';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function KepribadianTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [page, setPage] = useState(0);
    const topRef = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(KEPRIBADIAN_QUESTIONS.length / ITEMS_PER_PAGE);
    const currentQuestions = KEPRIBADIAN_QUESTIONS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetch('/api/pendaftar/undangan-seleksi')
            .then(res => res.json())
            .then(data => {
                if (data.data?.grupA?.kepribadian?.completed) setAlreadyDone(true);
            })
            .catch(() => { })
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [page]);

    const handleNext = () => {
        const unanswered = currentQuestions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            Swal.fire('Perhatian', `Masih ada ${unanswered.length} soal yang belum dijawab di halaman ini.`, 'warning');
            return;
        }
        setPage(p => p + 1);
    };

    const handleSubmit = async () => {
        const unanswered = KEPRIBADIAN_QUESTIONS.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            Swal.fire('Perhatian', `Masih ada ${unanswered.length} soal yang belum dijawab.`, 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Kirim Jawaban?',
            text: 'Jawaban yang sudah dikirim tidak dapat diubah.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            const res = await fetch('/api/pendaftar/ujian/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'kepribadian', answers }),
            });
            if (!res.ok) throw new Error('Gagal mengirim');

            await Swal.fire({ icon: 'success', title: 'Alhamdulillah!', text: 'Tes Kepribadian berhasil diselesaikan.', confirmButtonColor: '#7c3aed' });
            router.push('/dashboard/pendaftar/undangan-seleksi');
        } catch (err: any) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;
    }

    if (alreadyDone) {
        return (
            <div className="max-w-lg mx-auto p-8 text-center mt-10">
                <div className="bg-white rounded-2xl shadow-lg border p-10">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Tes Sudah Dikerjakan</h2>
                    <p className="text-stone-600 mb-6">Anda sudah menyelesaikan Tes Kepribadian sebelumnya.</p>
                    <button onClick={() => router.push('/dashboard/pendaftar/undangan-seleksi')} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors">
                        Kembali ke Undangan Seleksi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
            <div ref={topRef} />
            <button onClick={() => router.back()} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-6 mb-6">
                <h1 className="text-xl font-bold text-white">Tes Identifikasi Kepribadian</h1>
                <p className="text-violet-100 text-sm mt-1">100 pernyataan • Pilih A atau B • Durasi 75 menit</p>
                <p className="text-violet-200 text-xs mt-2">Pilihlah pernyataan A atau B yang sesuai dengan kepribadianmu!</p>
            </div>

            <div className="bg-maroon-50 border border-maroon-200 rounded-xl p-4 mb-6">
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

            {/* Progress */}
            <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-stone-600">Halaman {page + 1} dari {totalPages}</span>
                    <span className="font-bold text-violet-600">{Object.keys(answers).length}/{KEPRIBADIAN_QUESTIONS.length} dijawab</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(Object.keys(answers).length / KEPRIBADIAN_QUESTIONS.length) * 100}%` }} />
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {currentQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm">
                        <p className="font-bold text-stone-400 text-sm mb-3">{q.id}.</p>
                        <div className="grid grid-cols-1 gap-3">
                            <div
                                onClick={() => setAnswers(p => ({ ...p, [q.id]: 'A' }))}
                                className={`cursor-pointer p-4 border-2 rounded-lg hover:bg-slate-50 transition-all ${answers[q.id] === 'A' ? 'bg-violet-50 border-violet-500 text-violet-900 shadow-sm' : 'border-stone-200'}`}
                            >
                                <span className="font-bold mr-2 bg-white border rounded px-2 py-0.5 text-xs text-stone-500">A</span>
                                {q.optionA}
                            </div>
                            <div
                                onClick={() => setAnswers(p => ({ ...p, [q.id]: 'B' }))}
                                className={`cursor-pointer p-4 border-2 rounded-lg hover:bg-slate-50 transition-all ${answers[q.id] === 'B' ? 'bg-violet-50 border-violet-500 text-violet-900 shadow-sm' : 'border-stone-200'}`}
                            >
                                <span className="font-bold mr-2 bg-white border rounded px-2 py-0.5 text-xs text-stone-500">B</span>
                                {q.optionB}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="sticky bottom-4 z-10 flex gap-3">
                {page > 0 && (
                    <button onClick={() => setPage(p => p - 1)}
                        className="flex-1 py-4 bg-white border-2 border-stone-300 hover:bg-stone-50 text-stone-700 font-bold rounded-xl shadow-lg transition-colors">
                        Sebelumnya
                    </button>
                )}
                {page < totalPages - 1 ? (
                    <button onClick={handleNext}
                        className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg transition-colors">
                        Selanjutnya
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={loading}
                        className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : 'Kirim Jawaban'}
                    </button>
                )}
            </div>
        </div>
    );
}
