const bcrypt = require('bcryptjs');
const fs = require('fs');

async function main() {
    const password = 'HeadIT26!';
    const hash = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO profiles (id, role, full_name, email, phone, password_hash, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'head_of_it',
  'Head of IT',
  'headit@pesantren-alimam.com',
  '085111524441',
  '${hash}',
  NOW(),
  NOW()
);`;

    fs.writeFileSync('prisma/seed_admin.sql', sql);
    console.log('SQL written to prisma/seed_admin.sql');
    console.log('Hash:', hash);
}

main();
