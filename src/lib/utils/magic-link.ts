import { createHmac } from "crypto";

const MAGIC_LINK_SECRET =
    process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

// Token Structure: base64(payload).signature
// payload: { id: string, role: string, full_name: string, exp: number }

export function generateMagicToken(
    profileId: string,
    role: string,
    fullName: string,
    expiresInHours = 24
): string {
    const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
    const payload = { id: profileId, role, full_name: fullName, exp };

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
    data?: { id: string; role: string; full_name: string };
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
            },
        };
    } catch (error) {
        return { valid: false, reason: "Terjadi kesalahan saat verifikasi" };
    }
}
