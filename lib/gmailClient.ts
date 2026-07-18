import { google } from "googleapis";

export const GMAIL_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export type GmailTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

export type GmailProfile = {
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  historyId?: string;
};

export function createGmailOAuthClient() {
  if (
    !process.env.GOOGLE_GMAIL_CLIENT_ID ||
    !process.env.GOOGLE_GMAIL_CLIENT_SECRET ||
    !process.env.GOOGLE_GMAIL_REDIRECT_URI
  ) {
    throw new Error("Missing Gmail OAuth environment variables");
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_GMAIL_CLIENT_ID,
    process.env.GOOGLE_GMAIL_CLIENT_SECRET,
    process.env.GOOGLE_GMAIL_REDIRECT_URI
  );
}

export function getGmailPubSubTopicName() {
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GMAIL_PUBSUB_TOPIC) {
    throw new Error("Missing Gmail Pub/Sub environment variables");
  }

  return `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/topics/${process.env.GMAIL_PUBSUB_TOPIC}`;
}

export function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_GMAIL_CLIENT_ID,
    clientSecret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_GMAIL_REDIRECT_URI,
  };
}

export function createGmailOAuthUrl(state: string) {
  const oauthClient = createGmailOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: GMAIL_OAUTH_SCOPES,
    state,
  });
}

export async function exchangeGmailOAuthCode(code: string): Promise<GmailTokenResponse> {
  const oauthClient = createGmailOAuthClient();
  const { tokens } = await oauthClient.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Gmail OAuth did not return an access token");
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    expires_in: tokens.expiry_date
      ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
      : undefined,
    id_token: tokens.id_token ?? undefined,
  };
}

export async function getGmailProfile(accessToken: string): Promise<GmailProfile | null> {
  const oauthClient = createGmailOAuthClient();
  oauthClient.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({
    version: "v1",
    auth: oauthClient,
  });

  const profile = await gmail.users.getProfile({
    userId: "me",
  });

  return profile.data;
}

export function getTokenExpiryIso(expiresInSeconds?: number) {
  if (!expiresInSeconds) return "";

  return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
}
