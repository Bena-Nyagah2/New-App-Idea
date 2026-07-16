import { NextResponse } from 'next/server';
import { validateEnv } from '@/lib/mpesa';

export async function GET() {
  const missing = validateEnv();
  const envCheck = {
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE || '(not set)',
    MPESA_PASSKEY: process.env.MPESA_PASSKEY ? '(set, len=' + process.env.MPESA_PASSKEY.length + ')' : '(not set)',
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY ? '(set, len=' + process.env.MPESA_CONSUMER_KEY.length + ')' : '(not set)',
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET ? '(set, len=' + process.env.MPESA_CONSUMER_SECRET.length + ')' : '(not set)',
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '(not set)',
    MPESA_ENV: process.env.MPESA_ENV || '(not set, defaults to sandbox)',
  };

  if (missing.length > 0) {
    return NextResponse.json({
      status: 'FAIL',
      error: `Missing env vars: ${missing.join(', ')}`,
      envCheck,
    }, { status: 500 });
  }

  try {
    const { getAccessToken } = await import('@/lib/mpesa');
    const token = await getAccessToken();
    return NextResponse.json({
      status: 'OK',
      message: 'Daraja OAuth succeeded',
      tokenPrefix: token.substring(0, 10) + '...',
      envCheck,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: 'FAIL',
      error: message,
      envCheck,
    }, { status: 500 });
  }
}
