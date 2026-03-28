import { NextResponse } from 'next/server';

/**
 * Test endpoint untuk check environment variables
 * GET /api/test-env
 */
export async function GET() {
    return NextResponse.json({
        WABLAS_DOMAIN: process.env.WABLAS_DOMAIN || 'NOT SET',
        WABLAS_TOKEN: process.env.WABLAS_TOKEN ? 'EXISTS (hidden)' : 'NOT SET',
        WABLAS_SECRET_KEY: process.env.WABLAS_SECRET_KEY ? 'EXISTS (hidden)' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
        all_env_keys: Object.keys(process.env).filter(k => k.includes('WABLAS')),
    });
}
