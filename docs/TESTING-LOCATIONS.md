Manual verification steps for location endpoints and admin pendaftar filters

1. Start dev server

   ```bash
   npm run dev
   ```

2. Run quick script (expects dev server running on http://localhost:3000)

   ```bash
   npm run test:locations
   ```

3. Expected results
   - `/api/admin/locations/provinsi` returns 200 and `{ data: [...] }`
   - `/api/admin/locations/kabupaten?provinsi=...` returns 200 and `{ data: [...] }`
   - `/api/admin/locations/kecamatan?kabupaten=...` returns 200 and `{ data: [...] }`
   - `/api/admin/locations/kelurahan?kecamatan=...` returns 200 and `{ data: [...] }`
   - `/api/admin/pendaftar/list` and `/api/admin/pendaftar/export` should return 401/403 when unauthenticated

4. Notes
   - If you run the dev server with authentication session, protected endpoints will return actual data.
   - Adjust `BASE_URL` env var if dev server runs on a different host/port.
