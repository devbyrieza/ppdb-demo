import type { Question } from './types';

export const AKADEMIK_MTS: Question[] = [
    // === PAI (5 soal) ===
    {
        id: 1, text: 'Makna/arti lafazh syahadat Asyhadu allaa ilaaha illallaah adalah ….',
        options: [
            { value: 'A', label: 'Aku bersaksi bahwa Muhammad adalah utusan Allah' },
            { value: 'B', label: 'Aku bersaksi bahwa tidak ada tuhan yang berhak di sembah kecuali Allah' },
            { value: 'C', label: 'Allah tidak ada sekutu bagi-Nya' },
            { value: 'D', label: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk' },
        ]
    },
    {
        id: 2, text: 'Rukun Iman ada 6 (enam), percaya kepada qadha\' dan qadar adalah rukun iman yang ke ….',
        options: [
            { value: 'A', label: '2' }, { value: 'B', label: '3' },
            { value: 'C', label: '5' }, { value: 'D', label: '6' },
        ]
    },
    {
        id: 3, text: 'Idul fitri dilaksanakan pada ….',
        options: [
            { value: 'A', label: '1 Syawwal' }, { value: 'B', label: '2 Syawwal' },
            { value: 'C', label: '3 Syawwal' }, { value: 'D', label: '4 Syawwal' },
        ]
    },
    {
        id: 4, text: 'Surat yang diterima Nabi Muhammad shallallahu alaihi wa sallam saat diangkat menjadi rasul adalah surat ….',
        options: [
            { value: 'A', label: 'Al Fatihah' }, { value: 'B', label: 'Al \'Alaq' },
            { value: 'C', label: 'Al Maidah' }, { value: 'D', label: 'Al Baqoroh' },
        ]
    },
    {
        id: 5, text: 'Khalifah keempat yang merupakan sepupu sekaligus menantu Nabi Muhammad shallallahu alaihi wa sallam adalah ….',
        options: [
            { value: 'A', label: 'Abu Bakar Ash Shiddiiq' }, { value: 'B', label: 'Umar Bin Khattab' },
            { value: 'C', label: 'Ali Bin Abi Thalib' }, { value: 'D', label: 'Utsman Bin Affan' },
        ]
    },
    // === Bahasa Indonesia (5 soal) ===
    {
        id: 6, text: 'Sinonim dari kata rajin adalah ….',
        options: [
            { value: 'A', label: 'giat' }, { value: 'B', label: 'malas' },
            { value: 'C', label: 'humoris' }, { value: 'D', label: 'enggan' },
        ]
    },
    {
        id: 7, text: 'Perhatikan kalimat di bawah ini!\n\n(1) Annisa adalah anak yang baik.\n(2) Ainun adalah anak yang baik.\n(3) Annisa … Ainun adalah anak yang baik.\n\nKata penghubung yang tepat untuk melengkapi kalimat 3 adalah ….',
        options: [
            { value: 'A', label: 'dan' }, { value: 'B', label: 'atau' },
            { value: 'C', label: 'tetapi' }, { value: 'D', label: 'sedangkan' },
        ]
    },
    {
        id: 8, text: '"Aku ingin belajar di pesantren", kata Hafsah.\n\nKalimat di atas jika diubah menjadi kalimat tidak langsung menjadi …',
        options: [
            { value: 'A', label: 'Hafsah mengatakan bahwa aku ingin belajar di pesantren.' },
            { value: 'B', label: 'Hafsah mengatakan bahwa ia ingin belajar di pesantren.' },
            { value: 'C', label: 'Hafsah berkata aku ingin belajar di pesantren.' },
            { value: 'D', label: 'Aku berkata Hafsah ingin belajar di pesantren.' },
        ]
    },
    {
        id: 9, text: 'Bacalah kutipan teks berikut ini!\n\n(1) Matahari adalah salah satu bintang di dalam tata surya kita yang menghasilkan panas dan cahaya. (2) Panas dan cahaya Matahari inilah yang memberikan kehidupan di bumi. (3) Perubahan panas Matahari dapat menyebabkan kehidupan makhluk hidup di bumi juga berpengaruh. (4) Jika panas Matahari berkurang, seluruh bagian di dunia akan membeku.\n\nGagasan utama paragraf di atas terdapat dalam kalimat ….',
        options: [
            { value: 'A', label: 'Kalimat 1' }, { value: 'B', label: 'Kalimat 2' },
            { value: 'C', label: 'Kalimat 3' }, { value: 'D', label: 'Kalimat 4' },
        ]
    },
    {
        id: 10, text: 'Berdasarkan teks di atas, apa yang dihasilkan oleh matahari?',
        options: [
            { value: 'A', label: 'kehidupan' }, { value: 'B', label: 'perubahan' },
            { value: 'C', label: 'tata surya' }, { value: 'D', label: 'cahaya' },
        ]
    },
    // === IPA (5 soal) ===
    {
        id: 11, text: 'Kutu memperoleh makanan dengan mengisap darah dari tubuh hewan yang dihinggapinya, sehingga hewan tersebut mengalami pertumbuhan yang tidak sehat dan terganggu.\n\nHubungan kedua makhluk ini disebut simbiosis ….',
        options: [
            { value: 'A', label: 'Mutualisme' }, { value: 'B', label: 'Komensalisme' },
            { value: 'C', label: 'Parasitisme' }, { value: 'D', label: 'Amensalisme' },
        ]
    },
    {
        id: 12, text: 'Di bawah ini yang bukan termasuk makhluk hidup yaitu ….',
        options: [
            { value: 'A', label: 'Manusia' }, { value: 'B', label: 'Angin' },
            { value: 'C', label: 'Hewan' }, { value: 'D', label: 'Tumbuhan' },
        ]
    },
    {
        id: 13, text: 'Dalam ekosistem sawah, urutan rantai makanan yang benar adalah ….',
        options: [
            { value: 'A', label: 'Padi → Tikus → Ular → Elang' },
            { value: 'B', label: 'Padi → Ular → Tikus → Elang' },
            { value: 'C', label: 'Elang → Ular → Tikus → Padi' },
            { value: 'D', label: 'Tikus → Padi → Ular → Elang' },
        ]
    },
    {
        id: 14, text: 'Ciri utama daun sebagai organ fotosintesis adalah ….',
        options: [
            { value: 'A', label: 'Menghasilkan klorofil' }, { value: 'B', label: 'Adanya pertulangan daun' },
            { value: 'C', label: 'Daun yang pipih dan lebar' }, { value: 'D', label: 'Memiliki stomata' },
        ]
    },
    {
        id: 15, text: 'Contoh hewan karnivora dari bangsa reptil adalah sebagai berikut, kecuali ….',
        options: [
            { value: 'A', label: 'Kelinci' }, { value: 'B', label: 'Kadal' },
            { value: 'C', label: 'Buaya' }, { value: 'D', label: 'Komodo' },
        ]
    },
    // === Matematika (5 soal) ===
    {
        id: 16, text: 'Hasil dari (-20) x 3 + 24 : (-6) = ....',
        options: [
            { value: 'A', label: '64' }, { value: 'B', label: '56' },
            { value: 'C', label: '-56' }, { value: 'D', label: '-64' },
        ]
    },
    {
        id: 17, text: 'Berapakah hasil dari 4 x 1/8 : 2/3 ?',
        options: [
            { value: 'A', label: '3/4' }, { value: 'B', label: '4/3' },
            { value: 'C', label: '3/8' }, { value: 'D', label: '1' },
        ]
    },
    {
        id: 18, text: 'Umar bersepeda dari rumah ke pasar dengan kecepatan 120 meter/menit. Ia tiba di pasar dalam waktu 15 menit. Berapa meter jarak rumah Umar dari pasar?',
        options: [
            { value: 'A', label: '1.250 meter' }, { value: 'B', label: '1.575 meter' },
            { value: 'C', label: '1.800 meter' }, { value: 'D', label: '2.100 meter' },
        ]
    },
    {
        id: 19, text: 'Sebuah persegi panjang mempunyai panjang 7 cm dan lebar 4 cm, hitunglah keliling persegi panjang tersebut.',
        options: [
            { value: 'A', label: '28 cm' }, { value: 'B', label: '22 cm' },
            { value: 'C', label: '20 cm' }, { value: 'D', label: '11 cm' },
        ]
    },
    {
        id: 20, text: 'Nilai ulangan Matematika dari 5 siswa adalah: 80, 70, 90, 60, dan 75. Rata-rata nilai ulangan mereka adalah ….',
        options: [
            { value: 'A', label: '70' }, { value: 'B', label: '75' },
            { value: 'C', label: '80' }, { value: 'D', label: '85' },
        ]
    },
];
