import "dotenv/config";

const WABLAS_DOMAIN = process.env.WABLAS_DOMAIN || '';
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || '';
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || '';

async function testWablas() {
    console.log("🚀 Testing Wablas Connection (Send Message)...");
    console.log(`📡 Domain: ${WABLAS_DOMAIN}`);
    console.log(`🔑 Token: ${WABLAS_TOKEN ? 'EXISTS' : 'MISSING'}`);
    console.log(`🔒 Secret Key: ${WABLAS_SECRET_KEY ? 'EXISTS' : 'MISSING'}`);

    if (!WABLAS_DOMAIN || !WABLAS_TOKEN) {
        console.error("❌ Error: WABLAS_DOMAIN or WABLAS_TOKEN is missing in .env");
        return;
    }

    const domain = WABLAS_DOMAIN.startsWith('http') ? WABLAS_DOMAIN : `https://${WABLAS_DOMAIN}`;
    const url = `${domain}/api/send-message`;
    const authToken = WABLAS_SECRET_KEY ? `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}` : WABLAS_TOKEN;

    try {
        console.log(`--- Testing Send Message to ${url} ---`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                phone: '6281234567890',
                message: 'Test message from PPDB Al Imam Debugger'
            }).toString()
        });

        const rawText = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);

        try {
            const data = JSON.parse(rawText);
            console.log("📦 Response Data:", JSON.stringify(data, null, 2));
            if (data.status) {
                console.log("✅ Wablas API reachable and accepted request!");
            } else {
                console.error("❌ Wablas API Error:", data.message || "Unknown error");
            }
        } catch (e) {
            console.error("❌ Failed to parse JSON response:", rawText);
        }
    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

testWablas();
