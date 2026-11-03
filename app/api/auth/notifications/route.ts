// app/api/auth/notifications/route.ts
import { NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL ||
  "https://9277-82-36-98-104.ngrok-free.app/nservice";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const unread = url.searchParams.get("unread");
  const query = unread ? `?unread=${unread}` : "";

  const res = await fetch(
    `${NOTIFICATION_SERVICE_URL}/api/v1/auth/notifications${query}`,
    {
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}