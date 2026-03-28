// Simple test script to verify location endpoints and admin list/export auth responses.
// Usage: node scripts/test-locations.js

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: res.status, body, headers: Object.fromEntries(res.headers) };
}

async function run() {
  console.log('Base URL:', BASE);

  const endpoints = [
    '/api/admin/locations/provinsi',
    '/api/admin/locations/kabupaten',
    '/api/admin/locations/kecamatan',
    '/api/admin/locations/kelurahan',
  ];

  let ok = true;

  for (const ep of endpoints) {
    try {
      const r = await fetchJson(ep);
      console.log(`GET ${ep} -> ${r.status}`);
      if (r.status === 200) {
        if (!Array.isArray(r.body?.data)) {
          console.error('  Unexpected body, expected { data: [] }');
          ok = false;
        } else {
          console.log(`  items: ${r.body.data.length}`);
        }
      } else {
        console.warn('  Non-200 response, body:', r.body);
      }
    } catch (err) {
      console.error(`Error fetching ${ep}:`, err);
      ok = false;
    }
  }

  // Check admin-protected endpoints (expect 401/403 when unauthenticated)
  const protected = ['/api/admin/pendaftar/list?page=1&limit=1', '/api/admin/pendaftar/export?limit=1'];
  for (const ep of protected) {
    try {
      const r = await fetchJson(ep);
      console.log(`GET ${ep} -> ${r.status}`);
      if (![401,403].includes(r.status)) {
        console.warn('  Protected endpoint did not return 401/403 as expected when unauthenticated.');
      }
    } catch (err) {
      console.error(`Error fetching ${ep}:`, err);
      ok = false;
    }
  }

  if (!ok) {
    console.error('One or more tests failed.');
    process.exit(1);
  }

  console.log('All checks completed. If running dev server with auth, expect different results for protected endpoints.');
}

run();
