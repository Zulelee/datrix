import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import {
  createGmailOAuthClient,
  getGmailPubSubTopicName,
} from "@/lib/gmailClient";
import { getUserDataSources, saveUserDataSource } from "@/lib/saveDataSource";

export const runtime = "nodejs";

type OAuthCookie = {
  state: string;
  userId: string;
};

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const returnedState = request.nextUrl.searchParams.get("state");
    const oauthError = request.nextUrl.searchParams.get("error");

    if (oauthError) {
      return redirectToProfile(request, `gmail=error&reason=${encodeURIComponent(oauthError)}`);
    }

    if (!code || !returnedState) {
      return NextResponse.json(
        { error: "Missing OAuth code or state" },
        { status: 400 }
      );
    }

    const rawCookie = request.cookies.get("gmail_oauth_state")?.value;

    if (!rawCookie) {
      return NextResponse.json(
        { error: "OAuth session expired" },
        { status: 400 }
      );
    }

    let oauthSession: OAuthCookie;

    try {
      oauthSession = JSON.parse(rawCookie) as OAuthCookie;
    } catch {
      return NextResponse.json(
        { error: "Invalid OAuth session" },
        { status: 400 }
      );
    }

    if (oauthSession.state !== returnedState) {
      return NextResponse.json(
        { error: "Invalid OAuth state" },
        { status: 403 }
      );
    }

    const oauthClient = createGmailOAuthClient();
    const { tokens } = await oauthClient.getToken(code);

    oauthClient.setCredentials(tokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauthClient,
    });

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    const gmailAddress = profile.data.emailAddress;

    if (!gmailAddress) {
      throw new Error("Unable to resolve Gmail address");
    }

    const existingConnection = await getExistingGmailConnection(
      oauthSession.userId,
      gmailAddress
    );

    const refreshToken =
      tokens.refresh_token ?? existingConnection?.refreshToken ?? null;

    if (!refreshToken) {
      return redirectToProfile(request, "gmail=error&reason=missing_refresh_token");
    }

    const watchResponse = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: getGmailPubSubTopicName(),
        labelIds: ["INBOX"],
        labelFilterBehavior: "include",
      },
    });

    const { error: saveError } = await saveUserDataSource(
      oauthSession.userId,
      "gmail",
      {
        gmailAddress,
        accessToken: tokens.access_token ?? "",
        refreshToken,
        accessTokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : "",
        scope: tokens.scope ?? "",
        tokenType: tokens.token_type ?? "",
        historyId: watchResponse.data.historyId ?? "",
        watchExpiresAt: watchResponse.data.expiration
          ? new Date(Number(watchResponse.data.expiration)).toISOString()
          : "",
        connectedAt: existingConnection?.connectedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "connected",
      }
    );

    if (saveError) {
      throw saveError;
    }

    const response = redirectToProfile(request, "gmail=connected");
    response.cookies.delete("gmail_oauth_state");

    return response;
  } catch (error) {
    console.error("Gmail OAuth callback failed:", error);

    return redirectToProfile(request, "gmail=error&reason=callback_failed");
  }
}

function redirectToProfile(request: NextRequest, query: string) {
  return NextResponse.redirect(new URL(`/profile?${query}`, request.url));
}

async function getExistingGmailConnection(
  userId: string,
  gmailAddress: string
): Promise<{ refreshToken: string; connectedAt?: string } | null> {
  const { data, error } = await getUserDataSources(userId);

  if (error || !data) {
    if (error) {
      console.error("Failed to load existing Gmail connection:", error);
    }

    return null;
  }

  const existing = data.find(
    (source: any) =>
      source.source_type === "gmail" &&
      source.credentials?.gmailAddress === gmailAddress
  );

  if (!existing?.credentials?.refreshToken) {
    return null;
  }

  return {
    refreshToken: existing.credentials.refreshToken,
    connectedAt: existing.credentials.connectedAt,
  };
}
