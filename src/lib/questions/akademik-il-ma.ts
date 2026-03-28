import type { Question } from './types';

// Shared B.Indo, IPA, Matematika questions for IL and SMA
const SHARED_BINDO: Question[] = [
    {
        id: 6, text: 'Perhatikan kalimat langsung berikut ini!\n\n(1) Annisa berkata, "Saya akan memasuki pendidikan SMA sebentar lagi".\n(2) Ayah mengatakan bahwa saya akan memasuki pendidikan SMA sebentar lagi.\n(3) Buku itu bagus, kata Kayla.\n(4) "Buku baru yang kamu beli itu bagus", kata Kayla.\n\nKalimat langsung di atas yang benar terdapat pada nomor ….',
        options: [
            { value: 'A', label: '(1)' }, { value: 'B', label: '(2)' },
            { value: 'C', label: '(1) dan (3)' }, { value: 'D', label: '(1) dan (4)' },
        ]
    },
    {
        id: 7, text: 'Satu tunas untuk masa depan bumi kita.\n\nMakna slogan tersebut adalah ….',
        options: [
            { value: 'A', label: 'Mari kita menanam pohon bersama-sama.' },
            { value: 'B', label: 'Bumi ini akan indah jika pohon tidak ditebang.' },
            { value: 'C', label: 'Satu pohon yang kita tanam sangat bermanfaat bagi masa depan bumi dan manusia.' },
            { value: 'D', label: 'Pohon yang kita tanam tidak ada pengaruhnya bagi dunia ini.' },
        ]
    },
    {
        id: 8, text: 'Bacalah kutipan teks eksposisi berikut ini!\n\nBagaikan jantung yang berdetak dalam tubuh manusia, ngaji menjadi pemompa darah berupa semangat dan energi yang luar biasa bagi empunya tubuh. Jiwa menjadi segar, pikiran menjadi lebar, hati menjadi sabar, aktivitas menjadi produktif, dan pribadi menjadi solutif.\n\nIde pokok paragraf di atas adalah ….',
        options: [
            { value: 'A', label: 'mengaji melebarkan pikiran' },
            { value: 'B', label: 'mengaji menyegarkan jiwa' },
            { value: 'C', label: 'mengaji seperti jantung' },
            { value: 'D', label: 'Opsi 4' },
        ]
    },
    {
        id: 9, text: 'Perhatikan puisi berikut!\n\nSiluet Gerimis — Karya Arya Gunawan\n(1) Sudah malam, kota, tidurlah bersama titik gerimis yang makin sayup dan suara bisik-bisik daun.\n(2) Hujan sudah selesai\n(3) Orang-orang di emperan melebur mimpi-mimpi berdebu\n(4) Menatap toko-toko yang ditutup sepanjang deretan gedung\n(5) Tinggal sunyi dan sinar lampu pucat\n\nIsi puisi di atas adalah ….',
        options: [
            { value: 'A', label: 'gambaran suasana kota malam hari setelah hujan yang tidak ada lagi aktivitas masyarakat karena sudah banyak yang istirahat' },
            { value: 'B', label: 'suasana malam hari yang sangat sunyi karena sebentar lagi akan turun hujan yang lebat' },
            { value: 'C', label: 'gambaran suatu kota yang sepi penghuninya karena kota tersebut diguyur hujan lebat' },
            { value: 'D', label: 'suatu kota pada malam hari yang dalam keadaan sepi pascagerimis' },
        ]
    },
    {
        id: 10, text: 'Pada tahun 2013, pemerintah telah membuat program pendidikan menengah universal sebagai rintisan wajib belajar dua belas tahun.\n\nKata rintisan pada kalimat di atas dapat bermakna ….',
        options: [
            { value: 'A', label: 'jalan usaha' },
            { value: 'B', label: 'usaha yang mula-mula sekali' },
            { value: 'C', label: 'sesuatu yang sudah ditiru' },
            { value: 'D', label: 'usaha yang dilakukan sendiri' },
        ]
    },
];

const SHARED_IPA: Question[] = [
    {
        id: 11, text: 'Proses Fotosintesis menghasilkan ….',
        options: [
            { value: 'A', label: 'CO₂ dan H₂O' }, { value: 'B', label: 'C₆H₁₂O₆ dan O₂' },
            { value: 'C', label: 'O₂ dan CO₂' }, { value: 'D', label: 'H₂O dan O₂' },
            { value: 'E', label: 'CO₂ dan O₂' },
        ]
    },
    {
        id: 12, text: 'Ciri yang membedakan tumbuhan dari hewan adalah ….',
        options: [
            { value: 'A', label: 'Reproduksi' }, { value: 'B', label: 'Pernapasan' },
            { value: 'C', label: 'Fotosintesis' }, { value: 'D', label: 'Mengeluarkan zat sisa' },
            { value: 'E', label: 'Bergerak' },
        ]
    },
    {
        id: 13, text: 'Apabila kita mengembuskan napas di depan cermin, maka cermin menjadi buram karena basah. Hal ini menunjukkan bahwa proses pernapasan menghasilkan ….',
        options: [
            { value: 'A', label: 'Hydrogen' }, { value: 'B', label: 'Oksigen' },
            { value: 'C', label: 'Uap air' }, { value: 'D', label: 'Karbon dioksida' },
            { value: 'E', label: 'Nitrogen' },
        ]
    },
    {
        id: 14, text: 'Kelompok vitamin berikut yang larut dalam lemak adalah ….',
        options: [
            { value: 'A', label: 'A, B, C, dan D' }, { value: 'B', label: 'A, B, D, dan E' },
            { value: 'C', label: 'A, C, E, dan K' }, { value: 'D', label: 'A, D, E, dan K' },
            { value: 'E', label: 'A, C, B, dan E' },
        ]
    },
    {
        id: 15, text: 'Darah bagi tubuh manusia berfungsi sebagai ….',
        options: [
            { value: 'A', label: 'Menetralkan racun dan sumber energi' },
            { value: 'B', label: 'Alat pengangkut dan pengatur suhu tubuh' },
            { value: 'C', label: 'Pengatur suhu tubuh dan sumber energi' },
            { value: 'D', label: 'Sumber energi dan menetralkan racun' },
            { value: 'E', label: 'Menetralkan racun dan alat pengangkut' },
        ]
    },
];

const SHARED_MAT: Question[] = [
    {
        id: 16, text: 'Pada lomba matematika, ditentukan untuk jawaban yang benar mendapat skor 2, jawaban yang salah mendapat skor -1, sedangkan jika tidak menjawab mendapat skor 0. Dari 75 soal yang diberikan, Aisyah dapat menjawab 50 soal dengan benar, namun 10 soal tidak dijawab. Skor yang diperoleh oleh Aisyah adalah …',
        options: [
            { value: 'A', label: '85' }, { value: 'B', label: '88' },
            { value: 'C', label: '96' }, { value: 'D', label: '100' },
            { value: 'E', label: '105' },
        ]
    },
    {
        id: 17, text: 'Jika x adalah penyelesaian dari 5x - 8 = 3x + 12, maka nilai dari x + 3 adalah ...',
        options: [
            { value: 'A', label: '7' }, { value: 'B', label: '11' },
            { value: 'C', label: '13' }, { value: 'D', label: '16' },
            { value: 'E', label: '18' },
        ]
    },
    {
        id: 18, text: 'Afnan membeli 5 pulpen dan 4 pensil dengan harga Rp30.000,00, sedangkan Firdaus membeli 2 pulpen dan 6 pensil dengan harga Rp23.000,00. Jika Syakir membeli 3 pulpen dan 2 pensil, maka jumlah yang harus ia bayar adalah …',
        options: [
            { value: 'A', label: 'Rp14.000,00' }, { value: 'B', label: 'Rp15.000,00' },
            { value: 'C', label: 'Rp16.000,00' }, { value: 'D', label: 'Rp17.000,00' },
            { value: 'E', label: 'Rp18.000,00' },
        ]
    },
    {
        id: 19, text: 'Suatu fungsi didefinisikan dengan rumus f(x) = 3 - 5x. Nilai f(-4) adalah ...',
        options: [
            { value: 'A', label: '17' }, { value: 'B', label: '23' },
            { value: 'C', label: '28' }, { value: 'D', label: '36' },
            { value: 'E', label: '39' },
        ]
    },
    {
        id: 20, text: 'Rata-rata nilai ulangan Matematika dari sekelompok siswa adalah 72. Jika seorang siswa baru dengan nilai 82 bergabung sehingga rata-rata menjadi 73, maka banyak siswa semula adalah …',
        options: [
            { value: 'A', label: '7' }, { value: 'B', label: '8' },
            { value: 'C', label: '9' }, { value: 'D', label: '10' },
            { value: 'E', label: '11' },
        ]
    },
];

// === PAI IL (5 soal, 5 opsi) ===
const PAI_IL: Question[] = [
    {
        id: 1, text: 'Makna/arti lafazh syahadat Asyhadu allaa ilaaha illallaah adalah ….',
        options: [
            { value: 'A', label: 'Aku bersaksi bahwa Muhammad adalah utusan Allah' },
            { value: 'B', label: 'Aku bersaksi bahwa tidak ada tuhan yang berhak di sembah kecuali Allah' },
            { value: 'C', label: 'Allah tidak ada sekutu bagi-Nya' },
            { value: 'D', label: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk' },
            { value: 'E', label: 'Dengan menyebut nama Allah yang maha pengasih dan penyayang' },
        ]
    },
    {
        id: 2, text: 'Rukun Iman ada 6 (enam), Iman kepada kitab Allah adalah rukun iman yang ke ….',
        options: [
            { value: 'A', label: '2' }, { value: 'B', label: '3' },
            { value: 'C', label: '4' }, { value: 'D', label: '5' },
            { value: 'E', label: '6' },
        ]
    },
    {
        id: 3, text: 'Syafiq adalah seorang peserta didik di salah satu SMP. Dia adalah anak yang soleh, selalu menjalankan tugas dan tanggung jawab dengan baik. Oleh karena itu dia terpilih jadi ketua kelas dan setahun kemudian terpilih jadi ketua OSIS.\n\nBerdasarkan ilustrasi tersebut, Syafiq telah meneladani salah satu sifat nabi dan rasul, yaitu …',
        options: [
            { value: 'A', label: 'Tabligh' }, { value: 'B', label: 'Amanah' },
            { value: 'C', label: 'Al Amiin' }, { value: 'D', label: 'Siddiiq' },
            { value: 'E', label: 'Fathanah' },
        ]
    },
    {
        id: 4, text: 'Allah berada di ….',
        options: [
            { value: 'A', label: 'Di mana-mana' }, { value: 'B', label: 'Di dalam hati' },
            { value: 'C', label: 'Di atas lautan luas' }, { value: 'D', label: 'Di atas Arsy' },
            { value: 'E', label: 'Menyatu dengan hamba' },
        ]
    },
    {
        id: 5, text: 'Khalifah Ketiga sepeninggal Rasulullah Muhammad shallallahu alaihi wa sallam wafat adalah ….',
        options: [
            { value: 'A', label: 'Ali Bin Abi Thalib' }, { value: 'B', label: 'Ustman Bin Affan' },
            { value: 'C', label: 'Abdullah Bin Zubeir' }, { value: 'D', label: 'Abu Bakar Ash Shiddiq' },
            { value: 'E', label: 'Umar Bin Khattab' },
        ]
    },
];

// === PAI SMA/MA — Nahwu (5 soal, 4 opsi, bahasa Arab) ===
const PAI_MA: Question[] = [
    {
        id: 1, text: 'اختر المبتدأ في الجملة: الْعِلْمُ نُورٌ',
        options: [
            { value: 'A', label: 'العلم' }, { value: 'B', label: 'نور' },
            { value: 'C', label: 'ال' }, { value: 'D', label: 'جملة' },
        ]
    },
    {
        id: 2, text: 'ما علامة رفع الفاعل في الجملة:\n«جاءَ الطُّلاَّبُ»',
        options: [
            { value: 'A', label: 'الضمة' }, { value: 'B', label: 'الفتحة' },
            { value: 'C', label: 'الكسرة' }, { value: 'D', label: 'السكون' },
        ]
    },
    {
        id: 3, text: 'في جملة «سافَرَ أحمدُ إلى مكةَ»، كلمة «مكةَ» إعرابها …',
        options: [
            { value: 'A', label: 'فاعل مرفوع' }, { value: 'B', label: 'مفعول به منصوب' },
            { value: 'C', label: 'اسم مجرور' }, { value: 'D', label: 'ظرف منصوب' },
        ]
    },
    {
        id: 4, text: 'أيُّ الجمل الآتية جملةٌ اسميَّة؟',
        options: [
            { value: 'A', label: 'يكتب الطالب الدرس' }, { value: 'B', label: 'الطالب مجتهد' },
            { value: 'C', label: 'سافر المعلم' }, { value: 'D', label: 'أكل الولد التفاحة' },
        ]
    },
    {
        id: 5, text: 'في قولنا: «مَرَرْتُ بِالمُعَلِّمِ»، كلمة «المُعَلِّمِ» مجرورة بسبب …',
        options: [
            { value: 'A', label: 'كونها مفعولا به' }, { value: 'B', label: 'دخول الباء عليها' },
            { value: 'C', label: 'كونها فاعلا' }, { value: 'D', label: 'كونها مبتدأ' },
        ]
    },
];

export const AKADEMIK_IL: Question[] = [...PAI_IL, ...SHARED_BINDO, ...SHARED_IPA, ...SHARED_MAT];
export const AKADEMIK_MA: Question[] = [...PAI_MA, ...SHARED_BINDO, ...SHARED_IPA, ...SHARED_MAT];
