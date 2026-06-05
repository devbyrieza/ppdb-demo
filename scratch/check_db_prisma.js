const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Querying pg_stat_activity via Prisma ---');
  try {
    const counts = await prisma.$queryRawUnsafe('SELECT count(*), state FROM pg_stat_activity GROUP BY state;');
    console.log('Connection states:');
    console.table(counts);

    const active = await prisma.$queryRawUnsafe(`
      SELECT pid, query, state, age(clock_timestamp(), query_start) as duration 
      FROM pg_stat_activity 
      WHERE state != 'idle' AND query NOT LIKE '%pg_stat_activity%' AND query NOT LIKE '%SELECT pid, query%';
    `);
    console.log('Active queries:');
    console.table(active);
  } catch (err) {
    console.error('Error querying DB:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
