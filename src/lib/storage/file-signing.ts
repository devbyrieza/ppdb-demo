import crypto from "crypto";

/**
 * Signed URL untuk file surat pengumuman — dipakai Wablas (server-to-server)
 * yang tidak membawa cookie sesi. Token = HMAC(path) dengan APP_SECRET.
 */

function getSecret(): string {
  return (
    process.env.APP_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.DATABASE_URL ||
    "al-andalus-surat-fallback"
  );
}

export function signFilePath(relativePath: string): string {
  return crypto.createHmac("sha256", getSecret()).update(relativePath).digest("hex").slice(0, 32);
}

export function verifyFilePath(relativePath: string, token: string): boolean {
  if (!token) return false;
  const expected = signFilePath(relativePath);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
