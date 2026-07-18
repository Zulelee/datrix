import { NextRequest, NextResponse } from 'next/server';
import { createGmailOAuthUrl } from '@/lib/gmailClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId query parameter is required to start Gmail OAuth',
      }, { status: 400 });
    }

    const state = Buffer.from(JSON.stringify({
      userId,
      startedAt: new Date().toISOString(),
    })).toString('base64url');

    return NextResponse.redirect(createGmailOAuthUrl(state));
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to start Gmail OAuth',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
