import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        buildTime: process.env.BUILD_TIME || 'not-set',
        nodeEnv: process.env.NODE_ENV,
        nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        // Marker untuk verify deployment baru
        deploymentId: 'FEB_12_2026_v2',
        message: 'If you see this, deployment is working!'
    });
}

export const dynamic = 'force-dynamic';