import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createGmailOAuthUrl } from "@/lib/gmailClient";
import { supabase } from "@/lib/supabaseRoleClient";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const state = crypto.randomBytes(32).toString("hex");
    const authUrl = createGmailOAuthUrl(state);
    const shouldReturnJson =
      request.headers.get("x-gmail-oauth-response") === "json";
    const response = shouldReturnJson
      ? NextResponse.json({ url: authUrl })
      : NextResponse.redirect(authUrl);

    response.cookies.set(
      "gmail_oauth_state",
      JSON.stringify({
        state,
        userId,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Gmail OAuth connect failed:", error);

    return NextResponse.json(
      { error: "Failed to start Gmail OAuth" },
      { status: 500 }
    );
  }
}

async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  const userId = request.nextUrl.searchParams.get("userId");

  if (userId) {
    return userId;
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    console.error("Failed to resolve Supabase user for Gmail OAuth:", error);
    return null;
  }

  return data.user?.id ?? null;
}
