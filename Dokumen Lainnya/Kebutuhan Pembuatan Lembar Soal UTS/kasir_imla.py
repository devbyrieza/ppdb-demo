# ==============================================================
# PROGRAM KASIR DIGITAL TOKO IMLA - PESANTREN AL-ANDALUS
# Matematika & Logika Komputasi Kelas 7 MTs
# Pembimbing: Ustaz Rieza Eka Tomara, S.Kom.
# ==============================================================

import time

print("\n" + "="*45)
print("      🏪 TOKO IMLA PESANTREN AL-ANDALUS      ")
print("      Pusat Jajan & Kebutuhan Santri         ")
print("="*45)

# 1. Tentukan Barang & Harga
barang = "Susu Kurma Imla"
harga = 8000
print(f"Barang Dibeli : {barang}")
print(f"Harga Satuan  : Rp {harga:,}")
print("-" * 45)

# 2. Input dari Santri
santri = input("Nama Santri Pembeli : ")
uang = int(input("Masukkan Uang Bayar : Rp "))

print("\nSedang memproses struk kasir...", end="", flush=True)
time.sleep(1)
print(" SELESAI!\n")

# 3. Logika IF - ELSE
print("*" * 45)
print(f"STRUK BELANJA TOKO IMLA - SANTRI: {santri.upper()}")
print("*" * 45)

if uang >= harga:
    kembalian = uang - harga
    print(f"STATUS     : [ LUNAS & BERHASIL ] ✅")
    print(f"Total      : Rp {harga:,}")
    print(f"Bayar      : Rp {uang:,}")
    print(f"Kembalian  : Rp {kembalian:,}")
    print("-" * 45)
    print("PESAN KASIR:")
    print(">> 'Alhamdulillah lunas! Syukron sudah jajan di Toko Imla!'")
else:
    kurang = harga - uang
    print(f"STATUS     : [ TRANSAKSI DITOLAK ] ❌")
    print(f"Total      : Rp {harga:,}")
    print(f"Bayar      : Rp {uang:,}")
    print(f"Kurang     : Rp {kurang:,}")
    print("-" * 45)
    print("PESAN KASIR:")
    print(">> 'Afwan ya akhi, uang antum kurang! Barang disimpan di rak lagi.'")

print("="*45 + "\n")
