import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGmailOAuthCode,
  getGmailProfile,
  getTokenExpiryIso,
} from '@/lib/gmailClient';
import { saveUserDataSource } from '@/lib/saveDataSource';

type GmailOAuthState = {
  userId?: string;
  startedAt?: string;
};

function parseState(state: string | null): GmailOAuthState {
  if (!state) return {};

  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = parseState(searchParams.get('state'));

    if (error) {
      return NextResponse.redirect(`${origin}/profile?gmail=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.json({
        success: false,
        message: 'Missing Gmail OAuth code',
      }, { status: 400 });
    }

    if (!state.userId) {
      return NextResponse.json({
        success: false,
        message: 'Missing userId in Gmail OAuth state',
      }, { status: 400 });
    }

    const tokens = await exchangeGmailOAuthCode(code);
    const profile = await getGmailProfile(tokens.access_token);

    const { error: saveError } = await saveUserDataSource(state.userId, 'gmail', {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiresAt: getTokenExpiryIso(tokens.expires_in),
      scope: tokens.scope || '',
      tokenType: tokens.token_type || '',
      gmailAddress: profile?.emailAddress || '',
      historyId: profile?.historyId || '',
      connectedAt: new Date().toISOString(),
    });

    if (saveError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to save Gmail connection',
        error: saveError.message,
      }, { status: 500 });
    }

    return NextResponse.redirect(`${origin}/profile?gmail=connected`);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to complete Gmail OAuth',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
