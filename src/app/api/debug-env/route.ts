import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;
    const isDefined = !!dbUrl;
    const length = dbUrl ? dbUrl.length : 0;
    const masked = dbUrl
        ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 5)}`
        : 'undefined';

    return NextResponse.json({
        status: 'ok',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL_DEFINED: isDefined,
            DATABASE_URL_LENGTH: length,
            DATABASE_URL_MASKED: masked,
        },
        timestamp: new Date().toISOString(),
    });
}
