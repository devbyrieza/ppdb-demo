import { createHmac } from "crypto";

const MAGIC_LINK_SECRET =
    process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev-2026";

/**
 * Token Structure: base64(payload).signature
 * payload: { id: string, role: string, full_name: string, exp: number }
 */

export function generateMagicToken(
    profileId: string,
    role: string,
    fullName: string,
    expiresInHours = 24,
    redirect?: string
): string {
    const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
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
            return { valid: false, reason: "URL kedaluwarsa. Silakan minta yang baru." };
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

// ============================================================================
// PERMANENT SHORT LINKS MAPPING (Slug -> Name query)
// ============================================================================

export const PERMANENT_SLUGS: Record<string, string> = {
    "abah": "Abah",
    "agus": "Agus Cahyono",
    "fuad": "Fuad Khomsatun",
    "jusman": "Jusman",
    "bachtiar": "Maulidin Bachtiar",
    "muhajir": "Muhajir",
    "syauqi": "Muhammad Syauqi Al Faruq",
    "teguh": "Teguh"
};

/**
 * Get slug by full name matching
 */
export function getSlugByName(fullName: string): string | null {
    if (!fullName) return null;
    const normalized = fullName.trim().toLowerCase().replace(/\s+/g, " ");
    const entry = Object.entries(PERMANENT_SLUGS).find(
        ([_, name]) => name.toLowerCase().replace(/\s+/g, " ") === normalized
    );
    return entry ? entry[0] : null;
}

// ============================================================================
// MANUAL TINYURL MAPPING (Name -> Short URL)
// ============================================================================

// Manual tinyurls for specific examiners/interviewers (pointing to correct production URLs)
export const MANUAL_TINYURLS: Record<string, string> = {
    "Agus Cahyono": "https://tinyurl.com/alimam-aguscahyono",
    "Jusman": "https://tinyurl.com/alimam-jusmann",
    "Muhammad Syauqi Al Faruq": "https://tinyurl.com/alimam-syauqialfaruq",
    "Maulidin Bachtiar": "https://tinyurl.com/alimam-maulidinbachtiar"
};

/**
 * Get manual tinyurl for a specific user (if exists)
 */
export function getManualTinyUrl(fullName: string): string | null {
    if (!fullName) return null;
    
    // Normalize input: trim, lowercase, and collapse multiple spaces to one
    const normalizedInput = fullName.trim().toLowerCase().replace(/\s+/g, " ");

    // Find match in MANUAL_TINYURLS (also normalized)
    const matchKey = Object.keys(MANUAL_TINYURLS).find(
        key => key.trim().toLowerCase().replace(/\s+/g, " ") === normalizedInput
    );

    return matchKey ? MANUAL_TINYURLS[matchKey] : null;
}

/**
 * Get internal short link (permanent) for a slug
 * Supports optional pendaftar number for deep-linking
 */
export function getPermanentAuthUrl(slug: string, pendaftarNomor?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pesantren-alimam.com";
    let url = `${baseUrl}/api/auth/short/${slug}`;
    if (pendaftarNomor) {
        url += `?p=${encodeURIComponent(pendaftarNomor)}`;
    }
    return url;
}

/**
 * Generate automatic TinyURL for any long URL
 * Ported from Al-Imam reference
 */
export async function generateTinyUrl(longUrl: string): Promise<string> {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (response.ok) {
            const shortUrl = await response.text();
            return shortUrl;
        }
    } catch (error) {
        console.error('Failed to generate TinyURL:', error);
    }
    // Fallback to original URL if TinyURL generation fails
    return longUrl;
}
