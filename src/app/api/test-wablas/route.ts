import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/wablas';

/**
 * Test endpoint untuk Wablas
 * GET /api/test-wablas?phone=6285888871997
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json(
            { error: 'Phone number is required. Use ?phone=6285888871997' },
            { status: 400 }
        );
    }

    try {
        const result = await sendMessage({
            phone,
            message: `🎉 *Test Wablas Integration*\n\nAssalamu'alaikum!\n\nIni adalah pesan test dari sistem PPDB Al-Imam.\n\nJika Anda menerima pesan ini, berarti integrasi Wablas berhasil! ✅\n\nWaktu: ${new Date().toLocaleString('id-ID')}\n\nJazakumullahu khairan,\nTim IT Al-Imam`,
        });

        return NextResponse.json({
            success: true,
            message: 'Test message sent successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error testing Wablas:', error);
        return NextResponse.json(
            { error: 'Failed to send test message', details: error },
            { status: 500 }
        );
    }
}
