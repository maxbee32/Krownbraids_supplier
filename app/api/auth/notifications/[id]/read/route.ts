// app/api/auth/notifications/[id]/read/route.ts
import { NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL ||
  "https://4ef0-82-36-98-104.ngrok-free.app/nservice";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const res = await fetch(
    `${NOTIFICATION_SERVICE_URL}/api/v1/auth/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: auth,
        "ngrok-skip-browser-warning": "true",
      },
    }
  );

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}