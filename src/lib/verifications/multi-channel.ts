// lib/verification/multi-channel.ts
export function generateOTP(length = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function normalizePhone(phone: string): string {
  // Format: 081234567890 → +6281234567890
  let normalized = phone.replace(/\D/g, "");

  if (normalized.startsWith("0")) {
    normalized = "62" + normalized.substring(1);
  } else if (!normalized.startsWith("62")) {
    normalized = "62" + normalized;
  }

  return "+" + normalized;
}

export function validatePhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+62\d{9,12}$/.test(normalized);
}

// Rate limiting untuk mencegah abuse
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(
  identifier: string,
  limit = 3,
  windowMs = 60000,
): boolean {
  const now = Date.now();
  const entry = rateLimit.get(identifier);

  if (!entry) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (now - entry.timestamp > windowMs) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  rateLimit.set(identifier, {
    count: entry.count + 1,
    timestamp: entry.timestamp,
  });
  return true;
}
