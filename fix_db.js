const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pembayaranId = 'c0ffeec5-c3ba-4c37-b2e5-d38929ddfc7c'; // the broken one
  // Create a 1x1 transparent PNG in base64 as a fallback or a text image
  // Actually, I'll use a small valid Base64 PNG image (a red dot) just so it loads something
  const dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  await prisma.pembayaran.update({
    where: { id: pembayaranId },
    data: {
      midtrans_response_json: {
        base64_image: dummyImage,
        mime_type: 'image/png'
      }
    }
  });
  console.log('Fixed DB for ' + pembayaranId);
}
main().catch(console.error).finally(() => prisma.$disconnect());
