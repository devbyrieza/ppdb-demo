import { createHmac } from "crypto";

const MAGIC_LINK_SECRET =
  process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

// Fixed expiration for "permanent" links (Year 2099) to ensure token doesn't change
export const PERMANENT_EXPIRATION = 4070908800000;

// Token Structure: base64(payload).signature
// payload: { id: string, role: string, full_name: string, exp: number }

export function generateMagicToken(
  profileId: string,
  role: string,
  fullName: string,
  expiresInHours = 24,
  redirect?: string,
): string {
  // If expiresInHours is -1, use the fixed PERMANENT_EXPIRATION
  const exp =
    expiresInHours === -1
      ? PERMANENT_EXPIRATION
      : Date.now() + expiresInHours * 60 * 60 * 1000;

  const payload = { id: profileId, role, full_name: fullName, exp, redirect };

  // Convert payload to base64
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");

  // Create HMAC SHA256 signature
  const signature = createHmac("sha256", MAGIC_LINK_SECRET)
    .update(payloadStr)
    .digest("hex");

  return `${payloadStr}.${signature}`;
}

export function verifyMagicToken(token: string): {
  valid: boolean;
  data?: { id: string; role: string; full_name: string; redirect?: string };
  reason?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, reason: "Format token tidak valid" };
    }

    const [payloadStr, signature] = parts;

    // Verify signature
    const expectedSignature = createHmac("sha256", MAGIC_LINK_SECRET)
      .update(payloadStr)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, reason: "Token rusak atau dimanipulasi" };
    }

    // Decode and parse payload
    const decodedPayload = Buffer.from(payloadStr, "base64").toString("utf-8");
    const payload = JSON.parse(decodedPayload);

    // Check expiration
    if (Date.now() > payload.exp) {
      return {
        valid: false,
        reason: "URL kedaluwarsa. Silakan minta yang baru.",
      };
    }

    return {
      valid: true,
      data: {
        id: payload.id,
        role: payload.role,
        full_name: payload.full_name,
        redirect: payload.redirect,
      },
    };
  } catch (error) {
    return { valid: false, reason: "Terjadi kesalahan saat verifikasi" };
  }
}



/**
 * Get internal short link (permanent) for a slug
 * Supports optional pendaftar number for deep-linking
 */
export function getPermanentAuthUrl(
  slug: string,
  pendaftarNomor?: string,
  baseUrlOverride?: string,
): string {
  const baseUrl = baseUrlOverride || process.env.NEXT_PUBLIC_APP_URL || "/daftar";
  let url = `${baseUrl}/api/auth/short/${slug}`;
  if (pendaftarNomor) {
    url += `?p=${encodeURIComponent(pendaftarNomor)}`;
  }
  return url;
}

/**
 * Generate automatic short URL for any long URL
 * If it's an internal magic link, it converts it to /x/[id] locally.
 * Otherwise, it tries is.gd/TinyURL as a fallback.
 */
export async function generateShortLink(longUrl: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ppdb-demo.vercel.app";

  try {
    // 1. Check if it's an internal magic link
    const urlObj = new URL(longUrl);
    const token = urlObj.searchParams.get("token");
    if (token) {
      const verified = verifyMagicToken(token);
      if (verified.valid && verified.data) {
        const id = verified.data.id;
        
        let customUrl = `${baseUrl}/x/${id}`;
        
        // If there's a redirect that contains a search parameter (like pendaftarNomor)
        if (verified.data.redirect) {
          const redirectObj = new URL(verified.data.redirect, baseUrl);
          const searchParam = redirectObj.searchParams.get("search");
          if (searchParam) {
            customUrl += `?p=${encodeURIComponent(searchParam)}`;
          }
        }
        
        // Return instantly, zero loading time!
        return customUrl;
      }
    }
  } catch (e) {
    // Fall back if parsing fails
  }

  try {
    // 2. Try is.gd (very fast & clean redirects) for non-magic links
    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (response.ok) {
      const shortUrl = await response.text();
      if (shortUrl && shortUrl.startsWith("http")) {
        return shortUrl.trim();
      }
    }
  } catch (error) {
    console.warn("Failed to generate is.gd short URL, trying TinyURL...", error);
  }

  try {
    // 3. Try TinyURL as fallback
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (response.ok) {
      const shortUrl = await response.text();
      if (shortUrl && shortUrl.startsWith("http")) {
        return shortUrl.trim();
      }
    }
  } catch (error) {
    console.error("Failed to generate TinyURL:", error);
  }

  // Fallback to original URL if everything fails
  return longUrl;
}


// ============================================================================
// PERMANENT SHORT LINKS MAPPING (Slug -> Name query)
// ============================================================================

export const PERMANENT_SLUGS: Record<string, string> = {
  abah: "Abah",
  agus: "Agus Cahyono",
  fuad: "Fuad Khomsatun",
  jusman: "Jusman",
  bachtiar: "Maulidin Bachtiar",
  muhajir: "Muhajir",
  syauqi: "Muhammad Syauqi Al Faruq",
  teguh: "Teguh",
  halimah: "Halimah Fauziah",
  fatimah: "Andi Fatimah",
};

/**
 * Get slug by full name matching
 */
export function getSlugByName(fullName: string): string | null {
  if (!fullName) return null;
  const normalized = fullName.trim().toLowerCase();
  const entry = Object.entries(PERMANENT_SLUGS).find(
    ([_, name]) => name.toLowerCase() === normalized,
  );
  return entry ? entry[0] : null;
}
