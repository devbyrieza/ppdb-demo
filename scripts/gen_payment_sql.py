import subprocess

RAYLAN_ID = '439d5b81-2c53-42ac-872c-f6983088b999'
SUKARI_ID = 'c92cffea-590c-40ba-9263-c793ba207d57'
TA_ID     = '33acea8f-5049-4a0a-a064-ede33db6d133f'

lines = [
  "BEGIN;",
  "INSERT INTO pembayaran (pendaftar_id, tahun_ajaran_id, metode_pembayaran, jumlah, bukti_transfer_path, bukti_transfer_filename, status_pembayaran, created_at, updated_at)",
  f"VALUES ('{RAYLAN_ID}', '{TA_ID}', 'manual', 200000, 'bukti-pembayaran/{RAYLAN_ID}/bukti-pendaftaran-1771917391862.jpg', 'bukti-pendaftaran-1771917391862.jpg', 'pending', NOW(), NOW());",
  "INSERT INTO pembayaran (pendaftar_id, tahun_ajaran_id, metode_pembayaran, jumlah, bukti_transfer_path, bukti_transfer_filename, status_pembayaran, created_at, updated_at)",
  f"VALUES ('{SUKARI_ID}', '{TA_ID}', 'manual', 200000, 'bukti-pembayaran/{SUKARI_ID}/bukti-transfer-1771554043817.jpg', 'bukti-transfer-1771554043817.jpg', 'pending', NOW(), NOW());",
  "COMMIT;",
  "SELECT p.nama_lengkap, pb.status_pembayaran, pb.bukti_transfer_filename FROM pembayaran pb JOIN pendaftar p ON pb.pendaftar_id = p.id ORDER BY p.nama_lengkap;"
]

sql = "\n".join(lines)

with open('/tmp/pay_final.sql', 'w') as f:
    f.write(sql)

print("SQL written to /tmp/pay_final.sql")
print(sql)
