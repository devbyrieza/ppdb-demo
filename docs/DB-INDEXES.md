DB Indexes — Panduan penerapan

File `prisma/migrations/20260131_add_indexes.sql` berisi perintah SQL untuk membuat indeks pada tabel `pendaftar`:

- `provinsi`, `kabupaten`, `kecamatan`, `kelurahan`, `tahun_ajaran_id`
- Beberapa composite index opsional untuk kombinasi yang sering digunakan

Cara menjalankan:

1) Supabase SQL Editor
   - Buka Project → SQL Editor → New Query
   - Paste isi `prisma/migrations/20260131_add_indexes.sql` dan jalankan.

2) psql (CLI)
   - Pastikan koneksi ke database (env vars atau connection string)
   - Jalankan:

```bash
psql "postgres://user:password@host:port/dbname" -f prisma/migrations/20260131_add_indexes.sql
```

Catatan penting:
- `CREATE INDEX CONCURRENTLY` tidak boleh dijalankan di dalam transaction; jika psql mengeksekusi file dalam transaksi, jalankan statement secara terpisah atau gunakan SQL Editor Supabase.
- Indexing dapat memakan waktu pada tabel besar; `CONCURRENTLY` mengurangi blocking tetapi masih membutuhkan waktu.
- Setelah indeks dibuat, jalankan kembali pengujian filter untuk melihat peningkatan performa.
