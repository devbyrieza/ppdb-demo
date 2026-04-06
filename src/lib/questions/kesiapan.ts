import type { KesiapanSection } from './types';

export const KESIAPAN_QUESTIONS: KesiapanSection[] = [
    {
        section: 'Ketaatan dan Sikap Disiplin', items: [
            { id: 1, text: 'Saya berusaha patuh terhadap perintah orang tua dan guru.', labelMin: 'Sangat Tidak Patuh', labelMax: 'Sangat Patuh' },
            { id: 2, text: 'Saya memandang perintah guru atau orang yang lebih tua sebagai hal yang penting untuk ditaati.', labelMin: 'Sangat Tidak Penting', labelMax: 'Sangat Penting' },
            { id: 3, text: 'Jika melanggar aturan, saya siap menerima konsekuensinya termasuk hukuman.', labelMin: 'Tidak siap sama sekali', labelMax: 'Sangat siap' },
            { id: 4, text: 'Saya merasa senang dan termotivasi bila di pesantren diwajibkan membaca Al-Qur\'an dan mengulang hafalan setelah shalat.', labelMin: 'Sangat tidak senang', labelMax: 'Sangat senang' },
            { id: 5, text: 'Jika ada benturan antara kegiatan keluarga (misalnya jalan-jalan) dengan kewajiban belajar, saya lebih memilih menjalankan kewajiban belajar.', labelMin: 'Lebih memilih kegiatan lain', labelMax: 'Lebih memilih belajar/taat aturan' },
        ]
    },
    {
        section: 'Motivasi & Semangat Belajar', items: [
            { id: 6, text: 'Saya memilih pesantren sebagai tempat belajar karena dorongan dan keinginan yang kuat.', labelMin: 'Tidak ada dorongan', labelMax: 'Sangat kuat' },
            { id: 7, text: 'Saya merasa Pesantren Al-Andalus Ulul Albaab adalah tempat belajar yang sesuai dengan harapan saya.', labelMin: 'Sangat tidak sesuai', labelMax: 'Sangat sesuai' },
            { id: 8, text: 'Ada tokoh atau seseorang yang membuat saya semangat dalam belajar.', labelMin: 'Tidak ada', labelMax: 'Ada dan sangat menginspirasi' },
            { id: 9, text: 'Saya tetap semangat belajar meskipun dalam kondisi sulit (misalnya sakit ringan, rindu orang tua, atau merasa jenuh).', labelMin: 'Sangat mudah menyerah', labelMax: 'Tetap semangat penuh' },
            { id: 10, text: 'Saya lebih menyukai pelajaran agama dibanding pelajaran umum.', labelMin: 'Hanya suka salah satu', labelMax: 'Suka keduanya' },
        ]
    },
    {
        section: 'Kemandirian & Daya Tahan', items: [
            { id: 11, text: 'Saya merasa siap ditinggalkan orang tua saat masuk pesantren.', labelMin: 'Sangat tidak siap', labelMax: 'Sangat siap' },
            { id: 12, text: 'Saya bisa beradaptasi dengan lingkungan baru (asrama, teman, aturan) dalam waktu singkat.', labelMin: 'Sangat sulit beradaptasi', labelMax: 'Sangat mudah beradaptasi' },
            { id: 13, text: 'Jika saya sakit di pesantren, saya bisa mengatasi dengan sabar dan melapor kepada ustadz/ustadzah.', labelMin: 'Tidak tahu harus bagaimana', labelMax: 'Sangat siap dan paham' },
            { id: 14, text: 'Ketika kesulitan belajar, saya terbiasa berusaha mencari solusi (misalnya bertanya pada guru/teman atau belajar lebih giat).', labelMin: 'Tidak berusaha', labelMax: 'Berusaha kuat' },
            { id: 15, text: 'Jika uang jajan saya habis sementara orang tua belum memberi tambahan, saya bisa bersabar dan mengatur diri.', labelMin: 'Sangat tidak sabar', labelMax: 'Sangat bersabar' },
        ]
    }
];
