# ==============================================================================
# 🤖 GAME EDUKASI LOGIKA MATEMATIKA: ROBOT PENJELAJAH MARS (40 MENIT)
# Guru: Ustaz Rieza Eka Tomara, S.Kom
# Santri: MTs Kelas 7 (19 Santri - 4 Tim)
# ==============================================================================

import time
import os
import sys

# Peta Labirin:
# . = Lintasan Aman
# B = Batu Rintangan (Batu Karang)
# P = Piala Kemenangan (Finish)
PETA = [
    [".", ".", "B", ".", "."],
    ["B", ".", "B", ".", "B"],
    [".", ".", ".", ".", "P"]
]

TIM_DATA = {
    1: {"nama": "Tim 1 (Rifqi Hamid, Haidar, Atqan, Fariq, Dzaki)", "warna": "\033[93m"},
    2: {"nama": "Tim 2 (Fazril, Hafidz, Da Silva, Aziz, Ayyash)", "warna": "\033[92m"},
    3: {"nama": "Tim 3 (Labib, Naufal Alfaniri, Rifqi Arsyad, Ibra, Azka)", "warna": "\033[96m"},
    4: {"nama": "Tim 4 (Khalish, Farros, Abdul Hakim, Azzam)", "warna": "\033[95m"}
}

RESET_WARNA = "\033[0m"

class RobotSimulator:
    def __init__(self, nama_tim="Demo Ustaz", kecepatan=0.55):
        self.r = 0
        self.c = 0
        self.arah = "KANAN"  # KANAN, BAWAH, KIRI, ATAS
        self.nama_tim = nama_tim
        self.kecepatan = kecepatan
        self.langkah_total = 0
        self.nabrak = False
        self.menang = False

    def render(self, status=""):
        os.system('cls' if os.name == 'nt' else 'clear')
        print("=" * 55)
        print("🚀 SIMULASI LOGIKA: MISI PENJELAJAH MARS 🚀")
        print(f"🎮 Pengendali: {self.nama_tim}")
        print("=" * 55)
        
        for i in range(len(PETA)):
            baris = "   "
            for j in range(len(PETA[0])):
                if i == self.r and j == self.c:
                    baris += " 🤖 "
                elif PETA[i][j] == "B":
                    baris += " 🪨 "
                elif PETA[i][j] == "P":
                    baris += " 🏆 "
                else:
                    baris += " ·  "
            print(baris)
            print()
            
        print("=" * 55)
        print(f"📍 Posisi: ({self.r}, {self.c}) | Arah: {self.arah} | Langkah: {self.langkah_total}")
        print(f"📡 Radar: {status}")
        print("=" * 55)
        time.sleep(self.kecepatan)

    def sensor_depan(self):
        dr, dc = 0, 0
        if self.arah == "KANAN": dc = 1
        elif self.arah == "BAWAH": dr = 1
        elif self.arah == "KIRI": dc = -1
        elif self.arah == "ATAS": dr = -1
        
        nr, nc = self.r + dr, self.c + dc
        if 0 <= nr < len(PETA) and 0 <= nc < len(PETA[0]):
            simbol = PETA[nr][nc]
            if simbol == "B": return "BATU"
            elif simbol == "P": return "PIALA"
            else: return "AMAN"
        return "TEMBOK"

    def maju(self):
        if self.sensor_depan() in ["BATU", "TEMBOK"]:
            self.nabrak = True
            self.render("💥 DUARRR! ROBOT MENABRAK RINTANGAN!")
            return False
            
        if self.arah == "KANAN": self.c += 1
        elif self.arah == "BAWAH": self.r += 1
        elif self.arah == "KIRI": self.c -= 1
        elif self.arah == "ATAS": self.r -= 1
        
        self.langkah_total += 1
        
        if PETA[self.r][self.c] == "P":
            self.menang = True
            self.render("🎉 BINGO! PIALA KEMENANGAN DIRAIH! 🏆")
            return False
            
        self.render("Maju 1 langkah...")
        return True

    def belok_kanan(self):
        urutan = ["KANAN", "BAWAH", "KIRI", "ATAS"]
        idx = (urutan.index(self.arah) + 1) % 4
        self.arah = urutan[idx]
        self.render(f"Belok Kanan ↩️ (Menghadap {self.arah})")

    def belok_kiri(self):
        urutan = ["KANAN", "BAWAH", "KIRI", "ATAS"]
        idx = (urutan.index(self.arah) - 1) % 4
        self.arah = urutan[idx]
        self.render(f"Belok Kiri ↪️ (Menghadap {self.arah})")


# ==============================================================================
# LOGIKA TIM: Silakan sesuaikan logika saat tim maju ke laptop guru!
# ==============================================================================
def eksekusi_otak_robot(bot, pilihan_logika):
    for step in range(16):
        if bot.nabrak or bot.menang:
            break
            
        radar = bot.sensor_depan()

        if pilihan_logika == "demo_bodoh":
            # DEMO PEMBUKA OLEH GURU: Robot bodoh hanya tahu maju
            bot.maju()

        elif pilihan_logika == "logika_resmi":
            # Logika Cerdas: Menghindari Batu & Tembok
            if radar == "PIALA":
                bot.maju()
            elif radar == "AMAN":
                bot.maju()
            elif radar == "BATU" or radar == "TEMBOK":
                bot.belok_kanan()
                if bot.sensor_depan() == "AMAN":
                    bot.maju()
                    bot.belok_kiri()
                else:
                    bot.belok_kiri()
                    bot.belok_kiri()
                    bot.maju()

        elif pilihan_logika == "custom_tim":
            # Tempat Ustaz mengetik kode hasil diskusi tim yang maju
            # CONTOH KODE YANG BISA DIKETIK BERSAMA TIM:
            if radar == "PIALA":
                bot.maju()
            elif radar == "AMAN":
                bot.maju()
            elif radar == "BATU":
                bot.belok_kanan()
                bot.maju()
                bot.belok_kiri()
            elif radar == "TEMBOK":
                bot.belok_kanan()


def main():
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print("=" * 55)
        print("🎮 KONTROL GURU: MISI 40 MENIT ROBOT MARS")
        print("   Ustaz Rieza Eka Tomara, S.Kom - MTs Al-Andalus")
        print("=" * 55)
        print("1. [DEMO GURU] Robot Bodoh (Menabrak Batu)")
        print("2. [TEST RUN] Uji Coba Tim 1 (Rifqi Hamid dkk)")
        print("3. [TEST RUN] Uji Coba Tim 2 (Fazril dkk)")
        print("4. [TEST RUN] Uji Coba Tim 3 (Labib dkk)")
        print("5. [TEST RUN] Uji Coba Tim 4 (Khalish dkk)")
        print("6. [LIVE CODING] Ketik Langsung Logika Tim")
        print("0. Keluar")
        print("=" * 55)
        
        pilihan = input("Pilih menu (0-6): ").strip()
        
        if pilihan == "0":
            print("\nSampai jumpa di kelas Jumat!")
            break
        elif pilihan == "1":
            bot = RobotSimulator(nama_tim="DEMO GURU (Robot Tanpa Logika)")
            bot.render("Robot diaktifkan tanpa kode if-else...")
            eksekusi_otak_robot(bot, "demo_bodoh")
            input("\nTekan Enter untuk kembali ke menu...")
        elif pilihan in ["2", "3", "4", "5"]:
            tim_id = int(pilihan) - 1
            info = TIM_DATA[tim_id]
            bot = RobotSimulator(nama_tim=info["nama"])
            bot.render("Memuat baris algoritma tim...")
            eksekusi_otak_robot(bot, "logika_resmi")
            input("\nTekan Enter untuk kembali ke menu...")
        elif pilihan == "6":
            nama = input("Nama Tim yang maju: ")
            bot = RobotSimulator(nama_tim=f"Live Coding: {nama}")
            bot.render("Siap menerima komando...")
            eksekusi_otak_robot(bot, "custom_tim")
            input("\nTekan Enter untuk kembali ke menu...")

if __name__ == "__main__":
    main()
