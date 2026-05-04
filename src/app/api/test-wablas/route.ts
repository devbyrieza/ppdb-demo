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
            message: `Halo! Ini adalah pesan tes koneksi WABLAS. Jika Anda menerima ini, berarti sistem PPDB sudah terhubung dengan benar.

_Pesanan ini dikirim secara otomatis oleh sistem PPDB._

Terima kasih,
Admin Pusat PPDB.`,
        });

        return NextResponse.json({
            success: true,
            message: 'Test message sent successfully',
            lokasi: "Ponpes PPDB",
        });
    } catch (error) {
        console.error('Error testing Wablas:', error);
        return NextResponse.json(
            { error: 'Failed to send test message', details: error },
            { status: 500 }
        );
    }
}
