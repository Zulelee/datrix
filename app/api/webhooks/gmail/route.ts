import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PubSubEnvelope = {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
    attributes?: Record<string, string>;
  };
  subscription?: string;
};

type GmailNotification = {
  emailAddress: string;
  historyId: string;
};

export async function POST(request: NextRequest) {
  try {
    /*
     * A simple extra secret is useful even when Pub/Sub OIDC
     * authentication is also enabled.
     */
    const providedSecret = request.nextUrl.searchParams.get("secret");

    if (
      !process.env.GMAIL_WEBHOOK_SECRET ||
      providedSecret !== process.env.GMAIL_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: "Unauthorized webhook" },
        { status: 401 }
      );
    }

    const envelope = (await request.json()) as PubSubEnvelope;

    if (!envelope.message?.data) {
      return NextResponse.json(
        { error: "Missing Pub/Sub message data" },
        { status: 400 }
      );
    }

    const decoded = Buffer.from(
      envelope.message.data,
      "base64"
    ).toString("utf8");

    const notification = JSON.parse(decoded) as GmailNotification;

    if (!notification.emailAddress || !notification.historyId) {
      return NextResponse.json(
        { error: "Invalid Gmail notification" },
        { status: 400 }
      );
    }

    /*
     * Do not run slow AI extraction directly here.
     *
     * Save or enqueue a lightweight job:
     * - Pub/Sub message ID
     * - Gmail address
     * - historyId
     */
    await enqueueGmailSync({
      pubsubMessageId: envelope.message.messageId ?? null,
      emailAddress: notification.emailAddress,
      historyId: notification.historyId,
    });

    /*
     * Pub/Sub treats a successful 2xx response as acknowledgement.
     */
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Gmail Pub/Sub webhook failed:", error);

    /*
     * Returning 500 makes Pub/Sub retry the notification.
     */
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function enqueueGmailSync(input: {
  pubsubMessageId: string | null;
  emailAddress: string;
  historyId: string;
}) {
  /*
   * Replace this with a Supabase insert, Redis queue,
   * QStash, Cloud Tasks, or your own job table.
   */
  console.log("Queue Gmail sync:", input);
}
